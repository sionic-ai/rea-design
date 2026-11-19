// Common to all pages: draws header · menu panel · floating CONTACT circle · footer, redraws the product character as SVG, and
// Wires up loader, arrow hover, logo shrink, side contents, parallax and Lenis with the original values.
// Original values: arrow .6s (.2s offset) · logo .5s · loader after 2.5s 1.5s ease-in diagonal, after 3s it clears · parallax scrub 1 (30%→0) · .5 (12%→−12%) · contents turn .6s swing
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TS = (window.TS = { lenis: null });

  /* ---------- Graphics: newly drawn in place of the original logo · icons ---------- */
  const focus = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 0h22v9H9v13H0zM100 0H78v9h13v13h9zM0 100h22v-9H9V78H0zM100 100H78v-9h13V78h9z"/></svg>';
  const markPath = '<path fill="currentColor" fill-rule="evenodd" d="M0 0h12v5H5v7H0zM60 0H48v5h7v7h5zM0 60h12v-5H5v-7H0zM60 60H48v-5h7v-7h5zM30 13a17 17 0 1 1 0 34a17 17 0 1 1 0-34Zm0 7a10 10 0 1 0 0 20a10 10 0 1 0 0-20Z"/>';
  const logo = `<svg viewBox="0 0 176 44" aria-label="Logo"><g transform="scale(.7333)">${markPath}</g><text x="52" y="39" style="font: 700 50px var(--kf-font-display); letter-spacing: -1.5px" fill="currentColor">ABC</text></svg>`;
  const call = '<svg viewBox="0 0 134 134" aria-hidden="true"><circle cx="67" cy="67" r="66.4" fill="none" stroke="currentColor" stroke-width="1"/><text x="67" y="73" text-anchor="middle" fill="currentColor" style="font: 400 17px var(--kf-font-display); letter-spacing: .5px">CONTACT</text></svg>';
  const dl = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M10 2v11M5.5 8.5 10 13l4.5-4.5M2 14v4h16v-4"/></svg>';
  TS.icons = { focus, dl, markPath };

  /* ---------- Product character: shape + two-color gradient + highlight + eyes. Colors use only --site-c* ---------- */
  let gid = 0;
  const pts = (a) => "M" + a.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") + "Z";
  const polar = (R, waves, cx = 100, cy = 100, n = 96) => {
    const a = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const r = R * (1 + waves.reduce((s, [k, amp, ph]) => s + amp * Math.sin(k * t + ph), 0));
      a.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
    return pts(a);
  };
  const eyes = (x1, x2, y, s = 1) => [x1, x2].map((x) => `<ellipse cx="${x}" cy="${y}" rx="${7 * s}" ry="${9 * s}" style="fill: var(--kf-surface)"/><circle cx="${x + 1.5 * s}" cy="${y + 1.5 * s}" r="${4 * s}" style="fill: var(--kf-ink)"/>`).join("");
  const SHAPES = {
    gem: (f, g) => `<path d="${pts([[100, 8], [166, 54], [156, 150], [100, 192], [44, 150], [34, 54]])}" fill="${f}"/><path d="M100 8v184M34 54l66 42 66-42M44 150l56-54 56 54" fill="none" style="stroke: var(--kf-surface)" stroke-opacity=".45" stroke-width="2"/>${eyes(112, 132, 84)}`,
    poly: (f, g) => `<path d="${polar(84, [[10, 0.04, 0]])}" fill="${g}" fill-opacity=".35"/><path d="M100 18 152 46 168 100 152 154 100 182 48 154 32 100 48 46ZM100 18 100 70 152 46M100 70 48 46M100 70 132 112 168 100M132 112 152 154M132 112 68 112 100 182M68 112 32 100M68 112 48 154M68 112 100 70" fill="none" stroke="${f}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" stroke-opacity=".85"/>${eyes(84, 104, 88, .9)}`,
    blob: (f, g) => `<path d="${polar(76, [[2, 0.1, 0.3], [3, 0.07, 1.4], [5, 0.035, 2]])}" fill="${f}"/><path d="${polar(30, [[3, 0.12, 0]], 82, 120, 48)}" fill="${g}" fill-opacity=".45"/>${eyes(94, 116, 92)}`,
    drop: (f, g) => `<path d="${polar(66, [[1, 0.2, 0.6], [3, 0.08, 0.2], [4, 0.05, 2]], 104, 110)}" fill="${f}"/><circle cx="64" cy="40" r="22" fill="${f}"/><circle cx="150" cy="168" r="14" fill="${g}"/>${eyes(112, 132, 96)}`,
    leaf: (f, g) => `<path d="M100 8C164 40 178 120 124 192C78 172 26 120 36 68C46 38 70 18 100 8Z" fill="${f}"/><path d="M100 8C96 70 108 130 124 192M98 50 64 64M100 84 52 104M104 118 66 146M100 60l40 4M104 96l46 10M112 132l40 18" fill="none" stroke="${g}" stroke-width="5" stroke-linecap="round" stroke-opacity=".8"/>${eyes(76, 96, 98)}`,
    swirl: (f, g) => `<circle cx="100" cy="102" r="82" fill="${f}"/><path d="M100 20A82 82 0 0 1 100 184A41 41 0 0 1 100 102A41 41 0 0 0 100 20Z" fill="${g}"/>${eyes(82, 102, 70)}${eyes(120, 140, 128)}`,
    cube: (f, g) => `<path d="M100 22 172 60 100 98 28 60Z" fill="${g}"/><path d="M28 60 100 98v84L28 144Z" fill="${f}"/><path d="M100 98 172 60v84l-72 38Z" fill="${f}" fill-opacity=".7"/><path d="M128 58h22v24h-22z" style="fill: var(--kf-surface)" fill-opacity=".5"/>${eyes(52, 72, 116)}${eyes(118, 138, 128)}`,
    steps: (f, g) => [0, 1, 2, 3].map((i) => `<rect x="${30 + i * 22}" y="${22 + i * 40}" width="96" height="44" rx="14" fill="${i % 2 ? g : f}"/>`).join("") + eyes(68, 86, 46, .8) + eyes(134, 152, 170, .8),
    cloud: (f, g) => `<circle cx="74" cy="96" r="48" fill="${f}"/><circle cx="124" cy="78" r="52" fill="${g}"/><circle cx="118" cy="138" r="46" fill="${f}"/><circle cx="66" cy="146" r="34" fill="${g}"/>${eyes(108, 128, 82)}${eyes(56, 76, 140, .8)}`,
    gear: (f, g) => `<path d="${polar(78, [[12, 0.13, 0]])}" fill="${f}"/><circle cx="100" cy="100" r="44" fill="${g}" fill-opacity=".5"/>${eyes(90, 112, 92)}`,
    cluster: (f, g) => `<circle cx="70" cy="70" r="44" fill="${g}"/><path d="${polar(42, [[9, 0.14, 0]], 128, 82, 72)}" fill="${f}"/><circle cx="76" cy="140" r="40" fill="${f}" fill-opacity=".8"/><path d="${polar(36, [[6, 0.2, 0]], 136, 146, 72)}" fill="${g}"/>${eyes(60, 76, 64, .7)}${eyes(122, 138, 80, .7)}${eyes(70, 86, 140, .7)}`,
    bridge: (f, g) => `<path d="M20 40 180 70 180 104 140 98 140 120 180 128 180 162 20 132 20 98 60 106 60 84 20 76Z" fill="${f}"/><path d="M20 132 180 162 180 176 20 146Z" fill="${g}"/>${eyes(98, 116, 104, .9)}`,
  };
  TS.char = (shape, a = "c1", b = "c2", label = "") => {
    const id = `tsg${++gid}`;
    const inner = (SHAPES[shape] || SHAPES.blob)(`url(#${id}a)`, `url(#${id}b)`);
    return `<svg class="ts-char" viewBox="0 0 200 200" role="img" aria-label="${label || "Product character illustration"}"><defs>
      <linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color: var(--site-${a})"/><stop offset="1" style="stop-color: var(--site-${b})"/></linearGradient>
      <linearGradient id="${id}b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--site-${b})"/><stop offset="1" style="stop-color: var(--kf-surface)"/></linearGradient>
    </defs>${inner}<ellipse cx="72" cy="56" rx="24" ry="12" transform="rotate(-28 72 56)" style="fill: var(--kf-surface)" fill-opacity=".35"/></svg>`;
  };
  // A scene scattering several characters on one panel (loader clump · About scene). place: [shape, colorA, colorB, x, y, size]
  TS.group = (place, w = 400, h = 300, base = "") => `<svg class="ts-char" viewBox="0 0 ${w} ${h}" aria-hidden="true">${base}${place.map(([s, a, b, x, y, z]) => `<svg x="${x}" y="${y}" width="${z}" height="${z}" viewBox="0 0 200 200" overflow="visible">${TS.char(s, a, b).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>`).join("")}</svg>`;
  // Isometric white base (About scene): top face base color, two gray steps for the sides
  TS.podium = (x, y, w, h) => `<path d="M${x} ${y}l${w} ${-w * .5}l${w} ${w * .5}l${-w} ${w * .5}Z" style="fill: var(--kf-surface)"/><path d="M${x} ${y}l${w} ${w * .5}v${h}l${-w} ${-w * .5}Z" style="fill: var(--kf-raised)"/><path d="M${x + w} ${y + w * .5}l${w} ${-w * .5}v${h}l${-w} ${w * .5}Z" style="fill: var(--kf-raised)" fill-opacity=".6"/>`;

  /* ---------- Product list (placeholder) — original menu structure as is: four categories · thirteen products ---------- */
  const P = (n, shape, a, b, en, cat) => ({ n, shape, a, b, en, cat, ko: `(Product name ${n})`, href: "detail.html" });
  TS.products = [
    P(1, "gem", "c2", "c1", "PRODUCT NAME ONE", "wall"), P(2, "gem", "c2", "c6", "PRODUCT NAME TWO", "wall"),
    P(3, "blob", "c2", "c6", "PRODUCT LONG<br>NAME THREE", "wall"), P(4, "drop", "c2", "c5", "PRODUCT FOUR<br><br>", "wall"),
    P(5, "leaf", "c3", "c4", "PRODUCT FIVE<br>NAME TOP", "roof"), P(6, "poly", "c1", "c2", "PRODUCT SIX<br>NAME TOP", "roof"),
    P(7, "bridge", "c5", "c2", "PRODUCT NAME SEVEN", "brown"),
    P(8, "swirl", "c2", "c3", "PRODUCT EIGHT", "primer"), P(9, "cube", "c5", "c4", "PRODUCT NINE", "primer"),
    P(10, "steps", "c4", "c6", "PRODUCT TEN", "primer"), P(11, "cloud", "c5", "c2", "PRODUCT ELEVEN", "primer"),
    P(12, "cluster", "c5", "c4", "PRODUCT TWELVE", "primer"), P(13, "gear", "c2", "c1", "PRODUCT THIRTEEN", "primer"),
  ];
  const pr = (n) => TS.products[n - 1];

  /* ---------- Menu · footer link group ---------- */
  let ci = 5;
  const nextColor = () => `c${(ci++ % 6) + 1}`;
  const arrowI = '<i class="ts-arrow" aria-hidden="true"></i>';
  const look = (dark) => `trigger: hover; look: ${dark ? "contrast-base" : "base"}; dur: ${dark ? .7 : 1}`;
  const link = (href, text, dark, extra = "") => `<a class="ts-link" href="${href}" data-hover data-fx="band-paint-text" data-fx-band-paint-text="${look(dark)}" style="--fx-band: var(--site-${nextColor()})"${extra}><span data-fx-part="text">${text}</span>${arrowI}</a>`;
  const items = (dark, ...ns) => `<ul>${ns.map((n) => `<li>${link(pr(n).href, `Product name ${n}`, dark)}</li>`).join("")}</ul>`;
  const sub = (title, dark, ...ns) => `<dl><dt>${title}</dt><dd>${items(dark, ...ns)}</dd></dl>`;
  const links = (dark) => {
    ci = 5;
    return `<div class="ts-links">
      <div class="ts-links__cat">
        <h2>${link("index.html", "HOME", dark)}</h2>
        <div class="ts-links__products">
          <h2 class="ts-en">PRODUCTS</h2>
          <div class="ts-links__tree">
            <div class="ts-links__row">
              <dl class="is-wide"><dt>Product category 1</dt><dd>${sub("Series Name A", dark, 1, 2)}${sub("Series Name B", dark, 3, 4)}</dd></dl>
              <dl><dt>Product category 2</dt><dd>${sub("Series Name A", dark, 5, 6)}</dd></dl>
              <dl><dt>Product category 3</dt><dd>${sub("Series Name C", dark, 7)}</dd></dl>
            </div>
            <div class="ts-links__row">
              <dl><dt class="is-under">Product category 4<span>Series Name D</span></dt><dd>${sub("Sub Category 1", dark, 8, 9)}${sub("Sub Category 2", dark, 10)}${sub("Sub Category 3", dark, 11, 12)}${sub("Sub Category 4", dark, 13)}</dd></dl>
            </div>
          </div>
        </div>
      </div>
      <div class="ts-links__info">
        <ul><li>${link("about.html", "ABOUT US", dark)}</li><li>${link("#", "DOCUMENTS", dark)}</li><li>${link("contact.html", "CONTACT", dark)}</li></ul>
        <a class="ts-links__pp" href="#" data-fx="band-paint-text" data-fx-band-paint-text="${look(dark)}" style="--fx-band: var(--site-${nextColor()})"><span data-fx-part="text">privacy policy</span></a>
        <address><span>Company name</span><span>Your address line, 00-00 here</span><span>TEL 000-000-0000 FAX 000-000-0000</span></address>
        <small>© 0000 Company Name</small>
      </div>
    </div>`;
  };
  const bigMark = (rise) => `<div class="ts-mark-big"${rise ? ' data-fx="line-rise" data-fx-line-rise="split: none; y: 100; dur: .5; stagger: .1; ease: 0.25,0.1,0.25,1; start: bottom bottom; toggle: true"' : ""} aria-label="Logo"><svg viewBox="0 0 60 60">${markPath}</svg><span>A</span><span>B</span><span>C</span></div>`;

  /* ---------- Draw-in ---------- */
  const head = document.querySelector('[data-slot="header"]');
  head.className = "ts-head";
  head.innerHTML = `<a class="ts-logo" href="index.html">${logo}</a>
    <button class="ts-head__btn" type="button" aria-label="Open Menu" aria-expanded="false"><span>MENU</span><i class="ts-burger"><i></i><i></i></i></button>
    <div class="ts-call"><a class="ts-call__link" href="contact.html" aria-label="Inquiry">${call}</a></div>`;
  head.insertAdjacentHTML("afterend", `<div class="ts-menu" data-slot="menu-overlay">${links(false)}<div class="ts-menu__logo">${bigMark(false).replace("ts-mark-big", "ts-mark-big is-menu")}</div></div>`);
  const foot = document.querySelector('[data-slot="footer"]');
  foot.className = "ts-foot";
  foot.innerHTML = `<div class="ts-foot__call" data-slot="footer-contact"><a class="ts-foot__link" href="contact.html" data-hover>
      <span class="ts-foot__anim" aria-hidden="true"><i></i><i></i></span>
      <span class="ts-foot__txt"><h2>CONTACT US</h2><p>Your one line of contact info here.<br>Your extra consultation note goes here in one line.</p></span>
      ${arrowI}</a></div>
    ${links(true)}
    <div class="ts-foot__mark" data-slot="footer-wordmark">${bigMark(true)}</div>`;

  // Fill character slots: <div data-char="gem c2 c1">
  document.querySelectorAll("[data-char]").forEach((el) => {
    const [s, a, b] = el.dataset.char.split(" ");
    el.insertAdjacentHTML("afterbegin", TS.char(s, a, b, el.dataset.charLabel));
  });
  document.querySelectorAll("[data-focus]").forEach((el) => el.insertAdjacentHTML("beforeend", `<span class="ts-focus">${focus}</span>`));

  /* ---------- First reveal · loader ---------- */
  const load = document.querySelector(".ts-load");
  // The original attaches from a defer script, so a .5s fade runs after first paint — attaching during parsing paints everything fully visible from the start, so there is no transition
  const show = () => requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("is-visible")));
  if (load && !reduce && !document.cookie.includes("ts_load_anim=1")) {
    load.classList.add("is-show");
    const v = load.querySelector("video");
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      show();
      setTimeout(() => {
        load.classList.add("is-move");
        setTimeout(() => load.classList.remove("is-show"), 3000);
        setTimeout(() => (v.style.display = "none"), 1000);
      }, 2500);
    };
    v.addEventListener("playing", go, { once: true });
    // If the video never plays (autoplay blocked) the page would never show, so move on at 4 seconds — a safety net not in the original
    setTimeout(go, 4000);
    document.cookie = "ts_load_anim=1; path=/";
  } else show();

  /* ---------- Menu open and close ---------- */
  const menu = document.querySelector(".ts-menu");
  const btn = head.querySelector(".ts-head__btn");
  btn.addEventListener("click", () => {
    const open = head.classList.toggle("is-open");
    menu.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && head.classList.contains("is-open")) btn.click(); });

  /* ---------- Arrow hover (original js-hover → is-hover-once·is-hover) ---------- */
  document.querySelectorAll("[data-hover]").forEach((h) => {
    const kids = h.querySelectorAll(".ts-arrow");
    h.addEventListener("mouseenter", () => kids.forEach((k) => k.classList.add("is-h1", "is-h")));
    h.addEventListener("mouseleave", () => kids.forEach((k) => k.classList.remove("is-h")));
  });

  /* ---------- Scroll-pinned items ---------- */
  gsap.registerPlugin(ScrollTrigger);
  const hero = document.querySelector("[data-hero]");
  if (hero) ScrollTrigger.create({ trigger: hero, start: "bottom top", endTrigger: ".ts-wrap", toggleClass: { targets: ".ts-logo", className: "is-small" } });
  ScrollTrigger.create({ trigger: foot, start: "top bottom", endTrigger: ".ts-wrap", toggleClass: { targets: ".ts-call", className: "is-hidden" } });

  // Side contents — when a section’s top edge reaches 30% of the screen an arrow appears on that row, pressing it scrolls over with a .6s swing
  const swing = (p) => 0.5 - Math.cos(p * Math.PI) / 2;
  document.querySelectorAll(".ts-snav li.is-scroll").forEach((li) => {
    const a = li.querySelector("a");
    const target = document.querySelector(a.hash);
    if (!target) return;
    ScrollTrigger.create({ trigger: target, start: "top 30%", end: "bottom 30%", onToggle: (st) => li.classList.toggle("is-current", st.isActive) });
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (TS.lenis) TS.lenis.scrollTo(target, { duration: 0.6, easing: swing });
      else scrollTo({ top: target.getBoundingClientRect().top + scrollY, behavior: reduce ? "auto" : "smooth" });
    });
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Image parallax — children inside a bundle move data-start% → data-end% (scrub 1)
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      el.querySelectorAll("[data-parallax-child]").forEach((c) => {
        gsap.fromTo(c, { y: `${c.dataset.start}%` }, { y: `${c.dataset.end}%`, ease: "linear", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
    });
    // Sub-page photo parallax — the photo inside the cell goes 12% → −12% (scrub .5)
    document.querySelectorAll(".ts-pimg > :first-child").forEach((img) => {
      gsap.fromTo(img, { y: "12%" }, { y: "-12%", ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 0.5 } });
    });
  });

  // Smooth scroll — original uses Lenis defaults (lerp .1) after window load
  addEventListener("load", () => {
    if (!reduce && window.Lenis) TS.lenis = new Lenis({ autoRaf: true });
    ScrollTrigger.refresh();
  });
})();
