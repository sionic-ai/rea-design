// Motion shared by all pages: Lenis (wide screens lerp .06, wheel ×.6, touch .075), first-visit burgundy curtain, page-change brass curtain,
// Arch-curved header line (arches past 80px, hides on scroll down, shows on scroll up), phone menu, rise on enter, leaf shadow branches, pictograms, clock.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const html = document.documentElement;

  // ── Lenis ──
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis(touch
      ? { lerp: 0.075, syncTouch: true, syncTouchLerp: 0.07, touchMultiplier: 1.1, touchInertiaExponent: 1.6, autoRaf: false }
      : { lerp: 0.06, wheelMultiplier: 0.6, smoothWheel: true, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.qsSite = { lenis };
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // ── Pictogram (our drawing: an olive branch topped with a crown) — drawn in lines, then filled ──
  const PICTO = [
    ["picto__diadem", "M38 22 L42 10 L46 18 L50 6 L54 18 L58 10 L62 22 Z"],
    ["", "M50 96 C49 78 51 56 50 28"],
    ["", "M50 84 C40 82 31 76 27 66 C37 66 46 72 50 84 Z"],
    ["", "M50 72 C60 70 69 63 72 53 C62 54 53 61 50 72 Z"],
    ["", "M50 60 C41 58 34 51 32 42 C41 43 48 50 50 60 Z"],
    ["", "M50 48 C58 46 64 39 66 31 C58 32 52 39 50 48 Z"],
    ["", "M50 38 C45 36 41 31 41 26 C46 27 49 32 50 38 Z"],
  ];
  const picto = (cls = "") => `<svg class="picto-draw ${cls}" viewBox="0 0 100 100" aria-hidden="true">${PICTO.map(([c, d], i) => `<path class="${c}" d="${d}" pathLength="1" style="--i:${i}"/>`).join("")}</svg>`;
  document.querySelectorAll("[data-picto]").forEach((el) => { el.innerHTML = picto(); });

  // ── Leaf shadow: two branches drawn from the same seed so the shape is always the same ──
  const leaves = (seed) => {
    let s = seed;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const branch = (x0, y0, len, bend) => {
      let d = "";
      for (let i = 0; i < 14; i++) {
        const t = i / 13;
        const x = x0 + bend * Math.sin(t * 2.2) * 60;
        const y = y0 + t * len;
        const side = i % 2 ? 1 : -1;
        const a = (side * (40 + rnd() * 30) * Math.PI) / 180;
        const L = 38 + rnd() * 26, W = 9 + rnd() * 6;
        const tx = x + Math.sin(a) * L, ty = y + Math.cos(a) * L * 0.6;
        const nx = Math.cos(a) * W, ny = -Math.sin(a) * W * 0.6;
        d += `M${x.toFixed(1)} ${y.toFixed(1)} Q${((x + tx) / 2 + nx).toFixed(1)} ${((y + ty) / 2 + ny).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q${((x + tx) / 2 - nx).toFixed(1)} ${((y + ty) / 2 - ny).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}Z`;
      }
      return d;
    };
    return `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><filter id="leaf-blur-${seed}"><feGaussianBlur stdDeviation="2.2"/></filter></defs>`
      + `<g class="leaf-sway" filter="url(#leaf-blur-${seed})"><path d="${branch(120, -20, 520, 1)}"/></g>`
      + `<g class="leaf-sway" filter="url(#leaf-blur-${seed})" opacity=".7"><path d="${branch(250, 80, 600, -0.8)}"/></g></svg>`;
  };
  document.querySelectorAll(".leaf-shadows").forEach((el, i) => { el.innerHTML = leaves(17 + i * 31); });

  // ── Clock: City time (updates every minute) ──
  const clockTime = () => new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Rome" }).format(new Date());
  const tick = () => document.querySelectorAll("[data-clock]").forEach((el) => { el.textContent = clockTime(); });
  tick();
  setInterval(tick, 30000);

  const afterLoad = (fn) => (document.readyState === "complete" ? fn() : addEventListener("load", fn, { once: true }));
  window.qsSite.afterLoad = afterLoad;

  // ── First-visit curtain · transition curtain ──
  const COVER = "qs-cover", MENU_NAV = "qs-menu-nav";
  const SMALL = "polygon(25% 75%, 75% 75%, 75% 75%, 25% 75%)";
  const FULL = "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)";
  const COVER_MS = 1600, COVER_AT = 0.85, COVER_EASE = "cubic-bezier(0.9, 0, 0.1, 1)";
  const read = (k) => { try { const v = Number(sessionStorage.getItem(k)); sessionStorage.removeItem(k); return v || 0; } catch { return 0; } };
  const write = (k) => { try { sessionStorage.setItem(k, String(Date.now())); } catch {} };
  const revealed = () => window.dispatchEvent(new Event("page-revealed"));
  const rev = document.querySelector("[data-revealer]");
  const coverAt = read(COVER), menuAt = read(MENU_NAV);
  if (rev && reduced) { rev.hidden = true; requestAnimationFrame(revealed); }
  // Film type is decided right away (the inline script before the first paint sets the same value in advance)
  else if (rev) {
    const mark = rev.querySelector(".page-revealer__mark");
    const menuNav = menuAt && Date.now() - menuAt < 4000;
    const cont = !menuNav && coverAt && Date.now() - coverAt < 5600;
    if (menuNav) { rev.className = "page-revealer page-revealer--menu"; mark.hidden = true; }
    else if (cont) { rev.className = "page-revealer page-revealer--cover"; mark.innerHTML = `<span class="page-revealer__mark--mono">${picto()}</span>`; }
    // On a first visit, wait until the whole screen is attached as in the original, a scene arriving via transition continues right away like the original SPA
    (menuNav || cont ? (fn) => fn() : afterLoad)(() => {
      if (menuNav) {
        // When arriving from the phone menu, the brass panel folds upward as an ellipse
        rev.animate([{ clipPath: "ellipse(150% 160% at 50% 0%)" }, { clipPath: "ellipse(150% 0% at 50% 0%)" }], { duration: 1100, delay: 120, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" })
          .onfinish = () => { rev.hidden = true; revealed(); };
        return;
      }
      let at = 2700;
      if (cont) {
        // Takes over the transition curtain — finishes opening the clip that was opening on the previous page by the remaining amount, clears the drawing, then lifts the curtain upward
        const since = Date.now() - coverAt;
        rev.animate([{ clipPath: SMALL }, { clipPath: FULL }], { duration: COVER_MS, delay: -since, easing: COVER_EASE, fill: "forwards" });
        at = Math.max(60, COVER_AT * COVER_MS - since);
      }
      mark.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-12px)" }], { duration: 450, delay: at, easing: "cubic-bezier(0.55, 0, 1, 0.45)", fill: "forwards" });
      rev.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: 1150, delay: at + 300, easing: "cubic-bezier(0.87, 0, 0.13, 1)", fill: "forwards" })
        .onfinish = () => { rev.hidden = true; revealed(); ScrollTrigger.refresh(); };
    });
  }

  // The transition curtain is built in advance and hidden — so the first frame isn’t late from building the picture at press time
  let coverNode = null;
  const coverEl = () => {
    if (coverNode) return coverNode;
    coverNode = document.createElement("div");
    coverNode.className = "page-revealer page-revealer--cover";
    coverNode.setAttribute("aria-hidden", "true");
    coverNode.hidden = true;
    coverNode.style.clipPath = SMALL;
    coverNode.innerHTML = `<div class="page-revealer__mark"><span class="page-revealer__mark--mono">${picto()}</span></div>`;
    document.body.append(coverNode);
    return coverNode;
  };
  if (!reduced) (window.requestIdleCallback || setTimeout)(coverEl);

  // For links to other pages in the site, a brass curtain opens to the screen over 1.6s from a small square at bottom center and navigates at 85%
  let leaving = false;
  const internal = (a) => a && a.href && a.origin === location.origin && !a.target && /\.html(#.*)?$/.test(a.pathname + a.hash) && a.pathname !== location.pathname;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!internal(a) || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || reduced) return;
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    if (header?.classList.contains("is-open")) {
      // Phone menu links: the text slides up and the page changes after .8s (the next page uses an elliptical fold)
      header.classList.add("is-leaving");
      write(MENU_NAV);
      setTimeout(() => { location.href = a.href; }, 800);
      return;
    }
    const cover = coverEl();
    cover.hidden = false;
    cover.animate([{ clipPath: SMALL }, { clipPath: FULL }], { duration: COVER_MS, easing: COVER_EASE, fill: "forwards" });
    write(COVER);
    setTimeout(() => { location.href = a.href; }, COVER_MS * COVER_AT);
  });
  addEventListener("pageshow", (e) => { if (e.persisted && coverNode) { leaving = false; coverNode.getAnimations().forEach((a) => a.cancel()); coverNode.hidden = true; } });

  // ── Header line ──
  const header = document.querySelector(".site-header");
  if (header) {
    const bar = header.querySelector(".site-header__bar");
    const light = document.body.dataset.header === "light";
    let scrolled = false, hidden = false, open = false, panel = false;
    const paint = () => {
      header.classList.toggle("is-scrolled", scrolled);
      header.classList.toggle("is-arced", scrolled && !panel);
      header.classList.toggle("is-hidden", hidden && !open);
      header.classList.toggle("is-open", open);
      header.classList.toggle("is-panel", panel);
      header.classList.toggle("is-light", light && !scrolled && !panel);
    };
    let last = Math.max(0, scrollY), raf = 0;
    const onScroll = () => {
      raf = 0;
      const y = Math.max(0, scrollY);
      scrolled = y > 80;
      if (!scrolled) hidden = false;
      else if (y > last + 6) hidden = true;
      else if (y < last - 6) hidden = false;
      else return paint();
      last = y;
      paint();
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(onScroll); }, { passive: true });
    onScroll();

    // Per-item position on the arch: horizontal share i, down by 1.12·h·i(1−i) − 1.12·h/8, slope atan(1.12·h(1−2i)/width)
    const arc = () => {
      const w = bar.clientWidth, h = bar.clientHeight / 0.72, wide = innerWidth >= 1200;
      header.querySelectorAll("[data-arc]").forEach((el) => el.removeAttribute("data-arc"));
      const items = [...header.querySelectorAll(".site-header__clock, .site-header__wordmark, .site-header__toggle"), ...(wide ? header.querySelectorAll(".site-header__links li, .site-header__langs li") : [])];
      items.forEach((el) => {
        // Measure from a spot unaffected by transforms — so re-measuring while the arch hangs tilted gives the same value.
        let x = el.offsetLeft, p = el.offsetParent;
        while (p && p !== bar && bar.contains(p)) { x += p.offsetLeft; p = p.offsetParent; }
        if (!el.offsetWidth) return;
        const i = Math.min(1, Math.max(0, (x + el.offsetWidth / 2) / w));
        const rot = (180 * Math.atan((1.12 * h * (1 - 2 * i)) / w)) / Math.PI;
        el.dataset.arc = "";
        el.style.setProperty("--arc-y", `${(1.12 * h * i * (1 - i) - 1.12 * h * 0.125).toFixed(1)}px`);
        el.style.setProperty("--arc-r", `${rot.toFixed(2)}deg`);
      });
    };
    arc();
    document.fonts?.ready.then(arc);
    addEventListener("resize", arc);

    const toggle = header.querySelector(".site-header__toggle");
    let panelTimer = 0, lockTimer = 0;
    const setOpen = (v) => {
      open = v;
      toggle?.setAttribute("aria-expanded", String(v));
      toggle?.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
      clearTimeout(panelTimer); clearTimeout(lockTimer);
      if (v) { panel = true; lenis?.stop(); html.style.overflow = "hidden"; }
      else {
        header.classList.remove("is-leaving");
        lockTimer = setTimeout(() => { lenis?.start(); html.style.overflow = ""; }, 1050);
        panelTimer = setTimeout(() => { panel = false; paint(); }, 1350);
      }
      paint();
    };
    toggle?.addEventListener("click", () => setOpen(!open));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setOpen(false); });
    matchMedia("(min-width: 1200px)").addEventListener("change", (e) => { if (e.matches && open) setOpen(false); });
  }

  // ── Float up on entry: once 10% is visible past the bottom 10% of the screen ──
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-revealed");
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
  document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => io.observe(el));

  // ── Footer pictograms draw when visible ──
  const fp = document.querySelector(".site-footer__picto");
  if (fp) {
    const fio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fp.classList.add("is-drawn"); fio.disconnect(); } }, { threshold: 0.3 });
    fio.observe(fp);
  }
})();
