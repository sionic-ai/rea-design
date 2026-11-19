(() => {
  kfFx.register("dot-bloom-words", (el, { options, reduce }) => {
    const each = +(options.each ?? 0.12), delay = +(options.delay ?? 0), threshold = +(options.threshold ?? 0.15);
    const saved = el.innerHTML;
    const parts = [...el.querySelectorAll('[data-fx-part="word"]')];
    const words = parts.length ? parts.map((p) => p.textContent.trim()) : (el.textContent || "").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return;
    // Wrap words in inline-block chunks and leave the spaces between as they are — so Korean line breaks don’t split in the middle of a word
    el.innerHTML = words.map((w, a) => {
      const side = a % 2 === 0 ? "left" : "right", shape = a % 3 === 0 ? "square" : "circle";
      return `<span class="fx-dbw" data-side="${side}" data-shape="${shape}" style="--fx-d:${(delay + a * each).toFixed(2)}s;--fx-dir:${side === "left" ? -1 : 1}"><span class="fx-dbw__t">${w.replace(/</g, "&lt;")}</span></span>`;
    }).join(" ");
    if (reduce) { el.classList.add("is-fx-on"); return () => { el.innerHTML = saved; el.classList.remove("is-fx-on"); }; }
    const io = new IntersectionObserver((ents) => {
      if (!ents.some((e) => e.isIntersecting)) return;
      io.disconnect();
      requestAnimationFrame(() => el.classList.add("is-fx-on"));
    }, { threshold });
    io.observe(el);
    return () => { io.disconnect(); el.classList.remove("is-fx-on"); el.innerHTML = saved; };
  });
})();
