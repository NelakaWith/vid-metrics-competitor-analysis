/**
 * YouTube Data API v3 — fetch helpers
 *
 * Implements the four-step chain described in the roadmap:
 *  1. search.list        → resolve Handle / custom name → Channel ID
 *  2. channels.list      → subscriber count + "uploads" playlist ID
 *  3. playlistItems.list → video IDs published after a given cutoff date
 *  4. videos.list        → per-video metrics (views, likes, comments, duration)
 *
 * Every function throws a descriptive Error on API failure so the
 * route handler can return a meaningful HTTP error to the client.
 */

import { ParsedChannel } from "./youtube-url-parser";
import type { ChannelInfo, VideoMetrics } from "./types";

const API_BASE = "https://www.googleapis.com/youtube/v3";

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Build a YouTube API URL with the given endpoint and query params. */
function buildUrl(endpoint: string, params: Record<string, string>): string {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set.");
  }
  const qs = new URLSearchParams({ ...params, key: apiKey });
  return `${API_BASE}/${endpoint}?${qs.toString()}`;
}

/** Thin fetch wrapper that throws on non-OK responses. */
async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    // Disable Next.js/Vercel data cache — responses change over time
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

// ── Step 1: resolve Channel ID ────────────────────────────────────────────────

/**
 * If the parsed input is already a direct channel ID, return it immediately.
 * For handles and custom names, call search.list to find the channel.
 */
export async function resolveChannelId(parsed: ParsedChannel): Promise<string> {
  // Direct ID — no API call needed
  if (parsed.type === "channel_id") {
    return parsed.value;
  }

  // Handles (@MrBeast) support a direct lookup via the "forHandle" parameter
  if (parsed.type === "handle") {
    const url = buildUrl("channels", {
      part: "id",
      forHandle: parsed.value,
      maxResults: "1",
    });
    const data = await apiFetch<{ items?: { id: string }[] }>(url);
    const channelId = data.items?.[0]?.id;
    if (!channelId) {
      throw new Error(`No channel found for handle "@${parsed.value}".`);
    }
    return channelId;
  }

  // Custom / legacy user URLs — fall back to search.list
  const url = buildUrl("search", {
    part: "snippet",
    type: "channel",
    q: parsed.value,
    maxResults: "1",
  });
  const data = await apiFetch<{
    items?: { id: { channelId: string } }[];
  }>(url);
  const channelId = data.items?.[0]?.id?.channelId;
  if (!channelId) {
    throw new Error(`No channel found for query "${parsed.value}".`);
  }
  return channelId;
}

// ── Step 2: channel metadata ──────────────────────────────────────────────────

/**
 * Fetch subscriber count and the "uploads" playlist ID for a channel.
 * The uploads playlist ID is always "UU" + the part after "UC" in channelId.
 */
export async function fetchChannelInfo(
  channelId: string,
): Promise<ChannelInfo> {
  const url = buildUrl("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelId,
  });

  const data = await apiFetch<{
    items?: {
      snippet: { title: string };
      statistics: { subscriberCount?: string };
      contentDetails: { relatedPlaylists: { uploads: string } };
    }[];
  }>(url);

  const item = data.items?.[0];
  if (!item) {
    throw new Error(`Channel not found for ID "${channelId}".`);
  }

  return {
    channelId,
    title: item.snippet.title,
    // subscriberCount is absent when the channel hides it
    subscriberCount: parseInt(item.statistics.subscriberCount ?? "0", 10),
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  };
}

// ── Date-range helpers ───────────────────────────────────────────────────────

export type DateRangePreset = "this_month" | "last_30_days" | "last_7_days";

/**
 * Returns the UTC midnight Date that marks the start of the requested window.
 *  - "this_month"   → 1st of the current calendar month, 00:00 UTC
 *  - "last_30_days" → exactly 30 days ago, 00:00 UTC
 *  - "last_7_days"  → exactly 7 days ago, 00:00 UTC
 */
export function resolveDateCutoff(preset: DateRangePreset): Date {
  const now = new Date();
  if (preset === "this_month") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  const days = preset === "last_7_days" ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  cutoff.setUTCHours(0, 0, 0, 0);
  return cutoff;
}

// ── Step 3: date-filtered video IDs ──────────────────────────────────────────

type PlaylistPage = {
  nextPageToken?: string;
  items?: { contentDetails: { videoId: string; videoPublishedAt: string } }[];
};

/**
 * Retrieve video IDs from the channel's uploads playlist that were published
 * on or after `publishedAfter`.
 *
 * Strategy: playlist items are ordered newest-first. We fetch pages of 50 and
 * stop as soon as we encounter a video older than the cutoff — no wasted quota.
 * Cap at `maxVideos` (default 50) to protect against channels that post daily.
 */
export async function fetchVideoIdsSince(
  uploadsPlaylistId: string,
  publishedAfter: Date,
  maxVideos = 50,
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      part: "contentDetails",
      playlistId: uploadsPlaylistId,
      maxResults: "50", // always fetch full pages; we filter below
    };
    if (pageToken) params.pageToken = pageToken;

    const page = await apiFetch<PlaylistPage>(
      buildUrl("playlistItems", params),
    );

    for (const item of page.items ?? []) {
      const published = new Date(item.contentDetails.videoPublishedAt);
      if (published < publishedAfter) {
        // All subsequent items will be even older — stop immediately
        return ids;
      }
      ids.push(item.contentDetails.videoId);
      if (ids.length >= maxVideos) return ids;
    }

    pageToken = page.nextPageToken;
  } while (pageToken);

  return ids;
}

// ── Step 4: per-video metrics ─────────────────────────────────────────────────

/**
 * Batch-fetch statistics and content details for up to 50 video IDs.
 * The YouTube API allows a comma-separated id list, so one request suffices.
 */
export async function fetchVideoMetrics(
  videoIds: string[],
): Promise<VideoMetrics[]> {
  if (videoIds.length === 0) return [];

  const url = buildUrl("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoIds.join(","),
    maxResults: "50",
  });

  const data = await apiFetch<{
    items?: {
      id: string;
      snippet: {
        title: string;
        publishedAt: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
      };
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
      contentDetails: { duration: string };
    }[];
  }>(url);

  return (data.items ?? []).map((item) => ({
    videoId: item.id,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
    // Prefer medium thumbnail; fall back to default
    thumbnailUrl:
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      "",
    viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
    likeCount: parseInt(item.statistics.likeCount ?? "0", 10),
    commentCount: parseInt(item.statistics.commentCount ?? "0", 10),
    duration: item.contentDetails.duration,
  }));
}
