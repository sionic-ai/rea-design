(() => {
  // To let the smear finish filling and then fade instead of cutting off on leave, measure when it came in — read the length from a css variable and keep it in a single option
  const ms = (el, name, fallback) => {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    return v.endsWith("ms") ? parseFloat(v) : v.endsWith("s") ? parseFloat(v) * 1000 : fallback;
  };
  kfFx.register("point-ripple-hover", (el, { hover }) => {
    if (!hover) return;
    const cls = ["fx-ripple-on", "fx-ripple-out", "fx-ripple-kept", "fx-ripple-reset"];
    let enteredAt = 0, timer = 0, frame = 0, inside = false;
    const clear = () => { clearTimeout(timer); cancelAnimationFrame(frame); timer = frame = 0; };
    const place = (e) => {
      const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      const far = Math.max(Math.hypot(x, y), Math.hypot(r.width - x, y), Math.hypot(x, r.height - y), Math.hypot(r.width - x, r.height - y));
      el.style.setProperty("--fx-rx", `${x}px`);
      el.style.setProperty("--fx-ry", `${y}px`);
      el.style.setProperty("--fx-rs", `${far * 2}px`);
    };
    const enter = (e) => {
      clear();
      inside = true;
      place(e);
      el.classList.remove(...cls);
      el.classList.add("fx-ripple-reset");
      void el.offsetWidth;
      enteredAt = performance.now();
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.classList.remove("fx-ripple-reset");
        if (inside) el.classList.add("fx-ripple-on");
      });
    };
    const move = (e) => inside && place(e);
    const leave = () => {
      inside = false;
      clear();
      const rest = Math.max(0, ms(el, "--fx-dur", 450) - (performance.now() - enteredAt));
      timer = setTimeout(() => {
        el.classList.remove("fx-ripple-on", "fx-ripple-reset");
        el.classList.add("fx-ripple-out");
        timer = setTimeout(() => { el.classList.remove("fx-ripple-out"); el.classList.add("fx-ripple-kept"); timer = 0; }, ms(el, "--fx-fade", 450));
      }, rest);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      clear();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.classList.remove(...cls);
      ["--fx-rx", "--fx-ry", "--fx-rs"].forEach((p) => el.style.removeProperty(p));
    };
  });
})();
