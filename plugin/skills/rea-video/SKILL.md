---
name: rea-video
description: "Make videos with HyperFrames (HTML rendered to MP4) using the motion vocabulary of 1,009 rebuilt websites and 2,253 motion parts: promo, launch, explainer and showreel films, website walkthroughs, UI motion loops, kinetic type, scroll-through footage of a page. Use when the request is a video, clip, reel, trailer, motion graphic or HyperFrames scene, or when a page built with rea-web needs a video."
---

# rea-video — web motion, rendered as film

HyperFrames renders HTML to video by seeking a paused GSAP timeline frame by frame. The library's sections and motion parts are already HTML + GSAP, so they are a ready source of shots, curves and timings for a film.

**Read the HyperFrames skill first** (`/hyperframes:hyperframes`) and follow its render contract. If HyperFrames is not installed:

```sh
claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
```

This skill only says where rea fits.

## Pick the motion first

| The film needs | Get it from |
|---|---|
| A look (tempo, curve, pace) | `rea sites -m <tempo·curve> -q "<subject>"`. Use the site's `duration` and `curve` values as the film's default tween length and ease |
| A signature move for one beat (reveal, split text, mask wipe, stack, marquee, card fan) | `rea fx -q "<move>"`; read `rea fx <name>` for its exact ease, duration and stagger |
| A layout for a scene (hero, feature grid, timeline, pricing) | `rea sections <role> -q "<words>"`, then `rea show <slug>/<slot>` for the HTML |
| Real footage of a page scrolling (B-roll, a device-mockup insert, a showreel tile) | `rea reel <slug>/<page>.html --out assets/<name>.mp4 --seconds 8` |
| A skin | the brand, else `rea theme <world>[/<variant>] --out assets/kf-theme.css` |

## Port a motion part into a scene

Library motion is written for live pages (scroll, hover, timers). In a film, everything must be a function of timeline time:

1. Keep the part's numbers: ease string, duration, stagger, distances, scale factors.
2. Rewrite the trigger as a timeline position: `scroll-enter` → a tween at the beat's start; `scroll-scrub` / `pin-scrub` → a linear tween of the same property over the beat; `hover` / `click` → a scripted cursor (or none) and the same state change at a set time; `loop` → finite repeats sized to the clip, never `repeat: -1`.
3. Drop `fx-core.js`, ScrollTrigger and Lenis. Register one paused timeline per composition (`window.__timelines[id] = tl`).
4. No `Math.random()` without a seed, no `Date.now()`, no timers, no fetches.
5. Text placeholders become the film's copy. Never invent product facts or numbers.

## Web page → film

When the film is about a page built with `rea-web` (or any `rea open` page):

- Show the real page: `rea reel` for footage, or `npx hyperframes capture <url> --json` for a full-page plate and assets. Rebuild only the part that moves.
- Reuse the page's skin file and its motion tempo, so page and film feel like one product.
- One idea per scene. Hold readable text at least one beat.

## Check and render

`npx hyperframes check --json` until clean → `npx hyperframes snapshot --review` and look at the frames → render only after the user approves the preview (or asked for the file). Report the motion parts and sites you borrowed from as `name · demo URL` / `slug · live URL`.
