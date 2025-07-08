import os

# SQLite database URL
SQLALCHEMY_DATABASE_URL = os.getenv(
    "SQLALCHEMY_DATABASE_URL", "sqlite:///./vlem_labs.db"
)

# Directory where Docker Compose labs are stored
LABS_ROOT_DIR = os.getenv(
    "VLEM_COMPOSE_DIR", "/var/lib/docker-compose-lab-manager/labs"
)
