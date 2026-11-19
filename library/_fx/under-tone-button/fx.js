// Floating buttons (logo and menu button) change color to follow the data-tone (light·dark) of the section passing under their vertical center.
// Section positions are remeasured only when attached, on window resize, or when document height changes — scrolling only compares.
(() => {
  kfFx.register("under-tone-button", (el, { options, scroller }) => {
    const sel = options.from || "[data-tone]";
    const box = scroller || window;
    const top0 = () => (scroller ? scroller.getBoundingClientRect().top - scroller.scrollTop : -scrollY);
    let points = [];
    const measure = () => {
      const o = top0();
      points = [...document.querySelectorAll(sel)].filter((s) => s !== el && !el.contains(s))
        .map((s) => ({ top: s.getBoundingClientRect().top - o, tone: s.dataset.tone }))
        .sort((a, b) => a.top - b.top);
      update();
    };
    const update = () => {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2 - top0();
      let tone;
      for (const p of points) { if (p.top <= mid) tone = p.tone; else break; }
      if (tone && el.dataset.toneNow !== tone) el.dataset.toneNow = tone;
    };
    measure();
    box.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(scroller || document.body);
    return () => { box.removeEventListener("scroll", update); removeEventListener("resize", measure); ro.disconnect(); delete el.dataset.toneNow; };
  });
})();
