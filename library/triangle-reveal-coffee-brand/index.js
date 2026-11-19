// Home page: hero video slider (progress bar, scene switching), random glass tile swap, journey capsule line drawing, sustainable line art, photo parallax.
// Original values (DK1PcbF6·Bh0wkpIy): scene change — outgoing video y −40·1s, outgoing title x 10·.5s, incoming video 1.1→1.05·y 40→0 .75s (.25s late),
// Incoming title x −10→0 .5s (.25s late), all power2.inOut. First appearance — product cells y 40 1s (.1s stagger) · title x −30 3s · background 1.05→1 2s power2.out.
// Glass cell — enters in 1.5s power2.inOut from x ±40 · y 40 · 1.05×, and every 3 + 0~2s the guide of one shuffled cell fades to .95 and changes 1.2→1 (1s).
(() => {
  const { reduced } = window.DC;
  const hero = document.querySelector(".dc-hero");
  const medias = [...hero.querySelectorAll(".dc-hero__media li")];
  const titles = [...hero.querySelectorAll(".dc-hero__titles li")];
  const thumbs = [...hero.querySelectorAll(".dc-thumbs li")];
  const bars = thumbs.map((t) => t.querySelector(".bar i"));
  let idx = 0, prog = null;

  const show = (n, prev) => {
    medias.forEach((m, i) => m.classList.toggle("is-on", i === n));
    titles.forEach((t, i) => t.classList.toggle("is-on", i === n));
    thumbs.forEach((t, i) => t.classList.toggle("is-on", i === n));
    if (reduced || prev === undefined) return;
    const om = medias[prev], ot = titles[prev], nm = medias[n], nt = titles[n];
    // The original (Vue) changes the cell display first and hangs the tween on the next tick — in between, the outgoing cell is switched off once by CSS, then turns on at the tween’s starting value (1) and fades out
    Promise.resolve().then(() => {
      gsap.killTweensOf([om, ot, nm, nt]);
      gsap.fromTo(om, { autoAlpha: 1, zIndex: 1 }, { autoAlpha: 0, scale: 1, y: -40, duration: 1, ease: "power2.inOut" });
      gsap.fromTo(ot, { autoAlpha: 1, zIndex: 1 }, { autoAlpha: 0, x: 10, duration: .5, ease: "power2.inOut" });
      gsap.fromTo(nm, { autoAlpha: 0, scale: 1.1, y: 40, zIndex: 2 }, { autoAlpha: 1, scale: 1.05, y: 0, duration: .75, delay: .25, ease: "power2.inOut" });
      gsap.fromTo(nt, { autoAlpha: 0, x: -10, zIndex: 2 }, { autoAlpha: 1, x: 0, duration: .5, delay: .25, ease: "power2.inOut" });
    });
  };
  // Progress bar: only the current scene bar fills linearly over the video length (6s if none, max 15s). Earlier scene bars are full and later ones are empty
  const play = () => {
    prog?.kill();
    gsap.set(bars, { scaleX: 0 });
    for (let i = 0; i < idx; i++) gsap.set(bars[i], { scaleX: 1 });
    const dur = Math.min(+medias[idx].dataset.dur || 6, 15);
    prog = gsap.to(bars[idx], { scaleX: 1, duration: dur, ease: "none", onComplete: () => go((idx + 1) % medias.length) });
  };
  const go = (n) => {
    if (n === idx) return;
    const prev = idx;
    idx = n;
    show(n, prev);
    play();
  };
  thumbs.forEach((t, i) => t.addEventListener("click", () => go(i)));
  show(0);

  // Glass cell
  const cells = [...hero.querySelectorAll(".dc-hl__cell")];
  const arr = window.DC.icons.arrowR;
  hero.querySelectorAll(".dc-hl__arr").forEach((a) => (a.innerHTML = arr));
  const controllers = cells.map((cell) => {
    const ctas = [...cell.querySelectorAll(".dc-hl__cta")];
    let at = 0;
    return {
      cell,
      next() {
        const n = (at + 1) % ctas.length, out = ctas[at], inn = ctas[n];
        const label = inn.querySelector(".dc-t1"), icon = inn.querySelector(".dc-hl__arr");
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut", duration: 1 } });
        tl.to(out, { autoAlpha: 0, scale: .95 })
          .fromTo(inn, { autoAlpha: 0, scale: 1.2 }, { autoAlpha: 1, scale: 1 }, "<0.05");
        label && tl.fromTo(label, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0 }, .5);
        icon && tl.fromTo(icon, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0 }, 1);
        at = n;
      },
    };
  });
  let bag = [], cycling = false, timer = null;
  const tick = () => {
    if (!cycling) return;
    if (!bag.length) bag = gsap.utils.shuffle(controllers.slice());
    bag.shift().next();
    timer = gsap.delayedCall(3 + gsap.utils.random(0, 2), tick);
  };
  const startCycle = () => { if (cycling || reduced) return; cycling = true; timer = gsap.delayedCall(3 + gsap.utils.random(0, 2), tick); };
  const stopCycle = () => { cycling = false; timer?.kill(); };
  cells.forEach((c) => { c.addEventListener("mouseenter", stopCycle); c.addEventListener("mouseleave", startCycle); });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // First appearance happens after the loader (or transition) clears
    gsap.set(cells, { autoAlpha: 0 });
    window.DC.ready.then(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.fromTo(".dc-pack", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .1, clearProps: "transform" }, 0)
        .fromTo([".dc-hero__titles", ".dc-thumbs"], { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 3 }, 0)
        .fromTo(".dc-hero__bg", { scale: 1.05, opacity: 0 }, { scale: 1, opacity: 1, duration: 2 }, 0);
      const from = [{ x: -40, y: 0 }, { x: 40, y: 0 }, { x: -40, y: 0 }, { x: 0, y: 40 }];
      const hl = gsap.timeline({ defaults: { ease: "power2.inOut", duration: 1.5 }, onComplete: startCycle });
      cells.forEach((c, i) => hl.fromTo(c, { autoAlpha: 0, scale: 1.05, ...from[i] }, { autoAlpha: 1, x: 0, y: 0, scale: 1 }, 0));
      hl.fromTo(cells.map((c) => c.querySelector(".dc-hl__cta")), { autoAlpha: 0 }, { autoAlpha: 1, stagger: .15 }, .5);
      play();
    });

    // Journey: the capsule line is drawn (1.6s expo.out) and step names rise from 10px below over 2s power4.out at .5s intervals — once when the section head reaches screen center
    const cyc = document.querySelector(".dc-cycle");
    const lines = cyc.querySelectorAll(".cap, .ico *, .dash");
    lines.forEach((p) => { const L = p.getTotalLength?.() || 600; p.style.strokeDasharray = p.classList.contains("dash") ? "" : `${L} ${L}`; p.style.strokeDashoffset = p.classList.contains("dash") ? "" : L; });
    gsap.set(cyc.querySelectorAll("text"), { opacity: 0, y: 10 });
    ScrollTrigger.create({
      trigger: ".dc-journey", start: "top center", once: true,
      onEnter: () => {
        gsap.to([...lines].filter((p) => !p.classList.contains("dash")), { strokeDashoffset: 0, duration: 1.6, ease: "dcExpo", stagger: .08 });
        gsap.to(cyc.querySelectorAll("text"), { opacity: .8, y: 0, duration: 2, stagger: .5, ease: "power4.out" });
      },
    });

    // Sustainability: line drawing is drawn while passing the section (scrub), black-and-white photos get parallax by data-speed
    const art = document.querySelector(".dc-sustain__art");
    buildArt(art);
    const paths = [...art.querySelectorAll("path, circle, ellipse")];
    paths.forEach((p) => { const L = p.getTotalLength?.() || 400; p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = L; });
    gsap.to(paths, { strokeDashoffset: 0, ease: "none", stagger: { each: .02, from: "center" }, scrollTrigger: { trigger: ".dc-sustain", start: "top 85%", end: "center 40%", scrub: true } });
    document.querySelectorAll(".dc-sustain__ph").forEach((ph) => {
      const k = +ph.dataset.speed || 1;
      gsap.fromTo(ph, { y: 120 * k }, { y: -120 * k, ease: "none", scrollTrigger: { trigger: ".dc-sustain", start: "top bottom", end: "bottom top", scrub: true } });
    });
    return () => { stopCycle(); prog?.kill(); };
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    buildArt(document.querySelector(".dc-sustain__art"));
  });

  // Redraw the original line art (framed vine · leaves · sun · cup · two hands) as left-right symmetric lines of the same feel
  function buildArt(svg) {
    if (svg.childElementCount) return;
    const NS = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(NS, "g");
    const add = (tag, attrs) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); g.append(e); };
    // Two upper arches (double-layer band) and a new-shape cup in the middle
    for (let k = 0; k < 4; k++) add("path", { d: `M${150 + k * 10} 420 V${210 + k * 10} Q${150 + k * 10} ${120 + k * 10} ${240 + k * 10} ${120 + k * 10} H${560 - k * 10} Q${640 - k * 10} ${120 + k * 10} ${640 - k * 10} ${200 + k * 10}` });
    add("ellipse", { cx: 720, cy: 150, rx: 46, ry: 30 });
    add("path", { d: "M674 150 Q720 230 766 150 M700 120 Q720 90 740 120" });
    // Vines and leaves
    for (let s = 0; s < 3; s++) {
      const x0 = 70 + s * 30, y0 = 860 - s * 40;
      add("path", { d: `M${x0} ${y0} C${x0 - 20} ${y0 - 200} ${x0 + 40} ${y0 - 380} ${x0 + 10} ${y0 - 560}` });
      for (let l = 0; l < 6; l++) {
        const y = y0 - 80 - l * 85, x = x0 + (l % 2 ? 22 : -18);
        add("ellipse", { cx: x, cy: y, rx: 20, ry: 9, transform: `rotate(${l % 2 ? -35 : 35} ${x} ${y})` });
        add("path", { d: `M${x - 14} ${y} H${x + 14}`, transform: `rotate(${l % 2 ? -35 : 35} ${x} ${y})` });
      }
    }
    // Round sun and flower pattern
    [[110, 600, 36], [300, 520, 24], [430, 760, 30]].forEach(([cx, cy, r]) => {
      add("circle", { cx, cy, r });
      add("circle", { cx, cy, r: r * .55 });
      for (let a = 0; a < 12; a++) { const t = (a / 12) * Math.PI * 2; add("path", { d: `M${cx + Math.cos(t) * r * 1.15} ${cy + Math.sin(t) * r * 1.15} L${cx + Math.cos(t) * r * 1.45} ${cy + Math.sin(t) * r * 1.45}` }); }
    });
    // Hand holding a glass
    add("path", { d: "M470 880 C470 800 500 760 540 740 L600 720 C620 716 628 730 612 742 L560 770 M560 770 C600 760 640 750 660 760 M540 700 H600 V730 C600 760 540 760 540 730 Z" });
    svg.append(g);
    const m = g.cloneNode(true);
    m.setAttribute("transform", "translate(1440 0) scale(-1 1)");
    svg.append(m);
  }
})();
