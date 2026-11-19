// Devices shared by several scenes even though it is a single page: screen scaling (1440 base), Lenis, module wordmark (loader → top band → left band → end screen), fixed title, trailer curtain, phone curtain.
// Scenes are received in index.js as window.G and used.
(() => {
  const root = document.documentElement;
  const css = getComputedStyle(root);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The original writes all values in pixels of the 1440 layout and scales by screen width — the same ruler is used here to carry the values over as is
  const Y = { width: 0, height: 0, scale: 1, dpr: 1 };
  const resizers = [];
  const measure = () => {
    Y.width = root.clientWidth || innerWidth;
    Y.height = innerHeight;
    Y.scale = Y.width / 1440;
    Y.dpr = Math.min(2, devicePixelRatio || 1);
    root.style.setProperty("--vw", `${Y.width}px`);
    root.style.setProperty("--vh", `${Y.height}px`);
  };
  measure();
  let lastW = Y.width, lastH = Y.height, queued = false;
  addEventListener("resize", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      measure();
      if (Y.width === lastW && Y.height === lastH) return;
      lastW = Y.width; lastH = Y.height;
      resizers.forEach((fn) => fn());
    });
  });
  const onResize = (fn) => resizers.push(fn);
  const px = (v) => Math.round(v * Y.scale);

  // Phone and narrow screens get only the ‹Desktop only› curtain like the original — below 1200px or touch screens
  const isStub = () => matchMedia("(hover: none) and (pointer: coarse)").matches || Y.width < 1200;

  // ── Smooth scroll: original Lenis 1.3.26 · lerp .1 · wheel multiplier 1 · driven by the GSAP ticker ──
  const scroll = { y: 0, velocity: 0, lenis: null };
  function startLenis() {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, autoRaf: false });
    scroll.lenis = window.lenis = lenis;
    lenis.on("scroll", (e) => {
      scroll.y = e.scroll;
      scroll.velocity = gsap.utils.clamp(-1, 1, e.velocity / 60);
      ScrollTrigger.update();
    });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }
  const stopScroll = () => scroll.lenis?.stop();
  const startScroll = () => scroll.lenis?.start();

  // ── Module wordmark: square pieces of five letters (placeholder TITLE) drawn on a 1296×273 layer ──
  // Letter width grows for letters farther from the lens focus, and vertically it bends around the focus height — the loader, end screen and phone blocker use the same formula
  const WORD = { w: 1296, h: 273 };
  const LETTERS = [
    [[0, 0, 273, 92], [92, 92, 89, 181]],
    [[301, 0, 92, 273]],
    [[421, 0, 273, 92], [513, 92, 89, 181]],
    [[722, 0, 92, 273], [814, 181, 181, 92]],
    [[1023, 0, 92, 273], [1115, 0, 181, 43], [1115, 112, 137, 49], [1115, 181, 181, 92]],
  ].map((mods) => ({ mods, left: Math.min(...mods.map((m) => m[0])), right: Math.max(...mods.map((m) => m[0] + m[2])) }));
  const MODULES = LETTERS.reduce((n, l) => n + l.mods.length, 0);

  const bend = (focusY, strength) => {
    if (!strength) return (v) => v;
    const n = 1 / (1 + strength), r = Math.min(0.999, Math.max(0.001, focusY));
    return (v) => (v <= r ? r * (v / r) ** n : r + (1 - r) * (1 - ((1 - v) / (1 - r)) ** n));
  };

  // Make room for pieces inside box. Without focus it’s just the panel stretched (top strip · left strip)
  function layoutWord(box, focus, spreadX = 0, spreadY = 0, snap = Math.round) {
    const dist = LETTERS.map((l) => (focus ? Math.hypot((l.left + l.right) / 2 / WORD.w - focus.x, 0.5 - focus.y) : 0));
    const avg = dist.reduce((a, b) => a + b, 0) / dist.length;
    const k = (d) => Math.max(0.15, 1 + spreadX * (d - avg));
    const wide = LETTERS.map((l, i) => (l.right - l.left) * k(dist[i]));
    const gaps = LETTERS.map((l, i) => (i < LETTERS.length - 1 ? (LETTERS[i + 1].left - l.right) * k(dist[i]) : 0));
    const total = wide.reduce((a, b) => a + b, 0) + gaps.reduce((a, b) => a + b, 0);
    const warp = focus ? bend(focus.y, spreadY) : (v) => v;
    const out = [];
    let x = 0;
    LETTERS.forEach((l, i) => {
      const a = x, b = (x += (wide[i] / total) * box.w);
      x += (gaps[i] / total) * box.w;
      const span = l.right - l.left;
      for (const [mx, my, mw, mh] of l.mods) {
        const x0 = snap(box.x + a + ((mx - l.left) / span) * (b - a)), x1 = snap(box.x + a + ((mx + mw - l.left) / span) * (b - a));
        const y0 = snap(box.y + warp(my / WORD.h) * box.h), y1 = snap(box.y + warp((my + mh) / WORD.h) * box.h);
        out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
      }
    });
    return out;
  }
  const makeModules = (host) => Array.from({ length: MODULES }, () => host.appendChild(document.createElement("i")));
  const place = (els, rects) => rects.forEach((r, i) => {
    const s = els[i].style;
    s.left = `${r.x}px`; s.top = `${r.y}px`; s.width = `${r.w}px`; s.height = `${r.h}px`;
  });

  // ── Loader: pieces rise to fill from the bottom of the screen (after .35s, 1.1s power2.out) while the lens focus rotates top-left → top-right → bottom-left
  //    returning to center (1.2s power3.inOut) and lifted up together with the floor plate into a 121px (1440 panel) band ──
  const pre = document.querySelector(".g-pre");
  const ground = pre?.querySelector(".g-pre__ground");
  const wordHost = pre?.querySelector(".g-word");
  const mods = wordHost ? makeModules(wordHost) : [];
  const bandH = () => px(121);
  const lens = { x: 0.5, y: 0.5, spread: 0 };
  const box = { top: 0, bottom: 0 };
  const drawPre = () => place(mods, layoutWord({ x: 0, y: Math.round(box.top), w: Y.width, h: Math.round(box.bottom - box.top) }, lens, 1.6 * lens.spread, 1.4 * lens.spread));
  const groundMove = { at: 0, duration: 0, from: 0, to: 0 };
  let preDone = false;

  function preloader() {
    box.top = box.bottom = Y.height;
    drawPre();
    gsap.set(ground, { y: 0 });
    const tl = gsap.timeline({ onUpdate: drawPre, onComplete: () => { preDone = true; } });
    box.bottom = Y.height;
    tl.to(box, { top: 0, duration: 1.1, ease: "power2.out" }, 0.35);
    tl.to(lens, { x: 0.02, y: 0.02, spread: 1, duration: 1.1, ease: "power2.out" }, 0.35);
    let at = 0.35 + 1.1 + 0.12, prev = { x: 0.02, y: 0.02, spread: 1 };
    [{ x: 0.98, y: 0.02, spread: 1 }, { x: 0.02, y: 0.98, spread: 1 }].forEach((p, i) => {
      // Not straight from corner to corner, but bends 28% toward the center, passing by on the way
      const mid = (a, b) => (a + b) / 2 + (0.5 - (a + b) / 2) * 0.56;
      tl.to(lens, { x: mid(prev.x, p.x), y: mid(prev.y, p.y), spread: prev.spread + (p.spread - prev.spread) / 2, duration: 0.35, ease: i === 0 ? "power2.out" : "power1.in" }, at)
        .to(lens, { ...p, duration: 0.35, ease: "power1.out" }, at + 0.35);
      prev = p;
      at += 0.84;
    });
    const band = bandH();
    tl.to(lens, { x: 0.5, y: 0.5, spread: 0, duration: 1.2, ease: "power3.inOut" }, at);
    tl.to(box, { bottom: band, duration: 1.2, ease: "power3.inOut" }, at);
    tl.to(ground, { y: -(Y.height - band), duration: 1.2, ease: "power3.inOut" }, at);
    Object.assign(groundMove, { at, duration: 1.2, from: Y.height, to: band });
    return tl;
  }
  // When the bottom panel’s lower edge passes screen height y (which second of the reveal) — the index and title rise in the order the panel passes
  function groundPass(y) {
    const { duration, from, to } = groundMove;
    if (!duration || y >= from) return 0;
    if (y <= to) return duration;
    const want = (from - y) / (from - to), ease = gsap.parseEase("power3.inOut");
    let lo = 0, hi = 1;
    for (let i = 0; i < 24; i++) {
      const m = (lo + hi) / 2;
      ease(m) < want ? (lo = m) : (hi = m);
    }
    return ((lo + hi) / 2) * duration;
  }

  // ── Pinned title (TITLE · S00): rises from the bottom center of the screen, goes up in the first half of the scroll and to both corners in the second half ──
  const title = document.querySelector(".g-title");
  const words = title ? [...title.querySelectorAll(".g-title__word")] : [];
  const titleLetters = [];
  words.forEach((w) => {
    const about = w.querySelector(".g-title__about");
    [...w.childNodes].filter((n) => n.nodeType === 3).forEach((node) => {
      const frag = document.createDocumentFragment();
      [...node.textContent.trim()].forEach((ch) => {
        const m = document.createElement("span");
        m.className = "g-mk";
        const i = document.createElement("i");
        i.textContent = ch;
        m.append(i);
        frag.append(m);
        titleLetters.push(i);
      });
      node.replaceWith(frag);
    });
    if (about) {
      const text = about.textContent;
      about.textContent = "";
      about.letters = [...text].map((ch) => {
        const m = document.createElement("span");
        m.className = "g-mk";
        const i = document.createElement("i");
        i.textContent = ch;
        m.append(i);
        about.append(m);
        return i;
      });
    }
  });
  const capOffset = () => {
    const i = title.querySelector(".g-title__word > .g-mk i"), c = document.createElement("canvas").getContext("2d");
    c.font = getComputedStyle(i).font;
    const m = c.measureText("TITLE");
    return { lift: m.fontBoundingBoxAscent - m.actualBoundingBoxAscent, ascent: m.fontBoundingBoxAscent, descent: m.actualBoundingBoxDescent, box: m.fontBoundingBoxAscent + m.fontBoundingBoxDescent };
  };
  function layoutTitle() {
    if (!title) return;
    const h = Math.ceil(90 * 1.2 * Y.scale);
    title.querySelectorAll(".g-mk").forEach((m) => (m.style.height = `${h}px`));
    words.forEach((w) => (w.style.left = `${px(+w.dataset.wordLeft)}px`));
    const m = capOffset();
    const baseline = (h - m.box) / 2 + m.ascent + m.descent;
    title.style.bottom = `${px(10) - (h - baseline)}px`;
  }
  layoutTitle();

  // Strip → left vertical strip: on page 0, scrub .6 up to the 17th TOC line — width to 90px with power2.out, height to screen height with power2.in
  const morph = { st: null, d: null };
  let finaleOn = () => false;
  const rectNoMove = (el, extraY = 0) => {
    const r = el.getBoundingClientRect(), x = +gsap.getProperty(el, "x") || 0, y = +gsap.getProperty(el, "y") || 0;
    return { left: r.left - x, right: r.right - x, top: r.top - y - extraY };
  };
  function measureMorph() {
    const ty = +gsap.getProperty(title, "y") || 0;
    const [a, b] = words, ra = rectNoMove(a, ty), rb = rectNoMove(b, ty), rt = rectNoMove(title);
    const m = capOffset(), mk = title.querySelector(".g-title__word > .g-mk"), glyphTop = mk ? mk.querySelector("i").getBoundingClientRect().top - mk.getBoundingClientRect().top + m.lift : m.lift;
    const dy = px(10) - glyphTop - rt.top;
    const entry = document.querySelectorAll(".g-intro__entry");
    const target = entry[16] || entry[entry.length - 1];
    morph.d = {
      fromW: Y.width, toW: px(90), fromH: Math.round((Y.width * 121) / 1440), toH: Y.height,
      a: { dx: px(90) + px(18) - ra.left, dy }, b: { dx: Y.width - px(18) - rb.right, dy },
      run: Math.max(1, Math.round(target ? target.getBoundingClientRect().top + scroll.y : 1024 * Y.scale)),
    };
  }
  const outE = gsap.parseEase("power2.out"), inE = gsap.parseEase("power2.in");
  function drawMorph(p, y) {
    const d = morph.d;
    if (!finaleOn()) {
      const w = d.fromW + (d.toW - d.fromW) * outE(p), h = d.fromH + (d.toH - d.fromH) * inE(p);
      ground.style.width = `${w}px`;
      ground.style.height = `${h}px`;
      place(mods, layoutWord({ x: 0, y: 0, w, h }));
    }
    const up = gsap.utils.clamp(0, 1, p / 0.5), side = gsap.utils.clamp(0, 1, (p - 0.5) / 0.5), drift = y * 0.09 * (1 - up);
    gsap.set(words[0], { x: d.a.dx * side, y: d.a.dy * up + drift });
    gsap.set(words[1], { x: d.b.dx * side, y: d.b.dy * up + drift });
  }
  function startMorph() {
    gsap.set(ground, { y: 0, width: Y.width, height: (Y.width * 121) / 1440 });
    measureMorph();
    onResize(() => { measureMorph(); ScrollTrigger.refresh(); });
    morph.st = ScrollTrigger.create({ trigger: document.body, start: 0, end: () => morph.d.run, scrub: 0.6, invalidateOnRefresh: true, onUpdate: (st) => drawMorph(st.progress, st.scroll()) });
    return morph.st;
  }
  const redrawMorph = () => morph.st && morph.d && drawMorph(morph.st.progress, morph.st.scroll());

  // ── Footer screen: left strip expands to fill the screen while the lens follows the mouse (each frame closes 1 − .88^dt of the remaining distance) ──
  function finale(section) {
    let open = 0, held = null, ticking = false;
    const want = { x: 0.5, y: 0.5 }, at = { x: 0.5, y: 0.5 };
    const draw = () => {
      const w = Math.round(px(90) + (Y.width - px(90)) * open), h = Y.height;
      if (open > 0 && held === null) held = gsap.getProperty(ground, "y");
      if (open > 0) gsap.set(ground, { y: 0 });
      else if (held !== null) { gsap.set(ground, { y: held }); held = null; }
      ground.style.width = `${w}px`;
      ground.style.height = `${h}px`;
      place(mods, layoutWord({ x: 0, y: 0, w, h }, at, 1.6 * open, 1.4 * open));
    };
    const follow = () => {
      const k = 1 - 0.88 ** gsap.ticker.deltaRatio(), dx = want.x - at.x, dy = want.y - at.y;
      if (Math.abs(dx) < 5e-4 && Math.abs(dy) < 5e-4) return;
      at.x += dx * k; at.y += dy * k;
      draw();
    };
    const tick = (on) => {
      if (on === ticking) return;
      ticking = on;
      on ? gsap.ticker.add(follow) : gsap.ticker.remove(follow);
    };
    const set = (v) => {
      const was = open;
      open = v;
      tick(v > 0);
      if (v === 0) { if (was > 0) { draw(); redrawMorph(); } return; }
      draw();
    };
    finaleOn = () => open > 0;
    const size = () => {
      section.style.marginTop = `${px(10 - 8.6)}px`;
      section.style.height = `${Y.height * 2}px`;
    };
    size();
    addEventListener("pointermove", (e) => { want.x = e.clientX / Y.width; want.y = e.clientY / Y.height; }, { passive: true });
    onResize(() => { size(); if (open > 0) draw(); ScrollTrigger.refresh(); });
    return ScrollTrigger.create({
      trigger: section, start: "top top", end: () => `+=${Y.height}`, invalidateOnRefresh: true,
      onUpdate: (st) => set(st.progress), onLeaveBack: () => set(0), onLeave: () => set(1),
      onRefresh: (st) => st.progress > 0 && set(st.progress),
    });
  }

  // ── Trailer: over a cell, instead of the system cursor the word (Play) follows at the cursor’s lower right (14 · 10px), and on click a curtain drops from the top (.7s power3.inOut) ──
  function trailer() {
    const spot = document.querySelector("[data-trailer]");
    const stage = document.querySelector(".g-trailer"), film = stage?.querySelector("video"), word = document.querySelector(".g-cursor");
    if (!spot || !stage || !film || !word) return null;
    let open = false, over = false;
    const follow = (e) => gsap.set(word, { x: e.clientX + 14, y: e.clientY + 10 });
    const say = (text, light) => { word.textContent = text; word.classList.toggle("is-light", !!light); };
    const show = (on) => {
      word.hidden = !on;
      on ? addEventListener("pointermove", follow) : removeEventListener("pointermove", follow);
    };
    const play = () => {
      if (open) return;
      open = true;
      stage.hidden = false;
      stopScroll();
      film.currentTime = 0;
      film.muted = false;
      film.play().catch(() => {});
      say("(Close)", true);
      gsap.fromTo(stage, { yPercent: -100 }, { yPercent: 0, duration: reduce ? 0 : 0.7, ease: "power3.inOut" });
    };
    const close = () => {
      if (!open) return;
      open = false;
      film.pause();
      say("(Play)", false);
      gsap.to(stage, { yPercent: -100, duration: reduce ? 0 : 0.7, ease: "power3.inOut", onComplete: () => { stage.hidden = true; film.currentTime = 0; startScroll(); if (!over) show(false); } });
    };
    spot.addEventListener("pointerenter", (e) => { over = true; if (!open) { say("(Play)", false); show(true); follow(e); } });
    spot.addEventListener("pointerleave", () => { over = false; if (!open) show(false); });
    spot.addEventListener("click", play);
    stage.addEventListener("click", (e) => {
      if (e.target === film) {
        film.paused ? film.play().catch(() => {}) : film.pause();
        say(film.paused ? "(Play)" : "(Paused)", true);
        return;
      }
      close();
    });
    film.addEventListener("pointerenter", () => open && say(film.paused ? "(Play)" : "(Paused)", true));
    film.addEventListener("pointerleave", () => open && say("(Close)", true));
    addEventListener("keydown", (e) => e.key === "Escape" && close());
    return stage;
  }

  // ── Phone overlay: draw the wordmark filling the bottom panel while the lens focus turns straight through the four corners .7s each ──
  const stub = { root: document.querySelector(".g-stub"), els: null, tl: null, on: false, focus: { x: 0.02, y: 0.02 } };
  const drawStub = () => {
    const r = stub.root.getBoundingClientRect();
    place(stub.els, layoutWord({ x: 0, y: 0, w: Math.round(r.width), h: Math.round(r.height) }, stub.focus, 1.6, 1.4, (v) => Math.round(v * Y.dpr) / Y.dpr));
  };
  function showStub(on) {
    if (!stub.root) return;
    if (!stub.els) {
      stub.els = makeModules(stub.root.querySelector(".g-stub__word"));
      const path = [{ x: 0.98, y: 0.02 }, { x: 0.98, y: 0.98 }, { x: 0.02, y: 0.98 }, { x: 0.02, y: 0.02 }];
      stub.tl = gsap.timeline({ repeat: -1, paused: true });
      path.forEach((p) => stub.tl.to(stub.focus, { ...p, duration: 0.7, ease: "none" }));
    }
    if (on === stub.on) return;
    stub.on = on;
    root.classList.toggle("is-stub", on);
    stub.root.hidden = !on;
    if (on) { drawStub(); if (!reduce) { gsap.ticker.add(drawStub); stub.tl.play(); } }
    else { gsap.ticker.remove(drawStub); stub.tl.pause(); }
  }
  addEventListener("resize", () => stub.on && drawStub(), { passive: true });

  window.G = {
    Y, px, css, reduce, onResize, isStub, scroll, startLenis, stopScroll, startScroll,
    preloader, groundPass, groundStart: () => groundMove.at, startMorph, finale, trailer, showStub,
    title, titleWords: words, titleLetters, layoutTitle, redrawMorph,
    showGroundAsBand() {
      // Reduced motion: strip first, no loader
      gsap.set(ground, { y: 0, width: Y.width, height: bandH() });
      place(mods, layoutWord({ x: 0, y: 0, w: Y.width, h: bandH() }));
      preDone = true;
    },
  };
})();
