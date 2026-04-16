import GitHub from "next-auth/providers/github";
import NextAuth from "next-auth";

const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
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

  const response = await fetch(`${apiBaseUrl}/auth/session/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-platform-internal-key": internalKey,
    },
    body: JSON.stringify(identity),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange platform session: ${response.status}`);
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
