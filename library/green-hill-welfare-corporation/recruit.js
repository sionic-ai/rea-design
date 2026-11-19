// Careers section — interview card rotation (original recruitHeader), behavior guideline card flip, and a sticky apply bar.
(() => {
  const { reduce, mobile, wait } = window.yt;
  const stage = document.querySelector("[data-rh-stage]");
  const cards = [...stage.querySelectorAll("[data-icard]")].map((el) => ({ el, front: el.querySelector(".is-front"), back: el.querySelector(".is-back") }));
  // Slots: slot 0 is large in the center (front face), the rest in the right column (colored back-face cards)
  const slot = (i) => {
    const w = stage.clientWidth, cw = cards[0].el.offsetWidth;
    // Original desktop: side cards 262×385, the center card is 1.775× that at the exact screen center (center 713·462), the side row starts to its right
    if (i === 0) return mobile() ? { x: (w - cw) / 2, y: 0, scale: 1, rotate: 0 } : { x: cw * 0.313, y: cw * 0.456, scale: 1.775, rotate: 0 };
    const gap = cw * (mobile() ? 0.32 : 1.08);
    return mobile() ? { x: w * 0.78 + (i - 1) * gap, y: 30, scale: 0.6, rotate: 0 } : { x: cw * 1.8 + (i - 1) * gap, y: 120, scale: 1, rotate: 0 };
  };
  let order = cards.map((_, i) => i);
  const place = (immediate) => order.forEach((ci, pos) => {
    const c = cards[ci], s = slot(pos);
    c.el.style.zIndex = pos === 0 ? 5 : String(4 - Math.min(pos, 3));
    gsap.set(c.el, { x: s.x, y: s.y, scale: s.scale, opacity: 1 });
    gsap.set(c.front, { rotateY: pos === 0 ? 360 : 180 });
    gsap.set(c.back, { rotateY: pos === 0 ? 540 : 360 });
    if (!immediate) return;
  });
  place(true);
  addEventListener("resize", () => place(true));
  if (reduce) return;
  // Original initOpening — the center card stands showing its back at 2.77x (phone 1.2x) with the back text at the very center of the screen, then the text rises over 1s,
  // Two faces rise from 50% below in .55s power4.out, settle into place in .8s power3.inOut · and to their own size in elastic.out(1,.5) 1.8s, back-face picture .5→1,
  // Flips to the front with elastic.inOut(.1,1) over 1.5s, the side card flies in from far right with elastic.inOut(.3,.9) over 2s, then the rest float up over .8s
  let opened = false;
  const opening = async () => {
    window.yt.lenis?.stop();
    const c = cards[order[0]], s0 = slot(0), side = order.slice(1, 3).map((ci) => cards[ci]);
    const label = c.back.querySelector(".yt-en"), pic = c.back.querySelector(".yt-ill");
    gsap.set(c.front, { rotateY: 180 });
    gsap.set(c.back, { rotateY: 360 });
    gsap.set([c.front, c.back], { yPercent: 50, opacity: 0 });
    if (pic) gsap.set(pic, { scale: 0, opacity: 0 });
    const far = slot(2).x;
    side.forEach((d, k) => gsap.set(d.el, { x: far * (k + 2) }));
    gsap.set(c.el, { scale: mobile() ? 1.2 : 2.7668 });
    const ghost = (label || c.back).cloneNode(!!label);
    ghost.style.cssText = `position:absolute;left:0;right:0;top:${label ? label.offsetTop : 0}px;text-align:center;opacity:0`;
    c.el.appendChild(ghost);
    await wait(200);
    const r = ghost.getBoundingClientRect();
    gsap.set(c.el, { y: gsap.getProperty(c.el, "y") + innerHeight / 2 - (r.top + r.height / 2) });
    await wait(100);
    gsap.to(ghost, { opacity: 1, duration: 1, ease: "power1.inOut" });
    await wait(1000);
    gsap.to([c.front, c.back], { opacity: 1, duration: 0.3, ease: "sine.out" });
    gsap.to([c.front, c.back], { yPercent: 0, duration: 0.55, ease: "power4.out", onComplete: () => ghost.remove() });
    wait(300).then(() => gsap.to(c.el, { x: s0.x, y: s0.y, duration: 0.8, ease: "power3.inOut" }));
    wait(550).then(() => {
      gsap.to(c.el, { scale: s0.scale, duration: 1.8, ease: "elastic.out(1, 0.5)" });
      if (pic) { gsap.to(pic, { opacity: 1, duration: 0.3, ease: "sine.inOut" }); gsap.fromTo(pic, { scale: 0.5 }, { scale: 1, duration: 1.4, ease: "elastic.out(1.3, 0.5)" }); }
    });
    await wait(850);
    gsap.to(c.front, { rotateY: 360, duration: 1.5, ease: "elastic.inOut(0.1, 1)" });
    gsap.to(c.back, { rotateY: 540, duration: 1.5, ease: "elastic.inOut(0.1, 1)" });
    await wait(100);
    side.forEach((d, k) => gsap.to(d.el, { x: slot(k + 1).x, duration: 2, delay: 0.1 * k, ease: "elastic.inOut(0.3, 0.9)" }));
    await wait(1000);
    const fades = [...document.querySelectorAll("[data-rh-fade]")];
    await gsap.to(fades, { opacity: 1, duration: 0.8, ease: "power4.out", onComplete: () => fades.forEach((f) => { f.removeAttribute("data-rh-fade"); f.style.opacity = ""; }) });
  };
  // Every 7s (phones 6s): the center card shrinks to .7× and vanishes, the next card comes to center, grows with elasticity and flips forward, and the remaining row shifts one cell left
  const next = async () => {
    const [cur, nxt, ...rest] = order;
    const c0 = cards[cur], c1 = cards[nxt];
    gsap.to(c0.el, { scale: 0.7 * gsap.getProperty(c0.el, "scale"), duration: 1.1, ease: "power3.inOut" });
    gsap.to(c0.el, { opacity: 0, duration: 0.7, ease: "power1.in" });
    const s = slot(0);
    c1.el.style.zIndex = 6;
    gsap.to(c1.el, { x: s.x, y: s.y, ease: "power3.inOut", duration: 0.8 });
    gsap.to(c1.el, { scale: s.scale, duration: mobile() ? 1.6 : 1.4, delay: 0.45, ease: mobile() ? "elastic.out(3, 0.6)" : "elastic.out(1.2, 0.6)" });
    gsap.to(c1.front, { rotateY: 360, duration: 1.5, ease: "elastic.inOut(0.3, 0.5)" });
    gsap.to(c1.back, { rotateY: 540, duration: 1.5, ease: "elastic.inOut(0.3, 0.5)" });
    rest.forEach((ci, k) => { const t = slot(k + 1); gsap.to(cards[ci].el, { x: t.x, duration: 1.3, delay: k * 0.04, ease: "elastic.inOut(0.3, 0.9)" }); });
    order = [nxt, ...rest, cur];
    await window.yt.wait(1200);
    const t = slot(order.length - 1);
    gsap.set(c0.front, { rotateY: 180 });
    gsap.set(c0.back, { rotateY: 360 });
    gsap.fromTo(c0.el, { x: t.x + 80, y: t.y, scale: t.scale, opacity: 0 }, { x: t.x, opacity: 1, duration: 0.8, ease: "power4.out" });
    c0.el.style.zIndex = 1;
  };
  // Advance timer — accumulates 7s (6s on phone) via rAF and draws it on the cursor border. Only while visible, pauses when the tab is hidden
  const DUR = mobile() ? 6000 : 7000;
  const cursor = document.querySelector("[data-rh-cursor]"), ring = cursor?.querySelector(".rh-cursor__ring");
  const len = ring ? ring.getTotalLength() : 0;
  if (ring) ring.style.strokeDasharray = String(len);
  const prog = { p: 0 };
  const draw = () => ring && (ring.style.strokeDashoffset = String(len * (1 - prog.p)));
  let busy = false, raf = 0, last = null, elapsed = 0, inView = false;
  const advance = async () => {
    busy = true;
    cursor?.classList.add("is-animating");
    // In the original, isAnimating is released only after the next card’s move, flip and elastic grow (1.4s starting .45s later) all finish
    await Promise.all([next(), wait(1850)]);
    busy = false;
    cursor?.classList.remove("is-animating");
  };
  const loop = (t) => {
    if (last != null) elapsed += t - last;
    last = t;
    if (elapsed >= DUR) { elapsed = 0; advance(); }
    prog.p = elapsed / DUR;
    draw();
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (opened && !raf && inView && !document.hidden) { last = null; raf = requestAnimationFrame(loop); } };
  const pause = () => { cancelAnimationFrame(raf); raf = 0; };
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? start() : pause(); }).observe(stage);
  // Keeps the area below the header visible wherever the opening scene stops, and sets the clock running
  opening().catch(() => {}).finally(() => {
    window.yt.lenis?.start();
    opened = true;
    document.querySelectorAll("[data-rh-fade]").forEach((f) => { f.removeAttribute("data-rh-fade"); f.style.opacity = ""; });
    start();
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : start()));

  // Original recruitHeader cursor — a 120px circle follows at 0.1 per frame, visible only to the right of half a card width from center inside the header.
  // Over a link it folds, over the center card it turns into a green View and the clock stops. Pressing it springs and goes straight to the next card
  if (cursor && matchMedia("(min-width: 1080px) and (hover: hover) and (pointer: fine)").matches) {
    const root = document.querySelector("[data-rh]"), body = cursor.querySelector(".rh-cursor__body");
    // Original cardHalfWidth — measured at the moment the opening scene scales the center card 2.77x
    const half = cards[0].el.getBoundingClientRect().width / 2;
    const m = { tx: 0, ty: 0, x: 0, y: 0 };
    let follow = 0, first = true, active = false;
    const elastic = () => gsap.timeline().to(body, { scale: 0.7, duration: 0.1, ease: "power3.inOut" }).to(body, { scale: 1, duration: 1.4, ease: "elastic.out(1.5, 0.3)" });
    const render = () => {
      const dx = m.tx - m.x, dy = m.ty - m.y;
      m.x += dx * 0.1;
      m.y += dy * 0.1;
      const r = root.getBoundingClientRect();
      active = m.x > innerWidth / 2 - half && m.x >= r.left && m.x <= r.right && m.y >= r.top && m.y <= r.bottom;
      cursor.classList.toggle("is-inactive", !active);
      cursor.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
      follow = Math.abs(dx) > 1e-4 || Math.abs(dy) > 1e-4 ? requestAnimationFrame(render) : 0;
    };
    cursor.classList.add("is-inactive");
    addEventListener("mousemove", (e) => {
      if (!opened) return;
      m.tx = e.clientX; m.ty = e.clientY;
      if (first) { m.x = m.tx; m.y = m.ty; first = false; }
      if (!follow) follow = requestAnimationFrame(render);
    });
    addEventListener("mouseup", () => {
      if (!opened || busy || !active) return;
      elastic();
      gsap.to(prog, { p: 1, duration: 0.2, ease: "power1.out", onUpdate: draw });
      pause();
      advance();
      setTimeout(() => { elapsed = 0; start(); }, 200);
    });
    document.querySelectorAll("a, button").forEach((l) => {
      l.addEventListener("mouseenter", () => cursor.classList.add("is-hover-links"));
      l.addEventListener("mouseleave", () => cursor.classList.remove("is-hover-links"));
    });
    cards.forEach((c, i) => {
      c.el.addEventListener("mouseenter", () => { if (order[0] !== i) return; pause(); cursor.classList.add("is-hover-card"); elastic(); });
      c.el.addEventListener("mouseleave", () => { if (!cursor.classList.contains("is-hover-card")) return; start(); cursor.classList.remove("is-hover-card"); });
    });
  }

  document.querySelectorAll("[data-gcard]").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"))));

  // The apply bar hides when the footer is visible
  const bar = document.querySelector("[data-rbar]"), foot = document.querySelector(".yt-foot");
  if (bar && foot) new IntersectionObserver(([e]) => bar.classList.toggle("is-hide", e.isIntersecting)).observe(foot);
})();
