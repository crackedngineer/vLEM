import os
from pathlib import Path

# SQLite database URL
SQLALCHEMY_DATABASE_URL = os.getenv(
    "SQLALCHEMY_DATABASE_URL", "postgresql://admin:password@localhost:5432/vlem"
)

# Directory for storing lab files
LABS_DATA_DIR = Path(os.getenv("VLEM_TEMPLATES_DIR", "/var/lib/vlem/templates"))

# Ensure LABS_DATA_DIR exists on startup
if not LABS_DATA_DIR.exists():
    os.makedirs(LABS_DATA_DIR)

CELERY_BROKER_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("REDIS_URL", "redis://localhost:6379/0")
CELERY_INCLUDE_MODULES = ["labs.tasks"]
