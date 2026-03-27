# VidMetrics — Submission Checklist

## ✅ Done

### Core Product

- [x] Next.js 16 (App Router) + TypeScript frontend
- [x] Tailwind CSS v4 + shadcn/ui styling
- [x] YouTube Data API v3 — full 5-step resolution chain (URL parse → channel ID → metadata → video IDs → metrics)
- [x] Channel URL input — supports all formats (`@handle`, `/channel/UCxxx`, `/c/custom`, `/user/name`)
- [x] Date range filtering — This Month / Last 30 Days / Last 7 Days
- [x] Video list with key metrics — views, likes, comments, duration, engagement rate, performance score
- [x] Sorting — Newest / Most Viewed / Highest Engagement / Best Score
- [x] Charts — Views per video (bar chart) + Video length vs. Engagement rate (scatter plot)
- [x] Trending indicators — 🔥 flag for videos with ≥ 2× channel average views
- [x] Performance scoring — 0–100 score per video relative to channel averages (60% views + 40% engagement)
- [x] Stats summary cards — total views, avg engagement, subscriber count, score legend
- [x] Channel info bar with avatar, handle, and subscriber count
- [x] CSV export — one-click download of full analysed video list
- [x] Skeleton loading states — no layout shift during data fetch
- [x] Dark / Light mode toggle — persisted to `localStorage`
- [x] Shareable URLs — `?channel=...&input=...` query params auto-updated on each analysis
- [x] Error handling — user-friendly messages for bad URLs and API failures

### Project & Delivery

- [x] Mobile responsive design
- [x] Deployed to public URL (Vercel)
- [x] GitHub repository — clean structure, organized by feature
- [x] README with full setup instructions, feature list, and project structure

---

## ❌ Remaining (Non-Code Deliverables)

- [ ] **Loom walkthrough** (5 min, camera on)
  - Cover: process, key decisions, tradeoffs, AI tool usage, what was prioritised and why
  - Set to "anyone with the link can view"

- [ ] **Written document** (Notion or PDF)
  - Build breakdown: time taken, tools/frameworks/AI products used, what was automated or accelerated
  - Product thinking: features you'd add with more time, what feels missing, v2 improvements
  - Set to "anyone with the link can view"

- [ ] **Salary expectations form** — complete and attach to submission email

- [ ] **Submission email** (reply in same thread) — include:
  - Live demo URL
  - GitHub repository link
  - Loom video link
  - Written document link (Notion or PDF)
  - Salary expectations form
