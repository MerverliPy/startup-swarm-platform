import Header from "@/components/header";
import AuthStatus from "@/components/auth-status";

export default function HomePage() {
  return (
    <main style={{ display: "grid", gap: 24 }}>
      <section className="app-panel">
        <Header />
      </section>

      <section className="app-panel" style={{ display: "grid", gap: 16 }}>
        <p>
          This is the product shell for your startup-style AI swarm platform.
          Users authenticate with GitHub, then run structured AI workflows from a
          dashboard.
        </p>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <section style={{ display: "grid", gap: 8 }}>
            <strong>iPhone-first shell</strong>
            <p className="muted-copy">
              Install the app from Safari for a focused workspace with safe-area
              spacing and thumb-reachable navigation.
            </p>
          </section>

          <section style={{ display: "grid", gap: 8 }}>
            <strong>Structured dashboard</strong>
            <p className="muted-copy">
              Create runs, review status, and inspect approvals without relying
              on a desktop-only layout.
            </p>
          </section>
        </div>

        <AuthStatus />
      </section>
    </main>
  );
}
