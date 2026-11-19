(() => {
  kfFx.register("line-draw-loop", (el, { options, reduce, scroller }) => {
    const paths = [...el.querySelectorAll("path")];
    if (!paths.length) return;
    if (reduce) { gsap.set(paths, { opacity: 1 }); return () => gsap.set(paths, { clearProps: "opacity" }); }
    gsap.registerPlugin(ScrollTrigger);
    const len = +options.len || Math.max(...paths.map((p) => p.getTotalLength?.() || 0)) || 1000;
    const rest = +(options.rest ?? 8);
    const st = String(options.when || "").trim() === "view" ? { scroller, trigger: el, start: "top 80%", end: "bottom 20%", toggleActions: "play none none none" } : undefined;
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: st, repeat: -1, repeatDelay: rest })
        .fromTo(paths, { strokeDasharray: len + "px", strokeDashoffset: len + "px", autoAlpha: 1 }, { duration: +(options.draw ?? 3.6), strokeDashoffset: 0, ease: "power4.inOut" })
        .to(paths, { duration: 0, strokeDashoffset: 2 * len + "px" })
        .to(paths, { duration: +(options.erase ?? 1.4), strokeDashoffset: len + "px", ease: "power1.out" });
      gsap.timeline({ scrollTrigger: st && { ...st }, repeat: -1, repeatDelay: rest }).fromTo(el, { x: +(options.from ?? -60) }, { duration: +(options.travel ?? 5), x: +(options.to ?? 60), ease: "power1.out" });
    }, el);
    return () => ctx.revert();
  });
})();
