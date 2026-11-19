// On the hero it hides off-screen (50vh below), then pops up with an overshooting curve after a short scroll down, and sinks again when returning to the top.
// When the until section (strip below) enters the screen it turns transparent so it doesn’t overlap that section’s button
// axis: x slides in from the side (from off the right of the screen) — a floating round menu button on a Brand site (at 145px, from 113px to the side, .6s in, .4s out)
(() => {
  kfFx.register("float-rise-corner", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const axis = options.axis === "x" ? "x" : "y";
    const from = options.from ?? (axis === "x" ? "120%" : "50vh"), at = +(options.at ?? 50), dur = +(options.dur ?? 0.5), out = +(options.out ?? dur), fade = +(options.fade ?? 0.5);
    const ease = kfFx.ease(options.ease || "M0,0 C0.2,0 0.374,0.306 0.507,0.512 0.652,0.738 0.676,1.184 1,1", "back.out(1.7)");
    const sink = kfFx.ease(options["sink-ease"] || "power1.out", "power1.out");
    // look: fade — transparent while hidden (the original css swaps opacity 0 ↔ 1 with the same transition as the position)
    const dim = options.look === "fade";
    gsap.set(el, { [axis]: from, ...(dim && { autoAlpha: 0 }) });
    const show = () => gsap.to(el, { [axis]: 0, ...(dim && { autoAlpha: 1 }), duration: dur, ease, overwrite: "auto" });
    const hide = () => gsap.to(el, { [axis]: from, ...(dim && { autoAlpha: 0 }), duration: out, ease: sink, overwrite: "auto" });
    const sts = [ScrollTrigger.create({ ...(scroller && { scroller }), start: at, end: "max", onEnter: show, onEnterBack: show, onLeaveBack: hide })];
    const until = options.until ? document.querySelector(options.until) : null;
    if (until) {
      const fadeOut = gsap.fromTo(el, { autoAlpha: 1 }, { autoAlpha: 0, duration: fade, paused: true, immediateRender: false });
      sts.push(ScrollTrigger.create({ trigger: until, ...(scroller && { scroller }), start: "top bottom", animation: fadeOut, toggleActions: "play pause resume reverse" }));
    }
    return () => { sts.forEach((s) => s.kill()); gsap.killTweensOf(el); gsap.set(el, { clearProps: "transform,opacity,visibility" }); };
  });
})();
