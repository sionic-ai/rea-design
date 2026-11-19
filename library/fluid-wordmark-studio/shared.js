// Shared by the whole site — header, menu, loader, footer, FAQ, reveals, button feel, and Taxi page transitions.
// Page-specific motion lives in NT.page("Name", (view, life) => …) to register it, and hook and unhook it per view on every page turn.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqMobile = matchMedia("(max-width: 991px)");
  const isMobile = () => mqMobile.matches;
  if (reduce) document.documentElement.classList.add("is-reduce");
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

  // ── Outer frame (header, phone menu, loader) — stays even when the screen changes ──────────────────
  const MARK = ["S", "T", "U", "D", "I", "O"];
  const LINKS = [["Work", "list.html"], ["About", "about.html"], ["Award", "about.html"], ["Method", "article.html"]];
  const ARROW = '<span class="nt-arrow"><span class="nt-arrow__line"></span><span class="nt-arrow__head"></span></span>';
  const btn = (label, href, cls = "") => `<a class="nt-btn ${cls}" href="${href}" data-taxi-ignore><span>${label}</span>${ARROW}</a>`;
  const mailBtn = (cls = "") => `<a class="nt-btn is-mail ${cls}" href="#footer" data-taxi-ignore><span>Send email</span><span class="nt-at">@</span></a>`;

  function renderChrome() {
    const nav = document.createElement("nav");
    nav.className = "nt-nav";
    nav.dataset.slot = "header";
    nav.innerHTML = `
      <a class="nt-logo" href="index.html" aria-label="Back to start"><svg class="nt-logo__svg" viewBox="0 0 338 291" aria-hidden="true"><text class="nt-logo__ch" x="0" y="280" textLength="215" lengthAdjust="spacingAndGlyphs">${MARK[0]}</text><text class="nt-logo__ch" data-mid x="228" y="280" textLength="200" lengthAdjust="spacingAndGlyphs" transform="translate(0, 320)">${MARK[1]}</text><text class="nt-logo__ch" data-mid x="437" y="280" textLength="200" lengthAdjust="spacingAndGlyphs" transform="translate(0, 320)">${MARK[2]}</text><text class="nt-logo__ch" data-mid x="647" y="280" textLength="200" lengthAdjust="spacingAndGlyphs" transform="translate(0, 320)">${MARK[3]}</text><text class="nt-logo__ch" data-mid x="856" y="280" textLength="200" lengthAdjust="spacingAndGlyphs" transform="translate(0, 320)">${MARK[4]}</text><text class="nt-logo__ch" data-mid x="1066" y="280" textLength="200" lengthAdjust="spacingAndGlyphs" transform="translate(0, 320)">${MARK[5]}</text><text class="nt-logo__ch" data-apos x="1288" y="280" textLength="110" lengthAdjust="spacingAndGlyphs" transform="translate(-1060, 0)">’</text></svg></a>
      <div class="nt-menu">
        <button class="nt-menu__btn t-caps" type="button" aria-label="Menu"><span class="nt-menu__text">Menu</span><span class="nt-menu__dots"><i></i><i></i><i></i><i></i></span></button>
        <div class="nt-menu__links t-caps">${LINKS.map(([t, h]) => `<a href="${h}"><span>${t}</span></a>`).join("")}<a href="#footer" data-taxi-ignore><span>Inquiry</span></a></div>
      </div>`;
    const mm = document.createElement("div");
    mm.className = "nt-mmenu";
    mm.dataset.slot = "mobile-menu";
    mm.innerHTML = `
      <div><div class="nt-mmenu__links">${LINKS.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</div>
      <div class="nt-mmenu__btns">${btn("Book a consultation", "#footer", "is-light")}${mailBtn("is-light")}</div></div>
      <div class="nt-mmenu__foot"><span class="t-s">Your one-line intro here</span><span class="t-caps">Channel 1 / Channel 2</span><span class="nt-lang"><a class="nt-lang__a" href="#footer" data-taxi-ignore>A</a><button class="nt-lang__tg is-on" type="button" aria-label="Change language"></button><a class="nt-lang__a is-off" href="#footer" data-taxi-ignore>Go</a></span></div>`;
    const loader = document.createElement("div");
    loader.className = "nt-loader";
    loader.dataset.slot = "loader";
    loader.innerHTML = `
      <div class="nt-loader__c"><div></div>
        <div class="nt-loader__anim"><span class="nt-loader__n">${MARK[0]}</span><div class="nt-loader__imgs">${OBJECTS.map((o, i) => `<div class="nt-loader__img nt-obj" data-label="${o.label}" style="--r:${o.r || 0}deg">${o.svg}</div>`).join("")}</div><span class="nt-loader__apos">’</span></div>
        <div class="nt-loader__nbr">000</div></div>`;
    document.body.prepend(nav, mm, loader);
  }

  // Objects in loader and shape scenes — the original uses cut-out 3D object photos (shiny balloon, crumpled foil, candy). Redrawn as solid-color pictures at the same position and size
  const OBJECTS = [
    { label: "Cutout object photo · heart wrapped in bubble wrap · square", svg: '<svg viewBox="0 0 200 200"><path class="o-soft" d="M100 172C40 128 18 98 30 64c10-28 46-34 70-6 24-28 60-22 70 6 12 34-10 64-70 108Z"/><g class="o-dim">' + Array.from({ length: 18 }, (_, i) => `<circle cx="${52 + (i % 6) * 19}" cy="${70 + Math.floor(i / 6) * 22}" r="7"/>`).join("") + "</g></svg>" },
    { label: "Cutout object photo · crumpled blue foil star · square", svg: '<svg viewBox="0 0 200 200"><path class="o-fill" d="M100 18l18 50 52-14-34 42 40 34-52 2 6 52-34-40-38 36 10-50-50-8 44-28-26-46 50 18Z"/><path class="o-dim" d="M100 60l10 30 30-8-20 24 22 20-30 2 4 30-20-24-22 20 6-30-28-6 26-16-16-26 28 10Z"/></svg>' },
    { label: "Cutout object photo · star-shaped black balloon · square", svg: '<svg viewBox="0 0 200 200"><g class="o-fill">' + [0, 60, 120].map((r) => `<rect x="88" y="20" width="24" height="160" rx="12" transform="rotate(${r} 100 100)"/>`).join("") + '</g><circle class="o-dim" cx="92" cy="60" r="6"/></svg>' },
    { label: "Cutout object photo · smiling face made of foil · square", svg: '<svg viewBox="0 0 200 200"><circle class="o-soft" cx="100" cy="100" r="72"/><circle class="o-fill" cx="76" cy="84" r="9"/><circle class="o-fill" cx="124" cy="84" r="9"/><path class="o-line" d="M64 116c16 26 56 26 72 0"/></svg>' },
    { label: "Cutout object photo · foil-wrapped candy · landscape", svg: '<svg viewBox="0 0 200 200"><ellipse class="o-soft" cx="100" cy="100" rx="46" ry="34"/><path class="o-fill" d="M54 100 18 70v60ZM146 100l36-30v60Z"/></svg>', r: 120 },
    { label: "Cutout object photo · pink cream swirl · square", svg: '<svg viewBox="0 0 200 200"><path class="o-soft" d="M40 150c0-30 24-40 60-40s60 10 60 40Z"/><path class="o-fill" d="M56 112c0-24 20-32 44-32s44 8 44 32Z"/><path class="o-dim" d="M74 82c0-18 12-26 26-26s26 8 26 26Z"/></svg>' },
    { label: "Cutout object photo · black plastic shopping bag · square", svg: '<svg viewBox="0 0 200 200"><path class="o-fill" d="M50 70h100l12 104H38Z"/><path class="o-line" d="M76 70c0-34 48-34 48 0"/></svg>' },
    { label: "Cutout object photo · pink balloon dog · square", svg: '<svg viewBox="0 0 200 200"><g class="o-soft"><ellipse cx="96" cy="104" rx="46" ry="20"/><ellipse cx="150" cy="78" rx="18" ry="22"/><rect x="58" y="114" width="14" height="50" rx="7"/><rect x="118" y="114" width="14" height="50" rx="7"/><ellipse cx="44" cy="90" rx="10" ry="22"/></g></svg>' },
    { label: "Cutout object photo · blue air-pocket cube · square", svg: '<svg viewBox="0 0 200 200"><path class="o-soft" d="M100 30l64 34v72l-64 34-64-34V64Z"/><path class="o-fill" d="M100 98l64-34v72l-64 34Z"/></svg>' },
  ];

  // ── Hook and release per screen ───────────────────────────────────────
  const pages = {};
  let current = null;
  function makeLife(view) {
    const offs = [];
    const ctx = gsap.context(() => {}, view);
    return {
      view,
      add: (fn) => ctx.add(fn),
      on(t, ev, fn, opt) { t.addEventListener(ev, fn, opt); offs.push(() => t.removeEventListener(ev, fn, opt)); },
      off(fn) { offs.push(fn); },
      kill() { offs.splice(0).forEach((f) => f()); ctx.revert(); },
    };
  }
  function mount(view) {
    if (!view || view.ntLife) return;
    fillTemplates(view);
    const life = (view.ntLife = makeLife(view));
    life.add(() => {
      initButtons(view, life);
      initFaq(view, life);
      initFooter(view, life);
      initCursors(view, life);
      initWorkList(view);
      initParallax(view);
    });
    revealsFor(view, life);
    runPage(view);
  }
  function runPage(view) {
    const fn = pages[view.dataset.page];
    if (!fn || view.ntRan || !view.ntLife) return;
    view.ntRan = true;
    view.ntLife.add(() => fn(view, view.ntLife));
    ScrollTrigger.refresh();
  }
  function unmount(view) {
    if (!view?.ntLife) return;
    view.ntLife.kill();
    view.ntLife = null;
  }
  function page(name, fn) {
    pages[name] = fn;
    document.querySelectorAll(`[data-taxi-view][data-page="${name}"]`).forEach(runPage);
  }

  // ── Reveal — the original’s [line]·[letter]·[opacity]·[scale]·[clip]·[separator] attribute system ──
  // data-r="line|letter|opacity|scale|clip|sep", data-ns = Once at the start (when the loader clears), not on scroll.
  // On a transitioned-in screen only lines and letters run immediately without delay, while the rest keep their own delays as in the original
  let pending = [];
  let revealOpen = false;
  const fontsReady = new Promise((res) => { const t = setTimeout(res, 1000); document.fonts.ready.then(() => { clearTimeout(t); res(); }); });
  function delayOf(el, kind) {
    if (el.dataset.delay != null) return +el.dataset.delay || 0;
    const box = el.parentElement?.closest("[data-stagger]");
    if (!box) return 0;
    const i = [...box.querySelectorAll(`[data-r="${kind}"]`)].indexOf(el);
    return (+box.dataset.staggerDelay || 0) + Math.max(i, 0) * (+box.dataset.stagger || 0);
  }
  const CLIP_FROM = { left: "inset(100% 100% 0% 0%)", right: "inset(100% 0% 0% 100%)" };
  function revealsFor(view, life) {
    fontsReady.then(() => {
      if (!view.ntLife) return;
      life.add(() => {
        view.querySelectorAll("[data-r]").forEach((el) => {
          const kind = el.dataset.r;
          const ns = el.hasAttribute("data-ns");
          const d = delayOf(el, kind);
          const st = { trigger: el, start: "top 95%", toggleActions: "play none none none" };
          if (reduce) { gsap.set(el, { opacity: 1, scale: 1, clipPath: "none", width: kind === "sep" ? "100%" : undefined }); return; }
          let play, scroll;
          if (kind === "line" || kind === "letter") {
            const line = kind === "line";
            const split = SplitText.create(el, line ? { type: "lines", linesClass: "nt-line", mask: "lines", autoSplit: false, aria: "auto" } : { type: "words,chars", wordsClass: "nt-word", charsClass: "nt-char", mask: "chars", autoSplit: false, aria: "auto" });
            const parts = line ? split.lines : split.chars;
            gsap.set(parts, { yPercent: 100 });
            gsap.set(el, { opacity: 1 });
            play = (instant) => gsap.to(parts, line ? { yPercent: 0, duration: 1, ease: "power4.inOut", stagger: 0.05, delay: instant ? 0 : d } : { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.1, delay: instant ? 0 : d });
            scroll = () => gsap.to(parts, line ? { yPercent: 0, duration: 1, ease: "power4.inOut", stagger: 0.05, delay: d, scrollTrigger: st } : { yPercent: 0, duration: 1.2, ease: "power4.inOut", stagger: 0.03, delay: d, scrollTrigger: st });
          } else if (kind === "opacity") {
            play = () => gsap.to(el, { opacity: 1, duration: 1, ease: "power3.out", delay: d, overwrite: true });
            scroll = () => gsap.to(el, { opacity: 1, duration: 1, ease: "power3.out", delay: d, scrollTrigger: st });
          } else if (kind === "scale") {
            gsap.set(el, { scale: 0, transformOrigin: "50% 50%" });
            play = () => gsap.to(el, { scale: 1, duration: 1, ease: "power3.out", delay: d, overwrite: true });
            scroll = () => gsap.to(el, { scale: 1, duration: 1, ease: "power3.out", delay: d, scrollTrigger: st });
          } else if (kind === "clip") {
            const from = CLIP_FROM[el.dataset.clip] || "inset(100% 0% 0% 0%)";
            gsap.set(el, { clipPath: from, opacity: 1 });
            play = () => gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power4.inOut", delay: d, overwrite: true });
            scroll = () => gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut", delay: d, scrollTrigger: st });
          } else if (kind === "sep") {
            gsap.set(el, { width: "0%", opacity: 1 });
            play = () => gsap.to(el, { width: "100%", duration: 1.4, ease: "power4.inOut", delay: d, overwrite: true });
            scroll = () => gsap.to(el, { width: "100%", duration: 1.4, ease: "power4.inOut", delay: d, scrollTrigger: st });
          } else return;
          if (ns) pending.push({ play: () => life.add(() => play(false)), now: () => life.add(() => play(true)), view });
          else scroll();
        });
        if (revealOpen) flushReveals(view.ntInstant);
        ScrollTrigger.refresh();
      });
    });
  }
  function flushReveals(instant) {
    revealOpen = true;
    const list = pending.filter((p) => p.view.ntLife);
    pending = [];
    list.forEach((p) => (instant ? p.now() : p.play()));
  }

  // ── Lenis 1.2.3 — original values (1.2s, expo-type curve, 2× on touch) ──────────────
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 2 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
  }
  let lockSaved = null;
  function lockScroll(on) {
    const de = document.documentElement;
    if (on && !lockSaved) { lockSaved = [de.style.overflow, document.body.style.overflow]; lenis?.stop(); de.style.overflow = document.body.style.overflow = "hidden"; }
    if (!on && lockSaved) { [de.style.overflow, document.body.style.overflow] = lockSaved; lockSaved = null; lenis?.start(); }
  }

  // ── Loader — once per session. N and ’ stand up, the middle slot opens and the object changes while the number goes 100→000 ──
  const SEEN = "nt:loader-played";
  const EF = 5000;
  const interval = (t) => 100 + (500 - 100) * (1 - Math.sin(Math.min(t / EF, 1) * Math.PI));
  function heroLetters() {
    const v = current;
    const mark = v?.querySelector("[data-hero-mark]");
    if (!mark) return null;
    return { all: [...mark.querySelectorAll("[data-ch]")], apos: mark.querySelector("[data-apos]") };
  }
  function heroReveal() {
    window.dispatchEvent(new CustomEvent("nt:reveal-start"));
    flushReveals(false);
    const h = heroLetters();
    if (!h || reduce) { window.dispatchEvent(new CustomEvent("nt:hero-revealed")); return; }
    const order = h.all.slice().sort(() => Math.random() - 0.5);
    gsap.fromTo(order, { autoAlpha: 1, yPercent: 120 }, { yPercent: 0, duration: 1.8, ease: "power4.inOut", stagger: 0.07, delay: 0.2, onComplete: () => window.dispatchEvent(new CustomEvent("nt:hero-revealed")) });
    if (h.apos) gsap.fromTo(h.apos, { autoAlpha: 1, scale: 0, transformOrigin: "center center" }, { scale: 1, duration: 0.6, ease: "back.out(0.9)", delay: 1.5 });
  }
  function runLoader() {
    const loader = document.querySelector(".nt-loader");
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN) === "1"; } catch {}
    document.documentElement.classList.remove("nt-boot");
    if (seen || reduce || !loader) { heroReveal(); return; }
    try { sessionStorage.setItem(SEEN, "1"); } catch {}
    loader.classList.add("is-on");
    lockScroll(true);
    scrollTo(0, 0);
    const h = heroLetters();
    if (h) gsap.set([...h.all, h.apos].filter(Boolean), { autoAlpha: 0 });
    const n = loader.querySelector(".nt-loader__n"), apos = loader.querySelector(".nt-loader__apos");
    const wrap = loader.querySelector(".nt-loader__imgs"), imgs = [...loader.querySelectorAll(".nt-loader__img")];
    const nbr = loader.querySelector(".nt-loader__nbr");
    const mask = document.createElement("div");
    mask.style.cssText = "overflow:hidden;display:flex;";
    n.before(mask);
    mask.append(n);
    nbr.textContent = "100";
    gsap.set(n, { yPercent: 100, opacity: 0 });
    gsap.set(apos, { scale: 0, transformOrigin: "center center" });
    gsap.set(imgs, { opacity: 0 });
    let idx = 0, timer = null, count = null;
    const cycle = (start) => {
      const t = performance.now() - start;
      if (t >= EF) return finish();
      timer = setTimeout(() => {
        const prev = imgs[idx];
        gsap.killTweensOf(prev);
        gsap.set(prev, { clearProps: "all" });
        gsap.set(prev, { opacity: 0 });
        idx = (idx + 1) % imgs.length;
        gsap.killTweensOf(imgs[idx]);
        gsap.fromTo(imgs[idx], { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.32, ease: "back.out(1.2)" });
        cycle(start);
      }, interval(t));
    };
    const finish = () => {
      gsap.to(imgs[idx], { scale: 0, duration: 0.6, ease: "power4.inOut", delay: 0.5 });
      gsap.to(wrap, { width: "1rem", duration: 0.8, ease: "power4.inOut", delay: 0.6, onComplete: () => {
        gsap.to(nbr, { autoAlpha: 0, duration: 0.5, ease: "power4.inOut" });
        gsap.to(loader, { height: 0, duration: 1.8, ease: "power4.inOut", onComplete: () => { loader.classList.remove("is-on"); gsap.set(loader, { clearProps: "height" }); } });
        gsap.to(n, { yPercent: 100, duration: 1, ease: "power4.inOut" });
        gsap.to(apos, { scale: 0, duration: 1, ease: "power4.inOut" });
        heroReveal();
      } });
    };
    gsap.to(n, { opacity: 1, yPercent: 0, duration: 1, ease: "power4.inOut", onComplete: () => {
      gsap.fromTo(wrap, { width: "1rem" }, { width: isMobile() ? "10rem" : "20rem", duration: 1.2, ease: "power4.inOut" });
      gsap.set(imgs[0], { opacity: 1, scale: 0 });
      gsap.to(imgs[0], { scale: 1, rotate: 15, duration: 0.8, ease: "back.out(0.9)", delay: 0.5, onComplete: () => {
        const o = { v: 100 };
        count = gsap.to(o, { v: 0, duration: EF / 750, ease: "power2.inOut", onUpdate: () => (nbr.textContent = String(Math.round(o.v)).padStart(3, "0")), onComplete: () => (nbr.textContent = "000") });
        cycle(performance.now());
      } });
    } });
    gsap.to(apos, { scale: 1, duration: 1, ease: "power4.inOut" });
  }

  // ── Header logo — on hover the middle letters spread apart and slide in (original viewBox 338→1398) ──
  function initLogo() {
    const wrap = document.querySelector(".nt-logo");
    const svg = wrap.querySelector("svg"), apos = svg.querySelector("[data-apos]");
    const letters = [...svg.querySelectorAll("[data-mid]")];
    const S = -1060, W0 = 338, W1 = 1398, DROP = 320;
    const box = { w: W0 }, ap = { x: S };
    const draw = () => { svg.setAttribute("viewBox", `0 0 ${box.w.toFixed(1)} 291`); apos.setAttribute("transform", `translate(${ap.x.toFixed(1)}, 0)`); };
    let state = "idle", a = null, b = null;
    const shuffle = (arr) => { const l = arr.slice(); for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };
    const kill = () => { a?.kill(); b?.kill(); };
    const open = (lettersFirst) => {
      state = lettersFirst ? "letters-in" : "spacing-in";
      const d = lettersFirst ? 0.6 : 0.7;
      const tl = gsap.timeline({ onUpdate: draw, onComplete: () => (state = "open") });
      tl.to(box, { w: W1, duration: d, ease: "power4.inOut" }, 0).to(ap, { x: 0, duration: d, ease: "power4.inOut" }, 0);
      shuffle(letters).forEach((el, i) => tl.to(el, { attr: { transform: "translate(0, 0)" }, duration: 0.6, ease: "power4.inOut" }, (lettersFirst ? 0 : 0.35) + i * 0.06));
      if (lettersFirst) b = tl; else a = tl;
    };
    const close = () => {
      state = "letters-out";
      b = gsap.timeline({ onComplete: () => {
        state = "spacing-out";
        a = gsap.timeline({ onUpdate: draw, onComplete: () => (state = "idle") }).to(box, { w: W0, duration: 0.7, ease: "power4.inOut" }, 0).to(ap, { x: S, duration: 0.7, ease: "power4.inOut" }, 0);
      } });
      shuffle(letters).forEach((el, i) => b.to(el, { attr: { transform: `translate(0, ${DROP})` }, duration: 0.6, ease: "power4.inOut" }, i * 0.08));
    };
    const enter = () => { kill(); if (state === "idle" || state === "spacing-out") open(false); else if (state === "letters-out") open(true); };
    const leave = () => { kill(); if (state === "open" || state === "letters-in" || state === "spacing-in") close(); };
    if (!reduce && !isMobile()) { wrap.addEventListener("mouseenter", enter); wrap.addEventListener("mouseleave", leave); }
  }
  // Only on the first page the logo stays hidden, then appears after scrolling down 10% of the screen height
  let logoST = null;
  function logoForView(view) {
    const wrap = document.querySelector(".nt-logo");
    logoST?.kill();
    logoST = null;
    if (!view.querySelector("[data-hero-mark]")) { gsap.set(wrap, { autoAlpha: 1 }); return; }
    let shown = null;
    const set = (on) => { if (on === shown) return; shown = on; gsap.to(wrap, { autoAlpha: on ? 1 : 0, duration: on ? 0.4 : 0.3, ease: on ? "power2.out" : "power2.in" }); };
    gsap.set(wrap, { autoAlpha: 0 });
    const check = () => set((window.scrollY || 0) >= innerHeight * 0.1);
    logoST = ScrollTrigger.create({ start: () => innerHeight * 0.1, end: () => ScrollTrigger.maxScroll(window) + innerHeight, onToggle: check, onRefresh: check });
    check();
  }

  // ── Menu — wide screens: links rise from below on hover, narrow screens: tap for a black panel ──
  function initChromeLang() { document.querySelectorAll(".nt-mmenu .nt-lang__tg").forEach((b) => b.addEventListener("click", () => b.classList.toggle("is-on"))); }
  function initMenu() {
    const box = document.querySelector(".nt-menu");
    const btnEl = box.querySelector(".nt-menu__btn");
    const dots = box.querySelector(".nt-menu__dots");
    const rects = [...dots.children];
    const linksW = box.querySelector(".nt-menu__links");
    const links = [...linksW.children];
    const mm = document.querySelector(".nt-mmenu");
    const logo = document.querySelector(".nt-logo");
    const text = box.querySelector(".nt-menu__text");
    const push = () => { const s = dots.offsetWidth * 0.05; return rects.map((r, i) => ({ x: i % 2 ? s : -s, y: i < 2 ? -s : s })); };
    // Wide screen
    let tl = null, open = false, timer = null;
    const build = () => {
      tl?.kill();
      const spans = links.map((a) => a.firstElementChild);
      links.forEach((a) => (a.style.height = ""));
      const hs = links.map((a) => a.getBoundingClientRect().height);
      links.forEach((a, i) => (a.style.height = hs[i] + "px"));
      spans.forEach((s, i) => gsap.set(s, { y: hs[i] }));
      const p = push();
      tl = gsap.timeline({ paused: true });
      tl.to(dots, { rotateZ: 45, duration: 0.5, ease: "power4.out" }, 0);
      rects.forEach((r, i) => tl.to(r, { x: p[i].x, y: p[i].y, duration: 0.5, ease: "power4.out" }, 0));
      tl.to(spans, { y: 0, duration: 0.6, ease: "power4.out", stagger: 0.08 }, 0);
    };
    const show = () => { clearTimeout(timer); if (isMobile() || open) return; open = true; tl.play(); };
    const hide = () => { clearTimeout(timer); timer = setTimeout(() => { if (open) { open = false; tl.reverse(); } }, 60); };
    btnEl.addEventListener("mouseenter", show);
    btnEl.addEventListener("mouseleave", hide);
    linksW.addEventListener("mouseenter", () => clearTimeout(timer));
    linksW.addEventListener("mouseleave", hide);
    links.forEach((a) => a.addEventListener("click", () => { clearTimeout(timer); open = false; tl.reverse(); }));
    // Narrow screen
    let mOpen = false;
    const mShow = () => {
      mOpen = true;
      lockScroll(true);
      gsap.set(mm, { display: "flex" });
      gsap.to(mm, { autoAlpha: 1, duration: 0.5, ease: "power4.out" });
      gsap.to(logo, { opacity: 0, pointerEvents: "none", duration: 0.4, ease: "power4.out" });
      gsap.to(text, { opacity: 1, duration: 0.4, ease: "power4.out" });
      gsap.to(dots, { rotateZ: 45, duration: 0.5, ease: "power4.out" });
      const p = push();
      rects.forEach((r, i) => gsap.to(r, { x: p[i].x, y: p[i].y, duration: 0.5, ease: "power4.out" }));
    };
    const mHide = () => {
      if (!mOpen) return;
      mOpen = false;
      lockScroll(false);
      gsap.to(text, { opacity: 0, duration: 0.4, ease: "power4.out" });
      gsap.to(mm, { autoAlpha: 0, duration: 0.4, ease: "power4.out", onComplete: () => gsap.set(mm, { display: "none" }) });
      gsap.to(logo, { opacity: 1, pointerEvents: "auto", duration: 0.4, ease: "power4.out" });
      gsap.to(dots, { rotateZ: 0, duration: 0.5, ease: "power4.out" });
      rects.forEach((r) => gsap.to(r, { x: 0, y: 0, duration: 0.5, ease: "power4.out" }));
    };
    btnEl.addEventListener("click", () => { if (!isMobile()) return; mOpen ? mHide() : mShow(); });
    mm.querySelectorAll("a").forEach((a) => a.addEventListener("click", mHide));
    const setup = () => {
      if (isMobile()) { tl?.kill(); tl = null; gsap.set(links.map((a) => a.firstElementChild), { clearProps: "transform" }); gsap.set([dots, ...rects], { clearProps: "transform" }); }
      else { mHide(); gsap.set(text, { clearProps: "opacity" }); build(); }
    };
    setup();
    mqMobile.addEventListener("change", setup);
    fontsReady.then(() => { if (!isMobile()) build(); });
    return { closeMobile: mHide };
  }

  // ── Button and link feel ───────────────────────────────────────────
  function initButtons(view, life) {
    view.querySelectorAll(".nt-btn").forEach((b) => {
      const line = b.querySelector(".nt-arrow__line");
      if (line) {
        let w = 0;
        life.on(b, "mouseenter", () => { w = w || line.getBoundingClientRect().width; gsap.to(line, { width: w * 1.45, duration: 0.4, ease: "power4.inOut", overwrite: "auto" }); });
        life.on(b, "mouseleave", () => { if (w) gsap.to(line, { width: w, duration: 0.8, ease: "power4.out", overwrite: "auto" }); });
      }
      const at = b.querySelector(".nt-at");
      if (at) {
        life.on(b, "mouseenter", () => gsap.to(at, { scale: 1.2, duration: 0.2, ease: "power2.in", overwrite: "auto" }));
        life.on(b, "mouseleave", () => gsap.to(at, { scale: 1, duration: 0.2, ease: "power2.in", overwrite: "auto" }));
      }
    });
    view.querySelectorAll(".nt-link").forEach((a) => {
      const u = document.createElement("span");
      u.className = "nt-link__u";
      a.append(u);
      life.off(() => u.remove());
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(u, { width: "0%", left: "0%" }, { width: "100%", left: "0%", duration: 0.6, ease: "power4.inOut" });
      tl.add("mid");
      tl.fromTo(u, { width: "100%", left: "0%" }, { width: "0%", left: "100%", duration: 0.6, ease: "power4.inOut", immediateRender: false });
      life.on(a, "mouseenter", () => tl.tweenFromTo(0, "mid"));
      life.on(a, "mouseleave", () => tl.play());
    });
    view.querySelectorAll(".nt-lang__tg").forEach((b) => life.on(b, "click", () => b.classList.toggle("is-on")));
    view.querySelectorAll(".nt-viewall").forEach((a) => {
      const svg = a.querySelector("svg"), shaft = svg?.querySelector(".nt-shaft");
      if (!shaft) return;
      gsap.set(svg, { transformOrigin: "left center" });
      const tl = gsap.timeline({ paused: true });
      tl.to(shaft, { attr: { points: "-6,7.5 -6,7.5 15.5,7.5" }, duration: 0.45, ease: "power2.inOut" });
      tl.to(svg, { scaleX: 2, duration: 0.45, ease: "power2.inOut" }, "<");
      life.on(a, "mouseenter", () => tl.play());
      life.on(a, "mouseleave", () => tl.reverse());
    });
  }

  // Pill over the Work photo — follows by 0.09 each step
  function initCursors(view, life) {
    if (reduce) return;
    view.querySelectorAll(".nt-work__link, [data-cursor-link]").forEach((link) => {
      const c = link.querySelector(".nt-cursor");
      if (!c) return;
      gsap.set(c, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0, autoAlpha: 0 });
      const s = { tx: 0, ty: 0, cx: 0, cy: 0, raf: 0, active: false, lx: null, ly: null };
      const step = () => {
        s.cx += (s.tx - s.cx) * 0.09;
        s.cy += (s.ty - s.cy) * 0.09;
        gsap.set(c, { x: s.cx, y: s.cy });
        s.raf = s.active || Math.abs(s.cx - s.tx) > 0.05 || Math.abs(s.cy - s.ty) > 0.05 ? requestAnimationFrame(step) : 0;
      };
      const show = () => { if (s.active) return; s.active = true; gsap.to(c, { scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.8)", overwrite: "auto" }); if (!s.raf) s.raf = requestAnimationFrame(step); };
      const hide = () => { if (!s.active) return; s.active = false; gsap.to(c, { scale: 0, autoAlpha: 0, duration: 0.38, ease: "power3.in", overwrite: "auto" }); };
      life.on(link, "mousemove", (e) => {
        const r = link.getBoundingClientRect();
        s.tx = e.clientX - r.left; s.ty = e.clientY - r.top;
        const moved = e.clientX !== s.lx || e.clientY !== s.ly;
        s.lx = e.clientX; s.ly = e.clientY;
        if (!moved) { if (s.active && !s.raf) s.raf = requestAnimationFrame(step); return; }
        if (!s.active) { s.cx = s.tx; s.cy = s.ty; gsap.set(c, { x: s.cx, y: s.cy }); }
        show();
        if (!s.raf) s.raf = requestAnimationFrame(step);
      });
      life.on(link, "mouseleave", hide);
      life.off(() => cancelAnimationFrame(s.raf));
    });
  }

  // Work list — photo frames open from the corner (top left · top right · bottom) over 1s power4.inOut, and on wide screens each frame drifts at a different height
  const WORK_Y = [80, -150, -100, -160, 100, -90];
  const WORK_CLIP = ["inset(100% 100% 0% 0%)", "inset(100% 0% 0% 100%)", "inset(100% 0% 0% 0%)"];
  function initWorkList(view) {
    view.querySelectorAll("[data-works-list] > .nt-work").forEach((item, i) => {
      const box = item.querySelector(".nt-work__img"), img = box?.firstElementChild;
      if (!box) return;
      if (reduce) return;
      gsap.set(box, { clipPath: WORK_CLIP[i % 3] });
      gsap.to(box, { clipPath: "inset(0% 0% 0% 0%)", ease: "power4.inOut", duration: 1, scrollTrigger: { trigger: item, start: "top 88%", toggleActions: "play none none none" } });
      gsap.matchMedia().add("(min-width: 992px)", () => {
        gsap.fromTo(item, { y: 0 }, { y: WORK_Y[i % 6], ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: 1.5 } });
        if (img) gsap.fromTo(img, { yPercent: -5 }, { yPercent: -20, ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "bottom center", scrub: 3 } });
      });
    });
  }

  // Parallax — the [data-parallax] box and the inner [data-parallax-img]
  function initParallax(view) {
    if (reduce) return;
    view.querySelectorAll("[data-parallax]").forEach((el) => {
      const y = +(el.dataset.parallaxY ?? -60), x = +(el.dataset.parallaxX ?? 0), scrub = +(el.dataset.parallaxScrub ?? 1.5);
      gsap.fromTo(el, { y: 0, x: 0 }, { y, x, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub } });
      const img = el.querySelector("[data-parallax-img]");
      if (!img) return;
      gsap.set(img.parentElement, { overflow: "hidden" });
      gsap.set(img, { height: "110%", width: "100%" });
      gsap.fromTo(img, { yPercent: 0 }, { yPercent: +(img.dataset.parallaxImgY ?? -5), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: +(img.dataset.parallaxImgScrub ?? 2.5) } });
    });
  }

  // ── FAQ board — only one opens at a time ───────────────────────────────
  const FAQS = [["Your commonly received question here?", "article.html"], ["Your second question, a bit longer?", "article.html"], ["Your third question here?", "article.html"], ["Your fourth question here, one line?", "article.html"]];
  const CROSS = '<svg viewBox="0 0 12 12"><rect x="0" y="5.5" width="12" height="1" fill="currentColor"/><rect x="5.5" y="0" width="1" height="12" fill="currentColor"/></svg>';
  function faqHTML(count) {
    return `<div class="nt-wrap"><div class="nt-faq__letters">${["F", "A", "Q", "S"].map((l) => `<div data-r="line">${l}</div>`).join("")}</div>
      <div class="nt-faq__body"><div class="nt-faq__left"><div class="t-m" data-r="line">( Your question group name here )</div></div>
      <div class="nt-faq__list">${FAQS.slice(0, count).map(([q, h]) => `<div class="nt-faq__item">
        <div class="nt-faq__q" data-r="opacity" data-delay="0.4"><div class="t-xl">${q}</div><div class="nt-faq__x">${CROSS}</div></div>
        <div class="nt-faq__sepw"><div class="nt-faq__sep"></div></div>
        <div class="nt-faq__a"><p>Your answer goes here in three or four lines. Answer the question briefly, then place a link below leading to a longer article. The original runs about four lines.</p><a href="${h}">Read more</a></div>
        <div class="nt-faq__gap"></div></div>`).join("")}</div></div><div class="nt-sp87"></div></div>`;
  }
  function initFaq(view, life) {
    const items = [...view.querySelectorAll(".nt-faq__item")];
    const all = [];
    items.forEach((item) => {
      const q = item.querySelector(".nt-faq__q"), label = q.firstElementChild;
      const sepW = item.querySelector(".nt-faq__sepw"), sep = item.querySelector(".nt-faq__sep");
      const a = item.querySelector(".nt-faq__a"), gap = item.querySelector(".nt-faq__gap");
      const bar = item.querySelectorAll(".nt-faq__x rect")[1];
      gsap.set(bar, { transformOrigin: "50% 50%" });
      const u = { open: false, tl: null, split: null };
      const fade = (v) => gsap.to(label, { opacity: v, duration: 0.6, ease: "power4.inOut", overwrite: true });
      u.openIt = () => {
        u.open = true; fade(1); u.tl?.kill(); u.split?.revert();
        u.split = SplitText.create([...a.children], { type: "lines", linesClass: "nt-line", mask: "lines", autoSplit: false, aria: "auto" });
        gsap.set(u.split.lines, { yPercent: 100 });
        u.tl = gsap.timeline({ defaults: { ease: "power4.inOut" } })
          .to(sepW, { opacity: 1, duration: 0.6 }, 0)
          .fromTo(sep, { width: "0%" }, { width: "100%", duration: 1.4 }, 0)
          .to(a, { height: "auto", duration: 1.2 }, 0)
          .to(bar, { scaleY: 0, duration: 1.2 }, 0)
          .to(gap, { height: "4.375rem", duration: 1.2 }, 0)
          .to(u.split.lines, { yPercent: 0, duration: 1.4, stagger: 0.07 }, 0.15);
      };
      u.closeIt = () => {
        u.open = false; if (!q.matches(":hover")) fade(0.5); u.tl?.kill();
        u.tl = gsap.timeline({ defaults: { ease: "power4.inOut" }, onComplete: () => { u.split?.revert(); u.split = null; } })
          .to(a, { height: 0, duration: 1 }, 0).to(bar, { scaleY: 1, duration: 1 }, 0).to(gap, { height: 0, duration: 1 }, 0).to(sepW, { opacity: 0, duration: 0.8 }, 0);
      };
      life.on(q, "click", () => { if (u.open) return u.closeIt(); all.forEach((o) => o !== u && o.open && o.closeIt()); u.openIt(); });
      life.on(q, "mouseenter", () => fade(1));
      life.on(q, "mouseleave", () => { if (!u.open) fade(0.5); });
      all.push(u);
    });
  }

  // ── Footer — the big wordmark letters rise one after another in random order, and a hovered letter squashes and bounces ──
  function footHTML() {
    return `<div class="nt-wrap"><div>
      <h2 class="t-h1" data-r="line">Your closing words here<br>One-line greeting’</h2>
      <div class="nt-sp24"></div>
      <div class="nt-foot__grid"><div class="nt-foot__btns" data-r="opacity">${btn("Book a consultation", "#footer")}${mailBtn()}</div>
        <div class="nt-foot__social"><a class="nt-link" href="#footer" data-r="opacity" data-taxi-ignore>Channel 1</a><a class="nt-link" href="#footer" data-r="opacity" data-taxi-ignore>Channel 2</a><a class="nt-link" href="#footer" data-r="opacity" data-taxi-ignore>Channel 3</a></div></div>
      <div class="nt-sp150 is-m100"></div>
      <div class="nt-foot__mark" data-foot-mark aria-hidden="true">${MARK.map((c) => `<span>${c}</span>`).join("")}<span>’</span></div>
      <div class="nt-sp12"></div></div>
      <div class="nt-foot__info"><div class="nt-foot__credit"><span>©0000 — Your company info line here</span><span class="nt-hide-t">Creator name 1 · name 2 · photo name 3</span></div>
        <span class="nt-lang"><a class="nt-lang__a" href="#footer" data-taxi-ignore>A</a><button class="nt-lang__tg is-on" type="button" aria-label="Change language"></button><a class="nt-lang__a is-off" href="#footer" data-taxi-ignore>Go</a></span>
        <div class="nt-foot__links"><a href="about.html">About</a><a href="about.html">Award</a><a href="article.html">Method</a></div></div></div>`;
  }
  function initFooter(view, life) {
    const mark = view.querySelector("[data-foot-mark]");
    if (!mark) return;
    const parts = [...mark.children];
    const last = parts.at(-1), rest = parts.slice(0, -1);
    if (reduce) { mark.classList.add("is-open"); return; }
    gsap.set(parts, { transformOrigin: "50% 50%" });
    gsap.set(rest, { autoAlpha: 1, yPercent: 120 });
    gsap.set(last, { autoAlpha: 1, scale: 0 });
    ScrollTrigger.create({ trigger: mark, start: "top 95%", once: true, onEnter: () => {
      gsap.fromTo(rest.slice().sort(() => Math.random() - 0.5), { autoAlpha: 1, yPercent: 120 }, { yPercent: 0, duration: 1.2, ease: "power4.inOut", stagger: 0.03, delay: 0.2, onComplete: () => mark.classList.add("is-open") });
      gsap.fromTo(last, { autoAlpha: 1, scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(0.9)", delay: 1 });
    } });
    parts.forEach((p) => {
      let busy = false;
      life.on(p, "mouseenter", () => {
        if (busy) return;
        busy = true;
        gsap.timeline({ onComplete: () => (busy = false) }).to(p, { scale: 0.05, duration: 0.6, ease: "power2.inOut" }).to(p, { scale: 1, duration: 1.8, ease: "elastic.out(1, 0.8)" });
      });
    });
  }

  function fillTemplates(view) {
    view.querySelectorAll("[data-nt-faq]").forEach((el) => { if (!el.children.length) el.innerHTML = faqHTML(+el.dataset.ntFaq || 4); });
    view.querySelectorAll("[data-nt-foot]").forEach((el) => { if (!el.children.length) el.innerHTML = footHTML(); });
  }

  // ── Next work — scrolling further at the very bottom fills the line, and when full it moves on (2600 as in the original · follows at 0.12) ──
  function nextWork(view, life) {
    const fill = view.querySelector("[data-next-fill]");
    const link = view.querySelector("[data-next-link]");
    if (!fill || !link) return;
    let target = 0, shown = 0, raf = 0, done = false, ty = null;
    gsap.set(fill, { width: "0%" });
    const atBottom = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    const block = (e) => { if (e.cancelable) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.(); } };
    const tick = () => {
      shown += (target - shown) * 0.12;
      if (Math.abs(target - shown) < 5e-4) shown = target;
      gsap.set(fill, { width: shown * 100 + "%" });
      if (!done && shown >= 0.999) { done = true; raf = 0; link.click(); return; }
      raf = shown !== target ? requestAnimationFrame(tick) : 0;
    };
    const push = (d, e) => {
      if (d > 0) { if (!atBottom()) return; target = Math.min(1, target + d / 2600); }
      else if (d < 0) { if (target <= 0) return; target = Math.max(0, target + d / 2600); }
      else return;
      block(e);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    life.on(window, "wheel", (e) => { if (!done) push(e.deltaY, e); }, { passive: false, capture: true });
    life.on(window, "touchstart", (e) => { ty = e.touches[0]?.clientY ?? null; }, { passive: true, capture: true });
    life.on(window, "touchmove", (e) => { if (done || ty == null) return; const y = e.touches[0]?.clientY ?? ty; const d = (ty - y) * 2.5; ty = y; push(d, e); }, { passive: false, capture: true });
    life.off(() => cancelAnimationFrame(raf));
  }

  // ── Page transition — Taxi 1.9.1: old screen fades out .5s → new screen fades in over it .5s (power2.inOut).
  //    When going to the next work, ‹flip›: peel off the title · number letters and fly them to the same spot on the new screen in 1.2s power4.inOut.
  //    On file:// the next page can’t be fetched, so use the same values as off → move → on.
  let taxiCore = null;
  const flyTitles = (view) => [view.querySelector("[data-next-title]"), view.querySelector("[data-next-nbr]")].filter(Boolean);
  function makeFlyers(els) {
    return els.map((el) => {
      const r = el.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(el).fontSize) || 0;
      const c = el.cloneNode(true);
      c.removeAttribute("data-r");
      Object.assign(c.style, { position: "fixed", left: r.left + "px", top: r.top + "px", width: r.width + "px", margin: 0, padding: 0, zIndex: 99999, transformOrigin: "top left", opacity: 1, overflow: "visible", whiteSpace: "nowrap", color: getComputedStyle(el).color });
      document.body.append(c);
      gsap.set(el, { visibility: "hidden" });
      return { el: c, rect: r, fs };
    });
  }
  function bindTaxi() {
    const T = window.taxi;
    if (!T || !/^https?:$/.test(location.protocol)) return false;
    class Fade extends T.Transition {
      onLeave({ from, done }) { gsap.to(from, { opacity: 0, duration: reduce ? 0 : 0.5, ease: "power2.inOut", onComplete: done }); }
      onEnter({ to, done }) {
        gsap.set(to, { position: "fixed", top: 0, left: 0, width: "100%", opacity: 0, zIndex: 10 });
        gsap.to(to, { opacity: 1, duration: reduce ? 0 : 0.5, ease: "power2.inOut", onComplete: () => { gsap.set(to, { clearProps: "all" }); removeOld(to); done(); } });
      }
    }
    class FlipT extends T.Transition {
      onLeave({ from, done }) {
        const els = flyTitles(from);
        this.flyers = els.length === 2 ? makeFlyers(els) : null;
        gsap.to(from, { opacity: 0, duration: this.flyers ? 0.45 : 0.5, ease: "power2.inOut", onComplete: done });
      }
      onEnter({ to, done }) {
        const fl = this.flyers;
        if (!fl) { gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut", onComplete: () => { removeOld(to); done(); } }); return; }
        gsap.set(to, { position: "fixed", top: 0, left: 0, width: document.documentElement.clientWidth, zIndex: 10, autoAlpha: 0 });
        const targets = [to.querySelector("[data-flip-title]"), to.querySelector("[data-flip-nbr]")];
        const finish = () => { scrollTo(0, 0); fl.forEach((f) => f.el.remove()); this.flyers = null; gsap.set(to, { clearProps: "all" }); removeOld(to); done(); };
        const tl = gsap.timeline({ onComplete: finish });
        fl.forEach((f, i) => {
          const t = targets[i];
          if (!t || !f.rect.width) return;
          t.removeAttribute("data-r");
          t.style.opacity = "1";
          const r = t.getBoundingClientRect();
          const fs = parseFloat(getComputedStyle(t).fontSize) || f.fs;
          tl.to(f.el, { x: r.left - f.rect.left, y: r.top - f.rect.top, scale: f.fs ? fs / f.fs : 1, duration: 1.2, ease: "power4.inOut" }, 0);
        });
        if (!tl.getChildren().length) finish();
      }
    }
    taxiCore = new T.Core({
      links: ['a[href$=".html"]', 'a[href*=".html?"]'].map((a) => a + ':not([target]):not([href*="/"]):not([data-taxi-ignore])').join(", "),
      removeOldContent: false,
      allowInterruption: false,
      transitions: { default: Fade, flip: FlipT },
      reloadJsFilter: (el) => el.dataset.taxiReload !== undefined,
    });
    taxiCore.on("NAVIGATE_OUT", () => menuApi.closeMobile());
    taxiCore.on("NAVIGATE_END", ({ to }) => {
      lenis?.scrollTo(0, { immediate: true });
      scrollTo(0, 0);
      const view = to.renderer.content;
      setView(view, true);
    });
    return true;
  }
  function removeOld(to) {
    document.querySelectorAll("[data-taxi-view]").forEach((v) => { if (v !== to) { unmount(v); v.remove(); } });
  }
  function bindFileNav() {
    const veil = document.querySelector("[data-taxi]");
    const arrived = sessionStorage.getItem("nt-nav");
    if (arrived === "fade" && !reduce) gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut", clearProps: "opacity" });
    // The title and number that flew in for the next work are already in place — don’t let them rise again
    if (arrived === "flip") document.querySelectorAll("[data-flip-title], [data-flip-nbr]").forEach((t) => { t.removeAttribute("data-r"); t.style.opacity = "1"; });
    sessionStorage.removeItem("nt-nav");
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || a.hasAttribute("data-taxi-ignore") || e.metaKey || e.ctrlKey || e.button) return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(\?[^#]*)?$/.test(href)) return;
      e.preventDefault();
      menuApi.closeMobile();
      const flip = a.dataset.transition === "flip" ? flyTitles(current) : [];
      if (flip.length === 2 && !reduce) {
        const fl = makeFlyers(flip);
        const title = current.querySelector("[data-flip-title]"), nbr = current.querySelector("[data-flip-nbr]");
        const targets = [title, nbr].map((t) => t && { r: t.getBoundingClientRect(), y: scrollY, fs: parseFloat(getComputedStyle(t).fontSize) });
        gsap.to(veil, { opacity: 0, duration: 0.45, ease: "power2.inOut" });
        const tl = gsap.timeline({ onComplete: () => { sessionStorage.setItem("nt-nav", "flip"); location.href = href; } });
        fl.forEach((f, i) => { const t = targets[i]; if (t) tl.to(f.el, { x: t.r.left - f.rect.left, y: t.r.top + t.y - f.rect.top, scale: f.fs ? t.fs / f.fs : 1, duration: 1.2, ease: "power4.inOut" }, 0); });
        return;
      }
      if (reduce) { location.href = href; return; }
      gsap.to(veil, { opacity: 0, duration: 0.5, ease: "power2.inOut", onComplete: () => { sessionStorage.setItem("nt-nav", "fade"); location.href = href; } });
    });
  }

  function setView(view, navigated) {
    if (current && current !== view && !current.isConnected) unmount(current);
    current = view;
    view.ntInstant = navigated;
    logoForView(view);
    mount(view);
    nextWork(view, view.ntLife);
    // A screen arrived at via transition has no loader and no Hero text rise (the original does these only on first open) — Hero text appears right away with no delay, and the fluid panel is baked immediately
    if (navigated) {
      flushReveals(true);
      if (view.querySelector("[data-hero-mark]")) { view.dataset.heroDone = "1"; window.dispatchEvent(new CustomEvent("nt:hero-revealed")); }
    }
  }

  // three — the original has it in a single bundle so it’s already loaded on every page. Preload it when idle so the first page’s fluid plane doesn’t wait when it slides in (run only once, since running twice collides global names)
  let threeP = null;
  window.ntNeedThree = () => threeP || (threeP = window.THREE ? Promise.resolve(window.THREE) : new Promise((res, rej) => {
    window.exports = {};
    const sc = document.createElement("script");
    sc.src = "../_vendor/three@0.184.0/build/three.cjs";
    sc.onload = () => { window.THREE = window.exports; delete window.exports; res(window.THREE); };
    sc.onerror = rej;
    document.head.append(sc);
  }));
  if (!reduce) addEventListener("load", () => (window.requestIdleCallback || setTimeout)(() => window.ntNeedThree().catch(() => {}), { timeout: 4000 }));

  renderChrome();
  initLogo();
  const menuApi = initMenu();
  initChromeLang();
  let taxiOn = false;
  try { taxiOn = bindTaxi(); } catch (err) { console.warn("Can’t hail a Taxi, so it falls back to regular travel", err); }
  if (!taxiOn) bindFileNav();
  const first = document.querySelector("[data-taxi-view]");
  setView(first, false);
  runLoader();
  window.addEventListener("nt:hero-revealed", () => lockScroll(false));
  // Height changes when images or fonts arrive late
  const refresh = (() => { let t; return () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); }; })();
  fontsReady.then(refresh);
  addEventListener("load", refresh);

  window.NT = { page, reduce, isMobile, mqMobile, fontsReady, get lenis() { return lenis; }, OBJECTS, lockScroll };
})();
