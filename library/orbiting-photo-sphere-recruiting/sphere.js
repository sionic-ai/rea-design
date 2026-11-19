// 3D sphere with hundreds of photos stuck on its surface and spinning — shared by the home hero (camera z7, right in front of the sphere) and the about header (z13.5, whole sphere on the right).
// Original settings: radius 5 · fov 45 · .4 height per card · 200 cards · constant rotation .1rad/s · entry 280° 4.7s power3.out · fog near .5→4 / far 3→14 3.2s power2.inOut.
// Photos are placeholders, so canvas-drawn ”photo-like color fields” (people, city, office, landscape, panel) are used as an atlas.
window.rgSphere = (canvas, opt = {}) => {
  const THREE = window.THREE;
  const o = Object.assign({ speed: 0.1, camZ: 7, count: 200, radius: 5, fogNear: 4, fogFar: 14, entry: true, lookX: 0, offsetX: 0 }, opt);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  // Fog uses the background color — so panels emerge from the background
  scene.fog = new THREE.Fog(new THREE.Color(getComputedStyle(document.body).backgroundColor || "white"), o.entry ? 0.5 : o.fogNear, o.entry ? 3 : o.fogFar);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, o.camZ);
  const group = new THREE.Group();
  scene.add(group);

  // Atlas 8×4: a different ”photo” per cell — rough subjects only
  const T = 8, R = 4, S = 128;
  const atlas = document.createElement("canvas");
  atlas.width = T * S;
  atlas.height = R * S;
  const g = atlas.getContext("2d");
  const rnd = ((s) => () => ((s = (s * 16807) % 2147483647) / 2147483647))(7);
  const kinds = ["person", "city", "office", "sky", "panel", "street", "nature", "meeting"];
  // Color fields in photo slots are drawn from the Skin — per scene, two colors top and bottom with one Skin color mixed into background and text. Canvas can’t read var(), so a briefly attached element resolves it to rgb
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  const css = (expr) => { probe.style.color = expr; return getComputedStyle(probe).color; };
  const duo = (tint, a, b) => [css(`color-mix(in oklab, ${tint} ${a}%, var(--kf-bg))`), css(`color-mix(in oklab, ${tint} ${b}%, var(--kf-ink))`)];
  const PAL = {
    person: duo("var(--site-orange)", 28, 45), city: duo("var(--kf-accent-soft)", 40, 45), office: duo("var(--site-mute)", 40, 55), sky: duo("var(--kf-accent-soft)", 22, 12),
    panel: duo("var(--site-blue)", 85, 60), street: duo("var(--site-dark-dim)", 70, 55), nature: duo("var(--site-green)", 45, 45), meeting: duo("var(--site-orange)", 35, 40),
  };
  const shade = css("color-mix(in srgb, var(--kf-ink) 28%, transparent)"), shine = css("color-mix(in srgb, var(--kf-bg) 45%, transparent)");
  probe.remove();
  for (let k = 0; k < T * R; k++) {
    const x = (k % T) * S, y = Math.floor(k / T) * S, kind = kinds[k % kinds.length];
    const grad = g.createLinearGradient(x, y, x, y + S);
    const pal = PAL[kind];
    grad.addColorStop(0, pal[0]);
    grad.addColorStop(1, pal[1]);
    g.fillStyle = grad;
    g.fillRect(x, y, S, S);
    g.fillStyle = shade;
    if (kind === "person" || kind === "meeting") {
      const n = kind === "meeting" ? 3 : 1;
      for (let i = 0; i < n; i++) {
        const cx = x + S * (n === 1 ? 0.5 : 0.25 + i * 0.25), cy = y + S * 0.42;
        g.beginPath(); g.arc(cx, cy, S * (n === 1 ? 0.13 : 0.08), 0, 7); g.fill();
        g.beginPath(); g.ellipse(cx, cy + S * (n === 1 ? 0.42 : 0.3), S * (n === 1 ? 0.27 : 0.15), S * 0.25, 0, 0, 7); g.fill();
      }
    } else if (kind === "city" || kind === "street") {
      for (let i = 0; i < 7; i++) { const w = S * (0.08 + rnd() * 0.1), h = S * (0.25 + rnd() * 0.55); g.fillRect(x + i * S * 0.15, y + S - h, w, h); }
    } else if (kind === "panel") {
      g.strokeStyle = shine; g.lineWidth = 1.5;
      for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(x + i * S / 6, y); g.lineTo(x + i * S / 6 - 30, y + S); g.stroke(); g.beginPath(); g.moveTo(x, y + i * S / 6); g.lineTo(x + S, y + i * S / 6 - 18); g.stroke(); }
    } else if (kind === "office") {
      g.fillRect(x + S * 0.1, y + S * 0.55, S * 0.8, S * 0.06); g.fillRect(x + S * 0.2, y + S * 0.25, S * 0.25, S * 0.2);
    } else if (kind === "nature") {
      g.beginPath(); g.moveTo(x, y + S); g.lineTo(x + S * 0.4, y + S * 0.45); g.lineTo(x + S * 0.75, y + S * 0.7); g.lineTo(x + S, y + S * 0.5); g.lineTo(x + S, y + S); g.fill();
    }
  }
  const tex = new THREE.CanvasTexture(atlas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, fog: true, transparent: true, opacity: 1 });
  // Original velocityDeformation — when the sphere spins fast, the board’s vertices rotate further around the sphere’s vertical axis so the front edge bends as if dragged.
  // Rotation angle = −0.6 × strength × (smoothstep(.08, 1, back edge) × .4) × (.45 + center closeness × 2.4) × panel aspect ratio ÷ horizontal radius
  const uVel = { value: 0 };
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uVel = uVel;
    sh.vertexShader = "attribute vec3 aOrigin;\nattribute float aU;\nattribute float aYF;\nattribute float aAspect;\nuniform float uVel;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      {
        float push = smoothstep(0.08, 1.0, 1.0 - aU) * 0.4 * (0.45 + (1.0 - smoothstep(0.0, 1.0, abs(aYF))) * 2.4) * aAspect;
        vec3 sp = aOrigin + transformed;
        float hr = length(sp.xz);
        if (hr > 0.001) {
          float a = -0.6 * uVel * push / hr;
          float c = cos(a), sn = sin(a);
          sp = vec3(sp.x * c + sp.z * sn, sp.y, -sp.x * sn + sp.z * c);
          transformed = sp - aOrigin;
        }
      }`);
  };

  // Evenly spaced (Fibonacci) plus slight jitter, with panels bent onto the sphere surface (curvature "attached")
  const planes = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < o.count; i++) {
    const yv = 1 - ((i + 0.5) / o.count) * 2;
    const r = Math.sqrt(1 - yv * yv);
    const th = i * golden + (rnd() - 0.5) * 0.06;
    const dir = new THREE.Vector3(Math.cos(th) * r, yv + (rnd() - 0.5) * 0.03, Math.sin(th) * r).normalize();
    const h = 0.4 * (0.8 + rnd() * 0.3);
    const w = h * (rnd() < 0.5 ? 1.33 : rnd() < 0.5 ? 0.75 : 1);
    const geo = new THREE.PlaneGeometry(w, h, 12, 6);
    const up = Math.abs(dir.y) > 0.98 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const t = new THREE.Vector3().crossVectors(up, dir).normalize();
    const b = new THREE.Vector3().crossVectors(dir, t).normalize();
    const pos = geo.attributes.position;
    const p = new THREE.Vector3();
    for (let v = 0; v < pos.count; v++) {
      p.copy(dir).multiplyScalar(o.radius).addScaledVector(t, pos.getX(v)).addScaledVector(b, pos.getY(v)).normalize().multiplyScalar(o.radius);
      p.addScaledVector(dir, -o.radius);
      pos.setXYZ(v, p.x, p.y, p.z);
    }
    const uv = geo.attributes.uv;
    // Panel info used by the shader — panel position (coords inside the sphere)·original horizontal position (0~1)·height on the sphere (−1~1)·aspect ratio
    const n = pos.count, aOrigin = new Float32Array(n * 3), aU = new Float32Array(n), aYF = new Float32Array(n), aAspect = new Float32Array(n).fill(w / h);
    for (let v = 0; v < n; v++) {
      aOrigin.set([dir.x * o.radius, dir.y * o.radius, dir.z * o.radius], v * 3);
      aU[v] = uv.getX(v);
      aYF[v] = (dir.y * o.radius + pos.getY(v)) / o.radius;
    }
    geo.setAttribute("aOrigin", new THREE.BufferAttribute(aOrigin, 3));
    geo.setAttribute("aU", new THREE.BufferAttribute(aU, 1));
    geo.setAttribute("aYF", new THREE.BufferAttribute(aYF, 1));
    geo.setAttribute("aAspect", new THREE.BufferAttribute(aAspect, 1));
    const cell = Math.floor(rnd() * T * R);
    const cu = (cell % T) / T, cv = 1 - (Math.floor(cell / T) + 1) / R;
    for (let v = 0; v < uv.count; v++) uv.setXY(v, cu + uv.getX(v) / T, cv + uv.getY(v) / R);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(dir).multiplyScalar(o.radius);
    const s = o.entry ? 0.72 : 1;
    mesh.scale.setScalar(s);
    mesh.visible = !o.entry;
    mesh.userData.az = (Math.atan2(dir.x, dir.z) + Math.PI) / (Math.PI * 2);
    group.add(mesh);
    planes.push(mesh);
  }

  const state = { spin: 0, extra: 0, entryRot: 0, opacity: o.entry ? 0 : 1, x: 0, z: 0, ry: 0, running: false, revealed: !o.entry };
  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (o.offsetX) camera.setViewOffset(w, h, -o.offsetX(w), 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  size();
  addEventListener("resize", size);
  const tweens = [];

  let last = performance.now(), lastOwn = 0;
  const tick = () => {
    if (!state.running) return;
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    state.spin += (o.speed + state.extra) * dt;
    const rotY = state.spin + state.ry + state.entryRot;
    // Intensity = The larger of the entry rotation share beyond the constant rotation speed (.1) (up to an initial speed of 1.2) and the scroll acceleration share
    const own = state.spin + state.entryRot, speed = dt > 0 ? Math.abs(own - lastOwn) / dt : 0;
    lastOwn = own;
    uVel.value = Math.max(Math.min(Math.max((speed - o.speed) / Math.max(1.2 - o.speed, 0.001), 0), 1), Math.min(state.extra / 1.6, 1));
    group.rotation.y = rotY;
    group.position.set(state.x, 0, state.z);
    mat.opacity = state.opacity;
    canvas.style.visibility = state.opacity < 0.01 ? "hidden" : "visible";
    if (state.opacity > 0.01) renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };

  return {
    state,
    size,
    scene,
    group,
    camera,
    start() {
      if (state.running) return;
      state.running = true;
      last = performance.now();
      requestAnimationFrame(tick);
    },
    // Entry: the sphere turns 280° while panels light up from .72 to 1 in azimuth order and the fog clears
    enter(reduce) {
      this.start();
      if (reduce) {
        planes.forEach((m) => { m.visible = true; m.scale.setScalar(1); });
        scene.fog.near = o.fogNear; scene.fog.far = o.fogFar; state.opacity = 1;
        return;
      }
      tweens.push(gsap.to(state, { opacity: 1, duration: 1, ease: "power2.out" }));
      const rot = { v: 0 };
      const amount = innerWidth < 768 ? Math.PI * 1.5 : Math.PI * (280 / 180);
      tweens.push(gsap.to(rot, { v: amount, duration: innerWidth < 768 ? 3.75 : 4.7, ease: innerWidth < 768 ? "power2.out" : "power3.out", onUpdate: () => (state.entryRot = rot.v - amount) }));
      tweens.push(gsap.to(scene.fog, { near: o.fogNear, far: o.fogFar, duration: 3.2, ease: "power2.inOut" }));
      planes.forEach((m) => {
        tweens.push(gsap.delayedCall(Math.max(0, (m.userData.az - 0.25 + 1) % 1) * 2.6, () => {
          m.visible = true;
          gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.28, ease: "power2.out" });
        }));
      });
    },
    // When the page changes (swup), stop drawing and release GPU resources
    dispose() {
      state.running = false;
      removeEventListener("resize", size);
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(state);
      planes.forEach((m) => m.geometry.dispose());
      mat.dispose();
      tex.dispose();
      renderer.dispose();
    },
    // Add rotation by scroll speed, then release over 1.9s after .15s
    kick(intensity) {
      const v = Math.min(Math.abs(intensity), 1) * 1.6;
      if (v < state.extra) return;
      gsap.killTweensOf(state, "extra");
      gsap.to(state, { extra: v, duration: 0.2, ease: "power3.out" });
      gsap.to(state, { extra: 0, duration: 1.9, delay: 0.35, ease: "power3.out" });
    },
  };
};
