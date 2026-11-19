// Several tilted cards stand evenly overlapping across the row width (card width 22.1%). When the cursor moves horizontally over the row, the card at that spot stands upright and floats up (is-open),
// Cards in front move left and cards behind move right, narrowing the gap to 1.6% so they bunch up and leave a 1.8% gap around the open card — positions shift over .6s (0.22,1,0.36,1).
// While moving over an open card nothing changes, and on leaving the row it returns to the chosen spot. Below 1024px it stays a horizontal scroll row (Studio recommendation)
(() => {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  kfFx.register("fan-pick-row", (el, { options, reduce }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const n = cards.length;
    if (n < 2) return;
    if (options.shuffle === "true") {
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
      cards.forEach((c) => el.append(c));
    }
    const W = +(options.card ?? 22.1), GAP = +(options.gap ?? 1.8), MIN = +(options.min ?? 1.6), OVER = +(options.over ?? 4), REF = +(options.ref ?? 82);
    const big = matchMedia(`(min-width: ${options.breakpoint || 1024}px)`);
    let w = W, p = GAP, h = MIN, v = OVER, step = 0, open = -1;
    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const k = Math.min(1, (REF * rem) / (el.clientWidth || 1));
      w = W * k; p = GAP * k; h = MIN * k; v = OVER * k; step = (100 - w) / (n - 1);
      el.style.setProperty("--fx-card", `${w}`);
    };
    const at = (i) => i * step;
    const set = (e) => {
      open = e;
      const lead = at(e) - p - w, before = e > 1 ? clamp(lead / (e - 1), h, step) : 0;
      const tail = at(e) + w + p, rest = n - 1 - e, after = rest > 1 ? clamp((100 - w - tail) / (rest - 1), h, step) : 0;
      cards.forEach((c, i) => {
        let x = at(i);
        if (e >= 0 && i < e) x = Math.max(-v, lead - (e - 1 - i) * before);
        if (e >= 0 && i > e) x = Math.min(100 - w + v, tail + (i - e - 1) * after);
        c.style.setProperty("--fx-x", x.toFixed(3));
        c.classList.toggle("is-open", i === e);
      });
    };
    const move = (ev) => {
      if (!big.matches) return;
      const r = el.getBoundingClientRect(), d = ((ev.clientX - r.left) / r.width) * 100;
      if (open >= 0 && d >= at(open) && d <= at(open) + w) return;
      const i = clamp(Math.floor(d / step), 0, n - 1);
      if (i !== open) set(i);
    };
    const leave = (ev) => { if (ev.pointerType !== "touch") set(-1); };
    const focusIn = (ev) => { const i = cards.indexOf(ev.target.closest?.('[data-fx-part="card"]')); if (big.matches && i >= 0 && ev.target.matches(":focus-visible")) set(i); };
    const focusOut = (ev) => { if (!el.contains(ev.relatedTarget) && !el.matches(":hover")) set(-1); };
    const change = () => set(-1);
    measure(); set(-1);
    const ro = new ResizeObserver(() => { measure(); set(open); });
    ro.observe(el);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focusin", focusIn);
    el.addEventListener("focusout", focusOut);
    big.addEventListener("change", change);
    return () => {
      ro.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", focusIn);
      el.removeEventListener("focusout", focusOut);
      big.removeEventListener("change", change);
      cards.forEach((c) => { c.style.removeProperty("--fx-x"); c.classList.remove("is-open"); });
      el.style.removeProperty("--fx-card");
    };
  });
})();
