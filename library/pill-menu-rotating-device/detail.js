// Product detail scenes — original ProductHero · ProductIntro (flipping through 240 images) · ProductFeatures · ProductFeatureHighlight · ProductLead · ProductDevices
// The original scrolls through 240 rendered device images on a canvas. The copy draws a rounded-rectangle device with three on a canvas of the same size
// The same progress value (canvas from the screen bottom edge → out the top) cut into 240 steps — even the stepwise choppy feel is matched.
A.scene(({ reduce, observe, progress, fx, show, lenis }) => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // Hero: photo from 1.15x over 2.3s (power1.inOut), head up to .3 in .65s, icon · title .55s, body .8s, scroll-down 1.1s, memo up to .5 in 1.15s
  if (!reduce) {
    gsap.timeline()
      .fromTo($(".d-hero__img"), { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, duration: 2.3, ease: "power1.inOut", scale: 1 }, 0)
      .fromTo($(".d-hero__head"), { autoAlpha: 0 }, { autoAlpha: 0.3, duration: 1.1 }, 0.65)
      .fromTo($(".d-hero__icon"), { autoAlpha: 0, filter: "blur(10px)" }, { autoAlpha: 1, duration: 1.2, filter: "blur(0px)" }, 0.55)
      .call(() => fx.title($(".d-hero__title")), [], 0.55)
      .call(() => fx.copy($(".d-hero__copy"), 0.5), [], 0.8)
      .call(() => fx.scroll($(".d-hero__scroll")), [], 1.1)
      .fromTo($(".d-hero__note"), { autoAlpha: 0 }, { autoAlpha: 0.5, duration: 1.1 }, 1.15);
  } else gsap.set([$(".d-hero__head"), $(".d-hero__note")], { opacity: (i) => [0.3, 0.5][i] });

  // ── Device that rotates with scroll
  const cvs = $(".d-intro__spin");
  if (cvs && window.THREE) {
    const T = THREE;
    const renderer = new T.WebGLRenderer({ canvas: cvs, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(28, 16 / 9, 0.1, 100);
    cam.position.set(0, 0, 11);
    // Rounded square panel — a smooth cover on top, a dense ring of sensing dots below
    const shape = new T.Shape();
    const w = 1.5, r = 0.62;
    shape.moveTo(-w + r, -w);
    shape.lineTo(w - r, -w); shape.quadraticCurveTo(w, -w, w, -w + r);
    shape.lineTo(w, w - r); shape.quadraticCurveTo(w, w, w - r, w);
    shape.lineTo(-w + r, w); shape.quadraticCurveTo(-w, w, -w, w - r);
    shape.lineTo(-w, -w + r); shape.quadraticCurveTo(-w, -w, -w + r, -w);
    const body = new T.ExtrudeGeometry(shape, { depth: 0.42, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.16, bevelSegments: 8, curveSegments: 24 });
    body.center();
    const shell = new T.MeshStandardMaterial({ roughness: 0.32, metalness: 0.75 });
    const cap = new T.MeshStandardMaterial({ roughness: 0.18, metalness: 0.35 });
    const dotM = new T.MeshStandardMaterial({ roughness: 0.4, metalness: 0.2 });
    const device = new T.Group();
    device.add(new T.Mesh(body, shell));
    const lid = new T.Mesh(new T.CylinderGeometry(0.7, 0.7, 0.03, 64), cap);
    lid.rotation.x = Math.PI / 2; lid.position.z = 0.38; device.add(lid);
    const dots = new T.InstancedMesh(new T.SphereGeometry(0.045, 10, 10), dotM, 96);
    const m4 = new T.Matrix4();
    for (let i = 0; i < 96; i++) {
      const ring = i < 56 ? 1.18 : 0.92, n = i < 56 ? 56 : 40, k = i < 56 ? i : i - 56;
      const a = (k / n) * Math.PI * 2;
      m4.makeTranslation(Math.cos(a) * ring, Math.sin(a) * ring, -0.4);
      dots.setMatrixAt(i, m4);
    }
    device.add(dots);
    device.scale.setScalar(0.62);
    scene.add(device);
    const key = new T.DirectionalLight(0xffffff, 2.4); key.position.set(3, 4, 6); scene.add(key);
    const rim = new T.DirectionalLight(0xffffff, 1.6); rim.position.set(-5, -2, -3); scene.add(rim);
    scene.add(new T.AmbientLight(0xffffff, 0.35));
    // Reads fills from the skin — body in light gray, cover in a dark surface, dot in the accent color
    // The computed color comes out as an oklch string that three can’t read, so paint it on a canvas to convert it to sRGB
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = (c) => { probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1); const d = probe.getImageData(0, 0, 1, 1).data; return new T.Color(d[0] / 255, d[1] / 255, d[2] / 255).convertSRGBToLinear(); };
    cvs.style.color = "var(--site-key)";
    shell.color.copy(rgb(css("--kf-dim")));
    cap.color.copy(rgb(css("--kf-ink-soft")));
    dotM.color.copy(rgb(getComputedStyle(cvs).color));
    const size = () => {
      const W = innerWidth, H = innerHeight;
      renderer.setSize(W, H, false);
      cam.aspect = W / H; cam.updateProjectionMatrix();
    };
    size();
    addEventListener("resize", size);
    const FRAMES = 240;
    let last = -1;
    const draw = (p) => {
      const f = Math.ceil((FRAMES - 1) * p);
      if (f === last) return;
      last = f;
      const t = f / (FRAMES - 1);
      // Original image order: the panel seen from above tilts to show its side, turns once to show the sensing ring, then stops at an angle
      device.rotation.set(1.05 - t * 1.9, -0.55 + t * Math.PI * 1.35, 0.35 - t * 0.6);
      device.position.y = 0.25 - t * 0.5;
      renderer.render(scene, cam);
    };
    draw(0);
    if (!reduce) progress(cvs, (p) => draw(p));
    else draw(0.5);
  }

  // About: the blurred photo below, once visible, goes from .95x scale over 2.3s
  observe($(".d-intro__img"), (on) => on && !reduce && gsap.fromTo($(".d-intro__img"), { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, duration: 2.3, ease: "power1.out", scale: 1 }));
  observe($(".d-intro__title"), (on) => on && !reduce && fx.title($(".d-intro__title")));
  observe($(".d-intro__copy"), (on) => on && !reduce && fx.copy($(".d-intro__copy"), 0.5));

  // ── Features: the item on the center line of the screen lights up. Side-row icons switch as two sets, off and on, together —
  // The entering side turns from 90° and appears in .3s power3.out, the leaving side turns off in .5s (original Vue transition, no mode). Initial letters blur from 10px over .5s
  const items = $$(".d-feat__item");
  const side = $$(".d-feat__icons li");
  let on = -1;
  // The original creates the incoming icon as a new element starting at 90° — reusing a hidden one would make it jump from 0° to 90° and then spin
  // Like the original Vue transition, the incoming icon is inserted as a new element (from 90° and transparent, .3s power3.out), and the outgoing one is removed after fading out over .5s
  const swapIn = (el) => {
    const fresh = el.cloneNode(true);
    fresh.hidden = false;
    el.replaceWith(fresh);
    if (reduce) return;
    gsap.set(fresh, { autoAlpha: 0, rotate: 90 });
    requestAnimationFrame(() => gsap.to(fresh, { autoAlpha: 1, duration: 0.3, ease: "power3.out", rotate: 0 }));
  };
  const swapOut = (el) => {
    if (el.hidden) return;
    const rest = () => { const c = el.cloneNode(true); c.hidden = true; c.removeAttribute("style"); el.replaceWith(c); };
    reduce ? rest() : requestAnimationFrame(() => gsap.to(el, { autoAlpha: 0, duration: 0.5, onComplete: rest }));
  };
  // Header letters: on exit they hide immediately (original v-show — button width shrinks at once) and only the blur spins hidden, on enter blur 10px over .5s
  const markIn = (el) => { el.hidden = false; reduce || gsap.fromTo(el, { filter: "blur(10px)" }, { duration: 0.5, filter: "blur(0px)" }); };
  const markOut = (el) => { if (el.hidden) return; el.hidden = true; reduce || gsap.fromTo(el, { filter: "blur(0px)" }, { duration: 0.5, filter: "blur(10px)" }); };
  const setOn = (n) => {
    if (n === on) return;
    const prev = on;
    on = n;
    items.forEach((it, i) => it.classList.toggle("is-on", i === n));
    side.forEach((li, i) => li.classList.toggle("is-on", i === n));
    if (side[prev]) { swapOut(side[prev].querySelector(".d-feat__sw.is-on")); swapIn(side[prev].querySelector(".d-feat__sw.is-off")); markOut(side[prev].querySelector(".d-feat__mark")); }
    if (side[n]) { swapOut(side[n].querySelector(".d-feat__sw.is-off")); swapIn(side[n].querySelector(".d-feat__sw.is-on")); markIn(side[n].querySelector(".d-feat__mark")); }
  };
  setOn(0);
  const list = $(".d-feat__list");
  if (list) progress(list, () => {
    const mid = innerHeight / 2;
    items.forEach((it, i) => { const r = it.getBoundingClientRect(); if (r.top <= mid && r.bottom >= mid) setOn(i); });
  });
  side.forEach((li, i) => $("button", li).addEventListener("click", () => lenis.scrollTo(items[i], { duration: 1 })));
  observe($(".d-feat__title"), (o) => o && !reduce && fx.title($(".d-feat__title")));
  // Feature items are set up all at once when the section starts to show — so that when jumping to an adjacent row the lower items don’t only then stand up.
  const feat = $(".d-feat");
  if (feat) observe(feat, (o) => o && items.forEach((it) => {
    show(it);
    if (reduce) return;
    const tl = gsap.timeline();
    tl.fromTo($(".d-feat__pill", it), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0)
      .call(() => fx.title($(".d-feat__name", it)), [], 0);
    fx.lines(tl, $(".d-feat__copy", it), 0.2);
    const line = $(".d-feat__line", it);
    if (line) tl.fromTo(line, { scaleX: 0 }, { duration: 2, ease: "power3.out", scaleX: 1 }, 0.7);
  }));

  // ── Emphasis: side photos slide in from ∓30% over 1.2s and the text follows at 0·.3·.35·.4·.75s
  const high = $(".d-high");
  observe(high, (o) => {
    if (!o || reduce) return;
    gsap.timeline()
      .fromTo($(".d-high__img.is-left"), { autoAlpha: 0, xPercent: -30 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out", xPercent: 0 }, 0)
      .fromTo($(".d-high__img.is-right"), { autoAlpha: 0, xPercent: 30 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out", xPercent: 0 }, 0)
      .call(() => fx.title($(".d-high__head")), [], 0)
      .call(() => fx.title($(".d-high__title")), [], 0.3)
      .fromTo($(".d-high__dot"), { autoAlpha: 0, filter: "blur(10px)" }, { autoAlpha: 1, duration: 1.2, filter: "blur(0px)" }, 0.35)
      .call(() => fx.copy($(".d-high__copy"), 0.5), [], 0.4)
      .call(() => fx.arrow($(".d-high__link")), [], 0.75);
  });

  // ── Big word: while the section passes, two devices float staggered, -20 → 20 / 20 → -20px
  const lead = $(".d-lead__images");
  if (lead && !reduce) {
    const [a, b] = $$(".d-lead__img", lead);
    const tl = gsap.timeline({ paused: true }).fromTo(a, { y: -20 }, { y: 20 }, 0).fromTo(b, { y: 20 }, { y: -20 }, 0);
    progress(lead, (p) => tl.progress(p));
  }
  observe($(".d-lead__title"), (o) => o && !reduce && fx.title($(".d-lead__title")));
  observe($(".d-ai__title"), (o) => o && !reduce && (fx.title($(".d-ai__title")), fx.copy($(".d-ai__copy"), 0.65)));
  observe($(".d-dev__title"), (o) => o && !reduce && fx.title($(".d-dev__title"), 0.2));
  if (reduce) gsap.set($(".d-dev__title"), { opacity: 0.2 });
  $$(".d-dev__block").forEach((bl) => observe(bl, (o) => {
    if (!o) return;
    show(bl);
    if (!reduce) gsap.fromTo($(".d-dev__media img, .d-dev__media .wf-img", bl), { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, duration: 2, ease: "power2.out", scale: 1 });
  }));
  // Color picker: pressing a dot switches to that color’s photo in .5s
  $$(".d-dev__media").forEach((m) => m.addEventListener("click", (e) => {
    const b = e.target.closest("[data-swatch]");
    if (!b) return;
    $$("[data-swatch]", m).forEach((x) => x.classList.toggle("is-on", x === b));
    $$(".d-dev__shot", m).forEach((s, i) => s.classList.toggle("is-on", i === +b.dataset.swatch));
  }));
});
