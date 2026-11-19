/* Shared by all pages — Lenis, loading · transition panels, ripple button, header-row menu, headline block rise, review flow, FAQ, and a three.js stage fixed behind 
   (background color that changes per section · transmissive glass pieces · image tile sphere). The original stage code is not used, we measured the screen and rebuilt it with our own shapes and materials. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  const root = document.documentElement;
  // Two original curves — the title block (.7s), and the deceleration used by the menu · ripple button that goes almost all the way at first and then drags on very long
  const easeIn = window.CustomEase ? CustomEase.create("lbOut", "0.13,0.93,0.13,0.93") : "power4.out";
  const easeLong = window.CustomEase ? CustomEase.create("lbLong", "M0,0 C.084,.61 .088,.874 .184,.944 .283,1.016 .374,1 1,1") : "expo.out";

  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ───────── Loading·transition panel ─────────
     Original: a purple panel covers from the first image with a triangle spinning in the center → when the page is ready it exits upward in 1s (power2.in) and the body comes in at .3s.
     Pressing an inner link makes the body drop out in .3s and a panel rises above the stage and below the body to cover it, then navigates — the new page starts with the same purple panel so it looks continuous.
     The original page-transition panel is barely visible on screen (on the first page it is purple over purple, on sub pages only the .3s of the body dropping out shows), and the first page title stays until the transition. The rising panel decelerates quickly to match that look */
  const loader = document.querySelector(".l-loader");
  const rise = loader?.querySelector(".is-rise"), fall = loader?.querySelector(".is-fall");
  // The original covers for 3.4~3.9s, but most of that is the time spent downloading hdr and models — a copy with nothing to download covers for 1.6s and then lifts (about 2.6s to the first image)
  const HOLD = 1600;
  let entered = false, leaving = false;
  const intros = [];
  const onEnter = (fn) => (entered ? fn() : intros.push(fn));
  function enter() {
    if (entered) return;
    entered = true;
    loader?.classList.remove("is-on");
    intros.splice(0).forEach((fn) => fn());
    if (!fall) return;
    if (reduce) { fall.classList.add("is-idle"); return; }
    gsap.fromTo(fall, { "--f": 0 }, { "--f": 1, duration: 1, ease: "power2.in", onComplete: () => fall.classList.add("is-idle") });
  }
  // Measure when to retract the plate at the first paint — even if the script runs late, it covers the same length from the first paint as the original
  function afterFirstPaint(fn) {
    const hit = () => performance.getEntriesByType("paint").find((p) => p.name === "first-paint");
    const go = (e) => setTimeout(fn, Math.max(0, e.startTime + HOLD - performance.now()));
    const e = hit();
    if (e) return go(e);
    if (!window.PerformanceObserver || !PerformanceObserver.supportedEntryTypes?.includes("paint")) return setTimeout(fn, HOLD);
    new PerformanceObserver((list, o) => { const p = list.getEntries().find((x) => x.name === "first-paint"); if (p) { o.disconnect(); go(p); } }).observe({ type: "paint", buffered: true });
  }
  reduce ? enter() : afterFirstPaint(enter);

  function leave(href) {
    if (leaving) return;
    leaving = true;
    if (menu?.classList.contains("is-open")) toggleMenu(false);
    root.classList.add("is-leaving");
    loader.classList.add("is-on");
    rise.classList.remove("is-idle");
    if (reduce) { location.href = href; return; }
    gsap.fromTo(rise, { "--c": 0 }, { "--c": 1, duration: 0.7, ease: "expo.out" });
    // Navigate at .52s when the panel nearly covers — it covers the rest while the new page loads and renders (about .3s), so the new page lands about .8s after the press, like the original
    gsap.delayedCall(0.52, () => (location.href = href));
  }
  const inside = (a) => {
    if (!a || a.target || a.hasAttribute("download")) return null;
    const u = new URL(a.getAttribute("href"), location.href);
    if (u.origin !== location.origin || /^(mailto|tel):/.test(a.getAttribute("href"))) return null;
    if (u.pathname === location.pathname && u.hash) return null;
    return u.href;
  };
  if (loader) {
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = inside(e.target.closest("a[href]"));
      if (!href) return;
      e.preventDefault();
      leave(href);
    });
    // While the cursor rests on a link, prefetch the next page — the new page stands ready right behind the covering plate
    const warmed = new Set();
    document.addEventListener("pointerover", (e) => {
      const href = inside(e.target.closest?.("a[href]"));
      if (!href || warmed.has(href)) return;
      warmed.add(href);
      const l = document.createElement("link");
      l.rel = "prefetch"; l.href = href;
      document.head.append(l);
    });
    // A page restored by back navigation stays frozen covered — so remove the panel
    addEventListener("pageshow", (e) => {
      if (!e.persisted) return;
      leaving = false;
      root.classList.remove("is-leaving");
      loader.classList.remove("is-on");
      gsap.set(rise, { "--c": 0 });
      rise.classList.add("is-idle");
    });
  }

  /* ───────── Wave button ───────── original: on enter --wave goes 0→50% in 2.5s (long ease-out), on leave →100% in .4s then back to 0. The text turns white at .25s.
     The button that goes to the current page (the quote button on the Contact page) has no reaction in the original either */
  const here = location.pathname.replace(/\/index\.html$/, "/");
  document.querySelectorAll("[data-wave]").forEach((el) => {
    if (el.matches("a[href]") && new URL(el.href).pathname.replace(/\/index\.html$/, "/") === here) return;
    const host = el.closest("[data-wave-host]") || el;
    let tw = null;
    host.addEventListener("mouseenter", () => {
      tw?.kill();
      el.classList.add("is-hovered");
      tw = reduce ? gsap.set(el, { "--wave": "50%" }) : gsap.fromTo(el, { "--wave": "0%" }, { "--wave": "50%", duration: 2.5, ease: easeLong });
    });
    host.addEventListener("mouseleave", () => {
      tw?.kill();
      el.classList.remove("is-hovered");
      tw = reduce ? gsap.set(el, { "--wave": "0%" }) : gsap.to(el, { "--wave": "100%", duration: 0.4, onComplete: () => gsap.set(el, { "--wave": "0%" }) });
    });
  });

  // CSS variables (including oklch relative colors) are painted on screen and read back as rgb — THREE.Color can’t read oklch
  const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  function cssColor(v) {
    probe.style.color = `var(${v})`;
    cv.clearRect(0, 0, 1, 1);
    cv.fillStyle = getComputedStyle(probe).color;
    cv.fillRect(0, 0, 1, 1);
    const [r, g, b] = cv.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  }
  const STAGE = { purple: "--kf-accent", white: "--kf-bg", green: "--site-green", cyan: "--site-cyan", black: "--site-night", navy: "--kf-contrast-bg", pink: "--site-pink" };

  /* ───────── Header bar menu ─────────
     Wide screens: the white panel curves in from above (-1.5 screens) at depth -1000 while straightening a -.15rad tilt (2s), and the widgets rise from one screen below tilted .1rad (2.9s, .2s apart).
     Tilt and position are written directly as matrix3d (cosine·sine spread by progress, position as a three-control-point Bezier). On narrow screens the whole panel comes down from the top in .5s */
  const menu = document.querySelector(".l-menu"), menuBtn = document.querySelector(".l-head .is-menu");
  const wide = matchMedia("(min-width: 992px)");
  const bez = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
  const tilt = (el, ang, ys, zs, p) => {
    const c = gsap.utils.interpolate(Math.cos(ang), 1, p), s = gsap.utils.interpolate(Math.sin(ang), 0, p), H = innerHeight;
    el.style.transform = `matrix3d(1,0,0,0,0,${c},${-s},0,0,${s},${c},0,0,${bez(...ys.map((v) => v * H), p)},${bez(...zs, p)},1)`;
  };
  let toggleMenu = () => {};
  if (menu && menuBtn) {
    const bgEl = menu.querySelector(".l-menu__bg"), widgets = [...menu.querySelectorAll(".l-mw")];
    const lang = menu.querySelector(".l-menu__lang"), titles = menu.querySelectorAll(".l-menu__title");
    const routes = menu.querySelectorAll(".l-menu__explore a"), exps = menu.querySelectorAll(".l-menu__exp a");
    const addr = menu.querySelector(".l-menu__addr"), sep = menu.querySelector(".l-menu__sep"), socials = menu.querySelectorAll(".l-menu__socials a");
    const bgState = { p: 0 }, wStates = widgets.map(() => ({ p: 0 }));
    const drawBg = () => tilt(bgEl, -0.15, [-1.5, -1.7, 0.1, 0], [0, -1000, 100, 0], bgState.p);
    const drawW = (i) => tilt(widgets[i], 0.1, [1, 0, 0, 0], [0, 0, 100, 0], wStates[i].p);
    let tl = null, wl = null, out = null;
    const reset = () => {
      bgState.p = 0; drawBg();
      wStates.forEach((s, i) => { s.p = 0; drawW(i); });
      gsap.set(menu, { y: "0%", scale: 1 });
      gsap.set(lang, { scale: 1.07, autoAlpha: 0 });
      gsap.set(titles, { autoAlpha: 0 });
      gsap.set(routes, { y: "130%", scale: 1.05 });
      gsap.set(exps, { x: 15, scale: 1.05, autoAlpha: 0 });
      gsap.set(addr, { x: -10, y: -10, scale: 0.95, autoAlpha: 0 });
      gsap.set(sep, { x: -20, scaleX: 0, autoAlpha: 0 });
      gsap.set(socials, { x: -10, y: -10, scale: 0.95, autoAlpha: 0 });
    };
    const build = () => {
      [tl, wl, out].forEach((t) => t?.kill());
      if (!wide.matches || reduce) {
        gsap.set([bgEl, ...widgets], { clearProps: "transform" });
        gsap.set([lang, titles, routes, exps, addr, sep, socials], { clearProps: "all" });
        gsap.set(menu, { yPercent: menu.classList.contains("is-open") ? 0 : -100, scale: menu.classList.contains("is-open") ? 1 : 0.95 });
        tl = gsap.fromTo(menu, { yPercent: -100, scale: 0.95 }, { yPercent: 0, scale: 1, duration: reduce ? 0 : 0.5, ease: "power2.out", paused: true });
        wl = out = null;
        return;
      }
      gsap.set(menu, { clearProps: "transform" });
      reset();
      tl = gsap.timeline({ paused: true })
        .to(bgState, { p: 1, duration: 2, ease: easeLong, onUpdate: drawBg }, 0)
        .to(lang, { scale: 1, autoAlpha: 1, duration: 1.7, ease: easeLong }, 0.35)
        // Original .5 — in the original recording the title is caught from .04 so it isn’t part of the stagger. The copy catches it from 0, so it moves only the same share (under .46) at .45
        .to(titles, { autoAlpha: 0.45, duration: 2, ease: easeLong }, 0.15)
        .to(routes, { y: "0%", scale: 1, duration: 2.7, stagger: 0.09, ease: easeLong }, "<+=.07")
        .to(exps, { x: 0, scale: 1, autoAlpha: 1, duration: 2.7, stagger: 0.09, ease: easeLong }, "<")
        .to(addr, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 2.3, ease: easeLong }, 0.3)
        .to(sep, { x: 0, scaleX: 1, autoAlpha: 1, duration: 2.3, ease: easeLong }, 0.35)
        .to(socials, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 2, stagger: 0.05, ease: easeLong }, 0.4);
      wl = gsap.timeline({ paused: true });
      widgets.forEach((w, i) => wl.to(wStates[i], { p: 1, duration: 2.9, ease: easeLong, onUpdate: () => drawW(i) }, 0.2 * i));
      out = gsap.fromTo(menu, { y: "0%", scale: 1 }, { y: "-100%", scale: 0.95, duration: 0.5, ease: "power2.out", paused: true, onComplete: reset });
      if (menu.classList.contains("is-open")) { tl.progress(1); wl.progress(1); }
    };
    toggleMenu = (on) => {
      menu.classList.toggle("is-open", on);
      menu.inert = !on;
      root.dataset.menu = on ? "open" : "";
      menuBtn.setAttribute("aria-expanded", on);
      on ? lenis?.stop() : lenis?.start();
      if (!out) { on ? tl.play() : tl.reverse(); return; }
      if (on) { if (out.isActive()) { out.pause(); reset(); } tl.restart(); wl.restart(); }
      else { tl.pause(); wl.pause(); out.restart(); }
    };
    build();
    menu.classList.add("is-ready");
    wide.addEventListener("change", build);
    addEventListener("resize", () => !menu.classList.contains("is-open") && out && reset());
    menuBtn.addEventListener("click", () => toggleMenu(!menu.classList.contains("is-open")));
    // The current page link is marked separately like the original (first line only)
    [...routes].find((a) => new URL(a.href).pathname.replace(/\/index\.html$/, "/") === here)?.classList.add("is-current");
  }

  /* ───────── Title block — original: each line rises from below in .7s cubic-bezier(.13,.93,.13,.93), .07 stagger, at the 90% screen line. Hooked when the panel starts to clear ───────── */
  onEnter(() => gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-rise]").forEach((el) => {
      const lines = el.querySelectorAll(".l-split-line > span");
      if (!lines.length) return;
      gsap.from(lines, { yPercent: 105, duration: 0.7, stagger: 0.07, ease: easeIn, scrollTrigger: { trigger: el, start: "0% 90%", once: true } });
    });
    document.querySelectorAll("[data-words]").forEach((el) => {
      const s = new SplitText(el, { type: "words" });
      gsap.fromTo(s.words, { opacity: 0.15 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "0% 70%", end: "100% 40%", scrub: true } });
    });
    document.querySelectorAll("[data-marquee-scroll]").forEach((el) => {
      gsap.fromTo(el, { xPercent: 0 }, { xPercent: -50, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "0% 100%", end: "100% 0%", scrub: true } });
    });
    document.querySelectorAll("[data-pop]").forEach((el) => {
      gsap.from(el, { y: 60, opacity: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "0% 90%", once: true } });
    });
  }));

  /* ───────── Review row — flows by itself (40s per loop) ───────── */
  document.querySelectorAll(".l-reviews__track").forEach((t) => {
    if (reduce) return;
    [...t.children].forEach((c) => { const k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); t.append(k); });
    const tw = gsap.to(t, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    t.addEventListener("mouseenter", () => gsap.to(tw, { timeScale: 0.2, duration: 0.5 }));
    t.addEventListener("mouseleave", () => gsap.to(tw, { timeScale: 1, duration: 0.5 }));
  });

  /* FAQ: in the original only one opens at a time. Answer max-height .27s ease-out, chevron -180° over the same length (css) */
  document.querySelectorAll(".l-faq").forEach((faq) => {
    const items = [...faq.querySelectorAll(".l-acc")];
    const set = (a, on) => {
      const q = a.querySelector(".l-acc__q"), body = a.querySelector(".l-acc__a");
      body.style.setProperty("--h", body.scrollHeight + "px");
      a.classList.toggle("is-open", on);
      q.setAttribute("aria-expanded", on);
    };
    items.forEach((a) => a.querySelector(".l-acc__q").addEventListener("click", () => {
      const on = !a.classList.contains("is-open");
      items.forEach((b) => b !== a && b.classList.contains("is-open") && set(b, false));
      set(a, on);
      setTimeout(() => ScrollTrigger.refresh(), 300);
    }));
  });

  /* ───────── Stage ───────── */
  const host = document.querySelector(".l-stage");
  if (!host || !window.THREE) return;
  const T = window.THREE;
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = T.NoToneMapping;
  host.append(renderer.domElement);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  // CSS values are sRGB — they must be converted into three’s working color space (linear) so the same color shows on screen
  const srgb = (v) => new T.Color().setRGB(...cssColor(v), T.SRGBColorSpace);
  const bg = srgb(STAGE[document.querySelector("[data-stage]")?.dataset.stage || "white"]);
  scene.background = bg;

  // Light box for reflection and refraction — bake a few white panels with PMREM and use as the environment
  const pm = new T.PMREMGenerator(renderer);
  const env = new T.Scene();
  env.background = new T.Color(0.35, 0.35, 0.4);
  const panel = (w, h, x, y, z, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k, k, k), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
  panel(8, 3, 0, 6, 2, 4); panel(3, 8, -7, 0, 1, 2.5); panel(3, 6, 7, 1, -2, 2); panel(10, 2, 0, -6, 3, 1.2);
  scene.environment = pm.fromScene(env, 0.03).texture;

  // Glass shards — thinly pushed triangles with transmission·refraction. As in the original they float around the screen and slowly turn
  const shards = new T.Group();
  scene.add(shards);
  const glass = new T.MeshPhysicalMaterial({ transmission: 1, thickness: 0.35, roughness: 0.04, ior: 1.45, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, envMapIntensity: 1.2, side: T.DoubleSide });
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const N = innerWidth < 768 ? 14 : 26;
  for (let i = 0; i < N; i++) {
    const s = new T.Shape();
    const a = 0.5 + rnd() * 1.4, b = 0.3 + rnd() * 1.2;
    s.moveTo(0, 0); s.lineTo(a, rnd() * 0.4); s.lineTo(rnd() * a * 0.6, b); s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 });
    g.center();
    const m = new T.Mesh(g, glass);
    m.position.set((rnd() - 0.5) * 18, (rnd() - 0.5) * 30, (rnd() - 0.5) * 6 - 1);
    m.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6);
    m.userData = { spin: (rnd() - 0.5) * 0.4, base: m.position.clone() };
    shards.add(m);
  }

  // Image tile sphere — the original work stage: hundreds of small slides form a sphere, then scatter and spread out
  const sphereSec = document.querySelector("[data-sphere]");
  let tiles = null, tileState = { p: 0 };
  if (sphereSec) {
    const M = innerWidth < 768 ? 160 : 320;
    tiles = new T.InstancedMesh(new T.PlaneGeometry(0.62, 0.36), new T.MeshBasicMaterial({ side: T.DoubleSide, toneMapped: false }), M);
    const pal = ["--kf-accent", "--site-cyan", "--site-green", "--site-pink", "--kf-surface", "--kf-contrast-bg"].map(srgb);
    const onS = [], flat = [];
    for (let i = 0; i < M; i++) {
      const y = 1 - (i / (M - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      onS.push(new T.Vector3(Math.cos(th) * r * 3, y * 3, Math.sin(th) * r * 3));
      flat.push(new T.Vector3((rnd() - 0.5) * 16, (rnd() - 0.5) * 9, -2 + rnd() * 4));
      tiles.setColorAt(i, pal[i % pal.length].clone().lerp(pal[(i * 7) % pal.length], rnd() * 0.5));
    }
    tiles.userData = { onS, flat };
    tiles.visible = false;
    scene.add(tiles);
    if (!reduce) gsap.to(tileState, { p: 1, ease: "none", scrollTrigger: { trigger: sphereSec, start: "0% 0%", end: "100% 100%", scrub: true, onToggle: (st) => (tiles.visible = st.isActive) } });
    else tiles.visible = false;
  }
  const dummy = new T.Object3D(), up = new T.Vector3(0, 0, 1);
  function placeTiles(t) {
    const { onS, flat } = tiles.userData;
    const spread = gsap.utils.clamp(0, 1, (tileState.p - 0.45) / 0.45);
    const e = spread * spread * (3 - 2 * spread);
    for (let i = 0; i < onS.length; i++) {
      dummy.position.copy(onS[i]).applyAxisAngle(new T.Vector3(0, 1, 0), t * 0.15 + tileState.p * 2).lerp(flat[i], e);
      if (e < 1) dummy.lookAt(dummy.position.clone().multiplyScalar(2)); else dummy.rotation.set(0, 0, 0);
      dummy.rotation.z += e * ((i % 7) - 3) * 0.05;
      const s = 0.6 + Math.min(1, tileState.p * 3) * 0.4;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      tiles.setMatrixAt(i, dummy.matrix);
    }
    tiles.instanceMatrix.needsUpdate = true;
  }

  // Rising rounded surface — the original green and sky-blue sections are not backgrounds but huge surfaces that rise roundly from below and cover the screen (drawn as one screen-space plane)
  const dome = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
    uniforms: { uRise: { value: 0 }, uColor: { value: new T.Color() }, uAspect: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }",
    fragmentShader: "uniform float uRise; uniform vec3 uColor; uniform float uAspect; varying vec2 vUv;\n" +
      "void main(){ float x = (vUv.x - 0.5) * uAspect; float h = uRise - 0.32 * x * x; float d = h - vUv.y; if (d < 0.0) discard;\n" +
      "float shade = 0.86 + 0.14 * smoothstep(0.0, 0.25, d) - 0.08 * smoothstep(0.25, 1.2, d); gl_FragColor = vec4(uColor * shade + vec3(0.18) * (1.0 - smoothstep(0.0, 0.012, d)), 1.0); }",
    depthTest: false, depthWrite: false,
  }));
  dome.frustumCulled = false;
  dome.renderOrder = -10;
  scene.add(dome);
  document.querySelectorAll("[data-dome]").forEach((sec) => {
    const c = cssColor(STAGE[sec.dataset.dome]);
    ScrollTrigger.create({ trigger: sec, start: "0% 100%", end: "100% 0%", onUpdate: (st) => { dome.material.uniforms.uColor.value.setRGB(...c); dome.material.uniforms.uRise.value = reduce ? (st.isActive ? 1.4 : 0) : Math.sin(st.progress * Math.PI) * 1.45; }, onToggle: (st) => { if (!st.isActive) dome.material.uniforms.uRise.value = 0; } });
  });

  // Center 3D object — replaces the original headset model with our own shape of the same size (a squashed ring + black interior)
  const objSec = document.querySelector("[data-object]");
  let obj = null, objState = { p: 0 };
  if (objSec) {
    obj = new T.Group();
    const shell = new T.Mesh(new T.TorusGeometry(1.7, 0.55, 32, 96), new T.MeshPhysicalMaterial({ color: 0xd9d9de, metalness: 0.85, roughness: 0.22, clearcoat: 1 }));
    shell.scale.set(1.35, 0.75, 1.1);
    const inner = new T.Mesh(new T.CylinderGeometry(1.55, 1.55, 0.6, 64, 1, true), new T.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, side: T.DoubleSide }));
    inner.rotation.x = Math.PI / 2; inner.scale.set(1.3, 1, 0.72);
    obj.add(shell, inner);
    obj.visible = false;
    scene.add(obj);
    gsap.to(objState, { p: 1, ease: "none", scrollTrigger: { trigger: objSec, start: "0% 100%", end: "100% 0%", scrub: true, onToggle: (st) => (obj.visible = st.isActive) } });
  }

  // Background color per section — changes in .7s as the section passes the screen center
  document.querySelectorAll("[data-stage]").forEach((sec) => {
    // The header bar panel follows the stage color, but for sections with a photo (the blurred photo in the first Work section) data-head decides
    const go = () => { const c = srgb(STAGE[sec.dataset.stage] || "--kf-bg"); gsap.to(bg, { r: c.r, g: c.g, b: c.b, duration: reduce ? 0 : 0.7, ease: "power2.out", overwrite: true }); root.dataset.head = sec.dataset.head || (/purple|black|navy/.test(sec.dataset.stage) ? "light" : "dark"); };
    ScrollTrigger.create({ trigger: sec, start: "0% 50%", end: "100% 50%", onEnter: go, onEnterBack: go });
  });

  const mouse = { x: 0, y: 0, tx: 0, ty: 0, fx: 0, fy: 0 };
  if (fine) addEventListener("pointermove", (e) => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5; });
  // The original hero title is text inside the stage, so it shifts along when the camera turns to follow the cursor (settle .07s) — the copy’s title is document text, so the same shift is passed in as a variable
  const followers = reduce || !fine ? [] : [...document.querySelectorAll("[data-follow]")];
  const follow = () => {
    // The original camera pushes the title only a few px from cursor end to end (cursor-sweep response area 15%) — the copy’s title is larger, so it ends up around 3px
    const nx = mouse.fx + (mouse.tx - mouse.fx) * 0.6, ny = mouse.fy + (mouse.ty - mouse.fy) * 0.6;
    if (Math.abs(nx - mouse.fx) < 1e-4 && Math.abs(ny - mouse.fy) < 1e-4) return;
    mouse.fx = nx; mouse.fy = ny;
    followers.forEach((el) => { el.style.setProperty("--mx", (nx * 3.5).toFixed(2)); el.style.setProperty("--my", (ny * 2).toFixed(2)); });
  };
  function size() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  addEventListener("resize", size);
  // Precompile shaders before the first frame — so the first cursor move or scroll doesn’t stall
  renderer.compile(scene, camera);
  let last = 0, visible = true;
  document.addEventListener("visibilitychange", () => (visible = !document.hidden));
  gsap.ticker.add((t) => {
    // Not drawn while the menu is open with the white panel covering the stage, or while the transition panel covers it — so panel and widget 3D motion and the body drop-out stay smooth
    if (!visible || leaving || root.dataset.menu === "open") return;
    const dt = last ? Math.min(0.1, Math.max(0.001, t - last)) : 0.016;
    last = t;
    mouse.x += (mouse.tx - mouse.x) * 0.25;
    mouse.y += (mouse.ty - mouse.y) * 0.25;
    if (followers.length) follow();
    const sy = (lenis ? lenis.scroll : scrollY) / innerHeight;
    shards.children.forEach((m, i) => {
      if (!reduce) { m.rotation.x += m.userData.spin * dt; m.rotation.y += m.userData.spin * 0.7 * dt; }
      const b = m.userData.base;
      m.position.y = ((b.y + sy * (1.2 + (i % 3) * 0.5) + 15) % 30 + 30) % 30 - 15;
      m.position.x = b.x + mouse.x * (2.4 + (i % 4) * 0.8);
      m.rotation.z += mouse.x * 0.02;
    });
    shards.rotation.y = mouse.x * 0.3;
    shards.rotation.x = mouse.y * 0.2;
    if (tiles?.visible) { placeTiles(t); tiles.rotation.y = mouse.x * 0.4; tiles.rotation.x = mouse.y * 0.25; }
    if (obj?.visible) { obj.position.y = -3.2 + objState.p * 2.6; obj.rotation.set(0.9 - objState.p * 0.9 + mouse.y * 0.2, objState.p * 1.2 - 0.6 + mouse.x * 0.3, 0); }
    dome.material.uniforms.uAspect.value = camera.aspect;
    renderer.render(scene, camera);
  });
})();
