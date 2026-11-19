# Site library: browse and pull with the `rea` CLI

The library holds hundreds of well-made sites, subpages included, **rebuilt in our own code**. That comes to thousands of sections. Layout, scroll motion, hover and click behavior match the originals. Copy is replaced with English placeholders ("Your … here"), and photos are gray placeholders that describe what image belongs there. Every site has a neutral English slug. For marketing and promotional sites, don't build from scratch: pull from here and build on top.

The library is public and served from `REA_BASE` (default `https://sionic-ai.github.io/rea-design`). It is read-only. Use the `rea` CLI that ships with this plugin.

```sh
rea sites | head -1                    # reachability check. If it fails, check the network or your REA_BASE setting
curl -s "$(rea url USE.md)"            # the canonical usage rules. Read them start to finish before building
```

The usage rules are also in [use.md](use.md).

## Reading use.md with this skill

[use.md](use.md) is written with the library maintainers' tool names. Translate them like this:

| What use.md says | What to use here |
|---|---|
| `node library/pick.mjs <command>` | The `rea` subcommand of the same name: `rea sites`, `rea sections <role>`, `rea set`, `rea show <slug>/<slot>`, `rea pages`, `rea fx`, `rea board` |
| Baking a skin with `drawer theme` | `rea theme`. See [theme.md](theme.md) |
| The motion line from `sites show <slug>` | `rea fx -s <slug>` (every motion part that site uses) |
| `library/<slug>/…` files | `rea url library/<slug>/<file>`. For a whole site, use `rea get <slug> --dir <project>` |
| A site's fidelity, notes, fx, libs or units | `rea sites -q <slug>` (these fields are in the catalog) |

## Common commands

```sh
rea sites -k company                                  # candidate sites (skeletons). Kinds: shop, company, brand, portfolio, agency, careers, product, education, event, anniversary, public, clinic, venue
rea sites -q <slug>                                   # one site's catalog entry: picture, fidelity, notes, fx, libs, units
rea sections about -q history -n 8                    # candidate sections per role (hero, about, services, work, news, careers, contact, footer, …)
rea set --base <slug> --roles about,services,contact --alt 2   # one page's worth: a skeleton plus a section from a different site for each role
rea show <slug>/<slot>                                # section HTML, size units, and the css/js lines to read alongside it
rea fx -p card -t hover                               # motion parts (interaction feedback, scroll effects). Attach them to your own elements with data-fx
rea pages -t detail                                   # subpages (about, works, detail, news, recruit, contact, …)
rea open <slug>                                       # live URL of the rebuilt page
rea get <slug> --dir <project>                        # download one site plus the shared assets into your project
```

- **Quote values that contain spaces.** The CLI URL-encodes values for you.
- Downloaded pages load shared assets from `../../_shared/`. `rea get` puts the site under `<project>/library/<slug>/` and the shared assets at `<project>/_shared/`, so pages open as-is. If you move them to a different depth, fix the paths.
- Results include `library/…` paths in the "picture:", "demo:" and file lines. Fetch any of them with `rea url library/…` or by prefixing `REA_BASE/`. A site's first screen is `library/<slug>/thumb.webp`. Section pictures are under `library/catalog/shots/…webp`.
  Look at the actual pictures before choosing. Don't choose from the text descriptions alone.
- To open a page as it is, open `rea open <slug>` (or `rea url library/<slug>/index.html`) in a browser or with `rea check`. The `../../_shared` assets are served from the same base.

## Working with the user: the picker board

When building something new, don't present a finished site all at once. Work in steps:

1. What kind of place it is and what content it must include
2. Mood (three skeletons)
3. Sections (three candidates per role)
4. Transitions/seams
5. First draft

At each decision point, show three options and let the user choose (see "Decision points" in [use.md](use.md)). For each option, show our rebuilt picture (`thumb.webp`, the `picture:` line from `rea sites`) and the live rebuilt page URL (`rea open <slug>`).

```sh
rea board a,b,c                                       # one gallery link for three slugs
rea board --title "Pick a mood" --row "Mood:*<slug>=Hero where the photo settles slowly,<slug>,<slug>"
```

`rea board` prints a gallery URL. You can hand that URL directly to the user, since it opens anywhere. A `*` marks your recommendation. Text after `=` is the plain-language caption for that cell.

Go end to end without asking only in two cases: the run has no one to answer (cron, batch), or the user said "just handle it."

In reports, list each reference as `slug · live URL` (from `rea open <slug>`).

## Mixing rules

- **The default is section assembly.** Pick one skeleton site, then a section from a different site for each role, then set order and length. Next, apply one shared grammar (spacing unit, grid, type scale) and one transition/seam style. Then **rebuild**.
  If you just stack sections as-is or only lay a theme over them, the result falls apart and looks like six sites piled on top of each other.
- **Copy a whole site** only when the user pointed at a specific site or needs something up quickly. For commercial work, read [copyright.md](copyright.md) first.
- Take skeleton and motion from the reference. **The skin (colors, typefaces) belongs to this project.** Use the brand if there is one, otherwise use `rea theme`. Never wear a reference's `theme.css` as-is.
- Adapt the content shape (number of cards, text length, buttons) to this use case. Remove anything that only made sense for the original company: its brand character, vertical text, seasonal banners, menu names.
- There are no skeletons for app, console or dashboard screens. For those, bring over only the motion parts (`fx`, see [fx.md](fx.md)) and the skin.
- Don't modify anything inside the library (it is read-only). Build in the user's project folder.

To give another agent (Codex, etc.) access to the same library, run `curl -fsSL https://sionic-ai.github.io/rea-design/install.sh | sh`. This installs a short `site-library` skill that calls the same CLI. If you are using this plugin, you don't need it.
