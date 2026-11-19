(() => {
  // Binds the width of small photo slots between big words to scroll — the photo inside stays centered at the fully opened width, so more is revealed as the slot widens
  kfFx.register("word-gap-scrub", (el, { options, reduce, scroller }) => {
    const gap = el.querySelector('[data-fx-part="gap"]');
    if (!gap) return;
    const from = options.from || "0.9em", to = options.to || "4.2em";
    gap.style.setProperty("--fx-to", to);
    if (reduce) { gap.style.width = to; return () => { gap.style.removeProperty("width"); gap.style.removeProperty("--fx-to"); }; }
    const tw = gsap.fromTo(gap, { width: from }, { width: to, ease: options.ease || "none", scrollTrigger: { trigger: el, scroller, start: options.start || "top 70%", end: options.end || "center 40%", scrub: options.scrub ? +options.scrub : true } });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(gap, { clearProps: "width" }); gap.style.removeProperty("--fx-to"); };
  });
})();
