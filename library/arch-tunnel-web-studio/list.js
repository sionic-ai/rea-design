// Work tunnel — the original (tunnel, three) values with our own shapes and shaders: radius 17 arches every 14 (orange rim on every third), a curving path (pathX),
// Work photo panels stand at ±6 left and right every 40, sharp at 25 in front of the camera, blurring as they pass within 15. Scroll → camera follows at .08, panels bend with speed
(() => {
  window.mkPage = window.mkPage || {};
  const SPACING = 40, LEAD = 25;
  const loadThree = () => window.THREE ? Promise.resolve(window.THREE) : new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "../_vendor/three@0.160.0/build/three.min.js";
    s.onload = () => res(window.THREE);
    s.onerror = rej;
    document.head.append(s);
  });
  const varColor = (T, name) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    const [r, g, b] = (c.match(/[\d.]+/g) || [0, 0, 0]).map(Number);
    return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
  };
  const VS = `
#include <fog_pars_vertex>
uniform float uTime; uniform float uSpeed; varying vec2 vUv; varying float vWave;
void main(){ vUv = uv; vec3 p = position;
  float d = distance(p.xy, vec2(1.0)); vWave = 0.35 * sin(d * 5.0 + uTime * 1.1); p.z += vWave;
  p.z += pow(length(p.xy), 2.0) * uSpeed;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
  const FS = `
#include <fog_pars_fragment>
uniform sampler2D uTexture; uniform float uDistance; uniform float uHover; varying vec2 vUv; varying float vWave;
void main(){ vec4 c = texture2D(uTexture, vUv);
  float a = uDistance < 15.0 ? smoothstep(5.0, 15.0, uDistance) : 1.0;
  c.rgb = c.rgb * 1.12 + mix(0.0, 0.12, smoothstep(0.12, 0.35, vWave)) + uHover * 0.06;
  gl_FragColor = vec4(c.rgb, a * c.a);
  #include <fog_fragment>
}`;
  // Photo slot — draw a label saying what to put there on a canvas and use it as the panel texture
  const placeholder = (T, label, w, h, fill, line, ink) => {
    const cv = document.createElement("canvas"), W = 512, H = Math.round(512 * h / w);
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    g.fillStyle = `#${fill.getHexString()}`; g.fillRect(0, 0, W, H);
    g.strokeStyle = `#${line.getHexString()}`; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, H); g.moveTo(W, 0); g.lineTo(0, H); g.stroke();
    g.fillStyle = `#${ink.getHexString()}`; g.textAlign = "center"; g.font = `500 18px ${getComputedStyle(document.body).fontFamily}`;
    g.fillText(label, W / 2, H / 2 + 6, W - 40);
    const t = new T.CanvasTexture(cv);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  };

  window.mkPage.list = () => {
    const sec = document.querySelector(".mk-tunnel");
    const offs = [];
    // Filter the Work grid · switch tunnel/list
    const chips = [...document.querySelectorAll(".mk-plist__chips button")];
    chips.forEach((b) => b.addEventListener("click", () => {
      chips.forEach((c) => c.classList.toggle("is-on", c === b));
      document.querySelectorAll(".mk-plist__item").forEach((it) => it.classList.toggle("is-hidden", b.dataset.cat !== "all" && it.dataset.cat !== b.dataset.cat));
    }));
    const modes = [...document.querySelectorAll(".mk-lhead__mode button")];
    modes.forEach((b) => b.addEventListener("click", () => {
      modes.forEach((m) => m.classList.toggle("is-on", m === b));
      document.documentElement.classList.toggle("mk-list-only", b.dataset.mode === "list");
      ScrollTrigger.refresh();
    }));
    offs.push(() => document.documentElement.classList.remove("mk-list-only"));
    if (!sec) return () => offs.forEach((f) => f());

    let alive = true, cleanup = null;
    loadThree().then((T) => { if (alive) cleanup = scene(T, sec); }).catch(() => {});
    offs.push(() => { alive = false; cleanup && cleanup(); });
    return () => offs.forEach((f) => f());
  };

  function scene(T, sec) {
    const { ticks, follow, reduce } = window.mk;
    const canvas = sec.querySelector(".mk-tunnel__canvas"), track = sec.querySelector(".mk-tunnel__track"), stage = canvas.parentElement;
    const titles = [...sec.querySelectorAll(".mk-tunnel__title")], bar = sec.querySelector(".mk-tunnel__progress"), count = sec.querySelector(".mk-tunnel__count span");
    const coarse = matchMedia("(pointer: coarse)").matches, small = innerWidth < 768;
    const BASE = varColor(T, "--kf-contrast-bg"), HOT = varColor(T, "--kf-accent"), PAPER = varColor(T, "--kf-contrast-ink");
    const mix = (a, b, k) => a.clone().lerp(b, k);
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const sc = new T.Scene();
    sc.background = BASE.clone();
    sc.fog = new T.FogExp2(BASE.clone(), 0.0062);
    const camera = new T.PerspectiveCamera(50, 1, 0.1, 400);
    const rig = new T.Object3D();
    rig.add(camera);
    sc.add(rig);
    sc.add(new T.HemisphereLight(mix(BASE, PAPER, 0.55), BASE, 0.55));
    const glow = new T.PointLight(HOT, 260, 70, 1.6);
    glow.position.set(0, -4, -18);
    rig.add(glow);

    const n = titles.length, total = n * SPACING + 120;
    const smooth = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    const pathX = (z) => {
      const q = -z - 60;
      if (q <= 0) return 0;
      const bend = Math.pow(Math.abs(Math.sin(q * 0.0085 + 0.2)), 1.4);
      return smooth(0, 90, q) * (Math.sin(q * 0.0185) * 24 * bend + Math.sin(q * 0.043 + 1) * 4.5 * bend);
    };
    const yawAt = (z) => Math.atan((pathX(z + 1) - pathX(z - 1)) / 2);

    // Corridor — semicircle arch (radius 17, thickness .45) + pillars (1.4 × 12), with an outer orange ring (17.6, glow 1.6) on every third one.
    const stone = mix(BASE, PAPER, 0.08);
    const archMat = new T.MeshStandardMaterial({ color: stone, roughness: 0.85, metalness: 0.1 });
    const litMat = new T.MeshStandardMaterial({ color: stone, emissive: HOT, emissiveIntensity: 1.6, roughness: 0.5 });
    const archGeo = new T.TorusGeometry(17, 0.45, 10, 64, Math.PI), pillarGeo = new T.BoxGeometry(1.4, 12, 1.4), lineGeo = new T.TorusGeometry(17.6, 0.06, 6, 64, Math.PI);
    const disposables = [archMat, litMat, archGeo, pillarGeo, lineGeo];
    for (let z = 30, k = 0; z > -total; k++, z -= 14) {
      const g = new T.Group();
      g.position.set(pathX(z), -14, z);
      g.rotation.y = yawAt(z);
      const a = new T.Mesh(archGeo, archMat); a.position.y = 12; g.add(a);
      [-17, 17].forEach((x) => { const p = new T.Mesh(pillarGeo, archMat); p.position.set(x, 6, 0); g.add(p); });
      if (k % 3 === 0) { const l = new T.Mesh(lineGeo, litMat); l.position.y = 12; g.add(l); }
      sc.add(g);
    }
    // Floor — glossy navy slab (240 wide)
    const floorMat = new T.MeshStandardMaterial({ color: mix(BASE, PAPER, 0.02), roughness: 0.55, metalness: 0.35 });
    const floorGeo = new T.PlaneGeometry(240, total + 200);
    const floor = new T.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, -14, -total / 2 + 60);
    sc.add(floor);
    disposables.push(floorMat, floorGeo);
    // Road — a white dotted line along the center of a curved road (.22 × 4.4, .62) and a flowing orange arrow
    const dashGeo = new T.PlaneGeometry(0.22, 4.4), dashMat = new T.MeshBasicMaterial({ color: PAPER, transparent: true, opacity: 0.62 });
    const chevGeo = new T.ShapeGeometry(new T.Shape([new T.Vector2(-1.4, -0.6), new T.Vector2(0, 0.8), new T.Vector2(1.4, -0.6), new T.Vector2(1.4, -1.4), new T.Vector2(0, 0), new T.Vector2(-1.4, -1.4)]));
    const chevMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uC: { value: HOT } },
      vertexShader: "attribute float aI; varying float vI; void main(){ vI = aI; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform float uTime; uniform vec3 uC; varying float vI; void main(){ float k = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(vI * 0.9 - uTime * 4.0), 3.0); gl_FragColor = vec4(uC * (0.6 + k), k); }" });
    const steps = Math.floor(total / 6);
    const dashes = new T.InstancedMesh(dashGeo, dashMat, steps), chevs = new T.InstancedMesh(chevGeo, chevMat, steps);
    const ids = new Float32Array(steps), m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), one = new T.Vector3(1, 1, 1);
    for (let i = 0; i < steps; i++) {
      const z = 20 - i * 6, x = pathX(z);
      q.setFromEuler(e.set(-Math.PI / 2, 0, -yawAt(z), "YXZ"));
      m4.compose(new T.Vector3(x, -13.95, z), q, one); dashes.setMatrixAt(i, m4);
      q.setFromEuler(e.set(-Math.PI / 2, 0, Math.PI - yawAt(z), "YXZ"));
      m4.compose(new T.Vector3(x + 3.2, -13.9, z), q, one); chevs.setMatrixAt(i, m4);
      ids[i] = i;
    }
    chevGeo.setAttribute("aI", new T.InstancedBufferAttribute(ids, 1));
    sc.add(dashes, chevs);
    disposables.push(dashGeo, dashMat, chevGeo, chevMat);
    // Buildings on both sides — boxes (height 8–48) placed 30–120 outside the road
    const bGeo = new T.BoxGeometry(1, 1, 1), bMat = new T.MeshLambertMaterial({ color: mix(BASE, PAPER, 0.12), emissive: mix(BASE, PAPER, 0.05) });
    const bCount = Math.floor(total / 9), blocks = new T.InstancedMesh(bGeo, bMat, bCount);
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < bCount; i++) {
      const z = 20 - i * 9 - rnd() * 6, side = i % 2 ? 1 : -1, w = 8 + rnd() * 14, h = 8 + rnd() * 40;
      m4.compose(new T.Vector3(pathX(z) + side * (30 + rnd() * 90), -14 + h / 2, z), q.identity(), new T.Vector3(w, h, 6 + rnd() * 14));
      blocks.setMatrixAt(i, m4);
    }
    sc.add(blocks);
    disposables.push(bGeo, bMat);

    // Case photo panel — long side 11.5 (9.5 on phone), original ratio, ±6 left and right every 40
    const planeGeo = new T.PlaneGeometry(1, 1, 20, 20);
    disposables.push(planeGeo);
    const fill = mix(BASE, PAPER, 0.18), line = mix(BASE, PAPER, 0.3), ink = mix(BASE, PAPER, 0.6);
    const meshes = titles.map((a, i) => {
      const w = +a.dataset.w || 4, h = +a.dataset.h || 3, r = w / h, S = small ? 9.5 : 11.5;
      const tex = placeholder(T, a.dataset.label || "", w, h, fill, line, ink);
      const mat = new T.ShaderMaterial({ uniforms: T.UniformsUtils.merge([T.UniformsLib.fog, { uTexture: { value: tex }, uDistance: { value: 1e5 }, uTime: { value: 0 }, uSpeed: { value: 0 }, uHover: { value: 0 } }]), vertexShader: VS, fragmentShader: FS, fog: true, transparent: true });
      mat.uniforms.uTexture.value = tex;
      const mesh = new T.Mesh(planeGeo, mat);
      mesh.scale.set(r > 1 ? S : S * r, r > 1 ? S / r : S, 1);
      const z = -i * SPACING - 50;
      mesh.position.set(pathX(z) + (i % 2 === 0 ? 6 : -6), 0, z);
      mesh.rotation.y = yawAt(z);
      mesh.userData.link = a;
      sc.add(mesh);
      disposables.push(mat, tex);
      return mesh;
    });

    const resize = () => {
      const w = stage.clientWidth, h = stage.clientHeight;
      if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      }
    };
    // Precompile shaders at setup — so the first scroll doesn’t stall
    resize();
    renderer.compile(sc, camera);

    const mouse = { x: 0, y: 0, sx: 0, sy: 0, px: undefined, py: undefined };
    const onMove = (ev) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (ev.clientX - r.left) / r.width - 0.5; mouse.y = (ev.clientY - r.top) / r.height - 0.5;
      mouse.px = mouse.x * 2; mouse.py = -mouse.y * 2;
    };
    sec.addEventListener("pointermove", onMove);
    const ray = new T.Raycaster();
    let hovered = null;
    const onClick = (ev) => { if (!ev.target.closest("a") && hovered) hovered.userData.link.click(); };
    sec.addEventListener("click", onClick);

    const clock = new T.Clock();
    let cur = 0, speed = 0, lastY = scrollY, active = -1;
    const tick = () => {
      const r = track.getBoundingClientRect(), vh = stage.clientHeight || innerHeight;
      if (r.bottom < -50 || r.top > vh + 50) return;
      resize();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      const target = p * (n - 1) * SPACING;
      cur += (target - cur) * (reduce || coarse ? 1 : follow(0.08));
      rig.position.z = -cur - LEAD;
      const v = Math.max(-6, Math.min(6, (scrollY - lastY) * 0.06));
      lastY = scrollY;
      speed += ((coarse ? 0 : -v) - speed) * follow(0.08);
      mouse.sx += (mouse.x - mouse.sx) * follow(0.04);
      mouse.sy += (mouse.y - mouse.sy) * follow(0.04);
      const rz = rig.position.z, ahead = LEAD + 6;
      rig.position.x = pathX(rz);
      rig.rotation.y = Math.atan2(pathX(rz) - pathX(rz - ahead), ahead) - mouse.sx * 0.35;
      rig.rotation.z = (pathX(rz - 16) - pathX(rz)) * 0.0028;
      rig.rotation.x = -mouse.sy * 0.17;
      const t = clock.getElapsedTime();
      chevMat.uniforms.uTime.value = t;
      if (mouse.px !== undefined) {
        ray.setFromCamera({ x: mouse.px, y: mouse.py }, camera);
        hovered = ray.intersectObjects(meshes)[0]?.object || null;
        canvas.style.cursor = hovered ? "pointer" : "";
      }
      meshes.forEach((m) => {
        const u = m.material.uniforms;
        u.uTime.value = reduce ? 0 : t;
        u.uSpeed.value = speed * 0.02;
        u.uDistance.value = Math.max(0, rig.position.z - m.position.z);
        u.uHover.value += ((m === hovered ? 1 : 0) - u.uHover.value) * follow(0.1);
      });
      // Current case — the plate closest to the LEAD distance in front of the camera
      let best = 0, bd = Infinity;
      meshes.forEach((m, i) => { const d = Math.abs(rig.position.z - m.position.z - LEAD); if (d < bd) { bd = d; best = i; } });
      if (best !== active) { active = best; titles.forEach((ti, i) => ti.classList.toggle("is-active", i === best)); if (count) count.textContent = String(best + 1).padStart(2, "0"); }
      bar && bar.style.setProperty("--p", p.toFixed(4));
      renderer.render(sc, camera);
    };
    ticks.add(tick);
    return () => {
      ticks.delete(tick);
      sec.removeEventListener("pointermove", onMove);
      sec.removeEventListener("click", onClick);
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
    };
  }
})();
