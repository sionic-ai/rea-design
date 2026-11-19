// A sidebar fixed to the screen stops above the top edge of the lower band (the element picked by stop) when it touches it, and is pushed up as the band rises.
// The original (Brand) measures on every scroll the band top − sidebar bottom, and if it is less than 0 lifts by that amount, but never higher than the very top (up to −scrollY). It sticks to the scroll with no curve.
(() => {
  kfFx.register("band-push-sidebar", (el, { options, scroller }) => {
    const sel = options.stop || "footer";
    const gap = +(options.gap ?? 0);
    const below = +(options.below ?? 0);
    const root = scroller || window;
    const narrow = below ? matchMedia(`(max-width: ${below}px)`) : null;
    let raf = 0;
    const update = () => {
      raf = 0;
      const band = document.querySelector(sel);
      if (!band || narrow?.matches) { el.style.translate = ""; return; }
      // Bottom edge before pushing — translate isn’t included in the offset value
      const bottom = el.offsetTop + el.offsetHeight + gap;
      const y = scroller ? scroller.scrollTop : scrollY;
      const push = Math.max(Math.min(band.getBoundingClientRect().top - bottom, 0), -y);
      el.style.translate = push ? `0 ${push}px` : "";
    };
    const soon = () => { if (!raf) raf = requestAnimationFrame(update); };
    root.addEventListener("scroll", soon, { passive: true });
    addEventListener("resize", soon);
    narrow?.addEventListener("change", soon);
    // Height changes late due to fonts, images, and other parts
    const ro = new ResizeObserver(soon);
    ro.observe(el);
    ro.observe(document.body);
    update();
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", soon);
      removeEventListener("resize", soon);
      narrow?.removeEventListener("change", soon);
      ro.disconnect();
      el.style.translate = "";
    };
  });
})();
