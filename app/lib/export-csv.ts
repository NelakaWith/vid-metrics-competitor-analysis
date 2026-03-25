import type { EnrichedVideo } from "./types";

/** Escape a value for safe CSV embedding (wrap in quotes, escape internal quotes). */
function csvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  "Title",
  "Published At",
  "Views",
  "Likes",
  "Comments",
  "Duration (s)",
  "Engagement Rate (%)",
  "Performance Score",
  "Trending",
  "URL",
];

/**
 * Converts an array of enriched videos into a CSV string and triggers
 * a browser download. No external dependencies — pure DOM APIs.
 */
export function exportVideosCsv(
  videos: EnrichedVideo[],
  channelTitle: string,
): void {
  const rows = videos.map((v) => [
    csvCell(v.title),
    csvCell(v.publishedAt),
    csvCell(v.viewCount),
    csvCell(v.likeCount),
    csvCell(v.commentCount),
    csvCell(v.durationSeconds),
    csvCell(v.engagementRate.toFixed(2)),
    csvCell(v.performanceScore),
    csvCell(v.isTrending ? "Yes" : "No"),
    csvCell(`https://youtube.com/watch?v=${v.videoId}`),
  ]);

  const csv = [HEADERS.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeTitle = channelTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  a.href = url;
  a.download = `vidmetrics_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
