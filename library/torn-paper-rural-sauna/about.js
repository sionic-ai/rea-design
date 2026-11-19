// Subpage-only motion: the four title characters start offset, then stamp into place stepwise (2 horizontal steps → 1 vertical step),
// At 1024 and below, the attached photo goes half dark while the text rises.
// Original stamps the title after the outer frame has appeared for .5s (pageonload) — same on first open and when arriving via swup.
brand.page("about", (main, { reduce }) => {
  const c = (n) => main.querySelector(`.ab-mv__title [data-c="${n}"]`);
  const mm = gsap.matchMedia();
  if (reduce) { gsap.set(main.querySelectorAll(".ab-mv__title span"), { x: 0, y: 0 }); return null; }
  const tl = gsap.timeline({ delay: 0.5 })
    .to(c(1), { x: 0, duration: 1, ease: "steps(2)" })
    .to(c(1), { y: 0, duration: 0.5, ease: "steps(1)" }, "<+.3")
    .to(c(2), { y: 0, duration: 1, ease: "steps(2)" }, "<-.1")
    .to(c(2), { x: 0, duration: 0.5, ease: "steps(1)" }, "<+.3")
    .to(c(3), { y: 0, duration: 1, ease: "steps(2)" }, "<-.1")
    .to(c(3), { x: 0, duration: 0.5, ease: "steps(1)" }, "<+.3")
    .to(c(4), { x: 0, duration: 1, ease: "steps(2)" }, "<-.1")
    .to(c(4), { y: 0, duration: 0.5, ease: "steps(1)" }, "<+.3");
  mm.add("(max-width: 1024px)", () => {
    gsap.fromTo(main.querySelector(".ab-mv__img"), { "--scrub": 0 }, { "--scrub": 1, ease: "none", scrollTrigger: { trigger: main.querySelector(".ab-mv__title"), start: "top 80%", end: "top 20%", scrub: true } });
  });
  return () => { tl.kill(); mm.revert(); };
});
