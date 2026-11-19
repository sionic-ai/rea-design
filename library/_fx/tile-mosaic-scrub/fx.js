// 42-frame cell plate — per cell: line (26 frames from lag, center to both ends)·shape (16 frames from lag+10)·fill-in (6 frames at 29·34).
// Stretches section progress from~to over frames 0~42 and paints that frame’s value directly (tied to scroll)
(() => {
  kfFx.register("tile-mosaic-scrub", (el, { options, reduce, scroller }) => {
    const host = el.querySelector('[data-fx-part="canvas"]') || el;
    const N = Math.max(1, Math.round(+options.cols || 8)), C = 180, W = N * C;
    const from = +(options.from ?? 0.5), to = +(options.to ?? 1);
    let seed = Math.round(+options.seed || 7);
    const rand = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const shape = (kind, x, y, r) => {
      const h = C / 2;
      const rot = ([a, b]) => { for (let n = 0; n < r; n++) [a, b] = [-b, a]; return `${a + x} ${b + y}`; };
      if (kind === "square") return `M${x - h} ${y - h}h${C}v${C}h${-C}Z`;
      if (kind === "quarter") { const [a, b, c] = [[-h, -h], [h, -h], [-h, h]].map(rot); return `M${a}L${b}A${C} ${C} 0 0 1 ${c}Z`; }
      const [a, b] = [[-h, -h], [h, -h]].map(rot);
      return `M${a}L${b}A${h} ${h} 0 0 1 ${a}Z`;
    };
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "fx-mosaic");
    svg.setAttribute("viewBox", `0 0 ${W} ${W}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMin slice");
    svg.setAttribute("aria-hidden", "true");
    const fills = document.createElementNS(NS, "g"), lines = document.createElementNS(NS, "g");
    svg.append(fills, lines);
    const cells = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const r = rand(), w = rand();
      const kind = r < 0.5 ? "square" : r < 0.8 ? "quarter" : "half";
      const lag = w < 0.38 ? 0 : w < 0.54 ? 5 : w < 0.9 ? 10 : 15;
      const x = i * C + C / 2, y = j * C + C / 2, rot = Math.floor(rand() * 4), late = rand() < 0.3 ? 34 : 29;
      const d = shape(kind, x, y, rot);
      const fill = document.createElementNS(NS, "path");
      fill.setAttribute("d", d);
      fill.setAttribute("class", "fx-mosaic-fill");
      const line = document.createElementNS(NS, "path");
      line.setAttribute("d", d);
      line.setAttribute("class", "fx-mosaic-line");
      line.setAttribute("pathLength", "100");
      fills.append(fill);
      lines.append(line);
      let rest = null;
      if (kind !== "square") {
        rest = document.createElementNS(NS, "path");
        rest.setAttribute("d", shape("square", x, y, 0));
        rest.setAttribute("class", "fx-mosaic-fill");
        fills.append(rest);
      }
      cells.push({ fill, line, rest, lag, late });
    }
    host.append(svg);
    const io = gsap.parseEase(kfFx.ease("0.9,0,0.1,1", "power4.inOut"));
    const clamp = (v) => Math.min(Math.max(v, 0), 1);
    const draw = (f) => {
      cells.forEach((c) => {
        const h = io(clamp((f - c.lag) / 26)) * 50;
        c.line.style.strokeDasharray = `${2 * h} 100`;
        c.line.style.strokeDashoffset = String(-(50 - h));
        c.fill.style.opacity = String(io(clamp((f - c.lag - 10) / 16)));
        if (c.rest) c.rest.style.opacity = String(clamp((f - c.late) / 6));
      });
    };
    gsap.registerPlugin(ScrollTrigger);
    let st = null;
    if (reduce) draw(42);
    else {
      draw(0);
      st = ScrollTrigger.create({
        scroller, trigger: el, start: "top top", end: options.end || "bottom bottom+=10%", invalidateOnRefresh: true,
        onUpdate: (s) => draw(clamp((s.progress - from) / Math.max(0.0001, to - from)) * 42),
      });
    }
    return () => { st?.kill(); svg.remove(); };
  });
})();
