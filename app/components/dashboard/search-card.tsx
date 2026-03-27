"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  YoutubeIcon,
  Search01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type DateRange = "this_month" | "last_30_days" | "last_7_days";

export const DATE_RANGE_OPTIONS: { key: DateRange; label: string }[] = [
  { key: "this_month", label: "This month" },
  { key: "last_30_days", label: "Last 30 days" },
  { key: "last_7_days", label: "Last 7 days" },
];

interface Props {
  channelUrl: string;
  onChannelUrlChange: (url: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onSubmit: (urlOverride?: string) => void;
  loading: boolean;
}

export function SearchCard({
  channelUrl,
  onChannelUrlChange,
  dateRange,
  onDateRangeChange,
  onSubmit,
  loading,
}: Props) {
  return (
    <div className="mx-auto mb-10 max-w-2xl rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      {/* Date range pills */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        {DATE_RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onDateRangeChange(opt.key)}
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
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={YoutubeIcon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-9 pr-8"
            placeholder="https://youtube.com/@MrBeast"
            value={channelUrl}
            onChange={(e) => onChannelUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          />
          {channelUrl && (
            <button
              onClick={() => onChannelUrlChange("")}
              aria-label="Clear"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-muted p-0.5 text-muted-foreground transition-colors hover:bg-foreground/15 hover:text-foreground"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={14}
                color="currentColor"
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>
        <Button
          onClick={() => onSubmit()}
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
  );
}
