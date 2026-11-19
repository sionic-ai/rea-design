(() => {
  // The original (Brand loader) gives each cell a delay of ‹distance from center ÷ distance of the farthest cell × 1s› and randomly rotates the cell shape among four so the clearing direction is mixed
  kfFx.register("tri-grid-unveil", (el, { options, reduce }) => {
    if (reduce) return;
    const cellPc = +(options.cell || 6.6667), cellSp = +(options["cell-sp"] || 15.4667);
    const spread = +(options.spread ?? 1), dur = +(options.dur ?? 2), fade = +(options.fade ?? 1.5), step = +(options.step ?? 0.1);
    const delay = +(options.delay ?? 0.01);
    const layer = document.createElement("div");
    layer.className = "fx-tgu";
    layer.setAttribute("aria-hidden", "true");
    layer.style.setProperty("--fx-dur", `${dur}s`);
    layer.style.setProperty("--fx-fade", `${fade}s`);
    layer.style.setProperty("--fx-step", `${step}s`);
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.prepend(layer);
    let started = false, timer = 0, doneTimer = 0;
    const build = () => {
      if (started) return;
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      const size = ((w < 768 ? cellSp : cellPc) / 100) * w;
      if (!(size > 0)) return;
      const cols = Math.ceil(w / size), rows = Math.max(1, Math.ceil(h / size));
      const cx = (cols - 1) / 2, cy = (rows - 1) / 2, far = Math.hypot(cx, cy) || 1;
      layer.style.setProperty("--fx-cell", `${size}px`);
      let html = "";
      for (let y = 0; y < rows; y++) {
        html += '<div class="fx-tgu__row">';
        for (let x = 0; x < cols; x++) {
          const t = Math.max(1, Math.ceil(4 * Math.random()));
          html += `<div class="fx-tgu__cell t${t}" style="--d:${((Math.hypot(cx - x, cy - y) / far) * spread).toFixed(3)}s"><i></i><i></i><i></i><i></i></div>`;
        }
        html += "</div>";
      }
      layer.innerHTML = html;
    };
    const start = () => {
      if (started) return;
      build();
      started = true;
      timer = setTimeout(() => {
        layer.classList.add("is-on");
        doneTimer = setTimeout(() => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })), (spread + 3 * step + Math.max(dur, fade)) * 1000);
      }, delay * 1000);
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    const ac = new AbortController();
    if (options.wait) document.addEventListener(options.wait, start, { once: true, signal: ac.signal });
    else if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true, signal: ac.signal });
    return () => { ac.abort(); ro.disconnect(); clearTimeout(timer); clearTimeout(doneTimer); layer.remove(); };
  });
})();
