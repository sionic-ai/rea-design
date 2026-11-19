// Service intro (web) page: pinned hero flow, planetary-gear leader lines, rack and pinion, gear process, closing gear
(() => {
  const { gearPath, cogSvg, makeChain, driveChain, place, clock } = LG;
  const NS = 'http://www.w3.org/2000/svg';
  document.getElementById('footSlot').outerHTML = LG.footer('Service Name & More');
  document.querySelector('#bigLine .g').innerHTML = cogSvg('');
  gsap.registerPlugin(ScrollTrigger);
  LG.themeHeader();
  LG.reveals();

  // Yellow gear sticker ‹Scroll to build›
  const spinG = document.createElementNS(NS, 'path');
  spinG.setAttribute('d', gearPath(16, 10.6, 0)); spinG.setAttribute('fill-rule', 'evenodd');
  document.querySelector('.spin svg').append(spinG);

  // ---------- 2 · Planetary gear (three line drawing) + numbered leader lines ----------
  // Dimensions · speeds measured from the original model: ring 72 · sun 18 · planet 27 (module 0.015), planet orbit 0.3375, ring outer 0.639.
  // Per second of animation: sun 0.8378 · carrier 0.1676 rad (planet −0.4468 on the carrier), the clock runs at (0.5 + 0.6·scroll acceleration) times
  const plan = (() => {
    const canvas = document.getElementById('planetary'), leaders = document.getElementById('leaders'), fig = document.getElementById('figure');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -50, 50);
    const look = LG3D.lineStyle(new THREE.Color(LG.css('--kf-bg')), new THREE.Color(LG.css('--kf-ink')));
    const M = 0.015, ZR = 72, ZS = 18, ZP = 27, ORBIT = M * (ZS + ZP) / 2;
    // The gear plate is built on the xy plane and the plate group is laid down — the plate’s z rotation is the world y-axis rotation
    const set = new THREE.Group(); set.rotation.x = -Math.PI / 2; scene.add(set);
    const flat = (geo, z, parent = set) => { const m = look.mesh(geo, parent); m.position.z = z; return m; };
    const cylZ = (r, h, n = 24) => new THREE.CylinderGeometry(r, r, h, n).rotateX(Math.PI / 2);
    const ring = flat(LG3D.ringGeo(0.63875, ZR, M, 0.09), 0);
    const sun = flat(LG3D.gearGeo(ZS, M, 0.08, 0.03), 0);
    flat(cylZ(0.03, 1.33, 16), -0.465);
    const nut = flat(new THREE.CylinderGeometry(0.0485, 0.0485, 0.028, 6).rotateX(Math.PI / 2), 0.175);
    const carrier = new THREE.Group(); set.add(carrier);
    flat(LG3D.carrierGeo(ORBIT, 0.055, 0.04, 0.032), 0.08, carrier);
    flat(cylZ(0.07, 0.1, 28), 0.11, carrier);
    const planets = [0, 1, 2].map((i) => {
      const a = i * 2 * Math.PI / 3, g = new THREE.Group();
      g.position.set(ORBIT * Math.cos(a), ORBIT * Math.sin(a), 0); carrier.add(g);
      flat(cylZ(0.022, 0.1, 16), 0.01, g);
      const gear = flat(LG3D.gearGeo(ZP, M, 0.08, 0.03), 0, g);
      return { a, gear };
    });
    // Meshing: sun side φp = θ + π + π/zp + (zs/zp)(θ − φs). The ring is aligned once to mesh with the first planet, then stays still
    const C0 = Math.PI / 2;
    const pose = (tau) => {
      const th = C0 + 0.1676 * tau, phs = 0.8378 * tau;
      sun.rotation.z = phs; carrier.rotation.z = th;
      planets.forEach((p) => { const t = th + p.a; p.gear.rotation.z = t + Math.PI + Math.PI / ZP + (ZS / ZP) * (t - phs) - th; });
    };
    { const t = C0, php = t + Math.PI + Math.PI / ZP + (ZS / ZP) * t; ring.rotation.z = t + (ZP / ZR) * (php - t); }
    pose(0);
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3();
    [ring, sun, nut, carrier, ...planets.map((p) => p.gear)].forEach((o) => box.expandByObject(o));
    const c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()), R = Math.max(size.x, size.z) * 0.5;
    // Leader line ends: a point on the sun’s edge · above the first planet (rotates with the carrier) · the ring edge
    const rb = new THREE.Box3().setFromObject(ring, true), sb = new THREE.Box3().setFromObject(sun, true);
    const anchors = [
      () => new THREE.Vector3(sb.max.x * 0.15 + c.x * 0.85, sb.max.y, sb.max.z * 0.7 + c.z * 0.3),
      () => planets[0].gear.getWorldPosition(new THREE.Vector3()).setY(rb.max.y + 0.02),
      () => new THREE.Vector3(c.x + (rb.max.x - c.x) * 0.72, rb.max.y, c.z + (rb.max.z - c.z) * 0.72),
    ];
    function resize() {
      const w = fig.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      const az = -25 * Math.PI / 180, el = 62 * Math.PI / 180, wide = innerWidth > 820, a = w / h;
      camera.position.set(c.x + 10 * Math.cos(el) * Math.sin(az), c.y + 10 * Math.sin(el), c.z + 10 * Math.cos(el) * Math.cos(az));
      camera.lookAt(c);
      // The panel fills the height (on wide screens the left 62%, the right is the description area)
      const room = wide ? 0.62 : 1, halfH = R * 1.04 / Math.min(1, a * room), halfW = halfH * a, off = wide ? halfW * 0.34 : 0;
      Object.assign(camera, { left: -halfW + off, right: halfW + off, top: halfH, bottom: -halfH });
      camera.updateProjectionMatrix();
      look.width.value = 1.1 * (2 * halfH) / h;
    }
    resize();
    let running = false, tau = 0;
    new IntersectionObserver(([e]) => { running = e.isIntersecting; }).observe(fig);
    const v = new THREE.Vector3(), items = fig.querySelectorAll('.callouts i');
    const tick = (dt) => {
      if (!running) return;
      if (!LG.reduce) tau += dt / 1000 * (0.5 + clock.boost * 0.6);
      pose(tau);
      renderer.render(scene, camera);
      // A number dot and, on wide screens, a line that runs horizontally out to the caption then bends at 45° to touch the part
      const fr = fig.getBoundingClientRect(), wide = innerWidth > 820;
      let html = '';
      anchors.forEach((fn, i) => {
        v.copy(fn()).project(camera);
        const ax = (v.x * 0.5 + 0.5) * fr.width, ay = (-v.y * 0.5 + 0.5) * canvas.clientHeight;
        if (wide && items[i]) {
          const ir = items[i].getBoundingClientRect(), lx = ir.left - fr.left - 10, ly = ir.top - fr.top + ir.height / 2;
          const ex = Math.min(lx - 20, ax + Math.abs(ly - ay));
          html += `<path d="M${lx.toFixed(1)} ${ly.toFixed(1)}L${ex.toFixed(1)} ${ly.toFixed(1)}L${ax.toFixed(1)} ${ay.toFixed(1)}"/>`;
        }
        html += `<circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="11"/><text x="${ax.toFixed(1)}" y="${ay.toFixed(1)}">${i + 1}</text>`;
      });
      leaders.innerHTML = html;
    };
    return { resize, tick };
  })();

  // ---------- 4 · Rack and pinion: marks light up where it has passed ----------
  const rackSvg = document.getElementById('rackSvg'), stage = rackSvg.parentElement;
  const RW = 1600, RH = 540, rm = 14, rz = 18, r = rm * rz / 2, p = Math.PI * rm, PA = Math.tan(20 * Math.PI / 180);
  const pitchY = 372, x0 = 120, xs = x0 + 2 * p, xe = RW - 150;
  rackSvg.setAttribute('viewBox', `0 0 ${RW} ${RH}`);
  const root = pitchY + 1.25 * rm, top = pitchY - rm, half = p / 4 - 0.6, bodyB = root + 44;
  let d = `M${-p} ${bodyB}L${-p} ${root}`;
  for (let k = -2; k * p < RW + p; k++) {
    const cx = x0 + (k + 0.5) * p;
    d += `L${(cx - half - 1.25 * rm * PA).toFixed(1)} ${root}L${(cx - half + rm * PA).toFixed(1)} ${top}L${(cx + half - rm * PA).toFixed(1)} ${top}L${(cx + half + 1.25 * rm * PA).toFixed(1)} ${root}`;
  }
  d += `L${RW + p} ${root}L${RW + p} ${bodyB}Z`;
  const PHRASES = ['Phrase number one', 'A second short phrase', 'Third phrase here', 'Fourth phrase here', 'Fifth phrase'];
  const stations = PHRASES.map((t, i) => ({ t, x: xs + 110 + i * ((xe - xs - 150) / (PHRASES.length - 1)) }));
  const holes = Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3; return `<circle cx="${(0.6 * r * Math.cos(a)).toFixed(1)}" cy="${(0.6 * r * Math.sin(a)).toFixed(1)}" r="${(0.17 * r).toFixed(1)}" fill="var(--kf-bg)"/>`; }).join('');
  rackSvg.innerHTML = `<path d="${d}" fill="var(--kf-ink)"/>` +
    stations.map((s, i) => `<rect class="mark" x="${s.x - 2}" y="${root + 12}" width="4" height="20" rx="2"/><text class="sn" x="${s.x}" y="${bodyB + 34}" text-anchor="middle">0${i + 1}</text>` +
      `<text class="st" x="${s.x}" y="${bodyB + 72}" text-anchor="middle">${s.t}</text>`).join('') +
    `<g id="pinion"><path d="${gearPath(rz, rm)}" fill="var(--kf-accent)" stroke="var(--kf-accent)" stroke-width="2" stroke-linejoin="round"/>${holes}<circle r="${0.2 * r}" fill="var(--kf-bg)"/><circle r="${0.1 * r}" fill="var(--site-yellow)"/></g>`;
  const pin = rackSvg.querySelector('#pinion'), mks = rackSvg.querySelectorAll('.mark'), sns = rackSvg.querySelectorAll('.sn'), sts = rackSvg.querySelectorAll('.st');
  const rack = { x: xs };
  let lastOn = -2;
  // Rotates by the distance rolled: angle = π/2 + (x − x0)/r
  function placePinion() {
    const x = rack.x;
    pin.setAttribute('transform', `translate(${x.toFixed(2)} ${pitchY - r}) rotate(${((Math.PI / 2 + (x - x0) / r) * 180 / Math.PI).toFixed(2)})`);
    let on = -1;
    stations.forEach((s, i) => { const passed = x >= s.x - 6; mks[i].classList.toggle('on', passed); if (passed) on = i; });
    if (on !== lastOn) {
      lastOn = on;
      document.getElementById('rackCap').textContent = on >= 0 ? stations[on].t : '';
      sns.forEach((e, i) => e.classList.toggle('on', i === on)); sts.forEach((e, i) => e.classList.toggle('on', i === on));
    }
    const W = stage.clientWidth, Ws = rackSvg.getBoundingClientRect().width;
    const tx = Ws > W + 1 ? Math.min(0, Math.max(W - Ws, W / 2 - x * Ws / RW)) : 0;
    rackSvg.style.transform = tx ? `translateX(${tx.toFixed(1)}px)` : '';
  }
  placePinion();
  gsap.to(rack, { x: xe, ease: 'none', onUpdate: placePinion, scrollTrigger: { trigger: '#rack', start: 'top top', end: '+=160%', pin: true, scrub: 0.4 } });

  // ---------- 6 · Gear process: horizontal when wide, vertical on phone, meshing together ----------
  const trainSvg = document.getElementById('train'), labels = document.getElementById('trainLabels');
  let train = null;
  function layoutTrain() {
    const vertical = innerWidth <= 820, tm = 10;
    const G = [{ z: 20, c: 'var(--kf-accent)', t: 'Step 1', s: 'One line' }, { z: 13, c: 'var(--site-yellow)', t: 'Step 2', s: 'One line' }, { z: 26, c: 'var(--kf-surface)', t: 'Step 3', s: 'One line' }, { z: 15, c: 'var(--site-yellow)', t: 'Step 4', s: 'One line' }];
    const ang = vertical ? [62, 118, 62] : [18, -16, 20];
    G[0].x = 0; G[0].y = 0;
    for (let i = 1; i < G.length; i++) Object.assign(G[i], place(tm, G[i - 1], G[i], ang[i - 1]));
    G.forEach((g) => (g.hole = tm * g.z * 0.12));
    train = makeChain(trainSvg, G, tm, 4);
    trainSvg.style.maxWidth = vertical ? '420px' : '';
    G.forEach((g) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', tm * g.z * 0.3); c.setAttribute('fill', 'none'); c.setAttribute('stroke', 'var(--kf-contrast-bg)'); c.setAttribute('stroke-opacity', '0.15'); c.setAttribute('stroke-width', tm * 0.5); c.setAttribute('cx', g.x); c.setAttribute('cy', g.y); trainSvg.append(c); });
    labels.innerHTML = '';
    const vb = train.vb;
    G.forEach((g) => {
      const lb = document.createElement('div'); lb.innerHTML = `<b>${g.t}</b><small>${g.s}</small>`;
      lb.style.left = ((g.x - vb.x) / vb.w * 100) + '%'; lb.style.top = ((g.y + g.ro * 0.42 - vb.y) / vb.h * 100) + '%';
      labels.append(lb);
    });
  }
  layoutTrain();
  addEventListener('resize', () => { layoutTrain(); plan.resize(); });
  LG.ctaMesh(document.getElementById('mesh'), ['var(--kf-accent)', 'var(--kf-ink)']);

  gsap.ticker.add((t, dt) => {
    const ph = clock.phase;
    driveChain(train, ph);
    plan.tick(dt);
    spinG.setAttribute('transform', `translate(100 100) rotate(${(ph * 40 * 12 / 16).toFixed(1)})`);
  });

  // ---------- 1 · Hero pin: the big row and the capture row move left together ----------
  const line = document.getElementById('bigLine'), track = document.getElementById('track');
  const dist = (el) => Math.max(0, el.scrollWidth - innerWidth);
  gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: () => '+=' + Math.max(dist(track), dist(line)) * 1.2, pin: true, scrub: 0.6, invalidateOnRefresh: true, refreshPriority: 10 } })
    .to(line, { x: () => -dist(line) - 20, ease: 'none' }, 0)
    .to(track, { x: () => -dist(track), ease: 'none' }, 0);
  gsap.utils.toArray('.parallax').forEach((el) => gsap.to(el, { yPercent: +el.dataset.speed, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from('#collage .ph', { x: 80, autoAlpha: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out', delay: 0.2 });
    gsap.from('#cta .huge', { yPercent: 40, autoAlpha: 0, ease: 'power3.out', duration: 1, scrollTrigger: { trigger: '#cta', start: 'top 75%' } });
  });
})();
