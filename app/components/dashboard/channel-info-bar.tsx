import { HugeiconsIcon } from "@hugeicons/react";
import { YoutubeIcon } from "@hugeicons/core-free-icons";
import { fmtCount } from "@/app/lib/format";
import type { ChannelInfo } from "@/app/lib/types";
import { DATE_RANGE_OPTIONS, type DateRange } from "./search-card";

interface Props {
  channel: ChannelInfo;
  videoCount: number;
  dateRange: DateRange;
}

export function ChannelInfoBar({ channel, videoCount, dateRange }: Props) {
  const rangeLabel =
    DATE_RANGE_OPTIONS.find((o) => o.key === dateRange)?.label ?? dateRange;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-5 py-3">
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
    </div>
  );
}
