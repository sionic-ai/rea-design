// a horizontally scrolling card row rests, then departs one screen at a time very slowly and stops very slowly — the original moves scrollLeft directly with rAF (not swiper)
(() => {
  const quint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2);
  kfFx.register("ease-step-strip", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]') || el.firstElementChild;
    if (!track) return;
    const originals = [...track.children];
    if (!originals.length) return;
    el.classList.add("is-fx-strip");
    if (reduce) return () => el.classList.remove("is-fx-strip");
    const every = Math.max(0.5, +(options.every ?? 5)) * 1000;
    const dur = +(options.dur ?? 2.5) * 1000;
    // Clone the first few slides at the end so the loop can jump back to the start unnoticed
    const clones = originals.slice(0, Math.min(+(options.clones ?? 6), originals.length)).map((c) => {
      const k = c.cloneNode(true);
      k.setAttribute("aria-hidden", "true");
      k.querySelectorAll("a,button").forEach((a) => a.setAttribute("tabindex", "-1"));
      track.appendChild(k);
      return k;
    });
    const all = [...track.children];
    let held = false, busy = false, raf = 0, idle = 0, visible = true;
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
    const loopWidth = () => {
      const first = originals[0], firstClone = clones[0];
      return firstClone ? firstClone.offsetLeft - first.offsetLeft : originals.length * (first.offsetWidth + gap());
    };
    const wrap = () => {
      const w = loopWidth();
      if (w > 0 && Math.round(el.scrollLeft) >= Math.round(w) - 5) el.scrollLeft -= w;
      else if (el.scrollLeft < 0) el.scrollLeft += w;
    };
    const glide = (to) => {
      cancelAnimationFrame(raf);
      const from = el.scrollLeft, change = to - from;
      let start = 0;
      const step = (now) => {
        if (!start) start = now;
        const p = Math.min(Math.max(0, now - start) / Math.max(1, dur), 1);
        busy = true;
        el.scrollLeft = from + change * quint(p);
        if (p < 1) raf = requestAnimationFrame(step);
        else requestAnimationFrame(() => (busy = false));
      };
      raf = requestAnimationFrame(step);
    };
    const tick = () => {
      if (held || !visible) return;
      cancelAnimationFrame(raf);
      wrap();
      const goal = el.scrollLeft + el.offsetWidth;
      let to = goal, best = Infinity;
      all.forEach((s) => {
        const d = Math.abs(s.offsetLeft - track.offsetLeft - goal);
        if (d < best) { best = d; to = s.offsetLeft - track.offsetLeft; }
      });
      glide(to);
    };
    const timer = setInterval(tick, every);
    const enter = () => (held = true);
    const leave = () => (held = false);
    // Pushing by hand pauses auto-advance for 1 second
    const onScroll = () => {
      if (busy) return;
      held = true;
      clearTimeout(idle);
      idle = setTimeout(() => (held = el.matches(":hover")), 1000);
    };
    // Always attached like the original — even in windows where (hover: hover) is false (headless·pen), it must pause when a mouse comes over so the card under the cursor doesn’t slip away
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    return () => {
      clearInterval(timer); clearTimeout(idle); cancelAnimationFrame(raf); io.disconnect();
      el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave);
      el.removeEventListener("scroll", onScroll);
      clones.forEach((k) => k.remove());
      el.classList.remove("is-fx-strip");
      el.scrollLeft = 0;
    };
  });
})();
