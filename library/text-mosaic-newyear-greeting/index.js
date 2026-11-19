// New Year greeting first page — hero scene sequence, two text-mosaic canvases (hero scene · per-person greeting), explanation pills, contact video parallax, progress bar.
(() => {
  const mm = gsap.matchMedia();
  const mobile = innerWidth < 767.99;
  const touch = "ontouchstart" in document.documentElement;
  const ink = () => getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim();
  const glyphFont = () => getComputedStyle(document.documentElement).getPropertyValue("--kf-font-glyph").trim() || "sans-serif";

  // Draw one letter filling the box and pick only the opaque cells at step intervals — the target positions for the mosaic dots
  const sample = (glyph, w, h, step, weight, lh = 1.35) => {
    const c = document.createElement("canvas");
    c.width = Math.ceil(w);
    c.height = Math.ceil(h);
    const x = c.getContext("2d");
    let lo = 1, hi = Math.min(w, h), size = 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      x.font = `${weight} ${mid}px ${glyphFont()}`;
      if (x.measureText(glyph).width <= w && mid * lh <= h) { size = mid; lo = mid + 1; } else hi = mid - 1;
    }
    x.font = `${weight} ${size}px ${glyphFont()}`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(glyph, w / 2, h / 2);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const pts = [];
    for (let y = 0; y < c.height; y += step) for (let xx = 0; xx < c.width; xx += step) if (d[(y * c.width + xx) * 4 + 3] > 128) pts.push({ x: xx, y });
    return pts;
  };
  // Characters within the radius of the mouse (and a virtual point drifting on its own) grow along a squared curve
  const grow = (px, py, mx, my, on, radius, max) => {
    if (!on) return 1;
    const k = Math.max(0, 1 - Math.hypot(px - mx, py - my) / radius);
    return 1 + (max - 1) * k * k;
  };

  // ── Hero mosaic: scattered letters gather into a big letter shape in 3s power3.out (mirrored canvas) ──
  const mvCanvas = document.querySelector(".q-mv__canvas");
  const startMv = () => {
    if (!mvCanvas) return;
    const ctx = mvCanvas.getContext("2d");
    const dpr = devicePixelRatio || 1;
    const step = touch ? 27 : 20, font = touch ? 27 : 30, radius = 160, max = touch ? 3.5 : 4;
    const cell = mvCanvas.dataset.cell;
    let w, h, pts = [], mouse = { x: 0, y: 0, on: false }, auto = { x: 0, y: 0 }, raf = null, t0 = performance.now(), tweens = [];
    const size = () => {
      const r = mvCanvas.getBoundingClientRect();
      w = r.width; h = r.height;
      mvCanvas.width = w * dpr; mvCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const build = () => {
      size();
      tweens.forEach((tw) => tw.kill());
      // Like the original, the shape is attached to the canvas top edge (40px below) — the upper part of the mosaic shows across the bottom of the hero
      const shape = sample(mvCanvas.dataset.shape, w, h, step, 900, 1);
      const top = Math.min(...shape.map((p) => p.y));
      pts = shape.map((p) => ({ x: Math.random() * w, y: Math.random() * h, tx: p.x, ty: p.y - top + 40 }));
      tweens = pts.map((p) => gsap.to(p, { x: p.tx, y: p.ty, delay: Math.random() * 0.5, duration: 3, ease: "power3.out" }));
    };
    const draw = (time) => {
      const s = (time - t0) / 1000;
      auto.x = w - w * (0.5 + 0.35 * Math.cos(s * 0.6));
      auto.y = h * (0.5 + 0.35 * Math.sin(s * 0.8));
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ink();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Computed style is read once per Frame — reading it per letter means hundreds of style calculations and slows interaction response
      // Set the font once per frame and scale size with a transform — changing ctx.font per letter triggers hundreds of font resolutions and slows the response to interaction.
      ctx.font = `bold ${font}px ${glyphFont()}`;
      for (const p of pts) {
        const k = Math.max(grow(p.x, p.y, mouse.x, mouse.y, mouse.on, radius, max), grow(p.x, p.y, auto.x, auto.y, true, radius, max));
        ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * p.x, dpr * p.y);
        ctx.fillText(cell, 0, 0);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    // The canvas is mirrored left-right, so the mouse x is measured flipped too
    const move = (cx, cy) => { const r = mvCanvas.getBoundingClientRect(); mouse = { x: r.width - (cx - r.left), y: cy - r.top, on: true }; };
    mvCanvas.parentElement.parentElement.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
    addEventListener("touchmove", (e) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    mvCanvas.parentElement.parentElement.addEventListener("mouseleave", () => (mouse.on = false));
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && raf == null) raf = requestAnimationFrame(draw);
      else if (!en.isIntersecting && raf != null) { cancelAnimationFrame(raf); raf = null; }
    }).observe(mvCanvas);
    if (!touch) addEventListener("resize", build);
    build();
  };

  // ── Per-person greeting mosaic: letter i → i+1 changes, tied to section scroll ──
  const stCanvas = document.querySelector(".q-staff__canvas");
  const startStaff = (still) => {
    if (!stCanvas) return;
    const ctx = stCanvas.getContext("2d");
    const dpr = Math.max(1, devicePixelRatio || 1);
    const glyphs = stCanvas.dataset.glyphs.split(",");
    const cell = stCanvas.dataset.cell;
    const step = window.qFps === "high" ? 14 : 22;
    const radius = 100, max = 2.5;
    let w, h, pairs = [], from = [], to = [], prog = 0, idx = 0, busy = false, raf = null, ready = false;
    let mouse = { x: 0, y: 0, on: false }, auto = { x: 0, y: 0 };
    const t0 = performance.now();
    const size = () => {
      w = innerWidth; h = innerHeight;
      stCanvas.width = Math.round(w * dpr); stCanvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const shapeOf = (g) => {
      const m = Math.round(Math.min(w, h) * 0.08);
      return sample(g, w - m * 2, h - m * 2, step, 700).map((p) => ({ x: p.x + m, y: p.y + m }));
    };
    const pad = (a, b) => {
      a = [...a]; b = [...b];
      while (a.length < b.length) a.push(a[(Math.random() * a.length) | 0]);
      while (b.length < a.length) b.push(b[(Math.random() * b.length) | 0]);
      return [a, b];
    };
    const build = () => {
      size();
      const shapes = glyphs.map(shapeOf);
      pairs = shapes.map((s, i) => pad(s, shapes[(i + 1) % shapes.length]));
      [from, to] = pairs[idx];
      ready = true;
    };
    const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
    const paint = (a, b, t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ink();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const base = Math.max(8, step * 1.45), e = ease(t), n = Math.min(a.length, b.length);
      ctx.font = `bold ${base}px ${glyphFont()}`;
      for (let i = 0; i < n; i++) {
        const x = a[i].x + (b[i].x - a[i].x) * e, y = a[i].y + (b[i].y - a[i].y) * e;
        const k = Math.max(grow(x, y, mouse.x, mouse.y, mouse.on, radius, max), grow(x, y, auto.x, auto.y, !still, radius, max));
        ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * x, dpr * y);
        ctx.fillText(cell, 0, 0);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const loop = (time) => {
      const s = (time - t0) / 600;
      auto.x = w * (0.5 + 0.15 * Math.cos(s * 0.6));
      auto.y = h * (0.5 + 0.15 * Math.sin(s * 0.8));
      if (!busy && ready) paint(from, to, prog);
      raf = requestAnimationFrame(loop);
    };
    addEventListener("mousemove", (e) => { const r = stCanvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top, on: true }; });
    addEventListener("blur", () => (mouse.on = false));
    document.addEventListener("mouseleave", () => (mouse.on = false));
    build();
    if (!touch) addEventListener("resize", () => { build(); ScrollTrigger.refresh(); });

    const current = document.querySelector(".q-staff__current");
    pairs.slice(0, document.querySelectorAll(".q-staff__cover").length).forEach((_, i) => {
      const sec = document.getElementById(`section${String(i + 1).padStart(2, "0")}`);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: "top bottom", end: "center center", scrub: true,
        onUpdate: (st) => { idx = i; [from, to] = pairs[i]; prog = st.progress; },
      });
      if (!mobile && current) ScrollTrigger.create({ trigger: sec, start: "top 80%", end: "bottom 80%", onEnter: () => (current.textContent = i + 1), onEnterBack: () => (current.textContent = i + 1) });
    });
    // When the fixed curtain reaches 90%, scattered dots gather into the first letter in .7s and the canvas floats up in 1.4s
    ScrollTrigger.create({
      trigger: ".q-staff__sticky", start: "top 90%", once: true,
      onEnter: () => {
        const first = pairs[0][0];
        if (still) { gsap.set(stCanvas, { opacity: mobile ? 0.6 : 1 }); return; }
        const scatter = first.map(() => ({ x: w / 2 + (Math.random() - 0.5) * w, y: h / 2 + (Math.random() - 0.5) * h }));
        const o = { p: 0 };
        busy = true;
        gsap.to(o, { p: 1, duration: 0.7, ease: "none", onUpdate: () => paint(scatter, first, o.p), onComplete: () => { busy = false; } });
        gsap.fromTo(stCanvas, { opacity: 0 }, { opacity: mobile ? 0.6 : 1, duration: 1.4 });
      },
    });
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && raf == null) raf = requestAnimationFrame(loop);
      else if (!en.isIntersecting && raf != null) { cancelAnimationFrame(raf); raf = null; }
    }, { threshold: 0.01 }).observe(stCanvas);
  };

  // Measure the frame count for the first 2 seconds, and on a fast device make the mosaic cells dense (14px)
  (() => {
    let n = 0; const t = performance.now();
    const tick = (now) => { n++; if (now - t < 2000) requestAnimationFrame(tick); else { const f = (n / (now - t)) * 1000; window.qFps = f >= 50 ? "high" : f >= 30 ? "medium" : "low"; } };
    requestAnimationFrame(tick);
  })();

  const note = document.querySelector(".q-note");
  const ready = () => document.dispatchEvent(new CustomEvent("q:ready"));

  mm.add(
    { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
    (ctx) => {
      const still = ctx.conditions.still;
      const after = document.querySelectorAll("[data-after-element]");
      if (still) {
        gsap.set(".q-mv__line > span", { y: "0%" });
        gsap.set(".q-mv__title", { fontSize: mobile ? "33.4rem" : "120rem", y: "-2svh" });
        gsap.set(".q-mv__sub", { opacity: 1, y: mobile ? "-40svh" : "-25svh" });
        gsap.set(after, { opacity: 1, pointerEvents: "auto" });
        gsap.set(note, { clipPath: "inset(0% 0% 0% 0% round 100px)" });
        startMv();
        ready();
      } else {
        // Original order: after .5s letters rise (1s, .03 stagger) → meanwhile mosaic .1 → rest 2s, then title 120rem · mosaic moves up (1.4s) → header line · pill
        gsap.timeline({ delay: 0.5, onStart: startMv, onComplete: ready })
          .to(".q-mv__line > span", { y: "0%", duration: 1, ease: "power4.out", stagger: { each: 0.03 } })
          .to(".q-mv__sub", { opacity: 0.1, duration: 3, ease: "none" }, "<")
          .to(".q-mv__title", { fontSize: mobile ? "33.4rem" : "120rem", duration: 1.4, delay: 2, ease: "power4.inOut" }, "<0.9")
          .to(".q-mv__title", { y: "-2svh", duration: 1.4, ease: "power4.inOut" }, "<")
          .to(".q-mv__sub", { opacity: 1, y: mobile ? "-40svh" : "-25svh", duration: 1.4, ease: "power4.inOut" }, "<")
          .to(after, { opacity: 1, pointerEvents: "auto", duration: 1 }, "<1")
          .to(note, { clipPath: "inset(0% 0% 0% 0% round 100px)", duration: 1.2, ease: "power4.inOut" }, "<");
      }

      // The rest attach after 2s like the original (so they don’t overlap the first scene)
      // Mosaic cell size is decided, like the original, from the frame-measuring result at this 2s mark — if measuring is not done yet, a coarse cell (22px)
      const later = setTimeout(() => {
        startStaff(still);
        ScrollTrigger.create({
          trigger: ".q-slogan", start: "top 90%",
          onEnter: () => gsap.fromTo(note, { clipPath: "inset(0% 0% 0% 0% round 100px)" }, { clipPath: "inset(0% 0% 0% 100% round 100px)", duration: still ? 0 : 1, ease: "power4.out", overwrite: "auto" }),
          onLeaveBack: () => gsap.to(note, { clipPath: "inset(0% 0% 0% 0% round 100px)", duration: still ? 0 : 1, ease: "power4.out", overwrite: "auto" }),
        });
        gsap.to(".q-staff__progress", { "--progress": "100%", ease: "none", scrollTrigger: { trigger: ".q-staff", start: "top top", end: "bottom bottom", scrub: true } });
        gsap.set(".q-contact__bg", { xPercent: -50, yPercent: -50 });
        if (!still) gsap.fromTo(".q-contact__bg", { y: "-30%" }, { y: "10%", ease: "none", scrollTrigger: { trigger: ".q-contact", start: "top bottom", end: "bottom top", scrub: true } });
        ScrollTrigger.refresh();
      }, 2000);
      return () => clearTimeout(later);
    },
  );
})();
