import os
import shutil
import json
import socket
from typing import Optional, Dict, Any

from config import LABS_ROOT_DIR


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


def get_lab_path(uid: str) -> str:
    """Returns the filesystem path for a given lab's data directory."""
    return os.path.join(LABS_ROOT_DIR, uid)


def get_lab_metadata_path(project_id: str) -> str:
    """Returns the path to the metadata file for a given lab."""
    return os.path.join(get_lab_path(project_id), "lab_metadata.json")


def save_lab_metadata(project_id: str, metadata: Dict[str, Any]):
    """Saves lab metadata to its JSON file."""
    lab_dir = get_lab_path(project_id)
    os.makedirs(lab_dir, exist_ok=True)  # Ensure lab directory exists
    metadata_path = get_lab_metadata_path(project_id)
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)


def delete_lab_data(project_id: str):
    """Deletes a lab's directory from the filesystem."""
    lab_dir = get_lab_path(project_id)
    if os.path.exists(lab_dir):
        shutil.rmtree(lab_dir)
        print(f"Deleted lab directory: {lab_dir}")
