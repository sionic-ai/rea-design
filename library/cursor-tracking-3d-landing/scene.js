// 3D octopus — the original rigged model (glb) and shaders are not used, legs are tubes whose curves the vertex shader computes directly, and head and eyes are newly drawn with our shader.
// Original values: camera FOV 15° · z 10 · x rotation -.2, octopus (0,-4.2,-20), tilt 1-exp(-2.2dt) · scene rotation .3, gaze 1-exp(-7dt) · strength .5, blink every 1.5~4.5s (close .07s · open .13s)
(() => {
  const canvas = document.querySelector(".im-canvas");
  if (!canvas || !window.THREE) return;
  const T = THREE, { color, reduce, handheld } = window.IM;
  const C = (v) => new T.Color().setStyle(color(v));
  const P = { bg: C("--kf-bg"), ink: C("--kf-ink"), accent: C("--kf-accent"), purple: C("--kf-accent-soft"), soft: C("--kf-ink-soft"), surface: C("--kf-surface"), light: C("--kf-contrast-bg"), dark: C("--kf-contrast-ink") };

  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(15, 1, 1, 250);
  camera.position.set(0, 0, 10);
  camera.rotation.set(-0.2, 0, 0);
  const world = new T.Group(); scene.add(world);
  const octo = new T.Group(); world.add(octo);

  // Background — pinkish magenta at upper right, deepening to dark purple toward the edges (lilac white on light sections)
  const bgMat = new T.ShaderMaterial({
    uniforms: { uA: { value: P.accent }, uB: { value: P.purple }, uInk: { value: P.ink }, uBg: { value: P.bg }, uLight: { value: 0 }, uShift: { value: 0 } },
    depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, .9999, 1.); }`,
    fragmentShader: `uniform vec3 uA, uB, uInk, uBg; uniform float uLight, uShift; varying vec2 vUv;
      void main(){
        vec2 c = vec2(.62 + .1*sin(uShift*3.), .7 - uShift*.25);
        float d = length((vUv - c)*vec2(1.5, 1.));
        vec3 pink = mix(uA, uInk, .38);
        vec3 col = mix(pink, mix(uB, uA, .35), smoothstep(0., .55, d));
        col = mix(col, mix(uBg, uB, .45), smoothstep(.45, 1.15, d));
        vec3 lightCol = mix(mix(uInk, uB, .18), mix(uB, uInk, .45), smoothstep(.2, 1.1, d));
        gl_FragColor = vec4(mix(col, lightCol, uLight), 1.);
      }`,
  });
  const bgQuad = new T.Mesh(new T.PlaneGeometry(2, 2), bgMat);
  bgQuad.frustumCulled = false; bgQuad.renderOrder = -1;
  scene.add(bgQuad);

  const U = {
    uTime: { value: 0 }, uWiggle: { value: 1 }, uLight: { value: 0 },
    uA: { value: P.accent }, uB: { value: P.purple }, uInk: { value: P.ink }, uDark: { value: P.dark }, uBg: { value: P.bg },
  };

  // ───── Eight legs — pass only (t length, a circumference, k leg number) and the shader computes the position ─────
  const SEG = 90, RAD = 16, ARMS = 8;
  const pos = [], tt = [], aa = [], kk = [], idx = [];
  for (let k = 0; k < ARMS; k++) {
    const base = pos.length / 3;
    for (let i = 0; i <= SEG; i++) for (let j = 0; j <= RAD; j++) { pos.push(0, 0, 0); tt.push(i / SEG); aa.push((j / RAD) * Math.PI * 2); kk.push(k); }
    for (let i = 0; i < SEG; i++) for (let j = 0; j < RAD; j++) {
      const a = base + i * (RAD + 1) + j, b = a + RAD + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const armGeo = new T.BufferGeometry();
  armGeo.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  armGeo.setAttribute("aT", new T.Float32BufferAttribute(tt, 1));
  armGeo.setAttribute("aA", new T.Float32BufferAttribute(aa, 1));
  armGeo.setAttribute("aK", new T.Float32BufferAttribute(kk, 1));
  armGeo.setIndex(idx);
  const SKIN = `
    uniform vec3 uA, uB, uInk, uDark, uBg; uniform float uLight;
    vec3 skin(vec3 n, vec3 v, float g, float spots){
      float diff = .45 + .55*max(dot(n, normalize(vec3(-.3,.8,.6))), 0.);
      float fres = pow(1. - max(dot(n, v), 0.), 2.4);
      // Silicone-like magenta-purple skin — fades to lilac on light sections
      vec3 base = mix(mix(uB, uA, g*.75), uInk, .1)*1.12;
      vec3 c = base*diff*.95 + mix(uB, uInk, .5)*fres*.3;
      c = mix(c, c*.72, spots);
      vec3 lilac = mix(mix(uB, uInk, .62), uInk, fres*.5)*(.55 + .45*diff);
      return mix(c, lilac, uLight);
    }`;
  const arms = new T.Mesh(armGeo, new T.ShaderMaterial({
    uniforms: U,
    vertexShader: `
      attribute float aT, aA, aK; uniform float uTime, uWiggle; varying vec3 vN; varying vec3 vV; varying float vT; varying float vA;
      vec3 center(float t, float k){
        float ang = k/8.*6.28318 + .2;
        float len = 6.2 + .6*sin(k*1.7);
        float w = uWiggle*(.3 + .5*t)*t;
        float ph = uTime*1.1 + k*1.3 - t*5.;
        vec3 out_ = vec3(cos(ang), 0., sin(ang));
        vec3 side = vec3(-sin(ang), 0., cos(ang));
        // Fans out from under the head, then droops down with the tip curling
        float spread = sin(min(t*3., 1.57))*.9;
        float droop = -t*len*.82;
        float curl = smoothstep(.6, 1., t)*1.25;
        vec3 p = out_*(.42 + spread + curl*1.1) + vec3(0., droop + curl*1.15, 0.);
        p += side*sin(ph)*w*.9 + vec3(0., cos(ph*.8)*w*.5, 0.) + out_*sin(ph*.6+1.)*w*.4;
        return p;
      }
      void main(){
        float t = aT, k = aK;
        vec3 c = center(t, k), c2 = center(min(1., t + .01), k);
        vec3 tang = normalize(c2 - c + vec3(0., -1e-4, 0.));
        vec3 ref = abs(tang.y) > .9 ? vec3(1.,0.,0.) : vec3(0.,1.,0.);
        vec3 n1 = normalize(cross(tang, ref)), n2 = cross(tang, n1);
        float r = mix(.3, .03, pow(t, .75));
        vec3 nrm = cos(aA)*n1 + sin(aA)*n2;
        vec3 p = c + nrm*r;
        vec4 mv = modelViewMatrix*vec4(p, 1.);
        vN = normalize(normalMatrix*nrm); vV = normalize(-mv.xyz); vT = t; vA = aA;
        gl_Position = projectionMatrix*mv;
      }`,
    fragmentShader: `${SKIN}
      varying vec3 vN; varying vec3 vV; varying float vT; varying float vA;
      void main(){
        // Suction cups along the inner rim — dotted lengthwise where the circumference angle is near the bottom (π)
        float under = smoothstep(.9, .2, abs(cos((vA - 3.14159)*.5)));
        float s = smoothstep(.32, .18, length(vec2(fract(vT*46.) - .5, (vA - 3.14159)*1.2)))*under;
        vec3 c = skin(normalize(vN), normalize(vV), .55 + .35*vT, 0.);
        c = mix(c, mix(uInk, uA, .4), s*.7);
        gl_FragColor = vec4(c, 1.);
      }`,
  }));
  arms.frustumCulled = false;
  octo.add(arms);

  // ───── Header ─────
  const head = new T.Mesh(new T.SphereGeometry(0.95, 96, 72), new T.ShaderMaterial({
    uniforms: U,
    vertexShader: `uniform float uTime; varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){ vec3 p = position; float b = sin(uTime*1.6)*.03; p *= vec3(1. + b, 1.32 - b, 1. + b); p.y += .25*smoothstep(0.,1.,position.y);
        vP = position; vec4 mv = modelViewMatrix*vec4(p,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `${SKIN}
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
      void main(){
        vec2 q = vP.xy*7. + vP.z*3.; vec2 i = floor(q); float sp = smoothstep(.5,.2,length(fract(q)-.5))*step(.72,h(i));
        gl_FragColor = vec4(skin(normalize(vN), normalize(vV), .5 + .3*(1. - vP.y), sp*.6), 1.);
      }`,
  }));
  head.position.y = 0.95;
  head.rotation.x = -0.35;
  octo.add(head);

  // ───── Two eyes — whites, horizontal pupils (gaze uLook), eyelids (blink uBlink) ─────
  const eyeMat = new T.ShaderMaterial({
    uniforms: { ...U, uLook: { value: new T.Vector2() }, uBlink: { value: 0 } },
    vertexShader: `varying vec3 vP; varying vec3 vN; void main(){ vP = position; vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec2 uLook; uniform float uBlink; uniform vec3 uInk, uDark, uA, uB; varying vec3 vP; varying vec3 vN;
      void main(){
        vec3 q = vP / .24; float front = smoothstep(.1, .45, q.z);
        vec2 e = q.xy - uLook*.45;
        float pupil = smoothstep(.2, .16, length(e*vec2(.75, 1.9)))*front;
        float iris = smoothstep(.48, .44, length(e))*front;
        vec3 c = mix(mix(uInk, uA, .12), mix(uA, uInk, .3), iris);
        c = mix(c, uDark*.4, pupil);
        c += uInk*smoothstep(.09, .02, length(e - vec2(-.12, .14)))*.8;
        float lid = step(1. - uBlink*2.05, -q.y + 1.02) * step(.001, uBlink);
        c = mix(c, mix(uB, uA, .35)*.8, max(lid, smoothstep(.7, .95, q.y)*.85));
        gl_FragColor = vec4(c, 1.);
      }`,
  });
  const eyes = [-1, 1].map((s) => {
    const m = new T.Mesh(new T.SphereGeometry(0.24, 40, 30), eyeMat);
    m.position.set(s * 0.5, 0.25, 0.8); m.rotation.y = s * 0.35; m.scale.x = 0.85;
    octo.add(m); return m;
  });

  // ───── Floating particles ─────
  const N = 900, pp = new Float32Array(N * 3), ps = new Float32Array(N);
  for (let i = 0; i < N; i++) { pp.set([(Math.random() - 0.5) * 34, (Math.random() - 0.5) * 22, -6 - Math.random() * 40], i * 3); ps[i] = Math.random(); }
  const pg = new T.BufferGeometry(); pg.setAttribute("position", new T.BufferAttribute(pp, 3)); pg.setAttribute("aS", new T.BufferAttribute(ps, 1));
  const dust = new T.Points(pg, new T.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `attribute float aS; uniform float uTime; varying float vA; void main(){ vec3 p = position; p.y += sin(uTime*.2 + aS*30.)*.6; p.x += cos(uTime*.15 + aS*20.)*.4; vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = (1. + aS*2.5)*(30./-mv.z); vA = .15 + .35*aS; }`,
    fragmentShader: `uniform vec3 uInk, uA, uDark; uniform float uLight; varying float vA; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(mix(mix(uInk, uA, .3), uDark, uLight), vA*smoothstep(.5,.0,d)); }`,
  }));
  world.add(dust);

  // ───── Octopus position per section — t: scene progress 0 (first screen) to 1 (calculator), 7 section anchors so one section per 1/6 ─────
  // [x, y, z, rx, ry, rz, size, bobbing]
  // Hero full body (head touching the top of the screen) → leg close-up → head close-up → eye close-up → full body in a bright section (legs spread) → one big leg → leg tip above the calculator → exits upward at the end
  const K = [
    [0, -4.75, -20, 0.1, 0.0, 0.0, 1.25, 1],
    [-0.5, -2.2, -12, 0.25, 0.3, 0.0, 1.4, 1],
    [0.9, -4.6, -6, 0.15, -0.6, 0.05, 1.6, 0.8],
    [0.3, -2.9, -1.2, 0.1, 0.35, 0.0, 1.5, 0.7],
    [0, -7.2, -16, 0.9, 0.0, 0.0, 1.2, 1.2],
    [0.6, 2.4, -4, 0.2, 0.5, 0.35, 2.2, 0.9],
    [0.5, 6.5, -6, 0.3, 0.2, 0.3, 2.0, 0.6],
    [0.5, 12.0, -6, 0.3, 0.2, 0.3, 2.0, 0.6],
  ];
  const sm = (x) => x * x * (3 - 2 * x);
  const pose = (t) => {
    const f = Math.min(K.length - 1.0001, Math.max(0, t * (K.length - 1)));
    const i = Math.floor(f), u = sm(f - i), a = K[i], b = K[i + 1];
    return a.map((v, j) => v + (b[j] - v) * u);
  };

  let prog = 0, light = 0, blink = 0, state = 0, timer = 0, next = 1.5 + 3 * Math.random(), dbl = false;
  const tilt = new T.Vector2(), tiltT = new T.Vector2(), gaze = new T.Vector2(), pointer = new T.Vector2();
  if (!handheld && !reduce) addEventListener("pointermove", (e) => { tiltT.set((e.clientX / innerWidth) * 2 - 1, -(2 * (e.clientY / innerHeight)) + 1); pointer.copy(tiltT); });
  const target = new T.Vector3(), dir = new T.Vector3(), pivot = new T.Vector3();

  const resize = () => {
    let w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    if (w / h > 2) h = w / 2;
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  addEventListener("resize", resize); resize();

  let last = performance.now();
  const frame = () => {
    const now = performance.now(), dt = Math.min(1 / 30, Math.max(0.001, (now - last) / 1000)); last = now;
    if (!reduce) U.uTime.value += dt;
    const p = pose(prog);
    octo.position.set(p[0], p[1], p[2]);
    octo.rotation.set(p[3], p[4] + Math.sin(U.uTime.value * 0.3) * 0.08, p[5]);
    octo.scale.setScalar(p[6]);
    U.uWiggle.value = p[7];
    U.uLight.value = light;
    // Cursor tilt — tilts the scene by .3 on x·y
    tilt.lerp(tiltT, 1 - Math.exp(-2.2 * dt));
    // Like the original, rotate the scene around the octopus position (around the origin, a far-off octopus would be dragged up and down)
    world.rotation.set(-(0.3 * tilt.y), 0.3 * tilt.x, 0);
    pivot.set(p[0], p[1], p[2]);
    world.position.copy(pivot).sub(pivot.clone().applyEuler(world.rotation));
    camera.rotation.set(-0.2 + tilt.y * 0.03, -tilt.x * 0.03, 0);
    // Gaze — looks toward (4x, 4y, 6) at the cursor
    gaze.lerp(pointer, 1 - Math.exp(-7 * dt));
    target.set(4 * gaze.x, 4 * gaze.y, 6);
    dir.copy(target).normalize();
    eyeMat.uniforms.uLook.value.set(dir.x * 0.5, dir.y * 0.5);
    // Blink — close .07s · open .13s, sometimes twice
    timer += dt;
    if (state === 0 && timer >= next) state = 1;
    else if (state === 1) { blink += dt / 0.07; if (blink >= 1) { blink = 1; state = 2; } }
    else if (state === 2) { blink -= dt / 0.13; if (blink <= 0) { blink = 0; state = 0; timer = 0; if (!dbl && Math.random() < 0.25) { dbl = true; next = 0.12; } else { dbl = false; next = 1.5 + 3 * Math.random(); } } }
    eyeMat.uniforms.uBlink.value = blink;
    bgMat.uniforms.uLight.value = light; bgMat.uniforms.uShift.value = prog;
    renderer.render(scene, camera);
  };
  renderer.compile(scene, camera);
  gsap.ticker.add(frame);
  // Screen position of a point on the leg — same formula as the shader center() (the original attaches ability pills to leg bones)
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const armLocal = (k, t) => {
    const ang = (k / 8) * Math.PI * 2 + 0.2, len = 6.2 + 0.6 * Math.sin(k * 1.7), w = U.uWiggle.value * (0.3 + 0.5 * t) * t;
    const ph = U.uTime.value * 1.1 + k * 1.3 - t * 5, ox = Math.cos(ang), oz = Math.sin(ang), sx = -Math.sin(ang), sz = Math.cos(ang);
    const spread = Math.sin(Math.min(t * 3, 1.57)) * 0.9, droop = -t * len * 0.82, curl = ss(0.6, 1, t) * 1.25;
    const r = 0.42 + spread + curl * 1.1 + Math.sin(ph * 0.6 + 1) * w * 0.4, sw = Math.sin(ph) * w * 0.9;
    return new T.Vector3(ox * r + sx * sw, droop + curl * 1.15 + Math.cos(ph * 0.8) * w * 0.5, oz * r + sz * sw);
  };
  const armPoint = (k, t) => {
    const v = octo.localToWorld(armLocal(k, t));
    world.updateMatrixWorld(); v.project(camera);
    return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight, front: v.z < 1 };
  };
  window.IMScene = { set: (t, l) => { prog = t; light = l; }, armPoint };
})();
