(() => {
  // While held, small image bits pop up from the cursor position, one per frame (at most max at a time) —
  // Each piece picks one size from 15·20·25·35·45, rises 0~25 · sideways 0~10 (half left, half right) px/frame, starts at an angle of 0~360°, rotates ±0~35°/frame.
  // Upward speed drops by 1 each frame (so it doesn’t exceed its own size), falling in a parabola, and it is removed once it leaves the bottom of the screen. Stops when released or when leaving the panel
  const LAYER = "fx-hcs-layer";
  let users = 0;
  const layer = () => {
    let el = document.getElementById(LAYER);
    if (!el) {
      el = document.createElement("div");
      el.id = LAYER;
      el.setAttribute("aria-hidden", "true");
      document.body.append(el);
    }
    return el;
  };
  kfFx.register("hold-confetti-spray", (el, { options, reduce }) => {
    if (reduce) return;
    users++;
    const box = layer();
    const max = Math.max(+options.max || 35, 1);
    const sizes = String(options.sizes || "15,20,25,35,45").split(",").map(Number).filter((n) => n > 0);
    const up = +(options.up ?? 25), side = +(options.side ?? 10), spin = +(options.spin ?? 35), fall = +(options.fall ?? 1);
    const tpl = el.querySelector('[data-fx-part="piece"]');
    let pieces = [], held = false, x = 0, y = 0, raf = 0, last = 0;
    const make = () => {
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const node = document.createElement("div");
      node.className = "fx-hcs-piece";
      node.style.width = node.style.height = `${size}px`;
      if (tpl) { const c = tpl.cloneNode(true); c.removeAttribute("data-fx-part"); c.hidden = false; node.append(c); }
      box.append(node);
      pieces.push({ node, size, dir: Math.random() <= 0.5 ? -1 : 1, vx: side * Math.random(), vy: up * Math.random(), turn: spin * Math.random() * (Math.random() <= 0.5 ? -1 : 1), rot: 360 * Math.random(), left: x - size / 2, top: y - size / 2 });
    };
    // Like the original, position uses top·left and only rotation uses transform. Parts that mix both read the rotation value separately.
    const paint = (p) => { p.node.style.top = `${p.top}px`; p.node.style.left = `${p.left}px`; p.node.style.transform = `rotate(${p.rot}deg)`; };
    const tick = (t) => {
      // The original steps once per frame — one 60fps frame is 1, so it’s independent of screen speed
      const k = last ? Math.min(Math.max(1, t - last), 50) / (1000 / 60) : 1;
      last = t;
      if (held && pieces.length < max) make();
      // Like the original, it’s removed only after falling to the document bottom — it keeps spinning and falling that far even after leaving the screen
      const floor = Math.max(innerHeight, document.body.clientHeight);
      pieces = pieces.filter((p) => {
        p.left -= p.vx * p.dir * k;
        p.top -= p.vy * k;
        p.vy = Math.min(p.size, p.vy - fall * k);
        p.rot += p.turn * k;
        if (p.top >= floor + p.size) { p.node.remove(); return false; }
        paint(p);
        return true;
      });
      raf = held || pieces.length ? requestAnimationFrame(tick) : ((last = 0), 0);
    };
    const at = (e) => { const s = e.touches ? e.touches[0] : e; if (s) { x = s.clientX; y = s.clientY; } };
    const down = (e) => { if (e.button > 0) return; at(e); held = true; if (!raf) raf = requestAnimationFrame(tick); };
    const stop = () => { held = false; };
    const ac = new AbortController(), on = { signal: ac.signal, passive: true };
    // Touch is received too, but it is passive so it does not block scrolling
    el.addEventListener("mousedown", down, on);
    el.addEventListener("touchstart", down, on);
    el.addEventListener("mousemove", at, on);
    el.addEventListener("touchmove", at, on);
    el.addEventListener("mouseup", stop, on);
    el.addEventListener("touchend", stop, on);
    el.addEventListener("mouseleave", stop, on);
    // Releasing outside the plate (over a floating dialog) also stops it — the original listened only inside the plate, so pieces could spawn endlessly
    addEventListener("mouseup", stop, on);
    addEventListener("blur", stop, on);
    return () => {
      ac.abort();
      held = false;
      cancelAnimationFrame(raf);
      pieces.forEach((p) => p.node.remove());
      pieces = [];
      if (--users === 0) document.getElementById(LAYER)?.remove();
    };
  });
})();
