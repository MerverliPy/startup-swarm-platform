import Header from "@/components/header";
import AuthStatus from "@/components/auth-status";

export default function HomePage() {
  return (
    <main>
      <Header />

      <div style={{ display: "grid", gap: 12 }}>
        <p>
          This is the product shell for your startup-style AI swarm platform.
          Users authenticate with GitHub, then run structured AI workflows from a
          dashboard.
        </p>

        <AuthStatus />
      </div>
    </main>
  );
}
