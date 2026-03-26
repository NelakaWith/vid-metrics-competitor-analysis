/**
 * YouTube Channel URL Parser
 *
 * Supports three URL formats:
 *  1. Handle  — youtube.com/@MrBeast
 *  2. Channel — youtube.com/channel/UCxxxxxx
 *  3. Custom  — youtube.com/c/SomeCustomName  (legacy)
 *
 * Returns a structured result indicating which format was detected
 * and the resolved identifier, so the caller knows how to look up
 * the real Channel ID via the API.
 */

export type ChannelInputType = "handle" | "channel_id" | "custom";

export interface ParsedChannel {
  type: ChannelInputType;
  /** The raw identifier extracted from the URL (or bare input). */
  value: string;
}

/**
 * Parse a YouTube channel URL (or bare identifier) into its component parts.
 *
 * @throws {Error} if the input cannot be recognised as a YouTube channel reference
 */
export function parseYouTubeChannelUrl(input: string): ParsedChannel {
  const trimmed = input.trim();

  // ── Handle bare Channel IDs (start with "UC" and are 24 chars) ────────────
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: "channel_id", value: trimmed };
  }

  // ── Handle bare handles (e.g. @MrBeast) ──────────────────────────────────
  if (trimmed.startsWith("@")) {
    return { type: "handle", value: trimmed.slice(1) }; // strip "@"
  }

  // ── Try to parse as a URL ─────────────────────────────────────────────────
  let url: URL;
  try {
    // Prepend scheme when it's missing so URL() can parse it
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    throw new Error(`Invalid YouTube channel URL or identifier: "${input}"`);
  }

  const { pathname } = url;
  const segments = pathname.split("/").filter(Boolean); // ["@MrBeast"] or ["channel","UCxxx"] etc.

  // youtube.com/@Handle
  if (segments[0]?.startsWith("@")) {
    return { type: "handle", value: segments[0].slice(1) };
  }

  // youtube.com/channel/UCxxxxxx
  if (segments[0] === "channel" && segments[1]) {
    return { type: "channel_id", value: segments[1] };
  }

  // youtube.com/c/CustomName  (legacy custom URL)
  if (segments[0] === "c" && segments[1]) {
    return { type: "custom", value: segments[1] };
  }

  // youtube.com/user/Username  (very old format — treat like custom)
  if (segments[0] === "user" && segments[1]) {
    return { type: "custom", value: segments[1] };
  }

  throw new Error(
    `Could not extract a channel identifier from: "${input}". ` +
      `Use a format like https://youtube.com/@Handle, ` +
      `https://youtube.com/channel/UCxxxxxx, or https://youtube.com/c/Name`,
  );
}
