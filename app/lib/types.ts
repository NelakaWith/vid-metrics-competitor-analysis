/**
 * Shared data model for VidMetrics.
 *
 * These types flow from the YouTube API layer → scoring → UI.
 * Keep all interface definitions here so every layer imports from one place.
 */

// ── Raw API shapes ─────────────────────────────────────────────────────────────

export interface ChannelInfo {
  channelId: string;
  title: string;
  subscriberCount: number;
  /** The "UU…" playlist ID that holds every upload for this channel */
  uploadsPlaylistId: string;
}

export interface VideoMetrics {
  videoId: string;
  title: string;
  publishedAt: string; // ISO 8601
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  /** ISO 8601 duration string, e.g. "PT14M32S" */
  duration: string;
}

// ── Derived / enriched shapes ──────────────────────────────────────────────────

/**
 * A video enriched with computed fields that the UI and charts consume.
 */
export interface EnrichedVideo extends VideoMetrics {
  /** Duration converted to total seconds for easier sorting and scatter-plot X axis */
  durationSeconds: number;

  /**
   * Engagement rate = (likes + comments) / views × 100
   * Expressed as a percentage (e.g. 3.42).
   * Returns 0 when viewCount is 0 to avoid division by zero.
   */
  engagementRate: number;

  /**
   * 0–100 performance score relative to the channel's own average.
   * See scoring.ts for the full formula.
   */
  performanceScore: number;

  /** True when this video's views are ≥ 2× the channel average — used for the "Trending" badge */
  isTrending: boolean;
}

/**
 * The complete payload returned by /api/analyze and consumed by the dashboard.
 */
export interface AnalysisResult {
  channel: ChannelInfo;
  videos: EnrichedVideo[];
  /** Original user input used to start the analysis */
  input: string;
  /** Preset used for this analysis */
  dateRange: string;
  /** ISO 8601 timestamp of the earliest video included */
  publishedAfter: string;
  /** Channel-wide aggregates pre-computed for the Top Stats Row */
  stats: ChannelStats;
}

/**
 * Channel-level aggregates derived from the video set.
 */
export interface ChannelStats {
  totalViews: number;
  avgViews: number;
  avgEngagementRate: number;
  /** videoId of the single best-performing video in the window */
  topVideoId: string;
}
