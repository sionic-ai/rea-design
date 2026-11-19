// Hero scene. Positions of the flavor stage · benefit band · review pile are carried over as is from the original Webflow IX3 timeline values — curve numbers follow the IX3 EASING_NAMES order (29 = sine.out).
(() => {
  const { use, mascotStyle, FLAVORS } = HS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pouch = (f) => use("hs-pouch", "", `--p-accent:var(--site-${f.key});--m-body:${f.body};--m-scarf:${f.scarf}`);

  // ---------- 3D bag: the original 120 rotation frames replaced with our own shape — front·back two faces of a pillow-puffed bag, takes a frame number and draws one frame at that angle ----------
  // Values measured on the original section: bag 50% wide and 85% tall on a 1130×1080 panel, thickness seen from the side = 33% of width, rotates 0→180° over 0~100 cards and shifts right by 3% of the panel width
  HS.pouch3d = (canvas) => {
    if (!canvas || !window.THREE) return null;
    const T = window.THREE;
    const W = 1130, H = 1080;
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true }); } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W / 2, H / 2, false);
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(20, W / H, 0.1, 50);
    const ph = 1, pw = 0.617, depth = 0.1;
    cam.position.set(0, 0, ph / 0.85 / (2 * Math.tan((10 * Math.PI) / 180)));
    scene.add(new T.AmbientLight(0xffffff, 1.6));
    const key = new T.DirectionalLight(0xffffff, 1.5);
    key.position.set(-1.2, 1.4, 2.4);
    scene.add(key);

    // Pillow shape: side edges stay flat and tight, the middle bulges, and the top 7% is a pleat band so it stays flat
    const geo = (sign) => {
      const g = new T.PlaneGeometry(pw, ph, 48, 72), a = g.attributes.position;
      for (let i = 0; i < a.count; i++) {
        const nx = a.getX(i) / (pw / 2), ny = a.getY(i) / (ph / 2);
        const top = ny > 0.86 ? Math.max(0, 1 - (ny - 0.86) / 0.06) : 1;
        const bulge = depth * Math.sqrt(Math.max(0, 1 - nx * nx)) * Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, -ny), 6))) * top;
        a.setZ(i, sign * bulge);
        a.setX(i, a.getX(i) * (1 - 0.05 * (bulge / depth)));
      }
      g.computeVertexNormals();
      return g;
    };
    // Face text is redrawn if the heading font arrives late
    const faces = [];
    const face = (draw) => {
      const c = Object.assign(document.createElement("canvas"), { width: 512, height: 830 });
      const t = new T.CanvasTexture(c);
      const paint = () => { draw(c.getContext("2d"), c.width, c.height); t.needsUpdate = true; };
      paint();
      faces.push(paint);
      t.colorSpace = T.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };
    const col = (n) => HS.color(n);
    const font = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display");
    const body = (x, w, h) => {
      x.fillStyle = col("--site-pouch"); x.fillRect(0, 0, w, h);
      x.fillStyle = col("--site-crimp"); x.fillRect(0, 0, w, h * 0.07);
      x.strokeStyle = col("--site-crimp"); x.lineWidth = 5;
      x.beginPath(); for (let i = 0; i <= 26; i++) x.lineTo((i / 26) * w, h * 0.07 + (i % 2 ? 10 : 0)); x.stroke();
    };
    const front = face((x, w, h) => {
      body(x, w, h);
      x.fillStyle = col("--kf-ink"); x.textAlign = "center";
      x.font = `400 ${w * 0.16}px ${font}`; x.fillText("LOGOTYPE", w / 2, h * 0.22);
      x.font = `400 ${w * 0.11}px ${font}`; x.fillText("HERE", w / 2, h * 0.31);
      x.fillStyle = col("--site-lemon"); x.beginPath(); x.arc(w / 2, h * 0.58, w * 0.33, 0, Math.PI * 2); x.fill();
      // Center character: droplet body · sunglasses · scarf
      const cx = w / 2, cy = h * 0.6, r = w * 0.2;
      x.fillStyle = col(`--site-m-4`);
      x.beginPath(); x.moveTo(cx, cy - r * 1.7);
      x.bezierCurveTo(cx + r * 0.7, cy - r * 0.8, cx + r * 1.2, cy - r * 0.1, cx + r * 1.1, cy + r * 0.6);
      x.bezierCurveTo(cx + r, cy + r * 1.3, cx - r, cy + r * 1.3, cx - r * 1.1, cy + r * 0.6);
      x.bezierCurveTo(cx - r * 1.2, cy - r * 0.1, cx - r * 0.7, cy - r * 0.8, cx, cy - r * 1.7); x.fill();
      x.fillStyle = col("--site-m-glass");
      [-1, 1].forEach((sd) => { x.beginPath(); x.roundRect(cx + (sd < 0 ? -r * 0.95 : r * 0.1), cy - r * 0.35, r * 0.85, r * 0.55, r * 0.22); x.fill(); });
      x.fillStyle = col("--site-lemon"); x.fillRect(cx - r * 1.15, cy + r * 0.75, r * 2.3, r * 0.3);
      x.fillStyle = col("--site-lemon"); x.fillRect(w * 0.2, h * 0.85, w * 0.6, h * 0.05);
      x.fillStyle = col("--site-pouch"); x.fillRect(w * 0.28, h * 0.868, w * 0.44, h * 0.014);
    });
    const back = face((x, w, h) => {
      body(x, w, h);
      x.fillStyle = col("--kf-ink"); x.fillRect(w * 0.08, h * 0.1, w * 0.84, h * 0.045);
      x.fillStyle = col("--site-lemon"); x.font = `400 ${w * 0.12}px ${font}`; x.textAlign = "left";
      x.fillText("TITLE", w * 0.5, h * 0.23); x.fillText("HERE", w * 0.5, h * 0.3);
      x.fillStyle = col("--site-crimp"); x.fillRect(w * 0.08, h * 0.17, w * 0.36, h * 0.18);
      x.fillStyle = col("--kf-ink");
      for (let i = 0; i < 9; i++) x.fillRect(w * 0.5, h * (0.33 + i * 0.022), w * (i === 8 ? 0.22 : 0.42), h * 0.008);
      x.fillStyle = col("--kf-surface"); x.fillRect(w * 0.08, h * 0.56, w * 0.4, h * 0.26);
      x.fillStyle = col("--kf-ink");
      for (let i = 0; i < 12; i++) x.fillRect(w * 0.1, h * (0.58 + i * 0.019), w * 0.36, i % 4 ? 2 : 5);
      for (let i = 0; i < 26; i++) x.fillRect(w * (0.1 + i * 0.012), h * 0.85, i % 3 ? 2 : 4, h * 0.06);
      x.fillStyle = col("--site-m-4"); x.beginPath(); x.ellipse(w * 0.72, h * 0.66, w * 0.14, h * 0.1, 0, 0, Math.PI * 2); x.fill();
    });
    const mat = (map) => new T.MeshStandardMaterial({ map, roughness: 0.5, metalness: 0.05 });
    const pack = new T.Group();
    const fm = new T.Mesh(geo(1), mat(front));
    const bm = new T.Mesh(geo(1), mat(back));
    bm.rotation.y = Math.PI;
    pack.add(fm, bm);
    scene.add(pack);
    const visW = 2 * Math.tan((10 * Math.PI) / 180) * cam.position.z * (W / H);
    const ease = (t) => 0.5 * t + 0.25 * (1 - Math.cos(Math.PI * t));
    let last = 0;
    document.fonts.ready.then(() => { faces.forEach((f) => f()); api.draw(last); });
    const api = {
      draw(frame) {
        last = frame;
        const t = ease(Math.min(frame / 100, 1));
        pack.rotation.y = Math.PI * t;
        pack.position.x = t * 0.032 * visW;
        renderer.render(scene, cam);
      },
    };
    return api;
  };

  // ---------- Drawing in ----------
  // 15 peanuts: same position and size as the original (width %, margin vw), with parallax depth (layer) and base tilt (rot)
  const NUTS = [
    ["5%", "10vw 0 0 3vw", "tl", 0.5, -20], ["6%", "12vw 0 0 13.5vw", "tl", 0.5, 30], ["4%", "29vw 0 0 5vw", "tl", 0.4, 60],
    ["2%", "0 0 12vw 14vw", "bl", 0.3, 10], ["10%", "0 0 3vw 22.6vw", "bl", 0.8, -35], ["4%", "15vw 0 0 31.6vw", "tl", 0.2, 80],
    ["13%", "-7vw 0 0 31.6vw", "tl", 1, 15], ["8%", "-4vw 16.5vw 0 0", "tr", 0.8, -50], ["11%", "3vw 22.6vw 0 0", "tr", 1, 25],
    ["6%", "10vw 3vw 0 0", "tr", 0.5, -15], ["5%", "24vw -3vw 0 0", "tr", 0.6, 40], ["4%", "27.1vw 13.5vw 0 0", "tr", 0.3, -70],
    ["7%", "0 3vw 7vw 0", "br", 0.5, 20], ["12%", "0 12vw -5vw 0", "br", 0.9, -25], ["7%", "0 28.6vw 9vw 0", "br", 0.6, 55],
  ];
  const nutsBox = $(".hs-hero__nuts");
  NUTS.forEach(([w, m, corner, layer, rot]) => {
    nutsBox.insertAdjacentHTML("beforeend", use("hs-nut"));
    const el = nutsBox.lastElementChild;
    const inset = { tl: "0 auto auto 0", tr: "0 0 auto auto", bl: "auto auto 0 0", br: "auto 0 0 auto" }[corner];
    Object.assign(el.style, { width: w, margin: m, inset });
    el.dataset.layer = layer;
    el.dataset.rot = rot;
  });
  $(".hs-hero__img").insertAdjacentHTML("beforeend", use("hs-mascot", "", mascotStyle(FLAVORS[2])));

  // Character video: instead of looping like the original, rest 3 seconds when it ends then restart, and pause when it leaves the hero or the tab hides. If it can’t load within 100ms, show the first image
  const vid = $(".hs-hero__vid");
  const poster = $(".hs-hero__img .hs-svg");
  const posterTimer = setTimeout(() => vid.readyState < 3 && poster.classList.add("is-visible"), 100);
  vid.addEventListener("loadeddata", () => { clearTimeout(posterTimer); poster.classList.remove("is-visible"); }, { once: true });
  vid.addEventListener("ended", () => setTimeout(() => { vid.currentTime = 0; vid.play().catch(() => {}); }, 3000));
  document.addEventListener("visibilitychange", () => (document.hidden ? vid.pause() : vid.play().catch(() => {})));
  new IntersectionObserver((es) => (es[0].isIntersecting ? vid.play().catch(() => {}) : vid.pause()), { threshold: 0 }).observe($(".hs-hero"));

  const marqWords = ["Your benefit one here", "Benefit Two", "Third long benefit text", "Benefit Four", "Five Benefits", "Your benefit six here"];
  $(".hs-marquee__wrap").innerHTML = Array.from({ length: 4 }, () =>
    `<div class="hs-marquee__track">${marqWords.map((w) => `<span>${w}</span><i></i>`).join("")}</div>`).join("");

  $(".hs-fpacks").innerHTML = FLAVORS.slice(0, 3).map((f, i) => `<div class="hs-fpack is-${i}" data-label="Product bag cutout · ${f.name} · Front view · portrait 2:3">${pouch(f)}</div>`).join("");
  $(".hs-pack__item").innerHTML = '<canvas class="hs-pack__cv"></canvas>';
  $(".hs-pack__item").dataset.label = "Product bag 3D rotation, 120 frames (front → back 180°) · rotates with scroll · transparent background 1130×1080";

  const BENEFITS = [
    ["Benefit Number One", "hs-ic-nut"], ["Benefit Two", "hs-ic-avocado"], ["Benefit Three", "hs-ic-leaf"],
    ["Fourth Benefit Name", "hs-ic-wing"], ["Benefit Five", "hs-ic-broc"], ["Benefit Number Six", "hs-ic-bell"],
  ];
  $(".hs-bands").innerHTML = BENEFITS.map(([t, ic], i) => `
    <div class="hs-band is-${i + 1}"><div class="hs-band__c">
      <div class="hs-band__row"><h3 class="hs-d" data-label="Your efficacy English name here">${t}</h3>${use(ic, "hs-band__ic")}</div>
      <p class="hs-t">Put two to four lines explaining the effect here. Use a playful tone and short, clipped sentences.</p>
    </div></div>`).reverse().join("");

  const quote = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 18v-5c0-4 2-7 6-8l1 2c-2 1-3 2-3 4h3v7zm10 0v-5c0-4 2-7 6-8l1 2c-2 1-3 2-3 4h3v7z" fill="var(--kf-surface)"/></svg>';
  const review = (ini, name, loc, locBg) => `
    <div class="hs-cbody">
      <div class="hs-crate">${quote}<b>★ 5/5</b></div>
      <div class="hs-cname"><div class="hs-cav"><b>${ini}</b></div><div><h3 class="hs-d" data-label="Your guest English name here">${name}</h3><span class="hs-cloc hs-t" style="background:var(--site-${locBg})">Area name, 00</span></div></div>
      <p class="hs-ctext hs-t">Your customer review here in two or three lines. Briefly say which flavor was good and who you ate with.</p>
    </div>`;
  $(".hs-card.is-orange").innerHTML = review("AB", "Customer Name", "", "brown");
  $(".hs-card.is-yellow").innerHTML = review("CD", "Customer Name", "", "red");
  $(".hs-card.is-red").innerHTML = review("EF", "Customer Name", "", "lemon");
  $(".hs-card__front").innerHTML = review("GH", "Customer Name", "", "orange");
  $$(".hs-tape__nut").forEach((n, i) => (n.innerHTML = use("hs-mascot", "", mascotStyle(FLAVORS[i ? 3 : 1]))));
  HS.hoverSpin($(".hs-pack"));
  const pack3d = HS.pouch3d($(".hs-pack__cv"));
  pack3d?.draw(0);

  // ---------- Mouse parallax peanut: original values — strength 150 · follow 5.5% · float x 8.5 y 10 · breathing 1.3% · push-away radius 1000px strength 34 · push follow 3.5% ----------
  // The original script defaults are strength 69 · radius 283, but the data attributes of the hero panel override them with 150 and 1000
  const P = { strength: 150, lerp: 0.055, rotStr: 3.5, floatY: 10, floatX: 8.5, breath: 0.013, speed: 12 * 0.025, frot: 4, repR: 1000, repS: 34, repLerp: 0.035 };
  const items = $$(".hs-svg", nutsBox).map((el) => ({
    el, layer: +el.dataset.layer, rot: +el.dataset.rot, rx: 0, ry: 0,
    ph: [0, 1, 2, 3].map(() => Math.random() * Math.PI * 2), k: [0.85 + Math.random() * 0.3, 0.85 + Math.random() * 0.3, 0.75 + Math.random() * 0.55],
  }));
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    let tx = 0, ty = 0, cx = 0, cy = 0, mx = -9999, my = -9999, t = 0;
    const move = (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; mx = e.clientX; my = e.clientY; };
    const leave = () => { tx = ty = 0; mx = my = -9999; };
    addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    const tick = (time, dt) => {
      t += Math.min(dt / 1000, 0.05);
      cx += (tx - cx) * P.lerp;
      cy += (ty - cy) * P.lerp;
      items.forEach((it) => {
        const ft = t * P.speed * it.k[2];
        const fY = Math.sin(ft + it.ph[1]) * P.floatY, fX = Math.sin(ft * 0.6 + it.ph[0]) * P.floatX;
        const sc = 1 + Math.sin(ft * 0.35 + it.ph[2]) * P.breath, fR = Math.sin(ft * 0.5 + it.ph[3]) * P.frot;
        const r = it.el.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2), d = Math.hypot(dx, dy);
        let gx = 0, gy = 0;
        if (d < P.repR && d > 0) { const f = 1 - d / P.repR; gx = (-dx / d) * f * P.repS; gy = (-dy / d) * f * P.repS; }
        it.rx += (gx - it.rx) * P.repLerp;
        it.ry += (gy - it.ry) * P.repLerp;
        const x = cx * -P.strength * it.layer * it.k[0] + fX + it.rx;
        const y = cy * -P.strength * 0.7 * it.layer * it.k[1] + fY + it.ry;
        const rot = it.rot + fR + (cx * P.rotStr + cy * P.rotStr * 0.6) * it.layer;
        it.el.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      });
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); removeEventListener("mousemove", move); document.removeEventListener("mouseleave", leave); };
  });

  // ---------- Scroll scene ----------
  const split = (el, type) => {
    const s = HS.split(el, type);
    return type === "chars" ? s.chars : s.lines;
  };
  const bk = (p = 1.7, c = "inOut") => `back.${c}(${p})`;

  mm.add({ desk: "(min-width: 992px)", phone: "(max-width: 991px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { desk, motion } = ctx.conditions;
    if (!motion) return;
    const mmCleanup = [];

    // Hero: while the next section covers it, the title · character · peanut shrink to .9 (back.out(1.2)) and the dark ink curtain deepens to 60%. The peanuts scatter faster
    gsap.timeline({ scrollTrigger: { trigger: ".hs-hero", start: "clamp(top bottom)", end: "bottom top", scrub: 1.4 } })
      .to([".hs-hero__title", ".hs-hero__img"], { scale: 0.9, ease: "back.out(1.2)" }, 0)
      .to(".hs-hero__nuts", { scale: 0.9, yPercent: -18, ease: "back.out(1.2)" }, 0)
      .to(".hs-hero__dim", { opacity: 0.6, ease: "none" }, 0);

    // Flavor stage
    const bg = $(".hs-flavors__bg");
    const heads = $$(".hs-fh h2").map((h) => split(h, "chars"));
    const descs = $$(".hs-fdesc p").map((p) => split(p, "lines"));
    const tag = (i) => [...$$(`.hs-ftag.is-${i} span`), ...(i < 3 ? [$(`.hs-flavors .hs-round.is-${i}`)] : [$(".hs-pack .hs-round")])];
    const packs = $$(".hs-fpack");
    const lemon = $(".hs-pack__item");
    const out = (i, at, d = 0.32) => tl.to(tag(i), { scale: 0, opacity: 0.5, duration: d, ease: bk(1.7, "in"), stagger: { amount: 0.1 } }, at);
    const inn = (i, at) => tl.fromTo(tag(i), { scale: 0, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.7, ease: bk(1.7, "out"), stagger: { amount: 0.2 }, immediateRender: true }, at);
    const shadow = $(".hs-fshadow");

    gsap.set([...descs.slice(1).flat()], { yPercent: 101 });
    gsap.set([...heads[1], ...heads[2]], { yPercent: -101 });
    gsap.set([tag(1), tag(2), tag(3)].flat(), { scale: 0, opacity: 0.5 });
    gsap.set(packs[1], { x: "-30vw", y: "-100vh", rotation: 180 });
    gsap.set(packs[2], { x: "80vw", y: "100vh", rotation: -180 });
    gsap.set(lemon, { x: "-80vw", y: "-15vh", rotation: 180 });

    const tl = gsap.timeline({ defaults: { duration: 0.5 }, scrollTrigger: { trigger: ".hs-flavors", start: "top top", end: "bottom bottom", scrub: 1.4 } });
    // 1 → 2
    out(0, 0);
    tl.to(heads[0], { yPercent: 101, duration: 1.56, ease: bk(), stagger: { amount: 0.5 } }, 0.2)
      .to(heads[1], { yPercent: 0, duration: 1.56, ease: bk(), stagger: { amount: 0.15 } }, 0.64)
      .to(packs[0], { y: "100vh", x: "30vw", rotation: -180, duration: 2, ease: "sine.out" }, 0.2)
      .to(packs[1], { x: 0, y: 0, rotation: 0, duration: 2, ease: "sine.out" }, 0.2)
      .to(bg, { backgroundColor: HS.color("--site-brown"), duration: 2.02, ease: "none" }, 0.2)
      .to(descs[0], { yPercent: -101, duration: 2, ease: bk(1.7, "out"), stagger: { amount: 0.5 } }, 0.71)
      .to(descs[1], { yPercent: 0, duration: 2, ease: bk(1.7, "out"), stagger: { amount: 0.5 } }, 0.71)
      .to(shadow, { opacity: 0, scale: 0.6, duration: 0.5, ease: "none" }, 0)
      .fromTo(shadow, { opacity: 0, scale: 0.6 }, { opacity: 0.4, scale: 1, duration: 0.5, ease: "none", immediateRender: false }, 1.81);
    inn(1, 2.35);
    // 2 → 3
    out(1, 4);
    tl.to(".hs-fh", { xPercent: -50, duration: 2.37, ease: "expoScale(0.1,1,none)" }, 4.32)
      .to(heads[1], { yPercent: -100, duration: 1.56, ease: bk(1.7, "in"), stagger: { amount: 0.5 } }, 4.32)
      .to(heads[2], { yPercent: 0, duration: 1.56, ease: bk(), stagger: { amount: 0.5 } }, 5.14)
      .to(packs[1], { y: "-100vh", x: "-70vw", rotation: 180, duration: 2.31, ease: "sine.out" }, 4.32)
      .to(packs[2], { x: 0, y: 0, rotation: 0, duration: 2.31, ease: "sine.out" }, 4.32)
      .to(bg, { backgroundColor: HS.color("--site-orange"), duration: 2.02, ease: "none" }, 4.32)
      .to(descs[1], { yPercent: -101, duration: 2, ease: bk(1.7, "out"), stagger: { amount: 0.5 } }, 4.83)
      .to(descs[2], { yPercent: 0, duration: 2, ease: bk(1.7, "out"), stagger: { amount: 0.5 } }, 4.83)
      .to(shadow, { opacity: 0, scale: 0.6, duration: 0.5, ease: "none" }, 4.24)
      .to(shadow, { opacity: 0.4, scale: 1, duration: 0.5, ease: "none" }, 6.12);
    inn(2, 6.35);
    // 3 → 4: The last bag enters as a fixed layer
    out(2, 7.82);
    tl.to([".hs-fh.is-2", ".hs-fh.is-3"], { xPercent: 100, duration: 3.19, ease: bk() }, 8.14)
      .to(packs[2], { y: "15vh", x: "80vw", rotation: 180, duration: 2, ease: "sine.out" }, 8.6)
      .to(lemon, { x: 0, y: 0, rotation: 0, duration: 2, ease: "sine.out" }, 8.6)
      .to(bg, { backgroundColor: HS.color("--site-lemon"), duration: 2.02, ease: "none" }, 8.14)
      .to(descs[2], { yPercent: -101, duration: 2, ease: bk(1.7, "out"), stagger: { amount: 0.5 } }, 8.64)
      .to(descs[3], { yPercent: 0, duration: 2, ease: bk(1.7, "out"), stagger: { amount: 0.5 } }, 8.64)
      .to(shadow, { opacity: 0, scale: 0.6, duration: 0.5, ease: "none" }, 8.11)
      .to(shadow, { opacity: 0.4, scale: 1, duration: 0.5, ease: "none" }, 9.81);
    inn(3, 10.17);
    tl.to(heads[3], { yPercent: -101, duration: 1.6, ease: bk(1.7, "in"), stagger: { amount: 0.5 } }, 11.55)
      .to(descs[3], { yPercent: -101, duration: 1.62, ease: bk(1.7, "in"), stagger: { amount: 0.5 } }, 11.82)
      .to([...$$(".hs-ftag.is-3 span"), shadow], { opacity: 0.5, scale: 0, duration: 1.64, ease: bk(1.7, "in") }, 11.82)
      .to(".hs-pack .hs-round", { opacity: 0.5, scale: 0, duration: 1.62, ease: bk(1.7, "out") }, 11.84)
      .set({}, {}, 12.2);

    // Pinned bag: the original draws 120 rotation frames on a canvas — after 12% scroll progress it sets the target frame 4x faster, and the current frame follows it at 8% per frame.
    // Here those 120 frames are drawn on the spot with our 3D bag (three). Frame → angle matches the bag width measured per frame in the original (front → back 180° over frames 0~100, last 20 frames hold)
    if (pack3d) {
      const FRAMES = 120, START = 0.12, SPEED = 4, LERP = 0.08;
      const target = (p) => (p < START ? 0 : Math.min(((p - START) / (1 - START)) * SPEED, 1) * (FRAMES - 1));
      let goal = 0, cur = 0, shown = -1, raf = 0;
      // Original bag panel (1200vh, up -1100vh) starts at the flavor stage top line +300vh and ends at the benefits band end +100vh — 3600→13500px at 1440
      const st = ScrollTrigger.create({
        trigger: ".hs-flow", start: () => `top+=${innerHeight * 3} top`, end: () => `bottom+=${innerHeight} bottom`, scrub: true,
        onUpdate: (self) => (goal = target(self.progress)),
      });
      goal = cur = target(st.progress);
      const loop = () => {
        cur += (goal - cur) * LERP;
        const f = Math.round(cur);
        if (f !== shown) pack3d.draw((shown = f));
        raf = requestAnimationFrame(loop);
      };
      loop();
      mmCleanup.push(() => { cancelAnimationFrame(raf); st.kill(); pack3d.draw(0); });
    }

    // Benefits strip
    const bands = $$(".hs-band").reverse();
    const title = split($(".hs-btitle__h"), "chars");
    const ptext = split($(".hs-btitle__p"), "lines");
    const btl = gsap.timeline({ defaults: { duration: 0.5 }, scrollTrigger: { trigger: ".hs-benefits", start: "top top", end: "bottom 120%", scrub: 1.4 } })
      .from(title, { yPercent: 105, ease: bk(1.7, "out"), stagger: { amount: 0.2 } }, 0.21)
      .from(".hs-btitle .hs-tag", { opacity: 0.5, scale: 0, duration: 0.4, ease: bk(1.7, "out") }, 0.49)
      .from(ptext, { yPercent: 101, duration: 0.72, ease: bk(1.7, "out"), stagger: { amount: 0.1 } }, 0.21);
    if (desk) {
      btl.from(bands, { xPercent: 101, ease: bk(), stagger: { amount: 0.2, from: "end" } }, 0.12);
      [-67, -73, -79, -85, -80].forEach((x, i) => btl.to(bands[i + 1], { xPercent: x, ease: bk() }, 0.85 + i * 0.5));
      btl.set({}, {}, 3.46);
    } else {
      btl.from(bands, { yPercent: 101, ease: bk(), stagger: { amount: 0.2, from: "end" } }, 0.9)
        .to(".hs-pack__item", { scale: 0.9, yPercent: 5, ease: bk() }, 0.21)
        .set([".hs-pack__item", ".hs-pack .hs-round"], { autoAlpha: 0 }, 2.12);
      bands.slice(1).forEach((b, i) => btl.to(b, { y: "-30dvh", ease: bk() }, 1.63 + i * 0.5));
      btl.set({}, {}, 4.2);
    }

    // Band marquee: text flows along the curve by wheel/scroll speed, then stops with .96 friction (sensitivity .01 · max 300)
    const tp = $("#hs-tp");
    let off = 0, vel = 0, raf = 0, lastY = scrollY;
    const repeatLen = () => $(".hs-tape__text").getComputedTextLength() / 8;
    const spin = () => {
      vel *= 0.96;
      off = (((off + vel) % repeatLen()) + repeatLen()) % repeatLen();
      tp.setAttribute("startOffset", -off + "px");
      raf = Math.abs(vel) > 0.01 ? requestAnimationFrame(spin) : 0;
    };
    const push = (d) => { vel = Math.max(-300, Math.min(300, vel + d * 0.01)); if (!raf) raf = requestAnimationFrame(spin); };
    const onWheel = (e) => push(e.deltaY);
    const onScroll = () => { if (!desk) push((scrollY - lastY) * 1.5); lastY = scrollY; };
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    gsap.from([".hs-tape__nut.is-l", ".hs-tape__nut.is-r"], {
      x: (i) => (i ? "20vw" : "-20vw"), duration: 0.5, ease: bk(1.7, "out"), stagger: 0.1,
      scrollTrigger: { trigger: ".hs-tape", start: "top 50%", toggleActions: "play none none reverse" },
    });

    // Review stack: cards pile up from below at a tilt → all straighten to 0 degrees → the last card flips and a gray-white panel grows to fill the screen.
    // The original IX3 has a motion where the news photo grows from 0 (.hp-section-5 top 25%), but that element isn’t on the page so it doesn’t run — the photo is at full size from the start
    const back = $(".hs-card__back");
    gsap.set(back, { scale: desk ? 0.4 : 0.6 });
    gsap.timeline({ defaults: { duration: 0.5 }, scrollTrigger: { trigger: ".hs-reviews", start: "top top", end: "bottom bottom", scrub: 1.4 } })
      .fromTo(".hs-card.is-yellow", { yPercent: 200, rotation: -10 }, { yPercent: 0, rotation: 5, ease: "back.out(0.5)" }, 0.5)
      .fromTo(".hs-card.is-red", { yPercent: 200, rotation: 10 }, { yPercent: 0, rotation: -5, ease: "back.out(0.5)" }, 1.2)
      .fromTo(".hs-card.is-brown", { yPercent: 200, rotation: -12 }, { yPercent: 0, rotation: 7, ease: "back.out(0.5)" }, 1.9)
      .to(".hs-card", { rotation: 0, duration: 0.2, ease: "back.out(0.5)" }, 2.43)
      .set([".hs-card.is-orange", ".hs-card.is-yellow", ".hs-card.is-red"], { opacity: 0 }, 2.61)
      .to(".hs-card__inner", { rotationY: 180, ease: bk() }, 2.63)
      .to(back, { scale: 1, ease: bk() }, 3.13)
      .to(".hs-card.is-brown", { y: desk ? "-25vh" : "-17vh", ease: bk() }, 3.13)
      .to(back, { borderRadius: 0, duration: 0.05, ease: "none" }, 3.54)
      .set({}, {}, 3.7);


    // Censorship: caption letters rise, and the ink-colored band · contact button pop out from 0
    const ct = split($(".hs-contact__title h2"), "chars");
    gsap.timeline({ scrollTrigger: { trigger: ".hs-contact__title", start: "top 50%", toggleActions: "play none none reverse" } })
      .from(ct, { yPercent: 101, duration: 0.5, ease: bk(1.7, "out"), stagger: { amount: 0.2 } })
      .from([".hs-censor__band", ".hs-round.is-contact"], { opacity: 0.5, scale: 0, duration: 0.5, ease: bk(2, "inOut") }, 0.2);

    return () => { removeEventListener("wheel", onWheel); removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); mmCleanup.forEach((f) => f()); };
  });

  // News board card hover: the title row rises from 101% below and the dark overlay goes to 30%
  $$(".hs-news__item").forEach((a) => {
    const t = HS.split(a.querySelector(".hs-news__t"), "lines").lines;
    const tw = gsap.timeline({ paused: true })
      .fromTo(t, { yPercent: 101 }, { yPercent: 0, duration: 0.5, ease: "back.out(1.7)", stagger: { amount: 0.1 } })
      .to(a.querySelector(".hs-news__shade"), { opacity: 0.3, duration: 0.5, ease: "back.out(1.7)" }, 0);
    a.addEventListener("mouseenter", () => tw.play());
    a.addEventListener("mouseleave", () => tw.reverse());
    tw.progress(1).progress(0);
    if (matchMedia("(hover: none)").matches) tw.progress(1);
  });
})();
