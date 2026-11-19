// Pins the stage until the element ends and passes only the progress (--fx-p) — the big scene moves up while the small photo row in the middle moves down, staggered, and css draws that from this value
(() => {
  kfFx.register("pin-cross-frames", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    if (!stage) return;
    const backs = [...el.querySelectorAll('[data-fx-part="back"]')];
    const fronts = [...el.querySelectorAll('[data-fx-part="front"]')];
    const n = Math.max(backs.length, fronts.length, 1);
    el.style.setProperty("--fx-n", n);
    if (options.drift != null) el.style.setProperty("--fx-drift", +options.drift + "%");
    backs.forEach((b, i) => b.style.setProperty("--fx-i", i));
    fronts.forEach((f, i) => f.style.setProperty("--fx-i", i));
    if (reduce) { el.style.setProperty("--fx-p", 0); return () => el.style.removeProperty("--fx-p"); }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: stage,
        scroller,
        start: "top top",
        endTrigger: el,
        end: () => "bottom top+=" + (scroller ? scroller.clientHeight : innerHeight),
        pin: stage,
        // Inside a ScrollSmoother panel the panel moves by transform so fixed pinning gets buried in it — in that case pin with transform
        pinType: window.ScrollSmoother?.get?.()?.content?.()?.contains(el) ? "transform" : undefined,
        pinSpacing: false,
        invalidateOnRefresh: true,
        onUpdate: (t) => el.style.setProperty("--fx-p", t.progress.toFixed(4)),
      });
    });
    return () => {
      mm.revert();
      ["--fx-n", "--fx-p", "--fx-drift"].forEach((k) => el.style.removeProperty(k));
      [...backs, ...fronts].forEach((x) => x.style.removeProperty("--fx-i"));
    };
  });
})();
