// Ability ring and ROI calculator — passes progress between sections to the scene (scene.js)
(() => {
  const { reduce, handheld } = window.IM;

  // ───── Skill ring — when the big sentence leaves, the top-left title and ring turn on, and the dots grow into pills one by one ─────
  const sk = document.querySelector(".im-skills"), copy = sk.querySelector(".im-skills__copy"), heading = sk.querySelector(".im-skills__heading");
  const ring = sk.querySelector(".im-skills__ring"), pins = [...ring.querySelectorAll(".im-pin")];
  const place = () => {
    const rx = Math.min(innerWidth * 0.3, 520), ry = Math.min(innerHeight * 0.3, 280);
    pins.forEach((p, i) => {
      const a = -Math.PI / 2 + (i / pins.length) * Math.PI * 2;
      p.style.left = `calc(50% + ${Math.cos(a) * rx}px)`; p.style.top = `calc(54% + ${Math.sin(a) * ry}px)`;
      p.style.transform = "translate(-50%, -50%)";
    });
  };
  place(); addEventListener("resize", place);
  // The pill follows a point on the octopus leg — computed only while the field is on screen
  const ARM = [[7, 0.34], [0, 0.42], [1, 0.5], [2, 0.38], [3, 0.46], [4, 0.54], [5, 0.4], [6, 0.48]];
  if (!reduce && !handheld) gsap.ticker.add(() => {
    const r = sk.getBoundingClientRect();
    if (r.bottom < -innerHeight || r.top > innerHeight * 2 || !window.IMScene?.armPoint) return;
    const ringBox = ring.getBoundingClientRect();
    pins.forEach((p, i) => {
      const a = window.IMScene.armPoint(ARM[i][0], ARM[i][1]);
      p.style.left = `${a.x - ringBox.left}px`; p.style.top = `${a.y - ringBox.top}px`;
      p.style.visibility = a.front ? "" : "hidden";
    });
  });
  if (reduce || handheld) {
    gsap.set([heading, ring], { opacity: 1 });
    pins.forEach((p) => p.setAttribute("data-on", ""));
  } else {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: sk, start: "top top", end: "bottom top", scrub: true },
      onUpdate: () => { const t = tl.progress(); pins.forEach((p, i) => p.toggleAttribute("data-on", t > 0.4 + i * 0.04)); },
    });
    tl.to(copy, { opacity: 0, filter: "blur(6px)", duration: 0.3, ease: "power1.in" }, 0.15);
    tl.to([heading, ring], { opacity: 1, duration: 0.25, ease: "power1.out" }, 0.35);
    tl.add(() => {}, 1);
  }

  // ───── ROI — drag a bar and only that row stays sharp (the rest .2) while the four results update instantly ─────
  const roi = document.querySelector(".im-roi"), rows = roi.querySelector(".im-roi__rows"), ranges = [...roi.querySelectorAll(".im-roi__range")];
  const out = Object.fromEntries([...roi.querySelectorAll("[data-out]")].map((d) => [d.dataset.out, d]));
  let cur = "€";
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const compact = (n) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));
  const calc = () => {
    const v = Object.fromEntries(ranges.map((r) => [r.dataset.key, +r.value]));
    ranges.forEach((r) => {
      const p = (r.value - r.min) / (r.max - r.min);
      r.parentElement.style.setProperty("--p", p.toFixed(4));
      const b = r.parentElement.querySelector(".im-roi__bubble");
      b.textContent = r.dataset.key === "share" ? `${r.value}%` : r.dataset.key === "db" ? compact(+r.value) : r.dataset.key === "salary" ? `${cur}${compact(+r.value)}` : r.value;
    });
    // Placeholder formula — tuned so the original defaults (50·45%·85K·500K·20 days·35) produce the original results (18,000·45·11,812,500·300%).
    const hours = v.people * 2000 * (v.share / 100) * 0.4;
    const campaigns = Math.round(hours / (v.days * 20));
    const revenue = campaigns * v.db * v.rev * 0.015;
    const roiPct = Math.round((revenue / (v.people * v.salary)) * 2) * 50;
    out.hours.textContent = `${fmt(hours)} hrs`;
    out.campaigns.textContent = fmt(campaigns);
    out.revenue.textContent = `${cur}${fmt(revenue)}`;
    out.roi.textContent = `${fmt(roiPct)} %`;
  };
  ranges.forEach((r) => {
    const row = r.closest(".im-roi__row");
    const on = () => { rows.classList.add("is-active"); row.classList.add("is-on"); };
    const off = () => { rows.classList.remove("is-active"); row.classList.remove("is-on"); };
    r.addEventListener("input", calc);
    r.addEventListener("pointerdown", on); r.addEventListener("focus", on);
    r.addEventListener("pointerup", off); r.addEventListener("blur", off); r.addEventListener("pointercancel", off);
  });
  roi.querySelectorAll(".im-roi__cur").forEach((b) => b.addEventListener("click", () => {
    roi.querySelectorAll(".im-roi__cur").forEach((x) => x.classList.toggle("is-on", x === b));
    cur = b.dataset.cur; calc();
  }));
  calc();

  // ───── Scene progress — evenly 0→1 between the section anchors (#intro … #calc) (original sceneNorm) ─────
  const anchors = ["#intro", "#s-1", "#s-2", "#s-3", "#s-4", "#skills", "#calc", "#outro"].map((s) => document.querySelector(s));
  const tone = document.querySelector('[data-tone="dark"]');
  let marks = [];
  const measure = () => (marks = anchors.map((a) => a.getBoundingClientRect().top + scrollY));
  measure(); addEventListener("resize", measure); new ResizeObserver(measure).observe(document.documentElement);
  gsap.ticker.add(() => {
    const y = window.IM.scrollY() + innerHeight * 0.5;
    const n = marks.length - 1;
    let t = 0;
    if (y >= marks[n]) t = 1;
    else if (y > marks[0]) { let i = 0; while (i < n - 1 && y >= marks[i + 1]) i++; t = (i + (y - marks[i]) / (marks[i + 1] - marks[i])) / n; }
    // Light section — the stage flips to light near the center of that section’s cell
    const tr = tone.getBoundingClientRect(), mid = (tr.top + tr.bottom) / 2, light = Math.min(1, Math.max(0, (innerHeight * 1.9 - Math.abs(mid - innerHeight / 2)) / (innerHeight * 0.9)));
    window.IMScene?.set(t, light);
  });
})();
