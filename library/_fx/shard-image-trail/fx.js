// Every 80px the cursor moves, the next photo is placed at the cursor, split into 3×3 pieces (clip-path), each scattering ±15px, shrinking to .8~1x and vanishing.
// Original values (Brand principles section): threshold 80px · .25s power2.out · piece interval .005s · starts .02s late · when switched on, the panel goes 20%→80% by itself once over 1.3s power2.inOut (after .3s) · off below 768px.
(() => {
  kfFx.register("shard-image-trail", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (reduce || !items.length) return;
    const ROWS = +(options.rows || 3), COLS = +(options.cols || 3), GAP = +(options.gap || 80), DUR = +(options.dur ?? 0.25);
    const SPREAD = +(options.spread ?? 15), EACH = +(options.each ?? 0.005), MIN = +(options.min ?? 768);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const shards = items.map((it) => {
      const inner = it.querySelector('[data-fx-part="inner"]') || it.firstElementChild;
      if (!inner) return null;
      const made = [];
      for (let i = 1; i < ROWS * COLS; i++) { const c = inner.cloneNode(true); c.removeAttribute("data-fx-part"); c.setAttribute("aria-hidden", "true"); it.append(c); made.push(c); }
      const pieces = [inner, ...made];
      pieces.forEach((p, k) => {
        const r = Math.floor(k / COLS), c = k % COLS;
        p.style.clipPath = `polygon(${(100 / COLS) * c}% ${(100 / ROWS) * r}%, ${(100 / COLS) * (c + 1)}% ${(100 / ROWS) * r}%, ${(100 / COLS) * (c + 1)}% ${(100 / ROWS) * (r + 1)}%, ${(100 / COLS) * c}% ${(100 / ROWS) * (r + 1)}%)`;
      });
      gsap.set(it, { opacity: 0 });
      return { it, pieces, made };
    }).filter(Boolean);
    if (!shards.length) return;

    let pos = 0, z = 1, live = 0, on = false, raf = 0, sweepT = 0;
    let mouse = { x: 0, y: 0 }, last = { x: 0, y: 0 };
    const rel = (e) => { const r = el.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return { x: p.clientX - r.left, y: p.clientY - r.top }; };
    const onMove = (e) => { if (on) mouse = rel(e); };
    const next = () => {
      ++z;
      pos = (pos + 1) % shards.length;
      const s = shards[pos], w = s.it.offsetWidth, h = s.it.offsetHeight;
      gsap.killTweensOf(s.pieces);
      gsap.timeline({ onStart: () => live++, onComplete: () => { if (--live === 0) z = 1; } })
        .set(s.it, { opacity: 1, zIndex: z, x: mouse.x - w / 2, y: mouse.y - h / 2 }, 0)
        .set(s.pieces, { x: 0, y: 0, scale: 1, opacity: 1 }, 0)
        .to(s.pieces, {
          duration: DUR, ease, x: () => gsap.utils.random(-SPREAD, SPREAD), y: () => gsap.utils.random(-SPREAD, SPREAD),
          opacity: 0, scale: () => gsap.utils.random(0.8, 1), stagger: EACH, onComplete: () => gsap.set(s.it, { opacity: 0 }),
        }, 0.02);
    };
    const loop = () => {
      if (!on) return;
      if (Math.hypot(mouse.x - last.x, mouse.y - last.y) > GAP) { next(); last = { ...mouse }; }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (on || innerWidth < MIN) return;
      on = true;
      const r = el.getBoundingClientRect();
      mouse = { x: r.width * 0.2, y: r.height / 2 }; last = { ...mouse };
      gsap.killTweensOf(mouse);
      sweepT = setTimeout(() => { if (on) gsap.to(mouse, { x: r.width * 0.8, y: r.height / 2, duration: 1.3, ease: "power2.inOut" }); }, 300);
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!on) return;
      on = false; cancelAnimationFrame(raf); clearTimeout(sweepT); gsap.killTweensOf(mouse);
      shards.forEach((s) => { gsap.killTweensOf(s.pieces); gsap.killTweensOf(s.it); gsap.set(s.it, { opacity: 0 }); });
      live = 0; z = 1;
    };
    addEventListener("mousemove", onMove, { passive: true });
    addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("fx:play", start);
    el.addEventListener("fx:stop", stop);
    // on: state — the caller turns it on and off with fx:play/fx:stop. By default it stays on while the panel is on screen
    let io = null;
    if (options.on !== "state") { io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())); io.observe(el); }
    return () => {
      stop(); io?.disconnect();
      removeEventListener("mousemove", onMove); removeEventListener("touchmove", onMove);
      el.removeEventListener("fx:play", start); el.removeEventListener("fx:stop", stop);
      shards.forEach((s) => { s.made.forEach((m) => m.remove()); s.pieces[0].style.clipPath = ""; gsap.set([s.it, s.pieces[0]], { clearProps: "all" }); });
    };
  });
})();
