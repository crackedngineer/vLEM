from sqlalchemy import Column, String, Text
from db import Base


class Lab(Base):
    """
    SQLAlchemy ORM model representing a Docker Compose lab.
    Maps to the 'labs' table in the database.
    """

    __tablename__ = "labs"

    uid = Column(String, primary_key=True, index=True, doc="Unique identifier for the lab")
    name = Column(String, nullable=False, doc="Name of the lab")
    description = Column(String, nullable=True, doc="Optional description of the lab")
    docker_compose_content = Column(Text, nullable=False, doc="YAML content of the Docker Compose file")

    def __repr__(self):
        return f"<Lab(uid='{self.uid}', name='{self.name}')>"

    def to_dict(self):
        """Serialize the lab object to a dictionary."""
        return {
            "uid": self.uid,
            "name": self.name,
            "description": self.description,
            "docker_compose_content": self.docker_compose_content
        }