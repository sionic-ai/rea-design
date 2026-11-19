// One droplet-like path keeps morphing endlessly between preset shapes — using animate from Snap.svg 0.5.1, the same as the original (Site),
// Each time one shape finishes, the next shape’s animation is chained on. Snap converts both paths into curves and fills in between, so the node counts can differ.
// Placing path inside clipPath makes a hero where the photo/video window shape wobbles
(() => {
  // Classic easeInOutQuad — the same formula as the Snap curve addition the original used (mina.easeInOutQuad)
  const inOutQuad = (n) => (n < 0.5 ? 2 * n * n : -1 + (4 - 2 * n) * n);
  kfFx.register("snap-path-morph", (el, { options, reduce }) => {
    const path = el.querySelector('[data-fx-part="path"]');
    const forms = [...el.querySelectorAll('[data-fx-part="form"]')].map((f) => f.getAttribute("d")).filter(Boolean);
    if (!path || !forms.length || reduce || !window.Snap) return;
    const start = path.getAttribute("d");
    const list = [start || forms[0], ...forms];
    // At 0, a loop that schedules the next one right after finishing would spin endlessly within a single frame — length does not accept 0
    const dur = (+options.dur || 10) * 1000;
    const ease = options.ease === "linear" ? (n) => n : inOutQuad;
    const s = Snap(path);
    let at = 0, on = true;
    const next = () => {
      if (!on) return;
      at = (at + 1) % list.length;
      s.animate({ d: list[at] }, dur, ease, next);
    };
    next();
    return () => {
      on = false;
      s.stop();
      if (start) path.setAttribute("d", start);
    };
  });
})();
