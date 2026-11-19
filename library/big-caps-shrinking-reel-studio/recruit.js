// Careers — the original R3F globe rebuilt with three: land dots on a sphere (r 1, 64 segments, translucent base color), pins (working·resting·sleeping by city time), dotted arcs between pins (dash .045 · gap .035, height),
// Group .8x, y −.25, camera z 3.2, auto-rotate (OrbitControls autoRotateSpeed .5 = …per second .052rad), drag to rotate. Panel color shifts from yellow to apricot with scroll.
(() => {
  const TW = window.TW, { q, qa } = TW;
  const PINS = [
    { id: "a", lat: 37.57, lng: 126.98, tz: "Asia/City" }, { id: "b", lat: 34.05, lng: -118.24, tz: "America/Los_Angeles" },
    { id: "c", lat: 40.71, lng: -74.0, tz: "America/New_York" }, { id: "d", lat: 51.5, lng: -0.12, tz: "Europe/City" },
    { id: "e", lat: 38.72, lng: -9.14, tz: "Europe/Lisbon" }, { id: "f", lat: -33.87, lng: 151.21, tz: "Australia/City" },
    { id: "g", lat: 19.43, lng: -99.13, tz: "America/Mexico_City" }, { id: "h", lat: 52.52, lng: 13.4, tz: "Europe/Berlin" },
    { id: "i", lat: -23.55, lng: -46.63, tz: "America/Sao_Paulo" }, { id: "j", lat: 25.2, lng: 55.27, tz: "Asia/City" },
  ];
  const ARCS = [["b", "c"], ["c", "d"], ["d", "h"], ["e", "i"], ["h", "j"], ["j", "a"], ["a", "f"], ["g", "b"]];
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const status = (tz) => { const h = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: tz }).formatToParts(new Date()).find((p) => p.type === "hour")?.value || 0); return h >= 22 || h < 6 ? "sleep" : h >= 9 && h < 18 ? "work" : "life"; };
  const toXYZ = (lat, lng, r) => { const p = ((90 - lat) * Math.PI) / 180, t = ((lng + 180) * Math.PI) / 180; return new THREE.Vector3(-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)); };
  // Our land pattern — a few layers of sine noise make continent-like blobs (the original land map image isn’t used)
  const land = (v) => Math.sin(v.x * 3.1 + 1.3) * Math.cos(v.y * 2.7 - 0.4) + Math.sin(v.z * 3.7 + v.x * 1.9) * 0.6 + Math.cos(v.y * 5.3 + v.z * 2.1) * 0.35;

  const globe = (stage) => {
    const canvas = q(".tw-globe-canvas", stage), pinsEl = q(".tw-globe-pins", stage);
    if (!window.THREE || !canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.2;
    const group = new THREE.Group();
    group.scale.setScalar(0.8);
    group.position.y = -0.25;
    scene.add(group);
    const ink = new THREE.Color(css("--kf-ink")), body = new THREE.Color(css("--kf-bg"));
    group.add(new THREE.Mesh(new THREE.SphereGeometry(0.998, 64, 64), new THREE.MeshBasicMaterial({ colorWrite: false })));
    group.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), new THREE.MeshBasicMaterial({ color: body, transparent: true, opacity: 0.55 })));
    const pts = [];
    const N = 9000, ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
      const v = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
      if (land(v) > 0.55) pts.push(v.multiplyScalar(1.004));
    }
    const landGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const landMat = new THREE.PointsMaterial({ color: ink, size: 0.012, transparent: true, opacity: 0.35 });
    group.add(new THREE.Points(landGeo, landMat));
    const byId = Object.fromEntries(PINS.map((p) => [p.id, p]));
    ARCS.forEach(([a, b]) => {
      const A = toXYZ(byId[a].lat, byId[a].lng, 1.02), B = toXYZ(byId[b].lat, byId[b].lng, 1.02);
      const mid = A.clone().add(B).multiplyScalar(0.5).normalize().multiplyScalar(1.02 + A.distanceTo(B) * 0.28);
      const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(120)), new THREE.LineDashedMaterial({ color: ink, dashSize: 0.045, gapSize: 0.035, transparent: true, opacity: 0.5 }));
      line.computeLineDistances();
      group.add(line);
    });
    const counts = { work: 0, life: 0, sleep: 0 };
    const pins = PINS.map((p, k) => {
      const st = status(p.tz);
      counts[st]++;
      const el = document.createElement("span");
      el.className = `tw-pin is-${st}`;
      el.innerHTML = `<i></i>Member ${k + 1}`;
      pinsEl.append(el);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: ink }));
      dot.position.copy(toXYZ(p.lat, p.lng, 1.01));
      group.add(dot);
      return { el, dot };
    });
    qa(".tw-leg b", stage).forEach((b, i) => { b.textContent = counts[["work", "life", "sleep"][i]]; });
    const size = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    size();
    new ResizeObserver(size).observe(stage);
    // The original starts spinning only when the globe section is at screen center (still on the hero)
    let drag = null, vel = 0, visible = true, active = false;
    ScrollTrigger.create({ trigger: stage.parentElement, start: "top top", end: "bottom top", onToggle: (st) => { active = st.isActive; } });
    canvas.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; drag = e.clientX; canvas.style.cursor = "grabbing"; });
    addEventListener("pointermove", (e) => { if (drag == null) return; vel = (e.clientX - drag) * 0.005; group.rotation.y += vel; drag = e.clientX; });
    addEventListener("pointerup", () => { drag = null; canvas.style.cursor = ""; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);
    const v = new THREE.Vector3(), cam = new THREE.Vector3();
    let last = performance.now();
    const tick = () => {
      const now = performance.now(), dt = Math.max(1, now - last) / 1000;
      last = now;
      if (!visible) return;
      if (drag == null && !TW.reduce) { group.rotation.y += (active ? 0.052 * dt : 0) + vel; vel *= 0.92; }
      renderer.render(scene, camera);
      camera.getWorldPosition(cam);
      pins.forEach(({ el, dot }) => {
        dot.getWorldPosition(v);
        const facing = v.clone().sub(group.position).normalize().dot(cam.clone().sub(v).normalize()) > 0.1;
        v.project(camera);
        el.style.transform = `translate(${(v.x * 0.5 + 0.5) * stage.clientWidth}px, ${(-v.y * 0.5 + 0.5) * stage.clientHeight}px) translate(-50%, -130%)`;
        el.style.opacity = facing ? "1" : "0";
      });
    };
    gsap.ticker.add(tick);
  };

  TW.start(() => {
    // Original careers hero: title lines .85s (.1 stagger) after .45, body lines .8s (.1 stagger) after .62, ”Open positions” .85s after .8, all power3.out from beneath a mask.
    TW.rise(qa(".tw-globe-t .tw-mask > span"), { duration: 0.85, stagger: 0.1, delay: 0.45 });
    const d = q(".tw-globe-d");
    if (d) { d.dataset.twDone = "1"; TW.lines(d, { duration: 0.8, stagger: 0.1, delay: 0.62, scroll: false }); }
    TW.rise(qa(".tw-globe-cta"), { duration: 0.85, delay: 0.8 });
    globe(q(".tw-globe-stage"));
    // Yellow board → apricot board (while the globe comes to screen center)
    if (!TW.reduce) gsap.fromTo(".tw-main", { backgroundColor: css("--kf-accent-soft") || undefined }, { backgroundColor: css("--kf-raised"), ease: "none", scrollTrigger: { trigger: ".tw-globe", start: "top 60%", end: "center center", scrub: true } });
    const perks = qa(".tw-perk");
    ScrollTrigger.create({ trigger: ".tw-collage", start: "top 60%", end: "bottom 40%", onUpdate: (st) => { const k = Math.min(perks.length - 1, Math.floor(st.progress * perks.length)); perks.forEach((p, i) => p.classList.toggle("is-on", i <= k)); } });
  });
})();
