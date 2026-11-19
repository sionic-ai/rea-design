// Each grid cell is pushed up or down by a set amount for its column (px at a 1512px screen, scaled with screen width) and flows tied to scroll (scrub 1) — a Work grid where columns drift out of step.
// Per cell while on screen: turns on in the first .3, turns off from .75 over .45 (proportional to the length of its cell passing from screen bottom to top)
(() => {
  kfFx.register("column-drift", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const cards = () => [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards().length) return;
    const list = (s, d) => String(s ?? d).split(",").map(Number).filter((n) => !Number.isNaN(n));
    const d4 = list(options.drift4, "-250,200,-150,130"), d3 = list(options.drift3, "-200,250,-150");
    const base = +(options.base || 1512), scrub = +(options.scrub ?? 1);
    const fin = +(options.fadeIn ?? 0.3), fout = +(options.fadeOut ?? 0.45), fat = +(options.fadeAt ?? 0.75);
    const fluid = (px) => (px / base) * innerWidth;
    const cols = () => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    let mm = null;
    const build = () => {
      mm?.revert();
      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const n = cols(), drifts = n >= 4 ? d4 : n === 3 ? d3 : [0];
        cards().forEach((c, i) => {
          const d = drifts[i % drifts.length] || 0;
          if (d) gsap.to(c, { y: () => fluid(d), ease: "none", scrollTrigger: { trigger: el, scroller, start: "top bottom", end: "bottom top", scrub, invalidateOnRefresh: true } });
          if (options.fade !== "off") {
            const tl = gsap.timeline({ scrollTrigger: { trigger: c, scroller, start: "top bottom", end: "bottom top", scrub: true } });
            tl.fromTo(c, { opacity: 0 }, { opacity: 1, ease: "none", duration: fin }, 0).to(c, { opacity: 0, ease: "none", duration: fout }, fat);
          }
        });
      });
    };
    build();
    // Rebuilt when the column count changes — the grid in use has four columns on wide screens, three on medium, one on narrow
    let n0 = cols();
    const ro = new ResizeObserver(() => { const n = cols(); if (n !== n0) { n0 = n; build(); } });
    ro.observe(el);
    return () => { ro.disconnect(); mm?.revert(); };
  });
})();
