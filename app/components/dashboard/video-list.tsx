"use client";

import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  EyeIcon,
  ThumbsUpIcon,
  Comment01Icon,
  Clock01Icon,
  SparklesIcon,
  Fire02Icon,
  SortByDown01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { fmtCount, fmtDuration, fmtDate, fmtPct } from "@/app/lib/format";
import type { EnrichedVideo } from "@/app/lib/types";

type SortKey = "newest" | "views" | "engagement" | "score";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "views", label: "Most Viewed" },
  { key: "engagement", label: "Highest Engagement" },
  { key: "score", label: "Best Score" },
];

function sortVideos(videos: EnrichedVideo[], key: SortKey): EnrichedVideo[] {
  return [...videos].sort((a, b) => {
    switch (key) {
      case "newest":
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      case "views":
        return b.viewCount - a.viewCount;
      case "engagement":
        return b.engagementRate - a.engagementRate;
      case "score":
        return b.performanceScore - a.performanceScore;
    }
  });
}

/** Score badge colour: green ≥70, yellow ≥40, red <40 */
function scoreBadgeClass(score: number): string {
  if (score >= 70)
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  if (score >= 40) return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  return "bg-rose-500/15 text-rose-400 border-rose-500/20";
}

interface Props {
  videos: EnrichedVideo[];
}

export function VideoList({ videos }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const sorted = sortVideos(videos, sortKey);

  return (
    <div>
      {/* Sort controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
          <HugeiconsIcon
            icon={SortByDown01Icon}
            size={14}
            color="currentColor"
            strokeWidth={1.5}
          />
          Sort by
        </span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              sortKey === opt.key
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {sorted.length} video{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Video cards */}
      <div className="flex flex-col gap-3">
        {sorted.map((video) => (
          <a
            key={video.videoId}
            href={`https://youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex gap-4 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-border hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {/* Thumbnail */}
            <div className="group/thumb relative shrink-0 overflow-visible rounded-lg">
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                width={160}
                height={90}
                className="h-22.5 w-40 object-cover transition-transform duration-200 group-hover:scale-105"
                unoptimized
              />
              {/* Duration overlay */}
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] font-medium text-white">
                {fmtDuration(video.durationSeconds)}
              </span>
              <div className="pointer-events-none absolute left-0 top-0 z-20 hidden -translate-y-2 opacity-0 transition-all duration-200 ease-out md:block md:group-hover/thumb:translate-y-0 md:group-hover/thumb:opacity-100 md:group-focus-visible/thumb:translate-y-0 md:group-focus-visible/thumb:opacity-100">
                <div className="w-80 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl ring-1 ring-black/30 backdrop-blur-sm">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={video.thumbnailUrl}
                      alt={`${video.title} thumbnail preview`}
                      fill
                      className="object-cover"
                      sizes="320px"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-2 text-[11px] text-white/80">
                    <span className="truncate">Thumbnail Preview</span>
                    <span>{fmtCount(video.viewCount)} views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
              <div>
                {/* Badges */}
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  {video.isTrending && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-400 gap-1"
                    >
                      <HugeiconsIcon
                        icon={Fire02Icon}
                        size={10}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                      Trending
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={scoreBadgeClass(video.performanceScore)}
                  >
                    <HugeiconsIcon
                      icon={SparklesIcon}
                      size={10}
                      color="currentColor"
                      strokeWidth={1.5}
                    />
                    Score {video.performanceScore}
                  </Badge>
                </div>

                {/* Title */}
                <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
                  {video.title}
                </p>
              </div>

              {/* Stats row */}
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon
                    icon={EyeIcon}
                    size={12}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  {fmtCount(video.viewCount)}
                </span>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon
                    icon={ThumbsUpIcon}
                    size={12}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  {fmtCount(video.likeCount)}
                </span>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Comment01Icon}
                    size={12}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  {fmtCount(video.commentCount)}
                </span>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    size={12}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                  {fmtPct(video.engagementRate)} engagement
                </span>
                <span className="ml-auto">{fmtDate(video.publishedAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
