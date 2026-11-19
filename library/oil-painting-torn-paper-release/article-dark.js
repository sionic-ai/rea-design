// Spring board — a pinned particle stage. Every particle holds a slot in all five shapes (field, light pillar, clump, stepped pyramid, radial stems),
// On entering a section head (data-shape), particles move to that shape over 1.6s (delay 0~.4 per particle). Inside a section, the camera slowly moves closer.
(() => {
  const T = window.THREE;
  const { reduce, color } = window.ED;
  const canvas = document.querySelector(".s-gl");
  const heads = [...document.querySelectorAll("[data-shape]")];
  const named = [...document.querySelectorAll("[data-name]")];
  const pill = document.querySelector(".s-pill");
  const pillLabel = pill.querySelector("[data-pill-label]");
  const pillBar = pill.querySelector("[data-pill-bar]");

  // Pill — current section name, progress within the section
  let curName = "";
  const pillTick = () => {
    const mid = innerHeight * .5;
    for (const el of named) {
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) {
        const nm = el.dataset.name;
        const group = named.filter((x) => x.dataset.name === nm);
        const top = group[0].getBoundingClientRect().top, bot = group[group.length - 1].getBoundingClientRect().bottom;
        pillBar.style.transform = `scaleX(${Math.min(1, Math.max(0, (mid - top) / (bot - top)))})`;
        if (nm !== curName) {
          curName = nm;
          pill.classList.add("is-swap");
          requestAnimationFrame(() => requestAnimationFrame(() => { pillLabel.textContent = nm; pill.classList.remove("is-swap"); }));
        }
        break;
      }
    }
  };
  addEventListener("scroll", pillTick, { passive: true });
  pillTick();

  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: false }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new T.Scene();
  const bgc = color("--kf-contrast-bg");
  scene.background = new T.Color().setRGB(bgc[0], bgc[1], bgc[2], T.SRGBColorSpace);
  const camera = new T.PerspectiveCamera(40, 1, .1, 100);
  camera.position.set(0, 0, 9);

  const N = 42000;
  let sd = 5;
  const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const shapes = [
    // 0 Field — mound laid below, trunks and seven round crowns, mist between. For the spot the cursor pushed through to be visible, there must be mass
    () => {
      const u = rnd();
      if (u < .4) { const x = (rnd() - .5) * 17, z = (rnd() - .5) * 8 - 1; return [x, -2.7 + Math.sin(x * .45 + 1) * .5 + Math.cos(z * .6) * .3 - rnd() ** 2 * .9, z]; }
      if (u < .82) {
        const k = Math.floor(rnd() * 7), cx = (k - 3) * 2.1 + Math.sin(k * 2.3) * .5, cz = -3 + Math.cos(k * 1.7) * 2;
        if (rnd() < .22) return [cx + gauss() * .07, -2.5 + rnd() * 2.8, cz + gauss() * .07];
        const a = rnd() * Math.PI * 2, h = rnd() * 2 - 1, s = Math.sqrt(1 - h * h), r = Math.cbrt(rnd()) * (1.05 + (k % 3) * .25);
        return [cx + Math.cos(a) * s * r, .8 + (k % 2) * .6 + h * r * .8, cz + Math.sin(a) * s * r * .8];
      }
      return [(rnd() - .5) * 18, (rnd() - .3) * 7, (rnd() - .5) * 10 - 3];
    },
    // 1 Light pillars — seven curved vertical curtains
    () => { const k = Math.floor(rnd() * 7), x = (k - 3) * 1.6 + Math.sin(rnd() * 6) * .3, y = (rnd() - .35) * 9; return [x + Math.sin(y * .6 + k) * .5 + gauss() * .12, y, -2 + Math.cos(k) * 1.5 + gauss() * .2]; },
    // 2 clumps — a cloud filling a rounded-corner box
    () => { const p = [(rnd() - .5) * 4.6, (rnd() - .5) * 2.4, (rnd() - .5) * 3]; const l = Math.hypot(p[0] / 2.3, p[1] / 1.2, p[2] / 1.5); const f = l > 1 ? 1 / l : 1; return [p[0] * f + 1.4 + gauss() * .1, p[1] * f + gauss() * .1, p[2] * f]; },
    // 3 Stepped pyramid — panels narrowing with each level
    () => { const lv = Math.floor(rnd() ** .7 * 9), w = 5.2 - lv * .55; return [(rnd() - .5) * w + .8, -2 + lv * .42 + rnd() * .3, (rnd() - .5) * w * .7]; },
    // 4 radial stems — lines stretching from the center toward the camera
    () => { const a = rnd() * Math.PI * 2, r = .2 + rnd() ** 2 * 7, z = -8 + rnd() * 15; return [Math.cos(a) * r * (1 + (z + 8) * .08), Math.sin(a) * r * (1 + (z + 8) * .08), z]; },
  ];
  const geo = new T.BufferGeometry();
  shapes.forEach((fn, si) => {
    const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const p = fn(); a[i * 3] = p[0]; a[i * 3 + 1] = p[1]; a[i * 3 + 2] = p[2]; }
    geo.setAttribute(si ? `pos${si}` : "position", new T.BufferAttribute(a, 3));
  });
  const rand = new Float32Array(N);
  for (let i = 0; i < N; i++) rand[i] = rnd();
  geo.setAttribute("rnd", new T.BufferAttribute(rand, 1));
  const cols = [["--site-leaf-2", "--site-wine"], ["--site-violet", "--site-sky"], ["--site-gold", "--site-skin"], ["--site-fall-green", "--site-sky"], ["--kf-contrast-ink", "--site-stone"]].map(([a, b]) => [new T.Vector3(...color(a)), new T.Vector3(...color(b))]);
  const mat = new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    uniforms: { uFade: { value: reduce ? 1 : 0 }, uFrom: { value: 0 }, uTo: { value: 0 }, uK: { value: 1 }, uTime: { value: 0 }, uPx: { value: renderer.getPixelRatio() }, uA: { value: cols[0][0] }, uB: { value: cols[0][1] }, uA2: { value: cols[0][0] }, uB2: { value: cols[0][1] }, uFluid: { value: null }, uPush: { value: new T.Vector2() } },
    vertexShader: `attribute vec3 pos1; attribute vec3 pos2; attribute vec3 pos3; attribute vec3 pos4; attribute float rnd;
      uniform float uFrom, uTo, uK, uTime, uPx; uniform vec3 uA, uB, uA2, uB2; uniform sampler2D uFluid; uniform vec2 uPush; varying vec3 vC; varying float vA;
      vec3 pick(float s){ return s < .5 ? position : s < 1.5 ? pos1 : s < 2.5 ? pos2 : s < 3.5 ? pos3 : pos4; }
      void main(){
        float k = clamp((uK * 1.4 - rnd * .4), 0., 1.); k = k * k * (3. - 2. * k);
        vec3 a = pick(uFrom), b = pick(uTo);
        vec3 p = mix(a, b, k);
        p += vec3(sin(uTime * .4 + rnd * 40.), cos(uTime * .33 + rnd * 30.), sin(uTime * .27 + rnd * 20.)) * .04;
        p.y += sin(k * 3.1416) * (rnd - .5) * 1.2;
        vC = mix(mix(uA, uB, rnd), mix(uA2, uB2, rnd), k);
        vA = .35 + .65 * fract(rnd * 13.7 + uTime * .05);
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        // Pushes points by the fluid velocity on screen — swept toward where the cursor passed, then back in place when the velocity field cools
        vec2 flow = texture2D(uFluid, gl_Position.xy / gl_Position.w * .5 + .5).xy;
        gl_Position.xy += flow * uPush * gl_Position.w;
        gl_PointSize = (1.4 + rnd * 2.2) * uPx * 16. / -mv.z;
      }`,
    fragmentShader: `uniform float uFade; varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vC * 1.5, vA * smoothstep(.5, .25, d) * .9 * uFade); }`,
  });
  const pts = new T.Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);

  // Fluid field — the original keeps a velocity field over the screen (128 cells on the long side) and stamps force as the cursor moves (radius .25, force .125 × px moved, up to double when faster than 500px/s),
  // Swirl 1.5, pressure .6, velocity cooled by .965 each frame, and particles are swept along by that velocity. Our shader was rewritten with the same values
  const FLUID = { sim: 128, curl: 1.5, velocity: .965, pressure: .6, iterations: 10, radius: .25, force: .125, fast: [500, 2000], push: 4 };
  const fluid = reduce ? null : (() => {
    const quad = new T.Mesh(new T.PlaneGeometry(2, 2)), fscene = new T.Scene(), fcam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    quad.frustumCulled = false; fscene.add(quad);
    const texel = new T.Vector2();
    const head = `precision highp float; varying vec2 vUv; uniform vec2 uTexel; uniform sampler2D uVel;
      vec4 at(sampler2D s, float x, float y){ return texture2D(s, vUv + vec2(x, y) * uTexel); }`;
    const pass = (body, uniforms = {}) => new T.ShaderMaterial({
      depthTest: false, depthWrite: false, uniforms: { uTexel: { value: texel }, uVel: { value: null }, ...uniforms },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`, fragmentShader: head + body,
    });
    const P = {
      splat: pass(`uniform vec2 uA, uB, uForce; uniform float uAspect, uRad;
        void main(){ vec2 pa = vUv - uA, ba = uB - uA; pa.x *= uAspect; ba.x *= uAspect;
          vec2 off = pa - ba * clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0., 1.);
          gl_FragColor = vec4(texture2D(uVel, vUv).xy + uForce * exp(-dot(off, off) / uRad), 0., 1.); }`, { uA: { value: new T.Vector2() }, uB: { value: new T.Vector2() }, uForce: { value: new T.Vector2() }, uAspect: { value: 1 }, uRad: { value: 1 } }),
      advect: pass(`uniform float uDt, uKeep;
        void main(){ gl_FragColor = vec4(uKeep * texture2D(uVel, vUv - uDt * texture2D(uVel, vUv).xy * uTexel).xy, 0., 1.); }`, { uDt: { value: 0 }, uKeep: { value: 1 } }),
      curl: pass(`void main(){ gl_FragColor = vec4(.5 * (at(uVel, 1., 0.).y - at(uVel, -1., 0.).y - at(uVel, 0., 1.).x + at(uVel, 0., -1.).x), 0., 0., 1.); }`),
      swirl: pass(`uniform sampler2D uCurl; uniform float uDt, uAmount;
        void main(){ vec2 f = .5 * vec2(abs(at(uCurl, 0., 1.).x) - abs(at(uCurl, 0., -1.).x), abs(at(uCurl, 1., 0.).x) - abs(at(uCurl, -1., 0.).x));
          f = f / (length(f) + 1e-4) * uAmount * texture2D(uCurl, vUv).x; f.y = -f.y;
          gl_FragColor = vec4(texture2D(uVel, vUv).xy + f * uDt, 0., 1.); }`, { uCurl: { value: null }, uDt: { value: 0 }, uAmount: { value: FLUID.curl } }),
      diverge: pass(`void main(){ gl_FragColor = vec4(.5 * (at(uVel, 1., 0.).x - at(uVel, -1., 0.).x + at(uVel, 0., 1.).y - at(uVel, 0., -1.).y), 0., 0., 1.); }`),
      fade: pass(`uniform sampler2D uSrc; uniform float uKeep; void main(){ gl_FragColor = uKeep * texture2D(uSrc, vUv); }`, { uSrc: { value: null }, uKeep: { value: 1 } }),
      relax: pass(`uniform sampler2D uPress, uDiv;
        void main(){ gl_FragColor = vec4((at(uPress, -1., 0.).x + at(uPress, 1., 0.).x + at(uPress, 0., -1.).x + at(uPress, 0., 1.).x - texture2D(uDiv, vUv).x) * .25, 0., 0., 1.); }`, { uPress: { value: null }, uDiv: { value: null } }),
      project: pass(`uniform sampler2D uPress;
        void main(){ gl_FragColor = vec4(texture2D(uVel, vUv).xy - vec2(at(uPress, 1., 0.).x - at(uPress, -1., 0.).x, at(uPress, 0., 1.).x - at(uPress, 0., -1.).x), 0., 1.); }`, { uPress: { value: null } }),
    };
    let vel, press, div, curl, awake = 0;
    const target = (w, h) => new T.WebGLRenderTarget(w, h, { type: T.HalfFloatType, format: T.RGBAFormat, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false });
    const pair = (w, h) => ({ read: target(w, h), write: target(w, h), swap() { const t = this.read; this.read = this.write; this.write = t; } });
    const draw = (m, to) => { quad.material = m; renderer.setRenderTarget(to); renderer.render(fscene, fcam); };
    const build = () => {
      const a = innerWidth / innerHeight, w = a > 1 ? FLUID.sim : Math.round(FLUID.sim * a), h = a > 1 ? Math.round(FLUID.sim / a) : FLUID.sim;
      for (const t of [vel?.read, vel?.write, press?.read, press?.write, div, curl]) t?.dispose();
      vel = pair(w, h); press = pair(w, h); div = target(w, h); curl = target(w, h);
      texel.set(1 / w, 1 / h);
      P.splat.uniforms.uAspect.value = a;
      P.splat.uniforms.uRad.value = (FLUID.radius * 50 / 200) ** 2;
    };
    const step = (dt) => {
      const keep = (v) => v ** (dt * 60);
      P.curl.uniforms.uVel.value = vel.read.texture; draw(P.curl, curl);
      P.swirl.uniforms.uVel.value = vel.read.texture; P.swirl.uniforms.uCurl.value = curl.texture; P.swirl.uniforms.uDt.value = dt; draw(P.swirl, vel.write); vel.swap();
      P.diverge.uniforms.uVel.value = vel.read.texture; draw(P.diverge, div);
      P.fade.uniforms.uSrc.value = press.read.texture; P.fade.uniforms.uKeep.value = keep(FLUID.pressure); draw(P.fade, press.write); press.swap();
      P.relax.uniforms.uDiv.value = div.texture;
      for (let i = 0; i < FLUID.iterations; i++) { P.relax.uniforms.uPress.value = press.read.texture; draw(P.relax, press.write); press.swap(); }
      P.project.uniforms.uVel.value = vel.read.texture; P.project.uniforms.uPress.value = press.read.texture; draw(P.project, vel.write); vel.swap();
      P.advect.uniforms.uVel.value = vel.read.texture; P.advect.uniforms.uDt.value = dt; P.advect.uniforms.uKeep.value = keep(FLUID.velocity); draw(P.advect, vel.write); vel.swap();
    };
    return {
      build,
      splat(ax, ay, bx, by, fx, fy) {
        const u = P.splat.uniforms;
        u.uVel.value = vel.read.texture; u.uA.value.set(ax, ay); u.uB.value.set(bx, by); u.uForce.value.set(fx, fy);
        draw(P.splat, vel.write); vel.swap(); renderer.setRenderTarget(null);
        awake = 5;
      },
      // After it cools (reaches 0 in 5s at .965x each step), stop rotating
      update(dt) { if (awake > 0) { awake -= dt; step(dt); renderer.setRenderTarget(null); } return vel.read.texture; },
      // Compiling the shader on the first cursor move freezes the screen — so on setup, run one lap at force 0 in advance
      warm() { this.splat(0, 0, 0, 0, 0, 0); step(1 / 60); renderer.setRenderTarget(null); awake = 0; },
    };
  })();

  const size = () => {
    renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    mat.uniforms.uPush.value.set(FLUID.push * 2 / innerWidth, FLUID.push * 2 / innerHeight);
    if (fluid) fluid.build();
  };
  addEventListener("resize", size); size();
  if (fluid) { fluid.warm(); mat.uniforms.uFluid.value = fluid.update(0); }
  renderer.compile(scene, camera);

  let shape = 0, t0 = 0;
  const morph = (to) => {
    if (to === shape) return;
    const u = mat.uniforms;
    u.uFrom.value = shape; u.uTo.value = to; u.uK.value = 0;
    u.uA.value = cols[shape][0]; u.uB.value = cols[shape][1]; u.uA2.value = cols[to][0]; u.uB2.value = cols[to][1];
    shape = to; t0 = performance.now();
  };
  // First section — like the original, it stays black for 2.7s while receiving stage assets, then the field blooms in at 1.6s
  const born = performance.now() + 2700;
  mat.uniforms.uK.value = 1;
  // Cursor — the original camera orbits around the target up to ±.1 × 90° (damping 6, back to 14 when the cursor leaves), and every segment the cursor moves stamps force into the fluid field.
  // Like the original, the first move after a gap longer than 80ms is not counted as a segment. Touch turns off when released
  const ORBIT = { range: .1 * Math.PI / 2, follow: 6, release: 14 };
  const ptr = { x: 0, y: 0, on: false, at: 0, yaw: 0, pitch: 0 };
  if (!reduce) {
    const off = () => { ptr.on = false; };
    addEventListener("pointermove", (e) => {
      const x = e.clientX, y = e.clientY, dt = (e.timeStamp - ptr.at) / 1000, joined = ptr.on && dt < .08;
      if (joined && dt > 0 && (x !== ptr.x || y !== ptr.y)) {
        const dx = x - ptr.x, dy = y - ptr.y, speed = Math.hypot(dx, dy) / Math.max(dt, 1e-4);
        const q = Math.min(1, Math.max(0, (speed - FLUID.fast[0]) / (FLUID.fast[1] - FLUID.fast[0]))), gain = FLUID.force * (1 + q * q * (3 - 2 * q));
        fluid.splat(ptr.x / innerWidth, 1 - ptr.y / innerHeight, x / innerWidth, 1 - y / innerHeight, dx * gain, -dy * gain);
      }
      ptr.x = x; ptr.y = y; ptr.at = e.timeStamp; ptr.on = true;
    }, { passive: true });
    addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") off(); });
    addEventListener("pointercancel", off);
    document.documentElement.addEventListener("pointerleave", off);
  }
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
    const H = innerHeight;
    let cur = 0, prog = 0;
    heads.forEach((h) => { const r = h.getBoundingClientRect(); if (r.top < H * .6) { cur = +h.dataset.shape; prog = Math.min(1.5, Math.max(0, (H - r.top) / (r.height + H))); } });
    morph(cur);
    mat.uniforms.uK.value = reduce ? 1 : Math.min(1, (now - t0) / 1600);
    if (!reduce) mat.uniforms.uFade.value = Math.min(1, Math.max(0, (now - born) / 1600));
    mat.uniforms.uTime.value = now / 1000;
    const rate = 1 - Math.exp(-(ptr.on ? ORBIT.follow : ORBIT.release) * dt);
    ptr.yaw += ((ptr.on ? (ptr.x / innerWidth * 2 - 1) * ORBIT.range : 0) - ptr.yaw) * rate;
    ptr.pitch += ((ptr.on ? (ptr.y / innerHeight * 2 - 1) * ORBIT.range : 0) - ptr.pitch) * rate;
    const reach = 11 - prog * 2.2, phi = Math.PI / 2 + ptr.pitch;
    camera.position.set(Math.sin(phi) * Math.sin(ptr.yaw) * reach, Math.cos(phi) * reach, -2 + Math.sin(phi) * Math.cos(ptr.yaw) * reach);
    camera.lookAt(0, 0, -2);
    if (fluid) mat.uniforms.uFluid.value = fluid.update(dt);
    pts.rotation.y = shape === 2 || shape === 3 ? Math.sin(now / 5000) * .25 + prog * .4 : 0;
    renderer.render(scene, camera);
  };
  if (reduce) { const f = () => frame(performance.now()); f(); addEventListener("scroll", f, { passive: true }); }
  else renderer.setAnimationLoop(frame);

  document.querySelectorAll(".s-play").forEach((b) => b.addEventListener("click", () => b.classList.toggle("is-playing")));
})();
