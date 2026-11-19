// A few jewels float over white silk, and refracted jewel-light patterns (caustics) ripple on the floor — a jewel with an interaction over it lifts, and pressing moves you closer to that jewel.
// Gems are faceted shapes carved up from an outline (flat light per facet), while light, sparkle and the white edge rim are shader math. The floor pattern is also our shader.
(() => {
  const GEM_VERT = `
    varying vec3 vN; varying vec3 vV; varying vec3 vW;
    void main() {
      vec4 w = modelMatrix * vec4(position, 1.0);
      vW = w.xyz;
      vV = cameraPosition - w.xyz;
      vN = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;
  // Face normals from screen derivatives — light must break per face to read as a cut gem
  const GEM_FRAG = `
    uniform vec3 uColor; uniform float uTime, uLift, uDim; uniform float uSeed;
    varying vec3 vN; varying vec3 vV; varying vec3 vW;
    void main() {
      vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
      vec3 v = normalize(vV);
      if (dot(n, v) < 0.0) n = -n;
      vec3 l1 = normalize(vec3(-0.4, 0.8, 0.6)), l2 = normalize(vec3(0.7, 0.2, 0.5));
      float facet = fract(sin(dot(floor(n * 7.0 + uSeed), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
      float body = 0.28 + 0.55 * facet + 0.25 * max(dot(n, l1), 0.0);
      float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
      float spark = pow(max(dot(reflect(-l1, n), v), 0.0), 60.0) + 0.6 * pow(max(dot(reflect(-l2, n), v), 0.0), 90.0);
      float tw = 0.5 + 0.5 * sin(uTime * 2.3 + uSeed * 9.0 + facet * 6.28);
      vec3 col = uColor * body + vec3(1.0) * (spark * (0.7 + 0.6 * tw) + fres * 0.55) + uColor * uLift * 0.25;
      gl_FragColor = vec4(mix(col, vec3(1.0), uDim * 0.75), 1.0 - uDim * 0.6);
      #include <colorspace_fragment>
    }`;
  // Floor — silk folds (low-noise shade) + gem light pattern (overlapping cell edges) + shadow under gems, pattern color is the nearest gem’s color
  const FLOOR_FRAG = `
    uniform float uTime, uAspect; uniform vec3 uBg, uShade; uniform vec3 uGemPos[5]; uniform vec3 uGemCol[5]; uniform float uCount, uStrength;
    varying vec2 vUv;
    vec2 h2(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
    float cells(vec2 p, float t) {
      vec2 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0;
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y)), o = h2(i + g);
        o = 0.5 + 0.45 * sin(t + 6.2831 * o);
        float d = length(g + o - f);
        if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
      }
      return d2 - d1;
    }
    float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h2(i).x, h2(i + vec2(1, 0)).x, f.x), mix(h2(i + vec2(0, 1)).x, h2(i + vec2(1, 1)).x, f.x), f.y); }
    void main() {
      vec2 p = vec2((vUv.x - 0.5) * uAspect, vUv.y - 0.5);
      float silk = vn(p * 2.2 + vec2(uTime * 0.02, 0.0)) * 0.6 + vn(p * 5.0 - vec2(0.0, uTime * 0.015)) * 0.4;
      vec3 col = mix(uShade, uBg, 0.55 + 0.45 * smoothstep(0.2, 0.8, silk));
      for (int k = 0; k < 5; k++) {
        if (float(k) >= uCount) break;
        vec2 g = uGemPos[k].xy; float r = uGemPos[k].z;
        float d = length(p - g - vec2(0.03, -0.05) * r * 4.0);
        col *= 1.0 - 0.22 * smoothstep(r * 2.2, r * 0.4, d);
        float glow = smoothstep(r * 4.5, 0.0, length(p - g));
        float c = cells((p - g) * (9.0 / max(r * 6.0, 0.2)), uTime * 0.6 + float(k));
        float line = smoothstep(0.09, 0.0, c) * glow;
        col += uGemCol[k] * line * uStrength + vec3(1.0) * line * uStrength * 0.35;
      }
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
    }`;

  // Five outline types — cushion · oval · baguette · square · drop (pear shape). Keep the facet count low so the cut faces are visible
  function outline(kind) {
    const s = new window.THREE.Shape();
    const ell = (rx, ry, n) => { for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; i ? s.lineTo(Math.cos(a) * rx, Math.sin(a) * ry) : s.moveTo(rx, 0); } };
    const rect = (w, h, c) => { s.moveTo(-w + c, -h); s.lineTo(w - c, -h); s.lineTo(w, -h + c); s.lineTo(w, h - c); s.lineTo(w - c, h); s.lineTo(-w + c, h); s.lineTo(-w, h - c); s.lineTo(-w, -h + c); s.closePath(); };
    if (kind === "oval") ell(0.62, 0.46, 14);
    else if (kind === "baguette") rect(0.26, 0.62, 0.07);
    else if (kind === "square") rect(0.46, 0.46, 0.1);
    else if (kind === "pear") { for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2, r = 0.45 * (1 - 0.35 * Math.sin(a)); i ? s.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 1.25 - 0.08) : s.moveTo(r * 0.85, -0.08); } }
    else rect(0.5, 0.5, 0.22);
    return s;
  }

  kfFx.register("gem-chorus-gl", (el, { options, reduce, hover }) => {
    const THREE = window.THREE;
    if (!THREE) return;
    const gemEls = [...el.querySelectorAll('[data-fx-part="gem"]')];
    if (!gemEls.length) return;
    const num = (k, d) => (options[k] === undefined || options[k] === "" ? d : +options[k]);
    const follow = num("follow", 0.05), tilt = num("tilt", 0.12), focusDur = num("focus", 1.6), strength = num("caustics", 0.55);

    let canvas = el.querySelector('[data-fx-part="canvas"]');
    const made = !canvas;
    if (made) { canvas = document.createElement("canvas"); canvas.dataset.fxPart = "canvas"; el.prepend(canvas); }
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch (e) { if (made) canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    // Colors written in oklch · color-mix cannot be read by THREE.Color — compute them via text color, then paint on a 1px canvas and read back as sRGB
    const probeEl = document.createElement("span");
    probeEl.hidden = true;
    el.appendChild(probeEl);
    const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const colorOf = (v, d) => {
      probeEl.style.color = `var(${v}, ${d})`;
      px.clearRect(0, 0, 1, 1);
      px.fillStyle = d;
      px.fillStyle = getComputedStyle(probeEl).color;
      px.fillRect(0, 0, 1, 1);
      const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
      return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    };

    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 8);
    const floorU = {
      uTime: { value: 0 }, uAspect: { value: 1 }, uBg: { value: colorOf("--fx-floor", "white") }, uShade: { value: colorOf("--fx-floor-shade", "gray") },
      uGemPos: { value: Array.from({ length: 5 }, () => new THREE.Vector3()) }, uGemCol: { value: Array.from({ length: 5 }, () => new THREE.Color()) },
      uCount: { value: 0 }, uStrength: { value: strength },
    };
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: floorU, depthWrite: false, depthTest: false,
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }",
      fragmentShader: FLOOR_FRAG,
    }));
    floor.renderOrder = -1;
    floor.frustumCulled = false;
    scene.add(floor);

    const gems = gemEls.slice(0, 5).map((g, i) => {
      const kind = g.dataset.shape || ["cushion", "oval", "baguette", "square", "pear"][i % 5];
      const geo = new THREE.ExtrudeGeometry(outline(kind), { depth: 0.18, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.14, bevelThickness: 0.22, curveSegments: 4 }).toNonIndexed();
      geo.center();
      const mat = new THREE.ShaderMaterial({
        vertexShader: GEM_VERT, fragmentShader: GEM_FRAG, transparent: true,
        uniforms: { uColor: { value: colorOf(`--fx-gem-${i + 1}`, "teal") }, uTime: { value: 0 }, uLift: { value: 0 }, uDim: { value: 0 }, uSeed: { value: i * 1.37 } },
      });
      const mesh = new THREE.Mesh(geo, mat);
      const [x, y, s] = (g.dataset.at || "0 0 1").split(/\s+/).map(Number);
      mesh.userData = { el: g, home: new THREE.Vector3(x, y, 0), size: s || 1, spin: 0.15 + 0.1 * i, phase: i * 1.9, lift: 0, dim: 0, index: i };
      mesh.scale.setScalar(s || 1);
      scene.add(mesh);
      return mesh;
    });
    floorU.uCount.value = gems.length;

    let w = 1, h = 1, viewH = 1, viewW = 1;
    const resize = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      w = r.width; h = r.height;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      viewW = viewH * camera.aspect;
      floorU.uAspect.value = w / h;
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    renderer.compile(scene, camera);

    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), aim = new THREE.Vector2(), look = new THREE.Vector2();
    let hovered = -1, focus = -1, focusK = 0, inside = false;
    const emit = (type, detail) => el.dispatchEvent(new CustomEvent(type, { detail, bubbles: true }));
    const pick = (e) => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      aim.copy(ndc);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(gems, false)[0];
      return hit ? hit.object.userData.index : -1;
    };
    const onMove = (e) => {
      inside = true;
      const i = focus < 0 ? pick(e) : -1;
      if (i !== hovered) {
        hovered = i;
        el.style.cursor = i >= 0 ? "pointer" : "";
        gems.forEach((m, k) => m.userData.el.classList.toggle("is-hover", k === i));
        emit(i >= 0 ? "fx:hover" : "fx:leave", { index: i, name: i >= 0 ? gems[i].userData.el.dataset.name || "" : "" });
      }
    };
    const onLeave = () => {
      inside = false;
      aim.set(0, 0);
      el.style.cursor = "";
      gems.forEach((m) => m.userData.el.classList.remove("is-hover"));
      if (hovered >= 0) { hovered = -1; emit("fx:leave", { index: -1 }); }
    };
    const onClick = (e) => { const i = focus < 0 ? pick(e) : -1; if (i >= 0) emit("fx:pick", { index: i, name: gems[i].userData.el.dataset.name || "" }); };
    const onState = (e) => { if (e.detail && "focus" in e.detail) focus = e.detail.focus; };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick);
    el.addEventListener("fx:state", onState);

    const v = new THREE.Vector3();
    let last = performance.now(), t = 0, raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(Math.max(now - last, 0) / 1000, 0.05);
      last = now;
      if (!visible || document.hidden) return;
      if (!reduce) t += dt;
      floorU.uTime.value = t;
      focusK += ((focus >= 0 ? 1 : 0) - focusK) * Math.min(1, dt / (focusDur / 4));
      look.lerp(inside && hover ? aim : look.set(look.x * 0.98, look.y * 0.98), follow);
      camera.position.x = look.x * tilt * 3;
      camera.position.y = look.y * tilt * 2;
      camera.lookAt(0, 0, 0);
      gems.forEach((m, i) => {
        const u = m.userData, on = i === focus;
        u.lift += ((i === hovered ? 1 : 0) - u.lift) * Math.min(1, dt * 6);
        u.dim += ((focus >= 0 && !on ? 1 : 0) - u.dim) * Math.min(1, dt * 3);
        const hx = (u.home.x * viewW) / 2, hy = (u.home.y * viewH) / 2;
        const bob = reduce ? 0 : Math.sin(t * 0.8 + u.phase) * 0.06;
        const tx = on ? 0 : hx * (1 + focusK * 0.6), ty = on ? 0.15 : hy * (1 + focusK * 0.6) + bob;
        m.position.x += (tx - m.position.x) * Math.min(1, dt * 2.2);
        m.position.y += (ty - m.position.y) * Math.min(1, dt * 2.2);
        m.position.z += ((on ? 2.2 : u.lift * 0.4) - m.position.z) * Math.min(1, dt * 2.2);
        m.scale.setScalar(u.size * (1 + u.lift * 0.08));
        if (!reduce) { m.rotation.y += dt * u.spin * (on ? 0.6 : 1); m.rotation.x = 0.5 + Math.sin(t * 0.5 + u.phase) * 0.15; }
        m.material.uniforms.uTime.value = t;
        m.material.uniforms.uLift.value = u.lift;
        m.material.uniforms.uDim.value = u.dim;
        v.copy(m.position).project(camera);
        floorU.uGemPos.value[i].set((v.x * w) / h / 2, v.y / 2, (0.11 * u.size * (1 + m.position.z * 0.15)) * (1 - u.dim * 0.6));
        floorU.uGemCol.value[i].copy(m.material.uniforms.uColor.value).multiplyScalar(1 - u.dim);
        u.el.style.setProperty("--fx-x", `${((v.x + 1) / 2) * w}px`);
        u.el.style.setProperty("--fx-y", `${((1 - v.y) / 2) * h}px`);
      });
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);
    el.classList.add("is-live");

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick);
      el.removeEventListener("fx:state", onState);
      el.style.cursor = "";
      el.classList.remove("is-live");
      gems.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
      floor.geometry.dispose();
      floor.material.dispose();
      renderer.dispose();
      probeEl.remove();
      if (made) canvas.remove();
    };
  });
})();
