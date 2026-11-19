(() => {
  // Once the panel size is measured, sets the length to match, and when visible sweeps once to reveal — after sweeping, removes the mask so hover and shadow are not clipped
  kfFx.register("slash-band-reveal", (el, { options, reduce }) => {
    if (reduce) { el.classList.add("is-done"); return () => el.classList.remove("is-done"); }
    const ro = new ResizeObserver((es) => es.forEach((e) => {
      const b = e.borderBoxSize?.[0];
      el.style.setProperty("--fx-w", Math.round(b ? b.inlineSize : el.offsetWidth));
      el.style.setProperty("--fx-h", Math.round(b ? b.blockSize : el.offsetHeight));
    }));
    ro.observe(el);
    const at = options.at ?? "-10%";
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      el.classList.add("is-in");
      io.disconnect();
    }), { rootMargin: `0px 0px ${at} 0px`, threshold: 0 });
    io.observe(el);
    const end = (e) => { if (e.target === el && e.animationName === "fx-slash-band") { el.classList.add("is-done"); ro.disconnect(); } };
    el.addEventListener("animationend", end);
    return () => {
      io.disconnect(); ro.disconnect();
      el.removeEventListener("animationend", end);
      el.classList.remove("is-in", "is-done");
      el.style.removeProperty("--fx-w"); el.style.removeProperty("--fx-h");
    };
  });
})();
