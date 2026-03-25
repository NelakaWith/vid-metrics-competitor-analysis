# VidMetrics 🔬 YouTube Competitor Analyzer

Paste any YouTube channel URL and instantly see which videos are crushing it. Built for content teams who need fast, data-driven competitor intelligence without leaving the browser.

## What it does

- Accepts any YouTube channel URL format — `@Handle`, `/channel/UCxxx`, `/c/CustomName`
- Fetches videos published within a selectable date window: **This Month**, **Last 30 Days**, or **Last 7 Days**
- Returns per-video metrics: views, likes, comments, duration, and thumbnail
- Stops fetching as soon as videos fall outside the window — no wasted API quota

## Tech Stack

| Layer     | Choice                  |
| --------- | ----------------------- |
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript              |
| Styling   | Tailwind CSS v4         |
| Data      | YouTube Data API v3     |
| Runtime   | Node.js / Vercel Edge   |

## Project Structure

```
app/
  api/analyze/route.ts      # POST endpoint — orchestrates the API chain
  lib/
    youtube-url-parser.ts   # Parses any channel URL into a typed identifier
    youtube-api.ts          # YouTube Data API v3 helpers (channel + video fetch)
  page.tsx                  # UI (test harness now, full dashboard in Phase 2)
docs/
  roadmap.md                # Phased build plan
```

## Getting Started

### 1. Get a YouTube Data API v3 key

Create a key at [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials. Enable the **YouTube Data API v3** on the project.

> **Key restriction:** Set to _None_ (or _IP addresses_) — **not** HTTP referrers. The API is called server-side and sends no `Referer` header.

### 2. Add your key to `.env`

```bash
YOUTUBE_API_KEY=your_key_here
```

### 3. Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), paste a channel URL, pick a date range, and hit **Analyze**.

## API

### `POST /api/analyze`

**Request body:**

```json
{
  "channelUrl": "https://youtube.com/@mkbhd",
  "dateRange": "this_month"
}
```

| Field        | Type   | Required | Values                                                                |
| ------------ | ------ | -------- | --------------------------------------------------------------------- |
| `channelUrl` | string | ✅       | Any YouTube channel URL or `@handle`                                  |
| `dateRange`  | string | ❌       | `this_month` · `last_30_days` · `last_7_days` (default: `this_month`) |

**Response:**

```json
{
  "channel": {
    "channelId": "UCBJycsmduvYEL83R_U4JriQ",
    "title": "Marques Brownlee",
    "subscriberCount": 20800000,
    "uploadsPlaylistId": "UUBJycsmduvYEL83R_U4JriQ"
  },
  "videos": [
    {
      "videoId": "abc123",
      "title": "Video Title",
      "publishedAt": "2026-03-01T12:00:00Z",
      "thumbnailUrl": "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
      "viewCount": 1200000,
      "likeCount": 45000,
      "commentCount": 3200,
      "duration": "PT12M30S"
    }
  ],
  "dateRange": "this_month",
  "publishedAfter": "2026-03-01T00:00:00.000Z"
}
```

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) for the full phased plan.

- **Phase 1** ✅ — API integration layer (URL parser, YouTube API chain, `/api/analyze` route)
- **Phase 2** — Enterprise SaaS dashboard (charts, video cards, trending badges)
- **Phase 3** — CSV export, shareable links, AI content summary
- **Phase 4** — Docs and demo
