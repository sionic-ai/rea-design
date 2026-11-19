// Services — scroll accordion: the section sticks below the header row (42px), and over (item count−1) × half the screen height, the next item opens as much as the current item’s content shrinks.
// The current number is a filled circle, and the left photo switches to that item’s, scaling 1.2→1 (2.5s power2.out).
(() => {
  const root = document.querySelector("[data-scroll-accordion]");
  if (!root) return;
  const items = [...root.querySelectorAll("[data-sa-item]")];
  const contents = items.map((it) => it.querySelector("[data-sa-content]"));
  const medias = [...root.querySelectorAll("[data-sa-media]")];
  const n = items.length;
  let cur = -1;
  const mark = (i) => {
    if (i === cur) return;
    cur = i;
    items.forEach((it, k) => it.classList.toggle("is-on", k === i));
    medias.forEach((m, k) => m.classList.toggle("is-on", k === i));
    if (medias[i]) gsap.fromTo(medias[i], { scale: 1.2 }, { scale: 1, duration: 2.5, ease: "power2.out", overwrite: true });
  };
  gsap.matchMedia().add({ wide: "(min-width: 64rem)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (!ctx.conditions.wide || ctx.conditions.reduce) {
      contents.forEach((c) => gsap.set(c, { height: "auto" }));
      mark(0);
      return;
    }
    const H = contents.map((c) => { gsap.set(c, { height: "auto" }); return c.getBoundingClientRect().height; });
    const set = (y) => {
      const v = Math.floor(y), w = y - v;
      contents.forEach((c, k) => {
        if (w === 0) gsap.set(c, { height: k === v ? "auto" : 0 });
        else if (k === v) gsap.set(c, { height: H[k] * (1 - w) });
        else if (k === v + 1) gsap.set(c, { height: H[k] * w });
        else gsap.set(c, { height: 0 });
      });
    };
    set(0);
    mark(0);
    const st = ScrollTrigger.create({
      trigger: root, start: "top top+=42px", end: () => `+=${(n - 1) * innerHeight * 0.5}`, pin: true, pinSpacing: true, scrub: 0,
      onUpdate(self) { const y = self.progress * (n - 1); mark(Math.min(Math.floor(y), n - 1)); set(y); },
    });
    return () => { st.kill(); contents.forEach((c) => gsap.set(c, { clearProps: "height" })); };
  });
})();
