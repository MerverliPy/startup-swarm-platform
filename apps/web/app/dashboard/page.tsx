import Link from "next/link";
import TaskForm from "@/components/task-form";
import CopilotSmokeButton from "@/components/copilot-smoke-button";
import { auth, signOut } from "@/lib/auth";
import { listSwarmRuns } from "@/lib/api";
import { getAiSettings } from "@/lib/ai-settings";
import SignInButton from "@/components/sign-in-button";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return (
      <main style={{ display: "grid", gap: 24 }}>
        <h2>Dashboard</h2>
        <p>GitHub sign-in is required before using the dashboard.</p>
        <SignInButton callbackUrl="/dashboard" />
        <Link href="/">Back to home</Link>
      </main>
    );
  }

  const runs = await listSwarmRuns();
  const label = user.login || user.name || user.email || user.id;
  const ai = getAiSettings();

  return (
    <main style={{ display: "grid", gap: 24 }}>
      <h2>Dashboard</h2>

      <section style={{ display: "grid", gap: 12 }}>
        <p>
          Signed in as <strong>{label}</strong>
        </p>

        <p>
          AI provider: <strong>{ai.provider}</strong>
        </p>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/">Back home</Link>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit">Sign out</button>
          </form>
        </div>
      </section>

      <section>
        <h3>Copilot smoke test</h3>
        <CopilotSmokeButton />
      </section>

      <section>
        <h3>Create run</h3>
        <TaskForm />
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
              padding: 16
            }}
          >
            {JSON.stringify(runs, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
