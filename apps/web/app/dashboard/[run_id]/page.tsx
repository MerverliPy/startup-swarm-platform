import Link from "next/link";

import ApprovalActions from "@/components/approval-actions";
import RunReviewTabs from "@/components/run-review-tabs";
import RunSummaryCard from "@/components/run-summary-card";
import { getSwarmRun } from "@/lib/api";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ run_id: string }>;
}) {
  const { run_id } = await params;
  const run = await getSwarmRun(run_id);

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
      <ApprovalActions run={run} />
      <RunReviewTabs run={run} />
    </main>
  );
}
