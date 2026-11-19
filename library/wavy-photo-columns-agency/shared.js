// Common to all pages: draws the header nav, phone menu and footer in one place, with smooth scroll (Lenis 1.3.19, lerp .1) and page transitions (swup 4.8.2 — swaps only .vv-main,
// exit opacity 1→0 .5s power2.in · enter .6s power2.out) · center half-circle logo dropping in (.6s, after .3s) · hide nav past half the Footer · photo cells turn on (after .6s) ·
// Hooks up the brick grid (original packery: cell 33.333%−10px · gap 10 · reflow .8s)·detail photo wall (4 columns, phone 2)·photo zoom (.55s power3.out / close .45s power2.inOut).
// What differs per page lives in VV.pages[name] = { mount, unmount } Takes it in, then detaches and reattaches it each time swup swaps the body content.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const VV = (window.VV = window.VV || {});
  VV.pages = VV.pages || {};
  VV.reduced = reduced;

  const plus = '<svg viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M11 3v16M3 11h16" stroke-width="1.4"/></svg>';
  const burger = '<svg viewBox="0 0 20 12" fill="none" aria-hidden="true"><path d="M0 6h20" stroke-width="1.4"/><path d="M0 6h20" stroke-width="1.4"/></svg>';
  const halfDisc = '<svg viewBox="0 0 44 22" aria-hidden="true"><path d="M0 0h44a22 22 0 0 1-44 0z"/></svg>';
  // Placeholder of three newly drawn letters instead of the original wordmark (thin vertical strokes, dots = a, thick diagonal · body = b) — as in the original, two groups wipe in from opposite sides
  VV.mark = (cls, opt) => `<svg class="vv-mark ${cls}" viewBox="0 0 543 216" data-fx="split-stroke-wipe" data-fx-split-stroke-wipe="${opt}" role="img" aria-label="Studio Name wordmark" data-label="Brand wordmark SVG (two groups: bold strokes and thin strokes)">
    <g data-fx-part="a"><rect x="0" y="0" width="20" height="216"/><rect x="170" y="0" width="20" height="216"/><circle cx="267" cy="28" r="26"/><rect x="353" y="0" width="20" height="216"/><rect x="523" y="0" width="20" height="216"/></g>
    <g data-fx-part="b"><path d="M0 0h66l124 216h-66z"/><rect x="238" y="70" width="58" height="146"/><path d="M353 0h66l124 216h-66z"/></g>
  </svg>`;

  // ───────── Header nav · phone menu ─────────
  const nav = document.querySelector('[data-slot="nav"]');
  if (nav) {
    nav.classList.add("vv-nav");
    nav.innerHTML = `
      <div class="vv-nav__logo-wrap"><a class="vv-nav__logo" href="index.html" aria-label="Home">${halfDisc}</a></div>
      <div class="vv-nav__row">
        <div class="vv-nav__group"><a class="vv-nav__link vv-nav__link--l" href="index.html" data-nav="artists">${plus}<span class="vv-ul">Artists</span></a></div>
        <div class="vv-nav__group vv-nav__group--mid">
          <button class="vv-nav__burger" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="vv-mmenu">${burger}</button>
          <ul class="vv-nav__list">
            <li class="vv-nav__item"><a class="vv-nav__link" href="news.html" data-nav="news"><span class="vv-ul">News</span></a></li>
            <li class="vv-nav__item"><a class="vv-nav__link" href="about.html" data-nav="about"><span class="vv-ul">About</span></a></li>
            <li class="vv-nav__item"><a class="vv-nav__link" href="works.html" data-nav="all"><span class="vv-ul">All</span></a></li>
          </ul>
        </div>
        <div class="vv-nav__group vv-nav__group--end"><a class="vv-nav__link vv-nav__link--r" href="works.html" data-nav="works"><span class="vv-ul">Production</span>${plus}</a></div>
      </div>`;
  }
  const mmenu = document.querySelector('[data-slot="mobile-menu"]');
  if (mmenu) {
    mmenu.classList.add("vv-mmenu");
    mmenu.id = "vv-mmenu";
    mmenu.setAttribute("aria-hidden", "true");
    mmenu.innerHTML = '<ul><li><a href="index.html">Home</a></li><li><a href="news.html">News</a></li><li><a href="about.html">About</a></li><li><a href="about.html#contact">Contact</a></li></ul>';
  }
  const burgerBtn = nav?.querySelector(".vv-nav__burger");
  const closeMenu = () => {
    document.body.classList.remove("is-menu-open");
    burgerBtn?.setAttribute("aria-expanded", "false");
    mmenu?.setAttribute("aria-hidden", "true");
  };
  burgerBtn?.addEventListener("click", () => {
    if (document.body.classList.contains("is-menu-open")) return closeMenu();
    document.body.classList.add("is-menu-open");
    burgerBtn.setAttribute("aria-expanded", "true");
    mmenu?.removeAttribute("aria-hidden");
  });
  mmenu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => { if (!burgerBtn?.contains(e.target) && !mmenu?.contains(e.target)) closeMenu(); });

  // ───────── Footer ─────────
  const people = [
    ["Artist Name 01", 4, "Portrait, upper body · Backlit seaside at dusk · Vertical 3:4"],
    ["Artist Name 02", 2, "Beauty close-up · white background with softbox · portrait"],
    ["Artist Name 03", 3, "Cosmetics still life · pink background · top-down composition"],
    ["Artist Name 04", 4, "Desert fashion editorial · midday direct sun · full-length portrait"],
    ["Artist Name 05", 0, "Behind-the-scenes video of the set · handheld shake · vertical video"],
    ["Artist Name 06", 1, "Sports figure · blue sky · composition shot from below"],
    ["Artist Name 07", 5, "Portrait close-up · yellow lighting · front"],
    ["Artist Name 08", 6, "Hip-hop figure · studio lighting · waist up"],
    ["Artist Name 09", 3, "Black-and-white portrait · Side window light · Portrait"],
  ];
  const footerHTML = () => `
    <div class="vv-foot__inner" data-fx-part="inner">
      <div class="vv-foot__frame">
        <div class="vv-row vv-foot__main">
          <div class="vv-foot__strap t-l" data-label="Four lines of brand identity (name · what we do · promise · invitation)">
            <p><em>Studio</em> is <em>talent management</em>.</p>
            <p><em>Studio</em> is <em>production</em>.</p>
            <p>We make <em>careful</em> work.</p>
            <p>Come <em>build</em> with us.</p>
          </div>
          <div class="vv-foot__links vv-foot__links--people">
            <ul class="vv-foot__list">
              <li><span class="vv-foot__title">Artists</span></li>
              ${people.map(([n, t, label]) => `<li><a class="vv-foot__link vv-ul" href="index.html" data-fx="diagonal-peek-follow" data-fx-diagonal-peek-follow="tint: .vv-foot; gate: .vv-foot; click: keep"${t ? ` data-tint="${t}"` : ""} data-label="Affiliated artist English name">${n}<span class="wf-img${t ? "" : " wf-video"}" data-fx-part="pic" data-label="${label}"></span></a></li>`).join("")}
            </ul>
          </div>
          <div class="vv-foot__links">
            <ul class="vv-foot__list">
              <li><span class="vv-foot__title">Explore</span></li>
              <li><a class="vv-foot__link vv-ul" href="works.html">Production</a></li>
              <li><a class="vv-foot__link vv-ul" href="news.html">News</a></li>
              <li><a class="vv-foot__link vv-ul" href="about.html">About</a></li>
              <li><a class="vv-foot__link vv-ul" href="works.html">All</a></li>
            </ul>
          </div>
          <div class="vv-foot__links">
            <ul class="vv-foot__list">
              <li><span class="vv-foot__title">Contact</span></li>
              <li><a class="vv-foot__link vv-ul" href="about.html#contact">Contact</a></li>
              <li><a class="vv-foot__link vv-ul" href="#" data-label="Social Link">LinkedIn</a></li>
              <li><a class="vv-foot__link vv-ul" href="#" data-label="Social Link">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div class="vv-row vv-foot__bottom">
          <div class="vv-foot__logo">${VV.mark("vv-foot__mark", "start: scroll")}</div>
          <div class="vv-foot__copy">© 2026 Studio Name, All Rights Reserved.</div>
        </div>
      </div>
      <div class="vv-foot__dim" data-fx-part="dim"></div>
    </div>`;
  const drawFooter = (scope) => {
    scope.querySelectorAll('[data-slot="footer"]').forEach((f) => {
      if (f.dataset.drawn) return;
      f.dataset.drawn = "1";
      f.classList.add("vv-foot");
      f.dataset.fx = "slide-under-reveal";
      f.dataset.fxSlideUnderReveal = "pct: -25; dim: .5; start: top bottom; end: top top";
      f.innerHTML = footerHTML();
    });
  };

  // ───────── Smooth scroll ─────────
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.lenis = lenis;
  VV.lenis = lenis;

  // ───────── Photo slot switches on — .6s after entering ─────────
  VV.fade = (scope, sel, threshold = 0.15) => {
    const els = [...scope.querySelectorAll(sel)];
    if (!els.length) return () => {};
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const media = en.target.matches(".vv-media") ? [en.target] : [...en.target.querySelectorAll(".vv-media")];
      media.forEach((m) => setTimeout(() => m.classList.add("is-loaded"), reduced ? 0 : 600));
    }), { threshold });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  };

  // ───────── Brick grid (same role as the original packery: for each cell, the topmost empty slot, leftmost if tied) ─────────
  VV.pack = (grid) => {
    if (!grid) return () => {};
    const items = [...grid.querySelectorAll(".vv-pack__item")];
    const gutter = 10;
    const layout = () => {
      const W = grid.clientWidth;
      const colW = items[0]?.offsetWidth || W;
      const cols = Math.max(1, Math.floor((W + gutter) / (colW + gutter)));
      const heights = new Array(cols).fill(0);
      items.forEach((it) => {
        const k = heights.indexOf(Math.min(...heights));
        const x = k * (colW + gutter);
        it.style.left = `${(x / W) * 100}%`;
        it.style.top = `${heights[k]}px`;
        const cs = getComputedStyle(it);
        heights[k] += it.offsetHeight + parseFloat(cs.marginBottom) + gutter;
      });
      grid.style.height = `${Math.max(0, Math.max(...heights) - gutter)}px`;
      if (!grid.classList.contains("is-packed")) requestAnimationFrame(() => grid.classList.add("is-packed"));
    };
    items.forEach((it) => { it.style.position = "absolute"; });
    layout();
    let t = 0;
    const onResize = () => { clearTimeout(t); t = setTimeout(layout, 120); };
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    items.forEach((it) => ro.observe(it));
    return () => { removeEventListener("resize", onResize); ro.disconnect(); clearTimeout(t); };
  };

  // ───────── Detail photo wall — 4 columns (phone 2), each placed in turn in the shortest column ─────────
  VV.wall = (scope) => {
    const walls = [...scope.querySelectorAll(".vv-wall")];
    if (!walls.length) return () => {};
    const lay = (w) => {
      const items = [...w.querySelectorAll(".vv-wall__item")];
      const cols = innerWidth >= 992 ? 4 : 2, gap = 10;
      const colW = Math.floor((w.offsetWidth - gap * (cols - 1)) / cols);
      const h = new Array(cols).fill(0);
      items.forEach((it) => gsap.set(it, { width: colW }));
      items.forEach((it) => {
        const k = h.indexOf(Math.min(...h));
        gsap.set(it, { x: k * (colW + gap), y: h[k] });
        h[k] += it.offsetHeight + gap;
      });
      w.style.height = `${Math.max(0, Math.max(...h) - gap)}px`;
    };
    const all = () => walls.forEach(lay);
    all();
    let t = 0;
    const onResize = () => { clearTimeout(t); t = setTimeout(all, 120); };
    addEventListener("resize", onResize);
    return () => { removeEventListener("resize", onResize); clearTimeout(t); };
  };

  // ───────── Photo zoom — grows from the pressed slot to the screen center, and returns to place when closed ─────────
  VV.zoom = (scope) => {
    const links = [...scope.querySelectorAll("[data-zoom]")];
    if (!links.length) return () => {};
    const box = document.createElement("div");
    box.className = "vv-zoom";
    box.setAttribute("aria-hidden", "true");
    document.body.append(box);
    const bg = () => getComputedStyle(document.body).backgroundColor;
    const clear = () => bg().replace(/^rgb\(([^)]*)\)$/, "rgba($1, 0)");
    const close = 0.45;
    let pic = null, from = null, current = null, busy = false, isOpen = false;
    const rel = (a, b) => ({ sx: a.width / b.width, sy: a.height / b.height, tx: a.left + a.width / 2 - (b.left + b.width / 2), ty: a.top + a.height / 2 - (b.top + b.height / 2) });
    const open = (link, swap = false) => {
      if (busy || (isOpen && !swap)) return;
      const src = link.querySelector(".vv-media") || link;
      const r = src.getBoundingClientRect();
      busy = true;
      current = link;
      from = { top: r.top + scrollY, left: r.left, width: r.width, height: r.height };
      gsap.set(box, swap ? { display: "flex" } : { display: "flex", backgroundColor: clear() });
      box.setAttribute("aria-hidden", "false");
      document.documentElement.style.cursor = "zoom-out";
      const cs = getComputedStyle(box);
      const aw = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ah = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const ratio = r.width / r.height;
      let w = aw, h = w / ratio;
      if (h > ah) { h = ah; w = h * ratio; }
      pic = document.createElement("div");
      pic.className = "vv-zoom__img";
      pic.style.width = `${w}px`;
      pic.style.height = `${h}px`;
      if (src.dataset.tint) pic.dataset.tint = src.dataset.tint;
      const label = link.querySelector(".wf-img")?.dataset.label || "";
      pic.innerHTML = `<div class="wf-img" data-label="${label}"></div>`;
      box.replaceChildren(pic);
      const k = rel(r, pic.getBoundingClientRect());
      const tl = gsap.timeline({ onComplete: () => { busy = false; isOpen = true; } });
      if (swap) tl.fromTo(pic, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out" }, 0);
      else tl.to(box, { backgroundColor: bg(), duration: 0.3, ease: "none" }, 0)
        .fromTo(pic, { x: k.tx, y: k.ty, scaleX: k.sx, scaleY: k.sy }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.55, ease: "power3.out" }, 0);
    };
    const shut = () => {
      if (!isOpen || busy || !pic) return;
      busy = true;
      document.documentElement.style.cursor = "";
      const r = pic.getBoundingClientRect();
      const x0 = +gsap.getProperty(pic, "x") || 0, y0 = +gsap.getProperty(pic, "y") || 0, sx0 = +gsap.getProperty(pic, "scaleX") || 1, sy0 = +gsap.getProperty(pic, "scaleY") || 1;
      const p = { t: 0 };
      gsap.to(p, {
        t: 1, duration: close, ease: "power2.inOut",
        onUpdate() {
          const k = rel({ top: from.top - scrollY, left: from.left, width: from.width, height: from.height }, r);
          gsap.set(pic, { x: x0 + (k.tx - x0) * p.t, y: y0 + (k.ty - y0) * p.t, scaleX: sx0 + (k.sx - sx0) * p.t, scaleY: sy0 + (k.sy - sy0) * p.t });
        },
        onComplete: () => { gsap.set(box, { display: "none", clearProps: "backgroundColor" }); pic?.remove(); pic = null; box.setAttribute("aria-hidden", "true"); busy = false; isOpen = false; current = null; },
      });
      gsap.to(box, { backgroundColor: clear(), duration: 0.3, ease: "power2.in", delay: 0.4 * close });
    };
    const step = (d) => {
      if (!isOpen || busy || links.length < 2) return;
      const i = links.indexOf(current);
      const nxt = links[(i + d + links.length) % links.length];
      busy = true;
      gsap.to(pic, { opacity: 0, duration: 0.2, ease: "power1.in", onComplete: () => { pic?.remove(); busy = false; isOpen = false; open(nxt, true); } });
    };
    const onClick = (e) => {
      if (isOpen) { if (e.target === box || e.target.closest(".vv-zoom__img")) shut(); return; }
      const l = e.target.closest("[data-zoom]");
      if (l && links.includes(l)) { e.preventDefault(); open(l); }
    };
    const onKey = (e) => { if (e.key === "Escape") shut(); else if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1); };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); gsap.killTweensOf(box); box.remove(); document.documentElement.style.cursor = ""; };
  };

  // ───────── Standalone photo in about · detail — like the original, each time it opens it picks left, center or right and a width (40~80%) ─────────
  VV.solo = (scope) => {
    const wrap = scope.querySelector(".vv-blocks");
    if (!wrap) return;
    const m = { left: ["0", "auto"], centre: ["auto", "auto"], right: ["auto", "0"] };
    const sides = ["left", "centre", "right"];
    const span = (s, w) => (s === "left" ? [0, w] : s === "right" ? [100 - w, 100] : [(100 - w) / 2, (100 + w) / 2]);
    const minW = (s, a, b) => (s === "left" ? a + 10 : s === "right" ? 100 - b + 10 : Math.max(2 * a - 100, 100 - 2 * b) + 20);
    let last = null, prev = null;
    [...wrap.children].forEach((blk) => {
      if (!blk.classList.contains("vv-block--media")) return;
      const afterText = blk.previousElementSibling?.classList.contains("vv-block--text");
      const pool = sides.filter((s) => s !== last);
      const side = last === null ? "left" : afterText ? "right" : pool[Math.floor(Math.random() * pool.length)];
      if (afterText) prev = null;
      const lo = prev ? Math.max(40, Math.ceil(minW(side, prev[0], prev[1]))) : 40;
      const media = blk.querySelector(".vv-media");
      const [rw, rh] = (media?.style.aspectRatio || "1 / 1").split("/").map(Number);
      const hi = rh >= rw && lo <= 60 ? 60 : 80;
      const w = Math.round(lo + Math.random() * (hi - lo));
      blk.classList.add("is-solo");
      blk.style.setProperty("--solo-width", `${w}%`);
      blk.style.setProperty("--solo-ml", m[side][0]);
      blk.style.setProperty("--solo-mr", m[side][1]);
      last = side;
      prev = span(side, w);
    });
  };

  // ───────── Attaching and detaching pages ─────────
  let unmount = null;
  const mainEl = () => document.querySelector(".vv-main");
  const pageName = () => mainEl()?.dataset.page || "home";
  const setActive = () => {
    const p = pageName();
    nav?.querySelectorAll("[data-nav]").forEach((a) => {
      const k = a.dataset.nav;
      a.classList.toggle("is-active", k === p || (k === "news" && p === "detail"));
    });
  };
  const logoWrap = nav?.querySelector(".vv-nav__logo-wrap");
  const moveLogo = () => {
    if (!logoWrap) return;
    if (pageName() === "home") return gsap.to(logoWrap, { top: -100, duration: 0.6, ease: "power2.in" });
    const from = gsap.getProperty(logoWrap, "top");
    logoWrap.style.top = "auto";
    const to = logoWrap.offsetTop;
    gsap.set(logoWrap, { top: from });
    gsap.to(logoWrap, { top: to, duration: 0.6, delay: 0.3, ease: "power2.out" });
  };
  let footST = null;
  const view = () => {
    const main = mainEl();
    if (!main) return;
    drawFooter(main);
    lenis?.start();
    lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
    setActive();
    gsap.to(main, { opacity: 1, duration: 0.4, ease: "power2.out" });
    moveLogo();
    const page = VV.pages[pageName()];
    const own = page?.mount?.(main);
    const commons = [VV.fade(main, ".vv-pack__item", 0.15), VV.fade(main, ".vv-block .vv-media, .vv-wall__item .vv-media", 0)];
    unmount = () => { own?.(); commons.forEach((f) => f()); footST?.kill(); footST = null; };
    gsap.delayedCall(0.5, () => {
      lenis?.resize();
      const foot = main.querySelector(".vv-foot");
      if (foot) footST = ScrollTrigger.create({
        trigger: foot, start: "top bottom", end: "top top", invalidateOnRefresh: true,
        onUpdate: (s) => document.documentElement.classList.toggle("is-nav-hidden", s.progress > 0.5),
      });
      ScrollTrigger.refresh();
    });
  };
  const leave = () => {
    [...document.documentElement.classList].filter((c) => c.startsWith("is-") && c !== "is-changing" && c !== "is-animating").forEach((c) => document.documentElement.classList.remove(c));
    unmount?.();
    unmount = null;
    ScrollTrigger.getAll().forEach((t) => { if (!t.vars?.trigger?.closest?.("[data-fx]")) t.kill(); });
    document.body.classList.remove("is-menu-open");
  };

  // ───────── Page turn (swup) ─────────
  const boot = () => {
    view();
    if (!/^https?:$/.test(location.protocol) || !window.Swup) return;
    const plugins = [];
    if (window.SwupPreloadPlugin) plugins.push(new SwupPreloadPlugin({ preloadHoveredLinks: true, preloadVisibleLinks: true }));
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ awaitAssets: true, persistAssets: false, persistTags: false }));
    const swup = new Swup({ containers: [".vv-main"], animationSelector: false, cache: true, native: false, ignoreVisit: (url, { el } = {}) => !!el?.closest("[data-no-swup]") || /^#/.test(el?.getAttribute?.("href") || ""), plugins });
    VV.swup = swup;
    swup.hooks.on("visit:start", () => { closeMenu(); lenis?.stop(); });
    swup.hooks.before("animation:out:await", async () => { await gsap.to(".vv-main", { opacity: 0, duration: 0.5, ease: "power2.in" }); });
    swup.hooks.before("content:replace", leave);
    swup.hooks.on("content:replace", () => { lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0); gsap.set(".vv-main", { opacity: 0 }); });
    swup.hooks.on("animation:in:start", () => { gsap.to(".vv-main", { opacity: 1, duration: 0.6, ease: "power2.out", clearProps: "opacity" }); });
    swup.hooks.on("page:view", view);
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot, { once: true }) : boot();
})();
