// Motion for sub pages only — Services way of working (wide screens: pin the panel and for +250% scrub 1 the second and third photos overlap in, and steps rise from 40px below in turn),
// The work list’s ”Load more” (opens the hidden cells).
(() => {
  const steps = document.querySelector(".sv-steps__pin");
  if (steps) {
    const layers = [...steps.querySelectorAll(".sv-steps__img .wf-img")], items = [...steps.querySelectorAll(".sv-step")];
    gsap.matchMedia().add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.set(layers, { opacity: (i) => (i === 0 ? 1 : 0) });
      gsap.set(items[0], { opacity: 1, y: 0 });
      gsap.set(items.slice(1), { opacity: 0, y: 40 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: steps, start: "top top", end: "+=250%", pin: true, pinSpacing: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.to({}, { duration: 1 });
      for (let i = 1; i < items.length; i++) tl.to(layers[i] || {}, { opacity: 1, duration: 1 }, "<").to(items[i], { opacity: 1, y: 0, duration: 1 }, "<").to({}, { duration: 1 });
      return () => tl.scrollTrigger?.kill(true);
    });
  }
  const grid = document.querySelector(".wk-grid");
  if (grid) {
    const tiles = [...grid.querySelectorAll(".wk-tile")];
    tiles.slice(12).forEach((t) => t.classList.add("is-extra"));
    const more = grid.querySelector("[data-more]");
    if (tiles.length <= 12) more?.remove();
    more?.addEventListener("click", (e) => { e.preventDefault(); grid.classList.add("is-more"); more.remove(); ScrollTrigger.refresh(); });
  }
})();
