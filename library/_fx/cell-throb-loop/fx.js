// Cell wiggle: when the board enters 80% of the viewport, pick 1~max cells, move each out and back at a random size over .25s, rest .5~1s, then repeat — Brand site [data-split-jiggle]
(() => {
  kfFx.register("cell-throb-loop", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    if (reduce) return;
    const parts = el.querySelectorAll('[data-fx-part="cell"]');
    const cells = parts.length ? [...parts] : [...el.children];
    if (!cells.length) return;
    const range = (s, a, b) => { const m = String(s ?? "").split("-").map(Number); return m.length === 2 && m.every(Number.isFinite) ? m : [a, b]; };
    const [s0, s1] = range(options.scale, 0.95, 1.1);
    const [r0, r1] = range(options.rest, 0.5, 1);
    const dur = +(options.dur ?? 0.25), max = Math.max(1, +options.max || 3);
    let live = true, tw = null, wait = null;
    const beat = () => {
      if (!live) return;
      const pick = gsap.utils.shuffle(cells.slice()).slice(0, gsap.utils.random(1, Math.min(max, cells.length), 1));
      tw = gsap.fromTo(pick, { scale: 1 }, {
        scale: () => gsap.utils.random(s0, s1), duration: dur, ease: "power2.inOut", yoyo: true, repeat: 1,
        onComplete: () => { wait = gsap.delayedCall(gsap.utils.random(r0, r1), beat); },
      });
    };
    const st = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 80%", once: true, onEnter: beat });
    return () => { live = false; st.kill(); tw?.kill(); wait?.kill(); gsap.set(cells, { clearProps: "transform" }); };
  });
})();
