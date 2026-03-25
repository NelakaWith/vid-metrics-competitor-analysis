/**
 * Performance scoring & enrichment utilities.
 *
 * Takes raw VideoMetrics from the YouTube API and produces EnrichedVideo[]
 * plus ChannelStats — everything the dashboard needs without any API calls.
 */

import type {
  VideoMetrics,
  ChannelInfo,
  EnrichedVideo,
  AnalysisResult,
} from "./types";

// ── ISO 8601 duration parser ───────────────────────────────────────────────────

/**
 * Convert an ISO 8601 duration string (e.g. "PT14M32S") to total seconds.
 * Handles hours, minutes, and seconds. Returns 0 for unrecognized strings.
 */
export function parseDurationSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h = "0", m = "0", s = "0"] = match;
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
}

// ── Per-video engagement rate ─────────────────────────────────────────────────

/**
 * Engagement rate as a percentage: (likes + comments) / views × 100.
 * Industry benchmark is ~3–6% for healthy channels.
 */
function calcEngagementRate(video: VideoMetrics): number {
  if (video.viewCount === 0) return 0;
  return ((video.likeCount + video.commentCount) / video.viewCount) * 100;
}

// ── Performance Score formula ─────────────────────────────────────────────────

/**
 * Scores each video 0–100 relative to the channel's own averages.
 *
 * Formula (weighted sum normalized to 100):
 *   60% — view ratio:        video views / channel avg views
 *   40% — engagement ratio:  video engagement rate / channel avg engagement rate
 *
 * Both ratios are clamped at 2× to prevent viral outliers from collapsing
 * every other score to near-zero (max raw score = 0.6×2 + 0.4×2 = 2.0 → 100).
 *
 * A video exactly at channel average scores 50.
 */
function calcPerformanceScore(
  viewRatio: number,
  engagementRatio: number,
): number {
  const clamp = (v: number) => Math.min(v, 2); // cap at 2× average
  const raw = 0.6 * clamp(viewRatio) + 0.4 * clamp(engagementRatio);
  // Map [0, 2] → [0, 100]
  return Math.round((raw / 2) * 100);
}

// ── Main enrichment function ──────────────────────────────────────────────────

/**
 * Enrich raw video metrics with computed fields and compute channel-level stats.
 * Returns the full AnalysisResult payload ready for the UI.
 */
export function enrichVideos(
  channel: ChannelInfo,
  videos: VideoMetrics[],
  dateRange: string,
  publishedAfter: string,
): AnalysisResult {
  if (videos.length === 0) {
    return {
      channel,
      videos: [],
      dateRange,
      publishedAfter,
      stats: {
        totalViews: 0,
        avgViews: 0,
        avgEngagementRate: 0,
        topVideoId: "",
      },
    };
  }

  // ── Pass 1: compute per-video base metrics ─────────────────────────────────
  const base = videos.map((v) => ({
    ...v,
    durationSeconds: parseDurationSeconds(v.duration),
    engagementRate: calcEngagementRate(v),
  }));

  // ── Channel averages (used for relative scoring) ───────────────────────────
  const totalViews = base.reduce((sum, v) => sum + v.viewCount, 0);
  const avgViews = totalViews / base.length;
  const avgEngagementRate =
    base.reduce((sum, v) => sum + v.engagementRate, 0) / base.length;

  // ── Pass 2: score each video relative to channel averages ──────────────────
  const enriched: EnrichedVideo[] = base.map((v) => {
    const viewRatio = avgViews > 0 ? v.viewCount / avgViews : 0;
    const engagementRatio =
      avgEngagementRate > 0 ? v.engagementRate / avgEngagementRate : 0;

    return {
      ...v,
      performanceScore: calcPerformanceScore(viewRatio, engagementRatio),
      // "Trending" = views ≥ 2× the channel average for this window
      isTrending: v.viewCount >= avgViews * 2,
    };
  });

  // ── Top video (highest performance score) ──────────────────────────────────
  const topVideo = enriched.reduce((best, v) =>
    v.performanceScore > best.performanceScore ? v : best,
  );

  return {
    channel,
    videos: enriched,
    dateRange,
    publishedAfter,
    stats: {
      totalViews,
      avgViews: Math.round(avgViews),
      avgEngagementRate: Math.round(avgEngagementRate * 100) / 100, // 2 dp
      topVideoId: topVideo.videoId,
    },
  };
}
