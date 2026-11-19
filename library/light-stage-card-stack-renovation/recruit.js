// Careers — keyword card strip (45s per loop, cards on screen flip to the front), job photo strip (60s per loop), office photo slider
(() => {
  const { isPc, reduce } = window.rbSite;

  // ── Keyword strip: mixes order, photos and flips, and duplicates the first six cards at the end so it loops seamlessly ──
  const kw = document.querySelector(".rb-kw");
  if (kw) {
    const group = kw.querySelector(".rb-kw__group");
    const items = [...group.querySelectorAll(".rb-kw__item")];
    items.sort(() => Math.random() - 0.5);
    group.append(...items);
    for (let i = 0; i < items.length && i < 6; i++) { const c = items[i].cloneNode(true); c.setAttribute("aria-hidden", "true"); group.append(c); }
    const pc = isPc();
    let pos = 0;
    const all = [...group.querySelectorAll(".rb-kw__item")].map((el) => { const r = { el, img: el.querySelector(".rb-kw__img"), w: pc ? 270 : 135, x: pos, in: false }; pos += pc ? 300 : 150; return r; });
    const LOOP = 45000, DIST = pc ? 3600 : 1800, VIEW = pc ? 1440 : 375, EDGE = pc ? 0.885 : 0.85;
    let t = 0, last = performance.now(), run = false, wrap = false;
    const frame = () => {
      if (!run) return;
      if (wrap) { wrap = false; kw.classList.add("is-noduration"); }
      else kw.classList.remove("is-noduration");
      const now = performance.now(); t += now - last; last = now;
      if (t >= LOOP) { t %= LOOP; wrap = true; }
      const off = DIST * (t / LOOP);
      group.style.transform = `translateX(${-off / 10}rem)`;
      all.forEach((r) => {
        const p = (r.x - off + r.w) / (VIEW + r.w);
        r.img.style.transform = `translateX(${66.66 * (1 - p)}%)`;
        const inside = p >= 0 && p < EDGE;
        if (inside !== r.in) { r.in = inside; r.el.classList.toggle("is-in", inside); }
      });
      requestAnimationFrame(frame);
    };
    if (reduce) all.forEach((r) => r.el.classList.add("is-in"));
    else ScrollTrigger.create({
      trigger: kw, start: "top bottom", end: "bottom top",
      onToggle: (st) => { run = st.isActive; if (run) { last = performance.now(); requestAnimationFrame(frame); } },
    });
  }

  // ── Job photo strip: one large photo and two small ones stagger and loop once every 60s, photos inside cells shift left as they pass ──
  const cv = document.querySelector(".rb-career__visual");
  if (cv && !reduce) {
    const group = cv.querySelector(".rb-career__group");
    const pc = isPc();
    [...group.children].forEach((c) => { const d = c.cloneNode(true); d.setAttribute("aria-hidden", "true"); group.append(d); });
    let pos = 0;
    const imgs = [...group.querySelectorAll(".rb-career__img")].map((el, i) => {
      const w = pc ? (i % 3 === 0 ? 540 : 270) : (i % 3 === 0 ? 270 : 135);
      const r = { ph: el.querySelector(".rb-ph"), w, x: pos };
      pos += i % 3 === 0 ? (pc ? 570 : 285) : (pc ? 300 : 150);
      return r;
    });
    const LOOP = 60000, DIST = pc ? 4680 : 2340, VIEW = pc ? 1440 : 375;
    let t = 0, last = performance.now(), run = false;
    const frame = () => {
      if (!run) return;
      const now = performance.now(); t = (t + now - last) % LOOP; last = now;
      const off = DIST * (t / LOOP);
      group.style.transform = `translateX(${-off / 10}rem)`;
      imgs.forEach((r) => { const p = (r.x - off + r.w) / (VIEW + r.w); if (p >= 0 && p <= 1) r.ph.style.transform = `translateX(${-42.857143 * p}%)`; });
      requestAnimationFrame(frame);
    };
    ScrollTrigger.create({ trigger: cv, start: "top bottom", end: "bottom top", onToggle: (st) => { run = st.isActive; if (run) { last = performance.now(); requestAnimationFrame(frame); } } });
  }

})();
