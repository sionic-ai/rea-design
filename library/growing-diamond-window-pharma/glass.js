// Glass shapes — a WebGL canvas sits over each [data-glass] panel and refracts the backdrop (color·text) through a beveled glass circle or rectangle (center hole).
// Original values: refraction index 1.45 · refraction 70 · dispersion .06 · fresnel .35 · reflection 1.1 · circle bevel 26 · square bevel 5.7 (per 100) · tilt .28 (process row .4).
// When the cursor moves the plate tilts toward it, the light spot·refraction follow and settle within 1 second. On touch devices or without WebGL it falls back to flat glass (.glass-flat).
(() => {
  const P = { ior: 1.45, refraction: 70, dispersion: 0.06, fresnel: 0.35, reflections: 1.1, depth: 8, circleBevel: 26, squareBevel: 5.7, tilt: 0.28 };
  const VS = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FS = `precision highp float;
varying vec2 v;
uniform sampler2D u_tex; uniform vec2 u_res; uniform float u_shape, u_bevel, u_hole, u_rad, u_refr, u_disp, u_fres, u_refl, u_ior, u_depth;
uniform vec2 u_tilt; uniform vec3 u_tint;
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
float sdf(vec2 p){
  float R = min(u_res.x, u_res.y) * .5 - 2.;
  if (u_shape < .5) return length(p) - R;
  float box = sdBox(p, vec2(R), R * u_rad * 2.);
  return max(box, R * u_hole - length(p));
}
void main(){
  vec2 px = (v - .5) * u_res;
  float d = sdf(px);
  if (d > 1.) { gl_FragColor = vec4(0.); return; }
  vec2 e = vec2(1., 0.);
  vec2 g = normalize(vec2(sdf(px + e.xy) - sdf(px - e.xy), sdf(px + e.yx) - sdf(px - e.yx)) + 1e-5);
  float t = clamp(-d / u_bevel, 0., 1.);
  float s = 1. - t;
  vec3 n = normalize(vec3(g * s * 1.6, sqrt(max(1. - s * s, 0.)) + .15));
  n.xy += u_tilt * .35;
  n = normalize(n);
  vec2 off = -n.xy * u_refr * (1. - 1. / u_ior) * 2. + u_tilt * u_depth;
  vec2 uv = v + off / u_res;
  float r = texture2D(u_tex, uv + off * u_disp / u_res).r;
  float gg = texture2D(u_tex, uv).g;
  float b = texture2D(u_tex, uv - off * u_disp / u_res).b;
  vec3 col = vec3(r, gg, b) * mix(vec3(1.), u_tint, .55);
  float fr = u_fres * pow(1. - clamp(n.z, 0., 1.), 2.2);
  vec3 L = normalize(vec3(-.45 + u_tilt.x * 1.4, .55 + u_tilt.y * 1.4, .9));
  float spec = pow(max(dot(reflect(-L, n), vec3(0., 0., 1.)), 0.), 24.) * u_refl * .55;
  float rim = smoothstep(1.4, 0., abs(d)) * .28 + smoothstep(2.2, 0., abs(d + u_bevel)) * .06 * s;
  col = mix(col, u_tint, clamp(fr + spec + rim, 0., 1.));
  float a = clamp(.5 - d, 0., 1.);
  gl_FragColor = vec4(col * a, a);
}`;

  const live = new Map();
  let ticking = false, mx = 0, my = 0, moved = 0;
  const can = () => matchMedia("(hover: hover) and (pointer: fine)").matches && !!document.createElement("canvas").getContext("webgl");
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; moved = performance.now(); }, { passive: true });

  function bgOf(el) {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !/rgba\(.*,\s*0\)$/.test(c) && c !== "transparent") return c;
    }
    return getComputedStyle(document.body).backgroundColor;
  }
  // Copies the text behind onto a 2D canvas in place of each word, so the glass refracts the actual letters
  function paintBackdrop(o) {
    const { host, cv2, ctx2, dpr } = o;
    const hr = o.canvas.getBoundingClientRect();
    ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx2.fillStyle = o.bg;
    ctx2.fillRect(0, 0, hr.width, hr.height);
    if (o.mode === "bg") return;
    const root = host.closest("section, footer") || host.parentElement;
    // On file:// drawing video taints the canvas so it can’t be uploaded as a texture — in that case only background and text
    if (location.protocol !== "file:") root.querySelectorAll("[data-glass-media]").forEach((m) => {
      const r = m.getBoundingClientRect();
      if (r.right < hr.left || r.left > hr.right || r.bottom < hr.top || r.top > hr.bottom) return;
      if (m.tagName === "VIDEO" && m.readyState < 2) return;
      try { ctx2.drawImage(m, r.left - hr.left, r.top - hr.top, r.width, r.height); } catch (e) { /* Versions not yet drawable get background only */ }
    });
    root.querySelectorAll("[data-glass-text]").forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || +cs.opacity === 0) return;
      ctx2.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx2.fillStyle = cs.color;
      ctx2.textBaseline = "alphabetic";
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let tn = walker.nextNode(); tn; tn = walker.nextNode()) {
        const text = tn.textContent;
        const re = /\S+/g;
        for (let m = re.exec(text); m; m = re.exec(text)) {
          range.setStart(tn, m.index); range.setEnd(tn, m.index + m[0].length);
          const r = range.getBoundingClientRect();
          if (r.right < hr.left || r.left > hr.right || r.bottom < hr.top || r.top > hr.bottom) continue;
          const mt = ctx2.measureText(m[0]);
          const asc = mt.fontBoundingBoxAscent ?? r.height * 0.8;
          const desc = mt.fontBoundingBoxDescent ?? r.height * 0.2;
          ctx2.fillText(m[0], r.left - hr.left, r.top - hr.top + (r.height - asc - desc) / 2 + asc);
        }
      }
    });
  }

  function make(host) {
    const shape = host.dataset.glass === "square" ? 1 : 0;
    const canvas = document.createElement("canvas");
    canvas.className = "glass-gl";
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const U = (n) => gl.getUniformLocation(prog, n);
    const u = Object.fromEntries(["u_res", "u_shape", "u_bevel", "u_hole", "u_rad", "u_refr", "u_disp", "u_fres", "u_refl", "u_ior", "u_depth", "u_tilt", "u_tint"].map((n) => [n, U(n)]));
    host.append(canvas);
    const cv2 = document.createElement("canvas");
    const o = { host, canvas, gl, u, tex, cv2, ctx2: cv2.getContext("2d"), shape, mode: host.dataset.glassBackdrop || "bg", tilt: [0, 0], cur: [0, 0], seen: false, w: 0, h: 0, dpr: 1, last: "", tiltAmt: +(host.dataset.glassTilt ?? P.tilt) };
    o.io = new IntersectionObserver(([en]) => (o.seen = en.isIntersecting));
    o.io.observe(host);
    o.ro = new ResizeObserver(() => (o.w = 0));
    o.ro.observe(host);
    return o;
  }

  function frame(o) {
    const { gl, u, canvas } = o;
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    if (!o.w || Math.abs(o.w - r.width) > 0.5 || Math.abs(o.h - r.height) > 0.5) {
      o.dpr = Math.min(devicePixelRatio || 1, 2);
      o.w = r.width; o.h = r.height;
      canvas.width = o.cv2.width = Math.round(r.width * o.dpr);
      canvas.height = o.cv2.height = Math.round(r.height * o.dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      o.bg = bgOf(o.host.parentElement);
      const t = window.PB.rgb("--site-glass-tint");
      gl.uniform3f(u.u_tint, t[0], t[1], t[2]);
      gl.uniform2f(u.u_res, canvas.width, canvas.height);
      gl.uniform1f(u.u_shape, o.shape);
      const size = Math.min(canvas.width, canvas.height);
      gl.uniform1f(u.u_bevel, o.shape ? (P.squareBevel / 100) * size * 1.6 : (P.circleBevel / 400) * size * 1.6);
      gl.uniform1f(u.u_hole, 0.88);
      gl.uniform1f(u.u_rad, 0.12467);
      gl.uniform1f(u.u_refr, (P.refraction / 400) * size * 0.35);
      gl.uniform1f(u.u_disp, P.dispersion * 4);
      gl.uniform1f(u.u_fres, P.fresnel);
      gl.uniform1f(u.u_refl, P.reflections);
      gl.uniform1f(u.u_ior, P.ior);
      gl.uniform1f(u.u_depth, P.depth * o.dpr);
      o.last = "";
    }
    // Tilts by how far the cursor is from the panel center (divided by screen size), and each frame follows .08 of the remaining distance.
    const idle = performance.now() - moved > 900;
    const tx = idle ? 0 : gsap.utils.clamp(-1, 1, (mx - (r.left + r.width / 2)) / (innerWidth / 2)) * o.tiltAmt;
    const ty = idle ? 0 : gsap.utils.clamp(-1, 1, -(my - (r.top + r.height / 2)) / (innerHeight / 2)) * o.tiltAmt;
    o.cur[0] += (tx - o.cur[0]) * 0.08;
    o.cur[1] += (ty - o.cur[1]) * 0.08;
    const key = `${Math.round(r.left)},${Math.round(r.top)},${o.cur[0].toFixed(4)},${o.cur[1].toFixed(4)}`;
    if (key === o.last && o.mode === "bg") return;
    o.last = key;
    paintBackdrop(o);
    gl.bindTexture(gl.TEXTURE_2D, o.tex);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, o.cv2); } catch (e) {
      o.mode = "bg"; o.cv2 = document.createElement("canvas"); o.ctx2 = o.cv2.getContext("2d"); o.w = 0; return;
    }
    gl.uniform2f(u.u_tilt, o.cur[0], o.cur[1]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  const tick = () => live.forEach((o) => o.seen && frame(o));

  window.PBGlass = {
    mount(scope) {
      if (!can()) return;
      document.documentElement.classList.add("has-glass-gl");
      scope.querySelectorAll("[data-glass]").forEach((h) => {
        if (live.has(h)) return;
        const o = make(h);
        if (o) { live.set(h, o); frame(o); }
      });
      if (!ticking && live.size) { ticking = true; gsap.ticker.add(tick); }
    },
    unmount(scope) {
      [...live.keys()].forEach((h) => {
        if (scope && !scope.contains(h) && h.isConnected) return;
        const o = live.get(h);
        o.io.disconnect(); o.ro.disconnect();
        o.gl.getExtension("WEBGL_lose_context")?.loseContext();
        o.canvas.remove();
        live.delete(h);
      });
    },
  };
})();
