(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── Hero 3D tape roll (three r185) ──
  const host = $(".st-hero__roll");
  let roll = null;
  if (host && window.THREE) {
    const canvas = document.createElement("canvas");
    host.append(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
    camera.position.set(0, 0.6, 6.4);
    camera.lookAt(0, 0, 0);
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden";
    document.body.append(probe);
    const col = (v) => { probe.style.color = `var(${v})`; const c = new THREE.Color(); c.setStyle(getComputedStyle(probe).color, THREE.SRGBColorSpace); return c; };
    const tapeCol = col("--site-tape-yellow"), coreCol = col("--kf-raised");
    scene.add(new THREE.HemisphereLight(coreCol, col("--kf-dim"), 1.7));
    const key = new THREE.DirectionalLight(coreCol, 2.4); key.position.set(3, 4, 5); scene.add(key);
    probe.remove();
    const prof = [[0.62, -0.32], [1, -0.32], [1, 0.32], [0.62, 0.32], [0.62, -0.32]].map(([x, y]) => new THREE.Vector2(x, y));
    const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), new THREE.MeshStandardMaterial({ color: tapeCol, roughness: 0.45, side: THREE.DoubleSide }));
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.66, 64, 1, true), new THREE.MeshStandardMaterial({ color: coreCol, roughness: 0.8, side: THREE.DoubleSide }));
    const label = document.createElement("span");
    label.style.cssText = "position:absolute;visibility:hidden;--tape:var(--site-tape-yellow)";
    label.innerHTML = window.stTape("Opp tape", "Low noise");
    document.body.append(label);
    const tex = new THREE.Texture(window.stBake(label, 512));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.image.onload = () => { tex.needsUpdate = true; label.remove(); };
    const capMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 });
    const capGeo = new THREE.RingGeometry(0.62, 1, 96);
    const front = new THREE.Mesh(capGeo, capMat); front.position.z = 0.321;
    const back = new THREE.Mesh(capGeo, capMat); back.position.z = -0.321; back.rotation.y = Math.PI;
    body.rotation.x = Math.PI / 2;
    core.rotation.x = Math.PI / 2;
    roll = new THREE.Group();
    roll.add(body, core, front, back);
    roll.rotation.set(-0.12, -0.42, 0);
    scene.add(roll);
    const size = () => { const r = host.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); };
    new ResizeObserver(size).observe(host);
    size();
    renderer.compile(scene, camera);
    let seen = true;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(host);
    const state = { spin: 0, y: 0 };
    roll.userData.state = state;
    gsap.ticker.add((t) => {
      if (!seen) return;
      roll.rotation.y = -0.42 + (reduce ? 0 : Math.sin(t * 0.8) * 0.28) + state.spin;
      roll.position.y = (reduce ? 0 : Math.sin(t * 1.4) * 0.05) + state.y;
      renderer.render(scene, camera);
    });
  }

  // ── Hero big letters: letters near the cursor are pushed away and tilt, then soon return (original sink .06~.13s) ──
  // Bending is handled by transform, so the hover response is layered on with the individual translate·rotate properties
  const letters = $$(".st-hero__title .ch");
  if (letters.length && !reduce && matchMedia("(hover: hover)").matches) {
    const st = letters.map(() => ({ x: 0, y: 0, r: 0, tx: 0, ty: 0, tr: 0 }));
    let px = -1e4, py = -1e4, boxes = [];
    const measure = () => { boxes = letters.map((l) => { const b = l.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2 + scrollY]; }); };
    measure();
    document.fonts?.ready.then(measure);
    addEventListener("resize", measure);
    addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY + scrollY; }, { passive: true });
    gsap.ticker.add(() => {
      const R = innerWidth * 0.14;
      letters.forEach((l, i) => {
        const s = st[i], dx = boxes[i][0] - px, dy = boxes[i][1] - py, d = Math.hypot(dx, dy);
        const k = d < R ? Math.pow(1 - d / R, 2) : 0;
        s.tx = (dx / (d || 1)) * k * innerWidth * 0.018; s.ty = (dy / (d || 1)) * k * innerWidth * 0.018; s.tr = (dx > 0 ? 1 : -1) * k * 9;
        s.x += (s.tx - s.x) * 0.3; s.y += (s.ty - s.y) * 0.3; s.r += (s.tr - s.r) * 0.3;
        if (Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.r) < 0.01 && !k) { if (l.style.translate) { l.style.translate = ""; l.style.rotate = ""; } return; }
        l.style.translate = `${s.x}px ${s.y}px`;
        l.style.rotate = `${s.r}deg`;
      });
    });
  }

  // ── Orange stage: choosing a roll changes the stage color, the usage name and the center roll ──
  const picks = $$(".st-stage__picks button");
  const names = ["Fixer", "Creative", "Everyday", "Office", "Crafter"];
  const bg = $(".st-stage__bg"), word = $(".st-stage__word"), center = $(".st-stage__roll"), sub = $(".st-stage__sub"), wipe = $(".st-stage__wipe");
  let cur = 1;
  const choose = (i) => {
    i = (i + picks.length) % picks.length;
    if (i === cur) return;
    const prev = picks[cur];
    cur = i;
    picks.forEach((b, j) => b.setAttribute("aria-selected", String(j === i)));
    const tape = picks[i].style.getPropertyValue("--tape");
    const fill = `color-mix(in oklab, ${tape} 75%, var(--kf-accent))`;
    const label = picks[i].querySelector("[data-tape]").dataset.tape;
    const swap = () => { word.textContent = names[i]; center.style.setProperty("--tape", tape); center.innerHTML = window.stTape(label); };
    if (reduce) { swap(); bg.style.background = fill; return; }
    // Original order: at .406s the text and center roll change, from .456s the roll stands up from 18° to 1° (.633s),
    // At 1.09s a ring pops out around the chosen role and the tag color changes, from 1.106s a new color plate covers upward from below (.583s)
    const ringOld = prev.querySelector(".st-stage__ring"), ringNew = picks[i].querySelector(".st-stage__ring");
    gsap.timeline()
      .add(swap, 0.406)
      .fromTo(center, { rotation: 18.3 }, { rotation: 1.1, duration: 0.633, ease: "power2.out" }, 0.456)
      .set(ringOld, { opacity: 0, scale: 0 }, 1.09)
      .set(ringNew, { opacity: 1 }, 1.09)
      .fromTo(ringNew, { scale: 0 }, { scale: 1, duration: 0.217, ease: "back.out(2.2)" }, 1.09)
      .fromTo(picks.filter((b) => b !== picks[i]).map((b) => b.querySelector("[data-tape]")), { scale: 0 }, { scale: 1, duration: 0.217, ease: "back.out(2.2)", stagger: 0.306 }, 1.09)
      .set(sub, { color: tape }, 1.09)
      .set(wipe, { background: fill }, 1.106)
      .fromTo(wipe, { y: -396 }, { y: -1222, duration: 0.583, ease: "none" }, 1.106)
      .set(bg, { background: fill });
  };
  // Choose at the moment of pressing like the original — keyboard via click
  picks.forEach((b, i) => {
    b.addEventListener("pointerdown", (e) => e.button === 0 && choose(i));
    b.addEventListener("click", (e) => e.detail === 0 && choose(i));
  });
  gsap.set(picks[cur].querySelector(".st-stage__ring"), { opacity: 1, scale: 1 });
  $(".st-stage__arrow--prev")?.addEventListener("click", () => choose(cur - 1));
  $(".st-stage__arrow--next")?.addEventListener("click", () => choose(cur + 1));

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Roll rolls down along the curved panel
    if (roll) {
      const s = roll.userData.state;
      gsap.to(s, { spin: -Math.PI * 1.5, y: -1.4, ease: "none", scrollTrigger: { trigger: ".st-hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(host, { yPercent: 40, ease: "none", scrollTrigger: { trigger: ".st-hero", start: "top top", end: "bottom top", scrub: true } });
    }
    // Cut-paper panel: each piece rises at a different speed
    [[".st-collage__kraft", -8], [".st-collage__wrap", -18], [".st-collage__gift", -28]].forEach(([s, v]) => {
      gsap.fromTo(s, { y: `${-v / 2}vw` }, { y: `${v / 2}vw`, ease: "none", scrollTrigger: { trigger: ".st-collage", start: "top bottom", end: "bottom top", scrub: true } });
    });
    // Text on the slanted band flows along the band
    const tp = $(".st-band textPath");
    if (tp) {
      const o = { v: 0 };
      gsap.to(o, { v: -45, ease: "none", onUpdate: () => tp.setAttribute("startOffset", `${o.v}%`), scrollTrigger: { trigger: ".st-band", start: "top bottom", end: "bottom top", scrub: true } });
    }
    // Pops up when stage props come in
    gsap.from(".st-stage__card, .st-stage__explore", { scale: 0.4, rotation: -20, opacity: 0, duration: 0.7, ease: "back.out(2.2)", stagger: 0.05, scrollTrigger: { trigger: ".st-stage", start: "top 75%" } });
    // A giant word stays fixed on screen and flows sideways while a roll rolls (original scrub .6)
    const row = $(".st-giant__row"), tapes = $$(".st-giant__tape");
    const dist = () => row.scrollWidth - innerWidth;
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".st-giant__pin", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
    tl.to(row, { x: () => -dist(), ease: "none" }, 0)
      .to(tapes, { x: () => -dist() * 0.92, rotation: (i) => (i % 2 ? 1 : -1) * 540, ease: "none" }, 0);
    gsap.from(".st-cta__box, .st-cta__photo", { yPercent: 18, rotation: (i) => (i ? -4 : 4), duration: 0.85, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".st-cta", start: "top 80%" } });
  });
})();
