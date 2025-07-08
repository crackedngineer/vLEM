import os
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from api.db import get_db
from .schemas import CreateLabResponse, CreateLabRequest
from .models import Lab


router = APIRouter(prefix="/lab")

# Dictionary to keep track of uploaded compose projects
compose_projects = {}


@router.post("/", response_model=CreateLabResponse)
async def create_lab(lab_data: CreateLabRequest, db: Session = Depends(get_db)):
    """
    Creates a new lab. The docker-compose.yml content is provided directly in the request body.
    A unique project ID is returned, which should be used for subsequent operations.
    The lab's details and docker-compose content are saved to the database.
    """
    uid = os.urandom(16).hex()

    try:
        # Save lab info to database using SQLAlchemy
        new_lab = Lab(
            uid=uid,
            name=lab_data.name,
            description=lab_data.description,
            docker_compose_content=lab_data.docker_compose_content,
        )
        db.add(new_lab)
        db.commit()
        db.refresh(new_lab)

        return CreateLabResponse(message="Lab created successfully.", uid=uid)
    except Exception as e:
        db.rollback()  # Rollback DB transaction on error
        raise HTTPException(status_code=500, detail=f"Failed to create lab: {e}")
