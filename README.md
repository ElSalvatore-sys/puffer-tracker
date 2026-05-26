# ThePuffer — Build Tracker

A self-contained dashboard that tracks three projects in parallel. Everything on screen
(project %, hours logged, step counts, summary stats) is **computed from one file:
`data.json`**. To update the dashboard you only ever append one entry to that file.

```
puffer-tracker/
├── index.html     ← the dashboard (static, reads ./data.json)
├── data.json      ← the single source of truth — the only file that changes
├── log-step.mjs   ← helper: appends one step + optionally pushes
├── vercel.json    ← disables caching on data.json so updates show instantly
└── README.md
```

---

## How it works

1. A "big step" finishes (feature wired end-to-end, phase done, blocker hit).
2. `log-step.mjs` appends one entry to `data.json` and `git push`-es.
3. Vercel sees the push and redeploys in ~15s.
4. Your partner refreshes the URL and sees the new step + updated stats.

No backend, no database, free hosting.

---

## STEP A — Deploy once (one-time, ~5 min)

```bash
cd puffer-tracker
git init && git add -A && git commit -m "init build tracker"

# create a GitHub repo (replace with your repo URL), then:
git remote add origin git@github.com:ElSalvatore-sys/puffer-tracker.git
git push -u origin main
```

Then connect it to Vercel **once**:

- Go to vercel.com → **Add New → Project** → import `puffer-tracker`.
- Framework preset: **Other** (it's plain static). Leave build settings empty.
- Deploy. You get a URL like `https://puffer-tracker.vercel.app` — share that with your partner.

From now on, **every `git push` auto-redeploys.** That's the whole pipeline.

---

## STEP B — Log a step

```bash
node log-step.mjs \
  --project thebarapp \
  --title "Auto-scheduler approve flow wired" \
  --detail "generate→preview→edit→approve now persists to DB" \
  --mins 150 \
  --status done \
  --progress 52 \
  --push
```

| flag | meaning |
|------|---------|
| `--project` | `thebarapp` \| `bloghead` \| `wozivoice` |
| `--title` | short headline (< 8 words) |
| `--detail` | what actually changed (optional) |
| `--mins` | minutes the step took |
| `--status` | `done` \| `prog` \| `block` |
| `--progress` | 0–100 completeness after this step |
| `--push` | commit + push → Vercel redeploys |
