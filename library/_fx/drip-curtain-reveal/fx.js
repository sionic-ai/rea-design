// Chocolate curtain — draws and paints one signed distance field on a single full panel quad (the curtain’s bottom edge softly merged with drop capsules). Drop tips follow the curtain height late
(() => {
  const FRAG = `
    precision highp float;
    uniform float uT, uDur, uRise, uLift, uSweep; uniform vec2 uRes; uniform vec3 uDark, uLit; varying vec2 vUv;
    #define N 32
    uniform float uN;
    float hash(float n){ return fract(sin(n * 127.1) * 43758.5453); }
    float ease(float a){ a = clamp(a, 0., 1.); return a < .5 ? 2. * a * a : 1. - pow(-2. * a + 2., 2.) / 2.; }
    float baseAt(float t){ return mix(.085 + .008 * sin(t * 1.7), 1.22, ease((t - uRise) / max(uLift, .001))) + .387 * pow(clamp((t / uDur - .86) / .14, 0., 1.), 3.); }
    float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.) / k; return min(a, b) - h * h * k * .25; }
    float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h); }
    void main(){
      float asp = uRes.x / uRes.y;
      vec2 p = vec2(vUv.x * asp, vUv.y);
      float b = baseAt(uT);
      float d = b - p.y;
      float sweep = uSweep > 0. ? (1. - pow(1. - clamp(uT / uSweep, 0., 1.), 3.)) * (asp + .3) - .15 + .05 * sin(p.y * 9.) : asp + 1.;
      d = max(d, p.x - sweep);
      for (int i = 0; i < N; i++) {
        float fi = float(i);
        if (fi >= uN) break;
        float x = (fi + .5) / uN * asp + (hash(fi) - .5) * asp / uN * .8;
        float r = mix(.016, .04, hash(fi + 3.1));
        float lag = mix(.16, .46, hash(fi + 7.7));
        float grow = smoothstep(0., 1., uT - .4 - hash(fi + 5.) * .7);
        float tip = mix(b, min(baseAt(uT - lag), b) - mix(.0, .08, hash(fi + 11.3)) - r, grow);
        float k = smoothstep(b + .05, tip, p.y);
        float dc = seg(p, vec2(x, b + .05), vec2(x, tip)) - r * (.45 + .7 * pow(k, 1.6));
        dc = max(dc, p.x - sweep - r);
        d = smin(d, dc, .05);
      }
      float px = 1.25 / uRes.y;
      float alpha = smoothstep(px, -px, d);
      if (alpha <= 0.) discard;
      vec2 g = vec2(dFdx(d), dFdy(d)) * uRes.y;
      float bead = 1. - smoothstep(0., .05, -d);
      vec3 n = normalize(vec3(-g * bead * 1.6, 1.));
      float fold = .5 + .5 * sin(p.x * 23. + sin(p.x * 6.3 + uT * .5) * 2.2);
      fold = mix(fold, .5 + .5 * sin(p.x * 57. + 1.3), .3);
      vec3 c = mix(uDark, uLit, .2 + .42 * fold * (1. - bead * .5));
      vec3 L = normalize(vec3(-.45, .55, .7));
      float diff = clamp(dot(n, L), 0., 1.);
      float spec = pow(clamp(dot(reflect(-L, n), vec3(0., 0., 1.)), 0., 1.), 24.);
      c = c * (.62 + .55 * diff) + spec * .65 * uLit + bead * .1 * uLit;
      gl_FragColor = vec4(c * alpha, alpha);
    }`;
  const VERT = "attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = aPos * .5 + .5; gl_Position = vec4(aPos, 0., 1.); }";
  const rgbOf = (el, name, fallback) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name}, ${fallback})`;
    el.appendChild(probe);
    const c = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
    c.fillStyle = getComputedStyle(probe).color;
    c.fillRect(0, 0, 1, 1);
    probe.remove();
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("drip-curtain-reveal", (el, { options, reduce }) => {
    const done = () => { el.setAttribute("data-drip-done", ""); el.dispatchEvent(new CustomEvent("fx-done")); };
    if (reduce) { done(); return () => el.removeAttribute("data-drip-done"); }
    const o = { dur: +(options.dur ?? 5.5), rise: +(options.rise ?? 1.3), lift: +(options.lift ?? 2.1), sweep: +(options.sweep ?? 0.7), drips: Math.max(1, Math.min(32, +options.drips || 15)), delay: +(options.delay ?? 0) };
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-drip-canvas", "");
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    const ext = gl && gl.getExtension("OES_standard_derivatives");
    if (!gl || !ext) { done(); return () => el.removeAttribute("data-drip-done"); }
    el.prepend(canvas);
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, "#extension GL_OES_standard_derivatives : enable\n" + FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const U = (n) => gl.getUniformLocation(prog, n);
    const dark = rgbOf(el, "--fx-drip", "var(--kf-ink)");
    const lit = rgbOf(el, "--fx-drip-lit", "color-mix(in oklab, var(--kf-ink) 50%, var(--kf-bg))");
    gl.uniform3fv(U("uDark"), dark);
    gl.uniform3fv(U("uLit"), lit);
    gl.uniform1f(U("uDur"), o.dur); gl.uniform1f(U("uRise"), o.rise); gl.uniform1f(U("uLift"), o.lift); gl.uniform1f(U("uSweep"), o.sweep); gl.uniform1f(U("uN"), o.drips);
    const uT = U("uT"), uRes = U("uRes");
    const title = el.querySelector('[data-fx-part="title"]');
    const ease = (a) => { a = Math.min(1, Math.max(0, a)); return a < 0.5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2; };
    const baseAt = (t) => 0.085 + (1.22 - 0.085) * ease((t - o.rise) / Math.max(o.lift, 0.001)) + 0.387 * Math.pow(Math.min(1, Math.max(0, (t / o.dur - 0.86) / 0.14)), 3);
    let w = 0, h = 0;
    const size = () => {
      const r = el.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = Math.max(1, Math.round(r.width * dpr)); h = Math.max(1, Math.round(r.height * dpr));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    let start = null, raf = 0, last = 0, finished = false;
    const draw = (t) => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (title) title.style.transform = `translateY(${-(baseAt(t) - baseAt(0)) * el.clientHeight}px)`;
    };
    const tick = (now) => {
      if (start === null) start = now + o.delay * 1000;
      last = now;
      const t = (now - start) / 1000;
      if (t >= 0) draw(t);
      if (t > o.dur + 0.1) { finished = true; canvas.remove(); done(); return; }
      raf = requestAnimationFrame(tick);
    };
    draw(0);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      el.removeAttribute("data-drip-done");
      if (title) title.style.removeProperty("transform");
      void finished; void last;
    };
  });
})();
