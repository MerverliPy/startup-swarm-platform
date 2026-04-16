export type AiProvider = "copilot" | "openai";

export function getAiSettings() {
  const provider = (process.env.AI_PROVIDER || "copilot") as AiProvider;

  return {
    provider,
    cliUrl: process.env.CLI_URL || "copilot-cli:4321",
    copilotModel: process.env.COPILOT_MODEL || "gpt-4.1",
    openaiModel: process.env.OPENAI_MODEL || "gpt-4.1",
    openaiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    openaiApiKey: process.env.OPENAI_API_KEY || ""
  };
}
