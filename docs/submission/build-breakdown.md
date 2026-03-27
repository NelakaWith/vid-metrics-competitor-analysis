# Build Breakdown

## How Long It Took

The full MVP was built over a single weekend sprint — roughly **2 days** from a blank repo to a deployed, demo-ready product.

| Phase                                      | Time Estimate | What Happened                                    |
| ------------------------------------------ | ------------- | ------------------------------------------------ |
| Project scaffolding & API wiring           | ~3 hrs        | Next.js setup, YouTube API chain, URL parser     |
| Data modeling & scoring logic              | ~1.5 hrs      | Types, enrichment, performance score formula     |
| Dashboard UI (all components)              | ~4 hrs        | Hero, search card, stats row, charts, video list |
| Polish — dark mode, skeletons, CSV export  | ~1.5 hrs      | Loading states, theme toggle, export utility     |
| Shareable URLs, error handling, responsive | ~1 hr         | Query params, mobile layout tweaks               |
| Deployment & env configuration             | ~30 min       | Netlify, API key, domain                         |

---

## Tools, Frameworks & AI Products Used

### Core Stack

| Layer           | Choice                      | Why                                                                             |
| --------------- | --------------------------- | ------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router)     | Server-side API routes keep the YouTube API key secure; fast page loads via RSC |
| Language        | TypeScript                  | Catches integration bugs at compile time, especially around API response shapes |
| Styling         | Tailwind CSS v4 + shadcn/ui | Fastest path from zero to polished SaaS-looking UI without a design system      |
| Charts          | Recharts 3                  | Lightweight, composable, works well with Tailwind color tokens                  |
| Icons           | @hugeicons/react            | Consistent, modern icon set with stroke-weight control                          |
| Data            | YouTube Data API v3         | Official — reliable rate limits, granular video metrics                         |
| Package manager | pnpm                        | Faster installs, strict dependency resolution                                   |
| Deployment      | Netlify                     | Simple Next.js deploys, env var management via Netlify dashboard                |

### AI Tools

| Tool                                   | How It Was Used                                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Copilot (Claude Sonnet 4.6)** | Primary coding assistant — component scaffolding, API integration boilerplate, TypeScript types, utility functions, and code iteration |
| **Gemini**                             | Used for upfront planning — reasoning through the YouTube API 5-step chain design, performance scoring formula, and feature scoping    |

---

## What Was Automated, Accelerated, or Simplified

### Automated

- **YouTube URL parsing** — wrote the parser once with AI assistance; it handles all 4 URL formats (`@handle`, `/channel/UCxxx`, `/c/custom`, `/user/name`) with a typed discriminated union output, zero manual regex trial-and-error
- **CSV export** — generated entirely via AI with correct RFC 4180 escaping (quoted fields, internal quote doubling), no external library needed
- **TypeScript interface generation** — API response shapes typed from YouTube Data API v3 docs in seconds rather than manually reading JSON

### Accelerated

- **shadcn/ui component wiring** — AI handled the boilerplate of integrating Card, Badge, Button, Input into the design system; only light customization needed
- **Recharts integration** — custom tooltip components, responsive container setup, and color theming via CSS variables scaffolded by AI, then fine-tuned manually
- **Skeleton loading states** — AI generated the full skeleton layout matching the real dashboard structure in one pass
- **Performance score formula** — AI helped reason through the weighted ratio approach and the 2× clamping to handle viral outliers

### Simplified

- **API error handling** — rather than writing verbose try/catch chains, a thin `apiFetch` wrapper was designed with AI and reused across all 4 API calls
- **Date cutoff logic** — the `resolveDateCutoff` function that handles "this month" (calendar boundary) vs "last 30 days" (rolling window) edge cases was designed collaboratively

---

## Development Approach

The build followed the phased roadmap in `docs/roadmap.md`:

1. **API first** — built and tested the `/api/analyze` route end-to-end before touching the UI. This meant no mocking and no surprises when wiring the frontend.
2. **Data model before components** — defined `EnrichedVideo`, `ChannelInfo`, and `AnalysisResult` types upfront. Every component receives typed props, no `any` in the codebase.
3. **Component isolation** — each dashboard widget (stats row, bar chart, scatter plot, video list) is a standalone component with defined props. Makes iteration fast and changes local.
4. **Progressive enhancement** — the app is fully functional without JavaScript for the initial render; interactivity (sort, theme toggle, CSV export) layers on top.
