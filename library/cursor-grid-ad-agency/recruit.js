/* Careers — dot and backslash text video (three r184 shader, 270 lines, five gray levels, gamma and reveal on entry), activity photo drop (matter-js 0.20.0,
   gravity .001 · bounce .4 · friction .1 · air .01), job needle (turns with scroll), diagonal photo strip (embla 8.6.0), apply-list shortcut */
(() => {
  const TB = window.TB;
  if (!TB) return;
  const { unit, isDesk, reduce } = TB;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (s) => { px.clearRect(0, 0, 1, 1); px.fillStyle = s; px.fillRect(0, 0, 1, 1); const d = px.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };

  const ascii = (scope) => {
    const host = scope.querySelector(".rc-ascii");
    const canvas = host?.querySelector(".rc-ascii__gl");
    if (!canvas || !window.THREE) return () => {};
    const T = window.THREE;
    // Placeholder video, a big undulating cloth (a bright band flows slowly)
    const vid = document.createElement("canvas"); vid.width = 320; vid.height = 180;
    const v = vid.getContext("2d");
    const drawVid = (t) => {
      v.fillStyle = "rgb(0,0,0)"; v.fillRect(0, 0, 320, 180); /* Not skin: grayscale placeholder video that the shader reads only for brightness */
      for (let x = 0; x < 320; x += 2) {
        const y = 90 + Math.sin(x / 38 + t * 0.6) * 40 + Math.sin(x / 17 - t * 0.9) * 12;
        const g = v.createLinearGradient(0, y - 60, 0, y + 60);
        g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(230,230,230,0.9)"); g.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: brightness value */
        v.fillStyle = g; v.fillRect(x, y - 60, 2, 120);
      }
    };
    drawVid(0);
    const vtex = new T.CanvasTexture(vid);
    // Glyph plate — three periods and two backslashes (original glyph order)
    const CH = "...\\\\";
    const atlas = document.createElement("canvas"); atlas.width = 64 * CH.length; atlas.height = 64;
    const a = atlas.getContext("2d");
    a.fillStyle = "rgb(255,255,255)"; /* Not skin: text-shaped mask */
    a.font = `48px ${css("--kf-font-mono")}`; a.textAlign = "center"; a.textBaseline = "middle";
    [...CH].forEach((c, i) => a.fillText(c, 32 + i * 64, 34));
    const atex = new T.CanvasTexture(atlas);
    const bg = rgb(css("--kf-contrast-bg")), ink = rgb(css("--kf-contrast-ink"));
    const lv = [0.13, 0.18, 0.47, 0.73, 0.42].map((t) => new T.Vector3(...bg.map((b, k) => b + (ink[k] - b) * t)));
    const uni = { uVid: { value: vtex }, uAtlas: { value: atex }, uRows: { value: isDesk() ? 270 : 125 }, uAspect: { value: 16 / 9 }, uGamma: { value: 3 }, uReveal: { value: 0 }, uCols: { value: lv }, uBg: { value: new T.Vector3(...bg) } };
    const renderer = new T.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new T.Scene(), cam = new T.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 2);
    const mat = new T.ShaderMaterial({
      uniforms: uni,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `
        precision highp float; varying vec2 vUv;
        uniform sampler2D uVid, uAtlas; uniform float uRows, uAspect, uGamma, uReveal; uniform vec3 uCols[5]; uniform vec3 uBg;
        void main(){
          float cols = floor(uRows * uAspect * 1.6);
          vec2 grid = vec2(cols, uRows);
          vec2 cell = floor(vUv * grid), local = fract(vUv * grid);
          vec2 c = (cell + 0.5) / grid;
          float l = dot(texture2D(uVid, c).rgb, vec3(0.299, 0.587, 0.114));
          l = pow(l, uGamma);
          float rev = step(1.0 - c.y, uReveal * 1.2 - fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453) * 0.2);
          float idx = floor(clamp(l, 0.0, 0.999) * 5.0);
          float glyph = texture2D(uAtlas, vec2((idx + local.x) / 5.0, local.y)).r;
          vec3 col = uCols[0];
          for (int i = 0; i < 5; i++) if (float(i) == idx) col = uCols[i];
          gl_FragColor = vec4(mix(uBg, col, glyph * rev), 1.0);
        }`,
    });
    scene.add(new T.Mesh(new T.PlaneGeometry(1, 1), mat));
    const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); uni.uAspect.value = w / Math.max(1, h); };
    size();
    const ro = new ResizeObserver(size); ro.observe(canvas);
    renderer.compile(scene, cam);
    let on = false, played = false; const t0 = performance.now();
    const tick = () => { if (!on) return; drawVid((performance.now() - t0) / 1000); vtex.needsUpdate = true; renderer.render(scene, cam); };
    gsap.ticker.add(tick);
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !played) {
        played = true;
        if (reduce) { uni.uReveal.value = 1; uni.uGamma.value = 1; }
        else { gsap.to(uni.uReveal, { value: 1, duration: 1.6, ease: "easeInOut4", delay: 0.3 }); gsap.to(uni.uGamma, { value: 1, duration: 2.4, ease: "power2.out", delay: 0.3 }); }
      }
    });
    io.observe(host);
    return () => { io.disconnect(); ro.disconnect(); gsap.ticker.remove(tick); mat.dispose(); vtex.dispose(); atex.dispose(); renderer.dispose(); };
  };

  // Activity — photo panels fall from above, catch on a diagonal bar and pile up on the floor
  const physics = (scope) => {
    const host = scope.querySelector(".rc-physics");
    if (!host || !window.Matter || reduce) return () => {};
    const { Engine, Bodies, Composite, Body, Mouse, MouseConstraint } = Matter;
    const canvas = host.querySelector("canvas"), ctx = canvas.getContext("2d");
    const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 } });
    let W = 0, H = 0, bodies = [], statics = [], dpr = Math.min(devicePixelRatio, 2);
    // Stickers — round badge, oval name tag, square label (stand in for the Brand stickers, the drawings are our own shapes)
    const labels = ["BADGE 01", "STUDIO NAME", "BADGE 02", "STICKER", "BADGE 03", "LABEL", "BADGE 04", "TAG"];
    const build = () => {
      Composite.clear(engine.world, false);
      W = host.clientWidth; H = host.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      const t = 60;
      statics = [
        Bodies.rectangle(W / 2, H + t / 2, W * 2, t, { isStatic: true, friction: 0.8 }),
        Bodies.rectangle(-t / 2, H / 2, t, H * 4, { isStatic: true }),
        Bodies.rectangle(W + t / 2, H / 2, t, H * 4, { isStatic: true }),
        Bodies.rectangle(W * 0.5, H * 0.7, 26 * unit(), H * 0.35, { isStatic: true, angle: -(26 * Math.PI) / 180, friction: 0.8 }),
      ];
      Composite.add(engine.world, statics);
    };
    const drop = () => {
      const u = unit(), pw = (isDesk() ? 150 : 100) * u, ph = pw * 0.72;
      bodies = labels.map((l, i) => {
        const x = W * (0.15 + ((i * 0.13) % 0.7)), y = -ph * (1 + i * 0.9), o = { restitution: 0.4, friction: 0.1, frictionAir: 0.01, density: 0.001, angle: (Math.random() - 0.5) * 0.6 };
        const kind = i % 4;
        const b = kind === 0 || kind === 2 ? Bodies.circle(x, y, ph * 0.6, o) : kind === 1 ? Bodies.rectangle(x, y, pw * 1.3, ph * 0.6, { ...o, chamfer: { radius: ph * 0.3 } }) : Bodies.rectangle(x, y, pw * 0.8, ph * 0.8, o);
        b.plugin = { label: l, kind, w: kind === 1 ? pw * 1.3 : pw * 0.8, h: kind === 1 ? ph * 0.6 : ph * 0.8, r: ph * 0.6 };
        return b;
      });
      Composite.add(engine.world, bodies);
    };
    build();
    let mc = null;
    if (TB.hoverMQ.matches) {
      const mouse = Mouse.create(canvas);
      mouse.pixelRatio = 1;
      ["mousewheel", "DOMMouseScroll", "wheel"].forEach((n) => mouse.element.removeEventListener(n, mouse.mousewheel));
      mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
      Composite.add(engine.world, mc);
    }
    const ink = css("--kf-contrast-ink"), bgc = css("--kf-contrast-bg"), acc = css("--kf-accent"), line = css("--site-line-dark") || ink, font = css("--kf-font-sans");
    let on = false, dropped = false, last = 0;
    const tick = (time) => {
      if (!on) return;
      const now = time * 1000, dt = last ? Math.max(1, Math.min(32, now - last)) : 16.7;
      last = now;
      for (let r = dt; r > 0.01; r -= 16.667) Engine.update(engine, Math.min(16.667, r));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const ob = statics[3];
      ctx.fillStyle = line;
      ctx.beginPath(); ob.vertices.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.fill();
      bodies.forEach((b) => {
        ctx.save(); ctx.translate(b.position.x, b.position.y); ctx.rotate(b.angle);
        const { w, h, r, label, kind } = b.plugin;
        ctx.strokeStyle = kind === 1 ? acc : ink; ctx.lineWidth = kind === 1 ? 3 : 1.5; ctx.fillStyle = bgc;
        ctx.beginPath();
        if (kind === 0 || kind === 2) ctx.arc(0, 0, r, 0, Math.PI * 2);
        else if (kind === 1) ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
        else ctx.rect(-w / 2, -h / 2, w, h);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = ink; ctx.font = `${kind === 1 ? 16 : 10}px ${font}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, 0, 0);
        ctx.restore();
      });
    };
    gsap.ticker.add(tick);
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; last = 0; if (on && !dropped) { dropped = true; drop(); } }, { threshold: 0.2 });
    io.observe(host);
    const ro = new ResizeObserver(() => { const keep = bodies; build(); if (dropped) { bodies = keep; Composite.add(engine.world, bodies); } if (mc) Composite.add(engine.world, mc); });
    ro.observe(host);
    return () => { io.disconnect(); ro.disconnect(); gsap.ticker.remove(tick); Engine.clear(engine); };
  };

  const needle = (scope) => {
    const n = scope.querySelector(".rc-jobs__needle");
    if (!n || reduce) return () => {};
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const [a, b] = n.querySelectorAll("i");
      gsap.fromTo(a, { rotate: -26 }, { rotate: 206, ease: "none", scrollTrigger: { trigger: scope.querySelector(".rc-jobs__list"), start: "top 70%", end: "bottom 40%", scrub: true } });
      gsap.fromTo(b, { rotate: 26 }, { rotate: -154, ease: "none", scrollTrigger: { trigger: scope.querySelector(".rc-jobs__list"), start: "top 70%", end: "bottom 40%", scrub: true } });
    });
    return () => mm.revert();
  };

  // Five values — on desktop the section stays pinned while five cells flow horizontally (tied to scroll)
  const values = (scope) => {
    const pin = scope.querySelector(".rc-values__pin"), list = pin?.querySelector(".rc-values__list");
    if (!list) return () => {};
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.to(list, { x: () => -(list.scrollWidth - innerWidth), ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${list.scrollWidth - innerWidth}`, pin: true, scrub: true, invalidateOnRefresh: true } });
    });
    return () => mm.revert();
  };

  const gallery = (scope) => {
    const vp = scope.querySelector(".rc-gallery__viewport");
    if (!vp || !window.EmblaCarousel) return () => {};
    const em = EmblaCarousel(vp, { loop: true, dragFree: true, align: "start", containScroll: false });
    return () => em.destroy();
  };

  const reveals = (scope) => {
    const els = [...scope.querySelectorAll(".rc-big span, .rc-act, .rc-jobs__list li, .rc-open__list a, .rc-talent__icons figure")];
    els.forEach((el, i) => { el.classList.add("tb-in-right"); el.style.setProperty("--index", i % 4); });
    return TB.inview ? TB.inview(els) : () => {};
  };

  TB.pages.recruit = ({ scope }) => {
    const jump = document.querySelector(".rc-jump");
    const go = (e) => { e.preventDefault(); TB.lenis.scrollTo("#rc-jobs", { duration: 1.2 }); };
    jump?.addEventListener("click", go);
    const offs = [ascii(scope), physics(scope), needle(scope), values(scope), gallery(scope), reveals(scope)];
    if (TB.slashLinesInit) offs.push(TB.slashLinesInit(scope));
    return () => { jump?.removeEventListener("click", go); offs.forEach((f) => f && f()); };
  };
})();
