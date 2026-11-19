(() => {
  // A point of light on the window border — unroll the perimeter into one line (top → right → bottom → left) and treat it as position s on that line.
  // When the cursor is over the window or within 12px, it slides to the edge spot nearest the cursor. If it would have to jump more than 18% of the perimeter, it turns off and turns back on at the new spot.
  const NEAR = 12, JUMP = 0.18;
  const smooth = (e) => e * e * (3 - 2 * e);
  const DUST = 140 / 1296000;

  const unroll = ({ x, y }, { w, h }) => (y <= 0 ? x : x >= w ? w + y : y >= h ? w + h + (w - x) : 2 * w + h + (h - y));
  const roll = (s, { w, h }) => {
    const p = 2 * (w + h);
    s = ((s % p) + p) % p;
    if (s < w) return { x: s, y: 0 };
    if (s < w + h) return { x: w, y: s - w };
    if (s < 2 * w + h) return { x: w - (s - w - h), y: h };
    return { x: 0, y: h - (s - 2 * w - h) };
  };
  const nearest = (x, y, { w, h }) => {
    const cx = Math.min(Math.max(x, 0), w), cy = Math.min(Math.max(y, 0), h);
    if (cx > 0 && cx < w && cy > 0 && cy < h) {
      const d = [cy, h - cy, cx, w - cx], i = d.indexOf(Math.min(...d));
      return [{ x: cx, y: 0 }, { x: cx, y: h }, { x: 0, y: cy }, { x: w, y: cy }][i];
    }
    return { x: cx, y: cy };
  };
  const shortest = (a, b, { w, h }) => {
    const p = 2 * (w + h);
    return (((b - a) % p) + p * 1.5) % p - p / 2;
  };
  const rest = (o, size) => {
    const at = Math.min(Math.max(+(o.at ?? 0.5), 0), 1), { w, h } = size;
    const pt = { corner: { x: w, y: h }, top: { x: w * at, y: 0 }, right: { x: w, y: h * at }, left: { x: 0, y: h * at }, bottom: { x: w * at, y: h } }[o.side] || { x: w * at, y: h };
    return unroll(pt, size);
  };
  // Rim, bleed and dust go in front of the window, the border ring behind it. Same stacking order as the original
  const add = (parent, tag, part, inner, before) => {
    const n = document.createElement(tag);
    n.setAttribute("data-fx-part", part);
    n.setAttribute("aria-hidden", "true");
    if (inner) n.append(document.createElement("i"));
    before ? parent.insertBefore(n, before) : parent.append(n);
    return n;
  };

  kfFx.register("edge-light-follow", (el, { options, reduce, hover }) => {
    const frame = el.querySelector(':scope > [data-fx-part="frame"]') || [...el.children].find((c) => !c.hasAttribute("data-fx-part"));
    if (!frame) return;
    const made = [];
    const shell = add(el, "span", "shell", true, frame);
    const glow = add(el, "span", "glow", true, frame);
    const dust = options.dust === "off" ? null : add(el, "canvas", "dust", false, frame);
    const rim = add(el, "span", "rim");
    const line = add(el, "span", "line", true);
    const box = add(frame, "span", "spot-box");
    const spot = add(box, "span", "spot");
    made.push(shell, glow, rim, line, box);
    if (dust) made.push(dust);
    if (getComputedStyle(frame).position === "static") frame.style.position = "relative";
    el.classList.add("is-fx-lit");

    let size = { w: 1, h: 1 }, off = { x: 0, y: 0 }, g = 130;
    const st = { s: 0, target: 0, k: 1, pending: null };
    let pointer = null, running = false, inView = false;

    // Light position and intensity are written directly on each panel that uses the value — passing them via an outer panel variable leaves the panel’s own style unchanged so watchers miss the change
    const draw = () => {
      const p = roll(st.s, size), k = smooth(st.k), kk = k.toFixed(3), at = `translate(${p.x}px, ${p.y}px)`;
      glow.style.setProperty("--fx-px", `${p.x}px`);
      glow.style.setProperty("--fx-py", `${p.y}px`);
      glow.style.setProperty("--fx-k", kk);
      line.style.opacity = kk;
      shell.firstChild.style.transform = at; shell.firstChild.style.opacity = kk;
      line.firstChild.style.transform = at;
      spot.style.transform = at; spot.style.opacity = kk;
      light.p = p; light.k = k;
    };

    const measure = () => {
      size = { w: frame.offsetWidth || 1, h: frame.offsetHeight || 1 };
      off = { x: frame.offsetLeft, y: frame.offsetTop };
      const cs = el.style;
      cs.setProperty("--fx-x", `${off.x}px`);
      cs.setProperty("--fx-y", `${off.y}px`);
      cs.setProperty("--fx-w", `${size.w}px`);
      cs.setProperty("--fx-h", `${size.h}px`);
      cs.setProperty("--fx-r", getComputedStyle(frame).borderTopLeftRadius);
      g = parseFloat(getComputedStyle(glow).getPropertyValue("--fx-g")) || 130;
      if (!st.moved) { st.s = st.target = rest(options, size); }
      draw();
      sizeDust();
    };

    // Dust floating around the border — visible only near the light, and the window interior is left empty (30fps, 15fps when still)
    const light = { p: null, k: 1 };
    let ctx = null, dots = [], dw = 0, dh = 0, raf = 0, last = 0;
    const seed = (fill) => ({ x: Math.random(), y: fill ? Math.random() : 1 + Math.random() * 0.05, r: 0.5 + Math.random() * 1.1, vy: (0.004 + Math.random() * 0.01) * (innerHeight / Math.max(dh, 1)), sway: Math.random() * 6.283, glint: Math.random() * 6.283, a: 0.2 + Math.random() * 0.4 });
    function sizeDust() {
      if (!dust) return;
      ctx = ctx || dust.getContext("2d");
      const r = Math.min(devicePixelRatio || 1, 2);
      dw = dust.clientWidth; dh = dust.clientHeight;
      dust.width = Math.round(dw * r); dust.height = Math.round(dh * r);
      ctx.setTransform(r, 0, 0, r, 0, 0);
      ctx.fillStyle = getComputedStyle(dust).color;
      const n = Math.round(dw * dh * DUST * +(options.density ?? 2.6));
      dots.length = Math.min(dots.length, n);
      while (dots.length < n) dots.push(seed(true));
    }
    const shade = (x, y) => {
      const { p, k } = light;
      if (!p || !k) return 0;
      const fx = x - g, fy = y - g;
      if (fx > 0 && fx < size.w && fy > 0 && fy < size.h) return 0;
      const ox = Math.max(-fx, 0, fx - size.w), oy = Math.max(-fy, 0, fy - size.h);
      const d = Math.min(Math.hypot(fx - p.x, fy - p.y) / (Math.max(size.w, size.h) * 0.6), 1);
      return Math.min(1, 1.4 * k * (1 - smooth(d)) * (1 - Math.min(Math.hypot(ox, oy) / g, 1)));
    };
    const paint = (now) => {
      if (!ctx) return;
      ctx.clearRect(0, 0, dw, dh);
      for (const d of dots) {
        const x = d.x * dw + Math.sin(now * 4e-4 + d.sway) * 6, y = d.y * dh;
        const a = d.a * (0.55 + 0.45 * Math.sin(now * 0.0012 + d.glint)) * shade(x, y);
        if (a <= 0.004) continue;
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(x, y, d.r, 0, 6.283); ctx.fill();
      }
    };
    const dustLoop = (now) => {
      raf = requestAnimationFrame(dustLoop);
      if (now - last < 1000 / (running ? 30 : 15)) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      for (let i = 0; i < dots.length; i++) { dots[i].y -= dots[i].vy * dt; if (dots[i].y < -0.02) dots[i] = seed(false); }
      paint(now);
    };

    // Per frame (at 60fps) 10% of the remaining distance, at most 14px. When skipping, fades out .06 at a time and turns on at the new spot .04 at a time
    const step = () => {
      const e = gsap.ticker.deltaRatio(60);
      if (pointer) {
        const r = frame.getBoundingClientRect();
        const ox = Math.max(0, r.left - pointer.x, pointer.x - r.right), oy = Math.max(0, r.top - pointer.y, pointer.y - r.bottom);
        if (Math.hypot(ox, oy) < NEAR) { st.target = unroll(nearest(pointer.x - r.left, pointer.y - r.top, size), size); st.moved = true; }
      }
      let diff = shortest(st.s, st.target, size);
      if (st.pending === null && Math.abs(diff) > 2 * (size.w + size.h) * JUMP) st.pending = st.target;
      if (st.pending !== null) {
        st.k = Math.max(0, st.k - 0.06 * e);
        if (st.k === 0) { st.s = st.pending; st.pending = null; }
      } else {
        st.s += Math.sign(diff) * Math.min(Math.abs(diff) * (1 - 0.9 ** e), 14 * e);
        st.k = Math.min(1, st.k + 0.04 * e);
      }
      draw();
      diff = shortest(st.s, st.target, size);
      if (Math.abs(diff) < 0.3 && st.k === 1 && st.pending === null) stop();
    };
    const start = () => { if (!running) { running = true; gsap.ticker.add(step); } };
    const stop = () => { running = false; gsap.ticker.remove(step); };
    const move = (e) => { pointer = { x: e.clientX, y: e.clientY }; if (inView) start(); };

    const ro = new ResizeObserver(measure);
    ro.observe(frame); ro.observe(el);
    measure();
    const io = new IntersectionObserver(([en]) => {
      inView = en.isIntersecting;
      if (dust && !reduce) { cancelAnimationFrame(raf); raf = 0; if (inView) { last = performance.now(); raf = requestAnimationFrame(dustLoop); } }
    }, { rootMargin: "100% 0px" });
    io.observe(el);
    const follow = hover && !reduce && window.gsap;
    if (follow) addEventListener("pointermove", move, { passive: true });
    if (reduce && dust) requestAnimationFrame(() => paint(performance.now()));

    return () => {
      ro.disconnect(); io.disconnect();
      cancelAnimationFrame(raf);
      if (follow) { removeEventListener("pointermove", move); stop(); }
      made.forEach((n) => n.remove());
      el.classList.remove("is-fx-lit");
      ["--fx-x", "--fx-y", "--fx-w", "--fx-h", "--fx-r"].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
