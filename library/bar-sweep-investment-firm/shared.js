// Shared across pages: inserts the header · pill nav · contact window · footer, and hooks up the loader · smooth scroll · title wipe · nav backing · footer reveal · page transition.
(() => {
  const doc = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = () => innerWidth <= 1024;
  // Original getResponsivePixels — design px to px at the current width
  const unit = () => (innerWidth <= 700 ? innerWidth / 375 : innerWidth <= 1024 ? 1.8693 : innerWidth <= 1600 ? innerWidth / 1440 : 1.1118);
  const px = (n) => n * unit();

  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const WIPE_EASE = CustomEase.create("rpWipe", "M0,0 C0.92,0.09 0.13,0.97 1,1");
  const FADE_EASE = CustomEase.create("rpFade", "M0,0 C0.25,0.1 0.25,1 1,1");
  const INTRO = { fadeIn: 0.5833, spread: 1.3333, riseUp: 0.75, contentFade: 0.8333, contentRise: 24, ease: "power2.inOut" };
  const WIPE = { step: 0.5, reveal: 0.44 };
  const REVEAL = { markDelay: 0.5, wipeDelay: 0.31, stagger: 0.1, rise: 16, ctaLead: 0.15 };
  const HERO_WIPE = { delay: 0.1, duration: 1, belowFade: 0.6, belowLead: 0.15, belowRise: 16 };

  // A section reached through an internal link in the same tab skips the loader — the original also shows the loader only once
  const arrived = sessionStorage.getItem("rp-nav") === "1";
  sessionStorage.removeItem("rp-nav");
  const skipIntro = arrived || reduce;
  // The original preloader starts the intro only after 0.6s (minDuration 600) has passed since the document opened
  const WAIT = skipIntro ? 0 : Math.max(0, 600 - performance.now());
  const CONTENT_DELAY = skipIntro ? 0 : WAIT / 1000 + INTRO.fadeIn + INTRO.spread + INTRO.riseUp;

  const barAt = (i) => REVEAL.markDelay + REVEAL.wipeDelay + i * REVEAL.stagger;
  const ctaStartFor = (n) => barAt(n - 1) + WIPE.reveal + WIPE.step - REVEAL.ctaLead;
  const wipeLine = (tl, el, at) =>
    tl.fromTo(el, { "--wipe-lead": 0 }, { "--wipe-lead": 1, duration: WIPE.step, ease: WIPE_EASE }, at)
      .fromTo(el, { "--wipe-trail": 0 }, { "--wipe-trail": 1, duration: WIPE.step, ease: WIPE_EASE }, at + WIPE.reveal);
  const riseInto = (tl) => (el, at) => {
    if (!el || (el.length !== undefined && !el.length)) return tl;
    return tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: WIPE.step, ease: WIPE_EASE }, at)
      .fromTo(el, { y: px(REVEAL.rise) }, { y: 0, duration: WIPE.step, ease: INTRO.ease }, at);
  };
  // Hero title: a bar passes once per second (first half covers, second half uncovers) and the text below rises overlapping by 0.15s
  const sweepInto = (tl, line, below) => {
    gsap.set(line, { "--wipe-lead": 0, "--wipe-trail": 0 });
    gsap.set(below, { autoAlpha: 0, y: HERO_WIPE.belowRise });
    const s = { progress: 0 };
    return tl
      .to(s, { progress: 1, duration: HERO_WIPE.duration, ease: WIPE_EASE, onUpdate: () => gsap.set(line, { "--wipe-lead": Math.min(1, 2 * s.progress), "--wipe-trail": Math.max(0, 2 * s.progress - 1) }) })
      .to(below, { autoAlpha: 1, y: 0, duration: HERO_WIPE.belowFade, ease: INTRO.ease }, `-=${HERO_WIPE.belowLead}`);
  };
  const hideLines = (root) => { if (!small() && !reduce) gsap.set(root.querySelectorAll("[data-line]"), { "--wipe-lead": 0, "--wipe-trail": 0 }); };

  // ── Icons
  const I = {
    mark: '<svg class="rp-mark" viewBox="0 0 38 38" aria-hidden="true"><path fill="currentColor" d="M3 3h32v9H12v23H3z"/><path class="rp-mark__shade" d="M18 18h17v17h-9v-8h-8z"/></svg>',
    amp: '<svg class="rp-head__amp" viewBox="0 0 14 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M7 2v12M2 8h10"/></svg>',
    chev: '<svg viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M2 3.8 5.5 7.3 9 3.8"/></svg>',
    go: '<svg class="is-go" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M1.5 6.5h10M7 11l4.5-4.5L7 2"/></svg>',
    x: '<svg class="is-x" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m1.5 1.5 10 10m-10 0 10-10"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M7 12h10m-4.5 4.5L17 12l-4.5-4.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.5 10.5 12 5l6.5 5.5v8h-13z"/><path d="M10 18.5v-5h4v5"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17V7h5l1.8 2H19v8z"/><path d="m9 14.5 2-2m0 0H9.2m1.8 0v1.8"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.6"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3"/></svg>',
    turn: '<svg viewBox="0 0 11 13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1.5V8h9M7 5l3 3-3 3"/></svg>',
    sns: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M1 1h14v14H1zm2.6 5.4v6h1.9v-6zm.95-2.8a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2M7 6.4v6h1.9V9.3c0-1.7 2.1-1.8 2.1 0v3.1h1.9V8.7c0-2.9-3.1-2.8-4-1.4v-.9z"/></svg>',
  };
  const PAGES = [
    { key: "home", label: "Home", href: "index.html", icon: "home" },
    { key: "works", label: "Works", href: "works.html", icon: "folder" },
    { key: "focus", label: "Focus", href: "focus.html", icon: "target" },
  ];
  const here = PAGES.find((p) => p.key === page) || PAGES[0];
  const cta = (label, href, icon, dark) =>
    `<a class="rp-cta${dark ? " is-dark" : ""}" href="${href}"><span class="rp-cta__icon">${I[icon]}</span><span class="rp-cta__label"><span>${label}</span><span class="rp-cta__arrow">${I.arrow}${I.arrow}</span></span></a>`;
  document.querySelectorAll("[data-cta]").forEach((el) => { el.outerHTML = cta(el.dataset.cta, el.getAttribute("href"), el.dataset.icon || "target", el.hasAttribute("data-dark")); });

  // ── Head
  const head = document.querySelector('[data-slot="header"]');
  head.className = "rp-head";
  head.innerHTML = `<div class="rp-head__half"><p class="rp-head__word is-l t-22" data-label="Brand English name, first word">Studio</p><div class="rp-head__rule is-l"></div></div>${I.amp}<div class="rp-head__half"><div class="rp-head__rule is-r"></div><p class="rp-head__word is-r t-22" data-label="Brand English name, second word">Name</p></div>`;
  const loader = document.createElement("div");
  loader.className = "rp-loader";
  loader.dataset.slot = "loader";
  document.body.prepend(loader);
  const veil = document.createElement("div");
  veil.className = "rp-veil";
  veil.dataset.slot = "page-transition";
  document.body.append(veil);

  // ── Pill nav + contact window
  const roll = (label, href) => `<a class="rp-roll" href="${href}">${I.turn}<span class="rp-roll__clip"><span class="rp-roll__stack"><span class="t-14">${label}</span><span class="t-14" aria-hidden="true">${label}</span></span></span></a>`;
  const nav = document.createElement("nav");
  nav.className = "rp-nav";
  nav.dataset.slot = "nav";
  nav.setAttribute("aria-label", "Main");
  nav.dataset.shown = "false";
  nav.dataset.formOpen = "false";
  nav.innerHTML = `
    <div class="rp-nav__bar">
      <div class="rp-nav__left">
        <button class="rp-nav__burger" type="button" data-open="false" aria-expanded="false" aria-controls="rp-panel" aria-label="Open Menu"><i></i><i></i><i></i></button>
        <a class="rp-nav__logo" href="index.html" aria-label="First Page">${I.mark}</a>
        <button class="rp-nav__here" type="button" aria-expanded="false" aria-controls="rp-panel"><span>${here.label}</span>${I.chev}</button>
      </div>
      <button class="rp-nav__cta" type="button" data-form-open="false" aria-label="Contact Us"><span>Contact Us</span>${I.go}</button>
    </div>
    <div class="rp-nav__panel" id="rp-panel" data-open="false">${PAGES.map((p) => `<a class="rp-nav__link" href="${p.href}"${p === here ? ' aria-current="page"' : ""}>${I[p.icon]}<span>${p.label}</span></a>`).join("")}</div>
    <div class="rp-form__veil"></div>
    <div class="rp-form" role="dialog" aria-label="Inquiry" data-slot="contact-form">
      <div class="rp-form__head"><div class="rp-form__title"><p class="t-22">Contact Us</p><div class="rp-form__social"><a href="#" aria-label="SNS 1">${I.sns}</a></div></div><div class="rp-form__rule"></div></div>
      <div class="rp-form__body" data-lenis-prevent>
        <div class="rp-field"><label class="t-m10" for="rp-f1">Name</label><input id="rp-f1" type="text" placeholder="Name"></div>
        <div class="rp-field"><label class="t-m10" for="rp-f2">Email</label><input id="rp-f2" type="email" placeholder="Email address"></div>
        <div class="rp-field"><label class="t-m10" for="rp-f3">Company</label><input id="rp-f3" type="text" placeholder="Company name"></div>
        <div class="rp-field"><label class="t-m10" for="rp-f4">Message</label><textarea id="rp-f4" placeholder="Write your inquiry details here."></textarea></div>
      </div>
      <div class="rp-form__foot"><button class="rp-form__send" type="button"><span>Send Message</span>${I.go}</button></div>
    </div>`;
  head.after(nav);
  const burger = nav.querySelector(".rp-nav__burger"), hereBtn = nav.querySelector(".rp-nav__here"), panel = nav.querySelector(".rp-nav__panel"), ctaBtn = nav.querySelector(".rp-nav__cta");
  let menuOpen = false, formOpen = false;
  const setMenu = (on) => {
    menuOpen = on;
    burger.dataset.open = panel.dataset.open = String(on);
    burger.setAttribute("aria-expanded", on); hereBtn.setAttribute("aria-expanded", on);
    burger.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
  };
  const setForm = (on) => {
    formOpen = on;
    nav.dataset.formOpen = ctaBtn.dataset.formOpen = String(on);
    ctaBtn.setAttribute("aria-label", on ? "Close" : "Contact Us");
    ctaBtn.querySelector("span").textContent = on ? "Close" : "Contact Us";
    ctaBtn.querySelector("svg").outerHTML = on ? I.x : I.go;
    burger.disabled = hereBtn.disabled = on;
    if (on) setMenu(false);
    const l = window.lenisInstance;
    if (l) on ? l.stop() : l.start();
  };
  burger.addEventListener("click", () => setMenu(!menuOpen));
  hereBtn.addEventListener("click", () => setMenu(!menuOpen));
  ctaBtn.addEventListener("click", () => setForm(!formOpen));
  nav.querySelector(".rp-form__veil").addEventListener("click", () => setForm(false));
  nav.querySelector(".rp-form__send").addEventListener("click", () => setForm(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); if (formOpen) setForm(false); } });
  addEventListener("pointerdown", (e) => { if (menuOpen && !nav.contains(e.target)) setMenu(false); });
  document.querySelectorAll("[data-open-contact]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); setForm(true); }));

  // ── Footer
  const foot = document.querySelector('[data-slot="footer"]');
  foot.className = "rp-foot";
  const tiles = [[0, 249, 253, 196], [353, 249, 253, 196], [706, 249, 340, 196], [1147, 249, 253, 196], [0, 513, 253, 240], [353, 513, 340, 240], [793, 513, 253, 240], [1147, 513, 253, 240], [0, 795, 253, 164], [353, 795, 693, 164], [1147, 795, 253, 164]];
  foot.innerHTML = `<div class="rp-foot__in"><div class="rp-foot__stage">
    <div class="rp-foot__tiles" aria-hidden="true">${tiles.map(([x, y, w, h]) => `<i style="left:${(x / 14).toFixed(3)}%;top:${(y / 9.6).toFixed(3)}%;width:${(w / 14).toFixed(3)}%;height:${(h / 9.6).toFixed(3)}%"></i>`).join("")}</div>
    <div class="rp-foot__main">
      <svg class="rp-foot__word" viewBox="0 0 1353 190" role="img" aria-label="Studio &amp; Name" data-label="Brand English-name wordmark — fills the full footer width"><text x="0" y="186" font-size="257" letter-spacing="-15" textLength="1353" lengthAdjust="spacingAndGlyphs">Studio &amp; Name</text></svg>
      <div class="rp-foot__cols">
        <div class="rp-foot__col"><p class="t-m14">Home</p><div class="rp-foot__links">${roll("Home", "index.html")}${roll("Focus", "focus.html")}</div></div>
        <div class="rp-foot__col"><p class="t-m14">Company</p><div class="rp-foot__links">${roll("Works", "works.html")}${roll("Contact Us", "#contact")}</div></div>
        <div class="rp-foot__col"><p class="t-m14">Contact</p><div class="rp-foot__links">${roll("hello@studio-name.com", "#mail")}</div></div>
      </div>
    </div>
    <div class="rp-foot__base"><div class="rp-foot__copy"><a href="index.html" aria-label="First Page">${I.mark}</a><p class="t-m10">Copyright © 2026 Studio &amp; Name. All rights reserved.</p></div><a class="rp-foot__sns" href="#" aria-label="SNS 1">${I.sns}</a></div>
  </div></div>`;
  foot.querySelector('[href="#contact"]').addEventListener("click", (e) => { e.preventDefault(); setForm(true); });
  foot.querySelector('[href="#mail"]').addEventListener("click", (e) => e.preventDefault());

  // ── Smooth Scroll
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ autoRaf: false });
    window.lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Loader, header, nav entrance
  if (skipIntro) head.dataset.intro = loader.dataset.intro = "skip";
  else setTimeout(() => { head.dataset.intro = "done"; loader.dataset.intro = "away"; }, WAIT);
  if (reduce) { gsap.set(nav, { "--nav-intro": 1 }); nav.dataset.shown = "true"; }
  else gsap.timeline({ delay: CONTENT_DELAY, onStart: () => { nav.dataset.shown = "true"; } }).to(nav, { "--nav-intro": 1, duration: INTRO.contentFade, ease: INTRO.ease });

  // ── Nav base: when the base spot rises to the nav’s floating height, it attaches to the document and goes up together
  const dock = document.querySelector("[data-docks-nav]");
  if (dock) {
    let gap = null, lastW = 0, docked = false, lastTop = null;
    const undock = () => { nav.removeAttribute("data-docked"); nav.style.removeProperty("--nav-dock-top"); };
    const tick = () => {
      if (!docked || lastW !== innerWidth) {
        const was = nav.dataset.docked === "true";
        if (was) nav.removeAttribute("data-docked");
        gap = innerHeight - nav.getBoundingClientRect().bottom; lastW = innerWidth;
        if (was) nav.dataset.docked = "true";
      }
      const n = nav.getBoundingClientRect(), d = dock.getBoundingClientRect();
      const on = d.top <= innerHeight - gap - n.height, top = on ? d.top + scrollY : null;
      if (on === docked && (top === null || (lastTop !== null && Math.abs(top - lastTop) < 0.5))) return;
      docked = on; lastTop = top;
      if (top === null) return undock();
      nav.style.setProperty("--nav-dock-top", `${top}px`); nav.dataset.docked = "true";
    };
    gsap.ticker.add(tick); tick();
  } else if (!reduce) {
    gsap.timeline({ scrollTrigger: { trigger: foot, start: () => `top bottom-=${innerHeight - nav.getBoundingClientRect().top}`, end: "+=100000", toggleActions: "play none none reverse", invalidateOnRefresh: true, onToggle: (s) => { if (s.isActive) setMenu(false); } } })
      .to(nav, { "--nav-away": 1, duration: 0.25, ease: "cubic-bezier(0.215,0.61,0.355,1)" });
  }

  // ── Footer reveal
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: true } })
      .fromTo(foot.querySelector(".rp-foot__in"), { "--reveal": 0.92, "--lag": 1 }, { "--reveal": 1, "--lag": 0, ease: "none", duration: 1 }, 0);
  });
  if (reduce) gsap.set(foot.querySelector(".rp-foot__in"), { "--reveal": 1, "--lag": 0 });

  // ── Closing CTA (two-line title + base)
  document.querySelectorAll('[data-slot="end-cta"]').forEach((sec) => {
    if (reduce) return;
    const labels = sec.querySelector(".rp-end__labels"), title = sec.querySelector(".rp-end__title"), note = sec.querySelector(".rp-end__note");
    hideLines(sec);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 65%", once: true } }), rise = riseInto(tl);
    rise(labels, 0);
    if (small()) { rise(title, barAt(0)); rise(note, barAt(0)); }
    else { const lines = [...title.querySelectorAll("[data-line]")]; lines.forEach((l, i) => wipeLine(tl, l, barAt(i))); rise(note, ctaStartFor(lines.length)); }
  });

  // ── Intro sentence (label → symbol → line wipe → button)
  document.querySelectorAll('[data-slot="statement"]').forEach((sec) => {
    if (reduce) return;
    const text = sec.querySelector(".intro__text"), lines = [...text.querySelectorAll("[data-line]")];
    hideLines(sec);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec.querySelector(".intro__top"), start: "top 65%", once: true } }), rise = riseInto(tl);
    rise([sec.querySelector(".intro__labels"), sec.querySelector(".intro__rule")], 0);
    rise(sec.querySelector(".intro__mark"), REVEAL.markDelay);
    if (small()) rise(text, barAt(0)); else lines.forEach((l, i) => wipeLine(tl, l, barAt(i)));
    rise(sec.querySelector(".intro__cta"), ctaStartFor(lines.length));
  });

  // ── Page transition: a black cover covers for 0.5s, then lifts for 0.5s on the next page
  if (arrived && !reduce) veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, easing: "ease-in-out", fill: "forwards" });
  addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html$/.test(href)) return;
    e.preventDefault();
    setMenu(false);
    if (href === location.pathname.split("/").pop()) return;
    sessionStorage.setItem("rp-nav", "1");
    if (reduce) { location.href = href; return; }
    veil.classList.add("is-on");
    veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: "ease-in-out", fill: "forwards" });
    setTimeout(() => { location.href = href; }, 500);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { veil.classList.remove("is-on"); veil.getAnimations().forEach((a) => a.cancel()); } });

  // ── Shapes: in place of the original’s transparent images (stone, surveyor, arrow, target, pillar, stairs, gem), draw same-size, spinning low-poly shapes on a canvas
  const V = (x, y, z) => [x, y, z];
  const quad = (a, b, c, d) => [[a, b, c], [a, c, d]];
  const box = (cx, cy, cz, sx, sy, sz) => {
    const p = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => V(cx + x * sx / 2, cy + y * sy / 2, cz + z * sz / 2))));
    return [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]].flatMap((f) => quad(...f.map((i) => p[i])));
  };
  const prism = (n, r0, r1, y0, y1, cx = 0, cz = 0, cap = true) => {
    const ring = (r, y) => Array.from({ length: n }, (_, i) => V(cx + Math.cos((i / n) * 6.2832) * r, y, cz + Math.sin((i / n) * 6.2832) * r));
    const a = ring(r0, y0), b = ring(r1, y1), out = [];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; out.push(...quad(a[i], b[i], b[j], a[j])); if (cap) { out.push([V(cx, y0, cz), a[i], a[j]]); out.push([V(cx, y1, cz), b[j], b[i]]); } }
    return out;
  };
  const move = (tris, f) => tris.map((t) => t.map(f));
  const rotX = (a) => ([x, y, z]) => V(x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a));
  const rotZ = (a) => ([x, y, z]) => V(x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z);
  const shift = (dx, dy, dz) => ([x, y, z]) => V(x + dx, y + dy, z + dz);
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const SHAPES = {
    rock() {
      const t = (1 + Math.sqrt(5)) / 2, r = rnd(7);
      let v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
      let f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
      const norm = (p) => { const l = Math.hypot(...p); return p.map((c) => c / l); };
      v = v.map(norm);
      for (let n = 0; n < 2; n++) {
        const mid = new Map(), m = (a, b) => { const k = a < b ? `${a}_${b}` : `${b}_${a}`; if (!mid.has(k)) { mid.set(k, v.length); v.push(norm(v[a].map((c, i) => (c + v[b][i]) / 2))); } return mid.get(k); };
        f = f.flatMap(([a, b, c]) => { const ab = m(a, b), bc = m(b, c), ca = m(c, a); return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]; });
      }
      v = v.map((p) => { const k = 0.84 + r() * 0.3; return V(p[0] * k * 0.86, p[1] * k * 1.05, p[2] * k * 0.8); });
      return move(f.map((t3) => t3.map((i) => v[i])), rotZ(-0.35));
    },
    tripod() {
      const leg = (a) => move(move(prism(4, 0.05, 0.02, 0, -1.25), rotZ(0.3)), ([x, y, z]) => V(x * Math.cos(a) - z * Math.sin(a) + Math.cos(a) * 0.12, y, x * Math.sin(a) + z * Math.cos(a) + Math.sin(a) * 0.12));
      return [...leg(0.5), ...leg(2.6), ...leg(4.7), ...prism(8, 0.26, 0.26, 0, 0.08), ...prism(8, 0.18, 0.2, 0.08, 0.3), ...box(0, 0.62, 0, 0.36, 0.62, 0.22), ...move(prism(8, 0.13, 0.15, -0.42, 0.3), rotX(1.5708)).map((t3) => t3.map(shift(0, 0.84, 0))), ...box(0, 1.0, 0, 0.22, 0.12, 0.3)];
    },
    arrow: () => move([...prism(4, 0.16, 0.16, -1, 0.25), ...prism(4, 0.5, 0.01, 0.25, 1.05)], rotZ(-0.6)),
    target: () => move([...prism(20, 1, 1, -0.08, 0.02), ...prism(20, 0.68, 0.68, 0.02, 0.1), ...prism(20, 0.36, 0.36, 0.1, 0.18), ...prism(12, 0.1, 0.1, 0.18, 0.3)], rotX(1.2)),
    pillar: () => [...box(0, -0.95, 0, 1, 0.14, 1), ...box(0, -0.82, 0, 0.8, 0.12, 0.8), ...prism(10, 0.3, 0.26, -0.76, 0.76), ...box(0, 0.82, 0, 0.8, 0.12, 0.8), ...box(0, 0.95, 0, 1, 0.14, 1)],
    stairs: () => [0, 1, 2, 3].flatMap((i) => box(-0.6 + i * 0.4, -0.6 + i * 0.2, 0, 0.4, 0.4 + i * 0.4, 1.1)),
    diamond: () => [...prism(8, 0.01, 0.8, -1, 0.2, 0, 0, false), ...prism(8, 0.8, 0.45, 0.2, 0.55, 0, 0, false), ...prism(8, 0.45, 0.45, 0.55, 0.56)],
  };
  const meshCache = {};
  const meshOf = (kind) => (meshCache[kind] ||= (SHAPES[kind] || SHAPES.rock)().map((t3, i) => {
    const c = [0, 1, 2].map((k) => (t3[0][k] + t3[1][k] + t3[2][k]) / 3), r = rnd(i * 31 + 5);
    return { p: t3, c, d: [r() - 0.5, r() - 0.3, r() - 0.5], s: r() * 6 };
  }));
  // One shape on screen. spin: rotation per second (rad), tilt: forward lean. morph(kind, seconds): pieces scatter, then gather into the next shape
  function shape(canvas, kind, opt = {}) {
    const ctx = canvas.getContext("2d"), spin = opt.spin ?? 0.25, tilt = opt.tilt ?? -0.25, scale = opt.scale ?? 0.36;
    let cur = kind, burst = 0, w = 0, h = 0, seen = false, raf = 0, t0 = performance.now(), angle = opt.angle ?? 0.6;
    const style = getComputedStyle(doc), col = (n) => style.getPropertyValue(n).trim();
    const fit = () => { const r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); w = canvas.width = Math.max(2, Math.round(r.width * d)); h = canvas.height = Math.max(2, Math.round(r.height * d)); draw(); };
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const ca = Math.cos(angle), sa = Math.sin(angle), ct = Math.cos(tilt), st = Math.sin(tilt), k = Math.min(w, h) * scale;
      const dark = col(opt.dark || "--kf-bg"), light = col(opt.light || "--kf-ink");
      const faces = meshOf(cur).map((f) => {
        const pts = f.p.map(([x, y, z]) => {
          const e = burst * burst;
          x += f.d[0] * e * 3 + (x - f.c[0]) * -e * 0.5; y += f.d[1] * e * 3 + (y - f.c[1]) * -e * 0.5; z += f.d[2] * e * 3 + (z - f.c[2]) * -e * 0.5;
          const X = x * ca + z * sa, Z = -x * sa + z * ca, Y = y * ct - Z * st, Z2 = y * st + Z * ct;
          return [X, Y, Z2];
        });
        const [a, b, c] = pts, ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
        if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        return { pts, z: (a[2] + b[2] + c[2]) / 3, lit: Math.max(0, nx * -0.55 + ny * 0.8 + nz * 0.22) };
      }).sort((a, b) => a.z - b.z);
      for (const f of faces) {
        ctx.beginPath();
        f.pts.forEach(([x, y], i) => ctx[i ? "lineTo" : "moveTo"](w / 2 + x * k, h / 2 - y * k));
        ctx.closePath();
        ctx.globalAlpha = 1 - burst * 0.75; ctx.fillStyle = dark; ctx.fill();
        ctx.globalAlpha = (1 - burst * 0.75) * Math.pow(f.lit, 2) * 0.95; ctx.fillStyle = light; ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    const loop = (now) => { angle += ((now - t0) / 1000) * spin; t0 = now; draw(); raf = seen && !reduce ? requestAnimationFrame(loop) : 0; };
    new ResizeObserver(fit).observe(canvas);
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf && !reduce) { t0 = performance.now(); raf = requestAnimationFrame(loop); } }).observe(canvas);
    return {
      get kind() { return cur; },
      set(next) { cur = next; burst = 0; draw(); },
      morph(next, dur = 1.7) {
        if (reduce || !dur) return this.set(next);
        const s = { v: 0 };
        gsap.killTweensOf(s);
        return gsap.timeline().to(s, { v: 1, duration: dur * 0.45, ease: "power2.in", onUpdate: () => { burst = s.v; } }).call(() => { cur = next; }).to(s, { v: 0, duration: dur * 0.55, ease: "power2.out", onUpdate: () => { burst = s.v; } });
      },
    };
  }

  const inView = (el, shown) => { let on = false; new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(el); return () => on && (!shown || shown.style.visibility !== "hidden"); };

  window.RP = { inView, reduce, small, px, WIPE_EASE, FADE_EASE, INTRO, WIPE, REVEAL, HERO_WIPE, CONTENT_DELAY, barAt, ctaStartFor, wipeLine, riseInto, sweepInto, hideLines, shape, cta };
})();
