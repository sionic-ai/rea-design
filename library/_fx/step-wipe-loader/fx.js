// A cover loader like a play-once GIF — the first sheet (a curtain covering the whole screen) stands for hold seconds, then lifts by swapping the remaining sheets per steps length with no in-between values,
// Nothing is left after the last section. Meanwhile the text on the cover slides in at a slant on the in-delay and disappears on the out duration (reference site orange flag GIF 2.68s + 40ms×5 + 120ms)
(() => {
  kfFx.register("step-wipe-loader", (el, { options, reduce }) => {
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    const text = el.querySelector('[data-fx-part="text"]');
    const done = () => { el.classList.add("is-done"); el.dispatchEvent(new CustomEvent("fx:done")); };
    const show = (n) => frames.forEach((f, k) => f.classList.toggle("is-on", k === n));
    if (!frames.length) { done(); return () => el.classList.remove("is-done"); }
    if (reduce) { show(-1); if (text) text.style.opacity = "0"; done(); return () => { el.classList.remove("is-done"); text?.style.removeProperty("opacity"); }; }
    const hold = +(options.hold ?? 2.68) * 1000;
    const steps = (options.steps ?? "0.04,0.04,0.04,0.04,0.04,0.12").split(",").map((s) => +s * 1000);
    const timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, ms));
    show(0);
    let at = hold;
    for (let k = 1; k <= frames.length; k++) {
      const n = k;
      later(at, () => show(n < frames.length ? n : -1));
      at += steps[k - 1] ?? 0;
    }
    later(at, done);
    const anims = [];
    if (text) {
      const dx = +(options.dx ?? -19), dy = +(options.dy ?? 12);
      const ease = options.ease || "cubic-bezier(0.4, 0.4, 0, 1)";
      anims.push(text.animate([{ opacity: 0, translate: `${dx}px ${dy}px` }, { opacity: 1, translate: "0px 0px" }],
        { duration: +(options["in-dur"] ?? 0.6) * 1000, delay: +(options["in-delay"] ?? 0.4) * 1000, easing: ease, fill: "both" }));
      const out = text.querySelectorAll('[data-fx-part="line"]');
      (out.length ? [...out] : [text]).forEach((t) => anims.push(t.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration: +(options["out-dur"] ?? 0.6) * 1000, delay: +(options.out ?? 2.5) * 1000, easing: ease, fill: "forwards" })));
    }
    return () => { timers.forEach(clearTimeout); anims.forEach((a) => a.cancel()); frames.forEach((f) => f.classList.remove("is-on")); el.classList.remove("is-done"); };
  });
})();
