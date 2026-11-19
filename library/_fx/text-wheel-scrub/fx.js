// Scrolling with the section pinned spins several rows like a wheel — only the center row is sharp, while rows above and below lie down with rotateX, recede and fade
(() => {
  kfFx.register("text-wheel-scrub", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || !window.gsap || !window.ScrollTrigger) return;
    const wide = +(options.gap ?? 90), narrow = +(options.gapMobile ?? 44), tilt = +(options.tilt ?? 25), depth = +(options.depth ?? 100), shrink = +(options.shrink ?? 0.15), fade = +(options.fade ?? 0.6);
    const dimFrom = +(options.dim ?? 0.4);
    const mq = matchMedia("(max-width: 767px)");
    const set = (p) => {
      const at = p * (items.length - 1), gap = mq.matches ? narrow : wide;
      items.forEach((it, i) => {
        const r = i - at, a = Math.abs(r);
        it.style.transform = `translateY(${r * gap}px) translateZ(${-depth * a}px) scale(${1 - shrink * a}) rotateX(${-tilt * r}deg)`;
        it.style.opacity = a > 1.5 ? "0" : String(Math.max(0, 1 - fade * a));
        it.style.setProperty("--fx-wheel-lit", String(Math.max(0, 1 - 1.5 * a)));
        it.style.color = `color-mix(in srgb, var(--fx-wheel-on, currentColor) ${Math.round(100 * (dimFrom + (1 - dimFrom) * Math.max(0, 1 - 1.5 * a)))}%, var(--fx-wheel-off, var(--kf-bg)))`;
      });
    };
    if (reduce) { set(0); return () => items.forEach((it) => { it.style.transform = it.style.opacity = it.style.color = ""; }); }
    const how = String(options.pin ?? "self"), pinTarget = how === "parent" && el.parentElement ? el.parentElement : el;
    const st = ScrollTrigger.create({ trigger: pinTarget, scroller, start: "top top", end: options.end || "+=200%", pin: how !== "false", scrub: true, onUpdate: (s) => set(s.progress) });
    set(st.progress);
    const re = () => set(st.progress);
    mq.addEventListener("change", re);
    return () => { mq.removeEventListener("change", re); st.kill(true); items.forEach((it) => { it.style.transform = it.style.opacity = it.style.color = ""; it.style.removeProperty("--fx-wheel-lit"); }); };
  });
})();
