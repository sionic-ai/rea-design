(() => {
  // Plates stacked in one spot are swapped every N seconds (every) with a fade of N seconds (fade), and a ring is drawn straight around the number circle over that time.
  // Like the original (slick fade + stroke-dashoffset transition), when a change starts the ring is redrawn from the beginning, and is-active is added to the current panel to replay the inner CSS motion
  kfFx.register("ring-fade-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const every = (+options.every || 4.5) * 1000, fade = +(options.fade ?? 1) * 1000;
    const ring = el.querySelector('[data-fx-part="ring"]');
    const now = el.querySelector('[data-fx-part="now"]'), total = el.querySelector('[data-fx-part="total"]');
    const len = ring && ring.getTotalLength ? ring.getTotalLength() : 0;
    if (total) total.textContent = slides.length;
    let at = 0, timer = 0, raf = 0;
    slides.forEach((s, i) => {
      s.style.transition = `opacity ${reduce ? 0 : fade}ms ease`;
      s.style.opacity = i === 0 ? "1" : "0";
      s.style.zIndex = i === 0 ? "1" : "0";
      s.classList.toggle("is-active", i === 0);
    });
    const draw = () => {
      if (!ring) return;
      ring.style.strokeDasharray = len;
      ring.style.transition = "none";
      ring.style.strokeDashoffset = len;
      if (reduce) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(() => {
        ring.style.transition = `stroke-dashoffset ${every}ms linear`;
        ring.style.strokeDashoffset = 0;
      }));
    };
    const show = (next) => {
      const prev = slides[at];
      at = next;
      draw();
      slides.forEach((s, i) => { s.style.zIndex = i === at ? "1" : "0"; });
      prev.style.opacity = "0";
      slides[at].style.opacity = "1";
      prev.classList.remove("is-active");
      void slides[at].offsetWidth;
      slides[at].classList.add("is-active");
      if (now) now.textContent = at + 1;
    };
    draw();
    if (!reduce && slides.length > 1) timer = setInterval(() => show((at + 1) % slides.length), every);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
      slides.forEach((s) => { s.style.removeProperty("transition"); s.style.removeProperty("opacity"); s.style.removeProperty("z-index"); s.classList.remove("is-active"); });
      if (ring) ["transition", "stroke-dasharray", "stroke-dashoffset"].forEach((p) => ring.style.removeProperty(p));
    };
  });
})();
