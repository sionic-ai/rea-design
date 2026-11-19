(() => {
  kfFx.register("counter-follow", (el, { options, reduce, hover }) => {
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    if (reduce || !hover || !layers.length) return;
    // Targets the distance from screen center to the cursor × sens/1000, closing the ease fraction of the remaining distance every frame.
    const sens = +(options.sens ?? 5) / 1000, ease = +(options.ease ?? 0.1);
    const dirs = layers.map((l, i) => +(l.dataset.dir ?? (i % 2 ? -1 : 1)));
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const onMove = (e) => { tx = (e.clientX - innerWidth / 2) * sens; ty = (e.clientY - innerHeight / 2) * sens; };
    const tick = () => {
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      layers.forEach((l, i) => { l.style.transform = `translate(${x * dirs[i]}px, ${y * dirs[i]}px)`; });
      raf = requestAnimationFrame(tick);
    };
    addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener("mousemove", onMove); layers.forEach((l) => { l.style.transform = ""; }); };
  });
})();
