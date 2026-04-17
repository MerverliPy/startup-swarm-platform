import { getToken } from "@auth/core/jwt";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
const diagnosticsInternalKey = process.env.PLATFORM_INTERNAL_API_KEY?.trim();

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, profile, account }) {
      if (profile && "id" in profile) {
        token.providerUserId = String(profile.id);
      }

      if (profile && "login" in profile) {
        token.githubLogin = String((profile as { login?: string }).login ?? "");
      }

      if (account?.access_token) {
        token.githubAccessToken = String(account.access_token);
      }

      return token;
    },
    async session({ session, token }) {
      const userId =
        typeof token.providerUserId === "string"
          ? token.providerUserId
          : typeof token.sub === "string"
            ? token.sub
            : "";

      session.user = {
        ...session.user,
        id: userId,
        login: token.githubLogin as string | undefined
      };

      return session;
    }
  }
});

function usesSecureAuthCookie(request: Request) {
  const configuredAuthUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;

  if (configuredAuthUrl) {
    return configuredAuthUrl.startsWith("https://");
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
}

async function getServerJwt(request: Request) {
  if (!authSecret) {
    return null;
  }

  const secureCookie = usesSecureAuthCookie(request);

  return (
    (await getToken({ req: request, secret: authSecret, secureCookie })) ??
    (await getToken({ req: request, secret: authSecret, secureCookie: !secureCookie }))
  );
}

export function isDiagnosticsRequestAllowed(request: Request) {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!diagnosticsInternalKey || diagnosticsInternalKey === "change-me-internal") {
    return false;
  }

  return request.headers.get("x-platform-internal-key") === diagnosticsInternalKey;
}

export async function getGitHubAccessToken(request: Request): Promise<string | null> {
  const token = await getServerJwt(request);

  return typeof token?.githubAccessToken === "string" ? token.githubAccessToken : null;
}

export async function getSafeSessionDebug(request: Request) {
  const session = await auth();
  const githubAccessToken = await getGitHubAccessToken(request);

  return {
    authenticated: Boolean(session?.user?.id),
    user: session?.user
      ? {
          id: session.user.id ?? null,
          login: session.user.login ?? null,
          name: session.user.name ?? null,
          email: session.user.email ?? null
        }
      : null,
    hasGithubAccessToken: Boolean(githubAccessToken)
  };
}
