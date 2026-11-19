(() => {
  // Like a paper doll, it snaps back into place with no in-between values — position goes from x·y (% of own size) to 0, tilt steps alternate -10·+10 × deg each stage and stops at 0.
  // Both use steps(count) curves, so hand-cut paper pieces look like they move in jerks. The tilt goes to the inner child (data-fx-part="inner"If there is a ), hook it there
  kfFx.register("paper-step-in", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const inner = el.querySelector('[data-fx-part="inner"]') || el;
    const steps = Math.max(1, Math.round(+options.steps || 2));
    const x = +(options.x ?? 0), y = +(options.y ?? 12), deg = +(options.deg ?? -0.5);
    const dur = +(options.dur ?? 1), delay = +(options.delay ?? 0), ease = `steps(${steps})`;
    const rot = [];
    // alt: if zero, it alternates between tilted and upright steps (a person walking in — Brand footer 5°·0°·5°·0°)
    for (let i = 0; i < steps; i++) rot.push(i % 2 === 0 ? -10 * deg : options.alt === "zero" ? 0 : 10 * deg);
    rot.push(0);
    const once = options.start === "none" ? null : { trigger: el, ...(scroller && { scroller }), start: options.start || "top 80%", once: true };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(el, { xPercent: x, yPercent: y }, { xPercent: 0, yPercent: 0, duration: dur, ease, delay, ...(once && { scrollTrigger: once }) });
      gsap.fromTo(inner, { rotate: rot[0] }, { keyframes: { rotate: rot }, duration: dur, ease, delay, ...(once && { scrollTrigger: { ...once } }) });
      // Position may arrive in jumps but opacity stays smooth — with fade, it goes 0 → 1 over that length (seconds) (City illustration .8s expo-out)
      const fade = +(options.fade ?? 0);
      if (fade > 0) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: fade, ease: kfFx.ease(options["fade-ease"] || "0.19,1,0.22,1", "expo.out"), delay, ...(once && { scrollTrigger: { ...once } }) });
    });
    return () => { mm.revert(); gsap.set([el, inner], { clearProps: "transform,opacity" }); };
  });
})();
