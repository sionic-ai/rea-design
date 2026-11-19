/* Home motion — hero ironing board flight and light fill-up, ‹To do› striped ring transformation and tags, cloth dropping onto the work ironing board, reasons section horizontal flow and iron path */
TB.page("home", (S, root) => {
  const { T, renderer, environment, lights, board, iron, drape, fallLeft, fit, loop, css } = window.TB3D || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ss = (t) => t * t * (3 - 2 * t);
  const mm = gsap.matchMedia();
  S.add(() => mm.revert());

  // ── Hero text — turns on 1.2s and 1.5s late after ready, 1.2s power2.out ──
  S.ready(() => {
    root.querySelectorAll(".tb-in").forEach((el) => gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 1.2, delay: reduce ? 0 : +(el.dataset.delay || 0), ease: "power2.out" }));
  });

  // ── Hero — stage stays pinned while the text block is fixed at 250%, light fills up with scroll, goes full at the quote, then settles to light gray ──
  const hero = root.querySelector(".tb-hero"), stage = hero.querySelector(".tb-hero__stage"), settle = hero.querySelector(".tb-hero__settle");
  const block = hero.querySelector(".tb-hero__block"), quote = hero.querySelector(".tb-quote-block");
  const heroP = { p: 0, px: 0 };
  mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, () => {
    ScrollTrigger.create({ trigger: block, start: "top top", end: "top+=250%", pin: true, scrub: true });
    ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => { heroP.p = s.progress; heroP.px = s.scroll() - s.start; stage.style.setProperty("--tb-top-glow", (1 - cl(s.progress * 4)).toFixed(3)); if (s.progress < 0.45) stage.style.setProperty("--fx-reveal", (0.06 + 0.5 * cl(s.progress / 0.45)).toFixed(3)); } });
    ScrollTrigger.create({
      trigger: quote, start: "top bottom", end: "bottom bottom", scrub: true,
      onUpdate: (s) => {
        const p = s.progress;
        stage.style.setProperty("--fx-reveal", (0.06 + 0.94 * cl(p * 1.6)).toFixed(3));
        stage.style.setProperty("--fx-exit", ss(cl((p - 0.2) / 0.55)).toFixed(3));
        settle.style.opacity = ss(cl((p - 0.6) / 0.4)).toFixed(3);
      },
    });
  });

  if (T) {
    const cv = hero.querySelector(".tb-hero__canvas"), r = renderer(cv), scene = new T.Scene(), cam = new T.PerspectiveCamera(36, 1, 0.1, 60);
    environment(r, scene); lights(scene);
    const b = board(); scene.add(b.group);
    // Hero cloth (original Cloth Fall) — shows at prep 1.08s, and from 1.1s for 2s drops from above behind the plate, covers it and flows down over the front edge.
    // After sitting, scrolling (over 3 screens of the head, following at .09) drags it behind the panel and it vanishes at .651
    const hc = drape("Partners logo board · green-tinted cloth · vertical 4:5", { glow: true }); b.group.add(hc.mesh);
    let born = -1, pull = 0;
    S.ready(() => (born = performance.now() / 1000));
    const eye = new T.Vector3(), aim = new T.Vector3(0, -0.5, 0);
    const size = () => { fit(r, cam, cv); const narrow = innerWidth < 768; eye.set(0, 1.4, narrow ? 11.5 : 7.4); cam.position.copy(eye); cam.lookAt(aim); };
    size(); S.on(window, "resize", size);
    // Ironing board pose per scroll position — placed bottom center, then tilts left and folds, then leaves the screen
    const keys = [
      { p: 0, x: 0, y: -1.35, z: 0, rx: 0.28, ry: 0, rz: 0, fold: 0 },
      { p: 0.22, x: -2.6, y: -0.9, z: 0.6, rx: 0.75, ry: 0.55, rz: -0.35, fold: 0.35 },
      { p: 0.45, x: -5.5, y: 0.6, z: -0.5, rx: 1.35, ry: 1.1, rz: -0.7, fold: 1 },
      { p: 1, x: -9, y: 2.5, z: -2, rx: 1.6, ry: 1.4, rz: -0.9, fold: 1 },
    ];
    const pose = (p) => { let i = 0; while (i < keys.length - 2 && p > keys[i + 1].p) i++; const a = keys[i], c = keys[i + 1], t = ss(cl((p - a.p) / (c.p - a.p))); const o = {}; for (const k in a) o[k] = lerp(a[k], c[k], t); return o; };
    const intro = { y: reduce ? 0 : -3, fold: reduce ? 0 : 1, spin: reduce ? 0 : -0.6 };
    S.ready(() => { if (!reduce) gsap.to(intro, { y: 0, fold: 0, spin: 0, duration: 2.2, delay: 0.3, ease: "expo.out" }); });
    // The camera orbits the ironing board toward the cursor — original values: left-right · up-down ±.3rad, strength 1 when over the board · otherwise .4 (rises at .15, falls at .05), following by .07 per frame
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, over: 0, px: 0, py: 0, lx: 0, ly: 0 }, ray = new T.Raycaster(), at = new T.Vector2(), d = new T.Vector3();
    if (fine && !reduce) S.on(window, "mousemove", (e) => { mouse.px = e.clientX; mouse.py = e.clientY; mouse.tx = (e.clientX / innerWidth) * 2 - 1; mouse.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    loop(cv, (dt, t) => {
      const k = pose(heroP.p);
      const since = born < 0 ? -1 : t - born, falling = since < 1.1 + 2, scrolled = cl(heroP.px / (3 * innerHeight));
      if (fine && !reduce) {
        at.set(mouse.tx, -mouse.ty); ray.setFromCamera(at, cam);
        const hit = ray.intersectObject(b.group, true).length > 0, gain = 0.4 + 0.6 * (mouse.over += (+hit - mouse.over) * (hit ? 0.15 : 0.05));
        mouse.x += (0.3 * mouse.tx * gain - mouse.x) * 0.07; mouse.y += (-0.3 * mouse.ty * gain - mouse.y) * 0.07;
        d.subVectors(eye, aim); const len = d.length(), yaw = Math.atan2(d.x, d.z) + mouse.x, pitch = Math.max(-1.3, Math.min(1.3, Math.asin(d.y / len) + mouse.y));
        cam.position.set(aim.x + len * Math.cos(pitch) * Math.sin(yaw), aim.y + len * Math.sin(pitch), aim.z + len * Math.cos(pitch) * Math.cos(yaw)); cam.lookAt(aim);
      }
      b.group.position.set(k.x, k.y + intro.y + Math.sin(t * 0.8) * 0.04, k.z);
      b.group.rotation.set(k.rx, k.ry + intro.spin, k.rz);
      b.fold(Math.max(k.fold, intro.fold));
      if (reduce) { hc.land(0); hc.pose(0, 0); hc.mesh.visible = true; }
      else if (since >= 1.08) {
        if (falling) hc.pose(t, fallLeft((since - 1.1) / 2));
        else { hc.land(t); pull += (scrolled - pull) * 0.09; hc.pose(t, pull, { eased: true }); }
        hc.mesh.visible = falling || (pull < 0.651 && scrolled < 1);
        // Sweeping the cloth ripples on the spot — by cursor speed (full at 1400px/s), and slightly even with a stopped cursor once settled
        if (fine && hc.mesh.visible) {
          const hits = ray.intersectObject(hc.mesh, false), speed = Math.hypot(mouse.px - mouse.lx, mouse.py - mouse.ly) / Math.max(dt, 0.001);
          hc.touch(hits[0]?.uv, speed, t, falling ? 0 : 0.014);
        }
      }
      mouse.lx = mouse.px; mouse.ly = mouse.py;
      r.render(scene, cam);
    });
  }

  // ── To do — a striped tube ring goes circle → square → triangle → pentagon, four tags stick around the ring ──
  const what = root.querySelector(".tb-what");
  const rows = [...what.querySelectorAll(".tb-acc")], groups = [...what.querySelectorAll(".tb-bubbles")];
  const svg = what.querySelector(".tb-what__lines"), art = what.querySelector(".tb-what__art"), labels = what.querySelector(".tb-what__labels");
  const SIDES = [0, 4, 3, 5];
  const ring = { shape: 0, active: -1, revealed: false, rpx: 100, cx: 0, cy: 0 };
  const setActive = (i) => {
    if (i === ring.active) return; ring.active = i;
    rows.forEach((row, k) => row.classList.toggle("is-on", k === i));
    groups.forEach((g, k) => {
      const on = k === i; g.classList.toggle("is-on", on);
      if (on && ring.revealed && !reduce) gsap.fromTo(g.querySelectorAll(".tb-bubble__in"), { opacity: 0, y: 34, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", overwrite: true });
    });
    placeBubbles();
  };
  const placeBubbles = () => {
    const g = groups[ring.active]; if (!g) return;
    const box = labels.getBoundingClientRect(), abox = art.getBoundingClientRect();
    ring.cx = box.width / 2; ring.cy = box.height / 2;
    const R = ring.rpx * 1.12, lines = [];
    g.querySelectorAll(".tb-bubble").forEach((bb) => {
      const a = (+bb.dataset.angle * Math.PI) / 180, left = bb.dataset.side === "left";
      const ex = cl(ring.cx + Math.cos(a) * R, 12, box.width - 12), ey = ring.cy - Math.sin(a) * R;
      const w = bb.offsetWidth, h = bb.offsetHeight;
      bb.style.left = `${left ? ex - w : ex}px`; bb.style.top = `${ey - h / 2}px`;
      const sx = ring.cx, sy = ring.cy;
      const oy = box.top - abox.top;
      lines.push(`<line x1="${sx}" y1="${sy + oy}" x2="${ex}" y2="${ey + oy}"/>`);
    });
    svg.innerHTML = lines.join("");
  };
  setActive(0);
  gsap.set(svg, { opacity: reduce ? 1 : 0 });
  groups.forEach((g) => gsap.set(g.querySelectorAll(".tb-bubble__in"), { opacity: reduce ? 1 : 0 }));
  const reveal = () => {
    if (ring.revealed) return; ring.revealed = true;
    gsap.to(groups[ring.active].querySelectorAll(".tb-bubble__in"), { opacity: 1, y: 0, filter: "blur(0px)", duration: reduce ? 0 : 0.9, ease: "power3.out", overwrite: true });
    gsap.to(svg, { opacity: 1, duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.25, ease: "power2.out" });
  };
  groups.forEach((g) => gsap.set(g.querySelectorAll(".tb-bubble__in"), { y: reduce ? 0 : 34, filter: reduce ? "none" : "blur(6px)" }));
  ScrollTrigger.create({ trigger: what.querySelector(".tb-what__track"), start: "top bottom", end: () => `top+=${innerHeight * 0.3}px top`, onLeave: reveal, onUpdate: (s) => s.progress >= 0.999 && reveal() });
  ScrollTrigger.create({
    trigger: what.querySelector(".tb-what__track"), start: "top top", end: "bottom bottom", scrub: reduce ? false : 1,
    onUpdate: (s) => { const p = s.progress * 4; setActive(Math.min(3, Math.floor(p))); ring.shape = cl(p - 0.5, 0, 3); },
  });
  S.on(window, "resize", () => placeBubbles());

  if (T) {
    const cv = what.querySelector(".tb-what__canvas"), r = renderer(cv), scene = new T.Scene(), cam = new T.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.set(0, 0, 10.5); cam.lookAt(0, 0, 0);
    const { mesh, uniforms } = TB3D.stripeRing();
    mesh.rotation.x = 0.12; scene.add(mesh);
    const size = () => {
      fit(r, cam, cv);
      const h = cv.clientHeight || 1, vis = 2 * Math.tan((45 * Math.PI) / 360) * 10.5;
      ring.rpx = (uniforms.uScale.value / vis) * h; placeBubbles();
    };
    size(); S.on(window, "resize", size);
    const ro = new ResizeObserver(size); ro.observe(cv); S.add(() => ro.disconnect());
    let shape = 0;
    // The ring tilts toward the cursor — original values: nod · horizontal turn ±.8rad, in-place spin x·y·.2, following by .05 per frame
    const tilt = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0 };
    if (fine && !reduce) S.on(window, "mousemove", (e) => { const nx = (e.clientX / innerWidth) * 2 - 1, ny = 1 - (e.clientY / innerHeight) * 2; tilt.tx = 0.8 * ny; tilt.ty = 0.8 * nx; tilt.tz = nx * ny * 0.2; }, { passive: true });
    loop(cv, (dt, t) => {
      shape += (ring.shape - shape) * (reduce ? 1 : 0.08);
      tilt.x += (tilt.tx - tilt.x) * 0.05; tilt.y += (tilt.ty - tilt.y) * 0.05; tilt.z += (tilt.tz - tilt.z) * 0.05;
      const i = Math.floor(shape), f = ss(shape - i);
      uniforms.uA.value = SIDES[Math.min(3, i)]; uniforms.uB.value = SIDES[Math.min(3, i + 1)]; uniforms.uMix.value = i >= 3 ? 0 : f;
      mesh.rotation.x = 0.12 - tilt.x; mesh.rotation.z = reduce ? 0 : t * 0.08 + tilt.z; mesh.rotation.y = reduce ? 0 : Math.sin(t * 0.3) * 0.12 + tilt.y;
      r.render(scene, cam);
    });
  }

  // ── Work ironing board — pinned +300%: the board enters and unfolds its legs, the work screen cloth drops to cover it, and the text panels light up in turn ──
  const work = root.querySelector(".tb-work");
  const panL = work.querySelector(".tb-work__panel--l"), panR = work.querySelector(".tb-work__panel--r");
  const wp = { board: 0, fall: 0, out: 0, cards: 0 };
  const workGlow = work.querySelector(".tb-work__glow");
  mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: work.querySelector(".tb-work__stage"), start: "top top", end: "+=400%", pin: true, scrub: true,
      onUpdate: (s) => { const g = cl((s.progress - 0.62) / 0.2); workGlow.style.setProperty("--fx-reveal", (0.2 + 0.8 * g).toFixed(3)); workGlow.style.setProperty("--fx-exit", ss(cl((s.progress - 0.72) / 0.2)).toFixed(3)); workGlow.style.opacity = cl(g * 3).toFixed(3); } } });
    tl.to(wp, { board: 1, duration: 0.3, ease: "none" }, 0)
      .to(wp, { fall: 1, duration: 0.25, ease: "none" }, 0.22)
      .fromTo(panL, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.34)
      .fromTo(panR, { autoAlpha: 0, x: 24 }, { autoAlpha: 1, x: 0, duration: 0.08, ease: "power2.out" }, 0.48)
      .to(wp, { out: 1, duration: 0.16, ease: "none" }, 0.58)
      .to([panL, panR], { autoAlpha: 0, duration: 0.06 }, 0.6)
      .to(wp, { cards: 1, duration: 0.3, ease: "none" }, 0.7);
    return () => { gsap.set([panL, panR], { clearProps: "all" }); };
  });
  mm.add({ reduce: "(prefers-reduced-motion: reduce)" }, () => { wp.board = 1; wp.fall = 1; gsap.set([panL, panR], { autoAlpha: 1 }); });
  const statTex = (n, cap, g) => TB3D.statTexture(n, cap, g);

  if (T) {
    const cv = work.querySelector(".tb-work__canvas"), r = renderer(cv), scene = new T.Scene(), cam = new T.PerspectiveCamera(36, 1, 0.1, 60);
    environment(r, scene); lights(scene);
    // The cloth follows the original Work list Cloth Fall type — during the fall it covers the panel along a path, and once settled it returns to a wrinkled rest type with the lower hem rippling.
    const b = board(), c = drape("Work screen capture · bright web hero · wide 16:10");
    b.group.add(c.mesh);
    scene.add(b.group);
    const stats = [["00+", ["Your number here", "One-line solution"], false], ["00yrs", ["Your number here", "One-line solution"], true], ["000+", ["Your number here", "One-line solution"], false]].map(([n, cap, g], i) => {
      const m = new T.Mesh(new T.PlaneGeometry(2.2, 1.37), new T.MeshBasicMaterial({ map: statTex(n, cap, g), transparent: true, side: T.DoubleSide, toneMapped: false }));
      scene.add(m); return m;
    });
    const statRest = [[-1.25, 0.95, 0, -0.04], [1.25, 0.95, 0, 0.03], [-0.6, -0.65, 0.4, -0.18]];
    const size = () => { fit(r, cam, cv); cam.position.set(0, 3.2, innerWidth < 768 ? 13 : 8.4); cam.lookAt(0, -0.3, 0); };
    size(); S.on(window, "resize", size);
    const mouse = { x: 0, tx: 0 };
    if (fine) S.on(window, "pointermove", (e) => { mouse.tx = (e.clientX / innerWidth) * 2 - 1; }, { passive: true });
    loop(cv, (dt, t) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      const e = ss(wp.board), o = ss(wp.out);
      b.group.position.set(lerp(7, 0, e) + lerp(0, -1.5, o), lerp(-2.4, 0.15, e) + lerp(0, 3.2, o), lerp(-2, 0, e));
      b.group.rotation.set(lerp(0.9, 0.05, e) + lerp(0, 0.9, o), lerp(-1.1, 0, e) + lerp(0, 0.7, o) + mouse.x * 0.08, lerp(0.3, 0, e));
      b.fold(lerp(1, 0, cl(wp.board * 1.4 - 0.3)));
      if (wp.fall >= 1) c.land(t); else c.lift();
      c.mesh.visible = wp.fall > 0 && o < 1; if (c.mesh.visible) c.pose(reduce ? 0 : t, fallLeft(wp.fall), { wrap: false });
      b.group.visible = o < 1;
      stats.forEach((m, i) => {
        const k = ss(cl(wp.cards * 1.6 - i * 0.25)), [x, y, z, rz] = statRest[i];
        m.visible = k > 0;
        m.position.set(lerp(x + 6, x, k), lerp(y - 4, y, k), lerp(-3, z, k)); m.rotation.set(lerp(-0.6, 0, k), lerp(-0.8, 0, k) + mouse.x * 0.05, lerp(rz - 0.5, rz, k));
      });
      r.render(scene, cam);
    });
  }

  // ── Reason — on wide screens 200vw flows horizontally (fixed length = Overflow width × 1.2), an iron glides along two swaying paths ──
  const why = root.querySelector(".tb-why"), track = why.querySelector(".tb-why__track"), pathSvg = why.querySelector(".tb-why__path");
  const P1 = pathSvg.querySelector(".p1"), P2 = pathSvg.querySelector(".p2"), ironCv = why.querySelector(".tb-why__iron");
  const whyP = { p: 0 };
  mm.add({ wide: "(min-width: 1024px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (!ctx.conditions.wide || !ctx.conditions.motion) return;
    gsap.timeline({ scrollTrigger: { trigger: why, start: "top top", end: () => `+=${(track.scrollWidth - innerWidth) * 1.2}`, scrub: true, pin: true, invalidateOnRefresh: true,
      onUpdate: () => { const span = track.scrollWidth - innerWidth, x = gsap.getProperty(track, "x") || 0; whyP.p = span > 0 ? cl(-x / span) : 0; } } })
      .to(track, { x: () => -(track.scrollWidth - innerWidth), ease: "none", duration: 1 }).to({}, { duration: 0.2 });
    return () => gsap.set(track, { clearProps: "transform" });
  });
  // The path undulates slightly over time — four nodes move by mixing two sines of different tempos
  const knots = (flip, ph) => {
    const Y = (v) => (flip ? 100 - v : v), k = (x, y, ax, ay, i) => ({ x, y: Y(y), ax, ay, ph: ph + 1.43 * i });
    return { s: { x: -5, y: Y(65) }, a: k(24, 65, 3, 2, 0), b: k(50, 35, 5, 2, 1), c: k(96.5, 50, 1.5, 2, 2), d: k(103.5, 36, 1.5, 2, 3), e: { x: 110.5, y: Y(36) } };
  };
  const K1 = knots(false, 0), K2 = knots(true, 2.7);
  const wob = (n, t) => ({ x: n.x + n.ax * (0.6 * Math.sin(0.31 * t + n.ph) + 0.4 * Math.sin(0.57 * t + 1.6 * n.ph)), y: n.y + n.ay * (0.55 * Math.sin(0.27 * t + 1.2 * n.ph) + 0.45 * Math.sin(0.49 * t + 0.7 * n.ph)) });
  const f2 = (v) => (Math.round(v * 100) / 100).toString();
  const pathOf = (K, t) => {
    const a = wob(K.a, t), b = wob(K.b, t), c = wob(K.c, t), d = wob(K.d, t);
    return `M ${f2(K.s.x)},${f2(K.s.y)} C ${f2(a.x)},${f2(a.y)} ${f2(b.x)},${f2(b.y)} 73,50 L 89,50 C ${f2(c.x)},${f2(c.y)} ${f2(d.x)},${f2(d.y)} ${f2(K.e.x)},${f2(K.e.y)}`;
  };
  let ironDraw = null;
  if (T) {
    const r = renderer(ironCv), scene = new T.Scene(), cam = new T.PerspectiveCamera(20, 1, 0.1, 60);
    environment(r, scene); const Lg = lights(scene); Lg.glow.position.set(0.1, 0.1, 0); Lg.glow.intensity = 2.2;
    const ir = iron(); const holder = new T.Group(); holder.add(ir.group); holder.rotation.set(0.42, -0.38, 0); scene.add(holder);
    const sizeIron = () => {
      const L = cl(0.095 * innerWidth, 112, 230), w = Math.round(3.1 * L), h = Math.round(2.9 * L);
      ironCv.style.width = `${w}px`; ironCv.style.height = `${h}px`; r.setSize(w, h, false);
      cam.aspect = w / h; cam.position.set(0, 0, (2 * h) / (2 * Math.tan((20 * Math.PI) / 360) * L)); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
    };
    sizeIron(); S.on(window, "resize", sizeIron);
    ironDraw = (ang) => { ir.group.rotation.z = ang; r.render(scene, cam); };
  }
  loop(pathSvg, (dt, t) => {
    const tt = reduce ? 0 : t;
    P1.setAttribute("d", pathOf(K1, tt)); P2.setAttribute("d", pathOf(K2, tt));
    if (!ironDraw || getComputedStyle(ironCv).display === "none") return;
    // The iron stays at 42% of screen width while the road flows beneath it — sample the road height and slope at that spot. Past the road end it continues at the last slope and settles slightly downward
    const tw = track.offsetWidth / 200, th = track.offsetHeight / 100, tx = gsap.getProperty(track, "x") || 0;
    const X = (innerWidth * 0.42 - tx) / tw, L = P1.getTotalLength();
    let prev = P1.getPointAtLength(0), y = prev.y, slope = 0, found = false;
    for (let i = 1; i <= 96; i++) { const q = P1.getPointAtLength((L * i) / 96); if (!found && q.x >= X) { const k = (X - prev.x) / Math.max(1e-4, q.x - prev.x); y = prev.y + (q.y - prev.y) * k; slope = (q.y - prev.y) / Math.max(1e-4, q.x - prev.x); found = true; } if (!found) { slope = (q.y - prev.y) / Math.max(1e-4, q.x - prev.x); y = q.y; } prev = q; }
    if (!found) { const over = X - prev.x, f = Math.exp(-over / 2.5); y = prev.y + slope * 2.5 * (1 - f) + 2.5 * cl(over / 20); slope *= f; }
    ironCv.style.transform = `translate(${X * tw - ironCv.offsetWidth / 2}px, ${y * th - ironCv.offsetHeight * 0.62}px)`;
    ironDraw(-Math.atan(slope * th / tw));
  });

  // ── Reason accordion — only one opens at a time (.4s cubic-bezier(.16,1,.3,1)) ──
  const faqs = [...why.querySelectorAll(".tb-faq__row")];
  faqs.forEach((row) => row.addEventListener("click", () => {
    const open = !row.classList.contains("is-open");
    faqs.forEach((o) => { o.classList.toggle("is-open", o === row && open); o.querySelector(".tb-faq__q").setAttribute("aria-expanded", String(o === row && open)); });
  }));
});
