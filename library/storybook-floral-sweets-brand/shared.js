// Shared across all pages: draws in the illustration symbols (squirrel · dove · floral-pattern box · silver root · ribbon), and wires up the left vertical menu · phone hamburger overlay · footer · smooth scroll · current-slot indicator · big title letter rise.
// Original values: lenis duration 1 · wheelMultiplier .7 (off on phones and tablets) · menu letters 12ms apart · cover .5s (.165,.84,.44,1).
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = matchMedia("(max-width: 767px)").matches;
  const page = document.body.dataset.page || "home";
  const GM = (window.GM = { reduced, isSP, page });

  // Seeded random — so root and flower layout is the same every time it opens
  let seed = 7;
  const rnd = (a = 0, b = 1) => { seed = (seed * 16807) % 2147483647; return a + ((seed - 1) / 2147483646) * (b - a); };
  GM.rnd = rnd;

  // ── Four floral pattern panels (pink, lilac, mint, sky) — product box exterior ──
  const pal = [
    ["var(--site-flor-0)", "var(--site-flor-0a)", "var(--site-flor-0b)", "var(--site-flor-0l)"],
    ["var(--site-flor-1)", "var(--site-flor-1a)", "var(--site-flor-1b)", "var(--site-flor-1l)"],
    ["var(--site-flor-2)", "var(--site-flor-2a)", "var(--site-flor-2b)", "var(--site-flor-2l)"],
    ["var(--site-flor-3)", "var(--site-flor-3a)", "var(--site-flor-3b)", "var(--site-flor-3l)"],
  ];
  const flower = (x, y, r, c, c2) => {
    let p = "";
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; p += `<ellipse cx="${(x + Math.cos(a) * r * 0.55).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.55).toFixed(1)}" rx="${(r * 0.42).toFixed(1)}" ry="${(r * 0.26).toFixed(1)}" transform="rotate(${(a * 57.3).toFixed(0)} ${(x + Math.cos(a) * r * 0.55).toFixed(1)} ${(y + Math.sin(a) * r * 0.55).toFixed(1)})" fill="${c}"/>`; }
    return p + `<circle cx="${x}" cy="${y}" r="${(r * 0.28).toFixed(1)}" fill="${c2}"/>`;
  };
  const patterns = pal.map(([bg, a, b, l], i) => `<pattern id="gm-flor${i}" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="${bg}"/>${flower(15, 15, 13, a, l)}${flower(46, 42, 11, b, l)}<path d="M30 0c4 10-4 16 0 30s-4 20 0 30" fill="none" stroke="${l}" stroke-width="2"/><circle cx="48" cy="12" r="3" fill="${l}"/><circle cx="12" cy="48" r="3" fill="${l}"/></pattern>`).join("");
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${patterns}
    <linearGradient id="gm-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--site-white)"/><stop offset=".5" stop-color="var(--site-silver-grad)"/><stop offset="1" stop-color="var(--site-silver-grad-end)"/></linearGradient>
    <linearGradient id="gm-navy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--site-navy-hi)"/><stop offset="1" stop-color="var(--site-navy-lo)"/></linearGradient>
  </defs></svg>`);

  // ── Box: three faces — front · side · lid (lid lifts separately as .lid) ──
  GM.box = (x, y, w, h, d, k = 0, extra = "") =>
    `<g class="gm-box ${extra}" transform="translate(${x} ${y})">
      <path d="M${w} 0l${d} ${-d * 0.55}v${h}l${-d} ${d * 0.55}z" fill="url(#gm-flor${k})"/><path d="M${w} 0l${d} ${-d * 0.55}v${h}l${-d} ${d * 0.55}z" fill="var(--site-navy-shade)" opacity=".28"/>
      <rect width="${w}" height="${h}" fill="url(#gm-flor${k})"/>
      <g class="lid"><path d="M0 0l${d} ${-d * 0.55}h${w}l${-d} ${d * 0.55}z" fill="url(#gm-flor${k})"/><path d="M0 0l${d} ${-d * 0.55}h${w}l${-d} ${d * 0.55}z" fill="var(--site-white)" opacity=".3"/></g>
      <rect width="${w}" height="${h}" fill="none" stroke="var(--site-white)" stroke-opacity=".5"/>
    </g>`;

  // ── Squirrel: silver-gray body, tail and face nod separately ──
  GM.risu = (cls = "", flip = false) =>
    `<svg class="gm-ill gm-risu ${cls}" viewBox="0 0 200 190" aria-hidden="true"><g ${flip ? 'transform="translate(200 0) scale(-1 1)"' : ""}>
      <g class="tail"><path d="M70 150C20 150 4 100 22 60 36 28 76 18 92 44c12 20-4 40-22 36 18-12 6-34-12-26-22 10-22 56 6 74z" fill="url(#gm-silver)" stroke="var(--site-silver-line)" stroke-width="2"/><path d="M34 70c8-14 26-18 36-8M30 98c6 16 20 26 34 28" fill="none" stroke="var(--site-silver-line)" stroke-width="1.4" opacity=".7"/></g>
      <path d="M70 160c-4-40 14-74 50-76 30-2 44 26 40 56-4 26-24 38-52 38H70z" fill="url(#gm-silver)" stroke="var(--site-silver-line)" stroke-width="2"/>
      <path d="M96 150c-6 8-2 16 8 16M136 148c6 10 2 18-8 18" fill="none" stroke="var(--site-silver-line)" stroke-width="2"/>
      <g class="face"><path d="M118 92c-6-28 12-50 36-48 22 2 32 22 26 40-4 14-20 22-38 20z" fill="url(#gm-silver)" stroke="var(--site-silver-line)" stroke-width="2"/><path d="M134 50l-4-20 14 14M160 48l6-18 6 22" fill="var(--site-silver-pale)" stroke="var(--site-silver-line)" stroke-width="2" stroke-linejoin="round"/><circle cx="158" cy="68" r="4" fill="var(--site-navy-lo)"/><circle cx="180" cy="80" r="3" fill="var(--site-silver-line)"/></g>
      <path d="M140 118c10-6 22-4 26 4" fill="none" stroke="var(--site-silver-line)" stroke-width="2"/><ellipse cx="160" cy="124" rx="9" ry="7" fill="var(--site-gold)"/>
    </g></svg>`;

  // ── Dove: white body, two wings flapping alternately over .8s ──
  GM.hato = (cls = "") =>
    `<svg class="gm-ill gm-hato ${cls}" viewBox="0 0 220 140" aria-hidden="true">
      <path class="wing-l" d="M96 64C60 30 30 26 4 34c22 6 36 18 44 30-16-2-28 2-38 10 26 0 48 6 66 12z" fill="var(--site-silver-white)" stroke="var(--site-silver-line)" stroke-width="2"/>
      <path d="M60 80c20-26 70-34 104-20 18 8 28 2 36-6 8 12 2 28-14 34-30 12-74 18-126-8z" fill="var(--site-white)" stroke="var(--site-silver-line)" stroke-width="2"/>
      <path d="M60 80L20 90l12 8-18 10 46-10" fill="var(--site-silver-pale)" stroke="var(--site-silver-line)" stroke-width="2" stroke-linejoin="round"/>
      <path class="wing-r" d="M120 62c10-30 34-50 66-56-10 14-14 26-14 36 10-6 22-8 32-6-18 12-40 24-84 26z" fill="var(--site-silver-white)" stroke="var(--site-silver-line)" stroke-width="2"/>
      <circle cx="192" cy="58" r="3" fill="var(--site-navy-lo)"/><path d="M204 60l12 3-12 4z" fill="var(--site-beak)"/>
    </svg>`;

  // ── Silver roots (hair-like flow) — curve bundles whose thickness and bends vary by seed random number ──
  GM.roots = (w, h, n, { from = "top", s = 11, op = 0.85 } = {}) => {
    seed = s;
    let p = "";
    for (let i = 0; i < n; i++) {
      const x0 = rnd(-0.1, 1.1) * w, y0 = from === "top" ? rnd(-20, 10) : h + rnd(-10, 20);
      const dir = from === "top" ? 1 : -1;
      const len = rnd(0.35, 0.95) * h;
      const x1 = x0 + rnd(-0.35, 0.35) * w, y1 = y0 + dir * len * 0.4, x2 = x0 + rnd(-0.45, 0.45) * w, y2 = y0 + dir * len * 0.75, x3 = x2 + rnd(-0.2, 0.2) * w, y3 = y0 + dir * len;
      const sw = i % 4 === 0 ? rnd(10, 26) : rnd(1.5, 7);
      p += `<path d="M${x0.toFixed(0)} ${y0.toFixed(0)}C${x1.toFixed(0)} ${y1.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)} ${x3.toFixed(0)} ${y3.toFixed(0)}" stroke="url(#gm-silver)" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" fill="none" opacity="${rnd(0.45, op).toFixed(2)}"/>`;
    }
    return `<svg class="gm-ill" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${p}</svg>`;
  };

  // ── Thick root bundle: a band that twists three or four thick silver strands as it passes (the original’s big roots) ──
  GM.rootBand = (w, h, n = 3, s = 41) => {
    seed = s;
    let p = "";
    for (let b = 0; b < n; b++) {
      const y0 = rnd(0.1, 0.9) * h, y3 = rnd(0.1, 0.9) * h, c1 = rnd(-0.3, 1.3) * h, c2 = rnd(-0.3, 1.3) * h;
      for (let k = 0; k < 4; k++) {
        const o = (k - 1.5) * rnd(10, 22), sw = rnd(18, 46);
        const d = `M-60 ${(y0 + o).toFixed(0)}C${(w * 0.3).toFixed(0)} ${(c1 - o).toFixed(0)} ${(w * 0.7).toFixed(0)} ${(c2 + o).toFixed(0)} ${w + 60} ${(y3 - o).toFixed(0)}`;
        p += `<path d="${d}" stroke="var(--site-silver-line)" stroke-width="${(sw + 4).toFixed(0)}" fill="none" stroke-linecap="round" opacity=".55"/><path d="${d}" stroke="url(#gm-silver)" stroke-width="${sw.toFixed(0)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="var(--site-white)" stroke-width="1.5" fill="none" opacity=".6" stroke-dasharray="${rnd(20, 60).toFixed(0)} ${rnd(10, 40).toFixed(0)}"/>`;
      }
    }
    return `<svg class="gm-ill" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${p}</svg>`;
  };

  // ── Ribbon Band ──
  GM.ribbon = (txt) =>
    `<div class="gm-ribbon"><svg viewBox="0 0 360 90" aria-hidden="true">
      <path d="M40 30L0 22l18 22-16 22 52-6z" fill="var(--site-silver-ribbon)" stroke="var(--kf-accent-text)" stroke-width="1.4"/><path d="M320 30l40-8-18 22 16 22-52-6z" fill="var(--site-silver-ribbon)" stroke="var(--kf-accent-text)" stroke-width="1.4"/>
      <path d="M36 24c90-20 198-20 288 0v40c-90-18-198-18-288 0z" fill="var(--site-silver-white)" stroke="var(--kf-accent-text)" stroke-width="1.6"/>
      <path d="M50 30c80-14 180-14 260 0M50 58c80-14 180-14 260 0" fill="none" stroke="var(--kf-accent-text)" stroke-width=".8" opacity=".5"/>
    </svg><p class="gm-ribbon__txt">${txt}</p>${GM.hato("gm-ribbon__hato is-l")}${GM.hato("gm-ribbon__hato is-r")}</div>`;

  GM.mark = (sub = "PATISSERIE") => `<span class="gm-mark"><small>${sub}</small><b>WORD MARK</b><i>Placeholder</i></span>`;

  // ── Menu ──
  const items = [["Top", "index.html#top"], ["Story", "index.html#story"], ["Products", "index.html#products"], ["Shop", "index.html#shop"], ["About", "index.html#about"], ["News", "index.html#news"], ["Other Brand", "brand.html"]];
  const split = (t) => [...t].map((c, i) => `<span style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("");
  const navCur = (h) => (page === "article" && h.endsWith("#news")) || (page === "brand" && h === "brand.html");
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="gm-side-cover" aria-hidden="true"></div>
    <nav class="gm-nav" aria-label="Main menu" data-slot="side-nav">
      <div class="gm-nav__bg"></div>
      <ul>${items.map(([t, h]) => `<li class="${navCur(h) ? "is-current" : ""}" data-target="${h.split("#")[1] || ""}"><a href="${!h.includes("#") ? h : page === "home" ? "#" + h.split("#")[1] : "index.html?c=" + h.split("#")[1]}">${split(t)}</a></li>`).join("")}</ul>
      <div class="gm-nav__deco">${GM.roots(240, 200, 14, { s: 3 })}${GM.roots(240, 200, 14, { s: 5 })}</div>
      <button class="gm-nav__close" type="button" aria-label="Close Menu"><i></i><i></i></button>
    </nav>
    <button class="gm-burger" type="button" aria-label="Open Menu" data-slot="burger"><i></i><i></i></button>`);
  const nav = document.querySelector(".gm-nav");
  // Only the first page fades in on open over 1.2s (original is-show-1st), and the lower face is visible from the start (is-init)
  if (page === "home") requestAnimationFrame(() => requestAnimationFrame(() => nav.classList.add("is-show-1st")));
  else nav.classList.add("is-init");
  const setOpen = (o) => { nav.classList.toggle("is-open", o); document.documentElement.classList.toggle("no-scroll", o); o ? GM.lenis?.stop() : GM.lenis?.start(); };
  document.querySelector(".gm-burger").addEventListener("click", () => setOpen(true));
  nav.querySelector(".gm-nav__close").addEventListener("click", () => setOpen(false));

  // ── Wide screen: past the hero (first page at 50% of screen height, bottom edge 20%) the text collapses, and hovering the menu expands it again ──
  if (!isSP) {
    const ul = nav.querySelector("ul"), line = page === "home" ? 0.5 : 0.2;
    let over = false;
    const fold = () => nav.classList.toggle("is-min", !over && scrollY > innerHeight * line);
    ul.addEventListener("mouseenter", () => { over = true; fold(); });
    ul.addEventListener("mouseleave", () => { over = false; fold(); });
    addEventListener("scroll", fold, { passive: true });
    addEventListener("resize", fold);
    fold();
  }

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("gm-foot");
    foot.innerHTML = `
      <a class="gm-foot__logo" href="index.html" style="display:block">${GM.mark()}</a>
      <div class="gm-foot__sns"><a href="#" aria-label="Photo account" data-fx="shine-pass-hover" data-fx-shine-pass-hover="look: glow"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor"/></svg></a><a href="#" aria-label="Online shop" data-fx="shine-pass-hover" data-fx-shine-pass-hover="look: glow"><svg viewBox="0 0 24 24"><path d="M4 8h16l-1.5 12h-13z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></a></div>
      <p class="gm-foot__copy">© Placeholder Patisserie</p>
      <div class="gm-foot__img">${GM.roots(1600, 260, 46, { from: "bottom", s: 21 })}</div>`;
  }

  // ── Smooth scroll (desktop only) ──
  if (!reduced && !isSP && window.Lenis) {
    const lenis = (GM.lenis = new Lenis({ duration: 1, wheelMultiplier: 0.7 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // Jump to a section from the menu — original: wide screens 1.25s power3.inOut, phones close the menu then run 1s after .4s. On lower pages go to the first page with ?c= Attaches it, moves on, and rolls .1s later
  const goTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (reduced) return el.scrollIntoView();
    gsap.delayedCall(isSP ? 0.4 : 0, () => gsap.to(window, { scrollTo: { y: el, autoKill: false }, duration: isSP ? 1 : 1.25, ease: "power3.inOut" }));
  };
  document.querySelectorAll('.gm-nav a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); setOpen(false); goTo(a.getAttribute("href").slice(1)); }));
  const asked = new URLSearchParams(location.search).get("c");
  if (page === "home" && asked) {
    addEventListener("load", () => gsap.delayedCall(0.1, () => goTo(asked)), { once: true });
    history.replaceState({}, "", location.pathname + location.hash);
  }

  // ── Current slot: a dot in the menu for the zone crossing screen center ──
  const anchors = [...document.querySelectorAll("[data-anchor]")];
  if (anchors.length) {
    const lis = [...nav.querySelectorAll("li")];
    const mark = (id) => lis.forEach((li) => li.classList.toggle("is-current", li.dataset.target === id));
    anchors.forEach((s) => ScrollTrigger.create({ trigger: s, start: "top 50%", end: "bottom 50%", onToggle: (st) => st.isActive && mark(s.dataset.anchor) }));
    mark(anchors[0].dataset.anchor);
  }

  // ── Cursive big heading: split into letters, rising one by one when visible ──
  document.querySelectorAll(".gm-title__en1").forEach((el) => { el.innerHTML = split(el.textContent).replace(/span/g, "i"); });
  const titles = document.querySelectorAll(".gm-title");
  if (!reduced) titles.forEach((t) => {
    t.classList.add("is-pre");
    t.querySelectorAll(".gm-title__en1 i").forEach((c, k) => (c.style.transitionDelay = `${k * 0.06}s`));
    ScrollTrigger.create({ trigger: t, start: "top 80%", once: true, onEnter: () => t.classList.remove("is-pre") });
  });

  // ── When visible, add is-show (original data-inview) ──
  const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-show"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll("[data-inview]").forEach((el) => (reduced ? el.classList.add("is-show") : io.observe(el)));
})();
