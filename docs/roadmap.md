# 🚀 Project Roadmap: VidMetrics Competitor Analyzer

## Phase 1: The Core Engine _(Friday - Technical Foundation)_

**Goal:** Convert a YouTube URL into a list of video data.

### Project Scaffolding

- Initialize Next.js 14+ (App Router), TypeScript, and Tailwind CSS
- Install Shadcn/UI components (Card, Button, Input, Table, Badge)
- Setup Lucide-React for iconography

### API Integration Layer

- Create a `/api/analyze` route
- **Agent Task:** Write a utility to parse YouTube Channel URLs (Handle vs. ID vs. Custom URL)
- **Agent Task:** Implement the YouTube Data API v3 flow:
  - `search.list` to find Channel ID from Handle
  - `channels.list` to get the subscriber count and "uploads" playlist ID
  - `playlistItems.list` to get the latest 50 video IDs
  - `videos.list` to get specific metrics (Views, Likes, Comments, Duration)

### Data Modeling

- Define an interface
- Calculate a "Performance Score" (e.g.)

---

## Phase 2: The "Vibe" UI _(Saturday - Visual Polish)_

**Goal:** Transform data into an Enterprise SaaS Dashboard.

### The "Crushing It" Dashboard

- **Hero Section:** High-impact search bar with loading states (Skeleton screens)
- **Top Stats Row:** Total Channel Views, Avg. Engagement, Growth Trend

### Data Visualization (The "Client Demo" Moment)

- Integrate Recharts or Tremor
- **Agent Task:** Build a bar chart showing "Views per Video" for the last 30 days
- **Agent Task:** Build a scatter plot: "Video Length vs. Engagement"

### The Intelligent List

- Render video cards with thumbnails
- Add "Trending" badges (e.g., if a video has > 2x the channel's average views)
- Implement sorting (Newest, Most Viewed, Highest Engagement)

---

## Phase 3: Enterprise Features _(Sunday - The "Extra Mile")_

**Goal:** Add the features that win the contract.

### Export & Sharing

- **Agent Task:** Implement a CSV export utility for the video list
- Add a "Copy Report Link" button (sharable URL with the channel ID)

### Product Thinking Add-ons

- Thumbnail Previewer: Hover to see the full-size thumbnail
- AI Summary: (Optional) Use a Gemini/GPT prompt to summarize the competitor's content strategy based on the top 5 video titles

### Deployment & Final Polish

- Deploy to Vercel
- Optimize for Mobile (Responsive grid)
- Check for Dark/Light mode consistency

---

## Phase 4: The Narrative _(Monday Morning)_

**Goal:** Document and Present.

### README Generation

- Document the AI-assisted workflow
- Explain the "Engagement Score" logic

### Loom Scripting

- Outline the demo: Problem → Solution → Technical Deep Dive → Vision for V2
