// Shared by all pages: design-unit width, smooth scroll (lenis 1.1.13 — same build as the original), clay loader, sound button, cookie box, order cover, ⌘G grid
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const setW = () => root.style.setProperty("--W", root.clientWidth + "px");
  setW();
  addEventListener("resize", setW);
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  // While scroll is locked (loader, intro, cover), stop lenis — the original also checks the lock flag every frame to stop and release it
  window.dhLock = (on) => { window.scrollLocked = on; };
  const scrolls = !document.body.hasAttribute("data-no-scroll");
  window.lenis = null;
  if (scrolls && window.Lenis && !reduce) {
    const lenis = (window.lenis = new Lenis({ lerp: 0.14, smoothWheel: true, wheelMultiplier: 0.9 }));
    if (window.ScrollTrigger) lenis.on("scroll", () => ScrollTrigger.update());
    const raf = (t) => {
      const locked = window.scrollLocked || root.style.overflow === "hidden";
      if (locked && !lenis.isStopped) lenis.stop();
      else if (!locked && lenis.isStopped) lenis.start();
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  // Sound: each press makes a short tap like striking wet clay, and when left on a very low room hum plays
  const sound = (window.dhSound = { on: false, ctx: null, room: null });
  function audio() {
    if (sound.ctx) return sound.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = (sound.ctx = new AC());
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    sound.noise = buf;
    return ctx;
  }
  sound.tap = (v = 1) => {
    if (!sound.on || !sound.ctx) return;
    const ctx = sound.ctx, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = sound.noise; f.type = "lowpass"; f.frequency.value = 380 + 300 * Math.random();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.35 * v, ctx.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(ctx.currentTime, Math.random()); src.stop(ctx.currentTime + 0.2);
  };
  function setSound(on) {
    sound.on = on;
    document.querySelectorAll(".snd").forEach((b) => {
      b.setAttribute("aria-pressed", String(on));
      b.querySelector("path")?.setAttribute("d", on ? "M0 5Q3 1 6 5T12 5T18 5T24 5" : "M0 5H24");
    });
    try { localStorage.setItem("dh-sound", on ? "1" : "0"); } catch (e) {}
    const ctx = on ? audio() : sound.ctx;
    if (!ctx) return;
    if (on) {
      ctx.resume();
      if (!sound.room) {
        const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        src.buffer = sound.noise; src.loop = true; f.type = "lowpass"; f.frequency.value = 220; g.gain.value = 0;
        src.connect(f).connect(g).connect(ctx.destination); src.start();
        sound.room = g;
      }
      sound.room.gain.setTargetAtTime(0.05, ctx.currentTime, 0.6);
    } else if (sound.room) sound.room.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".snd");
    if (b) { e.preventDefault(); setSound(!sound.on); }
  });
  addEventListener("pointerdown", (e) => { if (!e.target.closest("a, button")) sound.tap(0.7); });

  // Clay loader: at screen center a finger writes two letters in clay (1.5s, quad in-out), after .75s the paper peels away (.6s) and the clay soaks in and fades (1.2s)
  const pre = document.querySelector(".pre");
  window.dhPreDone = new Promise((done) => {
    if (!pre) return done();
    if (reduce || !window.kfClay) { pre.remove(); return done(); }
    window.dhLock(true);
    pre.addEventListener("pointerdown", () => { if (!sound.on) setSound(true); });
    const cv = pre.querySelector("canvas"), dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext("2d");
    g.scale(dpr, dpr);
    // Loader clay is the text color (dark gray earth) — a different earth from the brown hand-stamped marks. Strokes are thick, about .2 of the letter height, written slightly slanted
    const color = css("--kf-ink-soft");
    const h = Math.min(190, 0.23 * H), lw = 0.95 * h, gap = 0.48 * h, x0 = (W - (2 * lw + gap)) / 2, top = H / 2 - h / 2, bot = top + h;
    const jit = () => (Math.random() - 0.5) * 0.28 * h;
    const line = (ax, ay, bx, by) => { const n = Math.max(2, Math.ceil(Math.hypot(bx - ax, by - ay) / 10)); return Array.from({ length: n + 1 }, (_, i) => [ax + (bx - ax) * i / n, ay + (by - ay) * i / n]); };
    const arc = (cx, cy, rx, ry, a0, a1) => { const n = 18; return Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; }); };
    // First letter S is two half circles, second letter N is three strokes — slot to swap for brand initials
    const strokes = [
      [...arc(x0 + lw / 2, top + h / 4, lw / 2, h / 4, -30, -270), ...arc(x0 + lw / 2, top + 3 * h / 4, lw / 2, h / 4, -90, 150).slice(1)],
      line(x0 + lw + gap + jit() * 0.2, bot + jit() * 0.2, x0 + lw + gap, top),
      line(x0 + lw + gap, top + jit() * 0.2, x0 + 2 * lw + gap, bot),
      line(x0 + 2 * lw + gap + jit() * 0.2, bot, x0 + 2 * lw + gap, top + jit() * 0.2),
    ];
    const total = strokes.reduce((s, p) => s + p.slice(1).reduce((a, q, i) => a + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0), 0);
    const finger = 0.1 * h;
    let si = 0, pi = 0, run = 0;
    let t0 = 0;
    const paint = (until) => {
      while (si < strokes.length && run < until) {
        const p = strokes[si];
        if (pi === 0) {
          const s = kfClay.stamp(finger * 1.1, finger, color, 1, "loop");
          g.save(); g.translate(p[0][0], p[0][1]); g.rotate(Math.random() * 6.28); g.drawImage(s, -s.width / 2, -s.height / 2); g.restore();
          pi = 1;
        }
        const [ax, ay] = p[pi - 1], [bx, by] = p[pi], d = Math.hypot(bx - ax, by - ay);
        if (d > 0) {
          const s = kfClay.stamp(d / 2 + finger * 0.9, finger * (0.85 + 0.15 * Math.random()), color, 1);
          g.save(); g.translate((ax + bx) / 2, (ay + by) / 2); g.rotate(Math.atan2(by - ay, bx - ax)); g.drawImage(s, -s.width / 2, -s.height / 2); g.restore();
        }
        run += d; pi++;
        if (pi >= p.length) { si++; pi = 0; }
      }
    };
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 1500), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      paint(e * total + (k >= 1 ? 1 : 0));
      if (k < 1) return requestAnimationFrame(step);
      setTimeout(() => {
        pre.classList.add("going");
        pre.style.pointerEvents = "none";
        pre.style.transition = "background-color .6s cubic-bezier(.4, 0, .2, 1)";
        pre.style.backgroundColor = "transparent";
        window.dhLock(false);
        done();
        // Clay soaks into the paper, spreads downward and vanishes (1.2s)
        cv.style.transition = "opacity 1.2s ease, filter 1.2s ease, transform 1.2s cubic-bezier(.4, 0, .2, 1)";
        cv.style.transformOrigin = "50% 40%";
        requestAnimationFrame(() => { cv.style.opacity = "0"; cv.style.filter = "blur(6px)"; cv.style.transform = "translateY(6%) scaleY(1.12)"; });
        setTimeout(() => pre.remove(), 1300);
      }, 750);
    };
    t0 = performance.now();
    requestAnimationFrame(step);
  });

  // Cookie notice box — 1.4s after the loader clears, it rises from 12px below over .5s, and pressing OK sends it back down the same path so it doesn’t show again.
  let seen = false;
  try { seen = localStorage.getItem("dh-ck") === "1"; } catch (e) {}
  if (!seen && !document.body.hasAttribute("data-no-ck") && window.top === window) {
    const ck = document.createElement("div");
    ck.className = "ck";
    ck.setAttribute("role", "region");
    ck.setAttribute("aria-label", "Cookie Notice");
    ck.innerHTML = '<p>This site uses storage only to remember a few settings, such as sound. Nothing is used for tracking.</p><button type="button">Confirm</button>';
    window.dhPreDone.then(() => setTimeout(() => { document.body.append(ck); requestAnimationFrame(() => requestAnimationFrame(() => ck.classList.add("on"))); }, 1400));
    ck.querySelector("button").addEventListener("click", () => {
      ck.classList.remove("on");
      try { localStorage.setItem("dh-ck", "1"); } catch (e) {}
      setTimeout(() => ck.remove(), 600);
    });
  }

  // The order side opens over the page without leaving it — only the address changes to shop.html, and it closes with browser back or Back inside the page
  const ordLinks = document.querySelectorAll("a[data-order]");
  if (ordLinks.length && window.top === window) {
    const ov = Object.assign(document.createElement("div"), { className: "ord-ov" });
    document.body.append(ov);
    let frame = null;
    const lock = (on) => { window.dhLock(on); root.style.overflow = on ? "hidden" : ""; };
    const open = (push = true) => {
      if (!frame) { frame = Object.assign(document.createElement("iframe"), { title: "Orders & Collaboration" }); ov.append(frame); }
      frame.src = "shop.html?in=1";
      ov.classList.add("on");
      lock(true);
      if (push && !/shop\.html$/.test(location.pathname)) history.pushState({ ord: 1 }, "", "shop.html");
    };
    const close = (hash, fromPop) => {
      if (!ov.classList.contains("on")) return;
      ov.classList.remove("on");
      lock(false);
      if (!fromPop && /shop\.html$/.test(location.pathname)) history.replaceState(null, "", "./");
      setTimeout(() => { if (frame && !ov.classList.contains("on")) frame.src = "about:blank"; }, 700);
      if (hash && hash[0] === "#") document.querySelector(`.nav a[href="${hash}"]`)?.click();
    };
    ordLinks.forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); open(); }));
    addEventListener("message", (e) => { if (e.source === frame?.contentWindow && e.data?.dh === "close") close(e.data.hash); });
    addEventListener("popstate", () => { if (/shop\.html$/.test(location.pathname)) open(false); else close(null, true); });
  }
  // Order side opened inside the cover: Back and menu links are changed to words that close the cover
  if (window.top !== window && /in=1/.test(location.search)) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href === "index.html" || href.startsWith("index.html#")) {
        e.preventDefault();
        parent.postMessage({ dh: "close", hash: href.includes("#") ? href.slice(href.indexOf("#")) : null }, "*");
      }
    });
  }

  // Four bowl shapes: half-width per height (0 top~1 bottom) — the single line between big words changes to the next shape as you scroll (first page · phone panel)
  const lerp = (a, b, t) => a + (b - a) * t;
  const inOut = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const cubicInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const vessels = [
    (t) => (t < .22 ? .1 : t < .42 ? lerp(.1, .42, inOut((t - .22) / .2)) : .42 - .06 * (t - .42)),
    (t) => .2 + .26 * Math.sin(Math.PI * Math.min(1, t * 1.05)) - .1 * Math.max(0, .15 - t) * 4,
    (t) => .14 + .3 * Math.pow(Math.sin(Math.PI * (t * .9 + .05)), 2),
    (t) => (t < .12 ? .44 : .44 - .3 * Math.pow((t - .12) / .88, 1.6)),
  ];
  window.dhVessel = (f) => {
    const a = vessels[Math.floor(f) % 4], b = vessels[(Math.floor(f) + 1) % 4], k = cubicInOut(f % 1), pts = [];
    const w = (t) => lerp(a(t), b(t), k) * 22;
    for (let i = 0; i <= 35; i++) { const t = i / 35; pts.push([26 + w(t), 4 + 44 * t]); }
    for (let i = 35; i >= 0; i--) { const t = i / 35; pts.push([26 - w(t), 4 + 44 * t]); }
    return pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2)).join("") + "Z";
  };

  // ⌘G or Ctrl+G toggles a six-column grid (margin and 20u gutters) — the tool the original used to show layout
  const grid = document.createElement("div");
  grid.className = "dh-grid";
  grid.setAttribute("aria-hidden", "true");
  grid.innerHTML = "<i></i>".repeat(6);
  document.body.append(grid);
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.code === "KeyG") { e.preventDefault(); if (!e.repeat) grid.classList.toggle("on"); }
  });
})();
