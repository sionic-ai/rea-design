// Background bullet curtain · front text strip · running character · flash (moved from _study/brand-clone). The original used PixiJS, but here pre-drawn text pieces are moved each frame on Canvas 2D.
// Line count, spacing, speed and period are values measured by running the original (design canvas 2880×2000, mobile 750×1334 covered to the screen).
(function () {
  // Text content is newly written, only the length distribution matches the original (13 short lines of 3~5 chars, 23 long lines of 29~116 chars, average about 42).
  // The longer the line, the longer it takes to exit the screen, so the length sets how long the rush lasts.
  const rep = (s, n) => [...s.repeat(Math.ceil(n / [...s].length))].slice(0, n).join("");
  const BACK = [
    rep("♡♥ KICHIJOJI ♡♥ ", 89), rep("SHIMOKITA☆彡·。·゜ NAKAMEGURO☆彡 ", 86), rep("City ", 79),
    rep("City CITY City ", 61), rep("🎧📼 tape lab 📼🎧　", 47), rep("🍋🍑🌵 SUNNY SODA BAR 🌵🍑🍋　", 37),
    rep("🍜🥟 midnight ramen 🥟🍜　", 55), rep("⚡️ VOLT 22 ⚡️　", 39),
    "🦀 Rust 🐹 Go 💧 Elixir λ Haskell 🌙 Lua ⚡ Zig 🎯 Dart 🐫 OCaml 🟣 Kotlin 🦊 Crystal 💎 Julia 🧮 Fortran 🧩 Prolog 🐚 Bash",
    "🎬 Houdini 🌀 Cinema 4D 🧩 Spline 🎞 Rive 🎨 Krita 🧊 Godot", "✏️ Procreate 🖌 Aseprite 🧵 Substance 🔷 Affinity 🟢 Penpot",
    "📦 Docker ☸️ Kubernetes 🔥 Firebase 🐘 Postgres 🍃 Redis ☁️ Fly",
    "Rust Go Elixir Haskell Lua Zig Dart OCaml Kotlin Crystal Julia", "Houdini Cinema4D Spline Rive Krita", "Procreate Aseprite Substance Affinity",
    "Docker Kubernetes Firebase Postgres Redis Fly",
    "🧡🌟🛹", "💚🌟🛹", "💜🌟🛹", "💛🌟🛹", "🩵🌟🛹", "🤍🌟🛹", "🩷🌟🛹", "🖤🌟🛹", "🧡🛼✨", "💙🛼✨", "💜🛼✨", "🌀🌀🌀🌀", "🫧🫧🫧🫧🫧",
    rep("♪♫·*:.。. .。.:*·", 88), rep("☆★ LET'S MAKE ☆★ ", 64), rep("▁▂▃▄▅▆▇█▇▆▅▄▃▂▁", 85),
    rep("~ Great work ~ ", 50), rep("Let’s make, let’s make, let’s make more ", 44), rep("Sleepy… but still fun! ", 60),
    rep("NEW!!! ", 29), rep("＼(＾o＾)／　", 65), rep("STAY WEIRD ✌️ ", 71), rep("8", 66),
  ];
  const FRONT = [
    "SWITCH YOUR FUTURE!!", "ENJOY MAKING THINGS", "Let’s make a new kind of play", "Another good day today", "MAKE IT MORE FUN.",
    "Let’s go see a new view", "ALL DAY ALL NIGHT", "Build, break, and build again", "BOOST THE WHOLE STUDIO", "What shall we make next?", "GOOD VIBES ONLY",
    "HELLO!", "Let’s try", "ZAP!!", "Good Morning", "BEEP BOOP", "Sleepy", "LOUD & PROUD", "Still more to go", "ONE MORE TIME",
    "Moving our hands", "MAKE NOISE", "Full of playfulness", "LET'S GO OUTSIDE", "Today’s spark", "DON'T STOP",
    "I want to go as far as I can", "KEEP IT WEIRD AND WONDERFUL", "Keep up a small experiment every day",
    "THE BEST IDEAS COME FROM PLAYING", "Make a place for makers", "SAY YES TO STRANGE IDEAS",
    "Night studio", "COFFEE FIRST", "Together rather than alone", "WHAT IF WE TRIED IT?", "Loose yet firm",
    "OPEN STUDIO EVERY FRIDAY NIGHT", "NEW TOYS, NEW RULES", "The story that begins here", "PLAY HARD, MAKE HARDER",
  ];
  const EMOJI = ["💖", "✨", "🔥", "⭐️", "🌈", "🎉", "💥", "🍀", "🎮", "💫", "🌸", "⚡️", "🛹", "🎧", "🍋", "🍑", "🌵", "🍜", "🥟", "🦀",
    "🐹", "🎬", "🌀", "🧩", "🎨", "🧊", "📦", "🔷", "🫧", "🪐", "🌙", "☀️", "🍩", "🧃", "🎈", "🎯", "🪩", "🛼", "🦄", "🐙",
    "🍄", "🌻", "🧸", "💌", "📼", "✌️", "🤘", "👾", "💎", "🧡💙", "💜💛", "🌟🌟", "🐸"];
  const FIXED = ["--site-mint", "--site-yellow", "--site-purple", "--kf-accent", "--kf-ink"].map(ZArt.color);
  const [G1, G2, G3] = ["--site-g1", "--site-g2", "--site-g3"].map(ZArt.color);
  const GRADS = [[G1, G2, G3, G1], [G2, G3, G1, G2], [G3, G1, G2, G3]];
  const BULLET = ZArt.color("--site-bullet"), EDGE = ZArt.color("--site-bullet-edge"), EDGE_FAINT = ZArt.color("color-mix(in srgb, var(--site-bullet-edge) 30%, transparent)");
  const INK = ZArt.color("--kf-ink"), PAPER = ZArt.color("--kf-surface");
  const FLASH = [["--site-g3", "--site-yellow"], ["--site-g2", "--site-g1"], ["--site-purple", "--kf-accent"]].map((p) => p.map(ZArt.color));
  const FONT = `500 {s}px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-sans").trim()}`;

  const r = (a, b) => a + Math.random() * (b - a);
  const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  let backIdx = 0, frontIdx = 0;
  const nextBack = () => { const i = backIdx++ % BACK.length; return { txt: BACK[i], id: i }; };
  const nextFront = () => { const i = frontIdx++ % FRONT.length; return { txt: FRONT[i], id: i }; };
  const nextEmoji = () => EMOJI[Math.floor(Math.random() * EMOJI.length)];

  const isSP = () => matchMedia("(max-width: 767px)").matches;

  // Draws one text piece on an offscreen canvas. Drawn at design-unit size × screen scale so enlarging causes no blur.
  function sprite(text, size, scale, fill, shadow) {
    const px = Math.max(4, size * scale);
    const cv = document.createElement("canvas");
    const g = cv.getContext("2d");
    g.font = FONT.replace("{s}", px);
    g.letterSpacing = `${-2.2 * scale}px`;
    const w = Math.ceil(g.measureText(text).width + 4 * scale + 4);
    const h = Math.ceil(px * 1.45);
    cv.width = w; cv.height = h;
    g.font = FONT.replace("{s}", px);
    g.letterSpacing = `${-2.2 * scale}px`;
    g.textBaseline = "top";
    if (shadow) { g.fillStyle = shadow; g.fillText(text, 2 * scale, px * 0.18 + 2 * scale); }
    if (Array.isArray(fill)) {
      const gr = g.createLinearGradient(0, 0, 400 * scale * (size / 44), 0);
      fill.forEach((c, i) => gr.addColorStop(i / 3, c));
      g.fillStyle = gr;
    } else g.fillStyle = fill;
    g.fillText(text, 0, px * 0.18);
    cv.dw = w / scale; // Design unit width
    return cv;
  }

  class Back {
    constructor(canvas) {
      this.cv = canvas;
      this.g = canvas.getContext("2d");
      this.items = { stat: [], grad: [], whiteBack: [], whiteFront: [], emoji: [] };
      this.limit = { grad: 1, white: 1 };
      this.active = false;
      this.paused = false;
      this.listeners = {};
    }
    on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
    emit(ev) { (this.listeners[ev] || []).forEach((f) => f()); }

    build() {
      const sp = isSP();
      this.W = sp ? 750 : 2880; this.H = sp ? 1334 : 2000;
      this.resize();
      const s = this.scale;
      const cfg = sp
        ? { mWhite: 300, mGrad: 240, yokoGrad: 12, prev: 20, stat: [[1, 2], [2, 3]], act: [[1.95, 3.45], [2.6, 4.6]], statSizes: [20.4, 25.6, 27, 30, 33], whiteSizes: [24, 28, 32, 36, 40], gradScale: [1, 1.2, 1.4, 1.5, 1.6], gradSize: 28 }
        : { mWhite: 200, mGrad: 130, yokoGrad: 15, prev: 23, stat: [[3, 5], [4, 6]], act: [[4.5, 7.5], [7.5, 12.5]], statSizes: [28, 32, 36, 39.6, 43.2], whiteSizes: [35, 40, 50, 55, 60], gradScale: [1, 1.2, 1.5, 1.8, 2], gradSize: 44 };
      this.cfg = cfg;
      const speed = (pair) => (Math.random() > 0.8 ? r(...pair[1]) : r(...pair[0]));
      const it = this.items;
      Object.keys(it).forEach((k) => (it[k] = []));

      const rowsW = Math.floor(this.H / cfg.mWhite);
      for (let a = 0; a < rowsW; a++) {
        let x = 0;
        for (let l = 0; l < 3; l++) {
          const t = nextBack();
          const size = cfg.statSizes[Math.floor(Math.random() * 5)];
          const sp1 = sprite(t.txt, size, s, BULLET, EDGE);
          it.stat.push({ sp: sp1, x, y: a * cfg.mWhite + (l / 3) * cfg.mWhite * 1.4, v: speed(cfg.stat) });
          x += sp1.dw * 1.75;
        }
      }
      const rowsG = Math.floor(this.H / cfg.mGrad);
      for (let a = 0; a < rowsG; a++) {
        let x = this.W + 10;
        for (let l = 0; l < cfg.yokoGrad; l++) {
          const t = nextBack();
          const m = cfg.gradScale[t.id % 5];
          const sp1 = sprite(t.txt, cfg.gradSize * m, s, GRADS[t.id % 3]);
          const em = nextEmoji();
          const item = { sp: sp1, x0: x, x, y: a * cfg.mGrad + (l / cfg.yokoGrad) * cfg.mGrad * 1.5, v: speed(cfg.act), on: false };
          if (em) item.em = sprite(em, cfg.gradSize * m, s, INK);
          item.wAll = sp1.dw + (item.em ? item.em.dw : 0);
          it.grad.push(item);
          x += l * cfg.prev;
        }
      }
      for (let a = 0; a < rowsG; a++) {
        let x = this.W + 10;
        for (let l = 0; l < cfg.yokoGrad; l++) {
          const t = nextBack();
          const size = cfg.whiteSizes[Math.floor(Math.random() * 5)];
          let v = r(0, 3);
          if (l < cfg.yokoGrad * 0.2) v = 3;
          const fill = v < 0.4 ? FIXED[Math.floor(v * 10) % 5] : BULLET;
          const sp1 = sprite(t.txt + nextEmoji(), size, s, fill, v < 0.4 ? EDGE_FAINT : EDGE);
          const item = { sp: sp1, x0: x, x, y: a * cfg.mGrad + (l / cfg.yokoGrad) * cfg.mGrad, v: speed(cfg.act), on: false, wAll: sp1.dw };
          (Math.random() < 0.7 ? it.whiteBack : it.whiteFront).push(item);
          x += l * cfg.prev;
        }
      }
      this.allActive = [...it.grad, ...it.whiteBack, ...it.whiteFront];
    }

    resize() {
      const vw = innerWidth, vh = innerHeight;
      this.cv.width = vw; this.cv.height = vh;
      this.scale = Math.max(vw / this.W, vh / this.H);
    }

    // Like the original, right after loading it starts the rush with 5.2 seconds (3.5 on mobile) already elapsed.
    startBurst(fromLoading) {
      if (this.paused) return;
      this.active = true;
      this.endCount = 0;
      this.near9 = false;
      const grads = shuffle([...this.items.grad]);
      const whites = shuffle([...this.items.whiteBack, ...this.items.whiteFront]);
      const lead = isSP() ? 3.5 : 5.2;
      grads.forEach((o, i) => { o.lim = i / grads.length; o.on = true; o.x = fromLoading ? o.x0 - o.v * 60 * lead : o.x0; });
      whites.forEach((o, i) => { o.lim = i / whites.length; o.on = true; o.x = fromLoading ? o.x0 - o.v * 60 * lead : o.x0; });
      gsap.killTweensOf(this.limit);
      if (fromLoading) { this.limit.grad = this.limit.white = 1; }
      else {
        gsap.fromTo(this.limit, { grad: 0 }, { delay: isSP() ? 3 : 6, duration: 8, ease: "linear", grad: 1 });
        gsap.fromTo(this.limit, { white: 0 }, { duration: 12, ease: "linear", white: 1 });
      }
      this.emit("start");
    }
    endBurst() {
      this.active = false;
      this.emit("stop");
      gsap.delayedCall(30, () => this.startBurst(false));
    }

    tick(dt) {
      const g = this.g, s = this.scale, it = this.items;
      g.clearRect(0, 0, this.cv.width, this.cv.height);
      for (const o of it.stat) {
        o.x -= o.v * dt;
        if (o.x < -o.sp.dw) o.x = this.W;
        g.drawImage(o.sp, o.x * s, o.y * s);
      }
      if (!this.active) return;
      const move = (o, lim) => {
        if (!o.on) return false;
        if (o.lim < lim) {
          o.x -= o.v * dt;
          if (o.x < -o.wAll) { o.on = false; this.endCount++; return false; }
        }
        return o.x < this.W;
      };
      for (const o of it.whiteBack) if (move(o, this.limit.white)) g.drawImage(o.sp, o.x * s, o.y * s);
      for (const o of it.grad) if (move(o, this.limit.grad)) { g.drawImage(o.sp, o.x * s, o.y * s); if (o.em) g.drawImage(o.em, (o.x + o.sp.dw) * s, o.y * s); }
      for (const o of it.whiteFront) if (move(o, this.limit.white)) g.drawImage(o.sp, o.x * s, o.y * s);
      const p = this.endCount / this.allActive.length;
      if (p >= 1) this.endBurst();
      else if (p >= 0.8 && !this.near9) { this.near9 = true; this.emit("near-end"); }
    }
  }

  // One front text strip: 11 gradient letters (8 on mobile) start from the same spot at different speeds.
  class Strip {
    constructor(canvas, back) { this.cv = canvas; this.g = canvas.getContext("2d"); this.back = back; this.items = []; this.on = false; }
    start() {
      const sp = isSP(), s = this.back.scale, W = this.back.W;
      const n = sp ? 8 : 11;
      this.cv.width = innerWidth;
      this.cv.height = this.cv.offsetHeight || 80;
      this.items = [];
      for (let i = 0; i < n; i++) {
        const t = nextFront();
        const m = (sp ? [1, 1.2, 1.4, 1.6, 1.8] : [1, 1.2, 1.5, 1.8, 2])[t.id % 5];
        const size = (sp ? 28 : 44) * m;
        const o = { sp: sprite(t.txt, size, s, GRADS[t.id % 3]), x: W + 10, y: r(0, 1) * (sp ? 40 : 64), v: sp ? r(3.9, 6.9) : r(12, 20) };
        const em = nextEmoji();
        if (em) o.em = sprite(em, size, s, INK);
        o.wAll = o.sp.dw + (o.em ? o.em.dw : 0);
        this.items.push(o);
      }
      this.on = true;
    }
    tick(dt) {
      if (!this.on) return;
      const g = this.g, s = this.back.scale;
      g.clearRect(0, 0, this.cv.width, this.cv.height);
      let alive = 0;
      for (const o of this.items) {
        if (o.x < -o.wAll) continue;
        o.x -= o.v * dt;
        alive++;
        g.drawImage(o.sp, o.x * s, o.y * s);
        if (o.em) g.drawImage(o.em, (o.x + o.sp.dw) * s, o.y * s);
      }
      if (!alive) { this.on = false; g.clearRect(0, 0, this.cv.width, this.cv.height); }
    }
  }

  // A 16-frame (24fps) flash bursting every 1~3 seconds during the rampage. The original is a bitmap sequence, here each frame is drawn directly.
  class Flash {
    constructor(canvas) { this.cv = canvas; this.g = canvas.getContext("2d"); this.list = []; }
    resize() { this.cv.width = innerWidth; this.cv.height = innerHeight; }
    play() {
      const sp = isSP(), vw = innerWidth, vh = innerHeight;
      const k = Math.min(vw / 1440, 1) * (sp ? 0.6 : 1);
      this.list.push({
        x: (sp ? r(-0.5, 0) : r(-0.5, 0.35)) * vw + 375 * k, y: (sp ? r(-0.1, 0.5) : r(-0.4, 0.1)) * vh + 448 * k,
        rot: r(-Math.PI * 2, Math.PI * 2), sc: (sp ? r(0.45, 0.8) : r(0.35, 1.1)) * k, t: 0, hue: Math.floor(r(0, 3)),
      });
    }
    tick(dtSec) {
      const g = this.g;
      g.clearRect(0, 0, this.cv.width, this.cv.height);
      this.list = this.list.filter((f) => (f.t += dtSec) < 16 / 24);
      for (const f of this.list) {
        const frame = Math.floor(f.t * 24), p = frame / 15;
        g.save();
        g.translate(f.x, f.y); g.rotate(f.rot); g.scale(f.sc, f.sc);
        const cols = FLASH[f.hue];
        g.globalAlpha = 1 - p * 0.85;
        const R = 120 + p * 300;
        g.lineWidth = 26 * (1 - p) + 4;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + p * 0.6;
          g.strokeStyle = cols[i % 2];
          g.beginPath();
          g.moveTo(Math.cos(a) * R * 0.35, Math.sin(a) * R * 0.35);
          g.lineTo(Math.cos(a) * R, Math.sin(a) * R);
          g.stroke();
        }
        g.fillStyle = PAPER;
        g.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2, rr = i % 2 ? 40 * (1 - p) : 150 * (1 - p * 0.7);
          g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.fill();
        g.restore();
      }
    }
  }

  // Four characters run across the screen. After the stampede starts, set off 8 seconds later (4 seconds right after loading).
  function runners(fromLoading) {
    const els = shuffle([...document.querySelectorAll(".z-runner")]);
    const sp = isSP();
    const tops = shuffle(sp ? [0.05, 0.25, 0.45, 0.6] : [0.1, 0.3, 0.5, 0.7]);
    gsap.delayedCall(fromLoading ? 4 : 8, () => {
      els.forEach((el, n) => {
        el.classList.remove("is-run");
        el.style.top = `${tops[n] * 100}vh`;
        gsap.delayedCall(sp ? 1.5 * n + r(0, 1) : 2 * n + r(0, 1), () => {
          el.style.animationDuration = `${sp ? r(2, 3.25) : r(3, 5)}s`;
          void el.offsetWidth;
          el.classList.add("is-run");
        });
      });
    });
  }

  async function init() {
    const backCv = document.querySelector(".z-back");
    const back = new Back(backCv);
    const strips = [...document.querySelectorAll(".z-front canvas")].map((c) => new Strip(c, back));
    const flash = new Flash(document.querySelector(".z-fx"));
    const stripTop = [0.127, 0.322, 0.78];
    const t0 = Date.now();
    while (Date.now() - t0 < 1000 && !document.fonts.check('500 30px "Noto Sans KR"', "GaA")) {
      await new Promise((res) => setTimeout(res, 50));
    }
    await document.fonts.load('500 30px "Noto Sans KR"', "GaA");
    back.build();
    flash.resize();

    let fxTimer = null;
    const fxLoop = (first) => {
      fxTimer && fxTimer.kill();
      fxTimer = gsap.delayedCall(first ? 0 : r(1, back.near9 ? 1.6 : 3), () => {
        if (!back.active) return;
        if (!document.body.classList.contains("is-bottom") && !document.body.classList.contains("is-covered")) flash.play();
        fxLoop(false);
      });
    };
    back.on("start", () => {
      strips.forEach((st, i) => { st.cv.style.transform = `translate3d(0, ${stripTop[i] * innerHeight}px, 0)`; st.start(); });
      // If continuing from the previous page (no site navigation), the flash comes on the next beat (1~3s later) as if uninterrupted
      fxLoop(!back.continuing);
      runners(back.fromLoading);
    });

    let last = performance.now();
    gsap.ticker.add(() => {
      const now = performance.now();
      const dt = Math.min(2, (now - last) / (1000 / 60));
      last = now;
      if (back.paused) return;
      back.tick(dt);
      strips.forEach((s) => s.tick(dt));
      flash.tick(dt / 60);
    });

    let rt;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { const was = back.active; back.build(); flash.resize(); if (was) back.startBurst(true); }, 200);
    });

    requestAnimationFrame(() => backCv.classList.add("is-ready"));
    window.ZBack = back;
    back.burstFromLoading = () => { back.fromLoading = true; back.startBurst(true); back.fromLoading = false; };
    back.continueBurst = () => { back.continuing = true; back.startBurst(true); back.continuing = false; };
    document.dispatchEvent(new CustomEvent("zback:ready"));
  }

  window.ZBackInit = init;
})();
