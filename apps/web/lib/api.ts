export type SwarmRun = {
  run_id: string;
  status: "queued" | "running" | "needs_approval" | "failed" | "passed";
  title: string;
  goal: string;
  constraints: string[];
  plan: string[];
  artifacts: Record<string, unknown>;
  attempts: Record<string, unknown>;
  created_at: string;
};

function resolveWebUrl(path: string) {
  if (typeof window !== "undefined") {
    return path;
  }

  const baseUrl =
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.FRONTEND_BASE_URL ||
    "http://localhost:3000";

  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function fetchSwarmApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(resolveWebUrl(path), {
    ...init,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Swarm request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function createSwarmRun(payload: {
  title: string;
  goal: string;
  constraints: string[];
}) {
  return fetchSwarmApi<SwarmRun>("/api/swarm/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function listSwarmRuns() {
  return fetchSwarmApi<SwarmRun[]>("/api/swarm/runs");
}

export async function getSwarmRun(runId: string) {
  return fetchSwarmApi<SwarmRun>(`/api/swarm/runs/${encodeURIComponent(runId)}`);
}
