/**
 * This file is intentionally a thin integration point.
 *
 * In production, instantiate the GitHub Copilot SDK server-side using the
 * signed-in user's GitHub token.
 *
 * Example shape:
 *
 *   import { CopilotClient } from "@github/copilot-sdk";
 *   const client = new CopilotClient({
 *     githubToken: userGithubToken,
 *     useLoggedInUser: false,
 *   });
 *
 * Then expose product-specific endpoints or server actions that proxy only the
 * allowed Copilot operations for that user.
 */

export function canUseCopilot(): boolean {
  return process.env.COPILOT_ENABLED === "1";
}
