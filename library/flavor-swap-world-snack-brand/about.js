// Story page scenes. Positions and values are carried over from the original IX3 timeline (hero scrub 1.4 · other story scrub .8) and the matter.js settings.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const bk = (p = 1.7, c = "inOut") => `back.${c}(${p})`;
  const split = (el, type) => (type === "chars" ? HS.split(el, "chars").chars : HS.split(el, "lines").lines);

  $(".hs-marquee__wrap").innerHTML = Array.from({ length: 4 }, () =>
    `<div class="hs-marquee__track">${["Your benefit one here", "Benefit Two", "Third long benefit text", "Benefit Four", "Five Benefits", "Your benefit six here"].map((w) => `<span>${w}</span><i></i>`).join("")}</div>`).join("");

  const mm = gsap.matchMedia();
  mm.add({ desk: "(min-width: 992px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { desk, motion } = ctx.conditions;
    if (!motion) return;

    // On first open (original data-ix-reveal): four titles rise from 200% below tilted 20°, and four photos fly in from 120% of the screen below — 1s · after .5s · stagger .2 · back.inOut(2.2).
    // The photo’s y is used by the scroll scene, so the entrance is applied separately via yPercent
    const heads = $$(".hs-sh__h");
    const chars = heads.map((h) => split(h, "chars"));
    gsap.from(heads, { yPercent: 200, rotation: 20, duration: 1, ease: bk(2.2), stagger: { amount: 0.2 }, delay: 0.5 });
    gsap.from(".hs-photo", { yPercent: (i, el) => ((innerHeight * 1.2) / el.offsetHeight) * 100, duration: 1, ease: bk(2.2), stagger: { amount: 0.2 }, delay: 0.5 });

    const story = [...split($(".hs-sh__title h2"), "chars"), ...split($(".hs-sh__title p"), "lines")];
    const lines = $$(".hs-bubble__box p").map((p) => split(p, "lines"));
    gsap.set(lines.slice(1).flat(), { yPercent: 101 });
    const v = desk ? 1 : 1.1; // On phone the photos are bigger, so the gathering distance is stretched to match --dx·--dy in about.css
    const P = {
      kimchi: $(".hs-photo.is-kimchi"), chicken: $(".hs-photo.is-chicken"),
      buffalo: $(".hs-photo.is-buffalo"), lemon: $(".hs-photo.is-lemon"),
    };
    const vw = (n) => `${n * v}vw`;

    const tl = gsap.timeline({ scrollTrigger: { trigger: ".hs-sh", start: "clamp(top bottom)", end: "bottom top", scrub: 1.4 } });
    // The four scattered pieces gather to the center as the tilt unwinds, and the title lifts away letter by letter
    tl.to(P.chicken, { x: vw(-33), y: vw(11), rotation: 0, duration: 0.16, ease: bk(1.7, "in") }, 0)
      .to(P.buffalo, { x: vw(37.5), y: vw(13), rotation: 0, duration: 0.16, ease: bk(1.7, "in") }, 0)
      .to(P.lemon, { x: vw(34.5), y: vw(-13), rotation: 0, duration: 0.16, ease: bk(1.7, "in") }, 0)
      .to(P.kimchi, { rotation: 0, duration: 0.16, ease: bk(1.7, "in") }, 0)
      .to(chars.flat(), { yPercent: -101, duration: 0.16, ease: bk(1.7, "in"), stagger: { amount: 0.05 } }, 0)
      .set(heads, { opacity: 0 }, 0.22)
      .to(".hs-photo", { scale: 1.2, duration: 0.1, ease: bk(1.7, "out") }, 0.16)
      .from(story, { yPercent: 101, duration: 0.1, ease: bk(), stagger: { amount: 0.07 } }, 0.16)
      .from([".hs-bubble__box", ".hs-bubble__t1", ".hs-bubble__t2"], { scale: 0, duration: 0.1, ease: bk(), stagger: { amount: 0.05 } }, 0.16);
    // Cards fly off one at a time at 45 degrees and return to the top, and the speech bubble text switches to the next person
    const shuffle = (el, out, home, at, i) => {
      tl.to(el, { x: vw(out[0]), y: vw(out[1]), rotation: 45, duration: 0.06, ease: bk(1, "in") }, at)
        .set(el, { zIndex: 6 + i }, at + 0.06)
        .to(el, { x: vw(home[0]), y: vw(home[1]), rotation: 0, duration: 0.06, ease: bk(1, "out") }, at + 0.06)
        .to(lines[i], { yPercent: -101, duration: 0.12, ease: "none" }, at)
        .to(lines[i + 1], { yPercent: 0, duration: 0.12, ease: "none" }, at);
    };
    shuffle(P.kimchi, [30, -10], [0, 0], 0.33, 0);
    shuffle(P.chicken, [-45, -14], [-33, 11], 0.5, 1);
    shuffle(P.buffalo, [64, 25], [37.5, 13], 0.68, 2);
    tl.set({}, {}, 0.81);

    // As the rest of the story slides over it, the hero shrinks to .9 and darkens
    gsap.timeline({ scrollTrigger: { trigger: ".hs-story", start: "top bottom", end: "bottom top", scrub: 0.8 } })
      .to([".hs-sh__wrap", ".hs-sh__story"], { scale: 0.9, ease: "none" }, 0)
      .to(".hs-dark", { opacity: 0.5, ease: "none" }, 0);

    const st = gsap.timeline({ scrollTrigger: { trigger: ".hs-story", start: "top 40%", end: "bottom bottom", scrub: 0.8 } })
      .from(split($(".hs-story__t"), "lines"), { yPercent: 101, duration: 0.21, ease: bk(), stagger: { amount: 0.05 } }, 0)
      .to(".hs-story__track", { x: desk ? "-100vw" : "-200vw", duration: 0.56, ease: "power3.out" }, 0.4)
      .from(split($(".hs-story__t2"), "chars"), { yPercent: 101, duration: 0.21, ease: bk(), stagger: { amount: 0.05 } }, 0.6)
      .set({}, {}, 1.04);
    return () => st.kill();
  });

  // ---------- Value shape pile: matter.js — gravity .45 · restitution .45 · friction .06 · air .03 · mouse push radius 50% strength .15 · drag stiffness .04 ----------
  const wrap = $(".hs-story__phys");
  const canvas = $(".hs-phys");
  const CFG = {
    gravity: 0.45, restitution: 0.45, friction: 0.06, frictionAir: 0.03, repelRadius: 0.5, repelForce: 0.15,
    dragStiffness: 0.04, dragAngular: 0.1, lw: 0.42, lh: 0.2, lf: 0.21, decorCount: 20, decorBase: 0.15, decorRange: [0.45, 1.5], decorSpawnY: 0.55,
    decorColors: ["--site-deep", "--site-orange", "--site-scarlet", "--site-shell", "--kf-bg"],
    labels: [
      ["Value One\nTwo Lines", "--site-orange", "--site-shell"], ["Value Two\nTwo Lines", "--site-scarlet", "--site-shell"], ["Value Three\nTwo Lines", "--site-shell", "--kf-ink"],
      ["Value Four\nTwo Lines", "--site-deep", "--site-shell"], ["Value Five\n& Two Lines", "--kf-ink", "--site-shell"],
    ],
    pos: [[0.25, 0.05], [0.73, 0.04], [0.2, 0.27], [0.71, 0.24], [0.44, 0.5]],
  };
  if (HS.reduced || innerWidth <= 991 || !window.Matter) return;

  const io = new IntersectionObserver((es) => {
    if (!es[0].isIntersecting) return;
    io.disconnect();
    start();
  }, { rootMargin: "200px" });
  io.observe(wrap);

  function start() {
    const { Engine, Render, Runner, Bodies, Body, World, Mouse, MouseConstraint, Events } = Matter;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    if (!W || !H) return setTimeout(start, 100);
    canvas.width = W;
    canvas.height = H;
    const engine = Engine.create({ gravity: { x: 0, y: CFG.gravity } });
    const render = Render.create({ canvas, engine, options: { width: W, height: H, wireframes: false, background: "transparent" } });
    const font = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display");
    const LW = W * CFG.lw, LH = H * CFG.lh, FS = Math.round(LH * CFG.lf);
    const base = { restitution: CFG.restitution, friction: CFG.friction, frictionAir: CFG.frictionAir };
    const labels = CFG.labels.map(([text, color, tc], i) => {
      const b = Bodies.rectangle(CFG.pos[i][0] * W, CFG.pos[i][1] * H, LW, LH, { ...base, chamfer: { radius: LH / 2 }, render: { fillStyle: HS.color(color) } });
      b._label = { text, tc: HS.color(tc) };
      return b;
    });
    // Original ellipse: the vertices of a 24-gon via fromVertices — convex, so it becomes one body without poly-decomp
    const oval = (x, y, rx, ry, o) => Bodies.fromVertices(x, y, [Array.from({ length: 24 }, (_, i) => ({ x: Math.cos((i / 24) * Math.PI * 2) * rx, y: Math.sin((i / 24) * Math.PI * 2) * ry }))], o, true);
    const SW = W * CFG.decorBase;
    const decorFill = CFG.decorColors.map(HS.color);
    const decor = Array.from({ length: CFG.decorCount }, (_, i) => {
      const size = SW * (CFG.decorRange[0] + Math.random() * (CFG.decorRange[1] - CFG.decorRange[0]));
      const x = size / 2 + Math.random() * (W - size), y = Math.random() * H * CFG.decorSpawnY;
      const o = { ...base, restitution: CFG.restitution + 0.1, render: { fillStyle: decorFill[i % decorFill.length] } };
      const r = Math.random();
      if (r < 0.25) return Bodies.circle(x, y, size / 2, o);
      if (r < 0.5) return Bodies.rectangle(x, y, size, size, { ...o, chamfer: { radius: 6 } });
      if (r < 0.75) return Bodies.rectangle(x, y, size * 1.7, size * 0.6, { ...o, chamfer: { radius: size * 0.3 } });
      return oval(x, y, size * 0.85, size * 0.48, o);
    });
    const wall = { isStatic: true, render: { visible: false } };
    World.add(engine.world, [...labels, ...decor,
      Bodies.rectangle(W / 2, H + 30, W + 100, 60, wall), Bodies.rectangle(-30, H / 2, 60, H + 100, wall), Bodies.rectangle(W + 30, H / 2, 60, H + 100, wall)]);
    const mouse = Mouse.create(canvas);
    // Lenis has to catch the wheel, so remove matter’s wheel hijacking
    mouse.element.removeEventListener("wheel", mouse.mousewheel);
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    const drag = MouseConstraint.create(engine, { mouse, constraint: { stiffness: CFG.dragStiffness, angularStiffness: CFG.dragAngular, render: { visible: false } } });
    World.add(engine.world, drag);
    let mx = -999, my = -999;
    canvas.addEventListener("mousemove", (e) => { const r = canvas.getBoundingClientRect(); mx = (e.clientX - r.left) * (W / r.width); my = (e.clientY - r.top) * (H / r.height); });
    canvas.addEventListener("mouseleave", () => { mx = my = -999; });
    const RR = W * CFG.repelRadius;
    Events.on(engine, "beforeUpdate", () => {
      if (mx < 0) return;
      [...labels, ...decor].forEach((b) => {
        if (b === drag.body) return;
        const dx = b.position.x - mx, dy = b.position.y - my, d = Math.hypot(dx, dy);
        if (d > 1 && d < RR) { const f = ((RR - d) / RR) * CFG.repelForce; Body.applyForce(b, b.position, { x: (dx / d) * f, y: (dy / d) * f }); }
      });
    });
    Events.on(render, "afterRender", () => {
      const c = render.context;
      labels.forEach((b) => {
        c.save();
        c.translate(b.position.x, b.position.y);
        c.rotate(b.angle);
        c.fillStyle = b._label.tc;
        c.font = `bold ${FS}px ${font}`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        const ls = b._label.text.split("\n");
        ls.forEach((l, i) => c.fillText(l, 0, (i - (ls.length - 1) / 2) * FS * 1.3));
        c.restore();
      });
    });
    Render.run(render);
    Runner.run(Runner.create(), engine);
  }
})();
