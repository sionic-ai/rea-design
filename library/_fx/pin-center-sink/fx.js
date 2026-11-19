// With the section pinned, the center panel (phone) sinks down and the text above blurs, then the side images gather from outside to the center of each cell and the description opens late.
// Timeline units are as in the original — sink 0~5 · blur 0~1 · gather 0~10 (power1.inOut) · open 9~15. When the gather ends, is-sided (center line etc.) applies
(() => {
  kfFx.register("pin-center-sink", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const q = (p) => [...el.querySelectorAll(`[data-fx-part="${p}"]`)];
    const stage = q("stage")[0] || el, center = q("center"), fade = q("fade"), sides = q("side"), reveal = q("reveal");
    if (!sides.length && !center.length) return;
    const shift = +(options.shift ?? 10), length = +(options.length ?? 150), sink = +(options.sink ?? 105);
    const ease = kfFx.ease(options.ease || "power1.inOut", "power1.inOut");
    // A picture standing left of the cell center starts from the left (outside), one on the right starts from the right — shift% of the cell width
    const from = (s) => {
      const box = el.getBoundingClientRect(), r = s.getBoundingClientRect();
      const dir = r.left + r.width / 2 < box.left + box.width / 2 ? -1 : 1;
      return dir * (s.parentElement?.clientWidth || r.width) * (shift / 100);
    };
    const mm = gsap.matchMedia();
    mm.add({ ok: `(min-width: ${+(options.min ?? 960)}px)` }, (ctx) => {
      if (!ctx.conditions.ok) return;
      if (reduce) {
        if (reveal.length) gsap.set(reveal, { opacity: 1, height: "auto" });
        el.classList.add("is-sided");
        return () => el.classList.remove("is-sided");
      }
      let move;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage, ...(scroller && { scroller }), start: "top top", end: () => `+=${length}%`, scrub: true, pin: true, invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (move && move.progress() === 1) el.classList.add("is-sided");
            else if (self.progress < 1) el.classList.remove("is-sided");
          },
        },
      });
      if (center.length) tl.to(center, { yPercent: sink, duration: 5 }, 0);
      if (fade.length) tl.to(fade, { opacity: 0, duration: 1, onComplete: () => el.classList.add("is-faded"), onReverseComplete: () => el.classList.remove("is-faded") }, 0);
      if (sides.length) move = tl.fromTo(sides, { x: (i, s) => from(s) }, { x: 0, duration: 10, ease }, 0).getChildren().at(-1);
      if (reveal.length) tl.fromTo(reveal, { opacity: 0, height: 0 }, { opacity: 1, height: "auto", duration: 6 }, 9);
      return () => el.classList.remove("is-sided", "is-faded");
    });
    return () => { if (!el.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin && el.contains(t.pin) && t.spacer?.remove()); mm.revert(); };
  });
})();
