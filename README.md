# VidMetrics — YouTube Competitor Analyzer

Paste any YouTube channel URL and instantly see which videos are crushing it. Built for content teams who need fast, data-driven competitor intelligence without leaving the browser.

---

## Features

- **Any URL format** — `@handle`, `/channel/UCxxx`, `/c/custom`, `/user/name`
- **Date range filtering** — This Month, Last 30 Days, Last 7 Days
- **Performance Score** — each video scored 0–100 relative to the channel's own averages (60% views weight + 40% engagement weight)
- **Trending detection** — videos with ≥ 2× the channel's average views are flagged
- **Enterprise dashboard** — Stats row, Views bar chart, Length vs. Engagement scatter plot, sortable video card list
- **Dark / Light mode** — persisted to `localStorage`
- **CSV export** — one-click download of the full analysed video list
- **Skeleton loading states** — no layout shift while data loads

---

## Tech Stack

| Layer     | Choice                      |
| --------- | --------------------------- |
| Framework | Next.js 16 (App Router)     |
| Language  | TypeScript                  |
| Styling   | Tailwind CSS v4 + shadcn/ui |
| Charts    | Recharts 3                  |
| Icons     | @hugeicons/react            |
| Data      | YouTube Data API v3         |
| Runtime   | Node.js / Vercel Edge       |

---

## Project Structure

```
app/
  api/
    analyze/route.ts              # POST /api/analyze — orchestrates the full API chain
  components/
    dashboard/
      channel-info-bar.tsx        # Channel summary bar + CSV export button
      dashboard-skeleton.tsx      # Animated loading skeleton
      engagement-scatter.tsx      # Scatter plot: video length vs. engagement rate
      hero.tsx                    # Hero / tagline section
      search-card.tsx             # Date range picker + URL input
      stats-row.tsx               # Top stats cards (views, engagement, subs, score)
      video-list.tsx              # Sortable video card list with badges
      views-bar-chart.tsx         # Bar chart: views per video
    layout/
      header.tsx                  # Sticky top bar with branding + theme toggle
  contexts/
    theme-provider.tsx            # Dark/light theme context (localStorage-backed)
  lib/
    export-csv.ts                 # CSV export utility
    format.ts                     # Number / date / duration formatting helpers
    scoring.ts                    # Performance score & enrichment logic
    types.ts                      # Shared TypeScript interfaces
    youtube-api.ts                # YouTube Data API v3 fetch helpers
    youtube-url-parser.ts         # Parses any channel URL into a typed identifier
  page.tsx                        # Root page — state + layout composition
docs/
  roadmap.md                      # Phased build plan
```

---

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

---

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
      "duration": "PT12M30S",
      "durationSeconds": 750,
      "engagementRate": 4.02,
      "performanceScore": 78,
      "isTrending": true
    }
  ],
  "dateRange": "this_month",
  "publishedAfter": "2026-03-01T00:00:00.000Z",
  "stats": {
    "totalViews": 8400000,
    "avgViews": 600000,
    "avgEngagementRate": 3.5,
    "topVideoId": "abc123"
  }
}
```

---

## Performance Score

Each video is scored **0–100** relative to the channel's own averages for the selected window:

```
score = (0.6 × viewRatio + 0.4 × engagementRatio) / 2 × 100
```

- `viewRatio` = video views ÷ channel avg views (capped at 2×)
- `engagementRatio` = video engagement rate ÷ channel avg engagement rate (capped at 2×)

A video exactly at the channel average scores **50**. A video at 2× average on both metrics scores **100**.

---

## YouTube Data API v3 — Endpoints Used

| Step | Endpoint                                          | Purpose                                      |
| ---- | ------------------------------------------------- | -------------------------------------------- |
| 1a   | `channels?forHandle=`                             | Resolve `@handle` → Channel ID               |
| 1b   | `search?type=channel&q=`                          | Fallback for custom/user URLs                |
| 2    | `channels?part=snippet,statistics,contentDetails` | Title, subscriber count, uploads playlist ID |
| 3    | `playlistItems?part=contentDetails&playlistId=`   | Paginated video IDs, stops at date cutoff    |
| 4    | `videos?part=snippet,statistics,contentDetails`   | Per-video metrics (batched, 50 per request)  |

---

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) for the full phased plan.

- **Phase 1** ✅ — API integration layer (URL parser, YouTube API chain, `/api/analyze` route)
- **Phase 2** ✅ — Enterprise SaaS dashboard (charts, video cards, trending badges)
- **Phase 3** ✅ — CSV export, shareable links, AI content summary
- **Phase 4** — Docs and demo
