// A roller (thin band of light and shadow) tied to scroll passes top to bottom over a big multi-line sentence, and only the lines it has passed get stamped onto the plate —
// Lines not yet printed have flat shadows that fade from left to right (per line [.45→1] [.4→.8] [.35→.5] [.2→.45]), then,
// The moment the roller passes the middle of that row, the shadow returns over a .09 share and sharpens over a .045 share. The roller turns on and off in the first and last .06 share.
// Pinning is done by the caller (panel set to 2.5x screen height with the inner stage sticky) — the part runs from when the panel (trigger) top edge touches the top of the screen until its bottom edge touches the bottom of the screen
(() => {
  const FADE = [[0.45, 1], [0.4, 0.8], [0.35, 0.5], [0.2, 0.45]];
  const flat = (v) => v.replace(/-?\d*\.?\d+px/g, "0px");
  kfFx.register("roller-press-lines", (el, { options, reduce, scroller }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const roller = el.querySelector('[data-fx-part="roller"]');
    if (!lines.length || reduce || !window.ScrollTrigger) return;
    const root = (options.within && el.closest(options.within)) || el.parentElement?.closest("section") || el;
    const pad = +(options.pad ?? 0.7), span = lines.length + pad * 2;
    const rest = lines.map((l) => getComputedStyle(l).textShadow);
    lines.forEach((l, i) => {
      const [a, b] = FADE[Math.min(i, FADE.length - 1)];
      l.style.setProperty("--a", a);
      l.style.setProperty("--b", b);
      l.classList.add("fx-roller-wait");
    });
    root.classList.add("fx-roller-on");
    const lineH = () => el.offsetHeight / lines.length;
    let sync = () => {};
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root, scroller, start: options.start || "top top", end: options.end || "bottom bottom", scrub: true, invalidateOnRefresh: true, onUpdate: () => sync() } });
    if (roller) {
      tl.fromTo(roller, { y: () => -roller.offsetHeight / 2 - lineH() * pad }, { y: () => el.offsetHeight + lineH() * pad - roller.offsetHeight / 2, duration: 1 }, 0)
        .fromTo(roller, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0)
        .to(roller, { autoAlpha: 0, duration: 0.06 }, 0.94);
    } else tl.to({}, { duration: 1 }, 0);
    lines.forEach((l, i) => {
      const at = (pad + i + 0.5) / span;
      if (rest[i] && rest[i] !== "none") tl.fromTo(l, { textShadow: flat(rest[i]) }, { textShadow: rest[i], duration: 0.09 }, at - 0.045);
      tl.fromTo(l, { "--lit": 0 }, { "--lit": 1, duration: 0.045 }, at - 0.045);
    });
    // On rewind, the rows above the roller fade out again too
    // When the line finishes, remove the blur mask and return to the original filter (engraved shadow) — rewinding blurs it again
    sync = () => lines.forEach((l, i) => l.classList.toggle("fx-roller-wait", tl.scrollTrigger.progress < (pad + i + 0.5) / span));
    sync();
    return () => {
      tl.scrollTrigger?.kill();
      tl.revert();
      root.classList.remove("fx-roller-on");
      lines.forEach((l) => { l.classList.remove("fx-roller-wait"); l.style.removeProperty("--a"); l.style.removeProperty("--b"); l.style.removeProperty("--lit"); });
    };
  });
})();
