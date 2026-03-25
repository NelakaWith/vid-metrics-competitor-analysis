"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtCount, truncate } from "@/app/lib/format";
import type { EnrichedVideo } from "@/app/lib/types";

interface Props {
  videos: EnrichedVideo[];
}

interface TooltipPayload {
  payload: { title: string; views: number; trending: boolean };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 max-w-50 font-medium text-card-foreground">
        {d.title}
      </p>
      <p className="text-muted-foreground">
        {fmtCount(d.views)}{" "}
        <span className="text-foreground font-semibold">views</span>
      </p>
      {d.trending && (
        <p className="mt-0.5 text-amber-400 font-medium">🔥 Trending</p>
      )}
    </div>
  );
}

export function ViewsBarChart({ videos }: Props) {
  // Show up to 25 videos, oldest → newest (left → right) for trend context
  const chartData = [...videos]
    .reverse()
    .slice(-25)
    .map((v) => ({
      shortTitle: truncate(v.title, 18),
      title: v.title,
      views: v.viewCount,
      trending: v.isTrending,
    }));

  const avgViews =
    chartData.reduce((s, v) => s + v.views, 0) / (chartData.length || 1);

  return (
    <Card className="flex h-full flex-col border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Views per Video
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0 pb-4">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 8, bottom: 60 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="shortTitle"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickFormatter={fmtCount}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              width={44}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            />
            <Bar dataKey="views" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  // Trending videos stand out in amber; above-avg in indigo; below-avg muted
                  fill={
                    entry.trending
                      ? "#f59e0b"
                      : entry.views >= avgViews
                        ? "#818cf8"
                        : "var(--muted-foreground)"
                  }
                  opacity={entry.views >= avgViews ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center gap-4 px-6 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]" />
            Trending (2× avg)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#818cf8]" />
            Above average
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground opacity-50" />
            Below average
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
