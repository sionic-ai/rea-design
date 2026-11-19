# Editorial Layout

This document covers **layout only**: skeleton, whitespace, hierarchy, section boundaries, and image placement.
Surface styling such as color, type, and corner radius comes from `rea theme` (see [theme.md](theme.md)) and is applied through the theme's CSS custom properties (`--kf-*`). Components and motion come from the library (see [library.md](library.md)).

If the user asks for a different direction, the user wins. If the project already has a design system (a token file or a `DESIGN.md`), use it.

## Principles

- **Build hierarchy with whitespace and type-size contrast.** Don't divide regions with card grids or boxes inside boxes. Separate groups with thin rules and whitespace.
- **Place things asymmetrically.** Don't center everything.
- **Images and real content are the stars of the page.** Text is limited to headings and data. Give every section at least one image or illustration, and never build a section that is only dense text.
- **Layout comes first.** Build a static page with no motion, hover effects, scroll reactions, background shaders, or 3D. Check that it holds up as editorial design, and only then add effects.
  Keep effects restrained: entrances and hover only. Don't make something pop out on every scroll. (If you pulled a section from the library, keep that section's motion at its original values.)
- **Keep one mode across the whole page.** On a light-mode page, don't flip a single region to dark.
- **Check the library before hand-building.** For each slot, look at library sections and motion parts first (`rea sections <role>`, `rea fx`).

## What to leave out: numbers and copy

Don't add text whose only job is to describe the screen.

- Hero intro sentences and slogans, one-line descriptions under section headings, and usage instructions.
- Explanatory prose in full sentences ("We built…", "This lets you…"), "X, not Y" contrast headings, and backstory such as "so we decided to…".
- **All performance and outcome numbers.** This covers more than cards, stat bands, and count badges. It also covers numbers tucked into fact rows, captions, or the end of a timeline as noun phrases.
  Examples: "15% more accurate", "300 clients", "1.2s response", "−66%", and any counts, amounts, or scale figures.
- 01/02/03 numbering on content that has no real order.
- Buttons that don't say what happens when clicked, such as "Get started" or "Learn more".
- Emoji. If you need an icon, use SVG.

**What stays:**

- Headings (noun phrases)
- Dates and periods
- Product, model, and tool names
- Real content (body text)
- A single noun phrase saying *what something is*
- Button labels that say what happens when clicked

**Charts depend on what they show.** Keep comparison charts that measure several subjects on the same scale. Remove growth charts that brag about results, and replace them with a before/after diagram (SVG).

**Operational values stay.** Configuration values and limits describe how something works, not what it achieved. When in doubt, ask: "What is this number trying to prove?"

**Don't invent content.** If there is no real content, don't make up sentences. Leave the slot as a heading plus an image, and ask the user what should go there. Never invent experience or roles the person doesn't have.

**Review the final text.** When you're done, read through all the text on screen. Components sometimes fill in numbers or copy on their own.

**Fact rows don't get a heading by default.** Only add a heading when it is a feature name. Instead of forced labels like "Scale" or "Results", write a single line in one of these forms:

- `Feature name — noun phrase · noun phrase · noun phrase`
- A single noun phrase with no heading

## Images: if you don't have them, make them

Images speak instead of text. When choosing a skeleton, decide the image slots first, then fill every one.

1. **Start with what exists.** Use images in the project folder, photos the user provided, and screenshots of the real product or screens. For a website, run `rea check <url> --desktop --shot a.png`.
2. **If nothing exists, generate.** Use whatever image generator the user has available. Generate at the slot's size, for example 1920x1080 for a full-width band.
   - Describe the subject's real materials, places, and objects specifically. Avoid generic stock imagery such as people smiling at laptops or floating abstract blobs.
   - Put the chosen theme's colors and mood into the prompt so the images match the page.
   - Append `no text, no letters, no logos, no watermark`. Lay any text over the image in HTML.
   - Match the slot's aspect ratio: wide for full-width bands, tall for side columns. Use the `data-label` on library photo slots (subject, lighting, composition) as prompt material.
3. **Look before you place.** Downscale each image (for example, `sips -Z 1200` on macOS) and open it. If it misses the subject or text got rendered into it, fix the prompt and try once more. If it's still wrong, leave the slot empty and tell the user.
4. **Save and optimize.** Save images to an image folder inside the project and optimize them for the web: webp or jpg, longest side 2400px or less. Write `alt` text as noun phrases.

## Choosing a layout: different every time

There is no fixed skeleton. Pick one value per axis, and base each choice on the subject:

- What is the page showing?
- How many images are there, and what are their proportions?
- How much text is there?

| Axis (log key) | Candidates |
|---|---|
| Skeleton `grid` | margin-led (wide empty left margin with pinned labels, body in a narrow right column) / newspaper columns (two or three columns separated by whitespace) / sidenote (one body column, with captions and small images in the outer margin) / index-led (the first screen is a big one-line list) / photo-led (full-bleed images alternating with captions) / asymmetric split (pinned image on one side, scrolling content on the other) / single-screen stage (no scrolling; scenes swap within one screen, for fewer than ten works or chapters) |
| First screen `hero` | one big heading / one image / index / heading and image split in two / collage (photos and cutouts of different sizes overlapped and scattered, with the name between them) |
| Section boundary `boundary` | big wordmark / full-bleed image / thin rule + small uppercase label / whitespace only / curved edge (waves, ridgelines, or silhouette curves dividing surfaces) / background color shift (the whole background changes per section, within the same lightness) / overlapping panel (a panel with rounded top corners, or stepped blocks, slides over the previous section) / chapter interstitial (one small chapter title centered on an empty screen) / marquee band (a horizontal band of scrolling text, sometimes two staggered rows) |
| Image placement `image` | full-bleed band / fit to column / bleeding into the margin / row of small images / pinned beside body text / scattered collage (photos of different sizes overlapped or tilted) |
| Signature moment `signature` | giant heading / giant quote / repeated same-shape rows (a short list within one region) / image collection / one-line list / repeated brand shape (one shape from the logo repeated per section, changing only size and position) |
| Density `density` | airy (one screen per region) ↔ dense like a newspaper |
| Corner `corner` | identity label top-left + button top-right / single-line top nav / vertical label on the left / none / floating pill nav (a rounded bar floating at top or bottom center after the first screen) / menu left, logo center, button right / pinned left table of contents (section list pinned to the left, marking the current section) |

**Differ from the last page.** Read the last three lines of the log (see below). Choose at least three axes that differ from the previous page. If the user says "like last time", follow that, but still change one axis.

**Don't pick only the common values.** An analysis of 100 well-made sites found these values most common:

- asymmetric split: 37%
- one image: 42%
- fit to column: 42%
- single-line top nav: 40%
- giant heading: 36%

Picking all five produces "the well-made average". Choose at least two axes from candidates under 10%, for example:

- newspaper columns: 1%
- sidenote: 3%
- index: 1%
- bleeding into the margin: 3%
- giant quote: 2%
- curved edge or background color shift: 8%

**Within one site, share only the frame.** Multiple pages and sections share the skeleton, corner, boundary, and theme. They don't share the internal composition of each section.

**Vary consecutive sections of the same kind.** When several sections of the same kind follow each other, change the composition each time. Candidate compositions:

- horizontal timeline
- mirrored left/right
- big figure (chart or diagram) + one-line rows
- three columns of small cases
- step-by-step story + figure
- big photo

Never reuse the composition of the section right before. Reserve "repeated rows" for a short list within a single region.

## Korean body text

When the content is in Korean, use:

```css
word-break: keep-all;        /* break Korean lines at word (eojeol) boundaries */
overflow-wrap: anywhere;     /* break long code tokens and URLs before they overflow the column */
```

- Give grid and flex children `min-width: 0`. Without it, the two rules above have no effect.
- Use a line height of 1.75–1.85. Size columns to fit 35–45 Korean characters per line.
- Use one politeness register (해요체 or 습니다체) consistently within a screen.

## Phone width

At phone width (about 400px):

- Collapse columns, margin-led layouts, and splits into a single column.
- Return pinned labels and images to the normal flow.
- Re-crop full-bleed images to a portrait-leaning ratio.

After collapsing, measure the result with [mobile.md](mobile.md).

## Log: so each page differs from the last

For every page you build, append one line to a log file on your own machine: `~/.local/share/rea-design/layout-log.jsonl`.

```sh
tail -n 3 ~/.local/share/rea-design/layout-log.jsonl 2>/dev/null     # before choosing
mkdir -p ~/.local/share/rea-design && printf '%s\n' '{"date":"2026-11-02","project":"…","url":"…","grid":"…","hero":"…","boundary":"…","image":"…","signature":"…","density":"…","corner":"…","theme":"<world[/variant]>"}' >> ~/.local/share/rea-design/layout-log.jsonl
```

Write axis values exactly as the candidate names appear in the table above.

## Workflow

1. **Study the subject and content.** What does the page show? What real data and images exist?
2. **Choose the axes.** Read the last three lines of the log. For each axis, write down the chosen value and a one-line reason, and flag any axis that matches the previous page. If sections of the same kind follow each other, also write down the composition for each one.
3. **Choose and generate a theme** with `rea theme` ([theme.md](theme.md)).
4. **Gather or generate images.**
5. **Build.** Start with a static page with no effects. Check that the layout holds, then fill in the effect slots. Use color, type, and corner radius only through the theme's `--kf-*` variables.
6. **Record your choices in the CSS.** At the top of the CSS, add:
   - `/* ref: <slug>(skeleton) · <slug>(signature) … */`
   - `/* editorial · grid: … · hero: … · boundary: … · image: … · signature: … · density: … · corner: … · theme: <world[/variant]> */`

   The `ref` line is a working note that lists the library slugs you drew from. Remove it from any version shipped to clients or published externally.
7. **Append a line to the log.**
8. **Screenshot and review.** Compare all on-screen text against "What to leave out".
