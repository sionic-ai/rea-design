// First-person store aisle — chrome-rod clothes racks and picture panels stand at 2 intervals on both sides of a foggy (1→20) aisle, and three aisle copies are joined to walk endlessly.
// Wheel (Δ/50, every 60ms, stops after 0.5s of rest) · W/S · ↑↓ give walking force, and speed follows 1/20 of the remainder each frame, advancing at 0.1x.
// Turns the head toward the cursor (left-right −2x clamped to ±1 × 90°, up-down y×18°, 1/20 per frame). At first it descends from height 10 to eye level 1.6 by 1/20 each step.
// Below panel width 768, the left shelf is viewed from the side (view 100°), Prev and Next buttons apply a force of ±2.22 (decaying by 1/10 each step), and when it stops it snaps to the nearest cell (2 apart).
(() => {
  const paint = (name, host) => {
    const probe = document.createElement("i");
    probe.style.cssText = `display:none;color:var(${name})`;
    host.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255);
  };

  kfFx.register("aisle-walk-gl", (el, { options, reduce }) => {
    if (!window.THREE) return;
    const H = 2.5, T = 0.05;
    const layout = (options.layout || "PV PI PP VP PP PI PP | PP IP PP PV PP IP PP").split("|").map((a) => a.trim().split(/\s+/).map((r) => r.split("")));
    const fogFar = +(options.fog ?? 20) || 20;
    const mobile = el.clientWidth < 768;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const panelsLabels = [...el.querySelectorAll('[data-fx-part="panel"]')].map((p) => p.dataset.label || "");

    const col = {
      surface: paint("--kf-surface", el), raised: paint("--kf-raised", el), dim: paint("--kf-dim", el), ink: paint("--kf-ink", el),
      accent: paint("--kf-accent", el), brand: paint("--kf-accent-text", el), bg: paint("--kf-bg", el),
    };
    // Floor #9f9f9f · fog #fafafa spot — blended in the Skin
    const floorCol = col.ink.clone().lerp(col.bg, 0.64), fogCol = col.surface.clone().lerp(col.bg, 0.45);
    const hex = (c) => `#${c.getHexString()}`;
    const font = getComputedStyle(el).fontFamily;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(fogCol, 1, fogFar);
    const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 1000);
    camera.position.set(0, 10, -5);

    const envCanvas = document.createElement("canvas");
    envCanvas.width = 512; envCanvas.height = 256;
    {
      const g = envCanvas.getContext("2d"), sky = g.createLinearGradient(0, 0, 0, 256);
      sky.addColorStop(0, hex(col.surface)); sky.addColorStop(0.45, hex(col.raised)); sky.addColorStop(0.52, hex(col.dim)); sky.addColorStop(1, hex(floorCol));
      g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
      g.fillStyle = hex(col.surface);
      for (let i = 0; i < 8; i++) g.fillRect(i * 64 + 20, 40, 18, 80);
    }
    const env = new THREE.CanvasTexture(envCanvas);
    env.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = env;

    scene.add(new THREE.AmbientLight(undefined, 0.5));
    const rig = new THREE.Group();
    const key = new THREE.DirectionalLight(undefined, 0.5); key.position.set(2.5, 4, 2);
    const fill = new THREE.DirectionalLight(undefined, 0.1); fill.position.set(-2.5, 4, -2);
    const top = new THREE.PointLight(undefined, 0.4); top.position.set(-2, 10, 0);
    const keyT = new THREE.Object3D(), fillT = new THREE.Object3D();
    rig.add(key, fill, top, keyT, fillT);
    key.target = keyT; fill.target = fillT;
    scene.add(rig);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshStandardMaterial({ color: floorCol, side: THREE.DoubleSide, envMapIntensity: 0.35 }));
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
    const chrome = new THREE.MeshStandardMaterial({ color: col.surface, metalness: 1, roughness: 0.1, envMapIntensity: 0.6 });

    // Product image — the img if there is one, otherwise a garment silhouette placeholder (light and dark garments alternating)
    function itemTexture(part, k) {
      const c = document.createElement("canvas"); c.width = c.height = 256;
      const g = c.getContext("2d");
      const tex = new THREE.CanvasTexture(c);
      const img = part && part.querySelector("img");
      const dark = k % 2 === 1;
      const draw = () => {
        g.clearRect(0, 0, 256, 256);
        if (img && img.complete && img.naturalWidth) { g.drawImage(img, 0, 0, 256, 256); tex.needsUpdate = true; return; }
        g.fillStyle = hex(dark ? col.brand : col.raised);
        g.beginPath();
        g.moveTo(88, 30); g.quadraticCurveTo(128, 52, 168, 30); g.lineTo(236, 62); g.lineTo(214, 112); g.lineTo(188, 100);
        g.lineTo(190, 232); g.lineTo(66, 232); g.lineTo(68, 100); g.lineTo(42, 112); g.lineTo(20, 62); g.closePath(); g.fill();
        g.strokeStyle = hex(dark ? col.accent : col.brand); g.lineWidth = 3;
        g.beginPath();
        for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + k; g.moveTo(128, 140); g.quadraticCurveTo(128 + Math.cos(a) * 60, 140 + Math.sin(a) * 30, 128 + Math.cos(a + 1) * 44, 140 + Math.sin(a + 1) * 50); }
        g.stroke();
        tex.needsUpdate = true;
      };
      draw();
      if (img && !img.complete) img.addEventListener("load", draw, { once: true });
      return tex;
    }
    const nItems = Math.max(1, items.length);
    const itemTex = Array.from({ length: Math.max(4, nItems * 2) }, (_, k) => itemTexture(items[(k >> 1) % nItems], k));

    // Image and video panels — the video panel (V) has its pattern flow sideways one panel per 10 seconds (original marquee)
    function panelTexture(label, video) {
      const c = document.createElement("canvas"); c.width = 512; c.height = 512;
      const g = c.getContext("2d");
      g.fillStyle = hex(col.surface); g.fillRect(0, 0, 512, 512);
      g.strokeStyle = hex(video ? col.dim : col.raised); g.lineWidth = video ? 14 : 4;
      for (let i = -512; i < 512; i += video ? 64 : 40) { g.beginPath(); g.moveTo(i, 512); g.bezierCurveTo(i + 120, 300, i + 260, 420, i + 512, 0); g.stroke(); }
      g.fillStyle = hex(col.ink); g.font = `500 26px ${font}`;
      g.fillText(label, 24, 470);
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }

    const rod = (len, pos, rot) => {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.5 * T, len, 2, 8), chrome);
      m.position.set(...pos); m.rotation.set(...rot);
      return m;
    };
    function rail(y) {
      const g = new THREE.Group();
      g.position.y = y;
      g.add(rod(1.9, [0, 0, 0], [Math.PI / 2, 0, 0]));
      for (const s of [-1, 1]) { g.add(rod(0.5, [-0.25, 0, s * 0.95], [0, 0, Math.PI / 2])); g.add(rod(16, [-0.5, 8, s * 0.95], [0, 0, 0])); }
      return g;
    }

    const hits = [], sprites = [], marquees = [];
    let nPanel = 0;
    function shelf(index, pi) {
      const g = new THREE.Group();
      g.position.z = -2 * index;
      const hit = new THREE.Mesh(new THREE.BoxGeometry(1, H, 2), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.y = H / 2; hit.userData.item = pi;
      g.add(hit); hits.push(hit);
      g.add(rail(H / 2), rail(H + 0.15));
      for (let level = 0; level < 2; level++) for (let c = 0; c < 2; c++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: itemTex[(pi * 2 + ((level + c) % 2)) % itemTex.length], transparent: true }));
        sp.position.set(0.25, level * H * 0.5 + T / 2 + H / 2 - 0.5, -0.5 + c);
        sp.userData.item = pi;
        g.add(sp); sprites.push(sp);
      }
      return g;
    }
    function panel(index, kind) {
      const g = new THREE.Group();
      g.position.z = -2 * index;
      const ratio = 1.1, y = H / 1.5;
      g.add(rail(y + (1.8 * ratio) / 2), rail(y - (1.8 * ratio) / 2));
      const label = panelsLabels[nPanel % Math.max(1, panelsLabels.length)] || (kind === "V" ? "Video panel" : "Image panel");
      nPanel++;
      const tex = panelTexture(label, kind === "V");
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.8 * ratio, 1.85), new THREE.MeshBasicMaterial({ map: tex }));
      box.position.set(-0.02, y, 0);
      g.add(box);
      if (kind === "V") marquees.push(tex);
      return g;
    }

    const lens = layout.map((rows) => 2 * rows.length + (mobile ? 0 : 4));
    const C = lens.reduce((a, b) => a + b, 0);
    let pCount = 0;
    for (let copy = 0; copy < 3; copy++) {
      const world = new THREE.Group();
      world.position.z = -C * (copy + 1);
      let d = 0;
      layout.forEach((rows, ai) => {
        d += lens[ai];
        const aisle = new THREE.Group();
        aisle.position.z = d;
        const sides = mobile ? [[-2, 0, 0]] : [[-2, 0, 0], [2, -Math.PI, 1]];
        for (const [x, rot, k] of sides) {
          const side = new THREE.Group();
          side.position.x = x; side.rotation.y = rot;
          rows.forEach((r, i) => { const kind = r[k] || "P"; side.add(kind === "P" ? shelf(i, pCount++ % nItems) : panel(i, kind)); });
          aisle.add(side);
        }
        world.add(aisle);
      });
      scene.add(world);
    }

    // Cart — wire basket (rod instances) + four wheels. Placed on the floor .9 ahead, following the camera (none under panel width 768)
    if (options.cart !== "none" && !mobile) {
      const cart = new THREE.Group();
      const wires = [];
      const seg = (a, b) => wires.push([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
      const topY = 1.0, bot = 0.5, hw = 0.3, hl = 0.48, bw = 0.24, bl = 0.4;
      for (let i = 0; i <= 10; i++) { const z = -hl + (2 * hl * i) / 10, zb = -bl + (2 * bl * i) / 10; seg([-hw, topY, z], [-bw, bot, zb]); seg([hw, topY, z], [bw, bot, zb]); }
      for (let i = 0; i <= 8; i++) { const x = -hw + (2 * hw * i) / 8, xb = -bw + (2 * bw * i) / 8; seg([x, topY, -hl], [xb, bot, -bl]); seg([x, topY, hl], [xb, bot, bl]); seg([xb, bot, -bl], [xb, bot, bl]); }
      for (const y of [topY, (topY + bot) / 2, bot]) {
        const k = (y - bot) / (topY - bot), w = bw + (hw - bw) * k, l = bl + (hl - bl) * k;
        seg([-w, y, -l], [w, y, -l]); seg([w, y, -l], [w, y, l]); seg([w, y, l], [-w, y, l]); seg([-w, y, l], [-w, y, -l]);
      }
      seg([-hw - 0.04, topY + 0.06, hl + 0.12], [hw + 0.04, topY + 0.06, hl + 0.12]);
      seg([-hw, topY, hl], [-hw - 0.04, topY + 0.06, hl + 0.12]); seg([hw, topY, hl], [hw + 0.04, topY + 0.06, hl + 0.12]);
      for (const x of [-bw, bw]) for (const z of [-bl, bl]) seg([x, bot, z], [x * 1.05, 0.06, z * 1.05]);
      const inst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 6), chrome, wires.length);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), s = new THREE.Vector3();
      wires.forEach(([a, b], i) => {
        const dir = b.clone().sub(a), len = dir.length();
        q.setFromUnitVectors(up, dir.normalize()); s.set(1, len, 1);
        m.compose(a.clone().add(b).multiplyScalar(0.5), q, s);
        inst.setMatrixAt(i, m);
      });
      cart.add(inst);
      const wheel = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16).rotateZ(Math.PI / 2), wheelMat = new THREE.MeshStandardMaterial({ color: col.ink, roughness: 0.6 });
      for (const x of [-bw, bw]) for (const z of [-bl, bl]) { const w = new THREE.Mesh(wheel, wheelMat); w.position.set(x * 1.05, 0.05, z * 1.05); cart.add(w); }
      cart.position.set(0, 0, -0.9);
      rig.add(cart);
    }

    function fit() {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      canvas.style.width = "100%"; canvas.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    fit();
    renderer.compile(scene, camera);

    // ── Input ──
    let paused = false;
    const input = { forward: 0, backward: 0 };
    const KEYS = { KeyW: "forward", KeyS: "backward", ArrowUp: "forward", ArrowDown: "backward" };
    const onKey = (e) => { const k = KEYS[e.code]; if (k && !paused) input[k] = k === "forward" ? 1 : -1; };
    const offKey = (e) => { const k = KEYS[e.code]; if (k) input[k] = 0; };
    let wheelAt = 0, wheelStop = 0;
    const onWheel = (e) => {
      if (paused) return;
      e.preventDefault();
      const now = performance.now();
      if (now - wheelAt < 60) return;
      wheelAt = now;
      clearTimeout(wheelStop);
      const px = e.deltaMode === 1 ? e.deltaX * 40 : e.deltaX, py = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      const v = (Math.abs(py) >= Math.abs(px) ? py : 0.75 * px) / 50;
      if (v > 0.05) input.forward = v; else if (v < -0.05) input.backward = v; else input.forward = input.backward = 0;
      wheelStop = setTimeout(() => { input.forward = input.backward = 0; }, 500);
    };
    const mouse = new THREE.Vector2();
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      if (drag) Z = drag.z + (e.clientX - drag.x) / 60;
    };
    let kick = 0, drag = null;
    const arrows = [...el.querySelectorAll('[data-fx-part="prev"], [data-fx-part="next"]')];
    const onArrow = (e) => { e.stopPropagation(); kick = (e.currentTarget.dataset.fxPart === "next" ? 1 : -1) * 2.22; };
    const onDown = (e) => { if (mobile && !e.target.closest("[data-fx-part]")) drag = { x: e.clientX, z: Z }; };
    const onUp = () => { drag = null; };
    const onPause = () => { paused = true; input.forward = input.backward = 0; };
    const onResume = () => { paused = false; };

    const ray = new THREE.Raycaster();
    let hovered = null;
    const setHovered = (pi) => {
      if (pi === hovered) return;
      hovered = pi;
      el.style.cursor = pi == null ? "" : "pointer";
      el.dispatchEvent(new CustomEvent("fx:hover", { detail: { index: pi } }));
    };
    const onClick = () => { if (hovered != null && !paused) el.dispatchEvent(new CustomEvent("fx:pick", { detail: { index: hovered } })); };

    addEventListener("keydown", onKey); addEventListener("keyup", offKey);
    el.addEventListener("wheel", onWheel, { passive: false });
    addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick);
    el.addEventListener("fx:pause", onPause); el.addEventListener("fx:resume", onResume);
    arrows.forEach((a) => a.addEventListener("click", onArrow));
    if (mobile) el.style.touchAction = "pan-y";

    let Z = lens[0], speed = 0, t0 = performance.now(), ready = false, raf = 0;
    const wrap = () => {
      Z %= C;
      camera.position.z = Z;
      if (Z > -4) { Z -= C; camera.position.z -= C; } else if (Z < -C - 4) { Z += C; camera.position.z += C; }
    };
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const t = (now - t0) / 1000;
      if (!mobile) {
        speed += (input.forward + input.backward - speed) / 20;
        Z -= 0.1 * speed;
        wrap();
        const yaw = camera.rotation.y + (Math.max(Math.min(-(2 * mouse.x), 1), -1) * (Math.PI / 2) - camera.rotation.y) / 20;
        const pitch = camera.rotation.x + (Math.max(Math.min(mouse.y, 1), -1) * (Math.PI / 10) - camera.rotation.x) / 20;
        camera.rotation.set(pitch, yaw, 0);
      } else {
        kick += (0 - kick) / 10;
        Z -= 0.1 * kick;
        Z %= C;
        const snap = 2 * Math.round(Z / 2);
        if (kick <= 0.01 && kick >= -0.01 && !drag) Z += (snap - Z) / 10;
        wrap();
        camera.position.x = 0.2;
        if (camera.fov !== 100) { camera.fov = 100; camera.updateProjectionMatrix(); }
        camera.rotation.set(0, Math.PI / 2, 0);
      }
      camera.position.y += (1.6 - camera.position.y) / 20;
      rig.position.z = camera.position.z;
      if (!mobile && !paused) {
        ray.setFromCamera(mouse, camera);
        const hit = ray.intersectObjects(hits, false)[0];
        setHovered(hit && hit.distance < 12 ? hit.object.userData.item : null);
      }
      // The skin of the hovered shelf breathes at 1 ± .05, grows and comes .2 forward (1/10 per frame)
      for (const sp of sprites) {
        const on = sp.userData.item === hovered;
        const target = on ? 1 + 0.05 * Math.sin(2 * t) : 1;
        const s = sp.scale.x + (target - sp.scale.x) * 0.1;
        sp.scale.set(s, s, s);
        sp.position.x += (0.25 + (on ? 0.2 : 0) - sp.position.x) * 0.1;
      }
      for (const m of marquees) m.offset.x = t / 10;
      renderer.render(scene, camera);
      if (!ready && now - t0 > 600) { ready = true; el.classList.add("is-ready"); }
    };
    if (reduce) {
      camera.position.set(mobile ? 0.2 : 0, 1.6, Z - C);
      if (mobile) { camera.fov = 100; camera.updateProjectionMatrix(); camera.rotation.set(0, Math.PI / 2, 0); }
      rig.position.z = camera.position.z;
      renderer.render(scene, camera);
      el.classList.add("is-ready");
    } else raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(() => { fit(); if (reduce) renderer.render(scene, camera); });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); clearTimeout(wheelStop);
      removeEventListener("keydown", onKey); removeEventListener("keyup", offKey);
      el.removeEventListener("wheel", onWheel);
      removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick);
      el.removeEventListener("fx:pause", onPause); el.removeEventListener("fx:resume", onResume);
      arrows.forEach((a) => a.removeEventListener("click", onArrow));
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach((mm) => { mm.map?.dispose(); mm.dispose(); }); });
      env.dispose(); renderer.dispose(); canvas.remove();
      el.classList.remove("is-ready"); el.style.cursor = ""; el.style.touchAction = "";
    };
  });
})();
