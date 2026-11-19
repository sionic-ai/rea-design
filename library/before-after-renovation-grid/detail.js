// Before-renovation photo slider — same Splide 4.1.4 settings as the original. On wide screens two half-width slides at a time (2.5% margin left and right, arrows), on phone a center-aligned loop.
// Both transitions are .6s. If there are fewer photos than fit one screen, turn dragging off.
(() => {
  const el = document.querySelector(".detail-before-slider");
  if (!el || !window.Splide) return;
  const slides = el.querySelectorAll(".splide__slide");
  let s = null;
  const mount = (pc) => {
    const enough = slides.length >= (pc ? 3 : 2);
    s?.destroy(true);
    s = new Splide(el, pc
      ? { pagination: false, arrows: true, fixedWidth: "50%", padding: "2.5%", drag: enough, speed: 600 }
      : { type: enough ? "loop" : "slide", focus: "center", rewind: true, pagination: false, padding: "5%", drag: enough, speed: 600 });
    s.mount();
  };
  gsap.matchMedia().add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)" }, (ctx) => mount(ctx.conditions.pc));
})();
