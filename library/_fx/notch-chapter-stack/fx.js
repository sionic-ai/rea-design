// If a section is taller than the screen, it should stick only after being read to the end, so the stick point (--fx-stick) is re-measured as the section height. Corner notches are filled by reading the previous section’s actual background color — it fits even when the skin changes
(() => {
  kfFx.register("notch-chapter-stack", (el, { options, reduce, scroller }) => {
    const list = [...el.querySelectorAll(':scope > [data-fx-part="chapter"]')];
    if (!list.length) return;
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    const measure = () => list.forEach((c, i) => {
      c.style.setProperty("--fx-stick", `${Math.min(0, view() - c.offsetHeight)}px`);
      if (i) c.style.setProperty("--fx-prev", getComputedStyle(list[i - 1]).backgroundColor);
    });
    measure();
    list.forEach((c) => c.classList.add("is-fx-stacked"));
    const ro = new ResizeObserver(measure);
    list.forEach((c) => ro.observe(c));
    addEventListener("resize", measure);
    const shade = +(options.shade ?? 0.3);
    const tls = reduce || !shade ? [] : list.slice(0, -1).map((c, n) => gsap.timeline({ scrollTrigger: { scroller, trigger: list[n + 1], start: options.start || "top bottom", end: options.end || "top top", scrub: true } })
      .fromTo(c, { "--fx-shade": 0 }, { "--fx-shade": shade, ease: "none" }, 0)
      .fromTo(list[n + 1], { "--fx-notch-shade": 0 }, { "--fx-notch-shade": shade, ease: "none" }, 0));
    return () => {
      ro.disconnect(); removeEventListener("resize", measure);
      tls.forEach((t) => { t.scrollTrigger?.kill(); t.revert(); });
      list.forEach((c) => { c.classList.remove("is-fx-stacked"); ["--fx-stick", "--fx-prev", "--fx-shade", "--fx-notch-shade"].forEach((p) => c.style.removeProperty(p)); });
    };
  });
})();
