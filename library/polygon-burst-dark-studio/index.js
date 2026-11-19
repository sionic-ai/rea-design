// First page — one background WebGL (silk folds·cursor triangle grid·triangle-faced bead·geodesic sphere·chrome emblem), white section triangle opening, scroll choreography per section
(() => {
  const root = document.documentElement;
  const css = getComputedStyle(root);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const site = window.apSite;
  const color = (name) => { const t = css.getPropertyValue(name).trim(); return t ? new THREE.Color(t) : new THREE.Color(0.5, 0.5, 0.5); };
  const ink = color("--kf-ink"), bg = color("--kf-bg"), paper = color("--kf-contrast-bg"), paperInk = color("--kf-contrast-ink");

  // ── Text: when title words leave they rise from below with 1.1s power4.out (.08s per line), and faded lines rise from 18px below over .8s
  document.querySelectorAll(".ap-mask").forEach((m) => {
    const inner = document.createElement("span");
    inner.className = "ap-mask__in";
    inner.append(...m.childNodes);
    m.append(inner);
  });
  const rise = (host) => {
    const ins = [...host.querySelectorAll(".ap-mask__in")];
    if (!ins.length || reduce) return;
    gsap.set(ins, { yPercent: 115 });
    const rows = [];
    ins.forEach((el) => {
      const top = Math.round(el.parentElement.getBoundingClientRect().top);
      const row = rows.find((r) => Math.abs(r.top - top) < 8);
      row ? row.els.push(el) : rows.push({ top, els: [el] });
    });
    ScrollTrigger.create({
      trigger: host, start: "top 85%", once: true,
      onEnter: () => rows.forEach((r, i) => gsap.to(r.els, { yPercent: 0, duration: 1.1, ease: "power4.out", delay: i * 0.08 })),
    });
  };
  [".ap-services__head h2", ".ap-products__title"].forEach((s) => document.querySelector(s) && rise(document.querySelector(s)));
  if (!reduce) {
    gsap.utils.toArray(".ap-fade").forEach((el) => gsap.from(el, { opacity: 0, y: 18, duration: 0.8, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } }));
    gsap.from(".ap-service", { opacity: 0, y: 18, duration: 0.8, ease: "power4.out", stagger: 0.08, scrollTrigger: { trigger: ".ap-services__list", start: "top 85%", once: true } });
  }

  // ── Hero: once the loader lifts, each line rises from below (1.1s · .08s stagger, the location line after .45s for .9s), and on scroll it blurs and slides 5vw to both sides
  const heroTitle = document.querySelector(".ap-hero__title"), heroLoc = document.querySelector(".ap-hero__loc");
  if (!reduce) {
    gsap.set([heroTitle, heroLoc], { opacity: 0 });
    site.onIntro(async () => {
      await document.fonts.ready;
      const split = SplitText.create(heroTitle, { type: "lines", mask: "lines" });
      const locSplit = SplitText.create(heroLoc, { type: "lines", mask: "lines" });
      gsap.set([split.lines, locSplit.lines], { yPercent: 115 });
      gsap.set([heroTitle, heroLoc], { opacity: 1 });
      split.lines.forEach((l, i) => gsap.to(l, { yPercent: 0, duration: 1.1, ease: "power4.out", delay: i * 0.08 }));
      gsap.to(locSplit.lines, { yPercent: 0, duration: 0.9, ease: "power4.out", delay: 0.45 });
    });
    ScrollTrigger.create({
      trigger: ".ap-hero", start: "top top", end: "bottom 40%", scrub: true,
      onUpdate: ({ progress: t }) => {
        const side = innerWidth < 1024 ? -5 : 5;
        gsap.set(heroTitle, { opacity: 1 - t, filter: `blur(${5 * t}px)`, x: `${-5 * t}vw` });
        gsap.set(heroLoc, { opacity: 1 - t, filter: `blur(${5 * t}px)`, x: `${side * t}vw` });
      },
    });
  }

  // ── Fixed single line: of the 2.55 screens it stays, it rests .4 then goes blur 10px → sharp over .5, then blurs again over .6 starting .25 before the end ──
  const stText = document.querySelector(".ap-statement__text");
  if (!reduce) {
    const pin = innerWidth < 900 ? 2.8 : 2.55;
    const P = { pause: 0.4, fadeIn: 0.5, fadeOut: 0.6, after: 0.25 };
    ScrollTrigger.create({
      trigger: ".ap-statement", start: "top top", end: "bottom bottom",
      onUpdate: ({ progress: a }) => {
        const c = P.pause / pin, u = (P.pause + P.fadeIn) / pin, h = 1 - P.after / pin, d = h - P.fadeOut / pin;
        const m = clamp(a < u ? (a - c) / (u - c) : a > d ? (h - a) / (h - d) : 1);
        stText.style.opacity = m;
        stText.style.filter = `blur(${(1 - m) * 10}px)`;
      },
    });
  }

  // ── White section triangle reveal: while scrolling .6 of the screen after the section top reaches the screen top, a triangle with 30px sides at the screen center spreads out with jagged edges to reveal the section
  const about = document.querySelector(".ap-about");
  const SIDE = 30, TALL = SIDE * 0.8660254;
  const cellHash = (i, j) => { const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); };
  const revealPath = (rp, rect) => {
    const w = rect.width, vh = innerHeight, oy = -rect.top;
    const cx = w / 2, cy = oy + vh / 2;
    const R = rp * (Math.hypot(w, vh) / 2 + 220);
    // The edge is a radius that undulates with angle (low frequency) + per-cell scatter (±90px) — the interior is covered by a single 24-gon to shorten the length
    const edge = (a) => R * (1 + 0.16 * Math.sin(a * 3 + 1.3) * Math.sin(a * 2 - rp * 4) + 0.08 * Math.sin(a * 7 + 0.4));
    const inner = Math.max(0, R * 0.62 - 140);
    let d = "";
    if (inner > 0) {
      for (let k = 0; k < 24; k++) {
        const a = (k * Math.PI) / 12;
        d += `${k ? "L" : "M"}${(cx + Math.cos(a) * inner).toFixed(1)} ${(cy + Math.sin(a) * inner).toFixed(1)}`;
      }
      d += "Z";
    }
    const r0 = Math.max(0, Math.floor((oy - TALL) / TALL)), r1 = Math.ceil((oy + vh + TALL) / TALL);
    const ring = inner * 0.96 - SIDE;
    const far = R * 1.3 + 90;
    for (let r = r0; r <= r1; r++) {
      const top = r * TALL, bot = top + TALL, sh = r % 2 ? SIDE / 2 : 0;
      if (Math.abs(top - cy) > far) continue;
      for (let c = -1; c * SIDE < w + SIDE; c++) {
        const x = c * SIDE - sh;
        // Wind every triangle in the same direction as the inner polygon — if wound the opposite way, overlapping areas become holes under the nonzero rule
        const pair = [[x, bot, x + SIDE / 2, top, x + SIDE, bot], [x + SIDE / 2, top, x + SIDE * 1.5, top, x + SIDE, bot]];
        pair.forEach((p, k) => {
          const mx = (p[0] + p[2] + p[4]) / 3, my = (p[1] + p[3] + p[5]) / 3;
          const dist = Math.hypot(mx - cx, my - cy);
          if (dist < ring || dist > far) return;
          const hsh = cellHash(c * 2 + k, r);
          const lim = edge(Math.atan2(my - cy, mx - cx)) + (hsh - 0.5) * 180;
          // A few triangles also break off outside the edge
          if (dist < lim || (hsh > 0.93 && dist < lim + 140)) d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${p[2].toFixed(1)} ${p[3].toFixed(1)}L${p[4].toFixed(1)} ${p[5].toFixed(1)}Z`;
        });
      }
    }
    return d ? `path("${d}")` : "polygon(0 0, 0 0, 0 0)";
  };
  const reveal = { p: reduce ? 1 : 0 };
  if (!reduce) {
    rise(about.querySelector(".ap-about__heading"));
    ScrollTrigger.create({
      trigger: about, start: "top top", end: () => `+=${innerHeight * 0.6}`,
      onUpdate: ({ progress }) => { reveal.p = progress; },
    });
    gsap.ticker.add(() => {
      const r = about.getBoundingClientRect();
      if (r.top > innerHeight || r.bottom < 0) return;
      const p = reveal.p;
      about.classList.toggle("is-open", p >= 1);
      if (p > 0.85) about.setAttribute("data-paper-on", ""); else about.removeAttribute("data-paper-on");
      about.style.setProperty("--bent", (p > 0 && p < 1 ? 1 - smooth(0.35, 1, p) : 0).toFixed(3));
      if (p < 1) about.style.clipPath = revealPath(p, r); else about.style.clipPath = "";
    });
  } else about.setAttribute("data-paper-on", "");

  // ── Silk on the white surface: bright folds slowly flow on a canvas inside the section (shader)
  const silk = (cv, light) => {
    const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return null;
    const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec3 a;uniform vec3 b;
      float ridge(vec2 u,float o,float f,float s,float ph,float w){float y=o+.22*sin(u.x*f+t*s+ph)+.07*sin(u.x*f*2.3-t*s*1.3+ph*2.);float d=u.y-y;return exp(-d*d/w);}
      void main(){vec2 u=gl_FragCoord.xy/r;u.x*=r.x/r.y;float c=cos(.45),s=sin(.45);vec2 q=mat2(c,-s,s,c)*(u-.5)+.5;
      float k=ridge(q,.78,1.5,.05,0.,.02)*.6+ridge(q,.38,1.1,.04,2.,.05)*.5+ridge(q,.05,1.9,.06,4.,.012)*.45+ridge(q,1.05,1.2,.03,1.,.06)*.4;
      float sh=ridge(q+vec2(.0,.03),.78,1.5,.05,0.,.02)*.5+ridge(q+vec2(0.,.04),.38,1.1,.04,2.,.05)*.4;
      vec3 col=a+(a-b)*k*${light ? ".02" : ".0"}-(a-b)*sh*.035+(vec3(1.)-a)*k*.5;gl_FragColor=vec4(col,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = { r: gl.getUniformLocation(pr, "r"), t: gl.getUniformLocation(pr, "t"), a: gl.getUniformLocation(pr, "a"), b: gl.getUniformLocation(pr, "b") };
    gl.uniform3f(U.a, paper.r, paper.g, paper.b); gl.uniform3f(U.b, paperInk.r, paperInk.g, paperInk.b);
    return (time) => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5), w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.r, cv.width, cv.height); gl.uniform1f(U.t, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  };
  const aboutSilk = silk(about.querySelector(".ap-about__silk canvas"), true);

  // ── Background WebGL ──────────────────────────────────────────────
  const canvas = document.getElementById("ap-gl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(bg, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  let vw = innerWidth, vh = innerHeight, wpp = 1;
  const resize = () => {
    vw = innerWidth; vh = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh; camera.updateProjectionMatrix();
    wpp = (2 * 10 * Math.tan((35 * Math.PI) / 360)) / vh;
  };
  resize();
  addEventListener("resize", resize);
  const toWorld = (x, y) => new THREE.Vector3((x - vw / 2) * wpp, -(y - vh / 2) * wpp, 0);

  // Cursor: follow 1 − e^(−3.2·dt), motion strength 1 − e^(−7·dt), on-state 1 − e^(−4·dt) — original values
  const ptr = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, inter: 0, on: 0, inside: false };
  addEventListener("pointermove", (e) => { ptr.tx = e.clientX / vw; ptr.ty = e.clientY / vh; ptr.inside = true; });
  document.addEventListener("pointerleave", () => { ptr.inside = false; });

  // Silk background + stars + triangular grid lines around the cursor
  const bgMat = new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    uniforms: { uRes: { value: new THREE.Vector2(vw, vh) }, uDpr: { value: 1 }, uTime: { value: 0 }, uScroll: { value: 0 }, uPtr: { value: new THREE.Vector2(0.5, 0.5) }, uInter: { value: 0 }, uOn: { value: 0 }, uInk: { value: ink }, uBg: { value: bg } },
    vertexShader: "void main(){gl_Position=vec4(position.xy,.999,1.);}",
    fragmentShader: `
      uniform vec2 uRes; uniform float uDpr, uTime, uScroll, uInter, uOn; uniform vec2 uPtr; uniform vec3 uInk, uBg;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float ridge(vec2 u, float o, float f, float s, float ph, float w){
        float y = o + .22 * sin(u.x * f + uTime * s + ph) + .08 * sin(u.x * f * 2.3 - uTime * s * 1.3 + ph * 2.);
        float d = u.y - y; return exp(-d * d / w);
      }
      float silk(vec2 q){
        return ridge(q, .78, 1.6, .05, 0., .006) * .55 + ridge(q, .36, 1.1, .04, 2., .022) * .35
             + ridge(q, .06, 2.0, .06, 4., .004) * .45 + ridge(q, 1.02, 1.3, .03, 1., .03) * .28;
      }
      void main(){
        vec2 frag = gl_FragCoord.xy / uDpr;
        vec2 u = frag / uRes; u.x *= uRes.x / uRes.y;
        u.y += uScroll * .00004;
        float c = cos(.55), s = sin(.55);
        vec2 q = mat2(c, -s, s, c) * (u - .5) + .5;
        vec3 sk = vec3(silk(q + vec2(.006, 0.)), silk(q), silk(q - vec2(.006, 0.)));
        vec3 col = uBg + uInk * sk * .17;
        vec2 cell = floor(frag / 96.); vec2 f = fract(frag / 96.);
        float h = hash(cell); vec2 sp = vec2(hash(cell + 1.3), hash(cell + 7.1)) * .8 + .1;
        float star = step(.86, h) * smoothstep(.022, 0., length(f - sp)) * (.45 + .55 * sin(uTime * 1.4 + h * 40.));
        col += uInk * star * .55;
        vec2 lp = vec2(frag.x, uRes.y - frag.y);
        float H = 30. * .8660254;
        float l0 = abs(fract(lp.y / H + .5) - .5) * H;
        float l1 = abs(fract(dot(lp, vec2(.8660254, .5)) / H + .5) - .5) * H;
        float l2 = abs(fract(dot(lp, vec2(.8660254, -.5)) / H + .5) - .5) * H;
        float edge = 1. - smoothstep(0., 1.1, min(l0, min(l1, l2)));
        vec2 pp = uPtr * uRes;
        float fall = exp(-dot(lp - pp, lp - pp) / (170. * 170.));
        col += uInk * edge * fall * uInter * uOn * .32;
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
  bgQuad.frustumCulled = false; bgQuad.renderOrder = -10;
  scene.add(bgQuad);

  // Triangle-facet bead — paint each facet flat and draw dark facet edges like scales.
  // The detail of a three board divides each edge into (detail + 1) parts — 36 for the marble (about 20k 7 thousand faces, so the scales look like dots), 14 for the geodesic sphere (so the grid reads)
  const facetGeo = (detail) => {
    const g = new THREE.IcosahedronGeometry(1, detail);
    const pos = g.attributes.position, n = pos.count;
    const center = new Float32Array(n * 3), rand = new Float32Array(n), bary = new Float32Array(n * 3);
    for (let i = 0; i < n; i += 3) {
      const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3, cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
      const r = Math.random();
      for (let k = 0; k < 3; k++) {
        center.set([cx, cy, cz], (i + k) * 3); rand[i + k] = r;
        bary[(i + k) * 3 + k] = 1;
      }
    }
    g.setAttribute("aCenter", new THREE.BufferAttribute(center, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    g.setAttribute("aBary", new THREE.BufferAttribute(bary, 3));
    return g;
  };
  const facetMat = (mode) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: true,
    uniforms: { uTime: { value: 0 }, uWobble: { value: 0.12 }, uBurst: { value: 0 }, uAlpha: { value: 1 }, uInk: { value: ink }, uBg: { value: bg }, uMode: { value: mode }, uLight: { value: new THREE.Vector3(-0.5, 0.7, 0.6).normalize() } },
    vertexShader: `
      uniform float uTime, uWobble, uBurst, uMode; attribute vec3 aCenter, aBary; attribute float aRand;
      varying vec3 vBary, vView; varying float vRand, vRim;
      float wob(vec3 p){ return sin(p.x * 2.1 + uTime * .9) * sin(p.y * 2.7 + uTime * .7) * sin(p.z * 2.3 + uTime * 1.1); }
      void main(){
        vec3 p = position * (1. + wob(position * 1.3) * uWobble + wob(position * 3.1 + 1.7) * uWobble * .4);
        vec3 dir = normalize(aCenter);
        vec3 c = aCenter * (1. + wob(aCenter * 1.3) * uWobble);
        p = mix(p, c, uBurst * .55) + dir * uBurst * (.6 + aRand * 2.6);
        if (uMode > .5 && aRand > .9) p += dir * .045;
        vBary = aBary; vRand = aRand;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        vView = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uAlpha, uMode, uTime; uniform vec3 uInk, uBg, uLight;
      varying vec3 vBary, vView; varying float vRand;
      void main(){
        vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
        vec3 v = normalize(-vView);
        float diff = max(dot(n, uLight), 0.);
        float spec = pow(max(dot(reflect(-uLight, n), v), 0.), 36.);
        float fres = pow(1. - max(dot(n, v), 0.), 3.);
        float e = min(vBary.x, min(vBary.y, vBary.z));
        float edge = 1. - smoothstep(0., fwidth(e) * 1.4 + .02, e);
        float k;
        if (uMode < .5) {
          k = .05 + diff * .32 + spec * .9 + fres * .35 + vRand * .05;
          k *= 1. - edge * .55;
        } else {
          k = .03 + diff * .12 + fres * .25 + edge * (.35 + .4 * fres) + step(.9, vRand) * (.12 + spec * .8);
        }
        gl_FragColor = vec4(mix(uBg, uInk, clamp(k, 0., 1.)), uAlpha);
      }`,
  });
  const orbMat = facetMat(0);
  const orb = new THREE.Mesh(facetGeo(36), orbMat);
  scene.add(orb);
  const dome = new THREE.Mesh(facetGeo(14), facetMat(1));
  dome.material.uniforms.uWobble.value = 0;
  dome.visible = false;
  scene.add(dome);

  // Chrome emblem — a rounded triangle ring (our default shape) reflecting a silver-band environment like a mirror
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envCanvas = document.createElement("canvas");
  envCanvas.width = 512; envCanvas.height = 256;
  {
    const c = envCanvas.getContext("2d");
    const g = c.createLinearGradient(0, 0, 0, 256);
    const hex = (col, a) => `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},${a})`;
    g.addColorStop(0, hex(bg, 1)); g.addColorStop(0.3, hex(ink, 0.9)); g.addColorStop(0.42, hex(bg, 1)); g.addColorStop(0.55, hex(ink, 0.55)); g.addColorStop(0.62, hex(bg, 1)); g.addColorStop(0.85, hex(ink, 0.25)); g.addColorStop(1, hex(bg, 1));
    c.fillStyle = g; c.fillRect(0, 0, 512, 256);
  }
  const envTex = new THREE.CanvasTexture(envCanvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const env = pmrem.fromEquirectangular(envTex).texture;
  const tri = new THREE.CatmullRomCurve3([0, 1, 2].map((k) => { const a = Math.PI / 2 + (k * Math.PI * 2) / 3; return new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.94, 0); }), true, "centripetal");
  const emblem = new THREE.Mesh(new THREE.TubeGeometry(tri, 160, 0.3, 32, true), new THREE.MeshStandardMaterial({ color: ink, metalness: 1, roughness: 0.14, envMap: env, envMapIntensity: 1.2 }));
  emblem.visible = false;
  scene.add(emblem);

  // Shaders are baked before the first cursor move — so the first move doesn’t freeze for 0.5s
  renderer.compile(scene, camera);

  const statement = document.querySelector(".ap-statement");
  const prefooter = document.querySelector(".ap-prefooter");
  const footerEmblem = document.querySelector(".ap-footer__emblem");
  let last = performance.now(), time = 0;
  const frame = () => {
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (!reduce) time += dt;
    // Cursor
    ptr.x += (ptr.tx - ptr.x) * (1 - Math.exp(-dt * 3.2));
    ptr.y += (ptr.ty - ptr.y) * (1 - Math.exp(-dt * 3.2));
    const lag = Math.hypot(ptr.tx - ptr.x, ptr.ty - ptr.y);
    ptr.inter += (Math.min(1, lag * 9) - ptr.inter) * (1 - Math.exp(-dt * 7));
    ptr.on += ((ptr.inside ? 1 : 0) - ptr.on) * (1 - Math.exp(-dt * 4));
    const u = bgMat.uniforms;
    u.uRes.value.set(vw, vh); u.uDpr.value = renderer.getPixelRatio(); u.uTime.value = time; u.uScroll.value = scrollY;
    u.uPtr.value.set(ptr.x, ptr.y); u.uInter.value = ptr.inter; u.uOn.value = ptr.on;

    // Orb: Hero diameter = Screen height .4, grows to cover the screen until the white sheet header touches the top. Then over .6 of screen the faces scatter and vanish
    const reach = (statement.offsetTop + statement.offsetHeight);
    const g = clamp(scrollY / reach);
    const r0 = Math.min(vh * 0.2, vw * 0.36), r1 = Math.hypot(vw, vh) * 0.62;
    const radius = r0 * Math.pow(r1 / r0, Math.pow(g, 1.7));
    const rp = reveal.p;
    orb.visible = rp < 1 && g < 1.01;
    if (orb.visible) {
      orb.scale.setScalar(radius * wpp);
      orb.position.copy(toWorld(vw / 2, vh / 2));
      orb.rotation.y = time * 0.12 + (ptr.x - 0.5) * 0.4;
      orb.rotation.x = Math.sin(time * 0.2) * 0.15 + (ptr.y - 0.5) * 0.3;
      const m = orbMat.uniforms;
      m.uTime.value = time; m.uWobble.value = 0.1 * (1 - g * 0.7);
      m.uBurst.value = Math.pow(rp, 1.4) * 2.2;
      m.uAlpha.value = 1 - smooth(0.45, 1, rp);
    }

    // Geodesic: while the blank section enters the screen it floats up from below to 40% of the screen, and when the footer rises it sinks back to 88%
    const pr = prefooter.getBoundingClientRect();
    const k = clamp((vh - pr.top) / (vh * 2));
    dome.visible = k > 0 && k < 1;
    if (dome.visible) {
      const R = vw * 0.62;
      const topY = k < 0.5 ? vh * 1.05 + (vh * 0.4 - vh * 1.05) * smooth(0, 0.5, k) : vh * 0.4 + (vh * 0.88 - vh * 0.4) * smooth(0.5, 1, k);
      dome.scale.setScalar(R * wpp);
      dome.position.copy(toWorld(vw / 2, topY + R));
      dome.rotation.y = time * 0.05 + (ptr.x - 0.5) * 0.15;
      dome.rotation.x = -0.35;
      dome.material.uniforms.uTime.value = time;
    }

    // Emblem: sits in the footer spot, rotating with a slow sway and turning its head toward the cursor
    const er = footerEmblem.getBoundingClientRect();
    emblem.visible = er.bottom > 0 && er.top < vh;
    if (emblem.visible) {
      const s = (er.width / 2) * wpp * 0.82;
      emblem.scale.set(s, s, s);
      emblem.position.copy(toWorld(er.left + er.width / 2, er.top + er.height / 2));
      emblem.rotation.y = Math.sin(time * 0.6) * 0.5 + (ptr.x - 0.5) * 0.6;
      emblem.rotation.x = Math.sin(time * 0.4) * 0.15 + (ptr.y - 0.5) * 0.3;
    }

    renderer.render(scene, camera);

    if (aboutSilk) {
      const ar = about.getBoundingClientRect();
      if (ar.top < vh && ar.bottom > 0 && rp > 0) aboutSilk(time);
    }
  };
  gsap.ticker.add(frame);
  document.addEventListener("visibilitychange", () => { last = performance.now(); });

  // ── Services: the item crossing the 55% screen line expands and the big number · scale follow
  const services = [...document.querySelectorAll(".ap-service")];
  const digits = document.querySelector(".ap-counter__digits"), ticks = [...document.querySelectorAll(".ap-ticks span")];
  const setService = (i) => {
    services.forEach((s, k) => s.classList.toggle("is-on", k === i));
    ticks.forEach((t, k) => t.classList.toggle("is-on", k <= i));
    digits.querySelectorAll("span").forEach((d) => d.style.setProperty("--pos", i));
  };
  setService(0);
  services.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top 55%", end: "bottom 55%", onToggle: (st) => st.isActive && setService(i) }));

  // ── Product panel: while the panel comes up from below to its place (where it sticks), name, status, line and text come in one after another, and lower panels darken by the number of panels stacked above
  const panels = [...document.querySelectorAll(".ap-panel")];
  if (!reduce && innerWidth >= 900) {
    const arrive = panels.map(() => 0);
    const paint = () => panels.forEach((p, i) => {
      p.style.setProperty("--arrive", arrive[i].toFixed(3));
      p.style.setProperty("--depth", arrive.slice(i + 1).reduce((a, b) => a + b, 0).toFixed(3));
    });
    panels.forEach((p, i) => {
      p.style.setProperty("--arrive", 0);
      ScrollTrigger.create({
        trigger: p, start: "top bottom", end: () => `top ${parseFloat(getComputedStyle(p).top) + 1}px`,
        onUpdate: (st) => { arrive[i] = st.progress; paint(); },
      });
    });
  }

  // ── Fields: pin the section and push the strip left — the pushed share is the bar length, the current cell is the big number
  const steps = document.querySelector(".ap-steps"), track = document.querySelector(".ap-steps__track");
  const stepEls = [...document.querySelectorAll(".ap-step:not(.ap-step--cta)")];
  const stepDigits = document.querySelectorAll(".ap-steps__digits span");
  const rail = document.querySelector(".ap-steps__rail");
  stepEls[0].classList.add("is-on");
  ScrollTrigger.matchMedia({
    "(min-width: 900px)": () => {
      const over = () => Math.max(0, track.scrollWidth - innerWidth);
      const size = () => { steps.style.setProperty("--steps-h", `${innerHeight + over()}px`); };
      size();
      const st = ScrollTrigger.create({
        trigger: steps, start: "top top", end: "bottom bottom", invalidateOnRefresh: true, onRefreshInit: size,
        onUpdate: ({ progress: p }) => {
          track.style.transform = `translate3d(${-p * over()}px, 0, 0)`;
          rail.style.setProperty("--p", p.toFixed(4));
          const i = Math.min(stepEls.length - 1, Math.floor(p * stepEls.length));
          stepEls.forEach((s, k) => s.classList.toggle("is-on", k === i));
          stepDigits.forEach((d) => d.style.setProperty("--pos", i));
        },
      });
      return () => { st.kill(); steps.style.removeProperty("--steps-h"); track.style.transform = ""; };
    },
  });

  // ── Lead: while pinned, the photo frame opens from the center (progress × 1.4) and name letters rise from 1.15em below, each line .024 later ──
  const stage = document.querySelector(".ap-founder__stage");
  [".ap-founder__first", ".ap-founder__last"].forEach((s, line) => {
    const el = document.querySelector(s);
    const chars = [...el.textContent];
    el.textContent = "";
    el.style.setProperty("--start", line ? 0.12 : 0);
    chars.forEach((c, i) => {
      const sp = document.createElement("span");
      sp.className = "ap-founder__ch"; sp.style.setProperty("--i", i); sp.textContent = c;
      el.append(sp);
    });
  });
  if (!reduce) {
    ScrollTrigger.create({
      trigger: stage, start: "top 60%", end: "bottom bottom",
      onUpdate: ({ progress: p }) => { stage.style.setProperty("--p", p.toFixed(4)); stage.style.setProperty("--np", clamp(p * 1.6).toFixed(4)); },
    });
  }

  // ── Footer mail: press to copy the address and fade briefly
  const mail = document.querySelector(".ap-footer__email"), copied = document.querySelector(".ap-footer__copied");
  mail.addEventListener("click", () => {
    navigator.clipboard?.writeText(mail.textContent.trim()).catch(() => {});
    mail.classList.add("is-copied"); copied.textContent = "Address copied";
    setTimeout(() => { mail.classList.remove("is-copied"); copied.textContent = ""; }, 1800);
  });

  // ── Product panel screen: bust (3D) · signal waveform · text lines — drawn only while the panel is visible
  const visible = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))));
  const medias = [...document.querySelectorAll(".ap-panel__canvas")];
  medias.forEach((c) => io.observe(c));
  const fit2d = (cv) => {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  };
  const rgba = (c, a) => `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${a})`;
  // Triangle strip at the top of the screen — thins out sparser going down
  const triBand = (ctx, w, h, t) => {
    const s = Math.max(18, w / 26), tt = s * 0.866, rows = Math.ceil((h * 0.32) / tt);
    for (let r = 0; r < rows; r++) {
      for (let c = -1; c * s < w + s; c++) {
        for (let k = 0; k < 2; k++) {
          const hsh = cellHash(c * 2 + k, r), keep = 1 - r / rows;
          if (hsh > keep * 1.1) continue;
          const x = c * s - (r % 2 ? s / 2 : 0), top = r * tt, bot = top + tt;
          const p = k ? [x + s / 2, top, x + s * 1.5, top, x + s, bot] : [x, bot, x + s, bot, x + s / 2, top];
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.lineTo(p[4], p[5]); ctx.closePath();
          ctx.fillStyle = rgba(paperInk, 0.04 + 0.05 * Math.sin(t * 0.8 + hsh * 12) ** 2);
          ctx.fill();
          ctx.strokeStyle = rgba(paperInk, 0.12); ctx.lineWidth = 1; ctx.stroke();
        }
      }
    }
  };
  const drawSignals = (cv, t) => {
    const { ctx, w, h } = fit2d(cv);
    ctx.clearRect(0, 0, w, h);
    const left = w * 0.08, right = w * 0.9, rows = 9, top = h * 0.12, gap = (h * 0.8) / rows;
    ctx.font = `${Math.max(8, w * 0.012)}px ${css.getPropertyValue("--kf-font-mono")}`;
    for (let r = 0; r < rows; r++) {
      const y = top + gap * (r + 0.5);
      ctx.fillStyle = rgba(paperInk, 0.45); ctx.fillText(`CH ${String(r).padStart(2, "0")}`, w * 0.015, y + 3);
      ctx.strokeStyle = rgba(paperInk, 0.08); ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
      ctx.strokeStyle = rgba(paperInk, r === 1 ? 0.85 : 0.55); ctx.lineWidth = r === 1 ? 1.4 : 1;
      ctx.beginPath();
      for (let x = left; x <= right; x += 2) {
        const v = x * 0.045 + t * (2 + r * 0.3);
        const yy = y + Math.sin(v + r) * gap * 0.12 + Math.sin(v * 2.7 + r * 3) * gap * 0.08 + (cellHash(Math.floor(v * 3), r) - 0.5) * gap * 0.22;
        x === left ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = rgba(paperInk, 0.4); ctx.fillText("00 µV", right + 8, y + 3);
    }
    triBand(ctx, w, h, t);
  };
  const drawLines = (cv, t) => {
    const { ctx, w, h } = fit2d(cv);
    ctx.clearRect(0, 0, w, h);
    const x0 = w * 0.06, lh = h * 0.042, hot = Math.floor((t * 0.6) % 14);
    let y = h * 0.16, n = 0;
    for (let para = 0; para < 3; para++) {
      for (let l = 0; l < 5 && y < h * 0.95; l++, n++) {
        const len = l === 4 ? 0.45 + cellHash(n, 3) * 0.3 : 0.82 + cellHash(n, 7) * 0.12;
        let x = x0;
        while (x < x0 + (w - x0 * 2) * len) {
          const word = w * (0.03 + cellHash(n, x | 0) * 0.07);
          ctx.fillStyle = rgba(paperInk, n === hot ? 0.75 : 0.22);
          ctx.beginPath(); ctx.roundRect(x, y, Math.min(word, x0 + (w - x0 * 2) * len - x), lh * 0.42, 2); ctx.fill();
          x += word + w * 0.012;
        }
        y += lh;
      }
      y += lh * 0.9;
    }
    triBand(ctx, w, h, t);
  };
  const bustCanvas = document.querySelector('[data-media="bust"]');
  const bust = (() => {
    const r3 = new THREE.WebGLRenderer({ canvas: bustCanvas, antialias: true, alpha: true });
    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1.5, 0.1, 50);
    cam.position.set(0, 0.15, 7.5);
    const penv = new THREE.PMREMGenerator(r3);
    const tex = new THREE.CanvasTexture(envCanvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const mat = new THREE.MeshStandardMaterial({ color: paper, metalness: 0.85, roughness: 0.32, envMap: penv.fromEquirectangular(tex).texture });
    const fig = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.78, 64, 48), mat); head.scale.set(0.82, 1.08, 0.92); head.position.y = 0.55;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.7, 40), mat); neck.position.y = -0.35;
    const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.4, 12, 40), mat); chest.rotation.z = Math.PI / 2; chest.scale.set(1, 1, 0.55); chest.position.y = -1.05;
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.025, 12, 120, Math.PI * 0.9), new THREE.MeshBasicMaterial({ color: paperInk, transparent: true, opacity: 0.25 }));
    halo.rotation.z = Math.PI * 0.05; halo.position.set(0, 0.55, -0.6);
    fig.add(head, neck, chest, halo);
    sc.add(fig);
    sc.add(new THREE.HemisphereLight(paper, paperInk, 1.2));
    const key = new THREE.DirectionalLight(paper, 1.6); key.position.set(-2, 3, 4); sc.add(key);
    r3.compile(sc, cam);
    return (t) => {
      const w = bustCanvas.clientWidth, h = bustCanvas.clientHeight;
      if (!w) return;
      r3.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      r3.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
      fig.rotation.y = Math.sin(t * 0.5) * 0.35 + (ptr.x - 0.5) * 0.5;
      r3.render(sc, cam);
    };
  })();
  const bandBehind = (() => {
    const c = document.createElement("canvas");
    c.className = "ap-panel__canvas";
    bustCanvas.before(c);
    return c;
  })();
  gsap.ticker.add(() => {
    medias.forEach((cv) => {
      if (!visible.has(cv)) return;
      if (cv.dataset.media === "signals") drawSignals(cv, time);
      else if (cv.dataset.media === "lines") drawLines(cv, time);
      else if (cv.dataset.media === "bust") {
        bust(time);
        const { ctx, w, h } = fit2d(bandBehind);
        ctx.clearRect(0, 0, w, h); triBand(ctx, w, h, time);
      }
    });
  });
})();
