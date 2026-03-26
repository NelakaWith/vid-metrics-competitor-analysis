"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnalyticsUpIcon } from "@hugeicons/core-free-icons";
import { Header } from "@/app/components/layout/header";
import { Hero } from "@/app/components/dashboard/hero";
import {
  SearchCard,
  type DateRange,
} from "@/app/components/dashboard/search-card";
import { ChannelInfoBar } from "@/app/components/dashboard/channel-info-bar";
import { DashboardSkeleton } from "@/app/components/dashboard/dashboard-skeleton";
import { StatsRow } from "@/app/components/dashboard/stats-row";
import { ViewsBarChart } from "@/app/components/dashboard/views-bar-chart";
import { EngagementScatter } from "@/app/components/dashboard/engagement-scatter";
import { VideoList } from "@/app/components/dashboard/video-list";
import type { AnalysisResult } from "@/app/lib/types";

export default function Home() {
  const [channelUrl, setChannelUrl] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("this_month");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze(urlOverride?: string, displayInput?: string) {
    const requestUrl =
      typeof urlOverride === "string" ? urlOverride.trim() : channelUrl.trim();
    const originalInput =
      typeof displayInput === "string"
        ? displayInput.trim()
        : channelUrl.trim();
    if (!requestUrl) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUrl: requestUrl, dateRange }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      const analysisResult = {
        ...(data as AnalysisResult),
        input: originalInput || (data as AnalysisResult).input,
      };
      setResult(analysisResult);
      setChannelUrl(analysisResult.input);
      const nextParams = new URLSearchParams();
      nextParams.set("channel", analysisResult.channel.channelId);
      nextParams.set("input", analysisResult.input);
      window.history.replaceState(null, "", `/?${nextParams.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const channelId = params.get("channel");
    const input = params.get("input");
    if (channelId) {
      if (input) {
        setChannelUrl(input);
        handleAnalyze(channelId, input);
        return;
      }
      handleAnalyze(channelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header channel={result?.channel} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Hero />

        <SearchCard
          channelUrl={channelUrl}
          onChannelUrlChange={setChannelUrl}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onSubmit={handleAnalyze}
          loading={loading}
        />

        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        {loading && <DashboardSkeleton />}

        {result && !loading && (
          <div className="flex flex-col gap-6">
            <ChannelInfoBar
              channel={result.channel}
              videos={result.videos}
              videoCount={result.videos.length}
              dateRange={result.dateRange as DateRange}
            />

            <StatsRow stats={result.stats} channel={result.channel} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:items-stretch">
              <div className="lg:col-span-3">
                <ViewsBarChart videos={result.videos} />
              </div>
              <div className="lg:col-span-2">
                <EngagementScatter videos={result.videos} />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold">All Videos</h2>
              <VideoList videos={result.videos} />
            </div>
          </div>
        )}

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
