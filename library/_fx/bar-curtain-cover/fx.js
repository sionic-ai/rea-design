// While the section’s top edge rises to 40% from the bottom of the screen, bars shoot up (last lead ones first, the rest in shuffled order · .01 gap · power2.out · scrub 1) and cover the screen,
// from 30%→20% the head corners turn sharp, the section bottom edge rounds its bottom corners from 90%→80%, then slides up from 80% to the top of the screen (gap .03 · power2.in)
(() => {
  kfFx.register("bar-curtain-cover", (el, { options, reduce, scroller }) => {
    const curtain = el.querySelector('[data-fx-part="curtain"]');
    if (!curtain || reduce) return;
    const count = Math.max(1, Math.round(+(options.bars || 15)));
    const lead = Math.min(count, Math.round(+(options.lead ?? 3)));
    const round = options.round || "0.5rem";
    const made = !curtain.children.length;
    if (made) curtain.innerHTML = "<i></i>".repeat(count);
    curtain.style.setProperty("--fx-bars", curtain.children.length);
    const bars = [...curtain.children];
    const order = () => {
      const rest = bars.slice(0, bars.length - lead);
      for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
      return [...bars.slice(bars.length - lead).reverse(), ...rest];
    };
    const grow = order(), slide = order();
    const st = (start, end) => ({ trigger: el, start, end, scrub: 1, scroller });
    const ctx = gsap.context(() => {
      gsap.set(bars, { y: "100vh", borderRadius: `${round} ${round} 0 0`, transformOrigin: "bottom center" });
      gsap.to(grow, { y: 0, stagger: 0.01, ease: "power2.out", overwrite: "auto", scrollTrigger: st(options["rise-start"] || "top bottom", options["rise-end"] || "top 40%") });
      gsap.to(grow, { borderRadius: "0px", stagger: 0.03, ease: "power2.out", scrollTrigger: st("top 30%", "top 20%") });
      gsap.to(slide, { borderRadius: `0 0 ${round} ${round}`, stagger: 0.03, ease: "power2.out", scrollTrigger: st("bottom 90%", "bottom 80%") });
      gsap.to(slide, { y: "-100vh", stagger: 0.03, ease: "power2.in", overwrite: "auto", scrollTrigger: st(options["leave-start"] || "bottom 80%", options["leave-end"] || "bottom top") });
    }, el);
    return () => { ctx.revert(); if (made) curtain.innerHTML = ""; curtain.style.removeProperty("--fx-bars"); };
  });
})();
