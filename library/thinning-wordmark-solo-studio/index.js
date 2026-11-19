/* Home page: measuring logo strip length, words that light up on scroll, process card line drawing and entrance */
(() => {
  const { reduce } = window.dv;

  // Logo strip: one set cloned three more times to make four, the length of two sets (px) written into --shift and flowing that far over 32s
  document.querySelectorAll("[data-logo-track]").forEach((track) => {
    const one = [...track.children];
    for (let k = 0; k < 3; k++) one.forEach((li) => { const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); });
    const kids = track.children, n = kids.length / 4;
    let shift = 0;
    const measure = () => {
      const s = kids[n * 2].offsetLeft - kids[0].offsetLeft;
      if (s && s !== shift) { shift = s; track.style.setProperty("--shift", `${s}px`); track.removeAttribute("data-ready"); void track.offsetWidth; track.setAttribute("data-ready", ""); }
    };
    document.fonts.ready.then(measure);
    new ResizeObserver(measure).observe(track);
  });

  // Word lighting: lit from the front by (screen 85% − header) / (height + screen 40%)
  document.querySelectorAll("[data-word-reveal]").forEach((el) => {
    const words = [];
    const split = (node) => {
      const t = (node.textContent ?? "").trim().split(/\s+/);
      node.setAttribute("aria-label", t.join(" "));
      node.innerHTML = t.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
      words.push(...node.querySelectorAll(".w"));
    };
    const ps = el.querySelectorAll(":scope > p");
    ps.length ? ps.forEach(split) : split(el);
    if (reduce) { words.forEach((w) => w.classList.add("on")); return; }
    let busy = false;
    const f = () => {
      busy = false;
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const a = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.4))), on = Math.round(a * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < on));
    };
    addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(f); } }, { passive: true });
    f();
  });

  // Process card: a curve from off-screen left passing through each card center in turn to off-screen right, drawn from when the panel reaches 80% of the screen.
  // Cards enter at 30% visible, .1s apart, bouncing for .7s
  document.querySelectorAll("[data-how]").forEach((sec) => {
    const list = sec.querySelector("[data-how-cards]"), cards = [...sec.querySelectorAll("[data-how-card]")], path = sec.querySelector("[data-how-path]");
    if (!list || !path) return;
    let len = 0;
    const draw = () => {
      if (reduce) { path.style.strokeDashoffset = "0"; return; }
      const r = list.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / Math.max(1, r.height - vh * 0.05)));
      path.style.strokeDashoffset = `${len * (1 - p)}`;
    };
    const build = () => {
      const pts = cards.map((c) => ({ x: c.offsetLeft + c.offsetWidth / 2, y: c.offsetTop + c.offsetHeight / 2 }));
      if (!pts.length) return;
      const left = -sec.getBoundingClientRect().left - 4, right = innerWidth + left + 8;
      const a = pts[0], sy = a.y - 100, dx = a.x - left;
      let d = `M ${left} ${sy} C ${left + dx * 0.5} ${sy}, ${a.x - dx * 0.5} ${a.y}, ${a.x} ${a.y}`;
      for (let i = 1; i < pts.length; i++) { const p = pts[i - 1], q = pts[i], w = q.x - p.x; d += ` C ${p.x + w * 0.5} ${p.y}, ${q.x - w * 0.5} ${q.y}, ${q.x} ${q.y}`; }
      const z = pts[pts.length - 1], ey = z.y + 100, ex = right - z.x;
      d += ` C ${z.x + ex * 0.5} ${z.y}, ${right - ex * 0.5} ${ey}, ${right} ${ey}`;
      path.setAttribute("d", d);
      len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      draw();
    };
    let busy = false;
    addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(() => { busy = false; draw(); }); } }, { passive: true });
    new ResizeObserver(build).observe(sec);
    addEventListener("resize", build);
    document.fonts.ready.then(build);
    if (reduce) return;
    list.classList.add("armed");
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); list.classList.add("in"); setTimeout(() => list.classList.add("done"), 1200); } }, { threshold: 0.3 });
    io.observe(list);
  });
})();
