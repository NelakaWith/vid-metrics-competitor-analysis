import { HugeiconsIcon } from "@hugeicons/react";
import {
  EyeIcon,
  ThumbsUpIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { fmtCount, fmtPct } from "@/app/lib/format";
import { cn } from "@/lib/utils";
import type { ChannelStats, ChannelInfo } from "@/app/lib/types";

interface Props {
  stats: ChannelStats;
  channel: ChannelInfo;
}

export function StatsRow({ stats, channel }: Props) {
  const items = [
    {
      label: "Total Views",
      value: fmtCount(stats.totalViews),
      sub: `avg ${fmtCount(stats.avgViews)} per video`,
      icon: EyeIcon,
      color: "text-blue-400",
    },
    {
      label: "Avg Engagement Rate",
      value: fmtPct(stats.avgEngagementRate),
      sub: "(likes + comments) ÷ views",
      icon: ThumbsUpIcon,
      color: "text-emerald-400",
    },
    {
      label: "Subscribers",
      value: fmtCount(channel.subscriberCount),
      sub: "total channel subscribers",
      icon: UserGroupIcon,
      color: "text-violet-400",
    },
    {
      label: "Performance Score",
      value: "0–100 relative",
      sub: "scored vs channel avg",
      icon: SparklesIcon,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-border/60">
          <CardContent className="flex items-start gap-3 p-5">
            <span className={cn("mt-0.5 shrink-0", item.color)}>
              <HugeiconsIcon
                icon={item.icon}
                size={20}
                strokeWidth={1.5}
                color="currentColor"
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {item.label}
              </p>
              <p className="text-xl font-semibold tracking-tight">
                {item.value}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {item.sub}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
