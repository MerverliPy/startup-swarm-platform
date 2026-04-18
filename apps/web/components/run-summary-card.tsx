import Link from "next/link";

import {
  getRunApprovalState,
  getRunDurationLabel,
  getRunIssueCounts,
  getRunProjectLabel,
  getRunProviderLabel,
  getRunStatusLabel,
  getRunTemplateLabel,
  getRunTypeLabel,
  type SwarmRun,
} from "@/lib/api";

type RunSummaryCardProps = {
  run: SwarmRun;
  href?: string;
};

function getStatusColor(status: SwarmRun["status"]) {
  switch (status) {
    case "passed":
      return "#166534";
    case "needs_approval":
      return "#92400e";
    case "failed":
      return "#991b1b";
    default:
      return "#1d4ed8";
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function RunSummaryCard({ run, href }: RunSummaryCardProps) {
  const counts = getRunIssueCounts(run);

  return (
    <article
      style={{
        display: "grid",
        gap: 16,
        padding: 16,
        border: "1px solid #d4d4d8",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 8 }}>
          {href ? (
            <Link href={href} style={{ fontSize: 20, fontWeight: 600 }}>
              {run.title}
            </Link>
          ) : (
            <h3 style={{ margin: 0 }}>{run.title}</h3>
          )}
          <p style={{ margin: 0, opacity: 0.8 }}>{run.goal}</p>
        </div>

        <span
          style={{
            alignSelf: "start",
            background: getStatusColor(run.status),
            color: "white",
            borderRadius: 999,
            padding: "4px 10px",
            textTransform: "capitalize",
          }}
        >
          {getRunStatusLabel(run.status)}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        }}
      >
        <Stat label="Run type" value={getRunTypeLabel(run)} />
        <Stat label="Provider" value={getRunProviderLabel(run)} />
        <Stat label="Project" value={getRunProjectLabel(run)} />
        <Stat label="Template" value={getRunTemplateLabel(run)} />
        <Stat label="Approval" value={getRunApprovalState(run)} />
        <Stat label="Timing" value={getRunDurationLabel(run)} />
        <Stat label="Blockers" value={String(counts.blockers)} />
        <Stat label="Major issues" value={String(counts.majorIssues)} />
        <Stat label="Minor issues" value={String(counts.minorIssues)} />
      </div>
    </article>
  );
}
