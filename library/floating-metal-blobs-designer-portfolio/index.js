// Home page: metal blob hero → (1024 and up) vertical wheel drives a horizontal strip → work list pinned, pausing at each work → bottom CTA.
// Original value: band fixed start "center center", length = Band horizontal overflow + screen height, during the first W/(W+H) x → -W and then it stops (scrub true)
//           photo grow start "left 120%" · Line mask start "left 100%" Gap .08 · strip end text opacity→0 y-100 power1.inOut gap .05
//           Work list length is work count ×100%, snap .2~.6s power2.out.
(() => {
  const SB = window.SB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();

  /* ---------- Bubble panel — original settings: hero is three accent-color bubbles (paints even the background, cursor bubble starts near the center),
     The Inspiration cell is a soft blob in one color of the panel opposite the background (size .8 · cursor 60px · appears when in view) ---------- */
  SB.blobs($(".hero__blobs"), { center: true });
  SB.blobs($(".inspire__blobs"), { soft: true, only: true, scale: 0.8, cursorPx: 60, opacity: 1, invert: true, auto: true });
  // Four photos the original opens with droplet splitting (design thinking video, quote photo, inspiration photo, bottom figure)
  [".ethos__img", ".quote__img", ".inspire__img", ".outro__img"].forEach((s) => SB.media($(s)));

  /* ---------- Hero entrance: the narrow sentence spreads out to both ends and the intro text rises line by line ---------- */
  const quote = $(".hero__quote");
  const bio = $(".hero__bio");
  SB.ready.then(() => {
    const tl = gsap.timeline();
    if (SB.desk()) tl.to(quote, { width: () => innerWidth - 12 * parseFloat(getComputedStyle(document.documentElement).fontSize), duration: 1.4, ease: "power3.inOut" }, 0.2);
    tl.set(bio, { opacity: 1 }, 0.9);
    SB.clipLines(tl, $(".hero__lead"), 0.9);
    tl.from(".hero__div", { opacity: 0, yPercent: 60, duration: 0.8, ease: "power3.out" }, 1.1);
    SB.clipLines(tl, $(".hero__small"), 1.2);
  });

  /* ---------- Work list: when it changes, the blurred glow color·phone screen·list highlight change together ---------- */
  const works = $(".works");
  const items = $$(".works__item");
  const screens = $$(".works__screen");
  const count = $(".works__count b");
  // Not skin: a dim light color pulled from each work’s own screen (the original uses a color set in the work data) — it is work content color, so even if the skin changes it stays that work’s color
  const PAL = [
    ["#8c8f99", "#c9cfd7", "#3c3e45", "#e9edf3"], // not skin: work content color
    ["#b48a8c", "#e3b8b5", "#6a4a52", "#f0d9d3"], // not skin: work content color
    ["#c9773f", "#f2b27a", "#7a3f22", "#f7d9b0"], // not skin: work content color
    ["#7fa3c9", "#a9c6e8", "#5f8f6a", "#dfe9f2"], // not skin: work content color
  ];
  // Soft glow that changes per work, using the same formula as the original PortfolioMeshGradientShader. Three color points orbit with sin·cos (time ×.5, starting at 41.5),
  // Passes through waves (.8) and swirls (.1) that shake bigger toward the center, mixed by inverse distance^3.5. Toward the new work color it approaches by .05 each frame.
  // In light mode, like the original: saturation x.8, brightness +.1, .12 toward white
  const glow = (() => {
    const canvas = $(".works__grad canvas");
    if (!canvas || !window.THREE) return null;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);
    camera.position.z = 1;
    const target = [0, 1, 2].map(() => new THREE.Color()), current = [0, 1, 2].map(() => new THREE.Color()), shown = new THREE.Color(), white = new THREE.Color(1, 1, 1), hsl = {};
    const u = { u_time: { value: 0 }, u_colors: { value: [0, 1, 2].map(() => new THREE.Vector4(1, 1, 1, 1)) }, u_distortion: { value: 0.8 }, u_swirl: { value: 0.1 }, u_opacity: { value: 1 } };
    const frag = `precision mediump float;
uniform float u_time; uniform vec4 u_colors[3]; uniform float u_distortion; uniform float u_swirl; uniform float u_opacity;
varying vec2 vUv;
vec2 rot(vec2 uv, float th) { return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv; }
vec2 pointAt(int i, float t) {
  float a = float(i) * 0.37, b = 0.6 + fract(float(i) / 3.0) * 0.9, c = 0.8 + fract(float(i + 1) / 4.0);
  return 0.5 + 0.5 * vec2(sin(t * b + a), cos(t * c + a * 1.5));
}
void main() {
  vec2 uv = vUv;
  float t = 0.5 * (u_time + 41.5);
  float radius = smoothstep(0.0, 1.0, length(uv - 0.5)), centre = 1.0 - radius;
  for (float i = 1.0; i <= 2.0; i++) {
    uv.x += u_distortion * centre / i * sin(t + i * 0.4 * smoothstep(0.0, 1.0, uv.y)) * cos(0.2 * t + i * 2.4 * smoothstep(0.0, 1.0, uv.y));
    uv.y += u_distortion * centre / i * cos(t + i * 2.0 * smoothstep(0.0, 1.0, uv.x));
  }
  vec2 r = rot(uv - 0.5, -3.0 * u_swirl * radius) + 0.5;
  vec3 col = vec3(0.0); float op = 0.0, sum = 0.0;
  for (int i = 0; i < 3; i++) {
    float w = 1.0 / (pow(length(r - pointAt(i, t)), 3.5) + 1e-3);
    col += u_colors[i].rgb * u_colors[i].a * w; op += u_colors[i].a * w; sum += w;
  }
  gl_FragColor = vec4(col / max(1e-4, sum), clamp(op / max(1e-4, sum), 0.0, 1.0) * u_opacity);
}`;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}", fragmentShader: frag, uniforms: u, transparent: true, depthWrite: false })));
    const size = () => { const r = canvas.getBoundingClientRect(); renderer.setSize(Math.max(2, r.width), Math.max(2, r.height), false); };
    size();
    new ResizeObserver(size).observe(canvas);
    let visible = true, last = performance.now(), first = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.max(0, now - last) / 1000;
      last = now;
      if (!visible || document.hidden) return;
      u.u_time.value += dt;
      const light = document.documentElement.classList.contains("sb-light");
      current.forEach((c, k) => {
        c.lerp(target[k], 0.05);
        shown.copy(c);
        if (light) { shown.getHSL(hsl); shown.setHSL(hsl.h, hsl.s * 0.8, Math.min(1, hsl.l + 0.1)); shown.lerp(white, 0.12); }
        u.u_colors.value[k].set(shown.r, shown.g, shown.b, 1);
      });
      renderer.render(scene, camera);
    });
    return {
      opacity: u.u_opacity,
      setColors: (hexes) => {
        hexes.slice(0, 3).forEach((h, k) => target[k].set(h));
        if (first) { current.forEach((c, k) => c.copy(target[k])); first = false; }
      },
    };
  })();
  let active = -1, moveScreens = null;
  const setWork = (i) => {
    if (i === active) return;
    active = i;
    items.forEach((el, k) => el.classList.toggle("is-active", k === i));
    screens.forEach((el, k) => el.classList.toggle("is-on", k === i));
    moveScreens?.(i);
    glow?.setColors(PAL[i]);
    count.textContent = String(i + 1).padStart(2, "0");
  };
  setWork(0);
  // Original: switching to that work on name hover happens only at 1024 and up — on phones it changes by dragging only
  items.forEach((el, i) => el.addEventListener("mouseenter", () => { if (SB.desk()) setWork(i); }));

  // The condition group fires if any one matches — without a separate phone condition this branch never runs at 1023 and below
  mm.add({ desk: "(min-width: 1024px)", phone: "(max-width: 1023px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { desk, reduce } = ctx.conditions;

    // From when the work list meets the top from the bottom of the screen: title and soft glow go 0 → 1, and the phone screen rises from below (desktop 250px · phone 40px, phone from opacity .6)
    // (on desktop, build after the horizontal strip is pinned — building first means the start point isn’t shifted by the strip length)
    const worksEntry = () => {
      if (reduce) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: works, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } })
        .fromTo(".works__title", { opacity: 0 }, { opacity: 1, duration: 1, ease: "none" }, 0)
        .fromTo(".works__phone", { y: desk ? 250 : 40, opacity: desk ? 1 : 0.6 }, { y: 0, opacity: 1, duration: 1, ease: "none" }, 0);
      // Faint light is raised via shader opacity (u_opacity) like the original
      if (glow) tl.fromTo(glow.opacity, { value: 0 }, { value: 1, duration: 1, ease: "none" }, 0);
    };

    if (!desk) {
      worksEntry();
      // Phone: when the vertically stacked scene is visible, each line rises in turn
      if (!reduce) $$(".ethos__p, .inspire__t1, .inspire__t2").forEach((p) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: "top 80%" } });
        SB.clipLines(tl, p, 0, { stagger: 0.08 });
      });
      // Phone: drag the name strip sideways to go one cell at a time — original Draggable settings as is (type x · no inertia · edge resistance 0 · must move over 10px to start dragging · drag works over links too).
      // One cell = Strip width − 80px. Dragging more than min(56px, slot×.12) from the press point moves exactly one slot in that direction, and while dragging it switches right to that work (phone screen .55s power2.out),
      // On release it snaps to the slot in .4s power2.out. Pressing without dragging goes to that work.
      const view = $(".works__list"), track = $(".works__track");
      const step = () => Math.max(0, view.clientWidth - 80);
      const snap = (i, animate = true) => (animate ? gsap.to(track, { x: -i * step(), duration: 0.4, ease: "power2.out", overwrite: "auto" }) : gsap.set(track, { x: -i * step() }));
      gsap.set(screens, { opacity: 1, yPercent: (k) => (k - active) * 105 });
      moveScreens = (i) => gsap.to(screens, { yPercent: (k) => (k - i) * 105, duration: reduce ? 0 : 0.55, ease: "power2.out", overwrite: "auto" });
      let pressX = 0, pressI = 0, drag = null;
      const pick = (x) => {
        const dx = x - pressX;
        if (Math.abs(dx) < Math.min(56, step() * 0.12)) return pressI;
        return gsap.utils.clamp(0, items.length - 1, pressI + (dx < 0 ? 1 : -1));
      };
      const make = () => {
        if (drag) drag.kill();
        gsap.killTweensOf(track);
        if (!step()) return;
        drag = Draggable.create(track, {
          type: "x", inertia: false, dragClickables: true, allowContextMenu: false, edgeResistance: 0, minimumMovement: 10,
          bounds: { minX: -(items.length - 1) * step(), maxX: 0 },
          onPress() { gsap.killTweensOf(track); pressX = this.x; pressI = active; },
          onDrag() { const i = pick(this.x); if (i !== active) setWork(i); },
          onDragEnd() { const i = pick(this.x); setWork(i); snap(i); },
        })[0];
        snap(active, false);
      };
      make();
      const ro = new ResizeObserver(make);
      ro.observe(view);
      return () => { ro.disconnect(); if (drag) drag.kill(); moveScreens = null; gsap.set(track, { clearProps: "x,transform" }); };
    }

    // Vertical wheel → horizontal strip
    const wrap = $(".hz-wrap"), strip = $(".hz-strip");
    const W = () => strip.scrollWidth - innerWidth;
    const H = () => innerHeight;
    const hz = gsap.timeline({
      scrollTrigger: { trigger: wrap, pin: wrap, scrub: true, start: "center center", end: () => `+=${W() + H()}`, invalidateOnRefresh: true },
    });
    hz.to(strip, { x: () => -W(), ease: "none", duration: () => W() / (W() + H()) })
      .to(strip, { x: () => -W(), ease: "none", duration: () => H() / (W() + H()) });
    worksEntry();

    // Work list pin (must be created after the horizontal strip pin so the start point shifts by the strip length)
    const n = items.length;
    const snapTo = (p) => Math.round(p * (n - 1)) / (n - 1);
    ScrollTrigger.create({
      trigger: works, start: "top top", end: () => `+=${n * 100}%`, pin: true, scrub: true, invalidateOnRefresh: true,
      snap: reduce ? false : { snapTo, duration: { min: 0.2, max: 0.6 }, ease: "power2.out" },
      onUpdate: (s) => setWork(Math.min(n - 1, Math.round(s.progress * (n - 1)))),
    });

    if (reduce) return;

    // Design idea: text line masking plus a photo that grows from a small blurred rectangle
    const eTl = gsap.timeline({ scrollTrigger: { trigger: ".ethos", containerAnimation: hz, start: "left 100%" } });
    SB.clipLines(eTl, $(".ethos__text h2"), 0, { stagger: 0.08, ease: "none" });
    SB.clipLines(eTl, $(".ethos__p"), 0.5, { stagger: 0.08, ease: "none" });

    // Words of the quote turn white one by one
    const words = new SplitText(".quote__text", { type: "words", wordsClass: "word" }).words;
    gsap.to(words, {
      color: () => getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim(), stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: ".quote__text", containerAnimation: hz, start: "left 70%", end: "right 20%", scrub: true },
    });

    // Inspiration text: line mask on entry, slides up and disappears while the strip stops at the end
    const iTl = gsap.timeline({ scrollTrigger: { trigger: ".inspire", containerAnimation: hz, start: "left 100%" } });
    SB.clipLines(iTl, $(".inspire__t1"), 0, { stagger: 0.08, ease: "none" });
    SB.clipLines(iTl, $(".inspire__t2"), 0.5, { stagger: 0.08, ease: "none" });
    gsap.timeline({
      scrollTrigger: { trigger: wrap, start: () => hz.scrollTrigger.start + W(), end: () => hz.scrollTrigger.end, scrub: true, invalidateOnRefresh: true },
    })
      .fromTo([".inspire__t1", ".inspire__t2"], { opacity: 1, y: 0 }, { opacity: 0, y: -100, ease: "power1.inOut", duration: 1, stagger: 0.05 })
      .to(".inspire__img", { opacity: 0, y: 200, ease: "power1.inOut", duration: 1 }, 0.09)
      .to(".sb-foot", { autoAlpha: 0, ease: "power1.inOut", duration: 1 }, 0);
    // The bottom strip disappears while the band stops, then comes back out at the bottom CTA
    ScrollTrigger.create({ trigger: ".outro", start: "top 40%", onToggle: (s) => gsap.to(".sb-foot", { autoAlpha: s.isActive ? 1 : 0, duration: 0.5, overwrite: "auto" }) });
  });

  /* ---------- Bottom CTA: the pill over the photo sits bottom center, then follows the mouse ---------- */
  SB.followPill($(".outro__pic"), $(".outro__cta"));

  /* ---------- Bottom CTA: hides the name line ---------- */
  const oTl = gsap.timeline({ scrollTrigger: { trigger: ".outro", start: "top 70%" } });
  SB.clipLines(oTl, $(".outro__name"), 0);
  oTl.from(".outro__pic", { opacity: 0, y: 60, duration: 1, ease: "power3.out" }, 0);
})();
