from typing import Optional
from pydantic import BaseModel


class LabProvisionObject(BaseModel):
    uid: str
    status: Optional[str] = None

    class Config:
        from_attributes = True


class LabResponse(BaseModel):
    uid: str
    name: str
    description: str
    status: str


class CreateLabResponse(BaseModel):
    message: str
    uid: str
    status: str = "accepted"


class TemplateResponse(BaseModel):
    name: str
    title: str
    description: str
    logo: Optional[str] = None
    category: str
