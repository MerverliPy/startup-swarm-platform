import Link from "next/link";

import { getRunApprovalState, type SwarmRun } from "@/lib/api";

type ApprovalInboxProps = {
  runs: SwarmRun[];
};

export default function ApprovalInbox({ runs }: ApprovalInboxProps) {
  const pendingRuns = runs.filter(
    (run) => run.status === "needs_approval" || run.review?.state === "pending"
  );

  return (
    <section className="app-panel" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Approval inbox</h3>
        <span>{pendingRuns.length} pending</span>
      </div>

      {pendingRuns.length === 0 ? (
        <p style={{ margin: 0 }}>No approvals are waiting right now.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {pendingRuns.map((run) => (
            <article
              key={run.run_id}
              style={{
                display: "grid",
                gap: 6,
                padding: 12,
                border: "1px solid #e4e4e7",
                borderRadius: 12,
                background: "#fafafa",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <Link href={`/dashboard/${run.run_id}`} style={{ fontWeight: 600 }}>
                  {run.title}
                </Link>
                <span>{getRunApprovalState(run)}</span>
              </div>
              <p style={{ margin: 0, opacity: 0.8 }}>{run.goal}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
