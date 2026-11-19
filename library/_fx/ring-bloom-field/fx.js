(() => {
  // In positions clustered toward the plate center (normal distribution), 1px rings spawn 0~rate per frame, grow 0 → 1x over life seconds, and fade once past fade.
  // The back layer is dark and the front layer is light, but the front layer shows only inside the mask silhouette, so a face emerges within the ring swarm. Pressing adds a ring at that spot.
  const colorOf = (el, prop) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;color:var(${prop})`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const x = cv.getContext("2d");
    x.fillStyle = c;
    x.fillRect(0, 0, 1, 1);
    const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
    return (r << 16) | (g << 8) | b;
  };
  // Original b(): redraws (√(−2 ln u)·sin 2πv + 3) / 6 until it falls within 0~1
  const gauss = () => {
    for (;;) {
      const v = (Math.sqrt(-2 * Math.log(Math.random() || 1e-9)) * Math.sin(2 * Math.PI * Math.random()) + 3) / 6;
      if (v >= 0 && v < 1) return v;
    }
  };
  // Our mask silhouette — an egg-shaped face based on the plate’s short side (s), two smiling eyes, an open mouth as a hole, a beard tuft under the chin
  const drawFace = (g, cx, cy, s) => {
    g.clear();
    g.beginFill(0xffffff, 1);
    g.drawEllipse(cx, cy - 0.03 * s, 0.25 * s, 0.33 * s);
    g.beginHole();
    g.drawEllipse(cx - 0.1 * s, cy - 0.06 * s, 0.06 * s, 0.016 * s);
    g.drawEllipse(cx + 0.1 * s, cy - 0.06 * s, 0.06 * s, 0.016 * s);
    g.drawEllipse(cx, cy + 0.15 * s, 0.1 * s, 0.028 * s);
    g.endHole();
    g.drawPolygon([cx - 0.08 * s, cy + 0.26 * s, cx + 0.08 * s, cy + 0.26 * s, cx + 0.02 * s, cy + 0.47 * s, cx - 0.03 * s, cy + 0.45 * s]);
    g.endFill();
  };

  kfFx.register("ring-bloom-field", (el, { options, reduce }) => {
    if (!window.PIXI || !window.gsap) return;
    const rate = Math.max(0, Math.round(+(options.rate ?? 2)));
    const life = Math.max(0.05, +(options.life ?? 4));
    const size = +(options.size ?? 0.1);
    const fade = Math.min(0.99, Math.max(0, +(options.fade ?? 0.7)));
    const look = options.mask || "face";
    const cs = getComputedStyle(el);
    if (cs.position === "static") el.style.position = "relative";
    const col = { bg: colorOf(el, "--fx-ring-bg"), dim: colorOf(el, "--fx-ring-dim"), lit: colorOf(el, "--fx-ring-lit") };

    const app = new PIXI.Application({ antialias: true, resolution: Math.min(2, devicePixelRatio || 1), autoDensity: true, width: el.clientWidth || 1, height: el.clientHeight || 1, backgroundColor: col.bg });
    app.ticker.stop();
    app.view.setAttribute("aria-hidden", "true");
    el.append(app.view);
    const back = new PIXI.Container(), front = new PIXI.Container();
    app.stage.addChild(back, front);
    let mask = null;
    const part = el.querySelector('[data-fx-part="mask"]');
    if (look === "part" && part) {
      mask = PIXI.Sprite.from(part.currentSrc || part.src || part.getAttribute("href") || "");
      mask.anchor.set(0.5);
      part.hidden = true;
    } else if (look === "face") mask = new PIXI.Graphics();
    if (mask) { app.stage.addChild(mask); front.mask = mask; }

    let W = 1, H = 1, min = 1;
    const layout = () => {
      W = el.clientWidth || 1; H = el.clientHeight || 1; min = Math.min(W, H);
      app.renderer.resize(W, H);
      if (mask instanceof PIXI.Graphics) drawFace(mask, W / 2, H / 2, min);
      else if (mask) { mask.position.set(W / 2, H / 2); mask.width = mask.height = min; }
    };
    layout();

    const rings = new Set();
    const add = (layer, color, x, y, t0 = 0) => {
      const g = new PIXI.Graphics();
      g.lineStyle(1, color, 1, 0.5, true);
      g.drawCircle(0, 0, size * min);
      g.position.set(x ?? gauss() * W, y ?? gauss() * H);
      const r = { g, t: t0 };
      const paint = () => { g.scale.set(r.t); g.alpha = r.t > fade ? 1 - (r.t - fade) / (1 - fade) : 1; };
      paint();
      layer.addChild(g);
      rings.add(r);
      if (reduce) return;
      r.tw = gsap.to(r, { t: 1, duration: life * (1 - t0), ease: "none", onUpdate: paint, onComplete: () => { rings.delete(r); g.destroy(); } });
    };
    const spawn = () => {
      for (let i = Math.floor(Math.random() * (rate + 1)); i > 0; i--) add(back, col.dim);
      for (let i = Math.floor(Math.random() * (rate + 1)); i > 0; i--) add(front, col.lit);
    };
    const frame = () => { spawn(); app.render(); };
    // delay — the first ring appears this long after the panel attaches (the original has about 1s of blank background while the framework wakes up and creates the canvas)
    let playing = false, seen = false, ready = !(+(options.delay ?? 0) > 0);
    const play = () => { if (playing || reduce || !ready) return; playing = true; gsap.ticker.add(frame); };
    const wait = ready ? null : gsap.delayedCall(+options.delay, () => { ready = true; if (seen) play(); });
    const pause = () => { if (!playing) return; playing = false; gsap.ticker.remove(frame); };
    if (reduce) {
      // Reduced-motion screen is a single scene — rings laid out at several ages and drawn once
      const n = Math.round(life * 60 * rate * 0.5);
      for (let i = 0; i < n; i++) { add(back, col.dim, undefined, undefined, Math.random()); add(front, col.lit, undefined, undefined, Math.random()); }
      app.render();
    }

    const io = new IntersectionObserver((es) => es.forEach((e) => { seen = e.isIntersecting; seen ? play() : pause(); }));
    io.observe(el);
    const ro = new ResizeObserver(() => { layout(); if (!playing) app.render(); });
    ro.observe(el);
    const onClick = (e) => {
      const b = el.getBoundingClientRect();
      add(back, col.lit, e.clientX - b.left, e.clientY - b.top);
      if (!playing) app.render();
    };
    el.addEventListener("click", onClick);

    return () => {
      wait?.kill();
      pause();
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("click", onClick);
      rings.forEach((r) => r.tw?.kill());
      rings.clear();
      if (part) part.hidden = false;
      app.destroy(true, { children: true });
    };
  });
})();
