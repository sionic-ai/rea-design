(() => {
  kfFx.register("sine-wave-edge", (el, { options, reduce, scroller }) => {
    const canvas = document.createElement("canvas");
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl");
    if (!gl) { canvas.remove(); return; }
    const probe = document.createElement("i");
    el.appendChild(probe);
    const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    px.canvas.width = px.canvas.height = 1;
    const rgb = (v) => { probe.style.color = `var(${v})`; px.clearRect(0, 0, 1, 1); px.fillStyle = getComputedStyle(probe).color; px.fillRect(0, 0, 1, 1); return [...px.getImageData(0, 0, 1, 1).data].slice(0, 3).map((n) => n / 255); };
    const fs = `precision mediump float;
      uniform float uTime; uniform vec2 uRes; uniform vec3 uFill; uniform vec3 uBand; uniform vec3 uBg; uniform float uSlope; uniform float uBandW;
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        float x = uv.x * 4.6, t = -uTime * 1.65;
        float edge = ((uv.y - 0.8) * 2.6 + (uv.x - 0.1) * 1.8 * uSlope) * 45.0 + sin(t);
        edge += sin(x * 1.47 + t) * 4.5 + sin(x * 1.204 + t * 1.121) * 4.0 + sin(x * 1.5547 + t * 3.437) * 4.0 + sin(x * 2.17854 + t * 4.269) * 5.0;
        float band = edge + sin(x * 0.56 + t * 3.5) * 2.2 + sin(x * 0.49 + t * 5.25) * 1.5;
        vec3 col = abs(band - uv.y) < 3.333 * uBandW ? uBand : uFill;
        gl_FragColor = vec4(edge < 0.0 ? col : uBg, 1.0);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prg = gl.createProgram();
    gl.attachShader(prg, sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }"));
    gl.attachShader(prg, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prg);
    gl.useProgram(prg);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prg, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prg, n);
    gl.uniform3fv(u("uFill"), rgb("--fx-wave-fill"));
    gl.uniform3fv(u("uBand"), rgb("--fx-wave-band"));
    gl.uniform3fv(u("uBg"), rgb("--fx-wave-bg"));
    gl.uniform1f(u("uSlope"), +(options.slope ?? 1));
    gl.uniform1f(u("uBandW"), +(options.band ?? 1));
    const speed = +(options.speed ?? 1);
    const start = performance.now();
    const draw = () => { gl.uniform1f(u("uTime"), (performance.now() - start) * 1e-4 * speed); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    const size = () => { canvas.width = Math.max(1, el.clientWidth); canvas.height = Math.max(1, el.clientHeight); gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(u("uRes"), canvas.width, canvas.height); draw(); };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    let on = false, skip = 0, limit = 2;
    const tick = () => { if (!on || reduce) return; if (skip++ < limit) return; skip = 0; draw(); };
    gsap.ticker.add(tick);
    let st;
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ scroller, trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => { on = s.isActive; }, onUpdate: (s) => { limit = s.progress >= 0.9 ? 3 : 2; } });
    } else on = true;
    return () => { gsap.ticker.remove(tick); st?.kill(); ro.disconnect(); gl.deleteProgram(prg); gl.deleteBuffer(buf); canvas.remove(); probe.remove(); };
  });
})();
