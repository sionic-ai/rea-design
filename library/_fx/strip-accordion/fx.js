// Pressing inside an opened band folds it, same as the original — pressing outside the panel folds them all
(() => {
  kfFx.register("strip-accordion", (el, { options }) => {
    const strips = [...el.querySelectorAll('[data-fx-part="strip"]')];
    if (!strips.length) return;
    const ac = new AbortController();
    const signal = ac.signal;
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.close) el.style.setProperty("--fx-close", options.close);
    const delays = String(options.delays ?? "0.5,0.56,0.62,0.65,0.67,0.68").split(",").map((v) => +v).filter((v) => !Number.isNaN(v));
    strips.forEach((s) => s.querySelectorAll('[data-fx-part="rise"]').forEach((r, i) => {
      if (delays.length) r.style.setProperty("--fx-delay", `${delays[Math.min(i, delays.length - 1)]}s`);
    }));
    const open = (target) => strips.forEach((s) => {
      s.classList.toggle("fx-open", s === target);
      s.querySelector('[data-fx-part="toggle"]')?.setAttribute("aria-expanded", s === target ? "true" : "false");
    });
    strips.forEach((s) => {
      s.querySelector('[data-fx-part="toggle"]')?.addEventListener("click", (e) => {
        e.stopPropagation();
        open(s.classList.contains("fx-open") ? null : s);
      }, { signal });
      s.addEventListener("click", (e) => {
        if (options.inside !== "keep" && !e.target.closest('[data-fx-part="toggle"]')) open(null);
        e.stopPropagation();
      }, { signal });
    });
    document.addEventListener("click", (e) => { if (!el.contains(e.target)) open(null); }, { signal });
    if (options.first !== "none" && !strips.some((s) => s.classList.contains("fx-open"))) open(strips[0]);
    return () => {
      ac.abort();
      strips.forEach((s) => s.classList.remove("fx-open"));
    };
  });
})();
