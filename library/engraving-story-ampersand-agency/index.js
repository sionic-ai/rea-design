/* First page story — pins one section and scrubs one timeline (original: scrub .5, timeline 1 second = Screen height 45%).
     0 → .8      The large wordmark shrinks into the header line and the slogan·guide leave
     .8 → 2.4 Shows eight engraved figures pulling back from very close up (cape grain) — meanwhile they turn from their back-turned spot (from) to their resting spot (final), with a horizontal-grain sky behind
     2.4 → 3.0   two-line intro below the group
     3.0 → 3.8   the rest fade into a blurred grain, leaving only the middle two
     3.8 → 5.6   the first figure moves left and comes up large — blurred second one in the middle, name and description (title from dust)
     5.6 → 6.4 the two stand apart
     6.4 → 8.0 The second figure appears large on the right — a blurry first one stays on the left, then scatters into dust
     8.0 → 10.0  the two face each other (handshake) and exit — two-line title
     10.0 → 11.4 only the sky texture remains, with one line below
     11.4 → 13.2 a giant ampersand sweeps in from the right and shrinks into a flame & — “the rarest thing in a name”
     13.2 → 13.8 dragged along the horizontal grain as the board flips to ink
     13.8 → 16.2 White flame on ink, & and two paragraphs, the & shrinks, white wordmark and two-line title
     16.2 → 17   pulled along the grain and returns to paper → About section */
(() => {
  const CF = window.CF, E = window.CFEngrave;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = CF.reduce;
  const stage = $(".story__stage"), header = $(".cf-header"), ink = $(".story__ink");
  const UNIT = 0.45, LEN = 17;
  const glA = E && E.create($(".story__gl")), glB = E && E.create($(".story__gl--top"));

  /* ---- Actors: eight crowds (x, feet, height, final angle, initial angle from the original scene layout 2560×1067). The middle two (3·4) are the two leads ---- */
  const CAST = [[424, 989, 959, 60, 170], [651, 975, 919, 40, 160], [904, 1028, 1002, 55, 170], [1149, 1031, 966, 150, -30], [1381, 973, 958, -15, -135], [1616, 967, 964, -40, -170], [1786, 1055, 1040, -150, -30], [2060, 1011, 900, -70, -175]];
  const looks = [{ hat: 1.1, cloak: 1 }, { hat: 0.85, cloak: 1.15 }, { hat: 1, cloak: 0.9, beard: false }, { hat: 1.25, cloak: 1.05 }];
  const figTex = looks.map((l) => E.figure(l));
  const S = { sky: null, group: [], a: null, b: null, ga: null, gb: null, amp: null, fl: null, word: null };
  if (glA) {
    S.sky = glA.add(E.sky(), { scan: 1, period: 4, alpha: 0.5 });
    S.group = CAST.map((c, i) => glA.add(figTex[i === 3 ? 3 : i === 4 ? 1 : i % figTex.length], { scan: 1, period: 3.4 }));
    S.ga = glA.add(figTex[3], { scan: 1, alpha: 0.3, period: 3 });
    S.gb = glA.add(figTex[1], { scan: 1, alpha: 0.3, period: 3 });
    S.a = glA.add(figTex[3], { scan: 1, period: 5.5 });
    S.b = glA.add(figTex[1], { scan: 1, period: 5.5, flip: 1 });
  }
  /* The ampersand is drawn in the wordmark typeface, so it goes after the font loads */
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    if (glA) S.amp = glA.add(E.amp(true), { scan: 1, solid: 1 });
    if (glB) S.fl = glB.add(E.amp(true), { scan: 1, solid: 1, ink: "--site-engrave-on-ink" });
  });
  /* Original angle → our rotation: width = cos, darken when turned away (past 90°) */
  const turnOf = (deg) => Math.cos((deg * Math.PI) / 180);
  const darkOf = (deg) => (Math.abs(deg) > 90 ? 0.45 * Math.min(1, (Math.abs(deg) - 90) / 60) : 0);

  /* ---- Text ---- */
  const words = (el) => CF.words(el);
  const open = { logo: $(".st-open__logo"), line: $(".st-open__line"), cue: $(".st-open__cue") };
  const B = { lede: $(".st-lede"), a: $(".st-man--a"), b: $(".st-man--b"), meet: $(".st-copy--meet"), idea: $(".st-copy--idea"), rare: $(".st-copy--rare"), amp: $(".st-copy--amp"), amp2: $(".st-copy--amp2"), fin: $(".st-fin") };
  Object.values(B).forEach((b) => { $$("h2, p:not(.cf-logo)", b).concat(b.matches("p") ? [b] : []).forEach((el) => words(el)); gsap.set(b, { autoAlpha: 0 }); });

  /* ---- Timetable (sec = Unit) ---- */
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const P = { u: 0 };
  tl.to(P, { u: LEN, duration: LEN, ease: "none" }, 0);
  const rise = (el, at, dur = 0.6, each = 0.02) => { const w = el ? $$(".cf-wi", el) : []; if (w.length) tl.fromTo(w, { yPercent: 105 }, { yPercent: 0, duration: dur, ease: "sine.out", stagger: each }, at); };
  const sink = (el, at, dur = 0.4) => tl.to(el, { autoAlpha: 0, y: -16, duration: dur, ease: "power1.in" }, at);
  const show = (el, at) => tl.set(el, { autoAlpha: 1, y: 0 }, at);
  /* Opening — the big wordmark moves to the header wordmark’s position and size */
  const hLogo = $(".cf-header .cf-logo");
  gsap.set(open.logo, { xPercent: -50, yPercent: -50 });
  const target = () => { const r = hLogo.getBoundingClientRect(); return { x: r.left + r.width / 2 - innerWidth / 2, y: r.top + r.height / 2 - innerHeight * 0.45, s: r.width / open.logo.offsetWidth }; };
  tl.to([open.line, open.cue], { autoAlpha: 0, y: -12, duration: 0.5, ease: "power1.out" }, 0);
  tl.to(open.logo, { x: () => target().x, y: () => target().y, scale: () => target().s, duration: 0.8, ease: "power2.inOut" }, 0);
  tl.to(open.logo, { autoAlpha: 0, duration: 0.1 }, 0.78);
  show(B.lede, 2.4); rise(B.lede, 2.4, 0.7, 0.012); sink(B.lede, 3.0);
  show(B.a, 4.0); rise($("h2", B.a), 4.0, 0.7, 0.05); rise($("p", B.a), 4.4, 0.7, 0.012); sink(B.a, 5.5);
  show(B.b, 6.6); rise($("h2", B.b), 6.6, 0.7, 0.05); $$("p", B.b).forEach((p, i) => rise(p, 7.0 + i * 0.35, 0.7, 0.012)); sink(B.b, 7.9);
  show(B.meet, 9.1); rise($("p", B.meet), 9.1, 0.6, 0.012); rise($("h2", B.meet), 9.4, 0.7, 0.04); sink(B.meet, 10.0);
  show(B.idea, 10.3); rise($("p", B.idea), 10.3, 0.6, 0.012); sink(B.idea, 11.3);
  show(B.rare, 12.4); rise($("h2", B.rare), 12.4, 0.6, 0.04); sink(B.rare, 13.1);
  show(B.amp, 14.0); rise($("p", B.amp), 14.0, 0.6, 0.01); sink(B.amp, 14.8);
  show(B.amp2, 14.9); rise($("p", B.amp2), 14.9, 0.6, 0.01); sink(B.amp2, 15.4);
  show(B.fin, 15.5); tl.fromTo($(".st-fin__logo", B.fin), { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.inOut" }, 15.5); rise($("h2", B.fin), 15.7, 0.6, 0.04); sink(B.fin, 16.4);
  tl.to(ink, { opacity: 1, duration: 0.5, ease: "sine.inOut" }, 13.2);
  tl.to(ink, { opacity: 0, duration: 0.5, ease: "sine.inOut" }, 16.4);

  /* ---- Scene values: functions of unit u ---- */
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const seg = (a, b, u) => clamp((u - a) / (b - a));
  const mix = (a, b, k) => a + (b - a) * k;
  const sio = gsap.parseEase("sine.inOut"), so = gsap.parseEase("sine.out"), p2 = gsap.parseEase("power2.inOut"), p1o = gsap.parseEase("power1.out");
  function scene(u) {
    if (!glA) return;
    const W = glA.W, H = glA.H, ph = W < 700;
    /* Sky: horizontal grain band */
    S.sky.x = W / 2; S.sky.h = H * 0.6; S.sky.y = H * 0.78;
    S.sky.scan = Math.max(1 - so(seg(1.4, 2.4, u)), seg(11.0, 11.6, u));
    /* Crowd: pulls back from the zoomed-in spot (zoom 5.5 → 1, toward the second figure’s cape) */
    const zoom = mix(5.5, 1, p2(seg(0.8, 2.4, u)));
    const fx = W * 0.5, fy = H * 0.42;
    const turnK = sio(seg(1.0, 2.6, u));
    const othersOut = seg(3.0, 3.6, u), pairOut = seg(3.8, 4.2, u);
    S.group.forEach((s, i) => {
      const [x, feet, hh, fin, from] = CAST[i];
      const deg = from + (fin - from) * turnK;
      const bx = (x / 2560) * W * (ph ? 1.6 : 1) - (ph ? W * 0.3 : 0);
      const by = H * 0.74 + (feet - 1000) * 0.32 * (H / 900);
      s.x = fx + (bx - fx) * zoom; s.y = fy + (by - fy) * zoom;
      s.h = H * (ph ? 0.36 : 0.5) * (hh / 960) * zoom;
      s.turn = turnOf(deg); s.dark = darkOf(deg);
      const main = i === 3 || i === 4;
      s.scan = Math.max(1 - so(seg(0.75, 1.1, u)), main ? pairOut : othersOut * 0.85);
      s.alpha = main ? 1 : 1 - 0.55 * othersOut;
      if (!main && othersOut >= 1) s.scan = 1;
    });
    /* First portrait close-up (left) + blurry second one in the middle */
    const aIn = so(seg(3.9, 4.8, u)), aOut = seg(5.5, 6.0, u);
    S.a.x = W * (ph ? 0.3 : 0.17); S.a.y = H * 2.07; S.a.h = H * 2.12; S.a.turn = 0.92;
    S.a.scan = Math.max(1 - aIn, aOut);
    S.gb.x = W * 0.6; S.gb.y = H * 0.74; S.gb.h = H * 0.46; S.gb.turn = turnOf(-25);
    S.gb.scan = Math.max(1 - 0.6 * so(seg(4.0, 4.6, u)), seg(5.4, 5.8, u));
    /* The two stand apart (5.6~6.4) — reuses the spots of the group’s two protagonists */
    const apart = seg(5.6, 6.0, u) * (1 - seg(6.3, 6.6, u)) + seg(7.9, 8.2, u) * (1 - seg(9.6, 10.0, u));
    /* Second person close-up (right) + blurred first person on the left (turning to dust) */
    const bIn = so(seg(6.4, 7.2, u)), bOut = seg(7.8, 8.2, u);
    S.b.x = W * (ph ? 0.7 : 0.8); S.b.y = H * 2.07; S.b.h = H * 2.12; S.b.turn = 0.92;
    S.b.scan = Math.max(1 - bIn, bOut);
    S.ga.x = W * 0.4; S.ga.y = H * 0.74; S.ga.h = H * 0.46; S.ga.turn = turnOf(25);
    S.ga.scan = Math.max(1 - 0.6 * so(seg(6.6, 7.2, u)), u > 7.95 ? 1 : 0);
    S.ga.dust = p1o(seg(7.4, 7.95, u));
    /* Two figures facing each other (handshake) */
    const face = sio(seg(8.2, 9.0, u));
    if (apart > 0) {
      [S.group[3], S.group[4]].forEach((s, i) => {
        const deg = i ? mix(-30, -75, face) : mix(30, 75, face);
        s.x = W * (0.5 + (i ? 1 : -1) * mix(0.09, 0.035, face)); s.y = H * 0.74; s.h = H * (ph ? 0.4 : 0.5);
        s.turn = turnOf(deg); s.dark = 0; s.alpha = 1;
        s.scan = Math.max(1 - apart, 0);
      });
    }
    /* Giant ampersand → flame & */
    if (S.amp) {
      const ak = p2(seg(11.4, 12.4, u)), shrink = sio(seg(12.4, 13.0, u));
      S.amp.scan = u < 11.4 || u > 13.4 ? 1 : seg(13.2, 13.4, u);
      S.amp.h = H * mix(mix(5.5, 0.75, ak), 0.5, shrink);
      S.amp.x = W * mix(0.98, 0.5, ak);
      S.amp.y = H * mix(mix(0.9, 0.56, ak), 0.5, shrink) + S.amp.h / 2 - H * 0.06 * shrink;
    }
    /* White spark on ink &: forms from the grain drag → shrinks and drops away */
    if (S.fl) {
      const fIn = seg(13.4, 13.9, u), small = sio(seg(14.8, 15.3, u)), gone = seg(15.3, 15.5, u);
      S.fl.scan = u < 13.3 || u > 15.5 ? 1 : Math.max(0.85 * (1 - so(fIn)), gone);
      S.fl.h = H * mix(0.45, 0.28, small); S.fl.x = W / 2; S.fl.y = H * mix(0.42, 0.36, small) + S.fl.h / 2;
    }
    /* Header row: transparent during the opening, flips to a paper band during the ink panel */
    header.classList.toggle("is-clear", u < 0.75);
    header.classList.toggle("is-paper", u > 13.4 && u < 16.6);
    header.style.setProperty("--logo-o", u < 0.75 ? 0 : 1);
    if (u < LEN - 0.01 && CF.dotsReady) CF.showDots(true);
    const ch = u < 0.8 ? 0 : u < 3.0 ? 1 : u < 5.6 ? 2 : u < 8.0 ? 3 : u < 10.0 ? 4 : u < 11.4 ? 5 : u < 13.6 ? 6 : u < 14.85 ? 7 : u < 15.45 ? 8 : 9;
    CF.setDot(ch, u > 13.4 && u < 16.6);
  }

  let st = null;
  const now = () => performance.now() / 1000;

  /* ---- Opening: wordmark after .6s for 2.4s · slogan 1.4s (power1.inOut) at 2.6s · guide and ember button rise 8px over .9s (power2.out) at 3.9s ---- */
  if (!reduce) {
    const fuse = $(".cf-header .cf-fuse");
    /* The original stays blank paper (jam: .6s + .27s) while the scene images and wordmark SVG download, then starts */
    const intro = gsap.timeline({ delay: 0.27, onStart: () => document.documentElement.classList.remove("cf-boot") });
    intro.fromTo($(".cf-in", open.logo), { opacity: 0 }, { opacity: 1, duration: 2.4, ease: "power1.inOut" }, 0.6);
    intro.fromTo($(".cf-in", open.line), { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power1.inOut" }, 2.6);
    intro.fromTo($(".cf-in", open.cue), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 3.9);
    intro.fromTo(fuse, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: "power2.out" }, 3.9);
    /* The dot progress indicator also enters along with the guide */
    intro.call(() => { CF.dotsReady = true; }, null, 3.9);
  }

  if (reduce) { CF.dotsReady = true; tl.progress(1); scene(LEN); }
  else {
    st = ScrollTrigger.create({
      trigger: ".story", start: "top top", end: () => "+=" + Math.round(LEN * UNIT * innerHeight), pin: stage, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true,
      animation: tl,
    });
  }
  gsap.ticker.add(() => { scene(P.u); if (glA) glA.render(now()); if (glB) glB.render(now()); });

  /* ---- Mouse tilt: each frame follows 6% of the remaining distance and pushes the print board by -x·-y/2 (max 22px × screen width/1680 × depth) ---- */
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    addEventListener("mousemove", (e) => { tilt.tx = (e.clientX / innerWidth) * 2 - 1; tilt.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    const layers = [[$(".cf-in", open.logo), 1], [$(".cf-in", open.line), 0.8], [$(".cf-in", open.cue), 1.2], [$(".story__gl"), 1.8], [$(".story__gl--top"), 0.9], [$(".page__art--map"), 1], [$(".page__art--barrels"), 1.3]];
    gsap.ticker.add((t, dt) => {
      const k = 1 - Math.pow(1 - 0.06, Math.min((dt || 16.67) / 16.67, 3));
      tilt.x += (tilt.tx - tilt.x) * k; tilt.y += (tilt.ty - tilt.y) * k;
      const u = innerWidth / 1680;
      layers.forEach(([el, d]) => { if (el) el.style.translate = `${(-tilt.x * 22 * u * d).toFixed(1)}px ${(-tilt.y * 22 * u * d * 0.5).toFixed(1)}px`; });
    });
  }

  /* ---- Dot press: story sections go to that unit’s spot, lower sections go to that section ---- */
  const AT = [0, 2.6, 4.9, 7.2, 9.4, 10.6, 12.6, 14.2, 15.0, 15.9];
  $$(".cf-dots button").forEach((b) => b.addEventListener("click", () => {
    const g = b.dataset.go;
    if (/^\d+$/.test(g) && st) CF.scrollTo(st.start + (AT[+g] / LEN) * (st.end - st.start));
    else if (document.getElementById(g)) CF.scrollTo(document.getElementById(g));
  }));
  ["agency", "offer", "contact"].forEach((id, i) => ScrollTrigger.create({ trigger: "#" + id, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && CF.setDot(10 + i, false) }));
  ScrollTrigger.create({ trigger: ".cf-footer", start: "top 80%", onEnter: () => CF.showDots(false), onLeaveBack: () => CF.showDots(true) });

  /* ---- Section engraving below: rubbed in between 94% and 66% of the screen and set into the grain (original scrub .4) ---- */
  function art(canvas, src, o = {}) {
    const g = E && E.create(canvas);
    if (!g) return;
    const s = g.add(src, Object.assign({ scan: 1, period: 3 }, o));
    const fit = () => { s.h = Math.min(g.H, (g.W / s.aspect)); s.x = g.W / 2; s.y = (g.H + s.h) / 2; };
    const prog = { k: 0 };
    if (reduce) prog.k = 1;
    else gsap.to(prog, { k: 1, ease: "none", scrollTrigger: { trigger: canvas, start: "top 94%", end: "top 66%", scrub: 0.4 } });
    gsap.ticker.add(() => { fit(); s.scan = 1 - prog.k; if (ScrollTrigger.isInViewport(canvas, 0)) g.render(now()); });
  }
  art($(".page__art--map"), E.pistolMap());
  art($(".page__art--barrels"), E.barrels());
  $$(".cf-footer canvas").forEach((c, i) => art(c, E.barrels(), { ink: "--site-engrave-on-ink", flip: i }));

  /* ---- Section title: words rise inside the mask (screen 75% → 40%, scrub .4) ---- */
  $$(".page__h1, .page__sub").forEach((h) => {
    const w = words(h);
    if (!reduce) gsap.fromTo(w, { yPercent: 105 }, { yPercent: 0, ease: "sine.out", stagger: 0.03, scrollTrigger: { trigger: h, start: "top 75%", end: "top 40%", scrub: 0.4 } });
  });

  /* ---- Contact: one question at a time ---- */
  const form = $(".qf"), steps = $$(".qf-step", form), ok = $(".qf-ok", form), count = $(".qf-count", form), err = $(".qf-error", form);
  let at = 0;
  function go(n) {
    n = Math.max(0, Math.min(steps.length - 1, n));
    steps.forEach((s, i) => { s.classList.toggle("is-on", i === n); s.classList.toggle("is-up", i < n); });
    at = n; err.textContent = "";
    ok.textContent = n === 5 ? "Light the fuse" : "Next";
    count.textContent = n < 6 ? `${n + 1} / 6` : "";
    const f = steps[n].querySelector("input, textarea"); if (f) f.focus({ preventScroll: true });
  }
  function valid() {
    const f = steps[at].querySelector("input, textarea");
    if (at === 2 && !steps[2].querySelector(".qf-choice.is-on")) return "Please choose one.";
    if (f && f.required && !f.value.trim()) return "This field is required.";
    if (f && f.type === "email" && f.value && !/^\S+@\S+\.\S+$/.test(f.value)) return "Please check the email format.";
    return "";
  }
  ok.addEventListener("click", () => { const m = valid(); if (m) { err.textContent = m; return; } go(at + 1); });
  $(".qf-next", form).addEventListener("click", () => { if (!valid()) go(at + 1); });
  $(".qf-back", form).addEventListener("click", () => go(at - 1));
  $$(".qf-choice", form).forEach((c) => c.addEventListener("click", () => { $$(".qf-choice", form).forEach((x) => x.classList.toggle("is-on", x === c)); }));
  form.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); ok.click(); } });
  form.addEventListener("submit", (e) => e.preventDefault());
})();
