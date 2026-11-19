// Home page — Hero (lines rising · pill · side brush strokes), curve band (drawn, with text flowing along the path), About sentence pin (text color sweeping past),
// Photo strip (flows following scroll direction and speed, .95x toward the center), work card open, service icon Lottie, FAQ fold.
(() => {
  const TW = window.TW;
  const reduce = TW.reduce;
  const mm = gsap.matchMedia();

  TW.hero(document.querySelector(".tw-hero"));

  // ── Curve Band ──
  (() => {
    const band = document.querySelector(".tw-ribbon");
    if (!band) return;
    const tp = band.querySelector(".tw-ribbon__tp"), unit = band.querySelector(".tw-ribbon__unit");
    const paths = [band.querySelector(".tw-ribbon__bg"), band.querySelector(".tw-ribbon__mask")];
    if (reduce) return;
    const run = () => {
      const u = unit.getComputedTextLength() || 1600;
      gsap.fromTo(tp, { attr: { startOffset: 0 } }, { attr: { startOffset: -u }, duration: u / 75, ease: "none", repeat: -1 });
    };
    document.fonts?.ready ? document.fonts.ready.then(run) : run();
    const seg = { a: 1 };
    const paint = () => paths.forEach((p) => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = `${(1 - seg.a) * L} ${L * 2}`;
      p.style.strokeDashoffset = `${-seg.a * L}`;
    });
    paint();
    gsap.to(seg, { a: 0, delay: innerWidth < 991 ? 0.3 : 0, duration: 1.3, ease: "power2.out", onUpdate: paint, scrollTrigger: { trigger: band, start: "top 85%", once: true } });
  })();

  // ── Intro sentence pin — letters swell from pale orange to orange then sink to black, and the pill pops at 35·72·96% ──
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const sec = document.querySelector(".tw-about"), para = sec?.querySelector(".tw-about__para");
    if (!para) return;
    const split = new SplitText(para, { type: "chars,words", charsClass: "tw-char", wordsClass: "tw-chars-word" });
    const chars = split.chars, pills = [...sec.querySelectorAll(".tw-tag")];
    const RIM = "0.6px 0.6px 0 currentColor, -0.6px -0.6px 0 currentColor, 0.6px -0.6px 0 currentColor, -0.6px 0.6px 0 currentColor";
    gsap.set(chars, { "--o": 0.45, "--k": 0, scale: 1, rotation: 0, transformOrigin: "50% 50%", textShadow: "0px 0px 0px transparent" });
    gsap.set(pills, { opacity: 0, scale: 0.6, y: 24 });
    const dist = () => (innerWidth < 480 ? 1150 : innerWidth < 992 ? 1550 : 2200);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${dist()}`, pin: sec, pinSpacing: true, scrub: innerWidth < 992 ? 0.6 : 0.8, anticipatePin: 1, invalidateOnRefresh: true } });
    chars.forEach((c, i) => {
      const at = (i / chars.length) * 85;
      tl.to(c, { "--o": 1, scale: 1.12, rotation: () => gsap.utils.random(-4, 4), textShadow: RIM, duration: 3.5, ease: "power1.out" }, at)
        .to(c, { "--k": 1, scale: 1, rotation: 0, textShadow: "0px 0px 0px transparent", duration: 3.5, ease: "power1.inOut" }, at + 3.5);
    });
    [35, 72, 96].forEach((at, i) => pills[i] && tl.to(pills[i], { opacity: 1, scale: 1, y: 0, duration: 6, ease: "back.out(2)" }, at));
    return () => split.revert();
  });

  // ── Photo Band ──
  (() => {
    const wrap = document.querySelector(".tw-show__wrap"), track = wrap?.querySelector(".tw-show__track");
    if (!track) return;
    const first = [...track.children];
    const sets = Math.max(3, Math.ceil((innerWidth * 3.5) / (first[0].offsetWidth * first.length || 1000)));
    for (let s = 1; s < sets; s++) first.forEach((n) => { const c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); });
    const all = [...track.children];
    let setW = 0;
    const measure = () => { setW = all[first.length].offsetLeft - all[0].offsetLeft; };
    measure();
    addEventListener("resize", measure);
    let x = 0, want = -1, dir = -1, boost = 0;
    // The original strip is a board overflowing horizontally, so it can be pushed by hand: grab and drag with the mouse to move it that far, and release to let it flow again.
    let px = null;
    wrap.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") { px = e.clientX; wrap.setPointerCapture(e.pointerId); wrap.style.cursor = "grabbing"; } });
    wrap.addEventListener("pointermove", (e) => { if (px != null) { x += e.clientX - px; px = e.clientX; if (reduce) gsap.set(track, { x }); } });
    const up = () => { px = null; wrap.style.cursor = ""; };
    wrap.addEventListener("pointerup", up);
    wrap.addEventListener("pointercancel", up);
    if (reduce) return;
    ScrollTrigger.create({ trigger: document.querySelector(".tw-main"), start: "top top", end: "bottom bottom", onUpdate: (s) => {
      const d = s.direction === 1 ? -1 : 1;
      want = d;
      boost = Math.min(Math.abs(s.getVelocity() || 0) / 220, 10) * d;
    } });
    gsap.ticker.add(() => {
      dir += (want - dir) * 0.06;
      boost *= 0.92;
      x += 1.5 * dir + boost;
      if (setW > 0) { while (x <= -setW) x += setW; while (x > 0) x -= setW; }
      gsap.set(track, { x, force3D: true });
      const r = wrap.getBoundingClientRect(), mid = r.left + r.width / 2, half = r.width * 0.45 || 400;
      all.forEach((s) => {
        const b = s.getBoundingClientRect(), k = Math.min(1, Math.abs(b.left + b.width / 2 - mid) / half);
        s.style.transform = `scale(${(0.95 + 0.05 * k).toFixed(4)})`;
      });
    });
  })();

  TW.cards(document.querySelector(".tw-projects"));
  TW.ending(document.querySelector(".tw-ending"));

  // ── Service icons — with lottie-web like the original Lottie, our own shape animation (2s loop) ──
  (() => {
    if (!window.lottie) return;
    const K = (k) => ({ a: 0, k });
    const A = (keys) => ({ a: 1, k: keys.map(([t, s], i) => (i < keys.length - 1 ? { t, s, i: { x: [0.45], y: [1] }, o: { x: [0.55], y: [0] } } : { t, s })) });
    const TR = { ty: "tr", p: K([0, 0]), a: K([0, 0]), s: K([100, 100]), r: K(0), o: K(100), sk: K(0), sa: K(0) };
    const FILL = { ty: "fl", c: K([0, 0, 0, 1]), o: K(100), r: 1 };
    const rc = (w, h, x, y, r = 0) => ({ ty: "rc", d: 1, s: K([w, h]), p: K([x, y]), r: K(r) });
    const el = (w, h, x, y) => ({ ty: "el", d: 1, s: K([w, h]), p: K([x, y]) });
    const sh = (pts) => ({ ty: "sh", d: 1, ks: K({ c: true, v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) }) });
    let ind = 0;
    const layer = (cl, shapes, ks = {}) => ({
      ddd: 0, ind: ++ind, ty: 4, nm: cl, cl, sr: 1, ao: 0, ip: 0, op: 60, st: 0, bm: 0,
      ks: { o: K(100), r: K(0), p: K([100, 100, 0]), a: K([0, 0, 0]), s: K([100, 100, 100]), ...ks },
      shapes: [{ ty: "gr", it: [...shapes, FILL, TR] }],
    });
    const wob = A([[0, [-8]], [30, [8]], [60, [-8]]]);
    const bob = A([[0, [100, 104, 0]], [30, [100, 92, 0]], [60, [100, 104, 0]]]);
    const pulse = A([[0, [92, 92, 100]], [30, [108, 108, 100]], [60, [92, 92, 100]]]);
    const spin = A([[0, [0]], [60, [360]]]);
    const squash = A([[0, [100, 100, 100]], [15, [112, 88, 100]], [30, [94, 106, 100]], [60, [100, 100, 100]]]);
    const ICONS = [
      () => [layer("accent", [el(96, 96, 0, -18)], { r: wob }), layer("ink", [rc(44, 34, 0, 50, 8)], { r: wob })],
      () => [layer("ink", [rc(130, 130, 0, 0, 30)], { s: pulse }), layer("accent", [el(64, 64, 0, 0)], { s: pulse })],
      () => [layer("ink", [rc(150, 112, 0, 0, 12)], { p: bob }), layer("paper", [rc(134, 76, 0, 10, 6)], { p: bob }), layer("accent", [el(14, 14, -56, -40)], { p: bob })],
      () => [layer("accent", [rc(40, 130, 0, -14, 6)], { r: wob }), layer("ink", [sh([[-20, 51], [20, 51], [0, 86]])], { r: wob })],
      () => [layer("ink", [el(140, 140, 0, 0)], { r: spin }), layer("paper", [el(30, 30, 0, -38), el(30, 30, 0, 38), el(30, 30, -38, 0), el(30, 30, 38, 0)], { r: spin })],
      () => [layer("accent", [rc(130, 96, 0, 18, 6)], { s: squash }), layer("ink", [rc(150, 28, 0, -42, 6)], { s: squash })],
      () => [layer("accent", [el(140, 140, 0, 0)]), layer("ink", [sh([[0, -64], [22, 0], [0, 64], [-22, 0]])], { r: A([[0, [-20]], [30, [40]], [60, [-20]]]) })],
    ];
    document.querySelectorAll(".tw-lottie").forEach((box) => {
      const make = ICONS[+box.dataset.icon % ICONS.length];
      // lottie draws the front of the layer array on top — reverse the build order (bottom → top)
      const data = { v: "5.7.0", fr: 30, ip: 0, op: 60, w: 200, h: 200, nm: "icon", ddd: 0, assets: [], layers: make().reverse() };
      const a = lottie.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: !reduce, animationData: data });
      if (reduce) a.goToAndStop(0, true);
    });
  })();

  // ── FAQ — first question stays open, only the clicked question opens ──
  (() => {
    const items = [...document.querySelectorAll(".tw-faq__item")];
    if (!items.length) return;
    const W = () => (innerWidth >= 992 ? "50%" : "75%");
    let active = null;
    const parts = (it) => ({ q: it.querySelector(".tw-faq__q"), a: it.querySelector(".tw-faq__a"), logo: it.querySelector(".tw-faq__logo"), txt: it.querySelector(".tw-faq__ans p") });
    items.forEach((it, i) => {
      const { q, a, logo, txt } = parts(it);
      if (i === 0) {
        active = it;
        it.classList.add("is-open");
        gsap.set(q, { borderWidth: 1, width: W() });
        gsap.set(a, { height: "auto", display: "flex", overflow: "visible", scale: 1, opacity: 1 });
        gsap.set(logo, { scale: 1 });
        gsap.set(txt, { opacity: 1, y: 0 });
      } else {
        gsap.set(q, { borderWidth: 0, width: "100%" });
        gsap.set(a, { height: 0, display: "none", overflow: "hidden", scale: 0, opacity: 0 });
        gsap.set(logo, { scale: 0 });
        gsap.set(txt, { opacity: 0, y: 20 });
      }
    });
    const open = (it) => {
      const { q, a, logo, txt } = parts(it);
      it.classList.add("is-open");
      q.setAttribute("aria-expanded", "true");
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } }).to(q, { width: W(), borderWidth: 1, duration: 0.45 }, 0);
      gsap.set(a, { display: "flex", overflow: "hidden", opacity: 1 });
      tl.fromTo(a, { height: 0, scale: 0 }, { height: "auto", scale: 1, duration: 0.5, ease: "back.out(1.6)", onComplete: () => gsap.set(a, { overflow: "visible" }) }, 0.05)
        .to(logo, { scale: 1, duration: 0.45, ease: "back.out(2)" }, 0.15)
        .to(txt, { opacity: 1, y: 0, duration: 0.4 }, 0.35);
    };
    const close = (it) => {
      const { q, a, logo, txt } = parts(it);
      it.classList.remove("is-open");
      q.setAttribute("aria-expanded", "false");
      gsap.set(a, { overflow: "hidden" });
      gsap.timeline({ defaults: { ease: "power2.inOut" } })
        .to(txt, { opacity: 0, y: 15, duration: 0.22, ease: "power2.in" }, 0)
        .to(logo, { scale: 0, duration: 0.25, ease: "power2.in" }, 0.12)
        .to(a, { scale: 0, height: 0, opacity: 0, duration: 0.4, onComplete: () => gsap.set(a, { display: "none" }) }, 0.15)
        .to(q, { width: "100%", borderWidth: 0, duration: 0.45, ease: "power2.out" }, 0.18);
    };
    items.forEach((it) => it.querySelector(".tw-faq__q").addEventListener("click", () => {
      if (it === active) return;
      if (active) close(active);
      open(it);
      active = it;
    }));
    addEventListener("resize", () => active && gsap.set(active.querySelector(".tw-faq__q"), { width: W() }));
  })();
})();
