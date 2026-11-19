// Hero photo with WebGL box blur (3×3 taps, radius blur texels) · comes into focus from transparent over dur — opacity 1-(1-t)², blur·sharp mix t.
// The photo is laid on a rectangle larger than the panel so it covers it (cover). If there’s no photo slot, a placeholder panel carrying data-label is drawn and used
(() => {
  const VS = "attribute vec2 aPos;attribute vec2 aUv;varying vec2 vUv;void main(){vUv=aUv;gl_Position=vec4(aPos,0.,1.);}";
  const FS = [
    "precision mediump float;",
    "uniform sampler2D uTex;uniform float uT;uniform float uBlur;uniform vec2 uRes;varying vec2 vUv;",
    "void main(){",
    "  float a=1.-pow(1.-uT,2.);",
    "  vec2 o=uBlur*(1.-uT)/uRes;",
    "  vec4 s=vec4(0.);",
    "  for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){s+=texture2D(uTex,vUv+vec2(float(x),float(y))*o);}}",
    // Nine tabs divided by 10 so it is slightly dark while blurred — the original hero forms that way
    "  vec4 c=mix(s/10.,texture2D(uTex,vUv),uT);",
    "  c.a*=a;gl_FragColor=c;",
    "}",
  ].join("\n");

  const placeholder = (el) => {
    const cs = getComputedStyle(el);
    const v = (n, d) => cs.getPropertyValue(n).trim() || d;
    const c = document.createElement("canvas");
    c.width = 1600; c.height = 1000;
    const g = c.getContext("2d");
    g.fillStyle = v("--kf-raised", v("--kf-bg", "gray"));
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = v("--kf-line", "silver");
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c.width, c.height); g.moveTo(c.width, 0); g.lineTo(0, c.height); g.stroke();
    const label = el.dataset.label || "";
    if (label) {
      g.font = `500 26px ${v("--kf-font-mono", "monospace")}`;
      const w = g.measureText(label).width + 40;
      g.fillStyle = v("--kf-raised", "gray");
      g.fillRect((c.width - w) / 2, c.height / 2 - 26, w, 52);
      g.fillStyle = v("--kf-dim", "dimgray");
      g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(label, c.width / 2, c.height / 2);
    }
    return c;
  };

  kfFx.register("gl-unblur-intro", (el, { options, reduce }) => {
    const dur = Math.max(0.01, +(options.dur ?? 2.5));
    const wait = +(options.delay ?? 0.2);
    const blur = +(options.blur ?? 15);
    const doneAt = +(options.done ?? 1.5);
    let canvas = el.querySelector('[data-fx-part="canvas"]');
    const made = !canvas;
    if (made) { canvas = document.createElement("canvas"); canvas.setAttribute("data-fx-part", "canvas"); el.append(canvas); }
    canvas.classList.add("fx-gu-canvas");
    const srcEl = el.querySelector('[data-fx-part="source"]');
    let src = srcEl || placeholder(el);
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    let raf = 0, timers = [], doneSent = false;
    const done = () => { if (!doneSent) { doneSent = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); } };
    if (!gl) {
      el.classList.add("fx-gu-nogl");
      timers.push(setTimeout(done, reduce ? 0 : doneAt * 1000));
      return () => { timers.forEach(clearTimeout); el.classList.remove("fx-gu-nogl"); if (made) canvas.remove(); };
    }
    const sh = (type, code) => { const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const aPos = gl.getAttribLocation(prog, "aPos"), aUv = gl.getAttribLocation(prog, "aUv");
    gl.enableVertexAttribArray(aPos); gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
    const uT = gl.getUniformLocation(prog, "uT"), uBlur = gl.getUniformLocation(prog, "uBlur"), uRes = gl.getUniformLocation(prog, "uRes");
    gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);
    gl.uniform1f(uBlur, blur);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((k) => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let iw = 1, ih = 1, ready = false, t = reduce ? 1 : 0;
    const sizeOf = (s) => [s.naturalWidth || s.videoWidth || s.width || 1, s.naturalHeight || s.videoHeight || s.height || 1];
    const upload = () => {
      [iw, ih] = sizeOf(src);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.uniform2f(uRes, iw, ih);
      ready = true;
    };
    // Laid on a rectangle bigger than the panel so the photo covers it (cover) — overflows vertically on a wide panel, horizontally on a narrow one
    const quad = () => {
      const ca = canvas.width / canvas.height, ia = iw / ih;
      const sx = ca > ia ? 1 : ia / ca, sy = ca > ia ? ca / ia : 1;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-sx, -sy, 0, 0, sx, -sy, 1, 0, -sx, sy, 0, 1, sx, sy, 1, 1]), gl.STATIC_DRAW);
    };
    const draw = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!ready) return;
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const fit = () => {
      const r = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(el.clientWidth * r));
      canvas.height = Math.max(1, Math.round(el.clientHeight * r));
      gl.viewport(0, 0, canvas.width, canvas.height);
      quad(); draw();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    let start = 0;
    const tick = (now) => {
      if (!start) start = now;
      t = Math.min(1, Math.max(0, (now - start) / 1000 / dur));
      // If the photo slot is a canvas (a panel the consumer draws late), re-upload it every frame while it resolves
      if (src instanceof HTMLCanvasElement && srcEl) upload();
      draw();
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const go = () => {
      upload(); quad();
      if (reduce) { draw(); done(); return; }
      timers.push(setTimeout(() => { raf = requestAnimationFrame(tick); }, wait * 1000));
      timers.push(setTimeout(done, (wait + doneAt) * 1000));
    };
    if (src instanceof HTMLImageElement && !src.complete) src.addEventListener("load", go, { once: true });
    else go();
    fit();
    return () => {
      cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.classList.remove("fx-gu-canvas");
      if (made) canvas.remove();
    };
  });
})();
