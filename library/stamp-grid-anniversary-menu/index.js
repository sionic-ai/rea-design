// Home page — stamp grid (Konva) · ball loader · white circle intro · menu drawer · sections that open as a white board grows when a stamp is pressed
(() => {
  const { kfVar, sealSVG } = window.shSite;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, MotionPathPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Original values (seconds · curves)
  const T = {
    xy: 1.199, flip: 0.1, flipIn: "-=0.199", flipOut: "+=0.599", hop: 1.999,
    ui: 0.3, uiLong: 0.6,
    easeXY: "power3.inOut", easeFlip: "power1.out", easeHop: "power4.inOut",
    easeUI: "power4.out", easeUIInOut: "power2.inOut", easeUIClose: "power3.inOut",
  };

  const NAMES = ["Name", "Name", "Mint", "Name", "Name", "Landscape", "Name", "Sparkling water", "Rose", "Name", "Consistently", "Rise", "Name", "Renal pelvis", "Recommend", "Name", "Fog", "Cluster", "Name", "Advance", "Ripe persimmon", "Lovely", "Literary flair", "Sunny spot"];
  const STAMP_NAMES = ["Forest", "High field", "New spring", "River", "Plural marker"];

  /* ── Repeated list within a section ── */
  const buildLists = () => {
    $("#sh-messages").innerHTML = NAMES.map((n, i) => `<li><button class="btn_message" data-target="${i + 1}" type="button" aria-label="Congratulatory speech ${i + 1}"><span class="t">${sealSVG(n)}</span><span class="t2"><span class="wf-img" data-label="Sender’s face · circle · light background"></span></span></button></li>`).join("");
    $$(".sh-seal-slot").forEach((el) => (el.innerHTML = sealSVG(el.dataset.seal)));
    $$("[data-roll]").forEach((bar) => {
      bar.innerHTML = Array.from({ length: 8 }, (_, i) => i % 2
        ? '<div class="wf-img" data-label="Portrait · circle · light gray background · chest up"></div>'
        : '<div class="wf-img logo" data-label="brand anniversary mark · circle · orange line drawing"></div>').join("");
    });
    $("#sh-cards").innerHTML = Array.from({ length: 8 }, (_, i) => `<div class="img"><div class="wf-img" data-label="Handwritten congratulation card ${String(i + 1).padStart(2, "0")} · Colored pen writing on a white card · top-down flat view"></div></div>`).join("");

    const years = ["0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000"].map((y, i) => `${1925 + i * 9}`);
    $("#sh-years").innerHTML = years.map((y, i) => `<li><button class="btn_history${i ? "" : " active"}" data-target="${i}" type="button">${y}</button></li>`).join("");
    $("#sh-history-list").innerHTML = years.map((y, i) => `
      <div class="history_area${i ? "" : " open"}" id="year_${i}">
        <div class="area">
          <div class="img">${sealSVG(NAMES[i].slice(0, 2))}<p class="quote">”A phrase from that era here”</p></div>
          <div class="texts">
            <div class="text"><p class="year">${y}</p><p class="txt">Your events of that year in two lines here<br>Briefly written in.</p></div>
            <div class="photo"><div class="wf-img" data-label="Black-and-white archive photo from that year · buildings and people · portrait 3:4"></div></div>
          </div>
        </div>
      </div>`).join("");

    const rule = Array.from({ length: 10 }, (_, i) => `<span${i % 3 === 2 ? ' class="rule_a"' : ""}><i class="a1"></i><i class="a2">${sealSVG("Feather")}</i></span>`).join("");
    $$("#game .rule").forEach((r) => (r.innerHTML = rule));

    const rays = $("#sh-rays");
    rays.innerHTML = Array.from({ length: 16 }, (_, i) => {
      const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 32;
      return `<path d="M0 0L${(Math.cos(a0) * 100).toFixed(1)} ${(Math.sin(a0) * 100).toFixed(1)}L${(Math.cos(a1) * 100).toFixed(1)} ${(Math.sin(a1) * 100).toFixed(1)}Z"/>`;
    }).join("");
    $("#sh-win-photos").innerHTML = Array.from({ length: 10 }, (_, i) => `<div class="photo${i >= 5 ? " r" : ""}" style="animation-delay:${(i % 5) * 0.6}s"><div class="wf-img" data-label="Smiling face photo · circle"></div></div>`).join("");
  };
  buildLists();

  const bars = {};
  $$(".content_scroll").forEach((el) => (bars[el.id] = new SimpleBar(el, { autoHide: true })));
  const scrollEl = (id) => (bars[id] ? bars[id].getScrollElement() : $("#" + id));

  /* ── Stamp Grid ── */
  const App = {
    flags: { anim: false, open: false },
    canIntro: false,
    gameStart: false,
    stamps: [],
  };

  const measure = () => {
    const w = innerWidth, h = innerHeight, sp = w < 768;
    return {
      w, h, sp,
      area: sp ? 0.23 * w : 0.1 * w,
      stamp: sp ? 0.135 * w : 0.06 * w,
      cols: sp ? 12 : 14,
    };
  };

  const colors = () => ({
    red: kfVar("--kf-accent"), blue: kfVar("--kf-ink"), white: kfVar("--kf-surface"), bg: kfVar("--kf-bg"),
    font: kfVar("--kf-font-sans"),
  });

  // Original cell split: video · history · name stamp · congratulation card take 7% each, the rest are speech seals. Game · hidden flag are slotted into fixed cells
  const deal = (total, cols, sp) => {
    const n7 = Math.floor(total * 0.07);
    const list = [];
    for (let i = 0; i < n7; i++) list.push({ cat: "mov" }, { cat: "history" }, { cat: "name", id: (i % 5) }, { cat: "celebration" });
    for (let i = 0; list.length < total - 2; i++) list.push({ cat: "syukuji", id: (i % NAMES.length) + 1 });
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    if (sp) { list.splice(3 * cols + 2, 0, { cat: "game" }); list.splice(4 * cols + 4, 0, { cat: "win" }); }
    else { list.splice(7 * cols + 8, 0, { cat: "game" }); list.splice(7 * cols + 4, 0, { cat: "win" }); }
    return list;
  };

  // Back side (usually visible): red circle · blue triangle · blue square · three blue lines
  const drawBack = (cat, S, c) => {
    const g = new Konva.Group({ width: S, height: S });
    const k = S / 80;
    if (cat === "mov") g.add(new Konva.Line({ points: [80 * k, 40 * k, 0, 80 * k, 0, 0], closed: true, fill: c.blue }));
    else if (cat === "history") g.add(new Konva.Rect({ x: 2 * k, y: 2 * k, width: 76 * k, height: 76 * k, fill: c.blue }));
    else if (cat === "name") [7, 31, 55].forEach((x) => g.add(new Konva.Rect({ x: x * k, y: 0, width: 18 * k, height: 80 * k, fill: c.blue })));
    else g.add(new Konva.Circle({ x: S / 2, y: S / 2, radius: S / 2, fill: c.red }));
    return g;
  };

  // Front face (when flipped): name letters inside a red ring · play · 100 · letter · game · logo symbol
  const drawFront = (d, S, c) => {
    const g = new Konva.Group({ width: S, height: S });
    const ring = (fill) => g.add(new Konva.Circle({ x: S / 2, y: S / 2, radius: S * 0.47, stroke: c.red, strokeWidth: S * 0.026, fill }));
    const text = (t, size, color = c.red) => g.add(new Konva.Text({ text: t, width: S, height: S, align: "center", verticalAlign: "middle", fontSize: size, lineHeight: 1.02, fontStyle: "bold", fontFamily: c.font, fill: color }));
    if (d.cat === "syukuji" || d.cat === "name") {
      const name = d.cat === "name" ? STAMP_NAMES[d.id] : NAMES[d.id - 1];
      ring();
      text([...name].join("\n"), [...name].length > 1 ? S * 0.34 : S * 0.5);
    } else if (d.cat === "mov") {
      ring(); g.add(new Konva.Line({ points: [S * 0.4, S * 0.33, S * 0.68, S * 0.5, S * 0.4, S * 0.67], closed: true, fill: c.red }));
    } else if (d.cat === "history") {
      ring(); text("100", S * 0.3);
    } else if (d.cat === "celebration") {
      ring(c.bg);
      g.add(new Konva.Rect({ x: S * 0.28, y: S * 0.35, width: S * 0.44, height: S * 0.3, stroke: c.red, strokeWidth: S * 0.03 }));
      g.add(new Konva.Line({ points: [S * 0.28, S * 0.35, S * 0.5, S * 0.52, S * 0.72, S * 0.35], stroke: c.red, strokeWidth: S * 0.03 }));
    } else if (d.cat === "game") {
      ring(c.bg); text("GAME", S * 0.2);
    } else {
      g.add(new Konva.Circle({ x: S * 0.3, y: S * 0.68, radius: S * 0.12, fill: c.red }));
      g.add(new Konva.Line({ points: [S * 0.42, S * 0.12, S * 0.56, S * 0.12, S * 0.4, S * 0.52, S * 0.26, S * 0.52], closed: true, fill: c.blue }));
      g.add(new Konva.Line({ points: [S * 0.7, S * 0.22, S * 0.84, S * 0.22, S * 0.6, S * 0.88, S * 0.46, S * 0.88], closed: true, fill: c.blue }));
    }
    return g;
  };

  // Direction per cell: even rows go upper-right (rt) for even cells and lower-right (rb) for odd cells, odd rows go upper-left (lt) and lower-left (lb)
  const DIRS = { rt: [1, -1], rb: [1, 1], lt: [-1, -1], lb: [-1, 1] };
  // Distance moved in one cycle (one horizontal step + one vertical step + one diagonal hop)
  const STEP = { rt: [2, -2], rb: [0, 2], lt: [0, -2], lb: [-2, 2] };

  const makeStamp = (m, c, d, col, row, layer) => {
    const S = m.stamp, A = m.area;
    const dir = row % 2 === 0 ? (col % 2 === 0 ? "rt" : "rb") : (col % 2 === 0 ? "lt" : "lb");
    const [dirX, dirY] = DIRS[dir];
    const a = dirY === -1 ? 45 : -135;
    const st = { d, dir, dirX, dirY, baseX: col * A, baseY: row * A, rotateBase: a, rotateCount: 0, canClick: true };
    st.group = new Konva.Group({ x: st.baseX, y: st.baseY, width: S, height: S, rotation: dirY === -1 ? 180 : 0, offset: { x: S / 2, y: S / 2 } });
    st.hit = new Konva.Rect({ width: S, height: S });
    st.imgGroup = new Konva.Group({ x: S / 2, y: S / 2, width: S, height: S, rotation: 135, offset: { x: S / 2, y: S / 2 } });
    st.inner = new Konva.Group({ x: S / 2, y: S / 2, width: S, height: S, offset: { x: S / 2, y: S / 2 } });
    st.front = drawFront(d, S, c);
    st.back = drawBack(d.cat, S, c);
    [st.front, st.back].forEach((n) => n.setAttrs({ x: S / 2, y: S / 2, rotation: a, offset: { x: S / 2, y: S / 2 } }));
    st.front.visible(false);
    st.inner.add(st.front, st.back);
    st.imgGroup.add(st.inner);
    st.group.add(st.hit, st.imgGroup);
    layer.add(st.group);

    const sc = { s: 1 };
    st.inner.on("mouseover", () => {
      if (m.sp || App.flags.open) return;
      document.body.classList.add("ov");
      gsap.to(sc, { s: 1.15, duration: 0.2, ease: "back.out(2)", overwrite: true, onUpdate: () => st.inner.scale({ x: sc.s, y: sc.s }) });
    });
    st.inner.on("mouseout", () => {
      document.body.classList.remove("ov");
      gsap.to(sc, { s: 1, duration: 0.15, ease: "power2.out", overwrite: true, onUpdate: () => st.inner.scale({ x: sc.s, y: sc.s }) });
    });
    const press = (e) => {
      if ((e.type === "touchstart") !== m.sp) return;
      if (App.flags.anim || App.flags.open || !st.canClick) return;
      if ($("#sh-menu").classList.contains("open")) closeMenu();
      clickStamp(st);
    };
    st.inner.on("mousedown touchstart", press);
    return st;
  };

  let stage, layer, M, C, tlMain;

  const build = () => {
    if (stage) { tlMain?.kill(); stage.destroy(); }
    M = measure(); C = colors();
    const { w, h, sp, area: A, cols } = M;
    let rows = Math.floor(h / A) + 8;
    if (rows % 2) rows += 1;
    M.rows = rows;
    stage = new Konva.Stage({ container: "sh-app", width: w + A * 3, height: h + A * 3 });
    layer = new Konva.Layer();
    stage.add(layer);
    let r;
    if (sp) { r = Math.floor(h / (2 * A)); r = (h - 2 * A * r) / 2; stage.x(-1.35 * A); }
    else { r = Math.floor(h / A); r = r % 2 === 0 ? (h - A * r) / 2 + A / 2 : (h - A * r) / 2; stage.x(-A); }
    stage.y(-2.5 * A + r);
    M.areaHeight = h + A * 3;
    M.cx = w / 2 - stage.x();
    M.cy = h / 2 - stage.y();
    const deck = deal(cols * rows, cols, sp);
    App.stamps = [];
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) App.stamps.push(makeStamp(M, C, deck[row * cols + col], col, row, layer));
  };

  const wrap = (st) => {
    const W = M.cols * M.area, H = M.rows * M.area;
    if (st.baseX < -0.5 * M.area) st.baseX += W;
    else if (st.baseX >= W - 0.5 * M.area) st.baseX -= W;
    if (st.baseY < -0.5 * M.area) st.baseY += H;
    else if (st.baseY >= H - 0.5 * M.area) st.baseY -= H;
  };

  const randomTen = () => {
    const pool = App.stamps.slice(M.cols, M.cols * (M.rows - 5) + 1);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, 10);
  };

  // Pick ten, flip them in 0.1s to show the front, then flip back in 0.1s after 0.6s
  const addFlips = (tl) => {
    const p = { x: 1 };
    let picked = [];
    const apply = (x) => picked.forEach((s) => {
      s.front.scaleX(-x);
      if (s.rotateCount % 2 === 0) s.back.scaleX(x); else s.back.scaleY(x);
    });
    tl.fromTo(p, { x: 1 }, { x: -1, duration: T.flip, ease: T.easeFlip, immediateRender: false,
      onStart: () => (picked = randomTen()),
      onUpdate: () => { apply(p.x); if (p.x < -0.1) picked.forEach((s) => { s.front.visible(true); s.back.visible(false); }); } }, T.flipIn);
    tl.fromTo(p, { x: -1 }, { x: 1, duration: T.flip, ease: T.easeFlip, immediateRender: false,
      onUpdate: () => { apply(p.x); if (p.x > 0) picked.forEach((s) => { s.front.visible(false); s.back.visible(true); }); } }, T.flipOut);
  };

  const loop = () => {
    const p = { x: 0, y: 0 };
    const hop = { progress: 0, x: 0, y: 0 };
    const n = Math.SQRT2 * M.area / 2;
    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(p, { x: 0 }, { x: 1, duration: T.xy, ease: T.easeXY, immediateRender: false,
      onUpdate: () => App.stamps.forEach((s) => s.group.x(s.baseX + M.area * p.x * s.dirX)) });
    tl.add(() => gameStep(false), "<");
    addFlips(tl);
    tl.fromTo(p, { y: 0 }, { y: 1, duration: T.xy, ease: T.easeXY, immediateRender: false,
      onUpdate: () => App.stamps.forEach((s) => s.group.y(s.baseY + M.area * p.y * s.dirY)) });
    tl.add(() => gameStep(false), "<");
    addFlips(tl);
    tl.fromTo(hop, { progress: 0, x: 0, y: 0 }, {
      progress: 1, duration: T.hop, ease: T.easeHop, immediateRender: false,
      motionPath: { path: [{ x: 0, y: 0 }, { x: n, y: -n }, { x: 2 * n, y: 0 }], curviness: 1.5 },
      onUpdate: () => App.stamps.forEach((s) => {
        s.back.rotation(s.rotateBase + 270 * hop.progress);
        s.inner.position({ x: M.stamp / 2 + hop.x, y: M.stamp / 2 + hop.y });
      }),
      onComplete: () => App.stamps.forEach((s) => {
        s.rotateBase = s.back.rotation();
        s.rotateCount += 1;
        const [sx, sy] = STEP[s.dir];
        s.baseX += sx * M.area; s.baseY += sy * M.area;
        wrap(s);
        s.group.position({ x: s.baseX, y: s.baseY });
        s.inner.position({ x: M.stamp / 2, y: M.stamp / 2 });
        s.canClick = true;
      }),
    });
    tl.add(() => gameStep(true), "<");
    addFlips(tl);
    tlMain = tl;
  };

  // Game board rule row — each time the grid steps it shifts 10% left, and every third cell flips into a flag seal
  const gameStep = (long) => {
    $$("#game .rule").forEach((el) => {
      const k = +el.dataset.count;
      if (k < 9) {
        el.className = "rule" + (long ? " anim_long" : "");
        el.style.transform = `translateX(${-(k + 1) * 10}%)`;
        el.dataset.count = k + 1;
      } else {
        el.className = "rule" + (long ? " anim_long" : "");
        el.style.transform = "translateX(-100%)";
        el.dataset.count = 10;
        setTimeout(() => { el.className = "rule anim0"; el.style.transform = "translateX(0%)"; el.dataset.count = 0; }, 1000);
      }
    });
    if ($("#game").classList.contains("hide")) return;
    const at = long ? 1.85 : 0.85;
    const tl = gsap.timeline();
    tl.fromTo("#game .rule_a .a1", { scaleX: 1 }, { scaleX: 0, duration: T.flip, ease: T.easeFlip }, at);
    tl.fromTo("#game .rule_a .a2", { scaleX: 0 }, { scaleX: 1, duration: T.flip, ease: T.easeFlip }, "<");
    tl.fromTo("#game .rule_a .a1", { scaleX: 0 }, { scaleX: 1, duration: T.flip, ease: T.easeFlip }, at + 0.33);
    tl.fromTo("#game .rule_a .a2", { scaleX: 1 }, { scaleX: 0, duration: T.flip, ease: T.easeFlip }, "<");
  };

  // Arc when the stamp flies (original 180° and 200° arcs): rises up by the radius from the midpoint between start and arrival
  const arcTo = (s, tx, ty, deg) => {
    const ox = s.group.x(), oy = s.group.y();
    const mx = (ox + tx) / 2, my = (oy + ty) / 2;
    const half = Math.hypot(tx - ox, ty - oy) / 2, u = (Math.PI / 180) * deg;
    const o = { x: ox, y: oy };
    gsap.to(o, {
      duration: 0.9, ease: "power2.inOut",
      motionPath: { path: [{ x: ox, y: oy }, { x: mx + Math.cos(u / 2) * half, y: my - Math.sin(u / 2) * half }, { x: tx, y: ty }] },
      onUpdate: () => s.group.position(o),
    });
  };

  /* ── Loader / Intro ── */
  const opening = () => {
    layer.y(-0.5 * M.areaHeight);
    App.stamps.forEach((s) => s.group.position({ x: M.cx, y: M.areaHeight }));
    const sc = { s: 0 }, ly = { y: -0.5 * M.areaHeight };
    const tl = gsap.timeline();
    tl.add(() => $("#sh-opening").classList.add("open"));
    tl.fromTo("#sh-opening .cir", { y: M.h / -1.7 }, { y: 0, duration: 2, ease: "bounce.out" });
    tl.fromTo("#sh-opening .ball", { left: "20%" }, { left: "50%", duration: 2, ease: "power2.out" }, "<");
    tl.fromTo("#sh-intro-rect", { scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(1.5)" }, "+=0.5");
    tl.fromTo("#sh-intro-contents", { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(1)" }, "-=0.4");
    tl.fromTo(ly, { y: -0.5 * M.areaHeight }, { y: 0, duration: 1.1, ease: "back.inOut(2)", onUpdate: () => layer.y(ly.y) }, "-=0.6");
    tl.add(() => App.stamps.forEach((s) => arcTo(s, s.baseX, s.baseY, s.baseY < 0.7 * M.h ? 180 : 200)), "<");
    tl.fromTo(sc, { s: 0 }, { s: 1, duration: 0.9, ease: "power2.inOut", onUpdate: () => App.stamps.forEach((s) => s.imgGroup.scale({ x: sc.s, y: sc.s })) }, "-=0.8");
    tl.add(() => { loop(); App.canIntro = true; App.canResize = true; }, "+=0.1");
  };

  const settle = () => {
    $("#sh-opening").classList.add("open");
    gsap.set(["#sh-intro-rect", "#sh-intro-contents"], { scale: 1 });
    gsap.set("#sh-opening .ball", { left: "50%" });
    App.stamps.forEach((s) => { s.group.position({ x: s.baseX, y: s.baseY }); s.imgGroup.scale({ x: 1, y: 1 }); });
    App.canIntro = true; App.canResize = true;
  };

  const intro = () => {
    App.canIntro = false;
    const rectEl = $("#sh-intro-rect-rect");
    const rx = { v: 155 };
    if (reduce) {
      $("#sh-intro").classList.add("done"); $("#sh-opening").classList.add("hide");
      $("#sh-btn-menu").classList.remove("passive"); gsap.set(["#sh-btn-menu", "#sh-menu"], { opacity: 1 });
      return;
    }
    const tl = gsap.timeline();
    tl.fromTo("#sh-intro-contents", { scale: 1 }, { scale: 0, duration: 0.4, ease: T.easeUI });
    tl.fromTo("#sh-intro-rect", { scale: 1, rotation: 20 }, { scale: 0.484, rotation: 0, duration: 0.433, ease: T.easeUIInOut }, "<");
    tl.fromTo(rx, { v: 155 }, { v: 24, duration: 0.433, ease: T.easeUIInOut, onUpdate: () => rectEl.setAttribute("rx", rx.v) }, "<");
    tl.add(() => {
      $("#sh-intro-nav").classList.remove("hide");
      gsap.set("#sh-intro-nav", { x: "-50%", y: "-50%" });
      gsap.set("#sh-intro-cir", { scale: 0 });
      gsap.set("#sh-intro-txt", { opacity: 0 });
      gsap.set("#sh-intro-icon", { x: "76%", y: 0, opacity: 0 });
      gsap.set("#sh-intro-icon-mark", { opacity: 0 });
    }, "<");
    tl.fromTo("#sh-intro-cir", { scale: 0 }, { scale: 1, duration: 0.6, ease: "elastic.out(1,0.75)" });
    tl.fromTo("#sh-intro-icon", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "none" });
    tl.fromTo("#sh-intro-txt", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "none" }, "<");
    tl.fromTo("#sh-intro-icon", { x: "76%" }, { x: "0%", duration: 0.5, repeat: 2, yoyo: true, ease: "power1.out", yoyoEase: "power1.out" });
    tl.fromTo("#sh-intro-cir", { scale: 1 }, {
      scale: 1.2, delay: 0.2, duration: 0.4, repeat: 2, repeatDelay: 0.1, yoyo: true, ease: "power1.out", yoyoEase: "power1.in",
      onStart: () => gsap.timeline()
        .fromTo("#sh-intro-icon-mark", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" })
        .to("#sh-intro-icon-mark", { opacity: 0, duration: 0.2, ease: "power1.out" }),
    }, "<");
    tl.fromTo("#sh-intro-cir", { scale: 1.2 }, { scale: 1, duration: 0.2, ease: "power1.in" });
    tl.fromTo("#sh-intro-rect", { scale: 0.484 }, { scale: 0, duration: 0.5, ease: T.easeUIClose }, "+=1.2");
    tl.fromTo("#sh-intro-nav", { scale: 1, opacity: 1 }, { scale: 0, opacity: 0, duration: 0.5, ease: T.easeUIClose }, "<");
    tl.add(() => $("#sh-btn-menu").classList.remove("passive"));
    tl.fromTo("#sh-btn-menu", { opacity: 0 }, { opacity: 1, duration: T.ui, ease: T.easeUI }, "<");
    tl.fromTo("#sh-menu", { opacity: 0 }, { opacity: 1, duration: T.ui, ease: T.easeUI }, "<");
    tl.add(() => { $("#sh-opening").classList.add("hide"); $("#sh-intro").classList.add("done"); });
  };

  let touchY = 0, touching = false;
  addEventListener("wheel", (e) => { if (Math.abs(e.deltaY) >= 10 && App.canIntro) intro(); }, { passive: true });
  addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; touching = true; }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (!touching) return;
    if (Math.abs(touchY - e.touches[0].clientY) >= 10) { touching = false; if (App.canIntro) intro(); }
  }, { passive: true });
  addEventListener("touchend", () => (touching = false));

  /* ── Menu ── */
  let menuBusy = false;
  const openMenu = () => {
    menuBusy = true;
    const tl = gsap.timeline({ onComplete: () => (menuBusy = false) });
    tl.add(() => { $("#sh-menu").classList.add("open"); $("#sh-btn-menu").classList.add("open"); });
    tl.fromTo("#sh-menu .bg", { width: "5.2vw", height: "3.5vw" }, { width: "100%", height: "100%", duration: T.uiLong, ease: T.easeUIInOut, onComplete: () => $("#sh-menu .bg").classList.add("openend") }, "<");
    tl.fromTo("#sh-menu .menu_area", { opacity: 0, y: "3vw" }, { opacity: 1, y: "0%", duration: T.uiLong, ease: T.easeUI, stagger: 0.05 }, "-=0.4");
  };
  const closeMenu = () => {
    if (!$("#sh-menu").classList.contains("open")) return;
    menuBusy = true;
    const tl = gsap.timeline({ onComplete: () => (menuBusy = false) });
    tl.add(() => { $("#sh-menu .bg").classList.remove("openend"); $("#sh-btn-menu").classList.remove("open"); });
    tl.to("#sh-menu .menu_area", { opacity: 0, y: "3vw", duration: T.uiLong, ease: T.easeUI }, "<");
    tl.to("#sh-menu .bg", { width: "5.2vw", height: "3.5vw", duration: T.uiLong, ease: T.easeUIInOut }, "<");
    tl.add(() => $("#sh-menu").classList.remove("open"));
  };
  $("#sh-btn-menu").addEventListener("click", () => { if (menuBusy) return; $("#sh-menu").classList.contains("open") ? closeMenu() : openMenu(); });

  /* ── Rising Section ── */
  const floatSize = (round) => {
    if (round) return M.sp ? { width: "133vw", height: "133vw" } : { width: "47vw", height: "47vw" };
    return M.sp ? { width: "100vw", height: "100dvh" } : { width: "90vw", height: "calc(100vh - 5.8vw)" };
  };

  const resetScroll = (id) => {
    const el = $("#" + id); if (!el) return;
    $$(".content_scroll", el).forEach((c) => { scrollEl(c.id).scrollTop = 0; bars[c.id]?.recalculate(); });
  };
  // Center (·bottom·bottom and top) alignment only when the content is shorter than the board — if longer, scroll from the top
  const FIT = { content_scroll_center: "center", content_scroll_btm: "bottom", content_scroll_btm_top: "bottom_top" };
  const fitScroll = () => Object.entries(FIT).forEach(([k, cls]) => $$("." + k).forEach((c) => {
    const inner = $(".simplebar-content", c) || c.firstElementChild;
    c.classList.toggle(cls, inner.clientHeight < c.clientHeight);
  }));

  const openFloat = (target) => {
    closeMenu();
    if (target === "message_all") { toggleMessage("all", true); target = "message"; }
    if (target === "game") App.gameStart = true;
    if (target === "movie") $("#sh-movie-area").classList.remove("open");
    const page = $("#" + target);
    const tl = gsap.timeline();
    tl.add(() => {
      $("#sh-float-bg").classList.add("open");
      page.classList.remove("hide");
      page.classList.add("current");
      gsap.set(`#${target} .content`, { scale: 1 });
      fitScroll();
      resetScroll(target);
      ScrollTrigger.refresh();
    });
    tl.fromTo(page, { opacity: 0 }, { opacity: 1, duration: T.ui, ease: "none" });
    tl.add(() => (App.flags.anim = false), "+=1");
  };

  const openFromMenu = (target) => {
    const round = target === "game" || target === "win";
    $("#sh-float-rect").classList.toggle("circle", round);
    const size = floatSize(round);
    const tl = gsap.timeline();
    tl.add(() => { $("#sh-float-rect").classList.remove("hide"); gsap.set("#sh-float-rect", { width: 0, height: 0, opacity: 1 }); });
    tl.fromTo("#sh-float-rect", { width: 0, height: 0 }, { width: size.width, height: size.height, duration: 0.5, ease: T.easeUIInOut });
    tl.add(() => openFloat(target), "-=0.3");
  };

  const closeFloat = () => {
    if (App.flags.anim) return;
    const page = $(".sh-page.current");
    if (!page) return;
    App.flags.anim = true;
    const tl = gsap.timeline();
    tl.add(() => $("#sh-float-bg").classList.remove("open"));
    tl.fromTo(page, { opacity: 1 }, { opacity: 0, duration: T.ui, ease: T.easeUIClose });
    tl.fromTo(`#${page.id} .content`, { scale: 1 }, { scale: 0, duration: T.ui, ease: T.easeUIClose }, "<");
    tl.to("#sh-float-rect", { width: 0, height: 0, duration: 0.6, ease: T.easeUIClose }, "<");
    tl.add(() => {
      page.classList.add("hide"); page.classList.remove("current");
      $("#sh-float-rect").classList.add("hide"); gsap.set("#sh-float-rect", { opacity: 0 });
      App.flags.anim = false; App.flags.open = false;
    }, "+=0.1");
  };

  // Pressing a stamp: a clone of that stamp flies to the center while a white panel (rounded rectangle, circle for games) grows from 0 to panel size → then it is swapped for an HTML panel of the same size
  const clickStamp = (st) => {
    App.flags.anim = true; App.flags.open = true;
    const cat = st.d.cat;
    const target = cat === "mov" ? "movie" : cat === "history" ? "history" : cat === "celebration" ? "celebration_card" : cat === "name" ? "anniversary"
      : cat === "game" ? "game" : cat === "syukuji" ? "message" : App.gameStart ? "win" : "game";
    if (cat === "syukuji") toggleMessage(st.d.id, true);
    const round = target === "game" || target === "win";
    $("#sh-float-rect").classList.toggle("circle", round);

    const S = M.stamp;
    const clone = st.group.clone();
    st.group.scale({ x: 0, y: 0 });
    layer.add(clone);
    const kids = clone.getChildren()[1].getChildren()[0].getChildren();
    kids[0].visible(false);
    const backC = kids[1];
    let shape;
    if (round) {
      const D = (M.sp ? 1.33 : 0.47) * M.w;
      shape = new Konva.Circle({ x: S / 2, y: S / 2, radius: D / 2, fill: C.white, scale: { x: 0, y: 0 } });
    } else {
      const fw = M.sp ? M.w : 0.9 * M.w, fh = M.sp ? M.h : M.h - 0.058 * M.w;
      shape = new Konva.Rect({ x: S / 2, y: S / 2, width: fw, height: fh, offset: { x: fw / 2, y: fh / 2 }, cornerRadius: M.sp ? 0.0615 * M.w : 0.0228 * M.w, fill: C.white, scale: { x: 0, y: 0 } });
    }
    clone.add(shape);
    shape.moveToBottom();
    const o = { x: clone.x(), y: clone.y(), k: 1, f: 1 };
    const size = floatSize(round);
    const tl = gsap.timeline();
    tl.fromTo(o, { f: 1 }, { f: 0, duration: 0.1, ease: "power2.out", onUpdate: () => backC.opacity(o.f) });
    tl.to(o, { x: M.cx, y: M.cy, duration: 0.5, ease: "power2.out", onUpdate: () => clone.position({ x: o.x, y: o.y }) }, "<");
    tl.fromTo(o, { k: 1 }, { k: 0, duration: 0.5, ease: "power2.out", onUpdate: () => shape.scale({ x: 1 - o.k, y: 1 - o.k }) }, "<");
    tl.add(() => {
      $("#sh-float-rect").classList.remove("hide");
      gsap.set("#sh-float-rect", { opacity: 1, width: size.width, height: size.height });
      clone.destroy();
      const back = { s: 0 };
      gsap.fromTo(back, { s: 0 }, { s: 1, duration: 0.6, ease: "power3.out", onUpdate: () => st.group.scale({ x: back.s, y: back.s }) });
    });
    $("#sh-float-bg").classList.remove("hide");
    gsap.delayedCall(0.3, () => openFloat(target));
  };

  $$(".btn_anc").forEach((b) => b.addEventListener("click", () => {
    if (App.flags.anim) return;
    App.flags.anim = true; App.flags.open = true;
    openFromMenu(b.dataset.target);
  }));
  $$(".btn_floatclose").forEach((b) => b.addEventListener("click", closeFloat));

  /* Congratulatory speech: list ↔ detail */
  let msgBusy = false, current = 1;
  const setMessage = (id) => {
    current = id;
    $("#sh-msg-seal").innerHTML = sealSVG(NAMES[id - 1]);
    $("#sh-msg-name").textContent = `${NAMES[id - 1]} Name`;
    $$(".btn_nav_msg").forEach((b) => b.classList.toggle("passive", (b.dataset.nav === "prev" && id === 1) || (b.dataset.nav === "next" && id === NAMES.length)));
    fitScroll();
    resetScroll("message");
  };
  const toggleMessage = (to, instant) => {
    if (msgBusy) return;
    const showAll = to === "all";
    const from = showAll ? "#scroll_message2" : "#scroll_message1";
    const into = showAll ? "#scroll_message1" : "#scroll_message2";
    $$(".btn_nav_msg, .btn_nav_all").forEach((b) => b.classList.toggle("passive_view", showAll));
    if (instant) {
      $(from).classList.add("hide"); $(into).classList.remove("hide");
      $(from).classList.remove("active"); $(into).classList.add("active");
      gsap.set(into, { opacity: 1 });
      if (!showAll) setMessage(+to);
      return;
    }
    msgBusy = true;
    const tl = gsap.timeline();
    tl.fromTo(from, { opacity: 1 }, { opacity: 0, duration: T.ui, ease: "none" });
    tl.add(() => { $(from).classList.add("hide"); $(into).classList.remove("hide"); gsap.set(into, { opacity: 0 }); if (!showAll) setMessage(+to); });
    tl.fromTo(into, { opacity: 0 }, { opacity: 1, duration: T.ui, overwrite: true, ease: "none" });
    tl.add(() => { $(from).classList.remove("active"); $(into).classList.add("active"); msgBusy = false; }, "+=0.1");
  };
  $("#sh-messages").addEventListener("click", (e) => { const b = e.target.closest(".btn_message"); if (b) toggleMessage(b.dataset.target); });
  $$(".btn_nav_msg").forEach((b) => b.addEventListener("click", () => {
    const next = current + (b.dataset.nav === "next" ? 1 : -1);
    if (next < 1 || next > NAMES.length) return;
    gsap.fromTo("#scroll_message2 .message_set", { opacity: 0 }, { opacity: 1, duration: T.ui, ease: "none" });
    setMessage(next);
  }));
  $(".btn_nav_all").addEventListener("click", () => toggleMessage("all"));

  /* Video Play Slot */
  $("#sh-btn-movie").addEventListener("click", () => $("#sh-movie-area").classList.add("open"));

  /* History and commemorative goods: the right list and the panel are linked by scroll (1s power4.out) */
  const scrollPage = (scroller, id) => gsap.to(scroller, { duration: 1, ease: "power4.out", scrollTo: { y: "#" + id, autoKill: false } });
  const moveDot = (dot, btn) => gsap.to(dot, { y: btn.parentElement.offsetTop, duration: T.ui, ease: T.easeUI });

  const wireIndex = (cfg) => {
    const scroller = scrollEl(cfg.scrollId);
    const btns = $$(cfg.btns);
    const areas = btns.map((b) => $("#" + cfg.prefix + b.dataset.target));
    const setActive = (i) => {
      btns.forEach((b, j) => b.classList.toggle("active", i === j));
      moveDot($(cfg.dot), btns[i]);
      $$(cfg.nav).forEach((b) => b.classList.toggle("passive", (b.dataset.nav === "prev" && i === 0) || (b.dataset.nav === "next" && i === btns.length - 1)));
    };
    btns.forEach((b, i) => b.addEventListener("click", () => scrollPage(scroller, areas[i].id)));
    $$(cfg.nav).forEach((b) => b.addEventListener("click", () => {
      const i = btns.findIndex((x) => x.classList.contains("active"));
      const j = i + (b.dataset.nav === "next" ? 1 : -1);
      if (areas[j]) scrollPage(scroller, areas[j].id);
    }));
    areas.forEach((a, i) => {
      ScrollTrigger.create({ trigger: a, scroller, start: "top 50%", end: "top 51%", onEnter: () => setActive(i), onLeaveBack: () => i && setActive(i - 1) });
      ScrollTrigger.create({ trigger: a, scroller, start: "top 60%", end: "top 61%", onEnter: () => a.classList.add("open") });
    });
    setActive(0);
  };
  wireIndex({ scrollId: "scroll_history", btns: ".btn_history", prefix: "year_", dot: ".cir_year", nav: ".btn_nav_year" });
  wireIndex({ scrollId: "scroll_anniversary", btns: ".btn_anniversary", prefix: "anniversary_", dot: ".cir_anniversary", nav: ".btn_nav_anniversary" });

  /* ── Start ── */
  build();
  if (reduce) settle(); else opening();

  let rt;
  addEventListener("resize", () => {
    if (!App.canResize) return;
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (innerWidth === M.w && Math.abs(innerHeight - M.h) < 120) return;
      build();
      layer.y(0);
      App.stamps.forEach((s) => s.imgGroup.scale({ x: 1, y: 1 }));
      if (!reduce) loop();
    }, 200);
  });
})();
