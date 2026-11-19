// First page: the document is one window and the wheel pushes a progress value (virtual px). The value follows with a .25s time constant and reveals three scenes in turn.
//   0–2100   01 Dark room — a scanned figure spins and story lines rise from below
//   2100–2500 first tear (black → white panel, bottom to top)
//   2500–6100 02 white plate: the red logo spins down behind the head, the text band and word column pass, and the red title rises from behind the head
//   6100–6900 second tear (white → red footer) · the bar drops down
// Base plate color, dot ground and torn border are one shader (blending the ground in one pass like the original mask-scroll), while character, header and logo are our own three shapes.
(() => {
  const SEG = { s1: [0, 2100], t1: [2100, 2500], ts: [2500, 4300], logo: [2400, 5300], cols: [3700, 5800], self: [4900, 6100], t2: [6100, 6900] };
  const MAX = 7000, TAU = 0.25, AMP = 0.175;
  const seg = (v, [a, b]) => Math.min(1, Math.max(0, (v - a) / (b - a)));

  const STAGE = `precision highp float;
uniform vec2 uRes; uniform float uT, uE1, uE2, uAmp, uPitch;
uniform vec3 uBg1, uTop2, uFoot2, uBg3;
uniform vec4 uDot1, uFill1, uDot2, uFill2, uDot3, uFill3;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * vnoise(p); p *= 2.03; a *= .5; } return v / .97; }
void main(){
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes;
  float asp = uRes.x / uRes.y;
  vec2 q0 = vec2(uv.x * asp, uv.y);
  float s1 = uv.y + (fbm(q0 * 3. + vec2(0., 7.)) - .5) * 2. * uAmp;
  float s2 = uv.y + (fbm(q0 * 3. + vec2(5.3, 1.1)) - .5) * 2. * uAmp;
  float in2 = 1. - step(uE1, s1);
  float in3 = 1. - step(uE2, s2);
  vec2 cell = floor(px / uPitch);
  vec2 cuv = (cell + .5) * uPitch / uRes;
  vec2 q = vec2(cuv.x * asp, cuv.y);
  float ridge = .45 * (.62 + 1.1 * (fbm(vec2(q.x * 1.25 + uT * .35, 3.1)) - .5));
  float under = smoothstep(0., .12, ridge - cuv.y);
  float n = fbm(q * vec2(2.1, 3.) + vec2(uT * .6, uT * .12));
  float m = fbm(q * vec2(1.6, 2.4) + vec2(9.7 - uT * .45, 4.3 + uT * .08));
  vec2 f = fract(px / uPitch);
  float sq = step(abs(f.x - .5), .26) * step(abs(f.y - .5), .26);
  float dots = step(.45, n * under) * sq;
  float fill = step(.62, m * under);
  vec3 bg = uBg1; vec4 d = uDot1, fl = uFill1;
  if (in2 > .5) { bg = mix(uFoot2, uTop2, uv.y); d = uDot2; fl = uFill2; }
  if (in3 > .5) { bg = uBg3; d = uDot3; fl = uFill3; }
  vec3 c = mix(bg, fl.rgb, fill * fl.a);
  c = mix(c, d.rgb, dots * d.a);
  gl_FragColor = vec4(c, 1.);
}`;

  const SCAN_V = `varying vec3 vN; varying vec3 vP;
void main(){ vN = normalize(normalMatrix * normal); vec4 w = modelMatrix * vec4(position, 1.); vP = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  // Scan figure: rainbow reflection turning by the normal + blue light from one side + 3px scan lines (the stripes of the original point-cloud scan)
  const SCAN_F = `uniform float uT; uniform vec3 uScan; varying vec3 vN; varying vec3 vP;
void main(){
  vec3 n = normalize(vN);
  float fres = pow(1. - abs(n.z), 2.);
  vec3 irid = .5 + .5 * cos(6.2831 * (vec3(0., .33, .67) + n.x * .7 + vP.y * .45 + uT * .04));
  float lum = .32 + .5 * max(dot(n, normalize(vec3(-.4, .5, .8))), 0.);
  vec3 c = mix(vec3(lum) * vec3(.82, .78, .7), irid * lum, .18);
  float blue = clamp(smoothstep(-.5, .9, n.x) * .8 + fres * .5 + .15, 0., 1.);
  c = mix(c, uScan * (1.1 + .4 * n.y), blue * .85);
  c *= .5 + .5 * step(.34, fract(gl_FragCoord.y / 3.));
  c += vec3(.06, 0., .08) * step(.5, fract(gl_FragCoord.x / 2. + gl_FragCoord.y / 3.));
  gl_FragColor = vec4(c, 1.);
}`;
  const HULL_V = `uniform float uThick; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * uThick, 1.); }`;
  const FLAT_F = `uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, 1.); }`;
  const LOGO_V = `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;
  const LOGO_F = `uniform vec3 uColor; varying vec3 vN; void main(){ vec3 n = normalize(vN); float k = n.z > .92 ? 1. : .72 + .2 * max(dot(n, normalize(vec3(.3, .6, .7))), 0.); gl_FragColor = vec4(uColor * k, 1.); }`;

  UC.page("home", (main) => {
    if (UC.gated()) return;
    const reduce = UC.reduce;
    const ac = new AbortController(), on = { signal: ac.signal };
    const gl3 = main.querySelector(".home__3d"), glc = main.querySelector(".home__gl");
    const story = main.querySelector(".story__run"), fillEl = main.querySelector("[data-hud-fill]");
    const tsRuns = [...main.querySelectorAll(".ts__run")], cols = main.querySelector(".b2__colsinner");
    const selfish = main.querySelector(".b2back__title"), b3 = main.querySelector(".b3"), bar = document.querySelector(".bar");
    const hx = main.querySelector("[data-hud-x]"), hy = main.querySelector("[data-hud-y]"), hmap = main.querySelector(".hud__mapbox");

    // Reads skin variables as resolved colors — painted onto one canvas pixel
    const probe = document.createElement("i");
    probe.style.display = "none";
    main.append(probe);
    const g2 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const col = (v) => { probe.style.color = `var(${v})`; g2.clearRect(0, 0, 1, 1); g2.fillStyle = getComputedStyle(probe).color; g2.fillRect(0, 0, 1, 1); const d = g2.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255]; };

    // ---------- Background shader ----------
    const gl = glc.getContext("webgl", { antialias: false });
    let drawStage = () => {};
    if (gl) {
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, STAGE));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(gl.getAttribLocation(prog, "a"), 2, gl.FLOAT, false, 0, 0);
      const U = (n) => gl.getUniformLocation(prog, n);
      const rgb = (v) => col(v).slice(0, 3), rgba = (v) => col(v);
      gl.uniform3f(U("uBg1"), ...rgb("--kf-bg"));
      gl.uniform3f(U("uTop2"), ...rgb("--site-paper"));
      gl.uniform3f(U("uFoot2"), ...rgb("--site-paper-hi"));
      gl.uniform3f(U("uBg3"), ...rgb("--site-red"));
      [["uDot1", "--site-g1-dot"], ["uFill1", "--site-g1-fill"], ["uDot2", "--site-g2-dot"], ["uFill2", "--site-g2-fill"], ["uDot3", "--site-g3-dot"], ["uFill3", "--site-g3-fill"]].forEach(([u, v]) => gl.uniform4f(U(u), ...rgba(v)));
      gl.uniform1f(U("uAmp"), AMP);
      gl.uniform1f(U("uPitch"), 5);
      const uRes = U("uRes"), uT = U("uT"), uE1 = U("uE1"), uE2 = U("uE2");
      drawStage = (t, e1, e2) => {
        gl.viewport(0, 0, glc.width, glc.height);
        gl.uniform2f(uRes, glc.width, glc.height);
        gl.uniform1f(uT, t);
        gl.uniform1f(uE1, e1);
        gl.uniform1f(uE2, e2);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
    }

    // ---------- 3D: figure · head bust · logo ----------
    const R = new THREE.WebGLRenderer({ canvas: gl3, alpha: true, antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    R.autoClear = false;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cam.position.set(0, 0, 10);
    const v3 = (a) => new THREE.Color(a[0], a[1], a[2]);
    const scanMat = new THREE.ShaderMaterial({ vertexShader: SCAN_V, fragmentShader: SCAN_F, uniforms: { uT: { value: 0 }, uScan: { value: v3(col("--site-scan")) } } });
    const paper = v3(col("--site-paper-hi")), red = v3(col("--site-red")), outlineGrey = v3(col("--site-outline")), outlineRed = v3(col("--site-g3-dot"));
    const fillMat = new THREE.ShaderMaterial({ vertexShader: "void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }", fragmentShader: FLAT_F, uniforms: { uColor: { value: paper.clone() } } });
    const hullMat = new THREE.ShaderMaterial({ vertexShader: HULL_V, fragmentShader: FLAT_F, side: THREE.BackSide, uniforms: { uThick: { value: 0.012 }, uColor: { value: outlineGrey.clone() } } });
    const logoMat = new THREE.ShaderMaterial({ vertexShader: LOGO_V, fragmentShader: LOGO_F, uniforms: { uColor: { value: red } } });

    // Person: a standing person with a hat, head bowed and right hand raised before the face — same height as the original scan (49% of screen height) and silhouette proportions
    const fig = new THREE.Group();
    const cap = (r, len, x, y, z, rx = 0, rz = 0, sx = 1, sz = 1) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), scanMat); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); m.scale.set(sx, 1, sz); fig.add(m); return m; };
    const ball = (r, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), scanMat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); fig.add(m); return m; };
    ball(0.13, 0.02, 1.08, 0.06, 1, 1.1, 1);
    ball(0.145, 0.01, 1.14, 0.03, 1, 0.75, 1.05);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.17), scanMat); brim.position.set(0.04, 1.1, 0.17); brim.rotation.x = 0.35; fig.add(brim);
    cap(0.05, 0.08, 0.01, 0.95, 0.03);
    cap(0.19, 0.42, 0, 0.62, 0, 0, 0, 1.12, 0.8);
    cap(0.075, 0.48, -0.31, 0.5, 0.02, 0, 0.08);
    cap(0.075, 0.26, 0.3, 0.72, 0.05, -0.2, -0.25);
    cap(0.065, 0.28, 0.2, 0.88, 0.2, -1.1, 0.5);
    ball(0.05, 0.12, 1.0, 0.24);
    cap(0.17, 0.12, 0, 0.18, 0, 0, Math.PI / 2, 1, 0.9);
    cap(0.115, 0.75, -0.12, -0.6, 0, 0, 0.02);
    cap(0.115, 0.75, 0.12, -0.6, 0.02, 0, -0.03);
    const shoe = (x) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.16, 4, 10), scanMat); m.rotation.x = Math.PI / 2; m.position.set(x, -1.2, 0.08); fig.add(m); };
    shoe(-0.13); shoe(0.14);
    fig.position.y = 0.0;
    fig.scale.setScalar(1.22);
    scene.add(fig);

    // Header bust: head width is 35% of screen height, crown 15% from the top — white surface plus gray outline (a shell made by inflating the back faces along their normals)
    const bust = new THREE.Group();
    const part = (geo, x, y, z, sx, sy, sz) => {
      const a = new THREE.Mesh(geo, fillMat), b = new THREE.Mesh(geo, hullMat);
      for (const m of [a, b]) { m.position.set(x, y, z); m.scale.set(sx, sy, sz); bust.add(m); }
    };
    part(new THREE.SphereGeometry(1, 48, 32), 0, 0.62, 0, 0.95, 1.25, 1.0);
    // Lathe-cuts a cross-section running diagonally from the neck down the trapezius to the shoulder (flattened front to back)
    const prof = [[0, -0.2], [0.6, -0.2], [0.64, -0.9], [0.8, -1.2], [1.5, -1.5], [2.5, -1.9], [3.3, -2.45], [3.7, -3.4], [0, -3.4]].reverse().map(([x, y]) => new THREE.Vector2(x, y));
    part(new THREE.LatheGeometry(prof, 64), 0, 0, -0.1, 1, 1, 0.5);
    scene.add(bust);

    // Logo: extract with thickness the two corner-shaped cross, same as the display SVG
    const shp = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], -pts[0][1]); for (const p of pts.slice(1)) p.length === 4 ? s.quadraticCurveTo(p[0], -p[1], p[2], -p[3]) : s.lineTo(p[0], -p[1]); return s; };
    const L1 = shp([[46, 0], [58, 0], [58, 34], [58, 42, 66, 42], [100, 42], [100, 54], [66, 54], [46, 54, 46, 34]]);
    const L2 = shp([[54, 100], [42, 100], [42, 66], [42, 58, 34, 58], [0, 58], [0, 46], [34, 46], [54, 46, 54, 66]]);
    const logoGeo = new THREE.ExtrudeGeometry([L1, L2], { depth: 6, bevelEnabled: false, curveSegments: 10 });
    logoGeo.translate(-50, 50, -3);
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.scale.setScalar(0.053);
    scene.add(logo);

    let W = 0, H = 0;
    const size = () => {
      W = innerWidth; H = innerHeight;
      glc.width = Math.round(W * Math.min(devicePixelRatio, 1));
      glc.height = Math.round(H * Math.min(devicePixelRatio, 1));
      R.setSize(W, H, false);
      cam.aspect = W / H;
      cam.updateProjectionMatrix();
    };
    size();
    addEventListener("resize", size, on);

    // ---------- Wheel progress ----------
    let target = 0, val = 0;
    const push = (d) => { target = Math.min(MAX, Math.max(0, target + d)); if (reduce) val = target; };
    addEventListener("wheel", (e) => { e.preventDefault(); push(e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY); }, { signal: ac.signal, passive: false });
    addEventListener("keydown", (e) => {
      const k = { ArrowDown: 120, ArrowUp: -120, PageDown: H * 0.9, PageUp: -H * 0.9, " ": e.shiftKey ? -H * 0.9 : H * 0.9, End: MAX, Home: -MAX }[e.key];
      if (k != null) { e.preventDefault(); push(k); }
    }, on);
    let ty = null;
    addEventListener("touchstart", (e) => (ty = e.touches[0].clientY), { signal: ac.signal, passive: true });
    addEventListener("touchmove", (e) => { if (ty == null) return; const y = e.touches[0].clientY; push((ty - y) * 2); ty = y; }, { signal: ac.signal, passive: true });

    // Dashboard: cursor position readout and red dot on the map
    let mx = 0.5, my = 0.5, smx = 0.5;
    addEventListener("pointermove", (e) => {
      mx = e.clientX / W; my = e.clientY / H;
      hx.textContent = String(Math.round(e.clientX)).padStart(3, "0");
      hy.textContent = String(Math.round(e.clientY)).padStart(3, "0");
      hmap.style.setProperty("--hx", `${mx * 279}px`);
      hmap.style.setProperty("--hy", `${my * 120}px`);
    }, on);

    let last = 0, t = 0, raf = 0, alive = true, runH = story.offsetHeight, tsH = 1644, colsH = cols.offsetHeight;
    const ro = new ResizeObserver(() => { runH = story.offsetHeight; colsH = cols.offsetHeight; });
    ro.observe(story);
    const frame = (now) => {
      if (!alive) return;
      const dt = last ? Math.max(1, now - last) / 1000 : 1 / 60;
      last = now;
      t += dt;
      val += (target - val) * (reduce ? 1 : 1 - Math.exp(-dt / TAU));
      const p1 = seg(val, SEG.s1), t1 = seg(val, SEG.t1), t2 = seg(val, SEG.t2);
      const e1 = -AMP - 0.01 + t1 * (1 + 2 * AMP + 0.02), e2 = -AMP - 0.01 + t2 * (1 + 2 * AMP + 0.02);
      const c1 = Math.min(1, Math.max(0, e1)), c2 = Math.min(1, Math.max(0, e2));
      main.style.setProperty("--edge1", c1.toFixed(4));
      main.style.setProperty("--edge2", c2.toFixed(4));
      story.style.transform = `translate3d(0, ${-(p1 * (runH - H * 0.35)).toFixed(1)}px, 0)`;
      fillEl.style.setProperty("--fill", p1.toFixed(3));
      const ts = seg(val, SEG.ts), cp = seg(val, SEG.cols), sp = seg(val, SEG.self), lp = seg(val, SEG.logo);
      tsRuns.forEach((r) => r.style.setProperty("--ts", `${(H - 835 - ts * (tsH - 835 + H * 0.2)).toFixed(1)}px`));
      cols.style.setProperty("--cols", `${(H - cp * (H + colsH)).toFixed(1)}px`);
      selfish.style.setProperty("--rise", `${(120 - Math.min(1, sp * 1.6) * 120).toFixed(1)}%`);
      selfish.style.setProperty("--fade", (1 - Math.max(0, sp - 0.75) * 2.4).toFixed(3));
      bar?.classList.toggle("is-gone", e2 > 0.35);
      b3.classList.toggle("is-on", e2 >= 1);
      b3.classList.toggle("is-shown", c2 > 0);
      drawStage(t, e1, e2);

      smx += (mx - smx) * (1 - Math.exp(-dt / 0.6));
      scanMat.uniforms.uT.value = t;
      fig.rotation.y = 0.45 + p1 * 2.6 + Math.sin(t * 0.4) * 0.06;
      bust.rotation.y = (smx - 0.5) * 0.25;
      logo.position.set(-0.2 + lp * 0.9, 1.25 - lp * 4.6, -1.3 + lp * 1.9);
      logo.rotation.set(Math.sin(lp * Math.PI) * 0.7, Math.sin(lp * Math.PI * 1.3) * 1.1, -lp * 1.25);
      logo.visible = lp < 1;
      R.setScissorTest(true);
      R.setScissor(0, 0, W, H);
      R.clear();
      const yb1 = c1 * H, yb2 = c2 * H;
      if (yb1 < H) { fig.visible = true; bust.visible = false; logo.visible = false; R.setScissor(0, yb1, W, H - yb1); R.render(scene, cam); }
      if (yb1 > yb2) {
        fig.visible = false; bust.visible = true; logo.visible = lp < 1;
        fillMat.uniforms.uColor.value.copy(paper); hullMat.uniforms.uColor.value.copy(outlineGrey);
        R.setScissor(0, yb2, W, yb1 - yb2); R.render(scene, cam);
      }
      if (yb2 > 0) {
        fig.visible = false; bust.visible = true; logo.visible = false;
        fillMat.uniforms.uColor.value.copy(red); hullMat.uniforms.uColor.value.copy(outlineRed);
        R.setScissor(0, 0, W, yb2); R.render(scene, cam);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ac.abort();
      ro.disconnect();
      bar?.classList.remove("is-gone");
      scene.traverse((o) => o.geometry?.dispose());
      [scanMat, fillMat, hullMat, logoMat].forEach((m) => m.dispose());
      R.dispose();
      R.forceContextLoss();
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      probe.remove();
    };
  });
})();
