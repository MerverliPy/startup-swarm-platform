"use client";

import { useState } from "react";

import {
  getCriticFindings,
  getRepairSummary,
  getRunApprovalState,
  getRunDurationLabel,
  getRunIssueCounts,
  getRunProjectLabel,
  getRunProviderLabel,
  getRunTemplateLabel,
  getRunTypeLabel,
  getValidatorRationale,
  getRunTimeline,
  type SwarmRun,
} from "@/lib/api";

type RunReviewTabsProps = {
  run: SwarmRun;
};

const tabs = ["summary", "timeline", "review", "raw_json"] as const;
type TabKey = (typeof tabs)[number];

function getToneStyles(tone: "critical" | "warning" | "neutral" | "success") {
  switch (tone) {
    case "critical":
      return { borderColor: "#fecaca", background: "#fef2f2" };
    case "warning":
      return { borderColor: "#fde68a", background: "#fffbeb" };
    case "success":
      return { borderColor: "#bbf7d0", background: "#f0fdf4" };
    default:
      return { borderColor: "#d4d4d8", background: "#fafafa" };
  }
}

function RunFindingList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "critical" | "warning" | "neutral" | "success";
}) {
  const styles = getToneStyles(tone);

  return (
    <section
      style={{
        display: "grid",
        gap: 10,
        padding: 12,
        border: `1px solid ${styles.borderColor}`,
        background: styles.background,
        borderRadius: 12,
      }}
    >
      <h4 style={{ margin: 0 }}>{title}</h4>
      {items.length === 0 ? (
        <p style={{ margin: 0 }}>None.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function getStageColor(status: "complete" | "current" | "pending") {
  switch (status) {
    case "complete":
      return "#166534";
    case "current":
      return "#1d4ed8";
    default:
      return "#71717a";
  }
}

function RunStageTimeline({ run }: { run: SwarmRun }) {
  const stages = getRunTimeline(run);

  return (
    <ol style={{ display: "grid", gap: 12, paddingLeft: 20, margin: 0 }}>
      {stages.map((stage) => (
        <li key={stage.key} style={{ display: "grid", gap: 6 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <strong>{stage.label}</strong>
            <span
              style={{
                color: "white",
                background: getStageColor(stage.status),
                borderRadius: 999,
                padding: "2px 8px",
                textTransform: "capitalize",
                fontSize: 12,
              }}
            >
              {stage.status}
            </span>
          </div>
          <p style={{ margin: 0, opacity: 0.8 }}>{stage.summary || "No summary recorded."}</p>
        </li>
      ))}
    </ol>
  );
}

export default function RunReviewTabs({ run }: RunReviewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const findings = getCriticFindings(run);
  const counts = getRunIssueCounts(run);
  const repair = getRepairSummary(run);

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            aria-pressed={activeTab === tab}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #d4d4d8",
              background: activeTab === tab ? "#18181b" : "white",
              color: activeTab === tab ? "white" : "inherit",
              textTransform: tab === "raw_json" ? "uppercase" : "capitalize",
            }}
          >
            {tab.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {activeTab === "summary" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0 }}>Validator rationale</h3>
            <p style={{ margin: 0 }}>{getValidatorRationale(run)}</p>
          </section>

          <section
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            <div>
              <strong>Run type</strong>
              <p>{getRunTypeLabel(run)}</p>
            </div>
            <div>
              <strong>Provider</strong>
              <p>{getRunProviderLabel(run)}</p>
            </div>
            <div>
              <strong>Project</strong>
              <p>{getRunProjectLabel(run)}</p>
            </div>
            <div>
              <strong>Template</strong>
              <p>{getRunTemplateLabel(run)}</p>
            </div>
            <div>
              <strong>Approval state</strong>
              <p>{getRunApprovalState(run)}</p>
            </div>
            <div>
              <strong>Timing</strong>
              <p>{getRunDurationLabel(run)}</p>
            </div>
          </section>

          <section style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0 }}>Plan</h3>
            {run.plan.length === 0 ? (
              <p style={{ margin: 0 }}>No explicit plan was recorded.</p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                {run.plan.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
          </section>

          <section style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0 }}>Constraints</h3>
            {run.constraints.length === 0 ? (
              <p style={{ margin: 0 }}>No explicit constraints recorded.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                {run.constraints.map((constraint) => (
                  <li key={constraint}>{constraint}</li>
                ))}
              </ul>
            )}
          </section>

          <section style={{ display: "grid", gap: 8 }}>
            <h3 style={{ margin: 0 }}>Review history</h3>
            {run.review?.action_history?.length ? (
              <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                {run.review.action_history.map((entry, index) => (
                  <li key={`${entry.action}-${entry.created_at}-${index}`}>
                    <strong>{entry.action.replace(/_/g, " ")}</strong> · {entry.resulting_status}
                    {entry.note ? ` · ${entry.note}` : ""}
                    {entry.rerun_run_id ? ` · rerun: ${entry.rerun_run_id}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0 }}>No operator review actions yet.</p>
            )}
          </section>
        </div>
      ) : null}

      {activeTab === "timeline" ? <RunStageTimeline run={run} /> : null}

      {activeTab === "review" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span>Blockers: {counts.blockers}</span>
            <span>Major issues: {counts.majorIssues}</span>
            <span>Minor issues: {counts.minorIssues}</span>
          </section>

          <RunFindingList title="Blockers" items={findings.blockers} tone="critical" />
          <RunFindingList title="Major issues" items={findings.majorIssues} tone="warning" />
          <RunFindingList title="Minor issues" items={findings.minorIssues} tone="neutral" />
          <RunFindingList title="Repair actions" items={repair.repairedItems} tone="success" />
          <RunFindingList title="Unresolved after repair" items={repair.unresolvedItems} tone="critical" />

          <section style={{ display: "grid", gap: 8 }}>
            <h4 style={{ margin: 0 }}>Repair summary</h4>
            <p style={{ margin: 0 }}>{repair.summary}</p>
          </section>
        </div>
      ) : null}

      {activeTab === "raw_json" ? (
        <pre
          style={{
            overflowX: "auto",
            background: "#111",
            color: "#eee",
            padding: 16,
            borderRadius: 12,
            margin: 0,
          }}
        >
          {JSON.stringify(run, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
