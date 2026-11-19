(() => {
  // Puts one image on WebGL as a grid mesh, swings limbs at set angles per bone (axis, tip, radius), and closes the eyes with a shader
  const DEF_BONES = [
    { pivot: [470, 245], tip: [230, 222], r: 90, angle: 5, phase: 0 },
    { pivot: [720, 212], tip: [900, 180], r: 85, angle: -5, phase: 0 },
    { pivot: [517, 336], tip: [375, 560], r: 112, angle: -2.5, phase: 0.25 },
    { pivot: [690, 330], tip: [880, 515], r: 110, angle: 2.5, phase: 0.25 },
  ];
  const DEF_EYES = [{ cx: 587, cy: 47, line: 8 }, { cx: 616, cy: 44, line: 8 }];
  const smooth = (a, b, x) => { const t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); };
  const rand = (a, b) => a + Math.random() * (b - a);
  const parseJSON = (s, d) => { try { return s ? JSON.parse(s) : d; } catch { return d; } };
  const cssColor = (el, v) => {
    const s = document.createElement("span");
    s.style.color = `var(${v})`;
    s.style.display = "none";
    el.appendChild(s);
    const c = getComputedStyle(s).color.match(/[\d.]+/g)?.map(Number) || [0, 0, 0];
    s.remove();
    return c;
  };

  // Inline SVGs bake the colors painted with skin variables into computed values as an image — switching skin gives new colors on re-attach
  function sourceOf(part) {
    const img = part.querySelector("img");
    if (img) return new Promise((res) => (img.complete && img.naturalWidth ? res(img) : img.addEventListener("load", () => res(img), { once: true })));
    const svg = part.querySelector("svg");
    if (!svg) return Promise.resolve(null);
    const clone = svg.cloneNode(true);
    const a = svg.querySelectorAll("*"), b = clone.querySelectorAll("*");
    a.forEach((n, i) => {
      const cs = getComputedStyle(n);
      if (cs.fill && cs.fill !== "none") b[i].setAttribute("fill", cs.fill);
      if (cs.stroke && cs.stroke !== "none") {
        b[i].setAttribute("stroke", cs.stroke); b[i].setAttribute("stroke-width", cs.strokeWidth);
        b[i].setAttribute("stroke-linecap", cs.strokeLinecap); b[i].setAttribute("stroke-linejoin", cs.strokeLinejoin);
      }
      if (cs.fill === "none") b[i].setAttribute("fill", "none");
      b[i].removeAttribute("class");
    });
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const vb = svg.viewBox.baseVal;
    clone.setAttribute("width", vb.width); clone.setAttribute("height", vb.height);
    const im = new Image();
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    return im.decode().then(() => im).catch(() => null);
  }

  kfFx.register("bone-wobble-mesh", (el, { options, reduce }) => {
    const body = el.querySelector('[data-fx-part="body"]');
    if (!body || reduce) return;
    const shadowPart = el.querySelector('[data-fx-part="shadow"]');
    const period = +(options.period ?? 1600), cols = +options.cols || 48, rows = +options.rows || 40;
    const lw = +(options.line ?? 3), er = +(options.eye ?? 14), blur = +(options.blur ?? 6);
    const sx = +(options["shadow-x"] ?? -168), sy = +(options["shadow-y"] ?? 128);
    const bonesIn = parseJSON(el.dataset.bones, DEF_BONES), eyes = parseJSON(el.dataset.eyes, DEF_EYES);
    let st = null, dead = false;

    sourceOf(body).then((tex) => {
      if (dead || !tex) return;
      const W = +(options.w ?? tex.naturalWidth ?? 968) || 968, H = +(options.h ?? tex.naturalHeight ?? 802) || 802;
      const cv = document.createElement("canvas");
      cv.setAttribute("data-fx-part", "mesh-canvas");
      const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
      if (!gl) return;
      const ink = cssColor(el, "--kf-ink").map((v) => (v / 255).toFixed(3));
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, `attribute vec2 aPos; attribute vec2 aUv; varying vec2 vUv;
        void main(){ vUv = aUv; gl_Position = vec4(aPos.x / ${W.toFixed(1)} * 2.0 - 1.0, 1.0 - aPos.y / ${H.toFixed(1)} * 2.0, 0.0, 1.0); }`));
      const eyeGlsl = eyes.map((e) => `{
          vec2 d = pos - vec2(${(+e.cx).toFixed(1)}, ${(+e.cy).toFixed(1)});
          float r = length(d);
          if (r < ${(er + 1).toFixed(1)}) {
            float xr = sqrt(max(${(er * er).toFixed(1)} - d.y * d.y, 1.0));
            vec4 lft = tex(vec2(${(+e.cx).toFixed(1)} - xr, pos.y));
            vec4 rgt = tex(vec2(${(+e.cx).toFixed(1)} + xr, pos.y));
            vec4 lid = mix(lft, rgt, clamp((d.x + xr) / (2.0 * xr), 0.0, 1.0));
            c = mix(c, lid, 1.0 - smoothstep(${(er - 3).toFixed(1)}, ${(er + 1).toFixed(1)}, r));
          }
          float lx = clamp(d.x, ${(-(e.line ?? 8)).toFixed(1)}, ${(+(e.line ?? 8)).toFixed(1)});
          float ld = length(vec2(d.x - lx, d.y));
          c = mix(c, vec4(${ink.join(", ")}, 1.0), 1.0 - smoothstep(${(lw / 2 - 0.75).toFixed(2)}, ${(lw / 2 + 0.75).toFixed(2)}, ld));
        }`).join("\n");
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `precision mediump float;
        uniform sampler2D uTex; uniform float uBlink; varying vec2 vUv;
        vec4 tex(vec2 p){ return texture2D(uTex, p / vec2(${W.toFixed(1)}, ${H.toFixed(1)})); }
        void main(){ vec2 pos = vUv * vec2(${W.toFixed(1)}, ${H.toFixed(1)}); vec4 c = texture2D(uTex, vUv);
          if (uBlink > 0.5) { ${eyeGlsl} }
          gl_FragColor = c; }`));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
      gl.useProgram(prog);

      const rest = [], uv = [], index = [];
      for (let y = 0; y <= rows; y++) for (let x = 0; x <= cols; x++) { rest.push((x / cols) * W, (y / rows) * H); uv.push(x / cols, y / rows); }
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const a = y * (cols + 1) + x, b = a + cols + 1; index.push(a, a + 1, b, a + 1, b + 1, b); }
      const restA = new Float32Array(rest), pos = new Float32Array(rest.length);
      const bones = bonesIn.map((b) => { const dx = b.tip[0] - b.pivot[0], dy = b.tip[1] - b.pivot[1], l = Math.hypot(dx, dy); return { ...b, ux: dx / l, uy: dy / l }; });
      // Weight that turns on while passing -30~50px toward the bone and turns off while moving r~r+30px away from the bone shaft
      const weights = [];
      for (let i = 0; i < restA.length; i += 2) {
        const w = bones.map((b) => { const dx = restA[i] - b.pivot[0], dy = restA[i + 1] - b.pivot[1]; const along = dx * b.ux + dy * b.uy, side = Math.abs(dx * b.uy - dy * b.ux); return smooth(-30, 50, along) * (1 - smooth(b.r, b.r + 30, side)); });
        const sum = w.reduce((s, v) => s + v, 0);
        weights.push(sum > 1 ? w.map((v) => v / sum) : w);
      }
      const posBuf = gl.createBuffer();
      const aPos = gl.getAttribLocation(prog, "aPos");
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf); gl.bufferData(gl.ARRAY_BUFFER, restA, gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      const uvBuf = gl.createBuffer(), aUv = gl.getAttribLocation(prog, "aUv");
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW); gl.enableVertexAttribArray(aUv); gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);
      const t0 = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t0); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const uBlink = gl.getUniformLocation(prog, "uBlink");
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      let shadow = null, sctx = null;
      if (shadowPart) { shadow = document.createElement("canvas"); shadow.setAttribute("data-fx-part", "mesh-canvas"); sctx = shadow.getContext("2d"); shadowPart.appendChild(shadow); }
      body.appendChild(cv);
      el.classList.add("is-mesh");
      const shade = `rgb(${cssColor(el, "--kf-ink").join(",")})`;

      // Eye blink: rests 2~6 seconds, closes for 140~220ms. 35% blink once more after 250~450ms
      const nextBlink = (t, quick) => { const s = t + (quick ? rand(250, 450) : rand(2000, 6000)); return { start: s, end: s + rand(140, 220), double: !quick && Math.random() < 0.35 }; };
      let blink = null;
      const draw = (t) => {
        const rot = bones.map((b) => { const a = (b.angle * (0.5 - 0.5 * Math.cos(2 * Math.PI * (t / period - b.phase))) * Math.PI) / 180; return { c: Math.cos(a), s: Math.sin(a), px: b.pivot[0], py: b.pivot[1] }; });
        for (let i = 0, v = 0; i < restA.length; i += 2, v++) {
          const x = restA[i], y = restA[i + 1], w = weights[v];
          let nx = x, ny = y;
          for (let k = 0; k < rot.length; k++) { const q = w[k]; if (!q) continue; const r = rot[k], dx = x - r.px, dy = y - r.py; nx += q * (r.px + dx * r.c - dy * r.s - x); ny += q * (r.py + dx * r.s + dy * r.c - y); }
          pos[i] = nx; pos[i + 1] = ny;
        }
        if (!blink || t > blink.end + 1000) blink = nextBlink(t, false);
        if (t >= blink.end) blink = blink.double ? nextBlink(t, true) : nextBlink(t, false);
        gl.uniform1f(uBlink, t >= blink.start ? 1 : 0);
        gl.viewport(0, 0, cv.width, cv.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
        if (sctx) {
          const w = shadow.width, h = shadow.height;
          sctx.globalCompositeOperation = "source-over"; sctx.clearRect(0, 0, w, h);
          sctx.drawImage(cv, (sx / W) * w, (sy / H) * h, w, h);
          sctx.globalCompositeOperation = "source-in"; sctx.fillStyle = shade; sctx.fillRect(0, 0, w, h);
        }
      };
      const loop = (t) => { if (!st) return; draw(t); st.raf = requestAnimationFrame(loop); };
      const gate = () => { const go = st.visible && !document.hidden; if (go && !st.raf) st.raf = requestAnimationFrame(loop); if (!go && st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; } };
      const size = () => {
        const cw = body.clientWidth;
        if (!cw) return;
        const w = Math.min(W, Math.round(cw * (devicePixelRatio || 1))), h = Math.round((w * H) / W);
        [cv, shadow].forEach((c) => { if (c) { c.width = w; c.height = h; } });
        if (shadow) shadow.style.filter = `blur(${(blur * cw) / W}px)`;
        draw(performance.now());
      };
      st = { raf: 0, visible: false, gl, cv, shadow };
      st.ro = new ResizeObserver(size); st.ro.observe(body);
      st.io = new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; gate(); }); st.io.observe(el);
      st.vis = gate; document.addEventListener("visibilitychange", gate);
      size();
    });

    return () => {
      dead = true;
      if (!st) return;
      cancelAnimationFrame(st.raf); st.ro.disconnect(); st.io.disconnect(); document.removeEventListener("visibilitychange", st.vis);
      st.gl.getExtension("WEBGL_lose_context")?.loseContext();
      st.cv.remove(); st.shadow?.remove(); el.classList.remove("is-mesh");
      st = null;
    };
  });
})();
