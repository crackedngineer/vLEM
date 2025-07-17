from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from labs.routes import router as v1_routers
from workers import celery_app

# Initialize FastAPI app
app = FastAPI(
    title="vLEM API",
    description="Vulnerability Lab Environment Management API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_routers, prefix="/api")


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Welcome to the vLEM."}


@app.get("/healthz", summary="Health check endpoint", tags=["Health"])
async def healthz():
    """
    Health check endpoint to indicate if the application is running.
    Returns a 200 OK status with a simple message.
    """
    return {"status": "healthy"}


@app.get("/readz", summary="Readiness check endpoint", tags=["Health"])
async def readz():
    """
    Readiness check endpoint to indicate if the application is ready to serve requests.
    Returns a 200 OK status with a simple message.
    """
    return {"status": "ready"}


@app.on_event("startup")
async def startup_event():
    """Connect to Redis on application startup (for FastAPI only)."""
    # Celery workers handle their own Redis connection
    # This is primarily for the FastAPI app to publish messages
    print("FastAPI application startup: Initializing Celery connection.")
    try:
        # Ping broker to check connection
        # Note: This ping attempts to connect to *any* worker. If no workers are up, it might fail.
        # It's a basic check, a more robust system might use Celery's inspect.ping() on known workers.
        celery_app.control.ping(timeout=1, destination=["celery@%h"])
        print("Successfully connected to Celery broker (Redis).")
    except Exception as e:
        print(f"Failed to connect to Celery broker (Redis) on startup: {e}")
