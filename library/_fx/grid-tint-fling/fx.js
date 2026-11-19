(() => {
  // Fill the board with a grid of small squares and tint squares within a radius around the cursor with the accent color by distance.
  // Swing the cursor fast and squares within the radius are pushed by inertia opposite the cursor, then spring back into place.
  // Each cell only changes a single --fx-t (0 to 1), and blending is done by css color-mix — when the skin changes, the grid colors change too
  kfFx.register("grid-tint-fling", (el, { options, reduce, hover }) => {
    const size = Number(options.size) || 16;
    const gap = +(options.gap ?? 32);
    const radius = Number(options.radius) || 180;
    const fling = +(options.fling ?? 80);
    const resist = Number(options.resist) || 750;
    const back = +(options.back ?? 1.5);
    const backEase = options["back-ease"] || "elastic.out(1, 0.75)";
    const field = document.createElement("div");
    field.className = "fx-gtf-field";
    field.setAttribute("aria-hidden", "true");
    field.style.setProperty("--fx-size", `${size}px`);
    field.style.gap = `${gap}px`;
    el.append(field);

    let cells = [];
    let stale = true;
    const build = () => {
      gsap.killTweensOf(cells);
      field.textContent = "";
      const cols = Math.floor((el.clientWidth + gap) / (size + gap));
      const rows = Math.floor((el.clientHeight + gap) / (size + gap));
      const frag = document.createDocumentFragment();
      for (let i = 0; i < cols * rows; i++) {
        const c = document.createElement("i");
        c.className = "fx-gtf-cell";
        frag.append(c);
      }
      field.append(frag);
      cells = Array.from(field.children).map((node) => ({ node, x: 0, y: 0, busy: false }));
      stale = true;
    };
    const measure = () => {
      cells.forEach((c) => {
        const r = c.node.getBoundingClientRect();
        c.x = r.left + scrollX + r.width / 2;
        c.y = r.top + scrollY + r.height / 2;
      });
      stale = false;
    };
    build();
    let timer = 0;
    const ro = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(build, 150); });
    ro.observe(el);
    if (reduce) return () => { ro.disconnect(); clearTimeout(timer); field.remove(); };

    const push = (c, vx, vy) => {
      c.busy = true;
      const home = () => gsap.to(c.node, { x: 0, y: 0, scale: 1, duration: back, ease: backEase, onComplete: () => { c.busy = false; } });
      if (window.InertiaPlugin) gsap.to(c.node, { inertia: { x: vx, y: vy, resistance: resist }, onComplete: home });
      else gsap.to(c.node, { x: (vx * vx * Math.sign(vx)) / (2 * resist), y: (vy * vy * Math.sign(vy)) / (2 * resist), duration: Math.hypot(vx, vy) / resist, ease: "power2.out", onComplete: home });
    };
    const paint = (px, py, speed, vx, vy) => {
      if (stale) measure();
      cells.forEach((c) => {
        const d = Math.hypot(c.x - px, c.y - py);
        c.node.style.setProperty("--fx-t", Math.max(0, 1 - d / radius).toFixed(3));
        if (hover && speed > fling && d < radius && !c.busy) push(c, c.x - px + 0.005 * vx, c.y - py + 0.005 * vy);
      });
    };

    let last = 0, lx = 0, ly = 0, queued = null, raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -radius || r.top > innerHeight + radius) return;
      const now = performance.now();
      const dt = Math.max(1, now - last || 16);
      let vx = ((e.pageX - lx) / dt) * 1000, vy = ((e.pageY - ly) / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > 5000) { const k = 5000 / speed; vx *= k; vy *= k; speed = 5000; }
      last = now; lx = e.pageX; ly = e.pageY;
      queued = [e.pageX, e.pageY, speed, vx, vy];
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (queued) paint(...queued); queued = null; });
    };
    const onScroll = () => { stale = true; };
    // Devices with no pointer — the original plays scroll-linked video. Instead of video, a tinted band sweeps from bottom to top by the scroll ratio passing through the panel
    let st = null;
    if (!hover && window.ScrollTrigger) {
      st = ScrollTrigger.create({
        trigger: el, start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          if (stale) measure();
          const r = el.getBoundingClientRect();
          const by = r.top + scrollY + r.height * (1.2 - self.progress * 1.4);
          cells.forEach((c) => c.node.style.setProperty("--fx-t", Math.max(0, 1 - Math.abs(c.y - by) / radius).toFixed(3)));
        },
      });
    }
    if (hover) addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      ro.disconnect();
      if (st) st.kill();
      gsap.killTweensOf(cells.map((c) => c.node));
      field.remove();
    };
  });
})();
