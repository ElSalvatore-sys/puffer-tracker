#!/usr/bin/env node
/**
 * log-step.mjs — append one "big step" to data.json (and optionally push to deploy).
 *
 * Usage:
 *   node log-step.mjs --project thebarapp --title "Wired Wozi briefing" \
 *        --detail "OODA endpoint live in-app" --mins 120 --status done --progress 46 --push
 *
 * Flags:
 *   --project   (required) one of the keys in data.json > projects
 *   --title     (required) short headline, keep it < 8 words
 *   --detail    what actually changed (optional)
 *   --mins      minutes the step took (optional, default 0)
 *   --status    done | prog | block   (default: done)
 *   --progress  0-100 project completeness after this step (optional; carries last value if omitted)
 *   --push      git add + commit + push  → triggers Vercel redeploy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const has = (f) => args.includes(f);

const project  = get('--project');
const title    = get('--title');
const detail   = get('--detail')  || '';
const mins      = parseInt(get('--mins') || '0', 10);
const status   = get('--status') || 'done';
const progress = get('--progress');

if (!project || !title) {
  console.error('Usage: node log-step.mjs --project <key> --title "..." [--detail "..."] [--mins 90] [--status done|prog|block] [--progress 46] [--push]');
  process.exit(1);
}
if (!['done', 'prog', 'block'].includes(status)) {
  console.error(`Invalid --status "${status}". Use: done | prog | block`);
  process.exit(1);
}

const file = new URL('./data.json', import.meta.url);
const data = JSON.parse(readFileSync(file, 'utf8'));

if (!data.projects[project]) {
  console.error(`Unknown project "${project}". Known: ${Object.keys(data.projects).join(', ')}`);
  process.exit(1);
}

const nextId = data.log.reduce((m, l) => Math.max(m, l.id), 0) + 1;
const entry = {
  id: nextId,
  project,
  title,
  detail,
  status,
  durationMin: isNaN(mins) ? 0 : mins,
  ts: new Date().toISOString()
};

if (progress !== undefined) {
  entry.progressAfter = parseInt(progress, 10);
} else {
  const last = data.log
    .filter((l) => l.project === project)
    .sort((a, b) => new Date(b.ts) - new Date(a.ts))[0];
  entry.progressAfter = last?.progressAfter ?? 0;
}

data.log.push(entry);
writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log(`✓ logged #${nextId} · ${data.projects[project].name} · "${title}" (${entry.durationMin}min · ${status} · ${entry.progressAfter}%)`);

if (has('--push')) {
  try {
    execSync('git add data.json', { stdio: 'inherit' });
    execSync(`git commit -m ${JSON.stringify(`log: ${project} — ${title}`)}`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('✓ pushed → Vercel will redeploy (~15s)');
  } catch (e) {
    console.error('git push failed:', e.message);
    process.exit(1);
  }
}
