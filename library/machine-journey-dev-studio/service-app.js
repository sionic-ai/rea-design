// App service page: flipping phone (front screen → gear behind), launch stages turned by a Geneva drive
(() => {
  const { cogSvg, clock } = LG;
  document.getElementById('footSlot').outerHTML = LG.footer('App Service Name');
  document.querySelector('.fn-cog').outerHTML = cogSvg();
  gsap.registerPlugin(ScrollTrigger);
  LG.themeHeader();
  LG.reveals();

  const css = (n) => new THREE.Color(LG.css(n));
  // Original line art: faces are filled, edges bent more than 30°·25° get dark teal ink lines, round outlines use a back-face shell inflated along normals
  const kit = (angle) => {
    const ink = css('--site-teal-deep'), line = new THREE.LineBasicMaterial({ color: ink }), width = { value: 0.004 };
    const outline = new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide });
    outline.onBeforeCompile = (sh) => {
      sh.uniforms.outlineWidth = width;
      sh.vertexShader = 'uniform float outlineWidth;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * outlineWidth;');
    };
    const fill = (name) => new THREE.MeshBasicMaterial({ color: css(name), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const mesh = (geo, mat, parent) => {
      const m = new THREE.Mesh(geo, mat);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, angle), line), new THREE.Mesh(geo, outline));
      parent.add(m); return m;
    };
    return { width, fill, mesh };
  };
  const roundRect = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0); s.lineTo(x + w, y + h - r);
    s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2); s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
    s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
    return s;
  };
  const slab = (shape, z0, z1, seg = 10) => new THREE.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: false, curveSegments: seg }).translate(0, 0, z0);

  // ---------- Hero: the phone flips with scroll, and five gears mesh and turn in the concave slot on the back ----------
  // Measured dimensions of the original model (standing pose — width x · height y · front is +z): body 0.75×1.55×0.085, screen 0.7×1.5, camera bump 0.25 wide protruding 0.045 at the back,
  // Gear teeth 22·12·18·10·16 (module 0.016, thickness 0.012), clock at (0.5 + 1.5·scroll acceleration) rad/s
  const phone3d = (() => {
    const canvas = document.getElementById('phone3d');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -20, 20);
    camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0);
    const K = kit(30), body = K.fill('--kf-accent-soft'), dark = K.fill('--kf-ink');
    // Screen: draws a placeholder app screen on a canvas and attaches it
    const sc = Object.assign(document.createElement('canvas'), { width: 700, height: 1450 }), g = sc.getContext('2d');
    const C = (n) => LG.css(n);
    const rr = (x, y, w, h, r, c) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
    rr(0, 0, 700, 1450, 0, C('--kf-surface'));
    rr(240, 34, 220, 58, 29, C('--kf-ink'));
    rr(64, 150, 300, 30, 15, C('--kf-ink')); rr(64, 206, 470, 18, 9, C('--site-ash'));
    g.save(); g.beginPath(); g.roundRect(64, 270, 572, 480, 44); g.clip(); rr(64, 270, 572, 480, 0, C('--kf-accent'));
    g.fillStyle = C('--site-yellow'); g.beginPath(); g.arc(570, 650, 210, 0, Math.PI * 2); g.fill(); g.restore();
    rr(64, 790, 272, 150, 34, C('--site-fog')); rr(364, 790, 272, 150, 34, C('--site-yellow'));
    rr(64, 1290, 572, 100, 50, C('--kf-ink'));
    ['--site-yellow', '--site-dot', '--site-dot', '--site-dot'].forEach((c, i) => { g.fillStyle = C(c); g.beginPath(); g.arc(150 + i * 133, 1340, 22, 0, Math.PI * 2); g.fill(); });
    const tex = new THREE.CanvasTexture(sc); tex.colorSpace = THREE.SRGBColorSpace;
    const pivot = new THREE.Group(); scene.add(pivot);
    // Body: front plate + back frame (a concave slot with a hollow center)
    const W = 0.75, H = 1.55, R = 0.12, win = roundRect(0.63, 1.12, 0.07);
    const frame = roundRect(W, H, R);
    frame.holes.push(new THREE.Path(win.getPoints(12).map((p) => new THREE.Vector2(p.x, p.y - 0.105))));
    K.mesh(slab(roundRect(W, H, R), 0, 0.0425), body, pivot);
    K.mesh(slab(frame, -0.0425, 0), body, pivot);
    const screen = new THREE.Mesh(new THREE.ShapeGeometry(roundRect(0.7, 1.5, 0.09), 10), new THREE.MeshBasicMaterial({ map: tex }));
    { const uv = screen.geometry.attributes.uv, pos = screen.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 0.7 + 0.5, pos.getY(i) / 1.5 + 0.5); }
    screen.position.z = 0.044; pivot.add(screen);
    const cam = K.mesh(slab(roundRect(0.25, 0.25, 0.07), -0.0875, -0.0415), dark, pivot); cam.position.set(0.185, 0.585, 0);
    // Gear: meshes with the original position (moved to an upright pose) at phase φB = θ + π + π/zB + (zA/zB)(θ − φA)
    const GZ = [22, 12, 18, 10, 16], GM = 0.016, GC = ['--site-yellow', '--kf-accent', '--kf-contrast-ink', '--site-yellow', '--kf-accent'];
    const GP = [[-0.07, 0.26, -0.0155], [0.1057, 0.0507, -0.0215], [-0.0494, -0.1342, -0.0155], [0.0954, -0.3068, -0.0215], [-0.0391, -0.4671, -0.0155]];
    const gears = GZ.map((z, i) => {
      const o = K.mesh(LG3D.gearGeo(z, GM, 0.012, 0.012), K.fill(GC[i]), pivot); o.position.set(...GP[i]);
      K.mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.031, 12).rotateX(Math.PI / 2), dark, pivot).position.set(GP[i][0], GP[i][1], -0.022);
      return { z, o, x: GP[i][0], y: GP[i][1] };
    });
    gears.forEach((gr, i) => { if (i) gr.th = Math.atan2(gr.y - gears[i - 1].y, gr.x - gears[i - 1].x); });
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      const half = Math.max(0.86, 0.86 * (0.56 / (w / h)));
      Object.assign(camera, { left: -half * w / h, right: half * w / h, top: half, bottom: -half });
      camera.updateProjectionMatrix();
      K.width.value = 1.2 * (2 * half) / h;
    };
    resize();
    addEventListener('resize', resize);
    const st = { flip: 0, intro: 0 };
    let phi = 0;
    return {
      st,
      frame(dt, speed) {
        phi += speed * dt;
        gears.forEach((gr, i) => { gr.phi = i ? gr.th + Math.PI + Math.PI / gr.z + (gears[i - 1].z / gr.z) * (gr.th - gears[i - 1].phi) : phi; gr.o.rotation.z = gr.phi; });
        // Flip it slightly tilted so the thickness reads, and sway a little while resting
        const t = st.flip, sway = Math.sin(performance.now() / 1400) * 0.05 * (1 - Math.abs(Math.sin(t * Math.PI)));
        pivot.rotation.set(-0.18 + 0.1 * Math.sin(t * Math.PI), -0.35 + t * Math.PI + sway, 0.04);
        pivot.position.y = (1 - st.intro) * -0.4;
        renderer.render(scene, camera);
      },
    };
  })();

  // ---------- Geneva gear: the driver turns the slot wheel exactly 90° per wheel turn. Line drawing built from dimensions measured on the original model ----------
  // Driver board radius 0.56, pin radius 0.11 (center A=1), home wheel radius 1 (center C=√2), base x −1~2.414 · depth ±1.15
  const N = 4, A = 1, Cc = A / Math.sin(Math.PI / N);
  const steps = document.querySelectorAll('#steps li');
  const geneva = (() => {
    const canvas = document.getElementById('geneva');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -50, 50);
    const K = kit(25), F = { wheel: K.fill('--site-yellow'), driver: K.fill('--kf-accent'), base: K.fill('--site-teal-3') };
    // The panel is built on xy and laid down — panel plane (x, y) is world (x, −z), thickness is world y
    const lay = (shape, y0, y1, mat, parent, seg = 24) => { const m = K.mesh(slab(shape, y0, y1, seg), mat, parent); m.rotation.x = -Math.PI / 2; return m; };
    const disc = (r) => { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2); return s; };
    const hole = (cx, cy, r) => { const p = new THREE.Path(); p.absarc(cx, cy, r, 0, Math.PI * 2, true); return p; };
    // Base plate and two axes
    const base = new THREE.Group(); scene.add(base);
    const bs = new THREE.Shape(roundRect(3.414, 2.3, 0.18).getPoints(12).map((p) => new THREE.Vector2(p.x + 0.707, p.y)));
    lay(bs, -0.16, 0, F.base, base);
    [[0, 0], [Cc, 0]].forEach(([x]) => { const post = lay(disc(0.07), 0, 0.68, F.base, base); post.position.x = x; });
    // Home wheel: on a unit-radius disc, four grooves in 45°·135°… directions (width 0.24, rounded ends) and four locking arcs in 0°·90°… directions (drive disc 0.56 + gap 0.02)
    const wheelS = (() => {
      const h = 0.12, lockR = 0.58, inner = Cc - A - 0.12, da = Math.asin(h), pts = [];
      const rim = (a) => {
        let r = 1;
        for (let k = 0; k < 4; k++) { const b = Cc * Math.cos(a - k * Math.PI / 2), q = b * b - (Cc * Cc - lockR * lockR); if (q > 0 && b > 0) r = Math.min(r, b - Math.sqrt(q)); }
        return r;
      };
      for (let k = 0; k < 4; k++) {
        const s = Math.PI / 4 + k * Math.PI / 2, c = Math.cos(s), sn = Math.sin(s), P = (u, v) => new THREE.Vector2(u * c - v * sn, u * sn + v * c);
        pts.push(P(Math.cos(da), -h), P(inner, -h));
        for (let j = 1; j < 12; j++) { const q = -Math.PI / 2 - j / 12 * Math.PI; pts.push(P(inner + h * Math.cos(q), h * Math.sin(q))); }
        pts.push(P(inner, h), P(Math.cos(da), h));
        for (let j = 1; j < 48; j++) { const a = s + da + j / 48 * (Math.PI / 2 - 2 * da), r = rim(a); pts.push(new THREE.Vector2(r * Math.cos(a), r * Math.sin(a))); }
      }
      const w = new THREE.Shape(pts);
      w.holes.push(hole(0, 0, 0.08));
      return w;
    })();
    const wheel = new THREE.Group(); wheel.position.x = Cc; scene.add(wheel);
    lay(wheelS, 0.3, 0.62, F.wheel, wheel, 4);
    // Drive: lock plate (half-moon groove toward the wheel) + arm + pin
    const driver = new THREE.Group(); scene.add(driver);
    const lockS = (() => {
      const s = new THREE.Shape(), r = 0.56, cut = 1.02, a0 = Math.acos((Cc * Cc + r * r - cut * cut) / (2 * Cc * r));
      s.absarc(0, 0, r, a0, 2 * Math.PI - a0, false);
      const b0 = Math.atan2(-r * Math.sin(a0), r * Math.cos(a0) - Cc), b1 = Math.atan2(r * Math.sin(a0), r * Math.cos(a0) - Cc);
      s.absarc(Cc, 0, cut, b0 + 2 * Math.PI, b1, true);
      s.holes.push(hole(0, 0, 0.08));
      return s;
    })();
    lay(lockS, 0.28, 0.62, F.driver, driver);
    const arm = new THREE.Shape(); arm.moveTo(0, -0.11); arm.lineTo(A, -0.11); arm.absarc(A, 0, 0.11, -Math.PI / 2, Math.PI / 2); arm.lineTo(0, 0.11); arm.absarc(0, 0, 0.11, Math.PI / 2, Math.PI * 1.5);
    lay(arm, 0.62, 0.69, F.driver, driver);
    const pin = lay(disc(0.11), 0.3, 0.69, F.driver, driver); pin.position.x = A;
    const st = { p: 0 };
    let lastStep = -1;
    const draw = () => {
      const T = -180 + st.p * N * 360;
      const k = Math.min(N, Math.floor((T + 180) / 360)), th = T - k * 360, half = 180 / N;
      let w = -90 * k;
      if (th > -half && th < half) {
        const t = th * Math.PI / 180;
        let psi = Math.atan2(A * Math.sin(t), A * Math.cos(t) - Cc) * 180 / Math.PI;
        if (psi < 0) psi += 360;
        w += psi - 225;
      } else if (th >= half) w -= 90;
      driver.rotation.y = T * Math.PI / 180;
      wheel.rotation.y = w * Math.PI / 180;
      renderer.render(scene, camera);
      const step = Math.max(0, Math.min(N - 1, k + (th >= half ? 1 : 0) - 1));
      if (step !== lastStep) { lastStep = step; steps.forEach((li, i) => li.classList.toggle('on', i === step)); }
    };
    camera.position.set(Cc / 2 + 4, 7, 5.5); camera.lookAt(Cc / 2, 0.15, 0);
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      const a = w / h, half = Math.max(1.32, 1.32 * 1.7 / a);
      Object.assign(camera, { left: -half * a, right: half * a, top: half, bottom: -half });
      camera.updateProjectionMatrix();
      K.width.value = 1.2 * (2 * half) / h;
      draw();
    };
    resize();
    addEventListener('resize', resize);
    return { st, draw };
  })();
  gsap.to(geneva.st, { p: 0.999, ease: 'none', onUpdate: geneva.draw, scrollTrigger: { trigger: '#release', start: 'top top', end: '+=220%', pin: true, scrub: 0.4 } });

  // ---------- Phone flip ----------
  gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=110%', pin: true, scrub: 0.5 } })
    .to(phone3d.st, { flip: 1, ease: 'power2.inOut', duration: 1 }, 0.1)
    .to('.flipnote', { autoAlpha: 0, duration: 0.2 }, 0.1)
    .to({}, { duration: 0.2 });
  LG.ctaMesh(document.getElementById('mesh'), ['var(--kf-ink)', 'var(--kf-accent)']);
  gsap.ticker.add((t, dt) => phone3d.frame(dt / 1000, LG.reduce ? 0 : 0.5 + clock.boost * 1.5));

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('#hero > div:first-child > *', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out', delay: 0.15 });
    gsap.to(phone3d.st, { intro: 1, duration: 1.2, ease: 'power3.out', delay: 0.3 });
    gsap.from('#phone3d', { autoAlpha: 0, duration: 0.8, delay: 0.3 });
  });
  mm.add('(prefers-reduced-motion: reduce)', () => { phone3d.st.intro = 1; });
})();
