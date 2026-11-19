// A character row flips pictures together on one tempo (step ms) — the beat number is written on a single root (--fx-k·--fx-k-odd), and the vertical strip in each cell rises by that number.
// Unlike the original sprite, cells are not rewritten every beat, so even with dozens of cells only two variables on the root change per beat
(() => {
  kfFx.register("sprite-step-row", (el, { options, reduce }) => {
    const step = +options.step || 227;
    const read = (s, d) => (s ? String(s).trim().split(/\s+/).map(Number).filter(Number.isFinite) : d);
    const seq = read(options.seq, [0, 0, 1, 1, 2, 2, 3, 3]);
    const odd = read(options.odd, seq);
    const frames = +options.frames || 4;
    if (!seq.length) return;
    let phase = 0;
    const paint = () => {
      el.style.setProperty("--fx-k", String(seq[phase % seq.length] % frames));
      el.style.setProperty("--fx-k-odd", String(odd[phase % odd.length] % frames));
    };
    el.style.setProperty("--fx-n", String(frames));
    paint();
    const off = () => ["--fx-k", "--fx-k-odd", "--fx-n"].forEach((p) => el.style.removeProperty(p));
    if (reduce) return off;
    // Like the original, switches to 1 on the first beat (0 is the shape at open)
    const id = setInterval(() => { phase = (phase + 1) % seq.length; paint(); }, step);
    return () => { clearInterval(id); off(); };
  });
})();
