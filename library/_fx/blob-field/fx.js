(() => {
  const FRAG = `#include <common>
uniform vec2 u_resolution; uniform float u_time;
uniform vec2 u_blobs[5]; uniform vec3 u_colors[5]; uniform float u_radii[5];
uniform float u_wobble_amt; uniform float u_wobble_spd; uniform float u_blend;
uniform vec3 u_bg_color; uniform float u_blob_opacity; uniform float u_blobs_only; uniform float u_radius_scale; uniform float u_flat_blobs;
varying vec2 vUv;
vec2 sminK(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return vec2(mix(b, a, h) - k * h * (1.0 - h), h); }
void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  float rs = max(u_radius_scale, 0.0001), k = u_blend * rs, t = u_time * u_wobble_spd;
  vec2 w = uv;
  w.y += cos(uv.x * 3.0 + t * 0.5) * 0.005 * u_wobble_amt * rs;
  w.x += sin(uv.y * 3.0 + t * 0.6) * 0.005 * u_wobble_amt * rs;
  w.y += sin(uv.x * 8.0 - t * 0.3) * 0.002 * u_wobble_amt * rs;
  float d = 100.0; vec3 col = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    vec2 p = u_blobs[i]; p.x *= aspect;
    vec2 diff = w - p;
    float r = u_radii[i] * rs, dist = length(diff) - r;
    float g = smoothstep(0.0, 1.0, length(diff) / max(r, 0.0001));
    vec3 c = u_colors[i];
    if (u_flat_blobs < 0.5) c = mix(c, c * 0.58, g);
    else { float luma = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(mix(c, vec3(1.0), luma < 0.45 ? 0.015 : 0.16), c * (luma < 0.45 ? 0.96 : 0.78), g); }
    if (i == 0) { d = dist; col = c; } else { vec2 m = sminK(d, dist, k); d = m.x; col = mix(c, col, m.y); }
  }
  float edge = 0.001 * rs, alpha = 1.0 - smoothstep(0.0, edge, d);
  if (u_flat_blobs < 0.5) col *= 1.0 - smoothstep(-0.1, 0.02, d) * 0.03 * u_blob_opacity;
  if (u_blobs_only > 0.5) { float a = alpha * u_blob_opacity; if (a < 0.001) discard; gl_FragColor = vec4(col, a); }
  else gl_FragColor = vec4(d < edge ? mix(u_bg_color, col, alpha * u_blob_opacity) : u_bg_color, 1.0);
  #include <colorspace_fragment>
}`;
  const VERT = "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";

  kfFx.register("blob-field", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T?.WebGLRenderer) return;
    const soft = options.look === "soft", N = 5;
    const mobile = () => innerWidth < 1024;
    let scaleFactor = mobile() ? 0.6 : 1.1;
    const sizeScale = +(options.scale ?? (soft ? 0.38 : 0.7));
    const opacity = +(options.opacity ?? (soft ? 0.4 : mobile() ? 0.6 : 1));
    const cursorPx = +(options.cursor ?? 22);
    const canvas = document.createElement("canvas");
    canvas.className = "fx-blob-field__canvas";
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: false }); } catch { canvas.remove(); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1));
    const scene = new T.Scene(), camera = new T.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);
    camera.position.z = 1;
    // Resolve skin variables inside this element to sRGB (--fx-blob-* given on the element are read too)
    const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const colorOf = (expr) => {
      const probe = document.createElement("i");
      probe.style.cssText = `position:absolute;visibility:hidden;color:${expr}`;
      el.append(probe);
      swatch.clearRect(0, 0, 1, 1);
      swatch.fillStyle = getComputedStyle(probe).color;
      swatch.fillRect(0, 0, 1, 1);
      probe.remove();
      const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data;
      return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
    };
    const exprs = soft ? ["var(--fx-blob-soft, var(--kf-ink))"] : ["var(--fx-blob-1, var(--kf-accent))", "var(--fx-blob-2, var(--kf-accent-soft))", "var(--fx-blob-3, var(--kf-line))"];
    const palette = exprs.map(colorOf);
    const cursorBase = () => {
      if (!hover || cursorPx <= 0) return -1;
      return soft ? cursorPx / innerHeight : 0.04 * scaleFactor;
    };
    const make = (isCursor) => {
      const b = { x: 0.5, y: 0.5, vx: 0, vy: 0, tx: 0.5, ty: 0.5, isCursor, active: false, phase: Math.random() * Math.PI * 2, radius: 0, ci: 0 };
      if (isCursor) {
        b.orig = 0.04; b.base = cursorBase();
        if (options.center === "1") { const a = Math.random() * Math.PI * 2, d = Math.random() * 0.06; b.x = 0.5 + Math.cos(a) * d; b.y = 0.5 + Math.sin(a) * d; }
        else { b.x = 0.1 + Math.random() * 0.8; b.y = Math.abs(b.base) + Math.random() * Math.max(0.2, 1 - Math.abs(b.base) * 2); }
      } else {
        b.orig = (0.08 + Math.random() * 0.1) * sizeScale; b.base = b.orig * scaleFactor;
        b.x = 0.1 + Math.random() * 0.8; b.y = b.base + Math.random() * Math.max(0.2, 1 - b.base * 2);
      }
      b.rx = b.x; b.ry = b.y; b.tx = b.x; b.ty = b.y;
      return b;
    };
    const order = palette.map((_, i) => i).sort(() => Math.random() - 0.5);
    const blobs = Array.from({ length: N - 1 }, (_, i) => { const b = make(false); b.ci = palette.length === 1 ? 0 : i < palette.length ? order[i] : Math.floor(Math.random() * palette.length); return b; });
    const cursor = make(true);
    blobs.push(cursor);
    const u = {
      u_time: { value: 0 }, u_resolution: { value: new T.Vector2(1, 1) },
      u_blobs: { value: blobs.map((b) => new T.Vector2(b.x, b.y)) }, u_colors: { value: blobs.map((b) => palette[b.ci].clone()) },
      u_radii: { value: blobs.map(() => 0) }, u_bg_color: { value: colorOf("var(--fx-blob-bg, var(--kf-bg))") }, u_blob_opacity: { value: 0 },
      u_blobs_only: { value: soft ? 1 : 0 }, u_radius_scale: { value: 1 }, u_flat_blobs: { value: soft ? 1 : 0 },
      u_wobble_amt: { value: +(options.wobble ?? (soft ? 4.2 : mobile() ? 2 : 4.2)) }, u_wobble_spd: { value: 2.8 }, u_blend: { value: 0.25 },
    };
    const geo = new T.PlaneGeometry(1, 1), mat = new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: soft, depthWrite: false });
    scene.add(new T.Mesh(geo, mat));
    let W = 1, H = 1;
    const tweens = [];
    const size = () => {
      const r = el.getBoundingClientRect();
      W = Math.max(2, Math.round(r.width)); H = Math.max(2, Math.round(r.height));
      renderer.setSize(W, H, false);
      u.u_resolution.value.set(W, H);
      scaleFactor = mobile() ? 0.8 : 1.1;
      blobs.forEach((b) => { b.base = b.isCursor ? cursorBase() : b.orig * scaleFactor; if (b.active) tweens.push(gsap.to(b, { radius: b.base, duration: 0.5, ease: "power2.out" })); });
      if (reduce) draw();
    };
    const radiusScale = () => (soft ? innerHeight / Math.max(H, innerHeight) : H > innerHeight ? innerHeight / H : 1);
    let intensity = 0, interactive = false, started = false, visible = false;
    const mouse = { x: 0, y: 0, has: false };
    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.has = true; };
    if (hover) addEventListener("mousemove", onMove, { passive: true });
    const draw = () => { blobs.forEach((b, i) => { u.u_blobs.value[i].set(b.x, b.y); u.u_radii.value[i] = b.radius; }); u.u_radius_scale.value = radiusScale(); renderer.render(scene, camera); };
    const entry = () => {
      if (started) return;
      started = true;
      const cursorOn = cursorBase() > 0;
      if (reduce) {
        blobs.forEach((b) => { b.radius = b.isCursor && !cursorOn ? -1 : b.base; b.x = b.rx; b.y = b.ry; });
        u.u_blob_opacity.value = opacity;
        draw();
        return;
      }
      const tl = gsap.timeline({
        onStart: () => { tweens.push(gsap.fromTo({ v: 0.15 }, { v: 0.15 }, { v: 1, duration: 2.2, ease: "sine.out", onUpdate() { intensity = this.targets()[0].v; } })); blobs.forEach((b) => { if (!b.isCursor || cursorOn) b.active = true; }); },
        onComplete: () => { interactive = true; },
      });
      tweens.push(tl);
      tl.fromTo(u.u_blob_opacity, { value: 0 }, { value: opacity, duration: 1.6, ease: "sine.out" }, 0);
      blobs.forEach((b) => {
        if (b.isCursor && !cursorOn) { b.radius = -1; return; }
        b.x = 0.5; b.y = 0.5;
        if (b.isCursor) tl.fromTo(b, { radius: 0, x: 0.5, y: 0.5 }, { radius: b.base, x: b.rx, y: b.ry, duration: 1.6, ease: "sine.inOut" }, 0);
        else { b.vx = (b.rx - 0.5) * 0.02; b.vy = (b.ry - 0.5) * 0.02; tl.fromTo(b, { radius: 0 }, { radius: b.base, duration: 1.6, ease: "sine.inOut" }, 0); }
      });
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) entry(); });
    io.observe(el);
    const ro = new ResizeObserver(size);
    ro.observe(el);
    size();
    let last = 0;
    const frame = () => {
      const now = performance.now(), dt = last ? Math.max(0, now - last) / 1000 : 0;
      last = now;
      if (!visible || document.hidden || reduce) return;
      const r = el.getBoundingClientRect(), aspect = W / H, rs = radiusScale();
      u.u_time.value += dt;
      if (interactive && mouse.has && mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom) {
        cursor.tx = (mouse.x - r.left) / r.width;
        cursor.ty = 1 - (mouse.y - r.top) / r.height;
      }
      if (interactive && cursor.active) {
        const cr = Math.max(0, cursor.radius) * rs, crx = cr / Math.max(aspect, 1e-4);
        cursor.x = Math.max(crx, Math.min(1 - crx, cursor.x + (cursor.tx - cursor.x) * 0.05));
        cursor.y = Math.max(cr, Math.min(1 - cr, cursor.y + (cursor.ty - cursor.y) * 0.05));
      }
      const push = Math.max(0, cursor.radius);
      for (let i = 0; i < N - 1; i++) {
        const a = blobs[i];
        if (!a.active) continue;
        if (interactive && push > 1e-4) {
          const dx = (cursor.x - a.x) * aspect, dy = cursor.y - a.y, dd = dx * dx + dy * dy, reach = (push + a.radius) * rs;
          if (dd < reach * reach) { const dist = Math.sqrt(dd), f = (reach - dist) * 0.1 * intensity; if (dist > 0.001) { a.vx -= (dx / dist) * f; a.vy -= (dy / dist) * f; } }
        }
        for (let j = i + 1; j < N - 1; j++) {
          const b = blobs[j];
          if (!b.active) continue;
          const dx = (b.x - a.x) * aspect, dy = b.y - a.y, dd = dx * dx + dy * dy, reach = (a.radius + b.radius) * rs;
          if (dd < reach * reach) { const dist = Math.sqrt(dd), f = (reach - dist) * 0.05 * intensity; if (dist > 0.001) { const sx = dx / dist, sy = dy / dist; a.vx -= (sx / aspect) * f; a.vy -= sy * f; b.vx += (sx / aspect) * f; b.vy += sy * f; } }
        }
      }
      const cx = soft ? innerWidth / Math.max(1, r.width) : 1, cy = soft ? innerHeight / Math.max(1, r.height) : 1, f = intensity;
      blobs.forEach((b) => {
        if (b.isCursor || !b.active || f <= 0) return;
        b.vx += Math.sin(u.u_time.value * 0.4 + b.phase) * 8e-5 * f;
        b.vy += Math.cos(u.u_time.value * 0.35 + b.phase * 1.3) * 6e-5 * f;
        const damp = 0.97 + (0.94 - 0.97) * (1 - f);
        b.vx *= damp; b.vy *= damp; b.x += b.vx * cx; b.y += b.vy * cy;
        const bounce = 0.2 * f, slide = 0.8 + 0.15 * (1 - f), rr = soft ? b.radius * rs : b.radius, rx = rr / Math.max(aspect, 1e-4);
        if (b.y < rr) { b.y = rr; b.vy *= -bounce; b.vx *= slide; }
        if (b.y > 1 - rr) { b.y = 1 - rr; b.vy *= -bounce; b.vx *= slide; }
        if (b.x < rx) { b.x = rx; b.vx *= -bounce; }
        if (b.x > 1 - rx) { b.x = 1 - rx; b.vx *= -bounce; }
      });
      draw();
    };
    gsap.ticker.add(frame);
    return () => {
      gsap.ticker.remove(frame);
      tweens.forEach((t) => t.kill());
      io.disconnect();
      ro.disconnect();
      removeEventListener("mousemove", onMove);
      geo.dispose(); mat.dispose(); renderer.dispose();
      canvas.remove();
    };
  });
})();
