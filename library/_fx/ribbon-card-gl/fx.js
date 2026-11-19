// Redraws the card row as a screen-pinned WebGL plane — card positions follow the DOM, and by scroll velocity V (-1..1, full at 40px/frame)
// Edges twist (twist .32rad) and sag like cloth (sag .14 × height), and on reaching 92% of the screen a rolled paper unrolls downward (1.2s reveal curve).
// On hover the spot presses down in a Gaussian shape (.38s power3.out, .3s power2.inOut on release). The photo (data-fx-part=photo) If it is an img, that image is baked in, otherwise the card background color + label text is baked in.
(() => {
  kfFx.register("ribbon-card-gl", (el, { options, reduce }) => {
    const T = window.THREE;
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (reduce || !T || !window.gsap || !window.ScrollTrigger || !cards.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const twist = +(options.twist ?? 0.32), sag = +(options.sag ?? 0.14), dent = +(options.dent ?? 0.07), roll = +(options.roll ?? 1.2), full = +(options.speed || 40);
    const ease = kfFx.ease(options.ease || "0.18,0.66,0.18,1", "power3.out");
    let renderer;
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true }); } catch { return; }
    const canvas = renderer.domElement;
    canvas.className = "fx-ribbon-gl";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new T.Scene(), FOV = 35, camera = new T.PerspectiveCamera(FOV, 1, 10, 10000);
    const size = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.position.z = innerHeight / 2 / Math.tan((FOV * Math.PI) / 360); camera.updateProjectionMatrix(); };
    size();
    addEventListener("resize", size);
    const vert = `
      uniform vec2 uRes; uniform float uV, uTwist, uSag, uRoll, uRollR, uHover, uDent, uDentR; uniform vec2 uMouse;
      varying vec2 vUv; varying float vZ;
      void main() {
        vUv = uv; vec2 c = uv - 0.5; vec3 p = vec3(c * uRes, 0.0);
        float front = 1.0 - uRoll;
        if (uv.y < front) { float a = min((front - uv.y) * uRes.y / uRollR, 3.14159); p.y = (front - 0.5) * uRes.y - sin(a) * uRollR; p.z = uRollR - cos(a) * uRollR; }
        float tw = uTwist * uV * c.x * 2.0, y = p.y, z = p.z;
        p.y = y * cos(tw) - z * sin(tw); p.z = y * sin(tw) + z * cos(tw);
        float bow = 1.0 - 4.0 * c.x * c.x;
        p.z -= uSag * abs(uV) * bow * uRes.y; p.y -= uSag * uV * 0.35 * bow * uRes.y;
        vec2 dm = (uv - uMouse) * uRes / uRes.y; p.z -= uHover * uDent * exp(-dot(dm, dm) / (uDentR * uDentR));
        vZ = p.z / uRes.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`;
    const frag = `
      uniform sampler2D uTex; uniform vec2 uRes; uniform float uRad; varying vec2 vUv; varying float vZ;
      void main() {
        vec2 px = vUv * uRes, q = min(px, uRes - px);
        if (q.x < uRad && q.y < uRad && length(vec2(uRad) - q) > uRad) discard;
        vec4 col = texture2D(uTex, vUv); col.rgb *= clamp(1.0 + vZ * 1.6, 0.55, 1.15); gl_FragColor = col;
      }`;
    const bake = (card) => {
      const photo = card.querySelector('[data-fx-part="photo"]');
      if (photo && photo.tagName === "IMG" && photo.complete && photo.naturalWidth) { const t = new T.Texture(photo); t.needsUpdate = true; t.colorSpace = T.SRGBColorSpace; return t; }
      const c = document.createElement("canvas"); c.width = 960; c.height = 540;
      const g = c.getContext("2d"), cs = getComputedStyle(card);
      g.fillStyle = cs.backgroundColor; g.fillRect(0, 0, 960, 540);
      g.fillStyle = cs.color; g.font = `500 24px ${cs.fontFamily}`;
      ((photo && photo.dataset.label) || "").match(/.{1,30}/g)?.forEach((ln, k) => g.fillText(ln, 40, 460 + k * 32));
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
    };
    const geo = new T.PlaneGeometry(1, 1, 48, 32);
    const sts = [], offs = [];
    const items = cards.map((card) => {
      const U = { uTex: { value: bake(card) }, uRes: { value: new T.Vector2(1, 1) }, uV: { value: 0 }, uTwist: { value: twist }, uSag: { value: sag }, uRoll: { value: 0 }, uRollR: { value: 40 },
        uHover: { value: 0 }, uMouse: { value: new T.Vector2(0.5, 0.5) }, uDent: { value: 40 }, uDentR: { value: 0.35 }, uRad: { value: parseFloat(getComputedStyle(card).borderRadius) || 0 } };
      const mesh = new T.Mesh(geo, new T.ShaderMaterial({ uniforms: U, vertexShader: vert, fragmentShader: frag, transparent: true, depthTest: false, side: T.DoubleSide }));
      mesh.frustumCulled = false;
      scene.add(mesh);
      card.classList.add("fx-is-gl");
      const hv = { v: 0 }, rl = { v: 0 };
      sts.push(ScrollTrigger.create({ trigger: card, start: "top 92%", once: true, onEnter: () => gsap.to(rl, { v: 1, duration: roll, ease }) }));
      const move = (e) => { const r = card.getBoundingClientRect(); U.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height); };
      const on = () => gsap.to(hv, { v: 1, duration: 0.38, ease: "power3.out", overwrite: true });
      const off = () => gsap.to(hv, { v: 0, duration: 0.3, ease: "power2.inOut", overwrite: true });
      card.addEventListener("pointermove", move); card.addEventListener("pointerenter", on); card.addEventListener("pointerleave", off);
      offs.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerenter", on); card.removeEventListener("pointerleave", off); card.classList.remove("fx-is-gl"); U.uTex.value.dispose(); mesh.material.dispose(); });
      return { card, mesh, U, hv, rl };
    });
    let V = 0, last = scrollY;
    const tick = () => {
      const vel = scrollY - last;
      last = scrollY;
      V += (Math.max(-1, Math.min(1, vel / full)) - V) * 0.1;
      const b = el.getBoundingClientRect();
      if (b.bottom < -200 || b.top > innerHeight + 200) { canvas.style.visibility = "hidden"; return; }
      canvas.style.visibility = "";
      for (const it of items) {
        const r = it.card.getBoundingClientRect();
        it.mesh.position.set(r.left + r.width / 2 - innerWidth / 2, innerHeight / 2 - (r.top + r.height / 2), 0);
        it.U.uRes.value.set(r.width, r.height); it.U.uRollR.value = r.height * 0.08; it.U.uDent.value = r.height * dent;
        it.U.uV.value = V; it.U.uRoll.value = it.rl.v; it.U.uHover.value = it.hv.v;
      }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); removeEventListener("resize", size); sts.forEach((s) => s.kill()); offs.forEach((f) => f()); geo.dispose(); renderer.dispose(); canvas.remove(); };
  });
})();
