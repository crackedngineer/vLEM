import os
import httpx
from typing import List, Optional
from fastapi import Query
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from db import get_db
from labs.schemas import (
    CreateLabResponse,
    TemplateResponse,
    LabResponse,
)
from labs.models import Lab
from labs.tasks import lab_task_manager
from labs.constants import (
    GITHUB_REPO_OWNER,
    GITHUB_REPO_NAME,
    GITHUB_TEMPLATES_INDEX_FILE,
)
from labs.enum import LAB_BUILD_STATUS, LAB_TASK_TYPE
from labs.utils import (
    fetch_template_metadata_list,
    fetch_template_details,
)

router = APIRouter(prefix="/lab")


@router.get("/templates", response_model=List[TemplateResponse])
async def list_templates():
    """
    Lists all available pre-made lab templates by fetching a central metadata file from GitHub.
    """

    templates = []
    try:
        # Use the API-specific fetcher
        template_list = await fetch_template_metadata_list()

        for template_info in template_list:
            if not isinstance(template_info, dict) or "name" not in template_info:
                print(
                    f"Warning: Skipping malformed template entry in index: {template_info}"
                )
                continue

            templates.append(
                TemplateResponse(
                    name=template_info["name"],
                    title=template_info.get("title", template_info["name"]),
                    description=template_info.get("description")
                    or f"Template for {template_info['name']}",
                    logo=template_info.get("logo", "default_icon.png"),
                    category=template_info.get("category", ""),
                )
            )

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"GitHub templates index file '{GITHUB_TEMPLATES_INDEX_FILE}' not found in repository. Error: {e.response.text}",
            )
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Failed to fetch templates index from GitHub: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Network error while listing templates from GitHub: {e}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while listing templates: {e}",
        )

    if not templates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No lab templates found in GitHub repository '{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}' via index file '{GITHUB_TEMPLATES_INDEX_FILE}'.",
        )

    return templates


@router.post("/templates/{template_name}/", response_model=CreateLabResponse)
async def create_lab_from_template(template_name: str, db: Session = Depends(get_db)):
    """
    Creates a new lab environment from a specified pre-made template by downloading it from GitHub.
    """

    lab_name = template_name
    lab_description = f"Provisioning {template_name}..."

    try:
        # check if the template exists in the metadata
        print(f"Fetching metadata for template '{template_name}'")

        template_details = await fetch_template_details(template_name)

        uid = f"{template_details['name']}-{os.urandom(6).hex()}"
        new_lab = Lab(
            **{
                "uid": uid,
                "name": lab_name,
                "description": lab_description,
                "status": LAB_BUILD_STATUS.QUEUED.value,
            }
        )
        db.add(new_lab)
        db.commit()
        db.refresh(new_lab)

        lab_task_manager.delay(uid, type=LAB_TASK_TYPE.PROVISION)

        return CreateLabResponse(
            message=f"Lab creation from template '{template_name}' accepted. Building and starting in background.",
            uid=uid,
            status="accepted",
        )
    except OperationalError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error during lab creation from template: {e}",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while creating lab from template '{template_name}': {e}",
        )


@router.get("/", response_model=List[LabResponse])
async def list_labs(
    name: Optional[str] = Query(None),
    lab_status: Optional[str] = Query(None, alias="status"),
    sort_by: str = Query("created_at", pattern="^(created_at|updated_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    limit: int = Query(10, ge=1),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    try:
        query = db.query(Lab)

        # Filters
        if name:
            query = query.filter(Lab.name.ilike(f"%{name}%"))
        if lab_status:
            query = query.filter(Lab.status == lab_status)

        # Sorting
        sort_column = getattr(Lab, sort_by)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Pagination
        labs = query.offset(offset).limit(limit).all()

        return [
            LabResponse(
                uid=str(lab.uid),
                name=str(lab.name),
                description=str(lab.description),
                status=str(lab.status),
            )
            for lab in labs
        ]

    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error when listing labs: {e}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred when listing labs: {e}",
        )
