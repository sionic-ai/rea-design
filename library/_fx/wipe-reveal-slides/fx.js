// Of the stacked sections, raises the next one to the top and opens it with clip-path from one end — the old section stays underneath until the new one fully opens, so there is no gap.
// The image in the new section settles into place from 1.1x, shifted 3% toward the push direction, with the same length and curve. Stop the clock when it is off-screen
(() => {
  kfFx.register("wipe-reveal-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2) return;
    const interval = +(options.interval ?? 5) * 1000, dur = +(options.dur ?? 2.4);
    const set = [];
    const put = (k, v) => { el.style.setProperty(k, v); set.push(k); };
    put("--fx-dur", dur + "s");
    if (options.ease) put("--fx-ease", `cubic-bezier(${options.ease})`);
    if (options.shift != null) put("--fx-shift", options.shift);
    if (options.zoom != null) put("--fx-zoom", options.zoom);
    // from: right (default, opens from the right edge toward the left) · left · bottom · top
    const from = options.from || "right";
    el.classList.add(`fx-wrs-from-${from}`);
    let at = 0, timer = 0, visible = true;
    slides.forEach((s, i) => s.classList.toggle("is-current", i === 0));
    const go = () => {
      el.classList.add("fx-wrs-moved");
      const prev = slides[at];
      at = (at + 1) % slides.length;
      const next = slides[at];
      slides.forEach((s) => s.classList.remove("is-under"));
      prev.classList.remove("is-current");
      prev.classList.add("is-under");
      next.classList.remove("is-current");
      void next.offsetWidth;
      next.classList.add("is-current");
      const done = () => { prev.classList.remove("is-under"); next.removeEventListener("transitionend", done); };
      next.addEventListener("transitionend", done);
    };
    const run = () => { clearInterval(timer); if (!reduce && visible) timer = setInterval(go, interval); };
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; run(); });
    io.observe(el);
    el.classList.add("fx-wrs-on");
    return () => { clearInterval(timer); io.disconnect(); el.classList.remove("fx-wrs-on", "fx-wrs-moved", `fx-wrs-from-${from}`); slides.forEach((s) => s.classList.remove("is-current", "is-under")); set.forEach((k) => el.style.removeProperty(k)); };
  });
})();
