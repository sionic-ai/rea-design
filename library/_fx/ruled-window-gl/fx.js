// Hovering over a photo opens a window where several droplets have melted together along the hand’s path, and through it a background-color grid paper (20px cells · 1px rules) shows.
// The same touch pushes the ripple ring outward on photos, bending the photo — the blob fills in .22s and settles in 1.5s, and the window edge undulates with noise (brand).
// Even with more than ten photos on a page, use one WebGL context — one fixed canvas on screen with a plane per photo.
(() => {
  const VERT = `precision highp float;
attribute vec3 position; attribute vec2 uv;
uniform mat4 modelViewMatrix, projectionMatrix;
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const N = 16;
  const FRAG = `precision highp float;
uniform sampler2D uTex;
uniform vec2 uSize, uPicPos, uPicSize;
uniform vec4 uTrail[${N}];
uniform float uTime, uOn, uClip;
uniform vec4 uWave;
uniform float uRise, uBend, uGrow, uFade, uSoft, uWob, uWobScale, uWobRate, uCell, uLine;
uniform vec3 uPaper, uInk;
varying vec2 vUv;
float h21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec3 photo(vec2 p){ vec2 t = (p - uPicPos) / uPicSize; return texture2D(uTex, vec2(t.x, 1.0 - t.y)).rgb; }
void main(){
  vec2 q = vec2(vUv.x, 1.0 - vUv.y);
  if (q.x < uClip || q.y < uClip || q.x > 1.0 - uClip || q.y > 1.0 - uClip) discard;
  vec2 p = q * uSize;
  if (uOn < 0.001) { gl_FragColor = vec4(photo(p), 1.0); return; }
  vec2 cells = max(vec2(1.0), floor(uSize / uCell + 0.5));
  vec2 m = mod(p, uSize / cells);
  float ruled = max(max(step(m.x, uLine), step(m.y, uLine)), max(step(uSize.x - uLine, p.x), step(uSize.y - uLine, p.y)));
  vec3 paper = mix(uPaper, uInk, ruled);
  vec2 w = p / uWobScale; float t = uTime * uWobRate;
  vec2 off = vec2(vnoise(w + vec2(t, t * 0.7)), vnoise(w + vec2(4.7, 8.3) - vec2(t * 0.8, t * 0.5))) - 0.5;
  off += (vec2(vnoise(w * 2.4 - vec2(t * 1.3, 0.0)), vnoise(w * 2.4 + vec2(9.1, 2.2) + vec2(0.0, t * 1.1))) - 0.5) * 0.5;
  vec2 at = p + off * uWob;
  float field = 0.0; vec2 push = vec2(0.0);
  for (int i = 0; i < ${N}; i++) {
    vec4 d = uTrail[i]; float age = uTime - d.z;
    if (d.w <= 0.0 || age < 0.0) continue;
    vec2 v = at - d.xy; float r2 = max(dot(v, v), 1.0);
    if (i == 0) field += d.w * d.w / r2;
    else if (age < uFade) { float r = d.w * min(1.0, age / uGrow) * pow(1.0 - age / uFade, 2.0); field += r * r / r2; }
    float len = length(v);
    if (i > 0 && len > 0.001 && age < 4.0) {
      float x = len - age * uWave.x, k = 6.2831853 / uWave.y, sw = uWave.z * uWave.z;
      float slope = (k * cos(x * k) - sin(x * k) * 2.0 * x / sw) * exp(-x * x / sw);
      push += v / len * slope * (1.0 - exp(-age / uRise)) * exp(-age * uWave.w) * uBend;
    }
  }
  float open = smoothstep(1.0 - uSoft, 1.0 + uSoft, field) * uOn;
  gl_FragColor = vec4(mix(photo(p + push * uOn), paper, open), 1.0);
}`;

  // Shared stage — created when the first photo attaches and removed when the last photo drops
  const stage = { renderer: null, gl: null, camera: null, scene: null, items: new Set(), tick: null };
  function openStage() {
    if (stage.renderer) return stage;
    const O = window.OGL;
    let renderer;
    try { renderer = new O.Renderer({ dpr: Math.min(2, devicePixelRatio || 1), alpha: true, premultipliedAlpha: false, antialias: false }); } catch (e) { return null; }
    const gl = renderer.gl;
    if (!gl) return null;
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.className = "fx-ruled-stage";
    gl.canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(gl.canvas);
    Object.assign(stage, { renderer, gl, camera: new O.Camera(gl, { near: -1000, far: 1000 }), scene: new O.Transform() });
    const size = () => {
      renderer.setSize(innerWidth, innerHeight);
      stage.camera.orthographic({ left: -innerWidth / 2, right: innerWidth / 2, top: innerHeight / 2, bottom: -innerHeight / 2 });
    };
    size();
    stage.size = size;
    addEventListener("resize", size);
    stage.tick = () => { stage.items.forEach((it) => it.update()); renderer.render({ scene: stage.scene, camera: stage.camera }); };
    gsap.ticker.add(stage.tick);
    return stage;
  }
  function closeStage() {
    if (stage.items.size || !stage.renderer) return;
    gsap.ticker.remove(stage.tick);
    removeEventListener("resize", stage.size);
    stage.gl.canvas.remove();
    stage.gl.getExtension("WEBGL_lose_context")?.loseContext();
    Object.assign(stage, { renderer: null, gl: null, camera: null, scene: null, tick: null });
  }

  const rgb = (value) => {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = value || "transparent";
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  };
  const cssVar = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();

  // If the photo is still a placeholder (.wf-img), the same shape (background, two diagonals, label) is drawn on a canvas and applied to the plate — when the skin changes, reattaching uses that color
  function paintPlaceholder(pic, host) {
    const r = pic.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.max(2, Math.min(2048, Math.round(r.width * dpr))), h = Math.max(2, Math.min(2048, Math.round(r.height * dpr)));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d"), cs = getComputedStyle(pic), tag = getComputedStyle(pic, "::after");
    const fill = rgb(cs.backgroundColor)[3] > 0 ? cs.backgroundColor : cssVar(host, "--kf-raised");
    x.fillStyle = fill; x.fillRect(0, 0, w, h);
    x.strokeStyle = cs.borderTopColor || cssVar(host, "--kf-line");
    x.lineWidth = dpr;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke();
    const label = pic.getAttribute("data-label");
    if (label) {
      x.font = `${tag.fontWeight || 500} ${parseFloat(tag.fontSize || 12) * dpr}px ${tag.fontFamily || "monospace"}`;
      x.textAlign = "center"; x.textBaseline = "middle";
      const tw = x.measureText(label).width, ph = 12 * 1.2 * dpr + 0.7 * 12 * dpr;
      x.fillStyle = tag.backgroundColor && rgb(tag.backgroundColor)[3] > 0 ? tag.backgroundColor : fill;
      x.fillRect(w / 2 - tw / 2 - 8.4 * dpr, h / 2 - ph / 2, tw + 16.8 * dpr, ph);
      x.fillStyle = tag.color || cssVar(host, "--kf-dim");
      x.fillText(label, w / 2, h / 2);
    }
    return c;
  }

  kfFx.register("ruled-window-gl", (el, { options, reduce, hover }) => {
    const O = window.OGL;
    const pic = el.querySelector('[data-fx-part="picture"]');
    if (!O || !pic || reduce || !hover) return;
    const s = openStage();
    if (!s) return;
    const num = (k, d) => +(options[k] ?? d);
    const opt = {
      cell: num("cell", 20), line: num("line", 1), size: num("size", 96), hold: num("hold", 0.62), every: num("every", 10) || 10,
      glide: num("glide", 0.17), swell: num("swell", 0.22) || 0.22, sink: num("sink", 1.5) || 1.5, edge: num("edge", 0.035),
      speed: num("ring-speed", 300), wave: num("ring-wave", 105) || 105, width: num("ring-width", 75) || 75, fade: num("ring-fade", 1.15), rise: num("ring-rise", 0.1) || 0.1,
      bend: num("bend", 26), wobble: num("wobble", 44), wobbleSize: num("wobble-size", 105) || 105, wobbleSpeed: num("wobble-speed", 0.5),
      wake: num("wake", 0.3), sleep: num("sleep", 0.55), base: num("base", 0),
    };
    const scale = () => (opt.base ? innerWidth / opt.base : 1);
    const tex = new O.Texture(s.gl, { generateMipmaps: false });
    const img = pic.tagName === "IMG" ? pic : pic.querySelector("img");
    const load = () => {
      if (img && (img.currentSrc || img.src)) {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.onload = () => { tex.image = im; el.classList.add("fx-ruled-on"); };
        im.src = img.currentSrc || img.src;
      } else {
        tex.image = paintPlaceholder(pic, el);
        el.classList.add("fx-ruled-on");
      }
    };
    const paper = rgb(cssVar(el, "--kf-bg") || "Canvas"), ink = rgb(cssVar(el, "--kf-line") || "GrayText");
    const U = {
      uTex: { value: tex }, uSize: { value: [1, 1] }, uPicPos: { value: [0, 0] }, uPicSize: { value: [1, 1] },
      uTrail: { value: Array.from({ length: N }, () => [0, 0, -99, 0]) }, uTime: { value: 0 }, uOn: { value: 0 }, uClip: { value: 0 },
      uWave: { value: [1, 1, 1, 1] }, uRise: { value: opt.rise }, uBend: { value: 1 }, uGrow: { value: opt.swell }, uFade: { value: opt.sink },
      uSoft: { value: opt.edge }, uWob: { value: 1 }, uWobScale: { value: 1 }, uWobRate: { value: opt.wobbleSpeed },
      uCell: { value: 1 }, uLine: { value: 1 }, uPaper: { value: paper.slice(0, 3) }, uInk: { value: ink.slice(0, 3) },
    };
    const program = new O.Program(s.gl, { vertex: VERT, fragment: FRAG, uniforms: U, transparent: true });
    const mesh = new O.Mesh(s.gl, { geometry: new O.Plane(s.gl), program });
    mesh.setParent(s.scene);
    const st = { here: null, glide: null, last: null, drops: [], now: Math.random() * 90 };
    const local = (e) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const wake = (on) => gsap.to(U.uOn, { value: on ? 1 : 0, duration: on ? opt.wake : opt.sleep, ease: on ? "power2.out" : "power2.inOut", overwrite: true });
    const enter = () => wake(true);
    const leave = () => { st.here = st.glide = st.last = null; wake(false); };
    const move = (e) => {
      const p = local(e);
      st.here = p;
      if (!st.last) { st.last = p; return; }
      if (Math.hypot(p.x - st.last.x, p.y - st.last.y) < opt.every * scale()) return;
      st.drops.push({ x: p.x, y: p.y, at: st.now, force: opt.size * scale() });
      if (st.drops.length > N - 1) st.drops.shift();
      st.last = p;
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointermove", move);
    const item = {
      update() {
        const r = el.getBoundingClientRect();
        mesh.visible = r.bottom > -100 && r.top < innerHeight + 100 && r.width > 0;
        if (!mesh.visible) return;
        mesh.scale.set(r.width, r.height, 1);
        mesh.position.set(r.left + r.width / 2 - innerWidth / 2, -(r.top + r.height / 2 - innerHeight / 2), 0);
        const pr = pic.getBoundingClientRect(), k = scale();
        st.now += 1 / 60;
        U.uSize.value = [r.width, r.height];
        U.uPicPos.value = [pr.left - r.left, pr.top - r.top];
        U.uPicSize.value = [pr.width || 1, pr.height || 1];
        U.uClip.value = +(el.dataset.open || 0) / 100;
        U.uTime.value = st.now;
        U.uWave.value = [opt.speed * k, opt.wave * k, opt.width * k, opt.fade];
        U.uBend.value = opt.bend * k;
        U.uWob.value = opt.wobble * k;
        U.uWobScale.value = opt.wobbleSize * k;
        U.uCell.value = opt.cell * k;
        U.uLine.value = Math.max(1, opt.line * k);
        if (st.here) {
          st.glide = st.glide || { ...st.here };
          st.glide.x += (st.here.x - st.glide.x) * opt.glide;
          st.glide.y += (st.here.y - st.glide.y) * opt.glide;
        }
        const T = U.uTrail.value;
        T[0] = st.glide ? [st.glide.x, st.glide.y, st.now, opt.size * opt.hold * k] : [0, 0, -99, 0];
        for (let i = 1; i < N; i++) { const d = st.drops[i - 1]; T[i] = d ? [d.x, d.y, d.at, d.force] : [0, 0, -99, 0]; }
      },
    };
    s.items.add(item);
    if (document.fonts?.status === "loading") document.fonts.ready.then(load); else load();
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointermove", move);
      gsap.killTweensOf(U.uOn);
      el.classList.remove("fx-ruled-on");
      s.items.delete(item);
      mesh.setParent(null);
      closeStage();
    };
  });
})();
