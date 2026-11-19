// Shared by all pages: draws the header, and attaches smooth scroll, eyelid page transition, text unscrambling, body entrance, eye button and lens pill.
// Original values: Lenis lerp .15 · eyelid closes .35s power2.in / opens .45s power2 (after .1s) · screen zoom 1.2→1 1.5s power3
//           · Entrance .5s power1 stagger .1 · body block .75s cubic-bezier(.19,1,.22,1) from 10% below the screen.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, MorphSVGPlugin);
  CustomEase.create("swExpo", "M0,0 C0.19,1 0.22,1 1,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const SW = (window.SW = { reduced, page, lenis: null, leaveOverride: null });
  // Resolve skin variables into SVG fill values — the fill attribute cannot read var(), and GSAP needs actual color strings to blend
  const probe = document.createElement("i");
  probe.hidden = true;
  document.body.append(probe);
  // oklch and color-mix computed values stay in that form, so paint them on 1px and read them back as sRGB
  const px1 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  px1.canvas.width = px1.canvas.height = 1;
  const tone = (v) => {
    probe.style.color = v;
    px1.clearRect(0, 0, 1, 1);
    px1.fillStyle = getComputedStyle(probe).color;
    px1.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = px1.getImageData(0, 0, 1, 1).data;
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  };
  SW.tone = tone;

  const icons = {
    phones: '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4.5 16v-3a8.5 8.5 0 0 1 17 0v3"/><rect x="3.5" y="15" width="4.5" height="7" rx="2"/><rect x="18" y="15" width="4.5" height="7" rx="2"/><line class="sw-sound__slash" x1="24.5" y1="25" x2="1.5" y2="2"/></svg>',
    ext: '<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 9.5V14H2V3h4.5"/><path d="M9 2h5v5M14 2 7.5 8.5"/></svg>',
    arrowLong: '<svg viewBox="0 0 34 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M0 6h32M27 1l5 5-5 5"/></svg>',
  };
  SW.icons = icons;

  // Instead of the original logo drawing: a spreading pink ring (where the leading letter goes in) plus a brush-script name spot
  const logo = () => `
    <svg class="sw-logo__ring" viewBox="0 0 50 50" aria-hidden="true">
      <defs><filter id="sw-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>
      <circle cx="25" cy="25" r="20.5" fill="${tone("var(--kf-bg)")}" stroke="${tone("var(--kf-accent)")}" stroke-width="4.5" filter="url(#sw-glow)" opacity=".9"/>
      <circle cx="25" cy="25" r="20.5" fill="none" stroke="${tone("var(--kf-accent-soft)")}" stroke-width="2.2"/>
      <text x="25" y="29.5" text-anchor="middle" fill="${tone("var(--kf-ink)")}" font-size="12" style="font-family: var(--kf-font-sans)" font-weight="700">Logo</text>
    </svg>
    <span class="sw-logo__word">Your name here</span>`;
  SW.logo = logo;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("sw-head");
    const right = page === "detail" ? `
      <div class="sw-head__right">
        <button class="sw-sound" type="button" aria-pressed="true" aria-label="Sound On">${icons.phones}</button>
        <a class="sw-select" href="list.html"><span class="sw-select__txt">Choose Symptoms</span><span class="sw-select__dots">${Array.from({ length: 8 }, (_, i) => `<i${i === 2 ? " class=\"is-here\"" : ""}></i>`).join("")}</span></a>
      </div>` : "";
    head.innerHTML = `<a class="sw-logo" href="index.html" aria-label="Home">${logo()}</a>${right}`;
  }

  // Eight symptom-picker dots — on hover the current symptom dot returns to pink, and the others light up cream in random order at .07 intervals (.2s) then return to pink (.4s).
  // Finally the current symptom dot returns to cream (.35s). All power1.out
  const pick = document.querySelector(".sw-select");
  if (pick && !reduced && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const dots = [...pick.querySelectorAll(".sw-select__dots > i")];
    const here = pick.querySelector(".is-here");
    const PINK = tone("var(--kf-accent)"), CREAM = tone("var(--kf-ink)");
    let tl;
    pick.addEventListener("pointerenter", () => {
      const rest = gsap.utils.shuffle(dots.filter((d) => d !== here));
      tl?.kill();
      tl = gsap.timeline({ defaults: { ease: "power1.out" } });
      if (here) tl.to(here, { backgroundColor: PINK, duration: 0.2 }, 0);
      rest.forEach((d, i) => tl.to(d, { backgroundColor: CREAM, duration: 0.2 }, i * 0.07).to(d, { backgroundColor: PINK, duration: 0.4, clearProps: "backgroundColor" }, i * 0.07 + 0.2));
      if (here) tl.to(here, { backgroundColor: CREAM, duration: 0.35, clearProps: "backgroundColor" }, (rest.length - 1) * 0.07 + 0.2);
    });
  }

  // Smooth scroll — not applied to one-screen pages like home (is-locked)
  if (!document.body.classList.contains("is-locked") && !reduced && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.15 });
    SW.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  SW.scrollTo = (target) => (SW.lenis ? SW.lenis.scrollTo(target, { duration: 1.2 }) : document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }));

  // ── Eyelid curtain: upper lid (curve .12, blur .07) and lower lid (curve .08, blur .055) meet in the middle along a sin curve
  const blink = { t: 0, set() {} };
  SW.blink = blink;
  const tmask = document.createElement("div");
  tmask.className = "sw-tmask";
  document.body.append(tmask);
  (() => {
    const cv = document.createElement("canvas");
    cv.className = "sw-blink";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const vs = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
    const fs = `precision mediump float;uniform float b;uniform vec3 c;varying vec2 v;
      void main(){
        if(b<=0.)discard;
        float uA=.12,lA=.08,uF=.07,lF=.055;
        float uT=.5+uA+uF+.04,lT=.5+lA+lF+.04;
        float s=sin(v.x*3.14159);
        float uE=1.+uF-b*(uT+uF)+s*uA*b;
        float up=smoothstep(uE-uF,uE+uF,v.y);
        float lE=b*(lT+lF)-lF-s*lA*b;
        float lo=1.-smoothstep(lE-lF,lE+lF,v.y);
        float m=max(up,lo);
        if(m<.01)discard;
        gl_FragColor=vec4(c,m);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = { p: gl.getAttribLocation(pr, "p"), b: gl.getUniformLocation(pr, "b"), c: gl.getUniformLocation(pr, "c") };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const draw = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (blink.t <= 0) return;
      gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(loc.p);
      gl.vertexAttribPointer(loc.p, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(loc.b, blink.t);
      gl.uniform3f(loc.c, 17 / 255, 17 / 255, 17 / 255);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const size = () => {
      const r = Math.min(devicePixelRatio, 2);
      cv.width = Math.round(innerWidth * r);
      cv.height = Math.round(innerHeight * r);
      gl.viewport(0, 0, cv.width, cv.height);
      draw();
    };
    blink.set = (t) => { blink.t = Math.max(0, Math.min(1, t)); draw(); };
    blink.ok = true;
    addEventListener("resize", size);
    size();
  })();

  // ── Letter dissolve: draw letters on a canvas and put them on one WebGL plane, a head sweeping left→right tears them jaggedly by the noise amount to reveal (r) · eat away (c)
  // Original values: three noise layers (70px .5 · 24px .32 · 9px .18) · tear depth 480px · edge 24px · panel margin .35/.2 of font size
  const GL = (() => {
    if (!window.THREE) return null;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" }); } catch { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0, 0);
    const cv = renderer.domElement;
    cv.className = "sw-gl";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10);
    const geo = new THREE.PlaneGeometry(1, 1);
    const size = () => {
      renderer.setSize(innerWidth, innerHeight);
      Object.assign(cam, { right: innerWidth, bottom: -innerHeight });
      cam.updateProjectionMatrix();
    };
    size();
    addEventListener("resize", size);
    const FRAG = `
      precision highp float;
      uniform sampler2D uTex;
      uniform vec2 uRes;
      uniform float uReveal, uConceal, uAlpha;
      varying vec2 vUv;
      float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
      float vnoise(vec2 p) {
        vec2 c = floor(p), f = fract(p), w = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(c), hash(c + vec2(1.0, 0.0)), w.x), mix(hash(c + vec2(0.0, 1.0)), hash(c + 1.0), w.x), w.y);
      }
      void main() {
        vec4 col = texture2D(uTex, vUv);
        vec2 px = vUv * uRes;
        float tear = 0.5 * vnoise(px / 70.0) + 0.32 * vnoise(px / 24.0) + 0.18 * vnoise(px / 9.0);
        float travel = uRes.x + 480.0 + 24.0;
        float edge = px.x + tear * 480.0;
        float shown = smoothstep(edge - 24.0, edge, uReveal * travel - 24.0);
        float eaten = uConceal > 0.0 ? smoothstep(edge - 24.0, edge, uConceal * travel - 24.0) : 0.0;
        gl_FragColor = vec4(col.rgb, col.a * shown * (1.0 - eaten) * uAlpha);
      }`;
    const VERT = "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
    // ── Cursor ripple: runs a 2D fluid that drops velocity·dye where the cursor passed, refracting the whole plate by velocity and blurring it by dye.
    // Original values: velocity 512² · dye 1024² · cursor movement (screen ratio) ×10 × force 500 · splat radius .0025 · dye .3 · dissipation velocity 4.5 / dye 5.5 · swirl 2
    //           · pressure 10 times (keeping .8 of the previous value) · dt max .016 · refraction speed×.00015 max .012 of the screen · blur paint×6px 12 points · sleeps below tilt .004 (about 1s)
    // As in the original, runs only on devices with a mouse
    const wake = (() => {
      if (reduced || !matchMedia("(hover: hover) and (pointer: fine)").matches) return null;
      const K = { fadeVel: 4.5, fadeDye: 5.5, curl: 2, jacobi: 10, keep: 0.8, spread: 0.0025, force: 500, dye: 0.3, sleep: 0.004, haze: 6 };
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
      quad.frustumCulled = false;
      const qScene = new THREE.Scene();
      qScene.add(quad);
      const qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const QV = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
      const mat = (names, body) => new THREE.ShaderMaterial({
        vertexShader: QV,
        fragmentShader: `varying vec2 vUv; uniform vec2 uPx;\n${body}`,
        uniforms: Object.fromEntries(["uPx", ...names].map((n) => [n, { value: null }])),
        depthTest: false, depthWrite: false, blending: THREE.NoBlending,
      });
      // Four neighbor cells — outside the board, the center value is flipped to act as a wall (divergence only)
      const SIDE = "vec2 e = vec2(uPx.x, 0.0), n = vec2(0.0, uPx.y);";
      const M = {
        drop: mat(["uSrc", "uAt", "uAdd", "uAspect", "uSpread"], `
          uniform sampler2D uSrc; uniform vec2 uAt; uniform vec3 uAdd; uniform float uAspect, uSpread;
          void main() { vec2 d = vUv - uAt; d.x *= uAspect; gl_FragColor = vec4(texture2D(uSrc, vUv).rgb + uAdd * exp(-dot(d, d) / uSpread), 1.0); }`),
        carry: mat(["uVel", "uSrc", "uDt", "uFade"], `
          uniform sampler2D uVel, uSrc; uniform float uDt, uFade;
          void main() { vec2 from = vUv - uDt * uPx * texture2D(uVel, vUv).xy; gl_FragColor = texture2D(uSrc, from) / (1.0 + uFade * uDt); }`),
        spin: mat(["uVel"], `
          uniform sampler2D uVel;
          void main() { ${SIDE}
            float w = (texture2D(uVel, vUv + e).y - texture2D(uVel, vUv - e).y) - (texture2D(uVel, vUv + n).x - texture2D(uVel, vUv - n).x);
            gl_FragColor = vec4(0.5 * w, 0.0, 0.0, 1.0); }`),
        swirl: mat(["uVel", "uSpin", "uCurl", "uDt"], `
          uniform sampler2D uVel, uSpin; uniform float uCurl, uDt;
          void main() { ${SIDE}
            vec2 g = 0.5 * vec2(abs(texture2D(uSpin, vUv + n).x) - abs(texture2D(uSpin, vUv - n).x), abs(texture2D(uSpin, vUv + e).x) - abs(texture2D(uSpin, vUv - e).x));
            g = g / (length(g) + 0.0001) * uCurl * texture2D(uSpin, vUv).x;
            gl_FragColor = vec4(texture2D(uVel, vUv).xy + vec2(g.x, -g.y) * uDt, 0.0, 1.0); }`),
        spread: mat(["uVel"], `
          uniform sampler2D uVel;
          void main() { ${SIDE}
            vec2 c = texture2D(uVel, vUv).xy;
            float l = vUv.x - e.x < 0.0 ? -c.x : texture2D(uVel, vUv - e).x, r = vUv.x + e.x > 1.0 ? -c.x : texture2D(uVel, vUv + e).x;
            float b = vUv.y - n.y < 0.0 ? -c.y : texture2D(uVel, vUv - n).y, t = vUv.y + n.y > 1.0 ? -c.y : texture2D(uVel, vUv + n).y;
            gl_FragColor = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0); }`),
        scale: mat(["uSrc", "uBy"], "uniform sampler2D uSrc; uniform float uBy; void main() { gl_FragColor = uBy * texture2D(uSrc, vUv); }"),
        press: mat(["uPress", "uDiv"], `
          uniform sampler2D uPress, uDiv;
          void main() { ${SIDE}
            float sum = texture2D(uPress, vUv - e).x + texture2D(uPress, vUv + e).x + texture2D(uPress, vUv - n).x + texture2D(uPress, vUv + n).x;
            gl_FragColor = vec4((sum - texture2D(uDiv, vUv).x) * 0.25, 0.0, 0.0, 1.0); }`),
        level: mat(["uPress", "uVel"], `
          uniform sampler2D uPress, uVel;
          void main() { ${SIDE}
            vec2 slope = vec2(texture2D(uPress, vUv + e).x - texture2D(uPress, vUv - e).x, texture2D(uPress, vUv + n).x - texture2D(uPress, vUv - n).x);
            gl_FragColor = vec4(texture2D(uVel, vUv).xy - slope, 0.0, 1.0); }`),
        // The 12 blur points cover the disc evenly in a golden-angle spiral
        show: mat(["uScene", "uVel", "uDye", "uHaze"], `
          uniform sampler2D uScene, uVel, uDye; uniform float uHaze;
          void main() {
            vec2 bend = texture2D(uVel, vUv).xy * 0.00015;
            float far = length(bend);
            if (far > 0.012) bend *= 0.012 / far;
            vec2 at = clamp(vUv + bend, 0.0, 1.0);
            vec4 col = texture2D(uScene, at);
            float blur = clamp(texture2D(uDye, vUv).x, 0.0, 1.0) * uHaze;
            if (blur > 0.5) {
              for (int i = 0; i < 12; i++) {
                float a = float(i) * 2.399963, d = sqrt((float(i) + 0.5) / 12.0);
                col += texture2D(uScene, clamp(at + vec2(cos(a), sin(a)) * d * blur * uPx, 0.0, 1.0));
              }
              col /= 13.0;
            }
            gl_FragColor = col;
          }`),
      };
      const rt = (n, filter) => {
        const t = new THREE.WebGLRenderTarget(n, n, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: filter, magFilter: filter, depthBuffer: false, stencilBuffer: false, generateMipmaps: false });
        t.px = new THREE.Vector2(1 / n, 1 / n);
        return t;
      };
      const pair = (n, filter) => { let a = rt(n, filter), b = rt(n, filter); return { px: a.px, get read() { return a; }, get write() { return b; }, swap() { [a, b] = [b, a]; } }; };
      const vel = pair(512, THREE.LinearFilter), dye = pair(1024, THREE.LinearFilter), press = pair(512, THREE.NearestFilter);
      const div = rt(512, THREE.NearestFilter), spin = rt(512, THREE.NearestFilter);
      const run = (m, values, target) => {
        for (const k in values) m.uniforms[k].value = values[k];
        quad.material = m;
        renderer.setRenderTarget(target);
        renderer.render(qScene, qCam);
      };
      const into = (buf, m, values) => { run(m, values, buf.write); buf.swap(); };
      const screenPx = new THREE.Vector2(1, 1);
      const add = new THREE.Vector3(), at = new THREE.Vector2();
      const drop = (x, y, fx, fy) => {
        at.set(x, y);
        const base = { uPx: vel.px, uAt: at, uAspect: innerWidth / innerHeight, uSpread: K.spread };
        into(vel, M.drop, { ...base, uSrc: vel.read.texture, uAdd: add.set(fx, fy, 0) });
        into(dye, M.drop, { ...base, uSrc: dye.read.texture, uAdd: add.set(K.dye, 0, 0) });
      };
      const step = (dt) => {
        const uPx = vel.px;
        run(M.spin, { uPx, uVel: vel.read.texture }, spin);
        into(vel, M.swirl, { uPx, uVel: vel.read.texture, uSpin: spin.texture, uCurl: K.curl, uDt: dt });
        run(M.spread, { uPx, uVel: vel.read.texture }, div);
        into(press, M.scale, { uPx, uSrc: press.read.texture, uBy: K.keep });
        for (let i = 0; i < K.jacobi; i++) into(press, M.press, { uPx, uPress: press.read.texture, uDiv: div.texture });
        into(vel, M.level, { uPx, uPress: press.read.texture, uVel: vel.read.texture });
        into(vel, M.carry, { uPx, uVel: vel.read.texture, uSrc: vel.read.texture, uDt: dt, uFade: K.fadeVel });
        into(dye, M.carry, { uPx, uVel: vel.read.texture, uSrc: dye.read.texture, uDt: dt, uFade: K.fadeDye });
      };
      const still = () => {
        into(vel, M.scale, { uPx: vel.px, uSrc: vel.read.texture, uBy: 0 });
        into(dye, M.scale, { uPx: vel.px, uSrc: dye.read.texture, uBy: 0 });
      };
      const show = (sceneTex, target) => run(M.show, { uPx: screenPx, uScene: sceneTex, uVel: vel.read.texture, uDye: dye.read.texture, uHaze: K.haze }, target);
      // Compiling shaders on the first cursor move freezes the screen — so run every stage once during setup
      drop(0.5, 0.5, 0, 0);
      step(0.016);
      show(dye.read.texture, spin);
      still();
      renderer.setRenderTarget(null);

      const ptr = { x: -1, y: 0, dx: 0, dy: 0, moved: false };
      let energy = 0;
      addEventListener("mousemove", (e) => {
        const x = e.clientX / innerWidth, y = 1 - e.clientY / innerHeight;
        if (ptr.x < 0) { ptr.x = x; ptr.y = y; }
        ptr.dx = (x - ptr.x) * 10;
        ptr.dy = (y - ptr.y) * 10;
        ptr.x = x;
        ptr.y = y;
        ptr.moved = ptr.dx !== 0 || ptr.dy !== 0;
      });
      document.addEventListener("mouseleave", () => { ptr.moved = false; });
      return {
        screenPx,
        show,
        // When awake is true — that frame draws the scene to a separate panel first, then outputs it with refraction and blur applied via show
        tick(dt) {
          if (!ptr.moved && !energy) return false;
          dt = Math.min(dt, 0.016);
          if (ptr.moved) { drop(ptr.x, ptr.y, ptr.dx * K.force, ptr.dy * K.force); energy = 1; ptr.moved = false; }
          step(dt);
          energy /= 1 + K.fadeDye * dt;
          if (energy < K.sleep) { energy = 0; still(); }
          return energy > 0;
        },
      };
    })();
    const sceneRT = wake && new THREE.WebGLRenderTarget(1, 1, { samples: 4, depthBuffer: false, stencilBuffer: false });
    const fit = () => {
      if (!wake) return;
      const b = renderer.getDrawingBufferSize(new THREE.Vector2());
      sceneRT.setSize(b.x, b.y);
      wake.screenPx.set(1 / innerWidth, 1 / innerHeight);
    };
    fit();
    addEventListener("resize", fit);

    const planes = new Set();
    gsap.ticker.add((_, dt) => {
      let any = false;
      planes.forEach((p) => {
        if (!p.el.isConnected) { scene.remove(p.mesh); planes.delete(p); return; }
        const r = p.el.getBoundingClientRect();
        const on = p.ready && r.bottom > -p.py && r.top < innerHeight + p.py && p.u.uReveal.value > 0 && p.u.uConceal.value < 1;
        p.mesh.visible = on;
        if (!on) return;
        any = true;
        const w = r.width + p.px * 2, h = r.height + p.py * 2;
        p.mesh.scale.set(w, h, 1);
        p.mesh.position.set(r.left - p.px + w / 2, -(r.top - p.py + h / 2), 0);
        p.u.uRes.value.set(w, h);
      });
      if (wake && wake.tick(dt / 1000)) {
        renderer.setRenderTarget(sceneRT);
        renderer.render(scene, cam);
        wake.show(sceneRT.texture, null);
      } else {
        renderer.setRenderTarget(null);
        if (any || planes.size) renderer.render(scene, cam);
      }
    });
    return {
      add(el, u) {
        const canvas = document.createElement("canvas");
        const tex = new THREE.CanvasTexture(canvas);
        // ShaderMaterial doesn’t change color space, so use canvas values as they are (leaving it as sRGB decodes once more and darkens)
        tex.colorSpace = THREE.NoColorSpace;
        tex.minFilter = tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        u.uTex = { value: tex };
        const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, transparent: true, depthTest: false });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.visible = false;
        scene.add(mesh);
        const p = { el, u, mesh, px: 0, py: 0, ready: false };
        // Move text onto the canvas — slanted brush text (.slant) briefly releases its tilt to measure position, then draws with the same tilt
        const raster = () => {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return;
          el.classList.remove("gl-on");
          el.classList.add("gl-measure");
          const dpr = Math.min(1.5, devicePixelRatio || 1);
          const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
          p.px = Math.ceil(fs * 0.35);
          p.py = Math.ceil(fs * 0.2);
          const W = r.width + p.px * 2, H = r.height + p.py * 2;
          canvas.width = Math.ceil(W * dpr);
          canvas.height = Math.ceil(H * dpr);
          const g = canvas.getContext("2d");
          const ox = r.left - p.px, oy = r.top - p.py;
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          const range = document.createRange();
          for (let node; (node = walker.nextNode());) {
            const host = node.parentElement;
            const cs = getComputedStyle(host);
            if (cs.visibility === "hidden" || cs.display === "none" || !node.data.trim()) continue;
            const tilted = host.closest(".slant");
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (tilted && el.contains(tilted)) {
              const b = tilted.getBoundingClientRect();
              const cx = b.left + b.width / 2 - ox, cy = b.top + b.height / 2 - oy;
              g.translate(cx, cy);
              g.transform(1, 0, Math.tan((-7 * Math.PI) / 180), 1, 0, 0);
              g.translate(-cx, -cy);
            }
            g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            g.fillStyle = cs.color;
            g.textBaseline = "alphabetic";
            const ascent = g.measureText("Hg").fontBoundingBoxAscent ?? parseFloat(cs.fontSize) * 0.8;
            const upper = cs.textTransform === "uppercase";
            for (const m of node.data.matchAll(/\S+/g)) {
              range.setStart(node, m.index);
              range.setEnd(node, m.index + m[0].length);
              const wr = range.getClientRects()[0];
              if (!wr) continue;
              g.fillText(upper ? m[0].toUpperCase() : m[0], wr.left - ox, wr.top - oy + ascent);
            }
          }
          el.classList.remove("gl-measure");
          el.classList.add("gl-on");
          tex.needsUpdate = true;
          p.ready = true;
        };
        planes.add(p);
        (document.fonts?.ready || Promise.resolve()).then(raster);
        let lastW = 0;
        new ResizeObserver(([e]) => { const w = Math.round(e.contentRect.width); if (w && (w !== lastW || !p.ready)) { lastW = w; raster(); } }).observe(el);
        return p;
      },
    };
  })();
  SW.gl = GL;
  SW.glText = (el) => {
    if (el._gl) return el._gl;
    const st = { r: 1, c: 0 };
    const u = { uRes: { value: new (window.THREE?.Vector2 || Object)(1, 1) }, uReveal: { value: 1 }, uConceal: { value: 0 }, uAlpha: { value: 1 } };
    // Without WebGL, leave the text as is and do reveal and erase with opacity only
    const plane = GL ? GL.add(el, u) : null;
    const apply = () => {
      u.uReveal.value = st.r;
      u.uConceal.value = st.c;
      if (!plane) el.style.opacity = String(Math.max(0, Math.min(1, st.r * (1 - st.c))));
    };
    const api = {
      st,
      setReveal(v) { st.r = Math.max(0, Math.min(1, v)); apply(); },
      setConceal(v) { st.c = Math.max(0, Math.min(1, v)); apply(); },
      hide() { st.r = 0; st.c = 0; apply(); },
    };
    el._gl = api;
    return api;
  };

  // Large title that unfolds and appears on scroll-in (original reveal:"io")
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll('[data-gl="io"]').forEach((el) => {
      const g = SW.glText(el);
      g.hide();
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => gsap.to(g.st, { r: 1, duration: 2, ease: "none", onUpdate: () => g.setReveal(g.st.r) }),
      });
    });
    document.querySelectorAll("[data-rv]").forEach((el) => {
      el.classList.add("rv");
      gsap.fromTo(el, { "--rv": 0, y: "3rem" }, {
        "--rv": 1, y: 0, duration: 0.75, ease: "swExpo", delay: +(el.dataset.rv || 0),
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });
  });

  // ── Eye button: pill → almond eye .4s back.inOut, text 1.1x .3s back.in(5) interval -.02, pupil follows the mouse .6s power3
  const NS = "http://www.w3.org/2000/svg";
  let eyeN = 0;
  SW.eyeButton = (a) => {
    const label = a.dataset.label || "Your button label here";
    const sub = (a.dataset.sub || "").split("*").map((t, i) => ({ t, b: i % 2 === 1 })).filter((s) => s.t);
    const id = `sw-eye-${++eyeN}`;
    const H = 113, CY = 60;
    const C = { bg: tone("var(--kf-bg)"), white: tone("var(--site-white)"), orange: tone("var(--site-highlight)"), sand: tone("var(--kf-ink-soft)"), mask: "white" }; // Not skin: white in the mask is a ‹visible› luminance value
    a.innerHTML = `
      <svg class="btn-eye" xmlns="${NS}" viewBox="0 0 260 ${H}" stroke-width="1.3">
        <path class="shape" fill="${C.bg}" stroke="${C.white}"/>
        <mask id="${id}-m1"><path class="shape" fill="${C.mask}"/></mask>
        <g mask="url(#${id}-m1)"><g class="pupil" stroke="${C.orange}" opacity="0"><circle r="90" fill="${C.white}"/><circle r="60" fill="${C.bg}"/></g></g>
        <g class="txt">
          <text class="btn-eye__label" y="${CY}" fill="${C.orange}">${label}</text>
          ${sub.length ? `<text class="btn-eye__sub" y="72.3" fill="${C.sand}">${sub.map((s) => `<tspan class="${s.b ? "is-bold" : ""}">${s.t}</tspan>`).join("")}</text>` : ""}
        </g>
        <mask id="${id}-m2"><circle class="pupil-invert" r="60" fill="${C.mask}"/></mask>
        <g class="txt-clone" mask="url(#${id}-m2)"></g>
        <path class="hit" fill="transparent"/>
      </svg>`;
    const svg = a.firstElementChild;
    const texts = [...svg.querySelectorAll(".txt > text")];
    const pill = (w) => `M22.4 36.6H${w - 22.4}a22.35 22.35 0 0 1 0 44.7H22.4a22.35 22.35 0 0 1 0-44.7Z`;
    const almond = (w) => `M1 ${CY}C${(w * 0.26).toFixed(1)} -14 ${(w * 0.74).toFixed(1)} -14 ${w - 1} ${CY}C${(w * 0.74).toFixed(1)} 134 ${(w * 0.26).toFixed(1)} 134 1 ${CY}Z`;
    let w = 260;
    const layout = () => {
      const len = Math.max(...texts.map((t) => t.getComputedTextLength()));
      if (len > 0) w = Math.round(len + 52);
      svg.setAttribute("viewBox", `0 0 ${w} ${H}`);
      svg.style.width = `${w / 10}rem`;
      svg.querySelectorAll(".shape").forEach((p) => p.setAttribute("d", pill(w)));
      svg.querySelector(".hit").setAttribute("d", pill(w) + almond(w));
      svg.querySelectorAll(".txt text, .txt-clone text").forEach((t) => t.setAttribute("x", w / 2));
    };
    layout();
    const clones = svg.querySelector(".txt-clone");
    texts.forEach((t) => { const c = t.cloneNode(true); c.setAttribute("x", w / 2); clones.append(c); });
    const all = [...texts, ...clones.children];
    const n = texts.length;
    const pupils = [svg.querySelector(".pupil"), svg.querySelector(".pupil-invert")];
    const shapes = [...svg.querySelectorAll(".shape")];
    document.fonts?.ready.then(() => { layout(); gsap.set(pupils, { x: w / 2, y: CY }); });
    gsap.set(pupils, { x: w / 2, y: CY, opacity: 0 });
    if (reduced || matchMedia("(hover: none)").matches) return;
    const qx = gsap.quickTo(pupils, "x", { duration: 0.6, ease: "power3" });
    const qy = gsap.quickTo(pupils, "y", { duration: 0.6, ease: "power3" });
    let tl;
    const build = () => gsap.timeline({ paused: true })
      .to(pupils, { ease: "power3.inOut", opacity: 1 }, 0)
      .to(all, { duration: 0.3, ease: "back.in(5)", attr: { fill: (i) => (i < n ? C.bg : C.white) }, transformOrigin: "50%", scale: 1.1, stagger: -0.02 }, 0)
      .to(shapes, { duration: 0.4, ease: "back.inOut", attr: { fill: (i) => [C.sand, C.mask][i] }, morphSVG: { shape: almond(w), smooth: "auto" } }, 0);
    const hit = svg.querySelector(".hit");
    hit.addEventListener("pointermove", (e) => {
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      qx((p.x + w / 2) / 2);
      qy(p.y);
    });
    hit.addEventListener("pointerenter", () => { (tl ||= build()).play(); });
    hit.addEventListener("pointerleave", () => { tl?.reverse(); qx(w / 2); qy(CY); });
  };
  document.querySelectorAll("[data-eye-btn]").forEach(SW.eyeButton);

  // ── Lens pill: on hover the pill becomes a lens with pointed ends, and the text goes .95 wide (both .4s back.inOut)
  const PILL = "M20 0H80C91 0 100 9 100 20C100 31 91 40 80 40H20C9 40 0 31 0 20C0 9 9 0 20 0Z";
  const LENS = "M50 -7C78 -7 96 13 104 20C96 27 78 47 50 47C22 47 4 27 -4 20C4 13 22 -7 50 -7Z";
  document.querySelectorAll(".btn-lens").forEach((b) => {
    b.insertAdjacentHTML("afterbegin", `<svg class="bg" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="${PILL}"/></svg>`);
    const p = b.querySelector("svg.bg path");
    // Text narrows horizontally down to .95 as it becomes a lens
    const label = document.createElement("span");
    label.className = "btn-lens__label";
    label.append(...[...b.childNodes].filter((n) => !(n.nodeType === 1 && n.matches("svg.bg"))));
    b.append(label);
    if (reduced) return;
    b.addEventListener("mouseenter", () => {
      gsap.to(p, { morphSVG: LENS, duration: 0.4, ease: "back.inOut", overwrite: true });
      gsap.to(label, { scaleX: 0.95, duration: 0.4, ease: "back.inOut", overwrite: true });
    });
    b.addEventListener("mouseleave", () => {
      gsap.to(p, { morphSVG: PILL, duration: 0.4, ease: "back.inOut", overwrite: true });
      gsap.to(label, { scaleX: 1, duration: 0.4, ease: "back.inOut", overwrite: true });
    });
  });

  // ── Symptom ring icons, 8 kinds: instead of the original Rive loop, each repeats an SVG of the same place and size shaped like its symptom
  const PINK = tone("var(--kf-accent)"), CREAM = tone("var(--kf-ink)");
  const ICO = { deep: tone("var(--site-ico-deep)"), ash: tone("var(--site-ico-ash)"), rose: tone("var(--site-ico-rose)"), core: tone("var(--site-ico-core)") };
  const ringDefs = {
    double: `<circle class="a" r="17" fill="${PINK}"/><circle class="b" r="17" fill="${PINK}" opacity=".65"/>`,
    tunnel: [36, 28, 20, 12].map((r) => `<circle class="rr" r="${r}" fill="none" stroke="${CREAM}" stroke-opacity=".7"/>`).join("") + `<circle r="4" fill="${PINK}"/>`,
    wave: `<path d="M-44 -14H44M-44 14H44" stroke="${CREAM}" stroke-opacity=".6"/><path class="w1" fill="none" stroke="${PINK}" stroke-width="2"/><path class="w2" fill="none" stroke="${PINK}" stroke-width="2"/>`,
    center: `<circle r="27" fill="none" stroke="${CREAM}" stroke-opacity=".5"/><circle r="19" fill="${PINK}"/><circle class="core" r="0" fill="${ICO.core}"/>`,
    patch: `<ellipse class="p" cx="-14" cy="-12" rx="7" ry="6" fill="${PINK}"/><ellipse class="p" cx="12" cy="-6" rx="7" ry="5" fill="${ICO.ash}"/><ellipse class="p" cx="-10" cy="12" rx="5" ry="4" fill="${ICO.ash}"/><ellipse class="p" cx="14" cy="14" rx="6" ry="4.5" fill="${ICO.rose}"/>`,
    bars: [-16, 0, 16].map((x) => `<rect class="bar" x="${x - 5.5}" y="-22" width="11" height="44" rx="2" fill="${PINK}"/>`).join(""),
    haze: `<circle class="h1" r="32" fill="none" stroke="${CREAM}" stroke-opacity=".6" stroke-dasharray="2.5 3.5"/><circle class="h2" r="21" fill="none" stroke="${CREAM}" stroke-opacity=".45" stroke-dasharray="2 3"/>`,
    glare: `<circle r="5" fill="${PINK}"/>` + Array.from({ length: 8 }, (_, i) => `<line class="ray" x1="0" y1="-15" x2="0" y2="-42" stroke="${CREAM}" stroke-opacity=".7" transform="rotate(${i * 45})"/>`).join(""),
  };
  const waveD = (ph, sgn) => {
    let d = "";
    for (let x = -44; x <= 44; x += 4) d += `${x === -44 ? "M" : "L"}${x} ${(sgn * 9 * Math.sin(x / 13 + ph)).toFixed(2)}`;
    return d;
  };
  SW.ringIcon = (el, kind) => {
    el.innerHTML = `<svg class="ring-ico" viewBox="-50 -50 100 100" aria-hidden="true"><defs><clipPath id="ring-${kind}-${++eyeN}"><circle r="46"/></clipPath></defs><g clip-path="url(#ring-${kind}-${eyeN})">${ringDefs[kind] || ""}</g><circle class="rim" r="46"/></svg>`;
    const s = el.firstElementChild;
    const q = (c) => s.querySelectorAll(c);
    if (kind === "wave") {
      const w1 = s.querySelector(".w1"), w2 = s.querySelector(".w2");
      const o = { ph: 0 };
      const upd = () => { w1.setAttribute("d", waveD(o.ph, 1)); w2.setAttribute("d", waveD(o.ph + 1.2, -1)); };
      upd();
      if (!reduced) gsap.to(o, { ph: Math.PI * 2, duration: 3, ease: "none", repeat: -1, onUpdate: upd });
      return;
    }
    if (reduced) return;
    const loop = { repeat: -1, yoyo: true, ease: "sine.inOut" };
    if (kind === "double") gsap.to(q(".b"), { x: 10, duration: 1.4, ...loop, repeatDelay: 0.4 });
    if (kind === "tunnel") gsap.fromTo(q(".rr"), { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, stagger: { each: 0.25, repeat: -1, yoyo: true }, ease: "sine.inOut" });
    if (kind === "center") gsap.to(q(".core"), { attr: { r: 14 }, duration: 1.6, ...loop });
    if (kind === "patch") gsap.fromTo(q(".p"), { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.8, stagger: { each: 0.3, repeat: -1, yoyo: true }, ease: "sine.inOut" });
    if (kind === "bars") gsap.to(q(".bar"), { attr: { fill: (i) => [ICO.deep, ICO.ash, ICO.rose][i] }, duration: 1.1, stagger: 0.2, ...loop });
    if (kind === "haze") { gsap.to(q(".h1"), { rotation: 360, duration: 14, ease: "none", repeat: -1, transformOrigin: "50% 50%" }); gsap.to(q(".h2"), { rotation: -360, duration: 10, ease: "none", repeat: -1, transformOrigin: "50% 50%" }); }
    if (kind === "glare") gsap.fromTo(q(".ray"), { opacity: 0.2 }, { opacity: 1, duration: 0.9, ...loop, stagger: 0.08 });
  };

  // ── Page transition: on leave the eyelid closes (.35s power2.in), on the new page it opens after .1s (.45s power2)
  const KEY = "sw-enter";
  const zoomers = () => document.querySelectorAll("[data-zoom]");
  const reveals = () => document.querySelectorAll(".js-t-reveal");
  const enter = () => {
    const how = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power1" } });
    SW.enterTl = tl;
    if (reduced) { blink.set(0); gsap.set(reveals(), { autoAlpha: 1 }); return; }
    if (how === "mask") {
      gsap.set(tmask, { autoAlpha: 1 });
      tl.to(tmask, { autoAlpha: 0, duration: 0.6 }, 0.1);
    } else if (how === "blink") {
      if (blink.ok) {
        blink.set(1);
        const o = { t: 1 };
        tl.to(o, { t: 0, duration: 0.45, ease: "power2", onUpdate: () => blink.set(o.t) }, 0.1);
      } else {
        gsap.set(tmask, { autoAlpha: 1 });
        tl.to(tmask, { autoAlpha: 0 }, 0.125);
      }
      zoomers().forEach((z) => tl.fromTo(z, { scale: 1.2 }, { scale: 1, duration: 1.5, ease: "power3" }, 0.1));
    }
    reveals().forEach((r, i) => tl.fromTo(r, { autoAlpha: 0, y: "1.5rem" }, { autoAlpha: 1, y: 0 }, 0.1 + i * 0.1));
  };
  const leave = (href) => {
    if (SW.leaveOverride && SW.leaveOverride(href)) return;
    sessionStorage.setItem(KEY, "blink");
    if (reduced) { location.href = href; return; }
    if (blink.ok) {
      const o = { t: 0 };
      gsap.to(o, { t: 1, duration: 0.35, ease: "power2.in", onUpdate: () => blink.set(o.t), onComplete: () => (location.href = href) });
    } else {
      gsap.fromTo(tmask, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power1", onComplete: () => (location.href = href) });
    }
  };
  SW.leave = leave;
  SW.markEnter = (how) => sessionStorage.setItem(KEY, how);
  SW.tmask = tmask;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    leave(href);
  });
  // On return via back button (bfcache), reopen the closed eyelids
  addEventListener("pageshow", (e) => { if (e.persisted) { blink.set(0); gsap.set(tmask, { autoAlpha: 0 }); } });

  SW.enter = enter;
  if (!document.body.hasAttribute("data-manual-enter")) enter();
})();
