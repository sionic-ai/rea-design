// Filled text layered over a large outline-only line gets painted from the left as you scroll — from when the panel’s top edge reaches 65% of the screen until its bottom edge reaches 60% (scrub, no curve),
// Per line, .6 stagger clip-path inset(−.35em 100% −.45em 0) → inset(−.35em 0 −.45em 0). The dimension note beside it fades from progress .4 to .15.
// Original site manifesto (data-wireframe · data-wf-solid · data-wf-note).
(() => {
  kfFx.register("outline-clip-fill-scrub", (el, { options, reduce, scroller }) => {
    const solids = [...el.querySelectorAll('[data-fx-part="solid"]')];
    if (!solids.length) return;
    const notes = [...el.querySelectorAll('[data-fx-part="note"]')];
    const from = "inset(-0.35em 100% -0.45em 0em)", to = "inset(-0.35em 0% -0.45em 0em)";
    if (reduce) { gsap.set(solids, { clipPath: to }); return () => gsap.set(solids, { clearProps: "clipPath" }); }
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, scroller, start: options.start || "top 65%", end: options.end || "bottom 60%", scrub: options.scrub != null ? +options.scrub || true : true } });
      tl.fromTo(solids, { clipPath: from }, { clipPath: to, stagger: +(options.each ?? 0.6) });
      if (notes.length) tl.to(notes, { opacity: +(options.dim ?? 0.15) }, 0.4);
    });
    return () => mm.revert();
  });
})();
