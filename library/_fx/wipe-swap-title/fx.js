// Two sets in one title slot (front text data-fx-part="before" · Back text "after") are stacked, and when visible the front text is wiped on from the left, then
// After .4s, as it wipes away to the right, the text behind wipes in from the left (each 1.2s cubic.out) — like an English section name being swapped for the Korean name.
(() => {
  kfFx.register("wipe-swap-title", (el, { options, reduce, scroller }) => {
    const before = el.querySelector('[data-fx-part="before"]');
    const after = el.querySelector('[data-fx-part="after"]');
    if (!before || !after) return;
    const dur = +(options.dur ?? 1.2), gap = +(options.gap ?? 0.4);
    const ease = kfFx.ease(options.ease || "0.33,1,0.68,1", "cubic.out");
    if (reduce) { gsap.set(before, { clipPath: "inset(0% 0% 0% 100%)" }); return () => gsap.set([before, after], { clearProps: "clipPath" }); }
    gsap.set([before, after], { clipPath: "inset(0% 100% 0% 0%)" });
    const tl = gsap.timeline({ paused: true, delay: +(options.delay ?? 0) })
      .to(before, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease }, 0)
      .to(before, { clipPath: "inset(0% 0% 0% 100%)", duration: dur, ease }, gap)
      .to(after, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease }, gap);
    const play = () => tl.play();
    let st = null;
    if (options.on === "event") el.addEventListener("fx:play", play);
    else {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top bottom", once: true, onEnter: play });
    }
    const reset = () => { tl.pause(0); gsap.set([before, after], { clipPath: "inset(0% 100% 0% 0%)" }); };
    el.addEventListener("fx:reset", reset);
    return () => {
      el.removeEventListener("fx:play", play);
      el.removeEventListener("fx:reset", reset);
      st?.kill();
      tl.kill();
      gsap.set([before, after], { clearProps: "clipPath" });
    };
  });
})();
