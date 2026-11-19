(() => {
  kfFx.register("scatter-orbit-zoom", (el, { options, reduce }) => {
    const blocks = [...el.querySelectorAll("[data-fx-part=block]")];
    const n = blocks.length;
    if (n < 2) return;
    const labels = [...el.querySelectorAll("[data-fx-part=label]")];
    const bar = el.querySelector("[data-fx-part=bar]");
    const count = el.querySelector("[data-fx-part=count]"), total = el.querySelector("[data-fx-part=total]");
    const prev = el.querySelector("[data-fx-part=prev]"), next = el.querySelector("[data-fx-part=next]");
    const every = +options.interval || 5000, start = +(options.start ?? 1000);
    const zoomAt = +(options["zoom-delay"] ?? 600), hold = +(options.hold ?? 3200);
    const pad = (k) => String(k).padStart(2, "0");
    const ac = new AbortController(), signal = ac.signal;
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };
    el.style.setProperty("--fx-interval", `${every}ms`);

    // Like the original, chunk i starts at slot i, ”Now” stays in the last cell, and on the first advance chunk 0 expands without moving position
    let cur = n - 1, at = 0, auto = null;
    blocks.forEach((b, i) => b.setAttribute("data-pos", b.dataset.pos ?? String(i)));
    const bullets = bar ? blocks.map((_, i) => { const s = document.createElement("span"); s.className = "fx-orbit-dot"; s.setAttribute("aria-label", `${i + 1}Nth`); bar.append(s); return s; }) : [];
    const paint = () => {
      labels.forEach((l, i) => l.classList.toggle("is-active", i === cur));
      bullets.forEach((b, i) => b.classList.toggle("is-active", i === cur));
      if (count) count.textContent = pad(cur + 1);
      el.setAttribute("data-orbit-at", String(cur));
    };
    if (total) total.textContent = pad(n);
    paint();

    const go = (to) => {
      if (to === cur) return;
      const off = to - at;
      at = to;
      blocks.forEach((b) => b.setAttribute("data-pos", String((((+b.dataset.pos - off) % n) + n) % n)));
      blocks[cur].classList.remove("is-active");
      blocks[to].classList.add("is-active");
      cur = to;
      paint();
      if (reduce) return;
      const b = blocks[cur];
      later(() => { b.classList.add("is-zoom"); later(() => b.classList.remove("is-zoom"), hold); }, zoomAt);
    };
    const stop = () => clearInterval(auto);
    const run = () => { stop(); if (!reduce) auto = setInterval(() => go((cur + 1) % n), every); };
    const step = (d) => { go((cur + d + n) % n); run(); };
    prev?.addEventListener("click", () => step(-1), { signal });
    next?.addEventListener("click", () => step(1), { signal });
    bar?.addEventListener("click", (e) => { const k = bullets.indexOf(e.target); if (k >= 0) { go(k); run(); } }, { signal });
    document.addEventListener("visibilitychange", () => (document.visibilityState === "visible" ? run() : stop()), { signal });

    if (reduce) go(0);
    else later(() => { go(0); run(); }, start);
    return () => {
      ac.abort();
      stop();
      timers.forEach(clearTimeout);
      bullets.forEach((b) => b.remove());
      blocks.forEach((b) => b.classList.remove("is-zoom", "is-active"));
    };
  });
})();
