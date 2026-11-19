// photo inside a horizontally flowing band — while crossing the screen the inner image slides from −max% to 0, and appears once when it comes within at px of the right edge
(() => {
  kfFx.register("side-pass-parallax", (el, { options, reduce }) => {
    const inner = el.querySelector('[data-fx-part="img"]') || el.firstElementChild;
    const max = +(options.max ?? 25), at = +(options.at ?? 200), atY = +(options["at-y"] ?? 100);
    const fade = options.fade !== "off", wide = +options.wide || 1025;
    if (reduce || !inner) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = el.getBoundingClientRect(), W = innerWidth, H = innerHeight;
      if (innerWidth >= wide) {
        if (r.left <= W && r.right >= 0) {
          const p = (W - r.left) / (W + r.width);
          if (max) inner.style.transform = `translateX(-${max * (1 - p)}%)`;
        }
        if (fade && r.left <= W - at && r.right >= 0) el.classList.add("is-in");
      } else {
        inner.style.transform = "";
        if (fade && r.top <= H - atY) el.classList.add("is-in");
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    // The horizontal strip is moved by ScrollTrigger, so its position changes even without scroll events — re-measure on that update too
    window.ScrollTrigger?.addEventListener("refresh", onScroll);
    update();
    return () => {
      removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll);
      window.ScrollTrigger?.removeEventListener("refresh", onScroll);
      inner.style.transform = ""; el.classList.remove("is-in");
    };
  });
})();
