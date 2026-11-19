// Shared across the whole site: original libraries as they are — page transition barba 2.9.7 · smooth scroll Lenis 1.3.4 (duration 1.3, wheelMultiplier 1.1) ·
// Tablet card dragging and review slider Splide 4.1.4 · GSAP SplitText and DrawSVG. The original CustomEase (ff_expo_*) is rebuilt along the same path.
(() => {
  const MV = (window.MV = window.MV || {});
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, DrawSVGPlugin);
  gsap.config({ nullTargetWarn: false });
  CustomEase.create("ff_expo_out", "M0,0,C0.084,0.61,0.214,0.802,0.28,0.856,0.356,0.918,0.374,1,1,1");
  CustomEase.create("ff_expo_in", "M0,0 C0.5,0 0.581,0.06 0.625,0.086 0.72,0.143 0.9,0.23 1,1");
  CustomEase.create("ff_expo_in_out", "M0,0,C0.25,0,0.294,0.023,0.335,0.05,0.428,0.11,0.466,0.292,0.498,0.502,0.532,0.73,0.586,0.88,0.64,0.928,0.679,0.962,0.698,1,1,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  MV.reduced = reduced;
  MV.touch = touch;
  const root = document.documentElement;
  const isPhone = () => innerWidth < 750;
  MV.isPhone = isPhone;

  // ── Wordmark: splits text into single letters and attaches a red dot. With data-fit it fits the parent width exactly ──
  const marks = () => document.querySelectorAll("[data-mark]:not(.is-split)");
  function splitMark(el) {
    const text = el.textContent.trim();
    el.textContent = "";
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = "letter";
      s.textContent = ch;
      el.append(s);
    }
    const p = document.createElement("span");
    p.className = "point";
    el.append(p);
    el.classList.add("is-split");
  }
  function fit(el) {
    const box = el.parentElement;
    if (!box) return;
    // The wordmark box is 100% wide, so measure the actual text width by switching to max-content
    el.style.fontSize = "100px";
    el.style.width = "max-content";
    const w = el.getBoundingClientRect().width;
    el.style.width = "";
    const target = box.clientWidth;
    if (w && target) el.style.fontSize = `${(100 * target) / w}px`;
  }
  MV.prepareMarks = (scope = document) => {
    marks().forEach(splitMark);
    scope.querySelectorAll("[data-fit]").forEach(fit);
  };
  const fitObserver = new ResizeObserver((entries) => entries.forEach((e) => e.target.querySelectorAll(":scope > [data-fit]").forEach(fit)));
  MV.observeFits = (scope = document) => scope.querySelectorAll("[data-fit]").forEach((el) => el.parentElement && fitObserver.observe(el.parentElement));

  // ── Smooth scroll + custom scrollbar (shows on move and hides after 0.6s) ──
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.3, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), wheelMultiplier: 1.1 });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    lenis.on("scroll", ScrollTrigger.update);
  }
  MV.lenis = lenis;
  MV.lock = () => lenis && lenis.stop();
  MV.unlock = () => lenis && lenis.start();
  MV.scrollTo = (y, opts = {}) => (lenis ? lenis.scrollTo(y, { force: true, ...opts }) : scrollTo(0, typeof y === "number" ? y : 0));

  const bar = document.querySelector(".mv-scrollbar");
  const thumb = bar && bar.querySelector(".mv-scrollbar__thumb");
  let hideT = 0;
  let thumbH = 20;
  const refreshBar = () => {
    if (!thumb) return;
    const docH = document.documentElement.scrollHeight;
    thumbH = Math.max((innerHeight * innerHeight) / docH || 20, 20);
    thumb.style.height = `${thumbH}px`;
  };
  let barHover = false, dragging = false, grabY = 0;
  const hideSoon = () => {
    clearTimeout(hideT);
    hideT = setTimeout(() => !barHover && !dragging && bar.classList.remove("is-visible"), 600);
  };
  const updateBar = () => {
    if (!thumb) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    thumb.style.transform = `translateY(${Math.floor(p * (innerHeight - thumbH))}px)`;
    bar.classList.add("is-visible");
    hideSoon();
  };
  // Original FFScrollScrollbar: clicking on the bar goes to that spot in .8s, the handle follows immediately when dragged
  const yToScroll = (y) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return gsap.utils.clamp(0, max, gsap.utils.mapRange(thumbH / 2, innerHeight - thumbH / 2, 0, max, y));
  };
  if (bar && !touch) {
    new ResizeObserver(refreshBar).observe(document.body);
    addEventListener("scroll", updateBar, { passive: true });
    bar.addEventListener("pointerenter", () => { barHover = true; bar.classList.add("is-visible"); });
    bar.addEventListener("pointerleave", () => { barHover = false; hideSoon(); });
    bar.addEventListener("click", (e) => { if (e.target !== thumb) MV.scrollTo(yToScroll(e.clientY), { duration: 0.8 }); });
    thumb.addEventListener("pointerdown", (e) => { dragging = true; grabY = e.clientY - thumb.getBoundingClientRect().top; thumb.setPointerCapture(e.pointerId); });
    thumb.addEventListener("pointermove", (e) => { if (dragging) MV.scrollTo(yToScroll(e.clientY - grabY + thumbH / 2), { immediate: true }); });
    thumb.addEventListener("pointerup", () => { dragging = false; hideSoon(); });
  }

  // ── Header line: is-scrolled when not at the top (on the first page the scroll hint turns into the logo) ──
  const head = document.querySelector(".mv-header");
  const headBar = head && head.querySelector(".mv-header__bar");
  const onScroll = () => root.classList.toggle("is-scrolled", scrollY > 0);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Dropdown: on click it rises from 4rem to 3rem while fading in. Click outside or press Esc to close
  const toggles = [...document.querySelectorAll(".mv-nav__link[aria-expanded]")];
  const closeSubs = (except) => toggles.forEach((b) => {
    if (b === except) return;
    b.setAttribute("aria-expanded", "false");
    b.nextElementSibling && b.nextElementSibling.classList.remove("is-open");
  });
  toggles.forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = b.getAttribute("aria-expanded") !== "true";
    closeSubs(b);
    b.setAttribute("aria-expanded", String(open));
    b.nextElementSibling.classList.toggle("is-open", open);
  }));
  document.addEventListener("click", (e) => { if (!e.target.closest(".mv-sub")) closeSubs(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeSubs(); closeScreen(); } });

  // Phone·tablet menu panel: backdrop .6s, the white panel turns on while dropping 1rem from the top
  const screen = document.querySelector(".mv-screen");
  const burger = document.querySelector(".mv-burger");
  const panel = screen && screen.querySelector(".mv-screen__panel");
  const backdrop = screen && screen.querySelector(".mv-screen__backdrop");
  let screenOpen = false;
  function openScreen() {
    if (!screen || screenOpen) return;
    screenOpen = true;
    screen.classList.add("is-open");
    burger && burger.setAttribute("aria-expanded", "true");
    MV.lock();
    gsap.to(backdrop, { opacity: 1, duration: reduced ? 0 : 0.6, ease: "ff_expo_out", overwrite: true });
    gsap.fromTo(panel, { opacity: 0, y: "-1rem" }, { opacity: 1, y: 0, duration: reduced ? 0 : 0.6, ease: "ff_expo_out", overwrite: true });
  }
  function closeScreen() {
    if (!screen || !screenOpen) return;
    screenOpen = false;
    burger && burger.setAttribute("aria-expanded", "false");
    MV.unlock();
    gsap.to(backdrop, { opacity: 0, duration: reduced ? 0 : 0.45, ease: "power2.out", overwrite: true });
    gsap.to(panel, { opacity: 0, y: "-1rem", duration: reduced ? 0 : 0.45, ease: "power2.out", overwrite: true, onComplete: () => screen.classList.remove("is-open") });
  }
  MV.closeScreen = closeScreen;
  burger && burger.addEventListener("click", () => (screenOpen ? closeScreen() : openScreen()));
  screen && screen.querySelectorAll("[data-close-screen]").forEach((b) => b.addEventListener("click", closeScreen));
  if (panel) gsap.set(panel, { opacity: 0 });

  const navOf = { home: "", about: "about", service: "service", contact: "contact" };
  function setCurrent(ns) {
    document.querySelectorAll("[data-nav]").forEach((li) => li.classList.toggle("is-current", li.dataset.nav === navOf[ns]));
  }

  // ── Text-splitting helper: lines into masks (u-line), words rise ──
  MV.split = (el, type = "lines, words", vars = {}) => SplitText.create(el, { type, linesClass: "u-line", wordsClass: "u-word", charsClass: "u-char", ...vars });

  // Original ‹wysiwyg›: headings have words rising from 110% below (.15 total stagger), the rest from 4rem below and blur 3px over 1.2s ff_expo_out, each block .15 after the previous
  MV.wysiwyg = (box) => {
    const tl = gsap.timeline({ defaults: { ease: "ff_expo_out", duration: 1.2 } });
    const kids = box.children.length ? box.querySelectorAll(".mv-surtitle, h1, h2, h3, h4, p, .mv-cta-ctn, ul, ol") : [box];
    kids.forEach((k) => {
      if (k.closest(".mv-cta-ctn") && !k.matches(".mv-cta-ctn")) return;
      if (/^H[1-4]$/.test(k.tagName)) {
        const st = MV.split(k);
        tl.from(st.words, { yPercent: 110, stagger: { amount: 0.15 }, duration: 1.2, ease: "ff_expo_out", onComplete: () => st.revert() }, "<+0.15");
      } else if (k.tagName === "UL" || k.tagName === "OL") {
        tl.from(k.children, { opacity: 0, y: "1rem", stagger: 0.15 }, "<+0.15");
      } else {
        tl.from(k, { opacity: 0, y: "4rem", filter: "blur(3px)", clearProps: "all" }, "<+0.15");
      }
    });
    return tl;
  };

  // Original ”media-reveal”: a red cover covers with a circle at top left (50%→200%), turns the photo on, then shrinks into a bottom-right circle and clears away
  MV.mediaReveal = (box) => {
    const ov = document.createElement("div");
    ov.className = "mv-media__overlay";
    box.classList.add("hide-media");
    box.append(ov);
    const img = box.querySelector(".mv-img");
    const tl = gsap.timeline({ onComplete: () => ov.remove() });
    tl.fromTo(ov, { clipPath: "circle(50% at -65% 0%)", visibility: "hidden" }, { clipPath: "circle(200% at -65% 0%)", visibility: "visible", duration: 0.9, ease: "ff_expo_in_out" });
    tl.call(() => box.classList.remove("hide-media"));
    tl.fromTo(ov, { clipPath: "circle(200% at 165% 100%)" }, { clipPath: "circle(50% at 165% 100%)", duration: 1.2, ease: "ff_expo_out" }, "<");
    if (img) tl.from(img, { scale: 1.1, duration: 1.4, ease: "ff_expo_out" }, "<");
    return tl;
  };

  // Original expertise-card: card turns on over 2s, title words 1s (.03), description lines 1.2s (.05), line drawing 1.4s (.15) power3.out, button 1s
  MV.expertiseCard = (card, intro = false) => {
    const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "ff_expo_out" } });
    const title = MV.split(card.querySelector(".mv-ecard__title"));
    const desc = card.querySelector(".mv-ecard__desc p");
    const lines = desc ? MV.split(desc, "lines", { mask: "lines" }) : null;
    const art = card.querySelectorAll(".mv-ecard__bg path, .mv-ecard__bg line, .mv-ecard__bg circle");
    tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 2 });
    tl.from(title.words, { yPercent: 100, opacity: 0, duration: 1, stagger: 0.03 }, "<");
    if (lines) tl.from(lines.lines, { yPercent: 110, stagger: 0.05, duration: 1.2, ease: "ff_expo_out" }, "<+0.2");
    if (lines && intro) tl.from(lines.lines, { opacity: 0, stagger: 0.05, duration: 1 }, "<");
    if (art.length) tl.fromTo(art, { drawSVG: "0%" }, { duration: 1.4, drawSVG: "100%", stagger: 0.15, ease: "power3.out" }, "<+0.4");
    tl.fromTo(card.querySelector(".mv-icon"), { opacity: 0 }, { opacity: 1, duration: 1 }, "<+0.4");
    tl.eventCallback("onComplete", () => { title.revert(); lines && lines.revert(); });
    return tl;
  };

  MV.headerIn = () => gsap.fromTo(head, { y: "-3rem", opacity: 0 }, { duration: 0.9, y: 0, opacity: 1, ease: "power4.out" });

  // ── Scroll animations attached per section (original register_scroll_trigger_animation list) ──
  function scrollParts(box) {
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, () => {
      box.querySelectorAll("[data-anim-wysiwyg]").forEach((el) => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%" } }).add(MV.wysiwyg(el));
      });
      box.querySelectorAll("[data-media-reveal]").forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top bottom", animation: MV.mediaReveal(el) });
      });
      if (!touch) box.querySelectorAll("[data-image-parallax]").forEach((el) => {
        const img = el.querySelector(".mv-img");
        gsap.set(el, { overflow: "hidden" });
        gsap.set(img, { height: "125%", bottom: "auto" });
        gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom 0", scrub: 0.3 } }).fromTo(img, { yPercent: -25 }, { yPercent: 0, ease: "none" });
      });
      box.querySelectorAll("[data-generic-opacity]").forEach((el) => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%" } }).fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "ff_expo_out" });
      });
      box.querySelectorAll("[data-exp-cards]").forEach((cards) => {
        cards.querySelectorAll(".mv-exp__item").forEach((item) => {
          const tl = gsap.timeline({ defaults: { stagger: 0.1 }, scrollTrigger: { trigger: item, start: "top 90%" } });
          tl.fromTo(item.querySelector(".mv-exp__num"), { opacity: 0 }, { opacity: 1, duration: 2 });
          tl.add(MV.expertiseCard(item.querySelector(".mv-ecard")), "<");
        });
      });
    });
    return () => mm.revert();
  }
  // Footer wordmark: when it reaches the bottom of the screen, letters rise from 2rem below, staggered .03, over .9s
  function footerParts() {
    const logo = document.querySelector(".mv-footer__logo");
    if (!logo || reduced) return () => {};
    const letters = logo.querySelectorAll(".letter, .point");
    const tl = gsap.timeline({ scrollTrigger: { trigger: logo, start: "top bottom" } }).from(letters, { y: "2rem", opacity: 0, duration: 0.9, stagger: 0.03, ease: "ff_expo_out" });
    return () => { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.progress(1).kill(); };
  }

  // ── Page registration: page scripts register with MV.page(namespace, { ready(box, first) → release function, intro(box, first) → timeline }) ──
  const parts = [];
  MV.page = (ns, part) => parts.push({ ns, ...part });
  const run = (box, k, ...a) => parts.filter((p) => p[k] && (p.ns === "*" || p.ns === box.dataset.barbaNamespace)).map((p) => p[k](box, ...a));
  const container = () => document.querySelector('[data-barba="container"]');
  let cleanups = [];

  // Hero intro motion (original ”introduction”) — uses what the page script provides, and if none, a common intro curtain
  function intro(box, first) {
    const got = run(box, "intro", first).filter(Boolean);
    if (got.length) return got[0];
    const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "ff_expo_out" } });
    const pin = box.querySelector(".mv-pintro");
    const contact = box.querySelector(".mv-cintro");
    if (pin) {
      // Original c-modular-intro: the photo lifts away from the top (1.2s) 1.1→1, the section name comes in from above, title words 1s (.03), underline .9s, button 1.2s
      const media = pin.querySelector(".mv-pintro__media");
      const h1 = MV.split(pin.querySelector("h1"));
      tl.from(media, { clipPath: "inset(0 0 100% 0)", duration: 1.2 }, first ? 0 : 0.7);
      tl.from(media, { scale: 1.1, duration: 1.6 }, "<");
      tl.from(headBar, { "--blur-op": 0 }, "<");
      tl.from(pin.querySelector(".mv-surtitle"), { yPercent: -50, opacity: 0, duration: 0.6, ease: "power2.inOut" }, "<-1");
      tl.from(h1.words, { yPercent: 100, duration: 1, opacity: 0, stagger: 0.03, onComplete: () => h1.revert() }, "<");
      tl.from(pin.querySelector(".u-bottom-line"), { scaleX: 0, duration: 0.9 }, "<+0.1");
      tl.from(pin.querySelector(".mv-pintro__title-ctn .mv-icon"), { opacity: 0, yPercent: -25, duration: 1.2, ease: "expo.out" }, "<+0.3");
      if (first) tl.add(MV.headerIn(), 0.4);
    } else if (contact) {
      // Original c-contact-intro: circle drawing 1.2s (.02), title words 1.2s (.03), text, map and contacts 2s
      const h1 = MV.split(contact.querySelector("h1"));
      tl.fromTo(contact.querySelectorAll(".mv-cintro__circles circle"), { drawSVG: "0%" }, { duration: 1.2, drawSVG: "100%", stagger: 0.02, ease: "power2.out" }, 0);
      tl.from(headBar, { "--blur-op": 0 }, "<+0.4");
      tl.from(h1.words, { yPercent: 100, duration: 1.2, opacity: 0, stagger: 0.03, onComplete: () => h1.revert() }, "<-0.2");
      tl.from(box.querySelectorAll(".mv-cintro__infos, .mv-cintro__map"), { opacity: 0, duration: 2, ease: "power2.out" }, "<+0.2");
      if (first) tl.add(MV.headerIn(), 0);
    } else if (first) tl.add(MV.headerIn(), 0);
    return tl;
  }

  // Hero down arrow: slides to the next section
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-scroll-next]");
    if (!b) return;
    const sec = b.closest("section");
    const next = sec && (sec.querySelector(".mv-pintro__text") || sec.nextElementSibling);
    if (next) MV.scrollTo(next, { duration: 1.2 });
  });

  // Original c-modular-intro: the photo slowly follows from -50% → 0 while passing the section
  function pintroParallax(box) {
    const media = box.querySelector(".mv-pintro__media");
    if (!media || reduced) return null;
    const tl = gsap.timeline({ scrollTrigger: { trigger: media.closest(".mv-pintro__box"), start: "top bottom", end: "bottom 0", scrub: true } }).fromTo(media, { yPercent: -50 }, { yPercent: 0, ease: "none" });
    return () => { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); gsap.set(media, { clearProps: "transform" }); };
  }

  function mount(box, first) {
    document.body.dataset.page = box.dataset.barbaNamespace;
    setCurrent(box.dataset.barbaNamespace);
    MV.prepareMarks(document);
    MV.observeFits(document);
    cleanups = [scrollParts(box), pintroParallax(box), ...run(box, "ready", first)].filter((f) => typeof f === "function");
    ScrollTrigger.refresh();
  }
  const unmount = () => cleanups.splice(0).forEach((f) => f());

  const overlay = document.querySelector(".mv-transition");
  const ovInner = overlay && overlay.querySelector(".mv-transition__inner");
  const ovLogo = overlay && overlay.querySelector(".mv-transition__logo");

  // Original page enter: cover letters and dots drop 200 down over 1s (.01 stagger), the curtain lifts from the top over .8s, and that page’s intro motion starts at the same time
  function enter(box, first) {
    const tl = gsap.timeline({ defaults: { duration: 1, ease: "ff_expo_out", overwrite: "auto" } });
    if (!first && overlay) {
      const glyphs = ovLogo.querySelectorAll(".letter, .point");
      tl.set([box, document.querySelector(".mv-footer")], { opacity: 1 });
      tl.fromTo(glyphs, { opacity: 1, y: 0 }, { duration: 1, y: 200, stagger: 0.01, opacity: 0, ease: "power2.inOut" }, "<+0.2");
      tl.fromTo(ovInner, { clipPath: "inset(0% 0 0% 0)" }, { clipPath: "inset(100% 0 0% 0)", duration: 0.8, ease: "ff_expo_in_out" }, "<");
    } else {
      tl.set({}, {}, 0.2);
    }
    tl.addLabel("intro", "<");
    MV.lock();
    const i = reduced ? null : intro(box, first);
    if (i) tl.add(i, "intro");
    else if (first) gsap.set(head, { opacity: 1 });
    tl.call(() => { MV.unlock(); overlay && overlay.classList.remove("is-current"); root.classList.remove("mv-transitioning"); }, null, "intro+=1");
    return tl;
  }

  // Original page leave: the curtain covers downward in .8s, the body turns off for .3s, then the dot comes from the left with 1s power4.out and bounces, and the text rises 200 from below in 1.1s
  function leave() {
    const tl = gsap.timeline();
    closeSubs();
    closeScreen();
    MV.lock();
    root.classList.add("mv-transitioning");
    if (reduced || !overlay) {
      tl.to([container(), document.querySelector(".mv-footer")], { duration: 0.65, opacity: 0, ease: "power2.in" });
      return tl;
    }
    overlay.classList.add("is-current");
    const mark = ovLogo.querySelector(".mv-mark");
    const point = mark.querySelector(".point");
    const letters = mark.querySelectorAll(".letter");
    const w = mark.getBoundingClientRect().width * -1;
    gsap.set(point, { x: w, y: 0, opacity: 0 });
    tl.fromTo(ovInner, { clipPath: "inset(0% 0 100% 0)" }, { clipPath: "inset(0% 0 0% 0)", duration: 0.8, ease: "ff_expo_in_out" });
    tl.fromTo([container(), document.querySelector(".mv-footer")], { opacity: 1 }, { duration: 0.3, opacity: 0, ease: "power2.in" }, ">");
    tl.set(mark, { overflow: "hidden" }, "<-0.6");
    tl.set(point, { opacity: 1 }, "<");
    tl.fromTo(point, { x: w }, { x: 0, duration: 1, ease: "power4.out" }, "<+0.1");
    tl.fromTo(point, { y: 0 }, { y: -15, duration: 0.3, ease: "power2.out" }, ">-0.3");
    tl.set(mark, { overflow: "visible" });
    tl.fromTo(point, { y: -15 }, { y: 5, duration: 0.2, ease: "power2.inOut" }, ">");
    tl.fromTo(point, { y: 5 }, { y: 0, duration: 0.1, ease: "power2.inOut" }, ">");
    tl.set(mark, { overflow: "hidden" });
    tl.fromTo(letters, { y: 200, opacity: 0 }, { duration: 1.1, y: 0, opacity: 1, stagger: 0.01, ease: "power2.inOut" }, ">-1.6");
    return tl;
  }

  // Fetches the next page’s page css — the original has a single css file, so this step is not needed
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    have.forEach((l) => want.includes(l.href) || l.remove());
    return Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
      const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
      l.onload = l.onerror = res;
      document.head.append(l);
    })));
  };
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "") && !/^#/.test(href);
  const samePage = (href) => href.split("#")[0] === (location.pathname.split("/").pop() || "index.html");

  // Same-side anchors glide via Lenis
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    if (!hash || hash === "#" || !(href.startsWith("#") || samePage(href))) return;
    const t = document.querySelector(hash);
    if (!t) return;
    e.preventDefault();
    closeScreen();
    closeSubs();
    MV.scrollTo(t, { offset: 0, duration: 1.2 });
  });

  function start() {
    const box = container();
    MV.prepareMarks(document);
    const first = () => {
      mount(box, true);
      const go = () => {
        root.classList.add("mv-loaded");
        // Original page load: turn on body · footer with .5s power2.in and bring the page in on top
        const tl = gsap.timeline();
        tl.fromTo(document.body, { opacity: 0 }, { duration: reduced ? 0 : 0.5, opacity: 1, ease: "power2.in" }, 0);
        tl.add(enter(box, true), "<");
        if (location.hash) {
          const t = document.querySelector(location.hash);
          if (t) setTimeout(() => MV.scrollTo(t, { immediate: true }), 50);
        }
      };
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { MV.prepareMarks(document); go(); });
    };
    if (document.readyState === "complete") first();
    else addEventListener("load", first);

    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        timeout: 10000,
        prevent: ({ el, href }) => !el || el.tagName !== "A" || !own(el.getAttribute("href")) || (samePage(el.getAttribute("href")) && el.getAttribute("href").includes("#")),
        transitions: [{
          name: "overlay",
          leave: () => leave(),
          beforeEnter: async ({ current, next }) => {
            unmount();
            current.container.style.display = "none";
            await sheets(next.html);
            MV.scrollTo(0, { immediate: true });
            scrollTo(0, 0);
            mount(next.container, false);
            const hash = next.url.hash ? document.getElementById(next.url.hash) : null;
            if (hash) requestAnimationFrame(() => MV.scrollTo(hash, { immediate: true }));
          },
          enter: ({ next }) => enter(next.container, false),
        }],
      });
      return;
    }
    // On file:// barba can’t fetch the next page — after drawing the same cover, do a normal navigation
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!own(href) || samePage(href)) return;
      e.preventDefault();
      leave().eventCallback("onComplete", () => (location.href = href));
    });
    addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
  MV.footerParts = footerParts;
  MV.page("*", { ready: () => footerParts() });
})();
