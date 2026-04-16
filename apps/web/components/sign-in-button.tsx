"use client";

import { signIn } from "next-auth/react";

export default function SignInButton({
  callbackUrl = "/dashboard",
}: {
  callbackUrl?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signIn("github", { callbackUrl })}
    >
      Sign in with GitHub
    </button>
  );
}
