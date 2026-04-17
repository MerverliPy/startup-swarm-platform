import { listSwarmRuns, type SwarmRun } from "@/lib/api";

export type StoredRun = SwarmRun;

/**
 * Compatibility shim for older imports.
 * Product-authoritative run persistence lives behind the API-backed swarm routes.
 */
export async function saveRun(_run: StoredRun) {
  throw new Error("saveRun is deprecated. Persist runs through the API swarm routes.");
}

export async function listRuns(): Promise<StoredRun[]> {
  return listSwarmRuns();
}
