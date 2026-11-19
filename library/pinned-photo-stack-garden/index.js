// First page: two lines from the label to the first photo (redrawn on every scroll and resize), three-photo pin stack (3000px · scrub 1 · 4 per section), horizontal band parallax (-30%, scrub).
(() => {
  gsap.registerPlugin(ScrollTrigger);

  // Two lines — from the label’s bottom-left and bottom-right corners to the first photo’s top-left and top-right corners
  const deco = document.querySelector(".kt-kv__deco");
  const first = document.querySelector(".kt-photos__item");
  const [la, lb] = document.querySelectorAll(".kt-kv__lines line");
  if (deco && first && la && lb) {
    const draw = () => {
      const d = deco.getBoundingClientRect(), p = first.getBoundingClientRect();
      la.setAttribute("x1", d.left); la.setAttribute("y1", d.bottom); la.setAttribute("x2", p.left); la.setAttribute("y2", p.top);
      lb.setAttribute("x1", d.right); lb.setAttribute("y1", d.bottom); lb.setAttribute("x2", p.right); lb.setAttribute("y2", p.top);
    };
    requestAnimationFrame(draw);
    addEventListener("resize", draw);
    addEventListener("scroll", draw, { passive: true });
    document.fonts?.ready.then(draw);
  }

  gsap.matchMedia().add(
    { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
    (ctx) => {
      const items = gsap.utils.toArray(".kt-photos__item");
      if (ctx.conditions.still) {
        gsap.set(items, { y: 0 });
        return;
      }
      // Three photos — the panel is pinned and over 3000px the second and third photos rise in turn from 100vh below to cover it
      const list = document.querySelector(".kt-photos__list");
      if (list && items.length > 1) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: "top top", end: "+=3000", pin: true, scrub: 1 } });
        items.forEach((it, i) => { if (i) tl.to(it, { y: 0, duration: 4 }); });
      }
      // Horizontal strip — from when the strip enters the screen until it leaves, the photo rises -30% (the original gave no curve either, so GSAP default power1.out)
      const band = document.querySelector(".kt-hr");
      if (band) gsap.to(band.querySelector(".kt-hr__img"), { yPercent: -30, scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: true } });
    },
  );
})();
