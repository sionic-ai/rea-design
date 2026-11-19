(() => {
  /* Camera aperture loader — seven blades open and close inside a body circle (.3 of the shorter side) at screen center, with the photo (data-fx-part=Flips through the frame’s img) one at a time.
     One lap = 1.15 − 1.07 × progress^3.2 seconds (gets faster), wheel not open: front .34 cubic-out · middle stays open · back .34 cubic-in, rotation = Section×.35 + (1−open)×.95.
     After the full spin, the last sheet opens in .7s expo.out, and 1.1s later the hole and body grow to ×1.25 and ×1.3 of the screen diagonal over 1.5s expo.inOut, the inside of the hole turns transparent and the page behind is revealed */
  const VS = "attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
  const FS = `
    precision highp float;
    varying vec2 v;
    uniform vec2 uRes; uniform float uBody, uOpen, uRot, uBlur, uZoom, uBright, uClear, uFade, uBlades, uHas;
    uniform sampler2D uTex;
    void main() {
      vec2 p = v * uRes - 0.5 * uRes;
      float r = length(p), aa = 1.0 + uBlur, inside = -1e5, seam = 1e5;
      float k = 3.14159265 / uBlades;
      for (int i = 0; i < 12; i++) {
        if (float(i) >= uBlades) break;
        float a0 = uRot + float(i) * 2.0 * k;
        vec2 n = vec2(cos(a0), sin(a0)), t = vec2(-n.y, n.x);
        float d = dot(p, n) - uOpen * cos(k);
        inside = max(inside, d);
        vec2 vtx = n * uOpen * cos(k) + t * uOpen * sin(k);
        if (dot(p - vtx, t) > 0.0) seam = min(seam, abs(dot(p - vtx, n)));
      }
      float open = 1.0 - smoothstep(-aa, aa, inside);
      float body = 1.0 - smoothstep(uBody - 1.5, uBody + 1.5, r);
      float sheen = pow(0.5 + 0.5 * cos(atan(p.y, p.x) - 0.9 - uRot * 0.6), 3.0);
      vec3 blade = vec3(0.055 + 0.07 * sheen * smoothstep(0.0, uBody, r));
      blade *= 1.0 - 0.75 * (1.0 - smoothstep(0.5, 1.4 + uBlur, seam));
      blade += 0.14 * (1.0 - smoothstep(0.0, 1.6 + uBlur, abs(inside + 1.2))) * (1.0 - open);
      float ring = 1.0 - smoothstep(0.0, 1.5, abs(r - uBody + 1.0));
      vec2 uv = p / (uBody * 2.0 * uZoom) + 0.5;
      vec3 img = texture2D(uTex, vec2(uv.x, 1.0 - uv.y)).rgb;
      float l = dot(img, vec3(0.299, 0.587, 0.114));
      l = mix(l, l * l * (3.0 - 2.0 * l), 0.6) * uHas;
      vec3 col = mix(blade, vec3(l) * uBright, open) * body + ring * 0.06 * (1.0 - uClear);
      float alpha = 1.0 - open * uClear;
      gl_FragColor = vec4(col * alpha * uFade, alpha);
    }`;

  kfFx.register("aperture-loader-gl", (el, { options, reduce }) => {
    const done = () => { el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true })); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); el.style.display = "none"; };
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (reduce || !gl) { done(); return () => { el.style.display = ""; }; }
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    el.prepend(canvas);
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["uRes", "uBody", "uOpen", "uRot", "uBlur", "uZoom", "uBright", "uClear", "uFade", "uBlades", "uHas", "uTex"].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });
    const imgs = [...el.querySelectorAll('[data-fx-part="frame"]')].map((n) => (n.tagName === "IMG" ? n : n.querySelector("img"))).filter(Boolean);
    const tex = imgs.map((img) => {
      const t = gl.createTexture();
      const up = () => { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); ["TEXTURE_MIN_FILTER", "TEXTURE_MAG_FILTER"].forEach((f) => gl.texParameteri(gl.TEXTURE_2D, gl[f], gl.LINEAR)); ["TEXTURE_WRAP_S", "TEXTURE_WRAP_T"].forEach((f) => gl.texParameteri(gl.TEXTURE_2D, gl[f], gl.CLAMP_TO_EDGE)); t.ok = true; };
      if (img.complete && img.naturalWidth) up(); else img.addEventListener("load", up, { once: true });
      return t;
    });
    const s = { body: 100, open: 0, rot: 0, blur: 0, zoom: 1, bright: 1, clear: 0, fade: 0, frame: 0 };
    const blades = Math.max(5, Math.min(12, +options.blades || 7));
    const run = +(options.run ?? 3.4), hold = +(options.hold ?? 1.1), grow = +(options.grow ?? 1.5);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let W = 0, H = 0, final = false, raf = 0, last = performance.now(), prog01 = 0, loop = 0, prev = 0, tl = null;
    const size = () => { W = el.clientWidth || innerWidth; H = el.clientHeight || innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; gl.viewport(0, 0, canvas.width, canvas.height); if (!final) s.body = Math.min(W, H) * 0.3 * dpr; };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    const outC = (x) => 1 - (1 - x) ** 3, inC = (x) => x ** 3;
    const T = (x) => (x < 0.34 ? outC(x / 0.34) : x < 0.66 ? 1 : 1 - inC((x - 0.66) / 0.34));
    gsap.to(s, { fade: 1, duration: 0.7, ease: "power2.out" });
    function draw() {
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      const t = tex.length ? tex[s.frame % tex.length] : null;
      gl.uniform1f(U.uHas, t && t.ok ? 1 : 0);
      if (t) gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uBody, s.body); gl.uniform1f(U.uOpen, s.open); gl.uniform1f(U.uRot, s.rot); gl.uniform1f(U.uBlur, s.blur);
      gl.uniform1f(U.uZoom, s.zoom); gl.uniform1f(U.uBright, s.bright); gl.uniform1f(U.uClear, s.clear); gl.uniform1f(U.uFade, s.fade); gl.uniform1f(U.uBlades, blades);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function step(now) {
      raf = requestAnimationFrame(step);
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
      last = now;
      if (!final) {
        prog01 = Math.min(1, prog01 + dt / run);
        loop += dt / (1.15 - 1.07 * prog01 ** 3.2);
        if (loop >= 1) { if (prog01 >= 1) finish(); else { loop -= 1; s.frame++; } }
        if (!final) {
          const a = T(loop);
          s.open = a * s.body * 0.94; s.rot = s.frame * 0.35 + (1 - a) * 0.95;
          s.blur = Math.min(6, (Math.abs(a - prev) / Math.max(dt, 1e-4)) * 0.9) * dpr; prev = a;
          s.zoom = 1.1 - 0.08 * loop; s.bright = 1 + 0.35 * Math.max(0, 1 - loop / 0.2) * (loop < 0.34 ? 1 : 0);
        }
      }
      draw();
    }
    function finish() {
      final = true;
      const diag = Math.hypot(W, H) * dpr * 0.5;
      s.blur = 0; s.zoom = 1.12; s.frame = Math.max(0, tex.length - 1);
      tl = gsap.timeline({ onComplete: () => { cancelAnimationFrame(raf); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); el.style.display = "none"; } });
      tl.fromTo(s, { open: 0 }, { open: s.body * 0.94, duration: 0.7, ease: "expo.out" }, 0);
      tl.to(s, { rot: s.rot - 0.95, duration: 0.7, ease: "expo.out" }, 0);
      tl.fromTo(s, { bright: 1.35 }, { bright: 1, duration: 0.5, ease: "power2.out" }, 0);
      tl.to(s, { zoom: 1.04, duration: 1.5, ease: "power1.out" }, 0);
      tl.call(() => { el.style.background = "transparent"; }, null, hold);
      tl.to(s, { open: diag * 1.25, body: diag * 1.3, zoom: 1.6, duration: grow, ease: "expo.inOut" }, hold);
      tl.to(s, { rot: `-=1.4`, duration: grow, ease: "expo.inOut" }, hold);
      tl.to(s, { clear: 1, duration: grow * 0.45, ease: "power2.inOut" }, hold + grow * 0.3);
      tl.call(() => el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true })), null, hold + grow * 0.42);
    }
    draw();
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf); tl && tl.kill(); ro.disconnect(); canvas.remove();
      tex.forEach((t) => gl.deleteTexture(t)); gl.deleteBuffer(buf); gl.deleteProgram(prog);
      el.style.display = ""; el.style.background = "";
    };
  });
})();
