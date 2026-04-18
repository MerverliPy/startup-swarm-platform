"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createSwarmRun } from "@/lib/api";

type TaskFormProps = {
  provider: string;
};

function parseConstraints(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function TaskForm({ provider }: TaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [constraints, setConstraints] = useState("production_ready");
  const [runType, setRunType] = useState<"bounded_swarm">("bounded_swarm");
  const [requireMarketing, setRequireMarketing] = useState(false);
  const [requireRepoContext, setRequireRepoContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const run = await createSwarmRun({
        title,
        goal,
        constraints: parseConstraints(constraints),
        run_type: runType,
        require_marketing: requireMarketing,
        require_repo_context: requireRepoContext,
      });
      router.push(`/dashboard/${run.run_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      <p style={{ margin: 0 }}>
        Provider for this run: <strong>{provider}</strong>
      </p>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Run type</span>
        <select value={runType} onChange={(e) => setRunType(e.target.value as "bounded_swarm")}>
          <option value="bounded_swarm">Bounded swarm</option>
        </select>
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Task title</span>
        <input
          required
          minLength={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Launch a structured review for..."
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Goal</span>
        <textarea
          required
          minLength={10}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Describe the outcome you want, the audience, and the bounded deliverable."
          rows={6}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <span>Constraints</span>
        <textarea
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          placeholder="Add one constraint per line or separate with commas"
          rows={4}
        />
      </label>

      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={requireMarketing}
          onChange={(e) => setRequireMarketing(e.target.checked)}
        />
        <span>Include a marketing/messaging pass</span>
      </label>

      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={requireRepoContext}
          onChange={(e) => setRequireRepoContext(e.target.checked)}
        />
        <span>Flag that repository context is required</span>
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Running..." : "Run swarm"}
      </button>

      {error ? <p>{error}</p> : null}
    </form>
  );
}
