// Curtain → sequential entrance as one timeline. Children are collected once on attach — children that arrive later have already finished loading, so they show immediately
(() => {
  kfFx.register("veil-stage-load", (el, { options, reduce }) => {
    const veil = el.querySelector('[data-fx-part="veil"]');
    const shows = [...el.querySelectorAll('[data-fx-part="show"]')];
    const done = () => { if (veil) veil.hidden = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    const reveal = () => { if (shows.length) gsap.set(shows, { autoAlpha: 1, xPercent: 0, yPercent: 0, y: 0 }); };
    if (reduce) { reveal(); done(); return () => {}; }
    const hold = +(options.hold ?? 1), veilDur = +(options.veil ?? 0.2), dur = +(options.dur ?? 0.3), delay = +(options.delay ?? 0.3);
    const ease = kfFx.ease(options.ease || "0,0,0.58,1", "power1.out");
    const rise = +(options.rise ?? 0);
    const tl = gsap.timeline({ delay: hold, onComplete: done });
    // shrink type: the curtain stays stuck to its top edge while its height folds to 0 (the bottom edge rises), and during the fold it fades over fade seconds starting at fade-at seconds
    if (veil && options.look === "shrink") {
      const fadeAt = +(options["fade-at"] ?? 0.5), fade = +(options.fade ?? 0.6);
      tl.to(veil, { height: 0, duration: veilDur, ease }, 0).to(veil, { autoAlpha: 0, duration: fade, ease }, fadeAt);
    } else if (veil) tl.to(veil, { autoAlpha: 0, duration: veilDur, ease }, 0);
    shows.forEach((s) => {
      const at = s.dataset.delay !== undefined ? +s.dataset.delay : delay;
      // data-from="top" Drops in from above by its own height (Brand header decoration). data-dur changes the length for each child.
      const from = s.dataset.from === "right" ? { xPercent: 100 } : s.dataset.from === "top" ? { yPercent: -100 } : {};
      const len = s.dataset.dur !== undefined ? +s.dataset.dur : dur;
      tl.fromTo(s, { autoAlpha: 0, y: rise, ...from }, { autoAlpha: 1, xPercent: 0, yPercent: 0, y: 0, duration: len, ease }, at);
    });
    return () => { tl.kill(); reveal(); if (veil) { veil.hidden = false; gsap.set(veil, { clearProps: "opacity,visibility,height" }); } };
  });
})();
