---
name: rea-web
description: "Build or redesign a web page from the rea-design library (1,009 well-made sites rebuilt as code, subpages included): pick a skeleton and sections, set the layout axes, bake a skin, pass the 390×844 phone gate, hand it over. Use for landing pages, homepages, about, product, portfolio, event, careers and shop pages, redesigns, 'make it like that site', scroll and hover design for a page."
argument-hint: "[one line about the page to build, or a site slug]"
---

# rea-web — build a page from the library

The library is sites rebuilt in clean code: layout, scroll motion, hover and click behaviour match the original, copy is "Your … here", images are labelled grey slots. Don't build from scratch — pull from here and rebuild.

The detailed rules live in `references/`. Read each file when you reach its step. **[use.md](references/use.md) is the canonical usage guide: read it start to finish before the first build.**

If the user asks for a different direction, the user wins. If the project already has a design system (tokens, a `DESIGN.md`) or a brand, that is the skin.

## How to work with the person

- Default is autopilot: write the concept, choose, and build all the way to a first version without questions. List what needs filling at the end.
- If they say "show me options" / "let me choose", show three candidates: plain line · live URL (`rea open <slug>`) · picture (`thumb.webp`), recommend one, wait. One gallery link for all three: `rea board a,b,c`.
- If they name a site (slug or "the horizontal-scroll one"), use it (`rea sites -q <words>` to find it).

## Steps for one page

0. **Concept** (≤5 lines, `_picks/concept.md`): skin · first action · three feeling words · don'ts · must-have features.
1. **Pick references** — [library.md](references/library.md), [use.md](references/use.md).
   ```sh
   rea sites -k <kind> -q "<words>" [--light|--dark] [-m slow·sharp]   # skeleton candidates
   rea set --base <slug> --roles about,services,work,contact --alt 2    # one page's worth of sections
   rea sections <role> -q "<words>"                                     # more for one role
   rea show <slug>/<slot>                                              # the HTML and the css/js lines to read
   ```
   Look at the pictures before choosing. Default is **section assembly** (one skeleton + a section per role from other sites, rebuilt with one grammar and one seam). If the user named a site, **whole-site copy**: `rea get <slug> --dir <project>`.
2. **Layout axes** — [layout.md](references/layout.md). Read the last three log lines; differ from the previous page on at least three axes. No intro sentences, slogans or outcome numbers on screen.
3. **Skin** — [theme.md](references/theme.md). `rea theme <world>[/<variant>] --out <project>/css/kf-theme.css`, then colour and type only through `--kf-*`.
4. **Images** — use what exists; generate missing ones with whatever image tool the user has (no text in images).
5. **Build** a static version first in the user's folder; confirm the layout holds, then add motion. Bring the references' motion with its exact curve and duration values (motion parts: `rea fx -s <slug>`). First CSS lines: `/* ref: … */` and `/* editorial · … */`. Append one log line.
6. **Phone gate** — [mobile.md](references/mobile.md). `rea check <project>/index.html` (and `--desktop`). Report before/after numbers.
7. **Outbound check** — [copyright.md](references/copyright.md): replace `data-art` drawings with your own art, swap Fontshare fonts for OFL ones on client work, keep vendor LICENSE files.
8. **Show it**: open it in the browser, scroll top to bottom at 1440 and 390, screenshot, compare on-screen text with "What to leave out". Report what you built, each reference as `slug · live URL`, what to fill, and two or three things they can ask for next.

Only fixing an existing screen on phones? Do step 6 alone. Only adding an effect? Use `rea-interactions`.

## Always

- The library is read-only. Pulled code gets edited in the user's folder.
- Layout first. Motion, shaders and 3D go on after the layout stands, with the source's numbers kept.
- Never hand-pick colours, fonts, radii, durations or curves. No gradients or glass on top of the skin.
- Never invent copy, names or numbers.
- There are no app/console/dashboard skeletons. For those, use motion parts, layout rules, a skin and the phone gate.
