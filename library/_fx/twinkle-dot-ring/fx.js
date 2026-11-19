// On a painted canvas, set two rings of dots (57 per ring, .11 radian spacing, gaps here and there), and each dot occasionally (1.5% per frame) grows then
// (0~.47px per frame) shrinks down to a tiny size and returns, sparkling. When fx:swap arrives on the element the ring spins to .7x and -70° and hides, then returns after back ms
// (filmstrip-frame-event-portal Hero — each time the slide changes, a ring spins back in)
(() => {
  const range = (s) => (s || "").split(",").map((p) => p.split("-").map(Number)).filter((p) => p.length === 2 && p.every(Number.isFinite));
  kfFx.register("twinkle-dot-ring", (el, { options, reduce }) => {
    const [cw, ch] = (options.size || "1075x1100").split("x").map(Number);
    const canvas = document.createElement("canvas");
    canvas.width = cw || 1075; canvas.height = ch || 1100;
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "fx-twinkle-dot-ring__canvas";
    el.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const probe = document.createElement("span");
    probe.style.display = "none";
    el.appendChild(probe);
    const resolve = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };
    let colors = [], bg = "";
    const readColors = () => { colors = ["--fx-dot-1", "--fx-dot-2", "--fx-dot-3", "--fx-dot-4"].map(resolve); bg = resolve("--fx-ring-bg"); };
    readColors();
    const radii = (options.rings || "0.82,0.77").split(",").map(Number);
    const count = +options.count || 57, step = +(options.step ?? 0.11);
    const gaps = [range(options.gaps1 ?? "0.1875-0.3125,0.5625-0.6875"), range(options.gaps2 ?? "0.125-0.25,0.625-0.75")];
    const big = +options.big || 10, small = +options.small || 2;
    const dots = [];
    radii.forEach((r, ring) => {
      let a = 0;
      for (let k = 0; k < count; k++) {
        a += step;
        const f = k / count, hole = (gaps[ring] || []).some(([p, q]) => f > p && f < q);
        if (!hole) dots.push({ a, r: r * canvas.width / 2, size: Math.random() * (small + 4) + small, mode: "base", color: Math.floor(Math.random() * colors.length) });
      }
    });
    const draw = () => {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(cx + Math.cos(d.a) * d.r, cy + Math.sin(d.a) * d.r, d.size, 0, Math.PI * 2);
        ctx.fillStyle = colors[d.color];
        ctx.fill();
        if (reduce) continue;
        const grow = Math.random() * Math.PI * 0.15, roll = Math.random() * 2 - 1;
        if (d.mode === "base" && roll > 0.97) d.mode = "big";
        if (d.mode === "big") { if (d.size < big) d.size += grow; else d.mode = "small"; }
        if (d.mode === "small") { if (d.size > small) d.size -= grow; else d.mode = "base"; }
      }
    };
    let raf = 0, on = false;
    const loop = () => { draw(); raf = on ? requestAnimationFrame(loop) : 0; };
    const io = new IntersectionObserver((es) => { on = es[es.length - 1].isIntersecting && !reduce; if (on && !raf) loop(); });
    io.observe(el);
    draw();
    const back = +(options.back ?? 700);
    let t = 0;
    const swap = () => { if (reduce) return; el.classList.add("is-hidden"); clearTimeout(t); t = setTimeout(() => el.classList.remove("is-hidden"), back); };
    el.addEventListener("fx:swap", swap);
    const theme = new MutationObserver(readColors);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    return () => { on = false; cancelAnimationFrame(raf); io.disconnect(); theme.disconnect(); clearTimeout(t); el.removeEventListener("fx:swap", swap); canvas.remove(); probe.remove(); el.classList.remove("is-hidden"); };
  });
})();
