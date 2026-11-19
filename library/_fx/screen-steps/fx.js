// The phone screen stuck at the center (several screen children) and the text lines beside it (several step children) are advanced one cell at a time by the scroll of a long board (list).
// Divides the list height into (line count + 1) cells, one line per cell — line text appears in the first 1/4 of the cell, rising from 15% of its own height below to 0, and disappears in the last 1/4 rising to −15% (straight line).
// The screen shows only during that span (the Hero from when the phone enters the screen, the end screen until the end element touches the top of the screen), and video plays on entry and pauses on exit (original product app).
(() => {
  kfFx.register("screen-steps", (el, { options, reduce, scroller }) => {
    const q = (p) => [...el.querySelectorAll(`[data-fx-part="${p}"]`)];
    const screens = q("screen"), steps = q("step"), list = q("list")[0], phone = q("phone")[0], end = q("end")[0];
    if (!list || !steps.length) return;
    const rise = +(options.rise ?? 15), edge = +(options.edge ?? 0.25);
    const target = scroller || window;
    const y = () => (scroller ? scroller.scrollTop : scrollY);
    const pageTop = (n) => n.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0) + y();
    const playable = (n) => n instanceof HTMLVideoElement;
    if (reduce) {
      screens.forEach((s, i) => (s.style.opacity = i === 0 ? 1 : 0));
      steps.forEach((s, i) => (s.style.opacity = i === 0 ? 1 : 0));
      return () => [...screens, ...steps].forEach((s) => s.style.removeProperty("opacity"));
    }
    let S = [], C = [], marge = 0, raf = 0;
    const playing = new Set();
    const measure = () => {
      const vh = scroller ? scroller.clientHeight : innerHeight;
      const top = pageTop(list), e = list.offsetHeight / (steps.length + 1);
      marge = e * edge;
      playing.forEach((v) => v.pause());
      playing.clear();
      S = screens.map((n, t) => {
        n.style.opacity = 0;
        const o = top + e * t;
        return { n, start: t === 0 && phone ? pageTop(phone) - vh : o, end: t === screens.length - 1 && end ? pageTop(end) : o + e, out: true };
      });
      C = steps.map((n, t) => { n.style.opacity = 0; return { n, start: top + e * t, end: top + e * t + e, out: true }; });
    };
    const lerp = (a, b, v) => a + (b - a) * Math.max(0, Math.min(1, v));
    const draw = () => {
      raf = 0;
      const r = y();
      for (const s of S) {
        const inside = r > s.start && r < s.end;
        if (inside && s.out) {
          s.out = false;
          s.n.style.opacity = 1;
          if (playable(s.n)) { s.n.play().catch(() => {}); playing.add(s.n); }
        } else if (!inside && !s.out) {
          s.out = true;
          s.n.style.opacity = 0;
          if (playable(s.n)) { s.n.pause(); playing.delete(s.n); }
        }
      }
      for (const c of C) {
        if (r > c.start && r < c.end) {
          c.out = false;
          let o, t;
          if (r < c.start + marge) { const k = (r - c.start) / marge; o = lerp(0, 1, k); t = lerp(rise, 0, k); }
          else { const k = (r - (c.end - marge)) / marge; o = lerp(1, 0, k); t = lerp(0, -rise, k); }
          c.n.style.opacity = o.toFixed(6);
          c.n.style.transform = `translate3d(0, ${t.toFixed(3)}%, 0)`;
        } else if (!c.out) { c.out = true; c.n.style.opacity = 0; }
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const onResize = () => { measure(); draw(); };
    target.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(list);
    measure();
    draw();
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      ro.disconnect();
      playing.forEach((v) => v.pause());
      [...screens, ...steps].forEach((n) => { n.style.removeProperty("opacity"); n.style.removeProperty("transform"); });
    };
  });
})();
