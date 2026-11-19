// First page — original MainVisual values: ball .5s power1.inOut → 1.6s, person .8s power1.out → 2.4s, canvas board .8s power2.out, side crowds 1.2s power2.out, in order .15,
// Copy (band .4s power3.inOut → letters 200%→0 .06 sequence → dots .06 sequence 1.02s later), background on at 3s (2s), then the group scatters with scroll scrub 1. News uses Splide.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mv = document.querySelector(".main-visual");
  const kvMain = mv.querySelector(".kv-main"), person = mv.querySelector(".kv-main__person"), ball = mv.querySelector(".kv-main__ball");
  const colored = ball.querySelector(".-color"), lefts = [...mv.querySelectorAll(".kv-illust.-left")], rights = [...mv.querySelectorAll(".kv-illust.-right")];

  /* Copy: line background grows from below and letters rise from 200% below at .06 steps */
  const copy = mv.querySelector(".kv-copy");
  copy.querySelectorAll(".-clip").forEach((c) => { c.innerHTML = [...c.textContent].map((ch) => (ch === " " ? " " : `<span class="-ch">${ch}</span>`)).join(""); });
  const bars = copy.querySelectorAll(".-bg"), chars = copy.querySelectorAll(".-ch"), dots = copy.querySelectorAll(".kv-copy__dots i");
  let copyTl = null;
  if (!reduce) {
    gsap.set(dots, { opacity: 0, y: "-100%" });
    gsap.set(chars, { y: "200%" });
    gsap.set(bars, { scaleY: 0, transformOrigin: "bottom" });
    copyTl = gsap.timeline({ paused: true, defaults: { duration: 0.4, ease: "power3.inOut" } })
      .to(bars, { scaleY: 1 })
      .to(chars, { y: "0%", stagger: 0.06 })
      .to(dots, { opacity: 1, y: "0%", stagger: 0.06 }, "<1.02");
  }

  /* On scroll the drawing board scatters to the bottom right, the left group to the bottom left, the right group to the bottom right (scrub 1) */
  const scatter = () => {
    if (reduce) return;
    gsap.timeline({ scrollTrigger: { trigger: mv, start: "top top", end: "bottom top", scrub: 1 } })
      .to(kvMain, { x: "100vw", y: "50vh", scale: 1.1 }, 0)
      .to(lefts, { x: "-100vw", y: "50vh", scale: 1.2 }, 0)
      .to(rights, { x: "100vw", y: "50vh", scale: 1.2 }, 0);
  };

  const end = () => { root.dataset.animationState = "end"; root.dataset.isHeaderShown = "true"; root.dataset.isBgShown = "true"; scatter(); };
  if (reduce) { gsap.set(colored, { opacity: 1 }); end(); }
  else {
    document.body.style.overflow = "hidden";
    const box = mv.getBoundingClientRect(), b = ball.getBoundingClientRect(), k = kvMain.getBoundingClientRect();
    const t = gsap.timeline();
    t.set(kvMain, { x: box.width / 2 - b.width / 2 - (k.left - box.left), y: box.height / 2 - b.height / 2 - (k.top - box.top) })
      .set(colored, { opacity: 0 })
      .set(ball, { opacity: 0, y: "100%" })
      .set(person, { x: "58vw", y: "58vh" })
      .set(lefts, { x: "-50vw", y: "50vh" })
      .set(rights, { x: "50vw", y: "50vh" })
      .add(gsap.delayedCall(1, () => { root.dataset.animationState = "play"; }))
      .to(ball, { opacity: 1, y: 0, ease: "power1.inOut" }, "<")
      .to(person, { x: 0, y: 0, ease: "power1.out", duration: 0.8 }, "<1.6")
      .call(() => { root.dataset.isHeaderShown = "true"; })
      .to(kvMain, { x: 0, y: 0, ease: "power2.out", duration: 0.8 }, "<")
      .to(lefts, { x: 0, y: 0, ease: "power2.out", duration: 1.2, stagger: 0.15 }, "<0")
      .to(rights, { x: 0, y: 0, ease: "power2.out", duration: 1.2, stagger: 0.15 }, "<0")
      .add(gsap.delayedCall(0, () => copyTl && copyTl.restart()), "<0")
      .add(gsap.delayedCall(0, () => { root.dataset.isBgShown = "true"; document.body.style.overflow = ""; }), "<.6")
      .to(colored, { opacity: 1 }, "<0")
      .call(end);
  }

  /* Four floating solids — original dust values (orthographic panel height 100, rotation speed unchanged, bobbing 0) */
  const dust = mv.querySelector(".kv-dust");
  if (dust && window.THREE) {
    const T = window.THREE;
    const rgb = (expr) => { const i = document.createElement("i"); i.style.color = expr; document.body.append(i); const c = getComputedStyle(i).color; i.remove(); return new T.Color(c); };
    const w = () => dust.clientWidth || innerWidth, h = () => dust.clientHeight || innerHeight;
    const scene = new T.Scene();
    const cam = new T.OrthographicCamera((-100 * w()) / h() / 2, (100 * w()) / h() / 2, 50, -50, 0.1, 1000);
    cam.position.z = 100;
    const ren = new T.WebGLRenderer({ antialias: true, alpha: true });
    ren.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    ren.setSize(w(), h());
    dust.append(ren.domElement);
    scene.add(new T.AmbientLight(rgb("var(--kf-surface)"), 0.5));
    [[rgb("color-mix(in oklab, var(--kf-surface) 94%, var(--kf-accent-soft))"), 2.5, [10, 10, 10]], [rgb("var(--kf-surface)"), 0.2, [-10, -5, -10]], [rgb("var(--kf-accent-soft)"), 0.3, [0, 20, 0]]].forEach(([c, i, p]) => { const d = new T.DirectionalLight(c, i); d.position.set(...p); scene.add(d); });
    const noise = new Uint8Array(128 * 128);
    for (let i = 0; i < noise.length; i++) noise[i] = Math.random() * 255;
    const bump = new T.DataTexture(noise, 128, 128, T.RedFormat);
    bump.wrapS = bump.wrapT = T.RepeatWrapping; bump.repeat.set(4, 4); bump.needsUpdate = true;
    const mat = new T.MeshStandardMaterial({ color: rgb("color-mix(in oklab, var(--kf-accent) 42%, var(--kf-surface))"), metalness: 0, roughness: 0.6, transparent: true, opacity: 0.9, emissive: rgb("color-mix(in oklab, var(--kf-accent) 52%, var(--kf-surface))"), emissiveIntensity: 0.25, bumpMap: bump, bumpScale: 0.2 });
    const sp = matchMedia("(max-width: 959px)").matches;
    const P = sp
      ? { cube: [-25.4, -27.8, 1.323], cl: [23.6, 8.4], cs: [-26.4, 36], py: [21.4, -42.6], clh: 2.4 }
      : { cube: [74, -44, 1.551], cl: [-42, -45], cs: [-80, 27], py: [-39.2, 47], clh: 3.2 };
    const items = [
      [new T.BoxGeometry(P.cube[2], P.cube[2], P.cube[2]), P.cube, [0.005, 0.008, 0.003]],
      [new T.CylinderGeometry(0.5, 0.5, P.clh, 16), P.cl, [0.007, 0.004, 0.006]],
      [new T.CylinderGeometry(0.8135, 0.8135, 1.38, 16), P.cs, [0.004, 0.009, 0.005]],
      [new T.ConeGeometry(1, 1.5, 4), P.py, [0.006, 0.005, 0.007]],
    ].map(([g, p, r]) => { const m = new T.Mesh(g, mat.clone()); m.position.set(p[0], p[1], 0); scene.add(m); return { m, r }; });
    addEventListener("resize", () => { const a = w() / h(); cam.left = (-100 * a) / 2; cam.right = (100 * a) / 2; cam.updateProjectionMatrix(); ren.setSize(w(), h()); });
    const loop = () => { items.forEach(({ m, r }) => { m.rotation.x += r[0]; m.rotation.y += r[1]; m.rotation.z += r[2]; }); ren.render(scene, cam); };
    if (reduce) loop(); else ren.setAnimationLoop(loop);
  }

  /* News — original Splide settings as is */
  const sp = document.querySelector(".top-carousel .splide");
  if (sp && window.Splide) {
    new Splide(sp, {
      type: "loop", perPage: 4, perMove: 1, focus: 0, gap: "30px", pagination: true, arrows: true, autoplay: !reduce, drag: true, interval: 4000, pauseOnHover: true,
      breakpoints: { 959: { perPage: 1, padding: { right: "2.1875rem", left: "2.1875rem" }, gap: "2.1875rem" } },
    }).mount();
  }
})();
