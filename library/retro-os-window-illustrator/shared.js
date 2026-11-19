// Common to all pages: outer border · loader · top-right theme button and clock · header menu · phone menu · scroll bar · OS window drag and lens · sticker springs · section title letter shuffle · footer GL · 1:09 window · page turn.
// Original values: loader progress lerp .09 per frame → when full, a .1s blink → after .6s the border goes from the loader box to full screen over 1.4s power4.out (body 1.3x→1),
// Window entrance .8x→1 .12s power4.out stagger .15s, text scramble 120ms per character (menu 70ms) one cell every 60ms, sticker spring .18 damping .3.
// Page turns use the same swup 4.6.1 as the original (+preload·head·a11y·fragment plugins) — only #swup is swapped with 1ms opacity, and work list↔work window uses a fragment turn.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const IC = (window.IC = window.IC || {});
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  IC.reduced = reduced;
  IC.isSp = () => matchMedia("(max-width: 768px)").matches;
  IC.isTouch = () => matchMedia("not all and (hover: hover) and (pointer: fine)").matches;
  CustomEase.create("icExpo", "0.16,1,0.3,1");
  const ARROW = '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M0 5.4h9.3L5.6 1.7l.85-.85L11.6 6l-5.15 5.15-.85-.85 3.7-3.7H0z"/></svg>';
  IC.ARROW = ARROW;
  const pill = (label, { invert = true, out = true, href = "#" } = {}) =>
    `<a href="${href}" class="ic-pill" data-invert="${invert}"${out ? ' target="_blank" rel="noreferrer"' : ""}><span class="ic-pill__inner">${label}<span class="ic-arrow">${ARROW}</span></span></a>`;
  IC.pill = pill;

  // ───── Mouse — position and velocity within 100ms (used by the stickers and the rabbit) ─────
  const mouse = (IC.mouse = { x: innerWidth / 2, y: innerHeight / 2, vx: 0, vy: 0, touched: false });
  let mt = 0;
  const move = (e) => {
    const p = e.touches ? e.touches[0] : e;
    mouse.vx = p.clientX - mouse.x; mouse.vy = p.clientY - mouse.y;
    mouse.x = p.clientX; mouse.y = p.clientY;
    clearTimeout(mt); mt = setTimeout(() => { mouse.vx = 0; mouse.vy = 0; }, 100);
  };
  addEventListener("mousemove", move);
  addEventListener("touchmove", move, { passive: true });
  addEventListener("touchstart", (e) => { mouse.touched = true; mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchend", () => (mouse.touched = false));
  document.addEventListener("mouseleave", () => { mouse.vx = 0; mouse.vy = 0; });

  // ───── Text scramble — text mixed with symbols resolves, growing one character every 60ms ─────
  const GLYPHS = "~!@$%^&*()-+=[]{}<>?";
  IC.shuffle = (el, { duration = 120, random = false } = {}) => {
    if (!el) return () => {};
    const text = el.dataset.text || el.textContent;
    el.dataset.text = text;
    if (reduced) { el.textContent = text; el.style.opacity = 1; return () => {}; }
    const order = [...text].map((_, i) => (random ? Math.random() : i / text.length));
    const t0 = performance.now();
    let shown = 0;
    el.style.opacity = 0;
    const grow = setInterval(() => (shown >= text.length ? clearInterval(grow) : shown++), 60);
    const draw = setInterval(() => {
      const p = (performance.now() - t0) / (text.length * duration);
      let s = "";
      if (p > 1) { s = text; clearInterval(draw); }
      else for (let i = 0; i < text.length; i++) s += p >= order[i] ? text[i] : text[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.textContent = s.slice(0, shown + 1);
      el.style.opacity = 1;
    }, 60);
    return () => { clearInterval(grow); clearInterval(draw); el.textContent = text; };
  };

  // ───── Theme ─────
  const setTheme = (t) => { root.setAttribute("data-theme", t); sessionStorage.setItem("ic-theme", t); dispatchEvent(new CustomEvent("ic:theme")); };
  const saved = sessionStorage.getItem("ic-theme");
  if (saved) root.setAttribute("data-theme", saved);
  else if (matchMedia("(prefers-color-scheme: dark)").matches) root.setAttribute("data-theme", "dark");

  // ───── Frame drawing ─────
  const NAV = [["index", "index.html", "home"], ["works", "works.html", "Works"], ["about", "about.html", "Profile"], ["contact", "contact.html", "Contact"]];
  const SNS = [["Twitter", "#"], ["Instagram", "#"]];
  const LOGO = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="36" height="36" rx="3"/><path d="M10 12v16M16 12v16M22 12h8v16h-8M22 20h8" stroke-linecap="square"/></svg>';
  const pageName = () => document.getElementById("swup")?.dataset.page || "index";
  const navKey = (p) => (p === "detail" ? "works" : p);

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "ic-header";
    head.innerHTML = `<a href="index.html" class="ic-logo" aria-label="Home" data-label="Logo symbol">${LOGO}</a>
      <nav class="ic-menu" aria-label="Main menu"><ul class="ic-menu__list">${NAV.map(([k, h, t]) => `<li class="ic-menu__item" data-id="${k}"><a href="${h}" class="ic-menu__link">${t}</a></li>`).join("")}</ul><div class="ic-menu__current"></div></nav>
      <ul class="ic-sns" data-slot="header-sns">${SNS.map(([t, h]) => `<li>${pill(t, { href: h })}</li>`).join("")}</ul>`;
  }
  document.body.insertAdjacentHTML("afterbegin", `
    <div class="ic-frame" aria-hidden="true"><svg><path class="ic-frame__bg" fill-rule="evenodd"/><rect class="ic-frame__border"/></svg></div>
    <div class="ic-righttop" data-slot="theme-clock"><div class="ic-theme"><button type="button" data-color="light" aria-label="To a Bright Screen"></button><button type="button" data-color="dark" aria-label="Switch to dark mode"></button></div><p class="ic-clock">0<span class="ic-clock__colon">:</span>00</p></div>
    <button class="ic-burger" type="button" aria-expanded="false" aria-controls="ic-drawer" aria-label="Menu"><span></span><span></span><span></span></button>
    <div class="ic-drawer" id="ic-drawer" aria-hidden="true" data-slot="mobile-menu">
      <ul>${NAV.map(([, h, t]) => `<li><a href="${h}" data-drawer-link>${t}</a></li>`).join("")}</ul>
      <div class="ic-drawer__line"><span class="ic-dash"></span></div>
      <ul class="ic-drawer__sns">${SNS.map(([t, h]) => `<li><a href="${h}" target="_blank" rel="noreferrer" data-drawer-link>${t}</a></li>`).join("")}</ul>
    </div>`);
  document.body.insertAdjacentHTML("beforeend", `<div class="ic-scrollbar" aria-hidden="true"><div class="ic-scrollbar__thumb"></div></div><div class="ic-at109" style="display:none"></div>`);
  document.querySelectorAll(".ic-theme button").forEach((b) => b.addEventListener("click", () => setTheme(b.dataset.color)));

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "ic-footer";
    foot.innerHTML = `<div class="ic-footer__inner">
        <div class="ic-footer__grid"><div class="ic-grid" data-grid="outline" data-common></div></div>
        <ul class="ic-footer__sns">${["Twitter", "Instagram", "Shop"].map((t) => `<li><a href="#" class="ic-ul">${t}</a></li>`).join("")}</ul>
        <div class="ic-footer__right">
          <p class="ic-footer__credit">Web: <a href="#" class="ic-ul">@credit_name</a><br>3D(model 01): <a href="#" class="ic-ul">@credit_name</a><br>3D(model 02): <a href="#" class="ic-ul">@credit_name</a><br>---</p>
          <div class="ic-footer__barcode"><span class="ic-barcode" aria-hidden="true">footer</span></div>
          <p class="ic-footer__copy">(c) Studio Name</p>
        </div>
        <div class="ic-footer__holo" data-slot="footer-holo"></div>
      </div>
      <div class="ic-footer__figure" data-slot="footer-figure" data-label="Rotating 3D figure — twin-tail hair, wide sleeves · standing at screen center"></div>`;
  }

  // ───── Outer border — the background band is punched out with an even-odd fill path ─────
  const frameSvg = document.querySelector(".ic-frame svg");
  const frameBg = frameSvg.querySelector(".ic-frame__bg");
  const frameBorder = frameSvg.querySelector(".ic-frame__border");
  const pad = () => (IC.isSp() ? 15 : 20);
  const hole = { x: 20, y: 20, w: 100, h: 100 };
  const rr = (x, y, w, h, r) => `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`;
  const drawFrame = () => {
    const W = innerWidth, H = innerHeight, r = IC.isSp() ? 6 : 8;
    frameSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const h = Math.max(hole.h, 2 * r), w = Math.max(hole.w, 2 * r);
    frameBg.setAttribute("d", `M0,0H${W}V${H}H0Z ${rr(hole.x, hole.y, w, h, r)}`);
    Object.entries({ x: hole.x, y: hole.y, width: w, height: h, rx: r }).forEach(([k, v]) => frameBorder.setAttribute(k, v));
  };
  let menuOpen = false;
  const drawer = document.getElementById("ic-drawer");
  const fullHole = () => ({ x: pad(), y: pad(), w: innerWidth - pad() * 2, h: menuOpen ? innerHeight - 15 - drawer.clientHeight : innerHeight - pad() * 2 });
  Object.assign(hole, fullHole());
  drawFrame();
  let opEnd = false;
  addEventListener("resize", () => { if (opEnd || !IC.loaderOn) { Object.assign(hole, fullHole()); drawFrame(); } });

  // ───── Loader ─────
  const opQueue = [];
  IC.onOpenEnd = (fn) => (opEnd ? fn() : opQueue.push(fn));
  const finishOpen = () => { opEnd = true; root.classList.add("is-op-end"); opQueue.splice(0).forEach((f) => f()); dispatchEvent(new CustomEvent("ic:openingend")); };
  IC.ready = { count: 1, done: 0 };
  const runLoader = () => {
    const isHome = pageName() === "index";
    IC.loaderOn = true;
    document.body.classList.add("is-loading");
    document.body.insertAdjacentHTML("beforeend", `<div class="ic-loading" data-slot="loader"><div class="ic-loading__main"><p class="ic-loading__text"><span>loading...</span><span class="ic-loading__pct">0%</span></p><div class="ic-loading__bar"></div></div><div class="ic-loading__links">${SNS.map(([t, h]) => pill(t, { invert: false, href: h })).join("")}</div></div>`);
    const loading = document.querySelector(".ic-loading"), box = loading.querySelector(".ic-loading__main"), pct = loading.querySelector(".ic-loading__pct");
    const frame = document.querySelector(".ic-frame"), wrapper = document.querySelector(".ic-wrapper");
    const target = isHome ? document.querySelector('[data-slot="hero"]') : document.getElementById("swup");
    const images = isHome ? document.querySelector(".ic-kv__images") : null;
    const tl = gsap.timeline({ paused: true });
    const startHole = () => { const bw = box.offsetWidth, bh = box.offsetHeight; return { x: (innerWidth - bw) / 2, y: (innerHeight - bh) / 2, w: bw, h: bh }; };
    const s0 = startHole();
    Object.assign(hole, s0); drawFrame();
    tl.fromTo(hole, s0, { ...fullHole(), duration: 1.4, ease: "power4.out", onUpdate: drawFrame, onStart: () => { loading.style.opacity = 0; frame.style.opacity = 1; wrapper.style.opacity = 1; } }, "+=0.6");
    if (target) tl.from(target, { scale: 1.3, duration: 1.4, ease: "power4.out", force3D: true, onComplete: () => requestAnimationFrame(() => gsap.set(target, { clearProps: "transform" })) }, "<");
    if (images) tl.from(images, { scale: 1.2, duration: 1.4, ease: "power4.out" }, "<");
    tl.to({}, { duration: 0.001, onStart: () => { finishOpen(); loading.remove(); document.body.classList.remove("is-loading"); IC.loaderOn = false; } }, ">-=0.4");
    let g = 0;
    const step = () => {
      const goal = IC.ready.done / IC.ready.count;
      g += (goal - g) * 0.09;
      box.style.setProperty("--_progress", g);
      pct.textContent = `${Math.round(g * 100)}%`;
      if (g > 0.999) { loading.setAttribute("data-complete", "true"); gsap.ticker.remove(step); tl.play(); }
    };
    gsap.ticker.add(step);
  };
  IC.markReady = () => { IC.ready.done = Math.min(IC.ready.count, IC.ready.done + 1); };

  // ───── Header menu current state ─────
  const menu = document.querySelector(".ic-menu");
  const placeCurrent = () => {
    if (!menu) return;
    const item = menu.querySelector(`.ic-menu__item[data-id="${navKey(pageName())}"]`);
    const cur = menu.querySelector(".ic-menu__current");
    if (!item) { cur.style.width = "0px"; return; }
    const a = item.getBoundingClientRect(), b = menu.getBoundingClientRect();
    cur.style.width = `${a.width}px`; cur.style.height = `${a.height}px`;
    cur.style.transform = `translate3d(${a.left - b.left}px, ${a.top - b.top - 1}px, 0)`;
  };
  addEventListener("resize", placeCurrent);
  document.fonts?.ready.then(placeCurrent);

  // ───── Phone menu ─────
  const burger = document.querySelector(".ic-burger");
  const drawerLinks = [...drawer.querySelectorAll("[data-drawer-link]")];
  let linkStops = [], serviceWas = false;
  const setHoleH = (h) => gsap.to(hole, { h, duration: 0.4, ease: "icExpo", onUpdate: drawFrame, overwrite: true });
  const closeMenu = () => {
    menuOpen = false; root.removeAttribute("data-menu-open");
    burger.setAttribute("aria-expanded", "false"); drawer.setAttribute("aria-hidden", "true");
    setHoleH(innerHeight - 15 * 2);
    if (serviceWas) root.setAttribute("data-service", "true");
    serviceWas = false;
    linkStops.forEach((f) => f()); linkStops = [];
  };
  const openMenu = () => {
    menuOpen = true; root.setAttribute("data-menu-open", "true");
    burger.setAttribute("aria-expanded", "true"); drawer.setAttribute("aria-hidden", "false");
    setHoleH(innerHeight - 15 - drawer.clientHeight);
    if (root.getAttribute("data-service") === "true") { root.setAttribute("data-service", "false"); serviceWas = true; }
    linkStops = drawerLinks.map((a) => IC.shuffle(a, { duration: 70 }));
  };
  burger.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
  drawerLinks.forEach((a) => a.addEventListener("click", closeMenu));

  // ───── Scroll bar — drag the handle or press the track to advance 200px at a time ─────
  const bar = document.querySelector(".ic-scrollbar"), thumb = bar.querySelector(".ic-scrollbar__thumb");
  let thumbLen = 40, maxScroll = 1, grab = null, stepT = 0, stepI = 0;
  const sizeBar = () => {
    const vh = innerHeight, sh = document.documentElement.scrollHeight;
    const ratio = vh / sh;
    bar.style.visibility = ratio < 1 ? "" : "hidden";
    thumbLen = Math.max(ratio * vh, 40);
    maxScroll = Math.max(1, sh - vh);
    thumb.style.height = `${thumbLen}px`;
  };
  const toScroll = (clientY) => {
    const track = bar.clientHeight, off = innerHeight - track;
    const a = off * 0.5 + thumbLen * 0.5, b = innerHeight - thumbLen * 0.5 - off * 0.5;
    return gsap.utils.clamp(0, maxScroll, ((clientY - a) / (b - a)) * maxScroll);
  };
  const barTick = () => {
    const track = bar.clientHeight;
    thumb.style.transform = `translate3d(0, ${gsap.utils.clamp(0, track - thumbLen, (scrollY / maxScroll) * (track - thumbLen))}px, 0)`;
  };
  new ResizeObserver(() => { sizeBar(); barTick(); }).observe(document.body);
  addEventListener("scroll", barTick, { passive: true });
  const dragMove = (e) => scrollTo(0, toScroll((e.touches ? e.touches[0] : e).clientY - grab));
  bar.addEventListener("mousedown", (e) => {
    document.body.style.userSelect = "none";
    if (e.target === thumb) {
      const r = thumb.getBoundingClientRect(); grab = e.clientY - (r.top + r.height / 2);
      addEventListener("mousemove", dragMove);
    } else {
      const goal = toScroll(e.clientY);
      const near = () => { const n = scrollY + Math.sign(goal - scrollY) * 200; if (Math.abs(goal - n) >= 200) scrollTo(0, n); };
      near(); stepT = setTimeout(() => (stepI = setInterval(near, 20)), 200);
    }
  });
  addEventListener("mouseup", () => { removeEventListener("mousemove", dragMove); clearTimeout(stepT); clearInterval(stepI); document.body.style.userSelect = ""; });

  // ───── OS window drag — grab the title bar and drag to move it with matrix. The pressed window goes to the top of its group ─────
  const zTop = {};
  IC.drag = (el, { handle, group = "kv", onUpdate = () => {}, onDown = () => {}, dynamic = false } = {}) => {
    const h = handle || el;
    let start = { x: 0, y: 0 }, off = { x: 0, y: 0 }, m = [1, 0, 0, 1, 0, 0], hover = false;
    const measure = () => { const r = el.getBoundingClientRect(); start = { x: r.left - m[4], y: r.top - m[5] + scrollY }; onUpdate({ x: m[4] + start.x, y: m[5] + start.y }); };
    const tf = getComputedStyle(el).transform;
    if (tf && tf !== "none") m = tf.split("(")[1].split(")")[0].split(",").map(Number);
    { const r = el.getBoundingClientRect(); start = { x: r.left, y: r.top + scrollY }; }
    zTop[group] = Math.max(zTop[group] || 0, Number(getComputedStyle(el).zIndex) || 0);
    if (dynamic) { zTop[group] += 1; el.style.zIndex = zTop[group]; }
    const off_ = () => IC.isSp();
    const enter = (e) => { if (off_() || !h.contains(e.target)) return; hover = true; document.body.style.cursor = "grab"; };
    const leave = () => { hover = false; document.body.style.cursor = ""; };
    const mv = (e) => { const x = e.clientX - off.x, y = e.clientY - off.y; m[4] = x - start.x; m[5] = y - start.y; el.style.transform = `matrix(${m.join(",")})`; onUpdate({ x, y }); };
    const down = (e) => {
      if (off_()) return;
      zTop[group] += 1; el.style.zIndex = zTop[group]; onDown();
      if (!h.contains(e.target) || e.target.closest("button,a")) return;
      const r = el.getBoundingClientRect(); off = { x: e.clientX - r.left, y: e.clientY - r.top - scrollY };
      document.body.style.userSelect = "none"; document.body.style.cursor = "grabbing";
      addEventListener("mousemove", mv);
    };
    const up = () => { removeEventListener("mousemove", mv); if (off_()) return; document.body.style.userSelect = ""; document.body.style.cursor = hover ? "grab" : ""; };
    el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); el.addEventListener("mousedown", down);
    addEventListener("mouseup", up); addEventListener("resize", measure); addEventListener("ic:openingend", measure);
    return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); el.removeEventListener("mousedown", down); removeEventListener("mouseup", up); removeEventListener("mousemove", mv); removeEventListener("resize", measure); removeEventListener("ic:openingend", measure); el.style.transform = ""; };
  };
  // Lens — pushes the panel inside the window body backward by the window’s position, so even when the window is dragged the picture inside stays fixed at its screen position (±10px offset)
  IC.lens = (el, body) => {
    const headEl = el.querySelector(".ic-win__head");
    const shift = { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20 };
    const r = el.getBoundingClientRect();
    const cur = { x: r.left, y: r.top + scrollY };
    const update = (p) => {
      if (p) Object.assign(cur, p);
      const po = parseFloat(getComputedStyle(root).getPropertyValue("--ic-pad-out")) || 20;
      body.style.transform = `translate3d(${-cur.x + shift.x - po}px, ${-cur.y + shift.y - po - headEl.clientHeight}px, 0)`;
    };
    update();
    return update;
  };

  // Sticker — when the mouse moves within the sticker width it is pushed at that speed and springs back into place
  IC.sticker = (el) => {
    const o = { x: 0, y: 0 }, p = { x: 0, y: 0 }, v = { x: 0, y: 0 };
    let w = 0, active = false;
    const setup = () => { const r = el.getBoundingClientRect(); const tx = p.x - o.x, ty = p.y - o.y; o.x = r.left + r.width / 2 + scrollX - tx; o.y = r.top + r.height / 2 + scrollY - ty; p.x = o.x; p.y = o.y; w = r.width; };
    setup();
    const io = new IntersectionObserver((es) => es.forEach((e) => (active = e.isIntersecting)));
    io.observe(el);
    const tick = () => {
      if (IC.isTouch() || !active || reduced) return;
      const mx = mouse.x + scrollX, my = mouse.y + scrollY;
      let fx = 0, fy = 0;
      if (Math.hypot(p.x - mx, p.y - my) < w && (mouse.vx || mouse.vy)) { fx = mouse.vx; fy = mouse.vy; }
      v.x = (v.x + (o.x - p.x) * 0.18 + fx) * 0.3; v.y = (v.y + (o.y - p.y) * 0.18 + fy) * 0.3;
      p.x += v.x; p.y += v.y;
      el.style.transform = `translate3d(${p.x - o.x}px, ${p.y - o.y}px, 0)`;
    };
    gsap.ticker.add(tick);
    addEventListener("resize", setup); addEventListener("ic:openingend", setup);
    return () => { gsap.ticker.remove(tick); io.disconnect(); removeEventListener("resize", setup); removeEventListener("ic:openingend", setup); };
  };

  // WebGL panels are built when they come near the screen (one screen ahead) — building several panels at once at the moment of a page flip drops frames
  IC.whenNear = (el, make, margin = "100% 0px") => {
    let off = null;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); off = make(); } }, { rootMargin: margin });
    io.observe(el);
    return () => { io.disconnect(); off?.(); };
  };

  // ───── Attach and detach in-page devices ─────
  const pages = {};
  IC.page = (name, init) => (pages[name] = init);
  let cleanups = [];
  const keep = (f) => f && cleanups.push(f);
  const mountCommon = (scope) => {
    // Diagonal dotted X
    scope.querySelectorAll(".ic-cross").forEach((el) => {
      const set = () => { const w = el.clientWidth, h = el.clientHeight; el.style.setProperty("--length", Math.hypot(w, h)); el.style.setProperty("--angle", (Math.atan2(h, w) * 180) / Math.PI); };
      set(); addEventListener("resize", set); keep(() => removeEventListener("resize", set));
    });
    scope.querySelectorAll(".ic-grid:not([data-common])").forEach((el) => keep(IC.whenNear(el, () => IC.grid(el, { outline: el.dataset.grid === "outline" }))));
    scope.querySelectorAll("[data-sticker]").forEach((el) => keep(IC.sticker(el)));
    // Pressing the close X makes the window blink for .5s (the work window really closes)
    scope.querySelectorAll(".ic-win").forEach((w) => {
      if (w.closest("[data-post]")) return;
      const x = w.querySelector(".ic-win__close");
      if (!x) return;
      const f = () => { w.setAttribute("data-blink", "true"); setTimeout(() => w.removeAttribute("data-blink"), 500); };
      x.addEventListener("click", f); keep(() => x.removeEventListener("click", f));
    });
  };
  const headingIO = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      IC.shuffle(e.target.querySelector(".ic-heading__main"));
      IC.shuffle(e.target.querySelector(".ic-heading__barcode span"), { random: true });
      io.unobserve(e.target);
    }));
    document.querySelectorAll("#swup .ic-heading").forEach((h) => io.observe(h));
    return () => io.disconnect();
  };
  let stopHeadings = () => {};
  const mountPage = (initial) => {
    const scope = document.getElementById("swup") || document.body;
    mountCommon(scope);
    const init = pages[pageName()];
    if (init) keep(init({ initial, scope }));
    placeCurrent();
  };
  const unmountPage = () => { cleanups.splice(0).forEach((f) => { try { f(); } catch (e) { /* Even if detaching fails, the next page still attaches */ } }); ScrollTrigger.getAll().forEach((t) => t.kill()); stopHeadings(); };

  // ───── 1:09 window ─────
  const at = document.querySelector(".ic-at109");
  let atOn = false, atI = 0, atN = 0;
  setInterval(() => {
    const d = new Date();
    if (d.getHours() === 1 && d.getMinutes() === 9) {
      at.style.display = "";
      if (atOn) return;
      atOn = true;
      atI = setInterval(() => {
        if (atN > 80) return clearInterval(atI);
        at.insertAdjacentHTML("beforeend", `<div class="ic-win-wrap" style="top:${Math.random() * 100}vh;left:${Math.random() * 100}vw"><div class="ic-win"><div class="ic-win__inner"><div class="ic-win__head"><h2 class="ic-win__title">at_0-00.txt</h2><button class="ic-win__close" type="button" aria-label="Close"><i></i></button></div><div class="ic-win__body"><p>0:00</p></div></div></div></div>`);
        atN++;
      }, 200);
    } else if (atOn || at.children.length) { at.innerHTML = ""; at.style.display = "none"; atOn = false; atN = 0; clearInterval(atI); }
  }, 1000);

  // ───── Start ─────
  const footGrid = document.querySelector(".ic-grid[data-common]");
  const boot = () => {
    if (footGrid && window.THREE) IC.grid(footGrid, { outline: true });
    if (window.THREE) {
      const holo = document.querySelector('[data-slot="footer-holo"]'), fig = document.querySelector('[data-slot="footer-figure"]');
      if (holo) IC.holo(holo);
      if (fig) IC.figure(fig);
    }
    mountPage(true);
    IC.markReady();
    if (reduced || document.body.hasAttribute("data-no-loader")) { root.classList.add("no-loader"); finishOpen(); }
    else runLoader();
    stopHeadings = headingIO();
    bootSwup();
  };

  let swup = null;
  const bootSwup = () => {
    if (!/^https?:$/.test(location.protocol) || !window.Swup) return;
    const plugins = [];
    if (window.SwupA11yPlugin) plugins.push(new SwupA11yPlugin({ respectReducedMotion: false }));
    if (window.SwupPreloadPlugin) plugins.push(new SwupPreloadPlugin({ preloadVisibleLinks: true }));
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({}));
    if (window.SwupFragmentPlugin) plugins.push(new SwupFragmentPlugin({ rules: [
      { from: /works\.html(\?.*)?$/, to: /detail\.html$/, containers: ["#ic-posts"], name: "open-post" },
      { from: /detail\.html$/, to: /works\.html(\?.*)?$/, containers: ["#ic-posts"], name: "close-post" },
    ] }));
    swup = new Swup({ containers: ["#swup"], animationSelector: "#swup", animateHistoryBrowsing: true, plugins });
    IC.swup = swup;
    let back = 0, last = 0;
    swup.hooks.on("visit:start", (v) => { back = v.history.popstate ? last : 0; last = scrollY; if (closeMenu && menuOpen) closeMenu(); unmountPage(); });
    swup.hooks.on("page:view", (v) => {
      if (!v.fragmentVisit) scrollTo(0, back);
      mountPage(false);
      ScrollTrigger.refresh();
    });
    swup.hooks.on("animation:in:start", (v) => { if (!v.fragmentVisit) stopHeadings = headingIO(); });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
