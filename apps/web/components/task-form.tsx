"use client";

import { useState } from "react";

type RunResponse = {
  run_id: string;
  status: string;
  title: string;
  goal: string;
  constraints: string[];
  plan?: string[];
  artifacts?: Record<string, unknown>;
  attempts?: Record<string, unknown>;
};

export default function TaskForm() {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [constraints, setConstraints] = useState("production_ready");
  const [result, setResult] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/swarm/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          goal,
          constraints: constraints.split(",").map((x) => x.trim()).filter(Boolean)
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create run: ${response.status}`);
      }

      const run = (await response.json()) as RunResponse;
      setResult(run);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
      />

      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Goal"
        rows={6}
      />

      <input
        value={constraints}
        onChange={(e) => setConstraints(e.target.value)}
        placeholder="Comma-separated constraints"
      />

      <button type="submit" disabled={loading}>
        {loading ? "Running..." : "Run swarm"}
      </button>

      {error ? <p>{error}</p> : null}

      {result ? (
        <pre
          style={{
            overflowX: "auto",
            background: "#111",
            color: "#eee",
            padding: 16
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </form>
  );
}
