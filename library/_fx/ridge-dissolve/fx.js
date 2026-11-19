(() => {
  // Original detail page hero — the section’s bottom edge is eaten by a ridge-shaped clip-path, and the next section layered on top shows through the gap.
  // In the first 1.5s it rises from below the content (1.07l) to the 81% position, then from the moment the next section’s top edge touches the bottom of the screen it is bound to scroll and eaten down to 60%.
  // Wobble .13l · center dip .13l · grain 230px · breath .15 turns/s (wobbles 2.2x more on fast scroll).
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hash = (x, y) => { const r = Math.sin(x * 127.1 + y * 311.7 + 74.7) * 43758.5453; return r - Math.floor(r); };
  const vn = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return hash(xi, yi) * (1 - u) * (1 - v) + hash(xi + 1, yi) * u * (1 - v) + hash(xi, yi + 1) * (1 - u) * v + hash(xi + 1, yi + 1) * u * v;
  };
  const fbm = (x, y) => vn(x, y) * 0.66 + vn(x * 2.03 + 5.2, y * 2.03 - 1.3) * 0.24 + vn(x * 4.1 - 3.1, y * 4.1 + 7.7) * 0.1;
  const smoother = (t) => { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
  kfFx.register("ridge-dissolve", (el, { options, reduce, scroller }) => {
    const next = el.nextElementSibling;
    if (reduce || !next || !window.ScrollTrigger || !CSS.supports("clip-path", 'path("M 0 0 L 1 0 Z")')) return;
    const o = {
      peek: +(options.peek ?? 0.19), reach: +(options.reach ?? 0.4), wander: +(options.wander ?? 0.13), center: +(options.center ?? 0.13),
      edge: +(options.edge ?? 0.5), scale: +options.scale || 230, warp: +(options.warp ?? 1.25), intro: +(options.intro ?? 1.5),
      life: +(options.life ?? 0.15), agitate: +(options.agitate ?? 2.2), surge: +(options.surge ?? 0.55), finish: +options.finish || 0.85, grid: +options.grid || 16,
    };
    const content = el.querySelector('[data-fx-part="content"]') || el;
    let l = 0, w = 0, apron = 0, U = 0, H = 0, vel = 0, last = gsap.ticker.time;
    const prev = { pb: el.style.paddingBottom, mt: next.style.marginTop, pos: next.style.position, z: el.style.zIndex, pos2: el.style.position };
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.style.zIndex = el.style.zIndex || "2";
    if (getComputedStyle(next).position === "static") next.style.position = "relative";
    const measure = () => {
      l = content === el ? el.offsetHeight - apron : content.offsetHeight;
      w = el.offsetWidth;
      const u = o.wander * l, d = o.center * l, m = o.surge * u, reserve = 0.8 * u, f = o.peek * l, p = Math.max(o.reach * l, f + u);
      apron = Math.max(0, Math.ceil((u + d + u * 0.4 + m + reserve - f) * 1.12));
      el.style.paddingBottom = `${apron}px`;
      next.style.marginTop = `${-Math.ceil(apron + p + m + reserve)}px`;
    };
    measure();
    // ScrollTrigger calls onRefresh (→ draw) immediately on creation — st does not exist yet at that moment, so it draws with progress 0
    let st = null;
    st = ScrollTrigger.create({ trigger: next, scroller: scroller || undefined, start: "clamp(top bottom)", end: () => `top top-=${Math.ceil(l * o.wander * 1.4)}`, scrub: true, invalidateOnRefresh: true, onRefresh: () => { measure(); draw(); } });
    function draw() {
      const n = smoother(U), V = clamp((st ? st.progress : 0) / o.finish, 0, 1);
      const peekY = l - o.peek * l, reachY = l - o.reach * l;
      const base = l - n * (l - (peekY + V * (reachY - peekY))) + (o.wander + o.center) * l * n - vel * o.surge * o.wander * l * n;
      const amp = o.wander * l * n, dent = o.center * l * n, t = H * 0.85;
      const pts = [];
      for (let x = -o.grid; x <= w + o.grid; x += o.grid) {
        const a = Math.max(0, Math.cos(Math.PI * clamp(x / w - 0.5, -0.5, 0.5)));
        const nx = x / o.scale, wx = nx + (fbm(nx * 0.5, t * 0.3 + 9.1) - 0.5) * o.warp;
        const y = base - dent * a * a + Math.tanh((fbm(wx, t * 0.35) - 0.478) / 0.26) * amp * (o.edge + (1 - o.edge) * a);
        pts.push(`${x.toFixed(1)} ${clamp(y, -l, el.offsetHeight + 2).toFixed(1)}`);
      }
      el.style.clipPath = `path(evenodd, "M ${-o.grid} ${-l} L ${w + o.grid} ${-l} L ${pts.reverse().join(" L ")} Z")`;
    }
    const tick = () => {
      const now = gsap.ticker.time, dt = Math.max(0, Math.min(0.1, now - last));
      last = now;
      vel += (clamp(st.getVelocity() / 2600, -1, 1) - vel) * 0.13;
      if (U < 1) U = o.intro > 0 ? Math.min(1, U + dt / o.intro) : 1;
      H += dt * o.life * (1 + Math.abs(vel) * o.agitate) * Math.PI * 2;
      draw();
    };
    gsap.ticker.add(tick);
    const ro = new ResizeObserver(() => { measure(); draw(); });
    ro.observe(content);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      st.kill();
      el.style.clipPath = "";
      el.style.paddingBottom = prev.pb;
      el.style.zIndex = prev.z;
      el.style.position = prev.pos2;
      next.style.marginTop = prev.mt;
      next.style.position = prev.pos;
    };
  });
})();
