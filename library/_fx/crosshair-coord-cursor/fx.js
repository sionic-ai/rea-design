// Replaces the system cursor with a crosshair — hairline horizontal and vertical lines spanning the screen follow the mouse at .12s power3.out, and a 10px square dot follows at .2s,
// Next to it a ‹x 0000 · y 0000› coordinate is written. Over links and buttons the dot becomes a 4.2x circle rotating 45° and the label changes to data-cursor or open →·visit ↗·write·click.
// Elements given to magnet (.btn · .tool) are pulled toward the cursor by .25 (horizontal) · .35 (vertical) of their distance from center over .4s, and return with elastic.out(1, .4) over .6s when the cursor leaves.
// Original Name cursor. Does nothing on touch screens·reduce. Where it attaches is <body>.
(() => {
  kfFx.register("crosshair-coord-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    const box = document.createElement("div");
    box.className = "fx-ccc";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = '<span class="fx-ccc__h"></span><span class="fx-ccc__v"></span><span class="fx-ccc__pt"><span class="fx-ccc__ring"></span><span class="fx-ccc__label"></span></span>';
    el.append(box);
    root.classList.add("has-fx-ccc");
    const h = box.querySelector(".fx-ccc__h"), v = box.querySelector(".fx-ccc__v"), pt = box.querySelector(".fx-ccc__pt"), label = box.querySelector(".fx-ccc__label");
    const line = { duration: +(options.line ?? 0.12), ease: "power3.out" }, dot = { duration: +(options.dot ?? 0.2), ease: "power3.out" };
    // If length is 0 (line: 0 · dot: 0), quickTo doesn’t redraw a zero-length tween and the line freezes — in that case set it immediately
    // With lerp, instead of a tween each frame follows that fraction of the remaining distance (Brand B .18 per frame) — if the time between frames is long it travels proportionally further.
    const k = +(options.lerp ?? 0), chase = [];
    const follow = (t, p, o) => {
      if (k > 0) {
        const s = { t, p, cur: null, to: 0 };
        chase.push(s);
        return (val) => { s.to = val; if (s.cur === null) { s.cur = val; gsap.set(t, { [p]: val }); } };
      }
      return o.duration > 0 ? gsap.quickTo(t, p, o) : (val) => gsap.set(t, { [p]: val });
    };
    let last = 0;
    const tick = (time) => {
      const now = time * 1000, dt = last ? Math.max(1, now - last) : 16.7;
      last = now;
      const f = 1 - Math.pow(1 - k, dt / 16.7);
      for (const s of chase) {
        if (s.cur === null || Math.abs(s.to - s.cur) < 0.05) continue;
        s.cur += (s.to - s.cur) * f;
        gsap.set(s.t, { [s.p]: s.cur });
      }
    };
    if (k > 0) gsap.ticker.add(tick);
    const toY = follow(h, "y", line), toX = follow(v, "x", line), ptX = follow(pt, "x", dot), ptY = follow(pt, "y", dot);
    // look: plain — no delay, coordinate text, hover shape change or magnet, only white lines and rectangles with difference blend (Brand #bg)
    const plain = options.look === "plain";
    const magnetSel = plain ? null : options.magnet || ".btn, .tool";
    const pad = (n) => String(Math.round(n)).padStart(4, "0");
    let over = null, mag = null;
    const move = (e) => {
      box.classList.add("is-visible");
      toY(e.clientY); toX(e.clientX); ptX(e.clientX); ptY(e.clientY);
      if (plain) return;
      if (!over) label.textContent = `x ${pad(e.clientX)} · y ${pad(e.clientY)}`;
      const m = e.target.closest?.(magnetSel) || null;
      if (m !== mag) { if (mag) gsap.to(mag, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" }); mag = m; }
      if (mag) {
        const r = mag.getBoundingClientRect();
        gsap.to(mag, { x: (e.clientX - (r.left + r.width / 2)) * 0.25, y: (e.clientY - (r.top + r.height / 2)) * 0.35, duration: 0.4, ease: "power3.out" });
      }
    };
    const enter = (e) => {
      if (plain) return;
      const t = e.target.closest?.("a, button, summary, [data-cursor]") || null;
      if (t === over) return;
      over = t;
      box.classList.toggle("is-hover", !!t);
      if (!t) return;
      label.textContent = t.dataset.cursor
        ?? (t.tagName === "A" && t.href.startsWith("mailto:") ? "write"
          : t.tagName === "A" && t.origin !== location.origin ? "visit ↗"
          : t.tagName === "A" ? "open →" : "click");
    };
    const hide = () => box.classList.remove("is-visible");
    const down = () => box.classList.add("is-down");
    const up = () => box.classList.remove("is-down");
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", enter, { passive: true });
    root.addEventListener("pointerleave", hide);
    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    return () => {
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", enter);
      root.removeEventListener("pointerleave", hide);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      if (mag) gsap.set(mag, { clearProps: "transform" });
      gsap.ticker.remove(tick);
      root.classList.remove("has-fx-ccc");
      box.remove();
    };
  });
})();
