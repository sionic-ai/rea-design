(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, MorphSVGPlugin, MotionPathPlugin, DrawSVGPlugin, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const site = (window.site = { reduce, fine, ready: null });

  // Resolve CSS variables (including oklch and color-mix) to RGB on the spot so they follow Skin changes
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  site.rgb = (name) => {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = v || "transparent";
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  // ── Smooth scroll: original Lenis 1.3.23 — duration 1.4, expo.out, wheel ×1.6
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ duration: 1.4, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), smoothWheel: true, syncTouch: false, wheelMultiplier: 1.6 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  site.lenis = lenis;
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const el = id.length > 1 && document.querySelector(id);
    if (!el && id !== "#top") return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el || 0, { offset: 0 });
    else (el || document.body).scrollIntoView();
  }));

  // ── Button: four color bands sweep diagonally with .04 delays at 1.5s expo.inOut, and letters pop while getting bolder by .02 each. 1.25x faster on enter and leave
  function setupButton(btn) {
    const label = btn.querySelector(".btn_label");
    const split = label ? new SplitText(label, { type: "chars", charsClass: "btn_char" }) : { chars: [] };
    // Lock letter width to the initial width so lines don’t wobble when the weight changes (same treatment as the original)
    const widths = split.chars.map((c) => c.getBoundingClientRect().width);
    split.chars.forEach((c, i) => { c.style.width = widths[i] + "px"; c.style.textAlign = "center"; });
    const layers = [...btn.querySelectorAll(".btn_bgs")].map((g) => [...g.children]);
    const ico = btn.querySelector(".btn_ico, .pricing_cta-ico");
    const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.inOut", duration: 1 }, onUpdate: link });
    layers.forEach((ls) => ls.slice(1).forEach((el, i) => tl.to(el, { "--progress": 1, duration: 1.5 }, i * 0.04)));
    if (split.chars.length) tl.to(split.chars, { "--progress": 1, stagger: 0.02 }, 0.2);
    split.chars.forEach((c, i) => {
      tl.to(c, { "--enter": 1, duration: 0.6, ease: "circ.in" }, i * 0.02 + 0.2);
      tl.to(c, { "--leave": 1, duration: 0.4, ease: "circ.in" }, i * 0.02 + 0.6);
    });
    if (ico) {
      // Arrows: the bright arrow exits to the upper right and the dark arrow enters from the lower left (the original swaps the paths)
      const dark = ico.cloneNode(true);
      dark.classList.add("is-dark");
      ico.after(dark);
      const lp = ico.querySelector("path"), dp = dark.querySelector("path"), d = lp.getAttribute("d");
      gsap.set(dp, { attr: { d: "M2 9 2 9M2 9H2v0" } });
      tl.to(lp, { morphSVG: "M9 2 9 2M9 2H9v0", duration: 1 }, 0.2).to(dp, { morphSVG: d, duration: 1 }, 0.2);
    }
    function link() {
      layers.forEach((ls) => ls.forEach((el, n) => el.style.setProperty("--next", ls[n + 1] ? ls[n + 1].style.getPropertyValue("--progress") || 0 : 0)));
    }
    if (reduce || !fine) return;
    btn.addEventListener("mouseenter", () => {
      split.chars.forEach((c) => c.style.setProperty("--deg", gsap.utils.random(-8, 8, 2) + "deg"));
      tl.timeScale(1.25).play();
    });
    btn.addEventListener("mouseleave", () => tl.timeScale(1.25).reverse());
  }

  // ── Menu letter weight: if the distance between cursor and letter center is within link width ×.9, it goes toward 900, .3s power2.out
  function setupWeight(link) {
    if (reduce || !fine) return;
    const base = 500;
    const split = new SplitText(link, { type: "chars", charsClass: "wh-char" });
    const widths = split.chars.map((c) => c.getBoundingClientRect().width);
    const chars = split.chars.map((c, i) => {
      c.style.width = widths[i] + "px";
      const s = { w: base };
      return { el: c, to: gsap.quickTo(s, "w", { duration: 0.3, ease: "power2.out", onUpdate: () => (c.style.fontVariationSettings = `"wght" ${s.w}`) }) };
    });
    const move = (e) => {
      const r = link.offsetWidth * 0.9;
      for (const ch of chars) {
        const b = ch.el.getBoundingClientRect();
        const d = Math.hypot(e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2);
        ch.to(base + (900 - base) * Math.max(0, 1 - d / r));
      }
    };
    link.addEventListener("mouseenter", move);
    link.addEventListener("mousemove", move);
    link.addEventListener("mouseleave", () => chars.forEach((c) => c.to(base)));
  }

  // ── Menu: a little scrolling gives a 910-wide pill, over dark sections the text color flips, and 10% above the closing line it expands into a white panel
  function setupNav() {
    const body = document.querySelector("[data-nav]");
    if (!body) return;
    const bar = body.querySelector(".nav_bar"), panel = body.querySelector(".nav_panel"), legal = document.querySelector(".nav_legal");
    const reveals = body.querySelectorAll(".nav_reveal"), linesY = body.querySelectorAll(".nav_line-y"), linesX = body.querySelectorAll(".nav_line-x"), dots = body.querySelectorAll(".nav_dot");
    ScrollTrigger.create({ start: 50, end: "max", onToggle: (s) => body.classList.toggle("is-compact", s.isActive) });
    document.querySelectorAll("[data-nav-dark]").forEach((sec) => ScrollTrigger.create({
      trigger: sec, start: "top 40px", end: "bottom 40px", onToggle: (s) => body.classList.toggle("is-dark", s.isActive),
    }));
    const opener = document.querySelector(".outro_line");
    if (!opener) return;
    let tl = null, open = false;
    const openNav = () => {
      if (open) return;
      open = true;
      tl?.kill();
      const w = Math.min(window.innerWidth - 2 * parseFloat(getComputedStyle(document.querySelector(".nav")).left), parseFloat(getComputedStyle(legal).width));
      gsap.set(panel, { height: "auto" });
      const ph = panel.offsetHeight;
      gsap.set(panel, { height: 0 });
      const from = { width: body.offsetWidth, height: body.offsetHeight };
      body.classList.add("is-open", "is-active");
      panel.setAttribute("aria-hidden", "false");
      const shift = Math.max(0, (window.innerHeight - ph - legal.offsetHeight) / 2 - body.getBoundingClientRect().top);
      const legalShift = shift + 1;
      tl = gsap.timeline();
      if (reduce) { gsap.set(body, { width: w, height: ph, y: shift }); gsap.set(panel, { height: ph }); gsap.set(bar, { autoAlpha: 0, height: 0 }); gsap.set(legal, { autoAlpha: 1, y: legalShift }); return; }
      gsap.set(reveals, { autoAlpha: 0, yPercent: 40 });
      gsap.set(linesY, { scaleY: 0 }); gsap.set(linesX, { scaleX: 0 }); gsap.set(dots, { scale: 0, autoAlpha: 0 });
      tl.to(bar, { autoAlpha: 0, duration: 0.2, ease: "power2.out" }, 0)
        .fromTo(body, from, { width: w, height: ph, y: shift, duration: 0.9, ease: "power3.inOut" }, 0)
        .to(bar, { height: 0, duration: 0.9, ease: "power3.inOut" }, 0)
        .to(panel, { height: ph, duration: 0.9, ease: "power3.inOut" }, 0)
        .to(reveals, { autoAlpha: 1, yPercent: 0, duration: 0.7, ease: "expo.out", stagger: 0.04 }, 0.6)
        .to(linesY, { scaleY: 1, autoAlpha: 1, duration: 0.8, ease: "power3.inOut" }, 0.4)
        .to(linesX, { scaleX: 1, autoAlpha: 1, duration: 0.6, ease: "power3.inOut", stagger: 0.15 }, 0.5)
        .to(dots, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(3)", stagger: (i) => Math.floor(i / 2) * 0.15 }, 0.8)
        .fromTo(legal, { autoAlpha: 0, y: legalShift + 24 }, { autoAlpha: 1, y: legalShift, duration: 0.6, ease: "expo.out" }, 0.7);
    };
    const closeNav = () => {
      if (!open) return;
      open = false;
      tl?.kill();
      body.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      tl = gsap.timeline({ onComplete: () => { body.classList.remove("is-active"); gsap.set([body, bar, panel], { clearProps: "width,height,y,opacity,visibility" }); } });
      tl.to(legal, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0)
        .to(reveals, { autoAlpha: 0, yPercent: 10, duration: 0.25, ease: "power2.in", stagger: { each: 0.01, from: "end" } }, 0)
        .to(body, { width: () => Math.min(body.parentElement.offsetWidth, parseFloat(getComputedStyle(legal).width)), height: 57, y: 0, duration: 0.6, ease: "power3.inOut" }, 0.1)
        .to(panel, { height: 0, duration: 0.6, ease: "power3.inOut" }, 0.1)
        .to(bar, { height: 57, autoAlpha: 1, duration: 0.6, ease: "power3.inOut" }, 0.1);
    };
    ScrollTrigger.create({ trigger: opener, start: "top 10%", onEnter: openNav, onLeaveBack: closeNav });
  }

  // ── Cookie notice: pressing OK slides it down and out in .4s
  function setupCookies() {
    const c = document.querySelector(".cookies");
    if (!c) return;
    c.querySelector(".cookies_ok")?.addEventListener("click", () => gsap.to(c, { autoAlpha: 0, y: 20, duration: reduce ? 0 : 0.4, ease: "power2.in", onComplete: () => c.remove() }));
  }

  // ── Loader: four corner dots gather into the center box in 1.1s power3.inOut (.04 stagger), the vertical line draws in .55s and the horizontal in .65s, with a 000→100 count (1.9s power2.inOut)
  function runLoader() {
    const ld = document.querySelector(".loader");
    if (!ld) { root.classList.remove("is-loading"); return Promise.resolve(); }
    const box = ld.querySelector(".loader_box"), frame = ld.querySelector(".loader_frame"), sheet = ld.querySelector(".loader_sheet");
    const dots = [...ld.querySelectorAll(".loader_dot")], lx = ld.querySelectorAll(".loader_line-x"), ly = ld.querySelectorAll(".loader_line-y");
    const counter = ld.querySelector(".loader_counter"), count = ld.querySelector(".loader_count"), mark = ld.querySelector(".loader_mark");
    const halves = ld.querySelectorAll(".loader_half");
    const u = parseFloat(getComputedStyle(box).width) / (window.innerWidth < 480 ? 150 : 290);
    const n = box.offsetWidth;
    const mw = n * 0.5;
    Object.assign(mark.style, { left: (window.innerWidth - mw) / 2 + "px", top: (window.innerHeight - mw * 0.83) / 2 + "px", width: mw + "px", height: mw * 0.83 + "px" });
    const done = () => { root.classList.remove("is-loading"); ld.remove(); };
    if (reduce) { root.classList.remove("is-loading"); return gsap.to(ld, { autoAlpha: 0, duration: 0.3 }).then(done); }
    const t = 40 * u, W = window.innerWidth, H = window.innerHeight;
    const corners = [[t, t], [W - t, t], [W - t, H - t], [t, H - t]];
    dots.forEach((d, i) => { const r = d.getBoundingClientRect(); gsap.set(d, { x: corners[i][0] - (r.left + r.width / 2), y: corners[i][1] - (r.top + r.height / 2) }); });
    gsap.set(lx, { scaleX: 0 }); gsap.set(ly, { scaleY: 0 }); gsap.set(counter, { autoAlpha: 0 });
    gsap.set(halves, { drawSVG: "0%" });
    gsap.set(mark, { autoAlpha: 1 });
    const prog = { v: 0 };
    const ease = "power3.inOut";
    const tl = gsap.timeline();
    tl.to(dots, { x: 0, y: 0, duration: 1.1, ease, stagger: 0.04 }, 0.1)
      .to(ly, { scaleY: 1, duration: 1, ease }, 0.55)
      .to(lx, { scaleX: 1, duration: 1, ease }, 0.65)
      .to(frame, { opacity: 1, duration: 0.4, ease: "power2.out" }, 1.2)
      .to(counter, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0.3)
      .to(prog, { v: 100, duration: 1.9, ease: "power2.inOut", onUpdate: () => (count.textContent = String(Math.round(prog.v)).padStart(3, "0")) }, 0.3)
      .to(halves, { drawSVG: "100%", duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0.9);
    return tl.then(() => {
      root.classList.remove("is-loading");
      const hero = document.querySelector(".hero_bottom") || document.body;
      const hr = hero.getBoundingClientRect();
      const out = gsap.timeline({ onComplete: done });
      out.to(counter, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0)
        .to(frame, { opacity: 0, duration: 0.5, ease: "power2.out" }, 0.3)
        .to(box, { left: hr.left, top: hr.top, width: hr.width, height: hr.height, duration: 0.8, ease }, 0.3)
        .to(mark, { autoAlpha: 0, scale: 0.4, duration: 0.5, ease }, 0.3)
        .to(sheet, { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0.5)
        .to([lx, ly, dots], { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 1.1);
      site.revealHero?.(out);
      return out;
    });
  }

  // ── Pixel footer: a placeholder graphic (canvas video) of two seated people moving is stamped into grid cells and drawn (OGL)
  function setupFooterGL() {
    const canvas = document.querySelector("canvas[data-gl]"), foot = document.querySelector("[data-footer]"), src = document.querySelector(".footer_src");
    if (!canvas || !foot || !src || !window.OGL) return;
    const { Renderer, Program, Mesh, Triangle, Texture } = OGL;
    const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true, premultipliedAlpha: true });
    const gl = renderer.gl;
    const tex = new Texture(gl, { image: src, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
    const program = new Program(gl, {
      transparent: true,
      vertex: `attribute vec2 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0., 1.); }`,
      fragment: `precision highp float;
        uniform sampler2D tMap; uniform vec2 uRes; uniform float uCell; uniform float uReveal; uniform float uTop; uniform float uTime; uniform float uDpr;
        uniform vec3 uBg; uniform vec3 uBg2; uniform vec3 uFig; uniform vec3 uSkin; uniform vec3 uPage; uniform vec2 uMouse; uniform float uHeat;
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main(){
          vec2 px = vec2(vUv.x, 1. - vUv.y) * uRes;
          float cs = uCell * uDpr;
          vec2 cell = floor(px / cs);
          vec2 inC = fract(px / cs);
          vec2 cc = (cell + .5) * cs;
          float yDoc = cc.y - uTop * uDpr;
          if (yDoc < -uRes.y * 1.2) discard;
          float rnd = hash(cell);
          float grad = clamp(1. - yDoc / (uRes.y * 1.1), 0., 1.);
          float on = step(mix(grad, rnd, .55), uReveal * 1.25 - .1);
          if (on < .5) discard;
          vec2 suv = vec2((cc.x / uRes.x - .5) * (uRes.x / uRes.y) / (16. / 9.) + .5, clamp(yDoc / uRes.y, 0., 1.));
          vec4 s = texture2D(tMap, vec2(suv.x, 1. - suv.y));
          float inside = step(0., suv.x) * step(suv.x, 1.) * step(0., yDoc) * step(yDoc, uRes.y);
          float d = distance(cc / uDpr, uMouse);
          float heat = uHeat * smoothstep(120., 0., d);
          vec3 col; float a = 1.;
          float chk = mod(cell.x + cell.y, 2.);
          float flick = step(.82, hash(cell + floor(uTime * 2.)));
          col = mix(uBg, uBg2, clamp(chk * .5 + flick * .5 + heat, 0., 1.));
          float sq = step(.07, inC.x) * step(inC.x, .93) * step(.07, inC.y) * step(inC.y, .93);
          if (inside > .5 && s.a > .5) {
            float cross = (step(.38, inC.x) * step(inC.x, .62) + step(.38, inC.y) * step(inC.y, .62)) > 0. ? 1. : 0.;
            vec3 figc = s.r > .5 ? uSkin : uFig;
            col = mix(uPage, figc, max(cross, s.r > .5 ? 1. : 0.));
          } else {
            col = mix(uPage, col, sq);
          }
          gl_FragColor = vec4(col * a, a);
        }`,
      uniforms: {
        tMap: { value: tex }, uRes: { value: [1, 1] }, uCell: { value: 12 }, uReveal: { value: 0 }, uTop: { value: 0 }, uTime: { value: 0 }, uDpr: { value: 1 },
        uBg: { value: [0, 0, 0] }, uBg2: { value: [0, 0, 0] }, uFig: { value: [0, 0, 0] }, uSkin: { value: [0, 0, 0] }, uPage: { value: [0, 0, 0] }, uMouse: { value: [-999, -999] }, uHeat: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const paint = () => {
      const U = program.uniforms;
      U.uBg.value = site.rgb("--site-sky");
      U.uBg2.value = site.rgb("--site-steel");
      U.uFig.value = site.rgb("--site-sage");
      U.uSkin.value = site.rgb("--site-apricot");
      U.uPage.value = site.rgb("--kf-bg");
    };
    paint();
    const size = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
      program.uniforms.uDpr.value = renderer.dpr;
      program.uniforms.uCell.value = Math.max(8, window.innerWidth / 1920 * 16);
    };
    size();
    window.addEventListener("resize", size);
    const ctx = src.getContext("2d");
    // Placeholder video: side view of two people seated on chairs (body, chair=Ink, face · hand=red cell) slowly breathes and turns its head
    const draw = (t) => {
      const W = src.width, H = src.height;
      ctx.clearRect(0, 0, W, H);
      const person = (x, flip, ph) => {
        ctx.save(); ctx.translate(x, 0); ctx.scale(flip, 1);
        const b = Math.sin(t * 1.3 + ph) * 2, nod = Math.sin(t * .7 + ph) * .08;
        ctx.fillStyle = "rgb(0,0,255)"; /* Not skin: body cell marker the shader reads (blue channel) */
        ctx.fillRect(-22, 112, 44, 6); ctx.fillRect(-3, 118, 6, 30); ctx.fillRect(-26, 146, 52, 4);
        ctx.beginPath(); ctx.moveTo(-18, 58 + b); ctx.lineTo(10, 58 + b); ctx.lineTo(14, 112); ctx.lineTo(-16, 112); ctx.fill();
        ctx.fillRect(-16, 104, 50, 12); ctx.fillRect(26, 104, 10, 46);
        ctx.fillStyle = "rgb(255,0,0)"; /* Not skin: face·hand cell marks read by the shader (red channel) */
        ctx.save(); ctx.translate(-2, 46 + b); ctx.rotate(nod); ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill(); ctx.restore();
        ctx.fillRect(24, 96 + b * .5, 10, 8); ctx.fillRect(34, 146, 14, 6);
        ctx.restore();
      };
      person(W * 0.2, 1, 0);
      person(W * 0.8, -1, 2);
      tex.needsUpdate = true;
    };
    let mouse = [-999, -999], heat = 0;
    window.addEventListener("pointermove", (e) => { mouse = [e.clientX, e.clientY]; heat = 1; });
    const st = { reveal: 0 };
    ScrollTrigger.create({ trigger: ".outro", start: "top 80%", endTrigger: foot, end: "top top", scrub: true, onUpdate: (s) => (st.reveal = s.progress) });
    let visible = false;
    ScrollTrigger.create({ trigger: ".outro", start: "top bottom", endTrigger: foot, end: "bottom top", onToggle: (s) => { visible = s.isActive; canvas.style.visibility = visible ? "visible" : "hidden"; } });
    canvas.style.visibility = "hidden";
    gsap.ticker.add((time) => {
      if (!visible) return;
      if (reduce) st.reveal = 1;
      heat *= 0.94;
      draw(reduce ? 0 : time);
      const U = program.uniforms;
      U.uReveal.value = st.reveal;
      U.uTop.value = foot.getBoundingClientRect().top;
      U.uTime.value = time;
      U.uMouse.value = mouse;
      U.uHeat.value = heat * 0.6;
      renderer.render({ scene: mesh });
    });
    site.repaintGL = (site.repaintGL || []).concat(paint);
  }

  site.ready = new Promise((res) => {
    const go = () => {
      document.querySelectorAll("[data-btn]").forEach(setupButton);
      document.querySelectorAll("[data-weight-hover]").forEach(setupWeight);
      setupNav();
      setupCookies();
      setupFooterGL();
      res();
    };
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(go));
  });
  site.loaded = site.ready.then(() => runLoader());
})();
