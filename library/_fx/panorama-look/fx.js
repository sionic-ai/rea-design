// Inside an equirectangular (2:1) panorama sphere the camera slowly turns and looks around — after the hand is released and idle ms passes it turns at speed° per second, and when dragged it turns drag° per 1px,
// The wheel narrows and widens the field of view (FOV). The target angle is followed each frame by dt×follow, so it glides to a stop even after a drag is released.
// Places a god-ray panel in the beam direction (beam-lon, beam-lat), and dust visible only inside that beam slowly falls (original shader values rewritten from scratch).
// [data-fx-part=map] Two <img>·<canvas> if present, that image is wrapped onto the sphere (the canvas is re-read on the fx:map event). If absent, a stripe pattern is drawn in the skin color.
// [data-fx-part=pin] data-lon·data-lat children follow in that direction as HTML labels. fx:look event {lon, lat, fov, rate} You can turn the camera toward and move closer
(() => {
  const DEG = Math.PI / 180;
  const dirOf = (lon, lat, T) => {
    const p = (90 - lat) * DEG, t = lon * DEG;
    return new T.Vector3(Math.sin(p) * Math.cos(t), Math.cos(p), Math.sin(p) * Math.sin(t));
  };
  // Turn skin variables into three colors — if a variable is empty (supplied without kf-defaults) the default stays white
  const cssColor = (T, name) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(), c = new T.Color();
    if (v) try { c.setStyle(v); } catch {}
    return c;
  };
  // Default board when there is no image — skin color for the floor below, the middle band as a pillar, only the light side brightened
  function paintDefault(T, beamLon) {
    const c = document.createElement("canvas");
    c.width = 2048; c.height = 1024;
    const g = c.getContext("2d");
    const bg = cssColor(T, "--kf-bg"), ink = cssColor(T, "--kf-ink");
    const mix = (t, a = 1) => { const m = bg.clone().lerp(ink, t); return `rgba(${Math.round(m.r * 255)}, ${Math.round(m.g * 255)}, ${Math.round(m.b * 255)}, ${a})`; };
    const v = g.createLinearGradient(0, 0, 0, 1024);
    v.addColorStop(0, mix(0)); v.addColorStop(0.5, mix(0.22)); v.addColorStop(1, mix(0.1));
    g.fillStyle = v; g.fillRect(0, 0, 2048, 1024);
    g.fillStyle = mix(0, 0.7);
    for (let i = 0; i < 24; i++) g.fillRect((i / 24) * 2048, 180, 30, 620);
    const bx = (beamLon / 360) * 2048;
    const glow = g.createRadialGradient(bx, 420, 10, bx, 420, 360);
    glow.addColorStop(0, mix(1, 0.7)); glow.addColorStop(1, mix(1, 0));
    g.fillStyle = glow; g.fillRect(0, 0, 2048, 1024);
    return c;
  }

  kfFx.register("panorama-look", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T) return;
    const num = (k, d) => +(options[k] ?? d);
    const o = {
      lon: num("lon", 273), lat: num("lat", 12), fov: num("fov", 75), speed: num("speed", 3), idle: num("idle", 1200),
      drag: num("drag", 0.1), touch: num("touch", 2.4), zoom: num("zoom", 0.04), fovMin: num("fov-min", 55), fovMax: num("fov-max", 95),
      follow: num("follow", 6), settle: num("settle", 1.2), dust: Math.floor(num("dust", 220)), beamLon: num("beam-lon", 281.6), beamLat: num("beam-lat", 11),
      rays: num("rays", 0.9), wheel: options.wheel || "zoom", radius: 500,
    };
    const canvas = document.createElement("canvas");
    canvas.dataset.fxPart = "stage";
    el.prepend(canvas);
    const renderer = new T.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(o.fov, 1, 0.1, o.radius * 2);

    const src = el.querySelector('[data-fx-part="map"]');
    let tex;
    if (src && src.tagName === "IMG") {
      tex = new T.Texture(src);
      const ready = () => { tex.needsUpdate = true; };
      src.complete && src.naturalWidth ? ready() : src.addEventListener("load", ready, { once: true });
    } else {
      tex = new T.CanvasTexture(src && src.tagName === "CANVAS" ? src : paintDefault(T, o.beamLon));
    }
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    const sphereGeo = new T.SphereGeometry(o.radius, 64, 40);
    sphereGeo.scale(-1, 1, 1);
    const sphereMat = new T.MeshBasicMaterial({ map: tex });
    scene.add(new T.Mesh(sphereGeo, sphereMat));
    const onMap = () => { tex.needsUpdate = true; };
    el.addEventListener("fx:map", onMap);

    const tint = cssColor(T, "--kf-ink");
    const beamDir = dirOf(o.beamLon, o.beamLat, T);
    // Divine light — a 110×240 panel at distance 350 from the window side, with two layers of angled grain (17·11) drifting slowly
    let rays = null;
    if (o.rays > 0) {
      const u = { uTime: { value: 0 }, uIntensity: { value: o.rays }, uTint: { value: tint } };
      const m = new T.ShaderMaterial({
        uniforms: u, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide,
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: `uniform float uTime; uniform float uIntensity; uniform vec3 uTint; varying vec2 vUv;
          void main(){
            vec2 p = vUv - vec2(0.5, 0.9); float d = length(p); float a = atan(p.x, -p.y);
            float cone = smoothstep(0.95, 0.35, abs(a)); float fall = pow(1.0 - clamp(d, 0.0, 1.0), 1.6);
            float r1 = pow(0.5 + 0.5 * sin(a * 17.0 + uTime * 0.25), 4.0);
            float r2 = pow(0.5 + 0.5 * sin(a * 11.0 - uTime * 0.18 + 2.3), 3.0);
            float rays = (r1 * 0.7 + r2 * 0.5) * cone * fall * (0.92 + 0.08 * sin(uTime * 1.7 + d * 8.0));
            float core = pow(1.0 - clamp(d * 1.4, 0.0, 1.0), 3.0) * 0.6;
            float edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x) * smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.93, vUv.y);
            float l = (rays + core) * uIntensity * edge;
            gl_FragColor = vec4(uTint * l, l);
          }`,
      });
      rays = new T.Mesh(new T.PlaneGeometry(110, 240), m);
      rays.position.copy(beamDir).multiplyScalar(350);
      rays.lookAt(0, 0, 0);
      rays.userData.u = u;
      scene.add(rays);
    }
    // Dust — falls within a sphere of radius 180 (.9×.6~1.1), and is visible only as much as it matches the light direction (to the 12th power)
    let dust = null, vel = null;
    if (o.dust > 0) {
      const R = 180, pos = new Float32Array(o.dust * 3);
      vel = new Float32Array(o.dust * 3);
      for (let i = 0; i < o.dust; i++) {
        const k = i * 3, th = Math.random() * Math.PI * 2, ph = Math.acos(1 - 2 * Math.random()), r = R * Math.cbrt(Math.random());
        pos[k] = r * Math.sin(ph) * Math.cos(th); pos[k + 1] = r * Math.cos(ph); pos[k + 2] = r * Math.sin(ph) * Math.sin(th);
        vel[k] = (Math.random() - 0.5) * 0.4; vel[k + 1] = -0.9 * (0.6 + Math.random() * 0.5); vel[k + 2] = (Math.random() - 0.5) * 0.4;
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute("position", new T.BufferAttribute(pos, 3));
      const m = new T.ShaderMaterial({
        uniforms: { uDir: { value: beamDir.clone().normalize() }, uPr: { value: renderer.getPixelRatio() }, uTint: { value: tint } },
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        vertexShader: `uniform vec3 uDir; uniform float uPr; varying float vB;
          void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
            gl_PointSize = 1.4 * uPr * (260.0 / max(1.0, -mv.z));
            vB = pow(max(0.0, dot(normalize(position), uDir)), 12.0) * 1.1; }`,
        fragmentShader: `uniform vec3 uTint; varying float vB;
          void main(){ float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vB; if (a < 0.01) discard; gl_FragColor = vec4(uTint, a); }`,
      });
      dust = new T.Points(geo, m);
      dust.renderOrder = 3;
      scene.add(dust);
    }

    const pins = [...el.querySelectorAll('[data-fx-part="pin"]')].map((p) => ({ el: p, dir: dirOf(+p.dataset.lon || 0, +p.dataset.lat || 0, T) }));
    let W = 1, H = 1;
    const size = () => {
      W = Math.max(1, el.clientWidth); H = Math.max(1, el.clientHeight);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    // Current angles (lon·lat), targets (tLon·tLat), field-of-view target (tFov)
    // With turn, the target itself approaches goal at that speed (×dt) — 2.2 when the original turns toward the door
    let lon = o.lon, lat = o.lat, tLon = o.lon, tLat = o.lat, tFov = o.fov, fovRate = 0, hold = false, turn = 0;
    const goal = { lon: o.lon, lat: o.lat };
    let lastTouch = performance.now() - o.idle, last = 0, raf = 0, seen = true;
    const look = new T.Vector3(), v = new T.Vector3();
    const aim = () => {
      const d = dirOf(lon, lat, T);
      look.copy(d).multiplyScalar(o.radius);
      camera.lookAt(look);
    };
    const placePins = () => {
      for (const p of pins) {
        v.copy(p.dir).multiplyScalar(100).project(camera);
        const front = v.z < 1 && p.dir.dot(look.clone().normalize()) > 0;
        p.el.style.transform = `translate(${((v.x + 1) / 2) * W}px, ${((1 - v.y) / 2) * H}px) translate(-50%, -50%)`;
        p.el.style.visibility = front ? "visible" : "hidden";
      }
    };
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!seen || document.hidden) { last = now; return; }
      const dt = Math.min(Math.max(0.001, (now - (last || now)) / 1000), 0.1);
      last = now;
      if (!reduce && !dragging && !hold && now - lastTouch > o.idle) {
        tLon += o.speed * dt;
        tLat += (0 - tLat) * Math.min(1, dt * o.settle);
      }
      if (turn) {
        tLon += (goal.lon - tLon) * Math.min(1, dt * turn);
        tLat += (goal.lat - tLat) * Math.min(1, dt * turn);
      }
      lon += (tLon - lon) * Math.min(1, dt * o.follow);
      lat += (tLat - lat) * Math.min(1, dt * o.follow);
      lat = Math.max(-85, Math.min(85, lat));
      if (fovRate) { camera.fov += (tFov - camera.fov) * Math.min(1, dt * fovRate); camera.updateProjectionMatrix(); }
      if (rays) rays.userData.u.uTime.value = now / 1000;
      if (dust && !reduce) {
        const a = dust.geometry.attributes.position.array, R = 180;
        for (let i = 0; i < a.length; i += 3) {
          a[i] += vel[i] * dt; a[i + 1] += vel[i + 1] * dt; a[i + 2] += vel[i + 2] * dt;
          if (a[i + 1] < -R) { a[i + 1] = R; a[i] = (Math.random() - 0.5) * R * 1.6; a[i + 2] = (Math.random() - 0.5) * R * 1.6; }
        }
        dust.geometry.attributes.position.needsUpdate = true;
      }
      aim();
      placePins();
      renderer.render(scene, camera);
    };
    aim();
    camera.fov = o.fov;
    camera.updateProjectionMatrix();
    // The first compile on the first cursor move freezes the screen — do it ahead of time when building
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);

    // Drag — counts as a drag only after moving more than 6px. Touch is ×touch. Vertical scroll is left to the browser (touch-action: pan-y)
    let down = null, dragging = false;
    const onDown = (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      down = { x: e.clientX, y: e.clientY, lon: tLon, lat: tLat, id: e.pointerId, k: e.pointerType === "touch" ? o.drag * o.touch : o.drag };
    };
    const onMove = (e) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!dragging) {
        if (Math.hypot(dx, dy) < 6) return;
        dragging = true;
        el.classList.add("is-dragging");
      }
      tLon = down.lon - dx * down.k;
      tLat = Math.max(-85, Math.min(85, down.lat + dy * down.k));
      lastTouch = performance.now();
    };
    const onUp = () => {
      if (dragging) { dragging = false; el.classList.remove("is-dragging"); lastTouch = performance.now(); }
      down = null;
    };
    const onWheel = (e) => {
      if (o.wheel !== "zoom") return;
      e.preventDefault();
      fovRate = 0;
      camera.fov = Math.max(o.fovMin, Math.min(o.fovMax, camera.fov + e.deltaY * o.zoom));
      tFov = camera.fov;
      camera.updateProjectionMatrix();
      lastTouch = performance.now();
    };
    // When the site turns toward the door and approaches — {lon, lat, fov, rate, hold}
    const onLook = (e) => {
      const d = e.detail || {};
      turn = +(d.turn ?? 0);
      if (d.lon != null) { let k = d.lon - tLon; while (k > 180) k -= 360; while (k < -180) k += 360; turn ? (goal.lon = tLon + k) : (tLon += k); }
      if (d.lat != null) turn ? (goal.lat = d.lat) : (tLat = d.lat);
      if (d.fov != null) { tFov = d.fov; fovRate = +(d.rate ?? 1.6); }
      hold = !!d.hold;
      lastTouch = performance.now();
    };
    canvas.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("fx:look", onLook);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      el.removeEventListener("fx:look", onLook);
      el.removeEventListener("fx:map", onMap);
      scene.traverse((n) => { n.geometry?.dispose(); n.material?.dispose(); });
      tex.dispose();
      renderer.dispose();
      canvas.remove();
      el.classList.remove("is-dragging");
      for (const p of pins) { p.el.style.transform = ""; p.el.style.visibility = ""; }
    };
  });
})();
