// Shared across several pages — Lenis · Barba (transition curtain .6s power3.inOut) · loader curve curtain · header line hide · letter-by-letter rolling · cookie curtain · island button · float-up · parallax · footer wordmark letter swap
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, ...(window.MorphSVGPlugin ? [MorphSVGPlugin] : []));
  CustomEase.create("anticipation", "M0,0 C0.3,-0.43 0,1 1,1");
  history.scrollRestoration = "manual";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const pages = {};
  // Scroll lock is counted per reason — even if loader·transition·cookie curtain overlap, scrolling resumes when the last one is released (original ScrollManager)
  const held = new Set();
  const pause = (k) => { held.add(k); if (held.size === 1) lenis?.stop(); };
  const resume = (k) => { held.delete(k); if (!held.size) lenis?.start(); };
  const FI = (window.FI = { lenis, reduce, pause, resume, page: (n, f) => { pages[n] = f; } });

  // Letter-by-letter roll — on hover the letters roll at .02 stagger down to −76% (the same letter attached right below) in .7s anticipation, then return to place when done
  FI.shift = (root) => {
    if (touch) return () => {};
    const offs = $$("[data-shift]", root).map((el) => {
      const split = new SplitText(el, { type: "chars", charsClass: "char" });
      split.chars.forEach((c) => (c.dataset.char = c.textContent));
      let tl = null, can = true;
      const enter = () => {
        if (!can || reduce) return;
        can = false;
        if (tl) { tl.restart(); return; }
        tl = gsap.timeline({ onComplete: () => { gsap.set(split.chars, { yPercent: 0 }); tl.kill(); tl = null; can = true; } })
          .to(split.chars, { yPercent: -76, duration: 0.7, ease: "anticipation", stagger: 0.02, overwrite: "auto" });
      };
      const leave = () => { can = true; };
      el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave);
      return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); tl?.kill(); split.revert(); };
    });
    return () => offs.forEach((f) => f());
  };
  // Arrow button — on hover the arrow tilts to −45° and swings 25% back and forth three times, then stands upright (.25s power2.out)
  FI.arrows = (root) => {
    const offs = $$("[data-arrow]", root).map((el) => {
      const icon = el.querySelector(".fi-btn__icon");
      if (!icon) return null;
      let busy = false;
      const on = () => {
        if (busy || reduce) return;
        busy = true;
        gsap.timeline({ defaults: { ease: "power2.out", duration: 0.25 } })
          .to(icon, { rotate: -45 }).to(icon, { xPercent: 25, repeat: 3, yoyo: true }).to(icon, { rotate: 0, onComplete: () => { busy = false; } });
      };
      el.addEventListener("mouseenter", on);
      return () => el.removeEventListener("mouseenter", on);
    });
    return () => offs.forEach((f) => f?.());
  };

  // ───── Headline row ─────
  const nav = $(".fi-nav");
  FI.shift(nav);
  let navShow = null, navST = null;
  const navSticky = () => {
    navST?.kill(); navShow?.kill();
    if (!nav) return;
    gsap.set(nav, { clearProps: "transform" });
    navShow = gsap.from(nav, { yPercent: -180, paused: true, duration: 0.8, ease: "circ.inOut" }).progress(1);
    navST = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { if (scrollY > 100) s.direction === -1 ? navShow.play() : navShow.reverse(); } });
  };
  navSticky();
  const flips = [];
  const flipNav = (c) => {
    flips.splice(0).forEach((s) => s.kill());
    $$("[data-flipnav]", c).forEach((el) => flips.push(ScrollTrigger.create({ trigger: el, start: "top 60px", end: "bottom top", toggleClass: { targets: nav, className: "is-flip" } })));
  };
  const toggleMenu = () => { document.body.classList.toggle("nav-open") ? pause("menu") : resume("menu"); };
  $$("[data-nav-toggle]").forEach((b) => b.addEventListener("click", toggleMenu));
  // Current time (City)
  const clock = $("[data-clock]");
  if (clock) {
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/City", hour: "2-digit", minute: "2-digit", hour12: false });
    const t = () => (clock.textContent = f.format(new Date()));
    t(); setInterval(t, 10000);
  }

  // ───── Cookie curtain ─────
  const notice = $("[data-notice]");
  if (notice) {
    let seen = false;
    try { seen = localStorage.getItem("fi-cookie") === "1"; } catch {}
    // Locks scroll while the curtain is up (original cookie-banner: body.no-scroll + scroll stop)
    const card = $("[data-notice-card]", notice), veil = $(".fi-notice__veil", notice);
    notice.hidden = seen;
    if (!seen) { document.body.classList.add("no-scroll"); pause("cookie"); requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add("is-in"))); }
    // Read more expands and hides while Decline appears (original learnMore: button--hidden swap)
    const more = $("[data-notice-more]", notice), decline = $("[data-notice-decline]", notice);
    more?.addEventListener("click", () => { const on = card.classList.toggle("is-expanded"); more.classList.toggle("is-hidden", on); decline?.classList.toggle("is-hidden", !on); });
    [...$$("[data-notice-close]", notice), ...$$("[data-notice-decline]", notice)].forEach((b) => b.addEventListener("click", () => {
      card.classList.add("is-close"); veil.hidden = true;
      document.body.classList.remove("no-scroll"); resume("cookie");
      try { localStorage.setItem("fi-cookie", "1"); } catch {}
    }));
  }

  // ───── Island button — floats while a [data-ghost] section crosses the line 160px from the screen bottom (.5s power3.out after a .3s delay, .3s when hiding) ─────
  const island = $(".fi-island");
  let ghostOffs = [];
  const ghosts = (c) => {
    ghostOffs.splice(0).forEach((f) => f());
    if (!island) return;
    gsap.set(island, { yPercent: 170, y: 30 });
    let on = 0;
    const show = () => { on++; gsap.fromTo(island, { yPercent: 170, y: 0 }, { delay: 0.3, yPercent: 0, duration: 0.5, ease: "power3.out", overwrite: true }); };
    const hide = () => { on = Math.max(0, on - 1); if (!on) gsap.fromTo(island, { yPercent: 0 }, { yPercent: 170, duration: 0.3, ease: "power3.out", overwrite: true }); };
    $$("[data-ghost]", c).forEach((el) => {
      const st = ScrollTrigger.create({ trigger: el, start: "top bottom-=160px", end: "bottom bottom-=160px", invalidateOnRefresh: true, onEnter: show, onEnterBack: show, onLeave: hide, onLeaveBack: hide });
      ghostOffs.push(() => st.kill());
    });
  };

  // ───── Rise-up · parallax ─────
  function watch(c) {
    if (reduce) return () => {};
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const t = e.target, v = t.dataset.watch, items = v === "true" ? [t] : $$(v.startsWith("[") ? v : "." + v, t);
      if (items.length) gsap.fromTo(items, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, stagger: parseFloat(t.dataset.watchDelay || 0), ease: "circ.out" });
      io.unobserve(t);
    }), { rootMargin: "-400px 0px 0px 0px", threshold: 0 });
    $$("[data-watch]", c).forEach((t) => {
      const v = t.dataset.watch, items = v === "true" ? [t] : $$(v.startsWith("[") ? v : "." + v, t);
      gsap.set(items, { opacity: 0, y: 50 });
      io.observe(t);
    });
    return () => io.disconnect();
  }
  function parallax(c) {
    if (reduce || touch) return () => {};
    const tws = $$('[data-speed]:not([data-speed="auto"])', c).map((el) => {
      const s = parseFloat(el.dataset.speed) || 1, d = () => (innerHeight * Math.abs(s - 1)) / 2;
      return gsap.fromTo(el, { y: () => (s > 1 ? d() : -d()) }, { y: () => (s > 1 ? -d() : d()), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    return () => tws.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  }

  // ───── Footer wordmark letter swap — when the pointer enters a letter cell, that letter morphs to its next variant with a .2s anticipation, and on leave it returns to its own shape and moves on to the next variant (original LogoHoverSwap, MorphSVG) ─────
  // The panel is the same 817×232 as the original, letter cell widths 136·66·155·146·158·156. Shapes are our own six, the same as the header logo, with variation counts of 8·6·10·9·12·10 as in the original (the first value in the list is the resting shape)
  const P = (n) => +n.toFixed(1);
  const rr = (x0, y0, x1, y1, r) => {
    r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
    return `M${P(x0 + r)} ${P(y0)}H${P(x1 - r)}A${P(r)} ${P(r)} 0 0 1 ${P(x1)} ${P(y0 + r)}V${P(y1 - r)}A${P(r)} ${P(r)} 0 0 1 ${P(x1 - r)} ${P(y1)}H${P(x0 + r)}A${P(r)} ${P(r)} 0 0 1 ${P(x0)} ${P(y1 - r)}V${P(y0 + r)}A${P(r)} ${P(r)} 0 0 1 ${P(x0 + r)} ${P(y0)}Z`;
  };
  const el = (cx, cy, rx, ry = rx) => `M${P(cx - rx)} ${P(cy)}A${P(rx)} ${P(ry)} 0 1 1 ${P(cx + rx)} ${P(cy)}A${P(rx)} ${P(ry)} 0 1 1 ${P(cx - rx)} ${P(cy)}Z`;
  const pg = (pts) => "M" + pts.map(([x, y]) => `${P(x)} ${P(y)}`).join("L") + "Z";
  const semi = (cx, by, rx, ry) => `M${P(cx - rx)} ${P(by)}A${P(rx)} ${P(ry)} 0 0 1 ${P(cx + rx)} ${P(by)}Z`;
  const GLYPHS = {
    // Windowed panel — window position, size and panel corners change
    f: [[60, 60, 18], [20, 60, 18], [100, 60, 18], [60, 30, 60], [140, 40, 18], [60, 100, 40], [20, 140, 8], [100, 30, 66], [150, 60, 30]]
      .map(([y, h, r]) => rr(6, 0, 130, 232, r) + rr(36, y, 100, y + h, 8)),
    // Pill + diamond — the diamond moves up and down and the pill height changes
    i: [[30, 70], [16, 100], [50, 40], [30, 130], [60, 90], [20, 70], [44, 150]]
      .map(([dy, top]) => rr(141, top, 197, 232, 28) + pg([[169, dy - 26], [195, dy], [169, dy + 26], [143, dy]])),
    // Disc — flattens, lengthens and tilts
    a: [[75, 75], [77, 60], [70, 90], [77, 40], [60, 75], [77, 75], [50, 90], [77, 52], [66, 66], [77, 82], [40, 75]]
      .map(([rx, ry], n) => (n === 5 ? rr(202, 76, 357, 232, 30) : el(279.5, 232 - ry, rx, ry))),
    // A square with a hole — hole size, position, corners
    s: [[30, 157, 20], [44, 157, 20], [20, 157, 60], [30, 120, 20], [30, 190, 20], [50, 157, 68], [16, 157, 4], [36, 140, 40], [24, 175, 10], [40, 130, 30]]
      .map(([hr, hy, r]) => rr(362, 82, 498, 232, r) + el(430, hy, hr)),
    // Semicircle — height and width change, morphing into triangle and square
    c: [[76, 150], [76, 110], [76, 175], [60, 150], [79, 80], [70, 165], [76, 130], [79, 150], [50, 120], [79, 100], [64, 140], [76, 160], [56, 175]]
      .map(([rx, ry], n) => (n === 3 ? pg([[522, 232], [582, 82], [642, 232]]) : n === 8 ? rr(530, 92, 634, 232, 10) : semi(582, 232, rx, ry))),
    // Ring — hole and rim thickness
    o: [[35, 75], [50, 75], [20, 75], [35, 60], [55, 77], [28, 77], [42, 70], [35, 77], [60, 77], [24, 66], [46, 62]]
      .map(([h, r]) => el(739, 232 - r, r) + el(739, 232 - r, h)),
  };
  const BOX = { f: [0, 136], i: [136, 66], a: [202, 155], s: [357, 146], c: [503, 158], o: [661, 156] };
  function footMark(c) {
    const mark = $(".fi-foot__mark", c);
    if (!mark || mark.querySelector("svg")) return;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 817 232");
    const paths = {};
    for (const k of Object.keys(BOX)) {
      const p = document.createElementNS(ns, "path");
      p.setAttribute("d", GLYPHS[k][0]); p.setAttribute("fill-rule", "evenodd");
      svg.appendChild((paths[k] = p));
    }
    for (const [k, [x, w]] of Object.entries(BOX)) {
      const r = document.createElementNS(ns, "rect");
      r.setAttribute("x", x); r.setAttribute("width", w); r.setAttribute("height", 232); r.setAttribute("class", "fi-foot__hit");
      svg.appendChild(r);
      if (touch || reduce || !window.MorphSVGPlugin) continue;
      const list = GLYPHS[k].slice(1);
      let n = 0;
      r.addEventListener("mouseenter", () => gsap.to(paths[k], { morphSVG: list[n], ease: "anticipation", duration: 0.2, overwrite: true }));
      r.addEventListener("mouseleave", () => { gsap.to(paths[k], { morphSVG: GLYPHS[k][0], ease: "anticipation", duration: 0.2, overwrite: true }); n = (n + 1) % list.length; });
    }
    mark.textContent = "";
    mark.appendChild(svg);
  }

  // ───── Section hook ─────
  const live = new WeakMap();
  function init(c) {
    if (live.has(c)) return;
    const offs = [watch(c), parallax(c), FI.shift(c), FI.arrows(c)];
    flipNav(c); ghosts(c); footMark(c);
    try { const off = pages[c.dataset.page]?.(c); if (typeof off === "function") offs.push(off); } catch (e) { console.error(e); }
    live.set(c, () => offs.forEach((f) => f()));
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }
  const drop = (c) => { live.get(c)?.(); live.delete(c); };

  // Loader — after .5s the wordmark lifts −20% in 1s expo.out while the bottom edge is carved into a curve, then in .8s power4.inOut the curve folds upward and the panel disappears
  function loader() {
    const box = $(".fi-loader"), path = $(".fi-loader path"), mark = $(".fi-loader__mark");
    if (!box) return;
    if (reduce) { box.remove(); return; }
    pause("loader");
    const mid = matchMedia("(max-width: 768px)").matches ? "M0 1 S 0.07 0.88 0.28 0.89 S 0.59 1 1 1 L 1 0 H 0 Z" : "M0 1 S 0.06 0.77 0.27 0.77 S 0.59 1 1 1 L 1 0 H 0 Z";
    gsap.timeline({ delay: 0.5, onComplete: () => { box.remove(); resume("loader"); } })
      .to(mark, { yPercent: -20, duration: 1, ease: "expo.out" })
      .to(path, { attr: { d: mid }, duration: 1, ease: "expo.out" }, "<")
      .to(path, { attr: { d: "M0 0 S 0 0 0.289 0 S 1 0 1 0 L 1 0 H 0 Z" }, duration: 0.8, ease: "power4.inOut" })
      .to(mark, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "<");
  }

  const boot = () => {
    const first = $('[data-transition="container"]');
    loader();
    init(first);
    if (!window.barba || location.protocol === "file:") return;
    const trans = $(".fi-trans"), logos = $(".fi-trans__logos");
    gsap.set(trans, { yPercent: -110 }); gsap.set(logos, { yPercent: -300 });
    barba.init({
      schema: { prefix: "data-transition" },
      timeout: 50000,
      transitions: [{
        name: "default-transition",
        leave: () => new Promise((done) => {
          document.body.classList.remove("nav-open");
          pause("page");
          if (reduce) return done();
          gsap.timeline({ defaults: { ease: "power3.inOut", duration: 0.6 } })
            .set(trans, { yPercent: 110 }).to(trans, { yPercent: 0 }).to(logos, { yPercent: 0, onComplete: done }, "<");
        }),
        beforeEnter: (d) => { drop(d.current.container); },
        after: (d) => {
          scrollTo(0, 0); lenis?.scrollTo(0, { immediate: true });
          init(d.next.container);
          navSticky();
          if (reduce) { resume("page"); return; }
          gsap.timeline({ defaults: { ease: "power3.inOut", duration: 0.6 } })
            .to(trans, { yPercent: -100 }).to(logos, { yPercent: 300, onComplete: () => { gsap.set(logos, { yPercent: -300 }); resume("page"); } }, "<");
        },
      }],
    });
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
})();
