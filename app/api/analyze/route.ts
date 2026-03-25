/**
 * POST /api/analyze
 *
 * Accepts a JSON body: { "channelUrl": "<YouTube channel URL or handle>" }
 *
 * Runs the four-step YouTube Data API v3 chain:
 *  1. Parse URL  → channel identifier
 *  2. Resolve    → canonical Channel ID
 *  3. Channel    → metadata + uploads playlist
 *  4. Playlist   → latest 50 video IDs
 *  5. Videos     → per-video metrics
 *
 * Returns 200 with { channel, videos } on success,
 * or 400 / 500 with { error } on failure.
 */

import { NextRequest } from "next/server";
import { parseYouTubeChannelUrl } from "@/app/lib/youtube-url-parser";
import {
  resolveChannelId,
  fetchChannelInfo,
  fetchLatestVideoIds,
  fetchVideoMetrics,
} from "@/app/lib/youtube-api";

export async function POST(request: NextRequest) {
  // ── Parse request body ──────────────────────────────────────────────────
  let channelUrl: string;
  try {
    const body = await request.json();
    channelUrl = body?.channelUrl;
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

    // Step 2 — Resolve to a canonical Channel ID (may call search.list or channels.list)
    const channelId = await resolveChannelId(parsed);

    // Step 3 — Fetch channel metadata + uploads playlist ID
    const channelInfo = await fetchChannelInfo(channelId);

    // Step 4 — Retrieve the latest 50 video IDs from the uploads playlist
    const videoIds = await fetchLatestVideoIds(channelInfo.uploadsPlaylistId);

    // Step 5 — Batch-fetch metrics for all retrieved videos
    const videos = await fetchVideoMetrics(videoIds);

    return Response.json({ channel: channelInfo, videos });
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
