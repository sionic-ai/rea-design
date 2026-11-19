(() => {
  // Draws a single image (e.g. an alpha-cutout flower) as a panel of translucent, desaturated, sparkling grains, and only the spot touched by the pointer (or, with no pointer, a spot drifting on its own over the image)
  // Lights it in the clear, deep original colors like a lens. At first grains gather and the image forms (intro), and fx:dissolve can scatter it back into grains.
  const VERT = "attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}";
  const FRAG = `
precision highp float;
varying vec2 v;
uniform sampler2D img;
uniform vec2 res, lens, trail;
uniform vec4 rect;
uniform float hover, t, intro, gone, opa, sat, expo, grain, rad, warp, soft;
float hs(vec2 q) { vec3 r = fract(vec3(q.xyx) * .1031); r += dot(r, r.yzx + 33.33); return fract((r.x + r.y) * r.z); }
float vn(vec2 q) {
  vec2 i = floor(q), f = fract(q), u = f * f * (3. - 2. * f);
  return mix(mix(hs(i), hs(i + vec2(1., 0.)), u.x), mix(hs(i + vec2(0., 1.)), hs(i + 1.), u.x), u.y);
}
float fb(vec2 q) { float s = 0., k = .5; for (int i = 0; i < 4; i++) { s += k * vn(q); q = q * 2.07 + vec2(4.3, 1.9); k *= .5; } return s; }
vec4 tap(vec2 q) { return (q.x < 0. || q.y < 0. || q.x > 1. || q.y > 1.) ? vec4(0.) : texture2D(img, vec2(q.x, 1. - q.y)); }
void main() {
  vec2 ar = vec2(res.x / max(res.y, 1.), 1.);
  vec2 px = floor(v * res / 1.5);
  float k = fb(v * 5.3 + 11.) * .7 + hs(px * .5) * .3;
  vec2 q = (v - rect.xy) / rect.zw;
  q.y -= gone * .1 * k;
  float lr = .16 * rad;
  float L = (1. - smoothstep(lr * .25, lr, length((v - lens) * ar))) * hover;
  float Lt = (1. - smoothstep(lr * .2, lr * 1.3, length((v - trail) * ar))) * hover * .55;
  float lensAmt = max(L, Lt);
  float n1 = fb(v * 3.1 + vec2(t * .04, -t * .03)), n2 = fb(v * 3.1 + vec2(5.2, t * .05));
  q += (vec2(n1, n2) - .5) * warp * (1. + lensAmt * 2.);
  float o = soft * .03 * (1. - lensAmt * .7);
  vec4 c = tap(q) * .4 + (tap(q + vec2(o, 0.)) + tap(q - vec2(o, 0.)) + tap(q + vec2(0., o)) + tap(q - vec2(0., o))) * .15;
  if (c.a < .002) { gl_FragColor = vec4(0.); return; }
  vec3 col = c.rgb / c.a;
  float lum = dot(col, vec3(.299, .587, .114));
  vec3 milky = mix(mix(vec3(lum), col, sat) * expo, vec3(1.), .08);
  vec3 rgb = mix(milky, col, lensAmt);
  rgb += (1. - smoothstep(0., lr * .3, length((v - lens) * ar))) * hover * .28;
  float a = c.a * mix(opa, 1., lensAmt * .85);
  float g = hs(px + floor(t * 8.) * 7.13);
  a *= 1. - grain * .38 * (1. - g) * (1. - lensAmt * .6);
  rgb += step(.992, g) * .35 * grain * (1. - lensAmt);
  float rim = smoothstep(.05, .5, c.a) * (1. - smoothstep(.5, .95, c.a));
  a *= 1. - rim * grain * .5 * (1. - step(.6, g));
  a *= smoothstep(k - .12, k + .02, intro * 1.15);
  a *= 1. - smoothstep(k - .1, k + .1, gone * 1.2);
  gl_FragColor = vec4(clamp(rgb, 0., 1.) * a, a);
}`;

  kfFx.register("grain-lens-image", (el, { options, reduce, hover: canHover }) => {
    const src = el.querySelector(':scope > [data-fx-part="image"]');
    if (!src) return;
    const cv = document.createElement("canvas");
    cv.className = "fx-grain-canvas";
    cv.setAttribute("aria-hidden", "true");
    el.prepend(cv);
    const gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    const fail = () => { cv.remove(); };
    if (!gl) return fail;
    const sh = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { fail(); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uc = {}, U = (n) => (n in uc ? uc[n] : (uc[n] = gl.getUniformLocation(prog, n)));
    gl.uniform1i(U("img"), 0);
    const num = (k, d) => +(options[k] ?? d);
    gl.uniform1f(U("opa"), num("opacity", 0.68) * num("base", 0.8));
    gl.uniform1f(U("sat"), num("sat", 0.58));
    gl.uniform1f(U("expo"), num("exposure", 0.92));
    gl.uniform1f(U("grain"), num("grain", 0.86));
    gl.uniform1f(U("rad"), num("radius", 1.7));
    gl.uniform1f(U("warp"), num("warp", 0.018));
    gl.uniform1f(U("soft"), num("soft", 0.14));

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    for (const [p, val] of [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]]) gl.texParameteri(gl.TEXTURE_2D, p, val);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    // Spots for free-floating drift are picked only where the image is painted. A small alpha table is sampled in advance
    let alphaMap = null, ready = false, iw = 1, ih = 1;
    const upload = () => {
      iw = src.naturalWidth || src.width || 1; ih = src.naturalHeight || src.height || 1;
      if (iw < 2 || ih < 2) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); } catch { return; }
      const m = document.createElement("canvas"); m.width = 48; m.height = 48;
      const mc = m.getContext("2d", { willReadFrequently: true });
      try { mc.drawImage(src, 0, 0, 48, 48); alphaMap = mc.getImageData(0, 0, 48, 48).data; } catch { alphaMap = null; }
      ready = true;
      el.classList.add("fx-grain-ready");
    };
    if (src.tagName === "IMG" && !src.complete) src.addEventListener("load", upload, { once: true }); else upload();

    const mobile = () => innerWidth <= 768;
    let box = { x: 0, y: 0, w: 1, h: 1 }, W = 1, H = 1;
    const fit = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      const k = Math.max(0.75, Math.min(Math.min(devicePixelRatio || 1, mobile() ? 1.25 : 1.35), Math.sqrt(4.5e6 / (W * H))));
      cv.width = Math.round(W * k); cv.height = Math.round(H * k);
      gl.viewport(0, 0, cv.width, cv.height);
      const ia = iw / ih, ea = W / H;
      const sc = mobile() && options["scale-sm"] != null ? +options["scale-sm"] : num("scale", 1);
      const bw = (ia > ea ? W : H * ia) * sc, bh = (ia > ea ? W / ia : H) * sc;
      const ox = (mobile() && options["x-sm"] != null ? +options["x-sm"] : num("x", 0)) * W;
      const oy = (mobile() && options["y-sm"] != null ? +options["y-sm"] : num("y", 0)) * H;
      box = { x: (W - bw) / 2 + ox, y: (H - bh) / 2 + oy, w: bw, h: bh };
      // GL’s origin is at the bottom — pass the picture box as a ratio from the bottom
      gl.uniform4f(U("rect"), box.x / W, 1 - (box.y + bh) / H, bw / W, bh / H);
      gl.uniform2f(U("res"), cv.width, cv.height);
    };
    const alphaAt = (x, y) => {
      if (!alphaMap) return 1;
      const u = (x * W - box.x) / box.w, w = (y * H - box.y) / box.h;
      if (u < 0 || u > 1 || w < 0 || w > 1) return 0;
      return alphaMap[4 * (Math.min(47, Math.floor(w * 48)) * 48 + Math.min(47, Math.floor(u * 48))) + 3] / 255;
    };
    const s = { px: 0.5, py: 0.46, tx: 0.5, ty: 0.46, hx: 0.5, hy: 0.46, cx: 0.5, cy: 0.46, rx: 0.5, ry: 0.46, ax: 0.5, ay: 0.46, atx: 0.5, aty: 0.46, next: 0, on: 0, hv: 0.78, intro: 0, gone: 0 };
    const wander = (now) => {
      for (let i = 0; i < 40; i++) {
        const x = (box.x + (0.12 + 0.76 * Math.random()) * box.w) / W, y = (box.y + (0.07 + 0.68 * Math.random()) * box.h) / H;
        if (alphaAt(x, y) >= 0.12) { s.atx = x; s.aty = y; s.next = now + 2600 + 2600 * Math.random(); return; }
      }
      s.next = now + 1200;
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1 && alphaAt(x, y) >= 0.035;
      if (inside) { s.px = x; s.py = y; s.ax = s.atx = x; s.ay = s.aty = y; s.next = performance.now() + 2500; }
      s.on = inside ? 1 : 0;
    };
    const ac = new AbortController(), on = { signal: ac.signal };
    if (canHover) addEventListener("pointermove", move, { passive: true, signal: ac.signal });
    el.addEventListener("fx:dissolve", (e) => { s.gone = Math.max(0, Math.min(1, +(e.detail ?? 0))); if (reduce) draw(); }, on);

    let t = 0, last = 0, raf = 0, seen = false;
    const draw = () => {
      if (!ready) return;
      gl.uniform2f(U("lens"), s.cx, 1 - s.cy);
      gl.uniform2f(U("trail"), s.rx, 1 - s.ry);
      gl.uniform1f(U("hover"), s.hv);
      gl.uniform1f(U("t"), t);
      gl.uniform1f(U("intro"), s.intro);
      gl.uniform1f(U("gone"), s.gone);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    // Per-frame following converts the 60fps-based ratio to the actual frame interval — so it doesn’t go twice as fast on 120Hz screens
    const loop = (now) => {
      raf = 0;
      if (!seen) return;
      const dt = last ? Math.max(1, now - last) : 16.7; last = now;
      const f = Math.min(2, Math.max(0.25, dt / (1000 / 60))), ease = (k) => 1 - Math.pow(1 - k, f);
      t += dt / 1000;
      if (!s.on) {
        if (now >= s.next) wander(now);
        s.ax += (s.atx - s.ax) * ease(0.008); s.ay += (s.aty - s.ay) * ease(0.008);
      }
      const gx = s.on ? s.px : s.ax, gy = s.on ? s.py : s.ay;
      s.tx += (gx - s.tx) * ease(0.14); s.ty += (gy - s.ty) * ease(0.14);
      s.hx += (s.tx - s.hx) * ease(0.065); s.hy += (s.ty - s.hy) * ease(0.065);
      s.cx += (s.hx - s.cx) * ease(0.04); s.cy += (s.hy - s.cy) * ease(0.04);
      s.rx += (s.cx - s.rx) * ease(0.03); s.ry += (s.cy - s.ry) * ease(0.03);
      s.hv += ((s.on ? 1 : 0.78) - s.hv) * (s.on ? 0.13 : 0.025);
      draw();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; if (seen && !raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); } else if (seen && reduce) draw(); });
    io.observe(el);
    const ro = new ResizeObserver(() => { fit(); draw(); });
    ro.observe(el);
    fit();
    // start: if wait, defer the reveal until the loader finishes and fx:start is received
    let introTw = null;
    const begin = () => { if (introTw || reduce) return; introTw = gsap.to(s, { intro: 1, duration: num("intro", 6), delay: num("delay", 0.2), ease: options["intro-ease"] || "sine.out" }); };
    if (reduce) { s.intro = 1; s.hv = 0; draw(); }
    else if (options.start === "wait") el.addEventListener("fx:start", begin, { once: true, signal: ac.signal });
    else begin();
    el.addEventListener("fx:repaint", () => { upload(); fit(); draw(); }, on);
    return () => { ac.abort(); io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); introTw?.kill(); gl.getExtension("WEBGL_lose_context")?.loseContext(); cv.remove(); el.classList.remove("fx-grain-ready"); };
  });
})();
