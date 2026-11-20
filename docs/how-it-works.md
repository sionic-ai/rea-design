# How it works

## Routing

The `rea` router skill loads on any web or video design request, runs `rea route` on it, and hands off to one of four skills:

| Skill | For | Starts from |
|---|---|---|
| `rea-web` | landing pages, homepages, redesigns, "make it like that site" | a skeleton site + one section per role from other sites |
| `rea-interactions` | a hover, cursor, scroll, pin, marquee, loader or text effect on an existing UI | 2,253 motion parts with exact curves and durations |
| `rea-video` | promo, launch and explainer videos, UI motion loops | library pages recorded as footage, motion ported into [HyperFrames](https://github.com/heygen-com/hyperframes) |
| `rea-theme-mobile` | palette and fonts, dark version, "it breaks on mobile" | 30 skin worlds × 428 variants, a measured 390×844 phone gate |

If you already have another video skill installed, Claude may pick that one for video requests. Name it to be sure: *"use rea-video"*.

## What Claude does with a reference

1. Writes a five-line concept: skin, first action, three feeling words, don'ts, must-haves.
2. Takes a **skeleton** site (hero, header, footer, motion tempo) and **one section per role from other sites**, chosen to share its tempo and curve.
3. Rebuilds them with one grammar (spacing steps, grid, type scale) and one seam between sections.
4. Bakes a skin into `--kf-*` variables: your brand, or one of the 30 worlds.
5. Keeps every source motion value, attaches motion parts with `data-fx`, and passes the phone gate.
6. Reports what came from where (`slug · live URL`), what you need to fill in, and what you can ask for next.

## Rules the skills follow

- **Bones from references, skin from you.** Never ship a reference's `theme.css`. No gradients or glass on top of the skin.
- **Motion is bone.** Keep source curves and durations. Change motion only when it hides the main action, makes people wait, or delays a press by more than 0.4 s.
- **No invented content.** No made-up names, numbers or claims. Placeholders stay until you fill them.
- **Measured, not eyeballed.** Zero horizontal overflow, data on the first phone screen, 44 px touch targets, zero console errors.

## Repository layout

```
plugin/                     the Claude Code plugin
  skills/rea                router: auto-invoked, picks the path
  skills/rea-web            build a page: references, layout axes, skin, phone gate
  skills/rea-interactions   attach motion parts to any UI
  skills/rea-video          HyperFrames films with library motion
  skills/rea-theme-mobile   skins and the phone gate
  commands/                 /browse · /pick · /use
  bin/rea                   the CLI
  catalog/                  sites, sections, motion parts, themes (gzipped JSON)
site/                       the gallery
docs/                       these documents and the README demo
```

The library itself (pages, pictures, previews, motion parts, vendor code) is served from the `gh-pages` branch, so installing the plugin stays light (about 5 MB).
