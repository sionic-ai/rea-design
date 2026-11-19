(() => {
  // Pieces around the card (characters · stickers) step aside one by one to the outside of the screen when scrolling starts, and snap back into place when you return to the top
  kfFx.register("edge-peel-scroll", (el, { options, reduce, scroller }) => {
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (!pieces.length) return;
    if (reduce || !window.ScrollTrigger) { pieces.forEach((p) => p.classList.remove("is-fx-out")); return; }
    gsap.registerPlugin(ScrollTrigger);
    const each = +(options.each ?? 0.07), enter = options.enter == null ? null : +options.enter;
    const calls = [];
    const set = (out) => pieces.forEach((p, i) => calls.push(gsap.delayedCall(out ? each * i : 0, () => p.classList.toggle("is-fx-out", out))));
    if (enter !== null) { pieces.forEach((p) => p.classList.add("is-fx-out")); calls.push(gsap.delayedCall(enter, () => set(false))); }
    const st = ScrollTrigger.create({
      trigger: options.trigger ? document.querySelector(options.trigger) || el : el, scroller,
      start: options.start || "top -10",
      onEnter: () => set(true),
      onLeaveBack: () => set(false),
    });
    return () => { st.kill(); calls.forEach((c) => c.kill()); pieces.forEach((p) => p.classList.remove("is-fx-out")); };
  });
})();
