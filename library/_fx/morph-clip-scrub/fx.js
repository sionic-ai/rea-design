// The photo window’s clip shape changes into other shapes (MorphSVG) while descending a long fixed stage, and the photos inside cross-switch —
// Reads the whole stage scroll as 0 to 1 and changes over len starting at at with no easing (scrub) (Brand about section: .15 to .33)
(() => {
  kfFx.register("morph-clip-scrub", (el, { options, reduce, scroller }) => {
    const shape = el.querySelector('[data-fx-part="shape"]');
    const to = shape?.getAttribute("data-to");
    if (!shape || !to) return;
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    const track = (options.track && document.querySelector(options.track)) || el.closest("section") || el;
    const at = +(options.at ?? 0.15), len = +(options.len ?? 0.33);
    const ease = options.ease ? kfFx.ease(options.ease, "none") : "none";
    const from = shape.getAttribute("d");
    const end = () => {
      shape.setAttribute("d", to);
      photos.forEach((p, i) => gsap.set(p, { opacity: i === photos.length - 1 ? 1 : 0 }));
    };
    if (reduce) { end(); return () => shape.setAttribute("d", from); }
    gsap.registerPlugin(ScrollTrigger);
    const canMorph = !!window.MorphSVGPlugin;
    if (canMorph) gsap.registerPlugin(MorphSVGPlugin);
    const tl = gsap.timeline({ scrollTrigger: { scroller, trigger: track, start: "top top", end: "bottom bottom", scrub: true } });
    if (canMorph) tl.to(shape, { morphSVG: to, ease, duration: len }, at);
    else tl.set(shape, { attr: { d: to } }, at + len / 2);
    // Photo overlap uses no separate curve, like the original (GSAP default power1.out)
    photos.forEach((p, i) => {
      if (i === 0) tl.fromTo(p, { opacity: 1 }, { opacity: photos.length > 1 ? 0 : 1, duration: len }, at);
      else tl.fromTo(p, { opacity: 0 }, { opacity: i === photos.length - 1 ? 1 : 0, duration: len }, at);
    });
    tl.to({}, { duration: Math.max(0, 1 - at - len) });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); shape.setAttribute("d", from); gsap.set(photos, { clearProps: "opacity" }); };
  });
})();
