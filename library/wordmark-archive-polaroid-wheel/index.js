// Home page: three-letter loader → letter band, credits line and paragraph line rise, archive entry button (cursor reveal + band covering the screen as a curtain), phone paragraph slide.
CRL.page("home", (view, life) => {
  const { Strip, fontsReady, reduce, splitLines, cursorFollow } = CRL;
  const canvas = view.querySelector(".gl-canvas");
  const hero = view.querySelector(".hero");
  let transitioning = true;
  let textGL = null;

  const strip = new Strip({
    canvas, color: "--site-black", scroll: true, hover: true, gap: 0.025,
    baseSpeed: reduce ? 0 : 0.02, opacity: { value: 0 },
    hoverReady: () => !transitioning,
  });
  // When leaving via the ”Enter Archive” curtain, the strip must stay over the new screen and clear away, so detaching is deferred until the curtain ends
  life.add(() => { if (!strip.keep) strip.dispose(); });
  // On leaving (original home transitionOut): unless it is the ”enter library” curtain, the band and text plane are erased with .5s sine.inOut
  life.leave(() => { if (!strip.keep) gsap.to([strip.opacity, ...(textGL ? [textGL.opacity] : [])], { value: 0, duration: reduce ? 0 : 0.5, ease: "sine.inOut", overwrite: true }); });
  // Loader letters (original Sx): one plane per letter plate of the strip image. Fills smoothly from under the plate (+x side of the rotated plate) with boundary ±.02, and unfilled areas show through at .15
  const LOADER_FRAG = `
    uniform sampler2D uMask;
    uniform vec3 uColor;
    uniform vec2 uBand;
    uniform float uFill, uOpacity;
    varying vec2 vUv;
    void main() {
      float a = texture2D(uMask, vec2(vUv.x, mix(uBand.x, uBand.y, vUv.y))).a;
      float from = 1.0 - vUv.x;
      float filled = smoothstep(from - 0.02, from + 0.02, mix(-0.03, 1.03, uFill));
      gl_FragColor = vec4(uColor, a * mix(0.15, 1.0, filled) * uOpacity);
    }`;
  const loader = { opacity: { value: 0 }, fill: { value: 0 }, rects: null, meshes: [], on: false };
  function buildLoader() {
    const th = strip.tex.height;
    const geo = new THREE.PlaneGeometry(1, 1);
    loader.meshes = strip.strip.bands.map((b) => {
      const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({
        vertexShader: CRL.PLANE_VERT, fragmentShader: LOADER_FRAG, transparent: true, depthWrite: false, depthTest: false,
        uniforms: { uMask: { value: strip.maskTex }, uColor: { value: strip.uniforms.uColor.value }, uBand: { value: new THREE.Vector2(1 - b.y1 / th, 1 - b.y0 / th) }, uFill: loader.fill, uOpacity: loader.opacity },
      }));
      m.frustumCulled = false;
      m.renderOrder = 1;
      strip.scene.add(m);
      return m;
    });
  }
  function disposeLoader() {
    loader.meshes.forEach((m) => { strip.scene.remove(m); m.material.dispose(); });
    loader.meshes[0]?.geometry.dispose();
    loader.meshes = [];
  }

  // Original rowRects: text height = Screen height × .12, letter spacing = Average character length × gap. Characters in the vertical strip are rotated 90° clockwise so they read horizontally.
  function rowRects(height, gap) {
    const { W, H } = strip;
    const tex = strip.tex;
    const n = height * H;
    const L = (n * tex.height) / tex.width;
    const s = strip.strip.bands.map((b) => ((b.y1 - b.y0) / tex.height) * L);
    const a = gap * (s.reduce((p, q) => p + q, 0) / s.length);
    const o = s.reduce((p, q) => p + q, 0) + a * (s.length - 1);
    let c = W / 2 - o / 2;
    return s.map((len) => { const r = { x: c + len / 2, y: H / 2, w: n, h: len, rot: Math.PI / 2 }; c += len + a; return r; });
  }
  // Original stackRects(1): keeps the center letter at screen center and wraps the rest to the band length and attaches them — swapping in a band at this spot leaves no seam
  function stackRects(idx) {
    const { W, H } = strip;
    const tex = strip.tex;
    const z = strip.zoom;
    const L = (W * z * tex.height) / tex.width;
    const bands = strip.strip.bands;
    const cy = (b) => (b.y0 + b.y1) / 2 / tex.height;
    const s = cy(bands[idx]);
    return {
      rects: bands.map((b) => {
        let e = cy(b) - s;
        e -= Math.round(e);
        return { x: W / 2, y: H / 2 + e * L, w: z * W, h: ((b.y1 - b.y0) / tex.height) * L, rot: 0 };
      }),
      scroll: 1 - s,
    };
  }

  // Converts the plate position in canvas coordinates (top is 0) to GL coordinates with the center at 0
  function placeLoader() {
    if (!loader.on) return;
    const { W, H } = strip;
    loader.rects.forEach((r, i) => {
      const m = loader.meshes[i];
      m.position.set(r.x - W / 2, H / 2 - r.y, 0);
      m.scale.set(r.w, r.h, 1);
      m.rotation.z = -r.rot;
    });
  }

  let last = performance.now();
  life.tick(() => {
    const now = performance.now();
    const dt = Math.min(now - last, 50) / 1000;
    last = now;
    strip.update(dt);
    textGL?.update();
    placeLoader();
    strip.draw();
  });

  // ── Text splitting (desktop copyright line by letter, paragraphs by line)
  const desktop = !CRL.isMobile();
  const heads = [...hero.querySelectorAll(".hero__h > span")];
  const paras = [...hero.querySelectorAll(".hero__layout [data-hero-para]")];
  const cats = [...hero.querySelectorAll(".hero__cats li, .hero__initials")];
  const btn = hero.querySelector("[data-cursor-item]");
  const mReveal = [...hero.querySelectorAll("[data-m-reveal]")];
  const mRise = [...hero.querySelectorAll("[data-m-rise]")];

  function intro() {
    const charSplits = heads.map((h) => SplitText.create(h, { type: "chars", mask: "chars" }));
    const chars = charSplits.flatMap((s) => s.chars);
    const lineSplits = paras.map((p) => splitLines(p));
    const lines = lineSplits.flatMap((s) => s.lines);
    const mLines = mReveal.map((el) => splitLines(el)).flatMap((s) => s.lines);
    gsap.set([...chars, ...lines, ...mLines], { yPercent: 115 });
    // On desktop with a mouse, copyright text and paragraph lines move onto the strip scene’s GL plane, offset on the same grid
    if (desktop && matchMedia("(hover: hover)").matches) {
      const heads1 = [...hero.querySelectorAll(".hero__h")];
      textGL = new CRL.TextPlanes(strip, [...chars.map((el) => ({ el, mode: "char" })), ...lines.map((el) => ({ el, mode: "line" }))], [...heads1, ...paras]);
    }
    gsap.set([...cats, ...mRise], { autoAlpha: 0, y: 40 });
    gsap.set(btn, { visibility: "hidden" });
    // With a mouse the button is toggled by the cursor reveal (hidden at first like the original) — only touch devices reveal it at the end of the entrance
    const btnEnd = matchMedia("(hover: hover)").matches ? {} : { visibility: "visible" };

    // On first open (after the original loader): copyright text 1.25s at .045 intervals, paragraph lines 1s at .035 intervals (+.4), categories 1s (split .4). Nav is visible from the start like the original
    const text = (tl, at) => {
      tl.to(chars, { yPercent: 0, duration: 1.25, stagger: 0.045, ease: "power3.out" }, at)
        .to(lines, { yPercent: 0, duration: 1, stagger: 0.035, ease: "power3.out" }, "<+.4")
        .to(mLines, { yPercent: 0, duration: 1.25, stagger: { amount: 0.2 }, ease: "power3.out" }, "<")
        .to([...cats, ...mRise], { autoAlpha: 1, y: 0, duration: 1, stagger: { amount: 0.4, from: "start" }, ease: "power3.out" }, "<")
        .set(btn, btnEnd, ">")
        .call(() => (transitioning = false));
    };

    // When arriving from another page there is no loader (original Qx): the copyright letters start at .5 for 1s at .035 stagger, the paragraph lines at +.4 for 1s at .035 stagger, the band then rises in 2s sine.out,
    // Category runs .95 over 1s (split .4)
    if (CRL.arrived) {
      gsap.timeline()
        .to(chars, { yPercent: 0, duration: 1, stagger: 0.035, ease: "power3.out" }, 0.5)
        .to(lines, { yPercent: 0, duration: 1, stagger: 0.035, ease: "power3.out" }, "<+.4")
        .fromTo(strip.opacity, { value: 0 }, { value: 1, duration: 2, ease: "sine.out" }, "<")
        .to(mLines, { yPercent: 0, duration: 1.25, stagger: { amount: 0.4 }, ease: "power3.out" }, 0.5)
        .to([...cats, ...mRise], { autoAlpha: 1, y: 0, duration: 1, stagger: { amount: 0.4, from: "start" }, ease: "power3.out" }, 0.95)
        .set(btn, btnEnd, ">")
        .call(() => (transitioning = false));
      return;
    }

    // On first open: three letters appear faint, far apart (gap 5.5) → after .8 they fill from the bottom over 1.5s →
    // Gathers with 1s expo.inOut → at .8+.05i turns vertically with 1.5s expo.inOut and grows into the slots of a band 90% of the screen width
    buildLoader();
    loader.on = true;
    loader.rects = rowRects(0.12, 5.5);
    const tight = rowRects(0.12, 0.025);
    const { rects: stack, scroll } = stackRects(1);
    gsap.to(loader.opacity, { value: 1, duration: 0.3, ease: "sine.out" });
    const tl = gsap.timeline({ paused: true });
    loader.rects.forEach((r, i) => tl.to(r, { x: tight[i].x, duration: 1, ease: "expo.inOut" }, 0.01));
    loader.rects.forEach((r, i) => {
      const t = stack[i];
      tl.to(r, { x: t.x, y: t.y, w: t.w, h: t.h, rot: t.rot, duration: 1.5, ease: "expo.inOut" }, 0.8 + 0.05 * i);
    });
    tl.call(() => {
      strip.setScroll(scroll);
      strip.opacity.value = 1;
      loader.on = false;
      disposeLoader();
    }, null, ">-0.2");
    text(tl, ">-0.1");
    gsap.to(loader.fill, { value: 1, duration: 1.5, ease: "none", delay: 0.8, onComplete: () => tl.play() });
  }

  // ── Placeholder button: follows the mouse, and on press the band grows 14x as black covers the screen and it moves on to the archive
  hero.querySelectorAll("[data-curtain]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (transitioning) return;
      transitioning = true;
      const href = a.getAttribute("href");
      canvas.classList.add("is-curtain");
      let leave = () => (location.href = href);
      if (CRL.taxi) {
        // Original _curtainOut: once the curtain fully covers and the new screen is fully on, the band is erased over .6s power2.out, pulled in to 14×.7
        strip.keep = true;
        document.body.append(canvas);
        let covered = false, entered = false;
        const draw = () => { strip.update(1 / 60); strip.draw(); };
        const reveal = () => {
          if (!covered || !entered) return;
          gsap.timeline({ onComplete: () => { gsap.ticker.remove(draw); strip.dispose(); canvas.remove(); } })
            .to(strip.opacity, { value: 0, duration: reduce ? 0 : 0.6, ease: "power2.out" }, 0)
            .to(strip.zoomV, { value: 14 * 0.7, duration: reduce ? 0 : 0.6, ease: "power2.out" }, 0);
        };
        CRL.afterEnter.push(() => { entered = true; gsap.ticker.add(draw); reveal(); });
        leave = () => { covered = true; reveal(); };
        CRL.go(href, a);
      } else sessionStorage.setItem("crl-veil", CRL.cssRgb("--site-black"));
      gsap.timeline({ onComplete: () => leave() })
        .to([hero.querySelector(".hero__layout"), hero.querySelector(".hero-m")], { opacity: 0, duration: 0.1, ease: "sine.out" }, 0)
        .to(textGL ? textGL.opacity : {}, { value: 0, duration: 0.1, ease: "sine.out" }, 0)
        .to(strip.zoomV, { value: 14, duration: reduce ? 0 : 0.6, ease: "power2.in" }, 0)
        .to(strip.cover, { value: 1, duration: reduce ? 0 : 0.35, ease: "none" }, reduce ? 0 : 0.2);
    })
  );

  // ── Phone: two paragraphs swap in turn with a 7.5s progress bar (outgoing line -115%, incoming line 115%→0 at .025 stagger)
  function mobileSlide() {
    const ps = [...hero.querySelectorAll("[data-m-p]")];
    const num = hero.querySelector("[data-m-num]");
    const bar = hero.querySelector(".hero-m__bar i");
    const splits = ps.map((p) => splitLines(p));
    gsap.set(splits[1].lines, { yPercent: 115 });
    let cur = 0;
    const cycle = () => {
      gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 7.5, ease: "none", onComplete: next });
    };
    const next = () => {
      const nx = 1 - cur;
      gsap.to(bar, { scaleX: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(splits[cur].lines, { yPercent: -115, duration: 0.8, stagger: 0.025, ease: "power4.out" });
      gsap.fromTo(splits[nx].lines, { yPercent: 115 }, { yPercent: 0, duration: 0.8, stagger: 0.025, ease: "power3.out", delay: 0.2 });
      gsap.to(num, { yPercent: -115, duration: 0.4, ease: "power3.in", onComplete: () => {
        num.textContent = `(${nx + 1})`;
        gsap.fromTo(num, { yPercent: 115 }, { yPercent: 0, duration: 0.8, ease: "power3.out" });
      } });
      cur = nx;
      gsap.delayedCall(0.8, cycle);
    };
    cycle();
  }

  fontsReady.then(life.wrap(() => {
    strip.resize();
    cursorFollow(hero.querySelector(".hero__cursor"));
    if (reduce) {
      strip.opacity.value = 1;
      transitioning = false;
      return;
    }
    intro();
    if (!desktop) mobileSlide();
  }));
});
