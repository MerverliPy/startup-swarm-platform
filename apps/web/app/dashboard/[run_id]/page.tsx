import Link from "next/link";

import ApprovalActions from "@/components/approval-actions";
import RunReviewTabs from "@/components/run-review-tabs";
import RunSummaryCard from "@/components/run-summary-card";
import { getRunProductMetrics, getRunQualitySignals, getSwarmRun } from "@/lib/api";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ run_id: string }>;
}) {
  const { run_id } = await params;
  const run = await getSwarmRun(run_id);
  const quality = getRunQualitySignals(run);
  const metrics = getRunProductMetrics(run);

  return (
    <main style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/dashboard">← Back to dashboard</Link>
        <span>Run ID: {run.run_id}</span>
      </div>

      <section style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{run.title}</h2>
        <p style={{ margin: 0 }}>{run.goal}</p>
      </section>

      <RunSummaryCard run={run} />

      <section
        className="app-panel"
        style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0 }}>Confidence</h3>
          <strong style={{ textTransform: "capitalize" }}>{quality.confidenceLevel}</strong>
          <p style={{ margin: 0 }}>{quality.confidenceReason}</p>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0 }}>Risk</h3>
          <strong style={{ textTransform: "capitalize" }}>{quality.riskLevel}</strong>
          <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
            {quality.riskFlags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <h3 style={{ margin: 0 }}>Product metrics</h3>
          {metrics.length === 0 ? (
            <p style={{ margin: 0 }}>No metric events recorded.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>
              {metrics.map((event) => (
                <li key={`${event.name}-${event.recordedAt}`}>
                  {event.name.replace(/_/g, " ")} · {new Date(event.recordedAt).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ApprovalActions run={run} />
      <RunReviewTabs run={run} />
    </main>
  );
}
