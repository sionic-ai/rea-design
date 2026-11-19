// Hovering a thumbnail swaps the photo in the large preview frame to a WebGL plane — the plane is rolled up along a diagonal (−45°) axis (bend 2.2), unrolls in 1s and settles in 2s,
// Positioning photo ([data-fx-part=photo]) shrinks from 1.3x to 1x and the panel shrinks with it. The previous photo panel sets at .4s. When first attached, the first photo enters in the same form at 1.8s power4.out.
(() => {
  const VERT = `attribute vec2 aPos;
uniform vec4 uRect; uniform vec2 uView; uniform float uBend;
varying vec2 vUv;
vec2 spin(vec2 v, float a){ float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
void main(){
  vUv = aPos + 0.5;
  // In a plane space of side 1, the diagonal from top-left → bottom-right is stood up as the vertical axis, rolled along that axis (orthographic projection, so depth is discarded), unrolled back, then stretched to the photo size.
  // In this space y grows downward, so the original’s (y up) −45° becomes +45°
  vec2 p = spin(aPos, 0.7853982);
  p.y *= cos(p.y * uBend);
  p = spin(p, -0.7853982);
  vec2 px = uRect.xy + p * uRect.zw;
  gl_Position = vec4(px.x / uView.x * 2.0 - 1.0, 1.0 - px.y / uView.y * 2.0, 0.0, 1.0);
}`;
  const FRAG = `precision mediump float;
uniform sampler2D uTex; uniform float uAlpha; varying vec2 vUv;
void main(){ gl_FragColor = vec4(texture2D(uTex, vUv).rgb, uAlpha); }`;

  const N = 20;
  const grid = () => {
    const v = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x0 = i / N - 0.5, x1 = (i + 1) / N - 0.5, y0 = j / N - 0.5, y1 = (j + 1) / N - 0.5;
      v.push(x0, y0, x1, y0, x0, y1, x1, y0, x1, y1, x0, y1);
    }
    return new Float32Array(v);
  };

  const tone = (el, name) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    el.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    return c;
  };
  // If not img · canvas (placeholder cell), a panel painted in the skin color — diagonal X and data-label
  const source = (el, photo) => {
    if (photo instanceof HTMLCanvasElement || (photo instanceof HTMLImageElement && photo.complete && photo.naturalWidth)) return photo;
    const r = photo.getBoundingClientRect();
    const h = 512, w = Math.max(1, Math.round(h * (r.width / Math.max(1, r.height) || 1.5)));
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    const g = c.getContext("2d");
    const fill = tone(el, "--kf-raised"), ink = tone(el, "--kf-dim");
    g.fillStyle = fill; g.fillRect(0, 0, w, h);
    g.strokeStyle = ink; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const label = photo.dataset.label || photo.getAttribute("alt") || "";
    if (label) {
      g.font = `500 ${Math.round(h * 0.036)}px ${getComputedStyle(el).fontFamily}`;
      const tw = g.measureText(label).width + 32;
      g.fillStyle = fill; g.fillRect((w - tw) / 2, h / 2 - 20, tw, 40);
      g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(label, w / 2, h / 2);
    }
    return c;
  };

  kfFx.register("diag-bend-preview", (el, { options, reduce }) => {
    const thumbs = [...el.querySelectorAll('[data-fx-part="thumb"]')];
    const photos = [...el.querySelectorAll('[data-fx-part="photo"]')];
    if (!thumbs.length || !photos.length) return;
    const unfold = +(options.dur ?? 1), fade = +(options.fade ?? 2), out = +(options.out ?? 0.4);
    const bend = +(options.bend ?? 2.2), zoom = +(options.zoom ?? 1.3), delay = +(options.delay ?? 0);
    const introEase = kfFx.ease(options["intro-ease"] || "power4.out", "power4.out"), ease = kfFx.ease(options.ease || "power1.out", "power1.out");

    const cv = document.createElement("canvas");
    cv.className = "fx-diag-bend-canvas";
    cv.setAttribute("aria-hidden", "true");
    el.append(cv);
    const gl = cv.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
    const st = photos.map((p, i) => ({ alpha: i === 0 ? 1 : 0, bend: 0, tex: null, photo: p }));
    let prog = null, loc = null, dpr = 1, running = true;

    if (gl) {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(pr);
      if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
        prog = pr;
        gl.useProgram(pr);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, grid(), gl.STATIC_DRAW);
        const a = gl.getAttribLocation(pr, "aPos");
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        loc = Object.fromEntries(["uRect", "uView", "uBend", "uTex", "uAlpha"].map((n) => [n, gl.getUniformLocation(pr, n)]));
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
    }
    // Without the panel (no WebGL), the positioning shows the photo itself via opacity
    if (!prog) el.classList.add("is-flat");

    const upload = (s) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source(el, s.photo));
      s.tex = t;
    };
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(innerWidth * dpr);
      cv.height = Math.round(innerHeight * dpr);
    };
    size();
    const draw = () => {
      if (!prog || !running) return;
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(loc.uView, innerWidth, innerHeight);
      for (const s of st) {
        if (s.alpha <= 0.001) continue;
        if (!s.tex) upload(s);
        const r = s.photo.getBoundingClientRect();
        if (!r.width) continue;
        gl.bindTexture(gl.TEXTURE_2D, s.tex);
        gl.uniform4f(loc.uRect, r.left + r.width / 2, r.top + r.height / 2, r.width, r.height);
        gl.uniform1f(loc.uBend, s.bend);
        gl.uniform1f(loc.uAlpha, s.alpha);
        gl.drawArrays(gl.TRIANGLES, 0, N * N * 6);
      }
    };
    // Warm up shaders and the first texture on attach — so the first interaction doesn’t stall on compiling
    if (prog) { upload(st[0]); draw(); }
    gsap.ticker.add(draw);

    const flat = (i, a, d) => { if (!prog) gsap.to(photos[i], { opacity: a, duration: d, overwrite: "auto" }); };
    if (!reduce) {
      gsap.fromTo(photos[0], { scale: zoom }, { scale: 1, duration: 1.8, ease: introEase, delay });
      gsap.fromTo(st[0], { alpha: 0 }, { alpha: 1, duration: fade, ease, delay });
      gsap.fromTo(st[0], { bend }, { bend: 0, duration: unfold, ease, delay });
      flat(0, 1, fade);
    } else flat(0, 1, 0);

    let last = 0;
    const ac = new AbortController();
    thumbs.forEach((t, i) => {
      if (!st[i]) return;
      t.addEventListener("pointerenter", () => {
        if (reduce) { st.forEach((s, k) => (s.alpha = k === i ? 1 : 0)); photos.forEach((p, k) => flat(k, k === i ? 1 : 0, 0)); return; }
        if (last !== i) { gsap.to(st[last], { alpha: 0, duration: out, ease, overwrite: true }); flat(last, 0, out); }
        gsap.fromTo(photos[i], { scale: zoom }, { scale: 1, duration: unfold, ease, overwrite: true });
        gsap.killTweensOf(st[i]);
        gsap.fromTo(st[i], { bend }, { bend: 0, duration: unfold, ease });
        gsap.to(st[i], { alpha: 1, duration: fade, ease });
        flat(i, 1, fade);
        last = i;
      }, { signal: ac.signal });
    });
    addEventListener("resize", size, { signal: ac.signal });
    return () => {
      running = false;
      ac.abort();
      gsap.ticker.remove(draw);
      gsap.killTweensOf(st);
      gsap.killTweensOf(photos);
      gsap.set(photos, { clearProps: "transform,opacity" });
      cv.remove();
      el.classList.remove("is-flat");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });
})();
