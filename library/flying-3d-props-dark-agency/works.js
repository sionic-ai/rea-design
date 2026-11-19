/* Work list — one progress value for the whole section (0~1) with ranges split and attached (original C ≈ 6.9 screens’ worth):
   Sit back down 0~.06 · legs extend .01~.08 · cloth drops .05~.26 · exit .28~.45 · legs fold .27~.36 · second ironing board stands .41~.58 · spin·spiral .58~1 · card slide .45~1 */
TB.page("works", (S, root) => {
  const { T, renderer, environment, lights, board, drape, fallLeft, placeholderTexture, fit, loop } = window.TB3D || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (t) => t * t * (3 - 2 * t);
  const seg = (p, a, b) => ss(cl((p - a) / (b - a)));
  const hero = root.querySelector(".tw-hero"), stage = hero.querySelector(".tw-stage"), all = hero.querySelector(".tw-all");
  const P = { p: reduce ? 0.7 : 0 };

  S.ready(() => root.querySelectorAll(".tb-in").forEach((el) => gsap.fromTo(el, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.8, delay: reduce ? 0 : +(el.dataset.delay || 0) - 0.9, ease: "power2.out" })));
  if (!reduce) ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => {
    P.p = s.progress;
    stage.style.setProperty("--fx-reveal", (0.25 + 0.4 * seg(s.progress, 0.4, 0.62)).toFixed(3));
    all.style.opacity = seg(s.progress, 0.55, 0.62).toFixed(3);
  } });
  else all.style.opacity = 1;

  if (!T) return;
  const cv = hero.querySelector(".tw-canvas"), r = renderer(cv), scene = new T.Scene(), cam = new T.PerspectiveCamera(36, 1, 0.1, 80);
  environment(r, scene); const L = lights(scene); L.glow.position.set(-0.29, -2.5, -1.21); L.glow.intensity = 8;
  // Featured work cloth (original Cloth Fall) — during the fall range it descends along the path from above behind the panel to cover it, and once settled it returns to a wrinkled rest shape while the lower hem ripples
  const b1 = board(), c1 = drape("Key work screen · bright dashboard first screen · horizontal 16:10");
  b1.group.add(c1.mesh); scene.add(b1.group);
  const b2 = board(); b2.fold(1); const b2s = new T.Group(); b2s.add(b2.group); b2.group.rotation.set(0, 0, Math.PI / 2); scene.add(b2s);
  // Spiral — 12 cards pass by at eye level, circling a standing pressing board for a turn and a half (in the original the camera rises along the spiral, so it reads as an eye-level ring)
  const RAD = 4.2, STEP = 0.66;
  const cards = Array.from({ length: 12 }, (_, i) => {
    const tex = placeholderTexture(`Work ${i + 1} Screen · device mockup · landscape 3:2`, { w: 768, h: 512 });
    const m = new T.Mesh(new T.PlaneGeometry(2.7, 1.8, 24, 1), new T.MeshStandardMaterial({ map: tex, side: T.DoubleSide, roughness: 0.6, transparent: true }));
    const pos = m.geometry.attributes.position; for (let k = 0; k < pos.count; k++) { const x = pos.getX(k); pos.setZ(k, -(x * x) / (2 * RAD)); } pos.needsUpdate = true;
    scene.add(m); return m;
  });
  const size = () => { fit(r, cam, cv); cam.position.set(0, 1.1, innerWidth < 768 ? 13 : 8.2); cam.lookAt(0, -0.2, 0); };
  size(); S.on(window, "resize", size);
  const mouse = { x: 0, tx: 0, ty: 0, px: 0, py: 0, lx: 0, ly: 0 }, ray = new T.Raycaster(), at = new T.Vector2();
  if (fine) S.on(window, "pointermove", (e) => { mouse.px = e.clientX; mouse.py = e.clientY; mouse.tx = (e.clientX / innerWidth) * 2 - 1; mouse.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  const intro = { y: reduce ? 0 : 1 };
  S.ready(() => !reduce && gsap.to(intro, { y: 0, duration: 1.8, ease: "expo.out" }));
  loop(cv, (dt, t) => {
    const p = P.p; mouse.x += (mouse.tx - mouse.x) * 0.05;
    const land = seg(p, 0, 0.06), unfold = seg(p, 0.01, 0.08), fall = seg(p, 0.05, 0.26), exit = seg(p, 0.28, 0.45), refold = seg(p, 0.27, 0.36);
    b1.group.visible = exit < 1;
    b1.group.position.set(lerp(2.2, 1.6, land) + lerp(0, 6, exit), lerp(-0.6, -0.9, land) + intro.y * 3 + lerp(0, -1.5, exit), lerp(-1, 0, land));
    b1.group.rotation.set(lerp(0.9, 0.16, land) + lerp(0, 0.6, exit), lerp(-0.7, -0.1, land) + lerp(0, -1.2, exit), lerp(0.15, 0, land));
    b1.fold(Math.max(1 - unfold, refold));
    if (fall >= 1) c1.land(t); else c1.lift();
    c1.mesh.visible = p > 0.03 && exit < 1;
    if (c1.mesh.visible) {
      // Sweeping the cloth makes ripples — cursor speed (full at 1400px/s) plus .014 even when stopped
      if (fine && !reduce) { ray.setFromCamera(at.set(mouse.tx, -mouse.ty), cam); const hits = ray.intersectObject(c1.mesh, false); c1.touch(hits[0]?.uv, Math.hypot(mouse.px - mouse.lx, mouse.py - mouse.ly) / Math.max(dt, 0.001), t); }
      c1.pose(reduce ? 0 : t, fallLeft(fall), { wrap: false });
    }
    mouse.lx = mouse.px; mouse.ly = mouse.py;
    const rise = seg(p, 0.41, 0.58), spin = cl((p - 0.58) / 0.42);
    b2s.visible = rise > 0;
    b2s.position.set(0, lerp(-7, 0, rise), -0.6); b2s.rotation.y = spin * Math.PI * 2 + (reduce ? 0 : t * 0.05) + mouse.x * 0.2;
    const slide = cl((p - 0.45) / 0.55);
    cards.forEach((m, i) => {
      const a = i * STEP - slide * (cards.length * STEP + 1.4) + 1.6, front = Math.cos(a);
      m.visible = slide > 0 && a > -1.9 && a < 1.9;
      if (!m.visible) return;
      m.position.set(Math.sin(a) * RAD, 0.05 + Math.sin(i * 1.7) * 0.06, Math.cos(a) * RAD - 1.6);
      m.rotation.set(0, a, 0);
      m.material.opacity = cl((front + 0.1) * 3) * cl(slide * 6);
    });
    r.render(scene, cam);
  });
});
