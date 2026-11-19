// Home page scenes: wordmark loader → capsule window swap → message mode, cube, service capsule, project slider, news tabs, company capsule closing in, careers photo swap.
window.uSite.holdHeader = true;
uSite.scene(({ capsule, lenis, isPc, reduce, gridFx }) => {
  const body = document.body;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── Hero ──
  const media = $("[data-fv-media]");
  const clip = $("[data-fv-clip]");
  const items = $$(".fv__item");
  const msgItems = $$(".fv__msg-item");
  const tracks = $$("[data-fv-track]");
  const bigO = $("[data-fv-o]");
  const num = $("[data-fv-num]");

  // Original capsule positions (x·y·w·h for 1440×900 / 400×858 screens). null means full screen
  const SHAPES_PC = [[423,244,594,412],[241,244,958,412],[295,156,850,588],null,[296,156,848,588],[91,244,1259,412],[423,244,594,412],null,[91,244,1259,412],[423,244,594,412],[38,156,1366,588],null,[209,156,1022,588],[423,244,594,412],[242,244,957,412],null];
  const SHAPES_SP = [[44,321,312,216],[32,357,336,144],[-73,240,546,378],null,[15,301,370,256],[-64,343,528,173],[80,346,240,166],null,[13,368,376,123],[44,321,311,216],[-144,281,688,296],null,[15,323,369,212],[44,330,312,199],[-87,305,575,248],null];
  const MESSAGE_PC = [883, 177, 378, 546];

  const st = { cx: 0, cy: 0, w: 0, h: 0, intro: reduce ? 1 : 0 };
  const box = () => ({ W: media.clientWidth, H: media.clientHeight });
  const toPx = (s) => {
    const { W, H } = box();
    if (!s) {
      const k = capsule.cover(W, H, 463, 320) * 1.02;
      return { cx: W / 2, cy: H / 2, w: 463 * k, h: 320 * k };
    }
    const pc = isPc();
    const k = W / (pc ? 1440 : 400);
    const midY = pc ? 450 : 429;
    return { cx: (s[0] + s[2] / 2) * k, cy: H / 2 + (s[1] + s[3] / 2 - midY) * k, w: s[2] * k, h: s[3] * k };
  };
  const draw = () => {
    clip.style.clipPath = capsule.poly(st.cx, st.cy, Math.max(0, st.w * st.intro), Math.max(0, st.h * st.intro));
  };
  const shapeOf = (step) => (isPc() ? SHAPES_PC : SHAPES_SP)[step % 16];
  let step = 0;
  let isFull = false;
  const morph = (target, vars = {}) => new Promise((done) => {
    gsap.killTweensOf(st, "cx,cy,w,h");
    gsap.to(st, { ...toPx(target), duration: 0.5, ease: "power3.inOut", ...vars, onUpdate: draw, onComplete: done });
  });
  const goShape = async (s) => {
    if (!s) {
      isFull = true;
      morph(null, { duration: 0.6, ease: "power3.inOut" });
      await wait(100);
      body.classList.add("fv-full");
      return;
    }
    if (isFull) {
      isFull = false;
      await wait(100);
      body.classList.remove("fv-full");
      return morph(s, { duration: 0.5, ease: "power4.out" });
    }
    return morph(s);
  };
  Object.assign(st, toPx(shapeOf(0)));
  draw();

  // Wordmark flow: PC 72px/s, phone 50px/s. The black and white rows move in sync to the same position
  let mx = 0;
  let marqueeOn = true;
  const firstMark = tracks[0].children[0];
  gsap.ticker.add((_, dt) => {
    if (reduce || !marqueeOn) return;
    const span = firstMark.offsetWidth + parseFloat(getComputedStyle(tracks[0]).columnGap || 0);
    mx -= ((isPc() ? 72 : 50) * dt) / 1000;
    if (-mx >= span) mx += span;
    tracks.forEach((t) => (t.style.transform = `translate3d(${mx}px,0,0)`));
  });

  // The word ”Scroll” rolls up and changes one letter at a time
  const scrollLabel = $(".fv__scroll");
  scrollLabel.innerHTML = [...scrollLabel.textContent].map((c) => `<span><span>${c}</span><span>${c}</span></span>`).join("");
  if (!reduce) {
    gsap.timeline({ repeat: -1, repeatDelay: 1.6 })
      .to($$(".fv__scroll > span > span", scrollLabel), { yPercent: -100, duration: 0.6, ease: "power3.inOut", stagger: 0.04 })
      .set($$(".fv__scroll > span > span", scrollLabel), { yPercent: 0 });
  }

  // Capsule photo swap (4s) and message photo swap (4s)
  const kv = gsap.delayedCall(4, function tick() {
    const prev = step % items.length;
    step += 1;
    const next = step % items.length;
    document.dispatchEvent(new CustomEvent("u:fv-tick"));
    goShape(shapeOf(step));
    gridFx({ pulse: true });
    setTimeout(() => {
      items[next].classList.add("is-active");
      setTimeout(() => items[prev].classList.remove("is-active"), 200);
    }, 100);
    kv.restart(true);
  }).pause();
  let msgIndex = 0;
  const msgTimer = gsap.delayedCall(4, () => {
    const prev = msgIndex;
    msgIndex = (msgIndex + 1) % msgItems.length;
    msgItems[msgIndex].classList.add("is-active");
    setTimeout(() => msgItems[prev].classList.remove("is-active"), 200);
    msgTimer.restart(true);
  }).pause();

  // Message mode: when scrolling starts the capsule becomes a vertical capsule on the right, and returns to its original place at the top
  let msgOn = false;
  let started = false;
  const enterMessage = async () => {
    if (msgOn) return;
    msgOn = true;
    kv.pause();
    body.classList.add("fv-message");
    if (!isPc()) return;
    msgTimer.restart(true);
    if (isFull) { isFull = false; body.classList.remove("fv-full"); }
    await morph(SHAPES_PC[0], { duration: 0.3, ease: "power1.inOut" });
    if (msgOn) morph(MESSAGE_PC, { duration: 0.8, ease: "elastic.out(0.9,1.2)" });
  };
  const exitMessage = () => {
    if (!msgOn) return;
    msgOn = false;
    msgTimer.pause();
    body.classList.remove("fv-message");
    goShape(shapeOf(step));
    kv.restart(true);
  };
  addEventListener("scroll", () => {
    if (!started) return;
    scrollY > 0 ? enterMessage() : exitMessage();
  }, { passive: true });
  addEventListener("resize", () => {
    Object.assign(st, toPx(msgOn && isPc() ? MESSAGE_PC : isFull ? null : shapeOf(step)));
    draw();
  });

  // Loader: the O stretches long by progress, and when done it returns, then the capsule window opens with a spring
  const begin = () => {
    started = true;
    body.classList.remove("is-loading");
    uSite.ready();
    lenis?.start();
    gridFx({ pulse: true });
    gsap.to(st, { intro: 1, duration: reduce ? 0 : 1, delay: reduce ? 0 : 0.3, ease: "elastic.out(1, 1)", onUpdate: draw });
    if (!reduce) kv.restart(true);
    if (scrollY > 0) enterMessage();
  };
  if (reduce) { begin(); }
  else {
    lenis?.stop();
    const em = parseFloat(getComputedStyle(bigO.parentElement).fontSize);
    const load = { p: 0 };
    const setO = () => {
      bigO.style.transition = "none";
      bigO.style.width = `${(1.12 + load.p * 2.5) * em}px`;
      num.textContent = Math.round(load.p * 100);
    };
    gsap.timeline()
      .to(load, { p: 0.8, duration: 1.2, ease: "power1.inOut", onUpdate: setO })
      .to(load, { p: 1, duration: 0.5, ease: "power4.inOut", onUpdate: setO })
      .to(load, { p: 0, duration: 0.35, ease: "power3.inOut", delay: 0.13, onUpdate: () => { bigO.style.width = `${(1.12 + load.p * 2.5) * em}px`; } })
      .add(() => { bigO.style.width = ""; bigO.style.transition = ""; }, "+=0.4")
      .add(begin);
  }

  // ── Cube: enters, spins out from behind, and the front face settles ──
  const easeOutCubic = (t) => 1 - (1 - t) ** 3;
  $$("[data-cube]").forEach((cube) => {
    const boxEl = $(".cube__box", cube);
    const icon = $(".cube__icon", cube);
    if (reduce) return;
    const pop = () => gsap.fromTo(icon, { scale: 0 }, { scale: 1, duration: 0.8, ease: "elastic.out(0.9,1.2)", delay: 0.15 });
    ScrollTrigger.create({
      trigger: cube, start: "top bottom", end: "top top", scrub: true,
      onUpdate: (self) => {
        const r = easeOutCubic(self.progress);
        const y = 100 * (1 - r);
        const z = -500 + 450 * r;
        const ry = -180 * (1 - r);
        boxEl.style.transform = `translate3d(0, ${y}%, ${z}cqw) rotateY(${ry}deg)`;
      },
      onEnter: pop, onEnterBack: pop,
    });
  });

  // ── Service: capsule grows from a small size until it swallows the screen, and on leaving grows slightly and droops ──
  const svcBg = $("[data-svc-bg]");
  const svcClip = $("[data-svc-clip]");
  const svc = { target: 0, p: 0, leave: 0 };
  const easeInCirc = (t) => 1 - Math.sqrt(1 - t * t);
  ScrollTrigger.create({ trigger: "[data-svc-anchor]", start: "top bottom", end: "top top", onUpdate: (s) => (svc.target = s.progress) });
  ScrollTrigger.create({ trigger: "[data-svc-leave]", start: "top bottom", end: "bottom bottom", onUpdate: (s) => (svc.leave = s.progress) });
  const drawSvc = () => {
    svc.p += (svc.target - svc.p) * (reduce ? 1 : 0.15);
    const W = svcBg.clientWidth, H = svcBg.clientHeight;
    const minW = isPc() ? 463 * (W / 1440) : 217 * (W / 400);
    const maxK = capsule.cover(W, H, 463, 320) * 1.02;
    const w = minW + (463 * maxK - minW) * easeInCirc(Math.min(1, svc.p));
    svcClip.style.clipPath = capsule.poly(W / 2, H / 2, w, w / capsule.ASPECT);
    const sc = 1 + 0.25 * svc.leave;
    svcClip.style.transform = svc.leave > 0 ? `translate3d(0, ${30 * svc.leave}px, 0) scale(${sc})` : "";
  };
  gsap.ticker.add(drawSvc);
  const rotate = (list, i, cls = "is-in") => { list.forEach((el, k) => el.classList.toggle(cls, k === i)); };
  const bgItems = $$(".svc__bg-item"), thumbItems = $$(".svc__thumb-item"), labels = $$(".svc__label");
  let svcI = 0;
  if (!reduce) setInterval(() => {
    svcI = (svcI + 1) % 4;
    rotate(bgItems, svcI);
    rotate(thumbItems, svcI);
    rotate(labels, svcI, "is-on");
  }, 3000);

  // ── Project slider: drag (lerp .2), prev/next buttons ──
  const vp = $("[data-proj]");
  const list = $("[data-proj-list]");
  const sl = { x: 0, target: 0 };
  const maxX = () => Math.min(0, vp.clientWidth - list.scrollWidth);
  const clampX = (v) => Math.max(maxX(), Math.min(0, v));
  const cardW = () => list.children[0].offsetWidth;
  gsap.ticker.add(() => {
    sl.x += (sl.target - sl.x) * (reduce ? 1 : 0.2);
    list.style.transform = `translate3d(${sl.x.toFixed(2)}px,0,0)`;
  });
  $("[data-proj-prev]").addEventListener("click", () => (sl.target = clampX(Math.round(sl.target / cardW()) * cardW() + cardW())));
  $("[data-proj-next]").addEventListener("click", () => (sl.target = clampX(Math.round(sl.target / cardW()) * cardW() - cardW())));
  let drag = null;
  vp.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, start: sl.target, moved: false }; vp.classList.add("is-drag"); });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    sl.target = clampX(drag.start + dx);
  });
  addEventListener("pointerup", () => { if (drag) vp.classList.remove("is-drag"); setTimeout(() => (drag = null)); });
  vp.addEventListener("click", (e) => { if (drag?.moved) e.preventDefault(); }, true);

  // ── Company scene: dark photo fills the screen → link pill → capsule shrinks to 0 and the background goes black ──
  const corImage = $("[data-cor-image]");
  const corClip = $("[data-cor-clip]");
  const corCover = $("[data-cor-cover]");
  const corLinks = $(".cor__links-in");
  const clamp01 = gsap.utils.clamp(0, 1);
  // Past halfway through the project section the grid doubles its cells, and when the company scene darkens it returns to default cells with a ripple
  let passedFeatured = false, corActive = false;
  const syncGridZoom = () => gridFx({ zoom: passedFeatured && !corActive ? 2 : 1 });
  ScrollTrigger.create({
    trigger: vp.closest("section") || vp, start: "top 50%",
    onEnter: () => { passedFeatured = true; syncGridZoom(); },
    onLeaveBack: () => { passedFeatured = false; syncGridZoom(); },
  });
  const drawCor = (p) => {
    const W = innerWidth, H = innerHeight;
    const show = clamp01((p - 0.06) / 0.08);
    corImage.style.opacity = show;
    corImage.style.visibility = show > 0 ? "visible" : "hidden";
    body.classList.toggle("is-dark", p > 0.1);
    if (p > 0.1 !== corActive) {
      corActive = p > 0.1;
      syncGridZoom();
      if (corActive) gridFx({ pulse: true });
    }
    corLinks.classList.toggle("is-in", p > 0.16 && p < 0.42);
    const shrink = clamp01((p - 0.14) / 0.68);
    const k = capsule.cover(W, H, 463, 320) * 1.02;
    const kk = k * (1 - shrink) ** 1.35;
    corClip.style.clipPath = capsule.poly(W / 2, H / 2, 463 * kk, 320 * kk);
    corCover.style.opacity = 1 - clamp01((p - 0.42) / 0.14);
  };
  ScrollTrigger.create({ trigger: "[data-cor]", start: "top bottom", end: "bottom bottom", onUpdate: (s) => drawCor(s.progress), onLeaveBack: () => drawCor(0) });
  drawCor(0);

  const recPics = $$(".rec__pic");
  let recI = 0;
  if (!reduce) setInterval(() => {
    const prev = recI;
    recI = (recI + 1) % recPics.length;
    recPics[recI].classList.add("is-in");
    recPics[prev].classList.remove("is-in");
  }, 4000);
});
