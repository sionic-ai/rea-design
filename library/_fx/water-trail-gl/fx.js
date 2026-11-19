// When the cursor passes over a photo, water soaks in and spreads at that spot, flows slightly in the direction of movement, then dries over a few seconds and leaves a stain mark (WebGL2 · OGL).
// Water depth, flow and trace are held in one half-precision float field (r·gb·a) and stepped forward each frame — mixing with neighbors (spread), shrinking (damping), with fine noise making the edges ripple.
// In the photo slot <img> If present, that photo is refracted beneath the water. If absent (placeholder), only the water’s gloss and shade are laid over as a transparent film.
(() => {
  const VERT = `#version 300 es
in vec2 position; in vec2 uv; out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;
  const NOISE = `
float h21(vec2 p) { p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
float layered(vec2 p) { return vn(p) * 0.55 + vn(p * 2.6) * 0.3 + vn(p * 6.3) * 0.15; }`;
  // Touched spot: adds depth and pulls the flow toward the speed of the hand
  const SPLAT = `#version 300 es
precision highp float;
uniform sampler2D uField; uniform vec2 uHand; uniform vec3 uPour; uniform float uAspect, uRadius;
in vec2 vUv; out vec4 o;
void main() {
  vec4 f = texture(uField, vUv);
  vec2 d = vUv - uHand; d.x *= uAspect;
  float k = exp(-dot(d, d) / uRadius);
  float w = clamp(k * uPour.x, 0.0, 1.0);
  o = vec4(f.r + k * uPour.x, mix(f.gb, uPour.yz, w), f.a);
}`;
  // One step: move along the flow → blend with neighbors → shrink → mark the dried spots
  const STEP = `#version 300 es
precision highp float;
uniform sampler2D uField; uniform vec2 uTexel, uMark; uniform float uDt, uFriction, uSpread, uDecay, uWobble, uGrain, uTime, uDry;
in vec2 vUv; out vec4 o;
${NOISE}
void main() {
  vec2 back = vUv - texture(uField, vUv).gb * uDt;
  vec4 c = texture(uField, back);
  float t = uTime * 0.3;
  vec2 j = (vec2(layered(vUv * 11.0 + t), layered(vUv * 11.0 - t + 19.7)) - 0.5) * 2.0 * uWobble * uTexel;
  vec4 a = texture(uField, back + vec2(uTexel.x, 0.0) + j), b = texture(uField, back - vec2(uTexel.x, 0.0) + j);
  vec4 e = texture(uField, back + vec2(0.0, uTexel.y) + j), g = texture(uField, back - vec2(0.0, uTexel.y) + j);
  vec4 avg = (a + b + e + g) * 0.25;
  float depth = mix(c.r, avg.r, uSpread);
  vec2 flow = mix(c.gb, avg.gb, uSpread * 0.5);
  float grain = layered(vUv * 15.0 + 3.7 + t * 0.6) - 0.5;
  depth /= 1.0 + uDecay * (1.0 + uGrain * 2.0 * grain) * uDt;
  flow /= 1.0 + uFriction * uDt;
  float mark = max(c.a - uDt / uDry, 0.0);
  mark = max(mark, smoothstep(uMark.x, uMark.y, depth));
  o = vec4(max(depth, 0.0), flow, mark);
}`;
  // Display: the depth gradient stands up the water surface to lay on light and shade, and if there is a photo it refracts by that amount
  const SHOW = `#version 300 es
precision highp float;
uniform sampler2D uField, uPhoto; uniform vec2 uTexel; uniform float uEdge, uHasPhoto, uBend, uReveal;
uniform vec3 uLight, uShade;
in vec2 vUv; out vec4 o;
${NOISE}
void main() {
  float d = texture(uField, vUv).r, mark = texture(uField, vUv).a;
  float dx = texture(uField, vUv + vec2(uTexel.x, 0.0)).r - texture(uField, vUv - vec2(uTexel.x, 0.0)).r;
  float dy = texture(uField, vUv + vec2(0.0, uTexel.y)).r - texture(uField, vUv - vec2(0.0, uTexel.y)).r;
  vec3 n = normalize(vec3(-dx * uBend, -dy * uBend, 1.0));
  float wet = smoothstep(uEdge - 0.05, uEdge + 0.02, d);
  float rim = wet * (1.0 - smoothstep(uEdge, uEdge + 0.14, d));
  float shine = pow(max(dot(n, normalize(vec3(-0.45, 0.55, 1.0))), 0.0), 28.0);
  float dark = 0.5 - 0.5 * n.y;
  if (uHasPhoto > 0.5) {
    vec2 uv = vUv + n.xy * 0.035 * wet;
    vec3 base = texture(uPhoto, vec2(uv.x, 1.0 - uv.y)).rgb;
    vec3 col = mix(base * (1.0 - 0.12 * mark), base * 0.82 + uLight * shine * 0.9, wet);
    col = mix(col, uShade, rim * 0.25);
    o = vec4(col, 1.0);
    return;
  }
  if (uReveal > 0.5) {
    // Show-through: wherever it’s wet (soft edges), another image shows through on the layer below — a bright glow for placeholders
    float s = smoothstep(0.05, uEdge + 0.25, d);
    vec3 c = uHasPhoto > 0.5 ? texture(uPhoto, vec2(vUv.x, 1.0 - vUv.y)).rgb : uLight;
    // In the placeholder, only scattered flower spots sit above the vase (above the bottom 35%) — in the original the flower mask lights only where flowers are.
    float spots = smoothstep(0.62, 0.7, layered(vUv * vec2(9.0, 6.0) + 2.7)) * smoothstep(0.3, 0.45, vUv.y);
    float ra = uHasPhoto > 0.5 ? s : s * spots * 0.4;
    o = vec4(c * ra, ra);
    return;
  }
  float a = clamp(wet * (0.1 + 0.18 * dark) + rim * 0.22 + mark * 0.07, 0.0, 0.6);
  vec3 col = mix(uShade, uLight, clamp(shine * 1.4, 0.0, 1.0));
  float sa = clamp(a + wet * shine * 0.7, 0.0, 0.85);
  o = vec4(col * sa, sa);
}`;

  const BASE = { short: 512, radius: 0.004, amount: 3.5, push: 1.6, maxSpeed: 4, friction: 3, spread: 0.79, decay: 1.5, wobble: 2.6, grain: 0.7, edge: 0.395, dry: 3, markFrom: 0.2, markTo: 0.4, bend: 6 };

  kfFx.register("water-trail-gl", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !window.OGL) return;
    const o = { ...BASE };
    for (const k of Object.keys(BASE)) if (options[k] !== undefined && options[k] !== "") o[k] = +options[k];
    const box = el.querySelector(":scope [data-fx-part='photo']") || el;
    const cv = document.createElement("canvas");
    cv.className = "fx-water-canvas";
    cv.setAttribute("aria-hidden", "true");
    box.append(cv);
    let renderer;
    try { renderer = new OGL.Renderer({ canvas: cv, alpha: true, premultipliedAlpha: true, depth: false, antialias: false, dpr: Math.min(devicePixelRatio || 1, 1.5), webgl: 2 }); } catch { cv.remove(); return; }
    const gl = renderer.gl;
    if (!renderer.isWebgl2 || !gl.getExtension("EXT_color_buffer_float")) { cv.remove(); return; }
    const probe = document.createElement("i");
    probe.className = "fx-water-probe";
    box.append(probe);
    const rgb = (v) => { probe.style.color = v; return (getComputedStyle(probe).color.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map((x) => x / 255); };

    const tri = new OGL.Triangle(gl);
    const target = (w, h) => new OGL.RenderTarget(gl, { width: w, height: h, depth: false, type: gl.HALF_FLOAT, format: gl.RGBA, internalFormat: gl.RGBA16F, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
    const prog = (fragment, uniforms, transparent = false) => new OGL.Mesh(gl, { geometry: tri, program: new OGL.Program(gl, { vertex: VERT, fragment, uniforms, depthTest: false, depthWrite: false, transparent }) });
    let A, B, fw = 1, fh = 1;
    const splat = prog(SPLAT, { uField: { value: null }, uHand: { value: [0, 0] }, uPour: { value: [0, 0, 0] }, uAspect: { value: 1 }, uRadius: { value: o.radius } });
    const step = prog(STEP, {
      uField: { value: null }, uTexel: { value: [0, 0] }, uMark: { value: [o.markFrom, o.markTo] }, uDt: { value: 0.016 },
      uFriction: { value: o.friction }, uSpread: { value: o.spread }, uDecay: { value: o.decay }, uWobble: { value: o.wobble },
      uGrain: { value: o.grain }, uTime: { value: 0 }, uDry: { value: o.dry },
    });
    const photoTex = new OGL.Texture(gl, { generateMipmaps: false });
    const show = prog(SHOW, {
      uField: { value: null }, uPhoto: { value: photoTex }, uTexel: { value: [0, 0] }, uEdge: { value: o.edge }, uHasPhoto: { value: 0 }, uBend: { value: o.bend }, uReveal: { value: options.look === "reveal" ? 1 : 0 },
      uLight: { value: [1, 1, 1] }, uShade: { value: [0, 0, 0] },
    }, true);
    const img = (options.look === "reveal" ? el.querySelector(":scope [data-fx-part='reveal'] img") : null) || box.querySelector("img");
    if (img) {
      const use = () => { photoTex.image = img; show.program.uniforms.uHasPhoto.value = 1; };
      img.complete && img.naturalWidth ? use() : img.addEventListener("load", use, { once: true });
    }

    let W = 0, H = 0;
    const size = () => {
      const r = box.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      W = r.width; H = r.height;
      renderer.setSize(W, H);
      const s = o.short / Math.min(W, H);
      fw = Math.max(8, Math.round(W * s)); fh = Math.max(8, Math.round(H * s));
      A = target(fw, fh); B = target(fw, fh);
      splat.program.uniforms.uAspect.value = W / H;
    };
    const pass = (mesh, from) => { mesh.program.uniforms.uField.value = from.texture; renderer.render({ scene: mesh, target: from === A ? B : A }); [A, B] = [B, A]; };

    const hand = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, on: false, moved: false };
    let raf = 0, last = 0, idle = 0, t0 = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!A) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - (last || now)) / 1000));
      last = now;
      if (hand.on && hand.moved) {
        const sp = Math.hypot(hand.vx, hand.vy), k = sp > o.maxSpeed ? o.maxSpeed / sp : 1;
        splat.program.uniforms.uHand.value = [hand.x, hand.y];
        splat.program.uniforms.uPour.value = [Math.min(1, o.amount * dt * 8), hand.vx * k * o.push * 0.1, hand.vy * k * o.push * 0.1];
        pass(splat, A);
        hand.moved = false;
        idle = 0;
      } else idle += dt;
      const u = step.program.uniforms;
      u.uDt.value = dt; u.uTime.value = (now - t0) / 1000; u.uTexel.value = [1 / fw, 1 / fh];
      pass(step, A);
      const s = show.program.uniforms;
      s.uField.value = A.texture; s.uTexel.value = [1 / fw, 1 / fh];
      s.uLight.value = rgb("var(--fx-water-light, var(--kf-surface))"); s.uShade.value = rgb("var(--fx-water-shade, var(--kf-ink))");
      renderer.render({ scene: show });
      // Stops once fully dry
      if (!hand.on && idle > o.dry + 1.5) { cancelAnimationFrame(raf); raf = 0; }
    };
    const wake = () => { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };
    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const r = box.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height, now = performance.now();
      if (hand.on) {
        const dt = Math.max(0.008, (now - hand.t) / 1000);
        hand.vx = (x - hand.x) / dt; hand.vy = (y - hand.y) / dt;
      }
      hand.x = x; hand.y = y; hand.t = now; hand.on = true; hand.moved = true;
      wake();
    };
    const onLeave = () => { hand.on = false; };
    const ro = new ResizeObserver(() => { size(); wake(); });
    ro.observe(box);
    size();
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      cv.remove(); probe.remove();
    };
  });
})();
