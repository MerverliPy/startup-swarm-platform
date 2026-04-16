import Link from "next/link";
import TaskForm from "@/components/task-form";
import { auth, signOut } from "@/lib/auth";

type RunResponse = {
  run_id: string;
  status: string;
  title: string;
  goal: string;
  constraints: string[];
  plan?: string[];
  artifacts?: Record<string, unknown>;
  attempts?: Record<string, unknown>;
};

async function getRuns(): Promise<RunResponse[]> {
  try {
    const baseUrl = process.env.API_BASE_URL || "http://api:8000";

    const res = await fetch(`${baseUrl}/swarm/runs`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return (await res.json()) as RunResponse[];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return (
      <main style={{ display: "grid", gap: 24 }}>
        <h2>Dashboard</h2>
        <p>GitHub sign-in is required before using the dashboard.</p>

        <a
          href="/api/auth/signin/github"
          style={{
            display: "inline-block",
            width: "fit-content",
            padding: "10px 16px",
            background: "#1d4ed8",
            color: "#fff",
            borderRadius: 9999,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Sign in with GitHub
        </a>

        <Link href="/">Back to home</Link>
      </main>
    );
  }

  const runs = await getRuns();
  const copilotEnabled = process.env.COPILOT_ENABLED === "1";
  const label = user.login || user.name || user.email || user.id;

  return (
    <main style={{ display: "grid", gap: 24 }}>
      <h2>Dashboard</h2>

      <section style={{ display: "grid", gap: 12 }}>
        <p>
          Signed in as <strong>{label}</strong>
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/">Back home</Link>

          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit">Sign out</button>
          </form>
        </div>
      </section>

      <section>
        <h3>Create run</h3>
        <TaskForm />
      </section>

      <section>
        <h3>Copilot integration</h3>
        <p>{copilotEnabled ? "Enabled in environment" : "Disabled in environment"}</p>
        <p>
          This starter expects server-side Copilot calls using the signed-in
          user&apos;s GitHub token.
        </p>
      </section>

      <section>
        <h3>Recent runs</h3>
        {runs.length === 0 ? (
          <p>No runs yet.</p>
        ) : (
          <pre
            style={{
              overflowX: "auto",
              background: "#111",
              color: "#eee",
              padding: 16,
            }}
          >
            {JSON.stringify(runs, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
