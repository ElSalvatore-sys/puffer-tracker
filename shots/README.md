# Screenshots — capture contract (for the Sonnet automation)

The dashboard's per-project **"See it"** gallery renders from `data.json` →
`projects.<key>.gallery[]`. Until a project has shots, it shows a clean
"coming soon" tile. This folder is where captured images live.

## Folder layout
```
shots/
  bloghead/      01-intro.webp   02-feed.webp   03-booking.webp  ...
  thebarapp/     01-...
  dehgo/         01-...
```
- One folder per **tracker key** (`bloghead`, `thebarapp`, `dehgo`, `no1restaurant`).
- Prefer **`.webp`**, portrait phone frames ~1170×2532 (or web ~1440×900). Keep each file < ~300 KB.
- Number files in display order (`01-`, `02-`, …).

## Wire them into the dashboard
Add to the project's `gallery` array in `data.json` (path is relative to the site root):
```json
"gallery": [
  { "src": "shots/bloghead/01-intro.webp",   "caption": "Animated intro" },
  { "src": "shots/bloghead/02-feed.webp",     "caption": "Discovery feed" },
  { "src": "shots/bloghead/03-booking.webp",  "caption": "Booking request" }
]
```
Then `git push` → live in ~15s. Captions are short and non-technical (what the screen *is*).

## What the Sonnet agent should do
1. **Bloghead (iOS):** boot the iPhone sim / use the connected device, launch the app pointed at prod, and capture the key screens: intro, login, discovery feed, an artist profile, the booking flow, and a confirmed booking / invoice. (Repo `~/Developer/Bloghead`, bundle `com.easolutions.bloghead`.)
2. **TheBarApp (iOS + web):** owner dashboard `app.thebarapp.de` (needs login) and the public menu `thebarapp-menu.vercel.app`; plus key iOS screens. (Repo `~/Developer/thebarapp-mobile`.)
3. **Dehgo / TBD:** the two-sided web portals + iOS closed-beta screens. (Repo `~/Developer/tbd`.)
4. Save into the folders above, then append the `gallery` entries to `data.json` and push.

> Capture only **owner-approved** flows — this board is read by a business partner.
> Don't expose real customer PII in any screenshot (use the synthetic/test seed data).
