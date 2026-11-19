// An endless slide where panel-width photos are pushed sideways and swapped — each box chases x with a spring (mass · tension · friction, integrated in 1ms steps),
// The next slide pushes in from the right and the current one slides out to the left. The slot that wraps back to the end is skipped and placed directly.
// Follows the hand when dragged, and goes to the next slide if dragged past half the width or flicked fast. Prev/next buttons, autoplay, number and caption swap
(() => {
  kfFx.register("spring-push-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll(':scope [data-fx-part="slide"]')];
    const n = slides.length;
    if (!n) return;
    const mass = +(options.mass ?? 1) || 1, tension = +(options.tension ?? 70), friction = +(options.friction ?? 26);
    const every = +(options.every ?? 0), wait = +(options.delay ?? 0);
    const scope = (options.scope && el.closest(options.scope)) || el.parentElement || el;
    const part = (name) => scope.querySelector(`[data-fx-part="${name}"]`);
    const prev = part("prev"), next = part("next"), current = part("current"), total = part("total"), caption = part("caption");
    const pad = (v) => (v > 9 ? String(v) : `0${v}`);
    if (total) total.textContent = pad(n);

    let W = el.clientWidth || 1, pos = 0, drag = 0;
    const st = slides.map(() => ({ x: 0, v: 0, to: 0 }));
    // Where cell i sits: current section 0, next sections 1 and up, the one just before −1
    const slot = (i, p) => ((((i - p + 1) % n) + n) % n) - 1;
    const place = (jump) => {
      slides.forEach((s, i) => {
        const to = slot(i, pos) * W + drag;
        const was = st[i].to - drag;
        // A cell that moves more than one slot (first ↔ last) jumps over on the unseen side
        if (jump || Math.abs(to - drag - was) > W * 1.5) { st[i].x = to; st[i].v = 0; }
        st[i].to = to;
      });
    };
    const index = () => ((pos % n) + n) % n;
    const label = () => {
      const k = index();
      if (current) current.textContent = pad(k + 1);
      if (caption && slides[k].dataset.caption != null) caption.textContent = slides[k].dataset.caption;
      slides.forEach((s, i) => s.setAttribute("aria-hidden", String(i !== k)));
    };
    slides.forEach((s) => { s.style.position = "absolute"; s.style.inset = "0"; s.style.willChange = "transform"; });
    place(true);
    label();

    let raf = 0, last = 0;
    const draw = () => slides.forEach((s, i) => { s.style.transform = `translate3d(${st[i].x}px,0,0)`; });
    const tick = (now) => {
      const dt = Math.min(64, last ? Math.max(1, now - last) : 16);
      last = now;
      let moving = false;
      for (const s of st) {
        for (let t = 0; t < Math.ceil(dt); t++) {
          const a = (-tension * 1e-6 * (s.x - s.to) - friction * 1e-3 * s.v) / mass;
          s.v += a;
          s.x += s.v;
        }
        if (Math.abs(s.v) > 0.001 || Math.abs(s.to - s.x) > 0.01) moving = true;
        else { s.x = s.to; s.v = 0; }
      }
      draw();
      raf = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) last = 0;
    };
    const run = () => { if (reduce) { st.forEach((s) => { s.x = s.to; s.v = 0; }); draw(); return; } if (!raf) raf = requestAnimationFrame(tick); };
    draw();
    const go = (d) => { pos += d; place(false); label(); run(); el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: index() }, bubbles: true })); };

    const ac = new AbortController();
    const on = (t, ev, fn, o) => t?.addEventListener(ev, fn, { signal: ac.signal, ...o });
    on(prev, "click", (e) => { e.preventDefault(); go(-1); });
    on(next, "click", (e) => { e.preventDefault(); go(1); });

    // Dragging — only grabs on horizontal movement, leaving vertical scroll alone (touch-action: pan-y)
    let down = null, moved = 0, vx = 0, lx = 0, lt = 0;
    el.style.touchAction = "pan-y";
    on(el, "pointerdown", (e) => { down = e.clientX; moved = 0; vx = 0; lx = e.clientX; lt = e.timeStamp; });
    on(window, "pointermove", (e) => {
      if (down == null) return;
      drag = e.clientX - down;
      moved = Math.max(moved, Math.abs(drag));
      const dt = Math.max(1, e.timeStamp - lt);
      vx = (e.clientX - lx) / dt; lx = e.clientX; lt = e.timeStamp;
      place(false); run();
    });
    const up = () => {
      if (down == null) return;
      const d = drag;
      down = null; drag = 0;
      if (Math.abs(d) > W / 2 || Math.abs(vx) > 1) go(d > 0 ? -1 : 1);
      else { place(false); run(); }
    };
    on(window, "pointerup", up);
    on(window, "pointercancel", up);
    // A drag and release does not count as a press (so even if the photo cell is a link it won’t navigate)
    on(el, "click", (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, { capture: true });

    let timer = 0, start = 0;
    if (every > 0 && !reduce) start = setTimeout(() => { timer = setInterval(() => { if (!document.hidden && down == null) go(1); }, every); }, wait);
    const ro = new ResizeObserver(() => { W = el.clientWidth || 1; place(true); draw(); });
    ro.observe(el);

    return () => {
      ac.abort(); ro.disconnect(); clearTimeout(start); clearInterval(timer); cancelAnimationFrame(raf);
      el.style.touchAction = "";
      slides.forEach((s) => { s.style.position = s.style.inset = s.style.willChange = s.style.transform = ""; s.removeAttribute("aria-hidden"); });
    };
  });
})();
