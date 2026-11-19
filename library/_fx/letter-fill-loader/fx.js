// A single line in the loader panel center — lights the same text letter by letter over faint background text. The lighting position follows the later of actual progress and minimum time
// Even with nothing to load, you can see the letters light up fully. The caller reports progress to the panel via fx:progress (detail 0..1) and fx:ready events (if not reported, it ends after the minimum time)
(() => {
  kfFx.register("letter-fill-loader", (el, { options, reduce }) => {
    const fill = el.querySelector('[data-fx-part="fill"]');
    if (!fill || !fill.textContent.trim()) return;
    const min = reduce ? 0 : +(options.min ?? 2600), hold = +(options.hold ?? 50), wait = options.wait === "event";
    const text = fill.textContent;
    fill.textContent = "";
    const letters = [...text].map((ch) => {
      const s = document.createElement("span");
      s.textContent = ch;
      fill.append(s);
      return s;
    });
    const t0 = performance.now();
    let target = wait ? 0 : 1, shown = 0, done = false, raf = 0, timer = 0;
    const light = () => {
      const p = Math.min(target, Math.min(1, (performance.now() - t0) / Math.max(1, min)));
      const n = Math.floor(p * letters.length + 0.0001);
      while (shown < n) letters[shown++].classList.add("is-lit");
      if (!done && p >= 1) finish();
      if (!done) raf = requestAnimationFrame(light);
    };
    const finish = () => {
      done = true;
      timer = setTimeout(() => {
        letters.forEach((s) => s.classList.add("is-lit"));
        el.classList.add("is-done");
        el.dispatchEvent(new CustomEvent("fx:loaded", { bubbles: true }));
      }, hold);
    };
    const onProgress = (e) => { target = Math.max(target, Math.min(1, +e.detail || 0)); };
    const onReady = () => { target = 1; };
    el.addEventListener("fx:progress", onProgress);
    el.addEventListener("fx:ready", onReady);
    raf = requestAnimationFrame(light);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      el.removeEventListener("fx:progress", onProgress);
      el.removeEventListener("fx:ready", onReady);
      fill.textContent = text;
      el.classList.remove("is-done");
    };
  });
})();
