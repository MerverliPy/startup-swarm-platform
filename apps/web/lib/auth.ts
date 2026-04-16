import GitHub from "next-auth/providers/github";
import NextAuth from "next-auth";

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
      session.user = {
        ...session.user,
        id: (token.providerUserId as string | undefined) ?? token.sub,
        login: token.githubLogin as string | undefined
      };
      session.githubAccessToken = token.githubAccessToken as string | undefined;
      return session;
    }
  }
});

export async function getGitHubAccessToken(): Promise<string | null> {
  const session = await auth();
  return session?.githubAccessToken ?? null;
}

export async function getSafeSessionDebug() {
  const session = await auth();

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
    hasGithubAccessToken: Boolean(session?.githubAccessToken)
  };
}

declare module "next-auth" {
  interface Session {
    githubAccessToken?: string;
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
    githubAccessToken?: string;
  }
}
