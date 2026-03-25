"use client";

import { useState } from "react";

type DateRange = "this_month" | "last_30_days" | "last_7_days";

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  this_month: "This month",
  last_30_days: "Last 30 days",
  last_7_days: "Last 7 days",
};

export default function Home() {
  const [channelUrl, setChannelUrl] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("this_month");
  const [result, setResult] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl, dateRange }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-8">
      <main className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight">
          VidMetrics — API Test
        </h1>

        {/* Date range selector */}
        <div className="flex gap-2">
          {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((key) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                dateRange === key
                  ? "bg-zinc-100 text-zinc-900"
                  : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              }`}
            >
              {DATE_RANGE_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Input + trigger */}
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm outline-none focus:border-zinc-400"
            placeholder="https://youtube.com/@MrBeast"
            value={channelUrl}
            onChange={(e) => setChannelUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTest()}
          />
          <button
            className="rounded-lg bg-zinc-100 px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-40"
            onClick={handleTest}
            disabled={loading || !channelUrl.trim()}
          >
            {loading ? "Loading…" : "Analyze"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-lg border border-red-700 bg-red-950 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* Raw JSON response */}
        {result && (
          <pre className="overflow-auto rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-xs leading-5">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </main>
    </div>
  );
}
