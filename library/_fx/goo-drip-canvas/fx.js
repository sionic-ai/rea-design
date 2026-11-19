// Dot inside the plate (data-fx-part="point") each time, a chocolate strand stretches downward, the end drop falls, and it briefly rewinds, repeating.
// Draw several balls joined together, then melt them together with a goo filter (blur 4 · alpha 12 −4) — each line’s thickness, length and period differ slightly every time it opens.
(() => {
  const C = { MAX_R: 24, MIN_R: 12, R_FALL: 0.85, TIP: 0.88, MAX_LEN: 106, MIN_LEN: 18, SMOOTH: 10, MAX_DUR: 12, MIN_DUR: 6, BACK: 0.05, MIN_GAP: 0.1, DROP_V: 100 };
  const lerp = (r, a, b) => a + r * (b - a);
  const odd = (v) => { const f = Math.floor(v); return f % 2 === 1 ? f : f + 1; };
  // Growth curve cubic-bezier(.42,0,.12,1) — solve t from x with five Newton iterations
  const grow = (x) => {
    const bx = (t) => 3 * (1 - t) * (1 - t) * t * 0.42 + 3 * (1 - t) * t * t * 0.12 + t * t * t;
    const dx = (t) => 3 * (1 - t) * (1 - t) * 0.42 + 6 * (1 - t) * t * (0.12 - 0.42) + 3 * t * t * (1 - 0.12);
    let t = x;
    for (let i = 0; i < 5; i++) { const d = dx(t); if (!d) break; t = Math.max(0, Math.min(1, t - (bx(t) - x) / d)); }
    return 3 * (1 - t) * t * t + t * t * t;
  };
  const back = (t) => 1 - (1 - t) ** 5;
  let filterMade = false;
  const ensureFilter = () => {
    if (filterMade || document.getElementById("fx-goo")) { filterMade = true; return; }
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    svg.innerHTML = '<filter id="fx-goo" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b"/><feColorMatrix in="b" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 12 -4" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter>';
    document.body.append(svg);
    filterMade = true;
  };

  class Line {
    constructor(color, scale) {
      const r = Math.random();
      this.color = color;
      this.radius = lerp(r, C.MIN_R, C.MAX_R) * scale;
      this.n = odd(r * C.SMOOTH) + 2;
      this.gap = (lerp(r, C.MIN_LEN, C.MAX_LEN) * scale) / (this.n - 1);
      this.minGap = this.gap * C.MIN_GAP;
      this.dur = lerp(r, C.MAX_DUR, C.MIN_DUR);
      this.backDur = this.dur * C.BACK;
      this.time = r * this.dur;
      this.backing = false;
      this.drops = [];
      this.x = 0; this.y = 0; this.p = 0;
    }
    radiusAt(i) { return this.radius * (i < Math.ceil(this.n / 2) ? C.R_FALL ** i : C.R_FALL ** (this.n - i) * C.TIP); }
    step(dt) {
      this.time += dt;
      const t = Math.min(1, Math.max(0, this.backing ? this.time / this.backDur : this.time / this.dur));
      this.p = this.backing ? 1 - back(t) : grow(t);
      if (!this.backing && this.time >= this.dur) {
        this.time -= this.dur;
        this.backing = true;
        const i = this.n - 1;
        this.drops.push({ x: this.x, y: this.y + this.gap * this.p * i + this.minGap * i, r: this.radiusAt(i), v: C.DROP_V * this.dur, life: 0 });
      }
      if (this.backing && this.time >= this.backDur) { this.time -= this.backDur; this.backing = false; }
      this.drops = this.drops.filter((d) => { d.life += dt; d.v += 9.81 * dt; d.y += d.v * dt; return d.life <= 10; });
    }
    draw(ctx) {
      ctx.beginPath();
      for (let i = 0; i < this.n; i++) {
        const y = this.y + this.gap * this.p * i + this.minGap * i, r = this.radiusAt(i);
        ctx.moveTo(this.x + r, y);
        ctx.arc(this.x, y, r, 0, Math.PI * 2);
      }
      for (const d of this.drops) { ctx.moveTo(d.x + d.r, d.y); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); }
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  kfFx.register("goo-drip-canvas", (el, { options, reduce }) => {
    const points = [...el.querySelectorAll('[data-fx-part="point"]')];
    if (!points.length) return;
    ensureFilter();
    const scale = +(options.scale ?? 1), fps = +(options.fps || 60);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-goo-canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(2, devicePixelRatio || 1);
    const lines = points.map((p) => ({ p, line: new Line(getComputedStyle(p).color, scale) }));
    const size = () => {
      const r = el.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    };
    const place = () => {
      const b = el.getBoundingClientRect();
      lines.forEach(({ p, line }) => {
        // Dots of a hidden panel (display: none) have position 0, so they are drawn at the panel’s top left — that row is left idle
        line.off = !p.getClientRects().length;
        if (line.off) return;
        const r = p.getBoundingClientRect();
        line.x = r.left - b.left + r.width / 2;
        line.y = r.top - b.top + r.height / 2;
        line.color = getComputedStyle(p).color;
      });
    };
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lines.forEach(({ line }) => line.off || line.draw(ctx));
    };
    size(); place();
    // With reduced motion, just one half-drooped line
    if (reduce) { lines.forEach(({ line }) => { line.p = 0.5; }); draw(); return () => canvas.remove(); }
    let raf = 0, last, on = false;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (last === undefined) last = now;
      const dt = now - last;
      if (dt < 1000 / fps) return;
      last = now - (dt % (1000 / fps));
      place();
      lines.forEach(({ line }) => line.off || line.step(Math.min(dt, 100) / 1000));
      draw();
    };
    const start = () => { if (!on) { on = true; last = undefined; raf = requestAnimationFrame(loop); } };
    const stop = () => { on = false; cancelAnimationFrame(raf); };
    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()), { rootMargin: "0px 0px 200px 0px" });
    io.observe(el);
    const ro = new ResizeObserver(() => { size(); place(); });
    ro.observe(el);
    const vis = () => { if (!document.hidden) last = undefined; };
    document.addEventListener("visibilitychange", vis);
    return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", vis); canvas.remove(); };
  });
})();
