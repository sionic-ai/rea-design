(() => {
  kfFx.register("path-leaf-loop", (el, { options, reduce }) => {
    const path = el.querySelector('[data-fx-part="path"]');
    const riders = [...el.querySelectorAll('[data-fx-part="rider"]')];
    if (!path || !riders.length) return;
    if (reduce || !window.anime) { riders.forEach((r) => (r.style.opacity = 1)); return () => riders.forEach((r) => (r.style.opacity = "")); }
    const rev = options.dir === "reverse";
    // Original values — forward 7.5s (1.5s on · 4.5s hold · 1.5s off) with a 2.5s rest at the end, reverse 8.5s (2.5 · 5 · 1s) with a 3.5s rest at the end
    const dur = +(options.dur ?? (rev ? 8.5 : 7.5)) * 1000, rest = +(options.rest ?? (rev ? 3.5 : 2.5)) * 1000;
    const fin = +(options.in ?? (rev ? 2.5 : 1.5)) * 1000, fout = +(options.out ?? (rev ? 1 : 1.5)) * 1000;
    const hold = Math.max(0, dur - fin - fout);
    const p = anime.path(path);
    const a = anime({
      targets: riders,
      opacity: [{ value: 0, easing: "linear", duration: 0 }, { value: 1, easing: "linear", duration: fin }, { value: 1, easing: "linear", duration: hold }, { value: 0, easing: "linear", duration: fout }],
      translateX: p("x"), translateY: p("y"), rotate: p("angle"),
      easing: options.ease || "easeInOutQuad", duration: dur, loop: true, endDelay: rest, direction: rev ? "reverse" : "normal",
    });
    return () => { a.pause(); anime.remove(riders); riders.forEach((r) => { r.style.transform = ""; r.style.opacity = ""; }); };
  });
})();
