// Product page — original values: first section pinned for 11.9 screens (scrub 1.2, snap 0 · .409 · .677 · .925 · 1), ring story (A.story), workbench (A.bench)
(() => {
  const { reduce } = A;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const G = (v) => Math.max(0, Math.min(1, v));

  const cine = $(".p-cine"), stage = $(".p-cine-stage"), cv = $(".p-cine-canvas"), g = cv.getContext("2d");
  const ink = A.rgb(A.css("--kf-ink")), acc = A.rgb(A.css("--kf-accent")), warm = A.rgb(A.css("--site-orange")), raised = A.rgb(A.css("--kf-raised")), bg = A.rgb(A.css("--kf-bg"));
  const rgba = (c, a) => `rgba(${c},${a})`;
  // Image sequence slot — draws as progress (0–1) the picture going from the face front into the screen and reaching the pinwheel core inside the machine
  const seq = { p: 0 };
  const paint = () => {
    const dpr = Math.min(devicePixelRatio, 2), w = (cv.width = Math.round(cv.clientWidth * dpr)), h = (cv.height = Math.round(cv.clientHeight * dpr));
    const p = seq.p, cx = w / 2, cy = h * 0.52, u = Math.min(w, h);
    g.clearRect(0, 0, w, h);
    if (p < 0.8) {
      const z = 1 + Math.pow(G(p / 0.8), 2.2) * 8, a = 1 - G((p - 0.62) / 0.18);
      g.save(); g.translate(cx, cy + u * 0.12 * (z - 1) * 0.08); g.scale(z, z);
      const hw = u * 0.34, hh = u * 0.3;
      const hg = g.createRadialGradient(-hw * 0.3, -hh * 0.4, hw * 0.1, 0, 0, hw * 1.3);
      hg.addColorStop(0, rgba(acc, 0.55 * a)); hg.addColorStop(0.5, rgba(raised, a)); hg.addColorStop(1, rgba(bg, a));
      g.fillStyle = hg; g.beginPath(); g.roundRect(-hw, -hh, hw * 2, hh * 2, hh * 0.9); g.fill();
      g.fillStyle = rgba(bg, a); g.beginPath(); g.roundRect(-hw * 0.72, -hh * 0.55, hw * 1.44, hh * 1.15, hh * 0.45); g.fill();
      g.fillStyle = rgba(acc, 0.9 * a);
      [-1, 1].forEach((s) => { g.beginPath(); g.roundRect(s * hw * 0.28 - hw * 0.05, -hh * 0.3, hw * 0.1, hh * 0.38, hw * 0.05); g.fill(); });
      g.strokeStyle = rgba(acc, 0.9 * a); g.lineWidth = hw * 0.04; g.lineCap = "round";
      g.beginPath(); g.arc(0, hh * 0.08, hw * 0.16, Math.PI * 0.2, Math.PI * 0.8); g.stroke();
      g.restore();
    }
    if (p > 0.55) {
      const a = G((p - 0.55) / 0.25);
      [[-0.17, acc], [-0.07, ink], [0.07, warm], [0.17, ink]].forEach(([x, c], i) => {
        const gr = g.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, rgba(c, 0)); gr.addColorStop(0.5, rgba(c, 0.55 * a)); gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr; g.fillRect(cx + x * w - u * 0.012, 0, u * 0.024, h);
      });
      const r = u * 0.12 * (0.6 + 0.4 * a);
      for (let i = 0; i < 5; i++) {
        g.save(); g.translate(cx, cy); g.rotate(i * 1.2566 + p * 3);
        g.strokeStyle = rgba(i === 1 ? warm : acc, 0.8 * a); g.lineWidth = u * 0.004;
        g.beginPath(); g.ellipse(r * 0.18, -r * 0.42, r * 0.32, r * 0.5, 0.5, 0, Math.PI * 2); g.stroke();
        g.restore();
      }
    }
  };
  paint();
  addEventListener("resize", paint);

  // Flow line — eight dotted lines converging from the left and eight spreading to the right
  const streams = $(".p-streams"), dLines = $(".p-diagram-lines"), diagram = $(".p-diagram");
  const layout = () => {
    const r = stage.getBoundingClientRect(), w = r.width, h = r.height, y = h * 0.59 + 18, f = (n) => n.toFixed(1);
    streams.setAttribute("viewBox", `0 0 ${w} ${h}`);
    let d = "";
    for (let i = 0; i < 8; i++) { const yy = y + (i - 3.5) * 22; d += `<path d="M 0 ${f(yy)} C ${f(w * 0.15)} ${f(yy)}, ${f(w * 0.2)} ${f(y)}, ${f(w * 0.31 - 60)} ${f(y)}"/><path d="M ${f(w * 0.69 + 60)} ${f(y)} C ${f(w * 0.8)} ${f(y)}, ${f(w * 0.85)} ${f(yy)}, ${f(w)} ${f(yy)}"/>`; }
    d += `<path d="M ${f(w * 0.31 + 60)} ${f(y)} L ${f(w * 0.69 - 60)} ${f(y)}"/>`;
    streams.innerHTML = d;
    const box = diagram.getBoundingClientRect(), c = (el) => { const b = el.getBoundingClientRect(); return { l: b.left - box.left, r: b.right - box.left, y: b.top - box.top + b.height / 2 }; };
    const hub = { x: r.width / 2 - (box.left - r.left), y: box.height / 2 };
    let L = "";
    $$(".p-col.is-steps .a-pill").forEach((p) => { const k = c(p); L += `<path d="M ${f(k.r)} ${f(k.y)} C ${f((k.r + hub.x) / 2)} ${f(k.y)}, ${f((k.r + hub.x) / 2)} ${f(hub.y)}, ${f(hub.x - 50)} ${f(hub.y)}"/>`; });
    const stores = $$(".p-col.is-stores .a-pill").map(c), term = c($(".p-terminal"));
    stores.forEach((k) => { L += `<path d="M ${f(hub.x + 50)} ${f(hub.y)} C ${f((hub.x + k.l) / 2)} ${f(hub.y)}, ${f((hub.x + k.l) / 2)} ${f(k.y)}, ${f(k.l)} ${f(k.y)}"/><path d="M ${f(k.r)} ${f(k.y)} L ${f(term.l)} ${f(term.y)}"/>`; });
    L += `<path class="is-warm" d="M ${f((term.l + term.r) / 2)} ${f(term.y + 14)} V ${f(box.height * 0.96)} H ${f(hub.x)}"/>`;
    dLines.innerHTML = L;
  };
  layout();
  ScrollTrigger.addEventListener("refresh", layout);

  const h1 = A.split($(".p-cine-h1"), "chars");
  if (h1 && !reduce) gsap.to(h1.parts, A.rise({ stagger: 0.03, duration: 1.1, delay: 0.2 }));
  const tuned = $(".p-copy.is-tuned"), arch = $(".p-copy.is-arch"), rest = $(".p-copy.is-rest"), core = $(".p-core");
  const tw = A.split($("h2", tuned), "words"), aw = A.split($("h2", arch), "words"), rw = A.split($("h2", rest), "chars");
  const flow = { o: 0 };
  const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onUpdate: paint, scrollTrigger: { trigger: cine, start: "top top", end: () => "+=" + innerHeight * 11.9, pin: stage, scrub: 1.2, invalidateOnRefresh: true,
    snap: reduce ? undefined : { snapTo: [0, 0.409, 0.677, 0.925, 1], inertia: false, delay: 0.35, duration: { min: 0.5, max: 1 }, ease: "power1.inOut" } } });
  tl.to(".p-cine-h1", { autoAlpha: 0, y: -40, filter: "blur(10px)", duration: 0.04, ease: "power2.in" }, 0.015)
    .to(".p-cine .a-scroll-hint", { opacity: 0, duration: 0.03 }, 0.015)
    .to(seq, { p: 1, duration: 0.33, ease: "none" }, 0)
    .to([cv, ".p-cine-label"], { opacity: 0, duration: 0.04 }, 0.34)
    .fromTo(core, { opacity: 0, scale: 1.6, y: 0 }, { opacity: 1, scale: 1.6, duration: 0.04 }, 0.35)
    .to(tuned, { opacity: 1, duration: 0.03 }, 0.37)
    .to(tw ? tw.parts : [], A.rise({ stagger: 0.003, duration: 0.02 }), 0.37)
    .to(tuned, { opacity: 0, y: -30, duration: 0.03 }, 0.44)
    .to(core, { scale: 0.8, y: () => innerHeight * 0.18 + 18, duration: 0.05 }, 0.45)
    .to([".p-node", streams], { opacity: 1, duration: 0.04, stagger: 0.01 }, 0.5)
    .to(flow, { o: -180, duration: 0.15, ease: "none", onUpdate: () => $$("path", streams).forEach((p) => (p.style.strokeDashoffset = flow.o)) }, 0.5)
    .to(arch, { opacity: 1, duration: 0.03 }, 0.53)
    .to(aw ? aw.parts : [], A.rise({ stagger: 0.003, duration: 0.02 }), 0.53)
    .to(".p-arch-note", { opacity: 1, duration: 0.03 }, 0.58)
    .to([arch, ".p-arch-note", ".p-node", streams], { opacity: 0, duration: 0.03 }, 0.71)
    .to(core, { scale: 0.4, y: () => innerHeight * 0.07 + 18, duration: 0.05 }, 0.72)
    .to(rest, { opacity: 1, duration: 0.03 }, 0.78)
    .to(rw ? rw.parts : [], A.rise({ stagger: 0.002, duration: 0.02 }), 0.78)
    .to(diagram, { opacity: 1, duration: 0.05 }, 0.8)
    .fromTo(dLines, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.82)
    .to(".p-caption", { opacity: 1, duration: 0.03 }, 0.87)
    .to([rest, diagram, ".p-caption", core], { opacity: 0, duration: 0.04 }, 0.95)
    .to({}, { duration: 0.001 }, 1);

  const mem = $(".p-memory"), mt = A.split($("h2", mem), "chars");
  if (!reduce) {
    if (mt) gsap.to(mt.parts, A.rise({ stagger: 0.03, duration: 0.9, scrollTrigger: { trigger: mem, start: "top 58%", end: "top 2%", scrub: 0.6, invalidateOnRefresh: true } }));
    gsap.from([".p-memory-lead", ".p-memory-close"], { opacity: 0, y: 20, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: mem, start: "top 38%", end: "top top", scrub: 0.6, invalidateOnRefresh: true } });
    gsap.from(".p-memory-hub", { opacity: 0, scale: 0.6, y: -80, ease: "power2.out", scrollTrigger: { trigger: mem, start: "top 88%", end: "top 38%", scrub: 0.6, invalidateOnRefresh: true } });
  }
  A.rows($(".p-memory-rows"));
  A.story($(".p-story"));
  A.plain($(".p-same"));
  if (!reduce) gsap.from(".p-same-badge", { opacity: 0, scale: 0.35, ease: "back.out(2.2)", scrollTrigger: { trigger: ".p-same", start: "top 88%", end: "top 40%", scrub: 0.55, invalidateOnRefresh: true } });
  A.bench($(".p-bench"));
  A.footer();
  ScrollTrigger.refresh();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
