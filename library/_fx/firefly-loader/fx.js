(() => {
  // First loader — seven fireflies are born at 2.185s intervals over a background-color curtain and drift around the center of the curtain (47%, 56% from the bottom) (.285)
  // Blinks at about .47Hz (on for 45% of the cycle, peaks at .28). Below are the wordmark and the loaded share (%). When the page is fully loaded (or fx:ready)
  // After filling .62s from the start, the curtain lifts upward with .9s cubic-bezier(.2,.8,.2,1). After 6.5s it just lifts anyway
  const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }";
  const FRAG = `precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec3 uCore, uHalo, uBg;
float hash(float n){ return fract(sin(n) * 43758.5453); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; float asp = uRes.x / max(uRes.y, 1.);
  vec2 p = vec2(uv.x * asp, uv.y), c = vec2(.4715 * asp, .5648); float t = uTime;
  vec3 light = vec3(0.); float cover = 0.;
  for (int i = 0; i < 7; i++) {
    float fi = float(i), born = i == 0 ? -.8 : fi * 2.185, age = t - born;
    if (age <= 0.) continue;
    float grow = smoothstep(0., 1.9, age), a = hash(fi * 13.1 + 2.7), b = hash(fi * 79.4 + 5.1), s = hash(fi * 47.9 + 8.7), tm = t * .28;
    vec2 base = vec2(a - .5, b - .5) * 1.5 * .285;
    vec2 wander = vec2(sin(tm * (.65 + .35 * a) + a * 9.) * .55 + sin(tm * (1.25 + .4 * b) + b * 17.) * .3 + sin(tm * (.22 + .12 * s) + s * 5.) * .15,
                       cos(tm * (.58 + .32 * b) + b * 7.) * .55 + cos(tm * (1.15 + .45 * s) + s * 13.) * .3 + cos(tm * (.18 + .1 * a) + a * 3.) * .15) * .285;
    float tf = t * (1.8 + s * .9);
    float d = length(p - (c + base + wander + vec2(sin(tf + a * 4.) * .007, cos(tf * 1.25 + b * 3.5) * .011)));
    float ph = fract(t * .465 * (.8 + .42 * b) + a * 6.71), flash = 0.;
    if (ph < .45) { float n = ph / .45; flash = pow(smoothstep(0., .28, n) * (1. - smoothstep(.28, 1., n)), 1.35); }
    float glow = mix(.07 + .05 * (.5 + .5 * sin(t * 1.4 + s * 2.5)), 1., flash) * grow, r = .01 * (.72 + .52 * s);
    float core = pow(1. - smoothstep(0., r * .38, d), 2.2), inner = exp(-(d * d) / (r * r * 1.15));
    float outer = (r * .11) / (d + r * .38) * (1. - smoothstep(r * 3.5, r * 11.5, d));
    light += (uCore * 1.4 * (core * 2.6 + inner * .85) + uHalo * (inner * .45 + outer * .55)) * glow;
    cover += (core + inner * .75 + outer * .35) * glow;
  }
  gl_FragColor = vec4(clamp(mix(uBg, light / max(cover, .001), clamp(cover, 0., 1.)), 0., 1.), 1.);
}`;
  kfFx.register("firefly-loader", (el, { options, reduce }) => {
    const num = (k, d) => +(options[k] ?? d);
    const dur = num("dur", 0.9), min = num("min", 0.62), max = num("max", 6.5);
    const pct = el.querySelector('[data-fx-part="pct"]');
    const canvas = document.createElement("canvas");
    canvas.className = "fx-firefly-loader__canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false, depth: false });
    const probe = document.createElement("i");
    const rgb = (v) => { probe.hidden = true; el.append(probe); probe.style.color = `var(${v})`; const s = getComputedStyle(probe).color; probe.remove(); const c = document.createElement("canvas").getContext("2d"); c.fillStyle = s; c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };
    let raf = 0, alive = true;
    const t0 = performance.now();
    if (gl) {
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
      if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
        gl.useProgram(pr);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const U = (n) => gl.getUniformLocation(pr, n);
        gl.uniform3fv(U("uCore"), rgb("--fx-core")); gl.uniform3fv(U("uHalo"), rgb("--fx-halo")); gl.uniform3fv(U("uBg"), rgb("--fx-bg"));
        const draw = (now) => {
          if (!alive) return;
          const dpr = Math.min(devicePixelRatio || 1, 1.5), w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
          if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
          gl.uniform1f(U("uTime"), (reduce ? 0 : (now - t0) / 1000) + 10); gl.uniform2f(U("uRes"), w, h);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
      }
    }
    // Share: the ratio the document’s images and videos have swelled. 100 when fully swollen
    const media = [...document.querySelectorAll("img, video")];
    const count = () => { const done = media.filter((m) => (m.tagName === "IMG" ? m.complete : m.readyState >= 3)).length; return media.length ? done / media.length : 1; };
    let shown = -1, gone = false, tick = 0, tween = null;
    const show = (v) => { const n = Math.round(v * 100); if (n !== shown && pct) { shown = n; pct.textContent = n; } };
    const lift = () => {
      if (gone) return;
      gone = true; show(1);
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
      const done = () => { alive = false; cancelAnimationFrame(raf); el.classList.add("is-gone"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
      if (window.gsap) tween = gsap.to(el, { yPercent: -100, duration: reduce ? 0 : dur, ease: kfFx.ease("0.2,0.8,0.2,1", "power3.out"), onComplete: done });
      else { el.style.transition = `transform ${reduce ? 0 : dur}s cubic-bezier(.2,.8,.2,1)`; el.style.transform = "translateY(-100%)"; setTimeout(done, (reduce ? 0 : dur) * 1000); }
    };
    const ready = () => { if (gone) return; clearInterval(tick); show(1); setTimeout(lift, Math.max(0, min * 1000 - (performance.now() - t0))); };
    tick = setInterval(() => { show(count()); if (count() >= 1 && document.readyState === "complete" && options.wait !== "event") ready(); }, 100);
    const late = setTimeout(lift, max * 1000);
    el.addEventListener("fx:ready", ready);
    return () => {
      alive = false; cancelAnimationFrame(raf); clearInterval(tick); clearTimeout(late); el.removeEventListener("fx:ready", ready);
      tween?.kill(); if (window.gsap) gsap.set(el, { clearProps: "transform" }); else { el.style.transform = ""; el.style.transition = ""; }
      el.classList.remove("is-gone"); canvas.remove(); gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });
})();
