import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    githubAccessToken?: string;
    user: DefaultSession["user"] & {
      id: string;
      login?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    providerUserId?: string;
    githubLogin?: string;
    githubAccessToken?: string;
  }
}
