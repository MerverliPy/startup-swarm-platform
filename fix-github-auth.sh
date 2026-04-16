#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------
# EDIT THESE 5 VALUES BEFORE RUNNING
# ------------------------------------------------------------------
APP_URL="http://100.81.83.98:3001"
PUBLIC_API_URL="http://100.81.83.98:8000"
INTERNAL_API_URL="http://api:8000"

GITHUB_ID="Ov23limMI6AXdgV8eUte"
GITHUB_SECRET="9b512376e4751def229d15361d97b829a995c748"

# Use a real long random string here if you want.
# This temporary value is enough to remove the Auth.js configuration error.
AUTH_SECRET_VALUE="d9ac3049367c9df9e62faca8656076aa3226820ab61e1f4b18d5b0eed703d41d"
# Keep these aligned with what you already use in the repo.
JWT_SECRET_VALUE="359fbc31f862a3d5bd2f8c63a6dbe4d190d03398c1641e5a969812b9833f8d69" 
PLATFORM_INTERNAL_API_KEY_VALUE="6a8e30b0de1d126893d120edfa264c4922abed68f69ec7299f6267fbeacb62d8"
OPENAI_API_KEY_VALUE=""

mkdir -p apps/web/lib
mkdir -p "apps/web/app/api/auth/[...nextauth]"
mkdir -p apps/api

cat > apps/web/lib/auth.ts <<ENVEOF
import GitHub from "next-auth/providers/github";
import NextAuth from "next-auth";

const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile && "id" in profile) {
        token.providerUserId = String(profile.id);
      }
      if (profile && "login" in profile) {
        token.githubLogin = String((profile as { login?: string }).login ?? "");
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: (token.providerUserId as string | undefined) ?? token.sub,
        login: token.githubLogin as string | undefined,
      };
      return session;
    },
  },
});

export type PlatformIdentity = {
  provider: "github";
  providerUserId: string;
  login: string;
  avatarUrl?: string | null;
  name?: string | null;
};

export async function getPlatformIdentity(): Promise<PlatformIdentity | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !user.login) {
    return null;
  }

  return {
    provider: "github",
    providerUserId: user.id,
    login: user.login,
    avatarUrl: user.image,
    name: user.name,
  };
}

export async function exchangePlatformSession(): Promise<string | null> {
  const identity = await getPlatformIdentity();
  if (!identity || !apiBaseUrl) {
    return null;
  }

  const internalKey = process.env.PLATFORM_INTERNAL_API_KEY;
  if (!internalKey) {
    throw new Error("PLATFORM_INTERNAL_API_KEY is not configured");
  }

  const response = await fetch(\`\${apiBaseUrl}/auth/session/exchange\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-platform-internal-key": internalKey,
    },
    body: JSON.stringify(identity),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(\`Failed to exchange platform session: \${response.status}\`);
  }

  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      login?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    providerUserId?: string;
    githubLogin?: string;
  }
}
ENVEOF

cat > "apps/web/app/api/auth/[...nextauth]/route.ts" <<'ENVEOF'
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
ENVEOF

cat > .env <<ENVEOF
# Shared
APP_NAME=Startup Swarm Platform
APP_ENV=development

# Network
API_BASE_URL=${INTERNAL_API_URL}
FRONTEND_BASE_URL=${APP_URL}
NEXT_PUBLIC_API_BASE_URL=${PUBLIC_API_URL}

# Auth.js / NextAuth
AUTH_URL=${APP_URL}
NEXTAUTH_URL=${APP_URL}
AUTH_SECRET=${AUTH_SECRET_VALUE}
NEXTAUTH_SECRET=${AUTH_SECRET_VALUE}
AUTH_TRUST_HOST=true

# Platform auth
JWT_SECRET=${JWT_SECRET_VALUE}
PLATFORM_INTERNAL_API_KEY=${PLATFORM_INTERNAL_API_KEY_VALUE}

# Provider auth (web-first GitHub OAuth)
GITHUB_ID=${GITHUB_ID}
GITHUB_SECRET=${GITHUB_SECRET}
GITHUB_OAUTH_REDIRECT_URI=${APP_URL}/api/auth/callback/github

# Swarm provider
OPENAI_API_KEY=${OPENAI_API_KEY_VALUE}
OPENAI_MODEL=gpt-5.4-mini

# Optional Copilot / GitHub App follow-on integration
COPILOT_ENABLED=0
COPILOT_GITHUB_APP_CLIENT_ID=
COPILOT_GITHUB_APP_CLIENT_SECRET=
COPILOT_GITHUB_APP_ID=
COPILOT_GITHUB_PRIVATE_KEY=
ENVEOF

cat > apps/web/.env.local <<ENVEOF
API_BASE_URL=${INTERNAL_API_URL}
NEXT_PUBLIC_API_BASE_URL=${PUBLIC_API_URL}
AUTH_URL=${APP_URL}
NEXTAUTH_URL=${APP_URL}
AUTH_SECRET=${AUTH_SECRET_VALUE}
NEXTAUTH_SECRET=${AUTH_SECRET_VALUE}
AUTH_TRUST_HOST=true
PLATFORM_INTERNAL_API_KEY=${PLATFORM_INTERNAL_API_KEY_VALUE}
GITHUB_ID=${GITHUB_ID}
GITHUB_SECRET=${GITHUB_SECRET}
COPILOT_ENABLED=0
ENVEOF

cat > apps/api/.env <<ENVEOF
APP_NAME=Startup Swarm Platform API
API_BASE_URL=${INTERNAL_API_URL}
FRONTEND_BASE_URL=${APP_URL}
JWT_SECRET=${JWT_SECRET_VALUE}
PLATFORM_INTERNAL_API_KEY=${PLATFORM_INTERNAL_API_KEY_VALUE}
OPENAI_API_KEY=${OPENAI_API_KEY_VALUE}
OPENAI_MODEL=gpt-5.4-mini
RUNS_DIR=/runs
ENVEOF

echo
echo "Auth files rewritten."
echo "Next steps:"
echo "  1) inspect fix-github-auth.sh and replace the placeholder values at the top"
echo "  2) run: bash fix-github-auth.sh"
echo "  3) run: docker compose down && docker compose up --build"
echo "  4) test: curl -i http://localhost:3001/api/auth/signin/github | tr -d '\\r' | sed -n '/^location:/Ip'"
