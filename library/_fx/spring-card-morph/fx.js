// One card changes size and position for each state (panel) riding springs — width, height and vertical position each go on separate springs (stiffness 450 · damping 34 · mass 1)
// It overshoots slightly then settles. The first panel docks to the screen bottom (dock: bottom), the other panels rise to the screen center and the background behind them blurs.
// Panel content swaps in .2s — the incoming panel is blank for the first 40% and then appears, and the outgoing panel vanishes at 60%
(() => {
  const STEP = 1000 / 120;

  kfFx.register("spring-card-morph", (el, { options, reduce }) => {
    const box = el.querySelector('[data-fx-part="box"]');
    const panes = [...el.querySelectorAll('[data-fx-part="pane"]')];
    if (!box || !panes.length) return;
    const overlay = el.querySelector('[data-fx-part="overlay"]');
    const title = el.querySelector('[data-fx-part="title"]');
    const confirm = el.querySelector('[data-fx-part="confirm"]');
    const head = el.querySelector('[data-fx-part="head"]');
    const k = +(options.stiffness ?? 450), c = +(options.damping ?? 34), m = +(options.mass ?? 1);
    const gap = +(options.gap ?? 20), intro = +(options.intro ?? 400), fade = +(options.fade ?? 0.2);
    el.style.setProperty("--fx-scm-fade", `${fade}s`);
    const home = panes[0].dataset.key;
    const size = (p) => (p.dataset.size || "280x200").split("x").map(Number);
    const byKey = (key) => panes.find((p) => p.dataset.key === key) || panes[0];

    // One spring per value — integrated in steps finer than 1ms so the curve stays the same even if frames are uneven
    const springs = {};
    const spring = (name, v) => (springs[name] = { x: v, v: 0, to: v });
    let raf = 0, last = 0;
    const apply = () => {
      box.style.width = `${springs.w.x}px`;
      box.style.height = `${springs.h.x}px`;
      box.style.transform = `translateY(${springs.y.x}px)`;
    };
    const tick = (now) => {
      let dt = Math.min(64, Math.max(1, now - (last || now - 16)));
      last = now;
      let moving = false;
      for (const s of Object.values(springs)) {
        for (let t = dt; t > 0; t -= STEP) {
          const h = Math.min(STEP, t) / 1000;
          const a = (-k * (s.x - s.to) - c * s.v) / m;
          s.v += a * h;
          s.x += s.v * h;
        }
        if (Math.abs(s.v) < 0.001 && Math.abs(s.x - s.to) < 0.001) { s.x = s.to; s.v = 0; } else moving = true;
      }
      apply();
      raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (reduce) { for (const s of Object.values(springs)) s.x = s.to; apply(); return; } if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };

    let state = home, shown = false;
    const yFor = (p) => {
      const [, h] = size(p);
      if (!shown) return innerHeight / 2 + h;
      return (p.dataset.dock || (p.dataset.key === home ? "bottom" : "center")) === "bottom" ? innerHeight / 2 - h / 2 - gap : 0;
    };
    const [w0, h0] = size(byKey(home));
    spring("w", w0); spring("h", h0); spring("y", yFor(byKey(home)));
    apply();

    let holdTimer = 0;
    const go = (key) => {
      const p = byKey(key);
      const prev = state;
      state = p.dataset.key;
      const [w, h] = size(p);
      springs.w.to = w; springs.h.to = h; springs.y.to = yFor(p);
      kick();
      panes.forEach((q) => {
        if (q === p) { if (!q.isConnected) marks.get(q).after(q); q.classList.remove("fx-scm-out"); q.classList.add("fx-scm-in"); }
        else if (q.dataset.key === prev && prev !== state) { q.classList.remove("fx-scm-in"); q.classList.add("fx-scm-out"); }
        else if (!q.classList.contains("fx-scm-out")) q.remove();
      });
      overlay?.classList.toggle("fx-scm-blur", state !== home);
      head?.classList.toggle("fx-scm-on", !!p.dataset.title);
      if (title) title.textContent = p.dataset.title || "";
      confirm?.classList.toggle("fx-scm-on", p.hasAttribute("data-confirm"));
      clearTimeout(holdTimer);
      if (p.dataset.next) holdTimer = setTimeout(() => go(p.dataset.next), +(p.dataset.hold || 1000));
      el.dispatchEvent(new CustomEvent("fx:state", { detail: { state, prev } }));
    };
    // Resting panels are removed from the document (leaving only a placeholder) and put back in place when entering — the panel that left is removed after the .2s fade ends
    const marks = new Map();
    panes.forEach((q) => {
      const m = document.createComment(`pane ${q.dataset.key || ""}`);
      q.before(m);
      marks.set(q, m);
      if (q.dataset.key !== home) q.remove();
      q.addEventListener("animationend", (e) => { if (e.target === q && q.classList.contains("fx-scm-out")) { q.classList.remove("fx-scm-out"); q.remove(); } });
    });

    const ac = new AbortController();
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b && el.contains(b) && !b.disabled) go(b.dataset.go); }, { signal: ac.signal });
    confirm?.addEventListener("click", () => el.dispatchEvent(new CustomEvent("fx:confirm", { detail: { state } })), { signal: ac.signal });
    el.addEventListener("fx:go", (e) => go(e.detail?.state || home), { signal: ac.signal });
    // Shake — .5s left and right to flag a wrongly filled field
    el.addEventListener("fx:shake", () => { box.classList.remove("fx-scm-shake"); void box.offsetWidth; box.classList.add("fx-scm-shake"); }, { signal: ac.signal });
    box.addEventListener("animationend", (e) => { if (e.animationName === "fxScmShake") box.classList.remove("fx-scm-shake"); }, { signal: ac.signal });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && state !== home) go(home); }, { signal: ac.signal });
    addEventListener("resize", () => { springs.y.to = yFor(byKey(state)); kick(); }, { signal: ac.signal });

    // Starts below the screen and rises into place after intro ms (the original is .4s after the 3D scene is ready) — if fx:ready is fired from outside, counting starts then
    let introTimer = 0;
    const rise = () => { clearTimeout(introTimer); introTimer = setTimeout(() => { shown = true; springs.y.to = yFor(byKey(state)); kick(); }, intro); };
    if (options.wait === "ready") el.addEventListener("fx:ready", rise, { once: true, signal: ac.signal });
    else rise();

    return () => {
      ac.abort(); cancelAnimationFrame(raf); clearTimeout(holdTimer); clearTimeout(introTimer);
      box.style.removeProperty("width"); box.style.removeProperty("height"); box.style.removeProperty("transform");
      panes.forEach((q) => { if (!q.isConnected) marks.get(q).after(q); marks.get(q).remove(); q.classList.remove("fx-scm-in", "fx-scm-out"); });
      overlay?.classList.remove("fx-scm-blur");
    };
  });
})();
