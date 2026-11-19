// Vortex cards: with three.js, N cards (265×365) stand on a ring of radius 1400 (height staggered by sin(i·1.5)·80) and at first turn slowly in black and white (.0012rad per Frame).
// Following the mouse the camera shifts ±650·±480 and the ring tilts ±.32·±.14rad (.05 each). Dragging rotates .003rad per 1px, and on release it cools by .94 each.
// With scroll progress (following .08 per frame), the ring turns an extra 3.8π and unwinds into a funnel spiral wide on top and narrow at the bottom, over the first 30% the color returns and the camera approaches,
// From 45% the first card grows 4.2x (phone 1.5) and from 85% all vanish. At the top, hovering a card restores only that card’s color with 1.08x — Brand award
(() => {
  kfFx.register("vortex-card-funnel", (host, { options, reduce }) => {
    if (!window.THREE) return;
    const T = window.THREE;
    const stage = host.querySelector('[data-fx-part="stage"]') || host;
    const items = [...host.querySelectorAll('[data-fx-part="card"]')];
    if (!items.length) return;
    const title = host.querySelector('[data-fx-part="title"]'), hint = host.querySelector('[data-fx-part="hint"]');
    const track = options.track ? document.querySelector(options.track) : host;
    const css = getComputedStyle(document.documentElement);
    const v = (name, d) => css.getPropertyValue(name).trim() || d;
    const fitScale = () => { const w = innerWidth; return w <= 480 ? 0.92 : w <= 768 ? 0.75 : w <= 1024 ? 0.76 : w <= 1280 ? 0.82 : w <= 1440 ? 0.88 : 1; };

    let W = stage.clientWidth || innerWidth, H = stage.clientHeight || innerHeight;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, W / H, 10, 12000);
    camera.position.set(0, 40, 2350);
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.domElement.className = "fx-vcf-canvas";
    stage.append(renderer.domElement);

    // Card images are placeholders, drawn on a canvas from the card element’s color (--fx-card) and text. To use a real image, put the address in data-src
    const face = (el) => {
      const c = document.createElement("canvas");
      c.width = 530; c.height = 730;
      const g = c.getContext("2d");
      const cs = getComputedStyle(el);
      g.fillStyle = cs.getPropertyValue("--fx-card").trim() || v("--kf-surface", "gray");
      g.fillRect(0, 0, 530, 730);
      g.strokeStyle = cs.color; g.lineWidth = 6; g.globalAlpha = 0.35;
      g.strokeRect(40, 40, 450, 450);
      g.beginPath(); g.moveTo(40, 40); g.lineTo(490, 490); g.moveTo(490, 40); g.lineTo(40, 490); g.stroke();
      g.globalAlpha = 1; g.fillStyle = cs.color;
      g.font = `700 40px ${v("--kf-font-display", "sans-serif")}`;
      g.fillText((el.textContent || "").trim().slice(0, 18), 40, 580);
      g.font = `400 26px ${v("--kf-font-sans", "sans-serif")}`; g.globalAlpha = 0.7;
      g.fillText(el.getAttribute("data-sub") || "", 40, 630);
      const t = new T.CanvasTexture(c);
      if (el.dataset.src) new T.TextureLoader().load(el.dataset.src, (img) => { mat(el).uniforms.map.value = img; });
      return t;
    };
    const vert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
    const frag = "uniform sampler2D map; uniform float uGray; uniform float uAlpha; varying vec2 vUv; void main(){ if (uAlpha <= 0.01) discard; vec4 c = texture2D(map, vUv); float g = dot(c.rgb, vec3(0.299, 0.587, 0.114)); gl_FragColor = vec4(mix(c.rgb, vec3(g) * 0.86, uGray), uAlpha); }";
    const ring = new T.Group();
    scene.add(ring);
    const R = 1400, geo = new T.PlaneGeometry(265, 365), N = items.length, meshes = [];
    const byEl = new Map();
    const mat = (el) => byEl.get(el).material;
    items.forEach((el, i) => {
      const m = new T.Mesh(geo, new T.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: { map: { value: null }, uGray: { value: 1 }, uAlpha: { value: 1 } }, side: T.DoubleSide, transparent: true }));
      byEl.set(el, m);
      m.material.uniforms.map.value = face(el);
      const a = (i / N) * Math.PI * 2;
      m.position.set(Math.sin(a) * R, Math.sin(i * 1.5) * 80, Math.cos(a) * R);
      m.rotation.y = a;
      m.userData = { a, y: m.position.y };
      ring.add(m);
      meshes.push(m);
    });
    const s0 = fitScale();
    ring.scale.set(s0, s0, s0);
    renderer.compile(scene, camera);

    let mx = 0, my = 0, camX = 0, camY = 40, tiltX = 0, tiltZ = 0, rot = 0, vel = 0, drag = false, dx0 = 0;
    let pT = 0, p = 0, hovered = null, alive = true, raf = 0;
    const mouse = new T.Vector2(-9, -9), ray = new T.Raycaster(), tmp = new T.Vector3();
    const ac = new AbortController(), on = { signal: ac.signal };
    addEventListener("mousemove", (e) => {
      mx = (e.clientX / innerWidth) * 2 - 1; my = -(e.clientY / innerHeight) * 2 + 1;
      const r = stage.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      camX = mx * 650; camY = 40 + my * 480; tiltX = my * -0.32; tiltZ = mx * 0.14;
      if (drag) { vel = (e.clientX - dx0) * 0.003; rot += vel; dx0 = e.clientX; }
    }, on);
    stage.addEventListener("pointerdown", (e) => { drag = true; dx0 = e.clientX; }, on);
    addEventListener("pointerup", () => { drag = false; }, on);
    stage.addEventListener("mouseleave", () => { mouse.set(-9, -9); unhover(); }, on);
    const unhover = () => {
      if (!hovered) return;
      gsap.to(hovered.material.uniforms.uGray, { value: 1, duration: 0.4, ease: "power2.out" });
      gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" });
      hovered = null;
    };
    const progress = () => {
      const dist = Math.max(1, (track.offsetHeight || innerHeight) - innerHeight);
      const top = track.getBoundingClientRect().top;
      pT = Math.max(0, Math.min(1, -top / dist));
      if (hint) hint.style.opacity = String(Math.max(0, 1 - pT * 5));
    };
    addEventListener("scroll", progress, { passive: true, signal: ac.signal });
    progress();
    const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const frame = () => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      p += (pT - p) * (reduce ? 1 : 0.08);
      const gray = Math.max(0, 1 - p / 0.3);
      if (!drag) { vel *= 0.94; rot += (reduce ? 0 : 0.0012) + vel; }
      ring.rotation.y = rot + p * Math.PI * 3.8;
      ring.rotation.x += (tiltX - ring.rotation.x) * 0.05;
      ring.rotation.z += (tiltZ - ring.rotation.z) * 0.05;
      const sc = fitScale(), mobile = innerWidth <= 768;
      const z0 = 2350 / Math.pow(sc, 0.4), z1 = 1100 / Math.pow(sc, 0.3);
      camera.position.z += ((mobile ? z0 + (z0 * 0.8 - z0) * p : z0 + (z1 - z0) * p) - camera.position.z) * 0.08;
      camera.position.x += (camX - camera.position.x) * 0.05;
      camera.position.y += (camY + 40 + (220 * sc - 40) * p - camera.position.y) * 0.05;
      camera.lookAt(0, 80, 0);
      if (title) {
        title.style.transform = `translate(-50%, -50%) scale(${(1 + p * 0.25).toFixed(3)})`;
        const e = Math.min(1, Math.max(0, (p - 0.05) / 0.65));
        title.style.filter = p > 0.05 ? `saturate(${(1 + e * 1.8).toFixed(2)}) brightness(${(1 + e * 0.45).toFixed(2)}) drop-shadow(0 0 ${(e * 8).toFixed(1)}px color-mix(in srgb, var(--fx-glow, var(--kf-accent)) ${(e * 85).toFixed(0)}%, transparent))` : "none";
      }
      meshes.forEach((m, i) => {
        m.getWorldPosition(tmp);
        if (m !== hovered || p > 0.08) m.material.uniforms.uGray.value = innerWidth <= 600 ? 0 : gray;
        const sy = 120 + (i - N / 2) * 95 + Math.sin(i * 0.8) * 300;
        m.position.y = m.userData.y + (sy - m.userData.y) * p;
        const r = R + (R * (0.65 + (i / N) * 0.75) - R) * p;
        m.position.x = Math.sin(m.userData.a) * r; m.position.z = Math.cos(m.userData.a) * r;
        if (i === 0 && p > 0.45) { const s = 1 + ((p - 0.45) / 0.45) * ((mobile ? 1.5 : 4.2) - 1); m.scale.set(s, s, s); m.material.depthTest = false; }
        else if (i === 0 && m !== hovered) { m.scale.set(1, 1, 1); m.material.depthTest = true; }
        if (m === hovered && p < 0.1) { m.material.uniforms.uAlpha.value = 1; m.visible = true; return; }
        const fade = p > 0.85 ? Math.max(0, 1 - (p - 0.85) / 0.15) : 1;
        m.material.uniforms.uAlpha.value = smooth(-800, 160, tmp.z) * fade;
        m.visible = m.material.uniforms.uAlpha.value > 0.005;
      });
      if (p < 0.1) {
        ray.setFromCamera(mouse, camera);
        const hit = ray.intersectObjects(meshes)[0]?.object;
        let ok = null;
        if (hit) { hit.getWorldPosition(tmp); if (tmp.z > 80) ok = hit; }
        if (ok && ok !== hovered) {
          unhover();
          hovered = ok;
          gsap.to(ok.material.uniforms.uGray, { value: 0, duration: 0.35, ease: "power2.out" });
          gsap.to(ok.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.35, ease: "power2.out" });
        } else if (!ok) unhover();
      }
      renderer.render(scene, camera);
    };
    frame();
    const ro = new ResizeObserver(() => {
      W = stage.clientWidth || innerWidth; H = stage.clientHeight || innerHeight;
      camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H);
      const s = fitScale(); ring.scale.set(s, s, s);
    });
    ro.observe(stage);
    return () => {
      alive = false; cancelAnimationFrame(raf); ac.abort(); ro.disconnect();
      meshes.forEach((m) => { gsap.killTweensOf([m.scale, m.material.uniforms.uGray]); m.material.uniforms.map.value?.dispose(); m.material.dispose(); });
      geo.dispose(); renderer.dispose(); renderer.domElement.remove();
      if (title) { title.style.transform = ""; title.style.filter = ""; }
      if (hint) hint.style.opacity = "";
    };
  });
})();
