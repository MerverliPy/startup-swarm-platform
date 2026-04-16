export async function createSwarmRun(payload: {
  title: string;
  goal: string;
  constraints: string[];
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/swarm/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to create run: ${res.status}`);
  }

  return res.json();
}

export async function listSwarmRuns() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/swarm/runs`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to list runs: ${res.status}`);
  }

  return res.json();
}
