// Devices shared across pages — smooth scroll, header bar brightness, menu drawer, releasing scroll after the gate, photo parallax, footer descending, footer cube
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // Original Lenis values: duration .82s, curve 1 − 2^(−10t) (expo.out)
  const lenis = reduce ? null : new Lenis({ duration: 0.82, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.cmScroll = lenis;
  history.scrollRestoration = "manual";
  scrollTo(0, 0);

  const gate = document.querySelector(".cm-portal");
  window.cmIntro = !!gate;
  if (gate) {
    lenis?.stop();
    gate.addEventListener("fx:done", () => {
      window.cmIntro = false;
      ScrollTrigger.refresh();
      lenis?.resize();
      lenis?.start();
    });
  }

  // Header bar brightness — follows the data-header of the section crossing the header bar’s mid height (later sections in the document take priority)
  const header = document.querySelector(".cm-header");
  if (header) {
    const zones = [...document.querySelectorAll("[data-header]")];
    let line = header.offsetHeight / 2, lastY = null, theme = null;
    const apply = (t) => {
      if (t === theme) return;
      theme = t;
      header.classList.toggle("is-dark", t === "dark");
      header.classList.toggle("is-light", t === "light");
    };
    const update = () => {
      for (let i = zones.length - 1; i >= 0; i--) {
        const { top, bottom } = zones[i].getBoundingClientRect();
        if (top <= line && bottom > line) return apply(zones[i].dataset.header);
      }
      apply("light");
    };
    gsap.ticker.add(() => { if (scrollY !== lastY) { lastY = scrollY; update(); } }, false, true);
    addEventListener("resize", () => { line = header.offsetHeight / 2; lastY = null; });
  }

  // Menu drawer — on desktop only the pressed group shows, with the heading entering from the left and links from 120px right over 1.2s power4.out
  const sub = document.querySelector(".cm-submenu");
  if (sub) {
    const inner = sub.querySelector(".cm-submenu__inner");
    let tl = null, current = null, closing = null;
    const isMobile = () => innerWidth <= 767;
    const open = (target) => {
      const m = isMobile();
      if (!m && current && closing) { gsap.set(current, { display: "none" }); closing.kill(); closing = null; }
      current = m ? null : sub.querySelector(`.cm-submenu__item[data-submenu="${target}"]`);
      tl?.kill();
      tl = gsap.timeline({
        defaults: { duration: reduce ? 0 : 1.2, ease: "power4.out" },
        onStart: () => { sub.classList.add("is-open"); if (current) gsap.set(current, { display: "flex" }); },
      });
      if (m || !current) {
        tl.fromTo(inner.querySelectorAll(".cm-caps"), { xPercent: -100 }, { xPercent: 0, stagger: 0.1 });
        tl.fromTo(inner.querySelectorAll(".cm-submenu__link"), { x: 120 }, { x: 0, stagger: 0.05 }, "<");
      } else {
        tl.fromTo(current.querySelector(".cm-caps"), { xPercent: -100 }, { xPercent: 0 });
        tl.fromTo(current.querySelectorAll(".cm-submenu__link"), { x: 120 }, { x: 0, stagger: 0.1 }, "<");
      }
    };
    const close = (e) => {
      e?.preventDefault();
      sub.classList.remove("is-open");
      tl?.kill();
      if (!isMobile() && current) {
        const c = current;
        closing = gsap.delayedCall(0.42, () => { gsap.set(c, { display: "none" }); current = null; closing = null; });
      }
    };
    document.querySelectorAll(".cm-header [data-submenu]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); open(a.dataset.submenu); }));
    document.querySelector(".cm-header__toggle")?.addEventListener("click", (e) => { e.preventDefault(); open("all"); });
    sub.querySelector(".cm-submenu__close").addEventListener("click", close);
    sub.querySelector(".cm-submenu__overlay").addEventListener("click", close);
    sub.querySelectorAll(".cm-submenu__link").forEach((a) => a.addEventListener("click", () => close()));
    addEventListener("resize", () => sub.classList.contains("is-open") && close());

    const withVisuals = sub.querySelector(".cm-submenu__item:has(.cm-submenu__visuals)");
    if (withVisuals) {
      const links = [...withVisuals.querySelectorAll(".cm-submenu__link")];
      const shots = [...withVisuals.querySelectorAll(".cm-submenu__visual > *")];
      let z = 0;
      gsap.set(shots, { zIndex: 0, clipPath: "inset(100%)" });
      links.forEach((a, i) => a.addEventListener("mouseenter", () => {
        const s = shots[i];
        if (!s) return;
        z++;
        gsap.set(s, { zIndex: z });
        gsap.fromTo(s, { clipPath: "inset(100%)" }, { clipPath: "inset(0%)", duration: reduce ? 0 : 0.84, ease: "power4.out" });
      }));
    }
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Photo parallax — the photo in the cell is scaled to 1.15× and, while the cell passes through the screen, moves from −20% to 20% of its own height (first screen 0 → 50%)
    document.querySelectorAll(".cm-prllx").forEach((box) => {
      const pic = box.querySelector(":scope > .cm-cover");
      if (!pic) return;
      const { prllxFrom = -20, prllxTo = 20, prllxStart = "top bottom", prllxEnd = "bottom top" } = box.dataset;
      gsap.timeline({ defaults: { ease: "none", duration: 1 }, scrollTrigger: { trigger: pic, start: prllxStart, end: prllxEnd, scrub: true, invalidateOnRefresh: true } })
        .fromTo(pic, { yPercent: +prllxFrom }, { yPercent: +prllxTo });
    });
    // Footer — while the panel’s top edge rises from the screen bottom to 25% of the screen, it comes down from −40% above and sharpens
    const wrap = document.querySelector(".cm-footer__wrap");
    if (wrap)
      gsap.timeline({ defaults: { ease: "power1.out", duration: 1 }, scrollTrigger: { trigger: wrap, start: "top bottom", end: "top 25%", scrub: true, invalidateOnRefresh: true } })
        .fromTo(wrap, { yPercent: -40, opacity: 0 }, { yPercent: 0, opacity: 1 });
  });

  // Footer cube — a rounded-corner concrete block with a symbol carved in, slowly turning toward the cursor from anywhere in the window (the original is a Spline scene, events-target=global)
  const cube = document.querySelector(".cm-cube__canvas");
  if (cube && window.THREE?.WebGLRenderer) {
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ canvas: cube, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 8.6);

    const tex = (draw, repeat = 1) => {
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      draw(c.getContext("2d"));
      const t = new T.CanvasTexture(c);
      t.colorSpace = T.SRGBColorSpace;
      t.wrapS = t.wrapT = T.RepeatWrapping;
      t.repeat.set(repeat, repeat);
      return t;
    };
    const base = css("--kf-surface") || css("--kf-bg");
    const deep = css("--kf-ink-soft");
    const light = css("--kf-surface");
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const speckle = (g, a) => {
      for (let i = 0; i < 2600; i++) {
        g.globalAlpha = rnd() * a;
        g.fillStyle = rnd() > 0.5 ? deep : light;
        const r = rnd() * 2.2 + 0.4;
        g.beginPath(); g.arc(rnd() * 512, rnd() * 512, r, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
    };
    // Engraved symbol — don’t use the original symbol, put our own (an open square ring) in the middle of the narrow side
    const glyph = (g, stroke, w) => {
      g.strokeStyle = stroke; g.lineWidth = w; g.lineCap = "round";
      g.beginPath(); g.moveTo(380, 130); g.lineTo(380, 120); g.arcTo(380, 70, 330, 70, 50); g.lineTo(182, 70); g.arcTo(132, 70, 132, 120, 50);
      g.lineTo(132, 392); g.arcTo(132, 442, 182, 442, 50); g.lineTo(330, 442); g.arcTo(380, 442, 380, 392, 50); g.lineTo(380, 382); g.stroke();
    };
    // The extruded face’s uv is in shape coordinates (−1~1), so tile one plate several times to fit the dot pattern size
    const skin = tex((g) => { g.fillStyle = base; g.fillRect(0, 0, 512, 512); speckle(g, 0.35); }, 0.5);
    const grain = tex((g) => { g.fillStyle = light; g.fillRect(0, 0, 512, 512); speckle(g, 0.5); }, 0.5);
    grain.colorSpace = T.NoColorSpace;
    const mark = tex((g) => { g.clearRect(0, 0, 512, 512); g.globalAlpha = 0.6; glyph(g, deep, 46); });
    const markBump = tex((g) => { g.fillStyle = light; g.fillRect(0, 0, 512, 512); glyph(g, css("--kf-ink"), 40); });
    markBump.colorSpace = T.NoColorSpace;

    const sx = 0.78, sy = 0.82, r = 0.26;
    const shape = new T.Shape();
    shape.moveTo(-sx + r, -sy); shape.lineTo(sx - r, -sy); shape.quadraticCurveTo(sx, -sy, sx, -sy + r); shape.lineTo(sx, sy - r); shape.quadraticCurveTo(sx, sy, sx - r, sy);
    shape.lineTo(-sx + r, sy); shape.quadraticCurveTo(-sx, sy, -sx, sy - r); shape.lineTo(-sx, -sy + r); shape.quadraticCurveTo(-sx, -sy, -sx + r, -sy);
    // The original block isn’t a cube but a block wide front to back with thickness about .55 of the width — the symbol is engraved on one narrow side
    const geo = new T.ExtrudeGeometry(shape, { depth: 0.62, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.18, bevelSegments: 6, curveSegments: 10 });
    geo.center();
    const stone = new T.MeshStandardMaterial({ map: skin, bumpMap: grain, bumpScale: 0.8, roughness: 0.93, metalness: 0 });
    const box = new T.Group();
    box.add(new T.Mesh(geo, stone));
    const decal = new T.Mesh(
      new T.PlaneGeometry(0.62, 1.2),
      new T.MeshStandardMaterial({ map: mark, bumpMap: markBump, bumpScale: 2, transparent: true, alphaTest: 0.05, roughness: 0.93, metalness: 0 }),
    );
    mark.repeat.set(1, 1);
    decal.position.set(sx + 0.18 + 0.003, 0, 0);
    decal.rotation.y = Math.PI / 2;
    box.add(decal);
    const rest = { x: -0.14, y: 0.6 };
    box.rotation.set(rest.x, rest.y, 0.05);
    scene.add(box);
    scene.add(new T.AmbientLight(0xffffff, 0.55)); // Not skin: white light used only for intensity (color comes from the blob material skin)
    const key = new T.DirectionalLight(0xffffff, 2.2); // Not skin: upper right front daylight
    key.position.set(2.5, 3.5, 4);
    scene.add(key);
    const rim = new T.DirectionalLight(0xffffff, 1.4); // Not skin: back-left rim light (the original’s white bloom)
    rim.position.set(-3, 1.5, -3);
    scene.add(rim);

    const size = () => {
      const w = cube.clientWidth, h = cube.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    size();
    new ResizeObserver(size).observe(cube);
    renderer.compile(scene, camera);

    // Measuring the original with a real mouse, the blob spins on the Y axis at about .8rad per second (45°) even when still, and the cursor (−1~1 relative to the window center) adds a head turn of ±.5rad (horizontal) and ±.35rad (vertical) on top.
    // The added share follows by .06 per frame (60fps)
    const aim = { x: 0, y: 0 }, tilt = { x: 0, y: 0 };
    let spin = 0;
    let near = false, last = 0;
    addEventListener("pointermove", (e) => { aim.x = (e.clientX / innerWidth) * 2 - 1; aim.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    new IntersectionObserver(([en]) => (near = en.isIntersecting), { rootMargin: "200px" }).observe(cube);
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (!near) { last = now; return; }
      const dt = Math.max(1, now - (last || now));
      last = now;
      const k = reduce ? 1 : 1 - Math.pow(1 - 0.06, dt / 16.67);
      if (!reduce) spin += 0.8 * (dt / 1000);
      tilt.y += (aim.x * 0.5 - tilt.y) * k;
      tilt.x += (aim.y * 0.35 - tilt.x) * k;
      box.rotation.y = rest.y + spin + tilt.y;
      box.rotation.x = rest.x + tilt.x;
      renderer.render(scene, camera);
    };
    requestAnimationFrame(frame);
  }
})();
