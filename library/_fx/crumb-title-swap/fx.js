(() => {
  // Next to the name in the center of the header bar, ”→ current section name” is attached — it reads data-section-title of the section passing the baseline (below the header bar) and swaps it in.
  // When a name first appears the previous name steps aside from center to the left and the arrow unfolds. When the section changes the old name slides right and folds while the new name enters from 1.1em to the right
  kfFx.register("crumb-title-swap", (el, { options, reduce }) => {
    const slot = el.querySelector('[data-fx-part="slot"]');
    if (!slot) return;
    const from = options.from || "[data-section-title]";
    const line = +(options.line ?? 80);
    const dur = reduce ? 0 : +(options.dur ?? 0.38);
    el.style.setProperty("--fx-crumb-dur", `${dur}s`);
    let current = "", raf = 0;
    const layers = new Set();

    const swap = (title) => {
      if (title === current) return;
      current = title;
      el.classList.toggle("is-active", !!title);
      for (const old of layers) {
        old.classList.remove("is-enter");
        old.classList.add("is-exit");
        layers.delete(old);
        setTimeout(() => old.remove(), dur * 1000 + 30);
      }
      if (!title) return;
      const layer = document.createElement("span");
      layer.className = "fx-crumb__layer is-enter";
      layer.innerHTML = '<span class="fx-crumb__inner"></span>';
      layer.firstChild.textContent = title;
      slot.append(layer);
      layers.add(layer);
    };
    const pick = () => {
      raf = 0;
      let title = "";
      for (const s of document.querySelectorAll(from)) {
        const r = s.getBoundingClientRect();
        if (r.height && r.top <= line && r.bottom > line) title = s.getAttribute("data-section-title") || "";
      }
      swap(title);
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(pick); };
    document.addEventListener("scroll", queue, { capture: true, passive: true });
    addEventListener("resize", queue);
    pick();
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("scroll", queue, { capture: true });
      removeEventListener("resize", queue);
      layers.forEach((l) => l.remove());
      el.classList.remove("is-active");
    };
  });
})();
