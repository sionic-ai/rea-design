// First page motion. Values ported from the original component code (hero entrance, expanding video, service cards, work slider, testimonial panel, contact form).
(() => {
  const { reduce, isDesk, onReady, stairs } = window.M1;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const hero = $(".hero"), reel = $(".reel"), preview = $(".hero-preview");

  const drawStairs = () => {
    stairs($(".hero-stairs"), { cell: isDesk() ? 32 : 20, thick: isDesk() ? 6 : 5, slope: (hero.offsetHeight / hero.offsetWidth) * 0.95, start: 1.02, seed: 7 });
    $$(".svc-stairs").forEach((svg, i) => stairs(svg, { cell: isDesk() ? 96 : 48, thick: 3, slope: 0.42, start: 1.05, seed: 3 + i * 5 }));
  };
  drawStairs();
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(drawStairs, 200); });

  $("[data-scroll-next]").addEventListener("click", () => (window.lenis ? lenis.scrollTo(reel, { duration: 1.5 }) : reel.scrollIntoView()));
  // Showreel: pressing ‹Watch showreel› raises the main film (with sound), which plays from the start while the control bar appears — pause · scrub drag · time (min.sec) · mute · size
  const rv = $(".reel-video"), pauseB = $(".reel-pause"), bar = $(".reel-bar input"), barIn = $(".reel-bar-in"), time = $(".reel-time"), vol = $(".reel-vol");
  const pad = (n) => String(Math.floor(n)).padStart(2, "0");
  $(".reel-play").addEventListener("click", () => {
    if (!rv.src) rv.src = rv.dataset.src;
    reel.classList.add("is-playing");
    rv.play().catch(() => {});
  });
  pauseB.addEventListener("click", () => (rv.paused ? rv.play().catch(() => {}) : rv.pause()));
  rv.addEventListener("play", () => { pauseB.classList.remove("is-paused"); pauseB.setAttribute("aria-label", "Video paused"); });
  rv.addEventListener("pause", () => { pauseB.classList.add("is-paused"); pauseB.setAttribute("aria-label", "Video playback"); });
  rv.addEventListener("timeupdate", () => {
    const p = rv.duration ? rv.currentTime / rv.duration : 0;
    barIn.style.width = `${p * 100}%`; bar.value = p;
    time.textContent = `${pad(rv.currentTime / 60)}.${pad(rv.currentTime % 60)}`;
  });
  rv.addEventListener("ended", () => reel.classList.remove("is-playing"));
  bar.addEventListener("input", () => rv.duration && (rv.currentTime = bar.value * rv.duration));
  $(".reel-mute").addEventListener("click", (e) => { rv.muted = !rv.muted; vol.classList.toggle("is-muted", rv.muted); e.currentTarget.setAttribute("aria-pressed", String(rv.muted)); });
  $(".reel-vol input").addEventListener("input", (e) => { rv.volume = +e.target.value; vol.querySelectorAll(".bars i").forEach((b, i) => (b.style.opacity = rv.volume > i / 4 ? 1 : 0.25)); });

  // ── Preview → showreel expansion (original expandingImage: scrub .5, x·y·scale centered, rotate→0, corners→0) ──
  preview.style.rotate = "none";
  gsap.set(preview, { rotate: isDesk() ? 14 : 8 });
  const expandTl = () => {
    gsap.set(preview, { clearProps: "left,right" });
    gsap.set(preview, { left: preview.offsetLeft, right: "auto" });
    const s = { x: preview.offsetLeft, y: preview.offsetTop, w: preview.offsetWidth, h: preview.offsetHeight };
    const e = { x: 0, y: reel.offsetTop - hero.offsetTop, w: reel.offsetWidth, h: reel.offsetHeight };
    const tl = gsap.timeline({ paused: reduce, defaults: { duration: 0.5, ease: "none" },
      scrollTrigger: reduce ? undefined : { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true } });
    // The original grows with scale, but this grows by width and height so the placeholder label doesn’t grow with it (the end shape is the same)
    tl.fromTo(preview, { x: 0, y: 0, width: s.w, height: s.h, rotate: isDesk() ? 14 : 8, borderRadius: isDesk() ? "40px 0px 40px 40px" : "24px 0px 24px 24px" },
      { x: e.x - s.x, y: e.y - s.y, width: e.w, height: e.h, rotate: 0, borderRadius: "0px 0px 0px 0px" });
    tl.to(".hero-l1", { x: () => -innerWidth * 0.6 }, "<").to(".hero-l2", { x: () => innerWidth * 0.6 }, "<");
    if (reduce) tl.progress(1);
    return tl;
  };

  if (reduce) expandTl();
  const mm = gsap.matchMedia();
  if (!reduce) mm.add({ desk: "(min-width: 1024px)", mob: "(max-width: 1023px)" }, (ctx) => {
    const { desk } = ctx.conditions;
    expandTl();

    // Pixel dots beside the showreel: light up in random order on entry
    gsap.timeline({ scrollTrigger: { trigger: reel, start: "top bottom-=100px", toggleActions: "none play reverse none" } })
      .from(".reel-deco i", { opacity: 0, stagger: { each: 0.05, from: "random" }, duration: 0.3 });

    // ── Service cards: even ones enter from the left at +8°, odd ones from the right at −8°, and once past the top 20% the inside tilts the opposite way and drops out ──
    const r = desk ? 8 : 4, t = desk ? 10 : 5;
    $$("[data-card]").forEach((card, d) => {
      const even = d % 2 === 0;
      gsap.from(card, { rotate: even ? r : -r, xPercent: even ? -t : t, ease: "power1.out", scrollTrigger: { trigger: card, start: "top bottom", end: "top 20%", scrub: true } });
      gsap.to(card.querySelector(".svc-in"), { rotate: even ? -r : r, xPercent: even ? -t : t, ease: "power1.in", scrollTrigger: { trigger: card, start: "top 20%", end: "bottom top", scrub: true } });
    });

    // ── Work heading: two words gather 30px inward from outside ──
    gsap.timeline({ scrollTrigger: { trigger: ".work-top", scrub: true, start: "top bottom", end: "bottom top" } })
      .from(".work-hl", { x: desk ? 30 : 12, ease: "power2.out" }, 0)
      .from(".work-hr", { x: desk ? -30 : -12, ease: "power2.out" }, 0);
    gsap.from(".face rect", { autoAlpha: 0, stagger: { each: 0.03, from: "random" }, duration: 0.2, scrollTrigger: { trigger: ".face", start: "top bottom" } });

    // ── Contact heading: left line moves +75, right line −75, so they stagger ──
    gsap.timeline({ scrollTrigger: { trigger: ".contact", scrub: true, start: "top bottom", end: "bottom top" } })
      .to(".contact-hl", { x: desk ? 75 : 25, ease: "none" }, 0)
      .to(".contact-hr", { x: desk ? -75 : -25, ease: "none" }, 0);

    // ── Hero title (original initTextParallax, desktop only): following the cursor x, the top line goes 6→−14px and the bottom line −6→14px, staggered — 1s power2.out ──
    if (desk) {
      const [inA, inB] = $$(".hero-in");
      const toA = gsap.quickTo(inA, "x", { duration: 1, ease: "power2.out" }), toB = gsap.quickTo(inB, "x", { duration: 1, ease: "power2.out" });
      const mapA = gsap.utils.mapRange(0, innerWidth, 6, -14), mapB = gsap.utils.mapRange(0, innerWidth, -6, 14);
      // The vault frame button (.wf-ui) is an overlay outside the site, so the cursor is treated as being over the hero beneath it
      const onMove = (e) => {
        if (!e.target.closest(".hero") && !(e.target.closest(".wf-ui") && e.clientY < hero.getBoundingClientRect().bottom)) return;
        toA(mapA(e.clientX)); toB(mapB(e.clientX));
      };
      document.addEventListener("mousemove", onMove);
      return () => document.removeEventListener("mousemove", onMove);
    }
  });

  // ── Hero entrance (original entranceTimeline) ──
  const split1 = SplitText.create(".hero-l1", { type: "chars", charsClass: "ch" });
  const split2 = SplitText.create(".hero-l2", { type: "chars", charsClass: "ch" });
  gsap.set([".hero-l1", ".hero-l2"], { transformOrigin: "50% 50%" });
  const enter = gsap.timeline({ paused: true })
    .from(".hero-l1", { scale: 0.1, duration: 1, ease: "smooth" })
    .from(split1.chars, { y: (i) => (i % 2 === 0 ? "-100%" : "100%"), duration: 0.7, ease: "slowDown", stagger: { each: 0.03, from: "random" } }, "<")
    .from(".hero-l2", { scale: 0.1, duration: 1, ease: "smooth" }, "<")
    .from(split2.chars, { y: (i) => (i % 2 === 0 ? "-100%" : "100%"), duration: 0.7, ease: "slowDown", stagger: { each: 0.03, from: "random" } }, "<")
    .from(preview, { autoAlpha: 0, duration: 0.6 }, "<0.3")
    .from(".scroll-btn", { x: 600, y: 150, duration: 1.5, ease: "elastic.out(1, 1)" }, "<")
    .from(".scroll-btn", { opacity: 0, duration: 1 }, "<+0.1")
    .from(".hero-sub", { yPercent: 40, autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, "<");
  onReady(() => { if (reduce) return enter.progress(1); enter.play(); trailLoop(); });

  // ── Hero trail (original WebGL trail, 1024 and up): split each stepped path’s curve evenly into 100 points and place 100px cells, turn them on one by one at .01s intervals (1s) then off one by one (1s).
  //  Four paths in turn — rest 3s, on, off — endlessly, only while the Hero is on screen. Path shapes are our own zigzag (original coordinates not copied) ──
  const TRAILS = [
    { box: { top: 0, right: 0 }, w: 0.77, max: 1475, vb: [1477, 1186], pts: [[0.43, 0], [0.1, 0.33], [0, 0.47], [0.3, 0.37], [0.69, 0.17], [0.47, 0.37], [0.25, 0.64], [0.6, 0.48], [1, 0.34], [0.7, 0.55], [0.5, 0.75], [0.38, 1]] },
    { box: { top: -90, left: -120 }, w: 0.9, max: 1724, vb: [1716, 910], pts: [[0, 0.12], [0.3, 0.02], [0.58, 0], [0.42, 0.25], [0.2, 0.62], [0.5, 0.45], [0.86, 0.3], [0.64, 0.6], [0.48, 1]] },
    { box: { top: -145, left: -250 }, w: 0.65, max: 1251, vb: [1253, 1209], pts: [[0.62, 0], [0.4, 0.14], [0.08, 0.38], [0.36, 0.3], [0.78, 0.2], [0.55, 0.42], [0.3, 0.7], [0.62, 0.58], [1, 0.5], [0.74, 0.74], [0.56, 1]] },
    { box: { top: -132, right: -167 }, w: 0.625, max: 1200, vb: [1198, 1391], pts: [[0.5, 0], [0.22, 0.2], [0, 0.4], [0.35, 0.3], [0.8, 0.16], [0.56, 0.4], [0.3, 0.66], [0.66, 0.54], [1, 0.46], [0.72, 0.7], [0.48, 1]] },
  ];
  const trailLoop = () => {
    const host = $(".hero-trail");
    if (!window.THREE || !host || !isDesk() || reduce) return;
    const T = THREE, N = 100, SIZE = 100;
    const R = new T.WebGLRenderer({ alpha: true, antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    host.append(R.domElement);
    const scene = new T.Scene(), cam = new T.OrthographicCamera(0, 1, 0, 1, -1, 1);
    const mat = new T.ShaderMaterial({
      transparent: true, side: T.DoubleSide,
      uniforms: { uColor: { value: new T.Color().setRGB(...M1.css2rgb(getComputedStyle(host).color), T.SRGBColorSpace) } },
      vertexShader: "attribute float aOn; varying float vOn; void main() { vOn = aOn; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 uColor; varying float vOn; void main() { if (vOn < 0.5) discard; gl_FragColor = vec4(uColor, 1.0);\n#include <colorspace_fragment>\n}",
    });
    const trails = TRAILS.map((d) => {
      const geo = new T.PlaneGeometry(1, 1), on = new Float32Array(N);
      geo.setAttribute("aOn", new T.InstancedBufferAttribute(on, 1));
      const mesh = new T.InstancedMesh(geo, mat, N);
      scene.add(mesh);
      const draw = (k) => { for (let i = 0; i < N; i++) on[i] = k(i) ? 1 : 0; geo.attributes.aOn.needsUpdate = true; };
      // On and off follow cell order (.01s interval). Receives only progress and paints by how many cells are reached
      const state = { in: 0, out: 0 };
      const paint = () => draw((i) => i < Math.round(state.in * N) && i >= Math.round(state.out * N));
      return { d, mesh, state, paint };
    });
    const layout = () => {
      const W = hero.offsetWidth, H = hero.offsetHeight;
      R.setSize(W, H, false);
      Object.assign(cam, { left: 0, right: W, top: 0, bottom: H });
      cam.updateProjectionMatrix();
      const m = new T.Matrix4(), s = new T.Matrix4().makeScale(SIZE, SIZE, 1);
      trails.forEach(({ d, mesh }) => {
        const w = Math.min(innerWidth * d.w, d.max), h = (w * d.vb[1]) / d.vb[0];
        const x0 = d.box.left != null ? d.box.left : W - w - d.box.right, y0 = d.box.top;
        const curve = new T.CatmullRomCurve3(d.pts.map(([x, y]) => new T.Vector3(x0 + x * w, y0 + y * h, 0)), false, "catmullrom", 0.5);
        curve.getSpacedPoints(N - 1).forEach((p, i) => mesh.setMatrixAt(i, m.makeTranslation(p.x, p.y, 0).multiply(s)));
        mesh.instanceMatrix.needsUpdate = true;
      });
    };
    layout();
    addEventListener("resize", layout);
    const order = trails.slice(1).concat(trails[0]);
    const tl = gsap.timeline({ repeat: -1, onUpdate: () => R.render(scene, cam), scrollTrigger: { trigger: hero, start: "top bottom", end: "bottom top", toggleActions: "restart pause restart pause" } });
    order.forEach((tr) => {
      tl.set(tr.state, { in: 0, out: 0, onComplete: tr.paint }, ">+3")
        .to(tr.state, { in: 1, duration: 1, ease: "none", onUpdate: tr.paint })
        .to(tr.state, { out: 1, duration: 1, ease: "none", onUpdate: tr.paint });
    });
    trails.forEach((tr) => tr.paint());
    R.render(scene, cam);
  };

  // ── Logo stickers (original): on desktop a mouse trail — in the 80% panel above the Work header, each time the mouse moves 1/6 of the panel width (throttled at 32ms intervals)
  //    One sticker pops in place at ±22.5° from .5x to 1x (.2s slowDown), is pushed 4x the pointer movement up to 20px max (1.2s power4.out), and vanishes after .1s.
  //    When the panel head reaches screen center, three cards burst into grid slots .05s apart (32 cards reused). On phone, a randomly tilted strip flows at 10px/s and has inertia when dragged ──
  const stkTrack = $(".stk-track"), stkBox = $(".stickers");
  const srcStk = $$(".stk", stkTrack);
  gsap.matchMedia().add({ desk: "(min-width: 1024px)", mob: "(max-width: 1023px)", rm: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { desk, rm } = ctx.conditions;
    if (desk) {
      if (rm) return;
      const target = document.createElement("div");
      target.className = "stk-mouse";
      $(".work-top").append(target);
      stkBox.hidden = true;
      const CFG = { pool: 32, xOff: 80, yOff: 10, maxRot: 45, speed: 4, maxTravel: 20, travel: 1.2, burst: 3, burstStagger: 0.05 };
      const shuffled = gsap.utils.shuffle(srcStk.slice());
      const pool = Array.from({ length: CFG.pool }, (_, i) => {
        const el = shuffled[i % shuffled.length].cloneNode(true);
        el.classList.add("is-flying");
        gsap.set(el, { autoAlpha: 0, scale: 0 });
        target.append(el);
        return { el, busy: false, tl: null };
      });
      const live = new Set();
      let rect = target.getBoundingClientRect(), reset = rect.width / 6, acc = 0, old = { x: 0, y: 0 }, lastT = 0;
      const take = () => {
        const free = pool.find((s) => !s.busy);
        if (free) return free;
        const s = live.values().next().value;
        if (!s) return null;
        s.tl && s.tl.kill(); live.delete(s);
        return s;
      };
      const spawn = (x, y, dx, dy) => {
        const s = take();
        if (!s) return;
        s.busy = true; live.add(s);
        const clampT = (v) => Math.min(Math.max(v * CFG.speed, -CFG.maxTravel), CFG.maxTravel);
        gsap.set(s.el, { autoAlpha: 1, x, y, xPercent: -50 + (Math.random() - 0.5) * CFG.xOff, yPercent: -50 + (Math.random() - 0.5) * CFG.yOff, rotation: (Math.random() - 0.5) * CFG.maxRot, scale: 0.5 });
        s.tl = gsap.timeline({ onComplete: () => { s.busy = false; live.delete(s); gsap.set(s.el, { autoAlpha: 0, scale: 0 }); } })
          .to(s.el, { scale: 1, ease: "slowDown", duration: 0.2 })
          .to(s.el, { x: `+=${clampT(dx)}`, y: `+=${clampT(dy)}`, ease: "power4.out", duration: CFG.travel }, "<")
          .to(s.el, { scale: 0, duration: 0, delay: 0.1 }, ">");
      };
      const move = (e) => {
        const now = Date.now();
        if (now - lastT < 32) return;
        lastT = now;
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        acc += Math.abs(x - old.x) + Math.abs(y - old.y);
        if (acc > reset) { acc = 0; spawn(x, y, x - old.x, y - old.y); }
        old = { x, y };
      };
      const measure = () => { rect = target.getBoundingClientRect(); reset = rect.width / 6; };
      target.addEventListener("mouseenter", measure);
      target.addEventListener("mousemove", move);
      addEventListener("resize", measure);
      ScrollTrigger.create({ trigger: target, start: "top center", once: true, onEnter: () => {
        measure();
        const pad = 60, w = rect.width - pad * 2, h = rect.height - pad * 2, cols = Math.ceil(Math.sqrt(CFG.burst)), rows = Math.ceil(CFG.burst / cols), cw = w / cols, ch = h / rows;
        for (let i = 0; i < CFG.burst; i++) gsap.delayedCall(i * CFG.burstStagger, () => spawn(pad + (i % cols) * cw + cw / 2 + (Math.random() - 0.5) * cw * 0.75, pad + Math.floor(i / cols) * ch + ch / 2 + (Math.random() - 0.5) * ch * 0.75, 0, 0));
      } });
      return () => { target.remove(); stkBox.hidden = false; removeEventListener("resize", measure); };
    }
    // Phone: two copies joined flow at 10px/s, and on drag it is pushed by inertia (resistance 5000, .8~3s) then flows again
    if (!stkTrack.dataset.doubled) { stkTrack.innerHTML += stkTrack.innerHTML; stkTrack.dataset.doubled = "1"; }
    gsap.set($$(".stk", stkTrack), { rotation: () => gsap.utils.random(-35, 35), height: () => Math.floor(Math.random() * 46 + 75), y: () => gsap.utils.random(0, 30), x: () => gsap.utils.random(-50, 50) });
    const stk = { x: 0, v: rm ? 0 : -10 };
    const half = () => stkTrack.scrollWidth / 2;
    const proxy = document.createElement("div");
    let lastX = 0;
    const drag = Draggable.create(proxy, { trigger: ".stickers", type: "x", inertia: true, resistance: 5000, minDuration: 0.8, maxDuration: 3,
      onPress() { lastX = this.x; }, onDrag() { stk.x += this.x - lastX; lastX = this.x; }, onThrowUpdate() { stk.x += this.x - lastX; lastX = this.x; } })[0];
    let seen = false;
    const io = new IntersectionObserver((e) => (seen = e[0].isIntersecting));
    io.observe(stkBox);
    const tick = (time, dt) => {
      if (seen && !drag.isPressed && !drag.isThrowing) stk.x += (stk.v * dt) / 1000;
      const h = half();
      stk.x = ((stk.x % h) - h) % h;
      gsap.set(stkTrack, { x: stk.x });
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); drag.kill(); io.disconnect(); };
  });

  // ── Work card slider + dot paging (original: inertia · resistance 2500 · max 1 second, snaps to a card slot) ──
  const slider = $(".cs-slider"), track = $(".cs-track"), dotsBox = $(".cs-dots"), knob = $(".cs-knob");
  let snaps = [], sDrag, kDrag;
  const pitch = 14;
  const setKnob = () => {
    const min = sDrag.minX || -1, p = min ? gsap.utils.clamp(0, 1, sDrag.x / min) : 0;
    gsap.set(knob, { x: p * (snaps.length - 1) * pitch });
  };
  const buildSlider = () => {
    const cards = $$(".cs-card", track).filter((c) => c.style.display !== "none");
    const max = Math.max(0, track.scrollWidth - (slider.clientWidth - parseFloat(getComputedStyle(slider).paddingLeft)) + 40);
    snaps = cards.map((c) => -Math.min(c.offsetLeft, max)).filter((v, i, a) => a.indexOf(v) === i);
    dotsBox.innerHTML = snaps.map(() => "<i></i>").join("");
    sDrag && sDrag.kill();
    sDrag = Draggable.create(track, { type: "x", bounds: { minX: -max, maxX: 0 }, inertia: true, throwResistance: 2500, maxDuration: 1, edgeResistance: 0.85,
      snap: (v) => snaps.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), 0), onDrag: setKnob, onThrowUpdate: setKnob })[0];
    gsap.set(track, { x: 0 });
    sDrag.update();
    kDrag && kDrag.kill();
    kDrag = Draggable.create(knob, { type: "x", bounds: { minX: 0, maxX: (snaps.length - 1) * pitch }, inertia: true, throwResistance: 4000, maxDuration: 0.5,
      snap: (v) => Math.round(v / pitch) * pitch,
      onDrag() { gsap.set(track, { x: snaps[Math.round(this.x / pitch)] || 0 }); sDrag.update(); },
      onThrowUpdate() { gsap.to(track, { x: snaps[Math.round(this.x / pitch)] || 0, duration: 0.4, ease: "power3.out", onUpdate: () => sDrag.update() }); } })[0];
    setKnob();
  };
  buildSlider();
  addEventListener("resize", () => setTimeout(buildSlider, 200));

  // When a hand is on a case card, the name text rolls up one slot per line (original caseStudyCard text hover — same values as the common text rolling)
  $$(".cs-card .cs-name").forEach((n) => {
    const txt = n.lastChild;
    if (!txt || txt.nodeType !== 3) return;
    n.insertAdjacentHTML("beforeend", M1.roll(txt.textContent.trim()));
    txt.remove();
    n.closest(".cs-card").classList.add("roll-host");
  });

  $$(".filter-btns button").forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("is-on")) return;
    $$(".filter-btns button").forEach((x) => x.classList.toggle("is-on", x === b));
    const f = b.dataset.f;
    const cards = $$(".cs-card", track);
    gsap.to(cards, { autoAlpha: 0, duration: 0.25, onComplete: () => {
      cards.forEach((c) => (c.style.display = !f || c.dataset.cat.split(" ").includes(f) ? "" : "none"));
      buildSlider();
      gsap.to(cards.filter((c) => c.style.display !== "none"), { autoAlpha: 1, duration: 0.35, stagger: 0.05 });
    } });
  }));

  // ── Testimonial board: drag in any direction and the cross on the small map moves along. A ”Drag to explore” band sits at the cursor ──
  const tIn = $(".tst-in"), board = $(".tst-board"), cross = $(".tst-cross"), mapIn = $(".tst-map-in");
  const bx = () => Math.max(0, (board.offsetWidth - tIn.offsetWidth) / 2), by = () => Math.max(0, (board.offsetHeight - tIn.offsetHeight) / 2);
  const syncCross = () => {
    const px = bx() ? -gsap.getProperty(board, "x") / bx() : 0, py = by() ? -gsap.getProperty(board, "y") / by() : 0;
    gsap.set(cross, { x: px * (mapIn.clientWidth - cross.offsetWidth) / 2, y: py * (mapIn.clientHeight - cross.offsetHeight) / 2 });
  };
  const bDrag = Draggable.create(board, { type: "x,y", trigger: tIn, bounds: { minX: -bx(), maxX: bx(), minY: -by(), maxY: by() }, inertia: true, throwResistance: 1500, maxDuration: 1.5, edgeResistance: 0.9, onDrag: syncCross, onThrowUpdate: syncCross })[0];
  Draggable.create(cross, { type: "x,y", bounds: mapIn,
    onPress() { bDrag.disable(); },
    onDrag() {
      const kx = (mapIn.clientWidth - cross.offsetWidth) / 2, ky = (mapIn.clientHeight - cross.offsetHeight) / 2;
      gsap.set(board, { x: -(this.x / kx) * bx(), y: -(this.y / ky) * by() });
    },
    onRelease() { bDrag.enable(); bDrag.update(); } });
  mapIn.addEventListener("click", (e) => {
    if (e.target === cross) return;
    const r = mapIn.getBoundingClientRect();
    const fx = ((e.clientX - r.left) / r.width) * 2 - 1, fy = ((e.clientY - r.top) / r.height) * 2 - 1;
    gsap.to(board, { x: -fx * bx(), y: -fy * by(), duration: 0.35, ease: "power3.out", onUpdate: syncCross, onComplete: () => bDrag.update() });
  });

  const cur = $(".m-cursor"), curIn = $(".m-cursor-in");
  gsap.to(curIn, { xPercent: -33.333, duration: 4, repeat: -1, ease: "none" });
  if (isDesk()) {
    const qx = gsap.quickTo(cur, "x", { duration: 0.4, ease: "power3.out" }), qy = gsap.quickTo(cur, "y", { duration: 0.4, ease: "power3.out" });
    tIn.addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); });
    tIn.addEventListener("mouseenter", (e) => { gsap.set(cur, { x: e.clientX, y: e.clientY }); gsap.to(cur, { opacity: 1, scale: 1, duration: 0.3 }); });
    tIn.addEventListener("mouseleave", () => gsap.to(cur, { opacity: 0, scale: 0.6, duration: 0.3 }));
    tIn.addEventListener("pointerdown", () => gsap.to(cur, { scale: 0.85, duration: 0.2 }));
    tIn.addEventListener("pointerup", () => gsap.to(cur, { scale: 1, duration: 0.2 }));
  }

  // ── Contact form (original contactForm): tied to scroll, the angle shrinks from 12° (phone 6°) when the field top is at screen center to 8° (phone 3°) when the field bottom reaches the screen bottom,
  //    On hover · while typing, it stands up to 0° over .6s smooth-2 (tilt = Base angle × (1 − line amount)) ──
  const form = $(".c-form");
  form.style.rotate = "none";
  const fs = { base: isDesk() ? 12 : 6, k: 0, hover: false, focus: false };
  const setRot = () => gsap.set(form, { rotate: fs.base * (1 - fs.k) });
  ScrollTrigger.create({ trigger: ".contact", start: "top center", end: "bottom bottom", scrub: true, onUpdate: (st) => { const a = isDesk() ? 12 : 6, b = isDesk() ? 8 : 3; fs.base = a + (b - a) * st.progress; setRot(); } });
  let kt = null;
  const settle = () => { kt && kt.kill(); kt = gsap.to(fs, { k: fs.hover || fs.focus ? 1 : 0, duration: 0.6, ease: "smooth-2", onUpdate: setRot }); };
  form.addEventListener("mouseenter", () => { fs.hover = true; settle(); });
  form.addEventListener("mouseleave", () => { fs.hover = false; settle(); });
  form.addEventListener("focusin", () => { fs.focus = true; settle(); });
  form.addEventListener("focusout", () => { fs.focus = false; settle(); });
  setRot();
})();
