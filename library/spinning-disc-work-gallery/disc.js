// One disc scene — shared by the first page gallery and the detail page’s ”Next work”. Only one renderer is made and moved into the current page’s canvas slot
// (so a WebGL context isn’t recreated every time barba swaps pages). Values are the original settings (radius 1 basis).
(() => {
  const A = (window.A24 ||= {});
  const CFG = {
    discThickness: 0.01, holeSize: 0.14, hubSize: 0.24,
    frontClearcoat: 0.8, frontRough: 0.42, frontMetal: 0.48,
    backRough: 0.23, backMetal: 1, backClearcoat: 0.34, backIridescence: 1, backIridIOR: 1.86, backIridThickness: 900,
    edgeRoughness: 0.04, edgeMetalness: 0.55,
    hubTransmission: 0.68, hubRoughness: 0.38, hubIOR: 2,
    cameraDistance: 4.4, cameraFOV: 40, exposure: 0.86,
    keyIntensity: 0.75, fillIntensity: 0.3, rimIntensity: 0.75, topStripIntensity: 1.9,
    scribbleFps: 10, scribblePoints: 24, scribbleJitter: 0.028, scribbleLoops: 2, scribbleLoopGap: 0.045,
    scribblePadding: 0.06, scribbleWidth: 0.012, scribbleSweep: 0.68, scribbleSweepJitter: 0.4,
    scribbleIn: [0.3, 0.5, 0.72], scribbleOut: [0.72, 0.5, 0.3], scribbleLag: 15, artResolution: 1024,
  };
  A.DISC = CFG;

  // Resolve skin variables to real rgb — color-mix results (oklab) are also painted once on a canvas and read back
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  A.cssColor = (expr) => {
    const el = document.createElement("i");
    el.style.color = expr;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return { r, g, b, css: `rgb(${r} ${g} ${b})`, three: new THREE.Color(r / 255, g / 255, b / 255).convertSRGBToLinear() };
  };
  const fontOf = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "serif";

  // Disc front placeholder art — the original is a work poster cut out in a circle. Draws two tone layers, a title and an edge strip of cast names in the same place (outer ring of the hub)
  A.discArt = (film, size = CFG.artResolution) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const g = cv.getContext("2d");
    const c = size / 2;
    const tone = A.cssColor(film.tone || "var(--site-disc-1)").css;
    const tone2 = A.cssColor(film.tone2 || "var(--site-disc-2)").css;
    const ink = A.cssColor("var(--kf-bg)").css;
    g.save();
    g.beginPath();
    g.arc(c, c, c, 0, Math.PI * 2);
    g.arc(c, c, c * CFG.hubSize, 0, Math.PI * 2, true);
    g.clip("evenodd");
    const grad = g.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, tone);
    grad.addColorStop(1, tone2);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    // Person silhouette slot — two large circles (head, shoulders) in a faint tone
    g.globalAlpha = 0.28;
    g.fillStyle = tone2;
    g.beginPath(); g.arc(c * 0.72, c * 1.32, c * 0.34, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(c * 0.8, c * 1.95, c * 0.62, c * 0.42, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
    g.fillStyle = ink;
    g.textAlign = "center";
    g.font = `400 ${size * 0.085}px ${fontOf("--kf-font-display")}`;
    g.fillText(film.title || "Title Here", c, c * 0.56);
    g.font = `500 ${size * 0.026}px ${fontOf("--kf-font-sans")}`;
    g.globalAlpha = 0.85;
    (film.label || "Artwork poster circular crop · Portrait close-up · Warm indoor lighting").split(" · ").forEach((t, i) => g.fillText(t, c, c * 1.5 + i * size * 0.034));
    // Edge cast name band
    g.font = `500 ${size * 0.022}px ${fontOf("--kf-font-label")}`;
    const ring = ("CAST NAME  ·  ".repeat(6)).split("");
    ring.forEach((ch, i) => {
      const a = -Math.PI * 0.95 + (i / ring.length) * Math.PI * 1.9;
      g.save();
      g.translate(c + Math.cos(a) * c * 0.9, c + Math.sin(a) * c * 0.9);
      g.rotate(a + Math.PI / 2);
      g.fillText(ch, 0, 0);
      g.restore();
    });
    g.restore();
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  };

  // Reflected light — the original also draws an environment image on a canvas and bakes it with PMREM (bright top band 1.9)
  const envTexture = (renderer) => {
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 256;
    const g = cv.getContext("2d");
    const bg = A.cssColor("var(--kf-bg)").css, mid = A.cssColor("color-mix(in oklab, var(--kf-bg) 55%, var(--kf-ink))").css;
    const sky = g.createLinearGradient(0, 0, 0, 256);
    sky.addColorStop(0, bg); sky.addColorStop(0.5, mid); sky.addColorStop(1, A.cssColor("color-mix(in oklab, var(--kf-bg) 20%, var(--kf-ink))").css);
    g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
    g.globalAlpha = Math.min(1, CFG.topStripIntensity / 2);
    g.fillStyle = A.cssColor("var(--kf-raised)").css;
    g.fillRect(0, 20, 512, 26);
    g.fillRect(120, 70, 90, 60);
    g.fillRect(330, 90, 70, 40);
    const t = new THREE.CanvasTexture(cv);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.colorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(renderer);
    const out = pm.fromEquirectangular(t).texture;
    t.dispose(); pm.dispose();
    return out;
  };

  let shared = null;
  A.discStage = () => {
    if (shared) return shared;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio || 1));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = CFG.exposure;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0, 0);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    const scene = new THREE.Scene();
    scene.environment = envTexture(renderer);
    const camera = new THREE.PerspectiveCamera(CFG.cameraFOV, 1, 0.1, 60);
    camera.position.set(0, 0, CFG.cameraDistance);
    const key = new THREE.DirectionalLight(A.cssColor("color-mix(in oklab, var(--kf-raised) 85%, var(--kf-accent))").three, CFG.keyIntensity * 2);
    key.position.set(3.5, 8, 5);
    const fill = new THREE.DirectionalLight(A.cssColor("var(--kf-raised)").three, CFG.fillIntensity * 2);
    fill.position.set(-4, -2, 4);
    const rim = new THREE.DirectionalLight(A.cssColor("var(--kf-accent-soft)").three, CFG.rimIntensity * 2);
    rim.position.set(-3, 3, -4);
    scene.add(key, fill, rim);

    const T = CFG.discThickness;
    const geo = {
      front: new THREE.RingGeometry(CFG.hubSize, 1, 128, 1),
      back: new THREE.RingGeometry(CFG.hubSize, 1, 128, 1),
      edge: new THREE.CylinderGeometry(1, 1, T, 128, 1, true),
      hub: new THREE.RingGeometry(CFG.holeSize, CFG.hubSize, 96, 1),
      hole: new THREE.CylinderGeometry(CFG.holeSize, CFG.holeSize, T, 64, 1, true),
      pick: new THREE.CircleGeometry(1.02, 48),
    };
    const mat = {
      back: new THREE.MeshPhysicalMaterial({
        color: A.cssColor("color-mix(in oklab, var(--kf-ink) 80%, var(--kf-accent-soft))").three,
        roughness: CFG.backRough, metalness: CFG.backMetal, clearcoat: CFG.backClearcoat,
        iridescence: CFG.backIridescence, iridescenceIOR: CFG.backIridIOR, iridescenceThicknessRange: [100, CFG.backIridThickness],
      }),
      edge: new THREE.MeshPhysicalMaterial({ color: A.cssColor("var(--kf-raised)").three, roughness: CFG.edgeRoughness, metalness: CFG.edgeMetalness, side: THREE.DoubleSide }),
      hub: new THREE.MeshPhysicalMaterial({
        color: A.cssColor("var(--kf-raised)").three, transmission: CFG.hubTransmission, roughness: CFG.hubRoughness, ior: CFG.hubIOR,
        thickness: 0.02, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
      }),
      pick: new THREE.MeshBasicMaterial({ visible: false }),
    };

    const makeDisc = (texture) => {
      const group = new THREE.Group();
      const spin = new THREE.Group();
      group.add(spin);
      const front = new THREE.Mesh(geo.front, new THREE.MeshPhysicalMaterial({
        map: texture, roughness: CFG.frontRough, metalness: CFG.frontMetal, clearcoat: CFG.frontClearcoat, clearcoatRoughness: 0.18, envMapIntensity: 0.85,
      }));
      front.position.z = T / 2 + 6e-4;
      const back = new THREE.Mesh(geo.back, mat.back);
      back.position.z = -T / 2 - 6e-4;
      back.rotation.y = Math.PI;
      const edge = new THREE.Mesh(geo.edge, mat.edge);
      edge.rotation.x = Math.PI / 2;
      const hole = new THREE.Mesh(geo.hole, mat.edge);
      hole.rotation.x = Math.PI / 2;
      const hub = new THREE.Mesh(geo.hub, mat.hub);
      const pick = new THREE.Mesh(geo.pick, mat.pick);
      spin.add(front, back, edge, hole, hub);
      group.add(pick);
      return { group, spin, front, pick, dispose: () => front.material.dispose() };
    };

    // Scribble circle — a band with radius (1 + .06 + ring×.045) and width .012 drawn with 24 points wobbling ±2.8%, turning only 68% (±20%) of a full turn from a random position
    const makeScribble = () => {
      const group = new THREE.Group();
      const segs = CFG.scribblePoints * 3;
      const m = new THREE.MeshBasicMaterial({ color: A.cssColor("var(--kf-ink)").three, side: THREE.DoubleSide, depthWrite: false, depthTest: false, toneMapped: false, transparent: true });
      const loops = [];
      for (let l = 0; l < CFG.scribbleLoops; l++) {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array((segs + 1) * 2 * 3), 3));
        const idx = [];
        for (let i = 0; i < segs; i++) { const t = i * 2; idx.push(t, t + 1, t + 2, t + 1, t + 3, t + 2); }
        g.setIndex(idx);
        const mesh = new THREE.Mesh(g, m);
        mesh.renderOrder = 900;
        mesh.frustumCulled = false;
        group.add(mesh);
        loops.push(g);
      }
      const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
      const draw = (amount) => {
        loops.forEach((g, l) => {
          const pos = g.getAttribute("position");
          const R = 1 + CFG.scribblePadding + l * CFG.scribbleLoopGap;
          const half = CFG.scribbleWidth * 0.5;
          const sweep = clamp(CFG.scribbleSweep * (1 + (Math.random() - 0.5) * CFG.scribbleSweepJitter), 0.12, 1) * amount;
          const arc = Math.PI * 2 * sweep;
          const start = Math.random() * Math.PI * 2;
          const jit = Array.from({ length: CFG.scribblePoints + 1 }, () => 1 + (Math.random() - 0.5) * 2 * CFG.scribbleJitter);
          for (let i = 0; i <= segs; i++) {
            const t = i / segs, a = start + t * arc;
            const u = t * CFG.scribblePoints * sweep, d = Math.floor(u), f = Math.min(CFG.scribblePoints, d + 1), p = u - d, s = p * p * (3 - 2 * p);
            const r = jit[Math.min(CFG.scribblePoints, d)] * (1 - s) + jit[f] * s;
            const taper = Math.min(1, Math.min(t, 1 - t) * 14 + 0.15);
            const r0 = R * r - half * taper, r1 = R * r + half * taper;
            const x = Math.cos(a), y = Math.sin(a);
            pos.setXYZ(i * 2, x * r0, y * r0, 0);
            pos.setXYZ(i * 2 + 1, x * r1, y * r1, 0);
          }
          pos.needsUpdate = true;
        });
      };
      group.visible = false;
      return { group, draw, dispose: () => { loops.forEach((g) => g.dispose()); m.dispose(); } };
    };

    let host = null;
    const size = () => {
      if (!host) return;
      const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const mount = (el) => {
      host = el;
      el.append(renderer.domElement);
      size();
    };
    addEventListener("resize", size);
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(size).observe(document.documentElement);
    shared = { renderer, scene, camera, makeDisc, makeScribble, mount, size, render: () => renderer.render(scene, camera), get host() { return host; } };
    return shared;
  };
})();
