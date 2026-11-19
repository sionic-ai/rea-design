(() => {
  // The four sides of the frame are cut separately and drawn one side at a time — top (left → right) · right (top → bottom) · bottom (right → left) · left (bottom → top), clockwise.
  const FROM = { top: "inset(0 100% 0 0)", right: "inset(0 0 100% 0)", bottom: "inset(0 0 0 100%)", left: "inset(100% 0 0 0)" };
  const ORDER = ["top", "right", "bottom", "left"];
  kfFx.register("edge-draw-frame", (el, { options, reduce, scroller }) => {
    const edges = [...el.querySelectorAll('[data-fx-part="edge"]')].filter((e) => FROM[e.dataset.key]).sort((a, b) => ORDER.indexOf(a.dataset.key) - ORDER.indexOf(b.dataset.key));
    if (!edges.length) return;
    if (reduce) { edges.forEach((e) => { e.style.clipPath = "none"; e.style.opacity = "1"; }); return () => edges.forEach((e) => { e.style.clipPath = ""; e.style.opacity = ""; }); }
    const at = +(options.at ?? 1), gap = +(options.gap ?? 0.3), dur = +(options.dur ?? 0.6);
    // dur-side — left and right sides get different lengths, chain — when one side finishes the next one starts (Brand button: top .15 · right .075 · bottom .15 · left .075 in sequence)
    const side = +(options["dur-side"] ?? dur), chain = options.chain === "1" || options.chain === "true";
    const len = (e) => (e.dataset.key === "left" || e.dataset.key === "right" ? side : dur);
    const ease = !options.ease ? "power2.out" : /^[\d.,\s-]+$/.test(options.ease) ? kfFx.ease(options.ease, "power2.out") : options.ease;
    const tl = gsap.timeline({ paused: true });
    let t = at;
    edges.forEach((e, i) => {
      gsap.set(e, { clipPath: FROM[e.dataset.key], opacity: 1 });
      tl.to(e, { clipPath: "inset(0% 0% 0% 0%)", duration: len(e), ease }, chain ? t : at + i * gap);
      t += len(e);
    });
    let st = null;
    if (options.on === "scroll") st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: options.start || "top 80%", once: true, onEnter: () => tl.play() });
    else tl.play();
    return () => { st && st.kill(); tl.kill(); gsap.set(edges, { clearProps: "clipPath,opacity" }); };
  });
})();
