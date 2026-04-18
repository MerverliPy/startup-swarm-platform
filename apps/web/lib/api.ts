export type SwarmRun = {
  run_id: string;
  status: "queued" | "running" | "needs_approval" | "failed" | "passed";
  title: string;
  goal: string;
  constraints: string[];
  run_type?: string;
  provider?: "deterministic" | "openai" | string;
  require_marketing?: boolean;
  require_repo_context?: boolean;
  plan: string[];
  artifacts: Record<string, unknown>;
  attempts: Record<string, unknown>;
  review?: {
    state?: string;
    available_actions?: string[];
    action_history?: Array<{
      action: string;
      note?: string | null;
      created_at: string;
      actor: string;
      resulting_status: string;
      rerun_run_id?: string | null;
    }>;
    last_note?: string | null;
    last_updated_at?: string | null;
  };
  compare?: {
    project_id?: string | null;
    template_id?: string | null;
    compare_key?: string | null;
    source_run_id?: string | null;
  };
  quality_signals?: {
    summary?: string;
    confidence_level?: "low" | "medium" | "high";
    confidence_reason?: string;
    risk_level?: "low" | "medium" | "high";
    risk_flags?: string[];
    grounding?: {
      status?: string;
      blocker_count?: number;
      major_issue_count?: number;
      minor_issue_count?: number;
      repair_attempts?: number;
      approval_required?: boolean;
    };
  };
  product_metrics?: {
    summary?: string;
    events?: Array<{
      name?: string;
      recorded_at?: string;
      value?: number;
    }>;
  };
  created_at: string;
  completed_at?: string | null;
};

export type RunQualitySignals = {
  confidenceLevel: "low" | "medium" | "high";
  confidenceReason: string;
  riskLevel: "low" | "medium" | "high";
  riskFlags: string[];
  grounding: {
    status: string;
    blockerCount: number;
    majorIssueCount: number;
    minorIssueCount: number;
    repairAttempts: number;
    approvalRequired: boolean;
  };
};

export type ProductMetricEvent = {
  name: string;
  recordedAt: string;
  value: number;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(1, Math.round(ms / 1000));

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes < 60) {
    return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

export function getRunStatusLabel(status: SwarmRun["status"]): string {
  return status.replace(/_/g, " ");
}

export function getRunProviderLabel(run: SwarmRun): string {
  if (run.provider === "openai") {
    return "OpenAI";
  }

  if (run.provider === "deterministic") {
    return "Deterministic";
  }

  return run.provider || "Unknown";
}

export function getRunTypeLabel(run: SwarmRun): string {
  if (run.run_type === "bounded_swarm" || !run.run_type) {
    return "Bounded swarm";
  }

  return run.run_type.replace(/_/g, " ");
}

export function getRunDurationLabel(run: SwarmRun): string {
  const created = parseDate(run.created_at);
  const completed = parseDate(run.completed_at);

  if (!created) {
    return "Timing unavailable";
  }

  if (completed) {
    return `Completed in ${formatDuration(completed.getTime() - created.getTime())}`;
  }

  return `Elapsed ${formatDuration(Date.now() - created.getTime())}`;
}

export function getRunApprovalState(run: SwarmRun): string {
  if (run.review?.state === "approved") {
    return "Approved";
  }

  if (run.review?.state === "rejected") {
    return "Rejected";
  }

  if (run.review?.state === "revision_requested") {
    return "Revision requested";
  }

  const validator = asRecord(run.artifacts.validator);

  if (validator?.human_approval_required === true || run.status === "needs_approval") {
    return "Human approval required";
  }

  if (run.status === "failed") {
    return "Not approved";
  }

  return "No approval required";
}

export function getRunProjectLabel(run: SwarmRun): string {
  return run.compare?.project_id || "general";
}

export function getRunTemplateLabel(run: SwarmRun): string {
  return run.compare?.template_id || "custom";
}

export function getValidatorRationale(run: SwarmRun): string {
  const validator = asRecord(run.artifacts.validator);
  return readString(validator?.rationale, "Validator rationale not available.");
}

export function getCriticFindings(run: SwarmRun) {
  const critic = asRecord(run.artifacts.critic);
  const validator = asRecord(run.artifacts.validator);

  return {
    blockers: readStringArray(critic?.blockers ?? validator?.blockers),
    majorIssues: readStringArray(critic?.major_issues ?? validator?.major_issues),
    minorIssues: readStringArray(critic?.minor_issues),
  };
}

export function getRunIssueCounts(run: SwarmRun) {
  const findings = getCriticFindings(run);

  return {
    blockers: findings.blockers.length,
    majorIssues: findings.majorIssues.length,
    minorIssues: findings.minorIssues.length,
  };
}

export function getRepairSummary(run: SwarmRun) {
  const repair = asRecord(run.artifacts.repair);

  return {
    summary: readString(repair?.summary, "No repair pass was needed."),
    repairedItems: readStringArray(repair?.repaired_items),
    unresolvedItems: readStringArray(repair?.unresolved_items),
  };
}

export function getRunTimeline(run: SwarmRun) {
  const artifactKeys = [
    { key: "orchestrator", label: "Orchestrator", required: true },
    { key: "build", label: "Builder", required: true },
    { key: "critic", label: "Critic", required: true },
    { key: "repair", label: "Repair", required: false },
    { key: "marketing", label: "Marketing", required: false },
    { key: "validator", label: "Validator", required: true },
  ].filter((stage) => stage.required || run.artifacts[stage.key]);

  let currentAssigned = false;

  return artifactKeys.map((stage) => {
    const artifact = asRecord(run.artifacts[stage.key]);
    let status: "complete" | "current" | "pending" = "pending";

    if (artifact) {
      status = "complete";
    } else if (!currentAssigned && (run.status === "running" || run.status === "queued")) {
      status = "current";
      currentAssigned = true;
    }

    return {
      key: stage.key,
      label: stage.label,
      status,
      summary: readString(artifact?.summary),
    };
  });
}

export function getRunQualitySignals(run: SwarmRun): RunQualitySignals {
  const quality = asRecord(run.quality_signals) ?? asRecord(run.artifacts.quality_signals);
  const grounding = asRecord(quality?.grounding);

  return {
    confidenceLevel:
      readString(quality?.confidence_level, "medium") === "low"
        ? "low"
        : readString(quality?.confidence_level, "medium") === "high"
          ? "high"
          : "medium",
    confidenceReason: readString(quality?.confidence_reason, "Confidence was not recorded."),
    riskLevel:
      readString(quality?.risk_level, "low") === "high"
        ? "high"
        : readString(quality?.risk_level, "low") === "medium"
          ? "medium"
          : "low",
    riskFlags: readStringArray(quality?.risk_flags),
    grounding: {
      status: readString(grounding?.status, run.status),
      blockerCount: readNumber(grounding?.blocker_count),
      majorIssueCount: readNumber(grounding?.major_issue_count),
      minorIssueCount: readNumber(grounding?.minor_issue_count),
      repairAttempts: readNumber(grounding?.repair_attempts),
      approvalRequired: grounding?.approval_required === true,
    },
  };
}

export function getRunProductMetrics(run: SwarmRun): ProductMetricEvent[] {
  const metrics = asRecord(run.product_metrics) ?? asRecord(run.artifacts.product_metrics);
  const events = metrics?.events;

  if (!Array.isArray(events)) {
    return [];
  }

  return events
    .map((entry) => {
      const event = asRecord(entry);
      if (!event) {
        return null;
      }

      const name = readString(event.name);
      const recordedAt = readString(event.recorded_at);
      if (!name || !recordedAt) {
        return null;
      }

      return {
        name,
        recordedAt,
        value: readNumber(event.value, 1),
      } satisfies ProductMetricEvent;
    })
    .filter((event): event is ProductMetricEvent => event !== null);
}

export function getSuggestedNextActions(run: SwarmRun) {
  const actions: Array<{ label: string; href: string; reason: string }> = [];

  if (run.status === "needs_approval" || run.review?.state === "pending") {
    actions.push({
      label: "Review approval decision",
      href: `/dashboard/${run.run_id}`,
      reason: "This run is waiting for an explicit operator approval action.",
    });
  }

  if (run.review?.state === "revision_requested") {
    actions.push({
      label: "Inspect revision request",
      href: `/dashboard/${run.run_id}`,
      reason: "An operator requested changes before this work should move forward.",
    });
  }

  if (run.status === "failed") {
    actions.push({
      label: "Review blockers",
      href: `/dashboard/${run.run_id}`,
      reason: "The validator recorded blockers that need attention before another run.",
    });
  }

  if (run.compare?.source_run_id) {
    actions.push({
      label: "Compare with source run",
      href: `/dashboard/${run.compare.source_run_id}`,
      reason: "This run was created from a prior run and is ready for side-by-side review.",
    });
  }

  return actions;
}

function resolveWebUrl(path: string) {
  if (typeof window !== "undefined") {
    return path;
  }

  const baseUrl =
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.FRONTEND_BASE_URL ||
    "http://localhost:3000";

  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function fetchSwarmApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(resolveWebUrl(path), {
    ...init,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Swarm request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function createSwarmRun(payload: {
  title: string;
  goal: string;
  constraints: string[];
  run_type: "bounded_swarm";
  require_marketing: boolean;
  require_repo_context: boolean;
  template_id?: string;
  project_id?: string;
  source_run_id?: string;
}) {
  return fetchSwarmApi<SwarmRun>("/api/swarm/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function applySwarmRunAction(
  runId: string,
  payload: {
    action: "approve" | "reject" | "request_revision" | "rerun_with_edits";
    note?: string;
    title?: string;
    goal?: string;
    constraints?: string[];
  }
) {
  return fetchSwarmApi<SwarmRun>(`/api/swarm/runs/${encodeURIComponent(runId)}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function listSwarmRuns() {
  return fetchSwarmApi<SwarmRun[]>("/api/swarm/runs");
}

export async function getSwarmRun(runId: string) {
  return fetchSwarmApi<SwarmRun>(`/api/swarm/runs/${encodeURIComponent(runId)}`);
}
