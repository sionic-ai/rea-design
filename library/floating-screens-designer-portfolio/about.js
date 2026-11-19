// About: scroll parallax of the tilted portrait photo (rising and falling + tilting more) · fact switching (line appears .4s power3.out + recording) ·
// Photo tunnel — over 4 screens 14 photos fly from depth -4200 toward the camera and pass by (the original is WebGL, this copy is CSS 3D).
(() => {
  const { mm } = window.IM;
  const MOTION = "(prefers-reduced-motion: no-preference)";

  // Portrait — original values: moves down .1px per 1px of scroll and tilts 10.5° more per screen
  mm.add(MOTION, () => {
    const hero = document.querySelector(".intro__hero");
    // Added on top of CSS rotate(-6.934°). GSAP rotation is a transform and would overlap the CSS rotate, so it starts from 0 to avoid rotating twice
    gsap.fromTo(".intro__frame", { y: 0, rotation: 0 }, { y: () => hero.offsetHeight * 0.1, rotation: () => 10.5 * (hero.offsetHeight / innerHeight), ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  });

  // Arrival — original order (after .2s): portrait .45 · title .8 · stickers 1.05/1.15 · line .85 (.8s power3.inOut) · number .9 · fact 1 · arrows 1.2 (.08 gap)
  // The portrait hangs from one corner (top left) like cloth as it enters — unfolds from .36x over 1.6s power2.out, with spots farther from the corner delayed by up to .17
  // Photos rise from below at height .97 and gather by .03, wave with a 1.3 ripple (.135 of the depth width), then settle in place (perspective 2740). Meanwhile the DOM photo is hidden
  window.IM.ready.then(() => document.fonts.ready).then(() => mm.add(MOTION, () => {
    const A = 0.2, frame = document.querySelector(".intro__frame"), tl = gsap.timeline({ delay: A });
    const cloth = fabric(frame), st = { p: 0 }, ease = gsap.parseEase("power2.out"), sway = hang(frame);
    tl.to(st, { p: 1, duration: 1.6, ease: "none", onStart: () => cloth?.start(), onUpdate: () => cloth?.draw(ease(st.p)), onComplete: () => { cloth?.stop(); frame.style.visibility = "visible"; sway.start(); } }, 0.45)
      .fromTo(".intro__line", { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.8, ease: "power3.inOut", immediateRender: true }, 0.85);
    if (!cloth) tl.set(frame, { visibility: "visible" }, 0.45).call(sway.start, null, 0.45);
    [...document.querySelectorAll(".intro__stickers .sticker")].forEach((el, i) => window.IM.rollIn(el, A + 1.05 + i * 0.1));
    [...document.querySelectorAll(".intro__arrows .btn")].forEach((el, i) => window.IM.rollIn(el, A + 1.2 + i * 0.08));
    return sway.stop;
  }));

  // The portrait follows the cursor as if hanging by a thread from top center (after arrival finishes, fine pointers only). Original values: from the cursor at the portrait center
  // Moves 49px horizontally and 35px vertically in proportion (−1…1) until it is long edge × 1.7 away, and tilts −3° · thread spring stiffness .04 · damping .54 (per frame) ·
  // Extra sway of horizontal speed × 1.5° (±10.5°) · back in place when the portrait is off screen
  function hang(frame) {
    const box = frame.parentElement, s = { x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0 }, m = { x: 0, y: 0, seen: false };
    const move = (e) => { m.x = e.clientX; m.y = e.clientY; m.seen = true; };
    let on = false, running = false;
    const rest = () => { Object.keys(s).forEach((k) => (s[k] = 0)); box.style.transform = ""; box.style.transformOrigin = ""; on = false; };
    const spring = (p, v, goal) => { s[v] = (s[v] + (goal - s[p]) * 0.04) * 0.54; s[p] += s[v]; };
    const tick = () => {
      box.style.transform = "";
      const b = frame.getBoundingClientRect(), live = m.seen && b.bottom > 0 && b.top < innerHeight;
      const reach = Math.max(frame.offsetWidth, frame.offsetHeight) * 1.7, k = (d) => (live ? gsap.utils.clamp(-1, 1, d / reach) : 0);
      const px = k(m.x - (b.left + b.width / 2)), py = k(m.y - (b.top + b.height / 2));
      spring("x", "vx", px * 49); spring("y", "vy", py * 35); spring("a", "va", -px * 3);
      const g = s.a + gsap.utils.clamp(-10.5, 10.5, -s.vx * 1.5);
      if (Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.a) + Math.abs(s.va) < 0.02 && Math.abs(g) < 0.01) return on && rest();
      on = true;
      box.style.transformOrigin = `50% ${(box.offsetHeight - frame.offsetHeight) / 2}px`;
      box.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px) rotate(${g.toFixed(3)}deg)`;
    };
    const fine = matchMedia("(pointer: fine)").matches;
    return {
      start: () => { if (!fine || running) return; running = true; addEventListener("pointermove", move, { passive: true }); gsap.ticker.add(tick); },
      stop: () => { running = false; removeEventListener("pointermove", move); gsap.ticker.remove(tick); rest(); },
    };
  }

  function fabric(frame) {
    if (!window.THREE) return null;
    const T = THREE, cv = document.createElement("canvas");
    cv.className = "intro__sheet";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    let r;
    try { r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch { cv.remove(); return null; }
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.setClearColor(0, 0);
    const css = (n, el = frame) => getComputedStyle(el).getPropertyValue(n).trim();
    const pic = document.createElement("canvas"), x = pic.getContext("2d"), label = frame.querySelector(".wf-img")?.dataset.label || "";
    pic.width = 512; pic.height = Math.round(512 * frame.offsetHeight / Math.max(1, frame.offsetWidth));
    x.fillStyle = css("--wf-fill"); x.fillRect(0, 0, pic.width, pic.height);
    x.strokeStyle = css("--wf-line"); x.lineWidth = 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(pic.width, pic.height); x.moveTo(pic.width, 0); x.lineTo(0, pic.height); x.stroke();
    x.fillStyle = css("--wf-fill-ink"); x.textAlign = "center"; x.textBaseline = "middle";
    x.font = `600 ${Math.round(pic.width / 30)}px ${css("--kf-font-sans")}`;
    x.fillText(label, pic.width / 2, pic.height / 2, pic.width * 0.9);
    const tex = new T.CanvasTexture(pic);
    tex.colorSpace = T.SRGBColorSpace;
    const mat = new T.ShaderMaterial({
      transparent: true, depthTest: false, side: T.DoubleSide,
      uniforms: { uMap: { value: tex }, uBox: { value: new T.Vector2(1, 1) }, uP: { value: 0 }, uLag: { value: 0.17 }, uRise: { value: 0 }, uGather: { value: 0.03 }, uRipple: { value: 0 }, uWaves: { value: 1.3 }, uRot: { value: 0 } },
      vertexShader: /* glsl */ `
        uniform vec2 uBox; uniform float uP, uLag, uRise, uGather, uRipple, uWaves, uRot;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec2 q = vec2(uv.x, 1.0 - uv.y);
          // The farther a point is from the hanging corner (top left), the later it settles back — it sits lowered by the remaining share, gathers, and sways
          float d = length(q * uBox) / length(uBox);
          float g = clamp((uP - uLag * d) / (1.0 - uLag), 0.0, 1.0);
          float rest = 1.0 - g * g * (3.0 - 2.0 * g);
          vec2 p = (q - 0.5) * uBox, c = -0.5 * uBox;
          float ph = 6.2831853 * (d * uWaves - uP);
          vec3 m = vec3((c.x - p.x) * uGather * rest + cos(ph) * uRipple * 0.3 * rest * d, uRise * rest, sin(ph) * uRipple * rest * d);
          vec2 s = p + m.xy;
          s = vec2(cos(uRot) * s.x - sin(uRot) * s.y, sin(uRot) * s.x + cos(uRot) * s.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(s.x, -s.y, m.z, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap; varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(uMap, vUv);
          #include <colorspace_fragment>
        }`,
    });
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(), mesh = new T.Mesh(new T.PlaneGeometry(1, 1, 32, 32), mat);
    scene.add(mesh);
    return {
      start: () => { cv.style.visibility = "visible"; frame.style.visibility = "hidden"; },
      stop: () => { cv.remove(); mat.dispose(); tex.dispose(); r.dispose(); },
      draw: (c) => {
        const W = innerWidth, H = innerHeight, b = frame.getBoundingClientRect(), w0 = frame.offsetWidth, h0 = frame.offsetHeight;
        const left = b.left + b.width / 2 - w0 / 2, top = b.top + b.height / 2 - h0 / 2, u = 0.36 + 0.64 * c, w = w0 * u, h = h0 * u;
        r.setSize(W, H, false);
        cam.fov = (2 * Math.atan(H / 2 / 2740) * 180) / Math.PI; cam.aspect = W / H; cam.near = 1; cam.far = 6000;
        cam.position.set(0, 0, 2740); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
        mesh.position.set(left + w / 2 - W / 2, H / 2 - (top + h / 2), 0);
        const U = mat.uniforms;
        U.uBox.value.set(w, h); U.uP.value = c; U.uRise.value = 0.97 * h; U.uRipple.value = 0.135 * w;
        U.uRot.value = (((parseFloat(css("rotate")) || 0) + (+gsap.getProperty(frame, "rotation") || 0)) * Math.PI) / 180;
        r.render(scene, cam);
      },
    };
  }

  // Flip facts
  const facts = [...document.querySelectorAll(".intro__fact")];
  const num = document.querySelector("[data-fact-num]");
  let at = 0;
  document.querySelectorAll("[data-fact-step]").forEach((b) => b.addEventListener("click", () => {
    const next = (at + Number(b.dataset.factStep) + facts.length) % facts.length;
    facts[at].hidden = true;
    facts[next].hidden = false;
    at = next;
    num.textContent = String(at + 1).padStart(2, "0");
    // Original: the new fact and number stand up again right away as a line entrance (recording included)
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) [facts[next], num].forEach((el) => window.IM.lines(el));
  }));

  // Photo tunnel
  const labels = [
    "Forest path scenery · overcast day · landscape", "Night alley · yellow street lamp · vertical", "Two feet on a skateboard · low angle · day",
    "Walking with a dog · backlit sunset · landscape", "Film photo · friends smiling · warm indoor light", "Mountain ridge and clouds · Wide landscape",
    "Running shoe laces · morning sunlight · close-up", "Coffee cup by window · soft natural light", "Bicycle on a downtown bridge · sunset",
    "Lakeside tent · dawn mist", "Concert stage lighting · dark interior", "Hand holding a film camera · Close-up",
    "Seaside promenade · clear daytime", "Sketchbook on a home desk · warm lighting",
  ];
  const tunnel = document.querySelector(".glimpse__tunnel");
  let seed = 7;
  const r = (a, b) => { seed = (seed * 9301 + 49297) % 233280; return a + (seed / 233280) * (b - a); };
  const photos = labels.map((label, i) => {
    const el = document.createElement("div");
    const w = r(200, 340), h = r(150, 262);
    el.className = "glimpse__photo ph";
    el.style.width = `calc(${w.toFixed(0)} * var(--px))`;
    el.style.height = `calc(${h.toFixed(0)} * var(--px))`;
    el.innerHTML = `<span class="wf-img" data-label="${label}"></span>`;
    tunnel.appendChild(el);
    const side = i % 2 ? 1 : -1;
    return { el, x: side * r(14, 38), y: r(-30, 30), z0: -4200 + i * 300 };
  });
  // Drift — original: chases the cursor position (screen −1…1) by .06 per frame, and the photo shifts 60px horizontally and 24px vertically (times --px) toward it.
  // Depth share .6 — photos on the screen plane (perspective distance) move by that much, closer ones more and farther ones less (screen movement = 60 × (.4 + .6 × perspective/distance))
  const drift = { x: 0, y: 0 }, P = 900;
  let prog = 0.62;
  const draw = () => photos.forEach((ph) => {
    const z = ph.z0 + prog * 5200, u = (0.4 * (P - z)) / P + 0.6, unit = Math.max(1, innerWidth / 1536);
    const o = gsap.utils.clamp(0, 1, (z + 4200) / 700) * gsap.utils.clamp(0, 1, (700 - z) / 300);
    ph.el.style.transform = `translate3d(calc(${ph.x}vw + ${(drift.x * 60 * unit * u).toFixed(2)}px), calc(${ph.y}vh + ${(drift.y * 24 * unit * u).toFixed(2)}px), ${z}px)`;
    ph.el.style.opacity = o.toFixed(3);
    ph.el.style.visibility = o < 0.01 ? "hidden" : "visible";
  });
  draw();
  mm.add(MOTION, () => {
    prog = 0;
    draw();
    ScrollTrigger.create({ trigger: ".glimpse", start: "top top", end: "bottom bottom", onUpdate: (s) => { prog = s.progress; draw(); } });
    if (!matchMedia("(pointer: fine)").matches) return;
    const stage = document.querySelector(".glimpse__stage"), m = { x: 0, y: 0 };
    const move = (e) => { m.x = gsap.utils.clamp(0, 1, e.clientX / innerWidth) * 2 - 1; m.y = gsap.utils.clamp(0, 1, e.clientY / innerHeight) * 2 - 1; };
    const tick = () => {
      const b = stage.getBoundingClientRect();
      if (b.bottom <= 0 || b.top >= innerHeight) return;
      const dx = (m.x - drift.x) * 0.06, dy = (m.y - drift.y) * 0.06;
      if (Math.abs(dx) + Math.abs(dy) < 1e-4) return;
      drift.x += dx; drift.y += dy;
      draw();
    };
    addEventListener("pointermove", move, { passive: true });
    gsap.ticker.add(tick);
    return () => { removeEventListener("pointermove", move); gsap.ticker.remove(tick); drift.x = drift.y = 0; };
  });
})();
