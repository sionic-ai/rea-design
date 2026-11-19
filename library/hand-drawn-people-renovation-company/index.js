// First page: hero shapes, book and clock graphics float up at 1s power2.out with a .15s stagger (original kv_shape entrance) — shared.js calls it each time a page comes in
SL.page("home", (root) => {
  const shapes = root.querySelectorAll("[data-kv-shape]");
  if (SL.reduced || !shapes.length) return;
  gsap.fromTo(shapes, { opacity: 0 }, { opacity: (i, el) => parseFloat(getComputedStyle(el).opacity) || 1, duration: 1, ease: "power2.out", stagger: 0.15 });
});
