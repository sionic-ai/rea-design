// Product dots in photo — hovering a photo lights a button at bottom right, and pressing it makes the dots on the items pop up in turn and ping.
// Hovering or focusing a dot shows a name tag (a workspace on the original site). Dot positions are photo-based px as in the original, or %
(() => {
  kfFx.register("photo-hotspot-toggle", (el, { options, reduce }) => {
    const toggle = el.querySelector('[data-fx-part="toggle"]');
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    if (!toggle || !dots.length) return;
    const each = Math.max(0, +(options.each ?? 75));
    const base = +(options.base ?? 0);
    // If base is set, the px slot is read relative to that width and stretched or shrunk to fit the photo width (the original hardcodes px for a 672px photo)
    const place = (k) => dots.forEach((d) => {
      const { x, y } = d.dataset;
      if (x != null) d.style.left = /%$/.test(x) ? x : `${+x * k}px`;
      if (y != null) d.style.top = /%$/.test(y) ? y : `${+y * k}px`;
    });
    dots.forEach((d, i) => d.style.setProperty("--fx-delay", `${reduce ? 0 : each * i}ms`));
    let ro = null;
    if (base > 0) {
      const fit = () => place(el.clientWidth / base || 1);
      ro = new ResizeObserver(fit);
      ro.observe(el);
      fit();
    } else place(1);
    const set = (on) => {
      el.classList.toggle("is-fx-open", on);
      toggle.setAttribute("aria-pressed", String(on));
      el.dispatchEvent(new CustomEvent(on ? "fx:open" : "fx:close", { bubbles: true }));
    };
    const onToggle = (e) => { set(!el.classList.contains("is-fx-open")); if (e.detail) toggle.blur(); };
    const onDot = (e) => { if (e.detail && e.target === e.currentTarget) e.currentTarget.blur(); };
    toggle.addEventListener("click", onToggle);
    dots.forEach((d) => d.addEventListener("click", onDot));
    return () => {
      ro?.disconnect();
      toggle.removeEventListener("click", onToggle);
      dots.forEach((d) => d.removeEventListener("click", onDot));
      el.classList.remove("is-fx-open");
    };
  });
})();
