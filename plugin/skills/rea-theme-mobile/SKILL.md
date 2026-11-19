---
name: rea-theme-mobile
description: "Pick and bake a skin (colors, type, radius, motion character) from 30 theme worlds and 428 variants into --kf-* CSS variables, or fix a page for phones with a measured 390×844 gate (overflow, first-screen data, touch targets). Use for 'choose a theme', 'pick colors and fonts', 'dark version', 'it breaks on mobile', 'make it responsive'."
---

# rea-theme-mobile — skin and phone gate

## Skin

```sh
rea theme                                         # 30 worlds: brightness · variant count · metaphor
rea theme <world> --variants                      # variants: one line each (background, accent)
rea theme <world>[/<variant>] --out css/kf-theme.css
```

1. Pick the world whose metaphor fits the subject and the three feeling words. Avoid the world used on the previous page (layout log).
2. Bake into the project and load it before the page CSS. It includes the `@font-face` rules.
3. Use only the variables: `--kf-bg surface raised line ink ink-soft dim accent accent-soft accent-text on-accent success danger warning`, `--kf-font-sans|display|mono`, `--kf-weight-*`, `--kf-tracking`, `--kf-radius-sm|md|lg|pill`, `--kf-shadow-soft|lift`, `--kf-ease*`, `--kf-dur-*`. Tints with `color-mix(in oklab, var(--kf-ink) 12%, transparent)`.
4. On a pulled library site, replace its `theme.css` with the baked file; that is where every site keeps its whole skin.
5. A brand or design system beats any world. Map it onto the same `--kf-*` names.

Details: [theme.md](../rea-web/references/theme.md).

## Phone gate

```sh
rea check <page.html|url> [--data '<row selector>'] [--shot phone.png]
rea check <page.html|url> --desktop --shot desktop.png
```

It reports horizontal overflow (must be 0, with the offending elements), the y where data starts (fix if over 300 px at 390×844), touch targets under 44 px, and console errors. Fix by laying things flat, not by hiding them, and match rules other screens already use. Report before and after numbers.

Pass conditions and the hygiene checklist: [mobile.md](../rea-web/references/mobile.md).
