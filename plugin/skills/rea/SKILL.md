---
name: rea
description: "Router for the rea-design library: 1,009 rebuilt websites (3,856 pages, 28k sections) and 2,253 motion parts. Use first for any web or video design request: landing page, website, homepage, portfolio, careers or event page, redesign; hover, cursor, scroll, parallax, pin, marquee, loader, page-transition or text effect; a theme, palette or font pairing; mobile or responsive layout; a promo, launch or explainer video, motion graphics, or a HyperFrames scene. It picks the right rea-* skill and the best references. Do not hand-build a site or an effect before checking here."
---

# rea — pick the right path

rea-design is a library of well-made websites rebuilt as clean, placeholder-filled code (layout, scroll motion, hover and click behaviour kept; copy and images replaced) plus thousands of motion parts pulled out of them. The `rea` CLI ships with this plugin and is on your PATH.

## 1. Route

Run the router on the user's request, word for word:

```sh
rea route "<the user's request>"
```

It prints the skill to load, the site kind, and the best matching sites and motion parts. Load that skill and follow it:

| Request | Skill |
|---|---|
| Build or redesign a page or site | `rea-web` |
| Add an interaction or effect to something that already exists (an app, a dashboard, one component) | `rea-interactions` |
| A video: promo, launch, explainer, reel, motion graphics | `rea-video` |
| Only a skin (colors, type) or a phone-layout fix | `rea-theme-mobile` |

When the request mixes them (a landing page and its launch video), do them in that order: `rea-web` first, then `rea-video` on the built page.

## 2. If the user wants to choose

The user can always pick by hand. If they say "show me options", "let me choose" or name a site, skip the router's pick:

- `/rea-design:browse [words]` — opens the gallery filtered by their words.
- `/rea-design:pick <words>` — three candidates with pictures and live links, then wait for their choice.
- `/rea-design:use <slug>` — build from exactly that site.

## Ground rules (every path)

- Take bones from references (layout, motion, curve and duration values). The skin (colors, type) is the user's brand, or a baked `rea theme`. Never ship a reference's `theme.css`.
- Never invent copy, names or numbers. Leave the English placeholders and list what needs filling.
- Build in the user's project folder. The library is read-only.
- Report the references you used as `slug · live URL` (`rea open <slug>`).
