// Original enigma mystery-box: pins the section for 150% (scrub 1). During the first .4 the zipper pull moves from the right end to the left end (xPercent −101) while the teeth row is erased from the right (clip inset right 0 → 101%, no curve).
// Then for .4 the top cover splits to −89% and the bottom cover to 89% (power1.in), the zipper vanishes at .06, and the last .2 stays open.
(() => {
  kfFx.register("zip-split-pin", (el, { options, reduce, scroller }) => {
    const q = (k) => el.querySelector(`[data-fx-part="${k}"]`);
    const chain = q("chain"), slider = q("slider"), top = q("top"), bottom = q("bottom"), zip = q("zip");
    if (!top || !bottom) return;
    gsap.registerPlugin(ScrollTrigger);
    const split = +(options.split ?? 89);
    if (reduce) {
      gsap.set(top, { yPercent: -split }); gsap.set(bottom, { yPercent: split });
      if (zip) gsap.set(zip, { autoAlpha: 0 });
      return () => gsap.set([top, bottom, zip].filter(Boolean), { clearProps: "all" });
    }
    const tl = gsap.timeline({
      scrollTrigger: { scroller, trigger: el, start: options.start || "top top", end: "+=" + (options.end || "150%"), pin: true, scrub: options.scrub != null ? +options.scrub : 1, invalidateOnRefresh: true },
    });
    if (chain) tl.fromTo(chain, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 101% 0% 0%)", ease: "none", duration: 0.4 }, 0);
    if (slider) tl.to(slider, { xPercent: -101, ease: "none", duration: 0.4 }, 0);
    tl.to(top, { yPercent: -split, ease: "power1.in", duration: 0.4 }, 0.4)
      .to(bottom, { yPercent: split, ease: "power1.in", duration: 0.4 }, 0.4);
    if (zip) tl.to(zip, { autoAlpha: 0, duration: 0.06 }, 0.4);
    tl.to({}, { duration: 0.2 }, 0.8);
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([chain, slider, top, bottom, zip].filter(Boolean), { clearProps: "all" }); };
  });
})();
