(() => {
  // With the last page section pinned to the screen, the footer hidden below the screen (position: fixed) slides up from below and covers it while scrolling by the footer’s height (scrub 0, no curve).
  // Attach to the last section (the panel to be pinned), the footer is [data-fx-part=Place it inside footer] or anywhere in the document (can also be chosen with the sel option)
  kfFx.register("cover-up-footer", (el, { options, reduce, scroller }) => {
    const foot = el.querySelector('[data-fx-part="footer"]') || (options.sel && document.querySelector(options.sel));
    if (!foot || !window.ScrollTrigger) return;
    if (reduce) { foot.classList.add("is-static"); return () => foot.classList.remove("is-static"); }
    const scrub = +(options.scrub ?? 0);
    gsap.set(foot, { yPercent: 100 });
    const tw = gsap.to(foot, {
      yPercent: 0, ease: "none",
      scrollTrigger: { trigger: el, scroller, start: options.start || "bottom bottom", end: () => "+=" + foot.offsetHeight, pin: true, scrub, invalidateOnRefresh: true },
    });
    return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(foot, { clearProps: "transform" }); };
  });
})();
