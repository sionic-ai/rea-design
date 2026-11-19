// Flow map carrying over the original values: mouse speed (px/ms, min interval 10.4ms) is stamped into the Flowmap at 1.2x, and shader speed is .15x (max 2.5).
// If there is no image slot (img, canvas), the text of the attached element is drawn on a canvas in its current color and font — the text stays but is made transparent so reading and copying work as before
(() => {
  const VERT = "attribute vec2 uv;attribute vec2 position;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}";
  const FRAG = `precision highp float;
uniform sampler2D tMap;
uniform sampler2D tFlow;
uniform float uTime;
uniform float uVelo;
uniform float uWarp;
uniform float uSplit;
uniform float uTint;
uniform float uRadius;
uniform float uClip;
uniform vec4 uRes;
uniform vec2 uMouse;
varying vec2 vUv;
void main() {
  vec3 flow = texture2D(tFlow, vUv).rgb;
  vec2 uv = (vUv - 0.5) * uRes.zw + 0.5 - flow.xy * uWarp;
  if (uClip > 0.5 && (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)) discard;
  vec2 toMouse = vUv - uMouse;
  float d = length(toMouse);
  vec2 off = normalize(toMouse + 1e-5) * smoothstep(uRadius, 0.0, d) * uVelo * uSplit;
  vec4 base = texture2D(tMap, uv);
  if (base.a < 0.01) discard;
  vec3 c = vec3(texture2D(tMap, uv - off * 1.5).r, texture2D(tMap, uv + off * 0.5).g, texture2D(tMap, uv + off * 1.8).b);
  if (uVelo > 0.01) {
    float hue = uTime * 0.01 + d * 2.0;
    c = mix(c, vec3(sin(hue), sin(hue + 2.094), sin(hue + 4.188)) * 0.5 + 0.5, uVelo * uTint);
  }
  gl_FragColor = vec4(c, base.a);
}`;
  const sizeOf = (m) => [m.naturalWidth || m.videoWidth || m.width || 1, m.naturalHeight || m.videoHeight || m.height || 1];

  kfFx.register("flow-ripple", (el, { options, reduce }) => {
    const OGL = window.OGL;
    if (!OGL || reduce) return;
    let src = el.querySelector(':scope > [data-fx-part="image"]');
    const text = src ? "" : el.textContent.trim();
    if (!src && !text) return;
    const ac = new AbortController();
    const canvas = document.createElement("canvas");
    canvas.className = "fx-flow-ripple__gl";
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const renderer = new OGL.Renderer({ canvas, dpr: Math.min(devicePixelRatio || 1, 2), alpha: true, premultipliedAlpha: true });
    const gl = renderer.gl;
    const flowmap = new OGL.Flowmap(gl, { falloff: +(options.falloff ?? 0.4), dissipation: +(options.dissipation ?? 0.96), alpha: 1 });
    const texture = new OGL.Texture(gl, { minFilter: gl.LINEAR, magFilter: gl.LINEAR, premultiplyAlpha: true, generateMipmaps: false });
    const program = new OGL.Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        tMap: { value: texture },
        tFlow: flowmap.uniform,
        uTime: { value: 0 },
        uVelo: { value: 0 },
        uWarp: { value: +(options.warp ?? 0.15) },
        uSplit: { value: +(options.split ?? 0.05) },
        uTint: { value: +(options.tint ?? 0.1) },
        uRadius: { value: +(options.radius ?? 0.2) },
        uClip: { value: options.fit === "contain" ? 1 : 0 },
        uRes: { value: new OGL.Vec4() },
        uMouse: { value: new OGL.Vec2(0.5, 0.5) },
      },
    });
    const mesh = new OGL.Mesh(gl, { geometry: new OGL.Triangle(gl), program });
    const hidden = src || el;
    const prevColor = el.style.color;
    // When drawn as text: same size as the element, centered in the current text color and font
    const drawText = () => {
      const c = document.createElement("canvas"), r = el.getBoundingClientRect(), cs = getComputedStyle(el), k = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.max(1, Math.round(r.width * k));
      c.height = Math.max(1, Math.round(r.height * k));
      const g = c.getContext("2d", { willReadFrequently: true });
      g.fillStyle = prevColor || cs.color;
      g.font = `${cs.fontWeight} ${parseFloat(cs.fontSize) * k}px ${cs.fontFamily}`;
      g.textAlign = cs.textAlign === "center" ? "center" : "left";
      g.textBaseline = "middle";
      g.fillText(text, g.textAlign === "center" ? c.width / 2 : parseFloat(cs.paddingLeft) * k, c.height / 2, c.width);
      return c;
    };
    if (src) src.style.visibility = "hidden";
    else { texture.image = drawText(); el.style.color = "transparent"; }
    if (src) texture.image = src;
    const mouse = new OGL.Vec2(-1), velocity = new OGL.Vec2(), scaled = new OGL.Vec2(), last = new OGL.Vec2();
    let lastTime = 0, target = 0, speed = 0, aspect = 1, idle = 91, raf = 0, lastFrame = 0, moved = false, rect = null;
    const fit = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      if (!src) texture.image = drawText();
      const [iw, ih] = sizeOf(texture.image), o = ih / iw, r = h / w, contain = options.fit === "contain";
      renderer.setSize(w, h);
      const wide = contain ? r > o : r < o;
      program.uniforms.uRes.value.set(w, h, wide ? 1 : (w / h) * o, wide ? r / o : 1);
      texture.needsUpdate = true;
      aspect = w / h;
      rect = el.getBoundingClientRect();
      if (!raf) renderer.render({ scene: mesh });
    };
    const render = (now) => {
      const steps = Math.min(Math.max(1, now - lastFrame) / 16.667, 3);
      lastFrame = now;
      if (moved) idle = 0;
      else { mouse.set(-1); velocity.set(0); idle++; }
      moved = false;
      if (idle > 90) { raf = 0; return; }
      raf = requestAnimationFrame(render);
      flowmap.aspect = aspect;
      flowmap.mouse.copy(mouse);
      scaled.set(velocity.x * 1.2, velocity.y * 1.2);
      flowmap.velocity.lerp(scaled, 1 - Math.pow(1 - (velocity.len() ? 0.12 : 0.02), steps));
      flowmap.update();
      program.uniforms.uTime.value = now * 0.01;
      speed += (target - speed) * (1 - Math.pow(1 - 0.08, steps));
      program.uniforms.uVelo.value = speed;
      target *= Math.pow(0.985, steps);
      renderer.render({ scene: mesh });
    };
    const move = (x, y) => {
      rect ||= el.getBoundingClientRect();
      const px = x - rect.left, py = y - rect.top;
      mouse.set(px / rect.width, 1 - py / rect.height);
      program.uniforms.uMouse.value.set(px / rect.width, py / rect.height);
      const now = performance.now();
      if (!lastTime) { lastTime = now; last.set(px, py); }
      const dx = px - last.x, dy = py - last.y, dt = Math.max(10.4, now - lastTime);
      last.set(px, py);
      lastTime = now;
      velocity.set(dx / dt, dy / dt);
      target = Math.min((Math.hypot(dx, dy) / dt) * 0.15, 2.5);
      moved = true;
      if (!raf) { lastFrame = now; raf = requestAnimationFrame(render); }
    };
    el.addEventListener("mousemove", (e) => move(e.clientX, e.clientY), { signal: ac.signal, passive: true });
    el.addEventListener("touchmove", (e) => e.touches[0] && move(e.touches[0].clientX, e.touches[0].clientY), { signal: ac.signal, passive: true });
    addEventListener("scroll", () => { rect = null; }, { signal: ac.signal, passive: true });
    if (src?.tagName === "IMG" && !src.complete) src.addEventListener("load", fit, { signal: ac.signal, once: true });
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    return () => {
      ac.abort();
      ro.disconnect();
      cancelAnimationFrame(raf);
      hidden.style.visibility = "";
      if (!src) el.style.color = prevColor;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
