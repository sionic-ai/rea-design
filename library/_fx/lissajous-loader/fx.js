// Loading cover running a 2:3 Lissajous — once everything has loaded, it lifts with a fade after a hold (Brand boot cover values)
(() => {
  kfFx.register("lissajous-loader", (root, { options, reduce }) => {
    const made = [];
    const mk = (part, tag) => {
      let n = root.querySelector(`[data-fx-part="${part}"]`);
      if (!n) { n = document.createElement(tag); n.setAttribute("data-fx-part", part); root.append(n); made.push(n); }
      return n;
    };
    const cv = mk("curve", "canvas"), bar = mk("bar", "div");
    let fill = bar.querySelector("i");
    if (!fill) { fill = document.createElement("i"); bar.append(fill); made.push(fill); }
    const a = +(options.a || 2), b = +(options.b || 3), speed = +(options.speed ?? 0.5);
    const hold = +(options.hold ?? 0.18) * 1000, fade = +(options.fade ?? 0.5), max = +(options.max ?? 20) * 1000;
    root.style.setProperty("--fx-fade", `${fade}s`);
    const g = cv.getContext("2d");
    const dpr = Math.min(2, devicePixelRatio || 1), W = 300 * dpr, H = 150 * dpr;
    cv.width = W; cv.height = H;
    const jobs = { total: 0, done: 0 };
    const wait = (p) => { jobs.total++; Promise.resolve(p).catch(() => {}).finally(() => jobs.done++); };
    wait(new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true }))));
    wait(document.fonts?.ready);
    const onWait = (e) => wait(e.detail);
    root.addEventListener("fx:wait", onWait);
    let raf = 0, t0 = 0, fin = 0, closed = false, gone = 0;
    const close = () => {
      if (closed) return;
      closed = true;
      root.classList.add("is-done");
      root.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
      gone = setTimeout(() => { cancelAnimationFrame(raf); root.hidden = true; }, fade * 1000 + 20);
    };
    const cap = setTimeout(close, max);
    const path = (ph) => {
      g.beginPath();
      for (let i = 0; i <= 1400; i++) {
        const t = (i / 1400) * Math.PI * 2;
        const x = W / 2 + 0.4 * W * Math.cos(a * t + ph), y = H / 2 + 0.34 * H * Math.sin(b * t);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
    };
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      t0 ||= now;
      const ph = reduce ? 0 : ((now - t0) / 1000) * speed;
      const ink = getComputedStyle(root).color;
      g.clearRect(0, 0, W, H);
      g.lineJoin = g.lineCap = "round";
      g.strokeStyle = ink;
      g.save(); g.shadowColor = ink; g.shadowBlur = 16 * dpr; g.globalAlpha = 0.55; g.lineWidth = 3.2 * dpr; path(ph); g.stroke(); g.restore();
      g.lineWidth = 1.7 * dpr; path(ph); g.stroke();
      const all = jobs.total > 0 && jobs.done >= jobs.total;
      fill.style.transform = `scaleX(${all ? 1 : jobs.total ? jobs.done / jobs.total : 0})`;
      if (all && !fin) fin = now;
      if (fin && now - fin > (reduce ? 0 : hold)) close();
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(cap); clearTimeout(gone);
      root.removeEventListener("fx:wait", onWait);
      made.forEach((n) => n.remove());
      root.classList.remove("is-done");
      root.hidden = false;
      root.style.removeProperty("--fx-fade");
    };
  });
})();
