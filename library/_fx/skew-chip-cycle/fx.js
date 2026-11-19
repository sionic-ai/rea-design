(() => {
  // Pushes the next color chip in from the right onto the −36° tilted background of the boxes, and once fully in, fixes that color as the background — cycles through the palette every N seconds (every)
  const read = (name, holder) => { holder.style.color = `var(${name})`; return getComputedStyle(holder).color; };
  kfFx.register("skew-chip-cycle", (el, { options, reduce }) => {
    const chips = [...el.querySelectorAll('[data-fx-part="chip"]')];
    if (!chips.length) return;
    const names = (options.colors || "--kf-accent --kf-accent-soft --kf-ink-soft").split(/\s+/).filter(Boolean);
    const holder = document.createElement("i"); holder.hidden = true; el.append(holder);
    const colors = names.map((n) => read(n, holder));
    const every = +(options.every || 1.8) * 1000;
    let i = 0;
    const put = (k, dir) => {
      const c = colors[k % colors.length];
      chips.forEach((chip) => {
        if (reduce) { chip.style.backgroundColor = c; return; }
        const u = document.createElement("span");
        u.className = "fx-chip-unit";
        if (dir < 0) u.classList.add("is-reverse");
        u.style.backgroundColor = c;
        chip.append(u);
        u.addEventListener("animationend", () => { chip.style.backgroundColor = c; u.remove(); }, { once: true });
      });
    };
    put(0, 1);
    const timer = reduce || options.when === "manual" ? 0 : setInterval(() => put(++i, 1), every);
    const onStep = (e) => { const k = Number(e.detail?.index ?? i + 1); const dir = k < i ? -1 : 1; i = k; put(k, dir); };
    el.addEventListener("fx:chip", onStep);
    return () => {
      clearInterval(timer);
      el.removeEventListener("fx:chip", onStep);
      holder.remove();
      chips.forEach((chip) => { chip.style.backgroundColor = ""; chip.querySelectorAll(".fx-chip-unit").forEach((u) => u.remove()); });
    };
  });
})();
