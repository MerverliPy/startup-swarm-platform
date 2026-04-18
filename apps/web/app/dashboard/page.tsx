import Link from "next/link";
import RunSummaryCard from "@/components/run-summary-card";
import TaskForm from "@/components/task-form";
import { auth, signOut } from "@/lib/auth";
import { getRunStatusLabel, listSwarmRuns } from "@/lib/api";
import { getAiSettings } from "@/lib/ai-settings";
import SignInButton from "@/components/sign-in-button";

const statusOrder = ["running", "needs_approval", "failed", "passed", "queued"] as const;

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
  const groupedRuns = statusOrder
    .map((status) => ({
      status,
      items: runs.filter((run) => run.status === status),
    }))
    .filter((group) => group.items.length > 0);

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
        <h3>Create run</h3>
        <TaskForm provider={ai.provider} />
      </section>

      <section>
        <h3>Recent runs</h3>
        {runs.length === 0 ? (
          <p>No runs yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 20 }}>
            {groupedRuns.map((group) => (
              <section key={group.status} style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <h4 style={{ margin: 0, textTransform: "capitalize" }}>
                    {getRunStatusLabel(group.status)}
                  </h4>
                  <span>{group.items.length} run(s)</span>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {group.items.map((run) => (
                    <RunSummaryCard key={run.run_id} run={run} href={`/dashboard/${run.run_id}`} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
