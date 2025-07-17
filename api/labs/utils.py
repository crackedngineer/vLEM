import os
import json
import yaml
import shutil
import subprocess
import socket
import tempfile
import httpx
from pathlib import Path
from contextlib import contextmanager
from functools import lru_cache
from typing import Optional, List, Union
from fastapi import HTTPException, status

from helpers import read_json
from config import LABS_DATA_DIR
from .constants import (
    GITHUB_API_BASE,
    GITHUB_RAW_BASE,
    GITHUB_BRANCH,
    GITHUB_REPO_OWNER,
    GITHUB_REPO_NAME,
    GITHUB_TEMPLATES_BASE_PATH,
    GITHUB_TEMPLATES_INDEX_FILE,
)

github_client = httpx.AsyncClient()


def is_port_in_use(port: int) -> bool:
    """Checks if a given port is currently in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return False
        except socket.error:
            return True


def find_available_port(start_port: int, max_attempts: int = 100) -> Optional[int]:
    """Finds the next available port starting from `start_port`."""
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(port):
            return port
    return None


def parse_compose_ports(docker_compose_content: str) -> List[int]:
    """
    Parses docker-compose content to extract host ports.

    Args:
        docker_compose_content: YAML content of docker-compose file

    Returns:
        Sorted list of unique host ports

    Raises:
        ValueError: If YAML is invalid or parsing fails
    """
    try:
        compose_config = yaml.safe_load(docker_compose_content)
        if not isinstance(compose_config, dict):
            raise ValueError(
                "Invalid YAML structure: Expected a dictionary at the root."
            )

        services = compose_config.get("services", {})
        if not isinstance(services, dict):
            return []

        host_ports = set()

        for service_name, service_config in services.items():
            if not isinstance(service_config, dict):
                continue

            ports = service_config.get("ports", [])
            if not isinstance(ports, list):
                continue

            for port_mapping in ports:
                port = _extract_host_port(port_mapping, service_name)
                if port is not None:
                    host_ports.add(port)

        return sorted(host_ports)

    except yaml.YAMLError as e:
        raise ValueError(f"Invalid YAML content: {e}")
    except Exception as e:
        raise ValueError(f"An unexpected error occurred while parsing ports: {e}")


def _extract_host_port(
    port_mapping: Union[str, dict], service_name: str
) -> Optional[int]:
    """Extract host port from a port mapping configuration."""
    try:
        if isinstance(port_mapping, dict):
            published_port = port_mapping.get("published")
            if published_port:
                return int(published_port)

        elif isinstance(port_mapping, str):
            parts = port_mapping.split(":")
            if len(parts) == 2:
                return int(parts[0])
            elif len(parts) == 3:
                return int(parts[1])

        return None

    except (ValueError, TypeError) as e:
        print(
            f"Warning: Could not parse port '{port_mapping}' for service '{service_name}': {e}"
        )
        return None


@lru_cache(maxsize=1)
def _get_docker_compose_command() -> List[str]:
    """
    Determine the correct docker-compose command to use.
    Uses caching to avoid repeated checks.
    """
    commands_to_try = [
        (["docker-compose", "--version"], ["docker-compose"]),
        (["docker", "compose", "version"], ["docker", "compose"]),
    ]

    for check_cmd, actual_cmd in commands_to_try:
        try:
            subprocess.run(check_cmd, check=True, capture_output=True, timeout=10)
            return actual_cmd
        except (
            subprocess.CalledProcessError,
            FileNotFoundError,
            subprocess.TimeoutExpired,
        ):
            continue

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Docker Compose command not found. Please ensure Docker is installed and in your PATH.",
    )


@contextmanager
def _temporary_compose_file(docker_compose_content: str):
    """Context manager for creating temporary docker-compose.yml file."""
    temp_dir = None
    try:
        temp_dir = tempfile.mkdtemp(prefix="docker_compose_exec_")
        compose_file_path = Path(temp_dir) / "docker-compose.yml"

        compose_file_path.write_text(docker_compose_content, encoding="utf-8")
        yield temp_dir

    except IOError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Filesystem error during Docker Compose operation: {e}",
        )
    finally:
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)


def run_docker_compose_command(
    docker_compose_content: str,
    command: List[str],
    capture_output: bool = True,
    stream_output: bool = False,
    timeout: int = 300,
) -> Optional[Union[subprocess.CompletedProcess, subprocess.Popen]]:
    """
    Runs a docker-compose command in a temporary directory.

    Args:
        docker_compose_content: YAML content for docker-compose.yml
        command: Docker compose command arguments
        capture_output: Whether to capture command output
        stream_output: Whether to stream output (returns Popen object)
        timeout: Command timeout in seconds

    Returns:
        CompletedProcess for regular execution, Popen for streaming

    Raises:
        HTTPException: For various Docker Compose execution errors
    """
    try:
        docker_compose_cmd = _get_docker_compose_command()
        full_command = docker_compose_cmd + command

        with _temporary_compose_file(docker_compose_content) as temp_dir:
            if stream_output:
                return subprocess.Popen(
                    full_command,
                    cwd=temp_dir,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1,
                )
            else:
                return subprocess.run(
                    full_command,
                    cwd=temp_dir,
                    capture_output=capture_output,
                    text=True,
                    check=True,
                    timeout=timeout,
                )

    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Docker Compose command failed with exit code {e.returncode}: {e.stderr}",
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Docker Compose command timed out after {timeout} seconds.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during Docker Compose operation: {e}",
        )


async def fetch_github_file_content(file_url: str) -> str:
    """
    Fetches the raw content of a file from a GitHub raw content URL, for use directly by API endpoints.
    Uses the shared github_client instance.
    """
    headers = {}
    # if GITHUB_TOKEN:
    #     headers["Authorization"] = f"token {GITHUB_TOKEN}"

    try:
        response = await github_client.get(
            file_url, headers=headers, follow_redirects=True
        )
        response.raise_for_status()
        return response.text
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch file from GitHub: {file_url}. Status: {e.response.status_code}. Error: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network error while fetching file from GitHub: {file_url}. Error: {e}",
        )


async def fetch_template_metadata_list() -> list:
    """
    Fetches the list of templates from the GitHub repository's metadata file.
    Returns a list of TemplateResponse objects.
    """
    if not GITHUB_REPO_OWNER or not GITHUB_REPO_NAME:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub repository owner, name, or base templates path not configured.",
        )

    try:
        templates_index_url = (
            f"{GITHUB_RAW_BASE}/{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}/{GITHUB_BRANCH}/"
            f"{GITHUB_TEMPLATES_INDEX_FILE}"
        )

        index_content = await fetch_github_file_content(templates_index_url)
        templates_data = json.loads(index_content)

        if not isinstance(templates_data, list):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected format for templates index file. Expected a list of templates.",
            )

        return templates_data
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid JSON format in templates index file: {templates_index_url}",
        )


async def fetch_template_details(template_name: str) -> dict:
    """
    Fetches the details of a specific template by its name from the GitHub repository's metadata file.
    Returns a dictionary with template details.
    """
    templates = await fetch_template_metadata_list()

    for template in templates:
        if template.get("name") == template_name:
            return template

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Template '{template_name}' not found in GitHub repository '{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}'.",
    )


async def download_github_template_files(template_name: str, local_target_dir: str):
    """
    Downloads all files from a specific template directory in the GitHub repository
    to a local target directory.
    """
    if not GITHUB_REPO_OWNER or not GITHUB_REPO_NAME or not GITHUB_TEMPLATES_BASE_PATH:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub repository owner, name, or base templates path not configured.",
        )

    # GitHub API endpoint to list contents of a specific template directory
    contents_api_url = (
        f"{GITHUB_API_BASE}/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}/contents/"
        f"{GITHUB_TEMPLATES_BASE_PATH}/{template_name}"
    )

    headers = {}
    # if GITHUB_TOKEN:
    #     headers["Authorization"] = f"token {GITHUB_TOKEN}"

    try:
        response = await github_client.get(contents_api_url, headers=headers)
        response.raise_for_status()
        contents = response.json()

        if not isinstance(contents, list):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected response from GitHub API for template contents: {contents_api_url}",
            )

        os.makedirs(local_target_dir, exist_ok=True)

        for item in contents:
            if item["type"] == "file":
                file_name = item["name"]
                download_url = item["download_url"]  # This is the raw content URL
                local_file_path = os.path.join(local_target_dir, file_name)

                print(
                    f"Downloading {file_name} to {local_file_path} from {download_url}"
                )
                file_content = await fetch_github_file_content(download_url)
                with open(local_file_path, "w", encoding="utf-8") as f:
                    f.write(file_content)
            elif item["type"] == "dir":
                # Recursively download subdirectories if needed.
                # For simplicity, this current implementation assumes flat template directories.
                # If your templates have nested folders, you'd need to extend this.
                print(
                    f"Skipping subdirectory: {item['path']} within template {template_name}"
                )
                pass

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GitHub template directory '{template_name}' not found at {contents_api_url}. Error: {e.response.text}",
            )
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to list or download template files from GitHub: {contents_api_url}. Error: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network error while downloading template files from GitHub: {e}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during template download: {e}",
        )
