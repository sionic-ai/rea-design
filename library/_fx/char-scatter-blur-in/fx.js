// Original (Brand js-scroll-fade-textrandom) per character <i> Split into pieces with transition-delay set to .2 + .8 × a random number of seconds, and when the line is 20% visible it turns everything on at once.
// Each word is wrapped in an inline-block chunk so multi-line Korean doesn’t break mid-word, and the spaces between are kept as is
(() => {
  kfFx.register("char-scatter-blur-in", (el, { options, reduce, scroller }) => {
    const text = el.textContent;
    if (!text.trim()) return;
    const min = +(options.min ?? 0.2), spread = +(options.spread ?? 0.8);
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.blur != null) el.style.setProperty("--fx-blur", +options.blur + "px");
    const kept = [...el.childNodes].map((n) => n.cloneNode(true));
    const frag = document.createDocumentFragment();
    text.trim().split(/(\s+)/).forEach((word) => {
      if (!word) return;
      if (/^\s+$/.test(word)) return frag.append(word);
      const w = document.createElement("span");
      w.style.display = "inline-block";
      [...word].forEach((ch) => {
        const i = document.createElement("i");
        i.dataset.fxPart = "char";
        i.textContent = ch;
        i.style.setProperty("--fx-at", (min + spread * Math.random()).toFixed(2) + "s");
        w.append(i);
      });
      frag.append(w);
    });
    el.replaceChildren(frag);
    const show = () => el.classList.add("is-fx-in");
    const reset = () => el.replaceChildren(...kept);
    if (reduce) { show(); return () => { el.classList.remove("is-fx-in"); reset(); }; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(); io.disconnect(); } }), { root: scroller || null, threshold: +(options.threshold ?? 0.2) });
    io.observe(el);
    el.addEventListener("fx:play", show);
    return () => {
      io.disconnect();
      el.removeEventListener("fx:play", show);
      el.classList.remove("is-fx-in");
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-blur");
      reset();
    };
  });
})();
