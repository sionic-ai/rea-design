// Draws one big letter onto a WebGL plane, and when the cursor enters, the letter around the cursor breaks into 40×40 cell pieces and scatters outward.
// The whole text also shifts slightly away from the cursor (up to 12% of the panel size), then returns with elasticity (elastic.out(1.4,2) .75s) when the cursor leaves.
(() => {
  const VERT = "attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}";
  const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D tMap;
uniform vec2 uMouse;
uniform vec2 uRes;
uniform vec2 uShift;
uniform float uAmt;
uniform float uCells;
uniform float uRadius;
float rnd(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.743); }
vec4 pick(vec2 c){
  vec2 o = c / uCells; float s = 1.0 / uCells;
  vec4 m = texture2D(tMap, o + s * 0.5);
  vec4 t = texture2D(tMap, o + s * vec2(0.25, 0.25)); if (t.a > m.a) m = t;
  t = texture2D(tMap, o + s * vec2(0.75, 0.25)); if (t.a > m.a) m = t;
  t = texture2D(tMap, o + s * vec2(0.25, 0.75)); if (t.a > m.a) m = t;
  t = texture2D(tMap, o + s * vec2(0.75, 0.75)); if (t.a > m.a) m = t;
  return m;
}
void main(){
  vec2 uv = vUv - uShift;
  vec2 m = uMouse - uShift;
  vec4 col = texture2D(tMap, uv);
  if (uAmt < 0.001) { gl_FragColor = col; return; }
  vec2 asp = vec2(uRes.x / max(uRes.y, 1.0), 1.0);
  vec2 home = floor(uv * uCells);
  vec2 hc = (home + 0.5) / uCells;
  float f0 = exp(-dot((hc - m) * asp, (hc - m) * asp) / (uRadius * uRadius)) * uAmt;
  if (f0 > 0.03) col = vec4(0.0);
  float reach = 5.5 / uCells;
  for (int j = -6; j <= 6; j++) {
    for (int i = -6; i <= 6; i++) {
      vec2 c = home + vec2(float(i), float(j));
      vec2 cc = (c + 0.5) / uCells;
      vec2 d = (cc - m) * asp;
      float dist = length(d);
      float f = exp(-dist * dist / (uRadius * uRadius)) * uAmt;
      if (f < 0.03) continue;
      vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0, 1.0);
      float r = rnd(c);
      vec2 off = (dir / asp) * f * (0.06 + 0.1 * r);
      float k = length(off); if (k > reach) off *= reach / k;
      vec2 q = abs(uv - (cc + off));
      float half_ = (1.0 - 0.55 * f) * 0.5 / uCells;
      if (q.x < half_ && q.y < half_) { vec4 s = pick(c); if (s.a > col.a) col = s; }
    }
  }
  gl_FragColor = col;
}`;
  kfFx.register("cell-shatter-gl", (el, { options, reduce, hover }) => {
    const glyph = el.querySelector('[data-fx-part="glyph"]');
    if (!glyph || !window.OGL || !window.gsap) return;
    const { Renderer, Program, Mesh, Texture, Vec2, Triangle } = window.OGL;
    const cells = +(options.cells || 40), radius = +(options.radius ?? 0.24), maxShift = +(options.shift ?? 0.12);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "fx-shatter-canvas";
    el.appendChild(canvas);
    let renderer;
    try { renderer = new Renderer({ canvas, alpha: true, antialias: false, depth: false, dpr: Math.min(2, devicePixelRatio || 1), premultipliedAlpha: true, preserveDrawingBuffer: true }); } catch (e) { canvas.remove(); return; }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const src = document.createElement("canvas");
    const tex = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE, premultiplyAlpha: true, flipY: true });
    const program = new Program(gl, {
      vertex: VERT, fragment: FRAG, transparent: true, depthTest: false, depthWrite: false, cullFace: false,
      uniforms: { tMap: { value: tex }, uMouse: { value: new Vec2(0.5, 0.5) }, uRes: { value: new Vec2(1, 1) }, uShift: { value: new Vec2(0, 0) }, uAmt: { value: 0 }, uCells: { value: cells }, uRadius: { value: radius } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program, frustumCulled: false });
    const st = { amt: 0, sx: 0, sy: 0, mx: 0.5, my: 0.5 };
    let alive = true, w = 0, h = 0;
    const draw = () => renderer.render({ scene: mesh });
    const paint = async () => {
      w = el.clientWidth; h = el.clientHeight;
      if (w < 2 || h < 2) return;
      const cs = getComputedStyle(glyph), text = glyph.textContent.trim();
      const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      // A web font drawn on canvas before its glyph chunk (unicode-range) is downloaded leaves blank cells — fetch the font for those glyphs first
      try { await document.fonts.load(font, text); await document.fonts.ready; } catch (e) {}
      if (!alive) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      src.width = Math.max(1, Math.floor(w * dpr)); src.height = Math.max(1, Math.floor(h * dpr));
      const ctx = src.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = font;
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = cs.color;
      ctx.fillText(text, w / 2, h / 2);
      tex.image = src; tex.needsUpdate = true;
      renderer.setSize(w, h);
      program.uniforms.uRes.value.set(w, h);
      draw();
      el.classList.add("is-fx-gl");
    };
    paint();
    const ro = new ResizeObserver(() => requestAnimationFrame(paint));
    ro.observe(el);
    const late = () => requestAnimationFrame(paint);
    document.fonts.addEventListener("loadingdone", late);
    if (reduce || !hover) return () => { alive = false; ro.disconnect(); document.fonts.removeEventListener("loadingdone", late); canvas.remove(); el.classList.remove("is-fx-gl"); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
    const tick = () => {
      if (st.amt < 0.001 && Math.abs(st.sx) < 1e-4 && Math.abs(st.sy) < 1e-4 && !el.matches(":hover")) return;
      const u = program.uniforms;
      u.uMouse.value.set(st.mx, st.my); u.uShift.value.set(st.sx, st.sy); u.uAmt.value = st.amt;
      draw();
    };
    // When the cursor is within (screen width / 10) of the panel center, the panel steps aside the opposite way by the remaining share of that distance — more when closer, up to maxShift of the panel size
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      st.mx = x / r.width; st.my = 1 - y / r.height;
      const cx = r.width / 2, cy = r.height / 2, dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy), reach = Math.round(innerWidth / 10);
      let ox = 0, oy = 0;
      if (d > 1 && d < reach) {
        const a = Math.atan2(dy, dx), k = 0.28 + 0.62 * (1 - Math.max(0, 1 - d / Math.max(r.width * 0.32, 1)));
        ox = -Math.cos(a) * (reach - d) * k; oy = -Math.sin(a) * (reach - d) * k;
      }
      let ux = ox / r.width, uy = -oy / r.height;
      const n = Math.hypot(ux, uy);
      if (n > maxShift) { ux = (ux / n) * maxShift; uy = (uy / n) * maxShift; }
      gsap.to(st, { sx: ux, sy: uy, duration: 0.5, ease: "power3.out", overwrite: "auto" });
    };
    const enter = (e) => { gsap.to(st, { amt: 1, duration: 0.22, ease: "power3.out", overwrite: "auto" }); move(e); };
    const leave = () => {
      gsap.to(st, { amt: 0, duration: 0.55, ease: "power3.inOut", overwrite: "auto" });
      gsap.to(st, { sx: 0, sy: 0, duration: 0.75, ease: "elastic.out(1.4, 2)", overwrite: "auto" });
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    gsap.ticker.add(tick);
    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      gsap.killTweensOf(st);
      ro.disconnect();
      document.fonts.removeEventListener("loadingdone", late);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      canvas.remove();
      el.classList.remove("is-fx-gl");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });
})();
