(() => {
  // When visible (even by one pixel), text grows one character every step ms like a typewriter, and the added characters are mixed in as symbols, then become their real letters in turn, each letter taking its share of each ms.
  // Scrambled symbols are redrawn every step. With order: random the resolve order is random (matched here and there, like barcode text)
  kfFx.register("glyph-type-decode", (el, { options, reduce }) => {
    const text = el.dataset.fxText || el.textContent;
    if (!text.trim()) return;
    el.dataset.fxText = text;
    const each = +(options.each ?? 120), step = +(options.step ?? 60) || 60;
    const chars = options.chars || "~!@$%^&*()-+=[]{}<>?";
    const random = options.order === "random";
    const on = options.on || "view";
    const delay = +(options.delay ?? 0);
    if (reduce) { el.textContent = text; return () => {}; }
    const order = [...text].map((_, i) => (random ? Math.random() : i / text.length));
    let grow = 0, draw = 0, wait = 0, io = null;
    el.style.opacity = "0";
    const start = () => {
      const t0 = performance.now();
      let shown = 0;
      grow = setInterval(() => (shown >= text.length ? clearInterval(grow) : shown++), step);
      draw = setInterval(() => {
        const p = (performance.now() - t0) / (text.length * each);
        let s = "";
        if (p > 1) { s = text; clearInterval(draw); }
        else for (let i = 0; i < text.length; i++) s += p >= order[i] ? text[i] : text[i] === " " ? " " : chars[(Math.random() * chars.length) | 0];
        el.textContent = s.slice(0, shown + 1);
        el.style.opacity = "1";
      }, step);
    };
    if (on === "load") wait = setTimeout(start, delay * 1000);
    else {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); wait = setTimeout(start, delay * 1000); } }));
      io.observe(el);
    }
    return () => { io?.disconnect(); clearTimeout(wait); clearInterval(grow); clearInterval(draw); el.textContent = text; el.style.opacity = ""; };
  });
})();
