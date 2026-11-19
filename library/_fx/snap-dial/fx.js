// As in the original, position is a real number in item units — input only moves the target, and the visible value damps toward the target every frame
(() => {
  kfFx.register("snap-dial", (el, { options, reduce }) => {
    const per = +(options.per || 0.8), dragK = +(options.drag ?? 1), follow = +(options.follow || 7), snap = +(options.snap ?? 2.5), wait = +(options.delay ?? 0.35);
    const loop = options.loop !== "false";
    const s = { pos: 0, target: 0, vel: 0, idle: 0, cur: -1 };
    let drag = null, raf = 0, last = 0;
    const items = () => [...el.querySelectorAll('[data-fx-part="item"]')];
    const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
    const clamp = (v) => { const n = items().length; return loop || !n ? v : Math.min(Math.max(v, 0), n - 1); };
    const paint = () => {
      const list = items(), n = list.length;
      el.style.setProperty("--fx-pos", s.pos.toFixed(4));
      if (!n) return;
      list.forEach((it, j) => {
        let o = j - s.pos;
        if (loop) o = ((((o + n / 2) % n) + n) % n) - n / 2;
        it.style.setProperty("--fx-offset", o.toFixed(4));
      });
      const idx = ((Math.round(s.pos) % n) + n) % n;
      if (idx !== s.cur) {
        list.forEach((it, j) => (j === idx ? it.setAttribute("aria-current", "true") : it.removeAttribute("aria-current")));
        s.cur = idx;
      }
      el.dispatchEvent(new CustomEvent("fx:dial", { detail: { pos: s.pos, index: idx } }));
    };
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(Math.max(now - (last || now), 1), 100) / 1000;
      last = now;
      if (!drag && Math.abs(s.vel) > 1e-4) (s.target = clamp(s.target + s.vel * dt)), (s.vel *= Math.exp(-7.5 * dt));
      else if (!drag) s.vel = 0;
      s.idle = drag || Math.abs(s.vel) > 0.05 ? 0 : s.idle + dt;
      if (snap > 0 && s.idle > wait) s.target = damp(s.target, Math.round(s.target), snap, dt);
      const before = s.pos;
      s.pos = reduce ? s.target : damp(s.pos, s.target, drag ? follow * 4 : follow, dt);
      if (Math.abs(s.pos - before) > 1e-5 || s.cur === -1) paint();
    };
    const ac = new AbortController(), on = { signal: ac.signal };
    el.addEventListener("wheel", (e) => {
      if (e.ctrlKey) return;
      e.preventDefault();
      const dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      s.target = clamp(s.target + dy / Math.max(innerHeight * per, 1));
      s.idle = 0;
    }, { passive: false, signal: ac.signal });
    el.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      drag = { lx: e.clientX, lt: performance.now() };
      s.vel = 0;
    }, on);
    addEventListener("pointermove", (e) => {
      if (!drag) return;
      const now = performance.now(), d = (-(e.clientX - drag.lx) / innerWidth) * dragK;
      s.target = clamp(s.target + d);
      s.vel = d / Math.max((now - drag.lt) / 1000, 1 / 120);
      drag.lx = e.clientX; drag.lt = now;
      s.idle = 0;
    }, on);
    addEventListener("pointerup", () => { if (!drag) return; if (performance.now() - drag.lt > 80) s.vel = 0; drag = null; }, on);
    el.addEventListener("keydown", (e) => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!k) return;
      e.preventDefault();
      s.target = clamp(Math.round(s.target) + k);
      s.idle = 0;
    }, on);
    paint();
    raf = requestAnimationFrame(frame);
    return () => { ac.abort(); cancelAnimationFrame(raf); el.style.removeProperty("--fx-pos"); items().forEach((it) => (it.style.removeProperty("--fx-offset"), it.removeAttribute("aria-current"))); };
  });
})();
