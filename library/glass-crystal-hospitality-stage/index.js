// Home page — three stage (photo plane + glass icosahedron + light plane), 4-panel business switching, pinned promise cover, journal, news and brand strips
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // The curve the original light plane sweeps along (hesitates at first, rushes through the middle, long tail at the end)
  const SWEEP = CustomEase.create("pd-sweep", "M0,0 C0,0 0.096,-0.01 0.143,0.016 0.239,0.07 0.225,0.29 0.257,0.5 0.29,0.728 0.281,0.801 0.349,0.862 0.407,0.914 0.698,1 1,1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = () => innerWidth < 900;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const { ARR } = window.pdIcons;

  /* ── Hero three stage ── */
  const kv = document.querySelector(".kv"), stage = kv.querySelector(".kv__stage");
  const TOTAL = 5, CYCLE = sp() ? 6 : 8;
  kv.querySelector("[data-total]").textContent = TOTAL;
  const c1 = kv.querySelector("[data-c1]"), c2 = kv.querySelector("[data-c2]"), line = kv.querySelector(".kv__line > div");
  gsap.set(c2, { yPercent: 120 });

  // Photo slot — instead of the original photo, our own picture of the same ratio (3:2): window frame, table band and light bloom painted in the skin color, leaving texture for the glass to refract
  const photo = (i) => {
    const cv = document.createElement("canvas"); cv.width = 1200; cv.height = 800;
    const g = cv.getContext("2d");
    const ink = css("--kf-ink"), soft = css("--kf-ink-soft"), surf = css("--kf-surface"), acc = css("--kf-accent"), warm = css("--kf-warning");
    const bg = g.createLinearGradient(0, 0, 0, 800); bg.addColorStop(0, soft); bg.addColorStop(1, ink);
    g.fillStyle = bg; g.fillRect(0, 0, 1200, 800);
    g.globalAlpha = 0.5; g.strokeStyle = surf; g.lineWidth = 6;
    for (let x = 80 + i * 30; x < 1200; x += 260) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 520); g.stroke(); }
    g.beginPath(); g.moveTo(0, 260 - i * 12); g.lineTo(1200, 250 - i * 12); g.stroke();
    g.globalAlpha = 0.35; g.fillStyle = surf; g.fillRect(0, 0, 1200, 500);
    g.globalAlpha = 1; g.fillStyle = ink; g.fillRect(0, 520 + i * 6, 1200, 280);
    for (let k = 0; k < 6; k++) {
      const r = g.createRadialGradient(150 + k * 190 + i * 20, 560, 0, 150 + k * 190 + i * 20, 560, 90);
      r.addColorStop(0, k % 2 ? warm : surf); r.addColorStop(1, "transparent"); // Not skin: gradient end alpha
      g.globalAlpha = 0.55; g.fillStyle = r; g.fillRect(0, 380, 1200, 360);
    }
    g.globalAlpha = 0.18; g.fillStyle = acc; g.fillRect(0, 0, 1200, 800);
    g.globalAlpha = 0.85; g.fillStyle = surf; g.font = `28px ${css("--kf-font-body")}`; g.textAlign = "center";
    g.fillText(`Banquet hall · table photo ${i + 1} — Landscape 3:2`, 600, 760);
    return cv;
  };
  const glow = (warmth) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256;
    const g = cv.getContext("2d"), r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, css(warmth ? "--kf-warning" : "--kf-surface")); r.addColorStop(1, "transparent"); // Not skin: gradient end alpha
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    return cv;
  };

  let renderer = null;
  if (window.THREE && !reduce) {
    const T = THREE;
    const W = () => stage.clientWidth, H = () => stage.clientHeight;
    renderer = new T.WebGLRenderer({ antialias: !sp(), precision: sp() ? "mediump" : "highp", alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    renderer.setSize(W(), H());
    renderer.toneMapping = T.ACESFilmicToneMapping;
    stage.appendChild(renderer.domElement);
    const scene = new T.Scene();
    scene.background = new T.Color(css("--kf-contrast-bg"));
    const camera = new T.PerspectiveCamera(45, W() / H(), 0.1, 100);
    camera.position.set(0, 0, 2);
    const root = new T.Group(); scene.add(root);
    const geo = new T.PlaneGeometry(1, 1);
    const slides = Array.from({ length: TOTAL }, (_, i) => {
      const tex = new T.CanvasTexture(photo(i)); tex.colorSpace = T.SRGBColorSpace;
      const mat = new T.MeshBasicMaterial({ map: tex, color: 0xcccccc }); /* Not skin: value that darkens the photo by multiplying it to 80%, like the original */
      const g = new T.Group(), m = new T.Mesh(geo, mat);
      g.add(m); g.visible = false; g.__mesh = m; root.add(g);
      return g;
    });
    // Photo fills the screen (cover) — z=Fit to the visible width of the 0 plane
    const fit = () => {
      const vh = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360), vw = vh * camera.aspect;
      const s = Math.max(vw / 1.5, vh) * 1.02;
      slides.forEach((g) => g.__mesh.scale.set(s * 1.5, s, 1));
    };
    // Glass crystal — IcosahedronGeometry(1.3, 0) · transmission 1 · IOR 1.1 · thickness 1.6 · dispersion 1
    const glassMat = new T.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, depthWrite: false, opacity: 0, metalness: 0, reflectivity: 0, transmission: 1, roughness: 0, ior: 1.1, thickness: 1.6, dispersion: sp() ? 0 : 1, specularIntensity: 1 }); /* Not skin: clear glass is a white body, so it only bends light */
    const glass = new T.Mesh(new T.IcosahedronGeometry(1.3, 0), glassMat);
    glass.position.set(0, 0.3, -0.2);
    root.add(glass);
    scene.add(new T.AmbientLight(0xffffff, 1.2)); /* Not skin: light intensity */
    const dl = new T.DirectionalLight(0xffffff, 2); dl.position.set(1, 2, 3); scene.add(dl); /* Not skin: light intensity */
    const lightGeo = new T.PlaneGeometry(1.25, 1.25);
    const lights = [0, 1, 2, 3].map((k) => {
      const m = new T.Mesh(lightGeo, new T.MeshBasicMaterial({ map: new T.CanvasTexture(glow(k % 2)), transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
      m.position.set(1.85, 0.1 * k - 0.15, 0.05 + k * 0.01); m.scale.set(1.2 + k * 0.3, 1.6 + k * 0.4, 1);
      root.add(m);
      return m;
    });
    fit();
    renderer.compile(scene, camera); // Pre-bake shaders — so the first transition doesn’t stall
    let raf = 0, live = true;
    const tick = () => { renderer.render(scene, camera); raf = requestAnimationFrame(tick); };
    new IntersectionObserver(([e]) => { live = e.isIntersecting; cancelAnimationFrame(raf); if (live) tick(); }).observe(kv);
    addEventListener("resize", () => { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); fit(); });

    let cur = 0;
    const MOTIONS = ["zoomIn", "panRight", "zoomOut", "panLeft", "panUp"];
    const move = (g, type, dur) => {
      gsap.killTweensOf([g.scale, g.position]);
      if (type === "zoomIn") { gsap.set(g.position, { x: 0, y: 0 }); gsap.fromTo(g.scale, { x: 1, y: 1 }, { duration: dur, ease: "linear", x: 1.1, y: 1.1 }); return; }
      if (type === "zoomOut") { gsap.set(g.position, { x: 0, y: 0 }); gsap.fromTo(g.scale, { x: 1.1, y: 1.1 }, { duration: dur, ease: "linear", x: 1, y: 1 }); return; }
      gsap.set(g.scale, { x: 1.05, y: 1.05 });
      const d = 0.05, v = { panRight: [-d, 0, d, 0], panLeft: [d, 0, -d, 0], panUp: [0, -d, 0, d] }[type];
      gsap.fromTo(g.position, { x: v[0], y: v[1] }, { duration: dur, ease: "linear", x: v[2], y: v[3] });
    };
    const run = () => {
      const next = (cur + 1) % TOTAL, a = slides[cur], b = slides[next];
      slides.forEach((g, i) => (g.visible = i === cur || i === next));
      b.position.z = 0.0005; a.position.z = -0.0005;
      const m = b.__mesh.material; m.transparent = true; m.opacity = 0; a.__mesh.material.transparent = false;
      const h = CYCLE * 0.6;
      gsap.fromTo(glassMat, { opacity: 0 }, { duration: h * 0.65, ease: "sine.inOut", opacity: 0.2 });
      gsap.fromTo(glass.rotation, { x: (50 * Math.PI) / 180, y: (24 * Math.PI) / 180, z: (17 * Math.PI) / 180 }, { duration: h, ease: "sine.out", x: (53 * Math.PI) / 180, y: (-8 * Math.PI) / 180, z: (15 * Math.PI) / 180 });
      gsap.fromTo(m, { opacity: 0 }, { duration: 1.4, delay: sp() ? 1.6 : 1.8, ease: "sine.inOut", opacity: 1 });
      gsap.to(glassMat, { duration: 1, delay: h * 0.65, ease: "linear", opacity: 0 });
      lights.forEach((l, k) => {
        const dl = 0.2 + k * 0.25;
        gsap.fromTo(l.position, { x: 1.85 }, { duration: h * 0.9, delay: dl, ease: SWEEP, x: -1.3 + k * 0.1 });
        gsap.fromTo(l.material, { opacity: 0 }, { duration: h * 0.23, delay: dl, ease: "linear", opacity: 0.18 + 0.06 * (k % 2) });
        gsap.to(l.material, { duration: h * 0.2, delay: dl + h * 0.5, ease: "sine.inOut", opacity: 0 });
      });
      move(b, MOTIONS[next % MOTIONS.length], CYCLE * 1.8);
      cur = next;
      gsap.delayedCall(1.8, () => {
        gsap.fromTo(line, { scaleX: 0 }, { duration: CYCLE - 2, ease: "linear", scaleX: 1 });
        c1.textContent = cur; c2.textContent = (cur % TOTAL) + 1;
        gsap.fromTo(c1, { yPercent: 0 }, { duration: 0.4, ease: "power1.out", yPercent: -120 });
        gsap.fromTo(c2, { yPercent: 120 }, { duration: 0.4, ease: "power1.out", yPercent: 0 });
      });
      gsap.delayedCall(CYCLE - 2, run);
    };
    const begin = () => {
      kv.classList.add("is-loaded");
      gsap.delayedCall(0.4, () => kv.classList.add("show-catch", "show-stage"));
      slides[0].visible = true;
      gsap.fromTo(slides[0].scale, { x: 1, y: 1, z: 1 }, { duration: 6, ease: "linear", x: 1.1, y: 1.1, z: 1.1 });
      gsap.delayedCall(3, run);
    };
    document.readyState === "complete" ? begin() : addEventListener("load", begin, { once: true });
  } else {
    kv.classList.add("is-loaded", "show-catch", "show-stage");
  }

  // On scroll the stage shrinks, and past halfway the copy hides
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: kv, start: "top -10%", end: "bottom top", scrub: true,
      onUpdate: (st) => kv.querySelector(".kv__static").classList.toggle("is-hide-catch", st.progress >= 0.55) } })
      .fromTo(stage, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 10% 13% 10%)", ease: "linear" });
  });

  /* ── Business 4 Sections ── */
  const SETS = [
    ["Urban Development", "Food and experiences found only there,|bring new energy|to the city."],
    ["Heritage Restoration", "Carrying the memory and culture of that land|to the present and the next generation."],
    ["Facility Renewal", "Seeing its original value again,|once more,|we bring it back to life."],
    ["Value Creation", "Your fourth section’s sentence here|split into|three lines."],
  ];
  const $ = (s) => document.querySelector(s);
  const slideHtml = (i, label) => `<div class="biz__slide${i === 0 ? " is-on" : ""}"><div class="wf-img" data-label="${label}"></div></div>`;
  $("[data-small]").innerHTML = SETS.map((s, i) => slideHtml(i, `${s[0]} Small scene photo · warm indoor lighting · landscape 3:2`)).join("");
  $("[data-big]").innerHTML = SETS.map((s, i) => slideHtml(i, `${s[0]} Facility view · evening interior · horizontal 3:2`)).join("");
  $("[data-digits]").innerHTML = SETS.map((_, i) => `<i class="${i === 0 ? "is-on" : ""}">${i + 1}</i>`).join("");
  $("[data-tags]").innerHTML = SETS.map((s, i) => `<span class="${i === 0 ? "is-on" : ""}">${s[0]}</span>`).join("");
  $("[data-texts]").innerHTML = SETS.map((s, i) => `<div class="biz__text${i === 0 ? " is-on" : ""}"><p>${s[1].split("|").map((t, l) => `<span style="--l:${l}"><i>${t}</i></span>`).join("")}</p><a class="pd-uline" href="service.html">Learn more ${ARR}</a></div>`).join("");
  const bline = $("[data-bline]"), b1 = $("[data-b1]"), b2 = $("[data-b2]");
  gsap.set(b2, { yPercent: 120 });
  let bi = 0, bt = null;
  const go = (n) => {
    const prev = bi; bi = (n + SETS.length) % SETS.length;
    if (prev === bi) return;
    const swap = (sel) => document.querySelectorAll(sel).forEach((el, i) => { el.classList.toggle("is-off", i === prev); el.classList.toggle("is-on", i === bi); });
    swap("[data-small] .biz__slide"); swap("[data-big] .biz__slide");
    document.querySelectorAll("[data-digits] i").forEach((el, i) => { el.className = i === bi ? "is-on" : i === prev ? "is-out" : ""; });
    document.querySelectorAll("[data-tags] span").forEach((el, i) => el.classList.toggle("is-on", i === bi));
    document.querySelectorAll("[data-texts] .biz__text").forEach((el, i) => el.classList.toggle("is-on", i === bi));
    b1.textContent = prev + 1; b2.textContent = bi + 1;
    gsap.fromTo(b1, { yPercent: 0 }, { duration: 0.4, ease: "power1.out", yPercent: -120 });
    gsap.fromTo(b2, { yPercent: 120 }, { duration: 0.4, ease: "power1.out", yPercent: 0 });
    setTimeout(() => document.querySelectorAll(".biz__slide.is-off").forEach((el) => el.classList.remove("is-off")), 1300);
    auto();
  };
  const auto = () => {
    bt?.kill();
    if (reduce) return;
    bt = gsap.fromTo(bline, { scaleX: 0 }, { duration: 5, ease: "linear", scaleX: 1, onComplete: () => go(bi + 1) });
  };
  $("[data-prev]").addEventListener("click", () => go(bi - 1));
  $("[data-next]").addEventListener("click", () => go(bi + 1));
  // As in the original, runs only while the section is visible. Stops the progress line when out of view, and restarts from 0 on re-entry
  new IntersectionObserver(([e]) => (e.isIntersecting ? auto() : bt?.kill()), { threshold: 0 }).observe($(".biz__b2"));
  const NAMES = ["THE GRAND HALL", "Brand Two", "HOTEL NAME", "The Garden House", "Brand Five", "LA TERRASSE", "Brand Seven", "THE SQUARE", "Brand Nine", "Maison Ten", "Brand Eleven", "THE HOUSE"];
  $("[data-logos]").innerHTML = [...NAMES, ...NAMES].map((n, i) => `<li${i >= NAMES.length ? ' aria-hidden="true"' : ""} data-label="Operating brand logo text">${n}</li>`).join("");

  /* ── Promise: pinned at screen center while three photos cover it (original 2500px · 1.8→1) ── */
  const cm = $(".cm"), inner = $(".cm__inner"), txt = $(".cm__txt"), num = $(".cm__cur");
  const ph = [...document.querySelectorAll(".cm__ph")], pin = [...document.querySelectorAll(".cm__pin")];
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const dist = () => (sp() ? (innerWidth / 400) * 2000 : (innerWidth / 1440) * 2500);
    ScrollTrigger.create({ trigger: inner, start: sp() ? "top top" : "center center", end: () => `+=${dist()}`, endTrigger: cm, pin: true, pinSpacing: true, invalidateOnRefresh: true, scrub: true,
      onUpdate: (st) => { num.dataset.cur = st.progress < 0.15 ? "1" : st.progress < 0.65 ? "2" : "3"; } });
    gsap.fromTo(pin[0], { scale: 1.8 }, { scale: 1, ease: "linear", scrollTrigger: { trigger: inner, start: "top bottom", end: "center center", scrub: true,
      onUpdate: (st) => { if (st.progress < 0.05) { txt.classList.remove("is-show"); $(".cm__title").classList.remove("is-in"); } else if (st.progress > 0.65) { txt.classList.add("is-show"); $(".cm__title").classList.add("is-in"); } } } });
    gsap.timeline({ scrollTrigger: { trigger: inner, start: sp() ? "top top" : "center center", end: () => `+=${dist()}`, scrub: true } })
      .to(ph[0], { yPercent: -25, ease: "linear" })
      .fromTo(pin[1], { scale: 1.8 }, { scale: 1, ease: "linear" }, "<")
      .fromTo(ph[1], { yPercent: 100 }, { yPercent: 0, ease: "linear" }, "<")
      .fromTo(pin[2], { scale: 1.8 }, { scale: 1, ease: "linear" })
      .fromTo(ph[2], { yPercent: 100 }, { yPercent: 0, ease: "linear" }, "<")
      .to(ph[1], { yPercent: -25, ease: "linear" }, "<");
  });
  if (reduce) { txt.classList.add("is-show"); $(".cm__title").classList.add("is-in"); }

  /* ── Journal · News ── */
  $("[data-journal]").innerHTML = [1, 2, 3].map((i) => `<li class="pd-fade"><a href="#" target="_blank" rel="noopener"><time class="pd-en">2026/0${i}/1${i}</time><div class="wf-img" data-label="Journal text photo ${i} · Store · People · Landscape 3:2"></div><p>Your journal article title here, in one line ${i}</p></a></li>`).join("");
  $("[data-news]").innerHTML = [0, 1, 2].map((i) => window.pdNewsItem(i)).join("");
  window.pdFillArrows();
  document.querySelectorAll("[data-journal] .pd-fade, [data-news] .pd-fade").forEach((el) => {
    if (reduce) return el.classList.add("is-in");
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => el.classList.add("is-in") });
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
