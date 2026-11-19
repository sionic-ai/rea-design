// For each layer, scroll advances the frame number — progress is 0 when the layer center touches the screen bottom and 1 after rising one more screen height,
// The first half is split into first → middle frame, the second half into middle → end frame, cut to integers (steps over like a photo group sprite).
// Layers get --fx-frame (number) and --fx-tilt (center frame 0, first frame 1, last frame −1), and the css that uses them draws angle and face height from those values.
// data-fx-part inside the layer="frame" If it has children, only the one with that number is shown.
(() => {
  kfFx.register("angle-scrub-frames", (el, { scroller }) => {
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')].map((n) => {
      const r = (n.dataset.frames || "0,12,24").split(",").map(Number);
      return { n, a: r[0], m: r[1], b: r[2], frames: [...n.querySelectorAll('[data-fx-part="frame"]')], last: -1 };
    });
    if (!layers.length) return;
    const target = scroller || window;
    let vh = innerHeight, raf = 0;
    const draw = () => {
      raf = 0;
      const off = scroller ? scroller.getBoundingClientRect().top : 0;
      for (const L of layers) {
        const { top, height } = L.n.getBoundingClientRect();
        const l = top - off - (vh - height / 2);
        const u = Math.max(0, Math.min(1, -l / vh));
        const d = Math.round(u < 0.5 ? L.a + u * 2 * (L.m - L.a) : L.m + (u - 0.5) * 2 * (L.b - L.m));
        if (d === L.last) continue;
        L.last = d;
        const tilt = d <= L.m ? (L.m - d) / Math.max(1, L.m - L.a) : -(d - L.m) / Math.max(1, L.b - L.m);
        L.n.style.setProperty("--fx-frame", d);
        L.n.style.setProperty("--fx-tilt", tilt.toFixed(4));
        L.frames.forEach((f, i) => { f.hidden = i !== d - L.a; });
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const onResize = () => { vh = scroller ? scroller.clientHeight : innerHeight; layers.forEach((L) => (L.last = -1)); onScroll(); };
    target.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      layers.forEach((L) => { L.n.style.removeProperty("--fx-frame"); L.n.style.removeProperty("--fx-tilt"); L.frames.forEach((f) => (f.hidden = false)); });
    };
  });
})();
