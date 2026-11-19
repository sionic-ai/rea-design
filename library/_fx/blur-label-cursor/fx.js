(() => {
  let ring = null, users = 0, tick = null;
  const p = { x: 0, y: 0 }, q = { x: 0, y: 0 };
  let k = 0.15, seen = false, last = 0;
  const move = (e) => { q.x = e.clientX; q.y = e.clientY; if (!seen) { p.x = q.x; p.y = q.y; seen = true; } };
  const start = () => {
    ring = document.createElement("div");
    ring.className = "fx-blur-label";
    ring.setAttribute("aria-hidden", "true");
    document.body.append(ring);
    addEventListener("pointermove", move, { passive: true });
    tick = (t) => {
      const now = t * 1000, dt = last ? Math.max(1, now - last) : 16.7;
      last = now;
      // look: pop follows only while on, like the original — so a switched-off circle does not slide from the screen corner to the cursor
      if (ring.classList.contains("fx-pop") && !ring.classList.contains("fx-on")) return;
      const f = 1 - Math.pow(1 - k, dt / 16.7);
      p.x += (q.x - p.x) * f; p.y += (q.y - p.y) * f;
      ring.style.transform = `translate(${p.x}px, ${p.y}px)`;
    };
    gsap.ticker.add(tick);
  };
  const stop = () => { gsap.ticker.remove(tick); removeEventListener("pointermove", move); ring && ring.remove(); ring = null; seen = false; last = 0; };
  kfFx.register("blur-label-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !matchMedia("(min-width: 992px)").matches) return;
    if (!users++) start();
    k = +(options.lerp ?? 0.15);
    const text = options.text || "View";
    // look: fade — it doesn’t grow, only opacity changes over dur seconds (Brand PLAY MOVIE .4s) · size — circle diameter
    // look: pop — grows in .25s at .92, shrinks to .8 in .2s and goes out (Brand GO WORK)
    const fade = options.look === "fade", pop = options.look === "pop", size = options.size, dur = options.dur != null ? `${+options.dur}s` : "";
    const over = (e) => {
      const skip = e.target.closest && e.target.closest("button, .fx-no-blur");
      ring.textContent = text;
      ring.classList.toggle("fx-fade", fade);
      // When the type changes, swap without a transition — otherwise you would see it grow from 0x of the default type to pop’s .92x
      if (ring.classList.contains("fx-pop") !== pop) { ring.style.transition = "none"; ring.classList.toggle("fx-pop", pop); void ring.offsetWidth; ring.style.transition = ""; }
      ring.style.setProperty("--fx-size", size || "");
      ring.style.setProperty("--fx-dur", dur);
      if (pop && !ring.classList.contains("fx-on")) {
        q.x = p.x = e.clientX; q.y = p.y = e.clientY;
        ring.style.transform = `translate(${p.x}px, ${p.y}px)`;
      }
      ring.classList.toggle("fx-on", !skip);
    };
    // pop first grows from .92, and after being turned off once it grows from .8 (original GSAP start .92 · off target .8)
    const out = () => { if (!ring) return; ring.classList.remove("fx-on"); if (pop) ring.style.setProperty("--fx-from", "0.8"); };
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerleave", out);
    return () => { el.removeEventListener("pointerover", over); el.removeEventListener("pointerleave", out); out(); if (!--users) stop(); };
  });
})();
