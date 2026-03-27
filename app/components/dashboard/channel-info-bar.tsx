"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  YoutubeIcon,
  Csv01Icon,
  LinkSquare01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { fmtCount } from "@/app/lib/format";
import { exportVideosCsv } from "@/app/lib/export-csv";
import type { ChannelInfo, EnrichedVideo } from "@/app/lib/types";
import { DATE_RANGE_OPTIONS, type DateRange } from "./search-card";

interface Props {
  channel: ChannelInfo;
  videos: EnrichedVideo[];
  videoCount: number;
  dateRange: DateRange;
}

export function ChannelInfoBar({
  channel,
  videos,
  videoCount,
  dateRange,
}: Props) {
  const rangeLabel =
    DATE_RANGE_OPTIONS.find((o) => o.key === dateRange)?.label ?? dateRange;

  const [copied, setCopied] = useState(false);

  function copyReportLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-3">
      <HugeiconsIcon
        icon={YoutubeIcon}
        size={20}
        color="#ff0000"
        strokeWidth={1.5}
      />
      <div>
        <p className="text-sm font-semibold">{channel.title}</p>
        <p className="text-xs text-muted-foreground">
          {fmtCount(channel.subscriberCount)} subscribers · {videoCount} videos
          analysed · {rangeLabel}
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={copyReportLink}
          aria-label="Copy report link"
          className="flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <HugeiconsIcon
            icon={copied ? Tick01Icon : LinkSquare01Icon}
            size={13}
            color="currentColor"
            strokeWidth={1.5}
          />
          {copied ? "Copied!" : "Copy Link"}
        </button>

        <button
          onClick={() => exportVideosCsv(videos, channel.title)}
          aria-label="Export CSV"
          className="flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <HugeiconsIcon
            icon={Csv01Icon}
            size={13}
            color="currentColor"
            strokeWidth={1.5}
          />
          Export CSV
        </button>
      </div>
    </div>
  );
}
