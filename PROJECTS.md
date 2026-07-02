# ThePuffer — Projects Reference

> **Why this file exists:** the tracker shows partner-friendly names, but the real
> code, repos and prod servers live elsewhere. This is the map so nobody has to
> re-search "what is Dehgo" or "where does Bloghead deploy" every session.
> **Last verified:** 2026-06-13.

---

## The tracker itself

| | |
|---|---|
| **Local repo** | `~/Developer/puffer-tracker` |
| **GitHub** | `github.com/ElSalvatore-sys/puffer-tracker` |
| **Live URL** | https://puffer-tracker-lake.vercel.app *(Vercel project `puffer-tracker`)* |
| **How it works** | Static `index.html` reads `./data.json`. Everything (%, hours, steps, roadmap, goals, feed) is computed from that one file. |
| **Deploy** | `git push` → Vercel auto-redeploys in ~15s. `vercel.json` disables caching on `data.json` so updates show instantly. |
| **Audience** | Non-technical partner. **All copy is plain language, no jargon** (no "migration", "trigger", "Stripe SDK" — say what changed and why it matters). |

### How to log a step
**Preferred (any agent/person): the [puffer-feed](https://github.com/ElSalvatore-sys/puffer-feed) MCP tool or CLI** — it funnels every write through one lock so concurrent writers can't clobber `data.json` (use the `log_step` MCP tool, or `puffer log <project> "<title>"`). **⚠️ Do NOT hand-edit `data.json` directly** — direct edits bypass the lock and can clobber a concurrent writer (this happened once). The screenshot agent must commit `shots/` via `write-core.commitPaths()`, not its own `git add`.

Legacy fallback (single-writer only):
```bash
node ~/Developer/puffer-tracker/log-step.mjs \
  --project <thebarapp|bloghead|dehgo|no1restaurant> \
  --title "<under 8 words>" --detail "<what changed, plain language>" \
  --mins <minutes> --status <done|prog|block> [--progress <0-100>] --push
```
One entry per **big** step (feature wired end-to-end, phase done, or a blocker). Use `block` only when waiting on something external; name the blocker in `--detail`.

### Dashboard data model (`data.json`)
- `projects.<key>` → `{ name, phase, accent, minor?, roadmap[], side?[], gallery[] }`
  - `roadmap[]` → `{ label, status: done|current|next|later }` — powers the milestone strip on cards **and** the "The plan" / "What's next" sections. Keep exactly **one** `current` per project. **Currently only Bloghead has a roadmap** (owner-defined ladder); Dehgo + TheBarApp roadmaps are pending owner-provided copy — drop them in the same shape.
  - `side[]` → small "on the side" chips (used on Bloghead: marketing, legal).
  - `gallery[]` → `{ src, caption }` screenshots. Empty = a clean "coming soon" tile renders. **Drop real screenshot URLs/paths here to fill it.**
- `weekHighlight` → `{ range, headlines[] }` — the top "This week" banner. `headlines[]` **auto-rotates** (~5.2s each, fade transition, click a dot to jump). Counts (steps shipped / projects moved) are auto-computed from the log. (A single `headline` string is still accepted for back-compat.)
- `log[]` → `{ id, project, title, detail, status, durationMin, ts, progressAfter }`. Next id continues from the current max (now **96**).

---

## Projects

> **Dashboard note:** TheBarApp + Dehgo (below) catch-up entries and roadmaps on the
> tracker are **pending owner-provided copy** — Ali will supply them. The "State" notes
> here are observed from the repos/commits for reference only, not pushed to the partner board.

### 1. TheBarApp  (tracker key: `thebarapp`, accent `#ff9d5c`)
- **What:** B2B SaaS hospitality-management platform for German venues (under ThePuffer / Oasis Technology, Wiesbaden). Pilot + only prod venue: **Das Wohnzimmer** (Pash Entertainment GmbH).
- **Repos:** canonical `~/Developer/thebarapp-mobile` (GitHub `ElSalvatore-sys/thebarapp-mobile`, holds **both** iOS + backend). Many sibling worktrees exist (`thebarapp-redesign`, `thebarapp-menu`, `thebarapp-bento-sweep`, etc.).
- **Prod:** Hetzner `91.98.230.232` (Tailscale `100.123.106.47`). Containers `thebarapp-backend-1` (FastAPI :8000) + `thebarapp-postgres-1` (Postgres+pgvector). DB `thebarapp_production`. Dashboard at `app.thebarapp.de` (Vercel). Public menu at `thebarapp-menu.vercel.app`.
- **Stack:** Swift 6.1 / SwiftUI (no ViewModels, @Observable + Swift Testing), bundle `com.ea.planetplate`. React/TS/Vite owner dashboard. AI: Gemini 2.5 Flash (OCR), Claude Haiku (Wozi bot).
- **State (Jun 13):** ~85%. Last 15 days shipped: P0 cross-tenant privacy fix (deployed prod), Speisekarten (digital menu) module P1+P2, Tageskasse (daily till) module, Wozi assistant confirm-gated actions, 6-month synthetic history so analytics show real numbers, Resend transactional email.
- **Gotchas:** `fb_recipes.venue_id` is a varchar UUID — query by UUID `a1b2c3d4-…`, not `WOZI2026`. Deploy only via the GitHub ghcr gate; **never `docker cp`**. TSE/KassenSichV is a legal blocker (no code). Full rules in `~/Downloads/CLAUDE.md` (TheBarApp).

### 2. Bloghead  (tracker key: `bloghead`, accent `#39d7b0`)
- **What:** iOS music-industry **marketplace** for Rhein-Main (artists / venues / organizers / fans). **NOT** `bloghead-v2` (a separate React app at `~/Developer/bloghead-v2`).
- **Repo:** `~/Developer/Bloghead` (GitHub `ElSalvatore-sys/Bloghead`) — `api/` FastAPI, `Bloghead-iOS/` Swift. Bundle `com.easolutions.bloghead`.
- **Prod:** Hetzner CPX32 (Germany), backend `api.blogyydev.xyz`. `api-*` docker compose; db loopback-bound (never internet-exposed). Roster images served at `/roster/…`.
- **State (Jun 13):** ~94%, **payments in progress (current).** Source of truth = `~/Downloads/BLOGHEAD_SESSION_HANDOFF_2026-06-12_13.md`. Last 15 days: booking lifecycle now completes end-to-end for the first time (root cause was a broken DB trigger referencing a non-existent `venue_name` column → fixed in migration `0060` + regression test); 60 real roster photos (closed §22 KUG legal risk); first device build on iPhone 13 Pro Max; Google + **Apple** sign-in proven on prod; discovery feed seeded (12 events); daily backups + watchdog.
- **Blocking a working product:** Stripe not configured → `/payments` 503 (test keys in hand, wiring next, 8% commission model). Then: enable Cloudflare R2 (offsite backups), DSGVO sign-off, **TestFlight build** (only a direct device build exists today).
- **Goal ladder:** First TestFlight → 50–100 testers → public launch → marketing (on the side). Mirrored in `data.json` Bloghead `roadmap` + `side`.
- **Gotcha:** Google/Apple ID-token verify needs `verify_at_hash: False` or every real sign-in 401s.

### 3. Dehgo  ⇄  **TBD**  (tracker key: `dehgo`, accent `#a98bff`)
- **⚠️ Key mapping:** on the tracker it's called **"Dehgo"**, but the real project/repo is **TBD** — an Aushilfe/Minijob **hospitality workforce marketplace** (venues post shifts, workers apply, accept opens a chat). `~/Developer/dehgo` only holds a `CLAUDE.md` (tracker-logging note); the code is in **`~/Developer/tbd`**.
- **Repo:** `~/Developer/tbd` (GitHub `ElSalvatore-sys/tbd`). `api/` is **Go**. Dev DB `localhost:5433` (brew pg owns 5432).
- **State (Jun 13):** ~97%, "cleaning up, getting ready to launch." Last 15 days: two-sided **web app** (venue + worker portals) live; iOS **TestFlight-ready** bundle + closed-beta features; real-time chat (canonical `/v1/ws`, banned user dropped from live socket); server-side consent + Art.13 legal copy; 100% German job/Bewerbung flow + richer profiles; geocode real city (killed hardcoded Frankfurt).
- **Legal posture (counsel review):** clean Vermittler/intermediary, **not** Arbeitnehmerüberlassung — no money/payroll/escrow in code, venue alone decides accept/reject, accept only opens a chat. Breaks if payroll/escrow or shift-direction is added.

### 4. No.1 Restaurant  (tracker key: `no1restaurant`, accent `#f59e0b`, **minor**)
- **What:** a restaurant website. Live at `number-one-restaurant.vercel.app`.
- **State:** 100%, live; custom domain pending. Shown as a "minor" mini-card on the tracker.

### 5. ThePuffer OS (Glasses)  (tracker key: `pufferos`, accent `#38bdf8`)
- **What:** hands-free "ask anything" voice assistant on **A02 smart glasses** — iPhone app pairs the glasses to Gemini Live (tap → speak through glasses → hear the answer). Phone-side port of the Mac experiment, ask-mode only (no translation/ambient/Hermes/local-model — deliberately out of scope).
- **Repo:** `~/Developer/thepuffer-ios-glasses` (local-only, **no GitHub remote yet**; first build 2 Jul, staged/uncommitted). New repo, *not* a fork of `oasis-voice-bridge` — reuses only the proven config (model `gemini-3.1-flash-live-preview`, 16kHz-in/24kHz-out PCM, persona), not code.
- **Stack:** SwiftUI, iOS 17+, Swift 6. No third-party deps — Gemini Live WebSocket (`BidiGenerateContent`) hand-rolled on `URLSessionWebSocketTask`. Project via `xcodegen` (`.xcodeproj` gitignored). Secrets: `GOOGLE_API_KEY` in gitignored `Config/*.xcconfig`.
- **State (2 Jul):** ~45%. One-screen app built (button + status + transcript line), reacts to Bluetooth route changes for glasses connect/disconnect. Must run on a **real iPhone** — BT audio routing doesn't work in the Simulator.
- **Honest blocker / caveat:** `UIBackgroundModes:[audio]` is set for pocket use — a real App Store review risk (fine for personal sideload; needs a push-to-talk/Live-Activities rethink before submission).

---

## Not (yet) on the tracker
Active projects that exist but aren't tracked here — add as new `projects.<key>` cards if wanted:
- **Noir Vault / Padi** — luxury jewellery store, `~/Developer/noir-vault` → GitHub `ElSalvatore-sys/padi-jewellery-website`. Live `noir-vault-teal.vercel.app`. "The Descent" R3F slice shipped (PR #1).
- **Tageskasse (PUF-17)** — currently a *module inside TheBarApp*, not a standalone project.
- Other Vercel deploys under the account: `anas-burger`, `oasistechnology.de`, `ea-s.info`, `estatae.de`, `bishopfrankcuomo.com`.
