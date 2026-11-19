// First page — carries over the original home’s values as they are.
// Reveal: video clip inset(25.97% 50%)→0 2s power3.out · corner dots 2s · center line scaleX 2s · coordinate text rolls 4.5s · circle lines 1.85s power3.inOut (+.3) ·
//       ‹secondPart› (+1.2) letters roll 3.2s · words xPercent ±175 → 0 1.15s power4.out · three heads .75s power3.out (+.2) · arrow dot 1.85s.
// Scroll: hero pinned, length screen×(1+.78+.5+.78), scrub .5. During the first 1.8 the letters fly away (1.3 power1.out) · video .45→1 · fog spreads,
//       then pull (.78) — the video shrinks into the front slot of the card orbit, hold (.5) — two slots around the orbit with text, push (.78) — the lead card moves to the first case position.
(() => {
  const { split, scrambleIn, reduce, isPhone, SCR_SYM, SCR_UP } = window.PS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const WORDS = [["dream", "stir", "venture", "spark"], ["grow", "craft", "build", "shift", "sprout"], ["invent", "rethink", "plan", "find"]];
  const Z = { pull: 0.78, hold: 0.5, push: 0.78 };
  const Q = { pull: 0, hold: 0, push: 0 };
  const TOTAL = 1 + Z.pull + Z.hold + Z.push;
  const G = (e) => Math.min(1, Math.max(0, e));
  const ve = (a, b, n) => { const r = G((n - a) / (b - a)); return r * r * (3 - 2 * r); };
  const ye = (e) => (e < 0.5 ? 2 * e * e : 1 - (-2 * e + 2) ** 2 / 2);

  const intro = $(".hero__intro");
  const preview = $(".hero .player__preview");
  const player = $(".hero .player");
  const bday = $(".bday");
  const stage = $(".bday__stage");
  const leadCase = $(".case[data-lead]");
  const mist = () => window.PS.mist;

  // ── Twelve customer cards (0 = Slot where the showreel lands, 10 = Lead card to the first case) ──
  const LABELS = ["Reel cell · case photo revealed after the video settles down", "Event key visual · Landscape", "Company website hero · Horizontal", "Medical service screen · light blue", "University campus photo · daytime", "Farm scenery · green field", "Counseling center screen · Calm tone", "Game artwork · dark purple", "Music festival poster · Pink", "Tech company graphic · deep navy", "Lead card · Same photo as the first Work", "Island volcano view · Smoke"];
  const N = 12, REEL = 0, LEAD = 10;
  LABELS.forEach((lab, i) => {
    const c = document.createElement("span");
    c.className = "bday__card" + (i === REEL ? " bday__card--reel" : "") + (i === LEAD ? " bday__card--lead" : "");
    c.innerHTML = `<span class="ps-ph wf-img" data-label="${lab}"></span>`;
    stage.append(c);
  });
  const cards = $$(".bday__card", stage);

  // ── Text splitting ──
  const psyChars = split($(".psy__text"));
  const agencyEl = $(".top-text__agency");
  const agencyChars = [];
  agencyEl.childNodes.forEach((n) => { if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement("span"); s.textContent = n.textContent; n.replaceWith(s); } });
  $$("span", agencyEl).forEach((s) => agencyChars.push(...split(s)));
  const wordEls = [$('[data-word="0"]'), $('[data-word="1"]'), $('[data-word="2"]')];
  const imagineChars = split(wordEls[0]);
  const innoChars = split(wordEls[2]);
  const coordChars = $$(".center__part .center__text").flatMap((e) => split(e));
  const ctlChars = $$(".center__text--play, .center__text--time").flatMap((e) => split(e));
  const playerTxt = $$(".player__txt").flatMap((e) => split(e));
  const ctaVisible = $(".top-text__cta .ps-scr");

  // ── Word swap (one every 8–12 seconds, .8s roll · width power3.out) ──
  function swapWord(el, text, dur = 0.55) {
    if (!el || el.textContent === text) return;
    const from = el.textContent;
    const w0 = el.offsetWidth;
    el.textContent = text;
    const w1 = el.offsetWidth;
    el.textContent = from;
    delete el.dataset.split;
    gsap.set(el, { width: w0 });
    gsap.to(el, { width: w1, duration: dur, ease: "power3.out", overwrite: "auto" });
    gsap.to(el, { duration: dur, ease: "none", scrambleText: { text, chars: SCR_UP, tweenLength: false }, overwrite: "auto", onComplete: () => gsap.set(el, { clearProps: "width" }) });
  }
  let cycleT = null, hoverPlay = false;
  const BASE = wordEls.map((e) => e.textContent);
  function cycle() {
    cycleT = setTimeout(() => {
      if (!hoverPlay) {
        const k = Math.floor(Math.random() * 3);
        const list = WORDS[k], cur = wordEls[k].textContent;
        let next = cur;
        for (let i = 0; i < 10 && next === cur; i++) next = list[Math.floor(Math.random() * list.length)];
        swapWord(wordEls[k], next, 0.8);
      }
      cycle();
    }, 8000 + Math.random() * 4000);
  }
  // Hovering the play button or CTA swaps three words to other words at .4s, and on leave back to the first words at .45s (original Hero play·start)
  const playBtn = $(".hero .play-btn");
  const cta = $(".top-text__cta");
  [playBtn, cta].forEach((b) => {
    b.addEventListener("mouseenter", () => {
      hoverPlay = true;
      wordEls.forEach((el, k) => { const l = WORDS[k].filter((w) => w !== el.textContent); swapWord(el, l[Math.floor(Math.random() * l.length)], 0.4); });
    });
    b.addEventListener("mouseleave", () => { hoverPlay = false; wordEls.forEach((el, k) => swapWord(el, BASE[k], 0.45)); });
  });
  // Attention pulse — starting 2s after the hero settles, the play button and CTA alternately blink every 1 to 3s with a .7s color split (paused if hovered or the reel window is open)
  function beat() {
    let k = 0;
    const loop = () => setTimeout(() => {
      if (!hoverPlay && !window.PS.reel?.isOpen() && scrollY < innerHeight * 0.3) {
        const el = [playBtn, cta][k];
        k = (k + 1) % 2;
        el.classList.add("is-beat");
        setTimeout(() => el.classList.remove("is-beat"), 800);
      }
      loop();
    }, 1000 + Math.random() * 2000);
    setTimeout(loop, 2000);
  }

  // ── Showreel preview · window (reel.js) — Hero values: noise 2.2 · warp .32 · color split .033 · hue .5 · blend 1.4s · burst ×1.05 (rise .07 · fall .9) · scanline .002 · hover 1.05x ──
  const reel = window.PS.reel;
  const home = reel.describe($(".hero .player__container"), { home: true });
  const smooth01 = (v) => { const e = G(v); return e * e * (3 - 2 * e); };
  // Redraw — after closing the window, restore the preview to the shape at the scroll position
  home.onClosed = () => { const tl = gsap.getById("homepage-scroll-animation"); if (tl) { const p = tl.progress(); tl.progress(Math.max(0, p - 0.001)).progress(p); } };
  if (isPhone()) reel.mobileHero(home, $(".hero .hero-mobile__handler"));
  else {
    home.gl = reel.glPreview(home, { noise: 2.2, disp: 0.32, aber: 0.033, hue: 0.5, morph: 1.4, amp: 1.05, scan: 0.002, rise: 0.07, fall: 0.9, hoverScale: 1.05 });
    reel.waitFor(home.video);
    if (home.gl) {
      playBtn.addEventListener("mouseenter", () => home.gl.hoverStart());
      playBtn.addEventListener("mouseleave", () => home.gl.hoverEnd());
      playBtn.addEventListener("mousemove", (e) => home.gl.move(e));
      playBtn.addEventListener("focus", () => home.gl.hoverStart());
      playBtn.addEventListener("blur", () => home.gl.hoverEnd());
    }
    // On press (the original Hero’s handler) the window opens while a black cover closes over 1.2s power2.in, stays covered and jumps to the hero end (where the video fills the frame) after .25s, and lifts from 1.7s over 1s power2.out
    const veil = document.createElement("div");
    veil.className = "ps-reel-veil";
    veil.setAttribute("aria-hidden", "true");
    document.body.append(veil);
    playBtn.addEventListener("click", () => {
      if (reel.isOpen() || reel.isBusy()) return;
      window.psLenis?.stop();
      const st = ScrollTrigger.getById("homepage-hero-scrolltrigger");
      const to = st ? (matchMedia("(min-width: 1024px) and (orientation: landscape)").matches ? st.start + (st.end - st.start) / TOTAL : st.end) : 0;
      gsap.timeline().call(() => reel.open(home), null, 0)
        .to(veil, { opacity: 1, duration: 1.2, ease: "power2.in" }, 0)
        .call(() => { if (st) (window.psLenis ? window.psLenis.scrollTo(to, { immediate: true, lock: true, force: true }) : scrollTo(0, to)); }, null, 1.45)
        .to(veil, { opacity: 0, duration: 1, ease: "power2.out" }, 1.7);
    });
  }

  // ── First Appearance ──
  function introTl() {
    const header = [".ps-logo", ".ps-menu-btn", ".ps-sound"];
    document.documentElement.classList.remove("ps-intro-wait");
    gsap.set(header, { scale: 0, opacity: 0 });
    const r = "power3.out", i = "power3.inOut";
    // Word cycling turns on 8s after the hero settles (original — the first change comes 16~20s later)
    const tl = gsap.timeline({ id: "homepage-initial-animation" });
    setTimeout(cycle, 8000);
    beat();
    tl.from(preview, { clipPath: "inset(25.97% 50% round 20px)", duration: 2, ease: r }, "firstPart")
      .from(".player__dots--tl, .player__dots--bl", { left: "50%", duration: 2, ease: r }, "firstPart")
      .from(".player__dots--tr, .player__dots--br", { right: "50%", duration: 2, ease: r }, "firstPart")
      .from(playBtn, { scale: 0, duration: 0.3 }, "firstPart+=1")
      .fromTo(".center__line", { scaleX: 0, visibility: "hidden" }, { scaleX: 1, visibility: "visible", duration: 2, ease: r }, "firstPart")
      .fromTo(".center__part--left", { xPercent: 100, x: -4 }, { xPercent: 0, x: 0, duration: 2, ease: r }, "firstPart")
      .fromTo(".center__part--right", { xPercent: -100, x: 3 }, { xPercent: 0, x: 0, duration: 2, ease: r }, "firstPart");
    scrambleIn(coordChars, { tl, at: "firstPart", dur: 4.5, amount: 1, set: SCR_SYM });
    scrambleIn(ctlChars, { tl, at: "firstPart+=0.5", dur: 2.3, amount: 0.9 });
    tl.fromTo(".circle", { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 2, ease: r }, "firstPart")
      .from(".circle-path-1, .circle-path-2", { strokeDashoffset: 626.43, duration: 1.85, ease: i }, "firstPart+=0.3")
      .from(".circle-dots", { autoAlpha: 0, rotate: 0, duration: 1.85, ease: i }, "firstPart+=0.3")
      .add("secondPart", "firstPart+=1.2");
    scrambleIn(psyChars, { tl, at: "secondPart", dur: 3.2, amount: 0.85 });
    tl.set(".psy__h, .psy__v", { visibility: "visible" }, "secondPart")
      .from(".psy__h", { xPercent: -100, duration: 1.85, ease: "power4.out" }, "secondPart")
      .from(".psy__v", { yPercent: -100, duration: 1.85, ease: "power4.out" }, "secondPart")
      .fromTo(".top-text__cta", { xPercent: 175, visibility: "hidden" }, { xPercent: 0, visibility: "visible", duration: 1.15, ease: "power4.out" }, "secondPart")
      .to(ctaVisible, { duration: 1.4, ease: "none", scrambleText: { text: "{original}", chars: SCR_UP, tweenLength: false } }, "secondPart+=0.5");
    scrambleIn(agencyChars, { tl, at: "secondPart", dur: 3.2, amount: 0.85 });
    tl.from(innoChars, { opacity: 0, duration: 0.01, stagger: { amount: 0.4, from: "random" } }, "secondPart")
      .fromTo(".bottom-text__b span", { xPercent: -175, visibility: "hidden" }, { xPercent: 0, visibility: "visible", duration: 1.15, ease: "power4.out" }, "secondPart")
      .from(imagineChars, { opacity: 0, duration: 0.01, stagger: { amount: 0.4, from: "random" } }, "secondPart")
      .to(header, { scale: 1, opacity: 1, duration: 0.75, ease: "power3.out" }, "secondPart+=0.2")
      .add("finalPart", "secondPart+=1.2")
      .set(".dots-arrow", { visibility: "visible" }, "finalPart")
      .fromTo(".dots-arrow__icon i", { opacity: 0 }, { opacity: 1, duration: 1, stagger: { each: 0.05, from: "random" }, ease: "rough({ template: power1.out, strength: 5, points: 20, taper: 'none', randomize: true, clamp: false })" }, "finalPart");
    return tl;
  }

  // ── Pinned scroll ──
  const mistP = { p: 0 };
  // Showreel light leaks into the fog — stronger as the video grows (p), and clears once the pull toward the card orbit begins (pull 0 → .35). Re-measured every frame
  function bleed() {
    const m = mist();
    if (!m) return;
    const p = mistP.p, on = p * (1 - ve(0, 0.35, Q.pull));
    m.set("uForm", 1 - p);
    if (on <= 1e-3 || preview.style.visibility === "hidden") { m.setWindow(null); return; }
    const r = preview.getBoundingClientRect();
    m.setWindow({ left: r.left - 40, top: r.top - 40, right: r.right + 40, bottom: r.bottom + 40 }, on);
  }
  function scroller() {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
      const $d = 1.3, Nt = $d * 0.45, Pt = Nt * 0.35;
      const tl = gsap.timeline({
        id: "homepage-scroll-animation",
        scrollTrigger: { id: "homepage-hero-scrolltrigger", trigger: intro, pin: true, start: "top top", end: () => `+=${Math.round(innerHeight * TOTAL)}`, scrub: 0.5, invalidateOnRefresh: true },
      });
      const out = "output-of-elements";
      const pd = (sel, k) => ({ [k]: () => `${(-48 / (k === "top" || k === "bottom" ? player.offsetHeight : player.offsetWidth)) * 100}%` });
      tl.fromTo(".bottom-text__b span", { xPercent: 0 }, { xPercent: -175, duration: $d, ease: "power1.out" }, out)
        .fromTo(".bottom-text__b span", { opacity: 1 }, { opacity: 0, duration: Nt, ease: "power1.out" }, out)
        .fromTo(".bottom-text__a", { xPercent: 0 }, { xPercent: -125, duration: $d, ease: "power1.out" }, out)
        .fromTo(".bottom-text__a", { opacity: 1 }, { opacity: 0, duration: Nt, ease: "power1.out" }, out)
        .fromTo(".top-text__cta", { xPercent: 0 }, { xPercent: 260, duration: $d, ease: "power1.out" }, out)
        .fromTo(".top-text__cta", { opacity: 1 }, { opacity: 0, duration: Nt, ease: "power1.out" }, out)
        .fromTo(agencyChars, { opacity: 1 }, { opacity: 0, duration: 0.01, stagger: { amount: 0.4, from: "random" } }, out)
        .fromTo(".top-text__word", { xPercent: 0 }, { xPercent: 175, duration: $d, ease: "power1.out" }, out)
        .fromTo(".top-text__word", { opacity: 1 }, { opacity: 0, duration: Nt, ease: "power1.out" }, out)
        .fromTo(psyChars, { opacity: 1 }, { opacity: 0, duration: 0.01, stagger: { amount: 0.4, from: "random" } }, out)
        .to(".psy__h, .psy__v", { opacity: 0, duration: 0.01 }, out + "+=0.15")
        .fromTo(".dots-arrow__icon i", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.5, stagger: { each: 0.04, from: "random" }, ease: "rough({ template: circ.easeOut, strength: 5, points: 20, taper: 'out', randomize: true, clamp: true })" }, out)
        .fromTo(mistP, { p: 0 }, { p: 1, duration: 1.8, ease: "power1.out", onUpdate: () => home.gl?.reveal(smooth01((mistP.p - 0.08) / 0.72)) }, out)
        .to(".circle", { rotate: 120, duration: $d, ease: "power1.out" }, out)
        .to(".circle", { opacity: 0, duration: Pt, ease: "power1.out" }, out)
        .fromTo(".center__line, .center__part--left, .center__part--right", { opacity: 1 }, { opacity: 0, duration: Pt, ease: "power1.out" }, out)
        .fromTo(".center__text--play, .center__text--time", { opacity: 0.5 }, { opacity: 0, duration: Pt, ease: "power1.out" }, out)
        .fromTo(".center__text--play", { x: 0 }, { x: () => innerWidth * 0.5, duration: $d, ease: "power3.out" }, out)
        .fromTo(".center__text--time", { x: 0 }, { x: () => -innerWidth * 0.5, duration: $d, ease: "power3.out" }, out)
        .fromTo(".center__line", { scaleX: 1 }, { scaleX: 0, duration: $d, ease: "power3.out" }, out)
        .fromTo(".center__part--left", { xPercent: 0, x: 0 }, { xPercent: 100, x: -4, duration: $d, ease: "power3.out" }, out)
        .fromTo(".center__part--right", { xPercent: 0, x: 0 }, { xPercent: -100, x: 3, duration: $d, ease: "power3.out" }, out)
        .fromTo(".player__dots--tl", { top: "37.18%", left: "26.5%" }, { ...pd(0, "top"), ...pd(0, "left"), duration: $d, ease: "power1.out" }, out)
        .fromTo(".player__dots--tr", { top: "37.18%", right: "26.5%" }, { ...pd(0, "top"), ...pd(0, "right"), duration: $d, ease: "power1.out" }, out)
        .fromTo(".player__dots--bl", { bottom: "37.18%", left: "26.5%" }, { ...pd(0, "bottom"), ...pd(0, "left"), duration: $d, ease: "power1.out" }, out)
        .fromTo(".player__dots--br", { bottom: "37.18%", right: "26.5%" }, { ...pd(0, "bottom"), ...pd(0, "right"), duration: $d, ease: "power1.out" }, out)
        .to(".player__dots", { autoAlpha: 0, duration: $d * 0.6, ease: "power1.out" }, out)
        .to(".player__dots", { width: 140, duration: 1, ease: "power1.out" }, out + "+=0.75")
        .fromTo(preview, { scale: 0.45, clipPath: "inset(25.97% 0% round 20px)" }, { scale: 1, clipPath: "inset(0% 0% round 20px)", duration: 1.8, ease: "power1.out" }, out)
        .set(playerTxt, { visibility: "visible" }, out)
        .fromTo(".player__txt", { visibility: "hidden" }, { visibility: "visible", duration: 0.01 }, out);
      tl.to(playerTxt, { duration: 2, scrambleText: { text: "{original}", chars: SCR_UP, tweenLength: false } }, out + "+=0.3")
        .from(playerTxt, { opacity: 0, duration: 0.01, stagger: { amount: 0.5, from: "random" } }, out + "+=0.3");
      const t = tl.duration();
      tl.fromTo(Q, { pull: 0 }, { pull: 1, duration: t * Z.pull, ease: "none" }, t)
        .fromTo(Q, { hold: 0 }, { hold: 1, duration: t * Z.hold, ease: "none" }, t * (1 + Z.pull))
        .fromTo(Q, { push: 0 }, { push: 1, duration: t * Z.push, ease: "none" }, t * (1 + Z.pull + Z.hold));
      startOrbit(true);
      return () => { stopOrbit(); };
    });
    mm.add("(max-width: 768px), (prefers-reduced-motion: reduce)", () => {
      gsap.set(preview, { scale: 1, clipPath: "inset(0% 0% round 0px)" });
      startOrbit(false);
      return () => stopOrbit();
    });
  }

  // ── Orbit math (original orbit=1: width .62 turn · spacing .88 geometric ratio · front 1.25x → end .4x · end opacity .22 · deep card blur 1.6px) ──
  const TE = { span: 0.62, gap: 0.88, s0: 1.25, s1: 0.4, o1: 0.22 };
  const WHOLE = Math.PI * 2;
  const offs = (() => { const r = (TE.span * WHOLE * (1 - TE.gap)) / (1 - TE.gap ** Math.max(N - 1, 1)); const a = [0]; for (let t = 1; t < N; t++) a.push(a[t - 1] + r * TE.gap ** (t - 1)); return a; })();
  function pose(e, L) {
    const i = (N - e) % N, a = i / (N - 1);
    const o = L - offs[i], s = (Math.sin(o) + 1) / 2, c = TE.s0 * (TE.s1 / TE.s0) ** a;
    return { a: o, s: c * (0.82 + 0.18 * s), z: Math.round(s * 100), o: (1 - (1 - TE.o1) * a ** 0.85) * (0.65 + 0.35 * s), b: a > 0.35 ? ((a - 0.35) / 0.65) * 1.6 : 0 };
  }
  const KE = (Math.PI * 2 * 2) / 12, GE = KE / Z.hold;
  const preTravel = (() => { let e = 0; for (let t = 0; t < 60; t++) e += 1 / 5.6 ** (1 - ye((t + 0.5) / 60)); return (e / 60) * Z.pull * GE; })();
  let L = Math.PI / 2 - preTravel;
  const K = { roll: 0, rollTo: -1, rollTween: null, live: false, travelled: undefined, handover: false, arrived: false };
  let ticking = false, lastT = 0, inView = true;

  function layout(handover) {
    const W = stage.clientWidth, H = stage.clientHeight, card = cards[0];
    const rx = handover ? W / 2 - card.offsetWidth * 0.425 : W * (W < 600 ? 0.58 : 0.385);
    const ry = handover ? H / 2 - card.offsetHeight * 0.5 : H * (W < 600 ? 0.37 : 0.35);
    return cards.map((el, n) => { const p = pose(n, L); return { el, x: Math.cos(p.a) * rx, y: Math.sin(p.a) * ry, s: p.s, z: p.z, o: p.o, b: p.b }; });
  }
  const geo = (e, t, n) => { // Scale sizes by a geometric ratio, with positions at the same ratio
    const r = t.w / e.w, w = e.w * r ** n, k = Math.abs(r - 1) < 1e-4 ? n : (w / e.w - 1) / (r - 1), asp = e.w / e.h + (t.w / t.h - e.w / e.h) * n;
    return { x: e.x + (t.x - e.x) * k, y: e.y + (t.y - e.y) * k, w, h: w / asp };
  };
  const wordsTl = (() => {
    const t = $(".bday__text");
    const ch = [...split($(".bday__lead")), ...split($(".bday__big"))];
    const lede = split($(".bday__lede"));
    return gsap.timeline({ paused: true }).set(t, { visibility: "visible" }, 0)
      .from(ch, { opacity: 0, duration: 0.01, stagger: { amount: 0.5, from: "random" } }, 0)
      .from(lede, { opacity: 0, duration: 0.01, stagger: { amount: 0.4, from: "random" } }, 0.2)
      .fromTo(".bday__go", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "rough({ template: circ.easeOut, strength: 5, points: 20, taper: 'out', randomize: true, clamp: true })" }, 0.35)
      .fromTo(".bday__corner", { opacity: 0 }, { opacity: 0.5, duration: 0.01, stagger: 0.1 }, 0.1)
      .to(".bday__corner", { duration: 0.7, ease: "none", scrambleText: { text: "{original}", chars: SCR_UP, tweenLength: false }, stagger: 0.1 }, 0.1);
  })();

  function render(handover) {
    const list = layout(handover);
    if (!handover) {
      list.forEach(({ el, x, y, s, z, o, b }) => { el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${s})`; el.style.zIndex = z; el.style.opacity = o; el.style.filter = b ? `blur(${b.toFixed(2)}px)` : ""; });
      return;
    }
    const a = G(Q.pull), o = G(Q.push);
    if (a <= 0 && K.roll <= 0) {
      if (K.arrived) { K.arrived = false; party.active(false); }
      if (K.live) {
        K.live = false; bday.classList.remove("is-live", "is-held");
        gsap.set(preview, { x: 0, y: 0 }); preview.style.visibility = "";
        leadCase.classList.remove("is-hidden");
        wordsTl.progress(0);
      }
      return;
    }
    if (!K.live) { K.live = true; bday.classList.add("is-live"); }
    const c = ye(a), l = ye(o);
    // When the lead card leaves the first case slot (going back up), stop the confetti
    if (l < 0.999 && K.arrived) { K.arrived = false; party.active(false); }
    const u = +(a >= 0.6);
    if (u !== K.rollTo) { K.rollTo = u; K.rollTween?.kill(); K.rollTween = gsap.to(K, { roll: u, duration: u ? 0.85 : 0.45, ease: u ? "power4.inOut" : "power2.out" }); }
    const d = stage.getBoundingClientRect(), p = d.left + d.width / 2, h = d.top + d.height / 2;
    const r = list[REEL], i = list[LEAD], g = cards[REEL].offsetWidth, _ = cards[REEL].offsetHeight;
    const v = (e) => ({ x: p + e.x, y: h + e.y, w: g * e.s, h: _ * e.s });
    let b, x, S = null;
    if (l > 0) {
      const t = leadCase.querySelector(".case__media").getBoundingClientRect();
      b = i; x = geo(v(i), { x: t.left + t.width / 2, y: t.top + t.height / 2, w: t.width, h: t.height }, l);
    } else {
      b = r;
      const pr = player.getBoundingClientRect();
      S = { x: pr.left + pr.width / 2, y: pr.top + pr.height / 2, w: pr.width, h: pr.height };
      x = geo(S, v(r), c);
    }
    const w = x.w / (g * b.s);
    K.Z = w;
    const te = ve(0, 0.2, c), T = 1 - ve(0.25, 0.85, l);
    list.forEach((e) => {
      const el = e.el, nx = x.x - p + (e.x - b.x) * w, ny = x.y - h + (e.y - b.y) * w;
      el.style.filter = e.b ? `blur(${e.b.toFixed(2)}px)` : "";
      if (e === i && l > 0) {
        el.style.width = `${x.w}px`; el.style.height = `${x.h}px`; el.style.aspectRatio = "auto";
        el.style.transform = `translate(-50%, -50%) translate(${nx}px, ${ny}px)`;
        el.style.borderRadius = `${4 * e.s + (10 - 4 * e.s) * l}px`; el.style.zIndex = "200"; el.style.filter = "";
        const done = l >= 0.999;
        el.style.opacity = done ? "0" : String(e.o + (1 - e.o) * G(l * 5));
        leadCase.classList.toggle("is-hidden", !done);
        if (done && !K.arrived) { K.arrived = true; gsap.timeline().to(leadCase, { scale: 1.012, duration: 0.14, ease: "power2.out" }).to(leadCase, { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.6)", clearProps: "scale" }); party.active(true); }
        return;
      }
      el.style.transform = `translate(-50%, -50%) translate(${nx}px, ${ny}px) scale(${e.s * w})`;
      if (e === i && el.style.width) { el.style.width = ""; el.style.height = ""; el.style.aspectRatio = ""; el.style.borderRadius = ""; }
      el.style.zIndex = String(e.z);
      if (e === r) {
        el.style.opacity = K.roll > 0 ? String((e.o + (1 - e.o) * (1 - c)) * T) : "0";
        el.firstElementChild.style.transform = K.roll < 1 ? `translateY(${(1 - K.roll) * 100}%)` : "";
        return;
      }
      el.style.opacity = String(e.o * te * T);
    });
    if (l <= 0) leadCase.classList.add("is-hidden");
    wordsTl.progress((G((a - 0.65) / 0.35) * 0.4 + G(G(Q.hold) / 0.6) * 0.6) * (1 - G(o / 0.5)));
    bday.classList.toggle("is-held", K.roll >= 1 && l <= 0.001);
    if (K.roll >= 1 || b !== r) { preview.style.visibility = "hidden"; }
    else {
      preview.style.visibility = "";
      const e = x.w / S.w, tt = Math.min(1, S.w / S.h / (x.w / x.h)), n = ((1 - tt) / 2) * 100, rad = (20 + (4 * b.s - 20) * c) / e;
      gsap.set(preview, { x: x.x - S.x, y: x.y - S.y - K.roll * x.h, scale: e, clipPath: `inset(${n + K.roll * tt * 100}% 0% ${n}% 0% round ${rad}px)` });
    }
  }
  function tick(time) {
    const dt = lastT ? Math.min(0.1, time - lastT) : 0.016;
    lastT = time;
    if (K.handover) {
      const e = Math.max(K.Z || 1, 1), a = Q.pull * Z.pull + Q.hold * Z.hold + Q.push * Z.push;
      if (K.travelled === undefined) K.travelled = a;
      L += ((a - K.travelled) * GE) / e; K.travelled = a; L += (dt * 0.09) / e;
    } else L += dt * 0.09;
    if (!reduce) render(K.handover);
  }
  let io = null;
  function startOrbit(handover) {
    K.handover = handover;
    L = handover ? Math.PI / 2 - preTravel : Math.PI / 2;
    render(handover);
    if (reduce) return;
    io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView && !ticking) { ticking = true; lastT = 0; gsap.ticker.add(tick); } else if (!inView && ticking) { ticking = false; gsap.ticker.remove(tick); } });
    io.observe(handover ? intro : bday);
  }
  function stopOrbit() {
    io?.disconnect(); io = null;
    if (ticking) { gsap.ticker.remove(tick); ticking = false; }
    cards.forEach((c) => { c.removeAttribute("style"); c.firstElementChild?.removeAttribute("style"); });
    gsap.set(preview, { clearProps: "x,y,transform,visibility" });
    leadCase.classList.remove("is-hidden");
  }

  // ── Confetti and balloons (original BirthdayParty): 64 pieces from cannons at both ends (speed 1100~2000) · gravity 900 · drag 2.1~2.8 · up to 7 balloons (rising 85~125px/s, pop into 28 pieces on touch) ──
  const party = (() => {
    const cv = $(".party");
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, raf = 0, last = 0, clock = 0, nextBits = 0, nextBalloon = 0, first = true, active = false;
    const bits = [], balloons = [];
    const O = (a, b) => a + Math.random() * (b - a);
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    let COL = [], BAL = [];
    const colors = () => {
      const h = window.PS.cssHex;
      const ink = h("--kf-ink"), acc = h("--kf-accent"), cy = h("--site-cyan"), soft = h("--kf-ink-soft"), pk = h("--site-pink"), gd = h("--site-gold");
      COL = [ink, ink, ink, acc, acc, acc, cy, cy, soft, pk, gd];
      BAL = [[acc, h("--kf-accent-soft")], [soft, ink], [h("--site-tint"), cy], [pk, h("--site-salmon")], [gd, h("--site-beige")]];
    };
    const size = () => { const r = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * r; cv.height = H * r; ctx.setTransform(r, 0, 0, r, 0, 0); };
    const bit = (x, y, vx, vy) => { if (bits.length >= 520) return; const i = Math.random(); bits.push({ x, y, vx, vy, rot: O(0, 6.28), vr: O(-7, 7), flip: O(0, 6.28), vflip: O(6, 14), w: i < 0.18 ? 5 : i < 0.32 ? O(3, 4) : O(7, 11), h: i < 0.18 ? 5 : i < 0.32 ? O(14, 20) : O(4, 6), dot: i < 0.18, color: pick(COL), drag: O(2.1, 2.8), wob: O(0, 6.28) }); };
    const balloon = (e = 0) => { if (balloons.length >= 7) return; const left = Math.random() < 0.5, r = O(20, 30), [body, shine] = pick(BAL); balloons.push({ x: W * (left ? O(0.05, 0.27) : O(0.73, 0.95)), y: H + r * 1.4 + e * 110, vy: -O(85, 125), r, body, shine, ph: O(0, 6.28), t: 0 }); };
    function burst() {
      const n = Math.round((W < 600 ? 38 : 64) * (first ? 1 : 0.4));
      for (const side of [-1, 1]) {
        const ox = side < 0 ? W * 0.03 : W * 0.97, oy = H + 8;
        for (let k = 0; k < n; k++) { const a = -Math.PI / 2 - side * O(0.18, 0.62), v = O(1100, 2000) * Math.max(0.6, Math.min(1.4, H / 720)); bit(ox, oy, Math.cos(a) * v, Math.sin(a) * v); }
      }
      balloon(0); if (first) { balloon(0.6); balloon(1.3); }
      first = false;
    }
    function pop(i) {
      const b = balloons[i]; balloons.splice(i, 1);
      for (let k = 0; k < 28; k++) { const a = O(0, 6.28), v = O(220, 620); bit(b.x + Math.cos(a) * b.r * 0.6, b.y + Math.sin(a) * b.r * 0.7, Math.cos(a) * v, Math.sin(a) * v - 120); if (k % 3) bits[bits.length - 1].color = b.body; }
    }
    addEventListener("pointermove", (e) => { if (!raf) return; for (let i = balloons.length - 1; i >= 0; i--) { const b = balloons[i], dx = (e.clientX - b.x) / b.r, dy = (e.clientY - b.y) / (b.r * 1.18); if (dx * dx + dy * dy <= 1) { pop(i); return; } } }, { passive: true });
    function step(dt) {
      clock += dt;
      if (active) {
        if (clock >= nextBits) { nextBits = clock + O(0.07, 0.13); bit(O(0, W), -12, O(-30, 30), O(30, 90)); }
        if (clock >= nextBalloon) { nextBalloon = clock + (bits.length < 200 ? O(2.6, 3.8) : O(1.4, 2.4)); balloon(); }
      }
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i], k = Math.exp(-b.drag * dt);
        b.vx *= k; b.vy = b.vy * k + 900 * dt * 0.45;
        const sway = b.vy > 0 ? Math.sin(clock * 3.2 + b.wob) * 55 : 0;
        b.x += (b.vx + sway) * dt; b.y += b.vy * dt; b.rot += b.vr * dt; b.flip += b.vflip * dt;
        if (b.y > H + 40 || b.x < -80 || b.x > W + 80) bits.splice(i, 1);
      }
      for (let i = balloons.length - 1; i >= 0; i--) { const b = balloons[i]; b.t += dt; b.vy -= 14 * dt; b.y += b.vy * dt; b.x += Math.sin(b.t * 1.1 + b.ph) * 16 * dt; if (b.y + b.r * 5 < 0) balloons.splice(i, 1); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const b of balloons) {
        const rx = b.r, ry = b.r * 1.18, sw = Math.sin(b.t * 1.6 + b.ph) * rx * 0.5;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.sin(b.t * 1.1 + b.ph) * 0.09);
        ctx.beginPath(); ctx.moveTo(0, ry + 4); ctx.bezierCurveTo(sw, ry + rx * 1.2, -sw, ry + rx * 2.2, sw * 0.4, ry + rx * 3.4);
        ctx.globalAlpha = 0.35; ctx.strokeStyle = COL[0]; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.moveTo(0, ry - 1); ctx.lineTo(-3.5, ry + 5); ctx.lineTo(3.5, ry + 5); ctx.closePath(); ctx.fillStyle = b.body; ctx.fill();
        const gr = ctx.createRadialGradient(-rx * 0.35, -ry * 0.4, rx * 0.08, 0, 0, ry * 1.1);
        gr.addColorStop(0, b.shine); gr.addColorStop(0.45, b.body); gr.addColorStop(1, b.body);
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283); ctx.fillStyle = gr; ctx.globalAlpha = 0.95; ctx.fill();
        ctx.beginPath(); ctx.ellipse(-rx * 0.38, -ry * 0.42, rx * 0.12, ry * 0.24, -0.5, 0, 6.283); ctx.fillStyle = COL[0]; ctx.globalAlpha = 0.55; ctx.fill();
        ctx.restore();
      }
      for (const b of bits) {
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
        const f = Math.cos(b.flip); ctx.scale(1, f); ctx.globalAlpha = 0.55 + 0.45 * Math.abs(f); ctx.fillStyle = b.color;
        if (b.dot) { ctx.beginPath(); ctx.arc(0, 0, b.w / 2, 0, 6.283); ctx.fill(); } else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
    }
    function frame(t) {
      const dt = Math.min(0.033, (t - last) / 1000); last = t;
      step(dt); draw();
      if (active || bits.length || balloons.length) raf = requestAnimationFrame(frame);
      else { raf = 0; ctx.clearRect(0, 0, W, H); cv.style.display = "none"; }
    }
    function run() { if (raf || reduce) return; cv.style.display = "block"; last = performance.now(); raf = requestAnimationFrame(frame); }
    let lastPop = -1e9;
    if (!reduce) { colors(); size(); addEventListener("resize", size); }
    return {
      pop() { if (reduce) return; const n = performance.now(); if (n - lastPop > 1400) { lastPop = n; burst(); } nextBalloon = clock + 1.6; run(); },
      active(on) { if (reduce) return; if (on && !active) { active = true; this.pop(); } else if (!on) active = false; },
    };
  })();
  // Burst when the first case settles into place (lead card arrives) and keep sprinkling until the intro lines have passed. Phone: when the first case is visible
  function partyZone() {
    if (!window.ScrollTrigger || reduce) return;
    ScrollTrigger.create({ trigger: ".intro", start: "top bottom", end: "bottom top", onLeave: () => party.active(false), onEnterBack: () => { if (K.arrived || !K.handover) party.active(true); } });
    ScrollTrigger.create({ trigger: ".cases--top", start: "top 60%", onEnter: () => { if (!K.handover) party.active(true); } });
  }

  // ── About lines: letters .3 → 1 in random order per line (scrub, start -15% 75% · end 115% 70%) · only the hovered line brightens ──
  function introLines() {
    const root = $(".intro-lines");
    const lines = $$(".intro-lines__line", root);
    lines.forEach((ln) => {
      const w = $(".intro-lines__words", ln);
      split(w, "ich");
      w.addEventListener("mouseenter", () => { root.classList.add("is-hover"); lines.forEach((l) => l.classList.toggle("is-on", l === ln)); });
      w.addEventListener("mouseleave", () => { root.classList.remove("is-hover"); lines.forEach((l) => l.classList.remove("is-on")); });
    });
    if (reduce) { $$(".ich", root).forEach((c) => (c.style.opacity = 1)); return; }
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root, start: "-15% 75%", end: "115% 70%", scrub: true } });
    lines.forEach((ln) => tl.to($$(".ich", ln), { opacity: 1, duration: 0.2, stagger: { amount: 0.8, from: "random" } }));
  }

  // ── Mist glow around images: pass the visible work-card positions to the shader (original MistCard) ──
  function cardLights() {
    const m = mist();
    if (!m) return;
    const media = $$(".case__media");
    const pal = m.palette;
    const prev = m.onFrame;
    m.onFrame = (dt) => {
      prev && prev(dt);
      if (K.handover) bleed();
      const list = [];
      for (let i = 0; i < media.length && list.length < 6; i++) {
        const r = media[i].getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) continue;
        if (media[i].closest(".is-hidden")) continue;
        list.push({ rect: r, color: pal[(i * 2 + 1) % pal.length] });
      }
      m.setCards(list);
    };
  }

  // ── Count-up numbers · blurred word reveal · check bar ──
  function counts() {
    $$("[data-count]").forEach((el) => {
      const to = Number(el.dataset.count), suf = el.dataset.suffix || "";
      if (reduce) { el.textContent = to + suf; return; }
      const o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: to, duration: 2, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v) + suf) }) });
    });
    const t = $("[data-dim-words]");
    if (t) {
      const spans = $$("span", t);
      spans.forEach((s) => s.classList.add("w"));
      if (!reduce) gsap.to(spans, { opacity: 1, stagger: 0.3, ease: "none", scrollTrigger: { trigger: t, start: "top 80%", end: "bottom 45%", scrub: true } });
    }
    // Free audit card (original DesignAuditPromoCard): on hover the score 42→87 and five bars fill in .7s power2.out (stagger .05) and the title rolls in .5s.
    // On leaving, 42·[.35,.55,.42,.48,.6] with .7s power2.inOut
    const promo = $("[data-promo]"), fills = $$(".promo__bars [data-fill]"), num = $(".promo__num b"), title = $("[data-promo-title]");
    const REST = [0.35, 0.55, 0.42, 0.48, 0.6], UP = [0.92, 0.78, 0.88, 0.84, 0.95];
    gsap.set(fills, { scaleX: (i) => REST[i] });
    const score = { v: 42 };
    const setScore = (to, ease) => gsap.to(score, { v: to, duration: reduce ? 0 : 0.7, ease, overwrite: true, onUpdate: () => (num.textContent = Math.round(score.v)) });
    if (promo && !reduce) {
      promo.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        setScore(87, "power2.out");
        gsap.to(fills, { scaleX: (i) => UP[i], duration: 0.7, ease: "power2.out", stagger: 0.05, overwrite: true });
        if (!gsap.isTweening(title)) gsap.to(title, { duration: 0.5, ease: "none", scrambleText: { text: "{original}", chars: SCR_SYM, tweenLength: false }, overwrite: true });
      });
      promo.addEventListener("pointerleave", (e) => {
        if (e.pointerType !== "mouse") return;
        setScore(42, "power2.inOut");
        gsap.to(fills, { scaleX: (i) => REST[i], duration: 0.7, ease: "power2.inOut", stagger: 0.05, overwrite: true });
      });
    }
  }

  // ── Client logo cells (original HomeLogoRoll index) — starting 1.6s in, every 1.7~2.6s, while the panel is visible, one cell (avoiding the previous cell and its neighbors) is swapped for a logo not yet shown.
  // Old logo: stripe-on width 4→0px · up 4px over .5s power2.in. New logo: 0→4px · from 4px below into place over .7s power2.out(+.3) ──
  function logoIndex() {
    const box = $(".logo-index");
    if (!box || reduce) return;
    const cells = $$(":scope > span", box), TOTAL_LOGOS = 14;
    const shown = cells.map((_, i) => i);
    let pool = [], last = -9, seen = false;
    new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(box);
    const pick = () => { if (!pool.length) pool = gsap.utils.shuffle([...Array(TOTAL_LOGOS).keys()].filter((i) => !shown.includes(i))); return pool.pop(); };
    const step = () => {
      gsap.delayedCall(gsap.utils.random(1.7, 2.6), step);
      if (!seen || document.hidden) return;
      const free = cells.map((_, i) => i).filter((i) => cells[i].offsetParent && !cells[i].dataset.busy && Math.abs(i - last) > 1);
      if (!free.length) return;
      const s = free[Math.floor(Math.random() * free.length)], k = pick();
      if (k === undefined) return;
      last = s;
      const cell = cells[s], old = cell.lastElementChild, fresh = old.cloneNode(false);
      fresh.removeAttribute("style");
      fresh.textContent = `Logo ${k + 1}`;
      fresh.classList.add("is-scanning");
      fresh.style.setProperty("--on", "0px");
      fresh.style.setProperty("--phase", "2px");
      old.classList.add("is-scanning");
      old.style.setProperty("--on", "4px");
      cell.append(fresh);
      cell.dataset.busy = "1";
      shown[s] = k;
      gsap.timeline({ onComplete: () => { old.remove(); fresh.classList.remove("is-scanning"); gsap.set(fresh, { clearProps: "transform" }); delete cell.dataset.busy; } })
        .to(old, { "--on": "0px", y: -4, duration: 0.5, ease: "power2.in" }, 0)
        .fromTo(fresh, { "--on": "0px", y: 4 }, { "--on": "4px", y: 0, duration: 0.7, ease: "power2.out" }, 0.3);
    };
    gsap.delayedCall(1.6, step);
  }

  // ── News card: on hover the title keeps its size, rolls through symbols for .5s, then returns (original HomeNewsCard) ──
  function newsCards() {
    if (reduce) return;
    $$(".news-card").forEach((c) => c.addEventListener("mouseenter", () => {
      const t = $("p", c);
      if (!t || gsap.isTweening(t)) return;
      gsap.set(t, { width: t.offsetWidth - 1, height: t.offsetHeight });
      gsap.to(t, { duration: 0.5, ease: "none", scrambleText: { text: "{original}", chars: window.PS.SCR_SYM, tweenLength: false }, overwrite: true, onComplete: () => gsap.set(t, { clearProps: "all" }) });
    }));
  }

  // ── Awards table: clicking a tab switches the rows and the text scrambles for .7s (original js-scramble) ──
  function awards() {
    const list = $(".awards__list");
    const rows = (k) => Array.from({ length: 6 }, (_, i) => [`Award ${((i + k) % 7) + 1}`, ["Award Name 01", "Award 02", "Award Name Three", "Award Name 04", "Award Name — Category", "Award 06"][(i + k) % 6], i % 3 === 2 ? "Our Studio" : `Project ${String.fromCharCode(65 + ((i + k) % 5))}`, String(2022 + ((i + k) % 4))]);
    const paint = (k, animate) => {
      list.innerHTML = rows(k).map(([pf, prize, proj, yr], i) => `<li class="award"><span class="pf"><i class="wf-logo">${pf}</i></span><span class="scr">${prize}</span><span>${i % 3 === 2 ? `<span class="scr">${proj}</span>` : `<a href="detail.html" class="scr">${proj}</a>`}</span><span class="yr scr">${yr}</span></li>`).join("");
      if (animate && !reduce) $$(".scr", list).forEach((el, i) => gsap.to(el, { duration: 0.7, delay: Math.floor(i / 3) * 0.06, ease: "none", scrambleText: { text: "{original}", chars: SCR_SYM, tweenLength: false } }));
    };
    paint(0, false);
    $$(".awards__tab").forEach((b, k) => b.addEventListener("click", () => {
      $$(".awards__tab").forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", String(x === b)); });
      paint(k, true);
    }));
    let pg = 0;
    const pages = $$(".awards__pages button"), label = $(".awards__pages span");
    pages.forEach((b, d) => b.addEventListener("click", () => { pg = (pg + (d ? 1 : -1) + 2) % 2; label.textContent = `0${pg + 1} / 02`; paint(pg * 6 + 1, true); }));
    if (!reduce) ScrollTrigger.create({ trigger: list, start: "top 80%", once: true, onEnter: () => paint(0, true) });
  }

  // ── Image cover (original cover helper) — scanline panel is opaque = 1 − Hover, mist overlay = .7 × (1 − hover), the hover value follows by .1 each frame.
  // News art (interaction on the card), orbit card (interaction on the stage · line fixed at 3px even as the card grows), hero preview (scanlines only · lifts when it grows from 45%→70% of the screen) ──
  function overlays() {
    // The original attaches it only on desktop (769px and up)
    if (isPhone()) return;
    const list = [];
    const add = (el, host, veil, o = {}) => {
      el.insertAdjacentHTML("beforeend", (veil ? '<i class="ps-veil" aria-hidden="true"></i>' : "") + '<i class="ps-scan" aria-hidden="true"></i>');
      list.push({ el, host, veil: veil ? $(".ps-veil", el) : null, scan: $(".ps-scan", el), h: 0, ...o });
    };
    $$(".news-card__img").forEach((m) => add(m, m.closest(".news-card"), true));
    cards.forEach((c) => add(c, bday, true, { steady: true }));
    add(preview, preview, false, { lift: true });
    if (reduce) return;
    gsap.ticker.add(() => {
      const H = innerHeight, W = innerWidth;
      for (const o of list) {
        const r = o.el.getBoundingClientRect();
        if (!r.width || !r.height || r.bottom < -50 || r.top > H + 50) continue;
        o.h += ((o.host.matches(":hover") ? 1 : 0) - o.h) * 0.1;
        let s = 1 - o.h;
        if (o.lift) { const n = G((Math.max(r.width / W, r.height / H) - 0.45) / 0.25); s *= 1 - n * n * (3 - 2 * n); }
        if (o.steady) {
          const ex = o.el.offsetWidth ? r.width / o.el.offsetWidth : 1, ey = o.el.offsetHeight ? r.height / o.el.offsetHeight : 1;
          Object.assign(o.scan.style, { width: `${ex * 100}%`, height: `${ey * 100}%`, transformOrigin: "0 0", transform: `scale(${1 / ex}, ${1 / ey})` });
        }
        o.scan.style.backgroundPositionY = `${-(((r.top % 3) + 3) % 3)}px`;
        o.scan.style.opacity = s.toFixed(3);
        if (o.veil) o.veil.style.opacity = (0.7 * s).toFixed(3);
      }
    });
  }

  // Case card hover light — two palette colors bleed on the canvas behind the card
  function caseGlow() {
    const pal = (window.PS.mist?.palette) || [[0.8, 0.3, 0.55], [0.9, 0.22, 0.24]];
    $$(".case__glow").forEach((cv, i) => {
      const c = cv.getContext("2d"); cv.width = 64; cv.height = 40;
      const a = pal[i % pal.length].map((v) => Math.round(v * 255)), b = pal[(i + 3) % pal.length].map((v) => Math.round(v * 255));
      const g = c.createLinearGradient(0, 0, 64, 40); g.addColorStop(0, `rgb(${a})`); g.addColorStop(1, `rgb(${b})`);
      c.fillStyle = g; c.fillRect(0, 0, 64, 40);
    });
  }

  document.addEventListener("ps:ready", () => {
    overlays();
    logoIndex();
    newsCards();
    // Set up the pinned hero first — after the loader, the window load auto-refresh has already passed, so triggers created later see the pin spacing and settle into place
    if (!reduce) scroller();
    introLines();
    counts();
    awards();
    partyZone();
    cardLights();
    caseGlow();
    if (reduce) { document.documentElement.classList.remove("ps-intro-wait"); gsap.set(preview, { scale: isPhone() ? 1 : 0.45 }); startOrbit(false); return; }
    // Phone (original homepage-initial-animation-mobile): the video turns on at .5s and the play button appears at .5s, text rolls for 2.3s (+.2), the pill below rises from 64px below in 1s power3.out (+.7)
    if (isPhone()) {
      document.documentElement.classList.remove("ps-intro-wait");
      gsap.timeline({ id: "homepage-initial-animation-mobile" })
        .from(player, { opacity: 0, duration: 0.5 })
        .from(playBtn, { scale: 0, duration: 0.5 }, "<")
        .to(playerTxt, { duration: 2.3, scrambleText: { text: "{original}", chars: SCR_UP, tweenLength: false } }, "<+=0.2")
        .from(playerTxt, { opacity: 0, duration: 0.01, stagger: { amount: 0.9, from: "random" } }, "<")
        .fromTo(".ps-mnav", { y: 64, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "<+=0.5");
    } else introTl();
    $(".dots-arrow").addEventListener("click", () => {
      const st = ScrollTrigger.getById("homepage-hero-scrolltrigger");
      if (st && window.psLenis) window.psLenis.scrollTo(st.start + (st.end - st.start) / TOTAL, { duration: 1.5, easing: (e) => (e < 0.5 ? 8 * e ** 4 : 1 - (-2 * e + 2) ** 4 / 2) });
    });
  });
})();
