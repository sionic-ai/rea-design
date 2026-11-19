// Opening a WebGL context per element gets blocked at sixteen, so put each element’s text image on one screen-fixed plate
(() => {
  let stage = null;
  const FRAG = `
    precision highp float;
    uniform sampler2D uTex;
    uniform vec2 uRes;
    uniform float uReveal, uConceal, uAmp, uFeather;
    varying vec2 vUv;
    float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
    float vnoise(vec2 p) {
      vec2 c = floor(p), f = fract(p), w = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(c), hash(c + vec2(1.0, 0.0)), w.x), mix(hash(c + vec2(0.0, 1.0)), hash(c + 1.0), w.x), w.y);
    }
    void main() {
      vec4 col = texture2D(uTex, vUv);
      vec2 px = vUv * uRes;
      float tear = 0.5 * vnoise(px / 70.0) + 0.32 * vnoise(px / 24.0) + 0.18 * vnoise(px / 9.0);
      float travel = uRes.x + uAmp + uFeather;
      float edge = px.x + tear * uAmp;
      float shown = smoothstep(edge - uFeather, edge, uReveal * travel - uFeather);
      float eaten = uConceal > 0.0 ? smoothstep(edge - uFeather, edge, uConceal * travel - uFeather) : 0.0;
      gl_FragColor = vec4(col.rgb, col.a * shown * (1.0 - eaten));
    }`;
  const VERT = "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";

  const makeStage = () => {
    if (!window.THREE) return null;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false }); } catch { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0, 0);
    renderer.domElement.className = "fx-tw-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    document.body.append(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10);
    const geo = new THREE.PlaneGeometry(1, 1);
    const fit = () => { renderer.setSize(innerWidth, innerHeight); Object.assign(cam, { right: innerWidth, bottom: -innerHeight }); cam.updateProjectionMatrix(); };
    fit();
    addEventListener("resize", fit);
    const planes = new Set();
    const draw = () => {
      planes.forEach((p) => {
        const r = p.el.getBoundingClientRect();
        const u = p.mesh.material.uniforms;
        const on = p.ready && r.bottom > -p.py && r.top < innerHeight + p.py && u.uReveal.value > 0 && u.uConceal.value < 1;
        p.mesh.visible = on;
        if (!on) return;
        const w = r.width + p.px * 2, h = r.height + p.py * 2;
        p.mesh.scale.set(w, h, 1);
        p.mesh.position.set(r.left - p.px + w / 2, -(r.top - p.py + h / 2), 0);
        u.uRes.value.set(w, h);
      });
      renderer.render(scene, cam);
    };
    gsap.ticker.add(draw);
    return {
      scene, geo, planes,
      drop(p) {
        planes.delete(p);
        scene.remove(p.mesh);
        p.mesh.material.dispose();
        p.mesh.material.uniforms.uTex.value.dispose();
        if (planes.size) return;
        gsap.ticker.remove(draw);
        removeEventListener("resize", fit);
        renderer.domElement.remove();
        renderer.dispose();
        geo.dispose();
        stage = null;
      },
    };
  };

  // Copy text onto the canvas: a tilted child briefly undoes its tilt, measures its position, then draws with the same tilt
  const raster = (p, canvas) => {
    const el = p.el;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    el.classList.remove("fx-tw-on");
    el.classList.add("fx-tw-measure");
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
    p.px = Math.ceil(fs * 0.35);
    p.py = Math.ceil(fs * 0.2);
    canvas.width = Math.ceil((r.width + p.px * 2) * dpr);
    canvas.height = Math.ceil((r.height + p.py * 2) * dpr);
    const g = canvas.getContext("2d");
    const ox = r.left - p.px, oy = r.top - p.py;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node; (node = walker.nextNode());) {
      const host = node.parentElement;
      const cs = getComputedStyle(host);
      if (cs.visibility === "hidden" || cs.display === "none" || !node.data.trim()) continue;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const tilt = host.closest('[data-fx-part="tilt"]');
      if (tilt && el.contains(tilt)) {
        const b = tilt.getBoundingClientRect();
        const cx = b.left + b.width / 2 - ox, cy = b.top + b.height / 2 - oy;
        g.translate(cx, cy);
        g.transform(1, 0, Math.tan((+(tilt.dataset.skew ?? -7) * Math.PI) / 180), 1, 0, 0);
        g.translate(-cx, -cy);
      }
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      g.fillStyle = cs.color;
      const ascent = g.measureText("Hg").fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * 0.8;
      const upper = cs.textTransform === "uppercase";
      for (const m of node.data.matchAll(/\S+/g)) {
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        const wr = range.getClientRects()[0];
        if (wr) g.fillText(upper ? m[0].toUpperCase() : m[0], wr.left - ox, wr.top - oy + ascent);
      }
    }
    el.classList.remove("fx-tw-measure");
    el.classList.add("fx-tw-on");
    return true;
  };

  kfFx.register("tear-wipe-text", (el, { options, reduce }) => {
    if (!el.textContent.trim()) return;
    const dur = +(options.dur ?? 2);
    const manual = options.manual != null && options.manual !== "false";
    if (reduce) return;
    stage ||= makeStage();
    const st = { r: 0, c: 0 };
    let tween = null;
    if (!stage) {
      // Without WebGL, leave the text as is and use opacity only
      const paint = () => (el.style.opacity = String(st.r * (1 - st.c)));
      paint();
      const play = (key, to, d) => { tween?.kill(); tween = gsap.to(st, { [key]: to, duration: d, ease: "none", onUpdate: paint }); };
      const onR = (e) => play("r", 1, e.detail ?? dur), onC = (e) => play("c", 1, e.detail ?? dur);
      el.addEventListener("fx:reveal", onR);
      el.addEventListener("fx:conceal", onC);
      const stF = manual ? null : ScrollTrigger.create({ trigger: el, start: options.start || "top 90%", once: true, onEnter: () => play("r", 1, dur) });
      return () => { tween?.kill(); stF?.kill(); el.removeEventListener("fx:reveal", onR); el.removeEventListener("fx:conceal", onC); el.style.opacity = ""; };
    }
    const canvas = document.createElement("canvas");
    const tex = new THREE.CanvasTexture(canvas);
    // ShaderMaterial doesn’t change color space, so use canvas values as they are (leaving it as sRGB decodes once more and darkens)
    tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    const uniforms = {
      uTex: { value: tex }, uRes: { value: new THREE.Vector2(1, 1) },
      uReveal: { value: 0 }, uConceal: { value: 0 },
      uAmp: { value: +(options.amp ?? 480) }, uFeather: { value: +(options.feather ?? 24) },
    };
    const mesh = new THREE.Mesh(stage.geo, new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false }));
    mesh.visible = false;
    stage.scene.add(mesh);
    const p = { el, mesh, px: 0, py: 0, ready: false };
    stage.planes.add(p);
    const redraw = () => { if (raster(p, canvas)) { tex.needsUpdate = true; p.ready = true; } };
    let lastW = 0;
    const ro = new ResizeObserver(([e]) => { const w = Math.round(e.contentRect.width); if (w && (w !== lastW || !p.ready)) { lastW = w; redraw(); } });
    ro.observe(el);
    document.fonts?.ready.then(() => p.ready && redraw());
    const sync = () => { uniforms.uReveal.value = st.r; uniforms.uConceal.value = st.c; };
    const play = (key, d) => { tween?.kill(); tween = gsap.to(st, { [key]: 1, duration: d, ease: "none", onUpdate: sync }); };
    const onR = (e) => play("r", e.detail ?? dur), onC = (e) => play("c", e.detail ?? dur);
    el.addEventListener("fx:reveal", onR);
    el.addEventListener("fx:conceal", onC);
    const trig = manual ? null : ScrollTrigger.create({ trigger: el, start: options.start || "top 90%", once: true, onEnter: () => play("r", dur) });
    const s = stage;
    return () => {
      tween?.kill();
      trig?.kill();
      ro.disconnect();
      el.removeEventListener("fx:reveal", onR);
      el.removeEventListener("fx:conceal", onC);
      el.classList.remove("fx-tw-on", "fx-tw-measure");
      s.drop(p);
    };
  });
})();
