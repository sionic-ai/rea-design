// Service photo flow: endlessly flows up and down at 36px per second. Mouse drags vertically, finger drags horizontally.
// On release, if fast (over 36px per second) it glides with inertia (time constant 325ms × 0.9~1.2, baseline 1400px/s), and if thrown along the flow direction it merges at the flow speed,
// If thrown the opposite way, it rests 120ms after stopping, then rises back to flow speed over 500ms. Up/down arrows move 1/6 of a group each.
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const SPEED = 36, INERTIA = 325, FLICK = 1400, RESUME_DELAY = 120, RESUME = 500;
    const sliders = [...document.querySelectorAll("[data-sv]")].map((el) => {
      const track = el.querySelector(".sv-track");
      const g = track.firstElementChild;
      const copy = g.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      track.append(copy);
      el.tabIndex = 0;
      return { el, track, group: g, copy, dir: el.dataset.dir === "down" ? 1 : -1, y: 0, drag: null, fling: null, resume: null, cruise: null, from: 0 };
    });
    const wrap = (s) => { const h = s.group.offsetHeight || 1; s.y = ((s.y % h) - h) % h; s.track.style.transform = `translate3d(0, ${s.y.toFixed(2)}px, 0)`; };
    // If it is running, read the current position and drop the animation — call it before the hand grabs it
    const hold = (s) => {
      if (!s.cruise) return;
      s.y = s.from + (s.dir * SPEED * (Number(s.cruise.currentTime) || 0)) / 1000;
      s.cruise.cancel(); s.cruise = null;
      wrap(s);
    };
    const cruise = (s) => {
      if (s.cruise) return;
      const h = s.group.offsetHeight || 1;
      wrap(s);
      s.from = s.y;
      s.cruise = s.track.animate([{ transform: `translate3d(0, ${s.y}px, 0)` }, { transform: `translate3d(0, ${s.y + s.dir * h}px, 0)` }], { duration: (h / SPEED) * 1000, iterations: Infinity, easing: "linear" });
      if (!visible.has(s.el)) s.cruise.pause();
    };
    const ramp = (e) => e ** 3 - 0.5 * e ** 4;
    let raf = 0, prev = 0;
    const visible = new Set();
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
      const s = sliders.find((q) => q.el === e.target);
      if (s?.cruise) e.isIntersecting ? s.cruise.play() : s.cruise.pause();
    }));
    sliders.forEach((s) => { io.observe(s.el); cruise(s); });
    // When cell height changes, the distance per loop changes too — re-apply the new distance from where it was flowing
    const onResize = () => sliders.forEach((s) => { if (s.cruise) { hold(s); cruise(s); } });
    addEventListener("resize", onResize);
    const tick = (now) => {
      const dt = Math.min(64, Math.max(0, now - (prev || now)));
      prev = now;
      sliders.forEach((s) => {
        if (!visible.has(s.el) || s.drag || s.cruise) return;
        if (s.fling) {
          const f = s.fling, k = Math.exp(-dt / f.tau);
          s.y += (f.target * dt) / 1000 + ((f.v - f.target) * f.tau * (1 - k)) / 1000;
          f.v = f.target + (f.v - f.target) * k;
          if (f.target !== 0 && Math.abs(f.v - f.target) < 2) s.fling = null;
          else if (f.target === 0 && Math.abs(f.v) < 4) { s.fling = null; s.resume = { at: now, done: 0 }; }
        } else if (s.resume) {
          const t = Math.max(0, Math.min(1, (now - s.resume.at - RESUME_DELAY) / RESUME));
          s.y += ((s.dir * SPEED * RESUME) / 1000) * (ramp(t) - ramp(s.resume.done));
          s.resume.done = t;
          if (t === 1) s.resume = null;
        }
        wrap(s);
        if (!s.fling && !s.resume) cruise(s);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const offs = sliders.map((s) => {
      const down = (e) => {
        if (!e.isPrimary || e.button !== 0 || s.drag) return;
        hold(s);
        s.fling = s.resume = null;
        s.drag = { id: e.pointerId, touch: e.pointerType === "touch", x: e.clientX, y: e.clientY, t: e.timeStamp, v: 0 };
        s.el.setPointerCapture(e.pointerId);
        s.el.classList.add("is-dragging");
      };
      const move = (e) => {
        const d = s.drag;
        if (!d || e.pointerId !== d.id) return;
        const delta = d.touch ? e.clientX - d.x : e.clientY - d.y, dt = e.timeStamp - d.t;
        if (dt > 0) d.v += (Math.max(-2800, Math.min(2800, (delta / dt) * 1000)) - d.v) * (1 - Math.exp(-dt / 24));
        s.y += delta;
        wrap(s);
        Object.assign(d, { x: e.clientX, y: e.clientY, t: e.timeStamp });
      };
      const up = (e) => {
        const d = s.drag;
        if (!d || e.pointerId !== d.id) return;
        const v = d.v * Math.exp(-Math.max(0, e.timeStamp - d.t - 40) / 45);
        s.drag = null;
        s.el.classList.remove("is-dragging");
        if (s.el.hasPointerCapture(e.pointerId)) s.el.releasePointerCapture(e.pointerId);
        if (e.type !== "pointerup" || !(Math.abs(v) > SPEED)) return cruise(s);
        const r = Math.min(1, Math.abs(v) / FLICK);
        s.fling = { v, target: v * s.dir > 0 ? s.dir * SPEED : 0, tau: INERTIA * (0.9 + 0.3 * r * r * (3 - 2 * r)) };
      };
      const key = (e) => {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
        e.preventDefault();
        hold(s);
        s.fling = s.resume = null;
        s.y += ((e.key === "ArrowUp" ? -1 : 1) * s.group.offsetHeight) / 6;
        cruise(s);
      };
      const stop = (e) => e.preventDefault();
      const on = { pointerdown: down, pointermove: move, pointerup: up, pointercancel: up, lostpointercapture: up, keydown: key, dragstart: stop };
      Object.entries(on).forEach(([t, f]) => s.el.addEventListener(t, f));
      return () => Object.entries(on).forEach(([t, f]) => s.el.removeEventListener(t, f));
    });
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", onResize); offs.forEach((f) => f()); sliders.forEach((s) => { s.cruise?.cancel(); s.copy.remove(); s.track.style.transform = ""; }); };
  });
})();
