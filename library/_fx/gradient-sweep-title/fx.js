// Lay a gradient inside the big title letters (base color → blended mid color → accent color) at 200% width, and when it hits the start line, push it through once to tint them
(() => {
  kfFx.register("gradient-sweep-title", (el, { options, reduce, scroller }) => {
    if (reduce || !window.gsap || !window.ScrollTrigger) { el.classList.add("fx-swept"); return () => el.classList.remove("fx-swept"); }
    gsap.registerPlugin(ScrollTrigger);
    const dur = +(options.dur ?? 0.5), delay = +(options.delay ?? 0);
    // size — gradient width (%), default 200 (duo type 300). reverse: 1 pushes it 100% → 0% (Brand hero white text runs 500% in reverse)
    const duo = options.look === "duo", diag = options.look === "diag";
    const size = +(options.size || (diag ? 1000 : duo ? 300 : 200)), back = options.reverse === "1";
    const y = duo ? "50%" : "0%";
    // diag moves along two axes — 80% 80% (band is outside the text at bottom right) → 0% 0%
    const a = diag ? (back ? "0% 0%" : "80% 80%") : `${back ? 100 : 0}% ${y}`;
    const b = diag ? (back ? "80% 80%" : "0% 0%") : `${back ? 0 : 100}% ${y}`;
    const ease = !options.ease ? "none" : /,/.test(options.ease) ? kfFx.ease(options.ease, "power1.out") : options.ease;
    const ctx = gsap.context(() => {
      gsap.set(el, { backgroundSize: diag ? `${size}% ${size}%` : `${size}% 100%`, backgroundPosition: a });
      const vars = { backgroundPosition: b, duration: dur, delay, ease };
      if (options.on !== "load") vars.scrollTrigger = { trigger: el, once: true, start: options.start || "top 50%", scroller };
      gsap.to(el, vars);
    });
    return () => { ctx.revert(); el.classList.remove("fx-swept"); };
  });
})();
