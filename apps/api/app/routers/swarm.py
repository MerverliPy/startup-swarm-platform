from fastapi import APIRouter
from app.models.schemas import TaskRequest, RunState
from app.services.swarm import run_swarm, list_runs, load_run

router = APIRouter(prefix="/swarm", tags=["swarm"])


@router.post("/runs", response_model=RunState)
def create_run(task: TaskRequest) -> RunState:
    return run_swarm(task)


@router.get("/runs", response_model=list[RunState])
def get_runs() -> list[RunState]:
    return list_runs()


@router.get("/runs/{run_id}", response_model=RunState)
def get_run(run_id: str) -> RunState:
    return load_run(run_id)
