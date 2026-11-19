/* Shared behavior for the whole site — Lenis 1.3.23 (lerp .1), the four original curves (CustomEase), cursor coordinates (quickTo .8 power2.out),
   Diagonal text reveal, hidden grid cursor mask, cursor label, header wordmark collapse, bottom menu bar, loader, contact strip, diagonal page transition (swup 4.8.2). */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverMQ = matchMedia("(hover: hover) and (pointer: fine)");
  const isDesk = () => innerWidth >= 1024;
  const unit = () => innerWidth / (isDesk() ? 1440 : 390);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  gsap.registerPlugin(ScrollTrigger, CustomEase, ScrambleTextPlugin, DrawSVGPlugin);
  CustomEase.create("ease4", "0.47, 0.16, 0.24, 1");
  CustomEase.create("easeOut1", "0.16, 1, 0.3, 1");
  CustomEase.create("easeInOut2", "0.52, -0.16, 0, 0.99");
  CustomEase.create("easeInOut4", "0.77, 0, 0, 0.99");

  const TB = (window.TB = { pages: {}, reduce, isDesk, unit, wait, hoverMQ });

  // ───── Smooth scroll ─────
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: false });
  window.lenis = TB.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ───── Cursor coordinates — like the original shared state, the real value plus a value that follows .8 seconds late ─────
  const pointer = (TB.pointer = { mouse: { x: 0, y: 0 }, animated: { x: 0, y: 0 } });
  const qx = gsap.quickTo(pointer.animated, "x", { duration: 0.8, ease: "power2.out" });
  const qy = gsap.quickTo(pointer.animated, "y", { duration: 0.8, ease: "power2.out" });
  addEventListener("pointermove", (e) => { pointer.mouse.x = e.clientX; pointer.mouse.y = e.clientY; qx(e.clientX); qy(e.clientY); }, { passive: true });

  // ───── Diagonal text entrance ─────
  const stWrap = (el) => {
    if (el.dataset.stReady) return;
    const text = el.textContent.replace(/\s+/g, " ").trim();
    const len = Math.max(1, [...text].length);
    el.dataset.stReady = "1";
    el.classList.add("tb-st");
    el.style.setProperty("--length", len);
    el.style.setProperty("--mask-text", '"' + "\\\\".repeat(len) + '"');
    const body = document.createElement("span");
    body.className = "tb-st__body";
    while (el.firstChild) body.appendChild(el.firstChild);
    const mask = document.createElement("span");
    mask.className = "tb-st__mask";
    mask.setAttribute("aria-hidden", "true");
    el.append(body, mask);
  };
  TB.slashText = (scope) => {
    const els = [...scope.querySelectorAll("[data-st]")];
    els.forEach(stWrap);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -8% 0px" });
    els.filter((el) => el.dataset.st !== "manual").forEach((el) => io.observe(el));
    return () => io.disconnect();
  };

  // Scramble that scatters with backslashes then gathers into text — same type for the original work titles, cursor label and contact strip
  TB.scrambleIn = (el, text, o = {}) => gsap.to(el, { duration: o.duration ?? 0.4, delay: o.delay ?? 0, ease: o.ease ?? "none", overwrite: true,
    scrambleText: { text, chars: o.chars ?? "\\\\\\", speed: o.speed ?? 1, delimiter: "", tweenLength: o.tweenLength ?? false } });

  // ───── Hidden grid — lay a yellow line pattern at section height and mask everything except around the cursor ─────
  const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gridTile = (type, desk) => {
    const W = 1440, H = desk ? 1080 : 2160;
    const r = rnd([...type].reduce((a, c) => a + c.charCodeAt(0) * 97, 11) + (desk ? 3 : 7));
    const cols = desk ? 12 : 4, cw = W / cols, tan = Math.tan(27 * Math.PI / 180);
    let d = "";
    for (let c = 1; c < cols; c++) if (r() < 0.55) {
      const y0 = Math.round(r() * H * 0.4), y1 = Math.round(H * (0.55 + r() * 0.45));
      d += `M${(c * cw).toFixed(1)} ${y0}V${y1}`;
    }
    const groups = desk ? 5 : 3;
    for (let g = 0; g < groups; g++) {
      const x = cw * Math.floor(r() * (cols - 1)), y = r() * H * 0.7, len = H * (0.18 + r() * 0.22), n = 2 + Math.floor(r() * 3), gap = cw * (0.18 + r() * 0.12);
      for (let k = 0; k < n; k++) d += `M${(x + k * gap).toFixed(1)} ${y.toFixed(1)}L${(x + k * gap + len * tan).toFixed(1)} ${(y + len).toFixed(1)}`;
      d += `M${x.toFixed(1)} ${y.toFixed(1)}H${(x + (n - 1) * gap + len * tan).toFixed(1)}`;
    }
    for (let k = 0; k < (desk ? 4 : 2); k++) {
      const x = cw * Math.floor(r() * cols), y = r() * H, w = cw * (0.5 + r()), h = cw * (0.3 + r() * 0.6);
      d += `M${x.toFixed(1)} ${y.toFixed(1)}h${w.toFixed(1)}v${h.toFixed(1)}h${(-w).toFixed(1)}z`;
    }
    return { W, H, d };
  };
  const SPRITE_N = 60, SPRITE_FPS = 30;
  const sprite = (() => {
    const r = rnd(4242);
    let rects = "";
    for (let f = 0; f < SPRITE_N; f++) {
      let y = 0;
      while (y < 100) {
        const h = 2 + Math.floor(r() * 9), a = r() < 0.18 ? (r() * 0.25).toFixed(2) : (0.7 + r() * 0.3).toFixed(2);
        rects += `<rect x="${f * 100}" y="${y}" width="100" height="${h}" fill-opacity="${a}"/>`;
        y += h;
      }
    }
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${SPRITE_N * 100}" height="100" viewBox="0 0 ${SPRITE_N * 100} 100">${rects}</svg>`)}")`;
  })();
  const grids = new Set();
  TB.grid = (el) => {
    const type = el.dataset.grid || "a";
    const host = el.parentElement;
    const build = () => {
      const desk = isDesk();
      const t = gridTile(type, desk);
      const w = host.clientWidth || innerWidth;
      const tileH = (w / t.W) * t.H;
      const n = Math.max(1, Math.ceil((host.scrollHeight + (Number(el.dataset.offset) || 0)) / tileH));
      el.innerHTML = Array.from({ length: n }, () => `<svg viewBox="0 0 ${t.W} ${t.H}" preserveAspectRatio="none" aria-hidden="true"><path d="${t.d}"/></svg>`).join("");
      if (el.dataset.offset) el.style.top = `${-Number(el.dataset.offset) * unit()}px`;
    };
    build();
    const state = { el, on: false, rect: null };
    if (!reduce) {
      el.style.maskImage = `${sprite}, radial-gradient(closest-side, currentColor 0%, currentColor 42%, transparent 100%)`;
      el.style.maskComposite = "intersect";
      el.style.webkitMaskImage = el.style.maskImage;
      el.style.webkitMaskComposite = "source-in";
      el.style.maskRepeat = "no-repeat";
    }
    grids.add(state);
    const io = new IntersectionObserver(([e]) => { state.on = e.isIntersecting; }, { rootMargin: "200px 0px" });
    io.observe(el);
    const ro = new ResizeObserver(() => build());
    ro.observe(host);
    return () => { io.disconnect(); ro.disconnect(); grids.delete(state); };
  };
  const gridTick = () => {
    if (!grids.size || reduce) return;
    const hov = hoverMQ.matches;
    const U = innerWidth * (hov ? 0.5 : 1.2), W = U * (666 / 719), G = U * 0.87;
    const frame = Math.floor((performance.now() / 1000) * SPRITE_FPS) % SPRITE_N;
    const mx = hov ? pointer.animated.x : innerWidth / 2, my = hov ? pointer.animated.y : innerHeight / 2;
    grids.forEach((g) => {
      if (!g.on) return;
      const r = g.el.getBoundingClientRect();
      const x = mx - r.left - U / 2, y = my - r.top - W / 2;
      g.el.style.maskSize = `${G * SPRITE_N}px ${G}px, ${U}px ${W}px`;
      g.el.style.maskPosition = `${x + U / 2 - G / 2 - frame * G}px ${y}px, ${x}px ${y}px`;
      g.el.style.webkitMaskSize = g.el.style.maskSize;
      g.el.style.webkitMaskPosition = g.el.style.maskPosition;
    });
  };
  gsap.ticker.add(gridTick);
  TB.drawGrid = (el, on) => {
    const paths = el ? el.querySelectorAll("path") : [];
    if (!paths.length) return null;
    return on
      ? gsap.fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.95, stagger: 0.03, ease: "easeInOut4" })
      : gsap.to(paths, { drawSVG: "0%", duration: 0.7, stagger: 0.01, ease: "easeInOut4" });
  };

  // ───── Cursor label ─────
  const stalker = document.querySelector(".tb-stalker");
  if (stalker) {
    const text = stalker.querySelector(".tb-stalker__text");
    const set = gsap.quickSetter(stalker, "css");
    let cur = null, raf = 0, px = 0, py = 0;
    gsap.ticker.add(() => set({ x: pointer.animated.x, y: pointer.animated.y }));
    const activate = (t) => {
      cur = t;
      stalker.dataset.color = t.dataset.cursorColor || "yellow";
      const s = t.dataset.cursorText || "";
      gsap.to(text, { duration: gsap.utils.clamp(0.27, 1, 0.2 + s.length * 0.035), ease: "none", overwrite: true, scrambleText: { text: s, chars: "\\\\\\", speed: 1, delimiter: "" } });
      stalker.dataset.status = "active";
    };
    const check = () => {
      raf = 0;
      const hit = document.elementFromPoint(px, py)?.closest("[data-cursor-text]") || null;
      if (hit === cur) return;
      if (cur) stalker.dataset.status = "not-active";
      cur = null;
      if (hit) activate(hit);
    };
    addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
    lenis.on("scroll", () => { if (!raf) raf = requestAnimationFrame(check); });
    setTimeout(() => { stalker.dataset.status = "not-active"; }, 500);
  }

  // ───── Header wordmark ─────
  const logo = document.querySelector(".tb-logo");
  const logoSlash = () => {
    if (!logo) return;
    const a = logo.querySelector(".tb-logo__word--a");
    logo.style.setProperty("--slash-x", `${a.offsetWidth}px`);
  };
  logoSlash();
  addEventListener("resize", logoSlash);
  document.fonts?.ready.then(logoSlash);
  lenis.on("scroll", ({ scroll }) => logo?.classList.toggle("is-scrolled", scroll > (isDesk() ? 100 : 30)));

  // ───── Bottom menu bar ─────
  const nav = document.querySelector(".tb-nav");
  const navBg = nav?.querySelector(".tb-nav__bg");
  const navLabel = nav?.querySelector(".tb-nav__label");
  const navPanel = nav?.querySelector(".tb-nav__panel");
  let navClose = null;
  const navSet = (open) => {
    if (!nav) return;
    nav.classList.toggle("is-open", open);
    navPanel.inert = !open;
    nav.querySelector(".tb-nav__open").setAttribute("aria-expanded", open);
    const d = open ? navPanel.offsetHeight : 0;
    const grow = () => { navBg.style.setProperty("--open-d", `${-d}px`); navBg.style.setProperty("--open-s", ((7 + d) / 7).toFixed(4)); };
    // On close, fold the bar after the panel disappears (.4s) — if reopened in between, cancel the late fold so it doesn’t fold the open bar
    navClose?.kill();
    navClose = open ? (grow(), null) : gsap.delayedCall(0.4, grow);
    nav.classList.toggle("is-st-on", open);
    if (navLabel) TB.scrambleIn(navLabel, open ? "Close" : "Menu", { duration: 0.4, speed: 1 });
  };
  TB.closeMenu = () => nav?.classList.contains("is-open") && navSet(false);
  nav?.querySelector(".tb-nav__open").addEventListener("click", () => navSet(!nav.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") TB.closeMenu(); });
  if (nav) { nav.querySelectorAll("[data-st]").forEach(stWrap); navPanel.inert = true; }

  let colorIO = [];
  const watchColors = (scope) => {
    colorIO.forEach((o) => o.disconnect());
    const h = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) logo?.classList.toggle("is-white", e.target.dataset.headerColor === "white"); }), { rootMargin: "0px 0px -90% 0px" });
    const m = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) nav?.classList.toggle("is-white", e.target.dataset.menuColor === "white"); }), { rootMargin: "-85% 0px 0px 0px" });
    const f = new IntersectionObserver(([e]) => { if (e.isIntersecting) TB.closeMenu(); nav?.classList.toggle("is-hidden", e.isIntersecting); }, { rootMargin: "-10% 0px" });
    scope.querySelectorAll("[data-header-color]").forEach((el) => h.observe(el));
    scope.querySelectorAll("[data-menu-color]").forEach((el) => m.observe(el));
    const foot = scope.querySelector(".tb-footer");
    if (foot) f.observe(foot);
    colorIO = [h, m, f];
  };

  // ───── Contact strip — the vertical letters of ”Ready to / Disrupt?” gather at a backslash in each cell, flow down, and scatter again ─────
  const contact = (scope) => {
    const sec = scope.querySelector(".tb-contact");
    if (!sec) return () => {};
    const grid = sec.querySelector(".tb-contact__scramble");
    if (grid && !grid.children.length) {
      let html = "";
      for (let row = 0; row < 3; row++) for (let i = 0; i < 12; i++) {
        const w = (i + row) % 2 ? "Disrupt?" : "Ready to";
        html += `<div class="tb-contact__cell"><span class="tb-contact__word" style="--i:${i};--row:${row};top:${Math.round(10 + ((i * 37 + row * 53) % 60))}%" data-word="${w}">${w}</span></div>`;
      }
      grid.innerHTML = html;
    }
    const words = [...sec.querySelectorAll(".tb-contact__word")];
    const locs = [...sec.querySelectorAll(".tb-contact__loc")];
    let on = false, li = 0, lt = 0;
    const cycle = () => {
      if (!on || !isDesk()) return;
      words.forEach((w, k) => {
        const i = k % 12, row = Math.floor(k / 12);
        gsap.fromTo(w, { y: 0 }, { y: 0, duration: 0.45, delay: 0.65 + i * 0.04 + row * 0.1, scrambleText: { text: w.dataset.word, chars: "\\\\\\", speed: 1, delimiter: "" },
          onComplete: () => gsap.to(w, { y: "+=" + (40 * unit()), duration: 1.65, ease: k % 2 ? "none" : CustomEase.create("e5", "0.55,0.05,0.22,0.99"), delay: 0.04 * (12 - i + 1),
            onComplete: () => gsap.to(w, { duration: 1.2, scrambleText: { text: "", chars: "\\\\\\", speed: 1, delimiter: "" }, onComplete: () => { gsap.set(w, { y: 0 }); if (k === words.length - 1) cycle(); } }) }) });
      });
    };
    const loc = () => {
      if (!on || !locs.length) return;
      locs.forEach((l, k) => l.classList.toggle("is-on", k === li % locs.length));
      li++;
      lt = setTimeout(loc, 2200 + (Math.random() - 0.5) * 500);
    };
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      sec.classList.toggle("is-in", on);
      if (on) { cycle(); loc(); } else { clearTimeout(lt); gsap.killTweensOf(words); words.forEach((w) => { w.textContent = w.dataset.word; gsap.set(w, { y: 0 }); }); }
    }, { threshold: 0.2 });
    io.observe(sec);
    const offRepel = repel(sec.querySelector(".tb-contact__title"));
    return () => { io.disconnect(); clearTimeout(lt); gsap.killTweensOf(words); offRepel(); };
  };

  // Letter repel — letters within 300px of the cursor are pushed away up to 30px, inversely proportional to distance, and follow by .12 each step (original mouseCharRepel, contact band title)
  const repel = (el, R = 300, M = 30, L = 0.12) => {
    if (!el || reduce || !hoverMQ.matches || !isDesk()) return () => {};
    el.querySelectorAll(":scope > span").forEach((sp) => { sp.innerHTML = [...sp.textContent].map((c) => `<span class="char">${c === " " ? "&#32;" : c}</span>`).join(""); });
    const chars = [...el.querySelectorAll(".char")].map((c) => ({ el: c, cx: 0, cy: 0, ox: 0, oy: 0, rx: 0, ry: 0 }));
    const centers = () => chars.forEach((c) => { const r = c.el.getBoundingClientRect(); c.cx = r.left + r.width / 2 - c.rx; c.cy = r.top + r.height / 2 + lenis.animatedScroll - c.ry; });
    centers();
    const ro = new ResizeObserver(centers); ro.observe(el);
    let on = false;
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) centers(); });
    io.observe(el);
    const tick = () => {
      if (!on) return;
      const { x, y } = pointer.mouse, sy = lenis.animatedScroll;
      chars.forEach((c) => {
        const dx = c.cx - x, dy = c.cy - sy - y, d2 = dx * dx + dy * dy;
        let tx = 0, ty = 0;
        if (d2 > 0 && d2 < R * R) { const d = Math.sqrt(d2), f = (1 - d / R) * M; tx = (dx / d) * f; ty = (dy / d) * f; }
        c.ox += (tx - c.ox) * L; c.oy += (ty - c.oy) * L;
        if (tx === 0 && ty === 0 && Math.abs(c.ox) < 0.01 && Math.abs(c.oy) < 0.01) { c.ox = 0; c.oy = 0; }
        if (Math.abs(c.ox - c.rx) < 0.01 && Math.abs(c.oy - c.ry) < 0.01) return;
        c.rx = c.ox; c.ry = c.oy;
        c.el.style.transform = `translate3d(${c.ox.toFixed(2)}px, ${c.oy.toFixed(2)}px, 0)`;
      });
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); ro.disconnect(); io.disconnect(); };
  };

  // ───── Angular button — on hover the text reassembles from a backslash (original data-hover-scramble) ─────
  const btnScramble = (scope) => {
    const offs = [];
    scope.querySelectorAll(".tb-btn").forEach((b) => {
      let lab = b.querySelector(".tb-btn__label");
      if (!lab) {
        const t = [...b.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
        if (!t) return;
        lab = document.createElement("span"); lab.className = "tb-btn__label"; lab.textContent = t.textContent.trim();
        t.replaceWith(lab);
      }
      const text = lab.textContent;
      b.querySelectorAll(":scope > span:not(.tb-btn__label)").forEach((sp) => { if (sp.textContent.trim() === "→") sp.outerHTML = '<svg class="tb-btn__arrow" viewBox="0 0 16 12" aria-hidden="true"><path d="M0 5.2h12.6L8.4 1l1.1-1.1L15.6 6l-6.1 6.1L8.4 11l4.2-4.2H0z"/></svg>'; });
      const on = () => { if (hoverMQ.matches && !reduce) gsap.to(lab, { duration: 0.55, delay: 0.085, ease: "none", overwrite: true, scrambleText: { text, chars: "\\\\", speed: 1, delimiter: "" } }); };
      b.addEventListener("pointerenter", on);
      offs.push(() => b.removeEventListener("pointerenter", on));
    });
    return () => offs.forEach((f) => f());
  };

  // ───── Attach and detach page ─────
  let cleanups = [];
  const keep = (f) => typeof f === "function" && cleanups.push(f);
  const current = () => document.querySelector("#swup.is-next-container") || document.getElementById("swup") || document.body;
  const mount = (initial) => {
    const scope = current();
    const name = scope.dataset.page || document.body.dataset.page;
    scope.querySelectorAll(".tb-grid").forEach((g) => keep(TB.grid(g)));
    keep(TB.slashText(scope));
    keep(contact(scope));
    keep(btnScramble(document));
    watchColors(scope);
    const init = TB.pages[name];
    if (init) keep(init({ scope, initial }));
    document.querySelectorAll(".tb-nav__menu a").forEach((a) => a.toggleAttribute("aria-current", a.dataset.page === name));
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  const unmount = () => {
    cleanups.splice(0).forEach((f) => { try { f(); } catch (e) { /* Even if detaching fails, the next page still gets attached */ } });
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };
  TB.keep = keep;

  // ───── Loader — minimum 800ms, exit completes 1.2 seconds later ─────
  const loaderRun = async () => {
    root.classList.add("is-loading");
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.stop();
    await Promise.all([wait(800), document.fonts?.ready]);
    root.classList.add("is-loading-leaving");
    document.dispatchEvent(new CustomEvent("tb:loader-leave"));
    await wait(1200);
    root.classList.remove("is-loading", "is-loading-leaving");
    root.classList.add("is-loading-done");
    lenis.start();
    document.dispatchEvent(new CustomEvent("tb:loader-done"));
  };

  // ───── Diagonal page turn ─────
  const pt = document.querySelector(".tb-pt");
  const slash = { w: 105.041, l: 26, h: 0 };
  const aspect = 157.5 / 105.041;
  let grow = null, ptStart = 0;
  const paint = (el) => {
    if (!el) return;
    const u = Math.min(unit(), innerHeight / 690);
    el.style.setProperty("--sw", `${slash.w * u}px`);
    el.style.setProperty("--sl", `${slash.l * u}px`);
    el.style.setProperty("--sh", `${slash.h || slash.w * u * aspect}px`);
  };
  const ptOut = async () => {
    TB.closeMenu();
    Object.assign(slash, { w: 105.041, l: 26, h: 0 });
    paint(pt);
    root.classList.add("is-pt-start");
    ptStart = performance.now();
    grow = gsap.to(slash, { w: 210.082, l: 52, duration: 11, delay: 0.85, ease: "linear", overwrite: true, onUpdate: () => paint(pt) });
  };
  const ptIn = async (next) => {
    root.classList.add("is-pt-start");
    Object.assign(slash, { w: 105.041, l: 26, h: 0 });
    paint(next);
    next.classList.add("is-next");
    await wait(Math.max(0, 800 - (performance.now() - ptStart)) + 300);
    grow?.kill();
    const u = Math.min(unit(), innerHeight / 690);
    const full = (innerWidth * 2.2) / u;
    await gsap.to(slash, { w: full, l: full, h: innerHeight * 2.2, duration: 0.65, ease: "power4.inOut", overwrite: true, onUpdate: () => paint(next) });
    next.classList.remove("is-next");
    root.classList.remove("is-pt-start");
  };

  const internal = (a) => a && a.href && !a.target && !a.hasAttribute("download") && a.origin === location.origin && /\.html(\?|#|$)/.test(a.pathname) && a.pathname !== location.pathname;
  const bootSwup = () => {
    if (!/^https?:$/.test(location.protocol) || !window.Swup) return false;
    const plugins = [];
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ awaitAssets: true }));
    if (window.SwupParallelPlugin) plugins.push(new SwupParallelPlugin({ containers: ["#swup"] }));
    const swup = (window.swup = new Swup({ containers: ["#swup"], animationSelector: false, plugins, linkSelector: 'a[href$=".html"], a[href*=".html?"], a[href*=".html#"]' }));
    let prevTop = 0;
    swup.hooks.on("visit:start", () => { prevTop = lenis.animatedScroll; });
    swup.hooks.replace("animation:out:await", async () => {
      const prev = document.getElementById("swup");
      gsap.set(prev, { position: "fixed", left: 0, top: -prevTop, width: "100%", zIndex: 0 });
      await ptOut();
    });
    swup.hooks.on("content:replace", () => { unmount(); lenis.scrollTo(0, { immediate: true, force: true }); });
    swup.hooks.replace("animation:in:await", async () => {
      const next = current();
      lenis.stop();
      await ptIn(next);
      lenis.start();
    });
    swup.hooks.on("page:view", () => mount(false));
    return true;
  };
  const bootFileNav = () => {
    document.addEventListener("click", async (e) => {
      const a = e.target.closest("a");
      if (!internal(a) || e.metaKey || e.ctrlKey || e.shiftKey || reduce) return;
      e.preventDefault();
      await ptOut();
      await wait(800);
      sessionStorage.setItem("tb-pt", "1");
      location.href = a.href;
    });
  };

  const boot = async () => {
    mount(true);
    const viaNav = sessionStorage.getItem("tb-pt") === "1";
    sessionStorage.removeItem("tb-pt");
    if (!bootSwup()) bootFileNav();
    if (reduce || document.body.hasAttribute("data-no-loader")) { root.classList.add("is-loading-done"); document.dispatchEvent(new CustomEvent("tb:loader-done")); return; }
    if (viaNav) {
      root.classList.add("is-loading-done");
      lenis.stop();
      document.dispatchEvent(new CustomEvent("tb:loader-leave"));
      ptStart = performance.now() - 800;
      await ptIn(current());
      lenis.start();
      document.dispatchEvent(new CustomEvent("tb:loader-done"));
    } else loaderRun();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
