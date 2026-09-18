# PlanetPulse

**Hackathon ID:** AZIS-7SJVZT

Track 2 · Climate Tech brief · Code2Career AI Hackathon

PlanetPulse turns your daily travel, food, and electricity choices into a visible personal carbon footprint. Log entries throughout the day, see a live breakdown, track a 7-day trend, and get suggestions targeted at whichever category is driving your footprint.

## Live demo

- **Live URL:** https://github.com/Avanish-web/Planet-pulse-.git
- **Repo:** https://github.com/Avanish-web/Planet-pulse-

## Features

1. **Quick entry logging** — log travel (mode + distance), food (meal type + servings), or electricity (kWh) in a few clicks.
2. **Live footprint dashboard** — today's total plus a per-category breakdown, updated instantly.
3. **7-day trend** — a pulse-line chart of your footprint across the last week.
4. **Daily goal tracking** — set a target kg CO₂e/day and see how today compares.
5. **Targeted tips** — suggestions based specifically on your *highest*-emitting category that day, not generic advice.

> The Track 2 brief mentions 5 required features but the exact list lives in the portal's Track 2 workspace (behind login). The above is built directly from the public brief description ("travel, food, electricity → visible personal carbon footprint") — **cross-check this against your actual workspace brief before submitting**, and adjust if needed.

## Tech stack

Plain HTML, CSS, and vanilla JavaScript. No build step, no framework, no backend — data persists in the browser via `localStorage`. This was a deliberate choice; see `DECISIONS.md`.

## Running it locally

1. Clone the repo and open the folder in VS Code.
2. Install the **Live Server** extension (or any static file server).
3. Right-click `index.html` → "Open with Live Server" (or run `python3 -m http.server` in the folder and visit `http://localhost:8000`).

No `npm install`, no environment variables, no API keys needed.

## Deploying it

Easiest path: **GitHub Pages**.

1. Push this repo to GitHub (public).
2. Go to the repo → **Settings → Pages**.
3. Under "Build and deployment", set **Source: Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save. Your live URL appears at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Emission factors used

Approximate public estimates (kg CO₂e), not a certified dataset — see `DECISIONS.md` for why:

| Travel (per km) | | Food (per serving) | | Electricity |
|---|---|---|---|---|
| Car (petrol) | 0.192 | Beef / red meat | 6.0 | 0.42 kg / kWh (global grid average) |
| Bus | 0.105 | Chicken / fish / eggs | 1.8 | |
| Train / metro | 0.041 | Vegetarian | 0.6 | |
| Flight (short-haul) | 0.255 | Vegan | 0.4 | |
| Bike / walk | 0 | | | |

## Project structure

```
planetpulse/
├── index.html      # structure
├── style.css        # design system + layout
├── script.js         # all app logic (calculations, storage, rendering)
├── README.md
└── DECISIONS.md      # the 3 judgment calls, and reasoning
```
