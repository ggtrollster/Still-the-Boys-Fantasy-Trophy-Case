# 🏆 Interactive League Trophy (GitHub Pages)

A zero‑backend, updateable **interactive trophy case** for our fantasy league. Click any year's trophy to see the **top 3 finishers**.

## Quick start
1. Create a new repository on GitHub (public is simplest): `fantasy-trophy`
2. Upload these files (or the provided ZIP) to the repo root.
3. Edit `data/champions.json` with your league name and seasons.
4. Enable GitHub Pages: Settings → Pages → Deploy from a branch → `main` + `/ (root)` → Save.
5. Visit the URL GitHub shows under “Pages”.

## How to add a new season
Open `data/champions.json` and add a record like:
```json
{ "year": 2025,
  "champion": "Name",
  "team": "Team Name",
  "note": "optional",
  "top3": [
    {"place":1,"name":"Name","team":"Team"},
    {"place":2,"name":"Name","team":"Team"},
    {"place":3,"name":"Name","team":"Team"}
  ]
}
```
Commit to `main` — the site updates automatically.

### Non‑coders can open an Issue
Enable Issues and use the “Add / Update Season” template in `.github/ISSUE_TEMPLATE/` so anyone in the league can request changes for a maintainer to apply.

## Customize
- **League name**: change `league` in `data/champions.json` (the page title updates automatically).
- **Branding**: tweak colors in `style.css`; SVG trophy is inline for easy editing.
- **Private**: use a private repo + Pages (requires GitHub paid plan) or host on Netlify/Vercel.

License: MIT
