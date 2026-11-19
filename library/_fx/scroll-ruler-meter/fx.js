// Fills the ruler from the top by the fraction of the page scrolled, and writes the scrolled distance (cm · m) on the tag at the end. Brand footer ruler
(() => {
  kfFx.register("scroll-ruler-meter", (el, { options, scroller }) => {
    const box = scroller && scroller !== window ? scroller : null;
    const step = +(options.step ?? 8), every = options.every || 10, reach = +(options.reach ?? 0.5);
    el.style.setProperty("--fx-step", `${step}px`);
    el.style.setProperty("--fx-every", every);
    if (options.major != null) el.style.setProperty("--fx-major", `${+options.major}px`);
    if (options.minor != null) el.style.setProperty("--fx-minor", `${+options.minor}px`);
    const base = document.createElement("div"), fill = document.createElement("div");
    base.className = "fx-srm-layer fx-srm-base"; fill.className = "fx-srm-layer fx-srm-fill";
    base.innerHTML = fill.innerHTML = '<div class="fx-srm-ticks"></div>';
    el.prepend(base, fill);
    const tag = el.querySelector('[data-fx-part="tag"]'), value = el.querySelector('[data-fx-part="value"]'), note = el.querySelector('[data-fx-part="note"]');
    const at = note ? String(note.dataset.at || "").split(/\s+/).filter(Boolean).map(Number) : [];
    const say = note ? String(note.dataset.say || "").split("|") : [];
    let shown = -2, timer = 0, raf = 0;
    const read = () => box ? [box.scrollTop, box.scrollHeight - box.clientHeight] : [scrollY, document.documentElement.scrollHeight - innerHeight];
    const draw = () => {
      raf = 0;
      const [y, max] = read();
      const u = max > 0 ? Math.min(y / max, 1) : 0, metres = Math.max(0, y / 3779.5276);
      const H = el.offsetHeight, d = H && tag ? (tag.offsetHeight / 2 + 4) / H : 0;
      const m = d + (0.15 * u + 0.85 * u * u * u) * (reach - d);
      fill.style.height = `calc(${m * 100}% + 1px)`;
      if (tag) tag.style.top = `${m * 100}%`;
      let k = -1;
      at.forEach((v, i) => { if (v <= metres) k = i; });
      if (value) value.textContent = k >= 0 ? `${at[k]}m` : Math.round(metres * 100) >= 100 ? `${Math.round(metres)}m` : `${Math.round(metres * 100)}cm`;
      if (note && k !== shown) {
        clearTimeout(timer);
        note.classList.add("is-fx-swap");
        timer = setTimeout(() => { shown = k; note.textContent = say[Math.max(0, k)] || ""; requestAnimationFrame(() => note.classList.remove("is-fx-swap")); }, 250);
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const target = box || window;
    target.addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    const ro = new ResizeObserver(on);
    ro.observe(el);
    draw();
    return () => {
      target.removeEventListener("scroll", on);
      removeEventListener("resize", on);
      ro.disconnect(); cancelAnimationFrame(raf); clearTimeout(timer);
      base.remove(); fill.remove();
      if (tag) tag.style.top = "";
      el.style.removeProperty("--fx-step"); el.style.removeProperty("--fx-every"); el.style.removeProperty("--fx-major"); el.style.removeProperty("--fx-minor");
    };
  });
})();
