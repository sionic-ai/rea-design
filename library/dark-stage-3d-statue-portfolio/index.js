// First page motion. Scenes advance with a virtual scroll that intercepts wheel and touch like the original — input · follow · stop points · zone pull use the original STICKY_CONFIG values as they are (vscroll below):
// Loader (golden ratio) → spotlight on a black stage back view (scroll locked meanwhile) → white stage · giant text · pedestal statue · chess piece → approach → piece shatters and scatters → dark ink About.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, TextPlugin, CustomEase);

  const stage = $(".ix-stage");
  const pin = $(".ix-stage__pin");
  const canvas = $(".ix-canvas");
  const word = $(".ix-word");
  const hint = $(".ix-hint");
  const ask = $(".ix-ask");
  const subWords = $$(".ix-sub span");
  window.bsHead.hide(true);
  window.bsHead.force("dark");

  // ── 3D scene ──
  const T = THREE;
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = T.ACESFilmicToneMapping;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, 0.1, 100);

  const statueMat = new T.MeshStandardMaterial({ color: 0x3b342e, metalness: 0.55, roughness: 0.42 });
  const pieceMat = new T.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 0.35, roughness: 0.28 });
  const goldMat = new T.MeshStandardMaterial({ color: 0xb8923a, metalness: 0.9, roughness: 0.3 });

  const hemi = new T.HemisphereLight(0xffffff, 0x444444, 0);
  const key = new T.DirectionalLight(0xfff1e0, 0);
  key.position.set(2.5, 5, -6);
  const rim = new T.DirectionalLight(0xffffff, 0);
  rim.position.set(-4, 3, 3);
  const front = new T.DirectionalLight(0xffffff, 0);
  front.position.set(1.5, 3, 8);
  scene.add(hemi, key, rim, front);

  // Character: only capsules, spheres and cylinders. Front is +z, the left hand (+x) holds the bat at shoulder height and the bat slants behind the neck
  const figure = new T.Group();
  const cap = (r, len, a, b) => {
    const m = new T.Mesh(new T.CapsuleGeometry(r, len, 6, 14), statueMat);
    const A = new T.Vector3(...a), B = new T.Vector3(...b);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    figure.add(m);
    return m;
  };
  cap(0.1, 0.62, [0.13, 0.78, 0], [0.12, 1.55, 0]);
  cap(0.1, 0.62, [-0.13, 0.78, 0.02], [-0.12, 1.55, 0]);
  // Torso: a solid of revolution that flares from the waist to wide shoulders and gathers at the neck — closer to a person’s back than a capsule
  const torso = new T.Mesh(new T.LatheGeometry([[0, 1.5], [0.2, 1.52], [0.22, 1.62], [0.25, 1.85], [0.31, 2.05], [0.37, 2.18], [0.36, 2.26], [0.26, 2.33], [0.1, 2.37], [0, 2.38]].map(([x, y]) => new T.Vector2(x, y)), 32), statueMat);
  torso.scale.set(1, 1, 0.62);
  figure.add(torso);
  const collar = new T.Mesh(new T.TorusGeometry(0.15, 0.05, 8, 20), statueMat);
  collar.position.set(0, 2.33, 0);
  collar.rotation.x = Math.PI / 2;
  figure.add(collar);
  cap(0.065, 0.12, [0, 2.3, 0], [0, 2.45, 0]);
  const head = new T.Mesh(new T.SphereGeometry(0.15, 24, 18), statueMat);
  head.position.set(0, 2.57, 0);
  head.scale.set(1, 1.12, 1);
  figure.add(head);
  const hair = new T.Mesh(new T.SphereGeometry(0.158, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62), statueMat);
  hair.position.set(0, 2.585, -0.012);
  hair.scale.set(1.04, 1.14, 1.06);
  figure.add(hair);
  [[0, 2.74, -0.1]].forEach((p) => {
    const bun = new T.Mesh(new T.SphereGeometry(0.05, 14, 10), statueMat);
    bun.position.set(...p);
    figure.add(bun);
  });
  cap(0.075, 0.32, [0.38, 2.2, 0], [0.55, 1.95, -0.05]);
  cap(0.065, 0.3, [0.55, 1.95, -0.05], [0.42, 2.2, -0.18]);
  const fist = new T.Mesh(new T.SphereGeometry(0.07, 12, 10), statueMat);
  fist.position.set(0.42, 2.22, -0.2);
  figure.add(fist);
  cap(0.075, 0.6, [-0.38, 2.2, 0], [-0.44, 1.5, 0.03]);
  const batA = new T.Vector3(0.48, 2.17, -0.21), batB = new T.Vector3(-0.85, 2.92, -0.2);
  const bat = new T.Mesh(new T.CylinderGeometry(0.055, 0.022, batA.distanceTo(batB), 20), statueMat);
  bat.position.copy(batA).add(batB).multiplyScalar(0.5);
  bat.quaternion.setFromUnitVectors(new T.Vector3(0, -1, 0), batA.clone().sub(batB).normalize());
  figure.add(bat);
  const knob = new T.Mesh(new T.SphereGeometry(0.035, 10, 8), statueMat);
  knob.position.copy(batA).add(new T.Vector3(0.05, -0.03, 0));
  figure.add(knob);

  // Pedestal: cylinder with moldings
  const pedestal = new T.Group();
  const lathe = (pts, mat) => new T.Mesh(new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), 40), mat);
  pedestal.add(lathe([[0, 0], [0.5, 0], [0.5, 0.08], [0.44, 0.12], [0.4, 0.14], [0.4, 0.6], [0.44, 0.63], [0.48, 0.68], [0.48, 0.74], [0, 0.74]], statueMat));
  scene.add(pedestal, figure);

  // Chess pieces: pawn and king are solids of revolution, knight is an extruded horse-head side profile
  const pawn = () => lathe([[0, 0], [0.22, 0], [0.22, 0.05], [0.17, 0.09], [0.1, 0.14], [0.07, 0.3], [0.12, 0.33], [0.06, 0.36], [0.11, 0.44], [0.1, 0.52], [0.05, 0.56], [0, 0.57]], pieceMat);
  const king = () => {
    const g = new T.Group();
    g.add(lathe([[0, 0], [0.26, 0], [0.26, 0.06], [0.18, 0.12], [0.11, 0.2], [0.08, 0.62], [0.14, 0.66], [0.08, 0.7], [0.13, 0.82], [0, 0.86]], pieceMat));
    const c1 = new T.Mesh(new T.BoxGeometry(0.04, 0.16, 0.04), pieceMat); c1.position.y = 0.94;
    const c2 = new T.Mesh(new T.BoxGeometry(0.12, 0.04, 0.04), pieceMat); c2.position.y = 0.95;
    g.add(c1, c2);
    return g;
  };
  const knight = () => {
    const s = new T.Shape();
    [[-0.2, 0], [0.22, 0], [0.2, 0.08], [0.12, 0.12], [0.16, 0.36], [0.2, 0.52], [0.12, 0.66], [-0.02, 0.72], [-0.1, 0.66], [-0.24, 0.52], [-0.28, 0.42], [-0.18, 0.4], [-0.1, 0.44], [-0.04, 0.36], [-0.14, 0.24], [-0.16, 0.12], [-0.22, 0.08]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    const geo = new T.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3 });
    geo.translate(0, 0, -0.09);
    const g = new T.Group();
    g.add(new T.Mesh(geo, pieceMat));
    const base = lathe([[0, 0], [0.24, 0], [0.24, 0.06], [0.18, 0.1], [0, 0.1]], pieceMat);
    base.position.y = -0.08;
    g.add(base);
    return g;
  };
  const pieces = [
    { m: pawn(), p: [-2.25, 0.35, 0.9], r: [0, 0.4, Math.PI / 2], spin: 0.25 },
    { m: knight(), p: [0.95, 0.7, 0.7], r: [0, -0.5, 0], spin: 0.35 },
    { m: pawn(), p: [2.35, 0.35, 0.5], r: [0.2, -0.6, -Math.PI / 2.2], spin: 0.2 },
    { m: king(), p: [3.2, 2.3, -1.2], r: [0.4, 0.3, 0.8], spin: 0.3 },
    { m: pawn(), p: [-3.3, 2.6, -1.4], r: [0.6, 0.2, 0.4], spin: 0.4 },
  ];
  const piecesGroup = new T.Group();
  pieces.forEach((o) => { o.m.position.set(...o.p); o.m.rotation.set(...o.r); o.base = new T.Vector3(...o.p); piecesGroup.add(o.m); });
  piecesGroup.visible = false;
  scene.add(piecesGroup);

  // Floor shadow: only on the white stage
  const shCan = document.createElement("canvas");
  shCan.width = shCan.height = 128;
  const sctx = shCan.getContext("2d");
  const grd = sctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grd.addColorStop(0, bsRgb("var(--kf-contrast-bg)", 0.35)); grd.addColorStop(1, bsRgb("var(--kf-contrast-bg)", 0));
  sctx.fillStyle = grd; sctx.fillRect(0, 0, 128, 128);
  const shadow = new T.Mesh(new T.PlaneGeometry(2.6, 1.2), new T.MeshBasicMaterial({ map: new T.CanvasTexture(shCan), transparent: true, opacity: 0, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.5, 0.002, 0.1);
  scene.add(shadow);

  // Fragments: five horses shatter and scatter as gold and ink-black tetrahedra
  const N = 260;
  const frags = new T.InstancedMesh(new T.TetrahedronGeometry(0.07), new T.MeshStandardMaterial({ metalness: 0.75, roughness: 0.3 }), N);
  const fragData = [];
  const gold = new T.Color(0xc9a24a), ink = new T.Color(0x111111);
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < N; i++) {
    const src = pieces[i % pieces.length].base;
    const dir = new T.Vector3(rnd() - 0.5, rnd() - 0.3, rnd() - 0.2).normalize();
    fragData.push({ o: src.clone().add(new T.Vector3(rnd() * 0.3 - 0.15, rnd() * 0.5, rnd() * 0.3 - 0.15)), v: dir.multiplyScalar(1.2 + rnd() * 3.2), ax: new T.Vector3(rnd(), rnd(), rnd()).normalize(), s: 0.5 + rnd() * 1.4 });
    frags.setColorAt(i, rnd() > 0.55 ? gold : ink);
  }
  frags.visible = false;
  scene.add(frags);
  const dummy = new T.Object3D();

  // Camera path: behind over the shoulder → turns to the front far away → approaches again
  const camBack = { pos: new T.Vector3(-0.1, 2.05, -2.9), look: new T.Vector3(0.05, 2.3, 0.3) };
  const camFront = { pos: new T.Vector3(0, 1.55, 11), look: new T.Vector3(0, 1.45, 0) };
  const camNear = { pos: new T.Vector3(0.25, 1.95, 6.2), look: new T.Vector3(0, 1.7, 0) };

  const state = { p: 0, light: 0, mouseX: 0, mouseY: 0 };
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);
  const grey = new T.Color(0xd2d2d2), bronze = new T.Color(0x3b342e), black = new T.Color(0x050505);
  const tmpV = new T.Vector3(), tmpL = new T.Vector3();

  function resize() {
    const w = pin.clientWidth, h = pin.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 52 : 32;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  function apply(time) {
    const p = state.p;
    const orbit = ease(seg(p, 0.1, 0.25));
    const zoom = ease(seg(p, 0.55, 0.78));
    const white = ease(seg(p, 0.14, 0.22)) * (1 - ease(seg(p, 0.92, 1)));
    const lit = ease(seg(p, 0.34, 0.43));
    const shatter = seg(p, 0.78, 0.94);

    // Back → front: retreats, half-turn around the figure
    if (zoom > 0) {
      tmpV.lerpVectors(camFront.pos, camNear.pos, zoom);
      tmpL.lerpVectors(camFront.look, camNear.look, zoom);
    } else {
      const ang = lerp(Math.PI, 0, orbit);
      const tall = camera.aspect < 0.8;
      const rad = lerp(tall ? 5.2 : 2.9, 11, orbit * orbit);
      tmpV.set(Math.sin(ang) * rad + lerp(-0.15, 0, orbit), lerp(camBack.pos.y, camFront.pos.y, orbit), Math.cos(ang) * rad);
      tmpL.lerpVectors(camBack.look, camFront.look, orbit);
      if (tall) { tmpV.y -= 0.35 * (1 - orbit); tmpL.y -= 0.45 * (1 - orbit); }
    }
    const sway = p > 0.25 ? 1 : 0;
    tmpV.x += state.mouseX * 0.25 * sway;
    tmpV.y += state.mouseY * 0.12 * sway;
    camera.position.copy(tmpV);
    camera.lookAt(tmpL);

    pin.style.setProperty("--white", white.toFixed(3));
    canvas.style.opacity = (1 - ease(seg(p, 0.9, 0.97))).toFixed(3);
    const silhouette = white * (1 - lit);
    statueMat.color.copy(bronze).lerp(black, silhouette).lerp(grey, lit);
    statueMat.metalness = lerp(0.55, 0.05, Math.max(silhouette, lit));
    statueMat.roughness = lerp(0.42, 0.7, lit);
    const L = state.light * (1 - silhouette);
    key.intensity = lerp(3.2 * L, 2.2, lit);
    rim.intensity = 2.4 * L * (1 - lit) + lit * 0.8;
    front.intensity = lit * 1.6;
    hemi.intensity = lit * 1.4 + L * 0.15;
    pieceMat.color.setHex(0x0d0d0d);
    shadow.material.opacity = white * 0.9;
    pedestal.visible = orbit > 0.5;

    piecesGroup.visible = white > 0.3 && shatter < 0.02;
    pieces.forEach((o, i) => {
      o.m.position.copy(o.base);
      o.m.position.y += Math.sin(time * 0.8 + i) * 0.06;
      o.m.rotation.y = o.r[1] + time * o.spin;
      if (i === 1) o.m.position.lerp(tmpV.clone().add(new T.Vector3(-1.2, -0.6, -2.4)), ease(seg(p, 0.62, 0.78)) * 0.65);
    });
    frags.visible = shatter > 0.02 && shatter < 1;
    if (frags.visible) {
      const t = 1 - Math.pow(1 - shatter, 2);
      for (let i = 0; i < N; i++) {
        const f = fragData[i];
        dummy.position.copy(f.o).addScaledVector(f.v, t * 1.8);
        dummy.position.y -= shatter * shatter * 0.8;
        dummy.quaternion.setFromAxisAngle(f.ax, shatter * 9 * f.s);
        dummy.scale.setScalar(f.s * (1 - seg(shatter, 0.7, 1)));
        dummy.updateMatrix();
        frags.setMatrixAt(i, dummy.matrix);
      }
      frags.instanceMatrix.needsUpdate = true;
    }

    // HTML layer: giant text · subtitle · pill · hint · header band
    const wordIn = ease(seg(p, 0.18, 0.26)) * (1 - ease(seg(p, 0.9, 0.96)));
    word.style.opacity = wordIn;
    const wScale = lerp(0.92, 1, ease(seg(p, 0.18, 0.3))) * lerp(1, 1.8, zoom);
    const wX = Math.sin(zoom * Math.PI) * -9 + zoom * 4;
    word.style.transform = `translateX(${wX}vw) scale(${wScale})`;
    subWords.forEach((s, i) => { s.style.opacity = ease(seg(p, 0.38 + i * 0.025, 0.42 + i * 0.025)) * (1 - ease(seg(p, 0.56, 0.62))); });
    const askOn = p > 0.41 && p < 0.58;
    ask.style.opacity = askOn ? 1 : 0;
    ask.style.visibility = askOn ? "visible" : "hidden";
    hint.classList.toggle("is-light", white > 0.5);
    if (introDone) hint.style.opacity = p < 0.5 ? 1 : 0;
    window.bsHead.hide(white < 0.5 && p < 0.5);
    window.bsHead.force(p > 0.995 ? null : white > 0.5 ? "light" : "dark");
  }

  let running = true, introDone = false;
  const clock = new T.Clock();
  function loop() {
    if (running) { apply(clock.getElapsedTime()); renderer.render(scene, camera); }
    requestAnimationFrame(loop);
  }
  addEventListener("pointermove", (e) => {
    gsap.to(state, { mouseX: e.clientX / innerWidth - 0.5, mouseY: -(e.clientY / innerHeight - 0.5), duration: 1.2, ease: "power2.out", overwrite: true });
  }, { passive: true });

  // ── Group Motion ──
  const mm = gsap.matchMedia();
  let vs;
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    vs = vscroll();

    // Dark intro: the title goes from gray to white line by line, the rest rises at 0.15s intervals
    const below = $(".ix-below");
    gsap.fromTo($$(".ix-line", below), { color: bsRgb("color-mix(in oklab, var(--kf-contrast-ink) 17.8%, var(--kf-contrast-bg))") }, { color: bsRgb("var(--kf-contrast-ink)"), stagger: 0.5, ease: "none", scrollTrigger: { trigger: below, start: "top 70%", end: "top top", scrub: true } });
    gsap.from($$(".ix-rise", below), { y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: below, start: "top 10%" } });
    gsap.from($$(".ix-logo", below), { y: 24, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: below, start: "top -15%" } });

    // Case video: grows as it enters, shrinks and blurs as it leaves (ease none)
    const frame = $(".ix-video__frame");
    gsap.fromTo(frame, { scale: 0.6, borderRadius: 40 }, { scale: 1, borderRadius: 0, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "top top", scrub: true } });
    gsap.to(frame, { scale: 0.85, filter: "blur(8px)", opacity: 0.4, ease: "none", scrollTrigger: { trigger: frame, start: "bottom 60%", end: "bottom top", scrub: true } });

    playLoader();
    return () => vs.destroy();
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    $(".ix-loader").remove();
    document.body.classList.remove("is-locked");
    state.p = 0.4; state.light = 1; introDone = true;
    hint.style.opacity = 1;
    ScrollTrigger.create({ trigger: stage, start: "top top", end: "bottom bottom", onLeave: () => { window.bsHead.force(null); window.bsHead.hide(false); }, onEnterBack: () => { state.p = 0.4; } });
    apply(0); renderer.render(scene, camera);
    window.bsHead.hide(false);
  });
  loop();

  // ── Loader → lighting ──
  // Original loader CSS variables as is: each line runs 3s · cubic-bezier(.37,0,.63,1), starting at 0s for the border · .9s for the spiral · 1.5/2.28/3s for the dividers,
  // The formula text slides in 24px at 1.4s over .7s ease-in-out, and the quote lines start at 1.6s (+0/.3/.55s) with the band clearing over 3s.
  // Loading cycles .5↔1 every 1.5s. Fully drawn at 6s, rests 1.45s, then the rectangle turns 45° (phone 27°) over 1.2s cubic-bezier(.33,0,.2,1),
  // After that it vanishes with .9s ease-in-out (background .8s). 2.4s after the peel starts, it passes the stage’s first range
  function playLoader() {
    const L = $(".ix-loader");
    const box = $(".ix-loader__box", L);
    const curve = CustomEase.create("bs-loader", "0.37,0,0.63,1"), inOut = CustomEase.create("bs-inout", "0.42,0,0.58,1");
    const tl = gsap.timeline();
    [[".g-frame", 0], [".g-spiral", 0.9], [".g-line--a", 1.5], [".g-line--b", 2.28], [".g-line--c", 3]].forEach(([s, at]) => tl.from($(s, L), { drawSVG: 0, duration: 3, ease: curve }, at));
    tl.from($$(".ix-golden__a--l, .ix-golden__a--b", L), { opacity: 0, x: 24, duration: 0.7, ease: inOut }, 1.4)
      .from($(".ix-golden__a--bottom", L), { opacity: 0, y: -24, duration: 0.7, ease: inOut }, 1.4)
      .from($(".ix-golden__phi", L), { opacity: 0, x: -24, duration: 0.7, ease: inOut }, 1.4);
    $$(".ix-quote [data-reveal]", L).forEach((p) => {
      const veil = document.createElement("span");
      veil.className = "ix-quote__veil";
      p.append(veil);
      tl.fromTo(veil, { x: -120 }, { xPercent: 100, x: 0, duration: 3, ease: curve }, 1.6 + Number(p.dataset.reveal));
    });
    const pulse = gsap.fromTo($(".g-loading", L), { opacity: 0.5 }, { opacity: 1, duration: 0.75, yoyo: true, repeat: -1, ease: inOut });

    const ready = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r)));
    // Original: after drawing for 6s (--loader-all-done), it passes a white pause of 1.45s (--loader-phase2-pause) and starts walking
    Promise.all([ready, new Promise((r) => setTimeout(r, 7450))]).then(() => {
      pulse.kill();
      const out = gsap.timeline({ onComplete: () => L.remove() });
      out.to($(".g-loading", L), { opacity: 0, duration: 0.2, ease: inOut }, 0)
        .to(box, { rotation: matchMedia("(max-width: 1023px)").matches ? 27 : 45, duration: 1.2, ease: CustomEase.create("bs-rot", "0.33,0,0.2,1") }, 0)
        .to([box, $(".ix-quote", L)], { opacity: 0, duration: 0.9, ease: inOut }, 1.2)
        .to(L, { backgroundColor: bsRgb("var(--kf-contrast-bg)", 0), duration: 0.8, ease: inOut }, 1.2)
        .to(state, { light: 1, duration: 2.6, ease: "power2.out" }, 1.2)
        .add(() => {
          introDone = true;
          gsap.to(hint, { opacity: 1, duration: 0.6, ease: "power2.out" });
          ScrollTrigger.refresh();
          vs.start();
        }, 2.4);
    });
  }

  // ── Virtual scroll (original STICKY_CONFIG): sets progress 0 → end by scene step length (200 per slot · phone 260),
  //    One wheel tick is clipped at ±100 and pushes the target by .4× (phone ±140 · 1.4×, touch is moved px × 3.2 · 5.1).
  //    target value follows toward the attractor point at .035 per frame, progress follows the target at .04 each (max 12 per frame) (phone .065·.07·7).
  //    Pauses 500ms when going forward at the white stage · full section, and releases to default scroll if scrolled further at the end. Coming back from below it catches again at the end.
  //    the page scroll slot moves along with the progress value inside a fixed 560vh span ──
  function vscroll() {
    const mob = matchMedia("(max-width: 1023px)").matches;
    const unit = mob ? 260 : 200;
    const defs = mob
      ? [["init", 0], ["black-man", 1], ["full", 3.05], ["explode", 4], ["chess-1", 1.85], ["chess-2", 1.85], ["comeback", 1.85], ["leave", 4.1]]
      : [["init", 0], ["black-man", 1], ["into-white", 1.2], ["full", 1], ["explode", 4], ["chess-1", 1], ["chess-2", 1], ["comeback", 1], ["leave", 3]];
    const at = {};
    let acc = 0;
    defs.forEach(([id, l]) => { acc += l * unit; at[id] = acc; });
    const max = acc, AT = 1.5;
    const sg = (a, b, o) => ({ start: at[a], end: at[b], snapStart: 0, snapEnd: 0, ...o });
    const segs = [
      sg("init", "black-man", { snapStart: 0.5, snapEnd: 0.5 }),
      ...(mob ? [sg("black-man", "full", { commit: 0.3 })] : [sg("black-man", "into-white", { commit: 0.3 }), sg("into-white", "full", { commit: 0.3 })]),
      sg("full", "explode", { snapStart: 0.1, snapEnd: 0.3 }),
      sg("explode", "chess-1", { commit: 0.05, gate: true }),
      sg("chess-1", "chess-2", { commit: 0.05, gate: true }),
      sg("chess-2", "comeback", { commit: 0.05 }),
      sg("comeback", "leave", { snapStart: 0.1, snapEnd: 0.1 }),
    ];
    const points = [...new Set(segs.flatMap((s) => [s.start, s.end]))].sort((a, b) => a - b);
    const pauses = (mob ? [at.full] : [at["into-white"], at.full]).map((p) => ({ p, s: "idle" }));
    const C = mob ? { sens: 1.4, clamp: 140, touch: 5.1, lt: 0.065, lc: 0.07, max: 7 } : { sens: 0.4, clamp: 100, touch: 3.2, lt: 0.035, lc: 0.04, max: 12 };
    const v = { active: false, progress: 0, target: 0, dir: 0, intent: null, locked: false, preludeDone: false, step: null, lastY: 0, block: 0 };
    const near = (p) => points.reduce((b, pt) => (Math.abs(p - pt) < Math.abs(p - b) ? pt : b), points[0]);
    const pinStart = () => stage.offsetTop, pinEnd = () => stage.offsetTop + stage.offsetHeight - innerHeight;
    const sync = (p) => { const y = pinStart() + (pinEnd() - pinStart()) * Math.min(Math.max(p / max, 0), 1); if (Math.abs(scrollY - y) > 0.5) scrollTo(0, y); v.lastY = y; };
    const show = (p) => { state.p = p / max; };
    const forTarget = (x) => {
      const m = segs.filter((s) => x >= s.start - 1e-6 && x <= s.end + 1e-6);
      if (m.length < 2) return m[0] || null;
      return v.dir < 0 ? m.find((s) => Math.abs(s.end - x) <= 1e-6) || m[m.length - 1] : m.find((s) => Math.abs(s.start - x) <= 1e-6) || m[0];
    };
    const forDir = (p, d) => {
      if (d > 0) {
        const a = segs.find((s) => Math.abs(p - s.start) <= AT); if (a) return a;
        const i = segs.find((s) => p > s.start + AT && p < s.end - AT); if (i) return i;
        const e = segs.find((s) => Math.abs(p - s.end) <= AT); return e ? segs.find((s) => s !== e && Math.abs(s.start - e.end) <= AT) || null : null;
      }
      const e = segs.find((s) => Math.abs(p - s.end) <= AT); if (e) return e;
      const i = segs.find((s) => p > s.start + AT && p < s.end - AT); if (i) return i;
      const a = segs.find((s) => Math.abs(p - s.start) <= AT); return a ? segs.find((s) => s !== a && Math.abs(s.end - a.start) <= AT) || null : null;
    };
    // Attractor point: in the commit range it goes to the end if it passes the set share and back to the start if not, otherwise it moves to the end point only within the head and tail share
    const snapOf = (x) => {
      if (v.preludeDone && x < at["black-man"]) return at["black-man"];
      if (x <= 0) return 0;
      if (x >= max) return max;
      const s = forTarget(x);
      if (!s) return x;
      const k = (x - s.start) / Math.max(1e-6, s.end - s.start), d = v.dir;
      if (s.commit > 0) { const c = Math.min(Math.max(s.commit, 0.01), 0.49); return d > 0 ? (k >= c ? s.end : s.start) : d < 0 ? (k <= 1 - c ? s.start : s.end) : k < 0.5 ? s.start : s.end; }
      if (k < s.snapStart) return s.start <= 0 || (s.snapStart <= 0.2 && d > 0) ? x : s.start;
      if (k > 1 - s.snapEnd) return d > 0 ? s.end : d < 0 ? (s.snapEnd <= 0.2 ? x : s.start) : s.end;
      return x;
    };
    // Block the two sections where the words break at the end so a single wheel can’t pass through
    const gate = (from, next, d) => {
      for (const s of segs) {
        if (!s.gate) continue;
        if (d > 0 && from < s.end - AT && next > s.end) next = Math.min(next, s.end);
        if (d < 0 && from > s.end + AT && next < s.end) next = Math.max(next, s.end);
      }
      return next;
    };
    const free = (delta) => {
      if (!v.active || v.locked || v.step) return;
      const d = delta > 0 ? 1 : -1;
      let next = v.target + delta;
      if (delta > 0) { const pz = pauses.find((z) => z.p > v.progress + 1 && z.s === "idle"); if (pz && next > pz.p) { next = pz.p; v.intent = null; } }
      next = gate(v.progress, next, d);
      if (next <= 0) { next = 0; v.intent = null; } else if (next >= max) { next = max; if (delta > 0) v.intent = "down"; } else v.intent = null;
      v.target = next; v.dir = d;
    };
    const input = (raw) => {
      if (!v.active || !v.preludeDone || v.step) return;
      const delta = Math.min(Math.max(raw, -C.clamp), C.clamp) * C.sens;
      if (!delta) return;
      const d = delta > 0 ? 1 : -1;
      if (!forDir(v.progress, d) && d > 0 && v.progress >= max - AT) return release();
      free(delta);
    };
    const lock = (on) => { v.active = on; document.body.classList.toggle("is-locked", on); };
    const release = () => {
      v.step = null; v.progress = v.target = max; v.intent = null; v.dir = 0;
      show(max); sync(max); lock(false); v.block = performance.now() + 220;
    };
    const activate = (atEnd) => { lock(true); v.progress = v.target = atEnd ? max : 0; v.intent = null; v.dir = 0; sync(v.progress); show(v.progress); };
    const tick = () => {
      if (!v.active) return;
      const now = performance.now();
      if (v.step) {
        const k = Math.min(1, (now - v.step.t0) / v.step.dur), e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        v.progress = v.step.from + (v.step.to - v.step.from) * e;
        if (k >= 1) { v.progress = v.target = v.step.to; v.step = null; v.preludeDone = true; }
        show(v.progress); sync(v.progress);
        return;
      }
      const snap = snapOf(v.target);
      let target = v.target + (snap - v.target) * C.lt;
      let vel = Math.min(Math.max(v.progress + (target - v.progress) * C.lc - v.progress, -C.max), C.max);
      let p = v.progress + vel;
      if (Math.abs(target - p) < 0.05 && Math.abs(vel) < 0.05) { p = target; vel = 0; }
      for (const z of pauses) {
        if (Math.abs(p - z.p) < 1 && z.s === "idle" && v.dir === 1) {
          z.s = "locked"; v.locked = true; target = p = z.p;
          setTimeout(() => { v.locked = false; z.s = "cleared"; }, 500);
          break;
        }
        if (z.s === "cleared" && !v.locked && near(p) !== z.p) z.s = "idle";
      }
      p = Math.min(Math.max(p, 0), max);
      v.target = target;
      if (v.intent === "down" && !v.locked && target >= max - 0.01 && p >= max - 0.05 && Math.abs(vel) < 0.08) return release();
      v.progress = p;
      show(p); sync(p);
    };
    gsap.ticker.add(tick);
    const wheel = (e) => { if (!v.active) return; e.preventDefault(); input(e.deltaY); };
    let ty = null;
    const tstart = (e) => { ty = v.active && e.touches.length === 1 ? e.touches[0].clientY : null; };
    const tmove = (e) => {
      if (!v.active || ty == null || e.touches.length !== 1) return;
      const y = e.touches[0].clientY, dy = ty - y;
      ty = y;
      if (Math.abs(dy) < 0.5) return;
      e.preventDefault(); input(dy * C.touch);
    };
    // After release, once it scrolls back up into the fixed slot, it is caught again at the end
    const onScroll = () => {
      const y = scrollY, dy = y - v.lastY;
      if (!v.active && v.preludeDone && performance.now() > v.block && dy < -1.5 && y > pinStart() + AT && y < pinEnd() + 1) activate(true);
      if (!v.active) { v.lastY = y; state.p = Math.min(Math.max((y - pinStart()) / Math.max(1, pinEnd() - pinStart()), 0), 1); }
      running = y < pinEnd() + innerHeight;
    };
    addEventListener("wheel", wheel, { passive: false });
    addEventListener("touchstart", tstart, { passive: true });
    addEventListener("touchmove", tmove, { passive: false });
    addEventListener("scroll", onScroll, { passive: true });
    activate(false);
    return {
      // When the loader lifts, 500ms later it auto-advances the first stage (the step where light falls on the back view) with 2s easeInOutQuad
      start() { setTimeout(() => { v.step = { from: v.progress, to: at["black-man"], t0: performance.now(), dur: 2000 }; }, 500); },
      destroy() {
        gsap.ticker.remove(tick);
        removeEventListener("wheel", wheel); removeEventListener("touchstart", tstart); removeEventListener("touchmove", tmove); removeEventListener("scroll", onScroll);
        lock(false);
      },
    };
  }

  // ── Pill button: types and erases like a typewriter · click opens the chat window ──
  const typed = $(".ix-ask__typed");
  const phrase = "Your question prompt here…";
  const typeLoop = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
  typeLoop.to(typed, { text: phrase, duration: phrase.length * 0.07, ease: "none" }).to({}, { duration: 1.6 }).to(typed, { text: "", duration: phrase.length * 0.03, ease: "none" });
  if (reduce) { typeLoop.kill(); typed.textContent = phrase; }
  const chat = $(".ix-chat");
  const chatTl = gsap.timeline({ paused: true }).set(chat, { visibility: "visible" }).to(chat, { yPercent: 0, duration: reduce ? 0 : 0.5, ease: "power2.out" });
  ask.addEventListener("click", () => chatTl.play());
  $(".ix-chat__close").addEventListener("click", () => chatTl.reverse());

  // Video play button: pauses and plays the case video, and the bar follows playback time
  const play = $(".ix-video__play");
  const reel = $(".ix-video video");
  bsVideo.bar(reel, $(".ix-video__bar i"));
  const icon = () => { play.innerHTML = !reel.paused ? '<svg viewBox="0 0 10 10" fill="currentColor"><rect x="2" y="1.5" width="2" height="7"/><rect x="6" y="1.5" width="2" height="7"/></svg>' : '<svg viewBox="0 0 10 10" fill="currentColor"><path d="M2 1 9 5 2 9z"/></svg>'; };
  reel.addEventListener("play", icon);
  reel.addEventListener("pause", icon);
  play.addEventListener("click", () => {
    const on = reel.paused;
    if (on) { delete reel.dataset.held; reel.play().catch(() => {}); } else { reel.dataset.held = "1"; reel.pause(); }
  });
})();
