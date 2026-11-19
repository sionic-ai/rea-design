// All four pages share the same header (top-left logo, pill menu, phone drawer), contact strip, footer and line-art drawings — rendered in one place
(() => {
  const page = document.body.dataset.page;

  // Line art — ink lines (currentColor) with only two fills (--tc-a accent · --tc-w background). The gray pattern board changes just these two variables to reuse the same art faintly
  const A = 'style="fill:var(--tc-a)"', W = 'style="fill:var(--tc-w)"';
  const DOODLES = {
    car: `<path ${A} d="M14 64C14 46 26 34 46 32h16c16 2 26 14 26 30v8c0 3-2 4-5 4H18c-3 0-4-2-4-5Z"/><path ${W} d="M30 50c2-8 10-12 20-12h10c8 1 14 6 16 12Z"/><path d="M44 60h12"/><circle ${W} cx="24" cy="58" r="3"/><circle ${W} cx="78" cy="58" r="3"/><circle ${W} cx="30" cy="74" r="9"/><circle cx="30" cy="74" r="3"/><circle ${W} cx="72" cy="74" r="9"/><circle cx="72" cy="74" r="3"/>`,
    bike: `<circle ${W} cx="22" cy="72" r="15"/><circle ${W} cx="78" cy="72" r="15"/><path d="M22 72 40 50h26L78 72M40 50l12 22 14-22M36 44h10M66 50l-3-10h8"/><circle ${W} cx="56" cy="16" r="7"/><path ${W} d="M46 26c6-4 14-2 16 4l-4 14H46c-4-6-4-12 0-18Z"/><path d="M58 32l12 8M48 44l-2 14 6 10M54 44l8 12"/>`,
    dog: `<path ${W} d="M20 50c4-8 20-10 36-8 6-8 8-16 14-20 4-2 8 0 10 4l6 2c2 2 0 6-4 6l-6 2c-2 6-6 12-10 16H26c-4-1-6-1-6-2Z"/><path d="M66 52l2 24M58 54l-2 22M32 54l-4 22M40 54l2 22M20 50c-6-2-10-8-10-12M84 26l6-4M86 34l6 2"/><circle cx="74" cy="27" r="1.6" fill="currentColor"/>`,
    bird: `<path ${W} d="M16 56c12-6 22-12 34-10 6-10 18-12 24-6l10 2-8 4c-2 10-12 18-26 18-12 0-22-4-34-8Z"/><path ${W} d="M42 50 26 32l30 12"/><circle cx="66" cy="44" r="1.6" fill="currentColor"/>`,
    globe: `<circle ${W} cx="50" cy="42" r="22"/><path d="M28 42h44M50 20v44M33 30h34M33 54h34M50 20c-12 8-12 36 0 44M50 20c12 8 12 36 0 44"/><path d="M28 46c-10 2-14 10-10 14M72 46c10 2 14 10 10 14M42 63l-6 20h-8M58 63l6 20h8"/>`,
    sun: `<path ${W} d="M26 64a24 24 0 0 1 48 0Z"/><path d="M50 30V16M31 37l-9-9M69 37l9-9M24 52H10M76 52h14M14 64h72M42 52q3 3 6 0M54 52q3 3 6 0"/>`,
    house: `<path ${A} d="M12 46 50 18l38 28Z"/><path ${W} d="M22 46h56v36H22Z"/><path d="M30 56h14v12H30ZM37 56v12M30 62h14M58 60h12v22H58ZM8 82h84"/>`,
    scooter: `<path ${A} d="M18 72h52c4 0 6 2 6 5H16c0-3 0-5 2-5Z"/><path d="M70 72 62 32M56 30h14"/><circle ${W} cx="24" cy="80" r="6"/><circle ${W} cx="70" cy="80" r="6"/><circle ${W} cx="40" cy="20" r="8"/><path ${W} d="M33 31c-4 10-2 22 2 28h10c4-8 4-20 0-28Z"/><path d="M46 38l14-4M37 59l-4 13M43 59l6 13"/>`,
    cloud: `<path ${W} d="M22 66C10 66 8 50 20 48c-2-12 12-18 20-10 4-12 22-12 24 0 12-4 22 6 16 16 10 4 6 16-4 14Z"/><path d="M42 52q3 2 6 0M56 52q3 2 6 0M48 58q3 3 6 0"/>`,
    pair: `<circle ${W} cx="32" cy="20" r="7"/><circle ${W} cx="66" cy="18" r="7"/><path ${A} d="M24 30h16l4 30H20Z"/><path ${W} d="M58 28h16l2 26H56Z"/><path d="M24 32 12 14M40 32l10 12M58 30 48 18M74 30l12-16M26 60l-2 24M38 60l2 24M60 54l-4 30M72 54l6 30"/>`,
    charger: `<path ${A} d="M30 20h30c3 0 4 2 4 4v60H26V24c0-2 1-4 4-4Z"/><path ${W} d="M36 28h18v14H36Z"/><path d="M64 38c14 0 16 14 10 22l-4 8M66 68h8v8h-8ZM18 84h56"/><path d="M40 52q5 4 10 0" style="stroke:var(--tc-w)"/>`,
    tuktuk: `<path ${A} d="M14 70V44c0-12 10-20 22-20h30c10 0 16 6 16 16v30Z"/><path ${W} d="M22 46c0-8 6-12 12-12h14v14H22ZM54 34h14c4 0 6 4 6 8v6H54Z"/><circle ${W} cx="38" cy="42" r="5"/><circle ${W} cx="28" cy="72" r="9"/><circle ${W} cx="72" cy="72" r="9"/><path d="M8 82h84"/>`,
    chicks: `<path ${W} d="M14 58c0-12 10-18 20-14 4-8 16-6 14 4 2 10-6 18-18 18-8 0-16-2-16-8Z"/><path ${W} d="M54 70c0-10 8-16 18-12 4-8 16-6 14 4 2 10-6 18-18 18-8 0-14-4-14-10Z"/><path d="m48 46 6-2M86 60l6-2M30 66v8M68 80v6"/><circle cx="42" cy="45" r="1.4" fill="currentColor"/><circle cx="80" cy="59" r="1.4" fill="currentColor"/>`,
    hand: `<path ${W} d="M34 88C26 72 22 58 24 46c2-6 8-4 8 2l2 10-2-32c0-6 8-6 8 0l2 26V18c0-6 8-6 8 0l2 32 2-28c0-6 8-6 8 0v32l4-14c2-6 10-4 8 2l-4 22c-2 12-8 20-12 24Z"/><path d="m80 24 8-6M82 34l10-2M80 44l8 4"/>`,
  };
  const NAMES = Object.keys(DOODLES);
  const sprite = document.createElement("div");
  sprite.className = "tc-sprite";
  sprite.setAttribute("aria-hidden", "true");
  sprite.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"><defs>${NAMES.map((n) => `<symbol id="tc-d-${n}" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${DOODLES[n]}</symbol>`).join("")}</defs></svg>`;
  document.body.prepend(sprite);
  const doodle = (name, cls = "") => `<svg class="tc-doodle ${cls}" viewBox="0 0 100 100" aria-hidden="true"><use href="#tc-d-${name}"/></svg>`;

  // Same seed gives the same pattern — if the picture changed on every open, it couldn’t be compared side by side with the original
  const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // Scatter line drawings on a jittered grid across a wide panel (viewBox w×h). Skip cells (panel ratio x0,y0,x1,y1) stay empty to protect the logo and text area.
  const scatter = ({ w, h, cols, rows, size, seed, skip = [], layers = 1, jitter = 0.32, tilt = 10 }) => {
    const r = rand(seed), out = Array.from({ length: layers }, () => []);
    let k = 0;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const cw = w / cols, ch = h / rows;
      const cx = (i + 0.5 + (r() - 0.5) * jitter * 2) * cw, cy = (j + 0.5 + (r() - 0.5) * jitter * 2) * ch;
      const s = size * (0.85 + r() * 0.3), name = NAMES[Math.floor(r() * NAMES.length)], rot = (r() - 0.5) * tilt * 2;
      if (skip.some(([x0, y0, x1, y1]) => cx / w > x0 && cx / w < x1 && cy / h > y0 && cy / h < y1)) continue;
      out[k++ % layers].push(`<use href="#tc-d-${name}" x="${(cx - s / 2).toFixed(1)}" y="${(cy - s / 2).toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})"/>`);
    }
    return out.map((uses) => uses.join(""));
  };
  window.tcArt = { doodle, scatter, NAMES };

  const MARK = `<svg class="tc-mark__top" viewBox="0 0 87 34" aria-hidden="true"><text class="tc-mark__red" x="1" y="14" textLength="72" lengthAdjust="spacingAndGlyphs">STUDIO</text><text class="tc-mark__ink" x="1" y="31" textLength="84" lengthAdjust="spacingAndGlyphs">name here</text></svg>
    <svg class="tc-mark__hand" viewBox="0 0 460 150" aria-hidden="true"><text x="10" y="112" textLength="430" lengthAdjust="spacingAndGlyphs">Studio</text></svg>`;
  const LINKS = [["Top", "index.html"], ["About", "about.html"], ["Members", "list.html"], ["Blog", "#", true], ["Careers", "#", true]];
  const arrowOut = '<svg class="tc-out" viewBox="0 0 9 8" aria-hidden="true"><path d="M1 7 8 1M3 1h5v5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';
  const here = (href) => (href === "index.html" && page === "home") || (href === "about.html" && page === "about") || (href === "list.html" && (page === "list" || page === "detail"));

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.innerHTML = `
      <a class="tc-mark" href="index.html" aria-label="Studio Name Home" data-label="Brand English wordmark (small version)">${MARK}</a>
      <nav class="tc-nav" aria-label="Main menu">${[["About", "about.html"], ["Members", "list.html"]].map(([t, h]) => `<a href="${h}"><span class="tc-nav__halo" aria-hidden="true">${t}</span><span class="tc-nav__txt">${t}</span></a>`).join("")}</nav>
      <button class="tc-burger" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i></button>
      <nav class="tc-drawer" aria-hidden="true" data-slot="mobile-menu">
        <div class="tc-drawer__links">${LINKS.map(([t, h, out]) => `<a href="${h}"${here(h) ? ' aria-current="page"' : ""}${out ? ' target="_blank"' : ""} tabindex="-1">${t}</a>`).join("")}</div>
        <div class="tc-drawer__foot"><span class="tc-corp" data-label="Parent company square logo">${'<svg viewBox="0 0 80 80" aria-hidden="true"><text x="40" y="52" text-anchor="middle">S</text><text class="tc-corp__small" x="40" y="68" text-anchor="middle" textLength="44" lengthAdjust="spacingAndGlyphs">STUDIO</text></svg>'}</span><small>©Studio Name Inc.<br>Design Division</small></div>
      </nav>`;
    const burger = header.querySelector(".tc-burger"), drawer = header.querySelector(".tc-drawer");
    const setOpen = (open) => {
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      drawer.querySelectorAll("a").forEach((a) => (a.tabIndex = open ? 0 : -1));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => setOpen(!burger.classList.contains("is-open")));
    drawer.addEventListener("click", (e) => e.target.closest("a") && setOpen(false));

    // Home page hides the top-left logo while the upper part of the hero (1400:600, phone 390:490) is visible — so it doesn’t overlap the hero’s big logo
    const mark = header.querySelector(".tc-mark");
    const sentinel = document.querySelector("[data-tc-sentinel]");
    if (sentinel) {
      mark.setAttribute("data-hidden", "");
      mark.tabIndex = -1;
      new IntersectionObserver(([e]) => {
        mark.toggleAttribute("data-hidden", e.isIntersecting);
        mark.tabIndex = e.isIntersecting ? -1 : 0;
      }).observe(sentinel);
    }
  }

  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    const [pat] = scatter({ w: 1400, h: 380, cols: 12, rows: 3, size: 96, seed: 77, jitter: 0.3 });
    const [patSp] = scatter({ w: 390, h: 450, cols: 4, rows: 5, size: 72, seed: 78, jitter: 0.3 });
    contact.innerHTML = `
      <span class="wf-note">Contact band · gray line-art pattern · large round mail button (inverts on hover)</span>
      <svg class="tc-contact__pat is-pc" viewBox="0 0 1400 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${pat}</svg>
      <svg class="tc-contact__pat is-sp" viewBox="0 0 390 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${patSp}</svg>
      <div class="tc-contact__in">
        <h2 class="tc-contact__title" data-label="Contact section English title">Contact Us</h2>
        <p class="tc-contact__line">Your consultation info here <i>/</i> Contact us this way</p>
        <button class="tc-contact__addr" type="button" aria-label="Contact by email"><svg viewBox="0 0 320 16" aria-hidden="true"><text x="0" y="13" fill="currentColor" textLength="300" lengthAdjust="spacingAndGlyphs">hello@studio-name.example</text></svg></button>
        <button class="tc-contact__mail" type="button" aria-label="Contact by email"><span>mail</span><svg viewBox="0 0 20 16" aria-hidden="true"><rect x="1" y="1" width="18" height="14" rx="1.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m2 3 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></button>
      </div>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.innerHTML = `
      <div class="tc-foot__menu">${LINKS.map(([t, h, out]) => `<a href="${h}"${here(h) ? ' aria-current="page"' : ""}${out ? ' target="_blank"' : ""}>${t}</a>`).join("")}</div>
      <a class="tc-corp" href="#" data-label="Parent company square logo"><svg viewBox="0 0 80 80" aria-hidden="true"><text x="40" y="52" text-anchor="middle">S</text><text class="tc-corp__small" x="40" y="68" text-anchor="middle" textLength="44" lengthAdjust="spacingAndGlyphs">STUDIO</text></svg></a>
      <div class="tc-foot__right">
        <a class="tc-foot__ext" href="#" target="_blank"><span>Careers</span>${arrowOut}</a>
        <a class="tc-foot__ext" href="#" target="_blank"><span>Blog</span>${arrowOut}</a>
        <small>©Studio Name Inc.<br>Design Division</small>
      </div>`;
  }

  // Handwriting heading — thick white strokes (mask) are laid zigzag over the letters cell by cell from the left, and sign-draw draws each stroke with the original delay, length and curve (data-slots).
  // Divide the letter width (data-x0~x1) and height (data-y0~y1) by the stroke count so one stroke covers one cell
  let maskId = 0;
  document.querySelectorAll("svg.tc-write[data-slots]").forEach((svg) => {
    const slots = svg.dataset.slots.split("|").map((s) => s.trim().split(/\s+/));
    const [x0, x1, y0, y1] = ["x0", "x1", "y0", "y1"].map((k) => +svg.dataset[k]);
    const band = (x1 - x0) / slots.length, sw = (y1 - y0) * 0.34, step = sw * 0.62;
    const strokes = slots.map(([at, dur, ease], i) => {
      const a = x0 + band * i - sw * 0.2, b = a + band + sw * 0.4;
      const pts = [];
      for (let x = a, up = true; x <= b + 0.01; x += step, up = !up) pts.push(`${x.toFixed(1)} ${up ? y0 : y1}`);
      return `<path data-fx-part="stroke" pathLength="1" stroke-width="${sw.toFixed(1)}" data-at="${at} ${(+at + +dur).toFixed(3)}" data-ease="${ease || "0.4,0,0.2,1"}" d="M${pts.join("L")}"/>`;
    });
    const id = `tc-write-${++maskId}`;
    svg.insertAdjacentHTML("afterbegin", `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">${strokes.join("")}</mask></defs>`);
    svg.querySelector("text").setAttribute("mask", `url(#${id})`);
  });

  // Line-art cluster panels — subpage header top right (665×452), vertical clusters beside the detail (494×758·472×830). data-tc-cluster="w h column row size seed"
  document.querySelectorAll("[data-tc-cluster]").forEach((el) => {
    const [w, h, cols, rows, size, seed] = el.dataset.tcCluster.split(/\s+/).map(Number);
    const [uses] = scatter({ w, h, cols, rows, size, seed, jitter: 0.28 });
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" class="tc-cluster" aria-hidden="true">${uses}</svg>`;
  });

  // Scattered line-drawing spots (data-tc-ill="Name") is filled with an image
  document.querySelectorAll("[data-tc-ill]").forEach((el) => { el.innerHTML = doodle(el.dataset.tcIll); });

  // Member grid — two photos (blank expression → playful pose), and when the cover lifts, that person’s line drawing, title and name appear. Empty cells are filled with a gray line drawing
  const ROLES = ["Design Research", "Service Design", "UI Design", "Frontend Development", "Business Development", "Technical Director", "Project Management"];
  const tile = (i, opts) => `
    <a class="tc-tile" data-fx-part="tile" href="${opts.href || "detail.html"}">
      <span class="tc-tile__cover" data-fx-part="cover">
        <span class="wf-img" data-label="Person upper body · gray background · expressionless front view · 1:1"></span>
        <span class="tc-tile__after wf-img" data-fx-part="after" data-label="Same person · playful pose holding a prop · 1:1"></span>
      </span>
      <span class="tc-tile__art" data-fx-part="art">${doodle(NAMES[(i * 5 + 3) % NAMES.length])}</span>
      <span class="tc-tile__meta">
        <span class="tc-tile__role" data-fx-part="role">${ROLES[i % ROLES.length]}</span>
        <span class="tc-tile__row">
          <${opts.tag || "h3"} class="tc-tile__name" data-fx-part="name" data-label="Member English name">Member Name ${String(i + 1).padStart(2, "0")}</${opts.tag || "h3"}>
          <svg class="tc-tile__arrow" data-fx-part="arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 4.5 16.5 10 11 15.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        </span>
      </span>
    </a>`;
  const blank = (seed, cls = "") => `<div class="tc-tile tc-tile--blank ${cls}">${doodle(NAMES[(13 * seed) % NAMES.length])}</div>`;
  document.querySelectorAll("[data-tc-members]").forEach((grid) => {
    const n = +grid.dataset.tcMembers, start = +(grid.dataset.start || 0), sp = +(grid.dataset.spCols || 2);
    const fill = grid.hasAttribute("data-fill");
    const pc = fill ? (4 - (n % 4)) % 4 : 0, spFill = fill ? (sp - (n % sp)) % sp : 0;
    let html = "";
    for (let i = 0; i < n; i++) html += tile(start + i, { tag: grid.dataset.tag });
    for (let i = 0; i < Math.max(pc, spFill); i++) html += blank(n + i, `${i >= pc ? "is-sp-only" : ""} ${i >= spFill ? "is-pc-only" : ""}`);
    grid.innerHTML = html;
    grid.classList.add(sp === 3 ? "is-sp3" : "is-sp2");
  });

  // Prev and next buttons in place of the slide viewer — only change the page number (original is an external slide viewer iframe)
  document.querySelectorAll(".tc-deck").forEach((deck) => {
    const out = deck.querySelector("[data-deck-count]");
    const [prev, next] = deck.querySelectorAll(".tc-deck__bar span button");
    let n = 1;
    const go = (d) => { n = Math.min(23, Math.max(1, n + d)); out.textContent = `${n} / 23`; };
    prev && prev.addEventListener("click", () => go(-1));
    next && next.addEventListener("click", () => go(1));
  });

  // Four note cards (blog posts)
  const NOTE_LABELS = ["Event report cover · two people on stage · 450:236 landscape", "Website renewal notice cover · line-art pattern · landscape 450:236", "Feature article cover · front of a vintage car · landscape 450:236", "Award news cover · clear trophy · landscape 450:236"];
  document.querySelectorAll("[data-tc-notes]").forEach((grid) => {
    grid.innerHTML = NOTE_LABELS.map((l, i) => `<a class="tc-note" href="#" target="_blank" aria-label="Your post title here"><span class="wf-img" data-label="${l}"></span><span class="tc-note__meta"><time>2026.0${9 - i * 2}.${10 + i * 5}</time></span></a>`).join("");
  });
})();
