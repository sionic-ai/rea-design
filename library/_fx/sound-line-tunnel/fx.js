(() => {
  // Original sound visualizer (three r168): a bundle of long lines converging on a vanishing point at screen center. The lines are bands parallel to the camera axis, so perspective makes them radiate,
  // Sound lines (channels) swell sideways by the waveform size to become rough accent-color waveforms. Bright nodes flow along the band (p), and an active channel is wider and brighter.
  // Dust dots float on screen with a faint ring in the center. The camera tilts slightly with the mouse.
  const VERT = `
    uniform float uTime; uniform float uAngle; uniform float uRadius; uniform float uLen; uniform float uWidth;
    uniform float uAmp; uniform float uSeed; uniform float uSpeed; uniform float uWave;
    varying vec2 vUv; varying float vAmp;
    float h(float n){ return fract(sin(n) * 43758.5453); }
    float n1(float x){ float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h(i + uSeed), h(i + 1.0 + uSeed), f); }
    void main(){
      vUv = uv;
      float y = uv.y;
      float s = y * 46.0 - uTime * uSpeed;
      float env = smoothstep(0.0, 0.04, y) * smoothstep(1.0, 0.35, y);
      float spike = pow(n1(s * 1.9), 3.0) * 0.75 + pow(abs(sin(s * 7.3 + uSeed)), 9.0) * 0.6 + n1(s * 0.35) * 0.35;
      float amp = uAmp * spike * env;
      vAmp = amp;
      float across = position.x * (uWidth + amp);
      vec3 dir = vec3(cos(uAngle), sin(uAngle), 0.0);
      vec3 tan = vec3(-sin(uAngle), cos(uAngle), 0.0);
      float wob = sin(y * 4.0 + uTime * 0.58) * uWave;
      vec3 p = dir * (uRadius + wob) + tan * across + vec3(0.0, 0.0, 2.0 - y * uLen);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FRAG = `
    uniform vec3 uColA; uniform vec3 uColB; uniform float uTime; uniform float uAlpha; uniform float uBand; uniform float uAct;
    varying vec2 vUv; varying float vAmp;
    float r(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){
      float band = 1.0 - smoothstep(0.0, uBand, abs(fract(uTime * 0.05) - vUv.y));
      vec3 col = mix(uColA, uColB, clamp(band + uAct * 0.35, 0.0, 1.0));
      float grain = r(gl_FragCoord.xy * 0.5 + floor(uTime * 24.0));
      float edge = 1.0 - smoothstep(0.35, 0.5, abs(vUv.x - 0.5));
      float a = uAlpha * edge * (0.55 + 0.45 * step(0.35, grain)) * smoothstep(1.0, 0.7, vUv.y) * smoothstep(0.0, 0.05, vUv.y);
      gl_FragColor = vec4(col * (0.75 + 0.5 * grain), a);
    }`;

  // Gray used only when the skin variable is empty — set as three numbers instead of a color name
  const cssColor = (el, name, grey) => {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    const c = new THREE.Color(grey, grey, grey);
    if (v) try { c.setStyle(v); } catch {}
    return c;
  };

  // If three isn’t loaded yet, it loads the CJS build of the same library itself and moves it to window.THREE (if the caller loaded it beforehand, it is used as is)
  const here = document.currentScript?.src || location.href;
  let loading = null;
  const loadThree = () => {
    if (window.THREE) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const had = "exports" in window, prev = window.exports;
      window.exports = {};
      const tag = document.createElement("script");
      tag.src = new URL("../../_vendor/three@0.168.0/build/three.cjs", here).href;
      tag.onload = () => { window.THREE = window.exports; if (had) window.exports = prev; else delete window.exports; resolve(); };
      tag.onerror = reject;
      document.head.append(tag);
    });
    return loading;
  };

  kfFx.register("sound-line-tunnel", (el, ctx) => {
    if (window.THREE) return build(el, ctx);
    let off = null, gone = false;
    loadThree().then(() => { if (!gone && el.isConnected) off = build(el, ctx); }, () => {});
    return () => { gone = true; off?.(); };
  });

  function build(el, { options, reduce }) {
    const channels = Math.max(1, +options.lines || 9);
    const thin = Math.max(0, +(options.thin ?? 22));
    const dust = Math.max(0, +(options.dust ?? 260));
    const speed = +(options.speed ?? 1);
    const loud = Math.min(channels, Math.max(0, +(options.loud ?? 3)));
    const tilt = +(options.tilt ?? 0.06);
    const accent = cssColor(el, "--kf-accent", 0.6);
    const ink = cssColor(el, "--kf-ink", 0.62);
    const light = cssColor(el, "--kf-ink-soft", 0.82);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
    const geo = new THREE.PlaneGeometry(1, 1, 1, 384);
    geo.translate(0, 0.5, 0);
    const meshes = [];
    const rand = (a, b) => a + Math.random() * (b - a);
    const add = (isCh, i) => {
      const angle = rand(0, Math.PI * 2);
      const m = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending,
        uniforms: {
          uTime: { value: 0 }, uAngle: { value: angle }, uRadius: { value: isCh ? rand(1.4, 5) : rand(1.6, 7) }, uLen: { value: 120 },
          uWidth: { value: isCh ? 0.03 : rand(0.012, 0.03) }, uAmp: { value: 0 }, uSeed: { value: rand(0, 100) }, uSpeed: { value: rand(2, 4) * speed },
          uWave: { value: isCh ? 0.15 : 0 }, uColA: { value: isCh ? accent.clone().multiplyScalar(0.8) : ink.clone().multiplyScalar(0.55) },
          uColB: { value: isCh ? accent.clone() : light.clone() }, uAlpha: { value: isCh ? 1 : rand(0.25, 0.6) }, uBand: { value: 0.12 }, uAct: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(geo, m);
      mesh.frustumCulled = false;
      // As in the original, only a few lines (loud) swell boldly while the other channels carry just small ripples
      mesh.userData = { isCh, act: 0, target: 0, base: isCh ? (i < loud ? rand(1.6, 2.6) : rand(0.2, 0.45)) : 0 };
      scene.add(mesh);
      meshes.push(mesh);
    };
    for (let i = 0; i < channels; i++) add(true, i);
    for (let i = 0; i < thin; i++) add(false, i);

    const dGeo = new THREE.BufferGeometry();
    const dPos = new Float32Array(dust * 3);
    for (let i = 0; i < dust; i++) { dPos[i * 3] = rand(-18, 18); dPos[i * 3 + 1] = rand(-12, 12); dPos[i * 3 + 2] = rand(-120, 0); }
    dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    const points = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: light, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false }));
    scene.add(points);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.46, 96), new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    ring.position.z = -46;
    scene.add(ring);

    // Channel on/off, the consumer (mixer panel) is fx:channel { index, on } Send it to the element
    const setCh = (i, on) => { const m = meshes[i]; if (m?.userData.isCh) m.userData.target = on ? 1 : 0; };
    String(options.on ?? "").split(/[ ,]+/).filter(Boolean).forEach((i) => setCh(+i, true));
    const onChannel = (e) => setCh(+e.detail?.index, !!e.detail?.on);
    el.addEventListener("fx:channel", onChannel);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => { mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = (e.clientY / innerHeight - 0.5) * 2; };
    addEventListener("pointermove", onMove, { passive: true });

    const size = () => {
      const w = el.clientWidth || innerWidth, h = el.clientHeight || innerHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < 768 ? 90 : 50;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();

    let raf = 0, t = 0, last = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (document.hidden) return;
      t += dt;
      draw(dt);
    };
    const draw = (dt) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      camera.rotation.set(-mouse.y * tilt, -mouse.x * tilt, t * 0.03);
      for (const m of meshes) {
        const u = m.material.uniforms, d = m.userData;
        d.act += (d.target - d.act) * Math.min(1, dt * 6);
        u.uTime.value = t;
        u.uAct.value = d.act;
        u.uAmp.value = d.isCh ? d.base * (0.7 + d.act * 0.9) : 0;
        u.uWave.value = d.isCh ? 0.15 + d.act * 0.25 : 0;
      }
      const p = dGeo.attributes.position.array;
      for (let i = 0; i < dust; i++) { p[i * 3 + 2] += dt * 6 * speed; if (p[i * 3 + 2] > 0) p[i * 3 + 2] = -120; }
      dGeo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };
    if (reduce) { t = 3; draw(0.016); }
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      el.removeEventListener("fx:channel", onChannel);
      meshes.forEach((m) => m.material.dispose());
      geo.dispose(); dGeo.dispose(); points.material.dispose(); ring.geometry.dispose(); ring.material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }
})();
