// Lays TubesCursor from threejs-components (a three.js scene where a glowing tube bends to follow the cursor) onto the panel — loaded and shown when the panel is one screen away.
// Original values (Brand three footer): 3 tube colors · 4 light colors · light intensity 200 · once the scene starts drawing the canvas turns on in 1.1s and the waiting cover lifts in .6s · pressing the panel randomizes the tube·light colors.
(() => {
  const here = document.currentScript?.src || "";
  const defaultSrc = here ? new URL("../../_vendor/threejs-components@0.0.19/build/cursors/tubes1.classic.js", here).href : "";
  let loading = null;
  const load = (src) => {
    if (window.TubesCursor) return Promise.resolve();
    return (loading ||= new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); }));
  };
  // Skin variable (including oklch relative colors) to the #rrggbb that TubesCursor reads — paint one dot and read it
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const hex = (el, name, fallback) => {
    const v = getComputedStyle(el).getPropertyValue(name).trim() || getComputedStyle(el).getPropertyValue(fallback).trim();
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = v || "transparent"; probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
  };

  kfFx.register("tubes-cursor", (el, { options, reduce }) => {
    if (reduce) return;
    let canvas = el.querySelector('[data-fx-part="canvas"]');
    const made = !canvas;
    if (made) { canvas = document.createElement("canvas"); canvas.dataset.fxPart = "canvas"; canvas.setAttribute("aria-hidden", "true"); el.prepend(canvas); }
    const wait = el.querySelector('[data-fx-part="wait"]');
    let app = null, gone = false, px = 0, py = 0, queued = false;
    const size = () => { const r = el.getBoundingClientRect(); if (r.width && r.height) { canvas.width = r.width; canvas.height = r.height; } };
    const flush = () => { queued = false; canvas.dispatchEvent(new MouseEvent("mousemove", { clientX: px, clientY: py, bubbles: true })); };
    const onMove = (e) => { px = e.clientX; py = e.clientY; if (!queued) { queued = true; requestAnimationFrame(flush); } };
    // Not skin: the random color picked on press — the original picks any color, and that is the reaction
    const random = (n) => Array.from({ length: n }, () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));
    const onClick = () => { if (!app) return; app.tubes.setColors(random(3)); app.tubes.setLightsColors(random(4)); };
    const onResize = () => requestAnimationFrame(size);
    const start = async () => {
      try { await load(options.src || defaultSrc); } catch { return; }
      if (gone || app || !window.TubesCursor) return;
      size();
      await new Promise((r) => ("requestIdleCallback" in window ? requestIdleCallback(r, { timeout: 1000 }) : requestAnimationFrame(r)));
      if (gone) return;
      app = window.TubesCursor(canvas, {
        tubes: {
          colors: [1, 2, 3].map((i) => hex(el, `--fx-tube-${i}`, "--kf-accent")),
          lights: { intensity: +(options.intensity ?? 200), colors: [1, 2, 3, 4].map((i) => hex(el, `--fx-light-${i}`, "--kf-accent")) },
        },
      });
      addEventListener("resize", onResize, { passive: true });
      el.addEventListener("pointermove", onMove, { passive: true });
      if (options.shuffle !== "off") el.addEventListener("click", onClick);
      requestAnimationFrame(() => requestAnimationFrame(() => { canvas.classList.add("is-ready"); wait?.classList.add("is-hidden"); }));
    };
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: options.margin || "100% 0px" });
    io.observe(el);
    return () => {
      gone = true; io.disconnect();
      removeEventListener("resize", onResize); el.removeEventListener("pointermove", onMove); el.removeEventListener("click", onClick);
      try { app?.dispose(); } catch {}
      app = null;
      if (made) canvas.remove(); else canvas.classList.remove("is-ready");
      wait?.classList.remove("is-hidden");
    };
  });
})();
