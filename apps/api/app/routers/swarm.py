from fastapi import APIRouter

from app.models.schemas import RunActionRequest, RunState, TaskRequest
from app.services.swarm import apply_run_action, list_runs, load_run, run_swarm

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


@router.post("/runs/{run_id}/actions", response_model=RunState)
def post_run_action(run_id: str, action: RunActionRequest) -> RunState:
    return apply_run_action(run_id, action)
