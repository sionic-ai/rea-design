// Symptom detail: a simulator narrowing the field of view with an age scale, curved plate unfolding, film strip flow, help card wheel, header logo folding.
// View change .6s power3 · card expand .6s cubic-bezier(.23,1,.32,1) · curvature 30vh→6vh · film 6°→2° · -40rem · wheel +18°→-18° (all scrub)
(() => {
  const SW = window.SW;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $$("[data-ico]").forEach((el) => SW.ringIcon(el, el.dataset.ico));
  $$("[data-logo]").forEach((el) => (el.innerHTML = SW.logo()));

  // Sound button is look only: when off (pressed) a slash is drawn across the headphones
  const sound = $(".sw-sound");
  sound?.addEventListener("click", () => {
    const on = sound.getAttribute("aria-pressed") === "true";
    sound.setAttribute("aria-pressed", String(!on));
    sound.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
  });

  // ── Years scale: 0~17 cells (17 dots + handle spot at the bottom), value 0~20 years. The lower you go, the narrower the view
  const STOPS = 17;
  const track = $(".sim__track"), handle = $(".sim__handle"), val = $(".sim__val b"), veil = $(".sim__veil");
  const small = () => innerWidth < 650;
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  let idx = STOPS;
  // View curtain (WebGL): original tunnel shader values — as degree s rises, the ellipse (width .75 · height stretched to 1.2) lens vignette turns into a circle fit to the aspect ratio,
  // Remaining radius .95→.3 · edge softness .55→.16. Equivalent to multiplying the scene color by a vignette, so cover with a background-color film by (1 − vignette)
  const sev = { s: 1 };
  const veilGL = (() => {
    if (!window.THREE) return null;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false }); } catch { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0, 0);
    veil.append(renderer.domElement);
    veil.classList.add("is-gl");
    const u = { uS: { value: sev.s }, uRes: { value: new THREE.Vector2(1, 1) }, uShade: { value: new THREE.Color(SW.tone("var(--kf-bg)")) } };
    const mat = new THREE.ShaderMaterial({
      uniforms: u,
      transparent: true,
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        uniform float uS;
        uniform vec2 uRes;
        uniform vec3 uShade;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv - 0.5;
          float lens = length(p * vec2(0.75, 1.2));
          float tunnel = length(vec2(p.x * uRes.x / uRes.y, p.y));
          float d = mix(lens, tunnel, uS);
          float r = mix(0.95, 0.3, uS);
          float soft = mix(0.55, 0.16, uS);
          float keep = smoothstep(r, r - soft, d);
          gl_FragColor = vec4(uShade, 1.0 - keep);
        }`,
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const cam = new THREE.Camera();
    const fit = () => { renderer.setSize(veil.clientWidth, veil.clientHeight); u.uRes.value.set(veil.clientWidth, veil.clientHeight); draw(); };
    const draw = () => { u.uS.value = sev.s; renderer.render(scene, cam); };
    new ResizeObserver(fit).observe(veil);
    return { draw };
  })();
  const layoutRuler = () => {
    const h = track.offsetHeight;
    track.style.setProperty("--step", `${h / STOPS}px`);
    track.style.backgroundPosition = `center ${-h / STOPS / 2}px`;
    gsap.set(handle, { top: track.offsetTop + (idx / STOPS) * h });
  };
  const setIdx = (i, instant) => {
    idx = Math.max(0, Math.min(STOPS, Math.round(i)));
    val.textContent = String(Math.round((idx / STOPS) * 20)).padStart(2, "0");
    const h = track.offsetHeight;
    const d = instant || SW.reduced ? 0 : 0.6;
    gsap.to(handle, { top: track.offsetTop + (idx / STOPS) * h, duration: d, ease: "power3", overwrite: "auto" });
    if (veilGL) return gsap.to(sev, { s: idx / STOPS, duration: d, ease: "power3", overwrite: "auto", onUpdate: veilGL.draw });
    // Without WebGL, only the circular mask
    const rMin = (small() ? 19 : 27) * rem(), rMax = 120 * rem();
    gsap.to(veil, { "--r": `${rMax + (rMin - rMax) * (idx / STOPS)}px`, duration: d, ease: "power3", overwrite: "auto" });
  };
  layoutRuler();
  setIdx(STOPS, true);
  addEventListener("resize", () => { layoutRuler(); setIdx(idx, true); });
  let dragging = false;
  const fromY = (y) => { const r = track.getBoundingClientRect(); return ((y - r.top) / r.height) * STOPS; };
  [handle, track].forEach((el) => el.addEventListener("pointerdown", (e) => {
    dragging = true;
    el.setPointerCapture(e.pointerId);
    setIdx(fromY(e.clientY));
  }));
  [handle, track].forEach((el) => el.addEventListener("pointermove", (e) => dragging && setIdx(fromY(e.clientY))));
  addEventListener("pointerup", () => (dragging = false));
  handle.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx(idx - 1); }
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(idx + 1); }
  });

  const card = $(".sim__card");
  card.addEventListener("click", () => card.setAttribute("aria-expanded", String(card.classList.toggle("is-open"))));
  // Scroll-down button: goes down one screen height in 1.5s
  $(".sim__cue").addEventListener("click", () => (SW.lenis ? SW.lenis.scrollTo(innerHeight, { duration: 1.5 }) : scrollTo({ top: innerHeight, behavior: "smooth" })));
  // During the first 25% of the hero scroll, the ticks, card and next link rise 8vh and the down button 20vh, disappearing in the first 60% (power1.inOut, scrub)
  if (!SW.reduced) {
    const side = $$(".sim__ruler, .sim__card, .sim__next"), cue = $$(".sim__cue");
    gsap.timeline({ defaults: { ease: "power1.inOut" }, scrollTrigger: { trigger: document.body, start: "top top", end: () => `top top-=${innerHeight * 0.25}`, scrub: true, invalidateOnRefresh: true } })
      .to(side, { y: () => -0.08 * innerHeight, duration: 1 }, 0)
      .to(cue, { y: () => -0.2 * innerHeight, duration: 1 }, 0)
      .to([...side, ...cue], { autoAlpha: 0, duration: 0.6 }, 0);
  }

  // ── Header: over a cream panel, the logo keeps only its ring
  const head = $(".sw-head");
  ScrollTrigger.create({ trigger: ".paper-zone", start: "top 5%", end: "bottom 5%", toggleClass: { targets: head, className: "is-ring" } });

  // ── Help card wheel: card width + gap split at angles fitted to the circle circumference and inserted
  const stage = $(".help__stage"), cards = $$(".hcard");
  const wheel = { rot: 0 };
  let step = 0;
  const placeCards = () => {
    const cs = getComputedStyle(stage);
    const R = parseFloat(cs.getPropertyValue("--R")) / 100 * innerWidth;
    const cw = parseFloat(cs.getPropertyValue("--cardW")) * rem();
    step = ((cw + 3 * rem()) / R) * (180 / Math.PI);
    cards.forEach((c, i) => gsap.set(c, { rotation: (i - (cards.length - 1) / 2) * step + wheel.rot }));
  };
  placeCards();
  addEventListener("resize", placeCards);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const curve = $(".seeing__curve");
    gsap.fromTo(curve, { "--cv": "30vh" }, { "--cv": "6vh", ease: "none", scrollTrigger: { trigger: ".seeing", start: "bottom bottom", end: "bottom top", scrub: true } });

    gsap.fromTo(".film__strip", { rotation: 6 }, { rotation: 2, ease: "none", scrollTrigger: { trigger: ".film", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".film__track", { x: 0 }, { x: "-40rem", ease: "none", scrollTrigger: { trigger: ".film", start: "top bottom", end: "bottom top", scrub: true } });

    gsap.fromTo(wheel, { rot: 18 }, {
      rot: -18, ease: "none",
      onUpdate: placeCards,
      scrollTrigger: { trigger: ".help", start: "top bottom", end: "bottom top", scrub: true },
    });
  });
})();
