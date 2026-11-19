// Several cells flip one at a time to the back, and 1 second later the previous cell returns to the front — only one cell is ever on the back (the first cell of the first lap has no previous cell to restore).
// The flip itself is a css transition, and here only order and timing are set
(() => {
  kfFx.register("relay-flip-tiles", (el, { options, reduce }) => {
    const tiles = [...el.querySelectorAll('[data-fx-part="tile"]')];
    if (!tiles.length || reduce) return;
    const every = +options.every || 4500;
    const back = +(options.back ?? 1000);
    const start = +(options.start ?? 3000);
    const pause = options.pause || "";
    let at = 0, first = true, busy = false, timer = 0, revert = 0;
    const flip = (t) => t.toggleAttribute("data-turned");
    const next = () => { timer = setTimeout(step, every); };
    const step = () => {
      if (busy || (pause && document.querySelector(pause))) return next();
      busy = true;
      const cur = at, prev = (cur - 1 + tiles.length) % tiles.length;
      flip(tiles[cur]);
      at = (cur + 1) % tiles.length;
      revert = setTimeout(() => {
        if (!first && tiles.length > 1) flip(tiles[prev]);
        first = false;
        busy = false;
        next();
      }, back);
    };
    timer = setTimeout(step, start);
    return () => {
      clearTimeout(timer);
      clearTimeout(revert);
      tiles.forEach((t) => t.removeAttribute("data-turned"));
    };
  });
})();
