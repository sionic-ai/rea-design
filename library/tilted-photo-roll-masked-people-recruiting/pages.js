// Per-page motion. Each time swup swaps #hk-swap, shared.js calls it by the data-page name and releases it with the function it returned.
(() => {
  // Interview detail: the fixed back photo blurs to 16.25px from the document top until the document end reaches the screen center (scrub .1),
  // The row of collaborators fades from when it reaches screen center until it leaves the top of the screen (original bundle.js values)
  HK.page("detail", (root) => {
    const bg = root.querySelector(".js-interview-bg"), end = root.querySelector(".js-interview-participate");
    if (!bg || !end || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = gsap.to(bg, { filter: "blur(16.25px)", duration: 1, ease: "none", scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom center", scrub: 0.1 } });
    const b = gsap.to(bg, { opacity: 0, duration: 1, ease: "none", scrollTrigger: { trigger: end, start: "top center", scrub: 0.1 } });
    return () => { [a, b].forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); gsap.set(bg, { clearProps: "filter,opacity" }); };
  });
})();
