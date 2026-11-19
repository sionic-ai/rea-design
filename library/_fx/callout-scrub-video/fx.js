// While the tall panel (default 300svh) stays stuck to the screen, the scroll amount is filtered through a spring (stiffness 100 · damping 30),
// From that share it picks one video frame (24fps) and links the surrounding labels one by one. The reason for smoothing with a spring is so the video glides instead of jumping several frames per wheel tick
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  // Like the original useTransform, joins several nodes with straight lines and stops at both ends
  const map = (p, xs, ys) => {
    if (p <= xs[0]) return ys[0];
    for (let i = 1; i < xs.length; i++) if (p <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * ((p - xs[i - 1]) / (xs[i] - xs[i - 1] || 1));
    return ys[ys.length - 1];
  };
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("callout-scrub-video", (el, { options, reduce }) => {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const q = (p) => el.querySelector(`[data-fx-part="${p}"]`);
    const stage = q("stage");
    if (!stage) return;
    const video = q("video"), title = q("title"), status = q("status"), ring = q("ring"), checks = q("checks");
    const fps = +(options.fps || 24), k = +(options.stiffness || 100), c = +(options.damping ?? 30);
    const made = [];
    const callouts = [...el.querySelectorAll('[data-fx-part="callout"]')].map((n) => {
      const d = n.dataset, side = d.side === "left" ? "left" : "right";
      const t = { el: n, start: +d.start || 0, x: +d.x || 50, y: +d.y || 50, ly: +(d.ly ?? d.y), side, p: (+(d.ox ?? d.x)) + (side === "right" ? 12 : -12) };
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 100 56.25"); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("class", "fx-cs-lines"); svg.setAttribute("aria-hidden", "true");
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", t.x); line.setAttribute("y1", (9 * t.y) / 16); line.setAttribute("vector-effect", "non-scaling-stroke"); line.setAttribute("opacity", 0);
      svg.append(line);
      const dot = document.createElement("span"); dot.className = "fx-cs-dot"; dot.style.left = `${t.x}%`; dot.style.top = `${t.y}%`; dot.innerHTML = '<span class="fx-cs-pulse"></span><span class="fx-cs-core"></span>';
      const tag = document.createElement("span"); tag.className = "fx-cs-tag"; tag.dataset.side = side; tag.style.top = `${t.ly}%`;
      if (side === "right") tag.style.left = `${t.p}%`; else tag.style.right = `${100 - t.p}%`;
      tag.innerHTML = `<span class="fx-cs-check"><svg viewBox="0 0 16 16"><path d="M3.5 8.2 6.5 11 12.5 5" pathLength="1"/></svg></span><span class="fx-cs-name"></span>`;
      tag.querySelector(".fx-cs-name").textContent = n.textContent.trim();
      n.setAttribute("aria-hidden", "true");
      n.append(svg, dot, tag);
      made.push(svg, dot, tag);
      t.line = line; t.dot = dot; t.pulse = dot.firstChild; t.tag = tag; t.check = tag.querySelector("path"); t.fill = tag.firstChild;
      if (checks) {
        const it = document.createElement("span"); it.className = "fx-cs-item";
        it.innerHTML = '<span class="fx-cs-tick"><span></span><svg viewBox="0 0 16 16"><path d="M3.5 8.2 6.5 11 12.5 5"/></svg></span><span class="fx-cs-label"></span>';
        it.querySelector(".fx-cs-label").textContent = n.dataset.name || n.textContent.trim().split(" ")[0];
        checks.append(it); made.push(it);
        t.item = it; t.tick = it.querySelector("svg");
      }
      return t;
    });

    let frames = 0;
    const meta = () => { if (video && Number.isFinite(video.duration) && video.duration > 0) frames = Math.max(1, Math.round(fps * video.duration)); };
    let lastFrame = -1;
    const seek = (p) => {
      if (!video || !frames) return;
      const f = Math.min(frames - 1, Math.floor(p * frames));
      if (f === lastFrame) return;
      lastFrame = f;
      try { video.currentTime = (f + 0.5) / fps; } catch (e) { /* Unread video */ }
    };
    video?.addEventListener("loadedmetadata", () => { meta(); lastFrame = -1; seek(x); });
    if (video?.readyState >= 1) meta();

    let state = null;
    // Sets the pill width to the current text width — only when switching between Building ↔ Done does css stretch it over .45s (original animate width). If a late font changes the width, it applies immediately
    const setW = (animate) => {
      if (!status) return;
      const now = status.querySelector(`[data-fx-part="status-${state === "done" ? "done" : "busy"}"]`);
      if (!now) return;
      const cs = getComputedStyle(status);
      if (!animate) status.style.transition = "none";
      status.style.width = `${now.scrollWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth)}px`;
      if (!animate) { status.getBoundingClientRect(); status.style.transition = ""; }
    };
    const sro = status && "ResizeObserver" in window ? new ResizeObserver(() => setW(false)) : null;
    status?.querySelectorAll('[data-fx-part="status-busy"], [data-fx-part="status-done"]').forEach((n) => sro.observe(n));
    const paint = (r) => {
      if (title) { title.style.opacity = map(r, [0, 0.25], [1, 0]); title.style.transform = `translateY(${map(r, [0, 0.25], [0, -24])}px)`; }
      for (const t of callouts) {
        const i = t.start;
        const g = map(r, [i + 0.01, i + 0.055], [0, 1]);
        t.dot.style.opacity = map(r, [i, i + 0.025], [0, 1]);
        t.pulse.style.opacity = map(r, [i, i + 0.025, i + 0.09], [0, 0.45, 0]);
        t.pulse.style.transform = `scale(${map(r, [i, i + 0.09], [0.6, 2.4])})`;
        t.line.setAttribute("x2", reduce ? t.p : t.x + (t.p - t.x) * g);
        t.line.setAttribute("y2", (9 * (reduce ? t.ly : t.y + (t.ly - t.y) * g)) / 16);
        t.line.setAttribute("opacity", g);
        const b = map(r, [i + 0.055, i + 0.1], [0, 1]);
        t.tag.style.opacity = b;
        t.tag.style.transform = `translateY(-50%) scale(${reduce ? 1 : map(r, [i + 0.055, i + 0.1], [0.96, 1])})`;
        const j = map(r, [i + 0.065, i + 0.1], [0, 1]);
        t.check.style.strokeDashoffset = 1 - j;
        t.fill.style.setProperty("--fx-k", `${j * 100}%`);
        if (t.item) { t.item.style.opacity = map(r, [i, i + 0.1], [0.35, 1]); t.tick.style.opacity = j; }
      }
      if (status) {
        status.style.opacity = map(r, [0.28, 0.38], [0, 1]);
        status.style.transform = `translateY(${reduce ? 0 : map(r, [0.28, 0.38], [-16, 0])}px)`;
        if (checks) checks.style.opacity = status.style.opacity;
        ring?.style.setProperty("stroke-dashoffset", 1 - map(r, [0.28, 0.78], [0, 1]));
        const m = r < 0.28 ? -1 : callouts.filter((t) => r >= t.start + 0.1).length;
        const s = m === callouts.length ? "done" : m >= 0 ? "busy" : "off";
        if (s !== state) {
          const was = state;
          state = s; status.dataset.state = s; status.toggleAttribute("inert", s === "off");
          setW((was === "done") !== (s === "done") && was !== null);
          el.dispatchEvent(new CustomEvent("fx:state", { detail: { state: s } }));
        }
      }
      seek(r);
    };

    // Spring — integrated in 1ms substeps so it follows like the original (motion useSpring, restDelta .001)
    let x = 0, v = 0, target = 0, last = 0, running = false;
    const tick = () => {
      const now = performance.now();
      if (!last) last = now;
      let dt = Math.max(1, Math.min(64, now - last)); last = now;
      for (; dt > 0; dt -= 1) { const a = k * (target - x) - c * v; v += a * 0.001; x += v * 0.001; }
      if (Math.abs(target - x) < 0.001 && Math.abs(v) < 0.001) { x = target; v = 0; running = false; gsap.ticker.remove(tick); last = 0; }
      paint(clamp(x));
    };
    const st = ScrollTrigger.create({
      trigger: el, start: "top top", end: "bottom bottom",
      onUpdate: (self) => {
        target = self.progress;
        if (reduce) { x = target; paint(x); return; }
        if (!running) { running = true; last = 0; gsap.ticker.add(tick); }
      },
    });
    x = target = st.progress; paint(x);
    return () => {
      st.kill(); gsap.ticker.remove(tick); sro?.disconnect();
      made.forEach((n) => n.remove());
      callouts.forEach((t) => t.el.removeAttribute("aria-hidden"));
      [title, status, checks].forEach((n) => n && n.removeAttribute("style"));
      status?.removeAttribute("data-state"); status?.removeAttribute("inert");
    };
  });
})();
