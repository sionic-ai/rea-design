// Scrolls a row of plates side by side so the current cell’s plate comes to center, and bends plates backward toward the screen edges, drawn like a round wall (three).
// Defaults are the original service gallery values of the reference site — CSS 3D flat cards can’t produce bending (curvature) within a single plate, so a shader pushes the vertices.
(() => {
  kfFx.register("bow-gallery", (el, { options, reduce, hover, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || !window.THREE || !window.ScrollTrigger) return;
    const N = items.length, COLS = Math.ceil(Math.sqrt(N)), ROWS = Math.ceil(N / COLS);
    const fov = +(options.fov ?? 75) || 75, camZ = +(options.z ?? 7.5) || 7.5, ratio = +(options.ratio ?? 16 / 9) || 16 / 9;
    const gapK = +(options.gap ?? 0.25), bowK = +(options.bow ?? 0.5), skewK = reduce ? 0 : +(options.skew ?? 0.004), depthK = +(options.depth ?? 0.18), min = +(options.min ?? 0.8);
    const narrow = matchMedia(`(max-width: ${+(options.narrow ?? 960)}px)`);
    el.style.setProperty("--fx-count", N);
    const canvas = Object.assign(document.createElement("canvas"), { className: "fx-bow-canvas" });
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const pointer = el.querySelector('[data-fx-part="pointer"]');

    const VERT = `
      uniform float uBow;
      uniform float uSkew;
      uniform float uDepth[${N}];
      attribute float aTile;
      varying vec2 vUv;
      varying float vTile;
      void main() {
        vUv = uv;
        vTile = aTile;
        vec3 p = position;
        // On fast scroll, the panel’s center rows get pushed sideways and bend (top and bottom edges stay in place)
        p.x += sin(uv.y * 3.14159265) * uSkew;
        p.z += uDepth[int(aTile + 0.5)];
        vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
        vec4 clip = projectionMatrix * viewMatrix * world;
        // The farther from the horizontal center of the screen, the further back it is pushed — a bend that makes a flat panel look stuck to a round wall
        float edge = abs(clip.x / clip.w) / 1.8;
        world.z -= edge * edge * uBow;
        gl_Position = projectionMatrix * viewMatrix * world;
      }`;
    const FRAG = `
      uniform sampler2D uAtlas;
      uniform float uHover[${N}];
      varying vec2 vUv;
      varying float vTile;
      const float ASPECT = ${ratio.toFixed(6)};
      void main() {
        vec2 cell = vec2(mod(vTile, ${COLS.toFixed(1)}), floor(vTile / ${COLS.toFixed(1)}));
        vec4 c = texture2D(uAtlas, vec2((cell.x + vUv.x) / ${COLS.toFixed(1)}, 1.0 - (cell.y + 1.0 - vUv.y) / ${ROWS.toFixed(1)}));
        // On hover, grayscale spreads in a circle from the center of the panel (the spreading edge of 0.12 is soft)
        float d = length(vec2((vUv.x - 0.5) * ASPECT, vUv.y - 0.5)) / length(vec2(0.5 * ASPECT, 0.5));
        float r = uHover[int(vTile + 0.5)] * 1.12;
        float gray = dot(c.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor = vec4(mix(c.rgb, vec3(gray), 1.0 - smoothstep(r - 0.12, r, d)), 1.0);
      }`;

    // Panel art — inside the panel <img> Fills it by covering, and if there is none, draws a placeholder in the skin color (diagonal and label). Everything goes into one sheet (bundle) so drawing finishes in one pass
    const sheet = document.createElement("canvas"), TW = 512, TH = Math.round(TW / ratio);
    const swatch = document.createElement("i");
    const tone = (v, prop = "color") => { swatch.style[prop] = `var(${v})`; el.append(swatch); const c = getComputedStyle(swatch)[prop]; swatch.remove(); swatch.removeAttribute("style"); return c; };
    const draw = () => {
      const g = sheet.getContext("2d");
      sheet.width = TW * COLS;
      sheet.height = TH * ROWS;
      const fill = tone("--kf-surface"), line = tone("--kf-line"), ink = tone("--kf-dim"), font = getComputedStyle(el).fontFamily;
      items.forEach((it, i) => {
        const x = (i % COLS) * TW, y = Math.floor(i / COLS) * TH, img = it.querySelector("img");
        if (img?.complete && img.naturalWidth) {
          const k = Math.max(TW / img.naturalWidth, TH / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
          g.save();
          g.beginPath(); g.rect(x, y, TW, TH); g.clip();
          g.drawImage(img, x + (TW - w) / 2, y + (TH - h) / 2, w, h);
          g.restore();
          return;
        }
        g.fillStyle = fill; g.fillRect(x, y, TW, TH);
        g.strokeStyle = line; g.lineWidth = 1.5;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + TW, y + TH); g.moveTo(x + TW, y); g.lineTo(x, y + TH); g.stroke();
        g.fillStyle = ink; g.font = `500 18px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(it.dataset.label || it.textContent.trim() || String(i + 1).padStart(2, "0"), x + TW / 2, y + TH / 2);
      });
    };
    draw();

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    camera.position.z = camZ;
    const atlas = new THREE.CanvasTexture(sheet);
    const redraw = () => { draw(); atlas.needsUpdate = true; };
    const ac = new AbortController(), on = { signal: ac.signal };
    items.forEach((it) => it.querySelectorAll("img").forEach((img) => img.addEventListener("load", redraw, on)));
    document.fonts?.ready.then(() => ac.signal.aborted || redraw());
    const uniforms = { uAtlas: { value: atlas }, uBow: { value: 0 }, uSkew: { value: 0 }, uHover: { value: new Float32Array(N) }, uDepth: { value: new Float32Array(N) } };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
    const outer = new THREE.Group(), inner = new THREE.Group();
    outer.add(inner);
    scene.add(outer);
    const steps = Math.max(0, Math.round((1 - min) / 0.05));
    const scales = items.map((it) => +(it.dataset.scale ?? min + 0.05 * Math.floor(Math.random() * (steps + 1))));
    const view = { w: 0, h: 0 }, plane = { w: 0, h: 0 };
    let mesh = null, xs = [], travel = 0;
    const along = () => gsap.utils.interpolate(-xs[0], -xs[xs.length - 1], travel);
    const layout = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      view.h = 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * camZ;
      view.w = view.h * camera.aspect;
      plane.h = 0.5 * view.h;
      plane.w = plane.h * ratio;
      const gap = gapK * plane.w;
      let x = 0;
      xs = scales.map((s) => { const c = x + (plane.w * s) / 2; x += plane.w * s + gap; return c; });
      xs = xs.map((c) => c - (x - gap) / 2);
      uniforms.uBow.value = view.h * bowK * (narrow.matches ? 0.25 : 1);
      if (mesh) (inner.remove(mesh), mesh.geometry.dispose());
      const geo = new THREE.PlaneGeometry(plane.w, plane.h, 48, 24);
      geo.setAttribute("aTile", new THREE.InstancedBufferAttribute(new Float32Array(items.map((_, i) => i)), 1));
      mesh = new THREE.InstancedMesh(geo, material, N);
      // The shader bends and pushes the panel beyond its original bounds — so do not cull it as off-screen
      mesh.frustumCulled = false;
      const o = new THREE.Object3D();
      xs.forEach((cx, i) => { o.position.set(cx, 0, 0); o.scale.set(scales[i], scales[i], 1); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); });
      mesh.instanceMatrix.needsUpdate = true;
      inner.add(mesh);
      inner.position.x = along();
    };
    layout();
    outer.position.x = view.w;
    addEventListener("resize", layout, on);

    // Renders only while on screen (when resting it draws a single empty frame with the panel group hidden) — slides in from one screen to the right when the section top reaches 25% of the screen, and exits to the left during the last screen
    let active = false, current = 0, hovered = -1;
    const show = (v) => { active = v; outer.visible = v; if (!v) renderer.render(scene, camera); };
    const tell = () => el.dispatchEvent(new CustomEvent("fx:bow-gallery", { detail: { index: hovered >= 0 ? hovered : current, current, hovered } }));
    const sts = [
      ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: "bottom-=100vh bottom", scrub: true, onUpdate: (st) => { travel = st.progress; inner.position.x = along(); } }),
      ScrollTrigger.create({ trigger: el, scroller, start: "top 25%", end: "top top-=25%", onEnter: () => show(true), onLeaveBack: () => show(false), onUpdate: (st) => (outer.position.x = view.w * (1 - st.progress)) }),
      ScrollTrigger.create({ trigger: el, scroller, start: "bottom-=100vh bottom", end: "bottom-=100vh top", onLeave: () => show(false), onEnterBack: () => show(true), onUpdate: (st) => (outer.position.x = -view.w * st.progress) }),
    ];
    // Slot = One screen height. When a cell’s top edge reaches 25% of the screen, that cell becomes the current panel
    const vh = () => (scroller ? scroller.clientHeight : innerHeight);
    sts.push(ScrollTrigger.create({ trigger: el, scroller, start: "top 25%", end: () => `+=${N * vh()}`, onUpdate: (st) => {
      const i = Math.min(N - 1, Math.floor(st.progress * N));
      if (i !== current) ((current = i), tell());
    } }));
    tell();

    // Cursor: picks a board only while inside the section (fit to the flat board, not the shader-bent shape — the original does the same)
    const mouse = { x: -1, y: -1 }, ndc = new THREE.Vector2(), ray = new THREE.Raycaster();
    const tileAt = (x, y) => {
      if (!active || !mesh) return -1;
      const r = el.getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return -1;
      ndc.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObject(mesh, false)[0]?.instanceId ?? -1;
    };
    addEventListener("pointermove", (e) => e.pointerType === "mouse" && ((mouse.x = e.clientX), (mouse.y = e.clientY)), { passive: true, signal: ac.signal });
    // If released on the same panel within 8px (finger 18px) of pressing, open that panel’s data-href in a new tab
    let press = null;
    addEventListener("pointerdown", (e) => { if (e.isPrimary) press = { x: e.clientX, y: e.clientY, tile: tileAt(e.clientX, e.clientY), touch: e.pointerType === "touch" }; }, on);
    addEventListener("pointerup", (e) => {
      if (!press || !e.isPrimary) return;
      const t = tileAt(e.clientX, e.clientY), href = items[t]?.dataset.href;
      if (t >= 0 && t === press.tile && href && Math.hypot(e.clientX - press.x, e.clientY - press.y) <= (press.touch ? 18 : 8)) open(href, "_blank", "noopener,noreferrer");
      press = null;
    }, on);

    // Follower circle (optional): trails the cursor late by 9, and tilts (±24°) in proportion to fast horizontal movement. On appearing it grows in 0.3s quart.out and spins from -180° back upright in 0.6s
    const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
    const spin = { v: 0 }, pos = { x: 0, y: 0 }, last = { x: 0, y: 0 };
    let tilt = 0, shown = false, spinTw = null, showTw = null;
    if (pointer) gsap.set(pointer, { xPercent: -50, yPercent: -50, rotation: -15, opacity: 0, scale: 0 });
    const showPointer = (v) => {
      if (!pointer || shown === v) return;
      shown = v;
      showTw?.kill();
      spinTw?.kill();
      if (v) {
        pointer.style.visibility = "visible";
        spin.v = -180;
        spinTw = gsap.to(spin, { v: 0, duration: 0.6, ease: "quart.out" });
        showTw = gsap.to(pointer, { xPercent: -50, yPercent: -50, opacity: 1, scale: 1, duration: 0.3, ease: "quart.out" });
        return;
      }
      spin.v = 0;
      showTw = gsap.to(pointer, { xPercent: -50, yPercent: -50, rotation: -15, opacity: 0, scale: 0, duration: 0.25, ease: "quart.out", onComplete: () => shown || (pointer.style.visibility = "hidden") });
    };
    const follow = (hit, dt) => {
      if (!pointer) return;
      if (hit < 0) return showPointer(false);
      if (shown) (pos.x = damp(pos.x, mouse.x, 9, dt)), (pos.y = damp(pos.y, mouse.y, 9, dt));
      else (pos.x = last.x = mouse.x), (pos.y = last.y = mouse.y), (tilt = 0);
      const dx = pos.x - last.x, len = Math.hypot(dx, pos.y - last.y);
      tilt = damp(tilt, gsap.utils.clamp(-24, 24, (len / dt) * (len ? dx / len : 0) * 0.02), 12, dt);
      last.x = pos.x;
      last.y = pos.y;
      gsap.set(pointer, { x: pos.x, y: pos.y, rotation: -15 + tilt + spin.v });
      showPointer(true);
    };

    // Every frame: bends the panel by scroll speed (px per frame) (±5% of panel width), and the raised panel follows late with grayscale blur 4 · pushed back (panel height × depth) 10
    let skew = 0;
    const tick = (time, deltaMs) => {
      if (!active) return;
      const dt = Math.max(0.001, deltaMs / 1000);
      const raw = sts[0].getVelocity() / 60, v = Math.abs(raw) >= 0.01 ? raw : 0, max = 0.05 * plane.w;
      skew = damp(skew, gsap.utils.clamp(-max, max, -v * plane.w * skewK * (narrow.matches ? 0.25 : 1)), 16, dt);
      if (v === 0 && Math.abs(skew) < 0.001) skew = 0;
      uniforms.uSkew.value = skew;
      const hit = !hover || narrow.matches || mouse.x < 0 ? -1 : tileAt(mouse.x, mouse.y);
      if (hit !== hovered) ((hovered = hit), tell());
      el.style.cursor = hit >= 0 && items[hit].dataset.href ? "pointer" : "";
      follow(hit, dt);
      for (let i = 0; i < N; i++) {
        uniforms.uHover.value[i] = damp(uniforms.uHover.value[i], i === hit ? 1 : 0, 4, dt);
        uniforms.uDepth.value[i] = damp(uniforms.uDepth.value[i], i === hit ? -depthK * plane.h : 0, 10, dt);
      }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ac.abort();
      sts.forEach((st) => st.kill());
      if (pointer) gsap.killTweensOf(pointer);
      mesh?.geometry.dispose();
      material.dispose();
      atlas.dispose();
      renderer.dispose();
      canvas.remove();
      el.style.removeProperty("--fx-count");
      el.style.cursor = "";
    };
  });
})();
