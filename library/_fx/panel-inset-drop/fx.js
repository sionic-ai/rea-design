// Hero frame — values are passed in as --fx-*, and once the document is fully loaded is-fx-run is added to start the css transition sequence
(() => {
  kfFx.register("panel-inset-drop", (el, { options, reduce }) => {
    const num = (v, d) => { const n = +(v ?? d); return Number.isFinite(n) ? n : d; };
    const inset = num(options.inset, 58), chamfer = num(options.chamfer, 50);
    const at = num(options.at, 3.2), start = num(options.start, 1.7), each = num(options.each, 0.1), late = num(options.late, 2.4);
    const drop = options.drop === undefined ? "calc(9.5vw + 166px)" : (/^-?[\d.]+$/.test(String(options.drop)) ? `${options.drop}px` : options.drop);
    el.style.setProperty("--fx-inset", `${inset}px`);
    el.style.setProperty("--fx-chamfer", `${chamfer}px`);
    el.style.setProperty("--fx-drop", drop);
    el.style.setProperty("--fx-at", `${at}s`);
    el.style.setProperty("--fx-late", `${late}s`);
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    pieces.forEach((p, i) => {
      const order = p.dataset.order === undefined ? i : num(p.dataset.order, i);
      p.style.setProperty("--fx-d", `${(start + order * each).toFixed(2)}s`);
    });
    let raf = 0;
    const run = () => { raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => el.classList.add("is-fx-run")); }); };
    if (reduce) el.classList.add("is-fx-run");
    else if (document.readyState === "complete") run();
    else addEventListener("load", run, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("load", run);
      el.classList.remove("is-fx-run");
      ["--fx-inset", "--fx-chamfer", "--fx-drop", "--fx-at", "--fx-late"].forEach((k) => el.style.removeProperty(k));
      pieces.forEach((p) => p.style.removeProperty("--fx-d"));
    };
  });
})();
