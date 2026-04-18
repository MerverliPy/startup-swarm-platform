"use client";

type Template = {
  id: string;
  label: string;
  title: string;
  goal: string;
  constraints: string[];
  requireMarketing?: boolean;
  requireRepoContext?: boolean;
};

type TemplateLauncherProps = {
  onSelect: (template: Template) => void;
};

export const starterTemplates: Template[] = [
  {
    id: "launch-brief",
    label: "Launch brief",
    title: "Prepare a launch brief",
    goal: "Produce a concise launch brief for a new product update with operator-ready risks, checks, and rollout guidance.",
    constraints: ["production_ready", "operator_review"],
    requireMarketing: true,
  },
  {
    id: "repo-readiness",
    label: "Repo readiness",
    title: "Review repository readiness",
    goal: "Assess repository readiness for a bounded delivery and identify blockers, major issues, and safe next steps.",
    constraints: ["repo_context_required"],
    requireRepoContext: true,
  },
];

export type { Template };

export default function TemplateLauncher({ onSelect }: TemplateLauncherProps) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h4 style={{ margin: 0 }}>Start from a template</h4>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {starterTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            style={{
              textAlign: "left",
              padding: 12,
              borderRadius: 12,
              border: "1px solid #d4d4d8",
              background: "white",
              display: "grid",
              gap: 6,
            }}
          >
            <strong>{template.label}</strong>
            <span style={{ opacity: 0.8 }}>{template.goal}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
