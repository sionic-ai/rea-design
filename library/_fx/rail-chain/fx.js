(() => {
  // Segments enter along a hidden rail (svg path) in a line at a constant speed and loop endlessly — like a dragon, train or procession whose body follows the path exactly.
  // At each joint, path tangent + 180° turn so the front (left) faces the direction of travel, and when going right it flips vertically to keep the back up.
  // Flip only while the segment is off screen so it never flips abruptly in view (original numbers: speed 220 units/s · gap 96 · phone 45)
  kfFx.register("rail-chain", (el, { options, reduce }) => {
    const svg = el.querySelector('[data-fx-part="rail"]'), path = svg?.querySelector("path");
    const links = [...el.querySelectorAll('[data-fx-part="link"]')];
    if (!svg || !path || !links.length) return;
    const narrow = innerWidth <= 750;
    const speed = +options.speed || 220, spacing = +(narrow ? options["spacing-phone"] ?? options.spacing ?? 45 : options.spacing ?? 96);
    const delay = +(options.delay ?? 0), noFlip = options.flip === "off";
    const len = path.getTotalLength();
    if (!len) return;
    const lut = [];
    for (let i = 0; i <= 1000; i++) {
      const d = (i / 1000) * len, p = path.getPointAtLength(d), q = path.getPointAtLength(Math.min(d + 1, len));
      const a = Math.atan2(q.y - p.y, q.x - p.x);
      lut.push({ x: p.x, y: p.y, rot: a + Math.PI, flip: Math.abs(a) < Math.PI / 2 });
    }
    const at = (t) => {
      t = Math.max(0, Math.min(1, t));
      const f = t * 1000, lo = Math.floor(f), hi = Math.min(lo + 1, 1000), k = f - lo, A = lut[lo], B = lut[hi];
      let dr = B.rot - A.rot;
      if (dr > Math.PI) dr -= 2 * Math.PI;
      if (dr < -Math.PI) dr += 2 * Math.PI;
      return { x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k, rot: A.rot + dr * k, flip: k < 0.5 ? A.flip : B.flip };
    };
    let scale = 1, off = { x: 0, y: 0 }, box = { w: 0, h: 0 };
    const measure = () => {
      const r = el.getBoundingClientRect(), s = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      scale = s.width / (vb?.width || s.width || 1); off = { x: s.left - r.left, y: s.top - r.top }; box = { w: r.width, h: r.height };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    // Node’s anchor point (center by default) — data-key="0.7 0.5" Like a share of width · height
    const origin = links.map((l) => (l.dataset.key || "0.5 0.5").split(/\s+/).map(Number));
    const flips = links.map(() => false);
    const state = { progress: 0 };
    let entered = false;
    const per = spacing / len;
    const draw = () => {
      links.forEach((l, i) => {
        let t = entered ? (((state.progress - i * per) % 1) + 1) % 1 : state.progress - i * per;
        if (t < 0) { l.style.visibility = "hidden"; return; }
        const p = at(t), x = p.x * scale + off.x, y = p.y * scale + off.y;
        if (!(x > -100 && x < box.w + 100 && y > -100 && y < box.h + 100)) flips[i] = p.flip;
        const [ox, oy] = origin[i], w = l.offsetWidth, h = l.offsetHeight;
        l.style.visibility = "visible";
        l.style.transformOrigin = `${ox * 100}% ${oy * 100}%`;
        l.style.transform = `translate(${x - ox * w}px, ${y - oy * h}px) rotate(${p.rot}rad)${flips[i] && !noFlip ? " scaleY(-1)" : ""}`;
      });
    };
    const loop = len / speed, entry = links.length * per;
    if (reduce) { entered = true; state.progress = entry; draw(); return () => ro.disconnect(); }
    const tl = gsap.timeline({ delay })
      .to(state, { progress: entry, duration: entry * loop, ease: "none", onUpdate: draw, onComplete: () => (entered = true) })
      .to(state, { progress: entry + 1, duration: loop, ease: "none", onUpdate: draw, repeat: -1 });
    return () => { tl.kill(); ro.disconnect(); links.forEach((l) => { l.style.transform = l.style.visibility = l.style.transformOrigin = ""; }); };
  });
})();
