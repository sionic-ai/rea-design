// A section that crosses the screen like a dark sentence band — when its top edge touches the screen bottom, 10% is cropped on all sides, and it fully opens while rising .4 of the screen,
// When leaving (from when .6 of its own height remains) it tightens back to 10%. The value follows .15s late (Brand sentence video).
// Inner video plate (data-fx-part="media" (first child of the …) drifts 16% while passing, and on receiving fx:play it releases the parallax over .6s to fit the panel snugly and returns on fx:rest.
(() => {
  kfFx.register("inset-breathe-band", (el, { options, reduce, scroller }) => {
    const max = +(options.inset ?? 10), enter = +(options.enter ?? 0.4), leave = +(options.leave ?? 0.6), lag = +(options.lag ?? 0.15);
    const media = el.querySelector('[data-fx-part="media"]'), inner = media?.firstElementChild;
    if (reduce) { el.style.clipPath = "inset(0%)"; return; }
    const v = { inset: max };
    const draw = () => (el.style.clipPath = `inset(${v.inset.toFixed(3)}%)`);
    draw();
    const to = gsap.quickTo(v, "inset", { duration: lag, ease: "none", onUpdate: draw });
    const band = ScrollTrigger.create({
      trigger: el, scroller, start: "top bottom", end: "bottom top",
      onUpdate: (s) => {
        const y = s.scroll(), a = s.start + enter * innerHeight, b = s.end - leave * el.offsetHeight;
        const r = y <= a ? gsap.utils.mapRange(s.start, a, max, 0, y) : y >= b ? gsap.utils.mapRange(b, s.end, 0, max, y) : 0;
        to(gsap.utils.clamp(0, max, r));
      },
    });
    if (!inner) return () => { band.kill(); el.style.clipPath = ""; };
    const travel = +(options.travel ?? 16), hold = { p: 1 }, run = { t: 0 };
    let tween = null;
    const place = () => gsap.set(inner, { top: `${-10 * hold.p}%`, bottom: `${-10 * hold.p}%`, yPercent: travel * run.t * hold.p });
    const flow = ScrollTrigger.create({ trigger: media, scroller, start: "top bottom", end: "bottom top", onUpdate: (s) => { run.t = s.progress; place(); } });
    run.t = flow.progress;
    place();
    const ease = kfFx.ease(options.ease || "0.625,0.05,0,1", "power3.inOut"), dur = +(options.dur ?? 0.6);
    const settle = (p) => { tween?.kill(); tween = gsap.to(hold, { p, duration: dur, ease, overwrite: "auto", onUpdate: place, onComplete: place }); };
    const onPlay = () => settle(0), onRest = () => settle(1);
    el.addEventListener("fx:play", onPlay);
    el.addEventListener("fx:rest", onRest);
    return () => {
      band.kill(); flow.kill(); tween?.kill();
      el.removeEventListener("fx:play", onPlay);
      el.removeEventListener("fx:rest", onRest);
      el.style.clipPath = "";
      gsap.set(inner, { clearProps: "top,bottom,transform" });
    };
  });
})();
