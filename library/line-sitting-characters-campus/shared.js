// Common to all pages: draws the notice strip, header, round menu panel, search field, footer and PAGETOP, and fills hand-drawn character SVGs into each slot.
// Original values: interaction response 295ms cubic-bezier(.455,.03,.515,.955) · strip 42px per second (35px at 979px or less) · notice close .3s · menu panel fade 295ms.
// The original hides the body until html.is-loaded is added after load (no loader).
(() => {
  const page = document.body.dataset.page || "home";
  const BC = (window.BC = {});

  const svg = (vb, body, cls = "") => `<svg viewBox="${vb}" class="${cls}" aria-hidden="true">${body}</svg>`;
  const ICON = {
    arrow: svg("0 0 16 14", '<path d="M0 6.1h12.2L7.6 1.5 8.9.2 15.7 7l-6.8 6.8-1.3-1.3 4.6-4.6H0z" fill="currentColor"/>'),
    chev: svg("0 0 8 14", '<path d="M1.2 0 8 7l-6.8 7L0 12.8 5.6 7 0 1.2z" fill="currentColor"/>'),
    search: svg("0 0 30 30", '<circle cx="12.5" cy="12.5" r="10" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m20 20 8.5 8.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
    x: svg("0 0 24 24", '<path d="M3 3h5l13 18h-5zM3.5 21 10 13.8M20.5 3 14 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>'),
    time: svg("0 0 16 16", '<circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 4v4.4l3 1.8" fill="none" stroke="currentColor" stroke-width="1.2"/>'),
    link: svg("0 0 16 16", '<path d="M6 3H3v10h10v-3M9 2h5v5M14 2 7 9" fill="none" stroke="currentColor" stroke-width="1.4"/>'),
    list: svg("0 0 18 14", '<path d="M5 2h12M5 7h12M5 12h12" stroke="currentColor" stroke-width="1.6"/><circle cx="1.5" cy="2" r="1.3" fill="currentColor"/><circle cx="1.5" cy="7" r="1.3" fill="currentColor"/><circle cx="1.5" cy="12" r="1.3" fill="currentColor"/>'),
    up: svg("0 0 12 25", '<path d="M6 24V2M1 7l5-5.5L11 7" fill="none" stroke="currentColor" stroke-width="1.6"/>'),
    down: svg("0 0 10 12", '<path d="M4.3 0h1.4v8.6l2.8-2.8 1 1L5 11.3.5 6.8l1-1 2.8 2.8z" fill="currentColor"/>'),
    play: svg("0 0 6 7", '<path d="M0 0l6 3.5L0 7z" fill="currentColor"/>'),
    pause: svg("0 0 6 6", '<path d="M0 0h2v6H0zM4 0h2v6H4z" fill="currentColor"/>'),
    prev: svg("0 0 22 12", '<path d="M22 5.1H3.5l4.1-4L6.4 0 .3 6l6.1 6 1.2-1.1-4.1-4H22z" fill="currentColor"/>'),
    next: svg("0 0 22 12", '<path d="M0 5.1h18.5l-4.1-4L15.6 0l6.1 6-6.1 6-1.2-1.1 4.1-4H0z" fill="currentColor"/>'),
  };
  // Like the original, keep icons as one sprite set (symbol) and reuse it in each place <use> Called that — even if the color changes when a hand is raised, the icon follows currentColor
  const sprite = document.createElement("div");
  sprite.hidden = true;
  sprite.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">${Object.entries(ICON).map(([k, s]) => s.replace(/^<svg viewBox="([^"]+)"[^>]*>/, `<symbol id="bc-i-${k}" viewBox="$1">`).replace(/<\/svg>$/, "</symbol>")).join("")}</svg>`;
  document.body.prepend(sprite);
  const icon = Object.fromEntries(Object.entries(ICON).map(([k, s]) => [k, `<svg viewBox="${s.match(/viewBox="([^"]+)"/)[1]}" aria-hidden="true"><use href="#bc-i-${k}"></use></svg>`]));
  // Stands in for the original emoji table — redrawn as same-size single-color symbols (one accent dot)
  const mark = {
    home: svg("0 0 24 24", '<path d="M3 11 12 3l9 8v10H3z" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="1.6" stroke-linejoin="round"/><rect x="10" y="14" width="4" height="7" fill="var(--kf-accent)"/>'),
    books: svg("0 0 24 24", '<rect x="3" y="15" width="18" height="5" rx="1" fill="var(--kf-accent)" stroke="var(--kf-ink)" stroke-width="1.4"/><rect x="5" y="9.5" width="15" height="5" rx="1" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="1.4"/><rect x="4" y="4" width="16" height="5" rx="1" fill="var(--kf-ink)"/>'),
    flag: svg("0 0 24 24", '<path d="M5 21V3" stroke="var(--kf-ink)" stroke-width="1.8"/><path d="M6 4h13l-3 4.5 3 4.5H6z" fill="var(--kf-accent)"/>'),
    book: svg("0 0 24 24", '<path d="M2 6c4-1.5 7-1 10 1v13c-3-2-6-2.5-10-1zM22 6c-4-1.5-7-1-10 1v13c3-2 6-2.5 10-1z" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="1.5" stroke-linejoin="round"/><path d="M4.5 10h5M14.5 10h5" stroke="var(--kf-accent)" stroke-width="1.5"/>'),
    school: svg("0 0 24 24", '<path d="M3 21V10l9-6 9 6v11z" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="1.5" stroke-linejoin="round"/><rect x="9.5" y="14" width="5" height="7" fill="var(--kf-accent)"/><circle cx="12" cy="9.5" r="1.8" fill="var(--kf-ink)"/>'),
    ask: svg("0 0 24 24", '<circle cx="12" cy="12" r="10" fill="var(--kf-accent)"/><path d="M9 9.5a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4" fill="none" stroke="var(--kf-ink)" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17.5" r="1.2" fill="var(--kf-ink)"/>'),
    globe: svg("0 0 24 24", '<circle cx="12" cy="12" r="10" fill="var(--kf-accent)" stroke="var(--kf-contrast-ink)" stroke-width="1.2"/><path d="M2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20" fill="none" stroke="var(--kf-contrast-ink)" stroke-width="1.2"/>'),
    door: svg("0 0 24 24", '<rect x="5" y="2.5" width="14" height="19" rx="1" fill="var(--kf-accent)" stroke="var(--kf-contrast-ink)" stroke-width="1.2"/><circle cx="15.5" cy="12.5" r="1.4" fill="var(--kf-contrast-ink)"/>'),
  };
  BC.icon = icon;
  BC.mark = mark;
  const ic = (name) => `<span class="bc-ic">${mark[name]}</span>`;
  BC.ic = ic;

  // Original symbol (circle·bar·square group) slot — a placeholder symbol redrawn with geometric shapes of the same width·height
  BC.symbol = (label = "Brand Mark") => svg("0 0 457 125", `
    <g fill="none" stroke="var(--kf-ink)" stroke-width="2.4">
      <circle cx="80" cy="80" r="40"/><circle cx="80" cy="80" r="28"/><circle cx="80" cy="80" r="16"/>
      <path d="M22 118 52 46M108 46l30 72M120 24v16M127 22v16"/>
      <path d="M156 118 180 22"/>
      <rect x="248" y="74" width="78" height="40"/><path d="M256 84h60v20h-60"/>
      <circle cx="398" cy="84" r="36"/><circle cx="398" cy="84" r="22"/><path d="M366 30h60M396 10v40"/>
    </g>
    <circle cx="70" cy="28" r="20" fill="var(--kf-ink)"/><circle cx="66" cy="26" r="9" fill="none" stroke="var(--kf-surface)" stroke-width="2"/>
    <circle cx="214" cy="80" r="40" fill="var(--kf-ink)"/><circle cx="214" cy="80" r="22" fill="none" stroke="var(--kf-surface)" stroke-width="2.4"/><circle cx="214" cy="80" r="10" fill="none" stroke="var(--kf-surface)" stroke-width="2.4"/>
    <rect x="248" y="18" width="78" height="40" fill="var(--kf-ink)"/><path d="M258 30h56v18" fill="none" stroke="var(--kf-surface)" stroke-width="2.4"/>
    <rect x="368" y="34" width="56" height="26" fill="var(--kf-surface)" stroke="var(--kf-ink)" stroke-width="2.4"/>
    <path d="M368 40l10-6M368 50l20-16M370 58l28-24M380 60l28-26M392 60l28-26M404 60l20-18M416 60l8-7M378 34l46 26M366 42l34 18M390 34l34 20" stroke="var(--kf-ink)" stroke-width="1.6"/>
    <title>${label}</title>`);

  // —— Hand-drawn characters — redrawn at each original GIF spot with the same ratio·same type (black silhouette + white face, eye rolling·blinking·walking) ——
  const eye = (cx, cy, r = 6, ring = true) => `<g data-fx-part="eye"><ellipse class="card${ring ? " ln-thin" : ""}" cx="${cx}" cy="${cy}" rx="${r * 1.3}" ry="${r * 0.82}"/><circle class="ink" data-fx-part="pupil" cx="${cx}" cy="${cy}" r="${r * 0.48}"/></g>`;
  const catSit = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="tail" data-fx-part="tail" d="M42 76c16 2 24-10 18-26"/><path class="ink" d="M8 80C2 62 4 40 12 30L9 4l13 13h12L46 4l-3 26c8 10 10 32 4 50Z"/>${eye(19, 28, 3.6, false)}${eye(35, 28, 3.6, false)}</g>`;
  const catWalk = (x, y, s = 1, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path class="tail" data-fx-part="tail" d="M6 22C-6 16-6 2 4-4"/><g data-fx-part="leg-a" class="ink"><path d="M16 30 9 58h7l9-26zM74 30l6 28h7l-4-30z"/></g><g data-fx-part="leg-b" class="ink"><path d="M22 30l4 28h7l-2-28zM70 30l-7 28h7l8-26z"/></g><path class="ink" d="M6 22c12-12 50-14 70-8l9-13 4 9 7-9 2 13c7 7 4 18-4 20-8 4-14 2-18 7-16 4-42 4-58-2C6 32-2 30 6 22z"/>${eye(92, 14, 2.6, false)}</g>`;
  const ILL = {
    // Under the Hero ”See more About” speech bubble — a person reading lying down + a sitting cat (269:150)
    reader: svg("0 0 269 150", `<path class="ink" d="M22 74C6 54 18 22 46 22c10-16 42-18 54-2 22-6 42 10 36 32 14 14 4 36-16 36H34C24 88 16 84 22 74z"/><path class="card ln" d="M76 54c24-4 46 10 46 32 0 22-12 36-32 38H68c-8-20-8-52 8-70z"/>${eye(90, 78, 5.5)}${eye(110, 76, 5.5)}<path class="ln" d="M92 100c5 3 11 3 16 0"/><path class="card ln" d="M56 132c6-16 40-22 66-10 10 6 14 12 12 20H56z"/><path class="card ln" d="M66 142l42-12 42 12-42 7z"/><path class="ln-thin" d="M108 130v19"/>${catSit(196, 64, 0.95)}`),
    // Left of the event section — a book with eyes walks and a cat follows (415:306)
    bookcat: svg("0 0 415 306", `<g transform="translate(40 40)"><path class="card ln" d="M20 8 104 0v170l-84 8z"/><path class="ln-thin" d="M104 0l14 12v168l-14-10M30 120h60M30 134h60M30 148h44"/><path class="ln" d="M104 6l10 10M104 20l10 10M104 34l10 10M104 48l10 10M104 62l10 10"/>${eye(44, 54, 9)}<g data-fx-part="leg-a"><path class="ln" d="M40 178 30 246h12M80 176l10 70h12"/></g><g data-fx-part="leg-b"><path class="ln" d="M46 178l8 68h12M76 176l-12 70h12"/></g></g>${catWalk(206, 168, 1.9)}`),
    // Event section right side — a person resting their chin on a hand and a laptop (467:483)
    laptop: svg("0 0 467 483", `<path class="ink" d="M150 40c20-34 90-40 120-10 10-10 30-6 34 8-10 0-14 6-12 14-30-10-90-4-142-12z"/><path class="card ln" d="M146 52c40-14 120-14 150 8 24 30 22 92-6 120-36 30-110 30-140-6-26-36-28-96-4-122z"/>${eye(196, 118, 10)}${eye(250, 118, 10)}<path class="card ln" d="M118 470c-6-90 20-150 70-176 60-26 140-8 170 56 14 40 14 82 6 120z"/><path class="card ln" d="M200 230c-14-6-30 4-26 22l18 56c4 10 18 12 26 4l10-12"/><path class="ink" d="M196 214c10-6 24 0 22 14l-6 26-24-8z"/><path class="ink" d="M40 470 90 330h170l40 140z"/><path class="ln-thin" d="M20 470h330"/>`),
    // Below the article section — a person reading a newspaper + a cat lying down (694:467)
    paper: svg("0 0 694 467", `<path class="ink" d="M190 60c-4-40 50-62 80-40 30-24 80-6 76 34 30 10 30 50 0 60H200c-30-6-40-40-10-54z"/><path class="card ln" d="M150 140h260l-10 230H160z"/><path class="ln" d="M280 140v230"/><rect class="ink" x="186" y="176" width="70" height="16"/><path class="ln-thin" d="M186 210h70M186 226h70M186 242h50M304 176h70M304 192h70M304 208h52M304 240h70M304 256h70"/><path class="card ln" d="M150 220c-26-4-40 20-30 44l20 46M410 220c26-4 40 20 30 44l-20 46"/><path class="card ln" d="M120 440c-6-40 10-70 40-70h240c30 0 46 30 40 70z"/><path class="ln" d="M40 446h620"/>${catWalk(470, 360, 1.7)}`),
    // Article section right side — black lump and thought cloud (481:385)
    think: svg("0 0 481 385", `<path class="ink" d="M40 120c-30-50 20-110 80-90 40-40 120-30 130 30 40 20 30 90-20 100-30 30-110 40-150 10-30-4-50-26-40-50z"/>${eye(96, 112, 10, false)}${eye(140, 104, 10, false)}<path class="card ln" d="M190 140c-10-50 40-90 100-70 50-30 130-4 140 50 40 20 40 90-10 110-10 40-70 60-120 40-60 20-130-10-130-60-20-20-10-60 20-70z"/>${eye(300, 150, 9)}${eye(350, 148, 9)}<circle class="card ln" cx="300" cy="300" r="14"/><circle class="card ln" cx="270" cy="332" r="9"/><circle class="ink" cx="250" cy="356" r="6"/>`),
    // Below the School section — three books with eyes + a stretching cat (728:283)
    books: svg("0 0 728 283", `<g transform="translate(50 60)"><path class="card ln" d="M0 10 50 0v200L0 210z"/><path class="card ln" d="M50 0l56 8v200l-56-8z"/><path class="card ln" d="M106 8l56 6v196l-56-2z"/><path class="ln-thin" d="M10 30v160M60 20v170M70 20v170M116 30v160M126 30v160"/>${eye(84, 80, 8)}${eye(140, 86, 8)}</g>${catWalk(330, 150, 2.3)}<path class="ln" d="M0 272h728"/>`),
    // Bottom left of the facility section — two people talking face to face (313:187)
    talk: svg("0 0 313 187", `<path class="ink" d="M30 120C10 90 20 40 70 40c40 0 60 30 50 70z"/><path class="card ln" d="M60 90c20-20 60-10 60 20 0 20-10 30-30 30-30 0-40-30-30-50z"/>${eye(96, 98, 5)}<path class="card ln" d="M40 187c0-40 20-60 60-60 30 0 50 30 50 60z"/><path class="card ln" d="M140 140c10-10 22-4 20 8l-14 18"/><path class="ink" d="M190 70c0-30 30-50 60-46 30 4 50 30 44 56-30-14-70-14-104-10z"/><path class="card ln" d="M196 74c30-8 70-6 90 6 6 30-10 60-44 60-34 0-52-30-46-66z"/>${eye(226, 96, 5)}${eye(252, 96, 5)}<path class="card ln" d="M180 187c0-36 26-56 64-56 34 0 58 24 58 56z"/>`),
    // Bottom right of the facility section — cup character sitting in a chair + hammock chair (277:229)
    chairs: svg("0 0 277 229", `<path class="ln-thin" d="M70 10c-10 6 10 14 0 22M84 6c-10 8 10 16 0 26"/><path class="card ln" d="M46 40h66l-8 92H54z"/><path class="ink" d="M46 40h66v14H46z"/>${eye(68, 82, 6)}${eye(92, 82, 6)}<path class="ln" d="M70 104h18"/><path class="card ln" d="M30 120c0-30 100-30 100 0v24H30z"/><path class="ln" d="M40 144 30 220M120 144l10 76M60 150v66M100 150v66"/><path class="card ln" d="M170 60c20-40 90-30 90 20 0 40-20 66-50 70h-50c-10-30-6-66 10-90z"/><path class="ln-thin" d="M170 70l80 70M180 60l76 66M200 52l58 50M166 96l60 54M168 124l26 24M250 66l-82 82M234 56l-70 60M260 98l-48 50M220 52l-54 46"/><path class="ln" d="M180 150l-12 70M240 150l12 70"/>`),
    // Offline cell header — a cluster of blobs, one in black (560:321)
    crowd: svg("0 0 560 321", `<path class="card ln" d="M40 220c-30-40 0-100 60-90 20-40 90-50 120-10 40-20 90 10 80 60 30 30 10 80-40 80H90c-40 0-60-20-50-40z"/>${eye(120, 200, 8)}${eye(160, 196, 8)}<path class="card ln" d="M190 200c-10-50 40-80 90-60 40-30 110-10 110 40 30 10 30 60-10 70H220c-30 0-40-30-30-50z"/>${eye(290, 200, 8)}${eye(330, 198, 8)}<path class="ink" d="M330 120c-10-60 60-100 120-70 50-10 90 40 70 90 20 40-20 80-70 70-40 30-110 10-120-30-20-20-20-50 0-60z"/>${eye(400, 120, 8, false)}${eye(440, 116, 8, false)}<circle class="card ln" cx="250" cy="296" r="10"/><circle class="card ln" cx="226" cy="312" r="6"/>`),
    // Online cell graphic — a browser window and a dark blob peeking in (507:337)
    screen: svg("0 0 507 337", `<rect class="card ln" x="150" y="40" width="340" height="230" rx="10"/><path class="ln" d="M150 76h340M150 120h340"/><circle class="ink" cx="170" cy="58" r="4"/><circle class="ink" cx="184" cy="58" r="4"/><circle class="ink" cx="198" cy="58" r="4"/><path class="ln-thin" d="M168 98h50"/><path class="card ln" d="M260 140h200c16 0 28 14 28 30v70c0 16-12 30-28 30H260c-40 0-70-30-70-65s30-65 70-65z"/><rect class="card ln" x="300" y="164" width="120" height="72" rx="6"/><path class="ln-thin" d="M306 230l60-60M320 236l70-70M340 236l74-70M360 236l60-56M380 236l40-36M306 210l40-40M306 190l20-20"/><circle class="card ln" cx="234" cy="205" r="8"/><circle class="card ln" cx="450" cy="205" r="8"/><path class="ink" d="M20 160c-20-40 20-90 70-80 40-20 90 10 80 50 20 30-10 70-50 66-30 20-80 10-90-20-10-4-14-10-10-16z"/>${eye(70, 130, 9, false)}${eye(110, 126, 9, false)}<path class="card ln" d="M140 150c20-20 60-14 60 14 0 30-40 40-60 20"/>${eye(170, 162, 5)}<circle class="ink" cx="60" cy="238" r="9"/><circle class="ink" cx="80" cy="262" r="6"/>`),
    // Around the head — one sitting cat (60:84)
    cat: svg("0 0 72 84", catSit(4, 2, 1)),
  };
  BC.ill = ILL;
  // Fills all the image slots in static HTML (data-il, data-mark, data-icon, data-symbol) in one pass
  const fillIll = (root = document) => {
    root.querySelectorAll("[data-il]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = ILL[el.dataset.il] || ""; });
    root.querySelectorAll("[data-mark]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = mark[el.dataset.mark] || ""; });
    root.querySelectorAll("[data-icon]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = (el.hasAttribute("data-inline") ? ICON : icon)[el.dataset.icon] || ""; });
    root.querySelectorAll("[data-symbol]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = BC.symbol(); });
  };

  const NAV = [
    { k: "home", href: "index.html", ic: "home", t: "TOP" },
    { k: "news", href: "news.html", ic: "books", t: "Web magazine" },
    { k: "event", href: "event.html", ic: "flag", t: "Event details" },
    { k: "faculty", href: "index.html#faculty", ic: "book", t: "Faculty Activities" },
    { k: "facility", href: "index.html#facility", ic: "school", t: "Facility Guide" },
  ];
  const cur = (k) => (k === page || (page === "article" && k === "event") ? ' aria-current="page"' : "");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();

  const alert = document.querySelector('[data-slot="alert"]');
  if (alert) {
    alert.classList.add("bc-alert");
    const items = ["One-line website launch notice", "This month’s events, one line", "11/07 meetup notice, one line", "11/08 Screening event notice line", "11/17 Book talk notice line"]
      .map((t, i) => `<a class="bc-alert__item" href="event.html"><b>00/00</b>$ here{t}</a>`).join("");
    alert.innerHTML = `<div class="bc-alert__flow" data-fx="marquee" data-fx-marquee="rate: 42; rate-narrow: 35">${items}</div>
      <button class="bc-alert__close" type="button" aria-label="Close notice"></button>`;
    alert.querySelector(".bc-alert__close").addEventListener("click", () => {
      gsap.to(alert, { duration: 0.3, opacity: 0, ease: "power1.out", onComplete: () => { alert.style.display = "none"; } });
    });
  }

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("bc-head", "bc-pad");
    head.innerHTML = `
      <div class="bc-head__content">
        <div class="bc-head__main">
          <div class="bc-head__logo">
            <a class="bc-head__mark" href="index.html" data-label="School name line + brand English wordmark"><small>Operating organization name here, one line</small><strong>WORDMARK</strong></a>
            <p class="bc-head__caption" data-label="Operator English name · two lines">Presented by School Name,<br>University Name</p>
          </div>
          <a class="bc-head__symbol" href="index.html" aria-label="Home">${BC.symbol("Brand symbol — circle, bar and square group")}</a>
          <div class="bc-head__right">
            <button class="bc-head__tool is-search" type="button" id="bc-search-button" aria-label="Open search">${icon.search}</button>
            <a class="bc-head__tool is-x" href="#" aria-label="X Account">${icon.x}</a>
            <p class="bc-head__date" aria-label="Today’s date"><span class="m">${now.getMonth() + 1}</span><span class="d">${String(now.getDate()).padStart(2, "0")}</span><span class="y">${now.getFullYear()}</span><span class="w">${days[now.getDay()]}</span></p>
          </div>
        </div>
        <form class="bc-search" id="bc-search-form" role="search" onsubmit="return false">
          <div class="bc-search__in"><input type="search" placeholder="Keyword Search" aria-label="Keyword"><button type="submit" aria-label="Search">${icon.search}</button></div>
        </form>
      </div>
      <button class="bc-hmb" id="bc-nav-button" type="button" title="Open Menu" aria-label="Menu" aria-controls="bc-menu"><i></i><i></i><i></i></button>`;
    const menu = document.createElement("div");
    menu.className = "bc-menu";
    menu.id = "bc-menu";
    menu.innerHTML = `<div class="bc-menu__in"><nav aria-label="Full menu"><ul>${NAV.map((n) => `<li><a href="${n.href}"${cur(n.k)}>${ic(n.ic)}<span class="t">${n.t}</span></a></li>`).join("")}</ul></nav></div>`;
    head.after(menu);
  }

  const root = document.documentElement;
  root.dataset.openMenu = "false";
  root.dataset.openSearch = "false";
  const navBtn = document.getElementById("bc-nav-button");
  const setMenu = (on) => {
    root.dataset.openMenu = String(on);
    if (!navBtn) return;
    navBtn.title = on ? "Close Menu" : "Open Menu";
    navBtn.setAttribute("aria-expanded", String(on));
    document.body.style.overflow = on ? "hidden" : "";
  };
  navBtn?.addEventListener("click", () => setMenu(root.dataset.openMenu !== "true"));
  const searchBtn = document.getElementById("bc-search-button");
  const setSearch = (on) => {
    root.dataset.openSearch = String(on);
    if (on) setTimeout(() => document.querySelector("#bc-search-form input")?.focus(), 100);
  };
  searchBtn?.addEventListener("click", () => setSearch(root.dataset.openSearch !== "true"));
  document.addEventListener("click", (e) => {
    if (root.dataset.openMenu === "true" && !e.target.closest("#bc-nav-button, #bc-menu")) setMenu(false);
    if (root.dataset.openSearch === "true" && !e.target.closest("#bc-search-button, #bc-search-form")) setSearch(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setMenu(false);
    setSearch(false);
  });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("bc-foot");
    const tick = '<span>Presented by School Name, University Name</span>'.repeat(2);
    foot.innerHTML = `
      <div class="bc-foot__intro">
        <div class="bc-tick" data-fx="marquee" data-fx-marquee="rate: 42; rate-narrow: 35; pause: none" data-label="Operator English name · one line">${tick}</div>
        <div class="bc-foot__logo"><a class="bc-flogo" href="index.html"><small>Operating organization name here, one line</small>${BC.symbol("Brand symbol, large version")}</a></div>
        <span class="bc-il is-foot" data-il="bookcat" data-fx="doodle-idle-loop" style="--fx-dur: 4.44s"></span>
        <div class="bc-tick" data-fx="marquee" data-fx-marquee="rate: 42; rate-narrow: 35; pause: none" aria-hidden="true">${tick}</div>
      </div>
      <div class="bc-foot__in bc-pad">
        <div class="bc-foot__info"><p><b>Operations</b>Your operating agency name here<br>One-line affiliated institution name<br>Your hub name here</p></div>
        <div class="bc-foot__nav">
          <nav class="bc-foot__pages" aria-label="Bottom Menu">${NAV.map((n) => `<a class="bc-uline-host" href="${n.href}"${cur(n.k)}>${ic(n.ic)}<span class="bc-uline">${n.t}</span></a>`).join("")}</nav>
          <div class="bc-foot__sub"><ul><li><a href="#">${icon.x}Account</a></li><li><a href="#">${icon.link}Contact</a></li></ul></div>
          <div class="bc-foot__ext"><a class="bc-uline-host" href="#"><span class="bc-uline">Your external link 1 here</span>${icon.link}</a><a class="bc-uline-host" href="#"><span class="bc-uline">Your external link 2 here</span>${icon.link}</a></div>
        </div>
      </div>
      <div class="bc-foot__bottom"><p>© School Name, University Name.</p></div>
      <a class="bc-pagetop" href="#top" data-fx="ring-pagetop" data-fx-ring-pagetop="text: PAGETOP; repeat: 3; after: .bc-foot" aria-label="Back to top"><span data-fx-part="arrow">${icon.up}</span></a>`;
  }

  fillIll();
  BC.fillIll = fillIll;

  // Like the original, the body shows only after load, and smooth anchor scrolling and hover transitions turn on after that
  const loaded = () => root.classList.add("is-loaded");
  if (document.readyState === "complete") loaded();
  else addEventListener("load", loaded, { once: true });
})();
