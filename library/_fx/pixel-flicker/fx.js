(() => {
  // When a cell comes within 160px of the screen bottom, each cell flickers 2 to 4 times then lights up (cells farther from the origin later), and after all are lit, cells around the mouse flicker once or twice.
  // The finger does two rotations at the tap spot (released within 12px). Distance in an svg is viewBox units, so when the graphic shrinks the radius shrinks too
  kfFx.register("pixel-flicker", (el, { options, reduce, hover }) => {
    const cells = [...(el.matches("svg") ? el.querySelectorAll("rect, path, circle, use") : el.children)];
    if (!cells.length) return;
    const svg = el.matches("svg") ? el : null;
    const origin = options.origin === "top" ? "top" : "bottom";
    const enter = +(options.enter ?? 1), radius = +(options.radius ?? 96), cooldown = +(options.cooldown ?? 160), pace = +(options.pace ?? 1), flashes = +(options.flashes ?? 0);
    const listen = options.listen === "parent" ? el.parentElement || el : el;
    const rand = (a, b) => a + Math.random() * (b - a);
    const done = () => gsap.set(cells, { clearProps: "opacity" });
    if (reduce) return done;

    // Cell center in svg units (or px inside the element if none). Re-measured when the image size changes
    let pts = [], H = 1;
    const toLocal = (x, y) => {
      if (svg) {
        const m = svg.getScreenCTM();
        return m ? new DOMPoint(x, y).matrixTransform(m.inverse()) : null;
      }
      const r = el.getBoundingClientRect();
      return { x: x - r.left, y: y - r.top };
    };
    const measure = () => {
      const top = toLocal(0, el.getBoundingClientRect().top), bot = toLocal(0, el.getBoundingClientRect().bottom);
      H = Math.max(1, (bot?.y ?? 1) - (top?.y ?? 0));
      pts = cells.map((c) => {
        const r = c.getBoundingClientRect(), p = toLocal(r.left + r.width / 2, r.top + r.height / 2) || { x: 0, y: 0 }, t = toLocal(r.left, r.top) || p;
        return { el: c, x: p.x, y: p.y, top: t.y - (top?.y ?? 0), last: 0 };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    let ready = false, tl = null;
    const tls = new Set();
    const keep = (t) => (tls.add(t), t.eventCallback("onComplete", () => tls.delete(t)), t);
    gsap.set(cells, { opacity: 0 });
    const start = () => {
      tl = gsap.timeline({ onComplete: () => (ready = true) });
      for (const c of pts) {
        const n = 2 + Math.floor(Math.random() * 3);
        const p = origin === "top" ? c.top / H : (H - c.top) / H;
        const at = (rand(0, 0.42) + p * 0.28) * enter, step = rand(0.045, 0.09) * enter;
        for (let d = 0; d < n; d++) tl.set(c.el, { opacity: d % 2 === 0 ? 1 : 0 }, at + d * step);
        tl.set(c.el, { opacity: 1 }, at + n * step);
      }
    };
    const seen = () => { const r = el.getBoundingClientRect(); return r.top <= innerHeight - 160 && r.bottom > 0; };
    const wait = () => { if (seen()) (gsap.ticker.remove(wait), start()); };
    gsap.ticker.add(wait);

    const flash = (ev, rounds = 1) => {
      if (!ready) return;
      const p = toLocal(ev.clientX, ev.clientY);
      if (!p) return;
      const now = performance.now();
      const hit = pts.filter((c) => (c.x - p.x) ** 2 + (c.y - p.y) ** 2 <= radius * radius && now - c.last >= cooldown && (c.last = now));
      if (!hit.length) return;
      const t = keep(gsap.timeline());
      let at = 0;
      for (let r = 0; r < rounds; r++) {
        let end = at;
        for (const c of hit) {
          const n = flashes > 0 ? flashes : 1 + Math.floor(Math.random() * 2), s = at + rand(0, 0.03) * pace, step = rand(0.04, 0.07) * pace;
          for (let f = 0; f < n; f++) t.set(c.el, { opacity: f % 2 === 0 ? 0 : 1 }, s + f * step);
          t.set(c.el, { opacity: 1 }, s + n * step);
          end = Math.max(end, s + n * step);
        }
        at = end;
      }
    };
    let raf = 0, lastEv = null, down = null;
    const move = (e) => { if (e.pointerType !== "mouse") return; lastEv = e; if (!raf) raf = requestAnimationFrame(() => { raf = 0; lastEv && flash(lastEv); lastEv = null; }); };
    const press = (e) => { if (e.pointerType !== "mouse" && !down) down = { id: e.pointerId, x: e.clientX, y: e.clientY }; };
    const lift = (e) => { if (!down || down.id !== e.pointerId) return; const far = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12; down = null; if (!far) flash(e, 2); };
    const cancel = () => (down = null);
    if (hover) listen.addEventListener("pointermove", move, { passive: true });
    listen.addEventListener("pointerdown", press, { passive: true });
    addEventListener("pointerup", lift, { passive: true });
    addEventListener("pointercancel", cancel, { passive: true });
    return () => {
      gsap.ticker.remove(wait);
      ro.disconnect();
      cancelAnimationFrame(raf);
      listen.removeEventListener("pointermove", move);
      listen.removeEventListener("pointerdown", press);
      removeEventListener("pointerup", lift);
      removeEventListener("pointercancel", cancel);
      tl?.kill();
      tls.forEach((t) => t.kill());
      done();
    };
  });
})();
