(() => {
  // Skin values (oklch(from …) · color-mix) compute to oklab(), so paint them on a canvas and convert to an sRGB string
  let pix = null;
  const solid = (host, css) => {
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    probe.style.color = css;
    host.append(probe);
    const got = getComputedStyle(probe).color;
    probe.remove();
    if (!pix) pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = got;
    pix.fillRect(0, 0, 1, 1);
    const d = pix.getImageData(0, 0, 1, 1).data;
    return `rgb(${d[0]},${d[1]},${d[2]})`;
  };

  // Photo slot — two color bands with only the hue rotated from the accent color, a diagonal X, and a label saying what the photo is. Colors are chosen so the grayscale→color reveal shows.
  const placeholder = (host, i, label) => {
    const c = document.createElement("canvas");
    c.width = 640; c.height = 400;
    const g = c.getContext("2d");
    const a = solid(host, `oklch(from var(--kf-accent) 0.7 0.13 calc(h + ${i * 47}))`);
    const b = solid(host, `oklch(from var(--kf-accent) 0.42 0.1 calc(h + ${i * 47 + 120}))`);
    const ink = solid(host, "oklch(from var(--kf-ink) 1 0 0)");
    const grd = g.createLinearGradient(0, 0, 640, 400);
    grd.addColorStop(0, a);
    grd.addColorStop(1, b);
    g.fillStyle = grd;
    g.fillRect(0, 0, 640, 400);
    g.globalAlpha = 0.35;
    g.strokeStyle = ink;
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(640, 400); g.moveTo(640, 0); g.lineTo(0, 400); g.stroke();
    g.globalAlpha = 0.9;
    g.fillStyle = ink;
    g.font = "500 15px " + (getComputedStyle(host).getPropertyValue("--kf-font-mono").trim() || getComputedStyle(host).fontFamily);
    g.textAlign = "center";
    g.fillText((label || "").slice(0, 40), 320, 206);
    return c;
  };

  const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  // Only the front slide and the hovered slide regain color — ripples and color splitting spread around the cursor, and when the ring spins fast the glitch grows. The rounded-corner panel is cut by a distance field
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D map;
    uniform vec2 fit;
    uniform vec2 mouse;
    uniform float dim;
    uniform float glitch;
    uniform float time;
    uniform float reveal;
    float hh(vec2 p) { return fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453); }
    float vn(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hh(i), hh(i + vec2(1.0, 0.0)), f.x), mix(hh(i + vec2(0.0, 1.0)), hh(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    void main() {
      vec2 uv = vUv;
      float d = distance(uv, mouse);
      vec2 drift = vec2(vn(uv * 3.2 + time * 0.1), vn(uv * 3.2 - time * 0.12)) - 0.5;
      float wave = sin(d * 24.0 - time * 3.0) * 0.012 * exp(-d * 7.0);
      vec2 away = normalize(uv - mouse + 1e-4);
      vec2 shift = (drift * 0.02 + away * wave * 4.0) * reveal + away * (-0.04) * smoothstep(0.3, 0.0, d) * reveal;
      vec2 st = ((uv + shift) - 0.5) * fit + 0.5;
      float split = (0.002 + smoothstep(0.35, 0.0, d) * 0.012) * reveal + glitch * 0.018 + 0.0012;
      vec3 col = vec3(texture2D(map, st + away * split).r, texture2D(map, st).g, texture2D(map, st - away * split).b);
      float grey = dot(col, vec3(0.299, 0.587, 0.114));
      float tint = clamp(smoothstep(0.34, 0.02, d) * reveal + reveal * 0.32 + glitch * 0.3, 0.0, 1.0);
      col = mix(vec3(grey), col, tint);
      col *= dim;
      col *= smoothstep(1.45, 0.05, length(vUv - 0.5)) * 0.35 + 0.72;
      vec2 q = (vUv - 0.5) * vec2(1.6, 1.0);
      vec2 e = abs(q) - vec2(0.8, 0.5) + 0.03;
      float sd = min(max(e.x, e.y), 0.0) + length(max(e, 0.0)) - 0.03;
      float alpha = 1.0 - smoothstep(0.0, 0.006, sd);
      if (alpha < 0.002) discard;
      gl_FragColor = vec4(col, alpha);
    }`;

  kfFx.register("ring-reveal-gl", (el, { options, reduce }) => {
    const T = window.THREE;
    if (!T || !T.WebGLRenderer) return () => {};
    const cardEls = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cardEls.length) return () => {};
    const N = Math.min(cardEls.length, +options.max || 14);
    const R = +(options.radius ?? 8.2);
    const PW = +options.w || 3.2, PH = +options.h || 2.0;
    const base = +(options.speed ?? 0.0016);
    const shiftX = +(options.x ?? 2.6), shiftXPhone = +(options["x-phone"] ?? 0);
    const narrow = +options.phone || 768;
    const parts = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const meta = parts("meta"), client = parts("client"), title = parts("title"), num = parts("num"), total = parts("total");
    if (total) total.textContent = "/" + ("0" + N).slice(-2);

    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    el.prepend(canvas);
    let rn;
    try { rn = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { canvas.remove(); return () => {}; }
    rn.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    rn.setClearColor(0, 0);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(42, 1, 0.1, 120);
    const group = new T.Group();
    scene.add(group);
    const isPhone = () => el.clientWidth <= narrow;
    const view = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      cam.fov = isPhone() ? 52 : 42;
      cam.position.set(0, 0, isPhone() ? 16 : 12.8);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      rn.setSize(w, h, false);
    };

    const cards = [];
    for (let i = 0; i < N; i++) {
      const src = placeholder(el, i, cardEls[i].getAttribute("data-label"));
      const tex = new T.CanvasTexture(src);
      tex.colorSpace = T.SRGBColorSpace;
      tex.minFilter = T.LinearFilter;
      const ia = src.width / src.height, pa = PW / PH;
      const mat = new T.ShaderMaterial({
        uniforms: { map: { value: tex }, fit: { value: new T.Vector2(ia > pa ? pa / ia : 1, ia > pa ? 1 : ia / pa) }, dim: { value: 0.72 }, glitch: { value: 0 }, time: { value: 0 }, reveal: { value: 0 }, mouse: { value: new T.Vector2(0.5, 0.5) } },
        vertexShader: VERT, fragmentShader: FRAG, side: T.DoubleSide, transparent: true,
      });
      const m = new T.Mesh(new T.PlaneGeometry(PW, PH), mat);
      m.userData = { i, sc: 1, rv: 0 };
      group.add(m);
      cards.push(m);
    }
    const tmp = new T.Object3D(), origin = new T.Vector3();
    const layout = (i, spin) => {
      const a = (i / N) * Math.PI * 2 + spin;
      tmp.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
      tmp.lookAt(origin);
      tmp.rotateY(Math.PI);
      return tmp;
    };
    let spin = 0;
    cards.forEach((m) => { const L = layout(m.userData.i, spin); m.position.copy(L.position); m.quaternion.copy(L.quaternion); });
    view();
    rn.compile(scene, cam);

    let tv = base, drag = false, px = 0, moved = 0, gMotion = 0, hoverMesh = null, front = -1, plx = 0, ply = 0, tpx = 0, tpy = 0;
    const ray = new T.Raycaster(), ptr = new T.Vector2(-2, -2), wp = new T.Vector3();
    const down = (e) => { drag = true; moved = 0; px = e.clientX; canvas.classList.add("is-drag"); if (e.pointerType === "mouse") canvas.setPointerCapture(e.pointerId); };
    const cancel = () => { drag = false; canvas.classList.remove("is-drag"); };
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      tpx = (e.clientX - r.left) / r.width - 0.5; tpy = (e.clientY - r.top) / r.height - 0.5;
      if (drag) { const dx = e.clientX - px; tv = -dx * 0.0009; spin -= dx * 0.006; px = e.clientX; moved += Math.abs(dx); gMotion = Math.min(1, gMotion + Math.abs(dx) * 0.02); }
    };
    const up = () => {
      if (!drag) return;
      cancel();
      if (moved < 5 && hoverMesh) cardEls[hoverMesh.userData.i].click();
    };
    if (!reduce) {
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointercancel", cancel);
      canvas.addEventListener("pointermove", move);
      addEventListener("pointerup", up);
    }

    // When the previous slide changes, the name line moves up for .26s and returns with new text
    let swapId = 0;
    const tell = (i) => {
      if (num) num.textContent = ("0" + (i + 1)).slice(-2);
      el.dispatchEvent(new CustomEvent("fx:front", { detail: { index: i } }));
      if (!meta) return;
      meta.classList.add("is-swap");
      clearTimeout(swapId);
      swapId = setTimeout(() => {
        if (client) client.textContent = cardEls[i].getAttribute("data-client") || "";
        if (title) title.textContent = cardEls[i].getAttribute("data-title") || "";
        meta.classList.remove("is-swap");
      }, 260);
    };

    let seen = true;
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; });
    io.observe(el);
    const ro = new ResizeObserver(view);
    ro.observe(el);

    let raf = 0;
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!seen) return;
      const t = now * 0.001;
      if (!drag && !reduce) { spin += tv; tv += (base - tv) * 0.02; }
      gMotion *= 0.9;
      if (!drag) gMotion = Math.max(gMotion, Math.min(1, Math.abs(tv - base) * 40));
      plx += (tpx - plx) * 0.05; ply += (tpy - ply) * 0.05;
      group.rotation.x = ply * 0.12;
      group.position.x = (isPhone() ? shiftXPhone : shiftX) + plx * (isPhone() ? 0.15 : 0.5);
      cards.forEach((m) => { const L = layout(m.userData.i, spin); m.position.lerp(L.position, 0.14); m.quaternion.slerp(L.quaternion, 0.14); });
      let best = -1, bz = -1e9;
      cards.forEach((m) => { const z = m.getWorldPosition(wp).z; if (z > bz) { bz = z; best = m.userData.i; } });
      ray.setFromCamera(ptr, cam);
      const hit = ray.intersectObjects(cards)[0];
      hoverMesh = hit ? hit.object : null;
      canvas.classList.toggle("is-over", !!hoverMesh);
      const feat = hoverMesh ? hoverMesh.userData.i : best;
      if (feat !== front) { front = feat; tell(front); }
      cards.forEach((m) => {
        const u = m.material.uniforms, isF = m.userData.i === front, isH = m === hoverMesh;
        u.dim.value += ((isF ? 1 : 0.66) - u.dim.value) * 0.1;
        u.glitch.value += (gMotion * (isF ? 0.7 : 1) - u.glitch.value) * 0.15;
        u.time.value = t;
        m.userData.sc += ((isH ? 1.22 : isF ? 1.14 : 0.84) - m.userData.sc) * 0.12;
        m.scale.setScalar(m.userData.sc);
        m.userData.rv += ((isH ? 1 : isF ? 0.5 : 0) - m.userData.rv) * 0.12;
        u.reveal.value = m.userData.rv;
        if (isH && hit.uv) u.mouse.value.lerp(hit.uv, 0.4);
      });
      rn.render(scene, cam);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(swapId);
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointerup", up);
      cards.forEach((m) => { m.geometry.dispose(); m.material.uniforms.map.value.dispose(); m.material.dispose(); });
      rn.dispose();
      canvas.remove();
    };
  });
})();
