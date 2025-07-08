from fastapi import FastAPI
from api.labs.routes import router as v1_routers

# Initialize FastAPI app
app = FastAPI(
    title="vLEM API",
    description="Vulnerability Lab Environment Management API",
)

app.include_router(v1_routers, prefix="/api/v1")


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
