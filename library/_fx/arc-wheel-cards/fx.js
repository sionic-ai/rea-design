(() => {
  // Original main-visual: card i’s slot n (difference from the current section, wrapped in a ring) is placed around the wheel at n×step each.
  // Cards outside the visible range (±side) stand transparent at an outer position so they ride in on the wheel when they enter
  kfFx.register("arc-wheel-cards", (el, { options, reduce }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const N = cards.length;
    if (N < 2) return;
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const step = +(options.step ?? 12), delay = reduce ? 0 : +(options.delay ?? 3000);
    const per = +options.per || 4, perMid = +options["per-mid"] || 2, phone = +(options.phone ?? 0.85);
    const ratio = +options.ratio || 460 / 330, pad = +(options.pad ?? 110);
    const ac = new AbortController(), on = (t, ev, fn, o = {}) => t.addEventListener(ev, fn, { ...o, signal: ac.signal });
    let cur = 0, w = 0, h = 0, R = 0, side = 2, timer = 0, startX = null, alive = true;
    const layout = () => {
      const W = el.clientWidth || innerWidth;
      side = W >= 1280 ? 2 : 1;
      w = W <= 768 ? W * phone : W <= 1280 ? W / perMid - 12 : W / per - 12;
      h = w * ratio;
      const s = W <= 768 ? Math.sin(Math.PI * 2 * (3.5 / 180)) : Math.sin((Math.PI * 2) / (30 / side));
      R = W / 2 / s + h / 2;
      const a = (Math.PI * side * step) / 180;
      el.style.height = `${h + R * (1 - Math.cos(a)) + pad}px`;
      place();
    };
    const place = () => {
      cards.forEach((c, i) => {
        let n = (((i - cur) % N) + N) % N;
        if (n > N / 2) n -= N;
        n = Math.min(n, side + 1);
        if (n < -(side + 1)) n = side + 1;
        let r = n * step;
        const rad = (Math.PI * r) / 180;
        let y = R * (1 - Math.cos(rad));
        const x = R * Math.sin(rad) - w / 2;
        if (n < -side) { r = -r; y = 0; }
        if (n > side) r = 0;
        c.style.width = `${w}px`;
        c.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
        c.style.opacity = Math.abs(n) < side + 1 ? "1" : "0";
        c.style.zIndex = String(10 - Math.abs(n));
      });
      dots.forEach((d, i) => d.classList.toggle("is-active", i === cur));
    };
    const go = (d) => { cur = (cur + d + N) % N; place(); };
    const goTo = async (t) => {
      const diff = t - cur, k = Math.abs(diff), dir = Math.sign(diff);
      if (k <= 1) { cur = t; place(); return; }
      el.classList.add("is-fx-fast");
      for (let i = 0; i < k && alive; i++) { go(dir); await new Promise((r) => setTimeout(r, 100)); }
      el.classList.remove("is-fx-fast");
    };
    const play = () => { if (delay && !timer) timer = setInterval(() => go(1), delay); };
    const stop = () => { clearInterval(timer); timer = 0; };
    dots.forEach((d, i) => on(d, "click", () => goTo(i)));
    const down = (e) => { if (e.target.closest('[data-fx-part="dot"]')) return; if (e.type === "mousedown") e.preventDefault(); startX = e.touches ? e.touches[0].clientX : e.clientX; stop(); el.classList.remove("is-fx-fast"); };
    const up = (e) => {
      if (startX == null) return;
      const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX, d = startX - x;
      startX = null;
      if (Math.abs(d) > 50) go(d > 0 ? 1 : -1);
      if (!el.matches(":hover")) play();
    };
    on(el, "mousedown", down);
    on(el, "touchstart", down, { passive: true });
    on(document, "mouseup", up);
    on(document, "touchend", up);
    on(el, "mouseenter", stop);
    on(el, "mouseleave", play);
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    layout();
    play();
    return () => {
      alive = false; ac.abort(); ro.disconnect(); stop();
      el.classList.remove("is-fx-fast"); el.style.removeProperty("height");
      cards.forEach((c) => ["width", "transform", "opacity", "z-index"].forEach((p) => c.style.removeProperty(p)));
      dots.forEach((d) => d.classList.remove("is-active"));
    };
  });
})();
