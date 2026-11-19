(() => {
  // Videotape screen — takes a 2D canvas (source) as a texture and redraws it with shader-doodle.
  // Order: band shake → lower transition noise (cycling purple) → still noise → moving scanlines → RGB overlap and brightness lowering → pixel scanlines → descending brightness band
  const frag = (o) => `
precision mediump float;
uniform sampler2D u_texture0;
uniform float staticStrength;
float h21(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec3 tap(vec2 q) {
  return abs(q.x - 0.5) > 0.5 ? vec3(0.1) : texture2D(u_texture0, q).rgb;
}
float pitch(float c, float n) {
  return pow((0.5 * sin(c * n * 6.2831853) + 0.5) * 0.9 + 0.05, 0.2);
}
void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 q = uv;
  float t = iTime;
  q.x += (vnoise(vec2(q.y * ${o.freq}, t * ${o.speed})) - 0.5) * ${o.amp};
  float band = smoothstep(clamp(sin(t * 0.1), 0.001, 0.01), 0.0, q.y);
  q.y += band * 0.1;
  q.x += band * (vnoise(vec2(uv.y * 100.0, t * 10.0)) - 0.5) * 0.2;
  vec3 col = tap(q);
  col = mix(col, col.gbr, band);
  col += vec3(fract(sin(dot(uv + t, vec2(12.9898, 78.233))) * 43758.5453) * staticStrength * 0.2);
  col *= mix(0.9, 1.0, step(fract(uv.y * ${o.lines} - t * ${o.roll}), 0.5));
  vec3 ghost = vec3(0.0);
  for (int k = 0; k < 6; k++) {
    float d = float(k) - 4.0;
    ghost += vec3(tap(q + vec2(d * ${o.gr}, 0.0)).r, tap(q + vec2((d + 2.0) * ${o.gg}, 0.0)).g, tap(q + vec2((d - 4.0) * ${o.gb}, 0.0)).b) * 0.1;
  }
  col = (col + ghost) * ${o.dim};
  col *= pitch(uv.x, iResolution.x * 0.5) * pitch(uv.y, iResolution.y * 0.5);
  col *= ${o.gain};
  col *= 1.0 + clamp(vnoise(vec2(0.0, uv.y + t)) * 0.6 - 0.25, 0.0, 0.1);
  gl_FragColor = vec4(col, 1.0);
}`;
  // As a GLSL float literal — putting ”2” in as is makes it an int and breaks compilation
  const f = (v, d) => {
    const n = Number(v ?? d);
    return (Number.isFinite(n) ? n : d).toFixed(4);
  };

  kfFx.register("vhs-tape-gl", (el, { options, reduce }) => {
    const src = el.querySelector('[data-fx-part="source"]');
    if (!src || reduce || !customElements.get("shader-doodle")) return;
    if (!src.id) src.id = `fx-vhs-${Math.random().toString(36).slice(2, 8)}`;
    const [gr, gg, gb] = String(options.ghost || "0.001,0.003,0.002").split(",");
    const sd = document.createElement("shader-doodle");
    sd.setAttribute("shadertoy", "");
    sd.className = "fx-vhs-screen";
    const tex = document.createElement("sd-texture");
    tex.setAttribute("src", `#${src.id}`);
    tex.setAttribute("force-update", "");
    // With the default (repeat, mipmaps), shader-doodle rescales non-power-of-two canvases every time and warns — so clamp to edge and linear, at its own size
    tex.setAttribute("wrap-s", "CLAMP_TO_EDGE");
    tex.setAttribute("wrap-t", "CLAMP_TO_EDGE");
    tex.setAttribute("min-filter", "LINEAR");
    const uni = document.createElement("sd-uniform");
    uni.setAttribute("name", "staticStrength");
    uni.setAttribute("x", f(options.static, 0));
    const sc = document.createElement("script");
    sc.type = "x-shader/x-fragment";
    sc.textContent = frag({
      freq: f(options.freq, 15), speed: f(options.speed, 50), amp: f(options.amp, 0.002),
      lines: f(options.lines, 100), roll: f(options.roll, 5),
      gr: f(gr, 0.001), gg: f(gg, 0.003), gb: f(gb, 0.002), dim: f(options.dim, 0.6), gain: f(options.gain, 1.5),
    });
    sd.append(tex, uni, sc);
    el.append(sd);
    el.classList.add("fx-vhs-on");
    // Static noise while loading — the caller turns it on and off by sending fx:static (0~1)
    const onStatic = (e) => uni.setAttribute("x", f(e.detail, 0));
    el.addEventListener("fx:static", onStatic);
    return () => {
      el.removeEventListener("fx:static", onStatic);
      sd.remove();
      el.classList.remove("fx-vhs-on");
    };
  });
})();
