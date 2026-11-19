# Copyright: Reference Use vs. Commercial Work

The library was built by studying real company websites, **taking only their structure, proportions, and motion values, and rebuilding everything in our own code**. It contains none of the original sites' text, photos, logos, video, or code files. The public library also contains no original-site screenshots, URLs, or names. Every site has a neutral English slug.

Even so, follow the rules below when you put library output into anything public-facing, such as client sites, product pages, or marketing pages. These are working guidelines, not legal advice. If a lot is at stake, for example a sale or a delivery to an outside client, check with a lawyer first.

## At a glance

| What | Reference / internal use | Commercial work |
|---|---|---|
| Layout, spacing, motion values, hover responses | OK | Assembling sections is OK. Copying one site's entire look wholesale needs review: imitating a specific company's full visual identity can lead to trade dress or unfair competition disputes |
| Leftover brand traces | The public build strips names, domains and logos automatically; if you spot one, open an issue | Same. If you spot one, open an issue and remove it before shipping |
| SVG or canvas art redrawn in the same place and style as the original artwork (`data-art`, e.g. logo slots, characters, trees) | OK | Replace with your own artwork |
| Photo and video slots | OK | OK. These are placeholders only. Use only real photos you own or have rights to |
| Placeholder copy ("Your … here") | OK | Replace with your own text |
| Bundled open-source libraries (`_vendor`: lenis, swiper, barba, swup, three, ogl, pixi.js, lottie-web, splide, embla, etc.) | OK | OK. All are MIT. Keep each folder's LICENSE file alongside the code |
| GSAP (`_shared/vendor/gsap`, including plugins) | OK | Free for use in websites and apps. You may not build a product that competes with Webflow, meaning a visual, no-code animation-building tool. Contact GSAP first if you plan to build one. Do not remove the copyright headers |
| Fonts: Google Fonts, Pretendard, Galmuri, etc. (OFL), and `rea theme` fonts | OK | OK |
| Fonts: Fontshare (ITF Free Font License, used in a few `theme.css` files in the library) | OK | OK for your own websites and apps. Not allowed: handing the font files to clients or contractors, offering them as selectable fonts in a template editor or SaaS, or subsetting or modifying them. **For client deliveries, swap them for OFL fonts** |

If you pull components from outside the library, note the licenses. React Bits and Animate UI use MIT + Commons Clause, and Aceternity uses its own license. You may use these components inside your finished work. You may not redistribute or sell the components themselves, whether bundled together or packaged as a template.

## Checks before shipping

Run these checks before shipping, inside the folder created by `rea get <slug> --dir <project>`:

```sh
grep -n 'data-art' *.html *.js                                # redrawn artwork slots to replace with your own
grep -n -i 'fontshare' *.css                                  # fonts to swap for OFL before client delivery
grep -n 'Your .* here' *.html                                 # placeholder copy not yet replaced
```

To review a site's catalog fields (fidelity, notes, fx, libs, units), run `rea sites -q <slug>`.

## What not to do

- Do not take text, photos, logos, font files, or code directly from the original sites. The library is already freshly written code, so use only that.
- Do not use the original site names in your work or in marketing copy (for example, "built to look like the ○○ site").
- Do not publish pages that still contain traces of the original sites, or that contain private information, at a public URL without password protection.
