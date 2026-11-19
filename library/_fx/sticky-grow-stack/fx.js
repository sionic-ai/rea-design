(() => {
  kfFx.register("sticky-grow-stack", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length || reduce) return;
    const s0 = +(options.scale ?? 0.9), a = +(options.start ?? 0.1), b = +(options.end ?? 0.5);
    const keep = Math.min(0.99, Math.max(0, +(options.smooth ?? 0.8)));
    const span = Math.max(0.001, b - a);
    const at = (p) => s0 + (1 - s0) * Math.min(1, Math.max(0, (p - a) / span));
    const rows = cards.map((c) => ({ c, f: c.querySelector('[data-fx-part="frame"]'), now: null })).filter((r) => r.f);
    if (!rows.length) return;
    // A stuck card makes getBoundingClientRect return the position where it stopped — the pre-stick home position is computed by adding the heights of the previous cards to the top edge of the group
    const want = () => {
      const view = scroller ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight };
      const gap = parseFloat(getComputedStyle(el).rowGap) || 0;
      let top = el.getBoundingClientRect().top - view.top;
      return rows.map((r) => {
        // The panel is growing so its on-screen box is shrunk — measured with offsetTop, which ignores scale (the card is sticky so it is the panel’s reference box)
        const frameTop = top + (r.f.offsetParent === r.c ? r.f.offsetTop : r.f.offsetTop - r.c.offsetTop);
        const h = r.f.offsetHeight;
        top += r.c.offsetHeight + gap;
        return at((view.height - frameTop) / (view.height + h));
      });
    };
    let last = 0;
    const tick = (time) => {
      const now = time * 1000;
      const dt = last ? Math.max(1, now - last) : 16.7;
      last = now;
      const k = 1 - Math.pow(keep, dt / 16.7);
      const w = want();
      rows.forEach((r, i) => {
        if (r.now == null) r.now = w[i];
        else if (Math.abs(w[i] - r.now) < 0.0002) r.now = w[i];
        else r.now += (w[i] - r.now) * k;
        if (r.shown !== r.now) { r.shown = r.now; r.f.style.scale = r.now; }
      });
    };
    gsap.ticker.add(tick);
    tick(gsap.ticker.time);
    return () => { gsap.ticker.remove(tick); rows.forEach((r) => (r.f.style.scale = "")); };
  });
})();
