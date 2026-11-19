// Motion shared by every page.
// - Lenis 1.0.27 (lerp .12) smooth scroll, page transition blurs for 180ms then floats up, like the original Astro transition
// - Background stage (three r163): a plane mixing gray and color fog with the original formula (0.5/cos(cos(t)) − distance×uMotion), color orbs in the four corners (they change color every 2s over 6s),
// Three birds flapping across the screen, the flight of the two logo birds on the hero
// - Pinned table of contents (sticks at the end of the hero and rises, pushed up by the footer · current section dot), section title bird, paragraph color flash, menu board, overlay window, button hover, GET IN TOUCH flow
// The page script receives it as window.ns.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = () => innerWidth <= 767;
  const FADE_EASE = CustomEase.create("ns-astro", "0.76,0,0.24,1");

  // ---------- New bird drawing — in the spot of the original logo’s ”two birds overlapped into an H”. Body (vertical feathers) and wings (horizontal bend) are kept separate so the shader folds and unfolds only the wings ----------
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
    <symbol id="ns-bird-body" viewBox="0 0 200 240"><path d="M124 4C114 58 110 112 100 158C92 194 80 218 60 238C94 214 114 180 124 136C134 92 134 46 124 4Z"/></symbol>
    <symbol id="ns-bird-wing" viewBox="0 0 200 240"><path d="M4 122C40 114 80 118 112 122C148 126 176 112 198 82C188 116 162 140 120 142C80 144 40 138 4 122Z"/></symbol>
    <symbol id="ns-arrow" viewBox="0 0 22 16"><path d="M19.8 7.3H0v1.4h19.8z"/><path d="M21.7 7.4C17.6 6.5 14.6 3.7 14.2.2h-1.5c.3 3.5 3 6.4 6.7 7.8-3.7 1.4-6.4 4.3-6.7 7.8h1.5c.4-3.5 3.4-6.3 7.5-7.2z"/></symbol>
  </svg>`);

  // ---------- Reading colors — convert the Skin (theme.css) variables to sRGB via canvas and pass them to the shader ----------
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.appendChild(probe);
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  px.canvas.width = px.canvas.height = 1;
  const cssColor = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };
  const rgb = (name) => {
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = cssColor(name);
    px.fillRect(0, 0, 1, 1);
    const d = px.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  // ---------- Smooth scroll ----------
  // The 1.0.27 UMD build has a lowercase global name, lenis
  const Lenis = window.lenis;
  const lenis = new Lenis({ lerp: 0.12 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  const scrollTo = (target, opt = {}) => lenis.scrollTo(target, { lerp: 0.3, ...opt });

  // ---------- Page turn ----------
  let cameByNav = false;
  try { cameByNav = sessionStorage.getItem("ns-nav") === "1"; sessionStorage.removeItem("ns-nav"); } catch {}
  const page = document.querySelector(".ns-page");
  // Original Astro transition: the old screen leaves immediately and the new screen fades up over 180ms
  gsap.to(page, { opacity: 1, duration: reduce ? 0 : 0.18, ease: FADE_EASE, delay: reduce || cameByNav ? 0 : 0.2 });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html/.test(href)) return;
    const here = location.pathname.split("/").pop() || "index.html";
    const [file, hash] = href.split("#");
    if (file === here) {
      if (hash) { e.preventDefault(); closeMenu(); scrollTo("#" + hash); }
      return;
    }
    e.preventDefault();
    // In the original the background stage stays when navigating — mark it so the next page doesn’t raise the fog from the start
    try { sessionStorage.setItem("ns-nav", "1"); } catch {}
    location.href = href;
  });
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(page, { opacity: 1 }); });

  // ---------- Background stage ----------
  const stage = (() => {
    const el = document.querySelector(".ns-stage");
    if (!el || !window.THREE) return null;
    const T = THREE;
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: false, stencil: false, depth: false, powerPreference: "low-power" });
    renderer.setClearColor(0, 0);
    const PR = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(PR);
    el.prepend(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(60, 1, 0.1, 10000);
    let W = 1, H = 1;
    const unit = new T.PlaneGeometry(1, 1);
    const onRender = [];
    const onResize = [];

    // The original mixes a gray and a color video. Instead of video, a shader draws a similar haze — slowly drifting fbm clouds
    const MIST_VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }";
    const MIST_FRAG = `
      precision highp float;
      uniform float uTime; uniform float uClock; uniform float uOpacity; uniform float uMotion; uniform vec2 uRes;
      uniform vec3 uBase; uniform vec3 uLight; uniform vec3 uGreen; uniform vec3 uLime; uniform vec3 uTeal;
      varying vec2 vUv;
      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
      float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; } return v; }
      void main(){
        vec2 uv = vUv;
        vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 1.15;
        float t = uClock * 0.12;
        vec2 q = vec2(fbm(p + vec2(t, 0.0)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
        float f = fbm(p + 1.1 * q + vec2(t * 0.6, -t * 0.35));
        float puff = smoothstep(0.34, 0.8, f);
        vec3 gray = mix(uBase * 0.87, uLight, puff);
        vec3 tint = mix(uGreen, uTeal, smoothstep(0.3, 0.8, q.x));
        tint = mix(tint, uLime, smoothstep(0.55, 0.95, q.y) * 0.6);
        vec3 color = mix(gray, mix(uLight, tint, 0.5), 0.4 * (1.0 - puff * 0.6));
        float blend = 0.5 / cos(cos(uTime)) - length(vec2(uv.x, uv.y - 0.15)) * uMotion;
        vec3 col = clamp(mix(color, gray, blend), 0.0, 1.0);
        gl_FragColor = vec4(col, uOpacity);
      }`;
    const mistU = {
      uTime: { value: 0 }, uClock: { value: 0 }, uOpacity: { value: 0 }, uMotion: { value: 1 }, uRes: { value: new T.Vector2(1, 1) },
      uBase: { value: new T.Color() }, uLight: { value: new T.Color() }, uGreen: { value: new T.Color() }, uLime: { value: new T.Color() }, uTeal: { value: new T.Color() },
    };
    const mist = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({ vertexShader: MIST_VERT, fragmentShader: MIST_FRAG, uniforms: mistU, transparent: true, depthTest: false, depthWrite: false }));
    mist.frustumCulled = false;
    mist.renderOrder = 0;
    scene.add(mist);

    const paint = () => {
      mistU.uBase.value.setRGB(...rgb("--kf-bg"));
      mistU.uLight.value.setRGB(...rgb("--kf-surface"));
      mistU.uGreen.value.setRGB(...rgb("--site-ball-green"));
      mistU.uLime.value.setRGB(...rgb("--site-ball-lime"));
      mistU.uTeal.value.setRGB(...rgb("--site-ball-teal"));
    };
    paint();

    // A panel following one DOM box — like original nm(), with the box center in screen-center-based coordinates
    const place = (obj, box) => {
      const r = box.getBoundingClientRect();
      obj.position.x = r.left + r.width / 2 - W / 2;
      obj.position.y = -(r.top + r.height / 2) + H / 2;
      return r;
    };

    // ---- Color balls: the original four balls’ color order [green · lime · teal] [lime · teal · green] …, next color every 2 seconds over 6s power2.out ----
    const BALL_FRAG = `
      precision highp float;
      uniform vec3 uColor; uniform float uOpacity; uniform float uSeed; varying vec2 vUv;
      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
      void main(){
        vec2 d = vUv - 0.5;
        float wob = noise(d * 4.0 + uSeed) * 0.12;
        float a = smoothstep(0.5, 0.05, length(d) + wob);
        gl_FragColor = vec4(uColor, a * a * uOpacity);
      }`;
    const BALL_ORDER = [["--site-ball-green", "--site-ball-lime", "--site-ball-teal"], ["--site-ball-lime", "--site-ball-teal", "--site-ball-green"], ["--site-ball-green", "--site-ball-lime", "--site-ball-teal"], ["--site-ball-lime", "--site-ball-teal", "--site-ball-green"]];
    const VERT = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
    const balls = [...el.querySelectorAll(".ns-stage__ball")].map((box, i) => {
      const u = { uColor: { value: new T.Color(...rgb(BALL_ORDER[i % 4][0])) }, uOpacity: { value: 0 }, uSeed: { value: i * 3.1 } };
      const m = new T.Mesh(unit, new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: BALL_FRAG, uniforms: u, transparent: true, depthTest: false, depthWrite: false }));
      m.renderOrder = 1;
      scene.add(m);
      const b = { box, m, u, step: 0, order: BALL_ORDER[i % 4] };
      onRender.push(() => place(m, box));
      onResize.push(() => { const r = box.getBoundingClientRect(); m.scale.set(r.width, r.height, 1); });
      return b;
    });
    let ballTimer = 0;
    const ballsIn = () => {
      balls.forEach((b) => gsap.to(b.u.uOpacity, { value: 0.6, duration: 0.6, ease: "power2.out" }));
      if (ballTimer || reduce) return;
      ballTimer = setInterval(() => balls.forEach((b, i) => {
        b.step = (b.step + 1) % b.order.length;
        const [r, g, bl] = rgb(b.order[b.step]);
        gsap.to(b.u.uColor.value, { r, g, b: bl, duration: 6, delay: 0.1 * i, ease: "power2.out" });
      }), 2000);
    };

    // ---- Bird: body plate + wing plate (only the wings fold and spread on the x axis). The art is drawn on a canvas from the bird symbol path in index.html ----
    const BIRD_FRAG = `
      precision highp float;
      uniform sampler2D uTexture; uniform float uOpacity; uniform float uScale; uniform float uDist;
      varying vec2 vUv;
      const float PI = 3.14159265359;
      void main(){
        vec2 uv = vUv;
        uv -= 0.5; uv *= (uScale / 0.5); uv += 0.5;
        uv.y -= sin(uv.x * PI) * 0.5 * uDist * (vUv.y - 0.25);
        vec4 col = texture2D(uTexture, uv);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) col.a = 0.0;
        col.a *= uOpacity;
        gl_FragColor = col;
      }`;
    const pathOf = (id) => document.querySelector(`#${id} path`)?.getAttribute("d");
    const birdTex = (id, tone) => {
      const d = pathOf(id);
      const c = document.createElement("canvas");
      c.width = 400; c.height = 480;
      const g = c.getContext("2d");
      if (d) { g.scale(2, 2); g.fillStyle = cssColor(tone === "a" ? "--kf-accent" : "--kf-accent-soft"); g.fill(new Path2D(d)); }
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      t.minFilter = t.magFilter = T.LinearFilter;
      return t;
    };
    const makeBird = (box, order) => {
      const tone = box.dataset.tone || "a";
      const wrap = new T.Group();
      const parts = ["ns-bird-body", "ns-bird-wing"].map((id, k) => {
        const u = { uTexture: { value: birdTex(id, tone) }, uOpacity: { value: 0 }, uScale: { value: 0.5 }, uDist: { value: -0.2 } };
        const m = new T.Mesh(unit, new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: BIRD_FRAG, uniforms: u, transparent: true, depthTest: false, depthWrite: false, side: T.DoubleSide }));
        m.renderOrder = order + k;
        wrap.add(m);
        return { m, u };
      });
      scene.add(wrap);
      const size = () => { const r = box.getBoundingClientRect(); parts.forEach((p) => p.m.scale.set(r.width, r.height, 1)); };
      onResize.push(size);
      return { box, wrap, body: parts[0], wing: parts[1], uniforms: parts.map((p) => p.u.uOpacity), scales: parts.map((p) => p.u.uScale), size };
    };
    const rand = (a, b) => a + Math.random() * (b - a);

    // Background bird flying across the screen — original YM: x r→−r (8~12s circ.inOut repeating), y = Radius × sin(c·2x), body tilt .4→−.8, wings ±.6
    const bgBirds = [...el.querySelectorAll(".ns-stage__bird")].map((box) => {
      const b = makeBird(box, 2);
      const dir = box.dataset.dir === "-1" ? -1 : 1;
      const amp = box.classList.contains("-green") ? 1 : 0.5;
      b.flight = { x: 0, r: 1, c: 1, radius: 1 };
      const setup = () => {
        b.flight.r = rand(W * 1.2, W * 1.5) * dir;
        b.flight.radius = rand(H / 2, H) * 0.8;
        b.flight.c = (isSP() ? Math.PI / Math.abs(b.flight.r * 4) : Math.PI / Math.abs(b.flight.r * 1.5)) * -1;
      };
      b.setup = setup;
      b.fly = () => {
        setup();
        const n = rand(0.8, 1.2), delay = isSP() ? rand(0, 16) : rand(0, 8);
        gsap.fromTo(b.wing.m.rotation, { x: 0.6 * amp * dir }, { x: -0.6 * amp * dir, duration: n * 4, ease: "circ.inOut", repeat: -1, yoyo: true, delay });
        gsap.fromTo(b.flight, { x: b.flight.r }, { x: -b.flight.r, duration: n * 10, ease: "circ.inOut", repeat: -1, delay });
      };
      b.flight.x = 1e5;
      onRender.push(() => {
        place(b.wrap, box);
        const f = b.flight, x = f.x;
        const y = f.radius * Math.sin(f.c * (x * 2));
        const tilt = 0.4 - 1.2 * (1 - Math.abs((-f.r - x) / (2 * f.r)));
        b.body.m.position.set(x, y, 0);
        b.wing.m.position.set(x, y, 0);
        b.body.m.rotation.z = tilt;
        b.wing.m.rotation.z = tilt * 0.65;
      });
      return b;
    });

    // Hero logo bird — original nC: flies in from off the right (1.2~1.5W) with slow(0.5,0.7), scale .5x→1x, wing −1→0 (+.5s expo.inOut), and once it arrives it is swapped for the DOM drawing
    let frame = 0;
    const mvBirds = [...document.querySelectorAll(".ns-mv__bird")].map((box) => {
      const b = makeBird(box, 4);
      b.uniforms.forEach((u) => { u.value = 1; });
      b.scales.forEach((s) => { s.value = 1; });
      b.f = { x: 1e5, radius: H / 2 };
      onRender.push(() => {
        if (!b.wrap.parent) return;
        place(b.wrap, box);
        const y = b.f.radius * Math.sin((Math.PI / 300) * frame);
        b.body.m.position.set(b.f.x, y, 0);
        b.wing.m.position.set(b.f.x, y, 0);
      });
      return b;
    });
    const flyMain = () => {
      mvBirds.forEach((b, i) => {
        const match = i === 1 ? 0.3 : 0, dur = 2 - match, delay = i === 1 ? 0.3 : 0;
        b.f.x = rand(W * 1.2, W * 1.5);
        b.f.radius = H / 2;
        gsap.to(b.scales, { value: 0.5, duration: dur, ease: "slow(0.5,0.7,false)", delay });
        gsap.fromTo(b.wing.m.rotation, { x: -1 }, { x: 0, duration: dur + 0.5, ease: "expo.inOut", delay, onComplete: () => {
          gsap.set(b.box, { opacity: 1 });
          scene.remove(b.wrap);
        } });
        gsap.to(b.f, { x: 0, radius: 0, duration: dur, ease: "slow(0.5,0.7,false)", delay });
      });
    };

    const resize = () => {
      W = el.clientWidth; H = el.clientHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.position.z = H / Math.tan((camera.fov * Math.PI) / 360) / 2;
      camera.updateProjectionMatrix();
      mistU.uRes.value.set(W * PR, H * PR);
      onResize.forEach((f) => f());
      bgBirds.forEach((b) => b.setup());
    };
    resize();
    addEventListener("resize", resize);

    let clock = 0;
    gsap.ticker.add((t, dt) => {
      frame += 1;
      mistU.uTime.value += 1;
      if (!reduce) clock += Math.min(dt, 50) / 1000;
      mistU.uClock.value = clock;
      onRender.forEach((f) => f());
      renderer.render(scene, camera);
    });

    return {
      paint,
      // Original Qi: on enter 2s power2.out, color (uMotion→1) and gray (→0) 2s power2.inOut
      intro: () => gsap.to(mistU.uOpacity, { value: 1, duration: reduce || cameByNav ? 0 : 2, ease: "power2.out" }),
      color: (o = {}) => gsap.to(mistU.uMotion, { value: 1, duration: reduce ? 0 : 2, ease: "power2.inOut", ...o }),
      gray: (o = {}) => gsap.to(mistU.uMotion, { value: 0, duration: reduce ? 0 : 2, ease: "power2.inOut", ...o }),
      ballsIn,
      flyBirds: () => { if (!reduce) bgBirds.forEach((b) => b.fly()); },
      birdsIn: () => bgBirds.forEach((b) => gsap.to(b.uniforms, { value: reduce ? 0 : 1, duration: 0.6, ease: "power2.out" })),
      birdsOut: () => bgBirds.forEach((b) => gsap.to(b.uniforms, { value: 0, duration: 0.6, ease: "power2.out" })),
      flyMain: () => { if (reduce) { mvBirds.forEach((b) => { gsap.set(b.box, { opacity: 1 }); scene.remove(b.wrap); }); } else flyMain(); },
      mainOut: () => mvBirds.forEach((b) => gsap.to(b.uniforms, { value: 0, duration: 0.6, ease: "power2.out" })),
      mainIn: () => mvBirds.forEach((b) => gsap.to(b.uniforms, { value: 1, duration: 0.6, ease: "power2.out" })),
    };
  })();

  // ---------- Fading page items (hides what’s behind when an overlay or menu opens) — original fade: sine.out .6 ----------
  const fade = (els, to, o = {}) => gsap.to(els, { opacity: to, duration: 0.6, ease: "sine.out", overwrite: "auto", ...o });

  // ---------- Pinned table of contents ----------
  const fixnav = document.querySelector(".ns-fixnav");
  const sections = [...document.querySelectorAll("[data-section]")];
  const pinStart = document.querySelector("[data-pin-start]");
  const pinEnd = document.querySelector(".ns-footer");
  if (fixnav) {
    const btns = [...fixnav.querySelectorAll(".ns-fixnav__btn")];
    const dot = fixnav.querySelector(".ns-fixnav__dot");
    const dotIn = dot?.querySelector("i");
    let shown = false, cur = -1, offset = 0;
    const moveDot = (i, force) => {
      if (!dot || !btns[i] || (!force && i === cur)) return;
      cur = i;
      btns.forEach((b) => b.classList.toggle("is-current", b === btns[i]));
      const y = btns[i].getBoundingClientRect().top - dot.getBoundingClientRect().top;
      gsap.to(dotIn, { y, duration: 0.6, ease: "sine.out" });
    };
    // Original yS(end, start, 0): if the hero is still visible, shift down by that much, and when the footer enters, shift up by that much
    const update = () => {
      const sy = lenis.animatedScroll;
      const t = pinStart ? pinStart.offsetTop + pinStart.offsetHeight - sy : -1;
      const e = pinEnd ? pinEnd.getBoundingClientRect().top + scrollY - innerHeight - sy : 1;
      offset = isSP() ? 0 : Math.max(Math.min(e, 0), t);
      gsap.set(fixnav, { y: offset });
      const on = t < 0 && e >= 0;
      if (on !== shown) { shown = on; fixnav.classList.toggle("is-on", on); fade(fixnav, on ? 1 : 0); }
    };
    lenis.on("scroll", update);
    addEventListener("resize", update);
    gsap.delayedCall(0.5, update);
    sections.forEach((sec, i) => {
      ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center", onToggle: (s) => { if (s.isActive) moveDot(i); } });
    });
    btns.forEach((b) => b.addEventListener("click", () => {
      const sec = sections[+b.dataset.to];
      if (sec) scrollTo(sec, { offset: isSP() ? -(fixnav.clientHeight + 70) : 10 });
    }));
    if (dot) setTimeout(() => { moveDot(Math.max(0, sections.findIndex((s) => s.getBoundingClientRect().bottom > innerHeight / 2)), true); fade(dot, 1); }, 1000);
  }

  // Hero language and menu buttons hide after scrolling past 100px (PC)
  const heroItems = [document.querySelector(".ns-lang"), document.querySelector(".ns-burger")].filter(Boolean);
  let heroShown = true;
  lenis.on("scroll", ({ animatedScroll }) => {
    if (isSP() || !heroItems.length) return;
    if (animatedScroll > 100 && heroShown) { heroShown = false; fade(heroItems, 0); gsap.set(heroItems, { pointerEvents: "none" }); }
    else if (animatedScroll <= 100 && !heroShown) { heroShown = true; fade(heroItems, 1); gsap.set(heroItems, { clearProps: "pointerEvents" }); }
  });

  // ---------- Section title: letters drop in from an arc (−60 + 200·sin), and a bird flies the curve in 2s, drawing a line and then erasing it in reverse ----------
  const BIRD_SVG = '<svg viewBox="0 0 200 240"><use class="ns-bird-a" href="#ns-bird-body"/><use class="ns-bird-a" href="#ns-bird-wing"/></svg>';
  const LINE = "M819.5,0.5C616.5,231.5,269,278,0.5,151";
  const LINE_R = "M0.5 151C269 278 616.5 231.5 819.5 0.5";
  const titles = [...document.querySelectorAll(".ns-title")];
  titles.forEach((h) => {
    const label = h.querySelector(".ns-title__label");
    if (!label) return;
    const text = label.textContent;
    label.setAttribute("aria-label", text);
    label.textContent = "";
    const chars = [];
    text.split(" ").forEach((word, wi) => {
      if (wi) label.insertAdjacentHTML("beforeend", '<span class="ns-title__sp" aria-hidden="true"> </span>');
      const w = document.createElement("span");
      w.className = "ns-title__word";
      w.setAttribute("aria-hidden", "true");
      [...word].forEach((c) => { const s = document.createElement("span"); s.className = "ns-title__ch"; s.textContent = c; w.appendChild(s); chars.push(s); });
      label.appendChild(w);
    });
    const prev = h.previousElementSibling?.classList.contains("ns-title");
    h.insertAdjacentHTML("beforeend", prev ? "" : `<span class="ns-title__bird" aria-hidden="true">${BIRD_SVG}</span><span class="ns-title__lines" aria-hidden="true"><span class="ns-title__line"><svg viewBox="0 0 820 221" preserveAspectRatio="none"><path d="${LINE}" stroke-opacity="0.7"/></svg></span><span class="ns-title__line -reverse"><svg viewBox="0 0 820 221" preserveAspectRatio="none"><path d="${LINE_R}" stroke-opacity="0.7"/></svg></span></span>`);
    const bird = h.querySelector(".ns-title__bird");
    const [line, lineR] = h.querySelectorAll(".ns-title__line");
    const len = 891.74;
    h.querySelectorAll(".ns-title__line path").forEach((p) => { p.style.strokeDasharray = `${len} ${len}`; });

    mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.still) { gsap.set(chars, { opacity: 1, x: 0, y: 0 }); return; }
      const s = Math.PI / (chars.length * 8);
      chars.forEach((c, u) => gsap.set(c, { y: -60 + 100 * Math.sin(s * u) * 2, opacity: 0 }));
      if (bird) gsap.set(bird, { offsetDistance: "0%", offsetRotate: "-55deg", display: "block", opacity: 0 });
      if (line) gsap.set(line, { strokeDashoffset: len, opacity: 1 });
      ScrollTrigger.create({
        trigger: label, start: "top bottom", once: true,
        onEnter: () => {
          gsap.to(chars, { opacity: 1, duration: 1, ease: "expo.inOut", stagger: { amount: 0.1, from: "end" }, delay: 0.5 });
          gsap.to(chars, { x: 0, y: 0, duration: 1, ease: "expo.inOut", stagger: { amount: 0.1, from: "end" }, delay: 1 });
          if (!bird) return;
          gsap.to(bird, { opacity: 1, duration: 0.2, delay: 0.6, ease: "sine.out" });
          gsap.to(bird, { offsetDistance: "100%", offsetRotate: "55deg", duration: 2, ease: "expo.inOut" });
          gsap.to(bird, { y: "-30%", duration: 1, ease: "expo.inOut", delay: 1 });
          gsap.fromTo(line, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, ease: "expo.inOut", delay: 0.2 });
          gsap.delayedCall(1, () => {
            gsap.set(line, { opacity: 0 });
            gsap.set(lineR, { opacity: 1 });
            gsap.to(bird, { opacity: 0, duration: 0.4, ease: "sine.out" });
            gsap.fromTo(lineR, { strokeDashoffset: 0 }, { strokeDashoffset: len, duration: 1, ease: "power2.out" });
          });
        },
      });
    });
  });

  // ---------- When a paragraph enters it flashes teal and returns to its own color after 0.5s (original color type) ----------
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-color]").forEach((p) => {
      gsap.set(p, { opacity: 0.3 });
      ScrollTrigger.create({
        trigger: p, start: "top bottom", once: true,
        onEnter: () => {
          gsap.to(p, { color: cssColor("--site-ball-teal"), duration: 0.6, ease: "sine.out" });
          gsap.delayedCall(0.5, () => gsap.to(p, { color: cssColor("--kf-ink"), opacity: 1, duration: 0.6, ease: "sine.out", onComplete: () => gsap.set(p, { clearProps: "color" }) }));
        },
      });
    });
  });

  // ---------- Button hover ----------
  // Pill: a mint panel enters from the left (power3.out 1s) and exits to the right (expo.out 1s). The arrow is pushed in from the left and floats up
  const canHover = matchMedia("(hover: hover)").matches;
  const pillHover = (root, panelSel, arrowSel) => {
    const panel = root.querySelector(panelSel), arrow = root.querySelector(arrowSel);
    // When GSAP reads CSS translateX(-100%) as px it overlaps with xPercent — so move the initial position with xPercent first
    if (panel) gsap.set(panel, { x: 0, xPercent: -100 });
    if (arrow) gsap.set(arrow, { x: 0, xPercent: -100 });
    root.addEventListener("mouseenter", () => {
      if (panel) gsap.fromTo(panel, { xPercent: -100 }, { xPercent: 0, duration: 1, ease: "power3.out", overwrite: true });
      if (arrow) {
        gsap.fromTo(arrow, { xPercent: -100 }, { xPercent: 0, duration: 1, ease: "power3.out", overwrite: true });
        gsap.to(arrow, { opacity: 1, duration: 0.6, ease: "power3.out" });
      }
    });
    root.addEventListener("mouseleave", () => {
      if (panel) gsap.to(panel, { xPercent: 100, duration: 1, ease: "expo.out", overwrite: true });
      if (arrow) gsap.to(arrow, { opacity: 0, duration: 0.6, ease: "sine.out" });
    });
  };
  // Circle arrow: the current arrow exits to the right and a new arrow enters from the left (expo.out 1 second)
  const arrowHover = (root, circle, tint = true) => {
    const [a, b] = circle.querySelectorAll(".ns-circle__arrow");
    if (!a || !b) return;
    gsap.set(a, { x: 0, xPercent: 0 });
    gsap.set(b, { x: 0, xPercent: -100 });
    // Original MouseHoverArrow: moves only on enter and stays as it is on leave — the arrow that will exit on the next hover restarts from its place
    root.addEventListener("mouseenter", () => {
      if (tint) circle.classList.add("is-hover");
      gsap.fromTo(a, { xPercent: 0 }, { xPercent: 100, duration: 1, ease: "expo.out", overwrite: true });
      gsap.fromTo(b, { xPercent: -100 }, { xPercent: 0, duration: 1, ease: "expo.out", overwrite: true });
    });
    root.addEventListener("mouseleave", () => circle.classList.remove("is-hover"));
  };
  if (canHover && !reduce) {
    // The video cell brings in the plate of the play button below even when hovering anywhere on the cell (original conceptMovie)
    document.querySelectorAll(".ns-pill, .ns-mv__movie").forEach((el) => pillHover(el, ".ns-pill__panel", ".ns-pill__arrow"));
    document.querySelectorAll(".ns-menu__list > li > .ns-menu__item").forEach((el) => pillHover(el, ".ns-menu__panel", ".ns-menu__arrow"));
    // The circle in the card only lets the arrow pass and the color stays (original MouseHoverArrow)
    document.querySelectorAll(".ns-circle").forEach((c) => { const card = c.closest(".ns-card"); arrowHover(card || c.closest("a, .ns-link") || c, c, !card); });
    document.querySelectorAll(".ns-fixnav__back").forEach((a) => arrowHover(a, a.querySelector(".ns-fixnav__arrows"), false));
  }

  // ---------- Menu board ----------
  const menu = document.querySelector(".ns-menu");
  const burger = document.querySelector(".ns-burger");
  const lang = document.querySelector(".ns-lang");
  const pageItems = () => [...document.querySelectorAll(".ns-fadeitem")].filter((e) => e !== lang);
  let menuOpen = false;
  function openMenu() {
    if (!menu || menuOpen) return;
    menuOpen = true;
    burger?.classList.add("is-open");
    document.body.classList.add("is-menu-open");
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    gsap.set(menu, { display: "block" });
    fade(menu, 1);
    fade(menu.querySelectorAll(".ns-menu__fade"), 1, { stagger: 0.05 });
    fade(pageItems(), 0);
    stage?.birdsOut(); stage?.mainOut(); stage?.color();
    lenis.stop();
  }
  function closeMenu() {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    burger?.classList.remove("is-open");
    document.body.classList.remove("is-menu-open");
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    fade(menu, 0, { onComplete: () => gsap.set(menu, { display: "none" }) });
    fade(menu.querySelectorAll(".ns-menu__fade"), 0);
    fade(pageItems().filter((e) => e !== fixnav || fixnav.classList.contains("is-on")), 1);
    stage?.birdsIn(); stage?.mainIn(); stage?.gray();
    lenis.start();
  }
  if (menu) {
    gsap.set(menu.querySelectorAll(".ns-menu__fade"), { opacity: 0 });
    burger?.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
    menu.querySelector(".ns-menu__bg")?.addEventListener("click", closeMenu);
    addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  // ---------- Overlay window (members·video): the items behind blur and the overlay items rise at .05s intervals ----------
  const modal = (root, items, { onOpen, onClose } = {}) => {
    if (!root) return null;
    const its = root.querySelectorAll(items);
    gsap.set(its, { opacity: 0 });
    let open = false;
    const api = {
      open() {
        if (open) return; open = true;
        root.setAttribute("aria-hidden", "false");
        gsap.set(root, { display: "block" });
        fade(root, 1);
        fade(its, 1, { stagger: 0.05 });
        gsap.delayedCall(0.01, () => fade(pageItems(), 0));
        stage?.birdsOut(); stage?.mainOut();
        lenis.stop();
        onOpen?.();
      },
      close() {
        if (!open) return; open = false;
        root.setAttribute("aria-hidden", "true");
        fade(root, 0, { onComplete: () => gsap.set(root, { display: "none" }) });
        fade(its, 0);
        fade(pageItems().filter((e) => e !== fixnav || fixnav.classList.contains("is-on")), 1);
        stage?.birdsIn(); stage?.mainIn();
        lenis.start();
        onClose?.();
      },
    };
    root.querySelectorAll(".ns-modal__bg, .ns-modal__close .ns-x").forEach((b) => b.addEventListener("click", api.close));
    addEventListener("keydown", (e) => { if (e.key === "Escape") api.close(); });
    return api;
  };

  // ---------- GET IN TOUCH flow — passes one panel width in 1000 frames (60fps 16.7s), and the whole panel rises by half its height against the scroll ----------
  document.querySelectorAll(".ns-contact__copies").forEach((wrap) => {
    const words = [...wrap.querySelectorAll(".ns-contact__word")];
    if (!words.length) return;
    let w = words[0].offsetWidth, pos = 0;
    const lay = () => { w = words[0].offsetWidth; words.forEach((el, i) => gsap.set(el, { left: w * i })); };
    lay();
    addEventListener("resize", lay);
    if (!reduce) gsap.ticker.add((t, dt) => {
      pos -= (w / 1000) * (Math.min(dt, 50) / (1000 / 60));
      if (pos <= -w) pos += w;
      words.forEach((el) => gsap.set(el, { x: pos }));
    });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const holder = wrap.parentElement;
      gsap.fromTo(wrap, { y: 0 }, { y: () => -holder.clientHeight * 0.5, ease: "none", scrollTrigger: { trigger: holder, start: "top bottom", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true } });
    });
  });

  // Sub-page first scene — the original shows the mist in color after .1s, then turns it gray after .5s.
  // The original sub pages have no hero English lettering art, so the color orbs and the background bird never finish receiving their art, and only the fog shows — left as is
  if (document.body.dataset.page !== "home") {
    gsap.delayedCall(0.1, () => {
      stage?.intro();
      stage?.color();
      gsap.delayedCall(0.5, () => stage?.gray());
    });
  }

  // Once the fonts finish loading the height changes, so measure again
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  window.ns = { lenis, stage, fade, modal, scrollTo, openMenu, closeMenu, reduce, isSP, cssColor, arrowHover };
})();
