// With the framed text still attached to the screen, white paint spreads from inside the frame out to a brush-stroke edge and covers the whole panel, and the frame grows large enough to overflow the screen.
// Progress tied to one scroll span (section top at screen top → section end at screen bottom): body words fade out from .12 (each .08, spread evenly within .14 gaps),
// The fill spreads with power2.in starting at .26 for .64 (radius = Progress × panel diagonal / .55), the frame runs from .34 for .6 with power1.inOut
// grows by (1.04 × the factor that fully covers the panel)^progress. When the fill passes the top of the frame, the panel gets data-tone="light" Add this to change text and heading color.
// Paint edge: it reaches as far as the distance around the frame plus a directional noise mass (.55 + .75×), brush grain (9x noise) and bristle marks (90x noise), and strand noise splits the dry brush tip
(() => {
  const VS = `#version 300 es
in vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
  const FS = `#version 300 es
precision highp float;
uniform vec2 view;
uniform float ratio;
uniform vec4 box;
uniform float reach;
uniform float clock;
uniform vec3 paint;
uniform vec3 edgeInk;
out vec4 outColor;
float h21(vec2 p){ p = fract(p * vec2(173.13, 391.71)); p += dot(p, p.yx + 31.17); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 s = f * f * (3.0 - 2.0 * f);
  float a = h21(i), b = h21(i + vec2(1.0, 0.0)), c = h21(i + vec2(0.0, 1.0)), d = h21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, s.x), mix(c, d, s.x), s.y); }
float layered(vec2 p){ float sum = 0.0, amp = 0.5; for (int k = 0; k < 4; k++) { sum += amp * vnoise(p); p = p * 2.03 + 17.1; amp *= 0.5; } return sum; }
void main(){
  vec2 px = vec2(gl_FragCoord.x, view.y * ratio - gl_FragCoord.y) / ratio;
  vec2 rel = px - box.xy, half_ = box.zw;
  vec2 out_ = abs(rel) - half_;
  float dist = length(max(out_, 0.0)) + min(max(out_.x, out_.y), 0.0);
  vec2 onBox = clamp(rel, -half_, half_);
  vec2 dir = normalize(onBox / half_ + (rel - onBox) / max(half_.x, half_.y));
  float brush = min(reach, 120.0);
  float lump = layered(dir * 1.6 + vec2(clock * 0.03, clock * 0.02));
  float grain = layered(dir * 9.0 + 3.1);
  float hair = vnoise(dir * 90.0 + 9.7);
  float edge = reach * (0.55 + 0.75 * lump) + brush * (0.7 * grain + 0.12 * hair) - dist;
  float cover = smoothstep(-1.2, 1.2, edge);
  float wet = clamp(edge / max(brush * 0.2, 1.0), 0.0, 1.0);
  float split = vnoise(dir * 260.0 + dist * 0.003);
  cover *= smoothstep(split - 0.25, split + 0.25, wet * 1.6);
  float lip = (1.0 - smoothstep(0.0, 18.0, edge)) * step(0.0, edge);
  outColor = vec4(mix(paint, edgeInk, 0.07 * lip) * cover, cover);
}`;
  const rgb = (v) => { const c = document.createElement("canvas").getContext("2d"); c.fillStyle = v; const h = c.fillStyle; if (h[0] !== "#") return [1, 1, 1]; return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); };
  const program = (gl) => {
    const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS), p = gl.createProgram();
    if (!v || !f) return null;
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    return { p, v, f };
  };

  kfFx.register("paint-portal-scrub", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]'), frame = el.querySelector('[data-fx-part="frame"]');
    if (!stage || !frame) return;
    const text = el.querySelector('[data-fx-part="text"]'), cue = el.querySelector('[data-fx-part="cue"]'), label = el.querySelector('[data-fx-part="label"]');
    if (reduce) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    stage.prepend(canvas);
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false });
    const prog = gl && program(gl);
    let U = {}, buf = null;
    if (prog) {
      gl.useProgram(prog.p);
      buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog.p, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const n of ["view", "ratio", "box", "reach", "clock", "paint", "edgeInk"]) U[n] = gl.getUniformLocation(prog.p, n);
      const css = getComputedStyle(el);
      gl.uniform3fv(U.paint, rgb(css.getPropertyValue("--fx-paint").trim() || css.getPropertyValue("--kf-surface").trim() || css.backgroundColor));
      gl.uniform3fv(U.edgeInk, rgb(css.getPropertyValue("--kf-bg").trim() || css.color));
    }
    let w = 1, h = 1, dpr = 1, grow = 1, border = 0, live = false, painted = false, tone = "dark";
    const spread = { p: 0 }, zoom = { p: 0 };
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5); w = stage.clientWidth; h = stage.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
      gl?.viewport(0, 0, canvas.width, canvas.height);
      grow = 1.04 * Math.max(w / (frame.offsetWidth || 1), h / (frame.offsetHeight || 1));
      border = parseFloat(getComputedStyle(frame).borderTopWidth) || 0;
      gsap.set(frame, { scale: grow ** zoom.p });
    };
    const setTone = (t) => { if (t !== tone) { tone = t; stage.dataset.tone = t; } };
    const draw = (t) => {
      if (!prog || !live) return;
      const reach = (spread.p * Math.hypot(w, h)) / 0.55;
      if (reach < 0.5) { if (painted) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); } painted = false; setTone("dark"); return; }
      const fr = frame.getBoundingClientRect(), sr = stage.getBoundingClientRect(), b = (border * fr.width) / (frame.offsetWidth || 1);
      const x = fr.left - sr.left + b, y = fr.top - sr.top + b, bw = Math.max(1, fr.width - 2 * b), bh = Math.max(1, fr.height - 2 * b);
      gl.uniform2f(U.view, w, h); gl.uniform1f(U.ratio, dpr);
      gl.uniform4f(U.box, x + bw / 2, y + bh / 2, bw / 2, bh / 2);
      gl.uniform1f(U.reach, reach); gl.uniform1f(U.clock, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      painted = true;
      setTone(0.55 * reach > y ? "light" : "dark");
    };
    stage.dataset.tone = tone;
    size();
    const ro = new ResizeObserver(size); ro.observe(stage);
    const tick = (time) => draw(time);
    gsap.ticker.add(tick);
    const seen = ScrollTrigger.create({ trigger: el, scroller, start: "top bottom", end: "bottom top", onToggle: (s) => (live = s.isActive) });
    const words = text ? SplitText.create(text, { type: "words" }) : null;
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, scroller, start: "top top", end: "bottom bottom", scrub: true, onRefresh: size } });
    if (words) tl.to(words.words, { opacity: 0, duration: 0.08, stagger: { amount: 0.14 }, ease: "power1.in" }, 0.12);
    tl.to(spread, { p: 1, duration: 0.64, ease: "power2.in" }, 0.26)
      .to(zoom, { p: 1, duration: 0.6, ease: "power1.inOut", onUpdate: () => gsap.set(frame, { scale: grow ** zoom.p }) }, 0.34);
    if (cue) tl.fromTo(cue, { scaleX: 0 }, { scaleX: 1, duration: 0.9 }, 0);
    if (label) tl.to(label, { autoAlpha: 0, y: 12, duration: 0.06, ease: "power1.in" }, 0.84);
    tl.to({}, { duration: 0.06 }, 0.94);
    return () => {
      gsap.ticker.remove(tick); ro.disconnect(); seen.kill(); tl.scrollTrigger?.kill(); tl.kill(); words?.revert();
      gsap.set([frame, cue, label].filter(Boolean), { clearProps: "transform,opacity,visibility" });
      if (prog) { gl.deleteBuffer(buf); gl.deleteProgram(prog.p); gl.deleteShader(prog.v); gl.deleteShader(prog.f); }
      canvas.remove(); delete stage.dataset.tone;
    };
  });
})();
