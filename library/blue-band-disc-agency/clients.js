// Customer success — large sentence flowing sideways (scrub), formula lines stacking (original clients-solution: each line attaches below by the previous line’s height b, no gap),
// Result bars grow from below (blur-in values)
(() => {
  const { reduce } = G;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const start = () => {
    if (reduce) return;
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      const line = $(".c-wide__line");
      gsap.fromTo(line, { x: 0 }, { x: () => -(line.scrollWidth), ease: "none", scrollTrigger: { trigger: ".c-wide", start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
      const rows = $$(".c-step"), b = 96;
      rows.forEach((row, p) => ScrollTrigger.create({ trigger: row, start: () => (p === 0 ? "top top" : `top-=${b * p} top`), end: () => `+=${row.offsetHeight * (rows.length - p) + 500}`, pin: true, pinSpacing: false, invalidateOnRefresh: true, refreshPriority: 1 }));
      const bars = $$(".c-bar");
      gsap.set(bars, { scaleY: 0 });
      ScrollTrigger.create({ trigger: ".c-bars__row", start: "top bottom-=100px", once: true, onEnter: () => { gsap.to(bars, { scaleY: 1, duration: 1.2, ease: "power3.out", stagger: 0.07 }); G.blurIn($$(".c-bar > *"), { delay: 0.4 }); } });
    });
  };
  G.boot(start);
})();
