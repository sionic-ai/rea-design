// Hero 3D object — the original is an inflated white satin letter model (GLB). Here we build an ‹inflated brush-stroke symbol› with the same square silhouette from our own shapes,
// Drawn with the same material values (satin roughness .82 · clearcoat .24 · rim light · strong contrast), the same light positions and the same motion (opening rotation, cursor·scroll tilt, 7.2s breathing).
window.CKObject = (() => {
  const T = window.THREE;
  if (!T) return { init: () => null };

  // Skin variable → THREE.Color (including color-mix values resolved by the browser)
  const probe = document.createElement("span");
  const cssColor = (name) => {
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const s = getComputedStyle(probe).color;
    probe.remove();
    const n = (s.match(/-?\d*\.?\d+/g) || []).map(Number);
    if (/^color\(srgb/.test(s)) return new T.Color(n[0], n[1], n[2]);
    return new T.Color(n[0] / 255, n[1] / 255, n[2] / 255);
  };

  // Brush stroke along an arc, thickest at the center and thinning toward both ends
  const stroke = (cx, cy, r, w, a0, a1, tip = 0.07) => {
    const s = new T.Shape(), N = 64, outer = [], inner = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, a = (a0 + (a1 - a0) * u) * Math.PI / 180;
      const half = (tip + (w - tip) * Math.sin(Math.PI * u)) / 2;
      outer.push([cx + Math.cos(a) * (r + half), cy + Math.sin(a) * (r + half)]);
      inner.push([cx + Math.cos(a) * (r - half), cy + Math.sin(a) * (r - half)]);
    }
    s.moveTo(...outer[0]);
    outer.slice(1).forEach((p) => s.lineTo(...p));
    inner.reverse().forEach((p) => s.lineTo(...p));
    s.closePath();
    return s;
  };
  const blob = (cx, cy, r) => { const s = new T.Shape(); s.absarc(cx, cy, r, 0, Math.PI * 2, false); return s; };

  const SHAPES = () => [
    stroke(-0.42, 0.18, 0.5, 0.3, 95, 255),
    stroke(0.42, 0.22, 0.46, 0.28, -70, 105),
    stroke(0, -0.42, 0.62, 0.26, 200, 340),
    stroke(-1.55, 0.02, 1.62, 0.24, -21, 21),
    stroke(0.08, 0.74, 0.26, 0.18, -10, 200),
    stroke(-0.62, -0.62, 0.3, 0.16, 120, 300),
    blob(0.66, -0.74, 0.13),
    blob(-0.12, 0.42, 0.1),
  ];

  // Satin grain — very faint blotches on the roughness map
  const grain = () => {
    const S = 128, d = new Uint8Array(S * S * 4);
    const h = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const v = Math.round(222 + (h(x >> 2, y >> 2) - 0.5) * 20 + (h(x, y) - 0.5) * 10);
      const i = (y * S + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = Math.max(190, Math.min(248, v));
      d[i + 3] = 255;
    }
    const t = new T.DataTexture(d, S, S, T.RGBAFormat);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(4, 4);
    t.needsUpdate = true;
    return t;
  };

  function init(slot) {
    const mobile = innerWidth <= 767;
    const dprCap = mobile ? 1 : 1.5, frameMs = 1000 / (mobile ? 24 : 30);
    const ink = cssColor("--kf-ink");

    const renderer = new T.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: "high-performance" });
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = T.PCFShadowMap;
    renderer.setClearColor(ink, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    slot.append(renderer.domElement);

    const scene = new T.Scene();
    const pmrem = new T.PMREMGenerator(renderer);
    const room = new T.RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.38;
    room.dispose?.(); pmrem.dispose();

    const cam = new T.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
    const pivot = new T.Group();
    pivot.rotation.order = "YXZ";
    scene.add(pivot);
    scene.add(new T.AmbientLight(ink, 0.42));
    const key = new T.DirectionalLight(ink, 1.8);
    key.position.set(-3.8, 4.2, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { near: 0.1, far: 10, left: -1.25, right: 1.25, top: 1.25, bottom: -1.25 });
    key.shadow.bias = -2e-4; key.shadow.normalBias = 0.012; key.shadow.radius = 4;
    scene.add(key, key.target);
    // Same-direction lights in the places of the original’s three area lights (top left, bottom right, back top)
    [[-2.8, 3.5, 2, 0.9], [2.4, -0.8, 2.8, 0.38], [0.8, 2.5, -2.6, 0.62]].forEach(([x, y, z, i]) => { const l = new T.DirectionalLight(ink, i); l.position.set(x, y, z); scene.add(l); });

    const mat = new T.MeshPhysicalMaterial({
      color: ink, roughnessMap: grain(), metalness: 0, roughness: 0.82, clearcoat: 0.24, clearcoatRoughness: 0.38,
      ior: 1.46, specularIntensity: 0.5, specularColor: ink, sheen: 0.04, sheenColor: ink, sheenRoughness: 0.82, envMapIntensity: 0.42,
    });
    mat.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <opaque_fragment>", `
          float ckEdge = 1.0 - clamp(dot(geometryNormal, geometryViewDir), 0.0, 1.0);
          outgoingLight += vec3(0.18) * (ckEdge * ckEdge * ckEdge);
          #include <opaque_fragment>`)
        .replace("#include <colorspace_fragment>", `#include <colorspace_fragment>
          vec3 ckLin = max(gl_FragColor.rgb, vec3(0.0));
          gl_FragColor.rgb = min(vec3(1.0), 1.54 * pow(ckLin, vec3(3.16)));`);
    };
    mat.customProgramCacheKey = () => "ck-satin-1";

    const geo = new T.ExtrudeGeometry(SHAPES(), { depth: 0.14, bevelEnabled: true, bevelThickness: 0.13, bevelSize: 0.065, bevelSegments: 10, curveSegments: 48, steps: 1 });
    geo.center();
    const mesh = new T.Mesh(geo, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    pivot.add(mesh);
    const size = new T.Box3().setFromObject(mesh).getSize(new T.Vector3());

    const want = { px: 0, py: 0, scroll: 0 }, now = { px: 0, py: 0, scroll: 0 };
    const opening = { active: false, progress: 1 };
    let enabled = false, raf = 0, lastT = 0, lastDraw = 0, inView = true;

    const draw = () => {
      const r = slot.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      const asp = r.width / r.height, h = Math.min(size.y, size.x / asp), w = h * asp;
      Object.assign(cam, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
      cam.position.set(0, 0, Math.max(2, size.z * 12));
      cam.lookAt(0, 0, 0);
      cam.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprCap));
      renderer.setSize(r.width, r.height, false);
      renderer.render(scene, cam);
    };
    const still = () => { now.px = now.py = now.scroll = 0; pivot.position.set(0, 0, 0); pivot.rotation.set(0, 0, 0); };
    const spin = () => {
      const left = 1 - opening.progress;
      pivot.position.set(0, 0, 0);
      pivot.rotation.set(left * Math.PI * 5.5, left * Math.PI * -7.25, left * Math.PI * 3.5);
    };
    // Follows the cursor with 1 − e^(−8dt) and scroll with 1 − e^(−6dt), and breathes up and down once every 7.2 seconds
    const idle = (t, dt) => {
      const a = 1 - Math.exp(-8 * dt), b = 1 - Math.exp(-6 * dt);
      now.px += (want.px - now.px) * a; now.py += (want.py - now.py) * a; now.scroll += (want.scroll - now.scroll) * b;
      const ph = (t / 7200) * Math.PI * 2;
      pivot.position.y = Math.sin(ph) * size.y * 0.014 + now.scroll * size.y * 0.16;
      pivot.rotation.x = -now.py * 0.16 + now.scroll * 0.08;
      pivot.rotation.y = now.px * 0.26 + now.scroll * 0.5;
      pivot.rotation.z = Math.sin(ph + Math.PI / 2) * 0.009 + now.scroll * 0.12;
    };
    const running = () => (enabled || opening.active) && inView && !document.hidden;
    const loop = (t) => {
      raf = 0;
      if (!running()) { lastT = 0; return; }
      if (t - lastDraw >= frameMs) {
        const dt = lastT === 0 ? 1 / 30 : Math.min((t - lastT) / 1000, 0.1);
        lastT = t; lastDraw = t;
        opening.active ? spin() : idle(t, dt);
        draw();
      }
      kick();
    };
    const kick = () => { if (!raf && running()) raf = requestAnimationFrame(loop); };
    new IntersectionObserver(([e]) => { inView = !!e?.isIntersecting; kick(); }, { rootMargin: "160px 0px" }).observe(slot);
    new ResizeObserver(() => draw()).observe(slot);
    document.addEventListener("visibilitychange", kick);
    draw();

    return {
      setHero({ px = 0, py = 0, scroll = 0 }) {
        want.px = Math.max(-1, Math.min(1, px)); want.py = Math.max(-1, Math.min(1, py)); want.scroll = Math.max(0, Math.min(1, scroll));
        kick();
      },
      setOpening({ active, progress }) {
        opening.active = active; opening.progress = Math.max(0, Math.min(1, progress));
        active ? spin() : still();
        draw(); kick();
      },
      setEnabled(on) {
        if (enabled === on) return;
        enabled = on;
        if (!on) { cancelAnimationFrame(raf); raf = 0; lastT = 0; still(); draw(); } else kick();
      },
    };
  }
  return { init };
})();
