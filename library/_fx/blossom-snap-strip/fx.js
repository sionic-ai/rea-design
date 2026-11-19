// blossom-carousel (the build embedded in the original as is) layers mouse drag, inertia and cell snapping on native horizontal scroll. On phones, finger scrolling stays as is.
// Without the library, it simply remains a horizontal scroll strip
(() => {
  kfFx.register("blossom-snap-strip", (el, { options }) => {
    if (!window.BlossomCarousel || !el.children.length) return;
    const api = BlossomCarousel.Blossom(el, { repeat: options.repeat === "true" });
    api.init();
    return () => api.destroy();
  });
})();
