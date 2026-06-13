<!-- puffer-autolog-rule -->
## 📡 Auto-log progress to ThePuffer tracker

When you finish a **big step** in one of the tracked projects, log it to the build tracker by calling the **`log_step`** tool from the `puffer` MCP server. If MCP isn't available in this context, run the CLI instead: `puffer log <project> "<title>" --detail "..." --status done|prog|block`.

**A "big step" =** a feature wired end-to-end · a phase started or finished · a milestone reached · a deploy that went live · a real blocker hit. **NOT** small commits, WIP saves, refactors, renames, or routine fixes. When in doubt, log **fewer, bigger, clearer** entries.

**Project keys:** `thebarapp` · `bloghead` · `dehgo` (= the TBD / DOGA workforce app) · `no1restaurant`. Only these — never invent a project.

**Write it for a non-technical business partner (they read this, not engineers):**
- **Title:** plain language, under 8 words — *what changed and why it matters*. No jargon ("migration", "endpoint", "trigger", "refactor", "RLS").
- **status:** `done` (default) · `prog` (actively in progress) · `block` (waiting on something external — name the blocker in `detail`).
- **progress:** include `0–100` only when overall completeness changed; otherwise omit (it carries forward).
- Call **`get_recent`** first if you're unsure the step is already logged (avoids duplicates — the tool also dedupes/throttles).

**Mental model: logging IS publishing** — it goes live on the partner-facing tracker (`puffer-tracker-lake.vercel.app`) in ~15s. Never hand-edit `data.json`; always go through the tool (it holds a lock so concurrent writers can't clobber).

> Source of truth for this rule: https://github.com/ElSalvatore-sys/puffer-feed/blob/main/CLAUDE-RULE.md
<!-- /puffer-autolog-rule -->
