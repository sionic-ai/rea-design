// Product detail: the packaging graphic blooms from the center outward (original Rive hero spot — power3.out 1.2s, delayed by distance) and sways slowly,
// The strength badge text ring turns once in 20s. Concentric-circle tabs swap description · numbers by pushing them up at .5s expo.out. The fragment panel photo goes −20° → 20° with scroll, yPercent 40 → −40
(() => {
  const DC = window.DC;
  const NS = "http://www.w3.org/2000/svg";
  const art = document.querySelector(".dt-art");
  const el = (tag, attrs, parent = art) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent.append(e); return e; };
  // Two large triangle lines (from the top center vertex to both bottom corners)
  el("path", { class: "ln", d: "M720 -40 L80 940" });
  el("path", { class: "ln", d: "M720 -40 L1360 940" });
  // Leaf, flower and fruit clusters — keep the center text area (460~980 × 180~720) empty. Positions are set by index, so they are the same every time it opens
  const rnd = (i, k) => { const n = Math.sin((i + 1) * (k + 3) * 78.233) * 43758.5453; return n - Math.floor(n); };
  const shapes = [];
  for (let i = 0; i < 46; i++) {
    let x = rnd(i, 1) * 1440, y = rnd(i, 2) * 900;
    if (x > 440 && x < 1000 && y > 160 && y < 740) x = x < 720 ? x - 360 : x + 360;
    const s = 22 + rnd(i, 3) * 46, r = rnd(i, 4) * 360, kind = i % 4;
    const g = el("g", { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${(s / 40).toFixed(2)})` });
    const inner = el("g", { transform: `rotate(${r.toFixed(0)})` }, g);
    if (kind === 0) { // Four petals
      for (let p = 0; p < 4; p++) el("ellipse", { class: "c1", cx: 0, cy: -18, rx: 11, ry: 18, transform: `rotate(${p * 90})` }, inner);
      for (let d = 0; d < 6; d++) el("circle", { class: "dot", cx: (rnd(i, d + 5) - .5) * 30, cy: (rnd(i, d + 9) - .5) * 30, r: 1.6 }, inner);
    } else if (kind === 1) { // Fruit
      el("ellipse", { class: "c2", rx: 16, ry: 20 }, inner);
      el("path", { class: "c3", d: "M-2 -18 C2 -6 2 6 -2 18 L1 18 C5 6 5 -6 1 -18Z" }, inner);
    } else if (kind === 2) { // Long leaf
      el("path", { class: "c3", d: "M0 -42 C18 -20 18 20 0 42 C-18 20 -18 -20 0 -42Z" }, inner);
    } else { // Round leaf
      el("path", { class: "c4", d: "M0 -26 C20 -26 26 0 0 26 C-26 0 -20 -26 0 -26Z" }, inner);
    }
    shapes.push({ g: inner, x, y });
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const far = (s) => Math.hypot(s.x - 720, s.y - 450) / 850;
    gsap.set(shapes.map((s) => s.g), { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
    DC.ready.then(() => {
      shapes.forEach((s) => gsap.to(s.g, { scale: 1, opacity: 1, rotation: "+=30", duration: 1.2, delay: far(s) * .9, ease: "power3.out", transformOrigin: "50% 50%" }));
      shapes.forEach((s, i) => gsap.to(s.g.parentNode, { y: `+=${(i % 2 ? 1 : -1) * 6}`, rotation: (i % 3) - 1, duration: 3 + (i % 5) * .4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.5, transformOrigin: "50% 50%" }));
      gsap.from(".dt-hero__in > *", { opacity: 0, y: 20, filter: "blur(4px)", duration: 1.2, stagger: .08, ease: "power3.out", clearProps: "filter" });
    });
    gsap.to(".dt-badge svg", { rotation: 360, duration: 20, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
    document.querySelectorAll(".dt-ph").forEach((ph) => gsap.fromTo(ph, { yPercent: 40, rotation: -20 }, { yPercent: -40, rotation: 20, ease: "none", scrollTrigger: { trigger: ".dt-profile", start: "top bottom", end: "bottom top", scrub: true } }));
    gsap.fromTo(".dt-profile__in", { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: 1.75, delay: .75, ease: "power4.inOut", scrollTrigger: { trigger: ".dt-profile", start: "top 60%", once: true } });
  });

  DC.pie(document.querySelector(".dt-wheel__svg"), [[230, 480, 6, -2.1], [480, 720, 8, -1.8]]);

  // Concentric tabs
  const rings = [...document.querySelectorAll(".dt-rings span")];
  const tabs = [...document.querySelectorAll(".dt-tabs button")];
  const descs = [...document.querySelectorAll(".dt-desc")];
  const cur = document.querySelector(".dt-val__cur");
  let at = tabs.findIndex((t) => t.classList.contains("is-on"));
  const light = (v) => rings.forEach((r, i) => r.classList.toggle("is-lit", i < v));
  light(+tabs[at].dataset.v);
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    if (i === at) return;
    at = i;
    tabs.forEach((x, k) => x.classList.toggle("is-on", k === i));
    descs.forEach((d, k) => { d.classList.toggle("is-on", k === i); d.classList.toggle("is-past", k < i); });
    const v = +t.dataset.v;
    light(v);
    const old = cur.querySelector("b"), nb = document.createElement("b");
    nb.textContent = v;
    cur.append(nb);
    if (DC.reduced) return old.remove();
    gsap.fromTo(nb, { yPercent: 100 }, { yPercent: 0, duration: .5, ease: "dcExpo" });
    gsap.to(old, { yPercent: -100, duration: .5, ease: "dcExpo", onComplete: () => old.remove() });
    gsap.fromTo(rings.slice(0, v), { scale: .96 }, { scale: 1, duration: .5, stagger: .02, ease: "dcExpo" });
  }));
})();
