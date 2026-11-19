// Hovering over the photo makes that spot bulge like a lens, and it slowly settles back when you leave — same OGL and same formula as the original
(() => {
  const VERT = `attribute vec2 uv;
attribute vec2 position;
uniform vec2 uResolution;
uniform vec2 uTextureResolution;
varying vec2 vUv;
vec2 cover(vec2 uv, vec2 size, vec2 res) {
  vec2 r = vec2(min((res.x / res.y) / (size.x / size.y), 1.), min((res.y / res.x) / (size.y / size.x), 1.));
  return vec2(uv.x * r.x + (1. - r.x) * .5, uv.y * r.y + (1. - r.y) * .5);
}
void main() { vUv = cover(uv, uTextureResolution, uResolution); gl_Position = vec4(position, 0., 1.); }`;
  const FRAG = `precision highp float;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uStrength;
uniform float uFalloff;
varying vec2 vUv;
void main() {
  vec2 dir = vUv - uMouse;
  float d = length(dir);
  gl_FragColor = texture2D(uTexture, vUv - dir * uStrength / (1. + d * d * uFalloff));
}`;
  const ready = (src) => new Promise((ok) => {
    if (src instanceof HTMLImageElement && !(src.complete && src.naturalWidth)) return src.addEventListener("load", ok, { once: true });
    if (src instanceof HTMLVideoElement && src.readyState < 2) return src.addEventListener("loadeddata", ok, { once: true });
    ok();
  });

  kfFx.register("bulge-hover", (el, { options, reduce, hover }) => {
    const src = el.querySelector('[data-fx-part="source"]');
    if (!src || reduce || !hover || !window.OGL) return;
    const power = +(options.power ?? 0.25), falloff = +(options.falloff ?? 8), follow = +(options.follow ?? 0.1);
    const rise = +(options.rise ?? 0.06), sink = +(options.sink ?? 0.12), lag = +(options.lag ?? 0.08);
    const ac = new AbortController(), signal = ac.signal;
    let alive = true, tick, ro, io, renderer;
    ready(src).then(() => {
      if (!alive) return;
      const { Renderer, Program, Mesh, Triangle, Texture, Vec2 } = OGL;
      renderer = new Renderer({ alpha: true, dpr: Math.min(devicePixelRatio, 2) });
      const gl = renderer.gl;
      gl.canvas.className = "fx-bulge-canvas";
      gl.canvas.setAttribute("aria-hidden", "true");
      el.append(gl.canvas);
      el.classList.add("is-bulge-on");
      const texture = new Texture(gl, { image: src, generateMipmaps: false, minFilter: gl.LINEAR });
      const size = (n) => [n.naturalWidth || n.videoWidth || n.width || 1, n.naturalHeight || n.videoHeight || n.height || 1];
      const program = new Program(gl, {
        vertex: VERT, fragment: FRAG,
        uniforms: { uTexture: { value: texture }, uMouse: { value: new Vec2(0.5, 0.5) }, uResolution: { value: new Vec2(1, 1) }, uTextureResolution: { value: new Vec2(...size(src)) }, uStrength: { value: 0 }, uFalloff: { value: falloff } },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      const fit = () => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        renderer.setSize(r.width, r.height);
        program.uniforms.uResolution.value.set(r.width, r.height);
      };
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(el);
      const m = new Vec2(0.9, 0.9), target = new Vec2(0.9, 0.9);
      let inside = false, aim = 0, str = 0, visible = true;
      addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (inside) target.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      }, { signal, passive: true });
      io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);
      tick = () => {
        m.x += (target.x - m.x) * follow; m.y += (target.y - m.y) * follow;
        aim += ((inside ? 1 : 0) - aim) * (inside ? rise : sink);
        str += (aim - str) * lag;
        if (!visible) return;
        if (src instanceof HTMLVideoElement) texture.needsUpdate = true;
        program.uniforms.uMouse.value.set(m.x, m.y);
        program.uniforms.uStrength.value = str * power;
        renderer.render({ scene: mesh });
      };
      gsap.ticker.add(tick);
    });
    return () => {
      alive = false;
      ac.abort(); ro?.disconnect(); io?.disconnect();
      if (tick) gsap.ticker.remove(tick);
      renderer?.gl.canvas.remove();
      renderer?.gl.getExtension("WEBGL_lose_context")?.loseContext();
      el.classList.remove("is-bulge-on");
    };
  });
})();
