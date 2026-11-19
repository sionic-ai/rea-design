// First page — after the temple pin (1000px), one stage is pinned for 29560px and a single timeline winds through head → hourglass → fall → clap → eclipse scenes.
// Original numbers: head share 3000px, the hourglass timeline starts at 80% of the head share, and a 39.45s timeline is spread over the remaining ~26800px.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = matchMedia("(min-width: 1020px)").matches;
  const mid = matchMedia("(min-width: 768px)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const span = (t, a, b) => clamp((t - a) / Math.max(1e-6, b - a));
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  // Turns skin variables (including oklch(from …)) into rgb that GSAP can blend — paint one point and read it back
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (name) => {
    const tmp = document.createElement("i");
    tmp.style.color = `var(${name})`;
    document.body.append(tmp);
    const c = getComputedStyle(tmp).color;
    tmp.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const SVG = "http://www.w3.org/2000/svg";

  const header = $(".d-header");
  const logo = $(".d-logo");

  // Word splitting — each word goes inside a mask (.d-mask). Spaces and line breaks are left as they are
  function words(el) {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) return frag.append(w);
            const mask = document.createElement("span");
            mask.className = "d-mask";
            const inner = document.createElement("span");
            inner.textContent = w;
            mask.append(inner);
            frag.append(mask);
            out.push(inner);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return out;
  }
  // Same text overpainted, filling up from the bottom with the scene color
  function fills(list, color) {
    return list.map((w) => {
      w.style.position = "relative";
      const f = document.createElement("span");
      f.className = "d-fill";
      f.textContent = w.textContent;
      f.style.color = color;
      w.append(f);
      return f;
    });
  }
  const RISE_FROM = { yPercent: 120, rotation: 10, autoAlpha: 0, transformOrigin: "50% 100%" };
  const RISE_TO = { yPercent: 0, rotation: 0, autoAlpha: 1 };

  /* ── 1. Staff ─────────────────────────────────────────── */
  const cult = $(".d-temple__cult");
  const star = $(".d-temple__star");
  const CX = 800, CY = 690, RX = 380, RY = 82;
  // Floor pentagram — a flat star, like a circle seen obliquely from above
  {
    let d = "";
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
      d += (i ? "L" : "M") + (CX + 360 * Math.cos(a)).toFixed(1) + "," + (CY + 76 * Math.sin(a)).toFixed(1);
    }
    star.setAttribute("d", d + "Z");
  }
  const robes = Array.from({ length: 10 }, (_, i) => {
    const g = document.createElementNS(SVG, "g");
    g.innerHTML = '<path class="robe" d="M0 -150 C-16 -150 -26 -136 -26 -118 C-26 -104 -22 -96 -18 -92 L-40 0 H40 L18 -92 C22 -96 26 -104 26 -118 C26 -136 16 -150 0 -150Z"/><path class="flame" d="M58 -30 C52 -38 56 -46 60 -52 C64 -46 68 -38 62 -30Z"/>';
    cult.append(g);
    return { g, base: (i / 10) * Math.PI * 2 };
  });
  const flames = robes.map((r) => r.g.querySelector(".flame"));
  const placeCult = (turn) => {
    robes.forEach(({ g, base }) => {
      const a = base + turn;
      const x = CX + RX * Math.cos(a), y = CY + RY * Math.sin(a);
      const depth = (Math.sin(a) + 1) / 2;
      g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(0.36 + depth * 0.26).toFixed(3)})`);
      g.style.opacity = (0.45 + depth * 0.55).toFixed(2);
    });
    // Re-insert in depth order so people standing in front cover those behind
    robes.slice().sort((p, q) => Math.sin(p.base + turn) - Math.sin(q.base + turn)).forEach(({ g }) => cult.append(g));
  };
  placeCult(0);
  if (!reduce) gsap.to(flames, { scaleY: 1.25, transformOrigin: "50% 100%", duration: 0.12, repeat: -1, yoyo: true, ease: "none", stagger: { each: 0.05, from: "random" } });

  /* ── 2. Head ─────────────────────────────────────────── */
  const headsScene = $(".d-heads");
  const headsBox = $(".d-heads__box");
  const headsArt = $(".d-heads__art");
  const tint = $("#d-red-tint-matrix");
  const PLUS = {
    large: [[3, 8], [18, 55], [7, 78], [82, 12], [91, 62], [76, 82], [35, 5], [62, 88], [48, 70], [25, 35], [72, 42], [55, 20]],
    small: [[11, 22], [28, 68], [5, 90], [88, 30], [95, 75], [70, 5], [42, 15], [58, 50], [38, 92], [20, 48], [80, 55], [64, 30]],
  };
  const plusLarge = $(".d-plus--large"), plusSmall = $(".d-plus--small");
  const plusItems = [];
  [[plusLarge, PLUS.large, 90], [plusSmall, PLUS.small, 160]].forEach(([layer, pts, spin]) => pts.forEach(([l, t], i) => {
    const el = document.createElement("i");
    el.style.cssText = `left:${l}%;top:${t}%`;
    el.dataset.spin = String((i % 2 ? -1 : 1) * spin);
    layer.append(el);
    plusItems.push(el);
  }));
  // Matryoshka — splits the three covering faces in half and spreads them left and right
  const art = headsArt;
  const defs = document.createElementNS(SVG, "defs");
  defs.innerHTML = '<clipPath id="d-half-l"><rect x="-1000" y="0" width="1500" height="800"/></clipPath><clipPath id="d-half-r"><rect x="500" y="0" width="1500" height="800"/></clipPath>';
  art.prepend(defs);
  const skull = $(".d-heads__skull", art);
  art.insertBefore(skull, $(".d-heads__layer", art));
  const halves = $$(".d-heads__layer", art).map((g) => {
    const r = g.cloneNode(true);
    g.setAttribute("clip-path", "url(#d-half-l)");
    r.setAttribute("clip-path", "url(#d-half-r)");
    g.after(r);
    return { l: g, r, n: Number(g.dataset.split) };
  });
  const SPLIT = { 1: 330, 2: 240, 3: 150 };
  const split = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
  halves.sort((a, b) => a.n - b.n).forEach(({ l, r, n }, i) => {
    split.to(l, { x: -SPLIT[n], duration: 0.5 }, i * 0.25).to(r, { x: SPLIT[n], duration: 0.5 }, i * 0.25);
  });
  split.to(".d-heads__chev--up", { y: -70, duration: 1 }, 0).to(".d-heads__chev--down", { y: 70, duration: 1 }, 0);

  const headTexts = $$(".d-heads__text .d-nh");
  const headWords = reduce ? [] : headTexts.map(words);
  const top1 = headWords[0] || [], bottom1 = headWords[headWords.length - 1] || [];
  if (!reduce) gsap.set(headWords.flat(), RISE_FROM);
  const wordsIn = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  if (top1.length) wordsIn.to(top1, { ...RISE_TO, duration: 0.25, stagger: 0.05 }, 0).to({}, { duration: 0.05 });
  const wordsBottom = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  if (bottom1.length) wordsBottom.to(bottom1, { ...RISE_TO, duration: 0.25, stagger: 0.08 }, 0);
  const blood = gsap.timeline({ paused: true });
  const bloodFills = fills(headWords.flat(), "var(--site-red)");
  if (bloodFills.length) blood.to(bloodFills, { clipPath: "inset(0 0 0% 0)", duration: 1, stagger: 0.05, ease: "power3.in" });
  const wordsOut = gsap.timeline({ paused: true });
  const masks = headWords.flat().map((w) => w.parentNode);
  if (masks.length) wordsOut.to(masks, { opacity: 0, duration: 0.4, stagger: 0.015, ease: "power2.in" });

  /* ── 3. Hourglass ─────────────────────────────────────── */
  const glassScene = $(".d-glass");
  const centre = $(".d-glass__centre");
  const ringsHost = $(".d-glass__rings");
  const GLASS = '<svg viewBox="0 0 28.56 42.48"><path d="M3 2h22.5M3 40.5h22.5M5 2c0 10 9.3 13 9.3 19.2S5 30.5 5 40.5M23.5 2c0 10-9.3 13-9.3 19.2s9.3 9.3 9.3 19.3"/></svg>';
  const radii = [160, 320, 480, 640].map((r) => r * (mid ? 1 : 0.4));
  const ringSpin = [];
  const rings = radii.map((r, k) => {
    const ring = document.createElement("div");
    ring.className = "d-ring";
    const n = Math.max(4, Math.round((r / 100) * 3));
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i;
      const it = document.createElement("i");
      it.innerHTML = GLASS;
      ring.append(it);
      gsap.set(it, { x: Math.cos((a * Math.PI) / 180) * r, y: Math.sin((a * Math.PI) / 180) * r, xPercent: -50, yPercent: -50, rotation: a + 90 });
    }
    ringsHost.append(ring);
    // Opposite direction for each ring, one turn per 42·58·74·90s
    if (!reduce) ringSpin.push(gsap.to(ring, { rotation: `+=${360 * [-1, 1, -1, 1][k]}`, duration: [42, 58, 74, 90][k], ease: "none", repeat: -1 }));
    return ring;
  });

  const glassTexts = $$(".d-glass__text .d-nh");
  const glassWords = reduce ? [] : glassTexts.map(words);
  if (!reduce) gsap.set(glassWords.flat(), RISE_FROM);

  /* ── 4. Fall ─────────────────────────────────────────── */
  const fall = $(".d-fall");
  const white = $(".d-fall__white");
  const rain = $(".d-fall__rain");
  const lines = $(".d-fall__lines");
  const eye = $(".d-fall__eye");
  const body = $(".d-fall__body");
  const fallWords = reduce ? [] : words($(".d-fall__text .d-nh"));
  if (!reduce) gsap.set(fallWords, RISE_FROM);

  // 0·1 binary rain — 12px cells on a layer at 60% of screen resolution, flows 14 rows per second of the timeline
  const rc = rain.getContext("2d");
  const rainBg = rgbOf("--kf-contrast-bg"), rainInk = rgbOf("--kf-contrast-ink");
  let cols = [], rows = 0, rainBudget = 0, rainLast = null;
  const sizeRain = () => {
    rain.width = Math.max(1, Math.round(innerWidth * 0.6));
    rain.height = Math.max(1, Math.round(innerHeight * 0.6));
    rows = Math.ceil(rain.height / 12);
    cols = Array.from({ length: Math.ceil(rain.width / 12) }, () => Math.floor(Math.random() * rows));
  };
  sizeRain();
  const rainStep = () => {
    rc.globalAlpha = 0.1;
    rc.fillStyle = rainBg;
    rc.fillRect(0, 0, rain.width, rain.height);
    rc.globalAlpha = 1;
    rc.fillStyle = rainInk;
    rc.font = `12px ${css("--kf-font-mono") || "monospace"}`;
    for (let i = 0; i < cols.length; i++) {
      rc.fillText(Math.random() < 0.5 ? "0" : "1", 12 * i, 12 * cols[i]);
      cols[i]--;
      if (cols[i] <= 0 && Math.random() > 0.95) cols[i] = rows;
    }
  };
  const rainAt = (t) => {
    if (rainLast === null) { rainLast = t; rainStep(); return; }
    rainBudget += 14 * Math.abs(t - rainLast);
    rainLast = t;
    const n = Math.min(3, Math.floor(rainBudget));
    rainBudget -= Math.floor(rainBudget);
    for (let i = 0; i < n; i++) rainStep();
  };

  // 22 speed lines — length 36~230px, thickness .75~2.4, fading in and out slightly
  const lc = lines.getContext("2d");
  let LW = 0, LH = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const streak = (s, anywhere) => Object.assign(s, {
    x: rnd(0, LW || 1), len: rnd(36, 230), y: anywhere ? rnd(-0.2 * LH, 1.15 * LH) : rnd(LH, 1.45 * LH),
    w: rnd(0.75, 2.4), speed: rnd(0.2, 0.8), life: 0, max: rnd(160, 1500), peak: rnd(0.1, 0.2),
  });
  const sizeLines = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    LW = innerWidth; LH = innerHeight;
    lines.width = Math.round(LW * dpr); lines.height = Math.round(LH * dpr);
    lc.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  sizeLines();
  const streaks = Array.from({ length: 22 }, () => streak({}, true));
  let lineLast = null;
  const linesAt = (t, on) => {
    lines.style.opacity = String(on);
    const dt = lineLast === null ? 0 : (t - lineLast) * 1000;
    lineLast = t;
    lc.clearRect(0, 0, LW, LH);
    if (on <= 0) return;
    lc.strokeStyle = rainInk;
    lc.lineCap = "round";
    const step = Math.abs(dt);
    streaks.forEach((s) => {
      s.y -= dt * s.speed;
      s.life += step;
      if (s.life >= s.max || s.y > 1.5 * LH || s.y + s.len < -0.3 * LH) return streak(s, Math.random() < 0.15);
      const a = Math.sin(Math.PI * (s.life / s.max)) * s.peak;
      if (a <= 0.012) return;
      lc.globalAlpha = a; lc.lineWidth = s.w;
      lc.beginPath(); lc.moveTo(s.x, s.y); lc.lineTo(s.x, s.y + s.len); lc.stroke();
    });
    lc.globalAlpha = 1;
  };
  addEventListener("resize", () => { sizeRain(); sizeLines(); });

  /* ── 5. Clap ─────────────────────────────────────────── */
  const impact = $(".d-impact");
  const starsHost = $(".d-impact__stars");
  for (let i = 0; i < 95; i++) {
    const s = document.createElement("i");
    s.style.cssText = `left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;animation-delay:${(-Math.random() * 3).toFixed(2)}s;opacity:${rnd(0.35, 1).toFixed(2)}`;
    starsHost.append(s);
  }
  const impactWords = reduce ? [] : words($(".d-impact__text .d-nh"));
  if (!reduce) gsap.set(impactWords, RISE_FROM);

  /* ── 7. Gathering ─────────────────────────────────────────── */
  const converge = $(".d-converge");
  const ringSvg = $(".d-eclipse__rings");
  const ripple = $(".d-eclipse__ripple path");
  const core = $(".d-eclipse__core");
  // Concentric rings — thinner and fainter toward the outside
  const eclipseRings = [];
  for (let i = 0; i < 14; i++) {
    const c = document.createElementNS(SVG, "circle");
    c.setAttribute("cx", "600"); c.setAttribute("cy", "600"); c.setAttribute("r", String(160 + i * 30));
    c.setAttribute("stroke-width", String(Math.max(0.6, 2.6 - i * 0.14)));
    c.setAttribute("stroke-dasharray", i % 3 === 0 ? "2 10" : i % 3 === 1 ? "40 8 4 8" : "none");
    c.style.opacity = String(Math.max(0.12, 0.9 - i * 0.06));
    ringSvg.append(c);
    eclipseRings.push(c);
  }
  // Wavy ring — radius 125 plus three sines, swelling up to 18 toward the cursor (within 400px)
  let px = null, py = null, aim = 0, near = 0, curA = 0, curN = 0, rippleRaf = 0, lastDraw = -Infinity;
  const POINTS = matchMedia("(pointer: coarse)").matches ? 90 : 150;
  const radius = (a, t) => 125 + Math.sin(t * 0.4) + 3 * Math.sin(9 * a + t * 0.6) + 2 * Math.sin(5 * a - t * 0.35) + 18 * curN * Math.pow(Math.max(0, Math.cos(a - curA)), 2);
  const drawRipple = (now) => {
    const t = now / 1000;
    if (px !== null) {
      const b = core.getBoundingClientRect();
      const dx = px - (b.left + b.width / 2), dy = py - (b.top + b.height / 2);
      aim = Math.atan2(dy, dx);
      near = Math.max(0, 1 - Math.hypot(dx, dy) / 400);
    } else near = 0;
    let da = (aim - curA) % (Math.PI * 2);
    if (da > Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    curA += 0.05 * da;
    curN += 0.05 * (near - curN);
    if (t - lastDraw >= 1 / 30 || POINTS === 150) {
      lastDraw = t;
      let d = "";
      for (let i = 0; i < POINTS; i++) {
        const a = (Math.PI * 2 * i) / POINTS, r = radius(a, t);
        d += (i ? "L" : "M") + (150 + r * Math.cos(a)).toFixed(2) + "," + (150 + r * Math.sin(a)).toFixed(2) + " ";
      }
      ripple.setAttribute("d", d + "Z");
    }
    rippleRaf = requestAnimationFrame(drawRipple);
  };
  drawRipple(0);
  cancelAnimationFrame(rippleRaf); rippleRaf = 0;
  addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
  const ringTweens = reduce ? [] : eclipseRings.map((c, i) => gsap.to(c, { rotation: i % 2 ? -360 : 360, duration: 30, ease: "none", repeat: -1, paused: true }));
  const convergeLive = (on) => {
    converge.classList.toggle("is-live", on);
    ringTweens.forEach((tw) => (on ? tw.play() : tw.pause()));
    if (on && !rippleRaf && !reduce) rippleRaf = requestAnimationFrame(drawRipple);
    if (!on && rippleRaf) { cancelAnimationFrame(rippleRaf); rippleRaf = 0; }
  };
  const convWords = reduce ? [] : words($(".d-converge__text h2"));
  const convCopy = $$(".d-converge__text > p, .d-cta");
  const wipe = $(".d-converge__wipe");

  if (reduce) {
    // With motion off, only the last scene (gathering) stands
    gsap.set([headsScene, glassScene, fall, impact], { autoAlpha: 0 });
    gsap.set(converge, { opacity: 1 });
    convergeLive(true);
    $(".d-stage").style.height = "auto";
    $(".d-stage").style.minHeight = "100vh";
    window.dReady.then(() => logo.classList.remove("logo-at-top"));
    return;
  }

  /* ── Stage timeline (seconds) ─────────────────────────────── */
  const T = {
    copyIn: 1.5, fillGreen: 3.6, copyOut: 4.2, burst: 4.65, falling: 11.15,
    fallText: 13.95, fallFill: 23.1, fallOut: 23.7, eyeIn: 19.95, eyeFull: 20.65,
    space: 26.65, brass: 27.85, impactText: 31.15, impactFill: 35.4, impactOut: 36.0, converge: 36.45, end: 39.45,
  };
  const tl = gsap.timeline({ paused: true });
  // Hourglass text — from 1.5s the words rise slanted, at 3.6s green fills up, then it drains at 4.2s
  let at = T.copyIn;
  glassWords.forEach((list, i) => {
    tl.to(list, { ...RISE_TO, duration: 0.25, stagger: 0.05, ease: "power3.out" }, at);
    at += 0.05 * (list.length - 1) + 0.25 + (i < glassWords.length - 1 ? 0.05 : 0);
  });
  const greenFills = fills(glassWords.flat(), "var(--site-green)");
  tl.to(greenFills, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "power3.in" }, T.fillGreen);
  tl.to([...glassWords.flat(), ...greenFills], { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, T.copyOut);
  // The center hourglass switches off over 1s starting at 4.65s, and the ring icon fades to gray 1s before that
  gsap.set(centre, { filter: "brightness(100%) blur(0px)" });
  gsap.set(rings, { filter: "grayscale(0%) brightness(100%)" });
  tl.to(centre, { filter: "brightness(0%) blur(0px)", duration: 1, ease: "power1.in" }, T.burst);
  tl.to(rings, { filter: "grayscale(100%) brightness(0%)", duration: 1, ease: "power1.in" }, T.burst - 1);
  tl.to(centre, { scale: 1.25, duration: 3, ease: "power1.in" }, T.burst);
  // The white world opens as a center circle (5.15~10.15) and the falling person appears over 1 second from 6.15s
  tl.to(body, { opacity: 1, duration: 1, ease: "power1.out" }, T.falling - 5);
  tl.to(centre, { opacity: 0, duration: 2, ease: "power1.in" }, T.falling - 4.4);
  tl.to(centre, { filter: "brightness(0%) blur(30px)", duration: 2, ease: "power1.in" }, T.falling - 4.4);
  // ‹One word› — rises at 13.95s, white fills in at 23.1s, then leaves at 23.7s
  tl.to(fallWords, { ...RISE_TO, duration: 0.25, ease: "power3.out" }, T.fallText);
  const whiteFills = fills(fallWords, "var(--kf-contrast-bg)");
  tl.to(whiteFills, { clipPath: "inset(0 0 0% 0)", duration: 0.6, stagger: 0.05, ease: "power3.in" }, T.fallFill);
  tl.to([...fallWords, ...whiteFills], { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, T.fallOut);
  // Eye — opens wrapping the person, and is sucked into the pupil when the starfield arrives
  tl.fromTo(eye, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: T.eyeFull - T.eyeIn, ease: "power2.out" }, T.eyeIn);
  tl.to(eye, { scale: 9, opacity: 0, duration: 1.5, ease: "power2.in" }, T.space - 1);
  tl.to(white, { opacity: 0, duration: 1.5, ease: "none" }, T.space);
  tl.to(impact, { opacity: 1, duration: 1.5, ease: "none" }, T.space);
  // Hand: rises from below to receive, and around 36s claps with a white flash
  tl.fromTo(".ih", { y: 700 }, { y: 0, duration: 3.5, ease: "power2.out" }, T.brass);
  tl.to(body, { y: () => innerHeight * 0.12, scale: 0.8, duration: 4, ease: "power1.inOut" }, T.brass + 1);
  tl.to(impactWords, { ...RISE_TO, duration: 0.25, ease: "power3.out" }, T.impactText);
  const brassFills = fills(impactWords, "var(--kf-bg)");
  tl.to(brassFills, { clipPath: "inset(0 0 0% 0)", duration: 0.6, stagger: 0.05, ease: "power3.in" }, T.impactFill);
  tl.to([...impactWords, ...brassFills], { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, T.impactOut);
  tl.to(".ih--l", { rotation: 14, svgOrigin: "365 700", duration: 0.35, ease: "power2.in" }, T.impactOut - 0.1);
  tl.to(".ih--r", { rotation: -14, svgOrigin: "635 700", duration: 0.35, ease: "power2.in" }, T.impactOut - 0.1);
  tl.to(body, { opacity: 0, duration: 0.2 }, T.impactOut + 0.15);
  tl.to(".d-impact__flash", { opacity: 1, duration: 0.15, ease: "power2.in" }, T.impactOut + 0.2);
  tl.to(".d-impact__flash", { opacity: 0, duration: 0.6, ease: "power2.out" }, T.converge);
  tl.to(impact, { opacity: 0, duration: 0.6, ease: "none" }, T.converge);
  // Contact — last 3s. A purple disc spins and spreads to 13x (.15 share), then the ring, title and button follow in turn
  tl.set(converge, { opacity: 1 }, T.converge);
  tl.fromTo(wipe, { scale: 0.333, rotation: 0, opacity: 1 }, { scale: 4000 / 300, rotation: 360, duration: 0.45, ease: "power2.in" }, T.converge);
  tl.to(wipe, { opacity: 0, duration: 0.5, ease: "power1.out" }, T.converge + 0.45);
  tl.fromTo(".d-eclipse", { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }, T.converge + 0.3);
  if (convWords.length) {
    gsap.set(convWords, RISE_FROM);
    tl.to(convWords, { ...RISE_TO, duration: 0.25, stagger: 0.05, ease: "power3.out" }, T.converge + 0.8);
  }
  tl.fromTo(convCopy, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.08 }, T.converge + 1.1);
  tl.to({}, { duration: 3 }, T.end - 3);

  // Time-bound things — binary rain, speed lines, logo and icon color, grain, body roll
  const grain = $(".d-grain");
  let lastTone = "";
  const tone = (t) => {
    let name = "";
    if (t >= T.converge) name = "purple";
    else if (t >= T.brass) name = "brass";
    else if (t >= T.burst + 0.5) name = "inverted";
    else if (t >= 0.8) name = "green";
    if (name === lastTone) return;
    lastTone = name;
    logo.classList.remove("is-green", "is-inverted", "is-brass", "is-purple");
    if (name) logo.classList.add(`is-${name}`);
    header.classList.toggle("has-dark-icons", name === "inverted");
    header.dataset.tone = name;
  };
  const byTime = (t, live, s = 0) => {
    const open = span(t, T.falling - 6, T.falling - 1);
    white.style.clipPath = rain.style.clipPath = `circle(${(75 * open).toFixed(2)}vmax at 50% 50%)`;
    rain.style.transform = `scale(${1 + 10 * open})`;
    rain.style.opacity = String(1 - span(t, T.falling - 2.75, T.falling - 1.75));
    if (open > 0 && t < T.falling - 1.75) rainAt(t); else rainLast = null;
    const lineOn = span(t, T.falling - 1.75, T.falling - 1.4) * (1 - span(t, T.space - 1, T.space));
    linesAt(t, lineOn);
    gsap.set(body, { rotation: t * 38, x: Math.sin(t * 0.9) * 40 });
    fall.classList.toggle("is-dark", t >= T.space + 0.75);
    const ring = span(t, T.falling - 7, T.falling - 2);
    ringSpin.forEach((tw) => tw.timeScale(1 + 3 * ring));
    gsap.set(rings, { scale: 1 + 7 * ring, opacity: Math.min(1, s / 0.2) * (1 - ring) });
    const g = t >= T.converge - 0.25 ? 0 : Math.min(s < 0.08 ? s / 0.08 : 1, (T.converge - 0.25 - t) / 0.5);
    grain.style.opacity = live ? String(0.2 * g) : "0";
    if (live) tone(t);
    convergeLive(live && t >= T.converge);
  };

  /* ── Stage pinning ───────────────────────────────────────── */
  const stage = $(".d-stage");
  const PIN = 3000 + 2750 + 1000 * 17.8 + 1000 * 6.01;
  const HEAD = 3000 / PIN, START = HEAD * 0.8;
  const FADE = Math.max(0, 0.85 - 500 / PIN / HEAD / 0.4), FADE_LEN = Math.max(1e-6, 1 - FADE);
  const tintOn = mid;
  const glassBlocks = $$(".d-glass__text");
  const headBlocks = [headsBox, ...$$(".d-heads__text")];

  const update = (p, live = true) => {
    const o = p < HEAD ? p / HEAD : 1;
    const s = p <= START ? 0 : Math.min(1, (p - START) / (1 - START));
    tl.progress(s);
    byTime(tl.time(), live, s);
    // Head — 0~.2 top text, .2~.4 split, .4~.5 bottom text, .5~.6 blood rises, .6~1 50x into the mouth
    wordsIn.progress(o < 0.2 ? o / 0.2 : 1);
    split.progress(span(o, 0.2, 0.4));
    wordsBottom.progress(span(o, 0.4, 0.5));
    blood.progress(span(o, 0.5, 0.6));
    const c = Math.max(0, (o - 0.6) / 0.4);
    gsap.set(headsArt, { scale: 1 + 49 * Math.pow(c, 4) });
    if (tintOn) {
      const f = Math.min(1, Math.pow(c / 0.62, 1.2)), b = c <= 0.62 ? 0 : Math.min(1, (c - 0.62) / 0.38);
      const r = 1 - f + f * (2.2 * (1 - b) + 0.45 * b), gg = 1 - f + f * (0.12 * (1 - b) + 1.5 * b), bb = 1 - f + f * (0.08 * (1 - b) + 0.45 * b);
      tint.setAttribute("values", `${r} 0 0 0 0  0 ${gg} 0 0 0  0 0 ${bb} 0 0  0 0 0 1 0`);
      headsArt.style.filter = c > 0 ? "url(#d-red-tint)" : "none";
    }
    wordsOut.progress(clamp((c - 0.1) / 0.2));
    gsap.set(headBlocks, { opacity: 1 - clamp((c - FADE) / FADE_LEN) });
    const plusA = c <= 0.45 ? 1 : c >= 0.55 ? 0 : 1 - (c - 0.45) / 0.1;
    gsap.set(plusLarge, { opacity: plusA, y: -220 * o });
    gsap.set(plusSmall, { opacity: plusA, y: -90 * o });
    plusItems.forEach((el) => gsap.set(el, { rotation: o * Number(el.dataset.spin), force3D: true }));
    if (p < HEAD) gsap.set(glassScene, { opacity: span(o, 0.8, 1) });
    else gsap.set(glassScene, { opacity: 1 });
    headsScene.style.visibility = c >= 1 ? "hidden" : "";
    glassBlocks.forEach((el) => (el.style.visibility = p >= START && tl.time() >= T.copyIn ? "visible" : "hidden"));
  };

  window.dReady.then(() => {
    // Temple — over 1000px the round stage turns one step (72°) and lights up: the title glows red, the X white, the star brass, and a single red line rises
    const wheel = { turn: 0 };
    gsap.set(".d-temple__ring ellipse, .d-temple__star", { filter: `drop-shadow(0 0 0px ${rgbOf("--site-red")})` });
    const light = gsap.timeline({ paused: true, defaults: { ease: "none" } })
      .to(wheel, { turn: (Math.PI * 2) / 5, duration: 2, onUpdate: () => placeCult(wheel.turn) }, 0)
      .to(".d-temple__title text", { fill: rgbOf("--site-red"), duration: 1.2 }, 0.2)
      .to(".d-temple__x", { stroke: rgbOf("--kf-ink"), duration: 1.2 }, 0.2)
      .to(".d-temple__ring ellipse, .d-temple__star", { stroke: rgbOf("--site-brass"), filter: `drop-shadow(0 0 8px ${rgbOf("--site-red")})`, duration: 1.4 }, 0.3)
      .to(".d-temple__cult .robe", { fill: rgbOf("--site-red"), duration: 1.2, stagger: 0.05 }, 0.4)
      .to(flames, { opacity: 1, duration: 0.6, stagger: 0.06 }, 0.5)
      .fromTo(".d-temple__tag", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, 1.2);
    ScrollTrigger.create({
      trigger: ".d-temple__pin", start: "top top", end: "+=1000", pin: true, pinSpacing: true, scrub: true,
      animation: light,
      onEnter: () => logo.classList.add("logo-at-top"), onEnterBack: () => logo.classList.add("logo-at-top"),
      onLeave: () => logo.classList.remove("logo-at-top"),
      onLeaveBack: () => setTimeout(() => logo.classList.add("logo-at-top"), 160),
    });
    const cue = $(".d-cue");
    cue.addEventListener("click", () => (window.dLenis ? window.dLenis.scrollTo(innerHeight, { duration: 1.2 }) : scrollTo({ top: innerHeight, behavior: "smooth" })));
    ScrollTrigger.create({ start: 40, end: "max", onToggle: (st) => cue.classList.toggle("is-hidden", st.isActive) });

    // While the stage rises from below, the header floats up from below 100% (wide screens)
    if (desk) {
      gsap.fromTo(headsBox, { y: "100%", opacity: 0 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "top top", scrub: true } });
    }
    ScrollTrigger.create({
      trigger: stage, start: "top top", end: `+=${PIN}`, pin: true, pinSpacing: true, anticipatePin: desk ? 1 : 0,
      scrub: desk ? 1.35 : 0.3, invalidateOnRefresh: true,
      onUpdate: (st) => update(st.progress),
      onLeaveBack: () => { update(0, false); header.classList.remove("has-dark-icons"); logo.classList.remove("is-green", "is-inverted", "is-brass", "is-purple"); lastTone = ""; },
      onLeave: () => { update(1, true); logo.classList.remove("is-green", "is-inverted", "is-brass"); logo.classList.add("is-purple"); },
    });
    update(0, false);
    ScrollTrigger.refresh();
  });
})();
