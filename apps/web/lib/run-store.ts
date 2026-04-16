import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredRun = {
  run_id: string;
  status: "passed" | "failed" | "needs_approval";
  provider_used: "copilot" | "openai" | "deterministic_fallback";
  title: string;
  goal: string;
  constraints: string[];
  plan: string[];
  artifacts: Record<string, unknown>;
  attempts: Record<string, unknown>;
  created_at: string;
};

const DATA_DIR = path.join(process.cwd(), "data", "runs");

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function saveRun(run: StoredRun) {
  await ensureStore();
  const file = path.join(DATA_DIR, `${run.run_id}.json`);
  await writeFile(file, JSON.stringify(run, null, 2), "utf-8");
}

export async function listRuns(): Promise<StoredRun[]> {
  await ensureStore();
  const files = (await readdir(DATA_DIR))
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();

  const runs: StoredRun[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(DATA_DIR, file), "utf-8");
    runs.push(JSON.parse(raw) as StoredRun);
  }
  return runs;
}
