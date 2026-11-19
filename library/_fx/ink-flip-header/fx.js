// With overlapping bands, ink stays on even when one section ends while another is still inside the band — lit sections are collected, and if there is even one, is-ink is set
(() => {
  kfFx.register("ink-flip-header", (el, { options, scroller }) => {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const sections = [...document.querySelectorAll(options.sections || "[data-ink]")];
    const start = options.start || "top 70%", end = options.end || "bottom 70%";
    const narrow = +(options.narrow ?? 800);
    const on = new Set();
    const paint = () => el.classList.toggle("is-ink", on.size > 0);
    const mm = gsap.matchMedia();
    mm.add({ sp: `(max-width: ${narrow}px)`, pc: `(min-width: ${narrow + 1}px)` }, ({ conditions: { sp } }) => {
      sections.forEach((sec) => {
        const pick = (k, d) => (sp && sec.dataset[`${k}Narrow`]) || sec.dataset[k] || d;
        ScrollTrigger.create({
          trigger: sec, ...(scroller && { scroller }),
          start: pick("inkStart", start), end: pick("inkEnd", end),
          onToggle: (st) => { st.isActive ? on.add(st) : on.delete(st); paint(); },
        });
      });
      return () => { on.clear(); paint(); };
    });
    return () => { mm.revert(); el.classList.remove("is-ink"); };
  });
})();
