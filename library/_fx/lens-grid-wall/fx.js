(() => {
  // A WebGL wall (three) drawing an endless preview grid bent through a convex lens. Cell width is .26 (landscape) · .36 · .62 (portrait) of the board width,
  // Lens [.12,.07,.035,.03], drifts by itself .05 cell per second and when dragged glides with inertia (.94/frame), the faster the drag the more it bends. Tilts ±.06 cell toward the cursor.
  // Hovering a cell brightens it (.82/frame) and pressing fires fx:pick(number). The upper part is blurred like frosted glass down to the copy children and melts into the background color.
  // Entrance is 1.6s expo.out (size .7→1, lens +1.6→0, down −.6 cell→0), and scrolling past the panel flattens the lens and blurs it
  const three = () => (window.THREE?.WebGLRenderer ? Promise.resolve(window.THREE) : new Promise((r) => addEventListener("three:ready", () => r(window.THREE), { once: true })));
  const expoOut = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const V = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";

  kfFx.register("lens-grid-wall", (el, ctx) => {
    let off = null, gone = false;
    three().then((T) => { if (!gone && el.isConnected && T?.WebGLRenderer) off = build(el, ctx, T); });
    return () => { gone = true; off?.(); };
  });

  function build(el, { options, reduce, hover }, T) {
    const cs = getComputedStyle(el);
    const val = (n) => cs.getPropertyValue(n).trim() || cs.color;
    const rgb = (v) => { const c = new T.Color(); c.setStyle(val(v), T.SRGBColorSpace); const o = {}; c.getRGB(o, T.SRGBColorSpace); return new T.Color(o.r, o.g, o.b); };
    const LENS = String(options.lens || "0.12,0.07,0.035,0.03").split(",").map(Number);
    const cellF = +(options.cell ?? 0) || null, drift = +(options.drift ?? 0.05), introDur = +(options.intro ?? 1.6);
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const copy = el.querySelector('[data-fx-part="copy"]');
    const count = Math.max(items.length, 8);
    const SW = 320, SH = 222, RATIO = SW / SH, MW = 269, MH = Math.round(MW / (1280 / 804)), MX = (SW - MW) / 2, MY = (SH - MH) / 2;
    const cols = 4, rows = Math.ceil(count / cols);
    const atlas = document.createElement("canvas");
    atlas.width = SW * cols; atlas.height = SH * rows;
    const tex = new T.CanvasTexture(atlas);
    tex.colorSpace = T.SRGBColorSpace; tex.generateMipmaps = false; tex.minFilter = T.LinearFilter; tex.flipY = false;
    const paint = () => {
      const g = atlas.getContext("2d");
      g.fillStyle = val("--kf-bg"); g.fillRect(0, 0, atlas.width, atlas.height);
      for (let i = 0; i < count; i++) {
        const it = items[i % Math.max(1, items.length)];
        const x = (i % cols) * SW, y = Math.floor(i / cols) * SH;
        const img = it?.querySelector("img");
        if (img?.complete && img.naturalWidth) {
          const s = Math.max(MW / img.naturalWidth, MH / img.naturalHeight), w = MW / s, h = MH / s;
          g.drawImage(img, (img.naturalWidth - w) / 2, (img.naturalHeight - h) / 2, w, h, x + MX, y + MY, MW, MH);
        } else {
          g.fillStyle = val("--kf-contrast-bg"); g.fillRect(x + MX, y + MY, MW, MH);
          g.fillStyle = val("--kf-accent"); g.fillRect(x + MX + 18 + (i % 3) * 30, y + MY + 30, 40 + (i % 4) * 12, MH * 0.45);
        }
        g.fillStyle = val("--kf-ink"); g.font = `500 10px ${val("--kf-font-sans")}`; g.textBaseline = "middle";
        g.fillText((it?.dataset.title || it?.textContent || `Item ${i + 1}`).trim().slice(0, 32), x + MX, y + MY + MH + MY / 2);
      }
      tex.needsUpdate = true;
    };
    const renderer = new T.WebGLRenderer({ antialias: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const cv = renderer.domElement;
    cv.setAttribute("aria-hidden", "true");
    cv.className = "fx-lens-grid-wall__gl";
    el.prepend(cv);
    const rt = new T.WebGLRenderTarget(2, 2, { depthBuffer: false });
    const grid = new T.ShaderMaterial({
      vertexShader: V, depthTest: false, depthWrite: false,
      uniforms: { uAtlas: { value: tex }, uRes: { value: new T.Vector2(1, 1) }, uCell: { value: new T.Vector2(1, 1) }, uPan: { value: new T.Vector2() }, uLens: { value: new T.Vector4(...LENS) },
        uHa: { value: new T.Vector4(1e6, 1e6, 0, 0) }, uHb: { value: new T.Vector4(1e6, 1e6, 0, 0) }, uMedia: { value: new T.Vector4(MX / SW, MY / SH, (MX + MW) / SW, (MY + MH) / SH) },
        uSlots: { value: new T.Vector2(cols, rows) }, uCount: { value: count }, uInk: { value: rgb("--kf-ink") } },
      fragmentShader: `
        uniform sampler2D uAtlas; uniform vec2 uRes, uCell, uPan, uSlots; uniform vec4 uLens, uHa, uHb, uMedia; uniform float uCount; uniform vec3 uInk; varying vec2 vUv;
        vec2 bend(vec2 s) { vec2 q = s * s; return vec2(s.x * (1.0 + uLens.z * q.x) / (1.0 + uLens.y * q.y), s.y * (1.0 + uLens.w * q.y) / (1.0 + uLens.x * q.x)); }
        float lit(vec2 c, vec4 h) { vec2 d = abs(c - h.xy); return (d.x < 0.5 && d.y < 0.5) ? h.z : 0.0; }
        void main() {
          vec2 cell = bend((vUv - 0.5) * 2.0 * vec2(uRes.x / uRes.y, 1.0)) / uCell - uPan;
          vec2 ci = floor(cell), lc = cell - ci;
          float h = max(lit(ci, uHa), lit(ci, uHb));
          vec2 m = (lc - uMedia.xy) / (uMedia.zw - uMedia.xy);
          float inM = step(0.0, m.x) * step(m.x, 1.0) * step(0.0, m.y) * step(m.y, 1.0);
          vec2 mz = 0.5 + (m - 0.5) / (1.0 + 0.04 * h);
          float idx = mod(ci.x + 3.0 * ci.y, uCount);
          vec2 slot = vec2(mod(idx, uSlots.x), floor(idx / uSlots.x));
          vec2 lu = clamp(inM > 0.5 ? uMedia.xy + mz * (uMedia.zw - uMedia.xy) : lc, 0.003, 0.997);
          vec3 c = texture2D(uAtlas, vec2((slot.x + lu.x) / uSlots.x, (slot.y + 1.0 - lu.y) / uSlots.y)).rgb;
          c += (1.0 - inM) * h * (0.08 + 0.1 * (1.0 - lc.y));
          vec2 e = min(lc, 1.0 - lc) / max(fwidth(cell), vec2(1e-5));
          c = mix(c, uInk, 0.07 * (1.0 - smoothstep(0.0, 1.0, min(e.x, e.y))));
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    const post = new T.ShaderMaterial({
      vertexShader: V, depthTest: false, depthWrite: false,
      uniforms: { tScene: { value: rt.texture }, uRes: { value: new T.Vector2(1, 1) }, uCopy: { value: 0.45 }, uFade: { value: 0 }, uBg: { value: rgb("--kf-bg") } },
      fragmentShader: `
        uniform sampler2D tScene; uniform vec2 uRes; uniform float uCopy, uFade; uniform vec3 uBg; varying vec2 vUv;
        vec4 frost(vec2 uv, float r) { vec4 a = texture2D(tScene, uv); float ws = 1.0;
          for (int i = 1; i < 32; i++) { float f = float(i), rr = sqrt(f / 31.0), an = f * 2.39996, w = 1.0 - 0.6 * rr; a += texture2D(tScene, uv + vec2(cos(an), sin(an)) * rr * r / uRes) * w; ws += w; }
          return a / ws; }
        void main() {
          vec4 c = texture2D(tScene, vUv);
          float y = 1.0 - vUv.y, t = clamp((y - uCopy + 0.12) / 0.30, 0.0, 1.0), r = 1.0 - smoothstep(0.0, 1.0, pow(t, 1.5));
          if (r > 0.001) { vec4 f = frost(vUv, 14.0 * r); f.rgb = mix(f.rgb, f.rgb * 0.92 + 0.04, 0.5 * r); c = mix(c, f, smoothstep(0.0, 0.1, r)); }
          float g = clamp((0.80 - y) / 0.70, 0.0, 1.0);
          c.rgb = mix(c.rgb, uBg, 1.0 - (1.0 - g) * (1.0 - g));
          c.rgb = mix(c.rgb, uBg, 0.55 * smoothstep(0.6, 1.4, length((vUv - 0.5) * 2.0)));
          gl_FragColor = vec4(mix(uBg, c.rgb, uFade), 1.0);
        }`,
    });
    const quad = new T.PlaneGeometry(2, 2);
    const gS = new T.Scene(); gS.add(new T.Mesh(quad, grid));
    const pS = new T.Scene(); pS.add(new T.Mesh(quad, post));
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const st = { pan: { x: -0.5, y: -0.5 }, vel: { x: 0, y: 0 }, lean: { x: 0, y: 0 }, to: { x: 0, y: 0 }, bend: 1, w: 1, h: 1, px: 300, copy: 0.45, sp: 0, drag: false, ptr: null,
      t: reduce ? 9 : 0, ha: { x: 1e6, y: 1e6, t: 0, on: false }, hb: { x: 1e6, y: 1e6, t: 0 }, on: true };
    const size = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1, pr = renderer.getPixelRatio();
      renderer.setSize(w, h, false); rt.setSize(Math.round(w * pr), Math.round(h * pr));
      grid.uniforms.uRes.value.set(w * pr, h * pr); post.uniforms.uRes.value.set(w * pr, h * pr);
      st.w = w; st.h = h; const a = w / h;
      st.px = w * (cellF || (a < 1 ? 0.62 : a < 1.3 ? 0.36 : 0.26));
      st.copy = copy ? Math.min(0.8, (copy.offsetTop + copy.offsetHeight) / h) : 0.2;
    };
    const cellAt = (u, v) => {
      const a = (u - 0.5) * 2 * (st.w / st.h), b = (v - 0.5) * 2, L = grid.uniforms.uLens.value, c = grid.uniforms.uCell.value, p = grid.uniforms.uPan.value;
      return { x: Math.floor(((a * (1 + L.z * a * a)) / (1 + L.y * b * b)) / c.x - p.x), y: Math.floor(((b * (1 + L.w * b * b)) / (1 + L.x * a * a)) / c.y - p.y) };
    };
    const frostAt = (v) => { const r = Math.min(1, Math.max(0, (1 - v - st.copy + 0.12) / 0.3)) ** 1.5; return 1 - r * r * (3 - 2 * r); };
    const frame = (ms) => {
      const dt = Math.min(ms / 1000, 0.1), d = dt * 60;
      if (!reduce) st.pan.x += drift * dt;
      if (!st.drag) { st.pan.x += st.vel.x * d; st.pan.y += st.vel.y * d; const k = Math.pow(0.94, d); st.vel.x *= k; st.vel.y *= k; }
      const sp = Math.hypot(st.vel.x, st.vel.y);
      st.bend += (1 + Math.min(0.6, 6 * sp) - st.bend) * (1 - Math.pow(0.9, d));
      const lk = 1 - Math.pow(0.95, d);
      st.lean.x += (st.to.x - st.lean.x) * lk; st.lean.y += (st.to.y - st.lean.y) * lk;
      let m = 1, add = 0, dy = 0, fade = 1;
      if (st.t < introDur) { st.t += dt; const e = expoOut(Math.min(1, st.t / Math.max(introDur, 0.001))); m = 0.7 + 0.3 * e; add = 1.6 * (1 - e); dy = -0.6 * (1 - e); fade = expoOut(Math.min(1, st.t / 0.6)); }
      const flat = reduce ? 1 : 1 - st.sp;
      fade *= 1 - 0.5 * Math.min(1, st.sp / 0.35);
      const k = (st.bend + add) * flat;
      grid.uniforms.uLens.value.set(LENS[0] * k, LENS[1] * k, LENS[2] * k, LENS[3] * k);
      const cx = (st.px * m) / (st.h / 2);
      grid.uniforms.uCell.value.set(cx, cx / RATIO);
      grid.uniforms.uPan.value.set(st.pan.x + st.lean.x, st.pan.y + st.lean.y + dy);
      let hit = null;
      if (!st.drag && st.t >= introDur) {
        if (!hover) { if (sp < 0.004) hit = cellAt(0.5, (1 - st.copy - 0.18) / 2); }
        else if (st.ptr && frostAt(st.ptr.v) < 0.3) hit = cellAt(st.ptr.u, st.ptr.v);
      }
      const A = st.ha;
      if (hit ? !A.on || hit.x !== A.x || hit.y !== A.y : A.on) { st.hb = A; st.ha = hit ? { x: hit.x, y: hit.y, t: 0, on: true } : { x: 1e6, y: 1e6, t: 0, on: false }; el.style.cursor = hit && hover ? "pointer" : ""; }
      const hk = 1 - Math.pow(0.82, d);
      st.ha.t += (+st.ha.on - st.ha.t) * hk; st.hb.t -= st.hb.t * hk;
      grid.uniforms.uHa.value.set(st.ha.x, st.ha.y, st.ha.t, 0); grid.uniforms.uHb.value.set(st.hb.x, st.hb.y, st.hb.t, 0);
      post.uniforms.uCopy.value = st.copy; post.uniforms.uFade.value = fade;
      renderer.setRenderTarget(rt); renderer.render(gS, cam); renderer.setRenderTarget(null); renderer.render(pS, cam);
    };
    let last = 0, raf = 0;
    const loop = (now) => { raf = 0; if (!st.on) return; frame(Math.max(1, now - (last || now - 16))); last = now; raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([e]) => { st.on = e.isIntersecting; if (st.on && !raf) { last = 0; raf = requestAnimationFrame(loop); } }, { rootMargin: "200px 0px" });
    io.observe(el);
    const uv = (e) => { const r = el.getBoundingClientRect(); return { u: (e.clientX - r.left) / st.w, v: 1 - (e.clientY - r.top) / st.h }; };
    let lx = 0, ly = 0, lt = 0, sx = 0, sy = 0;
    const down = (e) => { if (e.target.closest("a,button,input")) return; st.drag = true; st.vel.x = st.vel.y = 0; lx = sx = e.clientX; ly = sy = e.clientY; lt = performance.now(); };
    const move = (e) => {
      if (!st.drag) { if (hover && e.pointerType === "mouse" && el.contains(e.target)) { st.ptr = uv(e); st.to.x = -0.12 * (st.ptr.u - 0.5); st.to.y = -0.12 * (st.ptr.v - 0.5); } return; }
      const now = performance.now(), dx = (e.clientX - lx) / st.px, dy = hover ? -(e.clientY - ly) / (st.px / RATIO) : 0;
      st.pan.x += dx; st.pan.y += dy;
      const k = 1000 / 60 / Math.max(1, now - lt);
      st.vel.x = dx * k; st.vel.y = dy * k; lx = e.clientX; ly = e.clientY; lt = now;
    };
    const up = () => { st.drag = false; };
    const leave = () => { st.ptr = null; st.to.x = st.to.y = 0; };
    const click = (e) => {
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6 || e.target.closest("a,button,input")) return;
      const p = uv(e);
      if (frostAt(p.v) >= 0.3) return;
      const c = cellAt(p.u, p.v);
      el.dispatchEvent(new CustomEvent("fx:pick", { bubbles: true, detail: { index: (((c.x + 3 * c.y) % count) + count) % count } }));
    };
    let lastY = scrollY;
    const scroll = () => {
      const y = scrollY, top = el.getBoundingClientRect().top + y;
      st.pan.y -= ((y - lastY) / (st.px / RATIO)) * 0.4;
      st.sp = Math.min(1, Math.max(0, (y - top) / st.h));
      lastY = y;
    };
    el.addEventListener("pointerdown", down); addEventListener("pointermove", move); addEventListener("pointerup", up); addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", leave); el.addEventListener("click", click); addEventListener("scroll", scroll, { passive: true });
    const ro = new ResizeObserver(size); ro.observe(el); if (copy) ro.observe(copy);
    items.forEach((it) => it.querySelector("img")?.addEventListener("load", paint, { once: true }));
    size(); paint(); document.fonts?.ready.then(paint);
    renderer.compile(gS, cam); renderer.compile(pS, cam); frame(16);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      el.removeEventListener("pointerdown", down); removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", leave); el.removeEventListener("click", click); removeEventListener("scroll", scroll);
      renderer.dispose(); rt.dispose(); tex.dispose(); grid.dispose(); post.dispose(); quad.dispose(); cv.remove(); el.style.cursor = "";
    };
  }
})();
