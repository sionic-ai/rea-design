// Hero: a misty 3D terrain where water flows between ridges rising in the shape of our mark.
// As in the original, the wheel moves forward and back, dragging orbits around, pressing a light marker flies the camera to it, and a work label blooms like a cloud below.
// The original model, shader and texture are not used. The height field is a marker distance field + value noise, and the water, fog and sparks are our own shaders.
(() => {
  const THREE = window.THREE;
  const stage = document.getElementById("gl-canvas");
  if (!THREE || !stage) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = innerWidth <= 768;
  const { MARK, rgb } = window.OW;
  const col = (name) => new THREE.Color().setRGB(...rgb(name), THREE.SRGBColorSpace);

  // ── Noise ──
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const vnoise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
  const fbm = (x, y, o = 5) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += vnoise(x * f, y * f) * a; f *= 2.03; a *= 0.5; } return s; };
  const ridged = (x, y) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += (1 - Math.abs(vnoise(x * f, y * f) * 2 - 1)) ** 2 * a; f *= 2.1; a *= 0.5; } return s; };
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

  // ── Marker distance field — same three rings as the door drawing + a diamond ──
  const segDist = (px, py, ax, ay, bx, by) => {
    const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - ax - dx * t, py - ay - dy * t);
  };
  const markDist = (u, v) => {
    let d = 1e9;
    const rr = Math.hypot(u, v);
    let ang = (Math.atan2(v, u) * 180) / Math.PI;
    for (const { r, a0, a1 } of MARK.rings) {
      let a = ang; while (a < a0) a += 360; while (a >= a0 + 360) a -= 360;
      if (a <= a1) d = Math.min(d, Math.abs(rr - r));
      else {
        const e0 = (a0 * Math.PI) / 180, e1 = (a1 * Math.PI) / 180;
        d = Math.min(d, Math.hypot(u - Math.cos(e0) * r, v - Math.sin(e0) * r), Math.hypot(u - Math.cos(e1) * r, v - Math.sin(e1) * r));
      }
    }
    const k = MARK.diamond;
    d = Math.min(d, segDist(u, v, 0, k, k, 0), segDist(u, v, k, 0, 0, -k), segDist(u, v, 0, -k, -k, 0), segDist(u, v, -k, 0, 0, k));
    return d;
  };

  const S = 60; // Marker 1 = Units of 60
  const HW = MARK.width / 2;
  const height = (x, z) => {
    const u = x / S, v = -z / S, r = Math.hypot(u, v);
    const rock = fbm(x * 0.13 + 4.1, z * 0.13 - 2.7, 4);
    const wob = (fbm(x * 0.07 + 9, z * 0.07 + 1, 3) - 0.5) * 0.045;
    const ridge = smooth(HW + 0.05, HW - 0.012, markDist(u, v) + wob);
    const basin = -1.9 + rock * 1.1;
    const out = smooth(1.0, 1.22, r + wob);
    const plains = 0.6 + fbm(x * 0.035, z * 0.035, 4) * 3.8 + ridged(x * 0.09, z * 0.09) * 1.6;
    const peaks = smooth(1.7, 3.0, r) * (ridged(x * 0.016 + 7, z * 0.016 - 3) * 46 + fbm(x * 0.08, z * 0.08, 3) * 5);
    const base = basin + (plains + peaks - basin) * out;
    const top = 7.2 + ridged(x * 0.07 + 2, z * 0.07 - 5) * 3.4 + fbm(x * 0.45, z * 0.45, 3) * 1.1;
    return base + (Math.max(base, top) - base) * ridge;
  };

  // ── Renderer · scene ──
  const renderer = new THREE.WebGLRenderer({ antialias: !small, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(small ? 1 : 1.5, devicePixelRatio || 1));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.append(renderer.domElement);

  const C = {
    bg: col("--kf-bg"), accent: col("--kf-accent"), deep: col("--kf-accent-soft"), dim: col("--kf-dim"), ink: col("--kf-ink"), raised: col("--kf-raised"),
  };
  const fogCol = C.deep.clone().lerp(C.dim, 0.45).lerp(C.accent, 0.28);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(fogCol.clone(), 0.0068);
  scene.background = fogCol.clone().lerp(C.bg, 0.35);
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.5, 1600);

  // Sky — the horizon is haze-colored, turning to the background color toward the top
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: C.bg.clone().lerp(C.deep, 0.35) }, hor: { value: fogCol.clone() } },
    vertexShader: "varying vec3 w;void main(){w=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 top,hor;varying vec3 w;void main(){gl_FragColor=vec4(mix(hor,top,smoothstep(-.02,.45,w.y)),1.);}",
  }));
  scene.add(sky);

  // ── Terrain ──
  const SIZE = 300, SEG = small ? 200 : 300;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, colors = new Float32Array(pos.count * 3);
  const rockLo = C.bg.clone().lerp(C.deep, 0.45), rockHi = C.dim.clone().lerp(C.ink, 0.12), cliff = C.bg.clone().lerp(C.raised, 0.35), grass = C.bg.clone().lerp(C.raised, 0.45), wet = C.bg.clone().lerp(C.deep, 0.3);
  const tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = pos.getY(i);
    const n = fbm(x * 0.21, z * 0.21, 3), slope = 1 - nrm.getY(i);
    if (h < 0.2) tmp.copy(wet);
    else if (Math.hypot(x, z) < S * 1.08) tmp.copy(rockLo).lerp(rockHi, Math.min(1, Math.max(0, (h - 4) / 7)) * 0.75 + n * 0.3);
    else tmp.copy(grass).lerp(rockLo, n * 0.5).lerp(rockHi, Math.min(0.8, Math.max(0, (h - 12) / 30)));
    tmp.lerp(cliff, smooth(0.25, 0.7, slope) * 0.7);
    colors[i * 3] = tmp.r; colors[i * 3 + 1] = tmp.g; colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, metalness: 0 }));
  scene.add(terrain);

  scene.add(new THREE.HemisphereLight(C.dim.clone().lerp(C.accent, 0.3), C.bg, 1.0));
  const moon = new THREE.DirectionalLight(C.ink.clone().lerp(C.accent, 0.4), 2.6);
  moon.position.set(-70, 60, -110);
  scene.add(moon);
  const rim = new THREE.DirectionalLight(C.accent.clone().lerp(C.ink, 0.3), 0.55);
  rim.position.set(80, 40, 90);
  scene.add(rim);

  // Heightmap image — the water shader finds the shoreline (foam, sparkle)
  const HT = 256, hdata = new Uint8Array(HT * HT * 4);
  for (let j = 0; j < HT; j++) for (let i = 0; i < HT; i++) {
    const x = (i / (HT - 1) - 0.5) * SIZE, z = (j / (HT - 1) - 0.5) * SIZE, h = height(x, z);
    const k = (j * HT + i) * 4, e = Math.max(0, Math.min(255, Math.round((h + 4) * 20)));
    hdata[k] = hdata[k + 1] = hdata[k + 2] = e; hdata[k + 3] = 255;
  }
  const htex = new THREE.DataTexture(hdata, HT, HT);
  htex.magFilter = htex.minFilter = THREE.LinearFilter; htex.needsUpdate = true;

  const NOISE_GLSL = `float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+1.),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int k=0;k<5;k++){s+=n2(p)*a;p=p*2.02+13.7;a*=.5;}return s;}`;
  const FOG_GLSL = "vec3 fogit(vec3 c,float d){float f=1.-exp(-fogD*fogD*d*d);return mix(c,fogC,clamp(f,0.,1.));}";

  // ── Water — deep navy with sky-blue Fresnel, glittering ripples at the shore ──
  const water = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200, 1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    transparent: false, fog: false,
    uniforms: {
      time: { value: 0 }, hmap: { value: htex }, size: { value: SIZE }, fogC: { value: scene.fog.color }, fogD: { value: scene.fog.density },
      deep: { value: C.deep.clone().lerp(C.accent, 0.15) }, sky: { value: fogCol.clone().lerp(C.ink, 0.35) }, spark: { value: C.ink.clone() },
    },
    vertexShader: "varying vec3 wp;void main(){vec4 w=modelMatrix*vec4(position,1.);wp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
    fragmentShader: `uniform float time,size,fogD;uniform sampler2D hmap;uniform vec3 deep,sky,spark,fogC;varying vec3 wp;
${NOISE_GLSL}${FOG_GLSL}
void main(){
  vec2 tuv=wp.xz/size+.5;float inside=step(0.,tuv.x)*step(tuv.x,1.)*step(0.,tuv.y)*step(tuv.y,1.);
  float th=texture2D(hmap,tuv).r*255./20.-4.;
  float shore=inside*smoothstep(-1.4,.05,th);
  vec3 V=normalize(cameraPosition-wp);
  vec2 q=wp.xz*.35;float r1=fb(q+vec2(time*.25,time*.12)),r2=fb(q*1.7-vec2(time*.18,-time*.2));
  vec3 N=normalize(vec3((r1-.5)*.35,1.,(r2-.5)*.35));
  float fres=pow(1.-max(dot(N,V),0.),3.);
  vec3 c=mix(deep,sky,.38+fres*.62);
  float g=n2(wp.xz*2.4+vec2(time*1.3,0.))*n2(wp.xz*3.1-vec2(0.,time*1.1));
  float sp=smoothstep(.6,.86,g)*(.3+shore*2.2);
  c+=spark*sp*1.1;
  c=mix(c,sky*1.15,shore*.35*(.6+.4*r1));
  gl_FragColor=vec4(fogit(c,length(cameraPosition-wp)),1.);
}`,
  }));
  water.position.y = 0;
  scene.add(water);

  // ── Fog layers — three panels of different heights drift slowly ──
  const mists = [4.5, 11, 20].map((y, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false,
      uniforms: { time: { value: 0 }, seed: { value: i * 7.3 }, amt: { value: [0.55, 0.36, 0.26][i] }, boost: { value: 0 }, mc: { value: fogCol.clone().lerp(C.ink, 0.12) }, fogC: { value: scene.fog.color }, fogD: { value: scene.fog.density } },
      vertexShader: "varying vec3 wp;void main(){vec4 w=modelMatrix*vec4(position,1.);wp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",
      fragmentShader: `uniform float time,seed,amt,boost,fogD;uniform vec3 mc,fogC;varying vec3 wp;${NOISE_GLSL}${FOG_GLSL}
void main(){vec2 p=wp.xz*.012+seed;float n=fb(p+vec2(time*.012,time*.007));float m=fb(p*2.3-n+vec2(-time*.02,0.));
float a=smoothstep(.42,.82,mix(n,m,.5))*(amt+boost);a*=1.-smoothstep(220.,440.,length(wp.xz));
gl_FragColor=vec4(fogit(mc,length(cameraPosition-wp)*.6),a);}`,
    }));
    m.position.y = y;
    scene.add(m);
    return m;
  });

  // ── Trees — low cones in the outer field ──
  {
    const N = small ? 220 : 420, tree = new THREE.InstancedMesh(new THREE.ConeGeometry(0.9, 3.4, 6), new THREE.MeshStandardMaterial({ color: C.bg.clone().lerp(C.deep, 0.5), roughness: 1 }), N);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    let k = 0;
    for (let i = 0; k < N && i < N * 6; i++) {
      const a = hash(i, 1.3) * Math.PI * 2, r = S * (1.25 + hash(i, 7.7) * 0.9), x = Math.cos(a) * r, z = Math.sin(a) * r, h = height(x, z);
      if (h < 0.8 || h > 9 || fbm(x * 0.03, z * 0.03, 2) < 0.45) continue;
      const s = 0.7 + hash(i, 3.1) * 0.9;
      m4.compose(p.set(x, h + 1.4 * s, z), q, sc.set(s, s * (0.8 + hash(i, 9.9) * 0.6), s));
      tree.setMatrixAt(k++, m4);
    }
    tree.count = k;
    scene.add(tree);
  }

  // ── Light markers — twelve spots on the ridge. Color rotates the accent hue so it differs per work ──
  const spots = [];
  const onArc = (ri, a) => { const { r } = MARK.rings[ri]; const t = (a * Math.PI) / 180; return [Math.cos(t) * r, Math.sin(t) * r]; };
  [[0, 70], [0, 180], [0, 290], [1, 150], [1, 240], [1, 330], [1, 400], [2, 230], [2, 300], [2, 380], [2, 470], [-1, 0]].forEach(([ri, a]) => {
    const [u, v] = ri < 0 ? [0, MARK.diamond] : onArc(ri, a);
    const x = u * S, z = -v * S;
    spots.push(new THREE.Vector3(x, height(x, z) + 0.6, z));
  });
  const PROJECTS = spots.map((_, i) => ({ title: `Project Name ${String(i + 1).padStart(2, "0")}`, client: `Client name ${String.fromCharCode(65 + i)}` }));
  const hue = { h: 0, s: 0, l: 0 }; C.accent.getHSL(hue);
  const spotCol = spots.map((_, i) => new THREE.Color().setHSL((hue.h + i * 0.37) % 1, Math.min(1, hue.s + 0.35), 0.62));

  const FLAME = 7, fpos = [], fattr = [];
  spots.forEach((p, i) => { for (let k = 0; k < FLAME; k++) { fpos.push(p.x, p.y, p.z); fattr.push(i, k / FLAME, spotCol[i].r, spotCol[i].g, spotCol[i].b); } });
  const fgeo = new THREE.BufferGeometry();
  fgeo.setAttribute("position", new THREE.Float32BufferAttribute(fpos, 3));
  fgeo.setAttribute("meta", new THREE.Float32BufferAttribute(fattr.filter((_, j) => j % 5 < 2), 2));
  fgeo.setAttribute("tint", new THREE.Float32BufferAttribute(fattr.filter((_, j) => j % 5 >= 2), 3));
  const charge = new Float32Array(spots.length);
  const charges = spots.map(() => ({ v: 0 }));
  const flames = new THREE.Points(fgeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    uniforms: { time: { value: 0 }, px: { value: renderer.getPixelRatio() }, charge: { value: charge } },
    vertexShader: `uniform float time,px;uniform float charge[12];attribute vec2 meta;attribute vec3 tint;varying vec3 vc;varying float va,vk;
void main(){int id=int(meta.x+.5);float k=meta.y;float c=charge[id];
float life=fract(time*(.35+k*.2)+k*3.7+meta.x*.13);
vec3 p=position;bool core=k<.01;
if(!core){p.y+=life*(2.6+c*3.);p.x+=sin(life*6.28+k*20.)*.5;p.z+=cos(life*5.+k*13.)*.5;}
vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
float s=core?(30.+c*24.)*(1.+.12*sin(time*9.+meta.x)):(9.+c*6.)*(1.-life);
gl_PointSize=s*px*(140./-mv.z);vc=tint;va=core?.95:(1.-life)*.8;vk=core?1.:0.;}`,
    fragmentShader: `varying vec3 vc;varying float va,vk;void main(){vec2 q=gl_PointCoord-.5;q.y*=mix(1.,.7,vk);float d=length(q)*2.;
float core=smoothstep(.35,0.,d);float glow=smoothstep(1.,0.,d);float a=(glow*glow*.55+core*.9)*va;
gl_FragColor=vec4(mix(vc,vec3(1.),core*.55)*a,a);}`,
  }));
  scene.add(flames);

  // ── Camera rig — spherical coordinates around a target point, values always damp toward the target to follow it ──
  const rig = { yaw: 0, pitch: 22, dist: 82, tx: 0, tz: -4, zoom: 0 };
  const want = { ...rig };
  const mouse = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 };
  const place = (r) => {
    const yaw = r.yaw + (mouse.sx - 0.5) * 3.2, pitch = r.pitch + (mouse.sy - 0.5) * 1.6;
    const p = (pitch * Math.PI) / 180, y = (yaw * Math.PI) / 180;
    camera.position.set(r.tx + Math.sin(y) * Math.cos(p) * r.dist, Math.sin(p) * r.dist, r.tz + Math.cos(y) * Math.cos(p) * r.dist);
    camera.lookAt(r.tx, 1.5, r.tz);
    camera.rotateX((Math.min(4, Math.max(0, (60 - pitch) / 9)) * Math.PI) / 180);
  };
  const overview = () => { want.dist = 82 - want.zoom * 22; want.pitch = 22 + want.zoom * 14; want.tx = 0; want.tz = -4; };

  // At first — descends diagonally from a high sky where the marker is visible
  const intro = { k: 0 };
  let started = false;
  const start = (fresh) => {
    if (started) return;
    started = true;
    document.body.classList.add("is-scene-pannable");
    if (!fresh || reduce) { intro.k = 1; return; }
    gsap.fromTo(intro, { k: 0 }, { k: 1, duration: 4.2, ease: "power2.inOut" });
  };
  // As in the original, the stage is already floating behind the door — it shows as is when the door lifts
  stage.classList.add("is-on");
  window.OW.onEnter((fresh) => start(fresh));

  // ── Interaction ──
  const bodyEl = document.body;
  const cta = document.querySelector(".btn-toggle"), hint = document.querySelector(".scene-hint"), ctaWrap = document.querySelector(".cta");
  const tag = document.querySelector(".hero-tag"), bar = document.querySelector(".project-bar"), blob = document.querySelector(".project-blob");
  const pnav = document.querySelector(".project-nav"), bottom = document.querySelector(".page-bottom");
  let touched = false, active = -1, swapT = 0;
  const pageReady = () => bodyEl.classList.contains("is-ready");
  const touch = () => {
    if (touched) return;
    touched = true;
    cta.classList.remove("is-expanded");
    hint.classList.remove("is-visible");
  };
  addEventListener("ow:ready", () => {
    ctaWrap.classList.add("is-visible");
    if (!touched && active < 0) hint.classList.add("is-visible");
    if (active < 0) tag.classList.add("is-on");
  });
  // Expanded width of the folded button — measure the text width in advance
  const measure = () => { const t = cta.querySelector(".btn-toggle__text"); cta.style.setProperty("--text-width", `${t.scrollWidth + 1}px`); };
  measure(); document.fonts?.ready.then(measure);

  const setProject = (i) => {
    clearTimeout(swapT);
    const was = active;
    active = i;
    const on = i >= 0;
    blob.classList.toggle("is-visible", on);
    bottom.classList.toggle("is-project", on);
    pnav.classList.toggle("is-visible", on);
    ctaWrap.classList.toggle("is-visible", !on && pageReady());
    tag.classList.toggle("is-on", !on && pageReady());
    if (on) {
      touch();
      const p = spots[i];
      want.tx = p.x; want.tz = p.z; want.dist = 44; want.pitch = 27;
      const fill = () => {
        bar.querySelector('[data-pb="client"]').textContent = PROJECTS[i].client;
        bar.querySelector('[data-pb="title"]').textContent = PROJECTS[i].title;
        bar.classList.add("is-on");
      };
      // As in the original, when changing the nameplate, hide it first and bloom it with the new name 1s later
      if (was >= 0 && was !== i) { bar.classList.remove("is-on"); swapT = setTimeout(fill, 1000); } else fill();
      gsap.to(charges[i], { v: 1, duration: 0.6, ease: "power2.out" });
    } else {
      bar.classList.remove("is-on");
      overview();
    }
    if (was >= 0 && was !== i) gsap.to(charges[was], { v: 0, duration: 0.8, ease: "power1.inOut" });
    if (!on && was >= 0) gsap.to(charges[was], { v: 0, duration: 0.8, ease: "power1.inOut" });
  };
  // For keyboard and screen readers — one hidden button per 3D marker
  const list = document.createElement("ul");
  list.className = "marker-list"; list.dataset.slot = "marker-list";
  list.innerHTML = PROJECTS.map((p, i) => `<li><button type="button" data-marker="${i}">${p.title} View</button></li>`).join("");
  document.querySelector(".page-bottom").append(list);
  list.addEventListener("click", (e) => { const b = e.target.closest("[data-marker]"); if (b && pageReady()) setProject(+b.dataset.marker); });
  pnav.addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]");
    if (b) setProject((Math.max(0, active) + +b.dataset.step + spots.length) % spots.length);
  });
  addEventListener("keydown", (e) => {
    if (!pageReady() || active < 0) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); setProject((active + (e.key === "ArrowLeft" ? -1 : 1) + spots.length) % spots.length); }
    else if (e.key === "Escape") setProject(-1);
  });

  // Drag 40px · wheel accumulation over 40 counts as touched — fold the button and retract the hint
  let drag = null, wheelSum = 0;
  const ui = (t) => t instanceof Element && t.closest("a, button, input, .nav, .gate");
  addEventListener("pointerdown", (e) => {
    if (!pageReady() || ui(e.target)) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, moved: 0 };
    bodyEl.classList.add("is-scene-grabbing");
  });
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight;
    if (drag && drag.id === e.pointerId) {
      const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
      drag.lx = e.clientX; drag.ly = e.clientY;
      drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
      want.yaw -= dx * 0.18;
      want.pitch = Math.min(58, Math.max(14, want.pitch + dy * 0.06));
      if (drag.moved > 40) touch();
    } else if (pageReady()) {
      bodyEl.style.cursor = pick(e.clientX, e.clientY) >= 0 ? "pointer" : "";
    }
  });
  const up = (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    const click = drag.moved < 6;
    drag = null;
    bodyEl.classList.remove("is-scene-grabbing");
    if (click) { const i = pick(e.clientX, e.clientY); if (i >= 0) setProject(i); else if (active >= 0) setProject(-1); }
  };
  addEventListener("pointerup", up);
  addEventListener("pointercancel", up);
  addEventListener("wheel", (e) => {
    if (!pageReady()) return;
    wheelSum += Math.abs(e.deltaX) + Math.abs(e.deltaY);
    if (wheelSum > 40) touch();
    if (active >= 0) setProject(-1);
    want.zoom = Math.min(1, Math.max(0, want.zoom + e.deltaY * 0.0009));
    overview();
  }, { passive: true });

  const v3 = new THREE.Vector3();
  const pick = (cx, cy) => {
    let best = -1, bd = small ? 34 : 26;
    spots.forEach((p, i) => {
      v3.copy(p).project(camera);
      if (v3.z > 1) return;
      const d = Math.hypot((v3.x * 0.5 + 0.5) * innerWidth - cx, (-v3.y * 0.5 + 0.5) * innerHeight - cy);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  };

  // ── Drawing ──
  const lerpRig = (k) => { for (const key of ["yaw", "pitch", "dist", "tx", "tz"]) rig[key] += (want[key] - rig[key]) * k; };
  const view = { yaw: 0, pitch: 0, dist: 0, tx: 0, tz: 0 };
  const top = { yaw: -18, pitch: 88.5, dist: 170, tx: 0, tz: 0 };
  let last = performance.now(), t0 = last;
  const frame = () => {
    const now = performance.now(), dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
    last = now;
    const t = (now - t0) / 1000;
    const k = 1 - Math.exp(-dt * (active >= 0 ? 1.6 : 3.2));
    lerpRig(k);
    const mk = 1 - Math.exp(-dt * 2.2);
    mouse.sx += (mouse.x - mouse.sx) * mk; mouse.sy += (mouse.y - mouse.sy) * mk;
    const sway = reduce ? 0 : Math.sin(t * 0.11) * 1.4;
    for (const key in view) view[key] = top[key] + (rig[key] - top[key]) * intro.k;
    view.yaw += sway * intro.k;
    place(view);
    scene.fog.density = 0.0062 + (1 - intro.k) * 0.0035;
    mists.forEach((m) => { m.material.uniforms.time.value = t; m.material.uniforms.boost.value = (1 - intro.k) * 0.4; m.material.uniforms.fogD.value = scene.fog.density; });
    water.material.uniforms.time.value = reduce ? 0 : t;
    water.material.uniforms.fogD.value = scene.fog.density;
    flames.material.uniforms.time.value = reduce ? 0 : t;
    charges.forEach((c, i) => (charge[i] = c.v));
    renderer.render(scene, camera);
  };
  gsap.ticker.add(frame);
  document.addEventListener("visibilitychange", () => (document.hidden ? gsap.ticker.remove(frame) : gsap.ticker.add(frame)));
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  overview();
  Object.assign(rig, want);
})();
