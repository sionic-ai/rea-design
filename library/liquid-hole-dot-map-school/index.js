// First page only: liquid-hole dot map (three r177 shader) · video playback · hero text · Pick up · newsletter slider (Swiper 8.4.7) · schedule book · feature header/box
(() => {
  const { gsap, isPC, reduce, MAPS, drawDots, rgbOf, makeSwiper, $, $$ } = window.MK;
  const bg = $(".t-bg"), hero = $('[data-trigger="hero"]');
  // Original U: liquid hole size · opening circle size · map pull-in (0 centers the map, 1 centers the school spot on screen)
  const U = { liquid: { value: 0 }, sphere: { value: 0 }, focus: { value: 0 } };
  if (reduce) Object.assign(U, { liquid: { value: isPC() ? 0.6 : 0.35 }, sphere: { value: isPC() ? 5 : 3 }, focus: { value: 1 } });

  // ── Video: loops silently. Plays when the liquid hole starts to open, and the poster lifts away over .3s ──
  const video = $(".t-bg__movie video"), poster = $(".t-bg__movie .poster");
  const play = () => video?.play().then(() => poster?.classList.add("is-hidden")).catch(() => poster?.classList.remove("is-hidden"));
  // Original data-toggle-video-play-state: feature boxes and three-way links pause when they touch the top of the screen, and play again when the newsletter (a cell where video shows through frosted glass) is visible
  function initVideoStates() {
    if (!video) return;
    $$("[data-video]").forEach((el) => {
      const on = el.dataset.video === "on";
      ScrollTrigger.create({ trigger: el, start: on ? "top bottom" : "top top", end: on ? "bottom top" : "bottom bottom",
        onEnter: () => (on ? play() : video.pause()), onLeaveBack: () => (on ? video.pause() : play()) });
    });
  }

  // ── Liquid hole: original shader style — scene 1 (three circles spread, each .5 later, over a sky-blue background dot map of a country) → the fourth circle opens scene 2 (on a white background world dot map
  //    Nine blobs (8 move over time, 1 follows the mouse) cut at threshold .3 open a hole). The map image is a dot bitmap newly baked from open map data ──
  let render = null;
  function initLiquid() {
    const world = $("[data-liquid]");
    const T = window.THREE;
    if (!world || !T) return;
    let renderer = null;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { renderer = null; }
    if (!renderer) return;
    world.append(renderer.domElement);
    renderer.setClearColor(0x000000, 0);
    const size = () => ({ w: innerWidth, h: isPC() ? innerHeight : screen.height });
    let { w, h } = size();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    // Dot texture: baked at the same ratio as the original sheets — world 2600×1569 · Country 1980×1980, dot spacing (15 · 32) and dot diameter (8.5 · 16)
    const texOf = (m, cw, ch, ratio) => { const t = new T.CanvasTexture(drawDots(document.createElement("canvas"), m, cw, ch, ratio)); t.colorSpace = T.NoColorSpace; return t; };
    const globalTex = texOf(MAPS.world, 1730, 1044, 0.57), japanTex = texOf(MAPS.japan, 1240, 1240, 0.5);
    const school = new T.Vector2((MAPS.japan.school[0] + 0.5) / MAPS.japan.cols, 1 - (MAPS.japan.school[1] + 0.5) / MAPS.japan.rows);
    const col = (n) => new T.Vector3(...rgbOf(n).map((v) => v / 255));
    const uni = {
      uResolution: { value: new T.Vector2(w, h) }, uScreenAspect: { value: w / h },
      uGlobalTexture: { value: globalTex }, uGlobalAspect: { value: MAPS.world.aspect },
      uJapanTexture: { value: japanTex }, uJapanAspect: { value: 1 }, uJapanScale: { value: isPC() ? 0.6835336538 : 0.9 },
      uRedCentroid: { value: school }, uTime: { value: 0 }, uScale: { value: 1 }, uSphereSize: { value: U.sphere.value }, uFocus: { value: U.focus.value }, uMouse: { value: new T.Vector2(0, 0) },
      uWhite: { value: col("--kf-bg") }, uLightNavy: { value: col("--site-dot") }, uNavy: { value: col("--site-navy") },
    };
    const mat = new T.ShaderMaterial({
      uniforms: uni, transparent: true, depthTest: false,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime, uScale, uSphereSize, uFocus, uScreenAspect, uGlobalAspect, uJapanAspect, uJapanScale;
        uniform vec2 uResolution, uMouse, uRedCentroid;
        uniform sampler2D uGlobalTexture, uJapanTexture;
        uniform vec3 uWhite, uLightNavy, uNavy;
        vec2 fitTex(vec2 uv, float aspect, bool cover) {
          vec2 r = cover ? vec2(min(uScreenAspect / aspect, 1.0), min(aspect / uScreenAspect, 1.0)) : vec2(max(uScreenAspect / aspect, 1.0), max(aspect / uScreenAspect, 1.0));
          return (uv - 0.5) * r + 0.5;
        }
        float blob(vec2 uv, vec2 p, float r) { vec2 pos = uv - 0.5; pos.x *= uResolution.x / uResolution.y; return pow(max(1.0 - length(pos - p), 0.0), r); }
        float sphere(vec2 uv, float idx) {
          float s = max(uSphereSize - idx * 0.5, 0.0);
          return s > 0.0 ? clamp((blob((uv - 0.5) / s + 0.5, vec2(0.0), 0.5) - 0.5) * 10000.0, 0.0, 1.0) : 0.0;
        }
        float liquid(vec2 uv, float t, float size) {
          uv = (uv - 0.5) / uScale + 0.5;
          uv.y -= 0.05;
          vec2 m = uMouse; m.x *= uResolution.x / uResolution.y;
          float v = blob(uv, vec2(0.0), size);
          v += blob(uv, vec2(0.0, sin(t) * -0.2), size);
          v += blob(uv, vec2(sin(t) * -0.3, 0.0), size);
          v += blob(uv, vec2(sin(t) * 0.35, sin(t) * 0.3), size);
          v += blob(uv, vec2(cos(t) * -0.3, sin(t) * 0.15), size);
          v += blob(uv, vec2(sin(t) * -0.35, cos(t) * 0.3), size);
          v += blob(uv, vec2(cos(t) * 0.3, sin(t) * -0.15), size);
          v += blob(uv, vec2(cos(t) * 0.3, sin(t) * -0.25), size);
          v += blob(uv, m * 0.5, size);
          return clamp((v - 0.3) * 10000.0, 0.0, 1.0);
        }
        vec4 scene01(vec2 uv) {
          uv = (uv - 0.5) / uJapanScale + 0.5;
          vec2 tuv = fitTex(uv, uJapanAspect, false);
          tuv += (uRedCentroid - 0.5) * uFocus;
          vec4 tex = texture2D(uJapanTexture, tuv);
          float a = tex.a * step(0.0, tuv.x) * step(tuv.x, 1.0) * step(0.0, tuv.y) * step(tuv.y, 1.0);
          vec3 c = mix(uLightNavy, uWhite, a);
          c = mix(c, uWhite, sphere(uv, 0.0) - 0.5);
          c = mix(c, uWhite, sphere(uv, 1.0));
          c = mix(c, uNavy, sphere(uv, 2.0));
          return vec4(c, 1.0);
        }
        vec4 scene02(vec2 uv, float t) {
          float l = liquid(uv, t, 5.0);
          vec4 tex = texture2D(uGlobalTexture, fitTex(uv, uGlobalAspect, true));
          return vec4(mix(uWhite, uLightNavy, tex.a), 1.0 - l);
        }
        void main() {
          float t = uTime * 0.5;
          gl_FragColor = mix(scene01(vUv), scene02(vUv, t), sphere(vUv, 4.0));
        }`,
    });
    const scene = new T.Scene(), cam = new T.Camera();
    scene.add(new T.Mesh(new T.PlaneGeometry(2, 2), mat));
    renderer.compile(scene, cam);
    addEventListener("resize", () => {
      ({ w, h } = size());
      renderer.setSize(w, h);
      uni.uResolution.value.set(w, h);
      uni.uScreenAspect.value = w / h;
      uni.uJapanScale.value = isPC() ? 0.6835336538 : 0.9;
      U.sphere.value = isPC() ? 5 : 3;
      bg.style.setProperty("--val", U.liquid.value);
    });
    // Original: the ninth blob follows the cursor spot (relative to screen center ×.5) in .1s so the hole edge swells toward the cursor — when the cursor stops, it stays at that spot
    let mx = 0, my = 0, paused = false;
    if (!reduce) addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    // Original data-toggle-raf-state: when the feature box touches the top of the screen, drawing pauses (while the hole is fully open at 2.5 and only video shows)
    const body = $(".t-feature__body");
    if (body) ScrollTrigger.create({ trigger: body, start: "top top", end: "bottom bottom", onEnter: () => (paused = true), onLeaveBack: () => (paused = false) });
    render = () => {
      if (mx || my) gsap.to(uni.uMouse.value, { x: mx / w - 0.5, y: 1 - my / h - 0.5, duration: 0.1, overwrite: true });
      if (U.liquid.value > 0 && U.liquid.value < 2.5 && !reduce) uni.uTime.value += 0.01;
      uni.uSphereSize.value = U.sphere.value;
      uni.uScale.value = U.liquid.value;
      uni.uFocus.value = U.focus.value;
      bg.style.setProperty("--val", U.liquid.value);
      if (!paused) renderer.render(scene, cam);
    };
    gsap.ticker.add(render);
  }

  // ── Hero letters: at first each letter rises from the lower right (10% 15%) at .7×, and on scroll --val 0→1 pulls them up and out ──
  function splitChars(el) {
    const t = el.textContent;
    el.setAttribute("aria-label", t);
    el.innerHTML = [...t].map((c, i) => `<span class="ch" aria-hidden="true" style="--delay:${(i * 0.04).toFixed(2)}s">${c}</span>`).join("");
  }
  function initHero() {
    $$("[data-chars]").forEach(splitChars);
    const imp = $(".t-hero__important .important");
    // Opening order (original __top.first): opening curtain 1s · first-line text (after .7s) → map pull-in 1s (expo.out) → circle spread (3s) · second line → 1.5s later liquid hole 0→.6 (.65s, video plays) → English text · notice · headband
    const E = "expoScale(0.5,7,power2.out)";
    // Letters start from css translate 10% 15% · scale .7 — GSAP takes that value into transform and releases it to 0 (same path as the original)
    const reveal = { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.35, ease: E };
    const modules = $$(".l-header .logo a, .l-header .m-global, .l-header .m-sub, .l-header .m-lang, .l-header .m-req");
    if (reduce) { $(".m-splash")?.remove(); play(); return; }
    // On a second visit in the same tab (original window.name) it skips the regional map and circle bloom, opening only the text and hole directly on the world map
    const visited = window.name === "mk-visited";
    window.name = "mk-visited";
    gsap.set(modules, { opacity: 0 });
    gsap.set($$(".t-hero__en g"), { yPercent: 110 });
    gsap.to(".m-splash", { opacity: 0, duration: 1, ease: "power2.inOut", onComplete: () => $(".m-splash")?.remove() });
    const en = { yPercent: 0, opacity: 1, duration: 0.35, ease: E, stagger: { amount: 0.15, from: "start" },
      onStart: () => { if (imp) gsap.to(imp, { ...reveal }); gsap.to(modules, { opacity: 1, duration: 0.5, ease: "power2.inOut" }); } };
    if (visited) {
      U.sphere.value = isPC() ? 5 : 3;
      U.focus.value = 1;
      gsap.timeline()
        .to($$(".t-hero__copy .ch"), { ...reveal, delay: 0.5, stagger: { amount: 0.28, from: "start" } })
        .to(U.liquid, { value: isPC() ? 0.6 : 0.35, duration: 0.65, ease: E, onStart: play }, "<+0.28")
        .to($$(".t-hero__en g"), en, "<+0.5");
      return;
    }
    gsap.timeline()
      .to($$(".t-hero__copy .copy01 .ch"), { ...reveal, delay: 0.7, stagger: { amount: 0.28, from: "start" } })
      .to(U.focus, { value: 1, duration: 1, ease: "expo.out", onComplete: () => {
        gsap.to(U.sphere, { value: isPC() ? 5 : 3, duration: isPC() ? 3 : 2, ease: E });
        gsap.to($$(".t-hero__copy .copy02 .ch"), { ...reveal, delay: 1, stagger: { amount: 0.28, from: "start" } });
      } }, "<+0.1")
      .to(U.liquid, { value: isPC() ? 0.6 : 0.35, duration: 0.65, ease: E, onStart: play }, "+=1.5")
      .to($$(".t-hero__en g"), en, "<+0.5");
  }
  function initHeroScroll() {
    if (!hero) return;
    const enG = (i) => $$(".t-hero__en svg").map((s) => s.querySelectorAll("g")[i]).filter(Boolean);
    // Original: first line, notice and first English chunk at 0–20%, second line and second English chunk 0–25%, third English chunk 0–30% with --val 0→1 (follows with .3s ease.out)
    [
      { els: [$(".t-hero__copy .copy01"), $(".t-hero__important"), ...enG(0)], end: "20% top" },
      { els: [$(".t-hero__copy .copy02"), ...enG(1)], end: "25% top" },
      { els: enG(2), end: "30% top" },
    ].forEach(({ els, end }) => ScrollTrigger.create({ trigger: hero, start: "0% top", end,
      onUpdate: (st) => gsap.to(els.filter(Boolean), { "--val": st.progress, ease: "power1.out", duration: 0.3 }) }));
    // Liquid hole: .6 (phone .35) → 2.5 over the whole hero
    ScrollTrigger.create({ trigger: hero, start: "0% top", end: "bottom top",
      onUpdate: (st) => { const o = innerWidth >= 1025 ? 0.6 : 0.35; gsap.to(U.liquid, { value: o + (2.5 - o) * st.progress, ease: "power1.out", duration: 0.3 }); } });
  }

  // ── Pick up: active when the top touches the top of the screen · only the center card is bright and the sides get a black veil from the edges (the veil mask position shifts in .5s) ──
  function initPickup() {
    const sec = $(".t-pickup");
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top top", onEnter: () => sec.classList.add("is-active"), onLeaveBack: () => sec.classList.remove("is-active") });
    makeSwiper($(".t-pickup__body"), { loop: true, centeredSlides: true });
  }
  function initTimes() {
    const box = $(".t-times__body");
    if (box) makeSwiper(box, { loop: true, centeredSlides: true });
  }

  // ── Schedule book · feature heading · feature box: play once when visible ──
  function once(el, start, fn) {
    if (reduce) return fn();
    ScrollTrigger.create({ trigger: el, start, once: true, onEnter: fn });
  }
  // Binding rings: as in the original, clones as many as fit rings (1.4rem) and gaps (PC 14px · phone 5px) in the ring board height
  function fillRings() {
    $$(".schedule__mat").forEach((m) => {
      const first = m.firstElementChild;
      if (!first) return;
      [...m.children].slice(1).forEach((c) => c.remove());
      const gap = innerWidth <= 1024 ? 5 : 14, n = Math.floor((m.offsetHeight + gap) / (first.offsetHeight + gap));
      for (let i = 1; i < n; i++) m.append(first.cloneNode(true));
    });
  }
  function initReveals() {
    const sch = $(".schedule");
    if (sch) once(sch, "top 80%", () => sch.classList.add("is-open"));
    fillRings();
    if (window.ResizeObserver) $$(".schedule__mat").forEach((m) => new ResizeObserver(fillRings).observe(m.parentElement));
    $$(".schedule__more .more-btn").forEach((b) => b.addEventListener("click", () => {
      const body = b.closest(".schedule-box__inner").querySelector(".schedule__body");
      body.style.setProperty("--h", body.firstElementChild.offsetHeight + "px");
      body.classList.add("is-show");
      b.parentElement.remove();
    }));
    $$("[data-reveal]").forEach((el) => once(el, "top 70%", () => el.classList.add("is-active")));
    $$("[data-box]").forEach((el) => once(el, "top 80%", () => el.classList.add("is-in")));
  }

  // The original starts the opening sequence after load, once the map image is fully loaded
  document.readyState === "complete" ? initHero() : addEventListener("load", initHero, { once: true });
  initLiquid();
  initHeroScroll();
  initVideoStates();
  initPickup();
  initTimes();
  initReveals();
})();
