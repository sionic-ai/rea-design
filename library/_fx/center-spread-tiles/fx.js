// Cells inside the plate gather at 0 scale at the center of the screen, then grow and spread into place one by one in shuffled order.
// Blur targets inside a cell ([data-fx-part=blur]) starts at 6px blur and clears at .5s partway through spreading (after .75s).
(() => {
  kfFx.register("center-spread-tiles", (el, { options, reduce }) => {
    const tiles = [...el.querySelectorAll('[data-fx-part="tile"]')];
    if (!tiles.length || !window.gsap) return;
    const dur = +(options.dur ?? 2), each = +(options.each ?? 0.05), delay = +(options.delay ?? 0.2);
    const blur = +(options.blur ?? 6), clear = +(options.clear ?? 0.75), ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const blurOf = (t) => t.querySelector('[data-fx-part="blur"]');
    if (reduce) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const vw = document.documentElement.clientWidth, vh = innerHeight;
      tiles.forEach((t) => {
        const r = t.getBoundingClientRect();
        gsap.set(t, { x: vw / 2 - (r.left + r.width / 2), y: vh / 2 - (r.top + r.height / 2), scale: 0, opacity: 0 });
      });
      const order = gsap.utils.shuffle(tiles.slice());
      order.forEach((t, k) => {
        const at = delay + k * each;
        gsap.to(t, { opacity: 1, duration: 0.01, delay: at, onStart: () => gsap.set(t, { zIndex: k }) });
        gsap.to(t, { x: 0, y: 0, scale: 1, duration: dur, ease, delay: at });
        const b = blurOf(t);
        if (b) gsap.fromTo(b, { filter: `blur(${blur}px)` }, { filter: "blur(0px)", duration: 0.5, ease: "none", delay: at + clear });
      });
      el.dispatchEvent(new CustomEvent("fx:spread", { bubbles: true, detail: { end: delay + (tiles.length - 1) * each + dur } }));
      return () => {
        gsap.killTweensOf(tiles);
        tiles.forEach((t) => { const b = blurOf(t); if (b) { gsap.killTweensOf(b); gsap.set(b, { clearProps: "filter" }); } });
        gsap.set(tiles, { clearProps: "transform,opacity,zIndex" });
      };
    });
    return () => mm.revert();
  });
})();
