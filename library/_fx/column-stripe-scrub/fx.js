// Ten vertical strip columns covering the large photo are tied to scroll and shrink in turn to open the photo, after the quote text lights up, the strips cover it again from below
(() => {
  kfFx.register("column-stripe-scrub", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    if (!stage) return;
    const cols = Math.max(1, +(options.cols || 12));
    el.style.setProperty("--fx-cols", cols);
    const layer = document.createElement("div");
    layer.className = "fx-stripes";
    layer.innerHTML = '<i class="fx-stripe"></i>'.repeat(cols + 2);
    stage.append(layer);
    const stripes = [...layer.children];
    const text = el.querySelector('[data-fx-part="text"]');
    if (reduce) { gsap.set(stripes, { height: 0 }); return () => { layer.remove(); el.style.removeProperty("--fx-cols"); }; }
    const ease = "power4.out";
    let split = null;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      split = text && window.SplitText ? SplitText.create(text, { type: "words,chars", charsClass: "fx-ch", mask: "chars" }) : null;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller, start: options.start || "top bottom", end: options.end || "bottom -40", scrub: +(options.scrub ?? 0.8) } });
      tl.fromTo(stripes, { height: "100vh" }, { height: "0vh", duration: 0.45, ease, stagger: { amount: 0.2 } }, 0);
      if (split) tl.fromTo(split.chars, { opacity: 0, yPercent: 100 }, { opacity: 1, yPercent: 0, duration: 0.05, ease, stagger: { amount: 0.4 } }, 0.24);
      if (options.close !== "off") tl.fromTo(stripes, { yPercent: 100, height: "100vh" }, { yPercent: 0, height: "100vh", duration: 0.47, ease, stagger: { amount: 0.2 }, immediateRender: false }, 0.83);
      return () => { split?.revert(); split = null; };
    });
    return () => { mm.revert(); layer.remove(); el.style.removeProperty("--fx-cols"); };
  });
})();
