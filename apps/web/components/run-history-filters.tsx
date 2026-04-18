export type RunHistoryFiltersValue = {
  status: string;
  approval: string;
  provider: string;
  recency: "newest" | "oldest";
};

type RunHistoryFiltersProps = {
  value: RunHistoryFiltersValue;
};

export default function RunHistoryFilters({ value }: RunHistoryFiltersProps) {
  return (
    <form method="GET" style={{ display: "grid", gap: 12 }}>
      <h4 style={{ margin: 0 }}>History filters</h4>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Status</span>
          <select name="status" defaultValue={value.status}>
            <option value="all">All</option>
            <option value="needs_approval">Needs approval</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Approval</span>
          <select name="approval" defaultValue={value.approval}>
            <option value="all">All</option>
            <option value="pending">Pending approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="revision_requested">Revision requested</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Provider</span>
          <select name="provider" defaultValue={value.provider}>
            <option value="all">All</option>
            <option value="deterministic">Deterministic</option>
            <option value="openai">OpenAI</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Recency</span>
          <select name="recency" defaultValue={value.recency}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="submit">Apply filters</button>
        <a href="/dashboard">Reset</a>
      </div>
    </form>
  );
}
