// About page: city parallax pinned hero (2.4 screens, scrub .35) · staggered 3D grid + text band · spread-out words and video window · tab photo pin (200%).
// Original values (new-about.js): layer parallax sky .04 · particles .10 · far clouds .22 · skyline .30 · near clouds .5 · city 1 · world 1.06x (.47~1) · clouds 1.08x (0~.8)
// · Camera path hermite knots [0,.19,.49,.565,.64,1] · shooting star .074~.266 · text lines .76~.9/.81~.95/.87~1 112% → 0 · in the last 10% the panel accelerates upward
// · grid enters z300 · X 70° · Z ±5° · x ±40% · skew ±20° · y 100% (sine) → exits X −50° (sine.in), blur 7px · brightness 0 · contrast 400% · text band 100vw → −102%.
(() => {
  const { reduced } = T7;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const small = matchMedia("(max-width: 767px)");

  // City Hero -----------------------------------------------------------
  const hero = $(".ab-hero"), stage = $(".ab-hero__stage"), world = $(".ab-world");
  const layer = (n) => $(`[data-layer="${n}"]`, hero);
  const L = { sky: layer("sky"), particles: layer("particles"), cloudsBack: layer("clouds-back"), skyline: layer("skyline"), cloudsFront: layer("clouds-front"), city: layer("city"), est: layer("est"), cloudRight: layer("cloud-right"), cloudLeft: layer("cloud-left"), star: layer("star") };
  const streak = $(".ab-star__streak", hero), head = $(".ab-star__head", hero), trailsBox = $(".ab-trails", hero), copy = $(".ab-copy", hero), lines = $$(".ab-line__in", hero);
  const DESIGN_W = 1440, MIN_H = 1000, BRIDGE_TOP = 721, BOTTOM = 1243, PUSH = { x: 720, y: 945 };
  const F = { sky: 0.04, particles: 0.1, cloudsBack: 0.22, skyline: 0.3, cloudsFront: 0.5, city: 1 }, DRIFT = 60, FG = { y: 0.25, xr: 0.12, xl: 0.1 }, SCALE = { world: 1.06, clouds: 1.08 };
  const PH = { star: [0.074, 0.266], world: [0.47, 1], clouds: [0, 0.8], block: [0.74, 1], l1: [0.76, 0.9], l2: [0.81, 0.95], sub: [0.87, 1] };
  const EXIT = 0.9, DISSOLVE = 0.21;
  const c01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v), seg = (p, a, b) => c01((p - a) / (b - a)), smooth = (v) => { v = c01(v); return v * v * (3 - 2 * v); };
  const inOut = gsap.parseEase("power2.inOut"), out = gsap.parseEase("power2.out");
  const estColor = gsap.utils.interpolate(T7.rgb("--kf-contrast-ink"), T7.rgb("--site-est"));
  const hermite = (P, V, M, p) => {
    let i = 0;
    while (i < P.length - 2 && p > P[i + 1]) i++;
    const h = P[i + 1] - P[i], u = (p - P[i]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * V[i] + (u3 - 2 * u2 + u) * h * M[i] + (-2 * u3 + 3 * u2) * V[i + 1] + (u3 - u2) * h * M[i + 1];
  };
  const geometry = (Hd) => {
    const V0 = Math.min(-200, BRIDGE_TOP - 10 - Hd), V1 = BOTTOM + (BOTTOM - PUSH.y) * (SCALE.world - 1) - Hd - 6, Vb = Math.min(797 - 0.66 * Hd, V1 - 90), d1 = Vb - V0;
    const P = [0, 0.19, 0.49, 0.565, 0.64, 1], V = [V0, V0 + 0.16 * d1, Vb - 50, Vb, Vb + 50, V1], D = [];
    for (let i = 0; i < 5; i++) D.push((V[i + 1] - V[i]) / (P[i + 1] - P[i]));
    const M = [0, 0.8 * D[1], Math.min(0.65 * D[1], 1.4 * D[2]), 0.6 * D[2], Math.min(0.65 * D[1], 1.1 * D[4], 1.4 * D[3]), 0.25 * D[4]];
    for (let i = 1; i < 5; i++) M[i] = Math.min(M[i], 2.5 * Math.min(D[i - 1] || 1e9, D[i] || 1e9));
    const estV = Math.min(60, V1 - 120);
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (hermite(P, V, M, m) < estV) lo = m; else hi = m; }
    const e0 = Math.min(lo, 0.55);
    return { V0, V1, P, V, M, e0, e1: Math.min(e0 + DISSOLVE, 0.8) };
  };
  let G = geometry(900), U = 1;
  const STAR = { side: { from: { x: 1040, y: 135 }, to: { x: 1300, y: 245 } }, center: { from: { x: 540, y: 105 }, to: { x: 790, y: 195 } } };
  let star = STAR.side;
  const measure = () => {
    const W = hero.clientWidth, H = hero.clientHeight;
    if (!W || !H) return;
    const s = Math.max(W / DESIGN_W, H / MIN_H);
    world.style.transform = `translate(-50%, 0) scale(${s})`;
    U = W / DESIGN_W;
    G = geometry(H / s);
    star = DESIGN_W / 2 + W / s / 2 >= 1310 ? STAR.side : STAR.center;
  };
  // Particles — same seed so they always land in the same places (original seed 20120713, 54 on desktop · 26 on phones)
  const bands = { far: $('[data-band="far"]', hero), mid: $('[data-band="mid"]', hero), near: $('[data-band="near"]', hero) };
  const particles = () => {
    Object.values(bands).forEach((b) => (b.textContent = ""));
    let seed = 20120713;
    const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
    for (let i = 0, n = small.matches ? 26 : 54; i < n; i++) {
      const x = 20 + rnd() * 1400, y = 50 + Math.pow(rnd(), 0.85) * 430, d = rnd();
      let g, r, o;
      if (d < 0.45) { g = bands.far; r = 0.55 + rnd() * 0.3; o = 0.14 + rnd() * 0.14; }
      else if (d < 0.8) { g = bands.mid; r = 0.7 + rnd() * 0.3; o = 0.22 + rnd() * 0.18; }
      else { g = bands.near; r = (1 + rnd() * 0.4) * 1.7; o = 0.16 + rnd() * 0.16; }
      rnd();
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1)); c.setAttribute("r", r.toFixed(2)); c.setAttribute("opacity", o.toFixed(2));
      g.append(c);
    }
  };
  let intro = false;
  const render = (p) => {
    if (intro) return;
    const V = hermite(G.P, G.V, G.M, p), travel = (V - G.V0) / (G.V1 - G.V0), dV = V - G.V0;
    gsap.set(L.sky, { y: -F.sky * V });
    gsap.set(L.particles, { y: -F.particles * V, x: 8 * travel });
    bands.far.setAttribute("transform", `translate(${(2 * travel).toFixed(2)} ${(-0.012 * dV).toFixed(2)})`);
    bands.mid.setAttribute("transform", `translate(${(6 * travel + 3 * Math.sin(travel * 2.1)).toFixed(2)} ${(-0.03 * dV).toFixed(2)})`);
    bands.near.setAttribute("transform", `translate(${(11 * travel + 5 * Math.sin(travel * 1.6 + 1)).toFixed(2)} ${(-0.055 * dV).toFixed(2)})`);
    const u = seg(p, PH.star[0], PH.star[1]), env = smooth(seg(u, 0, 0.14)) * (1 - smooth(seg(u, 0.4, 0.9)));
    L.star.style.opacity = env.toFixed(3);
    gsap.set(L.star, { y: -F.particles * V, x: 8 * travel });
    if (env > 0) {
      const hx = star.from.x + (star.to.x - star.from.x) * u, hy = star.from.y + (star.to.y - star.from.y) * u;
      const ang = (Math.atan2(star.to.y - star.from.y, star.to.x - star.from.x) * 180) / Math.PI, tail = Math.min(1, u / 0.28) * (1 - 0.45 * smooth(seg(u, 0.45, 0.9)));
      streak.style.transform = `translate3d(${(hx - 130).toFixed(2)}px, ${(hy - 0.7).toFixed(2)}px, 0) rotate(${ang.toFixed(2)}deg) scaleX(${tail.toFixed(3)})`;
      head.style.transform = `translate3d(${hx.toFixed(2)}px, ${hy.toFixed(2)}px, 0)`;
    }
    gsap.set(L.cloudsBack, { x: DRIFT * travel, y: -F.cloudsBack * V });
    gsap.set(L.skyline, { y: -F.skyline * V });
    gsap.set(L.cloudsFront, { y: -F.cloudsFront * V, scale: 1 + (SCALE.clouds - 1) * inOut(seg(p, PH.clouds[0], PH.clouds[1])) });
    const kW = 1 + (SCALE.world - 1) * inOut(seg(p, PH.world[0], PH.world[1]));
    gsap.set(L.city, { y: -F.city * V, scale: kW });
    const d = seg(p, G.e0, G.e1), haze = smooth(seg(d, 0, 0.7));
    gsap.set(L.est, { scale: 1 / kW, y: V / kW, opacity: 1 - smooth(seg(d, 0.25, 1)), color: estColor(smooth(seg(d, 0, 0.8))), filter: haze > 0.001 ? `blur(${(8 * haze).toFixed(2)}px)` : "none" });
    L.est.style.setProperty("--est-mask", `${(200 * smooth(seg(d, 0.1, 1))).toFixed(1)}%`);
    gsap.set(L.cloudRight, { x: FG.xr * dV, y: -FG.y * dV });
    gsap.set(L.cloudLeft, { x: FG.xl * dV, y: -FG.y * dV });
    gsap.set(copy, { y: (1 - out(seg(p, PH.block[0], PH.block[1]))) * 36 * U });
    [PH.l1, PH.l2, PH.sub].forEach((s, i) => { const k = out(seg(p, s[0], s[1])); if (lines[i]) gsap.set(lines[i], { yPercent: 112 * (1 - k), opacity: k <= 0 ? 0 : 0.35 + 0.65 * k }); });
  };
  const exit = (prog, len) => { const u = seg(prog, EXIT, 1); stage.style.transform = `translate3d(0, ${(-len * (1 - EXIT) * u * u * 0.5).toFixed(2)}px, 0)`; };

  // Car lights on the bridge — eight lanes, every 250~1400ms one line in an empty lane (four at once, three on phone)
  const LANES = [{ y: 41.5, len: 320, w: 2, c: 1, glow: 0.46 }, { y: 44.5, len: 440, w: 2.3, c: 2, glow: 0.52 }, { y: 38, len: 230, w: 1.5, c: 3, glow: 0.38 }, { y: 46.5, len: 260, w: 1.7, c: 2, glow: 0.44 },
    { y: 35.5, len: 160, w: 1.2, c: 4, glow: 0.28 }, { y: 43, len: 380, w: 1.8, c: 1, glow: 0.4 }, { y: 45.5, len: 200, w: 1.4, c: 2, glow: 0.4 }, { y: 39.5, len: 300, w: 1.3, c: 3, glow: 0.32 }];
  const trails = () => {
    const rand = (a, b) => a + Math.random() * (b - a), tip = T7.rgb("--kf-contrast-ink");
    const lanes = LANES.map((t) => {
      const mk = (cls, h, o) => { const el = document.createElement("i"); el.className = cls; el.style.cssText = `top:${(t.y - h / 2).toFixed(2)}px;width:${t.len}px;height:${h.toFixed(2)}px;opacity:${o}`; trailsBox.append(el); return el; };
      const glow = mk("ab-trail__glow", t.w * 4.5, t.glow), line = mk("ab-trail", t.w, 0.92);
      gsap.set([glow, line], { x: -t.len - 10 });
      return { t, glow, line, busy: false, color: T7.rgb(`--site-trail-${t.c}`) };
    });
    let active = 0, timer = 0, running = false, visible = true;
    const launch = (l) => {
      const dir = Math.random() < 0.5 ? 1 : -1, bg = `linear-gradient(${dir > 0 ? 90 : 270}deg, transparent 0%, ${l.color} 58%, ${tip} 93%, ${tip} 100%)`;
      l.glow.style.background = l.line.style.background = bg;
      l.busy = true; active++;
      gsap.fromTo([l.glow, l.line], { x: dir > 0 ? -l.t.len : DESIGN_W }, { x: dir > 0 ? DESIGN_W : -l.t.len, duration: rand(0.9, 1.8) * (0.85 + l.t.len / 1800), ease: "none", onComplete: () => { l.busy = false; active--; } });
    };
    const schedule = () => {
      clearTimeout(timer);
      if (!running) return;
      timer = setTimeout(() => {
        const pool = small.matches ? lanes.slice(0, 6) : lanes, free = pool.filter((l) => !l.busy);
        if (active < (small.matches ? 3 : 4) && free.length) launch(free[Math.floor(Math.random() * free.length)]);
        schedule();
      }, rand(250, 1400));
    };
    const sync = () => { const on = visible && !document.hidden; if (on && !running) { running = true; schedule(); } else if (!on) { running = false; clearTimeout(timer); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(hero);
    document.addEventListener("visibilitychange", sync);
    sync();
  };

  const initHero = () => {
    particles();
    gsap.set(L.city, { transformOrigin: `${PUSH.x}px ${PUSH.y}px` });
    gsap.set(L.est, { transformOrigin: `${PUSH.x}px ${PUSH.y - 215}px` });
    gsap.set(L.cloudsFront, { transformOrigin: "50% 50%" });
    gsap.set(lines, { y: 0, yPercent: 112, opacity: 0 });
    measure();
    render(0);
    world.classList.add("is-ready");
    if (reduced) { gsap.set(lines, { yPercent: 0, opacity: 1 }); return; }
    trails();
    const state = { p: 0 };
    // On open each layer floats up from below — scroll rendering pauses meanwhile, and after 1.8s (or sooner if you scroll) it returns to the scroll position
    const layers = [L.cloudsBack, L.skyline, L.cloudsFront, L.city, L.est];
    const introEnd = () => { if (!intro) return; intro = false; gsap.killTweensOf(layers); gsap.set(layers, { clearProps: "opacity" }); render(state.p); };
    intro = true;
    gsap.from(L.cloudsBack, { y: "+=25", opacity: 0, duration: 0.7, ease: "power2.out", delay: 0.2 });
    gsap.from(L.skyline, { y: "+=40", opacity: 0, duration: 0.8, ease: "power2.out", delay: 0.3 });
    gsap.from(L.cloudsFront, { y: "+=55", opacity: 0, duration: 0.9, ease: "power2.out", delay: 0.4 });
    gsap.from(L.city, { y: "+=75", opacity: 0, duration: 1, ease: "power2.out", delay: 0.5 });
    gsap.from(L.est, { y: "+=20", duration: 1.1, ease: "power2.out", delay: 0.7 });
    gsap.delayedCall(1.8, introEnd);
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: () => `+=${Math.round(innerHeight * (small.matches ? 2 : 2.4))}`, pin: true, anticipatePin: 1, scrub: 0.35, invalidateOnRefresh: true,
      onUpdate: (st) => { if (intro && st.progress > 0.001) introEnd(); exit(st.progress, st.end - st.start); } } });
    tl.to(state, { p: 1, duration: 1, ease: "none", onUpdate: () => render(state.p) });
    ScrollTrigger.addEventListener("refresh", () => { measure(); render(state.p); exit(tl.scrollTrigger.progress, tl.scrollTrigger.end - tl.scrollTrigger.start); });
  };

  // Staggered 3D grid ------------------------------------------------------------
  const LABELS = ["Gold ring macro · landscape", "Blue-toned fabric · landscape", "Purple paint bleed · Landscape", "Dark metal grain · Horizontal", "Orange abstract · Horizontal", "Glass Sculpture · Landscape", "Bundle of glowing lines · Horizontal", "White fragment close-up · landscape"];
  const grid = $(".ab-grid__in");
  for (let i = 0; i < 44; i++) grid.insertAdjacentHTML("beforeend", `<figure class="ab-gi"><div class="ab-gi__wrap"><div class="wf-img" data-label="${LABELS[i % LABELS.length]}"></div></div></figure>`);
  const initGrid = () => {
    const wraps = $$(".ab-gi__wrap", grid), filters = !small.matches;
    const left = (el) => el.getBoundingClientRect().left + el.offsetWidth / 2 < innerWidth / 2;
    wraps.forEach((w) => {
      const img = $(".wf-img", w), l = left(w);
      const enter = { z: 300, rotateX: 70, rotateZ: l ? 5 : -5, xPercent: l ? -40 : 40, skewX: l ? -20 : 20, yPercent: 100, ease: "sine" };
      const leave = { z: 300, rotateX: -50, rotateZ: l ? -1 : 1, xPercent: l ? -20 : 20, skewX: l ? 10 : -10, ease: "sine.in" };
      if (filters) { enter.startAt = { filter: "blur(0px) brightness(100%) contrast(100%)" }; enter.filter = "blur(7px) brightness(0%) contrast(400%)"; leave.filter = "blur(4px) brightness(0%) contrast(500%)"; }
      gsap.timeline({ scrollTrigger: { trigger: w, start: "top bottom+=10%", end: "bottom top-=25%", scrub: 1 } })
        .from(w, enter).to(w, leave).from(img, { scaleY: 1.8, ease: "sine" }, 0).to(img, { scaleY: 1.8, ease: "sine.in" }, ">");
    });
    const mark = $(".ab-mark"), inner = $(".ab-mark__in");
    mark.classList.add("is-off");
    gsap.timeline({ scrollTrigger: { trigger: grid, start: "top bottom-=30%", end: "bottom top", scrub: 1, onToggle: (st) => mark.classList.toggle("is-off", !st.isActive) } })
      .fromTo(inner, { x: "100vw" }, { x: "-102%", ease: "sine" });
  };

  // Spread-out words → gather, and a video window opens between two lines ------------------------------
  const initClose = () => {
    gsap.set(".ab-close__media", { width: 0, height: 0 });
    const m = matchMedia("(max-width: 768px)").matches;
    gsap.set(".ab-close__top", { columnGap: m ? "25vw" : "20vw" });
    gsap.timeline({ scrollTrigger: { trigger: ".ab-close", start: m ? "top center" : "top center+=20%", end: "bottom 100%", scrub: m ? 1 : 0.5, invalidateOnRefresh: true } })
      .to(".ab-close__top", { columnGap: m ? "10px" : "2vw", duration: 1.5, ease: "power2.inOut" }, 0)
      .to(".ab-close__media", { width: m ? "70vw" : "40vw", height: m ? "35vw" : "20vw", duration: 1, ease: "none" }, m ? 0.5 : 0.7);
  };

  // Tab photo pinning ---
  const initSel = () => {
    const tabs = $$(".ab-sel__tabs span"), descs = $$(".ab-sel__desc p");
    let active = 0;
    const set = (i) => { active = i; tabs.forEach((t, k) => t.classList.toggle("is-active", k === i)); descs.forEach((d, k) => d.classList.toggle("is-active", k === i)); };
    gsap.set(".ab-sel__img--2 .wf-img, .ab-sel__img--3 .wf-img", { y: 200, scale: 1.03 });
    gsap.set(".ab-sel__img--1 .wf-img", { y: 0, scale: 1.03 });
    gsap.timeline({ scrollTrigger: { trigger: ".ab-sel__in", start: "top top", end: "+=200%", pin: true, scrub: 0.5, anticipatePin: 1,
      onUpdate: (st) => { const p = st.progress; if (active === 0 && p > 0.45) set(1); else if (active === 1) { if (p > 0.95) set(2); else if (p < 0.05) set(0); } else if (active === 2 && p < 0.55) set(1); } } })
      .to(".ab-sel__img--1", { clipPath: "inset(0% 0% 100% 0%)", ease: "none", duration: 1 }, "s1")
      .to(".ab-sel__img--1 .wf-img", { y: -200, scale: 1, ease: "none", duration: 1 }, "s1")
      .to(".ab-sel__img--2 .wf-img", { y: 0, scale: 1.03, ease: "none", duration: 1 }, "s1")
      .to(".ab-sel__img--2", { clipPath: "inset(0% 0% 100% 0%)", ease: "none", duration: 1 }, "s2")
      .to(".ab-sel__img--2 .wf-img", { y: -200, scale: 1, ease: "none", duration: 1 }, "s2")
      .to(".ab-sel__img--3 .wf-img", { y: 0, scale: 1.03, ease: "none", duration: 1 }, "s2");
  };

  initHero();
  if (!reduced) {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => { initGrid(); initClose(); initSel(); requestAnimationFrame(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }); });
  }
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
