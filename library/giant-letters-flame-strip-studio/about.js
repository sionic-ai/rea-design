// About: stacked photo panels shrink slightly and darken as the front panel covers them.
(() => {
  window.SF.page.about = (c) => {
    const { reduce, $$ } = window.SF;
    if (reduce) return;
    const panels = $$(".ab-panel", c);
    panels.forEach((p, i) => {
      if (i === panels.length - 1) return;
      gsap.to(p.querySelector(".ab-ph"), { scale: 0.94, opacity: 0.4, ease: "none", scrollTrigger: { trigger: panels[i + 1], start: "top bottom", end: "top top", scrub: true } });
    });
  };
})();
