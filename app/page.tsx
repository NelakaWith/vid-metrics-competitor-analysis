"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  YoutubeIcon,
  Search01Icon,
  AnalyticsUpIcon,
  ChartIncreaseIcon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsRow } from "@/app/components/dashboard/stats-row";
import { ViewsBarChart } from "@/app/components/dashboard/views-bar-chart";
import { EngagementScatter } from "@/app/components/dashboard/engagement-scatter";
import { VideoList } from "@/app/components/dashboard/video-list";
import type { AnalysisResult } from "@/app/lib/types";
import { fmtCount } from "@/app/lib/format";

type DateRange = "this_month" | "last_30_days" | "last_7_days";

const DATE_RANGE_OPTIONS: { key: DateRange; label: string }[] = [
  { key: "this_month", label: "This month" },
  { key: "last_30_days", label: "Last 30 days" },
  { key: "last_7_days", label: "Last 7 days" },
];

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Stats row skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/50" />
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 h-64 rounded-xl bg-muted/50" />
        <div className="lg:col-span-2 h-64 rounded-xl bg-muted/50" />
      </div>
      {/* Video list skeleton */}
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [channelUrl, setChannelUrl] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("this_month");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!channelUrl.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl: channelUrl.trim(), dateRange }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={ChartIncreaseIcon}
              size={20}
              color="currentColor"
              strokeWidth={1.5}
              className="text-primary"
            />
            <span className="text-sm font-semibold tracking-tight">
              VidMetrics
            </span>
          </div>
          {result && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={YoutubeIcon}
                size={14}
                color="currentColor"
                strokeWidth={1.5}
              />
              <span className="font-medium text-foreground">
                {result.channel.title}
              </span>
              <span>·</span>
              <span>
                {fmtCount(result.channel.subscriberCount)} subscribers
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero section */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={AnalyticsUpIcon}
              size={12}
              color="currentColor"
              strokeWidth={1.5}
            />
            YouTube Competitor Intelligence
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Which videos are <span className="text-amber-400">crushing it</span>{" "}
            right now?
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Paste any competitor&apos;s YouTube channel URL to instantly see
            their top‑performing content.
          </p>
        </div>

        {/* Search card */}
        <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          {/* Date range pills */}
          <div className="mb-4 flex gap-2">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateRange(opt.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  dateRange === opt.key
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* URL input + button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <HugeiconsIcon
                icon={YoutubeIcon}
                size={16}
                color="currentColor"
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-9"
                placeholder="https://youtube.com/@MrBeast"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={loading || !channelUrl.trim()}
              className="gap-1.5"
            >
              <HugeiconsIcon
                icon={Search01Icon}
                size={14}
                color="currentColor"
                strokeWidth={2}
              />
              {loading ? "Analyzing…" : "Analyze"}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && <DashboardSkeleton />}

        {/* Dashboard */}
        {result && !loading && (
          <div className="flex flex-col gap-6">
            {/* Channel info bar */}
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-3">
              <HugeiconsIcon
                icon={YoutubeIcon}
                size={20}
                color="#ff0000"
                strokeWidth={1.5}
              />
              <div>
                <p className="text-sm font-semibold">{result.channel.title}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtCount(result.channel.subscriberCount)} subscribers ·{" "}
                  {result.videos.length} videos analysed ·{" "}
                  {DATE_RANGE_OPTIONS.find((o) => o.key === result.dateRange)
                    ?.label ?? result.dateRange}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <StatsRow stats={result.stats} channel={result.channel} />

            {/* Charts */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <ViewsBarChart videos={result.videos} />
              </div>
              <div className="lg:col-span-2">
                <EngagementScatter videos={result.videos} />
              </div>
            </div>

            {/* Video list */}
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">All Videos</h2>
              <VideoList videos={result.videos} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
            <HugeiconsIcon
              icon={AnalyticsUpIcon}
              size={40}
              color="currentColor"
              strokeWidth={1}
              className="opacity-20"
            />
            <p className="text-sm">
              Enter a YouTube channel URL above to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
