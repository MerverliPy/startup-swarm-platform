"use client";

import { useState } from "react";

export default function CopilotSmokeButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  async function runSmokeTest() {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/copilot-smoke", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const text = await response.text();
      setResult(text);
    } catch (error) {
      setResult(
        JSON.stringify(
          {
            ok: false,
            error: error instanceof Error ? error.message : "Unknown fetch error",
          },
          null,
          2,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <button type="button" onClick={runSmokeTest} disabled={loading}>
        {loading ? "Running smoke test..." : "Run Copilot smoke test"}
      </button>

      {result ? (
        <pre
          style={{
            overflowX: "auto",
            background: "#111",
            color: "#eee",
            padding: 16,
          }}
        >
          {result}
        </pre>
      ) : null}
    </section>
  );
}
