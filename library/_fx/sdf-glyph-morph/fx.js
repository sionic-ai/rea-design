(() => {
  // Shader that blends and melts two glyph distance fields (symbol glyph · first letter of the name line) — mid-melt it ripples with noise by sin(πt)×wobble,
  // For symbols, a gooey distortion spreads along the diagonal (top left → bottom right) and then clears
  const FRAG = `precision highp float;
uniform float u_progress; uniform float u_wait; uniform vec3 u_timing;
uniform float u_visc; uniform float u_dist; uniform float u_fusion;
uniform float u_morph; uniform float u_soft; uniform float u_wobble;
uniform vec3 u_color; uniform sampler2D u_from; uniform sampler2D u_to;
varying vec2 vUv;
vec4 perm(vec4 x) { x = mod(x, 289.0); return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  vec3 i = floor(v + dot(v, C.yyy)), x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz), l = 1.0 - g, i1 = min(g, l.zxy), i2 = max(g, l.zxy);
  vec3 x1 = x0 - i1 + C.x, x2 = x0 - i2 + C.y, x3 = x0 - 0.5;
  i = mod(i, 289.0);
  vec4 p = perm(perm(perm(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  vec4 j = p - 49.0 * floor(p / 49.0), gx = floor(j / 7.0), gy = floor(j - 7.0 * gx);
  vec4 x = (gx * 2.0 + 0.5) / 7.0 - 1.0, y = (gy * 2.0 + 0.5) / 7.0 - 1.0, h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy), b1 = vec4(x.zw, y.zw), s0 = floor(b0) * 2.0 + 1.0, s1 = floor(b1) * 2.0 + 1.0, sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy, a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 g0 = vec3(a0.xy, h.x), g1 = vec3(a0.zw, h.y), g2 = vec3(a1.xy, h.z), g3 = vec3(a1.zw, h.w);
  vec4 n = inversesqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
  g0 *= n.x; g1 *= n.y; g2 *= n.z; g3 *= n.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m *= m;
  return 42.0 * dot(m * m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
}
float sweep(vec2 uv) {
  if (u_wait > 0.5) return 0.0;
  float d = (uv.x + 1.0 - uv.y) * 0.5, f = u_timing.z;
  float lead = mix(-0.18, 1.18, smoothstep(0.0, u_timing.x, u_progress));
  float trail = mix(-0.18, 1.18, smoothstep(u_timing.y, 1.0, u_progress));
  return (1.0 - smoothstep(lead - f, lead, d)) * smoothstep(trail, trail + f, d);
}
void main() {
  vec2 uv = vUv;
  float a = u_progress * 6.2831853;
  float n1 = snoise(vec3(uv * u_visc + 0.5 * vec2(cos(a), sin(a)), 0.5 * sin(a)));
  float n2 = snoise(vec3(uv * u_visc * 1.5 + 0.5 * vec2(cos(a + 2.0), sin(a + 2.0)), 0.5 * cos(a)));
  float m = sweep(uv);
  vec2 q = uv + vec2(n1, n2) * u_dist * m;
  q.y += abs(n1 * u_dist) * 0.8 * m;
  float t = u_morph * u_morph * (3.0 - 2.0 * u_morph);
  float sd = mix(texture2D(u_from, q).r, texture2D(u_to, q).r, t) * 2.0 - 1.0;
  sd += snoise(vec3(q * u_visc, a)) * u_wobble * sin(t * 3.14159265);
  float s1 = max(u_soft, fwidth(sd) * 1.5);
  float raw = smoothstep(-s1, s1, sd);
  float s2 = max(u_fusion, fwidth(raw) * 1.5);
  gl_FragColor = vec4(u_color, smoothstep(0.5 - s2, 0.5 + s2, raw));
  #include <colorspace_fragment>
}`;

  // Draw the letters on a canvas and bake them into a distance field — inside +, outside -, clamped to ±1 at the spread (px) so .5 is the edge, an 8-bit map (from the line below)
  const bake = (T, w, h, draw, spread) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.fillStyle = "#fff"; // Not skin: the mask that bakes the distance field — only alpha is read, nothing is painted on screen
    draw(g);
    const a = g.getImageData(0, 0, w, h).data, n = w * h, BIG = 1e20;
    const outer = new Float64Array(n), inner = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const v = a[i * 4 + 3] / 255;
      if (v >= 1) { outer[i] = 0; inner[i] = BIG; }
      else if (v <= 0) { outer[i] = BIG; inner[i] = 0; }
      else { const o = Math.max(0, 0.5 - v), k = Math.max(0, v - 0.5); outer[i] = o * o; inner[i] = k * k; }
    }
    const len = Math.max(w, h), f = new Float64Array(len), d = new Float64Array(len), z = new Float64Array(len + 1), vv = new Uint32Array(len);
    const line = (grid, off, step, cnt) => {
      for (let q = 0; q < cnt; q++) f[q] = grid[off + q * step];
      let k = 0; vv[0] = 0; z[0] = -BIG; z[1] = BIG;
      for (let q = 1; q < cnt; q++) {
        let s;
        do { const r = vv[k]; s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2; } while (s <= z[k] && --k > -1);
        k++; vv[k] = q; z[k] = s; z[k + 1] = BIG;
      }
      for (let q = 0, j = 0; q < cnt; q++) { while (z[j + 1] < q) j++; const r = vv[j]; d[q] = (q - r) * (q - r) + f[r]; }
      for (let q = 0; q < cnt; q++) grid[off + q * step] = d[q];
    };
    [outer, inner].forEach((grid) => {
      for (let x = 0; x < w; x++) line(grid, x, w, h);
      for (let y = 0; y < h; y++) line(grid, y * w, 1, w);
    });
    const data = new Uint8Array(n * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, sd = (Math.sqrt(inner[i]) - Math.sqrt(outer[i])) / spread;
      const o = ((h - 1 - y) * w + x) * 4, v = Math.round((Math.max(-1, Math.min(1, sd)) * 0.5 + 0.5) * 255);
      data[o] = data[o + 1] = data[o + 2] = v; data[o + 3] = 255;
    }
    const tex = new T.DataTexture(data, w, h, T.RGBAFormat, T.UnsignedByteType);
    tex.minFilter = tex.magFilter = T.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  };

  kfFx.register("sdf-glyph-morph", (el, { options, reduce }) => {
    const T = window.THREE;
    const anchor = el.querySelector('[data-fx-part="anchor"]');
    if (!T?.WebGLRenderer || !window.gsap || !anchor?.firstChild || !anchor.textContent.trim()) return;
    const sides = [...el.querySelectorAll('[data-fx-part="line"]')];
    const words = [...el.querySelectorAll('[data-fx-part="line"], [data-fx-part="anchor"]')];
    const glyphEl = el.querySelector('[data-fx-part="glyph"]') || anchor;
    const letter = String(options.letter || anchor.textContent.trim()[0]);
    const SCALE0 = +(options.scale ?? 0.65), SCALE_END = +(options.end ?? 0.25), TH = 384;
    const D = { visc: +(options.visc ?? 1.14), dist: +(options.dist ?? 0.05), fusion: +(options.fusion ?? 0.2) };
    const IN = +(options.in ?? 6), PAUSE = +(options.pause ?? 0.1), OUT = +(options.out ?? 6), OVERLAP = +(options.overlap ?? -2);
    const LAPS = Math.max(1, +options.laps || 2), HOLD = +(options.hold ?? 2), DUR = +(options.dur ?? 1.1);
    const cycle = String(options.cycle ?? "1") !== "0";
    const ACTIVE = IN + PAUSE + OUT, TOTAL = Math.max(0.1, ACTIVE + OVERLAP);
    const P = { morph: 0, ...D };

    const holder = document.createElement("span");
    holder.className = "fx-sdf-glyph-morph__gl";
    holder.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    holder.append(canvas);
    el.prepend(holder);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1));
    renderer.setClearColor(0, 0);
    const scene = new T.Scene(), camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    // Text color follows the element’s color — when the skin changes it follows along in .3s power3.out
    // Even if the computed color is oklch or color-mix, paint it on a 1px pixel and read it back as sRGB
    let inkCss = "";
    const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const ink = () => {
      const c = getComputedStyle(el).color;
      if (c === inkCss) return null;
      inkCss = c;
      swatch.clearRect(0, 0, 1, 1);
      swatch.fillStyle = c;
      swatch.fillRect(0, 0, 1, 1);
      const m = swatch.getImageData(0, 0, 1, 1).data;
      return new T.Color().setRGB(m[0] / 255, m[1] / 255, m[2] / 255, T.SRGBColorSpace);
    };
    const u = {
      u_progress: { value: 0 }, u_wait: { value: 0 }, u_timing: { value: new T.Vector3(IN / ACTIVE, (IN + PAUSE) / ACTIVE, 0.14) },
      u_visc: { value: D.visc }, u_dist: { value: D.dist }, u_fusion: { value: D.fusion },
      u_morph: { value: 0 }, u_soft: { value: 0.025 }, u_wobble: { value: +(options.wobble ?? 0.025) },
      u_color: { value: ink() }, u_from: { value: null }, u_to: { value: null },
    };
    const mat = new T.ShaderMaterial({ vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}", fragmentShader: FRAG, uniforms: u, transparent: true, depthWrite: false });
    const geo = new T.PlaneGeometry(2, 2);
    scene.add(new T.Mesh(geo, mat));
    const push = () => { u.u_morph.value = P.morph; u.u_visc.value = P.visc; u.u_dist.value = P.dist; u.u_fusion.value = P.fusion; };

    // The symbol sits centered at .9 of the panel height, and the end letter is baked so that when the panel shrinks by end/scale it has the same size and baseline as the name line (baseline measured from the DOM)
    let baked = "", aspect = 1, penUv = 0.5, endX = 0;
    const endScale = SCALE_END / SCALE0;
    const bakeAll = () => {
      const hc = el.clientHeight, cs = getComputedStyle(anchor), gs = getComputedStyle(glyphEl);
      if (!hc) return false;
      const k = TH / (SCALE_END * hc), endFont = `${cs.fontStyle} ${cs.fontWeight} ${parseFloat(cs.fontSize) * k}px ${cs.fontFamily}`;
      const glyphWeight = glyphEl === anchor ? 800 : gs.fontWeight;
      const g = document.createElement("canvas").getContext("2d");
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const range = document.createRange();
      range.setStart(anchor.firstChild, 0); range.setEnd(anchor.firstChild, 1);
      const rr = range.getBoundingClientRect(), mr = anchor.getBoundingClientRect();
      const base = Math.round((rr.top + g.measureText(letter).fontBoundingBoxAscent - (mr.top + mr.height / 2)) * 100) / 100;
      const key = `${endFont}|${base}|${gs.fontFamily}|${glyphWeight}|${letter}`;
      if (baked === key) return true;
      baked = key;
      g.font = `${gs.fontStyle} ${glyphWeight} 100px ${gs.fontFamily}`;
      const ms = g.measureText(letter), startSize = (100 * 0.9 * TH) / Math.max(1, ms.actualBoundingBoxAscent + ms.actualBoundingBoxDescent);
      const startFont = `${gs.fontStyle} ${glyphWeight} ${startSize}px ${gs.fontFamily}`;
      g.font = startFont;
      const s = g.measureText(letter);
      g.font = endFont;
      const e = g.measureText(letter);
      const margin = 0.06 * TH;
      const tw = Math.round(Math.max(s.actualBoundingBoxLeft + s.actualBoundingBoxRight, e.actualBoundingBoxLeft + e.actualBoundingBoxRight) + margin * 2);
      aspect = tw / TH;
      const sx = tw / 2 - (s.actualBoundingBoxRight - s.actualBoundingBoxLeft) / 2, sy = TH / 2 + (s.actualBoundingBoxAscent - s.actualBoundingBoxDescent) / 2;
      const ex = tw / 2 - (e.actualBoundingBoxRight - e.actualBoundingBoxLeft) / 2, ey = TH / 2 + base * k;
      penUv = ex / tw;
      u.u_from.value?.dispose(); u.u_to.value?.dispose();
      u.u_from.value = bake(T, tw, TH, (c) => { c.font = startFont; c.fillText(letter, sx, sy); }, 0.1 * TH);
      u.u_to.value = bake(T, tw, TH, (c) => { c.font = endFont; c.fillText(letter, ex, ey); }, 0.1 * TH);
      return true;
    };
    const layout = () => {
      if (!bakeAll()) return false;
      const hc = el.clientHeight, m = el.getBoundingClientRect(), r = anchor.getBoundingClientRect();
      const ph = SCALE0 * hc, pw = ph * aspect, relLeft = r.left - m.left - (gsap.getProperty(anchor, "x") || 0);
      holder.style.width = `${pw}px`; holder.style.height = `${ph}px`;
      holder.style.top = `${r.top - m.top + r.height / 2 - ph / 2}px`;
      renderer.setSize(pw, ph, false);
      endX = relLeft - pw / 2 - (penUv - 0.5) * pw * endScale;
      return true;
    };

    let tl = null, T0 = 0, state = "sweeping", done = 0, auto = false, ready = false, alive = true;
    const calls = [];
    const later = (s, fn) => calls.push(gsap.delayedCall(s, fn));
    const loopUniforms = () => {
      if (T0 >= ACTIVE) { u.u_wait.value = 1; u.u_progress.value = 0; return; }
      u.u_wait.value = 0; u.u_progress.value = T0 / ACTIVE;
    };
    const glyphState = () => {
      Object.assign(P, { morph: 0 }, D); push();
      gsap.set(holder, { x: 0, y: 0, scale: 1, opacity: 1 });
      gsap.set(anchor, { opacity: 0, x: 0 });
      if (sides.length) gsap.set(sides, { opacity: 0, x: 50 });
    };
    // Symbol → name timeline: melt·panel shrink·move dur power1.out (rewind power1.inOut) · panel vanishes from dur-.2 to dur-.4 · side line x -30→0 from dur-.5 · name line .5s from dur-.2
    const build = (onDone, onBack) => {
      tl?.kill();
      glyphState();
      tl = gsap.timeline({ paused: true, onComplete: onDone, onReverseComplete: onBack })
        .to(P, { morph: 1, visc: 0, dist: 0, fusion: 0, duration: DUR, ease: "power1.out", easeReverse: "power1.inOut", onUpdate: push }, 0)
        .to(holder, { scale: endScale, x: endX, duration: DUR, ease: "power1.out", easeReverse: "power1.inOut" }, 0)
        .to(holder, { opacity: 0, duration: DUR - 0.4, ease: "power1.out", easeReverse: "power1.in" }, DUR - 0.2)
        .fromTo(anchor, { opacity: 0 }, { opacity: 1, duration: 0.5 }, DUR - 0.2);
      if (sides.length) tl.fromTo(sides, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: DUR, stagger: 0.2, ease: "power2.out", easeReverse: "power2.in" }, DUR - 0.5);
    };
    const resume = () => { state = "sweeping"; T0 = 0; done = 0; Object.assign(P, D); push(); loopUniforms(); };
    const toGlyph = () => {
      if (state !== "wordmark") return;
      state = "reverse";
      layout();
      build(null, () => { if (state === "reverse") resume(); });
      tl.timeScale(1).progress(1, true).pause().reverse();
      push();
    };
    const toWordmark = () => {
      state = "intro"; done = 0;
      layout();
      build(() => { if (state === "intro") { state = "wordmark"; later(HOLD, toGlyph); } });
      tl.timeScale(1).play(0);
    };
    const tick = (dt) => {
      if (auto && state !== "sweeping") return;
      T0 += dt;
      if (T0 >= TOTAL) {
        const laps = Math.floor(T0 / TOTAL);
        T0 %= TOTAL;
        if (auto && state === "sweeping") { done = Math.min(done + laps, LAPS); if (done >= LAPS) { loopUniforms(); toWordmark(); return; } }
      }
      loopUniforms();
    };
    let last = performance.now(), colorAt = 0;
    const frame = () => {
      const now = performance.now(), dt = Math.min(0.1, Math.max(0, now - last) / 1000);
      last = now;
      if (!ready || document.hidden) return;
      if (now - colorAt > 500) {
        colorAt = now;
        const c = ink();
        if (c) gsap.to(u.u_color.value, { r: c.r, g: c.g, b: c.b, duration: 0.3, ease: "power3.out", overwrite: true });
      }
      if (!reduce) tick(dt);
      renderer.render(scene, camera);
    };
    gsap.ticker.add(frame);
    const ro = new ResizeObserver(() => { if (ready) layout(); });
    ro.observe(el);

    gsap.set(words, { opacity: 0 });
    gsap.set(holder, { opacity: 0 });
    const fontOf = (n) => { const c = getComputedStyle(n); return document.fonts.load(`${c.fontStyle} ${c.fontWeight} 40px ${c.fontFamily}`, letter).catch(() => {}); };
    Promise.all([fontOf(glyphEl), fontOf(anchor)]).then(() => document.fonts.ready).then(() => {
      if (!alive || !layout()) return;
      renderer.compile(scene, camera);
      ready = true;
      const fire = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
      // name: like the original loader, the name line enters after delay with an x -30→0 entrance (each stagger, power2.out), stays for pause, then the melt timeline rewinds over reverse seconds to become a symbol
      if (options.intro === "name" && !reduce) {
        later(+(options.delay ?? 0.2), () => {
          layout();
          build(null, () => { auto = cycle; state = "sweeping"; done = 0; Object.assign(P, D); push(); loopUniforms(); fire(); });
          tl.progress(1, true).pause();
          push();
          gsap.set(words, { opacity: 0, x: -30 });
          const seq = gsap.timeline()
            .to(words, { opacity: 1, x: 0, duration: +(options.entrance ?? 0.8), stagger: +(options.each ?? 0.18), ease: "power2.out" })
            .to({}, { duration: +(options.stay ?? 0.7) })
            .add(() => {
              state = "reverse";
              gsap.set(words, { opacity: 1, x: 0 });
              tl.progress(1, true).pause();
              push();
              gsap.set(holder, { opacity: 0 });
              tl.timeScale(tl.duration() / Math.max(0.1, +(options.reverse ?? 2.6))).reverse();
            });
          calls.push(seq);
        });
      } else {
        glyphState();
        auto = cycle && !reduce;
        resume();
        fire();
      }
    });

    return () => {
      alive = false;
      gsap.ticker.remove(frame);
      ro.disconnect();
      calls.forEach((c) => c.kill());
      tl?.kill();
      gsap.killTweensOf(u.u_color.value);
      u.u_from.value?.dispose(); u.u_to.value?.dispose();
      mat.dispose(); geo.dispose(); renderer.dispose();
      holder.remove();
      gsap.set(words, { clearProps: "opacity,transform" });
    };
  });
})();
