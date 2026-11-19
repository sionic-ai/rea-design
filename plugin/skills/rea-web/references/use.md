The provided text has no copyright table and no "(… reconstruction)" titles, so those two changes had nothing to apply to. If the licensing section lives in another file, send it and I'll make that edit there.

# Using the Site Library

This library contains close to a thousand well-made websites, rebuilt in our own code, subpages included. The collection keeps growing; run `rea` with no arguments for the current count. Layout, motion, hover and click behavior match the originals. Copy is replaced with English "Your … here" placeholders, and every photo is a gray box that says what kind of image belongs there.

When you're asked to build a website, landing page or homepage, don't start from scratch. Build from this library. This file is the authoritative source for how to use it.

## Two approaches

- **Section assembly (default):** For each section, pick a section from a different site, then **rebuild** them all into one page with one skin, one grammar and one transition style. Every build comes out as a different combination.
- **Whole-site copy:** Copy one site in full and fill in only the copy and photos. Use this when the user pointed at a site ("like that one") or when something needs to go up fast.

If you chain sections together without rebuilding them, the result falls apart like six sites stacked on top of each other. Re-skinning (changing only colors and type) gets you halfway at best, because each section has its own spacing units, grid and type scale. Assembly must always go as far as **"define a grammar and rebuild."**

## Tools

The library is public and served from `REA_BASE` (default `https://sionic-ai.github.io/rea-design`). The `rea` CLI that ships with the plugin reads from it.

```
rea                                                        counts by kind and role, plus available commands
rea sites [-k kind] [--light|--dark]                       sites (for picking a skeleton — colors and type are not taken)
rea sections <role> [-k kind] [-q words] [-n 12]           section candidates for a role
rea set [--base slug] [--roles about,services,…] [--alt 2] [--seed N]
                                                           one page's worth — a skeleton plus, per role, a section from a different site and alternates
rea show <slug>/<slot>                                     section HTML plus the CSS and JS lines to read with it
rea pages [-t detail] [-k kind] [-q words]                 subpages (about, list, detail, careers …) — one-line purpose and a picture
rea fx [-s slug] [-p card] [-t hover] [-q words]           motion parts — one hand-response or scroll effect each, attached to your element with data-fx
rea fx <name>                                              that part's curve, duration, how to attach it, and files
rea get <slug> --dir <project>                             download one whole site into your project
rea open <slug>                                            the live URL of that site's rebuilt page
rea url library/…                                          the public URL of any library file (pictures, code)
rea theme                                                  pick and bake a skin (see "Fit the purpose")
rea board a,b,c                                            print one gallery URL showing the chosen sites
rea check                                                  check the built page
```

Query values in any language can be passed as they are. `rea` takes care of URL encoding.

**Catalog files.** The full catalog is in `library/catalog/CATALOG.md` (site table), `sites.json` and `sections.json`. Get their URLs with `rea url`. Per-site details (fidelity, notes, fx, libs, units) live in the catalog, and `rea sites -q <slug>` prints them for one site.

**Roles.** The roles are:

- `frame`, `hero`, `about`, `services`, `work`, `news`, `careers`
- `numbers`, `info`, `testimonials`, `faq`, `schedule`, `contact`
- `band`, `media`, `footer`

Anything the labels alone couldn't classify is in `other`. If you can't find what you need, also try `rea sections other -q <words>`. Role names are single lowercase words (`info`, `services`).

**Pictures.**

- Every site has `library/<slug>/thumb.webp`, a picture of its rebuilt hero. `rea sites` prints it on a "picture:" line.
- Every section has a picture under `library/catalog/shots/…webp`. `sections` and `set` print it on a "Picture:" line.
- When choosing candidates, open the pictures and look at them yourself.

**Live pages.**

- Every site's rebuilt page is live. `rea open <slug>` gives its URL.
- `rea board a,b,c` gives one gallery link showing several chosen sites side by side.
- Sites are named by neutral English slugs. The library carries no original site names, URLs or screenshots.

## Build without asking: options only on request

The default is autopilot. Read the request, then write a one-page concept (see "Fit the purpose"). Choose the skeleton, sections and transitions yourself, and build all the way to a first version. Don't ask the person anything while building. This applies in chat threads too.

- Don't invent content the request doesn't include, such as names, addresses, menu items or numbers. Leave placeholders and list them under "to fill in" in your report.
- When done, share the link along with a short note in plain language (see "Handing it over"). Include:
  - what you built
  - one line per reference: `slug · live URL` (from `rea open`)
  - two or three things the person can say to change it ("make the hero photo bigger", "calmer colors", "show me other options")

### Options: when the person asks for them

If the person says something like "show me options", "a few candidates", "let me choose" or "let's decide together", show three reference candidates at that point. This applies before building or after the first version. Don't build a picker board or web page yourself.

**What to show.** Show **our rebuilt pictures and live rebuilt pages.**

- Pictures are each site's `thumb.webp` (the "picture:" line of `rea sites`).
- URLs are the live rebuilt pages from `rea open <slug>`. You can also give one gallery link for all three with `rea board a,b,c`.

**Candidates are whole sites.** If the person wants to choose a section or subpage, still show three sites in the same format. Add a line saying "the ○○ part of this site". The person opens the live page and scrolls down to choose.

**Check before showing.** Open the pictures before you settle on the three. Replace any that captured a loader or blank screen, and replace the set if the three look too alike.

**Format of each option.**

- Each option is `A plain-language line · live URL` plus its picture.
- Don't mention seconds, scale factors or jargon.
- Mark one of the three as recommended, with a one-line reason.
- For layout options, also say that the person is choosing structure and motion, and that colors and type will be this project's skin ("I'll use cream and coffee-bean colors").

| Where | Images | How to ask |
|---|---|---|
| Claude Code, in a terminal that renders images inline | Show the three pictures inline. Otherwise download them into the project's `_picks/` folder with `curl -o _picks/a.webp "$(rea url library/<slug>/thumb.webp)"`. | Use the question tool (AskUserQuestion). Options A, B and C have plain-language labels such as "A Forest-photo hero", with the live URL in the description. Put the recommendation first and mark it "(recommended)". |
| A terminal that can't show images, or a harness without a question tool | Image URLs (`rea url library/<slug>/thumb.webp`), or one `rea board a,b,c` gallery link | A message in the chat format below |
| Chat threads | Upload the three pictures as files. If you can't, use image URLs or one `rea board` gallery link. | One line per option plus a recommendation line |

Example chat message (posted with pictures A, B and C):

```
Here are three options for the hero of the cafe's about page
A A warm hero with hand-drawn arches and paper texture · <live URL>
B A quiet hero with a forest photo filling the screen · <live URL>
C A hero with cream and coffee colors rolling in waves · <live URL>
I recommend A — it matches the friendly feel of a neighborhood cafe. I'll use cream and coffee-bean colors. Reply with A, B or C.
```

**After the person answers:**

- Restate the choice in one line, then build. If this comes after the first version, change only that part.
- If they say "you decide", go with the recommendation.
- Keep the downloaded pictures in the project's `_picks/` folder and delete them when the build is done.

## Fit the purpose: don't just copy

Library sections were designed for the original company's purpose. If you only swap the copy, you end up with "someone else's site wearing our name tag."

**From a reference, take only the bones: layout and motion. The skin (colors and type) belongs to this project.** If you wear one reference's colors, type and devices wholesale, the result still looks like that site even after you remove sections.

Before building, read the request and write a one-page concept. Choosing, rebuilding and checking all follow it.

### The concept page

Save it as `_picks/concept.md` in the project, five lines or fewer:

- **Skin:**
  - If there's a brand (logo, colors in use, typefaces, design tokens), use it.
  - If not, pick three feeling words, choose a world and variant with `rea theme`, and bake it into `--kf-*` variables. See [theme.md](theme.md).
  - Never use a reference site's `theme.css` or its hard-coded colors and fonts.
- **First action:** the one thing a visitor should do (book, inquire, apply, start a chat, find the location). The hero and the final section both lead to this action.
- **Three feeling words:** for example calm · trust · clean, or excited · playful · bright.
- **Don'ts:** things that would hurt this purpose, such as fast text jitter for a hospital or small type for older visitors.
- **Must-have features:** things to include even if the reference doesn't have them. Examples: a hero input box for a chatbot, opening hours and a map for a shop, an apply button for a careers page.

### Motion is bone: bring all of the reference's motion

Motion is the reason to use this library.

**What to bring.**

- Bring both scroll effects and hand responses:
  - Scroll effects: pinning, scrub, split text, parallax, marquee, reveals, section transitions.
  - Hand responses: hover, press, drag, cursor, card lift, open/close, state changes, input feedback.
- Bring the curve and duration values exactly.
- In section assembly, keep each effect type as it is and adjust only duration and curve to the skeleton's tempo (step 5 below).

**When the original device goes away.** Even when you remove the original device, move its motion onto this project's sections and parts. For example:

- A Polaroid card's lift becomes the hover on a price card.
- Work cards that stack while pinned become a list that stacks while pinned.

**Motion parts.** For screens you don't take as sections (apps, launchers, dashboards), or for parts with a different shape, attach motion with **motion parts**.

- `rea fx -s <reference>` lists that site's motion as separate parts.
- Add `data-fx="<name>"` to the element. For options, child elements and inner scroll panels, see [fx.md](fx.md).
- If you pull motion out of site code by hand and rewrite it, things get lost in the move.
- Port from the site's JS and CSS only when no part exists yet (`rea fx -s` returns 0).

**When to change motion.** Change motion only when it blocks the screen's job:

- the first-action button gets pushed behind a pinned scene and can't be seen
- every page change makes the visitor wait for a loader or cover
- a response delays a press by more than 0.4 s

Even then, reduce the effect or move it before removing it. For example, show a loader only the first time. "It's a calm place" and "it's an app screen" are not reasons to cut motion.

**Accessibility and pinning.**

- Under `prefers-reduced-motion`, show the final state.
- Pinning (holding a scene in place while scrolling) must follow the length rules in step 4 of section assembly.

### Choosing and adapting sections

- **Choose by the job.** Pick candidates by whether the section's shape can do "this section's job" (step 2 of section assembly). Don't pick a section that is pretty but can't do the job.
- **Keep the layout thinking, adapt the content shape.** When rebuilding, take the arrangement, rhythm and size contrast. Change card count, text length, buttons and list columns to fit this purpose. If the original has six cards and you have three items, build three.
- **Remove what only meant something to the original company.** That includes the brand's characters, product 3D models, vertical writing, seasonal event bands and original menu names. If you need the same slot, fill it with something for this purpose.
- **Find the original's motion.** The Motion line of `rea sites -q <slug>` lists it in a form like `[scroll-scrub]`, `[pin-scrub]`, `[scroll-enter]`, `[hover]`, `[click]`, `[cursor]`, `[drag]` (these come from the breakdown card's `motion.items`). The code is in that site's `shared.js`, its page JS, and its CSS.

## Section assembly

### 1. Choose a skeleton site

Take the hero, header and footer structure and motion from this site. Don't take its colors or type; those come from the concept's skin.

- Find sites for your purpose with the "good for" notes in `rea sites -k <kind>` or `rea sites -q <words>`.
- Match brightness to the skin (`--light` or `--dark`).
- The footer pairs with the header, so the skeleton's footer is the default (`rea set` does this too).
- Many sites draw the header and footer from `shared.js`, so take them from that file.

### 2. Decide the sections

The default order is hero → about → services → work → news → contact → footer. Remove or add to fit the purpose: careers sites add careers and people sections, anniversary sites add numbers and history.

**Write each section's job in one line.** Describe what the visitor learns or does there, not the role name. Example: "Find which of the three departments fits my symptoms." If a section has no job, drop it.

**For sections the library rarely has, borrow a similar shape from another role:**

| You need | Borrow from |
|---|---|
| Event schedules and timetables | numbers/history (timelines, tabbed folders, scales) |
| Prizes and perks | services cards |
| A menu | services lists |

### 3. Draw candidates

Run `rea set --base <slug> --roles … --alt 2` to get one section per role plus two alternates. Open the code with `rea show` and decide one at a time.

- **Different sites per section.** Taking each section from a different site is the default. If the skeleton has a section that fits perfectly, you may take one or two more from it, since its grammar already matches.
- **Same brightness as the skeleton.** This is the default, and `rea set` draws this way. Sections that lean on their own colored stage (a night sky, an ink-black panel) lose half their identity when moved.

### 4. Decide order and length

This is what randomness can't give you. Before writing code, write one line per section: how many screens long it is, whether it pins, and its background color.

- **Length and pinning:**
  - The hero is under two screens.
  - At most two pinned scenes per page.
  - Total pinned length stays under one third of the whole scroll. If pins bunch up at the top, the rest of the page feels rushed.
- **Accent color:** Never put two solid accent-color sections in a row. Accent color piled up at the end (contact, footer) feels heavy.
- **3D and special scenes:** Use them only when the previous section introduces them or the next one picks them up. On their own they're decoration.
- **Dark stages on a light page:** Allow at most one in the body, and repaint it with the theme's surface colors (`--kf-surface`, `--kf-raised`, `--kf-accent-soft`, etc.). A dark footer doesn't count toward this limit.

### 5. Define one grammar

Write it down first as CSS variables, then fit every section to it.

- **Spacing:** about 6 steps (e.g. 8 · 16 · 24 · 40 · 64 · 120 px, or viewport-relative rem).
- **Grid:** 12 columns, gutter, outer margin (4 columns on phones).
- **Type:** 5–7 steps from body to the largest heading. On well-made sites the largest type is commonly 6–7× the body size.
- **One section label style and one corner radius.**
- **One motion tempo:**
  - Sites differ in tempo (fast, medium, slow), curve (sharp, medium, soft, bouncy) and scroll (native, smooth, heavy). Mixing them makes the feel change from section to section, which is awkward.
  - Take the skeleton's Motion line (`rea sites` and `rea set` give duration, curve and scroll-smoothing values). Write it down as `--kf-dur-*` and `--kf-ease-*` variables plus a single scroll-smoothing setting.
  - Pick sections from sites with the same mood first. `rea set` lists same-tempo, same-curve sections first, and you can filter with `rea sections -m slow,sharp`.
  - For sections from a different mood, keep effects like pinning, split text, parallax and hover as they are. Change only duration and curve to these variables.

### 6. Choose one transition

Use the same transition throughout a page.

- **Covering panel:** A panel with rounded top corners slides up over the previous section. Strong when the two sections have different backgrounds. White over white needs a line or shadow to show.
- **Background-color switch:** When a section crosses the middle of the screen, the whole page background changes. You only feel it when the theme's background and surface colors differ a lot.
- **Others:** spacing only, a thin rule plus a small label, a big wordmark, a curved edge, a scrolling band, or an interstitial section title.

### 7. Rebuild

Bring in the chosen section's HTML, CSS and JS, then modify them. `rea show <slug>/<slot>` gives you the HTML and the line ranges to read in the CSS and JS.

**Convert units first.** Each site uses different size units, including:

- `1rem = 100vw / 1366` (viewport-relative)
- `1rem = 10px`
- plain px
- clamp

The "Units" line in `rea show` and `rea sites` tells you which. Read each value in the source site's units before moving it, then convert to your step-5 grammar. Most of the work is here.

**Keep the section's thinking and motion.** Keep the layout thinking, the signature motion (pinning, scrub, split text, marquee, plus curve and duration values) and the hand responses ("Motion is bone"). Adapt the content shape as described in "Fit the purpose."

**Use only your grammar and your skin.**

- Sizes and spacing follow the step-5 grammar.
- Colors and type come only from the skin's `--kf-*` variables.
- Don't bring in any `theme.css` from the skeleton or the sections.
- Replace any hard-coded colors and fonts in a section with the skin's variables.

**Avoid clashes.**

- Sites share class names like `.hero`, so prefix each section's classes.
- Use one header (the skeleton's). Remove loaders, or keep just one.
- Keep `data-slot` on every section.

**Copy shared files into the project.**

- Get the shared files with `rea get _shared --dir <project>`, or fetch individual files via `rea url`.
- Copy `_shared/wire.css`, `kf-defaults.css`, `vendor/gsap/`, and any `library/_vendor/<name>` you use, for example into `vendor/`, and fix the paths.
- Don't bring `_shared/wire.js`. It's a builder's tool (for example, links back to the library listing).
- Never reference the library folder by relative path. The examples do this only because they live inside the library.

**GSAP.**

- Load GSAP with a regular `<script>` tag.
- Wrap motion in `gsap.matchMedia()`, and show the final state under `prefers-reduced-motion: reduce`.

**Large headings and wordmarks.**

- Fill large headings, wordmarks and section names that held English placeholders with English words: the brand's English name, or section names like About and Works.
- Put sentences in other languages (Korean, Japanese, etc.) on a smaller line beneath. A Latin-only display face falls back to a plain companion font when given another script at large sizes.
- If you must set another script large, load a matching typeface for that script as a pair to the skin's heading face. Match serif with serif-style (e.g. Myeongjo/Mincho) and sans with sans (e.g. Gothic), and match weight and letter-spacing. Without a pair, the browser falls back to the system font.

**Number blocks.** For sections with number blocks (results, stats, big figures):

- Use the numbers the user gave.
- If there are none, either keep the `00` placeholder or turn the block into non-numeric content (capacity, hours, steps, names).
- Never invent plausible-looking numbers.

### 8. Check

**Scroll and look.**

- Scroll from the top to the footer at 1440 and 390 widths. If you have a browser or screenshot tool, capture it. `rea check` helps here.
- Stop once at every transition.
- Horizontal overflow must be 0, and console errors must be 0.

**Check that you didn't just copy:**

- From the hero alone, can you tell within 3 seconds what this place is and what to do?
- Does each section do exactly one job, its "job of this section"?
- Is anything left whose only reason is "the original had it"?
- Is the motion alive? Did the reference's scroll effects and hand responses move onto this project's sections and parts? Screenshots don't show this, so scroll and click yourself, and list the motion count next to the reference's.
- Are all the must-have features there?
- Next to the reference's hero, does it look like a different place? It fails if the colors and type are the reference's.

If anything fails, fix it and check again.

**Don't end with a one-word "pass."** For each item, write one line per screen saying what you saw and why you judged it that way. Example: "The admin hero shows two items to review and an action button." Builders go easy on their own work. If you can call on a separate reviewer, give someone who didn't build it only the screenshots and have them run the same check.

**Examples:** `library/_examples/assembly-0` (covering panel) and `assembly-1` (background-color switch) are six randomly drawn sections rebuilt in the order above. `rea set --seed N` returns the same candidates for each role when given the same seed.

## Handing it over

The person you're building for may not be a developer. Make sure they can get all the way through without knowing code, terminals or file paths.

- **Don't ask during the build.** Ask in plain language only when they request options. Never ask about technical choices like frameworks or build tools; build static HTML.
- **Open it for them.** When done, open it in the browser right away (macOS: `open <folder>/index.html`; Windows: `start`). It opens without a server.
- **Report briefly, in plain language:**
  - what you built
  - what's in each section
  - each reference as `slug · live URL` (from `rea open`)
  - what they can change (copy, photos, colors), with two or three examples of how to ask for it, including "show me options"
  - no lists of commands, code or paths
- **Photos.** When the user posts photos in chat or puts them in the folder, place each one in the slot whose `data-label` matches it, cropping to fit if the ratio differs. If a section has a filter on its photo slot (thermal, grayscale, halftone, color overlay), the user's photo will change too. Tell them before inserting it and ask whether to keep the original colors.
- **Sharing.** If they need a shareable URL, pick one static host that accepts a folder upload (Netlify Drop, GitHub Pages, Cloudflare Pages, etc.). Walk them through what to click, in order, or upload it for them if they give permission.

## Subpages: about, lists, details, careers …

If the request includes pages like about, lists or careers, build them as one set with the homepage. If they only mentioned the homepage, build only that, and add one line to your report listing pages you could also build: about · work list + detail · news list + article · careers · contact.

**Page types** use fixed names:

| Type | Page |
|---|---|
| `about` | about |
| `service` | services, business |
| `product` | product list |
| `works` | work or case list |
| `detail` | one work, case or product |
| `news` | news list |
| `article` | one article |
| `recruit` | careers |
| `contact` | contact |
| `lookbook` | lookbook |
| `page` | anything else |

**Choosing.** Run `rea pages -t <type>`. Each page comes with one line on what it shows and what it's for, plus a picture. If the person asks for options, show three sites that have that page, using their pictures and live URLs (see "Options").

**Where to take it from.** If the skeleton site has a page of the same type, use it first, since its header, footer and grammar already match. If not, rebuild a page of the same type from another site with the homepage's grammar and theme.

**Lists and details are a pair.**

- Clicking a list card goes to the detail page.
- Build the detail page once and reuse it for every item by changing only the content.
- Add a "next item" link at the bottom of the detail page so visitors can cycle through the list.

**Links.** Fix menu and footer links so the built pages link to each other.

## Whole-site copy

1. **Choose.** Use `rea sites -k <kind>` and `thumb.webp`. If the fidelity printed by `rea sites -q <slug>` is "medium", read its notes (where it differs from the original) first.
2. **Download.** Run `rea get <slug> --dir <project>`.
   - Pages reference `../../_shared/`, so keep `_shared/` alongside at the right depth or fix the paths.
   - If a page references `../_vendor/`, include `library/_vendor/` too.
3. **Fill it in.**
   - Copy goes into the "Your … here" slots.
   - Photos go into `.wf-img` slots, matched by `data-label`.
   - Swap `theme.css` for the concept's skin. Unless "like that site" included its colors, don't keep the original skin.
   - Remove and add sections in `data-slot` units.
4. **Write the concept here too.** Remove the don'ts and anything that only meant something to the original, and add the must-have features. Check with the copy check from step 8 of section assembly.

## Rules

- Build in the user's project folder. Never modify anything inside the library folder.
- Fill copy with what the user gave you, or leave placeholders. Never add invented descriptions or performance numbers.
- The library contains no original names, URLs, text, photos or logos. Never bring in another company's text, photos, logos or code. The library is already newly written code, so use only that.
- The blue motion notes (`.wf-note`) are for builders. On finished pages, hide them with `<html class="wf-hide-notes">` or delete them.
- There are no app or dashboard skeletons. Use skeletons and sections for about, promotional, portfolio, event and careers sites. For apps, take only motion parts (`rea fx`) and the skin.
