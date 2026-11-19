// Build with basic shapes a stand-in for the original bent-texture neighborhood model (glb), in the same layout and silhouette — long 4-story apartment row, end-wall mural, stair tower, trees·people·cars·birds, sky.
// Every surface is painted by one Hand-drawn shader: pencil grain noise (±.21), night (uNight — pressed into navy, only window lights and murals remain), past (uPast — no murals, olive tint, no cars).
// Camera controls use the original values: height 40~220 (wheel 25e-5), tilt .12π~.35π, horizontal drag = Bump (1.4·5e-4) · vertical = Front/back (1.8 · .05), follow 3, pull toward center (42,0,-12), mouse parallax 1 · .03.
(() => {
  const T = window.THREE;
  if (!T) return;
  const Z = (window.CZTown = {});
  let seed = 1234567;
  const rnd = () => { let e = (seed += 1831565813); e = Math.imul(e ^ (e >>> 15), e | 1); e ^= e + Math.imul(e ^ (e >>> 7), e | 61); return ((e ^ (e >>> 14)) >>> 0) / 4294967296; };
  const U = { uTime: { value: 0 }, uNight: { value: 0 }, uPast: { value: 0 }, uAppear: { value: 0 }, uFog: { value: new T.Color() }, uSky: { value: new T.Color() }, uMurals: { value: null } };
  Z.uniforms = U;

  const NOISE = `
    float hs(vec2 q){ vec3 r=fract(vec3(q.xyx)*.1031); r+=dot(r,r.yzx+33.33); return fract((r.x+r.y)*r.z); }
    float vn(vec2 q){ vec2 i=floor(q), f=fract(q), u=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1,0)),u.x),mix(hs(i+vec2(0,1)),hs(i+1.),u.x),u.y); }
    vec3 desat(vec3 c, float s){ return mix(vec3(dot(c,vec3(.2125,.7154,.0721))), c, s); }`;
  // Shared finish for every page: pencil grain → vintage → night → fog → reveal (center outward)
  const FINISH = `
    vec3 finish(vec3 c, vec2 hatchUv, float lit, float keepNight){
      float n = vn(hatchUv * vec2(15., .3));
      c *= 1. + (n - .5) * .21;
      c *= 1. - smoothstep(.55, 1., vn(hatchUv * vec2(40., 1.2) + floor(uTime * 8.1) * .08)) * .08;
      c = mix(c, desat(c * vec3(1., 1.04, .86), .55) + vec3(.03, .04, -.01), uPast);
      vec3 night = c * vec3(.1, .1, .2) * 2.2 + lit * vec3(1., .78, .42) * .9;
      c = mix(c, mix(night, c * vec3(.55, .55, .8), keepNight), uNight);
      float d = length(vWorld.xz - vec2(42., -12.));
      float fog = smoothstep(150., 300., length(vWorld.xz - cameraPosition.xz));
      c = mix(c, mix(vec3(.2, .44, .74), vec3(.02, .02, .07), uNight), fog);
      float a = smoothstep(uAppear * 760. - 40., uAppear * 760., d);
      c = mix(c, uSky, a);
      return c;
    }`;
  const VERT_INST = `
    attribute vec3 aSize; attribute vec4 aInfo; attribute vec3 aColor;
    varying vec3 vLocal, vNormalW, vWorld, vSize, vColor; varying vec4 vInfo;
    void main(){
      vLocal = position; vSize = aSize; vInfo = aInfo; vColor = aColor;
      vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.);
      vWorld = w.xyz;
      vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;
  const uniformsDecl = `uniform float uTime, uNight, uPast, uAppear; uniform vec3 uFog, uSky; uniform sampler2D uMurals;`;

  // ── Apartment: one box stretched to size as an instance. Long sides get a balcony band + windows per floor, end walls take one cell of a mural atlas, the roof is a corrugated panel
  const FRAG_BLOCK = `precision highp float; ${uniformsDecl}
    varying vec3 vLocal, vNormalW, vWorld, vSize, vColor; varying vec4 vInfo;
    ${NOISE} ${FINISH}
    void main(){
      vec3 n = abs(vNormalW);
      vec3 p = vLocal * vSize;
      float floorH = 2.9;
      vec3 base = vColor;
      float lit = 0., keep = 0.;
      vec2 huv;
      if (vLocal.y > .499) {
        huv = p.xz * .5;
        float rib = smoothstep(.35, .5, abs(fract(p.x * 2.2) - .5));
        base = mix(vec3(.78, .78, .8), vec3(.55, .55, .6), rib);
      } else {
        bool endWall = abs(vLocal.x) > .499;
        vec2 f = endWall ? vec2(p.z, p.y + vSize.y * .5) : vec2(p.x, p.y + vSize.y * .5);
        huv = f * .5;
        float lvl = floor(f.y / floorH), fy = fract(f.y / floorH);
        if (endWall && vInfo.x > .5) {
          vec2 tile = vec2(mod(vInfo.x - 1., 4.), floor((vInfo.x - 1.) / 4.));
          vec2 muv = vec2(f.x / vSize.z + .5, f.y / vSize.y);
          vec3 m = texture2D(uMurals, (tile + clamp(muv, .02, .98)) / 4.).rgb;
          base = mix(m, base * vec3(.95, 1.05, .8), uPast);
          keep = 1. - uPast;
        } else if (!endWall) {
          float band = step(.72, fy) * step(fy, .86);
          float col = fract(f.x / 3.2);
          float win = step(.22, col) * step(col, .62) * step(.18, fy) * step(fy, .62);
          base = mix(base, base * 1.12 + .04, band);
          base = mix(base, base * .62, step(.64, fy) * step(fy, .72));
          base = mix(base, vec3(.2, .21, .24), win * .85);
          float cell = hs(vec2(floor(f.x / 3.2), lvl) + vInfo.yz * 17.);
          if (cell > .86 && fy > .62 && fy < .72) base = mix(base, vec3(.9, .3 + cell * .3, .6), .8);
          lit = win * step(.55, hs(vec2(floor(f.x / 3.2), lvl) + vInfo.yz * 31.));
        } else {
          float st = step(.82, fract(f.x * .4));
          base = mix(base, base * .9, st);
        }
        base *= endWall ? .92 : (vNormalW.z > 0. ? 1. : .86);
      }
      float shade = .78 + .22 * dot(normalize(vNormalW), normalize(vec3(-.3, .9, .4)));
      gl_FragColor = vec4(finish(base * shade, huv, lit, keep), 1.);
    }`;
  // ── Trees, people, cars, towers: instance color + light + texture
  const FRAG_SOLID = `precision highp float; ${uniformsDecl}
    varying vec3 vLocal, vNormalW, vWorld, vSize, vColor; varying vec4 vInfo;
    ${NOISE} ${FINISH}
    void main(){
      float shade = .72 + .28 * dot(normalize(vNormalW), normalize(vec3(-.3, .9, .4)));
      vec3 c = vColor * shade;
      c *= .82 + .36 * vn(vWorld.xz * 1.7 + vLocal.y * 3.);
      float car = step(.5, vInfo.w);
      c = mix(c, desat(c * .45, .2), uPast * car);
      gl_FragColor = vec4(finish(c, vWorld.xz * .7 + vLocal.xy * 3., vInfo.x, 0.), 1.);
    }`;
  // ── Ground: paper-toned background with a road (gray band), lawn (green panel), dirt circles, and a pencil outline on the edges
  const FRAG_GROUND = `precision highp float; ${uniformsDecl}
    varying vec3 vWorld; varying vec2 vUv;
    ${NOISE}
    ${FINISH}
    uniform float uRot;
    void main(){
      vec2 p = vWorld.xz - vec2(42., -12.);
      float cs = cos(uRot), sn = sin(uRot);
      vec2 q = mat2(cs, -sn, sn, cs) * p;
      vec3 paper = vec3(.86, .85, .8);
      vec3 grass = vec3(.66, .72, .5);
      vec3 road = vec3(.74, .73, .72);
      vec3 c = paper;
      float inTown = step(abs(q.x), 95.) * step(abs(q.y), 78.);
      c = mix(c, grass, inTown * (.65 + .35 * vn(q * .08)));
      float lanes = max(step(abs(q.y + 92.), 9.), step(abs(q.x + 110.), 8.));
      lanes = max(lanes, step(abs(length(q - vec2(-110., -92.)) - 22.), 6.));
      c = mix(c, road, lanes);
      float curb = max(smoothstep(.6, 0., abs(abs(q.y + 92.) - 9.)), smoothstep(.6, 0., abs(abs(q.x + 110.) - 8.)));
      c = mix(c, vec3(.25), curb * .55);
      float paths = inTown * step(abs(fract(q.x / 38.) - .5) * 38., 1.6);
      c = mix(c, paper * .98, paths);
      for (int i = 0; i < 4; i++) { vec2 o = vec2(float(i) * 41. - 60., mod(float(i) * 37., 60.) - 25.); float r = length(q - o); c = mix(c, vec3(.72, .55, .42), smoothstep(10., 6., r) * inTown * .7); }
      float stroke = smoothstep(.04, 0., abs(vn(q * .25) - .5)) * .12;
      c *= 1. - stroke;
      gl_FragColor = vec4(finish(c, q * .3, 0., 0.), 1.);
    }`;
  const VERT_GROUND = `varying vec3 vWorld; varying vec2 vUv; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
  // ── Sky: grainy clouds over a blue band, navy at night
  const FRAG_SKY = `precision highp float; uniform float uTime, uNight; varying vec3 vDir;
    float hs(vec2 q){ vec3 r=fract(vec3(q.xyx)*.1031); r+=dot(r,r.yzx+33.33); return fract((r.x+r.y)*r.z); }
    float vn(vec2 q){ vec2 i=floor(q), f=fract(q), u=f*f*(3.-2.*f); return mix(mix(hs(i),hs(i+vec2(1,0)),u.x),mix(hs(i+vec2(0,1)),hs(i+1.),u.x),u.y); }
    void main(){
      vec3 d = normalize(vDir);
      float h = clamp(d.y, -.2, 1.);
      vec3 day = mix(vec3(.25, .5, .78), vec3(.06, .3, .65), smoothstep(0., .5, h));
      vec2 cu = d.xz / max(d.y + .25, .05) * 2. + vec2(uTime * .01, 0.);
      float cl = smoothstep(.55, .85, vn(cu) * .6 + vn(cu * 3.1) * .4);
      day = mix(day, vec3(.88, .9, .95), cl * smoothstep(-.05, .2, h));
      day += (hs(gl_FragCoord.xy) - .5) * .06;
      vec3 night = vec3(.02, .02, .06) + vec3(.03, .03, .1) * (1. - h);
      gl_FragColor = vec4(mix(day, night, uNight), 1.);
    }`;
  const VERT_SKY = `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.); gl_Position = p.xyww; }`;

  const shaderMat = (frag, vert = VERT_INST, extra = {}) => new T.ShaderMaterial({ uniforms: Object.assign({}, U, extra), vertexShader: vert, fragmentShader: frag });

  // Mural atlas 4×4 — in place of the original murals, draws our own art (large color fields · flowers · birds · waves · text lines) on a canvas
  const muralAtlas = () => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 1024;
    const c = cv.getContext("2d"), S = 256;
    const PAL = [["#1f5fd6", "#f2c94c", "#eb5757", "#27ae60", "#ffffff"], ["#0b1d51", "#3f8efc", "#f6f7f9", "#c33764", "#f2a65a"], ["#f4a261", "#e76f51", "#2a9d8f", "#264653", "#e9c46a"], ["#5a189a", "#9d4edd", "#ff9e00", "#ff6d00", "#e0aaff"], ["#2d6a4f", "#95d5b2", "#d8f3dc", "#e63946", "#1d3557"], ["#118ab2", "#ef476f", "#ffd166", "#06d6a0", "#073b4c"]]; /* Not skin: mural paint color */
    for (let k = 0; k < 16; k++) {
      const x0 = (k % 4) * S, y0 = Math.floor(k / 4) * S, P = PAL[k % PAL.length];
      c.save(); c.beginPath(); c.rect(x0, y0, S, S); c.clip();
      const g = c.createLinearGradient(x0, y0, x0, y0 + S); g.addColorStop(0, P[0]); g.addColorStop(1, P[3]);
      c.fillStyle = g; c.fillRect(x0, y0, S, S);
      for (let i = 0; i < 14; i++) { c.fillStyle = P[i % 5]; c.globalAlpha = .55 + rnd() * .45; c.beginPath(); c.ellipse(x0 + rnd() * S, y0 + rnd() * S, 10 + rnd() * 50, 8 + rnd() * 40, rnd() * 3, 0, 7); c.fill(); }
      c.globalAlpha = 1; c.strokeStyle = P[4]; c.lineWidth = 3;
      for (let i = 0; i < 6; i++) { c.beginPath(); const yy = y0 + 30 + i * 38; c.moveTo(x0, yy); for (let xx = 0; xx <= S; xx += 16) c.lineTo(x0 + xx, yy + Math.sin(xx * .08 + k) * 8); c.stroke(); }
      if (k % 3 === 0) { c.fillStyle = P[4]; c.fillRect(x0 + 40, y0 + 120, S - 80, 110); c.fillStyle = P[1]; for (let r = 0; r < 9; r++) for (let q = 0; q < 12; q++) if (rnd() > .3) c.fillRect(x0 + 50 + q * 13, y0 + 128 + r * 11, 9, 5); }
      if (k % 4 === 1) { c.fillStyle = P[2]; c.beginPath(); c.arc(x0 + S * .5, y0 + S * .35, 46, 0, 7); c.fill(); c.fillStyle = P[1]; c.beginPath(); c.moveTo(x0 + 70, y0 + 210); c.quadraticCurveTo(x0 + 128, y0 + 120, x0 + 186, y0 + 210); c.fill(); }
      c.restore();
    }
    const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    return t;
  };

  Z.build = (canvas) => {
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = T.LinearSRGBColorSpace;
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(35, 1, 5, 650);
    U.uMurals.value = muralAtlas();
    const css = getComputedStyle(document.documentElement);
    U.uFog.value.set(css.getPropertyValue("--kf-raised").trim());
    U.uSky.value.set(css.getPropertyValue("--kf-bg").trim());

    const town = new T.Group(); scene.add(town);
    const ROT = -0.55, center = new T.Vector2(42, -12);
    const place = (lx, lz) => { const c = Math.cos(ROT), s = Math.sin(ROT); return new T.Vector3(center.x + lx * c - lz * s, 0, center.y + lx * s + lz * c); };

    // Ground · Sky
    const ground = new T.Mesh(new T.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), shaderMat(FRAG_GROUND, VERT_GROUND, { uRot: { value: -ROT } }));
    town.add(ground);
    const sky = new T.Mesh(new T.SphereGeometry(600, 32, 16), new T.ShaderMaterial({ uniforms: U, vertexShader: VERT_SKY, fragmentShader: FRAG_SKY, side: T.BackSide, depthWrite: false }));
    scene.add(sky);

    // Apartment rows — 4 columns × 2–3 buildings per row, end-wall mural 14
    const blocks = [], murals = [];
    for (let row = 0; row < 7; row++) for (let colm = 0; colm < 3; colm++) {
      if (rnd() < .12) continue;
      const lx = -72 + colm * 58 + (row % 2) * 10, lz = -66 + row * 22;
      blocks.push({ lx, lz, len: 40 + rnd() * 8, w: 9.5, h: 12.5 + (rnd() > .7 ? 2.9 : 0) });
    }
    const mGeo = new T.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const bMesh = new T.InstancedMesh(mGeo, shaderMat(FRAG_BLOCK), blocks.length);
    const aSize = new Float32Array(blocks.length * 3), aInfo = new Float32Array(blocks.length * 4), aCol = new Float32Array(blocks.length * 3);
    const o = new T.Object3D();
    let mural = 0;
    blocks.forEach((b, i) => {
      const p = place(b.lx, b.lz);
      o.position.copy(p); o.rotation.set(0, -ROT, 0); o.scale.set(b.len, b.h, b.w); o.updateMatrix(); bMesh.setMatrixAt(i, o.matrix);
      aSize.set([b.len, b.h, b.w], i * 3);
      const m = mural < 14 && rnd() > .25 ? ++mural : 0;
      aInfo.set([m, rnd(), rnd(), 0], i * 4);
      const tone = .8 + rnd() * .08; aCol.set([tone, tone * 1.01, tone * .96], i * 3); /* Not skin: building gray-white */
      b.mural = m; b.p = p;
      if (m) murals.push({ id: m, end: place(b.lx - b.len / 2 - 0.2, b.lz), b });
    });
    bMesh.geometry.setAttribute("aSize", new T.InstancedBufferAttribute(aSize, 3));
    bMesh.geometry.setAttribute("aInfo", new T.InstancedBufferAttribute(aInfo, 4));
    bMesh.geometry.setAttribute("aColor", new T.InstancedBufferAttribute(aCol, 3));
    town.add(bMesh);

    // Helper that stamps stair towers (a white tower mid long side), trees, people and cars in the same shape
    const solid = (geo, list, color) => {
      const mesh = new T.InstancedMesh(geo, shaderMat(FRAG_SOLID), list.length);
      const s = new Float32Array(list.length * 3), info = new Float32Array(list.length * 4), col = new Float32Array(list.length * 3);
      list.forEach((it, i) => { o.position.copy(it.p); o.rotation.set(0, it.r || 0, 0); o.scale.setScalar(it.s || 1); if (it.sv) o.scale.copy(it.sv); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); s.set([1, 1, 1], i * 3); info.set([it.lit || 0, 0, 0, it.car || 0], i * 4); const cc = it.c || color; col.set([cc.r, cc.g, cc.b], i * 3); });
      mesh.geometry.setAttribute("aSize", new T.InstancedBufferAttribute(s, 3));
      mesh.geometry.setAttribute("aInfo", new T.InstancedBufferAttribute(info, 4));
      mesh.geometry.setAttribute("aColor", new T.InstancedBufferAttribute(col, 3));
      town.add(mesh);
      return mesh;
    };
    const C = (h) => new T.Color(h);
    solid(new T.BoxGeometry(5, 15.5, 4).translate(0, 7.75, 0), blocks.map((b) => ({ p: place(b.lx + (rnd() - .5) * 8, b.lz + b.w / 2 + 1.8), r: -ROT })), C("#e9e7e2")); /* Not skin: stair tower white */

    const crown = new T.IcosahedronGeometry(3, 0);
    const parts = [new T.CylinderGeometry(.35, .5, 5, 5).translate(0, 2.5, 0)];
    [[0, 6.5, 0, 1.2], [1.8, 5.6, .6, .9], [-1.6, 5.8, -.8, .95]].forEach(([x, y, z, s]) => parts.push(crown.clone().scale(s * 1.2, s * .7, s * 1.2).translate(x, y, z)));
    const treeGeo = mergeGeometries(parts);
    const trees = [];
    for (let i = 0; i < 230; i++) {
      const lx = (rnd() - .5) * 200, lz = (rnd() - .5) * 170;
      if (blocks.some((b) => Math.abs(lx - b.lx) < b.len / 2 + 3 && Math.abs(lz - b.lz) < b.w / 2 + 3)) continue;
      const g = .25 + rnd() * .15;
      trees.push({ p: place(lx, lz), r: rnd() * 6, s: .8 + rnd() * .7, c: new T.Color(g * .55, g * 1.25, g * .75) });
    }
    solid(treeGeo, trees, C("#2f6b45")); /* Not skin: tree green */

    const people = [];
    for (let i = 0; i < 320; i++) { const lx = (rnd() - .5) * 210, lz = (rnd() - .5) * 190; people.push({ p: place(lx, lz), s: .9 + rnd() * .3, c: new T.Color().setHSL(rnd(), .45, .55 + rnd() * .2) }); }
    solid(new T.CylinderGeometry(.28, .32, 1.7, 5).translate(0, .85, 0), people, C("#d48ab0")); /* Not skin: person clothing color */

    const carParts = [new T.BoxGeometry(4.2, 1.1, 1.9).translate(0, .75, 0), new T.BoxGeometry(2.3, .9, 1.7).translate(-.2, 1.7, 0)];
    const carGeo = mergeGeometries(carParts);
    const cars = [], CAR = ["#e58fa0", "#d9a08a", "#b98fd6", "#f2b8c6", "#c45b6a"]; /* Not skin: tea color */
    for (let i = 0; i < 26; i++) cars.push({ lane: i % 2, t: rnd(), v: (.008 + rnd() * .01) * (i % 2 ? 1 : -1), c: C(CAR[i % 5]), car: 1, p: new T.Vector3(), lit: 1 });
    const carMesh = solid(carGeo, cars, C("#e58fa0")); /* Not skin: tea color */

    // Bird — flies high in a big circle (rotates the wing V to flap)
    const birdGeo = new T.BufferGeometry();
    birdGeo.setAttribute("position", new T.Float32BufferAttribute([0, 0, 0, -1.6, .5, -.6, -1.6, .5, .6, 0, 0, 0, 1.6, .5, .6, 1.6, .5, -.6], 3));
    birdGeo.computeVertexNormals();
    const birds = Array.from({ length: 12 }, () => ({ p: new T.Vector3(), a: rnd() * 6.28, r: 60 + rnd() * 90, h: 55 + rnd() * 30, sp: .05 + rnd() * .05, c: C("#f4f4f4") })); /* Not skin: bird white */
    const birdMesh = solid(birdGeo, birds, C("#f4f4f4")); /* Not skin: bird white */
    birdMesh.material.side = T.DoubleSide;

    // ── Camera controls (original values)
    // Initial position so the land being looked at is at the village center (42, -12) — at height 130 and tilt .235π, from the center back by y/tan
    const attract = new T.Vector3(42, 0, -12);
    const back = 130 / Math.tan(Math.PI * .235);
    const st = { ca: .5, ss: .5, bl: 0, su: 0, pos: new T.Vector3(42, 130, -12 + back), ho: new T.Vector3(42, 0, -12 + back), mouse: new T.Vector2(), mt: new T.Vector2(), look: new T.Vector3(42, 10, -12) };
    const home = st.ho.clone();
    const lerpK = () => (matchMedia("(pointer: coarse)").matches ? 1.5 : 3);
    const hot = { influence: 0, progress: 0, from: new T.PerspectiveCamera(), to: new T.PerspectiveCamera(), pos: new T.Vector3(), quat: new T.Quaternion(), tl: null };
    const qY = new T.Quaternion(), qX = new T.Quaternion(), tmp = new T.Vector3(), fwd = new T.Vector3(), mtx = new T.Matrix4();
    const ctl = {
      drag(dx, dy) {
        if (hot.influence > .5) ctl.release();
        cam.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
        const touch = matchMedia("(pointer: coarse)").matches;
        fwd.multiplyScalar(dy * (touch ? 5 : 1.8) * .05);
        st.su += dx * (touch ? 3.2 : 1.4) * 5e-4;
        st.ho.x += fwd.x; st.ho.z += fwd.z;
      },
      wheel(dy) { if (hot.influence > .5) ctl.release(); st.ss = Math.max(0, Math.min(1, st.ss - dy * 25e-5 * (matchMedia("(pointer: coarse)").matches ? 7 : 1))); },
      mouse(x, y) { st.mt.set(x, y); },
      // Fly to the pin position — from the start position to the target position and direction over dur seconds
      goTo(target, look, dur = 4, done) {
        hot.tl?.kill();
        hot.from.position.copy(cam.position); hot.from.quaternion.copy(cam.quaternion);
        hot.to.position.copy(target); hot.to.lookAt(look);
        hot.progress = 0;
        hot.tl = gsap.timeline({ onComplete: done })
          .to(hot, { influence: 1, duration: .2, ease: "power2.inOut" }, 0)
          .fromTo(hot, { progress: 0 }, { progress: 1, duration: dur, ease: "power2.inOut" }, 0);
      },
      release() {
        hot.tl?.kill();
        st.pos.copy(cam.position); st.ho.copy(cam.position);
        st.ca = st.ss = Math.max(0, Math.min(1, (cam.position.y - 40) / 180));
        const e = new T.Euler().setFromQuaternion(cam.quaternion, "YXZ"); st.bl = st.su = e.y;
        hot.tl = gsap.to(hot, { influence: 0, duration: 2.5, ease: "power2.inOut" });
      },
      reset(dur = 2) { ctl.release(); gsap.to(st, { ss: .5, su: 0, duration: dur, ease: "power3.inOut" }); gsap.to(st.ho, { x: home.x, z: home.z, duration: dur, ease: "power3.inOut" }); },
    };

    // ── Pin spots: in front of the mural end wall (clickable) and elsewhere (not clickable)
    const pins = murals.map((m) => ({ id: m.id, at: m.end.clone().setY(7 + rnd() * 3), mural: m, click: true }));
    for (let i = 0; i < 13; i++) { const b = blocks[Math.floor(rnd() * blocks.length)]; pins.push({ id: 100 + i, at: place(b.lx + (rnd() - .5) * b.len * .8, b.lz + (rnd() - .5) * 4).setY(b.h + 1.5 + rnd() * 2), click: false }); }
    // Camera spot in front of the mural — 30 outward from the end wall, height 12
    pins.forEach((p) => { if (!p.click) return; const out = place(p.mural.b.lx - p.mural.b.len / 2 - 38, p.mural.b.lz + 4); p.camPos = out.setY(16); p.look = p.mural.end.clone().setY(7); });

    const fit = () => { const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = 35 / Math.min(1, cam.aspect * 1.5); cam.updateProjectionMatrix(); };
    fit(); addEventListener("resize", fit);

    let last = performance.now(), running = false;
    const tick = () => {
      const now = performance.now(), dt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now;
      if (!running) return;
      U.uTime.value += dt;
      const k = lerpK() * dt;
      st.ca -= (st.ca - st.ss) * k;
      st.pos.y = 40 + st.ca * 180;
      // If the ground spot being looked at is far from the center, it is pulled in gradually (original attractivityCenter 70, 1.5–2.4×)
      const pull = Math.max(0, Math.min(1, (st.look.distanceTo(attract) / 70 - 1.5) / 0.9));
      st.ho.lerp(attract, pull * dt);
      st.pos.x -= (st.pos.x - st.ho.x) * k; st.pos.z -= (st.pos.z - st.ho.z) * k;
      st.bl -= (st.bl - st.su) * k;
      qY.setFromAxisAngle(new T.Vector3(0, 1, 0), st.bl);
      qX.setFromAxisAngle(new T.Vector3(1, 0, 0), -(Math.PI * .12 + st.ca * (Math.PI * .35 - Math.PI * .12)));
      const qc = qY.clone().multiply(qX);
      hot.pos.lerpVectors(hot.from.position, hot.to.position, hot.progress);
      hot.quat.slerpQuaternions(hot.from.quaternion, hot.to.quaternion, hot.progress);
      cam.position.copy(st.pos).lerp(hot.pos, hot.influence);
      cam.quaternion.copy(qc).slerp(hot.quat, hot.influence);
      st.mouse.lerp(st.mt, dt);
      cam.position.x += st.mouse.x; cam.position.y += st.mouse.y;
      cam.rotateY(st.mouse.x * .03); cam.rotateX(-st.mouse.y * .03);
      cam.getWorldDirection(tmp);
      const t = (10 - cam.position.y) / (tmp.y || -1e-3);
      st.look.set(cam.position.x + t * tmp.x, 10, cam.position.z + t * tmp.z);
      // Cars, people, birds
      cars.forEach((c, i) => { c.t += c.v * dt; const p = c.lane ? place(-110 + (c.v > 0 ? 3 : -3), ((c.t % 1) - .5) * 280) : place(((c.t % 1) - .5) * 320, -92 + (c.v > 0 ? 3 : -3)); o.position.copy(p); o.rotation.set(0, -ROT + (c.lane ? Math.PI / 2 : 0) + (c.v > 0 ? 0 : Math.PI), 0); o.scale.setScalar(1 - U.uPast.value * .999); o.updateMatrix(); carMesh.setMatrixAt(i, o.matrix); });
      carMesh.instanceMatrix.needsUpdate = true;
      birds.forEach((b, i) => { b.a += b.sp * dt; o.position.set(attract.x + Math.cos(b.a) * b.r, b.h + Math.sin(b.a * 3) * 2, attract.z + Math.sin(b.a) * b.r); o.rotation.set(0, -b.a, Math.sin(U.uTime.value * 9 + i) * .5); o.scale.setScalar(1.2); o.updateMatrix(); birdMesh.setMatrixAt(i, o.matrix); });
      birdMesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, cam);
      Z.onFrame?.(cam);
    };
    gsap.ticker.add(tick);
    return {
      renderer, scene, cam, ctl, pins, uniforms: U,
      start() { running = true; last = performance.now(); },
      stop() { running = false; },
      // 3D position → screen position (null if off-screen or backfacing)
      project(v) { tmp.copy(v).project(cam); if (tmp.z > 1) return null; return { x: (tmp.x * .5 + .5) * canvas.clientWidth, y: (-tmp.y * .5 + .5) * canvas.clientHeight }; },
      // A top-down shot (used in the loader’s aerial photo slot)
      aerial(target, w, h) {
        const c2 = new T.PerspectiveCamera(30, w / h, 5, 900); c2.position.set(42, 330, -12); c2.lookAt(42, 0, -12); c2.rotateZ(.35);
        const keep = U.uAppear.value; U.uAppear.value = 1;
        renderer.setSize(w, h, false); renderer.render(scene, c2);
        const ctx = target.getContext("2d"); target.width = w; target.height = h; ctx.drawImage(renderer.domElement, 0, 0, w, h);
        U.uAppear.value = keep; fit();
      },
    };
  };

  function mergeGeometries(list) {
    const pos = [], nor = [];
    list.forEach((g0) => { const g = g0.index ? g0.toNonIndexed() : g0; g.computeVertexNormals(); const p = g.attributes.position, n = g.attributes.normal; for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); } });
    const out = new T.BufferGeometry();
    out.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    out.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
    return out;
  }
})();
