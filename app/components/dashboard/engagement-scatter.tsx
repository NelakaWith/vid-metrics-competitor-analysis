"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDuration, fmtPct, truncate } from "@/app/lib/format";
import type { EnrichedVideo } from "@/app/lib/types";

interface Props {
  videos: EnrichedVideo[];
}

interface TooltipPayload {
  payload: ScatterPoint;
}

interface ScatterPoint {
  durationMins: number;
  engagement: number;
  title: string;
  trending: boolean;
  durationSeconds: number;
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
        Duration:{" "}
        <span className="text-foreground font-semibold">
          {fmtDuration(d.durationSeconds)}
        </span>
      </p>
      <p className="text-muted-foreground">
        Engagement:{" "}
        <span className="text-foreground font-semibold">
          {fmtPct(d.engagement)}
        </span>
      </p>
      {d.trending && (
        <p className="mt-0.5 text-amber-400 font-medium">🔥 Trending</p>
      )}
    </div>
  );
}

export function EngagementScatter({ videos }: Props) {
  // Filter out Shorts (< 60s) for the scatter since they skew the axis heavily
  const chartData: ScatterPoint[] = videos
    .filter((v) => v.durationSeconds >= 60)
    .map((v) => ({
      durationMins: Math.round((v.durationSeconds / 60) * 10) / 10,
      engagement: Math.round(v.engagementRate * 100) / 100,
      title: truncate(v.title, 40),
      trending: v.isTrending,
      durationSeconds: v.durationSeconds,
    }));

  const avgEngagement =
    videos.reduce((s, v) => s + v.engagementRate, 0) / (videos.length || 1);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Video Length vs. Engagement
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Shorts (&lt;60s) excluded
        </p>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 8, right: 20, left: 8, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="durationMins"
              name="Duration (min)"
              unit="m"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              label={{
                value: "Duration (mins)",
                position: "insideBottom",
                offset: -12,
                fontSize: 10,
                fill: "var(--muted-foreground)",
              }}
            />
            <YAxis
              type="number"
              dataKey="engagement"
              name="Engagement"
              unit="%"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              width={44}
            />
            {/* Horizontal reference line at channel avg engagement */}
            <ReferenceLine
              y={Math.round(avgEngagement * 100) / 100}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{
                value: "avg",
                position: "insideTopRight",
                fontSize: 9,
                fill: "var(--muted-foreground)",
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Scatter
              data={chartData}
              // Color each dot: trending = amber, high engagement = indigo, rest = muted
              shape={(props: {
                cx?: number;
                cy?: number;
                payload?: ScatterPoint;
              }) => {
                const { cx = 0, cy = 0, payload } = props;
                const color = payload?.trending
                  ? "#f59e0b"
                  : (payload?.engagement ?? 0) >= avgEngagement
                    ? "#818cf8"
                    : "#6b7280";
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={color}
                    fillOpacity={0.8}
                    stroke={color}
                    strokeWidth={1}
                  />
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center gap-4 px-6 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
            Trending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#818cf8]" />
            Above avg engagement
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#6b7280]" />
            Below avg engagement
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
