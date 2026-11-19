// Photo grid — when a cell becomes visible it turns on with a per-row shuffled delay, and every few seconds a random cell lifts its cover on its own to show the same inside as hover (image and name)
(() => {
  // Original delay table: wide screens mix four [on, second photo] in a row of 4 columns, narrow screens mix three in a row of 3 columns
  const WIDE = [[0.2, 1], [0.4, 1.2], [0.6, 1.4], [0.8, 1.6]];
  const NARROW = [[0.2, 0.8], [0.4, 1], [0.6, 1.2]];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  kfFx.register("peek-tile-grid", (el, { options, reduce }) => {
    const tiles = [...el.querySelectorAll('[data-fx-part="tile"]')];
    if (!tiles.length) return;
    const narrow = matchMedia(`(max-width: ${options.narrow || 720}px)`).matches;
    const table = narrow ? NARROW : WIDE;
    const delays = [];
    while (delays.length < tiles.length) delays.push(...shuffle(table.map((d) => d.slice())));
    tiles.forEach((t, i) => { t.style.setProperty("--fx-d1", `${delays[i][0]}s`); t.style.setProperty("--fx-d2", `${delays[i][1]}s`); });
    const readyMs = +(options.ready ?? 1400), every = +(options.every ?? 2.6), second = +(options.second ?? 1.3), pair = +(options.pair || 12);
    const timers = [];
    let io = null, loop = 0;
    if (reduce || options.instant === "1") tiles.forEach((t) => { t.classList.add("is-fx-in"); t.classList.add("is-fx-ready"); });
    else {
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add("is-fx-in");
        timers.push(setTimeout(() => e.target.classList.add("is-fx-ready"), readyMs));
      }), { rootMargin: options.margin || "-18% 0px" });
      tiles.forEach((t) => io.observe(t));
    }
    // The second picked cell comes second seconds after the first — only when there are pair or more cells
    const open = [-1, -1];
    const mark = () => tiles.forEach((t, i) => t.classList.toggle("is-fx-open", open.includes(i)));
    if (every > 0 && !reduce) {
      loop = setInterval(() => {
        open[0] = Math.floor(Math.random() * tiles.length);
        mark();
        if (tiles.length >= pair) timers.push(setTimeout(() => { open[1] = Math.floor(Math.random() * tiles.length); mark(); }, second * 1000));
      }, every * 1000);
    }
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
      io && io.disconnect();
      tiles.forEach((t) => {
        t.classList.remove("is-fx-in", "is-fx-ready", "is-fx-open");
        t.style.removeProperty("--fx-d1");
        t.style.removeProperty("--fx-d2");
      });
    };
  });
})();
