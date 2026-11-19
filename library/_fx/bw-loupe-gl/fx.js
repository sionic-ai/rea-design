(() => {
  /* Magnifier over the B&W print — photo (data-fx-part =img) is drawn in black and white (contrast mix .5) on a same-size canvas, and only a 70px circle around the cursor (softness 14) is magnified 1.35x with its colors cycling.
     The cursor glides along at 10 per second, and on press a color ripple spreads from that spot to the photo edge in .6s */
  const VS = "attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
  const FS = `
    precision highp float;
    varying vec2 v;
    uniform sampler2D uTex; uniform vec2 uRes; uniform vec2 uCur; uniform vec3 uLoupe; uniform float uOn; uniform float uBw; uniform float uWaveT; uniform vec2 uWave; uniform float uAspect;
    vec2 cover(vec2 uv) { float ca = uRes.x / uRes.y; vec2 p = uv - 0.5; if (uAspect > ca) p.x *= ca / uAspect; else p.y *= uAspect / ca; return p + 0.5; }
    void main() {
      vec2 px = v * uRes;
      float d = distance(px, uCur);
      float m = uOn * (1.0 - smoothstep(uLoupe.x - uLoupe.y, uLoupe.x + uLoupe.y, d));
      vec2 uv = mix(v, uCur / uRes + (v - uCur / uRes) / max(uLoupe.z, 1.0), m);
      vec3 c = texture2D(uTex, cover(vec2(uv.x, 1.0 - uv.y))).rgb;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      l = mix(l, l * l * (3.0 - 2.0 * l), uBw);
      float wm = 0.0;
      if (uWaveT > -0.5) { float r = uWaveT * 1.15 * length(uRes); wm = 1.0 - smoothstep(r - 0.09 * uRes.y, r + 0.09 * uRes.y, distance(px, uWave)); }
      gl_FragColor = vec4(mix(vec3(l), c, clamp(max(m, wm), 0.0, 1.0)), 1.0);
    }`;
  kfFx.register("bw-loupe-gl", (el, { options, reduce, hover }) => {
    const img = el.querySelector('img[data-fx-part="img"], [data-fx-part="img"] img');
    if (!img) return;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) return;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    el.append(canvas);
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ["uTex", "uRes", "uCur", "uLoupe", "uOn", "uBw", "uWaveT", "uWave", "uAspect"].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    const tex = gl.createTexture();
    let ready = false;
    const upload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      ["TEXTURE_MIN_FILTER", "TEXTURE_MAG_FILTER"].forEach((f) => gl.texParameteri(gl.TEXTURE_2D, gl[f], gl.LINEAR));
      ["TEXTURE_WRAP_S", "TEXTURE_WRAP_T"].forEach((f) => gl.texParameteri(gl.TEXTURE_2D, gl[f], gl.CLAMP_TO_EDGE));
      ready = true;
    };
    if (img.complete && img.naturalWidth) upload(); else img.addEventListener("load", upload, { once: true });
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const R = +(options.radius ?? 70), soft = +(options.soft ?? 14), mag = +(options.mag ?? 1.35), bw = +(options.contrast ?? 0.5), waveDur = +(options.wave ?? 0.6), follow = +(options.follow ?? 10);
    const s = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, on: 0, onT: 0, wave: -1, wx: 0, wy: 0 };
    let W = 1, H = 1, raf = 0, last = 0, tw = null;
    const size = () => { W = el.clientWidth || 1; H = el.clientHeight || 1; canvas.width = W * dpr; canvas.height = H * dpr; gl.viewport(0, 0, canvas.width, canvas.height); };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    const pos = (e) => { const r = el.getBoundingClientRect(); return [(e.clientX - r.left) * dpr, (r.bottom - e.clientY) * dpr]; };
    const onMove = (e) => { [s.tx, s.ty] = pos(e); if (s.x < -1e3) { s.x = s.tx; s.y = s.ty; } s.onT = 1; };
    const onLeave = () => { s.onT = 0; };
    const onDown = (e) => {
      [s.wx, s.wy] = pos(e);
      tw && tw.kill();
      tw = reduce ? null : gsap.fromTo(s, { wave: 0 }, { wave: 1, duration: waveDur, ease: "none", onComplete: () => { s.wave = -1; } });
    };
    if (hover) { el.addEventListener("pointermove", onMove); el.addEventListener("pointerleave", onLeave); }
    el.addEventListener("pointerdown", onDown);
    function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(1, now - (last || now)) / 1000); last = now;
      const k = reduce ? 1 : 1 - Math.exp(-dt * follow);
      s.x += (s.tx - s.x) * k; s.y += (s.ty - s.y) * k; s.on += (s.onT - s.on) * (reduce ? 1 : 1 - Math.exp(-dt * 7));
      if (!ready) return;
      gl.uniform1i(U.uTex, 0); gl.uniform2f(U.uRes, canvas.width, canvas.height); gl.uniform2f(U.uCur, s.x, s.y);
      gl.uniform3f(U.uLoupe, R * dpr, soft * dpr, mag); gl.uniform1f(U.uOn, s.on); gl.uniform1f(U.uBw, bw);
      gl.uniform1f(U.uWaveT, s.wave); gl.uniform2f(U.uWave, s.wx, s.wy); gl.uniform1f(U.uAspect, (img.naturalWidth || 3) / (img.naturalHeight || 2));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); tw && tw.kill(); ro.disconnect();
      el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); el.removeEventListener("pointerdown", onDown);
      gl.deleteTexture(tex); gl.deleteBuffer(buf); gl.deleteProgram(prog); canvas.remove();
    };
  });
})();
