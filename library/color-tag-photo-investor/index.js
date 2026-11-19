// Scenes: Hero (photo frame → color tag, original hero.js values), bead-string section (logo row + three bead string), Principles (.94 → 1), investment list (filtering · following table), News (rising in turn)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();
  const R = (a, b) => a + Math.random() * (b - a);

  // ---------- Hero ----------
  const hx = document.querySelector(".hx"), stage = hx.querySelector(".hx__stage");
  const cellsBox = hx.querySelector(".hx__cells"), cells = [...hx.querySelectorAll(".hx__cell")];
  const titleL = hx.querySelectorAll(".hx__l > *, .hx__l"), headL = hx.querySelectorAll(".hx__hl");
  const navs = hx.querySelector(".hx__navs"), grid = hx.querySelector(".hx__grid"), top = hx.querySelector(".hx__top");
  const final = hx.querySelector(".hx__final"), zoom = hx.querySelector(".hx__zoom"), tags = [...hx.querySelectorAll(".hx__tag")];
  cells[4].querySelector(".hx__media").dataset.label = "People in suits in an elevator · dark wooden wall interior · one photo split into 3×2";
  const titleLines = [...hx.querySelectorAll(".hx__l")];
  titleLines.forEach((l) => { l.innerHTML = `<span style="display:block">${l.textContent}</span>`; });
  const titleIn = titleLines.map((l) => l.firstElementChild);

  let W = 0, H = 0;
  const layout = () => {
    W = cellsBox.clientWidth; H = cellsBox.clientHeight;
    cells.forEach((c, i) => {
      const col = i % 3, row = (i / 3) | 0, w = W / 3, h = H / 2;
      c._home = { left: col * w + w / 2, top: row * h + h / 2, width: w, height: h };
      const m = c.querySelector(".hx__media");
      m.style.setProperty("--bw", `${W}px`); m.style.setProperty("--bh", `${H}px`);
      m.style.setProperty("--bx", `${-col * w}px`); m.style.setProperty("--by", `${-row * h}px`);
    });
  };
  layout();
  const homeCells = () => cells.forEach((c) => gsap.set(c, c._home));
  homeCells();
  tags.forEach((t) => gsap.set(t, { left: "50%", top: "50%" }));
  gsap.set(headL, { yPercent: 110 });

  const chipSize = (c) => { const ch = c.querySelector(".hx__chip"); return { w: ch.offsetWidth, h: ch.offsetHeight }; };
  let drift = [];
  const startDrift = () => {
    if (drift.length || reduce) return;
    drift = [...tags, ...cells.filter((c) => c.dataset.word)].map((el) => gsap.to(el, { x: R(-6, 6), y: R(-5, 5), duration: R(2, 3.2), ease: "sine.inOut", yoyo: true, repeat: -1, delay: R(0, 1.2) }));
  };
  const stopDrift = () => { drift.forEach((d) => d.kill()); drift = []; gsap.set([...tags, ...cells], { x: 0, y: 0 }); };

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // On entry: cells are revealed in turn on the white stage (.07 gaps), the nav comes in at .55s, and the title line pops up from 2.95s with .7s power3.out
    const intro = gsap.timeline();
    intro.from(cells.map((c) => c.querySelector(".hx__media")), { clipPath: "inset(50% 50% 50% 50%)", duration: 0.9, ease: "power3.inOut", stagger: 0.07 }, 0.75)
      .from(grid, { opacity: 0, duration: 0.5 }, 1.9)
      .from(navs.children, { opacity: 0, y: 12, duration: 0.55, ease: "power2.out", stagger: 0.08 }, 2.2)
      .from(titleIn, { yPercent: 110, duration: 0.7, ease: "power3.out", stagger: 0.06 }, 2.95);
    // The original starts from a white stage (hpx-noflash) and the cells spread out to make a dark stage
    const dark = getComputedStyle(stage).backgroundColor;
    intro.fromTo(stage, { backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--kf-bg").trim() }, { backgroundColor: dark, duration: 0.6 }, 0.65);

    // Scroll: tag scene for 3300px, then recedes for 1400px + screen height — scrub .3
    const SCRUB = 3300, ZOOM = 1400, Pe = 0.12;
    const total = SCRUB + ZOOM + innerHeight;
    const tl = gsap.timeline({ scrollTrigger: { trigger: hx, start: "top top", end: `+=${total}`, pin: stage, scrub: 0.3, anticipatePin: 1, invalidateOnRefresh: true,
      // As in the original, the menu state (cells darkened) applies only at scroll 0
      onUpdate: (st) => { const run = st.progress > 0; cellsBox.classList.toggle("is-run", run); if (run) cells.forEach((c) => c.classList.remove("is-dim")); st.progress * total / SCRUB >= 0.62 ? startDrift() : stopDrift(); }, onRefresh: () => layout() } });
    tl.to(titleIn, { yPercent: 120, duration: 0.5, ease: "power2.in", stagger: 0.05 }, 0)
      .to(grid, { opacity: 0, duration: 0.45, ease: "power1.in" }, 0)
      .to(top, { opacity: 0, y: -20, duration: 0.4, ease: "power1.in" }, 0.05)
      .to(navs, { opacity: 0, duration: 0.3 }, 0.05)
      .to(final, { opacity: 1, duration: 1.2, ease: "power1.inOut" }, Pe + 0.35);
    cells.filter((c) => !c.dataset.word).forEach((c, i) => tl.to(c.querySelector(".hx__media"), { opacity: 0, duration: 0.5, ease: "power1.inOut" }, Pe + 0.15 + i * 0.05));
    const spots = { 1: [47, 14], 3: [30, 41], 5: [86, 41] };
    cells.filter((c) => c.dataset.word).forEach((c, i) => {
      const n = Pe + 0.1 + i * 0.08, [x, y] = spots[c.dataset.cell], sz = chipSize(c);
      tl.to(c.querySelector(".hx__fill"), { opacity: 1, duration: 0.4, ease: "power1.inOut" }, n)
        .to(c.querySelector(".hx__media"), { opacity: 0, duration: 0.45, ease: "power1.in" }, n + 0.1)
        .to(c, { left: () => (x / 100) * stage.clientWidth, top: () => (y / 100) * stage.clientHeight - 70, width: sz.w, height: sz.h, duration: 0.8, ease: "power2.inOut" }, n + 0.55)
        .to(c.querySelector(".hx__chip"), { opacity: 1, duration: 0.35 }, n + 0.75);
    });
    tags.filter((t) => !t.hasAttribute("data-outer")).forEach((t, i) => {
      const n = Pe + 0.6 + i * 0.09;
      tl.to(t, { opacity: 1, duration: 0.25 }, n).to(t, { left: `${t.dataset.x}%`, top: `${t.dataset.y}%`, duration: 1, ease: "power3.out" }, n);
    });
    tags.filter((t) => t.hasAttribute("data-outer")).forEach((t) => gsap.set(t, { left: `${t.dataset.x}%`, top: `${t.dataset.y}%`, opacity: 1 }));
    const Dt = Pe + 1.35, gi = 0.55 + 0.05 * (headL.length - 1);
    tl.to(headL, { yPercent: 0, duration: 0.55, ease: "power3.out", stagger: 0.05 }, Dt);
    const ut = tl.duration(), Ze = ut / SCRUB, Ae = Math.min(ut, Dt + gi), Ke = ut + (ZOOM + innerHeight) * Ze - Ae, kt = Ke - (innerHeight / 2) * Ze;
    const front = [hx.querySelector(".hx__tags"), hx.querySelector(".hx__headline")];
    tl.to(hx.querySelector(".hx__white"), { opacity: 1, duration: Ke * 0.4, ease: "none" }, Ae)
      .to(front, { scale: 0.58, duration: Ke, ease: "none" }, Ae)
      .to(cellsBox, { scale: 0.6, duration: Ke, ease: "none" }, Ae)
      .to(cellsBox, { filter: "blur(8px)", opacity: 0, duration: kt, ease: "power2.in" }, Ae)
      .to(tags.filter((t) => t.hasAttribute("data-outer")), { opacity: 0, duration: (innerHeight / 2) * Ze, ease: "power1.in" }, Ae + Ke - innerHeight * Ze);
    return () => { stopDrift(); homeCells(); };
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(headL, { yPercent: 0 }); });
  addEventListener("resize", () => { layout(); });

  // ---------- Bead strip section: fixed 900 + 1300px ----------
  // The logo row’s pinning and paging is the focus-step-column part (original manifesto.js values). Here only the bead rows on both sides — receives wobble · descent · vanish via the fx:speed that the part fires
  const mf = document.querySelector(".mf"), mfStage = mf.querySelector(".mf__stage"), cv = mf.querySelector(".mf__cords");
  const S = { energy: 0, slide: 0, exit: 0, exitT: 0 };
  mfStage.addEventListener("fx:speed", (e) => { const d = e.detail; S.energy = Math.min(1, S.energy + Math.abs(d.velocity) * 8e-5); S.slide = d.slide; S.exitT = d.exit; });
  // Bead strings: two vertical tubes (three) — color segments and black ticks are painted lengthwise by a shader, and they wobble in waves according to scroll strength (energy)
  const rgb = (v) => { const p = document.createElement("i"); p.style.color = `var(${v})`; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return new THREE.Color(c); };
  const renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const pal = ["--site-blue", "--site-lime", "--site-red", "--site-pink", "--site-khaki", "--site-bord"].map(rgb);
  const ink = rgb("--kf-ink");
  const cordMat = (seed) => new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uAmp: { value: 0 }, uSeed: { value: seed }, uInk: { value: ink }, uPal: { value: pal } },
    vertexShader: `uniform float uT, uAmp, uSeed; varying vec2 vUv; varying vec3 vN;
      void main(){ vUv = uv; vec3 p = position; float y = p.y;
        p.x += sin(y * .006 + uT * 1.3 + uSeed) * (4. + uAmp * 40.) + sin(y * .013 - uT * .7 + uSeed * 2.) * (2. + uAmp * 14.);
        vN = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.); }`,
    fragmentShader: `uniform vec3 uInk; uniform vec3 uPal[6]; uniform float uSeed; varying vec2 vUv; varying vec3 vN;
      void main(){ float s = vUv.x * 60. + uSeed * 7.; float seg = floor(s); float k = mod(seg, 6.);
        vec3 c = uPal[0]; if (k > .5) c = uPal[1]; if (k > 1.5) c = uPal[2]; if (k > 2.5) c = uPal[3]; if (k > 3.5) c = uPal[4]; if (k > 4.5) c = uPal[5];
        float f = fract(s); float tick = step(.82, f) + step(fract(s * 4.), .12) * step(abs(vUv.y - .5), .18);
        float shade = .78 + .22 * abs(vN.x);
        gl_FragColor = vec4(mix(c * shade, uInk, clamp(tick, 0., 1.)), 1.); }`,
  });
  // A single line = Helix where two strands wind in opposite phase (the original twisted bead string) — one tube per strand, the helix built in the vertex shader
  const cords = [];
  [0, 1].forEach((i) => [0, Math.PI].forEach((ph, j) => {
    const pts = []; for (let k = 0; k <= 60; k++) pts.push(new THREE.Vector3(0, 1600 - k * 53, 0));
    const mat = cordMat(i * 3.1 + j * 1.7);
    mat.uniforms.uPhase = { value: ph };
    mat.vertexShader = mat.vertexShader.replace("uniform float uT, uAmp, uSeed;", "uniform float uT, uAmp, uSeed, uPhase;").replace("vN = normal;", "p.x += sin(y * .026 + uPhase + uT * .4) * 11.; p.z += cos(y * .026 + uPhase + uT * .4) * 11.; vN = normal;");
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 6, 8, false), mat);
    mesh.userData.cord = i;
    scene.add(mesh);
    cords.push(mesh);
  }));
  const size = () => {
    const w = mfStage.clientWidth, h = mfStage.clientHeight;
    renderer.setSize(w, h, false);
    Object.assign(cam, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
    cam.updateProjectionMatrix();
    cords.forEach((c) => (c.position.x = c.userData.cord ? w * 0.125 : -w * 0.125));
  };
  size();
  addEventListener("resize", size);
  let t0 = 0, mfOn = false;
  new IntersectionObserver((es) => es.forEach((e) => (mfOn = e.isIntersecting)), { rootMargin: "400px" }).observe(mf);
  gsap.ticker.add((time) => {
    if (!mfOn) return;
    const dt = t0 ? time - t0 : 0.016; t0 = time;
    S.energy *= 0.94; S.exit += (S.exitT - S.exit) * 0.07;
    const I = Math.max(0, (S.exit - 0.7) / 0.3), op = I <= 0.72 ? 1 : Math.max(0, 1 - (I - 0.72) / 0.28);
    cv.style.opacity = op.toFixed(3);
    cords.forEach((c) => { c.material.uniforms.uT.value += reduce ? 0 : dt; c.material.uniforms.uAmp.value = S.energy; c.position.y = -S.slide * 300; });
    renderer.render(scene, cam);
  });

  // ---------- Principles: the paragraph group settles to full size from .94x (scrub .5) ----------
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".pr__body", { scale: 0.94 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".pr", start: "top 95%", end: "center center", scrub: 0.5 } });
    gsap.from(".pr__h", { opacity: 0, y: 30, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ".pr", start: "top 85%" } });
    gsap.from(".st__card", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: ".st__row", start: "top 85%" } });
  });

  // ---------- Investment list: sector filter (rows enter 30ms apart over .48s), a name tag follows the cursor over rows ----------
  const pf = document.querySelector(".pf"), filter = pf.querySelector(".pf__filter"), current = pf.querySelector(".pf__current");
  const rows = [...pf.querySelectorAll(".pf__row")], badge = pf.querySelector(".pf__badge"), bname = badge.querySelector(".pf__bname");
  // Original portfolio.js: on open, the current value text hides at once and the chevron flips, then chips come in one by one from −.75rem over 420ms (30ms apart). On close, the chip group disappears in 180ms.
  const chipsBox = pf.querySelector(".pf__chips"), chev = pf.querySelector(".pf__toggle svg"), chipEls = [...chipsBox.children];
  let open = false, anims = [];
  pf.querySelector(".pf__toggle").addEventListener("click", () => {
    open = !open;
    filter.classList.toggle("is-open", open);
    chev.style.transform = open ? "rotate(180deg)" : "";
    current.style.opacity = open ? "0" : "";
    anims.forEach((a) => a.cancel()); anims = [];
    if (open) {
      chipsBox.style.display = "flex";
      if (!reduce) chipEls.forEach((c, i) => anims.push(c.animate([{ opacity: 0, transform: "translateX(-0.75rem)" }, { opacity: 1, transform: "none" }], { duration: 420, delay: i * 30, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" })));
    } else if (!reduce) {
      const a = chipsBox.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "ease-out" });
      anims.push(a);
      a.onfinish = () => { if (!open) chipsBox.style.display = "none"; };
    } else chipsBox.style.display = "none";
  });
  pf.querySelectorAll(".pf__chip").forEach((chip) => chip.addEventListener("click", () => {
    const s = chip.dataset.sector;
    pf.querySelectorAll(".pf__chip").forEach((c) => c.classList.toggle("is-on", c === chip));
    current.textContent = s;
    const shown = rows.filter((r) => s === "Entire" || r.dataset.sector === s);
    rows.forEach((r) => r.classList.toggle("is-out", !shown.includes(r)));
    if (!reduce) gsap.fromTo(shown, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.48, ease: "power2.out", delay: (i) => i * 0.03 });
    ScrollTrigger.refresh();
  }));
  // Name tag: follows the cursor to +20 · +14 (inside 200 from the window’s right and 65 from the bottom) by .3 each frame (original portfolio.js Ve), shown only while a row is hovered. Bead pieces spring toward that row’s top and bottom edges
  const cord = pf.querySelector(".pf__cord"), list = pf.querySelector(".pf__list");
  let act = null, ptr = { x: 0, y: 0 }, bxy = null, ct = { top: innerHeight / 2, bottom: innerHeight / 2, vt: 0, vb: 0 }, last = 0;
  addEventListener("pointermove", (e) => { ptr = { x: e.clientX, y: e.clientY }; }, { passive: true });
  rows.forEach((r) => {
    r.addEventListener("pointerenter", () => { act = r; bname.textContent = r.querySelector(".pf__name").textContent.slice(0, 6); });
    r.addEventListener("pointerleave", () => { if (act === r) act = null; });
  });
  const pfFrame = (time) => {
    const dt = last ? Math.min(time - last, 1 / 30) : 1 / 60; last = time;
    const lr = list.getBoundingClientRect();
    if (lr.bottom < -200 || lr.top > innerHeight + 200) return;
    const tx = Math.min(ptr.x + 20, innerWidth - 200), ty = Math.min(ptr.y + 14, innerHeight - 65);
    if (!bxy) bxy = { x: tx, y: ty };
    const k = reduce ? 1 : 0.3;
    bxy.x += (tx - bxy.x) * k; bxy.y += (ty - bxy.y) * k;
    badge.style.transform = `translate3d(${Math.max(8, bxy.x)}px, ${Math.max(8, bxy.y)}px, 0)`;
    badge.style.opacity = act ? "1" : "0";
    // The piece board is fixed to window height — it follows the row’s top and bottom edges relative to the window
    const rr = act?.getBoundingClientRect(), H = innerHeight;
    cord.style.left = `${lr.left}px`;
    cord.style.visibility = lr.top < H && lr.bottom > 0 ? "visible" : "hidden";
    // As in the original, if no row has a hand on it, pieces stay in place and only fade
    cord.style.opacity = rr ? "1" : "0";
    if (!rr) return;
    const goT = rr.top, goB = rr.bottom;
    for (const [p, v, g] of [["top", "vt", goT], ["bottom", "vb", goB]]) {
      if (reduce) { ct[p] = g; continue; }
      const K = 120, D = 2 * Math.sqrt(K);
      ct[v] += (K * (g - ct[p]) - D * ct[v]) * dt; ct[p] += ct[v] * dt;
    }
    cord.style.clipPath = `inset(${Math.max(0, Math.min(ct.top, ct.bottom))}px 0 ${Math.max(0, H - Math.max(ct.top, ct.bottom))}px 0)`;
  };
  gsap.ticker.add(pfFrame);

  // Hero menu cells: attached to the cell itself like the original hero.js — entering a cell dims the other cells by .4 over .42s, and leaving the cell (even moving onto menu text overlaid on top) releases them all.
  // The original darkens only in the menu state (before scroll)
  if (matchMedia("(hover: hover)").matches) cells.forEach((c) => {
    c.addEventListener("pointerenter", () => { if (!cellsBox.classList.contains("is-run")) cells.forEach((o) => o.classList.toggle("is-dim", o !== c)); });
    c.addEventListener("pointerleave", () => cells.forEach((o) => o.classList.remove("is-dim")));
  });
})();
