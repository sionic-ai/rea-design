// First page: two opening timelines (sound door → sky opens / circle click → grid) and the endless drag grid.
// Values exactly as in the original — text line .2s interval, circle 408rem (phone 290) 1.2s power3, open 2000rem 1s power2.inOut,
// Cards 248×332 gap 34 (phone 180×242·20), odd columns offset down half a cell, drag sensitivity 1.5 · threshold 5px, follow .08, cursor .1·.08
OU.page("index", (root, OU) => {
  const { $, $$, reduce, isSp, rem, paint, makeDragon, reverseLater, html } = OU;
  const params = new URLSearchParams(location.search);
  const done = () => { html.dataset.opening = "done"; sessionStorage.setItem("ou-opening", "done"); };
  if (params.get("loading") === "always") delete html.dataset.opening;
  else if (reduce || params.get("view") === "grid" || sessionStorage.getItem("ou-opening") === "done") done();
  const offs = [];
  const on = (el, type, fn, opt) => { el.addEventListener(type, fn, opt); offs.push(() => el.removeEventListener(type, fn, opt)); };

  // ===== Endless grid =====
  const container = $(".ou-grid__container", root);
  const list = $(".ou-grid__list", root);
  const source = $$(".ou-grid__item", list);
  const base = isSp() ? { w: 180, h: 242, gx: 20, gy: 20, vw: 393 } : { w: 248, h: 332, gx: 34, gy: 34, vw: 1440 };
  let cfg, gridW, gridH, colOffset, vw, vh, cells = [];
  let sx = 0, sy = 0, tx = 0, ty = 0, raf = null;
  const hovers = [];
  const measure = () => {
    vw = innerWidth; vh = innerHeight;
    const k = isSp() ? vw / base.vw : Math.min(vw / base.vw, 1);
    cfg = { w: base.w * k, h: base.h * k, gx: base.gx * k, gy: base.gy * k };
    cfg.cols = Math.ceil(vw / (cfg.w + cfg.gx)) + 2;
    cfg.rows = Math.ceil(vh / (cfg.h + cfg.gy)) + 2;
    gridW = cfg.cols * (cfg.w + cfg.gx);
    gridH = cfg.rows * (cfg.h + cfg.gy);
    colOffset = (cfg.h + cfg.gy) / 2;
  };
  // Card hover: starts the video from the beginning (.1s), the gradient and text clear to .1 over .3s while VIEW MORE pops out with .2s back.out(1.7)
  const hover = (el) => {
    const video = $("video", el);
    const tl = gsap.timeline({ paused: true })
      .call(() => { if (video) { video.currentTime = 0; video.play().catch(() => {}); } })
      .to(video, { opacity: 1, duration: 0.1 })
      .to($$(".ou-grid__grad, .ou-grid__content", el), { opacity: 0.1, duration: 0.3 }, "<")
      .fromTo($(".ou-view-more", el), { opacity: 0, scale: 0, y: 20 * rem(), x: 10 * rem(), rotate: 10 }, { y: 0, x: 0, rotate: 6, opacity: 1, scale: 1, duration: 0.2, ease: "back.out(1.7)" }, "<");
    hovers.push(tl);
    el.addEventListener("mouseenter", () => !isSp() && tl.play());
    el.addEventListener("mouseleave", () => { reverseLater(tl); video?.pause(); });
    el.addEventListener("click", () => OU.openCover(el));
  };
  const setup = () => {
    hovers.forEach((t) => t.kill());
    hovers.length = 0;
    list.replaceChildren();
    cells = [];
    for (let i = 0; i < cfg.cols * cfg.rows; i++) {
      const col = i % cfg.cols, row = Math.floor(i / cfg.cols);
      const el = source[i % source.length].cloneNode(true);
      list.appendChild(el);
      cells.push({ el, bx: col * (cfg.w + cfg.gx), by: row * (cfg.h + cfg.gy), oy: col % 2 ? colOffset : 0 });
      hover(el);
    }
  };
  const place = () => {
    cells.forEach((c) => {
      let x = c.bx - sx, y = c.by + c.oy - sy;
      x = ((x % gridW) + gridW) % gridW;
      if (x > vw + cfg.w) x -= gridW;
      y = ((y % gridH) + gridH) % gridH;
      if (y > vh + cfg.h) y -= gridH;
      if (x < -cfg.w) x += gridW;
      if (y < -cfg.h - colOffset) y += gridH;
      const visible = x > -cfg.w - 50 && x < vw + 50 && y > -cfg.h - colOffset - 50 && y < vh + 50;
      if (c.lx === x && c.ly === y) return;
      if (visible) { c.el.style.transform = `translate3d(${x}px, ${y}px, 0)`; c.el.style.visibility = "visible"; }
      else c.el.style.visibility = "hidden";
      c.lx = x; c.ly = y;
    });
  };
  const tick = () => {
    const px = sx, py = sy, ease = reduce ? 1 : 0.08;
    sx += (tx - sx) * ease;
    sy += (ty - sy) * ease;
    place();
    raf = Math.abs(sx - px) > 0.1 || Math.abs(sy - py) > 0.1 || Math.abs(tx - sx) > 0.1 || Math.abs(ty - sy) > 0.1 ? requestAnimationFrame(tick) : null;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  measure(); setup();
  // At first, the center of one card sits at the screen center
  sx = tx = cfg.w / 2 - vw / 2;
  sy = ty = cfg.h / 2 - vh / 2;
  place(); kick();

  let dragging = false, dragged = false, x0 = 0, y0 = 0, sx0 = 0, sy0 = 0;
  const pt = (e) => [e.clientX || e.touches?.[0]?.clientX || 0, e.clientY || e.touches?.[0]?.clientY || 0];
  const down = (e) => { dragging = true; dragged = false; tx = sx; ty = sy; [x0, y0] = pt(e); sx0 = tx; sy0 = ty; container.style.cursor = "grabbing"; };
  const move = (e) => {
    if (!dragging) return;
    const [x, y] = pt(e);
    const dx = (x0 - x) * 1.5, dy = (y0 - y) * 1.5;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) { dragged = true; tx = sx0 + dx; ty = sy0 + dy; kick(); }
  };
  const block = (e) => { e.stopPropagation(); e.preventDefault(); };
  const up = () => {
    if (dragged) container.addEventListener("click", block, { capture: true, once: true });
    dragging = false; dragged = false; container.style.cursor = "grab";
  };
  on(container, "mousedown", down);
  on(container, "mousemove", move);
  on(container, "mouseup", up);
  on(container, "mouseleave", up);
  on(container, "touchstart", down, { passive: true });
  on(container, "touchmove", move, { passive: true });
  on(container, "touchend", up);
  on(container, "wheel", (e) => { e.preventDefault(); tx += e.deltaX; ty += e.deltaY; kick(); }, { passive: false });
  on(window, "resize", () => { measure(); setup(); place(); kick(); });

  // ‹Drag to Discover› cursor: follows over the grid with position .1, tilts the text ∓10° and ±20rem when moving left or right (.08), and straightens after 150ms of stillness
  const cursor = $(".ou-grid__cursor", root);
  let cursorRaf = null;
  if (cursor && !reduce) {
    const [s1, s2, s3] = $$("svg", cursor);
    const cur = { x: 0, y: 0, r1: 0, x2: 0, r3: 0 }, tgt = { x: 0, y: 0, r1: 0, x2: 0, r3: 0 };
    let idle = null, prev = null;
    const step = () => {
      cur.x += (tgt.x - cur.x) * 0.1; cur.y += (tgt.y - cur.y) * 0.1;
      ["r1", "x2", "r3"].forEach((k) => (cur[k] += (tgt[k] - cur[k]) * 0.08));
      cursor.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      s1.style.transform = `rotate(${cur.r1}deg)`;
      s2.style.transform = `translateX(${cur.x2}rem)`;
      s3.style.transform = `rotate(${cur.r3}deg)`;
      const moving = ["x", "y", "r1", "x2", "r3"].some((k) => Math.abs(tgt[k] - cur[k]) > 0.1);
      cursorRaf = moving ? requestAnimationFrame(step) : null;
    };
    const start = () => { if (!cursorRaf) cursorRaf = requestAnimationFrame(step); };
    on(container, "mousemove", (e) => {
      tgt.x = e.clientX - vw / 2;
      tgt.y = e.clientY - vh / 2;
      if (prev !== null) {
        const d = e.clientX - prev;
        if (d > 0) [tgt.r1, tgt.x2, tgt.r3] = [-10, 20, 10];
        else if (d < 0) [tgt.r1, tgt.x2, tgt.r3] = [10, -20, -10];
      }
      prev = e.clientX;
      clearTimeout(idle);
      idle = setTimeout(() => { tgt.r1 = tgt.x2 = tgt.r3 = 0; start(); }, 150);
      start();
    });
    // Hide the cursor over the header logo, menu, and bottom bar
    [$(".ou-header__logo"), ...$$(".ou-header__nav a"), $(".ou-nav")].filter(Boolean).forEach((el) => {
      on(el, "mouseenter", () => (cursor.style.opacity = 0));
      on(el, "mouseleave", () => (cursor.style.opacity = 1));
    });
  }

  const cleanup = [];
  const stop = () => {
    cancelAnimationFrame(raf); cancelAnimationFrame(cursorRaf);
    offs.forEach((f) => f()); hovers.forEach((t) => t.kill()); cleanup.forEach((f) => f());
  };
  if (html.dataset.opening === "done") return stop;

  // ===== Opening =====
  const dragon = makeDragon($(".ou-opening .ou-dragon", root));
  if (dragon) cleanup.push(dragon.cleanup);
  const video = $(".ou-opening__circle-video", root);
  const split = (sel) => new SplitText($(sel, root), { type: "chars", tag: "span" }).chars;
  const ja1 = split(".ou-opening__line-ja > span:first-child"), ja2 = split(".ou-opening__line-ja > span:last-child");
  const en1 = split(".ou-opening__line-en > span:first-child"), en2 = split(".ou-opening__line-en > span:last-child");
  const type = { opacity: 1, duration: 0.01, stagger: { each: 0.2 } };

  gsap.set(".ou-opening__circle", { "--size": "0rem" });
  const start = gsap.timeline({ paused: true })
    .set(".ou-opening__sounds", { pointerEvents: "none" })
    .to(".ou-opening__sounds", { opacity: 0, duration: 0.5 })
    .to(".ou-opening__logo", { opacity: 1, duration: 0.5 }, "<")
    .fromTo(ja1, { opacity: 0 }, type, "<")
    .fromTo(en1, { opacity: 0 }, type, "<")
    .fromTo(ja2, { opacity: 0 }, { ...type, delay: 1 })
    .fromTo(en2, { opacity: 0 }, { ...type, delay: 1 }, "<")
    .add(() => dragon?.play(), "<")
    .to(".ou-opening__sounds", { opacity: 0, scale: 1.1, duration: 0.5 }, "<+=0.1")
    .to(".ou-opening__back", { opacity: 1, duration: 1, delay: 0.3 })
    .to(".ou-opening__tv", { opacity: 0, duration: 0.5, onStart: () => $(".ou-opening__logo", root).setAttribute("data-still", "") }, "<")
    .fromTo(".ou-opening__copy", { opacity: 0.5, color: paint("var(--kf-ink)") }, { opacity: 1, color: paint("var(--site-ink-dark)"), duration: 0.5 }, "<")
    .to(".ou-opening__clouds", { opacity: 1, duration: 1 }, "<")
    .to(".ou-opening__circle", { "--size": `${isSp() ? 290 : 408}rem`, ease: "power3", duration: 1.2, pointerEvents: "auto" }, "<")
    .to(".ou-opening__circle-outer", { opacity: 1, ease: "power3", duration: 1.2 }, "<")
    .to(".ou-opening__logo", { width: `${isSp() ? 228 : 272}rem`, ease: "power1", opacity: 1, duration: 0.5 }, "<")
    .fromTo(".ou-opening__title, .ou-opening__info", { opacity: 0, y: "20rem" }, { opacity: 1, y: "0rem", duration: 1.2, ease: "power3.out" }, "<+=0.3")
    .to(".ou-opening__circle-ja, .ou-opening__circle-en", { y: "0%", clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.out", stagger: 0.1 }, "-=0.3")
    .to(".ou-opening__circle-icon", { scale: 1 }, "<");
  $$(".ou-opening__toggle", root).forEach((b) => b.addEventListener("click", () => { start.play(); video?.play().catch(() => {}); }));

  const open = gsap.timeline({ paused: true })
    .set(".ou-opening", { zIndex: 1 })
    .to(".ou-opening__circle", { "--size": "2000rem", ease: "power2.inOut", duration: 1 })
    .to(".ou-opening__clouds", { scale: 1.2, ease: "power2.inOut", duration: 1 }, "<")
    .to(".ou-opening__copy", { opacity: 0, duration: 0.4 }, "<")
    .to(".ou-opening__circle-inner", { backgroundColor: paint("var(--site-shade)"), duration: 1 }, "<")
    .to(".ou-opening__logo", { width: "375rem", duration: 1, ease: "power3.inOut", opacity: 0.3 }, "<")
    .to(".ou-opening__circle-video, .ou-opening__circle-inner .wf-img", { opacity: 0, duration: 0.6 }, "<")
    .fromTo(".ou-grid", { opacity: 0, pointerEvents: "none" }, { pointerEvents: "auto", opacity: 1, duration: 0.6 }, "-=0.2")
    .fromTo(".ou-nav", { y: "200%" }, { y: "0%", duration: 0.6, ease: "power2.out", clearProps: "all" }, "<")
    .fromTo(".ou-header", { y: "-200%" }, { y: "0%", duration: 0.6, ease: "power2.out" }, "<")
    .fromTo(".ou-nav__toggle-wrap, .ou-nav__sounds, .ou-nav > .ou-nav__container > .ou-nav__filter", { opacity: 0, transition: "none" }, { opacity: 1, duration: 0.6, clearProps: "all" })
    .call(() => {
      done();
      $(".ou-opening__logo", root).removeAttribute("data-still");
      dragon?.kill();
      gsap.set(".ou-opening, .ou-opening__logo, .ou-header", { clearProps: "all" });
    });
  $(".ou-opening__circle", root).addEventListener("click", () => open.play());
  cleanup.push(() => { start.kill(); open.kill(); });
  return stop;
});
