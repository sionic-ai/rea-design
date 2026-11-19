(() => {
  kfFx.register("tile-cycle-grid", (el, { options, reduce }) => {
    const tiles = [...el.querySelectorAll(':scope > [data-fx-part="tile"]')];
    if (!tiles.length) return;
    const n = Math.max(1, Math.floor(+options.n || 5)), workers = Math.max(1, Math.floor(+options.workers || 7));
    const stagger = +(options.stagger ?? 0.2) * 1000, tin = +(options.in ?? 0.8) * 1000, hold = +(options.hold ?? 4) * 1000;
    const tout = +(options.out ?? 0.8) * 1000, pause = +(options.pause ?? 0) * 1000;
    const center = Math.floor((n - 1) / 2) * n + Math.floor((n - 1) / 2), sides = [center - 1, center + 1];
    el.style.setProperty("--fx-n", n);
    el.style.setProperty("--fx-in", `${tin}ms`);
    el.style.setProperty("--fx-out", `${tout}ms`);
    const cells = Array.from({ length: n * n }, () => { const c = document.createElement("div"); c.className = "fx-tcg__cell"; el.append(c); return c; });
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const make = (t) => { const box = document.createElement("div"); box.className = "fx-tcg__tile"; box.append(t.cloneNode(true)); box.firstChild.removeAttribute("data-fx-part"); return box; };
    if (reduce) {
      cells.forEach((c, i) => i !== center && c.append(make(tiles[i % tiles.length])));
      return () => cells.forEach((c) => c.remove());
    }
    const busy = new Set();
    let ctl = null;
    const wait = (ms, sig) => new Promise((res, rej) => {
      const id = setTimeout(res, ms);
      sig.addEventListener("abort", () => { clearTimeout(id); rej(new DOMException("Aborted", "AbortError")); });
    });
    const worker = async (sig) => {
      for (;;) {
        const free = cells.map((_, i) => i).filter((i) => i !== center && !busy.has(i));
        if (!free.length) { await wait(100, sig); continue; }
        const i = pick(free);
        const pool = sides.includes(i) ? tiles.filter((t) => t.dataset.side !== "off") : tiles;
        const box = make(pick(pool.length ? pool : tiles));
        busy.add(i);
        box.classList.add("is-in");
        cells[i].append(box);
        try {
          await wait(tin, sig);
          box.classList.remove("is-in");
          await wait(hold, sig);
          box.classList.add("is-out");
          await wait(tout, sig);
        } finally { box.remove(); busy.delete(i); }
        if (pause > 0) await wait(pause, sig);
      }
    };
    const quiet = (e) => { if (e.name !== "AbortError") throw e; };
    const start = () => {
      if (ctl) return;
      ctl = new AbortController();
      const sig = ctl.signal;
      for (let w = 0; w < workers; w++) wait(w * stagger, sig).then(() => worker(sig)).catch(quiet);
    };
    const stop = () => { ctl?.abort(); ctl = null; busy.clear(); };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); stop(); cells.forEach((c) => c.remove()); el.style.removeProperty("--fx-n"); };
  });
})();
