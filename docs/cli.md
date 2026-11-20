# The `rea` CLI

`rea` is on Claude's PATH while the plugin is enabled, so Claude runs it for you. You can run it yourself too: clone this repo and use `plugin/bin/rea` (Node 18 or newer, no dependencies).

## Commands

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
rea url library/<slug>/thumb.webp                         # the public URL of any library file
```

`rea check` and `rea reel` install Playwright the first time you use them.

## Filters

- **Kind** (`-k`): company, agency, shop, portfolio, product, brand, education, event, public, careers, clinic, anniversary, venue
- **Mood** (`-m`): tempo fast · medium · slow, curve sharp · medium · soft · bouncy, scroll native · smooth · heavy
- **Roles** (`--roles`): hero, about, services, work, news, careers, numbers, info, testimonials, faq, schedule, contact, media, band, frame, footer
- **Motion trigger** (`-t`): hover, click, cursor, drag, focus, key, load, loop, state, scroll-enter, scroll-scrub, pin-scrub

## Environment

- `REA_BASE`: where library files are fetched from. Default `https://sionic-ai.github.io/rea-design`.
- `REA_HEADLESS=1`: force headless Chromium for `check` and `reel` (the default is an off-screen window on macOS and Windows, which does not stall on WebGL pages).
