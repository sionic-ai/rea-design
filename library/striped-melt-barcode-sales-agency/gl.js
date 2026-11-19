// Two shaders written in three — the same effect rebuilt with the same library as the original (three r160).
// 1) Stripe stretch: rows from the top down to uZoneEnd are replaced by the color of the single row at uZoneEnd, stretching into vertical stripes (edge softened by .002).
// 2) Barcode mask: a layer drawing two-row-high white bars (width 5~100px, 2s lifetime) where the cursor passed is used as the mask to reveal the picture over the background color.
// Instead of the original images and videos, we use placeholder images drawn on canvas — so the texture isn’t tainted even on file://.
(() => {
  const ES = (window.ES = window.ES || {});
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const STRIPE_FS = `precision highp float;
varying vec2 vUv;
uniform sampler2D uTex; uniform float uZoneStart, uZoneEnd;
void main(){
  vec2 uv = vUv;
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) discard;
  float y = 1. - uv.y;
  float e = .002;
  float band = smoothstep(uZoneStart - e, uZoneStart, y) * (1. - smoothstep(uZoneEnd, uZoneEnd + e, y));
  vec4 base = texture2D(uTex, uv);
  vec4 row = texture2D(uTex, vec2(uv.x, 1. - clamp(uZoneEnd - .002, 0., 1.)));
  gl_FragColor = mix(base, row, band);
}`;
  const STRIPE_VS = `varying vec2 vUv; uniform vec2 uRatio, uOrigin;
void main(){ vUv = (uv - uOrigin) * uRatio + uOrigin; gl_Position = vec4(position, 1.); }`;

  // A tall flower bud on a white background — a placeholder drawing that follows the subject ratio of the original video (centered vertically · 90% of screen height)
  ES.drawBud = (cv, t) => {
    const c = cv.getContext("2d"), W = cv.width, H = cv.height;
    const ink = css("--kf-ink"), acc = css("--kf-accent"), bg = css("--kf-bg");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const cx = W / 2, top = H * 0.02, bot = H * 0.98, bw = W * 0.13;
    c.fillStyle = ink; c.fillRect(cx - W * 0.012, H * 0.78, W * 0.024, bot - H * 0.78);
    for (let i = 0; i < 9; i++) {
      const k = i / 8, y = top + (H * 0.74) * k, w = bw * (0.45 + Math.sin(k * Math.PI) * 0.75);
      for (let j = -2; j <= 2; j++) {
        const sway = Math.sin(t * 0.8 + i * 0.7 + j) * W * 0.004;
        const g = c.createLinearGradient(0, y, 0, y + H * 0.12);
        g.addColorStop(0, acc); g.addColorStop(1, ink);
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(cx + j * w * 0.42 + sway, y + H * 0.06, w * 0.32, H * 0.075, j * 0.25, 0, Math.PI * 2);
        c.fill();
      }
    }
  };
  // Footer wordmark: the original is SVG text, we write title-font text on the canvas
  ES.drawWordmark = (cv, text) => {
    const c = cv.getContext("2d"), W = cv.width, H = cv.height;
    c.clearRect(0, 0, W, H);
    c.fillStyle = css("--kf-accent");
    c.textAlign = "center"; c.textBaseline = "alphabetic";
    let fs = H * 0.9;
    c.font = `${css("--kf-weight-display") || 400} ${fs}px ${css("--kf-font-display")}`;
    const w = c.measureText(text).width;
    if (w > W * 0.98) { fs *= (W * 0.98) / w; c.font = `${css("--kf-weight-display") || 400} ${fs}px ${css("--kf-font-display")}`; }
    c.fillText(text, W / 2, H * 0.92);
  };

  ES.stripe = ({ canvas, source, fit = "cover", animate }) => {
    if (!window.THREE || !canvas) return null;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const tex = new THREE.CanvasTexture(source);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    const uniforms = { uTex: { value: tex }, uZoneStart: { value: 0 }, uZoneEnd: { value: 0 }, uRatio: { value: new THREE.Vector2(1, 1) }, uOrigin: { value: new THREE.Vector2(0.5, 0.5) } };
    const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: STRIPE_VS, fragmentShader: STRIPE_FS, transparent: true });
    const geo = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geo, mat));
    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      if (!r.width || !r.height) return;
      renderer.setSize(r.width, r.height, false);
      const a = r.width / r.height, b = source.width / source.height;
      if (fit === "cover") { uniforms.uOrigin.value.set(0.5, 0.5); a > b ? uniforms.uRatio.value.set(1, b / a) : uniforms.uRatio.value.set(a / b, 1); }
      else { uniforms.uOrigin.value.set(0.5, 0); a > b ? uniforms.uRatio.value.set(a / b, 1) : uniforms.uRatio.value.set(1, b / a); }
    };
    resize();
    renderer.compile(scene, cam);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    const t0 = performance.now();
    const render = () => {
      if (animate) { animate(source, (performance.now() - t0) / 1000); tex.needsUpdate = true; }
      renderer.render(scene, cam);
    };
    gsap.ticker.add(render);
    return { uniforms, render, destroy() { gsap.ticker.remove(render); ro.disconnect(); renderer.dispose(); geo.dispose(); mat.dispose(); tex.dispose(); } };
  };

  ES.barcodeMask = ({ host, canvas, source, minWidth = 5, maxWidth = 100, lifetime = 2000, throttle = 25 }) => {
    if (!window.THREE || !host || !canvas) return null;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const maskScene = new THREE.Scene(), maskCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const tex = new THREE.CanvasTexture(source);
    tex.colorSpace = THREE.SRGBColorSpace;
    const bg = getComputedStyle(host).backgroundColor.match(/[\d.]+/g).map(Number);
    let rt = new THREE.WebGLRenderTarget(host.offsetWidth, host.offsetHeight);
    const uniforms = { uImg: { value: tex }, uMask: { value: rt.texture }, uColor: { value: new THREE.Vector3(bg[0] / 255, bg[1] / 255, bg[2] / 255) }, uRatio: { value: new THREE.Vector2(1, 1) } };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.); }",
      fragmentShader: `varying vec2 vUv; uniform sampler2D uImg, uMask; uniform vec3 uColor; uniform vec2 uRatio;
void main(){ vec4 img = texture2D(uImg, (vUv - .5) * uRatio + .5); float m = texture2D(uMask, vUv).r; gl_FragColor = vec4(mix(uColor, img.rgb, m), 1.); }`,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const live = [];
    const add = (fx, fy) => {
      const r = host.getBoundingClientRect();
      const row = Math.floor(2 * (1 - fy));
      if (row < 0 || row >= 2) return;
      const w = ((minWidth + Math.random() * (maxWidth - minWidth)) / r.width) * 2;
      const x = 2 * fx - 1, l = x - w / 2, rr = x + w / 2;
      if (live.some((s) => s.row === row && !(rr < s.l || l > s.r))) return;
      const g = new THREE.PlaneGeometry(w, 1), m = new THREE.MeshBasicMaterial({ color: 0xffffff }); /* Not skin: white on the mask plate means reveal strength 1 */
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, 1 - (row + 0.5), 0);
      maskScene.add(mesh);
      const s = { l, r: rr, row, mesh };
      live.push(s);
      setTimeout(() => { maskScene.remove(mesh); g.dispose(); m.dispose(); live.splice(live.indexOf(s), 1); }, lifetime);
    };
    let last = 0, timer = 0;
    const onMove = (e) => {
      const now = performance.now();
      if (now - last < throttle) return;
      last = now;
      const r = host.getBoundingClientRect();
      add((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
    };
    if (matchMedia("(hover: hover)").matches) host.addEventListener("mousemove", onMove);
    else {
      const p = { x: Math.random() * 100, y: Math.random() * 100, a: Math.random() * Math.PI * 2 };
      timer = setInterval(() => {
        const r = host.getBoundingClientRect();
        if (!r.width || r.top > innerHeight || r.bottom < 0) return;
        p.a += 1.2 * (Math.random() - 0.5); p.x += 4 * Math.cos(p.a); p.y += 4 * Math.sin(p.a);
        if (p.x < 10 || p.x > 90) p.a = Math.PI - p.a;
        if (p.y < 10 || p.y > 90) p.a = -p.a;
        add(p.x / 100, p.y / 100);
      }, 100);
    }
    const resize = () => {
      const w = host.offsetWidth, h = host.offsetHeight;
      renderer.setSize(w, h, false); rt.setSize(w, h);
      const a = w / h, b = source.width / source.height;
      a > b ? uniforms.uRatio.value.set(1, b / a) : uniforms.uRatio.value.set(a / b, 1);
    };
    resize();
    renderer.compile(scene, cam);
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const render = () => { renderer.setRenderTarget(rt); renderer.render(maskScene, maskCam); renderer.setRenderTarget(null); renderer.render(scene, cam); };
    gsap.ticker.add(render);
    return { destroy() { gsap.ticker.remove(render); host.removeEventListener("mousemove", onMove); clearInterval(timer); ro.disconnect(); rt.dispose(); renderer.dispose(); tex.dispose(); } };
  };
})();
