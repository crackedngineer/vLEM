from celery import Celery
from config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND, CELERY_INCLUDE_MODULES

celery_app = Celery(
    "lab_manager",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=CELERY_INCLUDE_MODULES,
)

# Configure Celery queues
celery_app.conf.task_queues = {
    "controller_queue": {"exchange": "controller_queue", "exchange_type": "direct"},
}
celery_app.conf.task_default_queue = "controller_queue"
