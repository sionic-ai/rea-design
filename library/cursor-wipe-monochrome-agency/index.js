// First page: hero letters rising → white curtain sweep, case text swap (fx:step), emphasized word flash, service → photo column → black curtain → principle sentence pinned timeline.
// Original values (new-home.js): letter scaleY .6s power4 · word and letter gap .03 · intro after 300/800/1200ms · work lines .6s power2.out .08 · name blur .5s .05
// · quote letters .35s power3.out .012 · numbers 1.2s power2.out · flash .1s back and forth, spread .3 random · one beat of fixed timeline = 115vh, scrub .5, sentence range ×1/.6.
(() => {
  const { reduced } = T7;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const splitWords = (el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="word" style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="char" style="display:inline-block">${c}</span>`).join("")}</span>`).join(" ");
  };

  // Hero ---------------------------------------------------------------
  const hero = $(".t7-hero");
  const h1 = $(".t7-hero__h");
  const split = window.Splitting ? Splitting({ target: h1 })[0] : null;
  const wordChars = split ? split.words.map((w) => [...w.querySelectorAll(".char")]) : [];
  if (!reduced) { T7.lock(); gsap.set(wordChars.flat(), { scaleY: 0, transformOrigin: "50% 100%", force3D: true }); }

  const heroIn = () => new Promise((resolve) => {
    if (reduced) { $$(".t7-hero__d, .t7-hero__l, .t7-hero__r").forEach((e) => e.classList.add("is-visible")); return resolve(); }
    const tl = gsap.timeline();
    wordChars.forEach((chars, i) => tl.add(gsap.fromTo(chars, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "power4", stagger: { each: 0.03, from: "start" } }), i * 0.03));
    [[".t7-hero__d", 300], [".t7-hero__l", 800], [".t7-hero__r", 1200]].forEach(([s, d]) => setTimeout(() => $(s)?.classList.add("is-visible"), d));
    tl.then(() => { setTimeout(() => T7.unlock(), 300); setTimeout(resolve, 400); });
  });

  // Case article — the ring part fires fx:step at each step ----------------------------
  const cases = $(".t7-cases");
  const steps = $$(".t7-case", cases);
  if (window.Splitting) Splitting({ target: $$(".t7-case__name, .t7-case__quote h3", cases) });
  const rowsOf = (b) => $$(".t7-case__row", b);
  const nameChars = (b) => $$(".t7-case__name .char", b);
  if (!reduced) {
    steps.forEach((b) => { gsap.set(rowsOf(b), { opacity: 0, y: 25 }); gsap.set(nameChars(b), { filter: "blur(10px) brightness(50%)", opacity: 0.3, display: "inline-block" }); });
  }
  const countTo = (b) => {
    const el = $(".t7-case__num", b), to = +b.dataset.count || 0;
    b._count?.kill();
    if (reduced) { el.textContent = to; return; }
    const c = { v: 0 };
    el.textContent = "0";
    b._count = gsap.to(c, { v: to, duration: 1.2, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(c.v)) });
  };
  const playStep = (b) => {
    if (reduced) { countTo(b); return; }
    gsap.to(rowsOf(b), { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, overwrite: "auto" });
    const nc = nameChars(b);
    gsap.killTweensOf(nc);
    gsap.set(nc, { filter: "blur(5px) brightness(50%)", opacity: 0.3 });
    gsap.to(nc, { filter: "blur(0px) brightness(100%)", opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" });
    const qc = $$(".t7-case__quote .char", b);
    gsap.killTweensOf(qc);
    gsap.set(qc, { transformOrigin: "50% 100%", scaleY: 0 });
    gsap.to(qc, { scaleY: 1, duration: 0.35, ease: "power3.out", stagger: 0.012 });
    countTo(b);
  };
  cases?.addEventListener("fx:step", (e) => {
    const { index, prev } = e.detail;
    if (index < 0) { steps.forEach((b) => gsap.to(rowsOf(b), { opacity: 0, y: 25, duration: 0.3, overwrite: "auto" })); return; }
    if (steps[prev] && !reduced) gsap.to(nameChars(steps[prev]), { filter: "blur(5px) brightness(30%)", opacity: 0.3, duration: 0.25, ease: "power2.inOut" });
    playStep(steps[index]);
  });

  // Emphasis word — letters flash randomly in the background color while accent-color light spreads ---------------
  const flashes = [];
  $$(".t7-flash").forEach((box) => {
    box.innerHTML = [...box.textContent.trim()].map((c) => (c === " " ? " " : `<span class="char-fx">${c}</span>`)).join("");
    flashes.push(box);
  });
  const initFlash = () => flashes.forEach((box) => {
    const chars = $$(".char-fx", box);
    gsap.set(chars, { textShadow: `0px 0px 25px ${T7.rgb("--kf-accent", 0)}` });
    const tl = gsap.timeline({ paused: true }).to(chars, { duration: 0.1, color: T7.rgb("--kf-bg"), textShadow: `0px 0px 25px ${T7.rgb("--kf-accent", 1)}`, repeat: 1, yoyo: true, ease: "power1.inOut", stagger: { amount: 0.3, from: "random" } });
    ScrollTrigger.create({ trigger: box, start: "top 80%", onEnter: () => tl.restart(true), onEnterBack: () => tl.restart(true) });
  });

  // Service background — when the section header enters the upper half of the screen it turns pale gray (.8s) -------------------
  const svc = $(".t7-svc");
  if (svc) new IntersectionObserver((es) => es.forEach((e) => svc.classList.toggle("is-off", e.boundingClientRect.top <= (e.rootBounds ? e.rootBounds.bottom : innerHeight / 2))), { rootMargin: "0px 0px -50% 0px", threshold: 0 }).observe(svc);

  // Service → photo pillar → black curtain → principle sentence ---------------------------------------
  const initCombo = () => {
    const combo = $(".t7-combo"), wrap = $(".t7-cols"), reveal = $(".t7-reveal");
    const L = $(".t7-col--l"), M = $(".t7-col--m"), R = $(".t7-col--r");
    const mids = $$(".t7-mv", M), last = $(".t7-mv--zoom"), beforeLast = mids.filter((m) => m !== last);
    const [w1, w2, w3] = [".t7-rv--1", ".t7-rv--2", ".t7-rv--3"].map((s) => $(s));
    $$(".t7-mid p, .t7-rv h2").forEach(splitWords);
    const mobile = innerWidth < 768;
    const pos = () => {
      const vh = innerHeight, S = 1.6, li = $$(".t7-mv", L), g = parseFloat(getComputedStyle(L).rowGap) || 0, mg = parseFloat(getComputedStyle(M).rowGap) || 0, mh = mids[0].offsetHeight;
      return { leftStart: -(L.offsetHeight - li[li.length - 1].offsetHeight), leftTarget: vh / (2 * S) - (li[0].offsetHeight + g / 2), midStart: vh - mh, midTarget: vh / 2 - (mh + mg / 2) };
    };
    const w = () => innerWidth;
    const midEnd = () => (w() < 768 ? "5%" : w() < 1024 ? "-38%" : w() < 1280 ? "-35%" : "-40%");
    const zoomScale = () => (w() < 768 ? 12 : w() < 1024 ? 7 : w() < 1280 ? 6 : 4.5);
    const zoomY = () => (w() < 768 ? "-35%" : w() < 1024 ? "10%" : w() < 1280 ? "25%" : "30%");
    gsap.set([w1, w2, w3], { xPercent: -50, yPercent: -50, left: "50%", top: "50%", opacity: 0, scale: 1.15 });
    const p0 = pos();
    gsap.set([L, R], { y: p0.leftStart });
    gsap.set(M, { y: p0.midStart });
    const PER = 115, FACTOR = 0.6, LEAD = 0.2 * FACTOR;
    const s0 = Math.max(100, (svc.offsetHeight / innerHeight) * 100) / PER;
    gsap.to(svc, { yPercent: -100, ease: "none", scrollTrigger: { trigger: combo, start: "top top", end: () => `+=${Math.round(s0 * PER)}%`, scrub: true, invalidateOnRefresh: true } });
    const tl = gsap.timeline();
    const s1 = s0;
    tl.to(".t7-col", { rowGap: "40vh", ease: "none", duration: 0.6 }, s1)
      .to([L, R], { y: () => pos().leftTarget, ease: "none", duration: 0.6 }, s1)
      .to(M, { y: () => pos().midTarget, ease: "none", duration: 0.6 }, s1);
    const s2 = s1 + 0.6;
    tl.to(".t7-col", { rowGap: "10vh", ease: "none", duration: 0.6 }, s2)
      .to(wrap, { scale: 1.6, transformOrigin: "center center", ease: "none", duration: 0.6 }, s2)
      .to([L, R], { y: () => pos().leftTarget, ease: "none", duration: 0.6 }, s2)
      .to(M, { y: midEnd, ease: "none", duration: 0.6 }, s2);
    const s3 = s2 + 0.6;
    if (mobile) {
      tl.to(".t7-mv--pre-l", { xPercent: -100, ease: "none", duration: 0.3 }, s3).to(".t7-mv--pre-r", { xPercent: 100, ease: "none", duration: 0.3 }, s3).to(beforeLast, { yPercent: -220, ease: "none", duration: 0.3 }, s3);
    } else {
      tl.to(L, { x: "-35%", ease: "none", duration: 0.3 }, s3).to(R, { x: "35%", ease: "none", duration: 0.3 }, s3).to(beforeLast, { y: "-35%", ease: "none", duration: 0.3 }, s3).to(last, { y: "35%", ease: "none", duration: 0.3 }, s3);
    }
    tl.to(".t7-mid h2", { y: -40, duration: 0.15, ease: "power3.out" }, s3)
      .to(".t7-mid p", { opacity: 1, y: -40, duration: 0.3, ease: "power3.out" }, s3)
      .to(".t7-mid p .char", { opacity: 1, scale: 1, duration: 0.25, stagger: { amount: 0.15, from: "start" }, ease: "power2.out" }, s3);
    const s4 = s3 + 0.3;
    tl.to(M, { rowGap: "10vh", zIndex: 999, ease: "none", duration: 1 }, s4)
      .to(last, { zIndex: 9999, y: zoomY, scale: zoomScale, ease: "power2.inOut", duration: 1 }, s4)
      .to(".t7-mv__dark", { opacity: 1, ease: "power2.inOut", duration: 1 }, s4)
      .set(".t7-mid", { zIndex: -10 }, s4)
      .to(".t7-mid", { opacity: 0, y: -20, duration: 0.3, ease: "power2.in" }, s4 + 0.3)
      .to($$(".t7-mv.wf-img, .t7-mv--zoom > .wf-img", wrap), { opacity: 0, ease: "power1.out", duration: 2 }, s4 + 0.7);
    const s5 = s4 + 0.52;
    const rv = gsap.timeline();
    rv.to(w1, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, ease: "power2.out", duration: 1 }, 0)
      .to($$(".char", w1), { opacity: 1, scale: 1, filter: "blur(0px) brightness(100%)", duration: 0.3, stagger: { each: 0.02, from: "start" }, ease: "power2.out" }, 0)
      .to(w1, { opacity: 0, scale: 0.9, xPercent: -50, yPercent: -50, ease: "power2.in", duration: 0.6 }, 0.9);
    const w2Words = $$(".word", w2);
    gsap.set(w2Words, { opacity: 0, filter: "blur(8px) brightness(30%)" });
    rv.to(w2, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, ease: "power2.out", duration: 0.5 }, 1.43)
      .to(w2Words, { opacity: 1, filter: "blur(0px) brightness(100%)", duration: 0.4, stagger: { amount: 0.5, from: "start" }, ease: "power2.out" }, 1.43)
      .to(w2, { opacity: 0, scale: 0.9, xPercent: -50, yPercent: -50, ease: "power2.in", duration: 0.6 }, 2.2)
      .to(w3, { opacity: 1, scale: 1, xPercent: -50, yPercent: -50, ease: "power2.out", duration: 0.5 }, 2.72)
      .to($$(".char", w3), { opacity: 1, scale: 1, filter: "blur(0px) brightness(100%)", duration: 0.35, stagger: { each: 0.012, from: "start" }, ease: "power2.out" }, 2.72)
      .to(w3, { opacity: 1, xPercent: -50, yPercent: -50, duration: 0.7 }, 2.7);
    rv.timeScale(1 / FACTOR);
    tl.add(rv, s5);
    let trail = false;
    tl.eventCallback("onUpdate", () => {
      const on = tl.time() >= s5;
      if (on !== trail) { trail = on; reveal.dispatchEvent(new Event(on ? "fx:play" : "fx:stop")); }
    });
    ScrollTrigger.create({ trigger: combo, start: "top top", end: () => `+=${Math.round((tl.duration() - LEAD) * PER)}%`, pin: true, anticipatePin: 1, invalidateOnRefresh: true });
    ScrollTrigger.create({ trigger: combo, start: "top top", end: () => `+=${Math.round(tl.duration() * PER)}%`, scrub: 0.5, animation: tl, invalidateOnRefresh: true });
  };

  const mm = gsap.matchMedia();
  T7.ready.then(heroIn).then(() => {
    mm.add("(prefers-reduced-motion: no-preference)", () => { initCombo(); initFlash(); });
    hero.dispatchEvent(new Event("fx:play"));
    requestAnimationFrame(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
  });
})();
