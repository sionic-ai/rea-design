// Platform scene: background video spot (number dots drift slowly), turn on the center of the numbered list, horizontal step pinned scroll
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original is a video behind the page (opacity .3) — in the same spot our own drawing: small square dots + numbers + thin lines between neighbors drifting slowly
  const svg = document.querySelector(".os__drift");
  if (svg) {
    const NS = "http://www.w3.org/2000/svg";
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pts = Array.from({ length: 22 }, () => ({ x: rnd() * 1440, y: rnd() * 900, vx: (rnd() - 0.5) * 6, vy: (rnd() - 0.5) * 4, n: (rnd() * 900).toFixed(1) }));
    const lines = pts.map(() => { const l = document.createElementNS(NS, "line"); l.setAttribute("stroke", "currentColor"); l.setAttribute("stroke-width", "0.6"); svg.append(l); return l; });
    const marks = pts.map((p) => {
      const g = document.createElementNS(NS, "g");
      g.innerHTML = `<rect width="6" height="6" x="-3" y="-3" fill="currentColor"/><text x="8" y="3" font-size="10" fill="currentColor">${p.n}</text>`;
      svg.append(g);
      return g;
    });
    const draw = (dt) => {
      pts.forEach((p, i) => {
        p.x = (p.x + p.vx * dt + 1440) % 1440;
        p.y = (p.y + p.vy * dt + 900) % 900;
        marks[i].setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
        const q = pts[(i + 3) % pts.length];
        const near = Math.hypot(q.x - p.x, q.y - p.y) < 380;
        lines[i].setAttribute("x1", p.x); lines[i].setAttribute("y1", p.y); lines[i].setAttribute("x2", q.x); lines[i].setAttribute("y2", q.y);
        lines[i].setAttribute("opacity", near ? "0.8" : "0");
      });
    };
    draw(0);
    if (!reduce) gsap.ticker.add((t, d) => draw(Math.min(d, 50) / 1000));
  }

  // Original useCenterActivation — lights up through the last row whose center has passed the window center
  document.querySelectorAll("[data-center-rows]").forEach((root) => {
    const rows = [...root.querySelectorAll("ol li")];
    const tick = () => {
      const mid = innerHeight / 2;
      let on = 0;
      rows.forEach((r, i) => { const b = r.getBoundingClientRect(); if (b.top + b.height / 2 <= mid) on = i; });
      rows.forEach((r, i) => r.classList.toggle("is-on", i <= on));
    };
    addEventListener("scroll", tick, { passive: true });
    tick();
  });

  // Original HowItWorksSteps — section height n×100vh, ratio w = −top/(height−window), the row is −w×(overflow width+260)px, step line = clamp((w·n − i)×100)
  document.querySelectorAll("[data-hsteps]").forEach((root) => {
    const view = root.querySelector(".os-steps__view");
    const row = root.querySelector(".os-steps__row");
    const steps = [...root.querySelectorAll(".os-step")];
    const n = steps.length;
    const wide = matchMedia("(min-width: 768px)");
    const size = () => { root.style.height = wide.matches && !reduce ? `${n * 100}vh` : ""; };
    const tick = () => {
      if (!wide.matches || reduce) { row.style.transform = ""; steps.forEach((s) => s.classList.add("is-on")); return; }
      const r = root.getBoundingClientRect();
      const span = r.height - innerHeight;
      const w = span <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / span));
      const over = Math.max(0, row.scrollWidth - view.clientWidth);
      row.style.transform = `translateX(${-(w * (over + 260))}px)`;
      const y = w * n;
      const now = Math.min(n - 1, Math.floor(y));
      steps.forEach((s, i) => {
        const fill = Math.min(100, Math.max(0, (y - i) * 100));
        s.querySelector(".os-step__bar i").style.width = `${fill}%`;
        s.querySelector(".os-step__bar b").style.left = `${fill}%`;
        s.classList.toggle("is-on", i <= now);
        s.classList.toggle("is-now", i === now);
      });
    };
    size();
    wide.addEventListener("change", () => { size(); tick(); });
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    tick();
  });
})();
