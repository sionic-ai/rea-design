<p align="center">
  <a href="https://sionic-ai.github.io/rea-design"><img src="docs/hero.gif" width="100%" alt="rea-design gallery: tiles of rebuilt websites play while the page scrolls; one is clicked and opens full screen"></a>
</p>

<h1 align="center">rea-design</h1>

<p align="center">
  <b>1,009 well-made websites, rebuilt as code — and 2,253 motion parts pulled out of them.</b><br>
  A Claude Code plugin that picks the right reference for you, or lets you pick it yourself.
</p>

<p align="center">
  <a href="https://sionic-ai.github.io/rea-design"><b>Browse the gallery</b></a> ·
  <a href="#install">Install</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#the-rea-cli">CLI</a> ·
  <a href="#whats-inside">What's inside</a>
</p>

<p align="center">
  <img alt="sites" src="https://img.shields.io/badge/sites-1%2C009-d7ff3a?style=flat-square&labelColor=0d0d0e">
  <img alt="pages" src="https://img.shields.io/badge/pages-3%2C856-d7ff3a?style=flat-square&labelColor=0d0d0e">
  <img alt="sections" src="https://img.shields.io/badge/sections-28%2C859-d7ff3a?style=flat-square&labelColor=0d0d0e">
  <img alt="motion parts" src="https://img.shields.io/badge/motion_parts-2%2C253-d7ff3a?style=flat-square&labelColor=0d0d0e">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-f2f1ed?style=flat-square&labelColor=0d0d0e">
</p>

---

Ask an agent for "a landing page" and you get the same centered hero, three cards and a gradient every time. rea-design gives Claude Code something better to start from: real layouts, real scroll choreography and real hover feel, taken from sites people made with care and rewritten as clean, framework-free HTML, CSS and GSAP.

Every rebuilt page keeps its **bones** (grid, proportions, pinning, scrub, split text, page transitions, curve and duration values) and drops everything that belonged to the original (copy, photos, logos, names). Your agent takes the bones and dresses them in your brand.

## Install

```sh
claude plugin marketplace add sionic-ai/rea-design
claude plugin install rea-design@rea-design
```

That's it. The plugin ships the catalog and the `rea` CLI (Node ≥ 18, no dependencies). Pages, pictures and motion parts load on demand from the [public library](https://sionic-ai.github.io/rea-design). `rea check` and `rea reel` install Playwright the first time you use them.

For video work, also install [HyperFrames](https://github.com/heygen-com/hyperframes):

```sh
claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
```

## How it works

### Automatic routing

Just ask. The `rea` router skill loads on any web or video design request, runs `rea route` on it, and hands off to the right path with the best-matching references:

| You say | Claude uses | And starts from |
|---|---|---|
| "Landing page for a neighbourhood café, calm and warm" | `rea-web` | shop sites with a slow tempo, a skeleton + one section per role |
| "Add a magnetic hover to the buttons in my React dashboard" | `rea-interactions` | `magnetic-hover`, `magnet-ring-cursor`, `pill-swap-hover` |
| "30-second launch video for our app" | `rea-video` | app product pages, recorded as footage, motion ported into HyperFrames |
| "Pick a palette and fonts" / "it overflows on mobile" | `rea-theme-mobile` | 30 skin worlds · the 390×844 phone gate |

### Pick it yourself

| Command | What it does |
|---|---|
| `/rea-design:browse [words]` | Opens the gallery, filtered. Click a tile to open the live rebuilt site. |
| `/rea-design:pick <what you need>` | Three candidates with pictures and live links. Claude waits for your A / B / C. |
| `/rea-design:use <slug>` | Build from exactly that site (or `fx:<part>` for one motion part). |

Or say it in plain words: *"show me three options first"*, *"use horizontal-scroll-school-anniversary for the history page"*.

### What Claude does with a reference

1. Writes a five-line concept: skin, first action, three feeling words, don'ts, must-haves.
2. Takes a **skeleton** site (hero, header, footer, motion tempo) and **one section per role from other sites**, chosen to share its tempo and curve.
3. Rebuilds them with one grammar (spacing steps, grid, type scale) and one seam between sections.
4. Bakes a skin into `--kf-*` variables: your brand, or one of 30 worlds × 428 variants.
5. Keeps every source motion value, attaches motion parts with `data-fx`, and passes a measured phone gate.
6. Reports what came from where (`slug · live URL`), what you need to fill in, and what you can ask for next.

## The `rea` CLI

`rea` is on Claude's PATH while the plugin is enabled. You can run it yourself too: `~/.claude/plugins/…/bin/rea`, or clone this repo and run `plugin/bin/rea`.

```sh
rea route "portfolio for a 3D artist with a dark feel"   # which skill, which sites, which parts
rea sites -k portfolio -m slow·soft --dark -n 5          # skeleton candidates
rea set --base <slug> --roles about,work,contact          # one page's worth of sections
rea show <slug>/<slot>                                    # section HTML + the css/js lines to read
rea fx -t scroll-scrub -p photo                           # motion parts by trigger and target
rea fx magnetic-hover                                     # curve, duration, options, attach snippet
rea get <slug> --dir ./site                               # a whole site, ready to open
rea get fx:magnetic-hover --dir ./app                     # one part + fx-core + licenses
rea theme blueprint/deep-rose-2 --out css/kf-theme.css    # bake a skin
rea check ./site/index.html                               # phone gate: overflow, data start, touch targets
rea reel <slug> --out assets/hero.mp4                     # scroll-through footage for a video
rea board a,b,c                                           # one gallery link for three candidates
```

Moods: **tempo** fast · medium · slow, **curve** sharp · medium · soft · bouncy, **scroll** native · smooth · heavy.
Roles: hero · about · services · work · news · careers · numbers · info · testimonials · faq · schedule · contact · media · band · frame · footer.

## What's inside

| | |
|---|---|
| **1,009 sites** | company 160 · agency 135 · shop 122 · portfolio 110 · product 102 · brand 100 · education 60 · event 43 · public 42 · careers 40 · clinic 35 · anniversary 19 · venue 19 · other 22 |
| **3,856 pages** | home, about, service, works, detail, news, article, recruit, product, contact, lookbook |
| **28,859 sections** | every one tagged with its role, line range, motion notes and a picture |
| **2,253 motion parts** | hover 502 · loop 488 · load 448 · scroll-enter 403 · click 400 · scroll-scrub 339 · cursor 316 · state 221 · pin-scrub 190 · focus 143 · drag 136 |
| **30 skins** | 428 variants, baked to `--kf-*` CSS variables |
| **Libraries** | GSAP + ScrollTrigger on 922 sites, Lenis on 206, three.js on 81, plus Swiper, Splide, Barba, Swup, Lottie, OGL, Matter.js … |

```
plugin/                 the Claude Code plugin (skills, commands, rea CLI, catalog)
  skills/rea            router: auto-invoked, picks the path
  skills/rea-web        build a page: references, layout axes, skin, phone gate
  skills/rea-interactions  attach motion parts to any UI
  skills/rea-video      HyperFrames films with library motion
  skills/rea-theme-mobile  skins and the phone gate
  commands/             /browse · /pick · /use
site/                   the gallery (GitHub Pages)
```

The library itself (pages, pictures, previews, motion parts, vendor code) is served from the `gh-pages` branch, so installing the plugin stays light.

## Rules the skills follow

- **Bones from references, skin from you.** Never ship a reference's `theme.css`. No gradients or glass on top of the skin.
- **Motion is bone.** Keep source curves and durations. Change motion only when it hides the main action, makes people wait, or delays a press by more than 0.4 s.
- **No invented content.** No made-up names, numbers or claims. Placeholders stay until you fill them.
- **Measured, not eyeballed.** Zero horizontal overflow, data on the first phone screen, 44 px touch targets, zero console errors.

## About the rebuilds

Each library site is an original rebuild, written from scratch to study the layout, proportions and motion of a public website. No text, images, logos, video or source code from those sites is included: copy is English placeholder text, pictures and videos are generated placeholders, and names and domains are removed. Use it as a reference for structure and motion and bring your own content. See [NOTICE.md](NOTICE.md) for third-party licenses (GSAP's Standard License, Fontshare fonts). If you spot a page that still carries an identifying trace, [open an issue](https://github.com/sionic-ai/rea-design/issues/new?template=brand-trace.yml).

## License

MIT © [Sionic AI](https://sionic.ai). Third-party code under `library/_vendor` and `_shared/vendor` keeps its own license; see [NOTICE.md](NOTICE.md).
