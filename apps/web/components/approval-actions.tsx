"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { applySwarmRunAction, type SwarmRun } from "@/lib/api";

type ApprovalActionsProps = {
  run: SwarmRun;
};

const actions = [
  { id: "approve", label: "Approve" },
  { id: "reject", label: "Reject" },
  { id: "request_revision", label: "Request revision" },
  { id: "rerun_with_edits", label: "Rerun with edits" },
] as const;

export default function ApprovalActions({ run }: ApprovalActionsProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [rerunTitle, setRerunTitle] = useState(run.title);
  const [rerunGoal, setRerunGoal] = useState(run.goal);
  const [rerunConstraints, setRerunConstraints] = useState(run.constraints.join("\n"));
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const availableActions = run.review?.available_actions ?? [];
  const canRerunWithEdits = availableActions.includes("rerun_with_edits");

  if (!availableActions.length) {
    return null;
  }

  async function submit(action: (typeof actions)[number]["id"]) {
    setLoadingAction(action);
    setError(null);

    try {
      const updated = await applySwarmRunAction(run.run_id, {
        action,
        note,
        title: action === "rerun_with_edits" ? rerunTitle : undefined,
        goal: action === "rerun_with_edits" ? rerunGoal : undefined,
        constraints:
          action === "rerun_with_edits"
            ? rerunConstraints
                .split(/\n|,/) 
                .map((item) => item.trim())
                .filter(Boolean)
            : undefined,
      });
      if (action === "rerun_with_edits") {
        const latest = updated.review?.action_history?.[updated.review.action_history.length - 1];
        if (latest?.rerun_run_id) {
          router.push(`/dashboard/${latest.rerun_run_id}`);
          router.refresh();
          return;
        }
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <section style={{ display: "grid", gap: 12, padding: 16, border: "1px solid #d4d4d8", borderRadius: 12 }}>
      <h3 style={{ margin: 0 }}>Approval actions</h3>

      {canRerunWithEdits ? (
        <section style={{ display: "grid", gap: 12, padding: 12, border: "1px solid #e4e4e7", borderRadius: 12, background: "#fafafa" }}>
          <h4 style={{ margin: 0 }}>Rerun with edits</h4>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Title</span>
            <input value={rerunTitle} onChange={(e) => setRerunTitle(e.target.value)} minLength={3} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Goal</span>
            <textarea value={rerunGoal} onChange={(e) => setRerunGoal(e.target.value)} rows={4} minLength={10} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Constraints</span>
            <textarea
              value={rerunConstraints}
              onChange={(e) => setRerunConstraints(e.target.value)}
              rows={4}
              placeholder="One constraint per line or comma-separated"
            />
          </label>
        </section>
      ) : null}

      <label style={{ display: "grid", gap: 6 }}>
        <span>Operator note</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Optional note for approval or rerun context" />
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {actions
          .filter((action) => availableActions.includes(action.id))
          .map((action) => (
            <button key={action.id} type="button" onClick={() => submit(action.id)} disabled={loadingAction !== null}>
              {loadingAction === action.id ? "Working..." : action.label}
            </button>
          ))}
      </div>
      {error ? <p style={{ margin: 0, color: "#991b1b" }}>{error}</p> : null}
    </section>
  );
}
