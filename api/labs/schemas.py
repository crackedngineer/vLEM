from typing import Optional
from pydantic import BaseModel


class LabResponse(BaseModel):
    project_id: str
    name: str
    description: Optional[str] = None


class CreateLabRequest(BaseModel):
    name: str
    description: Optional[str] = None
    docker_compose_content: str


class CreateLabResponse(BaseModel):
    message: str
    uid: str
