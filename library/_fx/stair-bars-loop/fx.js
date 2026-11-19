// On a tilted panel, rows of color bars (four cells) rise from below one row per set number of frames, stacking stairs toward the upper right, and two rounded-corner arrow lines take turns climbing the stairs.
// The original (Brand Stripe section) counts not by time but by frames drawn — one line every 120 frames, and it starts by laying down 12 lines at once.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const make = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const inOutCubic = (e) => (e < 0.5 ? 4 * e * e * e : (e - 1) * (2 * e - 2) * (2 * e - 2) + 1);
  let uid = 0;

  kfFx.register("stair-bars-loop", (el, { options, reduce }) => {
    const cols = +(options.cols || 4), w = +(options.w || 360), h = +(options.h || 72);
    const every = +(options.every || 120), keep = +(options.rows || 6), prefill = +(options.prefill ?? 12);
    const skew = +(options.skew ?? -12), colors = +(options.colors || 6);
    const step = w / 3, perShadow = Math.ceil(cols / 2);
    const id = `fx-stair-${++uid}`;

    const svg = make("svg", { class: "fx-stair", "aria-hidden": "true" });
    const defs = make("defs");
    const blur = make("filter", { id: `${id}-blur`, x: "-30%", y: "-80%", width: "160%", height: "300%" });
    blur.append(make("feGaussianBlur", { stdDeviation: h / 5 }));
    // Shadow only outside the bar — cut with cells punched out at the bar spot (an empty center keeps the upper bar color from getting muddy)
    const hole = make("clipPath", { id: `${id}-hole` });
    hole.append(make("path", { "clip-rule": "evenodd", d: `M0 0H${w + 96}V${h * 2.33}H0Z M48 18V${18 + h}H${48 + w}V18Z` }));
    const shadowShape = make("g", { id: `${id}-shadow`, "clip-path": `url(#${id}-hole)` });
    shadowShape.append(make("rect", { class: "fx-stair__shadow-shape", x: 48, y: 18 + h / 6, width: w, height: h, filter: `url(#${id}-blur)` }));
    defs.append(blur, hole, shadowShape);
    const plane = make("g", { class: "fx-stair__plane", transform: `skewY(${skew})` });
    const yWrap = make("g", { class: "fx-stair__y" });
    const xWrap = make("g", { class: "fx-stair__x" });
    yWrap.append(xWrap);
    plane.append(make("rect", { class: "fx-stair__floor", width: "100%", height: "100%" }), yWrap, make("rect", { class: "fx-stair__under", y: "100%", width: "100%", height: "100%" }));
    svg.append(defs, plane);
    el.append(svg);
    el.style.setProperty("--fx-stair-h", `${h}px`);

    let offsetX = 0, scrollYv = 0, frame = 0, total = prefill * every, numRows = 0, animating = false, raf, io, gone = false;
    const rows = [], shadows = [];
    const setX = (v) => svg.style.setProperty("--x", `${v - offsetX}px`);
    const setY = (v) => { scrollYv = v; svg.style.setProperty("--y", `${v}px`); };
    const ratio = () => frame / every;
    const resize = () => { offsetX = Math.max(0, innerWidth - 1280) / 2; };
    const pick = (taken) => {
      let c;
      while (!c || taken.includes(c)) c = 1 + Math.floor(Math.random() * colors);
      return c;
    };
    const reveal = (n) => requestAnimationFrame(() => n.removeAttribute("data-hidden"));

    const addShadows = (x, y) => {
      for (let i = 0; i < perShadow; i++) {
        const u = make("use", { href: `#${id}-shadow`, class: "fx-stair__shadow", "data-hidden": "" });
        u.style.transform = `translate(${x + i * w * 2 - 48}px, ${y - 18}px)`;
        xWrap.append(u);
        shadows.push(u);
        reveal(u);
      }
    };
    const addRow = () => {
      const n = numRows, x = n * step, y = -h * n;
      const prev = rows.at(-1)?.colors, picked = [];
      for (let c = 0; c < cols; c++) picked.push(pick([prev?.[c], ...picked]));
      const g = make("g", { class: "fx-stair__row", "data-hidden": "" });
      g.style.setProperty("--x", `${x}px`);
      g.style.setProperty("--y", `${y}px`);
      picked.forEach((c, i) => {
        const r = make("rect", { x: i * w, width: w, height: h });
        r.style.fill = `var(--fx-stair-${c})`;
        g.append(r);
      });
      rows.push({ g, colors: picked });
      numRows++;
      if (numRows % 2 === 0) addShadows(x, y);
      xWrap.prepend(g);
      reveal(g);
    };

    // Arrow line — climbs 2 steps to the right (step×2) and 2 rows up (h×2) with rounded corners. Keeps up to five segments at a time
    const linePath = (x, y) => [`M${x},${y}`, `l${2 * step - 60.024},0`, "c20,0 20,-20 20,-20", `l0,${-(2 * h - 40)}`, "c0,-20 20,-20 20,-20", "l20,0"].join(" ");
    const makeTrail = (x, y, k) => {
      const g = make("g", { class: `fx-stair__trail fx-stair__trail--${k}` });
      const arrowG = make("g");
      const arrow = make("path", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": 3, d: "M1.654 14.028l11-12 11 12" });
      arrow.style.transformOrigin = "12px 0px";
      arrowG.append(arrow);
      const trail = { g, lines: [], line: null, ax: 0, ay: 0 };
      const setCoords = ({ x: px, y: py }) => {
        const rot = 90 + (Math.atan2(py - trail.ay, px - trail.ax) * 180) / Math.PI;
        trail.ax = px; trail.ay = py;
        const a = ((rot - 90) * Math.PI) / 180;
        arrowG.style.transform = `translate(${px + Math.cos(a) * 3}px, ${py + Math.sin(a) * 3}px) skewY(4deg)`;
        arrow.style.transform = `translate(-12px, 0px) rotate(${rot}deg)`;
      };
      trail.addLine = () => {
        const p = make("path", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": 3, d: linePath(trail.ax, trail.ay) });
        g.append(p);
        const len = p.getTotalLength();
        p.setAttribute("stroke-dasharray", `${len} ${len}`);
        p.setAttribute("stroke-dashoffset", String(len));
        const pts = Array.from({ length: Math.ceil(len) }, (_, i) => p.getPointAtLength(i));
        trail.line = { p, len, pts, r: 0 };
        trail.lines.push(trail.line);
      };
      trail.pop = () => trail.lines.shift().p.remove();
      trail.tick = (e) => {
        const l = trail.line, r = inOutCubic(e);
        l.r = r;
        l.p.setAttribute("stroke-dashoffset", String(l.len - l.len * r));
        const pt = l.pts[Math.min(l.pts.length - 1, Math.abs(Math.round(l.len * r)))];
        if (pt) setCoords(pt);
      };
      setCoords({ x, y });
      trail.addLine();
      g.append(arrowG);
      xWrap.append(g);
      return trail;
    };

    resize();
    setX(0);
    setY(1);
    const trails = [makeTrail(-2 * step - 39.976, scrollYv + h - 40, "a"), makeTrail(-step - 39.988, scrollYv - 40, "b")];

    const tickRows = () => {
      if (ratio() % 1 !== 0) return;
      addRow();
      if (numRows > keep) { setY(scrollYv + h); rows.shift().g.remove(); }
    };
    const tickShadows = () => {
      if (ratio() % 2 !== 0 || shadows.length / perShadow <= rows.length / 2) return;
      for (let i = 0; i < perShadow; i++) shadows.shift().remove();
    };
    const tickTrails = () => trails.forEach((t, i) => {
      const k = (ratio() - i) % trails.length;
      if (k === 0) { t.tick(1); t.addLine(); if (t.lines.length > 5) t.pop(); }
      t.tick(k / trails.length);
    });
    const tick = () => {
      if (gone) return;
      setX(-(ratio() * step + step));
      tickRows();
      tickShadows();
      tickTrails();
      if (animating || frame === total) {
        frame++;
        total = null;
        if (animating) raf = requestAnimationFrame(tick);
        else start();
      } else if (total && frame < total) {
        frame += every;
        tick();
      }
    };
    const start = () => {
      if (reduce) return;
      raf = requestAnimationFrame(() => {
        animating = true;
        el.setAttribute("data-animating", "");
        io = new IntersectionObserver((list) => {
          cancelAnimationFrame(raf);
          if (list[0].isIntersecting) raf = requestAnimationFrame(tick);
        });
        io.observe(el);
      });
    };

    addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
    return () => {
      gone = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
      removeEventListener("resize", resize);
      el.removeAttribute("data-animating");
      svg.remove();
    };
  });
})();
