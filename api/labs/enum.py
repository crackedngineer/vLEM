from enum import Enum

class TASK_STATUS(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

class LAB_BUILD_STATUS(str, Enum):
    PROCESSING = "processing"
    QUEUED = "queued"
    BUILDING = "building"
    COMPLETED = "completed"
    FAILED = "failed"

class LAB_TASK_TYPE(str, Enum):
    PROVISION = "provision"
    CONTROL = "control"