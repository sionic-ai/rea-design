// Lays canvas lines on the board, each line a 100-point sine curve (y = Draw (amplitude·sin(2(x/width·π + speed·seconds)) + center) as a 2px line.
// Line color: a two-color 4-stripe horizontal gradient flows every frame (flow px) and is kept only in the curve shape (destination-in) — pink ↔ sky blue flows along the line
(() => {
  const list = (v, d) => String(v ?? d).split(",").map((s) => +s.trim());
  kfFx.register("sine-gradient-lines", (el, { options, reduce }) => {
    const n = Math.max(1, Math.round(+options.lines || 2));
    const wide = { amp: list(options.amp, "80,70"), speed: list(options.speed, "0.35,0.22"), flow: list(options.flow, "10,7"), base: +options.base || 1440 };
    const narrow = { amp: list(options["narrow-amp"], "40,30"), speed: list(options["narrow-speed"], "0.44,0.19"), flow: list(options["narrow-flow"], "5,3"), base: +options["narrow-base"] || 414 };
    const mq = matchMedia(`(max-width: ${+(options["narrow-at"] ?? 769)}px)`);
    const cvs = Array.from({ length: n }, () => { const c = document.createElement("canvas"); c.className = "fx-sine-line"; c.setAttribute("aria-hidden", "true"); el.append(c); return c; });
    const shift = cvs.map(() => 0);
    let raf = 0, seen = true;
    const color = (name, fall) => getComputedStyle(el).getPropertyValue(name).trim() || getComputedStyle(el).getPropertyValue(fall).trim();
    const size = () => cvs.forEach((c) => { const d = devicePixelRatio || 1; c.width = Math.max(1, el.clientWidth * d); c.height = Math.max(1, el.clientHeight * d); });
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    const draw = (now) => {
      const p = mq.matches ? narrow : wide, d = devicePixelRatio || 1, k = el.clientWidth / p.base;
      const a = color("--fx-wave-a", "--kf-accent-soft"), b = color("--fx-wave-b", "--kf-dim");
      cvs.forEach((c, i) => {
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const w = c.width, h = c.height, j = i % p.amp.length;
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
        if (!reduce && (shift[i] += p.flow[j % p.flow.length] ?? 0) > 2 * w) shift[i] = 0;
        const g = ctx.createLinearGradient(-shift[i], 0, 4 * w - shift[i], 0);
        [b, a, b, a, b].forEach((col, s) => g.addColorStop(s / 4, col));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "destination-in";
        ctx.lineWidth = 2;
        ctx.beginPath();
        const t = (p.speed[j % p.speed.length] ?? 0.3) * (reduce ? 0 : now / 1000), amp = p.amp[j] * k * d;
        for (let s = 0; s < 100; s++) {
          const x = (s / 99) * w, y = amp * Math.sin(2 * ((s / 100) * Math.PI + t)) + h / 2;
          s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      });
      raf = !reduce && seen ? requestAnimationFrame(draw) : 0;
    };
    const io = new IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; if (seen && !raf && !reduce) raf = requestAnimationFrame(draw); });
    io.observe(el);
    draw(performance.now());
    return () => { cancelAnimationFrame(raf); raf = 0; io.disconnect(); ro.disconnect(); cvs.forEach((c) => c.remove()); };
  });
})();
