from sqlalchemy import Column, String, Text, Boolean, ForeignKey
from db import Base
from labs.enum import LAB_BUILD_STATUS
from base.models import TimestampMixin


class Lab(TimestampMixin, Base):
    """
    SQLAlchemy ORM model representing a Docker Compose lab.
    Maps to the 'labs' table in the database.
    """

    __tablename__ = "labs"

    id = Column(
        String, primary_key=True, index=True, doc="Unique identifier for the lab"
    )
    name = Column(String, nullable=False, doc="Name of the lab")
    description = Column(String, nullable=True, doc="Optional description of the lab")
    status = Column(
        String,
        nullable=False,
        doc="Current status of the lab",
    )

    def __repr__(self):
        return f"<Lab(uid='{self.uid}', name='{self.name}')>"

    def to_dict(self):
        """Serialize the lab object to a dictionary."""
        return {
            "uid": self.uid,
            "name": self.name,
            "description": self.description,
            "status": self.status,
        }


class Build(TimestampMixin, Base):
    """
    SQLAlchemy ORM model for storing build logs associated with a lab.
    Maps to the 'build_logs' table in the database.
    """

    __tablename__ = "builds"

    id = Column(
        String, primary_key=True, index=True, doc="Unique identifier for the log"
    )
    lab_uid = Column(String, ForeignKey("labs.uid"), doc="UID of the associated lab")
    status = Column(
        String,
        nullable=False,
        doc="Current status of the build",
    )

    def __repr__(self):
        return f"<BuildLogs(id='{self.id}', lab_uid='{self.lab_uid}')>"
    
class BuildStage(TimestampMixin, Base):
    __tablename__ = "build_stages"
    name = Column(String, nullable=False, doc="Name of the Build Stage")
    build_id = Column(String, ForeignKey("build_stages.uid"), doc="UID of the associated lab")
    status = Column(
        String,
        nullable=False,
        doc="Current status of the build stage",
    )

class Log(TimestampMixin, Base):
    __tablename__ = "logs"
    build_stage_id = Column(String, ForeignKey("build_stages.uid"), doc="UID of the associated lab")
    content =  Column(Text, nullable=False, doc="Content of the build log")
