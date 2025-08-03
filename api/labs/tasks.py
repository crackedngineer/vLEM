import os
import yaml
import asyncio
from fastapi import HTTPException, status
from workers import celery_app
from sqlalchemy.exc import OperationalError
from db import SessionLocal
from labs.models import Lab
from labs.utils import run_docker_compose_command, download_github_template_files
from labs.enum import LAB_TASK_TYPE, LAB_BUILD_STATUS
from labs.schemas import LabProvisionObject
from config import LABS_DATA_DIR


@celery_app.task(bind=True, name="task_manager", queue="controller_queue")
def lab_task_manager(self, uid: str, type: str = LAB_TASK_TYPE.PROVISION):
    """
    Task manager for handling lab provisioning and control tasks.
    This module defines Celery tasks for creating, starting, stopping, and removing labs.
    """
    if type == LAB_TASK_TYPE.PROVISION:
        print(f"Starting provisioning task for lab {uid}...")
        return provision_lab_task(uid)
    # elif type == LAB_TASK_TYPE.CONTROL:
    #     print(f"Starting control task for lab {uid}...")
    #     return control_lab_task(uid, command_type="start")
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown task type: {type}",
        )


def provision_lab_task(uid: str):
    """
    Celery task for the full lab provisioning process from a GitHub template.
    Steps:
    1. Create local lab directory.
    2. Download template files from GitHub.
    3. Load and validate docker-compose.yml.
    4. Build Docker Compose services.
    5. Perform port checks.
    6. Start Docker Compose services.
    """
    db = SessionLocal()
    lab = None
    lab_dir = os.path.join(LABS_DATA_DIR, uid)
    try:
        lab = db.query(Lab).filter(Lab.uid == uid).first()
        if not lab:
            print(f"Provisioning task: Lab {uid} not found in DB. Cannot provision.")
            return

        setattr(lab, "status", LAB_BUILD_STATUS.PROCESSING.value)
        db.commit()
        print(f"Lab {uid} status updated to 'building'.")

        # Step 1: Create a unique local directory for the lab's files
        os.makedirs(lab_dir, exist_ok=True)
        print(f"Task: Created local lab directory: {lab_dir}")

        # Step 2: Download all files for the specified template from GitHub
        template_name = lab.uid.split("-")[0]
        print(
            f"Task: Downloading template '{template_name}' files from GitHub to {lab_dir}..."
        )
        asyncio.run(download_github_template_files(template_name, lab_dir))
        print(f"Task: Finished downloading template '{template_name}' files.")

        # Step 3: Load and validate the downloaded 'docker-compose.yml' file
        compose_file_path = os.path.join(lab_dir, "compose.yml")
        if not os.path.exists(compose_file_path):
            raise Exception(
                f"Downloaded template '{template_name}' does not contain a compose.yml file."
            )

        with open(compose_file_path, "r", encoding="utf-8") as f:
            docker_compose_content = f.read()

        # Validate compose content by attempting to load it
        yaml.safe_load(docker_compose_content)
        print(f"Task: Validated compose.yml for lab {uid}.")

        # Update status to building as we proceed
        setattr(lab, "status", LAB_BUILD_STATUS.BUILDING.value)
        db.commit()
        print(f"Task: Lab {uid} status updated to 'building'.")

        # # Step 1: Build Docker Compose services
        # print(f"Provisioning task: Building services for lab {uid}...")
        # build_result = run_docker_compose_command(
        #     str(docker_compose_content), ["build"], capture_output=True
        # )
        # lab_build_logs = LabProvisionObject(
        #     uid=str(lab.uid),
        #     status=LAB_BUILD_STATUS.COMPLETED.value,
        #     build_logs=(
        #         getattr(build_result, "stdout", "") if build_result is not None else ""
        #     ),
        # )
        # db.add(lab_build_logs)
        # db.commit()
        # print(
        #     f"Build for lab {uid} completed. Output:\n{getattr(build_result, 'stdout', '') if build_result is not None else ''}"
        # )

        # lab_starting_status = LabProvisionObject(
        #     uid=str(lab.uid),
        #     status=LAB_STATUS.STARTING.value,
        # )
        # db.add(lab_starting_status)
        # db.commit()
        # print(f"Lab {uid} status updated to 'starting'.")

        # # Step 2: Perform port check before starting
        # host_ports = parse_compose_ports(
        #     str(docker_compose_content) if docker_compose_content is not None else ""
        # )
        # has_conflict = False
        # for port in host_ports:
        #     if is_port_in_use(port):
        #         has_conflict = True
        #         print(
        #             f"Provisioning task: Port {port} in use for lab {uid}. Cannot start."
        #         )
        #         break

        # if has_conflict:
        #     lab_failed_status = LabProvisionObject(
        #         uid=str(lab.uid),
        #         status=LAB_STATUS.FAILED.value,
        #         run_logs="Failed to start due to port conflict.",
        #     )
        #     db.add(lab_failed_status)
        #     db.commit()
        #     print(
        #         f"Provisioning task: Port conflict detected for lab {uid}. Lab status 'failed_port_conflict'."
        #     )
        #     return

        # # Step 3: Start Docker Compose services
        # print(f"Provisioning task: Starting lab {uid}...")
        # start_result = run_docker_compose_command(
        #     str(docker_compose_content), ["up", "-d"], capture_output=True
        # )
        # lab_running_status = LabProvisionObject(
        #     uid=str(lab.uid),
        #     status=LAB_STATUS.RUNNING.value,
        #     run_logs=getattr(start_result, "stdout", "") if start_result is not None else "",
        # )
        # db.add(lab_running_status)
        # db.commit()
        # print(
        #     f"Lab {uid} started. Status 'running'. Output:\n{getattr(start_result, 'stdout', '') if start_result is not None else ''}"
        # )

    except OperationalError as e:
        db.rollback()
        print(f"Provisioning task: Database error for {uid}: {e}")
        if lab:
            setattr(lab, "status", LAB_BUILD_STATUS.FAILED.value)
            db.commit()
    except HTTPException as e:
        print(f"Provisioning task: Docker command failed for {uid}: {e.detail}")
        if lab:
            setattr(lab, "status", LAB_BUILD_STATUS.FAILED.value)
            db.commit()
    except Exception as e:
        db.rollback()
        print(
            f"Provisioning task: An unexpected error occurred during provisioning for {uid}: {e}"
        )
        if lab:

            setattr(lab, "status", LAB_BUILD_STATUS.FAILED.value)
            db.commit()
    finally:
        db.close()


# def control_lab_task(uid: str, command_type: str):
#     """Celery task for starting, stopping, and removing existing labs."""
#     db = SessionLocal()
#     lab = None
#     try:
#         lab = db.query(Lab).filter(Lab.uid == uid).first()
#         if not lab:
#             print(f"Control task: Lab {uid} not found in DB. Cannot execute command.")
#             return

#         docker_compose_content = lab.docker_compose_content
#         docker_command = []

#         if command_type == "start":
#             host_ports = parse_compose_ports(str(docker_compose_content))
#             has_conflict = False
#             for port in host_ports:
#                 if is_port_in_use(port):
#                     has_conflict = True
#                     print(
#                         f"Control task: Port {port} in use for lab {uid}. Cannot start."
#                     )
#                     break

#             if has_conflict:
#                 lab.status = "failed_port_conflict"
#                 lab.run_logs = "Failed to start due to port conflict."
#                 db.add(lab)
#                 db.commit()
#                 print(
#                     f"Control task: Port conflict detected for lab {uid}. Not starting containers. Status 'failed_port_conflict'."
#                 )
#                 return

#             docker_command = ["up", "-d"]
#             lab.status = "starting"
#             db.add(lab)
#             db.commit()
#             print(f"Control task: Starting lab {uid}...")
#             result = run_docker_compose_command(
#                 str(docker_compose_content), docker_command, capture_output=True
#             )
#             lab.status = "running"
#             lab.run_logs = getattr(result, "stdout", "") if result is not None else ""
#             db.add(lab)
#             db.commit()
#             print(
#                 f"Control task: Lab {uid} started. Status 'running'. Output:\n{getattr(result, 'stdout', '') if result is not None else ''}"
#             )

#         elif command_type == "stop":
#             docker_command = ["down"]
#             lab.status = "stopping"
#             db.add(lab)
#             db.commit()
#             print(f"Control task: Stopping lab {uid}...")
#             result = run_docker_compose_command(
#                 str(docker_compose_content), docker_command, capture_output=True
#             )

#             db.delete(lab)  # Lab is removed from DB on successful stop
#             db.commit()
#             print(
#                 f"Control task: Lab {uid} stopped and deleted from database. Status 'stopped'. Output:\n{str(result.stdout) if result is not None else ''}"
#             )

#         else:
#             print(f"Control task: Unknown command type received: {command_type}")
#             if lab:
#                 lab.status = f"failed_unknown_command: {command_type}"
#                 lab.run_logs = f"Unknown command: {command_type}"
#                 db.add(lab)
#                 db.commit()

#     except OperationalError as e:
#         db.rollback()
#         print(f"Control task: Database error for {uid}: {e}")
#         if lab:
#             lab.status = "failed_db_error"
#             lab.run_logs = f"Database error: {e}"
#             db.add(lab)
#             db.commit()
#     except HTTPException as e:
#         print(f"Control task: Docker command failed for {uid}: {e.detail}")
#         if lab:
#             lab.status = f"failed_docker_error: {e.detail[:100]}"
#             lab.run_logs = e.detail
#             db.add(lab)
#             db.commit()
#     except Exception as e:
#         db.rollback()
#         print(
#             f"Control task: An unexpected error occurred during command execution for {uid}: {e}"
#         )
#         if lab:
#             lab.status = f"failed_unknown_error: {str(e)[:100]}"
#             lab.run_logs = str(e)
#             db.add(lab)
#             db.commit()
#     finally:
#         db.close()
