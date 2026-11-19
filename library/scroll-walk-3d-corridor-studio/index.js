// First page — 3D corridor (our shapes, our shaders), line raise, showreel dust and enlarge view, practice text, accordion, small 3D object, robot greeting.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const AP = window.AP;

  // Practice ”Useful” — letters stand up from below one by one (.04 apart)
  const glyphs = document.querySelector(".ap-practice__glyphs");
  if (glyphs) {
    glyphs.innerHTML = [...glyphs.textContent].map((c) => `<span class="ap-glyph">${c}</span>`).join("");
    if (!reduce) {
      const gs = glyphs.querySelectorAll(".ap-glyph");
      gsap.set(gs, { yPercent: 60, rotateX: -70, opacity: 0, transformOrigin: "50% 100%" });
      ScrollTrigger.create({ trigger: glyphs, start: "top 85%", once: true, onEnter: () => gsap.to(gs, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.04 }) });
    }
  }

  // Accordion — only one opens at a time
  const caps = [...document.querySelectorAll(".ap-cap")];
  caps.forEach((cap) => cap.querySelector(".ap-cap__toggle").addEventListener("click", () => {
    const open = !cap.classList.contains("is-open");
    caps.forEach((c) => { c.classList.toggle("is-open", c === cap && open); c.querySelector(".ap-cap__toggle").setAttribute("aria-expanded", String(c === cap && open)); });
    if (open) artOn(cap.querySelector(".ap-cap__art"));
    setTimeout(() => ScrollTrigger.refresh(), 820);
  }));

  // Showreel enlarge · pause
  const full = document.querySelector(".ap-reelfull");
  document.querySelector(".ap-reel__play")?.addEventListener("click", () => full?.showModal());
  full?.querySelector(".ap-reelfull__close")?.addEventListener("click", () => full.close());
  const reelToggle = document.querySelector(".ap-reel__toggle");
  let reelPaused = false;
  reelToggle?.addEventListener("click", () => { reelPaused = !reelPaused; reelToggle.textContent = reelPaused ? "Play reel ▷" : "Pause reel Ⅱ"; });

  // Robot greeting
  const robot = document.querySelector(".ap-contact__robot");
  document.querySelector(".ap-contact__greet")?.addEventListener("click", () => { robot.classList.remove("is-waving"); void robot.offsetWidth; robot.classList.add("is-waving"); });

  // Greeting word — while visible, it switches to the next language every 3.2s. Outgoing characters go up (−65%) · −5° · 3px blur over .47s, incoming characters come from below (75%) · 7° · blur over .76s (.12s later),
  // Between characters min(22, 120/char count)ms
  const word = document.querySelector(".ap-contact__word");
  if (word && !reduce) {
    const HELLO = ["hello.", "Hello.", "hola.", "hallo.", "salut.", "ciao.", "olá.", "hoi.", "hej.", "ahoj.", "merhaba.", "こんにちは", "你好.", "salve.", "moi."];
    let k = 0, cur = null, timer = 0, seen = false;
    const make = (text) => {
      const s = document.createElement("span");
      s.className = "ap-greeting";
      [...text].forEach((c) => { const g = document.createElement("span"); g.textContent = c; s.append(g); });
      word.append(s);
      return s;
    };
    const play = (el, enter) => {
      const gs = [...el.children];
      return Promise.all(gs.map((g, i) => g.animate(
        enter
          ? [{ opacity: 0, transform: "translate3d(0,75%,0) rotate(7deg)", filter: "blur(3px)" }, { opacity: 1, transform: "none", filter: "blur(0px)" }]
          : [{ opacity: 1, transform: "none", filter: "blur(0px)" }, { opacity: 0, transform: "translate3d(0,-65%,0) rotate(-5deg)", filter: "blur(3px)" }],
        { duration: enter ? 760 : 470, delay: (enter ? 120 : 0) + i * Math.min(22, 120 / gs.length), easing: enter ? "cubic-bezier(.16,1,.3,1)" : "cubic-bezier(.5,0,.8,.4)", fill: "both" },
      ).finished.catch(() => {})));
    };
    const schedule = () => { clearTimeout(timer); timer = seen ? setTimeout(next, 3200) : 0; };
    function next() {
      timer = 0;
      if (!seen || document.hidden) return;
      const old = cur;
      k = (k + 1) % HELLO.length;
      cur = make(HELLO[k]);
      Promise.all([play(old, false), play(cur, true)]).then(() => { old.remove(); schedule(); });
    }
    word.textContent = "";
    cur = make(HELLO[0]);
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; schedule(); }, { threshold: 0.15 }).observe(word);
  }

  // Showreel dust — warm dots slowly float up and twinkle
  const dust = document.querySelector(".ap-reel__dust");
  if (dust && !reduce) {
    const ctx = dust.getContext("2d");
    const tint = css("--kf-accent-soft");
    let pts = [], w = 0, h = 0, on = false;
    const size = () => {
      const r = dust.getBoundingClientRect();
      w = dust.width = Math.round(r.width * Math.min(devicePixelRatio, 2));
      h = dust.height = Math.round(r.height * Math.min(devicePixelRatio, 2));
      pts = Array.from({ length: 220 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + 0.4, v: Math.random() * 0.4 + 0.1, p: Math.random() * 6.28 }));
    };
    new ResizeObserver(size).observe(dust);
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(dust);
    gsap.ticker.add((t) => {
      if (!on || reelPaused) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = tint;
      for (const p of pts) {
        p.y -= p.v; p.x += Math.sin(t + p.p) * 0.2;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + p.p);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    });
  }

  if (!window.THREE) return;
  const T = THREE;
  const accent = new T.Color(css("--kf-accent"));
  const accentSoft = new T.Color(css("--kf-accent-soft"));
  const night = new T.Color(css("--kf-contrast-bg"));
  const paper = new T.Color(css("--kf-contrast-ink"));
  const ink = new T.Color(css("--kf-ink"));

  // Environment for the metal to reflect — a room holding a few warm light panels, baked with PMREM (our own)
  const makeEnv = (renderer) => {
    const room = new T.Scene();
    room.background = night.clone().multiplyScalar(0.6);
    const panel = (c, s, x, y, z) => { const m = new T.Mesh(new T.PlaneGeometry(s, s), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); room.add(m); };
    panel(accentSoft.clone().multiplyScalar(3), 6, 0, 8, 0);
    panel(accent.clone().multiplyScalar(2), 5, 8, 2, 3);
    panel(paper.clone().multiplyScalar(1.6), 4, -7, 3, -4);
    panel(paper.clone().multiplyScalar(0.8), 8, 0, -2, -9);
    const pm = new T.PMREMGenerator(renderer);
    const env = pm.fromScene(room, 0.04).texture;
    pm.dispose();
    return env;
  };
  const logoShape = () => {
    const s = new T.Shape();
    s.moveTo(0, 1.1); s.lineTo(1.05, -0.62); s.lineTo(0.48, -0.62); s.lineTo(0, 0.2); s.lineTo(-0.48, -0.62); s.lineTo(-1.05, -0.62); s.closePath();
    return s;
  };

  // ───── 3D corridor ─────
  // The camera path follows the original story keys: scroll share → story progress l (the first .627 share runs up to .94, the rest is the final flight into the logo ring)
  // → path progress c (monotonic cubic keys) → portal-relative local coordinate curve · arrival flight · final flight. Shapes stay in their original spots (portal [4.45,−.08,0] · platform [3,−3.58,−51] ·
  // Character [3,−3.58,−48], small leaf ring [4.55,−1.45,−47.7], logo ring [1.9,−.9,−57.5]) set up with our own shapes.
  const clamp01 = (x) => Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0));
  const smoother = (x) => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
  const smooth3 = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const win = (v, a, b) => smoother((v - a) / (b - a));
  const win3 = (v, a, b) => smooth3((v - a) / (b - a));
  const mix = (a, b, t) => a + (b - a) * t;
  // Cubic interpolation that doesn’t overshoot between keys — tangent is the weighted harmonic mean of neighbor slopes, 0 at kinked keys
  const keys = (pts, x) => {
    const n = pts.length, h = [], d = [];
    for (let k = 0; k < n - 1; k++) { h.push(pts[k + 1][0] - pts[k][0]); d.push((pts[k + 1][1] - pts[k][1]) / h[k]); }
    const m = pts.map((_, k) => {
      if (k === 0 || k === n - 1 || d[k - 1] * d[k] <= 0) return 0;
      const w1 = 2 * h[k] + h[k - 1], w2 = h[k] + 2 * h[k - 1];
      return (w1 + w2) / (w1 / d[k - 1] + w2 / d[k]);
    });
    let k = 0;
    while (k < n - 2 && x > pts[k + 1][0]) k++;
    const t = clamp01((x - pts[k][0]) / h[k]), t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * pts[k][1] + (t3 - 2 * t2 + t) * h[k] * m[k] + (-2 * t3 + 3 * t2) * pts[k + 1][1] + (t3 - t2) * h[k] * m[k + 1];
  };
  const ROUTE = [[0, 0], [0.025, 0.07], [0.12, 0.26], [0.24, 0.49], [0.285, 0.56], [0.44, 0.66], [0.6, 0.755], [0.67, 0.797], [0.73, 0.86], [0.91, 0.96], [1, 1]];
  const isPhone = () => innerWidth < 761;
  const storyOf = (s, phone) => { const a = phone ? 3.8 : 4, cut = (0.94 * a) / (a + 2); s = clamp01(s); return s <= cut ? (s * (a + 2)) / a : mix(0.94, 1, (s - cut) / (1 - cut)); };
  const scrollOf = (l, phone) => { const a = phone ? 3.8 : 4; l = clamp01(l); return l <= 0.94 ? (l * a) / (a + 2) : mix((0.94 * a) / (a + 2), 1, (l - 0.94) / 0.06); };
  const STORY_AT = { top: 0, pieces: 0.24, passage: 0.49, connection: 0.91 };
  const BEATS = [
    { id: "connect", start: 0.29, enterEnd: 0.33, leaveStart: 0.38, end: 0.425 },
    { id: "automate", start: 0.425, enterEnd: 0.465, leaveStart: 0.515, end: 0.56 },
    { id: "human", start: 0.56, enterEnd: 0.6, leaveStart: 0.65, end: 0.675 },
  ];

  const journey = document.querySelector(".ap-journey");
  const canvas = journey?.querySelector(".ap-stage__canvas");
  if (journey && canvas) {
        const V = (x, y, z) => new T.Vector3(x, y, z);
    const TILT = [0.018, -0.18, 0.015];
    const rotate = (v, a) => v.applyEuler(new T.Euler(a[0], a[1], a[2], "XYZ"));
    const unrotate = (v, a) => v.applyEuler(new T.Euler(-a[0], -a[1], -a[2], "ZYX"));
    const pose = (l, phone, vw, vh) => {
      const c = keys(ROUTE, l);
      const tall = vw < vh, tablet = tall && !phone;
      const squeeze = phone && tall ? 1 - win(vh, 560, 760) : 0;
      const short = tall ? 0 : 1 - win(vh, 390, 600);
      const start = tall ? V(8.2, 3.8, 22.5 + squeeze * 7.5) : V(8.8, 1.5, 17.3 + short * 5);
      const aim = tall ? V(2.8, phone ? -2.3 - squeeze * 1.2 : -3, 0) : V(-0.85, 0.45 - short * 1.3, 0);
      const portal = tall ? V(3.1, -0.08, 0) : V(4.45, -0.08, 0);
      const tilt = TILT.map((v) => v * (1 - win(c, 0.1, 0.34)));
      const s0 = unrotate(start.clone().sub(portal), TILT);
      const d0 = unrotate(aim.clone().sub(start), TILT).normalize();
      const local = V(
        keys([[0, s0.x], [0.07, s0.x], [0.24, 1.15], [0.4, 0], [0.86, 0], [1, 0.8]], c),
        keys([[0, s0.y], [0.07, s0.y], [0.26, 0.1], [0.4, -0.35], [0.86, -0.35], [1, -0.12]], c),
        keys([[0, s0.z], [0.07, s0.z], [0.24, 13], [0.4, 7], [0.53, 2.4], [0.7, -12], [0.86, -28], [1, -38.5]], c),
      );
      let pos = rotate(local, tilt).add(portal);
      const dir = rotate(d0.lerp(V(0, 0, -1), win(c, 0.07, 0.36)).normalize(), tilt);
      let target = pos.clone().addScaledVector(dir, 10).lerp(tall ? V(3, -2.45 - squeeze * 1.75, -48) : V(0, -1.15, -48), win(c, 0.86, 1));
      let fov = mix(phone ? 44 : 42, 40, win(c, 0.1, 0.32)) + 5 * win(c, 0.44, 0.65) - 3 * win(c, 0.85, 1);
      // Arrival — exit the tunnel, swing wide to the right, and land toward the figure on the stage
      const sq = tall ? 1 - win(vh, 560, 760) : 0;
      const ax = keys([[0.73, tall ? 3.1 : 4.45], [0.785, tall ? 4.55 : 6.45], [0.825, tall ? 4.4 : 6.6], [0.91, tall ? 3.8 : 4.5]], l);
      const ay = keys([[0.73, -0.43], [0.785, -0.04], [0.835, -0.08], [0.91, -0.25]], l);
      const az = keys([[0.73, -28], [0.785, -35.2], [0.835, tablet ? -38.2 : tall ? -38.6 + sq * 1.6 : -39], [0.875, tablet ? -38.7 : tall ? -40.1 + sq * 2 : -40.7], [0.91, tablet ? -38.9 : tall ? -40.25 + sq * 2 : -41.15]], l);
      const lookArr = V(keys([[0.73, 3], [0.8, 3], [0.91, tall ? 3 : 0.9]], l), keys([[0.73, -1.2], [0.8, -1.45], [0.91, tablet ? -3.05 : tall ? -2.9 - sq * 0.95 : -1.95]], l), -48);
      const arrive = win(l, 0.73, 0.79);
      pos.lerp(V(ax, ay, az), arrive);
      target.lerp(lookArr, arrive);
      fov = mix(fov, tablet ? 38.5 : tall ? 37.5 + sq * 1.5 : 36, win(l, 0.79, 0.91));
      // Last flight — loops wide around the logo ring and then into its center
      const wide = tall && vw > 760;
      const sig = V(wide ? 5 : tall ? 3.35 + sq * 0.25 : 1.9, tall ? -1.58 + sq * 0.2 : -0.9, -57.5);
      const D = clamp01((l - 0.94) / 0.06);
      if (D > 0) {
        pos = V(
          keys([[0, ax], [0.3, tall ? 6.8 : 7.5], [0.58, sig.x + 2.1], [1, sig.x + 0.06]], D),
          keys([[0, ay], [0.3, 0.12], [0.64, sig.y + 0.18], [1, sig.y]], D),
          keys([[0, az], [0.3, -46], [0.62, -52.8], [1, sig.z + 0.32]], D),
        );
        target = lookArr.clone().lerp(sig, win(D, 0, 0.38));
        fov = mix(fov, 43, win(D, 0.3, 0.86));
      }
      return {
        l, c, pos, target, fov, portal, tilt, sig, sigScale: tall ? 0.305 - sq * 0.035 : 0.61, D,
        charge: win(D, 0.06, 0.76), reveal: win(D, 0.82, 0.995),
        reach: win(c, 0.59, 0.83), interior: win(c, 0.48, 0.57) * (1 - win(c, 0.79, 0.89)), plasma: 1 - win(c, 0.47, 0.59),
        exitOpen: win(l, 0.615, 0.69), actor: win(c, 0.64, 0.67), actorYaw: mix(0.55, -0.18, win(l, 0.68, 0.79)), leaves: win(l, 0.735, 0.785),
        light: mix(mix(0.58, 0.16, win(c, 0.43, 0.59)), 0.96, win(c, 0.79, 0.92)),
      };
    };

    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const scene = new T.Scene();
    scene.environment = makeEnv(renderer);
    const camera = new T.PerspectiveCamera(42, 1, 0.05, 400);

    // Sky — our shader sphere blending from evening (outside) and night (inside the passage) to a cloudy day (beyond)
    const sky = new T.Mesh(new T.SphereGeometry(220, 48, 24), new T.ShaderMaterial({
      side: T.BackSide, depthWrite: false,
      uniforms: { uDay: { value: 0 }, uTime: { value: 0 }, uNight: { value: night }, uTop: { value: new T.Color().setHSL(0.57, 0.42, 0.6) }, uLow: { value: paper.clone() }, uSun: { value: accentSoft } },
      vertexShader: "varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: `uniform float uDay,uTime;uniform vec3 uNight,uTop,uLow,uSun;varying vec3 vP;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
        void main(){float y=vP.y;vec3 day=mix(uLow,uTop,smoothstep(-.05,.6,y));
          vec2 q=vP.xz/(abs(y)+.25)*1.4+vec2(uTime*.01,0.);float c=smoothstep(.38,.78,fbm(q))*smoothstep(-.1,.25,y)*(1.-smoothstep(.55,.9,y));
          float sea=smoothstep(.3,.75,fbm(q*.7-vec2(uTime*.006,0.)))*(1.-smoothstep(-.02,-.3,-y));
          day=mix(day,uLow*1.06,max(c*.85,sea*.7));day+=uSun*pow(max(dot(vP,normalize(vec3(.4,.35,-1.))),0.),24.)*.6;
          vec3 col=mix(uNight*(.6+.4*smoothstep(-.4,.6,y)),day,uDay);gl_FragColor=vec4(col,1.);}`,
    }));
    scene.add(sky);

    // Portal — 40 thin rounded-rectangle metal blades overlap tightly at depth 5.24 (from outside they read as one thick frame).
    // Each day’s width and height swell in the middle (sin), grow slightly toward the back and tilt askew
    const portal = new T.Group();
    scene.add(portal);
    const rrPts = (w, h, r, skew, dy, seg = 6) => {
      const pts = [];
      const corners = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, Math.PI * 1.5]];
      for (const [cx, cy, a0] of corners) for (let s = 0; s <= seg; s++) {
        const a = a0 + (s / seg) * (Math.PI / 2), y = cy + Math.sin(a) * r;
        pts.push(new T.Vector2(cx + Math.cos(a) * r + y * skew, y + dy));
      }
      return pts;
    };
    const dark = new T.MeshStandardMaterial({ color: accent.clone().lerp(night, 0.55), metalness: 0.78, roughness: 0.37, envMapIntensity: 0.72 });
    const bright = new T.MeshStandardMaterial({ color: accent.clone().lerp(paper, 0.25), metalness: 0.86, roughness: 0.3, envMapIntensity: 0.88 });
    const inlay = new T.MeshStandardMaterial({ color: accentSoft, metalness: 0.7, roughness: 0.32, emissive: accentSoft, emissiveIntensity: 0.2 });
    const LEAVES = 40, lamellae = [];
    for (let e = 0; e < LEAVES; e++) {
      const n = e / (LEAVES - 1), r = Math.sin(n * Math.PI);
      const w = 5.65 + r * 0.73 + n * 0.28, h = 6.93 + r * 0.54 + n * 0.12, skew = 0.18 - n * 0.3 + Math.sin(n * Math.PI * 2) * 0.045, depth = 0.103 + r * 0.025;
      const shape = new T.Shape(rrPts(w, h, 1.05 + 0.12 * Math.sin(e * 0.16), skew, h / 2 - 3.47));
      shape.holes.push(new T.Path(rrPts(4.12, 5.96, 0.62, 0, Math.cos(e * 0.17) * 0.018)));
      const geo = new T.ExtrudeGeometry(shape, { depth: depth - 0.07, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 2, curveSegments: 1 });
      geo.translate(0, 0, -(depth - 0.07) / 2);
      const m = new T.Mesh(geo, e % 8 === 3 ? inlay : e % 3 === 1 ? bright : dark);
      m.position.set((n - 0.5) * 0.18, 0, 2.62 - n * 5.24);
      m.userData.station = e;
      portal.add(m);
      lamellae.push(m);
    }
    const pLight = new T.PointLight(accentSoft, 40, 14, 1.6);
    scene.add(pLight);
    // Flowing liquid film in two sheets: the portal’s trailing edge (clears while passing .47~.59) and the passage end (opening l .615~.69), with curving flowing contour lines (our shader)
    const liquidMat = () => new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uAlpha: { value: 1 }, uA: { value: night.clone().multiplyScalar(0.5) }, uB: { value: paper }, uC: { value: accent } },
      vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: `uniform float uTime,uAlpha;uniform vec3 uA,uB,uC;varying vec2 vUv;
        float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
        void main(){vec2 p=vUv*3.;float t=uTime*.15;vec2 q=vec2(n(p+t),n(p+vec2(5.2,1.3)-t));vec2 r=vec2(n(p+4.*q+vec2(1.7,9.2)+t*.6),n(p+4.*q+vec2(8.3,2.8)));
        float v=n(p+4.*r);float lines=abs(fract(v*7.)-.5);float l=smoothstep(.08,.0,lines);
        vec2 b=abs(vUv-.5)*vec2(4.12,5.96)-vec2(2.06-.62,2.98-.62);float edge=length(max(b,0.))-.62;
        float open=smoothstep(uAlpha,uAlpha+.25,n(vUv*5.+t)*.75+.25*(1.-uAlpha));
        vec3 col=mix(uA,uC*.55,v)+uB*l*.75;gl_FragColor=vec4(col,(1.-smoothstep(-.02,0.,edge))*(1.-open));}`,
    });
    const portalPlasma = new T.Mesh(new T.PlaneGeometry(4.12, 5.96), liquidMat());
    portalPlasma.position.set(0, 0, -2.64);
    portal.add(portalPlasma);
    // Passage — a hollow wall (thin frames layered) trailing behind the blade, with an exit curtain at the end
    const corridor = new T.Group();
    portal.add(corridor);
    const shellMat = new T.MeshStandardMaterial({ color: night.clone().lerp(accent, 0.12), metalness: 0.64, roughness: 0.43, envMapIntensity: 0.48, transparent: true, opacity: 0 });
    const ribGeo = (() => { const s = new T.Shape(rrPts(5.2, 7.1, 0.9, 0, 0)); s.holes.push(new T.Path(rrPts(4.3, 6.1, 0.66, 0, 0))); return new T.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false, curveSegments: 1 }); })();
    for (let z = -3.1; z > -24; z -= 0.86) { const m = new T.Mesh(ribGeo, shellMat); m.position.z = z; corridor.add(m); }
    const exitPlasma = new T.Mesh(new T.PlaneGeometry(4.12, 5.96), liquidMat());
    exitPlasma.position.z = -24.2;
    corridor.add(exitPlasma);
    // The wet floor the portal stands on — a dark metal plate dimly reflecting the sky (portal front only)
    const ground = new T.Mesh(new T.PlaneGeometry(400, 200), new T.MeshStandardMaterial({ color: night, metalness: 0.75, roughness: 0.32 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -3.55, 97);
    scene.add(ground);

    // Beyond — just three stones above the clouds (ellipses), six-branch arch, figure, small leaf ring
    const world = new T.Group();
    scene.add(world);
    const stone = new T.MeshStandardMaterial({ color: paper, metalness: 0.12, roughness: 0.39, envMapIntensity: 0.8 });
    const trim = new T.MeshStandardMaterial({ color: accentSoft, metalness: 0.84, roughness: 0.28, envMapIntensity: 1.1 });
    const terrace = (x, y, z, rx, rz, depth, mat = stone) => {
      const m = new T.Mesh(new T.CylinderGeometry(1, 1, depth, 128), mat);
      m.scale.set(rx, 1, rz);
      m.position.set(x, y - depth / 2, z);
      world.add(m);
      return m;
    };
    terrace(3, -3.58, -51, 15.5, 12.5, 0.775);
    terrace(3, -3.58 + 0.01, -51, 14.8, 11.8, 0.02, trim);
    terrace(3, -4.62, -51, 13.6, 10.9, 0.32);
    terrace(-19, -7.6, -72, 22, 15, 1.15);
    terrace(24, -12, -105, 31, 20, 2);
    const ribs = new T.Group();
    ribs.position.set(5, -12, -83);
    ribs.rotation.y = -0.24;
    world.add(ribs);
    for (let e = 0; e < 6; e++) {
      const rx = 25 + e * 0.5, ry = 20 + e * 0.45, band = 0.82, a0 = 0.025, a1 = Math.PI - 0.025, s = new T.Shape();
      for (let k = 0; k <= 48; k++) { const a = a0 + ((a1 - a0) * k) / 48; s[k ? "lineTo" : "moveTo"](Math.cos(a) * rx, Math.sin(a) * ry); }
      for (let k = 48; k >= 0; k--) { const a = a0 + ((a1 - a0) * k) / 48; s.lineTo(Math.cos(a) * (rx - band), Math.sin(a) * (ry - band)); }
      const m = new T.Mesh(new T.ExtrudeGeometry(s, { depth: 1.15, bevelEnabled: true, bevelSize: 0.16, bevelThickness: 0.16, bevelSegments: 3, curveSegments: 12 }), e % 2 ? trim : stone);
      m.position.z = -e * 3.2;
      ribs.add(m);
    }
    const body = new T.MeshStandardMaterial({ color: ink.clone().multiplyScalar(0.55), metalness: 0.25, roughness: 0.6 });
    const man = new T.Group();
    const part = (geo, x, y, z, rz = 0) => { const m = new T.Mesh(geo, body); m.position.set(x, y + 0.455, z); m.rotation.z = rz; man.add(m); return m; };
    part(new T.SphereGeometry(0.22, 24, 16), 0, 1.78, 0).scale.set(0.9, 1.1, 1);
    part(new T.CapsuleGeometry(0.28, 0.55, 6, 16), 0, 1.25, 0);
    part(new T.CapsuleGeometry(0.2, 0.2, 6, 12), 0, 0.88, 0);
    [-1, 1].forEach((s) => {
      part(new T.CapsuleGeometry(0.075, 0.5, 6, 10), s * 0.36, 1.18, 0, s * 0.12);
      part(new T.CapsuleGeometry(0.065, 0.45, 6, 10), s * 0.42, 0.72, 0.03, s * 0.05);
      part(new T.CapsuleGeometry(0.1, 0.55, 6, 10), s * 0.12, 0.42, 0);
      part(new T.CapsuleGeometry(0.085, 0.5, 6, 10), s * 0.13, -0.12, 0);
    });
    man.scale.setScalar(0.72);
    man.position.set(3, -3.58, -48);
    world.add(man);
    const smallRing = new T.Group();
    smallRing.add(new T.Mesh(new T.TorusGeometry(0.62, 0.05, 12, 64), trim));
    const smallLogo = new T.Mesh(new T.ExtrudeGeometry(logoShape(), { depth: 0.08, bevelEnabled: false }), trim);
    smallLogo.scale.setScalar(0.32);
    smallRing.add(smallLogo);
    smallRing.position.set(3 + 1.55, -3.58 + 2.13, -48 + 0.28);
    world.add(smallRing);
    const sun = new T.DirectionalLight(paper, 2.4);
    sun.position.set(6, 12, 8);
    const hemi = new T.HemisphereLight(paper, accent, 0.9);
    scene.add(sun, hemi);

    // Logo rings — three gold rings around the logo mark (original size .61, portrait screen .305)
    const signal = new T.Group();
    scene.add(signal);
    const gold = new T.MeshStandardMaterial({ color: accent, metalness: 1, roughness: 0.18 });
    const markMat = new T.MeshStandardMaterial({ color: paper, metalness: 0.45, roughness: 0.28, emissive: accentSoft, emissiveIntensity: 0.12 });
    const logo = new T.Mesh(new T.ExtrudeGeometry(logoShape(), { depth: 0.24, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 }), markMat);
    logo.geometry.center();
    logo.scale.setScalar(0.9);
    signal.add(logo);
    const rings = [0, 1, 2].map((i) => { const m = new T.Mesh(new T.TorusGeometry(2 + i * 0.3, 0.06 + i * 0.015, 20, 180), gold); m.rotation.set(1.2 + i * 0.5, i * 0.7, 0); signal.add(m); return m; });
    signal.rotation.set(0.12, -0.32, -0.18);

    // Section text — overlay inside the stage. Switches on per progress window and the lines rise from below (112%)
    const L = { hero: journey.querySelector(".ap-copy--hero"), pieces: journey.querySelector(".ap-copy--pieces"), connection: journey.querySelector(".ap-copy--connection") };
    const beats = BEATS.map((b) => ({ ...b, el: journey.querySelector(`[data-beat="${b.id}"]`) })).filter((b) => b.el);
    journey.querySelectorAll(".ap-copy [data-split]").forEach((el) => { el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((p) => `<span class="ap-line"><span>${p.trim()}</span></span>`).join(""); });
    const linesOf = new Map();
    const show = (el, op, enter = 1, leave = 0) => {
      if (!el) return;
      let ls = linesOf.get(el);
      if (!ls) { ls = [...el.querySelectorAll(".ap-line > span")]; linesOf.set(el, ls); }
      el.style.opacity = op.toFixed(4);
      el.classList.toggle("is-current", op > 0.1);
      el.inert = op < 0.03;
      ls.forEach((s, i) => { s.style.transform = `translate3d(0,${((1 - smooth3(enter * 1.16 - i * 0.14)) * 112 - leave * 28).toFixed(3)}%,0)`; });
    };
    const topline = journey.querySelector(".ap-stage__topline"), shade = journey.querySelector(".ap-stage__shade"), bottom = journey.querySelector(".ap-stage__bottom");
    const invite = journey.querySelector(".ap-stage__invite");
    const chapterLinks = [...journey.querySelectorAll(".ap-stage__chapters a")];
    const track = journey.querySelector(".ap-stage__track");
    const next = journey.nextElementSibling;
    let lastCopy = -1, lastIntro = -1;
    const copy = (l, intro) => {
      if (l === lastCopy && intro === lastIntro) return;
      lastCopy = l; lastIntro = intro;
      const r = win3(intro, 0.28, 0.94), i = win3(l, 0.025, 0.115);
      show(L.hero, r * (1 - i), r, i);
      show(L.pieces, 0, 0, 0);
      const a = win3(l, 0.815, 0.905), o = win3(l, 0.936, 0.951);
      show(L.connection, a * (1 - o), a, o);
      beats.forEach((b) => {
        const e = win3(l, b.start, b.enterEnd), x = win3(l, b.leaveStart, b.end);
        show(b.el, e * (1 - x), e, x);
        b.el.style.transform = `translateY(${((1 - e) * 24 - x * 32).toFixed(2)}px) scale(${(0.93 + e * 0.07 + x * 0.055).toFixed(4)})`;
      });
      if (topline) topline.style.opacity = (r * (1 - i)).toFixed(4);
      if (shade) shade.style.opacity = (1 - win3(l, 0.16, 0.27)).toFixed(4);
      const late = l > 0.76;
      if (invite && invite.dataset.late !== String(late)) { invite.dataset.late = String(late); invite.setAttribute("href", late ? "#work" : "#pieces"); invite.firstChild.textContent = `${late ? "Discover the reel" : "Scroll to reveal"} `; }
      // The bottom row clears all at once upon entering the last flight (the original auto-plays the flight, passing .94–.955 in one go)
      const u = l >= 0.9475 ? 1 : 0;
      if (bottom) { bottom.style.opacity = String(1 - u); bottom.inert = u > 0; }
      const ch = l < 0.28 ? 0 : l < 0.74 ? 1 : 2;
      chapterLinks.forEach((el, k) => el.classList.toggle("is-active", k === ch));
      track?.style.setProperty("--progress", l.toFixed(4));
      journey.classList.toggle("is-day", l > 0.667);
    };

    const look = new T.Vector3();
    const ptr = { x: 0, y: 0 };
    const project = new T.Vector3();
    const place = (P, t, intro, phone) => {
      sky.material.uniforms.uDay.value = Math.max(0.55 * (1 - win(P.c, 0.2, 0.45)), P.reach);
      sky.material.uniforms.uTime.value = t;
      portal.position.copy(P.portal);
      portal.rotation.set(P.tilt[0], P.tilt[1], P.tilt[2]);
      portal.visible = P.c < 0.9;
      lamellae.forEach((m) => { m.position.y = Math.sin(t * 0.27 + m.userData.station * 0.41) * 0.0035; });
      portalPlasma.visible = P.plasma > 0.001;
      portalPlasma.material.uniforms.uAlpha.value = P.plasma;
      corridor.visible = P.interior > 0.001;
      shellMat.opacity = P.interior;
      exitPlasma.material.uniforms.uAlpha.value = 1 - P.exitOpen;
      portalPlasma.material.uniforms.uTime.value = exitPlasma.material.uniforms.uTime.value = t;
      ground.visible = P.c < 0.62;
      world.visible = P.reach > 0.001;
      man.visible = smallRing.visible = P.actor > 0.001;
      man.rotation.y = P.actorYaw;
      smallRing.rotation.y = t * 0.6;
      smallRing.scale.setScalar(0.85 + 0.15 * P.leaves);
      signal.visible = P.reach > 0.5;
      signal.position.copy(P.sig);
      signal.scale.setScalar(P.sigScale);
      rings.forEach((r, i) => { r.rotation.z = t * (0.18 + i * 0.07) * (i % 2 ? -1 : 1) + P.charge * (i + 1) * 0.8; r.rotation.x = 1.2 + i * 0.5 + Math.sin(t * 0.3 + i) * 0.1; });
      logo.rotation.y = Math.sin(t * 0.4) * 0.35;
      sun.intensity = 0.5 + P.light * 2.4;
      hemi.intensity = 0.1 + P.light * 0.9;
      // Before entering — during the 2.65s entry the camera glides in from behind (1.4,.4,1.8) (only within the first .12 of progress)
      const glide = (1 - intro) * (1 - win3(P.l, 0, 0.12));
      camera.position.copy(P.pos).add(V(1.4 * glide, 0.4 * glide, 1.8 * glide));
      // Cursor parallax — fades out between path progress .08 and .32
      const M = (1 - win3(P.c, 0.08, 0.32)) * (phone ? 0.025 : 0.12);
      camera.position.x += ptr.x * M;
      camera.position.y -= ptr.y * M * 0.4;
      look.copy(P.target);
      camera.lookAt(look);
      if (Math.abs(camera.fov - P.fov) > 1e-4) { camera.fov = P.fov; camera.updateProjectionMatrix(); }
      pLight.position.copy(camera.position).add(V(0, 0.6, -1.5));
      pLight.intensity = 40 * (1 - P.reach);
      // When the circle is fully open, remove the stage — after that only the Showreel section remains
      stage.classList.toggle("is-finale-hidden", P.reveal >= 1);
      // The next section (showreel) opens as a circle from the center of the logo ring
      if (next) {
        const on = P.D > 0.65;
        if (!on) { next.style.clipPath = ""; next.style.transform = ""; }
        else {
          const lift = Math.max(0, journey.getBoundingClientRect().bottom - innerHeight);
          next.style.transform = lift > 0.1 ? `translate3d(0,${-lift}px,0)` : "";
          if (P.reveal >= 1) next.style.clipPath = "";
          else {
            camera.updateMatrixWorld();
            project.copy(P.sig).project(camera);
            const cx = (project.x * 0.5 + 0.5) * innerWidth, cy = (1 - (project.y * 0.5 + 0.5)) * innerHeight;
            next.style.clipPath = `circle(${(P.reveal * Math.hypot(innerWidth, innerHeight) * 1.2).toFixed(2)}px at ${cx.toFixed(2)}px ${cy.toFixed(2)}px)`;
          }
        }
      }
    };

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(canvas);
    resize();
    const stage = journey.querySelector(".ap-stage");
    const span = () => Math.max(1, journey.offsetHeight - stage.clientHeight);
    const rawStory = () => storyOf(-journey.getBoundingClientRect().top / span(), isPhone());
    let X = rawStory(), intro = reduce ? 1 : 0, introClock = 0, introOn = reduce;
    AP.whenReady?.(() => { introOn = true; });
    place(pose(X, isPhone(), innerWidth, innerHeight), 0, 1, isPhone());
    renderer.compile(scene, camera);
    // Precompile the last flight scene too — so it doesn’t stall on first touch
    place(pose(0.97, isPhone(), innerWidth, innerHeight), 0, 1, isPhone());
    renderer.compile(scene, camera);
    place(pose(X, isPhone(), innerWidth, innerHeight), 0, intro, isPhone());

    let visible = true, paused = reduce, clock = 0, lastNow = performance.now();
    const aim = { x: 0, y: 0 };
    const reset = () => { aim.x = 0; aim.y = 0; };
    addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { aim.x = (e.clientX / innerWidth - 0.5) * 2; aim.y = (e.clientY / innerHeight - 0.5) * 2; } else reset(); }, { passive: true });
    addEventListener("pointerout", (e) => { if (!e.relatedTarget) reset(); });
    addEventListener("blur", reset);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(journey);
    const pauseBtn = journey.querySelector(".ap-stage__pause");
    pauseBtn?.addEventListener("click", () => {
      paused = !paused;
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.firstElementChild.textContent = paused ? "Play motion" : "Pause motion";
    });
    gsap.ticker.add(() => {
      const now = performance.now();
      const dt = Math.max(0, Math.min(0.05, (now - lastNow) / 1000));
      lastNow = now;
      if (introOn && intro < 1) { introClock += dt; intro = Math.max(intro, smooth3(introClock / 2.65)); }
      // Progress smoothing — follows with .065s damping only in the middle range (l .14~.94) (both ends follow scroll as is)
      const target = rawStory();
      const w = Math.abs(target - X) < 0.08 ? win3(target, 0.14, 0.22) * (1 - win3(target, 0.9, 0.94)) : 0;
      const damped = X + (target - X) * (1 - Math.exp(-dt / 0.065));
      X = target + (damped - target) * w;
      if (Math.abs(X - target) < 1e-4) X = target;
      if (X > 0.025) intro = 1;
      copy(X, intro);
      if (!visible) {
        if (next && (next.style.clipPath || next.style.transform)) { next.style.clipPath = ""; next.style.transform = ""; }
        return;
      }
      if (!paused) {
        clock += dt;
        const k = 1 - Math.exp(-dt * 7);
        ptr.x += (aim.x - ptr.x) * k;
        ptr.y += (aim.y - ptr.y) * k;
      }
      const phone = isPhone();
      place(pose(X, phone, innerWidth, innerHeight), clock, intro, phone);
      renderer.render(scene, camera);
    });
    // Section names and guide links — scroll to the original progress positions (top 0·pieces .24·passage .49·connection .91)
    const goStory = (l) => {
      const y = journey.offsetTop + span() * scrollOf(l, isPhone());
      AP.lenis ? AP.lenis.scrollTo(y) : scrollTo(0, y);
    };
    journey.querySelectorAll('a[href="#top"], a[href="#pieces"], a[href="#passage"], a[href="#connection"]').forEach((a) => a.addEventListener("click", (e) => {
      const key = a.getAttribute("href").slice(1);
      if (!(key in STORY_AT)) return;
      e.preventDefault();
      goStory(STORY_AT[key]);
    }));
  }

  // ───── Practice small 3D object — draws only the one open cell ─────
  let art = null;
  function artOn(cv) {
    if (!cv || !window.THREE) return;
    art?.dispose();
    const renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = T.ACESFilmicToneMapping;
    const scene = new T.Scene();
    scene.environment = makeEnv(renderer);
    const cam = new T.PerspectiveCamera(30, 4 / 3, 0.1, 50);
    cam.position.set(0, 0.6, 7);
    cam.lookAt(0, 0, 0);
    const chrome = new T.MeshStandardMaterial({ color: paper, metalness: 1, roughness: 0.15 });
    const brass = new T.MeshStandardMaterial({ color: accentSoft, metalness: 1, roughness: 0.25 });
    const g = new T.Group();
    const kind = +cv.dataset.art;
    if (kind === 0) {
      g.add(new T.Mesh(new T.SphereGeometry(0.9, 48, 32), chrome));
      for (let i = 0; i < 3; i++) { const r = new T.Mesh(new T.TorusGeometry(1.35 + i * 0.25, 0.05, 12, 120), brass); r.rotation.set(1.1 + i * 0.6, i * 0.9, 0); g.add(r); }
    } else if (kind === 1) {
      for (let i = 0; i < 4; i++) { const p = new T.Mesh(new T.BoxGeometry(2.2, 1.4, 0.06), i % 2 ? brass : chrome); p.position.set(i * 0.25 - 0.4, i * 0.12 - 0.2, -i * 0.5); p.rotation.y = -0.5; g.add(p); }
    } else {
      for (let i = 0; i < 5; i++) { const b = new T.Mesh(new T.BoxGeometry(0.7, 0.7, 0.7), i % 2 ? brass : chrome); b.position.set(Math.cos(i * 1.256) * 1.3, Math.sin(i * 1.256) * 0.4, Math.sin(i * 1.256) * 1.3); b.rotation.set(i, i * 0.5, 0); g.add(b); }
      g.add(new T.Mesh(new T.TorusGeometry(1.4, 0.04, 12, 120), brass));
    }
    scene.add(g, new T.DirectionalLight(paper, 2));
    const size = () => { renderer.setSize(cv.clientWidth, cv.clientHeight, false); cam.aspect = cv.clientWidth / Math.max(1, cv.clientHeight); cam.updateProjectionMatrix(); };
    size();
    renderer.compile(scene, cam);
    const tick = (t) => { if (!reduce) { g.rotation.y = t * 0.35; g.rotation.x = Math.sin(t * 0.5) * 0.15; } renderer.render(scene, cam); };
    gsap.ticker.add(tick);
    art = { dispose: () => { gsap.ticker.remove(tick); renderer.dispose(); } };
  }
  artOn(document.querySelector(".ap-cap.is-open .ap-cap__art"));
})();
