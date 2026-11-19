// Original custom-slider: each panel’s move += (target − move) × .1 every frame — the swipe length isn’t fixed and stretches with the distance
(() => {
  kfFx.register("center-grow-strip", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const items = track ? [...track.querySelectorAll('[data-fx-part="item"]')] : [];
    if (items.length < 2) return;
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const prevs = el.querySelectorAll('[data-fx-part="prev"]'), nexts = el.querySelectorAll('[data-fx-part="next"]');
    const sp = matchMedia("(max-width: 1024px)");
    const opt = (k, d) => +(options[(sp.matches ? "sp-" : "") + k] ?? (sp.matches ? d[1] : d[0]));
    const every = +(options.every ?? 10), lerp = Math.min(1, Math.max(0.01, +(options.lerp ?? 0.1)));
    const n = items.length;
    let cur = 0, timer = 0, raf = 0, last = 0;
    const pos = items.map(() => ({ x: 0, s: 1, set: false }));
    const target = (i) => {
      let d = i - cur;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const w = items[i].offsetWidth, scale = opt("scale", [1.185, 1]), gap = opt("gap", [25, 0]), cg = opt("center-gap", [25, 0]);
      const big = w * scale;
      const x = d === 0 ? 0 : Math.sign(d) * (big / 2 + cg + w / 2 + (Math.abs(d) - 1) * (w + gap));
      return { x, s: d === 0 ? scale : 1, d };
    };
    const frame = (now) => {
      const dt = last ? Math.max(1, now - last) : 16.7;
      last = now;
      const k = 1 - Math.pow(1 - lerp, dt / 16.7);
      let moving = false;
      items.forEach((it, i) => {
        const t = target(i), p = pos[i];
        // A panel crossing to the opposite side is moved instantly, not dragged (the original joins it with a cloned panel)
        if (!p.set || reduce || Math.abs(t.x - p.x) > it.offsetWidth * (n / 2)) { p.x = t.x; p.s = t.s; p.set = true; }
        else { p.x += (t.x - p.x) * k; p.s += (t.s - p.s) * k; }
        if (Math.abs(t.x - p.x) > 0.3 || Math.abs(t.s - p.s) > 0.001) moving = true;
        it.style.transform = `translateX(${p.x.toFixed(2)}px) scale(${p.s.toFixed(4)})`;
        it.style.setProperty("--fx-s", p.s.toFixed(4));
        it.style.zIndex = String(n - Math.abs(t.d));
      });
      raf = moving ? requestAnimationFrame(frame) : 0;
      if (!moving) last = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const go = (i) => {
      cur = ((i % n) + n) % n;
      items.forEach((it, k) => it.classList.toggle("is-active", k === cur));
      dots.forEach((d, k) => d.classList.toggle("is-active", k === cur));
      el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: cur } }));
      kick();
      restart();
    };
    const restart = () => { clearInterval(timer); if (every > 0 && !reduce) timer = setInterval(() => go(cur + 1), every * 1000); };
    const ac = new AbortController();
    prevs.forEach((b) => b.addEventListener("click", () => go(cur - 1), { signal: ac.signal }));
    nexts.forEach((b) => b.addEventListener("click", () => go(cur + 1), { signal: ac.signal }));
    dots.forEach((d, k) => d.addEventListener("click", () => go(k), { signal: ac.signal }));
    // pause: hover — auto-advance stops while a hand is over it, and counting restarts from the beginning on release (original News ticker)
    if (options.pause === "hover") {
      el.addEventListener("pointerenter", () => clearInterval(timer), { signal: ac.signal });
      el.addEventListener("pointerleave", restart, { signal: ac.signal });
    }
    // swipe: threshold for drag-to-turn — finger / mouse (px). For a finger, the distance moved on release, for a mouse, the amount of one movement (movementX) while pressed, once past the threshold, one page turns (original custom-slider 50 15)
    // sp-swipe only below 1024px (on wide screens, the prev/next press areas cover the board in the original Hero and video row, so it can’t be dragged)
    const swipeOpt = options.swipe || (sp.matches && options["sp-swipe"]);
    if (swipeOpt) {
      const [touchMin = 50, mouseMin = 15] = String(swipeOpt).trim().split(/\s+/).map(Number);
      // Listens on the whole component rather than the row, so fingers starting on the prev/next button row over the panel are also caught (original swipeArea)
      const on = (t, f, o) => el.addEventListener(t, f, { signal: ac.signal, ...o });
      let down = false, swiped = false, x0 = 0, x1 = 0;
      const flick = (d, min) => {
        if (Math.abs(d) < min) return;
        down = false; swiped = true;
        setTimeout(() => (swiped = false), 400);
        go(cur + (d > 0 ? -1 : 1));
      };
      // Swallow the single click right after, so a hand released after dragging isn’t counted as pressing a link in the board
      on("click", (e) => { if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; } }, { capture: true });
      el.dataset.drag = "";
      el.style.touchAction = "pan-y";
      on("touchstart", (e) => { down = true; x0 = x1 = e.changedTouches[0].pageX; }, { passive: true });
      on("touchmove", (e) => { x1 = e.changedTouches[0].pageX; }, { passive: true });
      on("touchend", () => { if (down) flick(x1 - x0, touchMin); down = false; });
      on("touchcancel", () => (down = false));
      on("mousedown", (e) => { down = true; e.preventDefault(); });
      on("mouseup", () => (down = false));
      on("mouseleave", () => (down = false));
      on("mousemove", (e) => { if (down) flick(e.movementX, mouseMin); });
    }
    const ro = new ResizeObserver(() => { pos.forEach((p) => (p.set = false)); kick(); });
    ro.observe(track);
    sp.addEventListener("change", kick, { signal: ac.signal });
    go(0);
    return () => {
      ac.abort(); ro.disconnect(); clearInterval(timer); cancelAnimationFrame(raf);
      delete el.dataset.drag; el.style.touchAction = "";
      items.forEach((it) => { it.style.transform = ""; it.style.zIndex = ""; it.style.removeProperty("--fx-s"); it.classList.remove("is-active"); });
      dots.forEach((d) => d.classList.remove("is-active"));
    };
  });
})();
