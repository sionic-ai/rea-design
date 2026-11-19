(() => {
  // Cell boundary k bends as edge[k] + bow[k]·bulge (bulge = (a sine that is 1 at the center of the crossing direction). Between them, cover with cell i’s image and clip with rounded corners
  const FRAG = `precision highp float;
uniform sampler2D t0, t1, t2, t3, t4, t5, t6, t7;
uniform vec2 sz[8];
uniform float edge[9], bow[9], openAmt[8];
uniform int count;
uniform vec2 res;
uniform float dpr, vertical, openLen, gap, radius, dragAmt, reach, dim;
vec3 tex(int i, vec2 uv) {
  uv = clamp(uv, 0.0, 1.0);
  if (i == 0) return texture2D(t0, uv).rgb; if (i == 1) return texture2D(t1, uv).rgb;
  if (i == 2) return texture2D(t2, uv).rgb; if (i == 3) return texture2D(t3, uv).rgb;
  if (i == 4) return texture2D(t4, uv).rgb; if (i == 5) return texture2D(t5, uv).rgb;
  if (i == 6) return texture2D(t6, uv).rgb; return texture2D(t7, uv).rgb;
}
float at(int k, float b) { for (int j = 0; j < 9; j++) if (j == k) return edge[j] + bow[j] * b; return 0.0; }
float bowAt(int k) { for (int j = 0; j < 9; j++) if (j == k) return bow[j]; return 0.0; }
float openOf(int k) { for (int j = 0; j < 8; j++) if (j == k) return openAmt[j]; return 0.0; }
vec2 sizeOf(int k) { for (int j = 0; j < 8; j++) if (j == k) return sz[j]; return vec2(1.0); }
void main() {
  vec2 px = vec2(gl_FragCoord.x, res.y * dpr - gl_FragCoord.y) / dpr;
  bool vert = vertical > 0.5;
  float a = vert ? px.y : px.x;
  float c = vert ? px.x : px.y;
  float span = vert ? res.x : res.y;
  float b = sin(clamp(c / span, 0.0, 1.0) * 3.14159265);
  int i = 0;
  for (int k = 1; k < 8; k++) { if (k >= count) break; if (a >= at(k, b)) i = k; }
  float s = at(i, b), e = at(i + 1, b);
  float pull = bowAt(i) * exp(-abs(a - s) / reach) + bowAt(i + 1) * exp(-abs(a - e) / reach);
  vec2 off = vec2(a - pull * b * dragAmt - 0.5 * (s + e), c - 0.5 * span);
  vec2 box = vec2(openLen, span);
  if (vert) { off = off.yx; box = box.yx; }
  vec2 tsz = sizeOf(i);
  float k = max(box.x / tsz.x, box.y / tsz.y);
  vec2 uv = off / (tsz * k) + 0.5;
  uv.y = 1.0 - uv.y;
  vec3 col = tex(i, uv) * (1.0 - dim * (1.0 - clamp(openOf(i), 0.0, 1.0)));
  float inS = (i > 0) ? (gap > 0.0 ? 0.5 * gap : -1.0) : 0.0;
  float inE = (i + 1 < count) ? (gap > 0.0 ? 0.5 * gap : -1.0) : 0.0;
  float cs = s + inS, ce = e - inE;
  vec2 half_ = vec2(max(0.5 * (ce - cs), 0.0), 0.5 * span);
  float r = min(radius, half_.x);
  vec2 q = abs(vec2(a - 0.5 * (cs + ce), c - 0.5 * span)) - half_ + r;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float alpha = clamp(0.5 - d * dpr, 0.0, 1.0);
  gl_FragColor = vec4(col * alpha, alpha);
}`;

  const placeholder = (item, w, h) => {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const x = cv.getContext("2d");
    const cs = getComputedStyle(item);
    const v = (n) => cs.getPropertyValue(n).trim();
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, v("--fx-ph-from") || v("--kf-raised") || "gray");
    g.addColorStop(1, v("--fx-ph-to") || v("--kf-dim") || "gray");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = v("--fx-ph-line") || v("--kf-line") || "gray"; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke();
    const label = item.getAttribute("data-label");
    if (label) {
      x.fillStyle = v("--fx-ph-ink") || v("--kf-ink") || "gray";
      x.font = `500 ${Math.round(h / 34)}px ${v("--kf-font-mono") || "monospace"}`;
      x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(label, w / 2, h / 2);
    }
    return cv;
  };

  kfFx.register("bend-edge-accordion", (el, { options, reduce }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')].slice(0, 8);
    const n = items.length;
    if (!n) return;
    const OPEN = +options.open || 6, K = +(options.stiffness ?? 160), D = +(options.damping ?? 20);
    const BEND = +(options.bend ?? 1.6), BK = 300, BD = 40;
    const narrow = matchMedia("(max-width: 767px)");
    let active = 0;
    const weights = items.map((_, i) => (i === 0 ? OPEN : 1)), wv = items.map(() => 0);
    const mark = (i) => { active = i; items.forEach((it, k) => it.toggleAttribute("data-on", k === i)); wake(); };
    const handlers = items.map((it, i) => {
      const enter = (e) => { if (e.pointerType === "mouse") mark(i); };
      const focus = () => mark(i);
      const click = (e) => { if (i !== active) { e.preventDefault(); mark(i); } };
      it.addEventListener("pointerenter", enter); it.addEventListener("focusin", focus); it.addEventListener("click", click);
      return () => { it.removeEventListener("pointerenter", enter); it.removeEventListener("focusin", focus); it.removeEventListener("click", click); };
    });
    let frame = 0, last = 0, needs = true, visible = true, W = 1, H = 1, vertical = false, gapPx = 0;
    const wake = () => { needs = true; if (!frame && renderer) { last = performance.now(); frame = requestAnimationFrame(step); } };

    let renderer = null, uniforms = null, scene, cam, mesh;
    const textures = [];
    if (T) {
      const canvas = document.createElement("canvas");
      el.prepend(canvas);
      try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true }); } catch (e) { renderer = null; canvas.remove(); }
      if (renderer) {
        el.classList.add("is-gl");
        scene = new T.Scene(); cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        uniforms = {
          sz: { value: Array.from({ length: 8 }, () => new T.Vector2(1, 1)) },
          edge: { value: new Float32Array(9) }, bow: { value: new Float32Array(9) }, openAmt: { value: new Float32Array(8) },
          count: { value: n }, res: { value: new T.Vector2(1, 1) }, dpr: { value: 1 }, vertical: { value: 0 },
          openLen: { value: 1 }, gap: { value: 0 }, radius: { value: 0 },
          dragAmt: { value: +(options.drag ?? 0.6) }, reach: { value: +(options.reach ?? 90) || 90 }, dim: { value: +(options.dim ?? 0.15) },
        };
        for (let k = 0; k < 8; k++) uniforms[`t${k}`] = { value: null };
        mesh = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ vertexShader: "void main(){gl_Position=vec4(position.xy,0.,1.);}", fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false, transparent: true }));
        scene.add(mesh);
        const blank = new T.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); blank.needsUpdate = true;
        for (let k = 0; k < 8; k++) uniforms[`t${k}`].value = blank;
      }
    }

    const openLength = () => (OPEN / (OPEN + n - 1)) * Math.max((vertical ? H : W) - gapPx * (n - 1), 1);
    const loadTex = () => {
      if (!renderer) return;
      items.forEach((it, i) => {
        const img = it.querySelector('[data-fx-part="image"]');
        const set = (src, w, h) => {
          const t = new T.Texture(src); t.minFilter = T.LinearFilter; t.needsUpdate = true;
          textures[i]?.dispose(); textures[i] = t;
          uniforms[`t${i}`].value = t; uniforms.sz.value[i].set(w, h); wake();
        };
        if (img && img.tagName === "IMG" && img.getAttribute("src")) {
          const im = new Image(); im.crossOrigin = "anonymous";
          im.onload = () => set(im, im.naturalWidth, im.naturalHeight);
          im.onerror = () => { const cv = placeholder(it, 1200, 800); set(cv, cv.width, cv.height); };
          im.src = img.currentSrc || img.src;
        } else {
          const cv = placeholder(it, 1200, 800);
          set(cv, cv.width, cv.height);
        }
      });
    };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const st = getComputedStyle(el);
      W = Math.max(el.clientWidth, 1); H = Math.max(el.clientHeight, 1);
      vertical = st.flexDirection.startsWith("column");
      gapPx = parseFloat(vertical ? st.rowGap : st.columnGap) || 0;
      if (renderer) {
        renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
        uniforms.res.value.set(W, H); uniforms.dpr.value = dpr; uniforms.vertical.value = vertical ? 1 : 0;
        uniforms.gap.value = gapPx; uniforms.radius.value = parseFloat(getComputedStyle(items[0]).borderTopLeftRadius) || 0;
      }
      reset = true; wake();
    };
    const edges = new Float32Array(n + 1), ev = new Float32Array(n + 1), bows = new Float32Array(n + 1), bv = new Float32Array(n + 1);
    let reset = true;
    function step(now) {
      frame = 0;
      if (narrow.matches) { items.forEach((it) => { it.style.flexGrow = ""; }); return; }
      const dt = Math.min((now - last) / 1000, 1 / 30) || 1 / 60;
      last = now;
      if (!visible) return;
      const snap = reduce;
      let total = 0, motion = 0;
      weights.forEach((w, i) => {
        const target = i === active ? OPEN : 1;
        wv[i] = snap ? 0 : wv[i] + (K * (target - w) - D * wv[i]) * dt;
        weights[i] = snap ? target : Math.max(w + wv[i] * dt, 0.05);
        total += weights[i]; motion += Math.abs(wv[i]);
      });
      const avail = Math.max((vertical ? H : W) - gapPx * (n - 1), 1);
      let p = 0;
      for (let k = 0; k <= n; k++) {
        const e = k === 0 ? 0 : k === n ? p - gapPx : p - gapPx / 2;
        const inner = k > 0 && k < n;
        const sp = reset || !inner ? 0 : (e - edges[k]) / dt / 60;
        ev[k] = reset ? 0 : ev[k] + (sp - ev[k]) * 0.35;
        edges[k] = e;
        const target = inner && !snap ? -ev[k] * BEND : 0;
        bv[k] += (BK * (target - bows[k]) - BD * bv[k]) * dt;
        bows[k] += bv[k] * dt;
        motion += Math.abs(bows[k]) + Math.abs(bv[k]);
        if (k < n) p += (weights[k] / total) * avail + gapPx;
      }
      reset = false;
      if (motion < 0.002 && !needs) return;
      needs = false;
      items.forEach((it, i) => { it.style.flexGrow = weights[i]; });
      if (renderer) {
        items.forEach((_, i) => { uniforms.openAmt.value[i] = (weights[i] - 1) / (OPEN - 1); });
        uniforms.edge.value.set(edges); uniforms.bow.value.set(bows); uniforms.openLen.value = openLength();
        renderer.render(scene, cam);
      }
      frame = requestAnimationFrame(step);
    }
    const ro = new ResizeObserver(resize); ro.observe(el);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; wake(); }); io.observe(el);
    resize(); loadTex(); mark(0);
    if (!renderer) { const tick = () => { last = performance.now(); frame = requestAnimationFrame(step); }; tick(); }
    return () => {
      cancelAnimationFrame(frame); frame = 0; ro.disconnect(); io.disconnect(); handlers.forEach((off) => off());
      items.forEach((it) => { it.style.flexGrow = ""; it.removeAttribute("data-on"); });
      textures.forEach((t) => t?.dispose());
      if (renderer) { mesh.geometry.dispose(); mesh.material.dispose(); renderer.dispose(); renderer.domElement.remove(); el.classList.remove("is-gl"); }
    };
  });
})();
