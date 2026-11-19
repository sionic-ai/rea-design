(() => {
  // Lay a WebGL2 noise band behind the panel — a domain-warp fbm flowing outward from a single point (origin), painted with three color stops,
  // Fades to transparent along a curve from one end. Where the cursor passes, a small flow field pushes the grain so it flows like water (with color splitting at the edges),
  // spot darkens only around the cursor. iris shows it only as a horizontally long cloud spreading from top center (subpage header band).
  const VERT = "#version 300 es\nin vec2 aPos;\nvoid main(){ gl_Position = vec4(aPos, 0.0, 1.0); }";
  const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime, uSpeed, uMorph, uFlow, uScale, uOct, uWarp, uTall, uSeed;
uniform vec2 uOrigin;
uniform vec4 uC1, uC2, uC3;
uniform vec3 uStops;
uniform float uFadeA, uFadeB, uFromBottom;
uniform vec4 uEase;
uniform sampler2D uVel;
uniform float uDistort, uChroma;
uniform vec2 uPtr;
uniform float uPtrOn, uFollow, uSpotOn, uSpotIn, uSpotOut, uSpotR, uSpotF;
uniform float uIrisOn, uIrisR, uIrisW, uIrisN, uIrisF, uIrisY;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.x, p.y, p.x) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  float v = mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
  return v * v;
}
float fbm(vec2 p) {
  const mat2 turn = mat2(0.8, 0.6, -0.6, 0.8);
  float sum = 0.0, norm = 0.0, amp = 0.5;
  for (int k = 0; k < 6; k++) {
    if (float(k) >= uOct) break;
    vec2 q = k == 0 ? p + uTime * uMorph : p;
    sum += amp * vnoise(q);
    norm += amp;
    amp *= 0.5;
    p = turn * p * 2.02;
  }
  return sum / max(norm, 1e-4);
}
float warped(vec2 p) { return fbm(p + uWarp * fbm(p + uWarp * fbm(p))); }

float shadeAt(vec2 d) {
  vec2 dir = d / max(length(d), 1e-4);
  float t = uTime * uSpeed;
  float a = fract(t), b = fract(t + 0.5);
  float mixAB = abs(1.0 - 2.0 * a);
  vec2 seed = vec2(uSeed * 17.3, uSeed * 11.7);
  return mix(warped(d * uScale - dir * a * uFlow + seed), warped(d * uScale - dir * b * uFlow + seed), mixAB);
}
float bez(float s, float p1, float p2) { float r = 1.0 - s; return 3.0 * r * r * s * p1 + 3.0 * r * s * s * p2 + s * s * s; }
float bezD(float s, float p1, float p2) { float r = 1.0 - s; return 3.0 * r * r * p1 + 6.0 * r * s * (p2 - p1) + 3.0 * s * s * (1.0 - p2); }
float ease(float x, vec4 e) {
  float s = x;
  for (int i = 0; i < 5; i++) s = clamp(s - (bez(s, e.x, e.z) - x) / max(bezD(s, e.x, e.z), 1e-3), 0.0, 1.0);
  return bez(s, e.y, e.w);
}
vec4 ramp(float t) {
  vec4 p1 = vec4(uC1.rgb * uC1.a, uC1.a), p2 = vec4(uC2.rgb * uC2.a, uC2.a), p3 = vec4(uC3.rgb * uC3.a, uC3.a);
  float k1 = clamp((t - uStops.x) / max(uStops.y - uStops.x, 1e-4), 0.0, 1.0);
  float k2 = clamp((t - uStops.y) / max(uStops.z - uStops.y, 1e-4), 0.0, 1.0);
  return mix(mix(p1, p2, k1), p3, k2);
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 base = (uv - uOrigin) * vec2(aspect, 1.0) * uTall;
  vec2 vel = texture(uVel, uv).xy * 2.0 - 1.0;
  vec2 pull = vec2(0.0);
  if (uPtrOn > 0.0 && uFollow > 0.0) {
    vec2 toP = (uPtr - uv) * vec2(aspect, 1.0);
    pull = toP * uFollow * uPtrOn * exp(-dot(toP, toP) * 10.0);
  }
  float s = shadeAt(base + vel * uDistort + pull);
  float sR = s, sB = s;
  if (uChroma > 0.0) {
    float m = length(vel);
    vec2 off = (vel / max(m, 1e-5)) * min(m * 0.06, 0.06) * uChroma;
    float ds = (dFdx(s) * off.x + dFdy(s) * off.y) * (uRes.y / uTall);
    sR = clamp(s + ds, 0.0, 1.0);
    sB = clamp(s - ds, 0.0, 1.0);
  }
  vec4 col = vec4(ramp(sR).r, ramp(s).g, ramp(sB).b, ramp(s).a);
  float axis = (uFromBottom > 0.5 ? uv.y : 1.0 - uv.y) * uTall;
  float endAt = min(uFadeB, uTall);
  col *= 1.0 - ease(clamp((axis - uFadeA) / max(endAt - uFadeA, 1e-4), 0.0, 1.0), uEase);
  if (uIrisOn > 0.5) {
    vec2 c = (uv - vec2(0.5, 1.0 + uIrisY)) * vec2(aspect / uIrisW, 1.0);
    float far = sqrt(0.25 * aspect * aspect + 1.0);
    float edge = length(c) + (warped(base * uScale + vec2(53.3, 71.9)) - 0.5) * uIrisN;
    float r = uIrisR * far;
    col *= smoothstep(r + uIrisF, r - uIrisF, edge);
  }
  if (uSpotOn > 0.5) {
    float bloom = uPtrOn * smoothstep(uSpotR + uSpotF, uSpotR - uSpotF, length((uv - uPtr) * vec2(aspect, 1.0)));
    col *= mix(uSpotOut, uSpotIn, bloom);
  }
  outColor = col;
}`;

  const nums = (v, fb) => String(v ?? fb).split(",").map(Number);

  // Resolve skin variables (including color-mix) to sRGB bytes — resolve to a hidden text color, paint onto a 1px canvas and read it back
  let probe, pctx;
  const rgba = (css) => {
    if (!probe) {
      probe = document.createElement("i");
      probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden";
      pctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    }
    document.body.append(probe);
    probe.style.color = "";
    probe.style.color = css;
    const solved = getComputedStyle(probe).color;
    probe.remove();
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = solved;
    pctx.fillRect(0, 0, 1, 1);
    const d = pctx.getImageData(0, 0, 1, 1).data;
    return d[3] ? [d[0] / d[3], d[1] / d[3], d[2] / d[3], d[3] / 255] : [0, 0, 0, 0];
  };

  kfFx.register("fbm-flow-band", (el, { options, reduce, hover }) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return;
    el.append(canvas);

    const o = {
      speed: +(options.speed ?? 0.15), morph: +(options.morph ?? 0.35), flow: +(options.flow ?? 0.75),
      scale: +(options.scale ?? 1.25), octaves: +(options.octaves ?? 4.5), warp: +(options.warp ?? 0.25),
      seed: +(options.seed ?? 0), stops: nums(options.stops, "0.2,0.85,1"), origin: nums(options.origin, "0.5,1"),
      fade: nums(options.fade, "0.35,1"), ease: nums(options.ease, "0.42,0,0.58,1"), fromBottom: options.from === "bottom",
      chroma: +(options.chroma ?? 0.15), distort: +(options.distort ?? 0.35), follow: +(options.follow ?? 0.15),
      dissip: +(options.dissip ?? 0.98), force: +(options.force ?? 1),
      spot: options.spot === "1" || options.spot === "on", spotIn: +(options["spot-center"] ?? 1), spotOut: +(options["spot-edge"] ?? 0.66),
      spotR: +(options["spot-radius"] ?? 0.35), spotF: +(options["spot-feather"] ?? 0.5),
      iris: +(options.iris ?? 0), irisW: +(options["iris-width"] ?? 2.5), irisN: +(options["iris-noise"] ?? 0.3),
      irisF: +(options["iris-feather"] ?? 0.4), irisY: +(options["iris-y"] ?? 1),
      res: +(options.res || 0.25), blur: +(options.blur ?? 6), ref: +(options.ref ?? 0),
    };
    // The measuring board is laid out wider by the blur amount so the blur doesn’t leave the edges empty
    canvas.style.setProperty("--fx-blur", `${o.blur}px`);

    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    for (let i = 0, n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS); i < n; i++) {
      const name = gl.getActiveUniform(prog, i).name;
      U[name] = gl.getUniformLocation(prog, name);
    }

    // Flow field — pushes by how far the cursor has passed and decays by dissip each frame (small grid, so it spreads on the CPU)
    const GW = 48, GH = 28;
    let vx = new Float32Array(GW * GH), vy = new Float32Array(GW * GH);
    const tx = new Float32Array(GW * GH), ty = new Float32Array(GW * GH);
    const bytes = new Uint8Array(GW * GH * 4);
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U.uVel, 0);

    const colors = () => {
      const cs = getComputedStyle(el);
      const pick = (n, fb) => (cs.getPropertyValue(`--fx-c${n}`).trim() || fb);
      gl.uniform4fv(U.uC1, rgba(pick(1, "color-mix(in oklab, var(--kf-accent) 22%, var(--kf-bg))")));
      gl.uniform4fv(U.uC2, rgba(pick(2, "color-mix(in oklab, var(--kf-accent) 50%, var(--kf-bg))")));
      gl.uniform4fv(U.uC3, rgba(pick(3, "color-mix(in oklab, var(--kf-accent) 70%, var(--kf-bg))")));
    };
    gl.uniform1f(U.uSpeed, o.speed); gl.uniform1f(U.uMorph, o.morph); gl.uniform1f(U.uFlow, o.flow);
    gl.uniform1f(U.uScale, o.scale); gl.uniform1f(U.uOct, o.octaves); gl.uniform1f(U.uWarp, o.warp); gl.uniform1f(U.uSeed, o.seed);
    gl.uniform3f(U.uStops, o.stops[0], o.stops[1], o.stops[2]);
    gl.uniform2f(U.uOrigin, o.origin[0], o.origin[1]);
    gl.uniform1f(U.uFadeA, o.fade[0]); gl.uniform1f(U.uFadeB, o.fade[1]);
    gl.uniform4f(U.uEase, o.ease[0], o.ease[1], o.ease[2], o.ease[3]);
    gl.uniform1f(U.uFromBottom, o.fromBottom ? 1 : 0);
    gl.uniform1f(U.uDistort, o.distort); gl.uniform1f(U.uChroma, o.chroma); gl.uniform1f(U.uFollow, o.follow);
    gl.uniform1f(U.uSpotOn, o.spot ? 1 : 0); gl.uniform1f(U.uSpotIn, o.spotIn); gl.uniform1f(U.uSpotOut, o.spotOut);
    gl.uniform1f(U.uSpotR, o.spotR); gl.uniform1f(U.uSpotF, o.spotF);
    gl.uniform1f(U.uIrisOn, o.iris > 0 ? 1 : 0); gl.uniform1f(U.uIrisR, o.iris); gl.uniform1f(U.uIrisW, o.irisW);
    gl.uniform1f(U.uIrisN, o.irisN); gl.uniform1f(U.uIrisF, o.irisF); gl.uniform1f(U.uIrisY, o.irisY);
    colors();

    let w = 0, h = 0;
    const size = () => {
      const r = el.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.max(2, Math.round(w * o.res));
      canvas.height = Math.max(2, Math.round(h * o.res));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTall, o.ref > 0 ? Math.max(1, h / o.ref) : 1);
      draw();
    };

    let ptr = [0.5, 0.5], last = null, engage = 0, inside = false, timeScale = 1;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (!inside) { last = null; return; }
      if (last) {
        const dx = (x - last[0]) * o.force * 60, dy = (y - last[1]) * o.force * 60;
        const cx = x * (GW - 1), cy = y * (GH - 1), rad = 3.2;
        for (let j = Math.max(0, Math.floor(cy - rad * 2)); j <= Math.min(GH - 1, Math.ceil(cy + rad * 2)); j++)
          for (let i = Math.max(0, Math.floor(cx - rad * 2)); i <= Math.min(GW - 1, Math.ceil(cx + rad * 2)); i++) {
            const k = Math.exp(-((i - cx) ** 2 + (j - cy) ** 2) / (rad * rad));
            vx[j * GW + i] += dx * k; vy[j * GW + i] += dy * k;
          }
      }
      last = [x, y];
      ptr = [x, y];
    };
    const leave = () => { inside = false; last = null; };
    if (hover && !reduce) {
      addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
    }

    const stepField = () => {
      let peak = 0;
      for (let j = 0; j < GH; j++)
        for (let i = 0; i < GW; i++) {
          const k = j * GW + i;
          const l = j * GW + Math.max(0, i - 1), r = j * GW + Math.min(GW - 1, i + 1);
          const d = Math.max(0, j - 1) * GW + i, u = Math.min(GH - 1, j + 1) * GW + i;
          tx[k] = (vx[k] * 4 + vx[l] + vx[r] + vx[d] + vx[u]) / 8 * o.dissip;
          ty[k] = (vy[k] * 4 + vy[l] + vy[r] + vy[d] + vy[u]) / 8 * o.dissip;
          peak = Math.max(peak, Math.abs(tx[k]), Math.abs(ty[k]));
        }
      vx.set(tx); vy.set(ty);
      for (let k = 0; k < GW * GH; k++) {
        bytes[k * 4] = Math.round((Math.max(-1, Math.min(1, vx[k])) * 0.5 + 0.5) * 255);
        bytes[k * 4 + 1] = Math.round((Math.max(-1, Math.min(1, vy[k])) * 0.5 + 0.5) * 255);
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GW, GH, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      return peak;
    };
    stepField();

    let clock = 0, prev = 0, raf = 0, seen = true;
    function draw() {
      gl.uniform1f(U.uTime, clock);
      gl.uniform2f(U.uPtr, ptr[0], ptr[1]);
      gl.uniform1f(U.uPtrOn, engage);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const frame = (now) => {
      raf = 0;
      if (!seen) return;
      const dt = prev ? Math.max(1, now - prev) / 1000 : 0;
      prev = now;
      clock += Math.min(dt, 0.1) * timeScale;
      engage += ((inside ? 1 : 0) - engage) * (1 - Math.exp(-dt * 6));
      stepField();
      draw();
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([en]) => {
      seen = en.isIntersecting;
      if (seen && !raf && !reduce) { prev = 0; raf = requestAnimationFrame(frame); }
    });
    io.observe(el);
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    if (reduce) draw();

    // Lets outside code make it flow quickly for a moment (the original’s acceleration on page transition) — el.dispatchEvent(new CustomEvent("fx:boost", { detail: { amount: 2.25 } }))
    const boost = (e) => {
      const amount = +(e.detail?.amount ?? 2.25);
      if (!window.gsap) return;
      const s = { v: 1 };
      gsap.timeline({ onUpdate: () => (timeScale = s.v) })
        .to(s, { v: 1 + amount, duration: 0.4, ease: kfFx.ease("0,0,0.58,1", "power1.out") })
        .to(s, { v: 1, duration: 4.6, ease: kfFx.ease("0.42,0,0.58,1", "sine.inOut") });
    };
    // Change the skin and the colors are re-read
    const recolor = () => { colors(); draw(); };
    el.addEventListener("fx:boost", boost);
    el.addEventListener("fx:recolor", recolor);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      el.removeEventListener("fx:boost", boost);
      el.removeEventListener("fx:recolor", recolor);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      vx = vy = null;
    };
  });
})();
