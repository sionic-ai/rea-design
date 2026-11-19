// Tie the position of the soft-edged (wave, mist) mask image to scroll — the panel is erased or pushed in like waves or mist.
// The mask image is laid several times larger than the panel (500% 200% etc.) and only mask-position moves from → to. Past 100% the image leaves the panel and everything is erased.
(() => {
  kfFx.register("fog-mask-scrub", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const pair = (s, d) => String(s ?? d).trim().split(/\s+/).map(Number);
    const from = pair(options.from, "0 0"), to = pair(options.to, "130 70");
    if (from.length < 2 || to.length < 2 || [...from, ...to].some(Number.isNaN)) return;
    // Measuring target: the panel itself (self) · the immediate next sibling (next — an empty slot placed after the panel, like the original) · the parent (parent)
    const box = options.on === "next" ? el.nextElementSibling : options.on === "parent" ? el.parentElement : el;
    if (!box) return;
    if (options.size) el.style.setProperty("--fx-size", options.size);
    const set = (p) => { el.style.setProperty("--fx-x", p[0]); el.style.setProperty("--fx-y", p[1]); };
    set(from);
    const st = {
      trigger: box, scroller, start: options.start || "top bottom", end: options.end || "bottom bottom", invalidateOnRefresh: true,
      onLeave: () => el.classList.add("is-fx-done"), onEnterBack: () => el.classList.remove("is-fx-done"),
    };
    const mm = gsap.matchMedia();
    mm.add("(min-width: 0px)", () => {
      if (reduce) {
        // With reduced motion, switch immediately on reaching the end position
        ScrollTrigger.create({ ...st, onLeave: () => { set(to); el.classList.add("is-fx-done"); }, onEnterBack: () => { set(from); el.classList.remove("is-fx-done"); } });
        return;
      }
      const scrub = options.scrub === "true" ? true : +(options.scrub ?? 1);
      gsap.fromTo(el, { "--fx-x": from[0], "--fx-y": from[1] }, { "--fx-x": to[0], "--fx-y": to[1], ease: "none", scrollTrigger: { ...st, scrub } });
    });
    return () => {
      mm.revert();
      el.classList.remove("is-fx-done");
      ["--fx-x", "--fx-y", "--fx-size"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
