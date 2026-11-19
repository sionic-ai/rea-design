// Work: dragging and wheel on the panel are handled by the infinite-card-grid part. Here is the original’s hold — dwelling on one card for .8s fades the rest to .15 over 1.5s
(() => {
  UC.page("works", (main) => {
    const grid = main.querySelector(".work__grid");
    if (!grid) return;
    let timer = 0, held = null;
    const clear = () => { clearTimeout(timer); grid.classList.remove("is-dwell"); held?.classList.remove("is-held"); held = null; };
    const over = (e) => {
      const card = e.target.closest(".work__card");
      if (card === held) return;
      clear();
      if (!card || grid.dataset.state === "dragging") return;
      held = card;
      timer = setTimeout(() => { card.classList.add("is-held"); grid.classList.add("is-dwell"); }, 800);
    };
    grid.addEventListener("pointerover", over);
    grid.addEventListener("pointerleave", clear);
    grid.addEventListener("wheel", clear, { passive: true });
    grid.addEventListener("pointerdown", clear);
    // Torn-blob cursor: six circles chasing the pointer (the first follows the pointer by .35 each time, the rest follow the one before), noise added to the distances and then thresholded — white + difference inverts what lies beneath.
    // Leaving the panel (above the bottom bar) fades it out in .12s (original work-cursor.js)
    const cv = document.createElement("canvas");
    cv.className = "work__blob"; cv.setAttribute("aria-hidden", "true");
    main.append(cv);
    const gl = cv.getContext("webgl", { premultipliedAlpha: false });
    let raf = 0, alive = true;
    const P = Array.from({ length: 6 }, () => ({ x: innerWidth / 2, y: innerHeight / 2 }));
    let px = innerWidth / 2, py = innerHeight / 2, t = 0;
    const move = (e) => { px = e.clientX; py = e.clientY; cv.classList.toggle("is-on", !!e.target.closest(".work__grid")); };
    addEventListener("pointermove", move);
    if (gl && !UC.reduce) {
      const sh = (k, src) => { const o = gl.createShader(k); gl.shaderSource(o, src); gl.compileShader(o); return o; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, `precision highp float; uniform vec2 uRes; uniform vec2 uP[6]; uniform float uR, uT;
        float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f); return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
        float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * vn(p); p *= 2.03; a *= .5; } return v / .97; }
        void main(){ vec2 q = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); float d = 1e5;
          for (int i = 0; i < 6; i++){ d = min(d, length(q - uP[i]) - uR * (1. - float(i) * .13)); }
          d += (fbm(q / uRes.y * 12.2 + uT * .05) - .5) * 2. * uR * .9;
          gl_FragColor = vec4(1., 1., 1., step(d, 0.)); }`));
      gl.linkProgram(pr); gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const uRes = gl.getUniformLocation(pr, "uRes"), uP = gl.getUniformLocation(pr, "uP"), uR = gl.getUniformLocation(pr, "uR"), uT = gl.getUniformLocation(pr, "uT");
      const frame = () => {
        if (!alive) return;
        if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; gl.viewport(0, 0, cv.width, cv.height); }
        t += 1 / 60;
        P.forEach((p, i) => { const to = i ? P[i - 1] : { x: px, y: py }; p.x += (to.x - p.x) * 0.35; p.y += (to.y - p.y) * 0.35; });
        gl.uniform2f(uRes, cv.width, cv.height); gl.uniform2fv(uP, P.flatMap((p) => [p.x, p.y])); gl.uniform1f(uR, innerHeight * 0.075); gl.uniform1f(uT, t);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }
    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener("pointermove", move); gl?.getExtension("WEBGL_lose_context")?.loseContext(); cv.remove(); clear(); grid.removeEventListener("pointerover", over); grid.removeEventListener("pointerleave", clear); grid.removeEventListener("wheel", clear); grid.removeEventListener("pointerdown", clear); };
  });
})();
