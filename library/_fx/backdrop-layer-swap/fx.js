// Each section turns on the layer of its name once it passes its start line, and turns it off when scrolling back above the start line — later layers sit on top, so earlier layers can stay on and still be covered.
// If the narrow-window start line differs, use data-backdrop-start-narrow — when the window width changes, matchMedia rebuilds it
(() => {
  kfFx.register("backdrop-layer-swap", (el, { options, scroller }) => {
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    if (!layers.length || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const byKey = new Map(layers.map((l) => [l.dataset.key, l]));
    const base = layers.find((l) => l.hasAttribute("data-base")) || layers[0];
    const sections = [...document.querySelectorAll(options.sections || "[data-backdrop]")];
    const start = options.start || "top 70%", end = options.end || "bottom -50%";
    const narrow = +(options.narrow ?? 800);
    base.classList.add("is-on");
    const mm = gsap.matchMedia();
    mm.add({ sp: `(max-width: ${narrow}px)`, pc: `(min-width: ${narrow + 1}px)` }, ({ conditions: { sp } }) => {
      sections.forEach((sec) => {
        const layer = byKey.get(sec.dataset.backdrop);
        if (!layer || layer === base) return;
        const pick = (k, d) => (sp && sec.dataset[`${k}Narrow`]) || sec.dataset[k] || d;
        ScrollTrigger.create({
          trigger: sec, ...(scroller && { scroller }),
          start: pick("backdropStart", start), end: pick("backdropEnd", end),
          toggleClass: { targets: layer, className: "is-on" },
        });
      });
    });
    return () => { mm.revert(); layers.forEach((l) => l.classList.remove("is-on")); };
  });
})();
