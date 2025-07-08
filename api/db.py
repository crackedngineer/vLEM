import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from api.config import SQLALCHEMY_DATABASE_URL

# Create the SQLAlchemy engine
# connect_args={"check_same_thread": False} is needed for SQLite when using multiple threads,
# which FastAPI does. For other databases, this is not required.
connect_args = (
    {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

# Create a SessionLocal class
# Each instance of SessionLocal will be a database session.
# The `autocommit=False` and `autoflush=False` ensure that changes are not immediately
# committed to the database and that queries don't flush pending changes automatically.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our SQLAlchemy models
Base = declarative_base()


def get_db():
    """
    Dependency to get a database session.
    This will be used in FastAPI path operations.
    It ensures the session is closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
