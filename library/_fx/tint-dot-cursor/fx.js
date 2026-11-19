// Hides the system cursor and a dot whose sunset color cycles every 8s follows the cursor — it grows translucent over links, grows larger over photo cards to show a name tag, and shrinks with a flinch when pressed
(() => {
  kfFx.register("tint-dot-cursor", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;
    const root = document.documentElement;
    let dot = el.querySelector('[data-fx-part="dot"]'), label = el.querySelector('[data-fx-part="label"]');
    const made = [];
    if (!dot) { dot = document.createElement("span"); dot.setAttribute("data-fx-part", "dot"); el.prepend(dot); made.push(dot); }
    if (!label && options.text) { label = document.createElement("span"); label.setAttribute("data-fx-part", "label"); label.textContent = options.text; el.append(label); made.push(label); }
    const lerp = +(options.lerp ?? 0.4), half = el.offsetWidth / 2 || 70;
    const project = options.project || '[data-cursor="project"]', subtle = options.subtle || '[data-cursor="subtle"]';
    const live = 'a, button, input, select, textarea, summary, [role="button"], [role="link"], [data-cursor="interactive"]';
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0, seen = false, pulse = 0;
    const ac = new AbortController(), on = { signal: ac.signal, passive: true };
    root.classList.add("fx-cursor-on");
    const draw = () => {
      x += (tx - x) * lerp;
      y += (ty - y) * lerp;
      el.style.transform = `translate3d(${x - half}px, ${y - half}px, 0)`;
      raf = Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05 ? requestAnimationFrame(draw) : 0;
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(draw); };
    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { x = tx; y = ty; seen = true; el.classList.add("is-on"); }
      ask();
    }, on);
    addEventListener("pointerover", (e) => {
      const t = e.target;
      const overProject = !!t.closest?.(project);
      el.classList.toggle("is-project", overProject);
      el.classList.toggle("is-live", !overProject && !!t.closest?.(live));
      el.classList.toggle("is-subtle", !overProject && !!t.closest?.(subtle));
    }, on);
    addEventListener("pointerdown", () => {
      clearTimeout(pulse);
      el.classList.remove("is-pressed");
      void el.offsetWidth;
      el.classList.add("is-pressed");
      pulse = setTimeout(() => el.classList.remove("is-pressed"), +(options.press ?? 140));
    }, on);
    root.addEventListener("mouseleave", () => { seen = false; el.classList.remove("is-on", "is-live", "is-project", "is-subtle", "is-pressed"); }, { signal: ac.signal });
    root.addEventListener("mouseenter", ask, { signal: ac.signal });
    return () => {
      ac.abort();
      cancelAnimationFrame(raf);
      clearTimeout(pulse);
      root.classList.remove("fx-cursor-on");
      el.classList.remove("is-on", "is-live", "is-project", "is-subtle", "is-pressed");
      el.style.removeProperty("transform");
      made.forEach((n) => n.remove());
    };
  });
})();
