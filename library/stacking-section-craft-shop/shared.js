// Motion shared by all pages: Lenis (length 1.4 · wheel .7x · up to 140px at a time), header bar (white glass past 40px, hides on scroll down, shows on scroll up), menu drawer · currency picker,
// Slideshow (1.2s overlap every 4.5s), hero blur-wipe text and hero pinning, subpages (data-template="page") photo parallax and text entrance.
// Tools used by page scenes are kept in window.aMotion.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DESKTOP = matchMedia("(min-width: 1025px)").matches;
  const root = document.documentElement;
  const main = document.querySelector("main[data-template]");
  const TPL = main ? main.dataset.template : "";

  // Header, drawer, call, slideshow and video hover work regardless of reduced motion
  const header = document.querySelector(".a-header");
  if (header) {
    const toggle = header.querySelector(".a-header__toggle");
    let lastY = scrollY, hidden = null;
    const onScroll = () => {
      const y = scrollY;
      if (header.dataset.overlay === "true") header.classList.toggle("is-solid", y > 40);
      if (!header.classList.contains("is-open")) {
        const dy = y - lastY;
        if (y <= 80) header.classList.remove("is-hidden");
        else if (dy > 4) header.classList.add("is-hidden");
        else if (dy < -4) header.classList.remove("is-hidden");
      }
      const h = header.classList.contains("is-hidden");
      if (h !== hidden) { hidden = h; root.style.setProperty("--nav-offset", h ? "0px" : "87px"); }
      lastY = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toggle?.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      if (open) header.classList.remove("is-hidden");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    header.querySelectorAll("[data-currency]").forEach((box) => {
      const btn = box.querySelector(".a-header__currency-btn");
      btn.addEventListener("click", (e) => { e.stopPropagation(); const o = box.classList.toggle("is-open"); btn.setAttribute("aria-expanded", o ? "true" : "false"); });
      box.querySelectorAll(".a-header__currency-menu button").forEach((opt) => opt.addEventListener("click", () => {
        box.querySelectorAll(".a-header__currency-menu button").forEach((b) => b.classList.toggle("is-current", b === opt));
        btn.querySelector("span").textContent = opt.textContent;
        box.classList.remove("is-open");
      }));
      document.addEventListener("click", () => box.classList.remove("is-open"));
    });
  }

  if (!reduce) {
    document.querySelectorAll("[data-slideshow]").forEach((show) => {
      const slides = [...show.children];
      if (slides.length < 2) return;
      let i = Math.max(0, slides.findIndex((s) => s.classList.contains("is-active")));
      slides[i].classList.add("is-active");
      setInterval(() => { slides[i].classList.remove("is-active"); i = (i + 1) % slides.length; slides[i].classList.add("is-active"); }, Number(show.dataset.interval) || 4500);
    });
  }
  const hoverPlay = (hostSel, vidSel) => document.querySelectorAll(hostSel).forEach((host) => {
    const v = host.querySelector(vidSel);
    if (!v) return;
    host.addEventListener("mouseenter", () => { if (!reduce && innerWidth > 1024 && matchMedia("(hover: hover)").matches) v.play().catch(() => {}); });
    host.addEventListener("mouseleave", () => { v.pause(); });
  });
  hoverPlay(".a-coll__promo", ".a-coll__promo-video");
  hoverPlay(".a-worlds__card", ".a-worlds__video");

  document.querySelectorAll("[data-newsletter], [data-appointment]").forEach((f) => f.addEventListener("submit", (e) => e.preventDefault()));
  // Get news — the Submit button turns on only after checking ”I’m human” (until then it stays dimmed at .45, like the original)
  document.querySelectorAll("[data-newsletter]").forEach((f) => {
    const box = f.querySelector("[data-human]"), btn = f.querySelector("[type=submit]");
    if (box && btn) box.addEventListener("change", () => { btn.disabled = !box.checked; });
  });

  if (reduce || !window.gsap || !window.ScrollTrigger) { root.classList.remove("a-anim-pending"); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (TPL === "index" || DESKTOP) root.classList.add("a-fill");

  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.4,
      wheelMultiplier: 0.7,
      virtualScroll: (data) => { const MAX = 140; if (data.deltaY > MAX) data.deltaY = MAX; else if (data.deltaY < -MAX) data.deltaY = -MAX; return true; },
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  addEventListener("load", () => setTimeout(() => ScrollTrigger.refresh(), 800));

  // Letter/word splitting — leave spaces alone and wrap only letters (or words) in span
  const split = (el, mode) => {
    const spans = [];
    const label = el.textContent;
    const walk = (node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        const tokens = mode === "word" ? node.nodeValue.split(/(\s+)/) : node.nodeValue.split("");
        tokens.forEach((t) => {
          if (t === "") return;
          if (t.trim() === "") { frag.appendChild(document.createTextNode(t)); return; }
          const s = document.createElement("span");
          s.textContent = t;
          if (mode === "word") s.className = "a-split-word";
          spans.push(s);
          frag.appendChild(s);
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) [...node.childNodes].forEach(walk);
    };
    walk(el);
    el.setAttribute("aria-label", label.trim());
    return spans;
  };
  // Wipe — each piece spreads its screen position (left or top) over 0~1 and delays by that share, from 8px blur and transparent to clear (part seconds each, total seconds overall)
  const sweep = (parts, axis, opts) => {
    if (!parts.length) return;
    const pos = parts.map((s) => { const r = s.getBoundingClientRect(); return axis === "y" ? r.top : r.left; });
    const min = Math.min(...pos), span = Math.max(Math.max(...pos) - min, 1);
    const vars = { opacity: 1, filter: "blur(0px)", duration: opts.part, ease: "power2.out", delay: opts.delay || 0, stagger: (i) => (pos[i] - min) / span * (opts.total - opts.part) };
    if (opts.trigger) vars.scrollTrigger = { trigger: opts.trigger, start: opts.start, once: true };
    gsap.to(parts, vars);
  };
  const docTop = (el) => { let y = 0; for (; el; el = el.offsetParent) y += el.offsetTop; return y; };
  // Binds the span while the panel’s top edge travels from the bottom to the top of the screen (one screen) to 0~1 on the timeline — used for the curtain descending over the pinned previous section
  const rectDrive = (wrap, tl, onProgress) => {
    tl.pause();
    const f = () => {
      const p = Math.max(0, Math.min(1, 1 - wrap.getBoundingClientRect().top / innerHeight));
      tl.progress(p);
      onProgress && onProgress(p);
    };
    gsap.ticker.add(f);
    ScrollTrigger.addEventListener("refresh", () => tl.invalidate());
    f();
  };
  const once = (test, run) => { let done = false; const g = () => { if (!done && test()) { done = true; removeEventListener("scroll", g); run(); } }; addEventListener("scroll", g, { passive: true }); g(); };
  window.aMotion = { DESKTOP, TPL, split, sweep, docTop, rectDrive, once, lenis };

  // Hero text — label·title by letter, subtitle by word. Once the font has arrived, wipe in from the left (total 2.5s · letter 1.2s · .2s delay)
  const heroContent = document.querySelector(".a-hero__content");
  if (heroContent) {
    let parts = [];
    [[".a-hero__eyebrow", "char"], [".a-hero__heading", "char"], [".a-hero__sub", "word"], [".a-hero__cta", "char"]].forEach(([sel, mode]) => {
      const el = heroContent.querySelector(sel);
      if (el) parts = parts.concat(split(el, mode));
    });
    gsap.set(parts, { opacity: 0, filter: "blur(8px)" });
    root.classList.remove("a-anim-pending");
    let swept = false;
    const go = () => { if (!swept) { swept = true; sweep(parts, "x", { total: 2.5, part: 1.2, delay: 0.2 }); } };
    if (document.fonts?.ready) { document.fonts.ready.then(go); setTimeout(go, 1200); } else go();
  } else root.classList.remove("a-anim-pending");

  // Hero pin — while the next section covers it upward, the hero rises −12% and the text fades within .35 (desktop)
  const hero = document.querySelector(".a-hero");
  const heroWrap = hero?.closest(".a-sec");
  if (heroWrap && DESKTOP) {
    gsap.set(heroWrap, { zIndex: -1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: heroWrap, start: "top top", end: "bottom top", scrub: true, pin: true, pinSpacing: false } });
    tl.to(hero, { yPercent: -12, ease: "none", duration: 1 }, 0);
    tl.to(hero.querySelector(".a-hero__content"), { opacity: 0, filter: "blur(8px)", ease: "none", duration: 0.35 }, 0);
  }

  // Sub page — photo at 1.12x parallax −5% → 5% inside the slot, text block enters over .9s from 24px left on desktop (24px below on phone) (at 20% visible)
  if (TPL === "page" && main) {
    const drivers = [];
    main.querySelectorAll(".a-ed__media > .wf-img, .a-statement__media > .wf-img, .a-appt__bg > .wf-img").forEach((img) => {
      const holder = img.parentElement;
      gsap.set(holder, { overflow: "hidden" });
      gsap.set(img, { scale: 1.12 });
      const set = gsap.quickSetter(img, "yPercent");
      drivers.push(() => {
        const r = holder.getBoundingClientRect();
        if (r.bottom < -60 || r.top > innerHeight + 60) return;
        const p = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
        set(-5 + 10 * p);
      });
    });
    if (drivers.length) gsap.ticker.add(() => drivers.forEach((d) => d()));
    const seen = [];
    main.querySelectorAll('[class*="__eyebrow"], [class*="__heading"], [class*="__intro"], [class*="__body"], [class*="__desc"], [class*="__title"], [class*="__btn"], [class*="__link"], [class*="__step"]').forEach((el) => {
      if (el.closest(".a-hero, .a-appt, .a-statement, .a-ed--overlay") || seen.some((s) => s.contains(el))) return;
      seen.push(el);
      gsap.set(el, DESKTOP ? { x: -24, autoAlpha: 0 } : { y: 24, autoAlpha: 0 });
    });
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      gsap.to(en.target, { x: 0, y: 0, autoAlpha: 1, duration: 0.9, ease: "power2.out" });
    }), { threshold: 0.2 });
    seen.forEach((el) => io.observe(el));
  }
})();
