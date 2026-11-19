// Scenes — line cube space (three), three-panel board, we see and hear, clock sequence, door stage (three layered panels + line drawing), work parallax, what-we-do strip, process spread, anywhere in the world
(() => {
  const SA = (window.SA = window.SA || { pages: {} });
  SA.pages = SA.pages || {};
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const T = () => window.THREE;
  const inkOf = (el) => new (T().Color)(getComputedStyle(el).color);

  // Turn words in the document into canvas graphics — stick them on the cube faces
  const wordTex = (word, color) => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = color; g.font = `500 120px ${getComputedStyle(document.body).fontFamily}`;
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(word, 256, 128);
    const t = new (T().CanvasTexture)(c); t.colorSpace = T().SRGBColorSpace; return t;
  };

  // ── Line cube space: 40 thin-line cubes scattered on a black board, and the camera passes from z 0 → −60 on scroll, turning slightly ──
  const cubes = (root) => {
    const cv = root.querySelector("[data-cubes]");
    if (!cv || !T()) return;
    const TH = T();
    let r;
    try { r = new TH.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new TH.Scene(), cam = new TH.PerspectiveCamera(50, 1, 0.1, 200);
    const ink = inkOf(cv), col = `#${ink.getHexString()}`;
    const lineMat = new TH.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.35 });
    const words = ["Architecture", "Perception", "Form", "Definition", "To touch", "To listen", "Feel", "Refine", "Experience"], mats = words.map((w) => new TH.MeshBasicMaterial({ map: wordTex(w, col), transparent: true, opacity: 0.4, side: TH.DoubleSide, depthWrite: false }));
    const plane = new TH.PlaneGeometry(1, 0.5), edges = new TH.EdgesGeometry(new TH.BoxGeometry(1, 1, 1));
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const group = new TH.Group();
    for (let i = 0; i < 56; i++) {
      const s = 2 + rnd() * 5, box = new TH.LineSegments(edges, lineMat);
      box.scale.setScalar(s);
      box.position.set((rnd() - 0.5) * 26, (rnd() - 0.5) * 16, -rnd() * 70 + 6);
      box.rotation.set(rnd() * Math.PI, rnd() * Math.PI, 0);
      if (i % 3 === 0) { const w = new TH.Mesh(plane, mats[i % mats.length]); w.scale.set(s * 0.7, s * 0.7, 1); w.position.z = 0.501; box.add(w); }
      group.add(box);
    }
    scene.add(group);
    const st = { z: 8, turn: 0 };
    const size = () => { r.setSize(cv.clientWidth, cv.clientHeight, false); cam.aspect = cv.clientWidth / Math.max(1, cv.clientHeight); cam.updateProjectionMatrix(); };
    const ro = new ResizeObserver(size); ro.observe(cv);
    const draw = () => { cam.position.set(Math.sin(st.turn) * 2, 0, st.z); cam.rotation.set(0, st.turn * 0.4, st.turn * 0.15); r.render(scene, cam); };
    gsap.ticker.add(draw);
    const n = root.querySelector("[data-cube-n]");
    if (!SA.reduce) gsap.to(st, { z: -58, turn: 1.2, ease: "none", scrollTrigger: { trigger: cv.closest(".cubes"), start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => n && (n.textContent = String(Math.min(3, Math.floor(s.progress * 4))).padStart(2, "0")) } });
    return () => { gsap.ticker.remove(draw); ro.disconnect(); r.dispose(); };
  };

  // ── Three-section board: the panel changes every 1/3 of the section, the previous panel’s text hides in .25s Out and the new panel’s words rise in 1.6s Out ──
  const panels = (root) => {
    const sec = root.querySelector(".values"), ps = qa("[data-panel]", sec), n = sec.querySelector("[data-panel-n]");
    let cur = -1;
    const go = (i) => {
      if (i === cur) return;
      const was = cur; cur = i;
      ps.forEach((p, k) => (p.style.visibility = k === i ? "visible" : "hidden"));
      if (was >= 0) SA.hide(qa("[data-reveal]", ps[was]));
      SA.show(qa("[data-reveal]", ps[i]));
      if (n) n.textContent = String(i + 1).padStart(2, "0");
    };
    qa("[data-reveal]", sec).forEach((e) => { e.style.visibility = "visible"; gsap.set(SA.words(e).words, { opacity: 0 }); });
    ScrollTrigger.create({ trigger: sec, start: "top 60%", end: "bottom bottom", onUpdate: (s) => go(Math.min(2, Math.floor(s.progress * 3))), onEnter: () => go(0) });
  };

  // ── We see, hear, touch and feel — words light up one by one while the section scrolls past
  const approach = (root) => {
    const items = qa(".word-item", root);
    ScrollTrigger.create({ trigger: root.querySelector(".approach"), start: "top 60%", end: "bottom 60%", onUpdate: (s) => { const i = Math.min(items.length - 1, Math.floor(s.progress * items.length)); items.forEach((w, k) => w.classList.toggle("is-active", k === i)); } });
  };

  // Watch movement image sequence slot — draws three gears and turns them on scroll (same slot and same scrub as the original watch sequence)
  const watch = (root) => {
    const cv = root.querySelector("[data-watch]");
    if (!cv) return;
    const g = cv.getContext("2d"), st = { a: 0 };
    const gear = (x, y, rad, teeth, a, ink) => {
      g.save(); g.translate(x, y); g.rotate(a); g.beginPath();
      for (let i = 0; i < teeth * 2; i++) { const rr = i % 2 ? rad : rad * 0.86, t = (i / (teeth * 2)) * Math.PI * 2; g.lineTo(Math.cos(t) * rr, Math.sin(t) * rr); }
      g.closePath(); g.strokeStyle = ink; g.lineWidth = 1.5; g.stroke();
      g.beginPath(); g.arc(0, 0, rad * 0.25, 0, Math.PI * 2); g.stroke(); g.restore();
    };
    const draw = () => {
      const w = (cv.width = cv.clientWidth * 2), h = (cv.height = cv.clientHeight * 2), ink = getComputedStyle(cv).color;
      g.clearRect(0, 0, w, h);
      gear(w * 0.42, h * 0.7, h * 0.32, 36, st.a, ink);
      gear(w * 0.66, h * 0.5, h * 0.18, 20, -st.a * 1.8, ink);
      gear(w * 0.6, h * 0.92, h * 0.12, 14, st.a * 2.6, ink);
    };
    draw();
    addEventListener("sa:invert", draw);
    gsap.to(st, { a: Math.PI * 2, ease: "none", onUpdate: draw, scrollTrigger: { trigger: cv, start: "top bottom", end: "bottom top", scrub: true } });
  };

  // ── Door stages: pinned for 7 screens of the section — four stages change in turn (original R/W order), line art is drawn over .75, and the layered panel doors open and close ──
  const door = (root) => {
    const sec = root.querySelector(".door"), steps = qa("[data-step]", sec), n = sec.querySelector("[data-step-n]"), path = sec.querySelector("[data-door-line]"), cv = sec.querySelector("[data-door]");
    let cur = -1;
    const go = (i) => {
      if (i === cur) return;
      if (cur >= 0) SA.hide([...qa("[data-step-t],[data-step-d]", steps[cur])]);
      cur = i;
      steps.forEach((s, k) => gsap.set(s, { opacity: k === i ? 1 : 0 }));
      if (i >= 0) SA.show(qa("[data-step-t],[data-step-d]", steps[i]));
      if (n) n.textContent = String(i + 1).padStart(2, "0");
    };
    // 3D — five same-size boards (door frame + inner board) spread apart along z and then gather. The camera turns 40° in from radius 9
    let three = null;
    if (cv && T()) {
      const TH = T();
      try {
        const r = new TH.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
        r.setPixelRatio(Math.min(devicePixelRatio, 2));
        const scene = new TH.Scene(), cam = new TH.PerspectiveCamera(30, 1, 0.1, 100);
        const ink = inkOf(cv);
        const layers = [];
        for (let i = 0; i < 5; i++) {
          const grp = new TH.Group();
          const m = new TH.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.25 + i * 0.12 });
          const frame = new TH.LineSegments(new TH.EdgesGeometry(new TH.BoxGeometry(2, 4.2, 0.06)), m);
          grp.add(frame);
          if (i % 2) for (let k = 0; k < 6; k++) { const bar = new TH.LineSegments(new TH.EdgesGeometry(new TH.BoxGeometry(1.8, 0.03, 0.03)), m); bar.position.y = -1.8 + k * 0.72; bar.rotation.z = (k % 2 ? 1 : -1) * 0.5; grp.add(bar); }
          scene.add(grp); layers.push(grp);
        }
        const st = { spread: 0, cam: 0 };
        const size = () => { r.setSize(cv.clientWidth, cv.clientHeight, false); cam.aspect = cv.clientWidth / Math.max(1, cv.clientHeight); cam.updateProjectionMatrix(); };
        const ro = new ResizeObserver(size); ro.observe(cv);
        const draw = () => {
          layers.forEach((l, i) => { l.position.x = (i - 2) * 3.2 * st.spread; l.rotation.y = -0.5 * st.spread; });
          const a = (-40 + 40 * st.cam) * (Math.PI / 180), rad = 13 - 2 * st.cam;
          cam.position.set(Math.sin(a) * rad, 1.2 - st.cam, Math.cos(a) * rad); cam.lookAt(0, 0, 0);
          r.render(scene, cam);
        };
        gsap.ticker.add(draw);
        three = { st, off: () => { gsap.ticker.remove(draw); ro.disconnect(); r.dispose(); } };
      } catch (e) { three = null; }
    }
    if (SA.reduce) { go(3); if (three) Object.assign(three.st, { spread: 0, cam: 1 }); return () => three?.off(); }
    const tl = gsap.timeline({ defaults: { duration: 1, ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true } });
    tl.add(() => go(tl.scrollTrigger?.direction === -1 ? -1 : 0), 0.1)
      .add(() => go(tl.scrollTrigger?.direction === -1 ? 0 : 1), 2.05)
      .fromTo(path, { drawSVG: "0%" }, { duration: 0.75, drawSVG: "100%" }, 2.5)
      .to([...qa("[data-door-layer]", sec)].reverse(), { opacity: 1, duration: 0.2, stagger: 0.2, ease: "In" }, 3.25)
      .add(() => go(tl.scrollTrigger?.direction === -1 ? 1 : 2), 3.7);
    if (three) tl.to(three.st, { spread: 1, duration: 1.25, ease: "power2.inOut" }, 1).to(three.st, { cam: 1, duration: 3, ease: "power2.inOut" }, 1).to(three.st, { spread: 0, duration: 1.25, ease: "power2.inOut" }, 4.5);
    tl.add(() => go(tl.scrollTrigger?.direction === -1 ? 2 : 3), 5.2).to({}, { duration: 1 }, 5.5);
    return () => three?.off();
  };

  // ── Work parallax (data-speed %), services strip (flows sideways, the center word lights up and the photo opens from below), process expand (.5s Out), worldwide (spreads to both sides)
  const band = (root) => { const b = root.querySelector(".wi-band"); if (b) gsap.to(b, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: root.querySelector(".works-intro"), start: "top top", end: "bottom bottom", scrub: true } }); };
  // When the Hero clone attached at the end reaches the top, it quietly jumps back to the top so it loops endlessly
  const loop = (root) => { const c = root.querySelector("[data-loop]"); if (!c) return; ScrollTrigger.create({ trigger: c, start: "top top", onEnter: () => { const L = SA.lenis; L ? L.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0); } }); };
  const works = (root) => qa("[data-speed]", root).forEach((el) => gsap.fromTo(el, { yPercent: -+el.dataset.speed }, { yPercent: +el.dataset.speed, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }));
  const services = (root) => {
    const sec = root.querySelector(".services"), track = sec.querySelector("[data-sv-track]"), words = qa(".sv-word", sec), imgs = qa(".sv-img", sec);
    let cur = 0;
    const set = (i) => {
      if (i === cur) return;
      const fwd = i > cur, was = cur; cur = i;
      words.forEach((w, k) => w.classList.toggle("is-active", k === i));
      gsap.set(imgs[i], { zIndex: 2 }); gsap.set(imgs[was], { zIndex: 1 });
      gsap.fromTo(imgs[i], { clipPath: fwd ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "InOut", overwrite: true });
    };
    words[0].classList.add("is-active");
    gsap.to(track, { x: () => -(track.scrollWidth - innerWidth * 0.5 - words.at(-1).offsetWidth / 2) + innerWidth * 0.0, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true, onUpdate: (s) => set(Math.min(words.length - 1, Math.round(s.progress * (words.length - 1)))) } });
  };
  const process = (root) => qa(".pr-item", root).forEach((it) => {
    const b = it.querySelector(".pr-btn"), body = it.querySelector(".pr-body");
    b.addEventListener("click", () => {
      const open = !it.classList.contains("is-open");
      qa(".pr-item.is-open", root).forEach((o) => { if (o !== it) { o.classList.remove("is-open"); o.querySelector(".pr-btn").setAttribute("aria-expanded", "false"); gsap.to(o.querySelector(".pr-body"), { height: 0, duration: 0.5, ease: "Out" }); } });
      it.classList.toggle("is-open", open); b.setAttribute("aria-expanded", open);
      gsap.to(body, { height: open ? "auto" : 0, duration: 0.5, ease: "Out", onComplete: () => ScrollTrigger.refresh() });
    });
  });
  const worldwide = (root) => qa("[data-ww]", root).forEach((el) => gsap.fromTo(el, { xPercent: 0 }, { xPercent: 40 * +el.dataset.ww, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }));

  SA.pages.home = (root) => {
    const offs = [];
    process(root);
    if (SA.reduce) { panels(root); return; }
    const mm = gsap.matchMedia();
    mm.add("(min-width: 0px)", () => {
      offs.push(cubes(root), door(root));
      panels(root); approach(root); watch(root); band(root); works(root); services(root); worldwide(root); loop(root);
    });
    return () => { offs.forEach((f) => f?.()); mm.revert(); };
  };
  gsap.registerPlugin(DrawSVGPlugin);
})();
