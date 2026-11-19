(() => {
  const VERT = `
    uniform float uSpeed;
    uniform float uBend;
    uniform float uLean;
    uniform float uSway;
    varying vec2 vUv;
    const float PI = 3.141592653589793;
    void main() {
      vUv = uv;
      vec3 world = (modelMatrix * vec4(position, 1.0)).xyz;
      vec4 view = viewMatrix * modelMatrix * vec4(position.xy, sin(uv.x * PI) * uBend, 1.0);
      view.x += world.y * world.y * uLean + sin(uv.y * PI) * uSpeed * uSway;
      gl_Position = projectionMatrix * view;
    }`;
  const FRAG = `
    uniform sampler2D uMap;
    uniform vec2 uPlane;
    uniform vec2 uImage;
    uniform vec2 uView;
    uniform vec3 uShade;
    uniform vec3 uFade;
    uniform float uDark;
    uniform float uZoom;
    uniform float uReveal;
    uniform float uEdge;
    varying vec2 vUv;
    float roundBox(vec2 p, vec2 size, float r) {
      vec2 q = abs(p - 0.5) - size * 0.5 + r;
      return length(max(q, 0.0)) - r;
    }
    void main() {
      vec2 fit = vec2(min((uPlane.x / uPlane.y) / (uImage.x / uImage.y), 1.0), min((uPlane.y / uPlane.x) / (uImage.y / uImage.x), 1.0));
      vec2 uv = vUv * fit + (1.0 - fit) * 0.5;
      vec3 col;
      if (gl_FrontFacing) {
        col = mix(texture2D(uMap, (uv - 0.5) / uZoom + 0.5).rgb, uShade, uDark);
      } else {
        float o = 40.0 / 1024.0;
        vec3 acc = vec3(0.0);
        for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) {
          float w = (x == 0 ? 2.0 : 1.0) * (y == 0 ? 2.0 : 1.0);
          acc += texture2D(uMap, uv + vec2(float(x), float(y)) * o).rgb * w;
        }
        col = acc / 16.0;
      }
      float r = clamp(uReveal, 0.0, 1.0);
      float alpha = (1.0 - smoothstep(0.0, 0.002, roundBox(vUv, vec2(r), 0.05 * r))) * smoothstep(0.1, 1.0, uReveal);
      float sy = gl_FragCoord.y / uView.y;
      float edge = clamp(clamp((uEdge - sy) / uEdge, 0.0, 1.0) + clamp((sy - 1.0 + uEdge) / uEdge, 0.0, 1.0), 0.0, 1.0);
      gl_FragColor = vec4(mix(col, uFade, edge), alpha);
    }`;

  // Skin variable to shader color — when the skin changes, shade and edge colors change too
  const colorOf = (el, name, fallbackVar) => {
    const probe = document.createElement("i");
    probe.style.color = `var(${name}, var(${fallbackVar}))`;
    el.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    const g = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
    g.fillStyle = c;
    g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255);
  };

  kfFx.register("helix-plane-wheel", (el, { options, reduce, hover }) => {
    const imgs = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!imgs.length || !window.THREE) return;
    const num = (k, d) => +(options[k] ?? d);
    const vgap = num("vgap", 0.5), angle = num("angle", 0.85), radius = num("radius", 2), drop = num("drop", 0.8);
    const wheel = num("wheel", 15e-5), drift = num("drift", 0.002), follow = num("follow", 0.1), decay = num("decay", 0.9);
    const fovWide = num("fov", 35), fovNarrow = num("fov-narrow", 45), camZ = num("cam", 8), stagger = num("stagger", 50);
    const dark = num("dark", 0.55), zoom = num("zoom", 0.05), bend = num("bend", 0.2), lean = num("lean", 0.1), sway = num("sway", 2), edgeBand = num("edge", 0.2);
    const repeat = Math.max(1, Math.round(num("repeat", 2)));

    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.append(canvas);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, stencil: false });
    } catch (e) {
      canvas.remove();
      return;
    }
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fovWide, 1, 0.1, 100);
    camera.position.set(0, 0, camZ);
    const view = new THREE.Vector2(1, 1);
    const shade = colorOf(el, "--fx-shade", "--kf-bg");
    const fade = colorOf(el, "--fx-fade", "--kf-line");

    const textures = imgs.map((img) => {
      const t = new THREE.Texture(img);
      const ready = () => { t.needsUpdate = true; t.userData.ok = true; };
      if (img.complete && img.naturalWidth) ready(); else img.addEventListener("load", ready, { once: true });
      return t;
    });
    const geo = new THREE.PlaneGeometry(1, 1, 8, 8);
    const list = Array.from({ length: imgs.length * repeat }, (_, i) => i % imgs.length);
    const COUNT = list.length, CENTER = Math.floor(COUNT / 2);
    const planes = list.map((k, index) => {
      const img = imgs[k];
      const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, side: THREE.DoubleSide,
        uniforms: {
          uMap: { value: textures[k] }, uPlane: { value: new THREE.Vector2(1.7, 1) }, uImage: { value: new THREE.Vector2(img.naturalWidth || 16, img.naturalHeight || 9) },
          uView: { value: view }, uShade: { value: shade }, uFade: { value: fade }, uEdge: { value: edgeBand },
          uDark: { value: 0 }, uZoom: { value: 1 }, uReveal: { value: 0 }, uSpeed: { value: 0 }, uBend: { value: bend }, uLean: { value: lean }, uSway: { value: sway },
        },
      }));
      mesh.scale.set(1.7, 1, 1);
      mesh.visible = false;
      scene.add(mesh);
      return { mesh, img, k, index, isHidden: true, hidden: 1, hiddenT: 1, hovered: false, hover: 0, hoverT: 0 };
    });

    const ctl = { target: 0, delta: 0, scroll: 0, dir: 1, mouse: new THREE.Vector2(-9, -9), inside: false };
    const size = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < 900 ? fovNarrow : fovWide;
      camera.updateProjectionMatrix();
      renderer.getDrawingBufferSize(view);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const ray = new THREE.Raycaster();
    let hovered = null;
    const setHover = (pl) => {
      if (pl === hovered) return;
      if (hovered) { hovered.hovered = false; hovered.hoverT = 0; }
      hovered = pl;
      el.style.cursor = pl ? "pointer" : "";
      if (pl) { pl.hovered = true; pl.hoverT = 1; }
      el.dispatchEvent(new CustomEvent("fx:hover", { detail: pl ? { index: pl.k, el: pl.img } : null }));
    };
    const pick = () => {
      ray.setFromCamera(ctl.mouse, camera);
      const hit = ray.intersectObjects(planes.map((p) => p.mesh))[0];
      if (!hit) return null;
      const pl = planes.find((p) => p.mesh === hit.object);
      const facing = hit.face.normal.clone().transformDirection(pl.mesh.matrixWorld).dot(ray.ray.direction) < 0;
      return facing && pl.hidden < 0.01 ? pl : null;
    };
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
    const reveal = () => planes.forEach((pl, i) => later(() => { pl.isHidden = false; pl.hiddenT = 0; }, reduce ? 0 : (i % 4) * stagger));
    const hide = () => { planes.forEach((pl, i) => later(() => { pl.isHidden = true; pl.hiddenT = 1; }, reduce ? 0 : (i % 4) * stagger * 0.6)); setHover(null); };

    const onWheel = (e) => {
      if (!ctl.inside) return;
      ctl.target = Math.max(-2, Math.min(2, ctl.target + e.deltaY * wheel));
      ctl.dir = e.deltaY > 0 ? 1 : -1;
    };
    const onMove = (e) => {
      const b = el.getBoundingClientRect();
      ctl.inside = e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
      ctl.mouse.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    };
    const onLeave = () => { ctl.inside = false; ctl.mouse.set(-9, -9); };
    const onClick = () => {
      if (!hovered) return;
      el.dispatchEvent(new CustomEvent("fx:pick", { detail: { index: hovered.k, el: hovered.img } }));
    };
    // Touch: rotate only when dragged more than 8px horizontally — vertical pushes go to the page
    let tx = 0, lastX = 0, vx = 0, dragging = false;
    const onTouchStart = (e) => { tx = lastX = e.touches[0].clientX; vx = 0; dragging = false; };
    const onTouchMove = (e) => {
      const x = e.touches[0].clientX;
      if (!dragging && Math.abs(x - tx) > 8) dragging = true;
      if (dragging) {
        const m = -(x - lastX) * 0.5;
        ctl.target = Math.max(-2, Math.min(2, ctl.target - m * 0.003));
        ctl.dir = m < 0 ? 1 : -1;
        vx = m;
      }
      lastX = x;
    };
    const onTouchEnd = () => { if (dragging) ctl.target = Math.max(-2, Math.min(2, ctl.target - vx * 0.002)); dragging = false; };
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("click", onClick);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("fx:hide", hide);
    el.addEventListener("fx:show", reveal);

    let raf = 0, last = 0;
    const tick = (now) => {
      const dt = last ? Math.min(Math.max(1, now - last), 50) : 16;
      last = now;
      if (!reduce) {
        ctl.delta += (ctl.target - ctl.delta) * follow;
        ctl.scroll += ctl.delta;
        if (Math.abs(ctl.target) < drift) ctl.target = ctl.dir * drift;
        ctl.target *= decay;
      }
      if (hover && ctl.inside) setHover(pick());
      for (const pl of planes) {
        const hb = pl.hovered ? 0.09 : 0.07;
        pl.hover += (pl.hoverT - pl.hover) * (reduce ? 1 : 1 - Math.pow(1 - hb, dt * 0.2));
        pl.hidden += (pl.hiddenT - pl.hidden) * (reduce ? 1 : 1 - Math.pow(0.95, dt * 0.15));
        const g = pl.isHidden ? 1.5 : -1.5;
        let n = pl.index - ctl.scroll;
        n = ((n % COUNT) + COUNT) % COUNT;
        const b = n - CENTER, a = b * angle, r = radius * (1 - pl.hidden / 2);
        pl.mesh.position.set(Math.cos(a) * r, b * vgap - drop - pl.hidden * g, Math.sin(a) * r);
        pl.mesh.rotation.y = -a + Math.PI / 2;
        const u = pl.mesh.material.uniforms;
        pl.mesh.visible = !!textures[pl.k].userData.ok;
        if (pl.mesh.visible) u.uImage.value.set(pl.img.naturalWidth, pl.img.naturalHeight);
        u.uDark.value = dark * pl.hover;
        u.uZoom.value = 1 + zoom * pl.hover;
        u.uReveal.value = (1 - pl.hover * 0.05) * (1 - pl.hidden);
        u.uSpeed.value = ctl.delta;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    if (options.start !== "hidden") later(reveal, reduce ? 0 : num("delay", 200));

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      ro.disconnect();
      removeEventListener("wheel", onWheel);
      removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("click", onClick);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("fx:hide", hide);
      el.removeEventListener("fx:show", reveal);
      planes.forEach((p) => p.mesh.material.dispose());
      textures.forEach((t) => t.dispose());
      geo.dispose();
      renderer.dispose();
      canvas.remove();
      el.style.cursor = "";
    };
  });
})();
