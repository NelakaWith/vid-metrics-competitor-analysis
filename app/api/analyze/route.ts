/**
 * POST /api/analyze
 *
 * Accepts a JSON body:
 *   {
 *     "channelUrl": "<YouTube channel URL or handle>",
 *     "dateRange": "this_month" | "last_30_days" | "last_7_days"  // optional, default: "this_month"
 *   }
 *
 * Runs the four-step YouTube Data API v3 chain:
 *  1. Parse URL  → channel identifier
 *  2. Resolve    → canonical Channel ID
 *  3. Channel    → metadata + uploads playlist
 *  4. Playlist   → video IDs published within the requested date window
 *  5. Videos     → per-video metrics
 *
 * Returns 200 with { channel, videos, dateRange, publishedAfter } on success,
 * or 400 / 500 with { error } on failure.
 */

import { NextRequest } from "next/server";
import { parseYouTubeChannelUrl } from "@/app/lib/youtube-url-parser";
import {
  resolveChannelId,
  fetchChannelInfo,
  fetchVideoIdsSince,
  fetchVideoMetrics,
  resolveDateCutoff,
  type DateRangePreset,
} from "@/app/lib/youtube-api";

const VALID_DATE_RANGES: DateRangePreset[] = [
  "this_month",
  "last_30_days",
  "last_7_days",
];

export async function POST(request: NextRequest) {
  // ── Parse request body ───────────────────────────────────────
  let channelUrl: string;
  let dateRange: DateRangePreset;
  try {
    const body = await request.json();
    channelUrl = body?.channelUrl;
    // Default to "this_month" if not provided or invalid
    dateRange = VALID_DATE_RANGES.includes(body?.dateRange)
      ? body.dateRange
      : "this_month";
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (!channelUrl || typeof channelUrl !== "string") {
    return Response.json(
      { error: 'Missing required field "channelUrl".' },
      { status: 400 },
    );
  }

  try {
    // Step 1 — Parse the URL into a typed identifier
    const parsed = parseYouTubeChannelUrl(channelUrl);

    // Step 2 — Resolve to a canonical Channel ID
    const channelId = await resolveChannelId(parsed);

    // Step 3 — Fetch channel metadata + uploads playlist ID
    const channelInfo = await fetchChannelInfo(channelId);

    // Step 4 — Resolve the date cutoff and fetch only videos within the window
    const publishedAfter = resolveDateCutoff(dateRange);
    const videoIds = await fetchVideoIdsSince(
      channelInfo.uploadsPlaylistId,
      publishedAfter,
    );

    // Step 5 — Batch-fetch metrics for all retrieved videos
    const videos = await fetchVideoMetrics(videoIds);

    return Response.json({
      channel: channelInfo,
      videos,
      // Echo back what was used so the UI can display it
      dateRange,
      publishedAfter: publishedAfter.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";

    // Distinguish user-facing 400 errors (bad URL) from internal 500 errors
    const isClientError =
      message.startsWith("Invalid YouTube") ||
      message.startsWith("No channel found");

    return Response.json(
      { error: message },
      { status: isClientError ? 400 : 500 },
    );
  }
}
