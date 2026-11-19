# Theme: bake a theme into web variables

Do not hand-pick a page's colors, typefaces, corner radii, shadows, or motion character. Pick a theme from the theme catalog (about 30 worlds and about 450 variants in total) and bake it into a CSS file of `--kf-*` variables.

If the project already has a design system (a token file or a `DESIGN.md`) or a brand, use that instead.

The `rea theme` command in the `rea` CLI does the baking. The theme data ships with the plugin, so you don't need to install anything else.

```sh
rea theme                                        # list worlds: brightness, variant count, metaphor
rea theme <world> --variants                     # one line per variant: background, accent color, typeface
rea theme <world>[/<variant>] --out <style dir>/kf-theme.css
```

## Workflow

1. **Pick.** Read the world list's metaphors and the variant lines, and choose the one that best fits the subject and the three mood words. Avoid the world you used for the previous page (see "Log" in [layout.md](layout.md)).
2. **Bake.** Use `--out` to write the file inside the project. Load it before the page CSS. The command also emits the `@font-face` rules for the fonts.
3. **Use.** Use only the variables. Never hard-code hex or rgb values. For lighter tints, mix colors, for example `color-mix(in oklab, var(--kf-ink) 12%, transparent)`.
4. **Swap into library sites.** If you pulled a library site with `rea get <slug> --dir <project>`, replace that site's `theme.css` with the baked file. Library sites keep all their skin in `theme.css` and nowhere else.
5. **Don't paint over the theme.** Don't add gradients, glass effects, or extra shadows on top of it. The theme decides the entire look.

## Variables

- **Colors.** Use only the fourteen colors that every world defines:
  - `--kf-bg`, `surface`, `raised`, `line`
  - `ink`, `ink-soft`, `dim`
  - `accent`, `accent-soft`, `accent-text`, `on-accent`
  - `success`, `danger`, `warning`

  Do not use colors specific to one world. They disappear when you switch themes.
- **Type and shape:**
  - Fonts: `--kf-font-sans|display|mono`
  - Weights: `--kf-weight-display|body`
  - Letter spacing: `--kf-tracking`
  - Corner radii: `--kf-radius-sm|md|lg|pill`
  - Shadows: `--kf-shadow-soft|lift`
- **Motion.** `--kf-ease` carries the theme's character. Bouncy worlds use something like outBack. Shared curves, durations, and stagger are listed under "Web defaults" below.
- **Font sizes are not baked.** The theme's size values are tuned for 1080p video. The layout decides the size hierarchy.
- **Text over images.** Put a scrim mixed from `--kf-bg` under the text so it stays readable in both light and dark worlds.
- **Canvas and SVG drawn from JS.** Read colors with `getComputedStyle(document.documentElement).getPropertyValue('--kf-accent')`.

## Web defaults: the most common values across 100 well-made sites

These values come from analyzing 100 well-made websites. Don't hard-code durations or curves; the theme bakes these values in alongside everything else.

| Variable | Value | Where it comes from |
|---|---|---|
| `--kf-ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | The most frequent CSS curve. Close to GSAP's `power4.out` |
| `--kf-ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | The second most frequent curve (long deceleration) |
| `--kf-ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Same as GSAP's `power2.inOut` |
| `--kf-ease-ui` | `cubic-bezier(0.4, 0, 0.2, 1)` | Direct UI feedback such as buttons and toggles |
| `--kf-dur-fast` · `base` · `slow` | `0.3s` · `0.6s` · `1s` | Midpoints of the three clusters where durations concentrate (0.2–0.4s, 0.4–0.7s, 0.7–1.1s) |
| `--kf-stagger` | `0.08s` | Delay between items when several appear in sequence |
| `--kf-scroll-lerp` | `0.1` | Smooth-scroll (Lenis) damping. JS reads it via `getComputedStyle` |

GSAP's most common curve, `power2.out`, is an outCubic and is softer than `--kf-ease-out`.

The motion values inside library sections come from their original sites. Leave them unchanged, and use the values above only for motion you write yourself.
