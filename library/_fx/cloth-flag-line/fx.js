(() => {
  // Sways a few photos pinned with clothespins on a clothesline like cloth (WebGL). Each photo’s 12×16 point grid moves by Verlet integration and
  // The top line is tied to a string (a parabola sagging in the middle). Wind is the sum of two sines times a slow gust share, and within 90px of the cursor it is pushed back and dragged sideways by the cursor speed.
  const COLS = 12, ROWS = 16;
  const VERT = `attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUv;
uniform vec2 uSize; uniform float uFocal; varying vec2 vUv; varying vec3 vNor;
void main(){
  vec2 c = uSize * 0.5;
  vec2 p = c + (aPos.xy - c) * (uFocal / (uFocal - aPos.z));
  gl_Position = vec4(p.x / uSize.x * 2.0 - 1.0, 1.0 - p.y / uSize.y * 2.0, 0.0, 1.0);
  vUv = aUv; vNor = aNor;
}`;
  const FRAG = `precision mediump float;
uniform sampler2D uTex; varying vec2 vUv; varying vec3 vNor;
void main(){
  vec3 n = normalize(vNor);
  if (!gl_FrontFacing) n = -n;
  float lit = 0.62 + 0.42 * max(dot(n, normalize(vec3(-0.35, -0.55, 1.0))), 0.0);
  float weave = 0.985 + 0.015 * sin(vUv.x * 900.0) * sin(vUv.y * 1200.0);
  gl_FragColor = vec4(texture2D(uTex, vUv).rgb * lit * weave, 1.0);
}`;
  const cssColor = (el, name, fb) => getComputedStyle(el).getPropertyValue(name).trim() || fb;

  kfFx.register("cloth-flag-line", (el, { options, reduce, hover }) => {
    const canvas = el.querySelector('[data-fx-part="canvas"]');
    const rope = el.querySelector('[data-fx-part="rope"]');
    const list = el.querySelector('[data-fx-part="list"]');
    if (!canvas || !rope || !list) return;
    let flags = [];
    try { flags = JSON.parse(el.dataset.flags || "[]"); } catch {}
    const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: true, alpha: true });
    if (!gl) return;
    const G = +(options.gravity ?? 1400), DAMP = +(options.damp ?? 0.982), RAD = +(options.radius ?? 90), FOCAL = +(options.focal ?? 1600), SAG = +(options.sag ?? 36);
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const aPos = gl.getAttribLocation(prog, "aPos"), aNor = gl.getAttribLocation(prog, "aNor"), aUv = gl.getAttribLocation(prog, "aUv");
    const uSize = gl.getUniformLocation(prog, "uSize");
    gl.uniform1f(gl.getUniformLocation(prog, "uFocal"), FOCAL);
    const posBuf = gl.createBuffer(), norBuf = gl.createBuffer(), uvBuf = gl.createBuffer(), idxBuf = gl.createBuffer();
    const uv = new Float32Array(COLS * ROWS * 2), idx = new Uint16Array((COLS - 1) * (ROWS - 1) * 6);
    for (let r = 0, k = 0, j = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++, k++) {
      uv[k * 2] = c / (COLS - 1);
      uv[k * 2 + 1] = r / (ROWS - 1);
      if (c < COLS - 1 && r < ROWS - 1) { idx.set([k, k + COLS, k + 1, k + 1, k + COLS, k + COLS + 1], j); j += 6; }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let cloths = [], W = 0, H = 0, dpr = 1, sagAt = () => 0;
    // One photo’s pattern: a skin-color background with a photo slot (diagonal X and label) + a white name band below — the original paints the photo
    const paint = (flag, w, h) => {
      const cv = document.createElement("canvas");
      cv.width = Math.round(w * 2);
      cv.height = Math.round(h * 2);
      const g = cv.getContext("2d");
      const ph = (h - 34) * 2;
      g.fillStyle = cssColor(el, "--kf-surface", "Canvas");
      g.fillRect(0, 0, cv.width, cv.height);
      g.strokeStyle = cssColor(el, "--kf-line", "GrayText");
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(cv.width, ph); g.moveTo(cv.width, 0); g.lineTo(0, ph); g.stroke();
      g.fillStyle = cssColor(el, "--kf-dim", "GrayText");
      g.font = `400 20px ${cssColor(el, "--kf-font-sans", "sans-serif")}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(flag.label || "", cv.width / 2, ph / 2, cv.width - 24);
      g.fillStyle = cssColor(el, "--kf-bg", "Canvas");
      g.fillRect(0, ph, cv.width, 68);
      g.fillStyle = cssColor(el, "--kf-ink", "CanvasText");
      g.font = `400 26px ${cssColor(el, "--kf-font-sans", "sans-serif")}`;
      g.textAlign = "left";
      g.fillText(flag.name || "", 20, ph + 34, cv.width - 40);
      return cv;
    };

    function layout() {
      const box = el.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      W = box.width;
      const items = [...list.querySelectorAll("li")].filter((li) => li.offsetParent !== null);
      if (!W || !items.length) return false;
      const d = Math.min(SAG, W * 0.03);
      sagAt = (x) => 12 + d * (1 - ((x - W / 2) / (W / 2)) ** 2);
      el.style.setProperty("--fx-top", `${Math.round(12 + d + 6)}px`);
      el.classList.add("fx-cfl-on");
      H = el.getBoundingClientRect().height + 40;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = `${H}px`;
      rope.setAttribute("viewBox", `0 0 ${W} ${H}`);
      rope.style.height = `${H}px`;
      let path = "";
      for (let x = 0; x <= W; x += 8) path += `${x ? "L" : "M"}${x.toFixed(1)} ${sagAt(x).toFixed(1)}`;
      rope.querySelector("path")?.setAttribute("d", path);
      const pegs = rope.querySelector('[data-fx-part="pegs"]') || rope;
      pegs.querySelectorAll(".fx-cfl-peg").forEach((p) => p.remove());
      gl.viewport(0, 0, canvas.width, canvas.height);
      cloths.forEach((c) => gl.deleteTexture(c.tex));
      const top = el.getBoundingClientRect();
      cloths = items.map((li, i) => {
        const pic = (li.querySelector('[data-fx-part="pic"]') || li).getBoundingClientRect();
        const x0 = pic.left - top.left, w = pic.width, h = pic.height + 34, dx = w / (COLS - 1), dy = h / (ROWS - 1);
        const p = new Float32Array(COLS * ROWS * 3), pin = new Float32Array(COLS * 2);
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          const x = x0 + c * dx, k = (r * COLS + c) * 3;
          p[k] = x; p[k + 1] = sagAt(x) + r * dy; p[k + 2] = 0;
          if (!r) { pin[c * 2] = x; pin[c * 2 + 1] = sagAt(x); }
        }
        for (const x of [x0 + 6, x0 + w - 6]) {
          const y = sagAt(x), deg = (Math.atan2(sagAt(x + 1) - y, 1) * 180) / Math.PI;
          const peg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          peg.setAttribute("class", "fx-cfl-peg");
          peg.setAttribute("x", String(x - 2.5)); peg.setAttribute("y", String(y - 7));
          peg.setAttribute("width", "5"); peg.setAttribute("height", "16"); peg.setAttribute("rx", "1.5");
          peg.setAttribute("transform", `rotate(${deg.toFixed(2)} ${x} ${y})`);
          pegs.appendChild(peg);
        }
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paint(flags[i] || {}, w, h));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return { p, o: p.slice(), n: new Float32Array(p.length), pin, dx, dy, tex, phase: i * 1.7 };
      });
      for (let s = 0; s < 90; s++) step(1 / 60, s / 60, !reduce);
      draw();
      return true;
    }

    const mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, on: false };
    const relax = (p, a, b, rest) => {
      const i = a * 3, j = b * 3, x = p[j] - p[i], y = p[j + 1] - p[i + 1], z = p[j + 2] - p[i + 2];
      const len = Math.sqrt(x * x + y * y + z * z) || 1e-6, f = ((len - rest) / len) * 0.5;
      const wa = a < COLS ? 0 : 1, wb = b < COLS ? 0 : 1, sum = wa + wb || 1;
      p[i] += (x * f * wa * 2) / sum; p[i + 1] += (y * f * wa * 2) / sum; p[i + 2] += (z * f * wa * 2) / sum;
      p[j] -= (x * f * wb * 2) / sum; p[j + 1] -= (y * f * wb * 2) / sum; p[j + 2] -= (z * f * wb * 2) / sum;
    };
    function step(dt, t, wind) {
      const gust = 0.55 + 0.45 * Math.sin(t * 0.45) * Math.sin(t * 0.23 + 1.3);
      for (const cl of cloths) {
        const { p, o } = cl;
        for (let r = 1; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
          const k = (r * COLS + c) * 3, u = r / (ROWS - 1);
          let fx = 0, fz = 0;
          if (wind) {
            const e = Math.sin(t * 2.3 + c * 0.55 + r * 0.35 + cl.phase) + 0.6 * Math.sin(t * 3.7 - c * 0.4 + r * 0.6 + cl.phase * 1.3);
            fz = (380 + 520 * e) * gust * u;
            fx = 90 * gust * u + 60 * e * u;
          }
          const mx = p[k] - mouse.x, my = p[k + 1] - mouse.y, md = Math.hypot(mx, my);
          if (mouse.on && md < RAD) {
            const q = (1 - md / RAD) ** 2, spd = Math.min(1, Math.hypot(mouse.vx, mouse.vy) / 900);
            fz -= q * (700 + 2600 * spd);
            fx += Math.max(-600, Math.min(600, mouse.vx)) * q * 1.6;
          }
          const x = p[k], y = p[k + 1], z = p[k + 2];
          p[k] = x + (x - o[k]) * DAMP + fx * dt * dt;
          p[k + 1] = y + (y - o[k + 1]) * DAMP + G * dt * dt;
          p[k + 2] = z + (z - o[k + 2]) * DAMP + fz * dt * dt;
          o[k] = x; o[k + 1] = y; o[k + 2] = z;
        }
        const diag = Math.hypot(cl.dx, cl.dy);
        for (let it = 0; it < 6; it++) {
          for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            const k = r * COLS + c;
            if (c < COLS - 1) relax(p, k, k + 1, cl.dx);
            if (r < ROWS - 1) relax(p, k, k + COLS, cl.dy);
            if (c < COLS - 1 && r < ROWS - 1) { relax(p, k, k + COLS + 1, diag); relax(p, k + 1, k + COLS, diag); }
          }
          for (let c = 0; c < COLS; c++) { p[c * 3] = cl.pin[c * 2]; p[c * 3 + 1] = cl.pin[c * 2 + 1]; p[c * 3 + 2] = 0; }
        }
      }
    }
    function normals(cl) {
      const { p, n } = cl, at = (r, c) => (r * COLS + c) * 3;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const L = at(r, Math.max(0, c - 1)), Rt = at(r, Math.min(COLS - 1, c + 1)), U = at(Math.max(0, r - 1), c), D = at(Math.min(ROWS - 1, r + 1), c);
        const ax = p[Rt] - p[L], ay = p[Rt + 1] - p[L + 1], az = p[Rt + 2] - p[L + 2], bx = p[D] - p[U], by = p[D + 1] - p[U + 1], bz = p[D + 2] - p[U + 2];
        let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len; ny /= len; nz /= len;
        if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
        const k = at(r, c);
        n[k] = nx; n[k + 1] = -ny; n[k + 2] = nz;
      }
    }
    function draw() {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uSize, W, H);
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      for (const cl of cloths) {
        normals(cl);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, cl.p, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, norBuf);
        gl.bufferData(gl.ARRAY_BUFFER, cl.n, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(aNor);
        gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 0, 0);
        gl.bindTexture(gl.TEXTURE_2D, cl.tex);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      }
    }
    let raf = 0, last = 0, clock = 0, visible = false, alive = true;
    const loop = (now) => {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(0.05, last ? Math.max(0, (now - last) / 1000) : 1 / 60);
      last = now;
      for (let left = dt; left > 0; left -= 1 / 60) { const h = Math.min(1 / 60, left); clock += h; step(h, clock, true); }
      mouse.vx *= 0.85; mouse.vy *= 0.85;
      draw();
      if (visible) raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!reduce && visible && !raf && alive) { last = 0; raf = requestAnimationFrame(loop); } };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } }, { rootMargin: "100px" });
    io.observe(el);
    const move = (e) => {
      const b = el.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      if (mouse.on) { mouse.vx = mouse.vx * 0.5 + (x - mouse.x) * 0.5 * 60; mouse.vy = mouse.vy * 0.5 + (y - mouse.y) * 0.5 * 60; }
      mouse.x = x; mouse.y = y; mouse.on = true;
    };
    const out = () => (mouse.on = false);
    if (!reduce && hover) { el.addEventListener("pointermove", move); el.addEventListener("pointerleave", out); }
    let rt = 0;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { layout(); start(); }, 200); };
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(() => onResize());
    ro.observe(list);
    (document.fonts?.ready ?? Promise.resolve()).then(() => { if (alive && layout()) start(); });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      clearTimeout(rt);
      removeEventListener("resize", onResize);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", out);
      cloths.forEach((c) => gl.deleteTexture(c.tex));
      rope.querySelectorAll(".fx-cfl-peg").forEach((p) => p.remove());
      el.classList.remove("fx-cfl-on");
      el.style.removeProperty("--fx-top");
    };
  });
})();
