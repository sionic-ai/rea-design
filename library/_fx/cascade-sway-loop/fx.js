(() => {
  kfFx.register("cascade-sway-loop", (el, { options, reduce }) => {
    if (reduce) return;
    // Layers are looked up again each time it is triggered — so they attach even where the drawing is filled in late (places that fill SVG with JS).
    const mark = () => el.querySelectorAll('[data-fx-part="tier"]').forEach((t, i) => t.style.setProperty("--fx-i", i));
    const small = matchMedia("(max-width: 767px)").matches;
    const delay = +((small ? options.sp : undefined) ?? options.delay ?? 0) * 1000;
    const every = +options.every || 2600, dur = +(options.dur ?? 1500);
    el.style.setProperty("--fx-dur", `${dur}ms`);
    el.style.setProperty("--fx-step", `${+(options.step ?? 0.07)}s`);
    let t1, t2, iv;
    // Original LoopClass: after a delay every 2.6s adds is-swing and removes it 1.5s later — layers sway .07s later each from the top
    const fire = () => { mark(); el.classList.add("fx-sway-on"); t2 = setTimeout(() => el.classList.remove("fx-sway-on"), dur); };
    t1 = setTimeout(() => { fire(); iv = setInterval(fire, every); }, delay);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(iv); el.classList.remove("fx-sway-on"); };
  });
})();
