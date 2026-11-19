(() => {
  // Draws three discs plus one white bloom in a single shader. The lens (the round spot where disc edges melt and blur) orbits the disc centroid once every 5s
  // Pulled .3 toward the hand (up to .95 on wider screens). When a page changes the orb position with fx:orbs, it glides to that spot.
  const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2 uAspect;
uniform vec3 uBase;
uniform vec3 uTint;
uniform vec3 uGlow;
uniform vec4 uOrb[4];
uniform vec4 uSide;
uniform vec2 uLens;
uniform vec2 uLensSize;
uniform float uLensEdge;
uniform float uSoft;
uniform float uGlowSoft;
uniform float uGlowAlpha;
uniform float uGrain;
uniform float uGrainCell;
uniform float uTime;

float disc(float sd, float e) { return 1.0 - smoothstep(-e, e, sd); }
float side(float px, float cx, float r, float dir) {
  if (abs(dir) < 0.1) return 1.0;
  return 1.0 - smoothstep(-0.5, 0.6, (px - cx) / max(r, 0.001) * dir);
}
float core(float d, float r) {
  float n = clamp(d / max(r, 0.001), 0.0, 1.0);
  return n < 0.5 ? mix(1.0, 0.7, n * 2.0) : mix(0.7, 0.0, n * 2.0 - 1.0);
}
float grainHash(vec2 c) {
  vec3 q = fract(vec3(c.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yxz + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main() {
  vec2 p = (vUv - 0.5) * uAspect;
  float ld = length(p - uLens) * 2.0;
  float lensTint = max(1.0 - smoothstep(uLensSize.x - uLensEdge, uLensSize.x + uLensEdge, ld), 0.001);
  float lensGlow = max(1.0 - smoothstep(uLensSize.y - uLensEdge, uLensSize.y + uLensEdge, ld), 0.001);

  float cover = 0.0;
  float light = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 o = uOrb[i];
    if (o.z < 0.0005) continue;
    float d = length(p - o.xy);
    float sd = d - o.z;
    float w = clamp(o.w * side(p.x, o.x, o.z, uSide[i]), 0.0, 1.0);
    cover = max(cover, max(disc(sd, lensTint) * 1.5, disc(sd, uSoft) * 1.2) * w);
    light = max(light, core(d, o.z) * w);
  }
  vec3 col = mix(uBase, mix(uTint, uGlow, light), clamp(cover, 0.0, 1.0));

  vec4 g = uOrb[3];
  float glow = 0.0;
  if (g.z >= 0.0005) {
    float sd = length(p - g.xy) - g.z;
    glow = max(disc(sd, lensGlow) * 1.5, disc(sd, uGlowSoft) * 1.2);
    col = mix(col, uGlow, clamp(glow * uGlowAlpha * g.w * side(p.x, g.x, g.z, uSide[3]), 0.0, 1.0));
  }

  float n = grainHash(floor(gl_FragCoord.xy / max(uGrainCell, 0.001)) + mod(uTime * 10.0, 1000.0)) * 2.0 - 1.0;
  col += n * uGrain * smoothstep(0.0, 0.1, clamp(max(cover, glow), 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}`;

  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const smooth = (e0, e1, x) => { const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1); return t * t * (3 - 2 * t); };
  const parse = (raw) => { try { return raw ? JSON.parse(raw) : null; } catch { return null; } };

  kfFx.register("orb-lens-bg", (el, { options, reduce, scroller }) => {
    const THREE = window.THREE;
    if (!THREE?.WebGLRenderer) return;
    const num = (k, d) => { const v = parseFloat(options[k]); return Number.isFinite(v) ? v : d; };
    const lag = num("lag", 8) || 8, turn = num("turn", 5) || 5, pull = num("pull", 0.3), lens = num("lens", 0.35), edge = num("edge", 0.6);
    const grain = num("grain", 0.04), cell = num("cell", 1.35) || 1.35, depth = num("scroll", 0.5), front = num("front", 2.5);
    const glowAlpha = num("glow", 0.5), glowSoft = num("glow-soft", 0.1), soft = num("soft", 400);
    const narrow = matchMedia(`(max-width: ${num("sp", 766.98)}px)`);
    let still = reduce;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" }); }
    catch { canvas.remove(); return; }
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    // Skin variables can be expressions like color-mix — paint one point and read it back so any expression resolves to sRGB numbers
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const color = (name, fb) => {
      const span = document.createElement("span");
      span.style.cssText = `position:absolute;visibility:hidden;color:var(${name}, ${fb})`;
      el.append(span);
      const v = getComputedStyle(span).color;
      span.remove();
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = "transparent";
      probe.fillStyle = v;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
      return new THREE.Vector3(r / 255, g / 255, b / 255);
    };
    const u = {
      uAspect: { value: new THREE.Vector2(1, 1) }, uBase: { value: new THREE.Vector3() }, uTint: { value: new THREE.Vector3() }, uGlow: { value: new THREE.Vector3() },
      uOrb: { value: [0, 1, 2, 3].map(() => new THREE.Vector4()) }, uSide: { value: new THREE.Vector4() },
      uLens: { value: new THREE.Vector2() }, uLensSize: { value: new THREE.Vector2() }, uLensEdge: { value: edge },
      uSoft: { value: 0.4 }, uGlowSoft: { value: 0.04 }, uGlowAlpha: { value: glowAlpha }, uGrain: { value: grain }, uGrainCell: { value: cell }, uTime: { value: 0 },
    };
    const paint = () => {
      u.uBase.value.copy(color("--fx-orb-base", "var(--kf-bg)"));
      u.uTint.value.copy(color("--fx-orb-tint", "var(--kf-accent-soft)"));
      u.uGlow.value.copy(color("--fx-orb-glow", "var(--kf-surface)"));
    };
    paint();
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, depthTest: false, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(mesh);
    renderer.compile(scene, camera);

    // Positions are a share of screen width — x and y are the disc’s top left, size is the diameter. The fourth is a white bloom
    let time = 0, last = 0, raf = 0;
    const blank = () => ({ cx: 0, cy: 0, size: 0, op: 1, lw: 1, dir: 0 });
    const cur = [blank(), blank(), blank(), blank()], tgt = [blank(), blank(), blank(), blank()];
    let sets = null, first = true;
    const place = (i, item) => {
      const c = cur[i], t = tgt[i];
      if (!item) { t.size = 0; return; }
      const has = item.size !== undefined, size = has ? +item.size : t.size;
      const appear = c.size < 0.01 && size > 0.01;
      if (has && size < 0.001) { t.size = 0; t.cx = c.cx; t.cy = c.cy; }
      else {
        if (item.x !== undefined) t.cx = +item.x + size * 0.5;
        if (item.y !== undefined) t.cy = +item.y + size * 0.5;
        t.size = size;
      }
      t.op = item.opacity ?? 1;
      t.lw = item.lensWeight ?? 1;
      t.dir = item.gradient === "right" ? 1 : item.gradient === "left" ? -1 : 0;
      if (appear || first) { c.cx = t.cx; c.cy = t.cy; c.op = t.op; c.lw = t.lw; }
      if (still) Object.assign(c, t);
    };
    const pick = () => {
      if (!sets) return;
      const list = Array.isArray(sets) ? sets : (narrow.matches ? sets.sp : sets.pc) || sets.pc || [];
      for (let i = 0; i < 4; i++) place(i, list[i]);
      first = false;
      kick();
    };
    sets = parse(el.getAttribute("data-orbs"));
    pick();

    let W = 1, H = 1, dpr = 1;
    const size = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(W, H, false);
      kick();
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();

    const mouse = { x: W / 2, y: H / 2, in: false };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.in = true;
    };
    addEventListener("pointermove", onMove, { passive: true });

    const scrollTop = () => (scroller ? scroller.scrollTop : window.scrollY) || 0;
    const anchor = { x: W / 2, y: H / 2 }, lensPx = { x: W / 2, y: H / 2 };

    const frame = (now) => {
      raf = 0;
      const dt = last ? Math.min(Math.max(1, now - last), 100) / 1000 : 1 / 60;
      last = now;
      const move = !still;
      if (move) time += dt;
      for (let i = 0; i < 4; i++) {
        const c = cur[i], t = tgt[i];
        if (move) { c.cx = damp(c.cx, t.cx, lag, dt); c.cy = damp(c.cy, t.cy, lag, dt); c.size = damp(c.size, t.size, lag, dt); c.op = damp(c.op, t.op, lag, dt); c.lw = damp(c.lw, t.lw, lag, dt); }
        else Object.assign(c, t);
        c.dir = t.dir;
      }
      const ar = W / H, ax = ar > 1 ? ar : 1, ay = ar > 1 ? 1 : 1 / ar;
      u.uAspect.value.set(ax, ay);
      const sc = scrollTop() * depth;
      const pxPos = cur.map((c, i) => ({ x: c.cx * W, y: c.cy * W - sc * (i === 3 ? front : 1) }));
      cur.forEach((c, i) => {
        const gx = (c.cx - 0.5) * ax, gy = (1 - pxPos[i].y / H - 0.5) * ay;
        u.uOrb.value[i].set(gx, gy, c.size * ax * 0.5, c.op);
      });
      u.uSide.value.set(cur[0].dir, cur[1].dir, cur[2].dir, cur[3].dir);

      let fx = W / 2, fy = H / 2;
      if (move) {
        const reach = Math.min(W, H) * 0.9, near = reach * 0.75;
        let sw = 0, sx = 0, sy = 0;
        cur.forEach((c, i) => {
          if (c.size < 0.01 || c.op < 0.01 || c.lw <= 0) return;
          const d = Math.hypot(mouse.x - pxPos[i].x, mouse.y - pxPos[i].y);
          const w = (1 / (d + 0.12)) * (1 - smooth(near, reach, d)) * c.lw;
          sw += w; sx += pxPos[i].x * w; sy += pxPos[i].y * w;
        });
        const tx = sw > 1e-6 ? sx / sw : pxPos[0].x, ty = sw > 1e-6 ? sy / sw : pxPos[0].y;
        anchor.x = damp(anchor.x, tx, lag, dt); anchor.y = damp(anchor.y, ty, lag, dt);
        const a = (time / turn) * Math.PI * 2, rad = Math.min(W, H) * 0.2;
        const ox = anchor.x + Math.cos(a) * rad, oy = anchor.y + Math.sin(a) * rad;
        const k = ar > 1.2 ? pull + (0.95 - pull) * Math.min((ar - 1.2) / 1.3, 1) : pull;
        fx = mouse.in ? ox + (mouse.x - ox) * k : ox;
        fy = mouse.in ? oy + (mouse.y - oy) * k : oy;
      } else {
        let sw = 0, sx = 0, sy = 0;
        cur.forEach((c, i) => {
          const w = c.op < 0.01 || c.lw <= 0 ? 0 : c.size * c.op * c.lw;
          sw += w; sx += pxPos[i].x * w; sy += pxPos[i].y * w;
        });
        if (sw > 1e-6) { fx = sx / sw; fy = sy / sw; }
      }
      lensPx.x = move ? damp(lensPx.x, fx, lag, dt) : fx;
      lensPx.y = move ? damp(lensPx.y, fy, lag, dt) : fy;
      const lx = (lensPx.x / W - 0.5) * ax, ly = (0.5 - lensPx.y / H) * ay;
      u.uLens.value.set(lx, ly);

      // Lens size — 8th-power mean toward the diameter of the disc nearest the lens, ratio bound so bigger discs grow less
      const dia = cur.slice(0, 3).map((c) => c.size * ax);
      let ws = 0, acc = 0;
      cur.slice(0, 3).forEach((c, i) => {
        if (dia[i] < 0.001 || c.op <= 0.001) return;
        const d = Math.hypot(lx - u.uOrb.value[i].x, ly - u.uOrb.value[i].y);
        const w = (1 / (d + 0.12)) * (1 - smooth(0.72, 1.8, d)) * Math.max(c.lw, 0);
        ws += w; acc += Math.pow(dia[i], 8) * w;
      });
      const eff = ws > 0.001 ? Math.pow(acc / ws, 1 / 8) : dia[0];
      const ratio = Math.min((move ? lens : 0) / Math.max(Math.max(...dia), 0.9), 1.15);
      u.uLensSize.value.set(eff * ratio, cur[3].size * ax * ratio);
      u.uLensEdge.value = move ? edge : 0.001;
      u.uSoft.value = move ? Math.max(soft / (Math.min(W, H) * dpr), 0.0005) : 0.0005;
      u.uGlowSoft.value = move ? Math.max(u.uSoft.value * glowSoft, 0.0005) : 0.0005;
      u.uTime.value = time;
      renderer.render(scene, camera);
      if (move && document.visibilityState !== "hidden") raf = requestAnimationFrame(frame);
    };
    function kick() { if (!raf) raf = requestAnimationFrame((t) => frame(t)); }
    const onVis = () => { last = 0; kick(); };
    document.addEventListener("visibilitychange", onVis);
    (scroller || window).addEventListener("scroll", kick, { passive: true });

    const onOrbs = (e) => { const d = e.detail || {}; sets = d.items || (d.pc || d.sp ? d : sets); pick(); };
    const onMotion = (e) => {
      const want = !!e.detail?.reduce;
      if (want === still) return;
      still = want;
      last = 0; kick();
    };
    const onTheme = () => { paint(); kick(); };
    el.addEventListener("fx:orbs", onOrbs);
    el.addEventListener("fx:motion", onMotion);
    el.addEventListener("fx:theme", onTheme);
    narrow.addEventListener("change", pick);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      (scroller || window).removeEventListener("scroll", kick);
      el.removeEventListener("fx:orbs", onOrbs);
      el.removeEventListener("fx:motion", onMotion);
      el.removeEventListener("fx:theme", onTheme);
      narrow.removeEventListener("change", pick);
      mesh.geometry.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss();
      canvas.remove();
    };
  });
})();
