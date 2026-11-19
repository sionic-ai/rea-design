(() => {
  kfFx.register("stretch-footer-title", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const title = el.querySelector('[data-fx-part="title"]');
    const footer = options.footer ? document.querySelector(options.footer) : el.previousElementSibling;
    if (!stage || !title || !footer) return;
    const FROM = +(options.from ?? 0.1);
    const ctx = document.createElement("canvas").getContext("2d");
    let inkH = 1, shift = 0, reveal = 1, target = 1, pad = 0, lastH = -1, ticking = false;

    // The baseline spot is measured with an invisible marker — the scale must come from the glyph ink height, not the line height, to fill fully
    const baseline = (atStart, top) => {
      const m = document.createElement("span");
      m.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      atStart ? title.prepend(m) : title.append(m);
      const y = m.getBoundingClientRect().top - top;
      m.remove();
      return y;
    };
    const update = () => {
      ticking = false;
      const visible = innerHeight - footer.getBoundingClientRect().bottom;
      const p = Math.min(Math.max(visible / reveal, 0), 1);
      const s = reduce ? target : target * (FROM + (1 - FROM) * p);
      title.style.transform = `translateY(${shift}px) scaleY(${s})`;
    };
    const measure = () => {
      const h = stage.offsetHeight;
      if (h !== lastH) { lastH = h; el.style.setProperty("--fx-stage-h", `${h}px`); }
      title.style.transform = "none";
      const box = title.getBoundingClientRect();
      if (!box.height) return;
      const first = baseline(true, box.top), last = baseline(false, box.top);
      const cs = getComputedStyle(title);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const capH = ctx.measureText("H").actualBoundingBoxAscent || parseFloat(cs.fontSize) * 0.7;
      inkH = Math.max(1, last - (first - capH));
      shift = box.height - last;
      title.style.transformOrigin = `50% ${last}px`;
      pad = parseFloat(getComputedStyle(stage).paddingBottom) || 0;
      reveal = Math.max(1, el.getBoundingClientRect().bottom - footer.getBoundingClientRect().bottom);
      target = Math.max(0, (reveal - 2 * pad) / inkH);
      update();
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    const src = scroller || window;
    src.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(title); ro.observe(el);
    (document.fonts?.ready ?? Promise.resolve()).then(measure);
    measure();
    return () => {
      src.removeEventListener("scroll", onScroll);
      removeEventListener("resize", measure);
      ro.disconnect();
      title.style.transform = ""; title.style.transformOrigin = "";
      el.style.removeProperty("--fx-stage-h");
    };
  });
})();
