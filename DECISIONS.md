# Decisions

The brief says every submission has 3 Decision Points — open-ended judgment calls where a generic, AI-default answer scores zero. **Check your Track 2 workspace for the exact 3 prompts it wants answered** — they may be worded specifically. Below are the three real judgment calls I made building PlanetPulse, written up so you can either use them as-is (if they match) or as a model for answering the platform's actual prompts.

## 1. Which emission factors to use, and how to be honest about their limits

**The call:** There's no single "correct" CO₂e-per-km or per-meal number — real figures depend on country, vehicle efficiency, grid mix, and farming method. I chose widely-cited public averages (e.g. 0.192 kg/km for a petrol car, 0.42 kg/kWh for grid electricity) rather than inventing false precision or pulling in a heavyweight external emissions API for a 24-hour build.

**Why this and not the alternative:** A more "accurate" approach would integrate a live regional emissions API — but that adds a dependency, an API key, and a failure mode, for precision the user can't actually verify anyway. I traded certified accuracy for transparency: every factor is visible in the README and in-app, so the user can judge the estimate rather than trust a black box.

**Trade-off I'm accepting:** Someone in a country with a very clean or very dirty grid will get a somewhat wrong number. I flagged this explicitly instead of hiding it.

## 2. No backend, no accounts — everything lives in `localStorage`

**The call:** Build a real backend + database for multi-device sync and accounts, or keep everything client-side.

**Why this and not the alternative:** The brief rewards shipping something real and deployed in a short window, not infrastructure. A backend means auth, a database, hosting cost, and more surface area for something to break during grading. `localStorage` means the deployed static site works immediately, with zero moving parts to fail during the grader's evaluation.

**Trade-off I'm accepting:** Data doesn't sync across devices and clearing browser storage wipes it. For a single-session demo and a hackathon judging window, that's the right trade — it would be the wrong call for a real product with real users returning over months.

## 3. Relative bars instead of a fixed emissions scale

**The call:** The category breakdown bars scale relative to each other (today's highest category = 100% width) rather than against some fixed universal maximum.

**Why this and not the alternative:** A fixed scale (e.g. "bar maxes out at 20kg") would look empty on a light-logging day and clipped on a heavy one, which actively hides the information the user needs: *which category dominates today*. Relative scaling keeps the visualization meaningful regardless of how much someone logged.

**Trade-off I'm accepting:** You can't compare bar height across different days at a glance — only the trend chart does that job. Splitting the two concerns (breakdown = relative comparison *within* a day, trend = absolute comparison *across* days) felt more honest than one chart trying to do both.
