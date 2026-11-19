// A veil over the panel has a noisy round hole punched in it so the scene below shows through (WebGL). On load the hole goes -.1 → .35 (1s circ.out),
// Hovering the enter button opens it to .45 (.5s power2.out), pressing opens it to 1.5 (5s expo.out) so the curtain disappears. Radius = Progress² + noise × .1 × progress (screen width units)
(() => {
  const FRAG = `precision highp float;
    uniform float uProgress, uSize, uTime; uniform vec2 uUnit; uniform vec3 uColor; varying vec2 vUv;
    vec4 perm(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 tis(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v){
      const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
      i = mod(i, 289.0);
      vec4 p = perm(perm(perm(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      vec3 ns = 0.142857142857 * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = tis(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    void main(){
      vec2 o = (vUv - .5) * uUnit;
      float s = max(abs(uProgress), 1e-5);
      float c = length(o / s);
      float a = sin(uProgress) * 2.0;
      vec2 l = mat2(cos(a), -sin(a), sin(a), cos(a)) * o;
      float u = snoise(vec3(l * uSize, uTime * .15));
      float d = c - uProgress;
      float f = max(fwidth(d), 1e-5);
      gl_FragColor = vec4(uColor, smoothstep(-f, f, d - u * .1));
    }`;
  const VERT = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }";

  kfFx.register("iris-gate", (el, { options, reduce }) => {
    const enter = el.querySelector("[data-fx-part=enter]");
    const cv = document.createElement("canvas");
    cv.className = "fx-iris";
    cv.setAttribute("aria-hidden", "true");
    el.append(cv);
    const gl = cv.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    const off = () => cv.remove();
    if (!gl || !gl.getExtension("OES_standard_derivatives")) return off;
    const sh = (type, code) => { const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, "#extension GL_OES_standard_derivatives : enable\n" + FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return off;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const U = (n) => gl.getUniformLocation(prog, n);
    const uP = U("uProgress"), uS = U("uSize"), uT = U("uTime"), uUnit = U("uUnit"), uC = U("uColor");
    // Curtain color is the skin’s background color — since it is a canvas, read it by sampling one point of the computed color
    const tint = () => {
      const c = document.createElement("canvas").getContext("2d");
      c.fillStyle = getComputedStyle(cv).color;
      c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data;
      gl.uniform3f(uC, d[0] / 255, d[1] / 255, d[2] / 255);
    };
    tint();
    gl.uniform1f(uS, +(options.size ?? 15));
    const state = { p: +(options.start ?? -0.1) };
    const size = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
      cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uUnit, 1, r.height / Math.max(1, r.width));
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    let raf = 0, done = false;
    const t0 = performance.now();
    const draw = (now) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uP, state.p);
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = done ? 0 : requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const idle = +(options.idle ?? 0.35), hoverTo = +(options.hover ?? 0.45), open = +(options.open ?? 1.5);
    const intro = gsap.to(state, { p: idle, duration: reduce ? 0 : +(options["intro-dur"] ?? 1), ease: "circ.out", delay: +(options.delay ?? 0) });
    let hov = null;
    const over = () => { hov?.kill(); hov = gsap.to(state, { p: hoverTo, duration: reduce ? 0 : 0.5, ease: "power2.out" }); };
    const out = () => hov?.reverse();
    const go = () => {
      hov?.kill();
      intro.kill();
      el.classList.add("is-fx-open");
      gsap.to(state, { p: open, duration: reduce ? 0 : +(options["open-dur"] ?? 5), ease: "expo.out", onComplete: () => { done = true; cv.hidden = true; } });
    };
    if (enter) { enter.addEventListener("mouseenter", over); enter.addEventListener("mouseleave", out); enter.addEventListener("click", go); }
    el.addEventListener("fx:open", go);
    return () => {
      done = true; cancelAnimationFrame(raf); ro.disconnect(); gsap.killTweensOf(state); hov?.kill();
      if (enter) { enter.removeEventListener("mouseenter", over); enter.removeEventListener("mouseleave", out); enter.removeEventListener("click", go); }
      el.removeEventListener("fx:open", go); el.classList.remove("is-fx-open");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      cv.remove();
    };
  });
})();
