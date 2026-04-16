import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import SignInButton from "@/components/sign-in-button";

export default async function AuthStatus() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return (
      <section style={{ display: "grid", gap: 12, marginTop: 24 }}>
        <p>You are not signed in.</p>
        <SignInButton callbackUrl="/dashboard" />
      </section>
    );
  }

  const label = user.login || user.name || user.email || user.id;

  return (
    <section style={{ display: "grid", gap: 12, marginTop: 24 }}>
      <p>
        Signed in as <strong>{label}</strong>
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/dashboard">Open dashboard</Link>

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
  );
}
