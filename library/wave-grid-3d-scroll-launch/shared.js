// Screen chrome: smooth scroll (lenis 1.0.42 — same build as the original), glass coin loader, button white circle, sound, scroll progress circle, dot guide, contact card.
// The reflection environment shared by the 3D scenes (sgEnv) is also built here
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  window.sgCss = css;

  // Reflection environment: a black room with a few white panels on the ceiling and sides — gives glass and chrome something to reflect (the original is an HDR photo, ours is a room made of panels)
  window.sgEnv = (renderer) => {
    const T = THREE, scene = new T.Scene(), pm = new T.PMREMGenerator(renderer);
    scene.background = new T.Color(css("--kf-bg"));
    const lit = (w, h, x, y, z, ry, rx, k) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(css("--kf-ink")).multiplyScalar(k), side: T.DoubleSide }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); scene.add(m);
    };
    lit(6, 1.2, 0, 4, -2, 0, Math.PI / 2, 2.2);
    lit(1, 6, -5, 0, 0, Math.PI / 2, 0, 1.4);
    lit(.6, 6, 5, .5, 1, -Math.PI / 2, 0, 1.8);
    lit(8, .5, 0, -3, 4, 0, -Math.PI / 3, .8);
    const env = pm.fromScene(scene, .02).texture;
    pm.dispose();
    return env;
  };

  // Smooth scroll: hold it still until scene setup (loader) finishes
  window.lenis = null;
  if (window.Lenis && !reduce) {
    const lenis = (window.lenis = new Lenis({ lerp: .1, syncTouch: true }));
    lenis.stop();
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // Loader: a glass coin turns slowly and the number fills from 0 to 100%. Holds .4s at 100% then lifts in .6s
  const loader = document.querySelector(".loader");
  window.sgReady = new Promise((done) => {
    if (!loader) return done();
    const pct = loader.querySelector(".pct"), cv = loader.querySelector("canvas");
    let renderer = null, coin = null, cam = null, scene = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      renderer.setSize(innerWidth, innerHeight, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      scene = new THREE.Scene();
      scene.environment = window.sgEnv(renderer);
      cam = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, .1, 50);
      cam.position.set(0, 0, 8);
      // Black glass coin: front is dark like the background, only the rim catches light
      const r = Math.min(1.62, 1.62 * (innerWidth / innerHeight) / 1.2), disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .14, 160, 1), new THREE.MeshPhysicalMaterial({ color: new THREE.Color(css("--kf-surface")), metalness: .85, roughness: .06, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.4 }));
      disc.rotation.x = Math.PI / 2;
      coin = new THREE.Group(); coin.add(disc);
      scene.add(coin);
    } catch (e) { renderer = null; }
    // The coin spins four turns (8π) on its vertical axis every 3 seconds with expo.out, and the number fills up with .8s power2.out each time a preparation step ends.
    // Holds 1s at 100%, then the panel lifts over 1s power2.out, and the scene is readied at that point (scroll unlocks)
    const shown = { v: 0 }, spin = { y: Math.PI / 2 };
    if (renderer && !reduce) gsap.to(spin, { y: `+=${Math.PI * 8}`, duration: 3, repeat: -1, ease: "expo.out" });
    let live = true;
    const draw = () => {
      if (!live) return;
      pct.textContent = Math.round(shown.v) + "%";
      if (renderer) { coin.rotation.y = spin.y; renderer.render(scene, cam); }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    const steps = reduce ? [100] : [22, 48, 73, 100];
    steps.forEach((v, i) => gsap.to(shown, { v, duration: reduce ? 0 : .8, ease: "power2.out", delay: reduce ? 0 : .35 + i * .62, overwrite: "auto" }));
    const finish = (reduce ? 0 : .35 + (steps.length - 1) * .62 + .8) + (reduce ? 0 : 1);
    gsap.delayedCall(finish, () => {
      gsap.to(loader, { opacity: 0, duration: reduce ? 0 : 1, ease: "power2.out", onComplete: () => { live = false; loader.remove(); renderer?.dispose(); done(); } });
    });
  });
  window.sgReady.then(() => window.lenis?.start());

  // The button’s white circle spreads from where the cursor entered
  document.addEventListener("pointerover", (e) => {
    const b = e.target.closest?.(".btn, .ico");
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--bx", e.clientX - r.left + "px");
    b.style.setProperty("--by", e.clientY - r.top + "px");
  });

  // Sound: turning on makes a low wind sound swell in over 1.2s, turning off lets it sink. It turns on by itself at the first press
  const snd = document.querySelector(".snd");
  let ctx = null, gain = null;
  const setSound = (on) => {
    snd?.setAttribute("aria-pressed", String(on));
    if (on && !ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3; }
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter();
      src.buffer = buf; src.loop = true; f.type = "lowpass"; f.frequency.value = 300;
      gain = ctx.createGain(); gain.gain.value = 0;
      src.connect(f).connect(gain).connect(ctx.destination); src.start();
    }
    if (!ctx) return;
    ctx.resume();
    gain.gain.setTargetAtTime(on ? .06 : 0, ctx.currentTime, on ? .4 : .15);
  };
  snd?.addEventListener("click", () => setSound(snd.getAttribute("aria-pressed") !== "true"));
  document.addEventListener("click", (e) => { if (!e.target.closest(".snd") && snd?.getAttribute("aria-pressed") !== "true" && !ctx) setSound(true); }, { once: true });

  // Scroll hint dots: each one lights up in .3s and returns (.1s apart, endlessly)
  const dots = [...document.querySelectorAll(".dots i")];
  if (dots.length && !reduce) {
    const tl = gsap.timeline({ repeat: -1 });
    dots.forEach((d, i) => tl.to(d, { opacity: 1, duration: .3, yoyo: true, repeat: 1, ease: "power1.inOut" }, i * .1));
  }

  // Contact card: pressing the pill floats it up and the border is drawn clockwise (.6s), close with the button or Esc
  const chip = document.querySelector(".chip"), card = document.querySelector(".card");
  const openCard = (on) => {
    if (!card) return;
    card.classList.toggle("on", on);
    chip?.setAttribute("aria-expanded", String(on));
    if (on && !reduce) gsap.fromTo(card, { "--sweep": "0deg" }, { "--sweep": "360deg", duration: .6, ease: "power2.out" });
    else card.style.setProperty("--sweep", "360deg");
  };
  window.sgCard = openCard;
  const dock = document.querySelector(".dock");
  window.sgReady.then(() => setTimeout(() => dock?.classList.add("on"), reduce ? 0 : 2500));
  addEventListener("scroll", () => chip?.classList.toggle("compact", scrollY > innerHeight * .6), { passive: true });
  chip?.addEventListener("click", () => openCard(!card.classList.contains("on")));
  card?.querySelector(".x")?.addEventListener("click", () => openCard(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") openCard(false); });
})();
