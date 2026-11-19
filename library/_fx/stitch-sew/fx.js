(() => {
  // Stitched dashed line — each ”tata” advances one stitch plus one gap, repeating a short run, a pause, and a long run (sewAnimator preset values).
  // Numbers: cycle through [steps in the short bundle, steps in the long bundle], the short bundle ticks one step every short ms, the long one every long ms, with a pause ms rest between
  const PRESETS = {
    normal: { short: 57, long: 57, pause: [0], pattern: [[15, 40], [12, 35], [10, 50]] },
    slow: { short: 96, long: 96, pause: [400, 300, 600], pattern: [[5, 30], [8, 25], [10, 22]] },
    notStop: { short: 42, long: 28, pause: [0], pattern: [[15, 40], [12, 35], [10, 50]] },
    long: { short: 100, long: 32, pause: [0], pattern: [[10, 70], [15, 80]] },
  };
  const NS = "http://www.w3.org/2000/svg";
  const schedule = (count, p) => {
    const times = [];
    let t = 0;
    for (let i = 0; times.length < count; i++) {
      const [a, b] = p.pattern[i % p.pattern.length];
      for (let k = 0; k < a && times.length < count; k++) times.push((t += p.short));
      t += p.pause[i % p.pause.length];
      for (let k = 0; k < b && times.length < count; k++) times.push((t += p.long));
    }
    return times;
  };

  kfFx.register("stitch-sew", (el, { options, reduce }) => {
    const own = el.querySelector('svg [data-fx-part="path"]');
    const svg = own ? own.ownerSVGElement : document.createElementNS(NS, "svg");
    const path = own || document.createElementNS(NS, "path");
    if (!own) {
      svg.setAttribute("class", "fx-stitch-sew__svg");
      svg.setAttribute("aria-hidden", "true");
      svg.append(path);
      el.append(svg);
    }
    path.classList.add("fx-stitch-sew__line");
    let len = 0, unit = 1, shown = 0, tw = null, timer = 0, io = null;
    const sizes = () => {
      const cs = getComputedStyle(el);
      return [parseFloat(cs.getPropertyValue("--fx-stitch")) || 5, parseFloat(cs.getPropertyValue("--fx-gap")) || 5];
    };
    const count = () => { const [s, g] = sizes(); return Math.ceil(len / ((s + g) * unit)); };
    // Only as many stitch·gap pairs as the revealed stitches are laid out and the rest is one long gap — no mask, it grows one stitch at a time from the end
    const draw = () => {
      if (!len) return;
      const [s, g] = sizes();
      const n = Math.max(0, Math.min(shown, count()));
      path.setAttribute("stroke-dasharray", n ? Array(n).fill(`${s * unit} ${g * unit}`).join(" ") + ` 0 ${len + 10}` : `0 ${len + 10}`);
    };
    const layout = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (own) {
        const vb = svg.viewBox.baseVal;
        unit = vb && vb.width && w && h ? 1 / Math.min(w / vb.width, h / vb.height) : 1;
      } else {
        const vertical = options.dir ? options.dir === "y" : h > w;
        path.setAttribute("d", vertical ? `M0.5 0 V${h}` : `M0 0.5 H${w}`);
        unit = 1;
      }
      len = path.getTotalLength ? path.getTotalLength() : 0;
      draw();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const full = () => { shown = Infinity; draw(); };
    const sew = () => {
      if (reduce) return full();
      const times = schedule(count(), PRESETS[options.preset] || PRESETS.normal);
      const end = times[times.length - 1] || 0;
      const state = { t: 0 };
      tw = gsap.to(state, {
        t: end, duration: end / 1000, ease: "none",
        onUpdate() { let n = 0; while (n < times.length && times[n] <= state.t) n++; if (n !== shown) { shown = n; draw(); } },
        onComplete: full,
      });
    };
    const delay = +(options.delay ?? 200);
    const go = () => { timer = setTimeout(sew, delay); };
    if (options.on === "load") go();
    else {
      // Like original js-trigger, fires once when it enters the area excluding the bottom 20% of the screen
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); go(); } }, { rootMargin: options.margin || "-20% 0px 0%" });
      io.observe(el);
    }
    return () => {
      clearTimeout(timer);
      tw && tw.kill();
      io && io.disconnect();
      ro.disconnect();
      path.removeAttribute("stroke-dasharray");
      path.classList.remove("fx-stitch-sew__line");
      if (!own) svg.remove();
    };
  });
})();
