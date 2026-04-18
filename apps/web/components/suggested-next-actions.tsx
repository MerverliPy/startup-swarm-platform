import Link from "next/link";

import { getSuggestedNextActions, type SwarmRun } from "@/lib/api";

type SuggestedNextActionsProps = {
  runs: SwarmRun[];
};

export default function SuggestedNextActions({ runs }: SuggestedNextActionsProps) {
  const actions = runs.flatMap((run) =>
    getSuggestedNextActions(run).map((action) => ({ ...action, runId: run.run_id }))
  );

  return (
    <section className="app-panel" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Suggested next actions</h3>
        <span>{actions.length} ready</span>
      </div>

      {actions.length === 0 ? (
        <p style={{ margin: 0 }}>No follow-up actions are suggested from current run state.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 10 }}>
          {actions.slice(0, 6).map((action) => (
            <li key={`${action.runId}-${action.label}`}>
              <Link href={action.href}>{action.label}</Link>
              {` — ${action.reason}`}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
