// Shared by the whole site — header · menu panel · floating badge · footer fill, Lenis (original 1.1.13 defaults), menu open/close, badge entrance (after 200px, .6s power3.out), other content Splide.
(() => {
  /* Letter panel shapes — our own four panels used instead of the original logo letters (V notch·two bumps·S lump·hook). 267×150 cell */
  const TILE = {
    v: "M0 0L133 34L267 0V150H0Z",
    b: "M0 0H190Q240 0 240 38Q240 62 220 75Q267 88 252 118Q240 150 190 150H0Z",
    s: "M14 6Q120 -6 238 6L240 52Q190 56 180 66Q170 80 230 92Q262 104 252 132Q240 150 140 150Q60 150 10 144L12 98Q70 96 80 84Q86 74 30 62Q0 52 2 30Q4 10 14 6Z",
    h: "M0 10Q0 0 30 0H220Q267 0 267 50Q267 82 228 92Q200 100 200 120V150H0Z"
  };
  window.mbTile = TILE;
  const mark = () => `<svg class="mb-logo__mark" viewBox="0 0 860 300" aria-hidden="true"><path d="${TILE.v}" transform="scale(1)"/><path d="${TILE.b}" transform="translate(296 0)"/><path d="${TILE.s}" transform="translate(592 0)"/></svg>`;
  const page = document.body.dataset.page || "home";
  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => { if (!el.children.length) el.innerHTML = html; });

  fill(".mb-head", `<a class="mb-logo mb-z" href="index.html" data-label="Recruit site logo — bold block-letter wordmark + two lines of English">${mark()}<span class="mb-logo__txt" data-label="Site name in English">RECRUIT SITE<br>2028</span></a>
    <div class="mb-shoulder mb-z">
      <div class="mb-sbtn is-entry"><a class="mb-sbtn__face" href="recruit.html"><span class="mb-sbtn__default"><b data-label="Button English text">Entry</b><small>2028</small></span><span class="mb-sbtn__hover">First time? Start here</span></a></div>
      <div class="mb-sbtn is-login"><a class="mb-sbtn__face" href="#"><span class="mb-sbtn__default"><b data-label="Button English text">Login</b><small>2028</small></span><span class="mb-sbtn__hover">Already registered? Start here</span></a></div>
      <button class="mb-burger" type="button" data-menu aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>
    </div>`);
  const MENU = [
    ["Work", "Day of", [["Job Type Introduction", "index.html#Job"], ["Career story", "detail.html"], ["Talk Session", "index.html#Column"]]],
    ["Place", "Environment of", [["Work Style", "works.html"], ["Company in Numbers", "works.html"], ["The company in video", "index.html#About"], ["Org Chart", "#"]]],
    ["Topic", "", [["News", "news.html"], ["Internship info", "recruit.html"], ["Selection Process Info", "recruit.html"], ["Application guidelines", "recruit.html"]]],
    ["Message", "", [["New hire recruiting message", "index.html#About"], ["Key message", "index.html#About"], ["HR team message", "#"]]]
  ];
  fill(".mb-menu", `<div class="mb-menu__inner">${MENU.map(([en, ja, items]) => `<dl><dt><span class="en" data-label="Menu group English">${en}</span>${ja}</dt><dd><ul>${items.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></dd></dl>`).join("")}<div class="mb-menu__sns"><a href="#" aria-label="SNS 1"></a><a href="#" aria-label="SNS 2"></a></div></div>`);
  fill(".mb-bnr", `<a class="mb-bnr__card mb-ph is-green" href="#" data-label="16-type diagnosis banner — green panel with a character illustration and a bold handwritten title, vertical 190:220"></a><button class="mb-bnr__close" type="button" aria-label="Close"></button>`);
  fill(".mb-foot", `<div class="mb-foot__cols">
      <div><h4><span class="en" data-label="Company English abbreviation">OUR</span>Day of</h4><ul><li><a href="index.html#Job">Job Type Introduction</a></li><li><a href="detail.html">Career story</a></li><li><a href="index.html#Column">Talk Session</a></li></ul></div>
      <div><h4><span class="en">OUR</span>Environment of</h4><ul><li><a href="works.html">Work Style</a></li><li><a href="works.html">Company in Numbers</a></li><li><a href="index.html#About">The company in video</a></li><li><a href="#">Org Chart</a></li></ul></div>
      <div><h4><span class="en" data-label="Bundle English text">Topic</span></h4><ul><li><a href="news.html">News</a></li><li><a href="recruit.html">Internship info</a></li><li><a href="recruit.html">Selection Process Info</a></li><li><a href="recruit.html">Application guidelines</a></li><li><a href="#">Hiring harassment prevention policy</a></li></ul></div>
      <div><h4><span class="en" data-label="Bundle English text">Message</span></h4><ul><li><a href="index.html#About">New hire recruiting message</a></li><li><a href="index.html#About">Key message</a></li><li><a href="#">HR team message</a></li></ul></div>
    </div>
    <div class="mb-foot__brand">${mark()}<b data-label="Site name in English">RECRUIT 2028</b><a href="#">Company official site</a><small class="mb-foot__copy" data-label="Copyright (English)">© 2026 Company Name, Inc.</small></div>`);

  const OTHER = [["Career Story", "Career story", "detail.html", "Work photo · male employee in front of bookshelves"], ["Special Contents", "Special content", "detail.html", "Talk photo · two men at the studio door"], ["Work Style", "Work Style", "works.html", "Office photo · bright lounge"], ["Movie", "The company in video", "index.html#About", "Video thumbnail · editing room monitor"], ["Talk Session", "Roundtable", "index.html#Column", "Roundtable photo · three staff"], ["News", "News", "news.html", "Company building exterior · clear daytime"]];
  fill(".mb-other", `<h2 class="mb-other__title"><span class="en" data-label="Section English name">Other Contents</span><small>Recommended content</small></h2>
    <div class="splide" aria-label="Other content"><div class="splide__track"><ul class="splide__list">${OTHER.map(([en, ja, h, ph]) => `<li class="splide__slide"><a class="mb-ocard" href="${h}"><span class="mb-ph" data-label="${ph} · Portrait 3:4"></span><span class="mb-ocard__txt"><span class="mb-tag-en">${en}</span><span class="mb-tag-ja is-sm">${ja}</span></span></a></li>`).join("")}</ul></div></div>`);

  /* Small graphics — a ”Pick Up” serrated star badge (white face, ink border) and a round mascot face on a gray panel (our own drawing instead of the original character) */
  const star = (n, r1, r2) => Array.from({ length: n * 2 }, (_, i) => { const a = (Math.PI / n) * i - Math.PI / 2, r = i % 2 ? r2 : r1; return `${(54 + r * Math.cos(a)).toFixed(1)} ${(54 + r * Math.sin(a)).toFixed(1)}`; }).join(" L");
  const DOODLE = {
    pick: `<svg viewBox="0 0 108 108"><path d="M${star(22, 52, 44)}Z" style="fill:var(--kf-surface);stroke:var(--kf-ink);stroke-width:2"/><text x="54" y="50" text-anchor="middle" style="font:400 21px var(--kf-font-display);fill:var(--kf-ink)">Pick</text><text x="54" y="74" text-anchor="middle" style="font:400 21px var(--kf-font-display);fill:var(--kf-ink)">Up</text></svg>`,
    // Gray ball head + green body figure (in the spirit of the original career story illustration) — megaphone, two desks, and a small globe with four such figures standing around it
    "fig-mega": `<svg viewBox="0 0 220 180"><path d="M40 180Q40 100 100 96Q160 100 160 180Z" style="fill:var(--site-green-deep)"/><circle cx="100" cy="66" r="30" style="fill:var(--site-glay-2)"/><path d="M130 70L196 40L196 110Z" style="fill:var(--site-orange)"/><path d="M200 50L216 40M204 74H220M200 98L216 110" style="stroke:var(--kf-accent-text);stroke-width:5;stroke-linecap:round"/></svg>`,
    "fig-desk": `<svg viewBox="0 0 220 180"><path d="M20 180Q20 104 80 100Q130 104 140 150" style="fill:var(--site-green-deep)"/><circle cx="80" cy="70" r="28" style="fill:var(--site-glay-2)"/><path d="M100 140L210 120L220 170L110 180Z" style="fill:color-mix(in oklab, var(--site-glay) 60%, var(--ws-blue, var(--kf-accent-text)))"/><rect x="150" y="60" width="54" height="56" style="fill:var(--site-glay)"/><rect x="120" y="150" width="40" height="12" style="fill:var(--site-orange)"/></svg>`,
    planet: `<svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="130" style="fill:color-mix(in oklab, var(--kf-accent) 30%, var(--kf-surface))"/>${[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((a) => `<g transform="rotate(${a} 200 200) translate(200 70) scale(1.7) translate(-200 -52)"><path d="M178 52Q178 22 200 20Q222 22 222 52Z" style="fill:var(--site-green-deep)"/><circle cx="200" cy="12" r="11" style="fill:var(--site-glay-2)"/><rect x="226" y="30" width="34" height="22" transform="rotate(14 243 41)" style="fill:var(--site-glay)"/></g>`).join("")}</svg>`,
    mascot: `<svg viewBox="0 0 220 200"><circle cx="40" cy="40" r="26" style="fill:var(--kf-ink-soft)"/><circle cx="180" cy="40" r="26" style="fill:var(--kf-ink-soft)"/><ellipse cx="110" cy="120" rx="96" ry="88" style="fill:var(--kf-ink-soft)"/><ellipse cx="110" cy="134" rx="78" ry="70" style="fill:color-mix(in oklab, var(--site-orange) 35%, var(--kf-surface))"/><path d="M58 110Q80 96 100 112M120 112Q140 96 162 110" style="fill:none;stroke:var(--kf-ink-soft);stroke-width:8;stroke-linecap:round"/><path d="M84 160Q110 176 136 160Q110 166 84 160Z" style="fill:var(--site-orange);stroke:var(--kf-ink-soft);stroke-width:5"/></svg>`
  };
  document.querySelectorAll(".mb-d[data-d]").forEach((el) => { if (!el.firstElementChild && DOODLE[el.dataset.d]) el.innerHTML = DOODLE[el.dataset.d]; });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Lenis — the original 1.1.13 with defaults (lerp .1 · smoothWheel) hooked onto the GSAP ticker */
  let lenis = null;
  if (!reduce && typeof Lenis === "function") {
    lenis = new Lenis();
    window.mbLenis = lenis;
    if (window.gsap) {
      if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* Menu panel — pressing the button slides it in with .3s ease and the hamburger turns into ✕ */
  const menu = document.querySelector(".mb-menu"), burger = document.querySelector("[data-menu]");
  if (menu && burger) {
    const set = (on) => {
      menu.classList.toggle("is-active", on);
      document.documentElement.classList.toggle("is-menu", on);
      burger.setAttribute("aria-expanded", String(on));
      if (lenis) on ? lenis.stop() : lenis.start();
    };
    burger.addEventListener("click", () => set(!menu.classList.contains("is-active")));
    menu.addEventListener("click", (e) => { if (e.target === menu || e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  /* Floating diagnostic badge — original: past 200px of scroll x 0 .6s power3.out, ✕ autoAlpha 0 .3s, hidden while the footer is visible */
  const bnr = document.querySelector(".mb-bnr");
  if (bnr && window.gsap && window.ScrollTrigger) {
    let closed = false, shown = false;
    const show = (on) => {
      bnr.classList.toggle("is-visible", on);
      gsap.to(bnr, on ? { x: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" } : { autoAlpha: 0, duration: 0.3 });
    };
    ScrollTrigger.create({ start: 200, end: 201, onEnter: () => { if (!closed && !shown) { shown = true; show(true); } } });
    const foot = document.querySelector(".mb-foot");
    if (foot) ScrollTrigger.create({ trigger: foot, start: "top bottom", onToggle: (st) => { if (!closed && shown) show(!st.isActive); } });
    bnr.querySelector(".mb-bnr__close").addEventListener("click", () => { closed = true; show(false); });
  }

  /* Other content — original Splide {loop, speed 1000, perPage 4, perMove 1, gap 4, width 1424, no pagination} */
  document.querySelectorAll(".mb-other .splide").forEach((el) => {
    if (typeof Splide !== "function") return;
    new Splide(el, { type: "loop", speed: 1000, perPage: 4, perMove: 1, gap: "4px", width: "1424px", pagination: false, arrowPath: "M0.035 13.548h28.949l.071-7.344 10.93 10.93-10.93 10.93-.071-7.416H.035z", breakpoints: { 1023: { perPage: 3, width: "365px" } } }).mount();
  });
})();
