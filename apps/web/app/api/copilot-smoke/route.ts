import { NextResponse } from "next/server";
import { CopilotClient, approveAll } from "@github/copilot-sdk";
import { auth, getGitHubAccessToken, isDiagnosticsRequestAllowed } from "@/lib/auth";
import { getAiSettings } from "@/lib/ai-settings";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isDiagnosticsRequestAllowed(request)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const session = await auth();
  const githubToken = await getGitHubAccessToken(request);
  const settings = getAiSettings();

  try {
    const clientOptions: Record<string, unknown> = {};

    if (settings.cliUrl) {
      clientOptions.cliUrl = settings.cliUrl;
    } else {
      clientOptions.cliPath = process.env.COPILOT_CLI_PATH || "/usr/local/bin/copilot";

      if (settings.provider === "copilot") {
        if (!githubToken) {
          return NextResponse.json(
            {
              ok: false,
              error: "Missing GitHub access token in session.",
              authenticated: Boolean(session?.user?.id),
              hasGithubAccessToken: Boolean(githubToken)
            },
            { status: 401 }
          );
        }

        clientOptions.githubToken = githubToken;
        clientOptions.useLoggedInUser = false;
      }
    }

    const client = new CopilotClient(clientOptions);

    try {
      const sdkSession = await client.createSession({
        sessionId: `smoke-${Date.now()}`,
        model: settings.provider === "copilot" ? settings.copilotModel : settings.openaiModel,
        onPermissionRequest: approveAll,
        ...(settings.provider === "openai"
          ? {
              provider: {
                type: "openai",
                baseUrl: settings.openaiBaseUrl,
                apiKey: settings.openaiApiKey,
                wireApi: "responses"
              }
            }
          : {})
      });

      const response = await sdkSession.sendAndWait({
        prompt: 'Reply with exactly this JSON: {"ok":true,"message":"copilot-sdk-smoke-test"}'
      });

      return NextResponse.json({
        ok: true,
        provider: settings.provider,
        auth_mode: settings.cliUrl ? "external_cli_server" : "server_github_token",
        authenticated: Boolean(session?.user?.id),
        hasGithubAccessToken: Boolean(githubToken),
        content: response?.data?.content ?? null
      });
    } finally {
      await client.stop().catch(() => {});
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: settings.provider,
        auth_mode: settings.cliUrl ? "external_cli_server" : "server_github_token",
        authenticated: Boolean(session?.user?.id),
        hasGithubAccessToken: Boolean(githubToken),
        error: error instanceof Error ? error.message : "Unknown SDK error"
      },
      { status: 500 }
    );
  }
}
