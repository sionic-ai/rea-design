// Put data-on on the current pair and raise z-index one step each time so the new pair always stacks on top — the fill and retract themselves are a clip-path transition in fx.css
(() => {
  kfFx.register("pair-rise-slides", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    const veil = el.querySelector('[data-fx-part="veil"]');
    if (!slides.length) return;
    const every = (+options.every || 6) * 1000, start = +(options.start ?? 0.3) * 1000;
    const set = (k, v) => v != null && el.style.setProperty(k, v);
    set("--fx-dur", options.dur != null ? `${+options.dur}s` : null);
    set("--fx-lag", options.lag != null ? `${+options.lag}s` : null);
    set("--fx-hold", options.hold != null ? `${+options.hold}s` : null);
    // Types like ”0.7,0,0.3,1” become cubic-bezier, CSS names like ease·linear stay as they are
    if (options.ease) set("--fx-ease", /^[\d.,\s-]+$/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease);

    let at = 0, z = 1, timer = 0, raf = 0;
    const show = (i) => {
      slides.forEach((s, n) => n !== i && s.removeAttribute("data-on"));
      slides[i].style.zIndex = String(++z);
      slides[i].setAttribute("data-on", "");
    };
    show(0);
    const off = () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      el.removeAttribute("data-open");
      ["--fx-dur", "--fx-lag", "--fx-hold", "--fx-ease"].forEach((k) => el.style.removeProperty(k));
      slides.forEach((s) => { s.removeAttribute("data-on"); s.style.zIndex = ""; });
    };
    if (reduce) { el.setAttribute("data-open", ""); return off; }
    // Curtain must be drawn for one frame before lifting for the transition to run
    if (veil) raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => el.setAttribute("data-open", "")); });
    if (slides.length < 2) return off;
    const step = () => { at = (at + 1) % slides.length; show(at); timer = setTimeout(step, every); };
    timer = setTimeout(step, start + every);
    return off;
  });
})();
