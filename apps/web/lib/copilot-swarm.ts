import { randomUUID } from "node:crypto";
import { CopilotClient, approveAll } from "@github/copilot-sdk";
import { getAiSettings } from "@/lib/ai-settings";

type TaskRequest = {
  title: string;
  goal: string;
  constraints?: string[];
};

function normalizeConstraints(constraints?: string[]): string[] {
  return (constraints || []).map((x) => x.trim()).filter(Boolean);
}

function stripCodeFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced ? fenced[1].trim() : text.trim();
}

function extractJson(text: string): string {
  const cleaned = stripCodeFences(text);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain JSON.");
  }
  return cleaned.slice(start, end + 1);
}

function deterministicFallback(task: TaskRequest, reason?: string) {
  const constraints = normalizeConstraints(task.constraints);
  const majorIssues =
    constraints.map((c) => c.toLowerCase()).includes("production_ready")
      ? [
          "The current starter still needs stronger persistence, queueing, and deployment hardening before it should be labeled production-ready."
        ]
      : [];

  const status = majorIssues.length > 0 ? "needs_approval" : "passed";
  const decision = majorIssues.length > 0 ? "needs_approval" : "pass";

  return {
    run_id: randomUUID(),
    status,
    provider_used: "deterministic_fallback" as const,
    title: task.title,
    goal: task.goal,
    constraints,
    plan: [
      "Define the minimum viable artifact and acceptance criteria",
      "Draft a first-pass solution targeted to the stated goal",
      "Run a critic pass against constraints and operational risks",
      "Perform one bounded repair pass if the critic finds blockers or major issues",
      "Validate the final package and set a release decision"
    ],
    artifacts: {
      orchestrator: {
        summary: "Deterministic fallback plan created.",
        plan: [
          "Define the minimum viable artifact and acceptance criteria",
          "Draft a first-pass solution targeted to the stated goal",
          "Run a critic pass against constraints and operational risks",
          "Perform one bounded repair pass if the critic finds blockers or major issues",
          "Validate the final package and set a release decision"
        ],
        success_criteria: [
          "Output addresses the stated goal directly",
          "Output respects explicit constraints",
          "Review findings are either resolved or surfaced clearly",
          ...constraints
        ],
        selected_agents: ["orchestrator", "builder", "critic", "validator"]
      },
      build: {
        summary: "Deterministic fallback execution brief created.",
        output_kind: "execution_brief",
        sections: [
          { heading: "Objective", content: task.goal },
          {
            heading: "Proposed approach",
            content:
              "Use a manager-controlled workflow with typed outputs, a single repair pass, and a validator decision."
          }
        ]
      },
      critic: {
        summary: "Deterministic fallback critic pass completed.",
        blockers: [],
        major_issues: majorIssues,
        minor_issues: []
      },
      validator: {
        summary: "Deterministic fallback validator completed.",
        decision,
        rationale:
          majorIssues.length > 0
            ? "The run is usable, but production-ready was requested and infrastructure risks remain."
            : "The run satisfied the current starter acceptance bar.",
        blockers: [],
        major_issues: majorIssues,
        human_approval_required: majorIssues.length > 0
      },
      ...(reason
        ? {
            llm_error: {
              summary: "Provider-backed execution failed; deterministic fallback was used.",
              detail: reason
            }
          }
        : {})
    },
    attempts: {
      repair: majorIssues.length > 0 ? 1 : 0
    },
    created_at: new Date().toISOString()
  };
}

function buildPrompt(task: TaskRequest): string {
  const constraints = normalizeConstraints(task.constraints);

  return `
You are producing a structured startup-style AI workflow run.

Return ONLY valid JSON with this exact top-level shape:
{
  "plan": string[],
  "orchestrator": {
    "summary": string,
    "plan": string[],
    "success_criteria": string[],
    "selected_agents": string[]
  },
  "build": {
    "summary": string,
    "output_kind": "execution_brief",
    "sections": [{"heading": string, "content": string | string[]}]
  },
  "critic": {
    "summary": string,
    "blockers": string[],
    "major_issues": string[],
    "minor_issues": string[]
  },
  "validator": {
    "summary": string,
    "decision": "pass" | "needs_approval" | "fail",
    "rationale": string,
    "blockers": string[],
    "major_issues": string[],
    "human_approval_required": boolean
  }
}

Task title: ${task.title}
Goal: ${task.goal}
Constraints: ${JSON.stringify(constraints)}

Rules:
- Prefer a concise, manager-controlled workflow.
- Do not invent tools or infrastructure that were not stated.
- If "production_ready" is in constraints and the draft lacks enterprise-grade hardening, use "needs_approval" instead of "pass".
- If there are unresolved blockers, use "fail".
- Keep the result concrete and operator-friendly.
`.trim();
}

export async function createSwarmRun(
  task: TaskRequest,
  githubToken: string | null
) {
  const settings = getAiSettings();
  const constraints = normalizeConstraints(task.constraints);

  try {
    const clientOptions: Record<string, unknown> = {};

    if (settings.cliUrl) {
      clientOptions.cliUrl = settings.cliUrl;
    } else {
      clientOptions.cliPath = process.env.COPILOT_CLI_PATH || "/usr/local/bin/copilot";

      if (settings.provider === "copilot") {
        if (!githubToken) {
          throw new Error("GitHub access token is required for Copilot mode.");
        }

        clientOptions.githubToken = githubToken;
        clientOptions.useLoggedInUser = false;
      }
    }

    const client = new CopilotClient(clientOptions);

    try {
      const session = await client.createSession({
        sessionId: `user-${randomUUID()}`,
        model: settings.provider === "copilot" ? settings.copilotModel : settings.openaiModel,
        onPermissionRequest: approveAll,
        ...(settings.provider === "openai"
          ? {
              provider: {
                type: "openai",
                baseUrl: settings.openaiBaseUrl,
                apiKey: settings.openaiApiKey,
                wireApi: "responses"
              }
            }
          : {})
      });

      const response = await session.sendAndWait({ prompt: buildPrompt(task) });
      const raw = String(response?.data?.content ?? "");
      const parsed = JSON.parse(extractJson(raw)) as {
        plan: string[];
        orchestrator: Record<string, unknown>;
        build: Record<string, unknown>;
        critic: { blockers?: string[]; major_issues?: string[]; minor_issues?: string[] } & Record<string, unknown>;
        validator: { decision?: "pass" | "needs_approval" | "fail" } & Record<string, unknown>;
      };

      const repairNeeded =
        (parsed.critic.blockers?.length || 0) > 0 ||
        (parsed.critic.major_issues?.length || 0) > 0;

      const status =
        parsed.validator.decision === "fail"
          ? "failed"
          : parsed.validator.decision === "needs_approval"
            ? "needs_approval"
            : "passed";

      return {
        run_id: randomUUID(),
        status,
        provider_used: settings.provider,
        title: task.title,
        goal: task.goal,
        constraints,
        plan: parsed.plan || [],
        artifacts: {
          orchestrator: parsed.orchestrator,
          build: parsed.build,
          critic: parsed.critic,
          ...(repairNeeded
            ? {
                repair: {
                  summary: "Single bounded repair pass completed.",
                  repaired_items: (parsed.critic.major_issues || []).map(
                    (x) => `Surfaced major issue explicitly: ${x}`
                  ),
                  unresolved_items: parsed.critic.blockers || []
                }
              }
            : {}),
          validator: parsed.validator
        },
        attempts: {
          repair: repairNeeded ? 1 : 0
        },
        created_at: new Date().toISOString()
      };
    } finally {
      await client.stop().catch(() => {});
    }
  } catch (error) {
    return deterministicFallback(
      task,
      error instanceof Error ? error.message : "Unknown provider error"
    );
  }
}
