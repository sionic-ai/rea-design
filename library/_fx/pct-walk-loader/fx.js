// Original loading steps — the larger of the time share (up to .8 over min seconds) and the actual received share (off-panel images and fonts), capped while still receiving, approached by lerp each frame,
// When everything is received it rises to 100 over finish seconds cubic out, then is-ended (text drops out · symbol enlarges) → after hold seconds is-complete (panel lifts away) → after out seconds the panel is removed and fx:done fires
(() => {
  kfFx.register("pct-walk-loader", (el, { options, reduce }) => {
    const done = () => document.dispatchEvent(new Event("fx:done"));
    if (reduce) { el.hidden = true; done(); return () => { el.hidden = false; }; }
    const min = +(options.min ?? 1.6) * 1000, cap0 = +(options.cap ?? 0.92), lerp = +(options.lerp ?? 0.12);
    const finish = +(options.finish ?? 0.6) * 1000, hold = +(options.hold ?? 1.6) * 1000, out = +(options.out ?? 0.7) * 1000;
    const pct = el.querySelector('[data-fx-part="pct"]'), num = el.querySelector('[data-fx-part="num"]');
    let progress = 0, real = 0, cap = cap0, raf = 0, alive = true;
    const timers = [];
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));
    const draw = () => {
      const p = Math.round(progress * 100);
      if (pct) pct.textContent = p;
      if (num) num.textContent = p < 10 ? `0${p}` : p;
      el.style.setProperty("--fx-p", progress);
    };
    const start = performance.now();
    const step = () => {
      const o = Math.min(1, (performance.now() - start) / min) * 0.8;
      progress += (Math.min(cap, Math.max(real, o)) - progress) * lerp;
      draw();
      raf = requestAnimationFrame(step);
    };
    const easeTo = (ms) => new Promise((res) => {
      const from = progress, t0 = performance.now();
      const tick = () => {
        if (!alive) return;
        const c = ms > 0 ? Math.min(1, (performance.now() - t0) / ms) : 1;
        progress = from + (1 - from) * (1 - Math.pow(1 - c, 3));
        draw();
        c < 1 ? requestAnimationFrame(tick) : res();
      };
      requestAnimationFrame(tick);
    });
    // Things to load — images outside the board (not yet arrived) and fonts. Each arrival raises the real share
    const imgs = [...document.images].filter((im) => !el.contains(im) && !(im.complete && im.naturalWidth > 0));
    const jobs = imgs.map((im) => new Promise((r) => { im.addEventListener("load", r, { once: true }); im.addEventListener("error", r, { once: true }); }));
    jobs.push(document.fonts.ready);
    let got = 0;
    jobs.forEach((j) => j.then(() => { got++; real = Math.min(1, got / jobs.length); }));
    raf = requestAnimationFrame(step);
    (async () => {
      await Promise.all(jobs);
      if (!alive) return;
      cap = 1;
      await easeTo(finish);
      if (!alive) return;
      el.classList.add("is-ended");
      el.dispatchEvent(new CustomEvent("fx:ended", { bubbles: true }));
      await wait(hold);
      el.classList.add("is-complete");
      done();
      await wait(out);
      cancelAnimationFrame(raf);
      el.hidden = true;
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      el.classList.remove("is-ended", "is-complete");
      el.style.removeProperty("--fx-p");
      el.hidden = false;
    };
  });
})();
