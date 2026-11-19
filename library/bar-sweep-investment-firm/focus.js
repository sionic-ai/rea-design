// Focus-area motion — centered title hero, a fixed circle whose shapes shatter and regroup at each step, partnership image parallax, horizontally flowing strategy
(() => {
  const { inView, reduce, small, px, WIPE_EASE, INTRO, WIPE, REVEAL, HERO_WIPE, CONTENT_DELAY, barAt, ctaStartFor, wipeLine, riseInto, sweepInto, hideLines, shape } = window.RP;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();

  // ── Pinned circle: steps (0 intro text + five steps). Moves one step at a time, and scrolls arriving during a move are caught up after it ends
  const KINDS = ["rock", "arrow", "target", "pillar", "stairs", "diamond"], STAGE = { hold: 1.7, swap: 0.6, out: 0.4, in: 0.5, ease: "power2.inOut", fillEase: "power2.out", rise: 16 };
  const sec = $(".fphil"), copies = $$("[data-state]", sec), tabs = $$(".fphil__tabs li"), fill = $(".fphil__tick.is-fill"), steps = $$(".fphil__step button");
  const solid = shape($(".fphil__shape canvas"), KINDS[0], { spin: 0.18, scale: 0.26 });
  let cur = 0, busy = null, want = 0;
  const mark = (i) => { tabs.forEach((t, k) => t.classList.toggle("is-on", k === i - 1)); steps.forEach((b) => { b.disabled = +b.dataset.step < 0 ? i === 0 : i === KINDS.length - 1; }); };
  const go = (i, instant) => {
    i = Math.max(0, Math.min(KINDS.length - 1, i));
    if (i === cur && !instant) return 0;
    const from = cur, dur = instant || reduce ? 0 : Math.abs(i - from) === 1 ? STAGE.hold : STAGE.swap;
    cur = i; mark(i); busy?.kill();
    if (!dur) { solid.set(KINDS[i]); gsap.set(copies, { autoAlpha: (k) => +(k === i), y: 0 }); gsap.set(fill, { "--fill": `${72 * i}deg` }); return 0; }
    const tl = (busy = gsap.timeline({ onComplete: () => { busy = null; if (want !== cur) go(cur + Math.sign(want - cur)); } }));
    solid.morph(KINDS[i], dur);
    const out = Math.min(STAGE.out, 0.35 * dur), inn = Math.min(STAGE.in, 0.45 * dur), rise = px(STAGE.rise) * (i < from ? -1 : 1);
    tl.to(copies, { autoAlpha: 0, y: -rise, duration: out, ease: INTRO.ease }, 0)
      .fromTo(copies[i], { y: rise }, { autoAlpha: 1, y: 0, duration: inn, ease: INTRO.ease, immediateRender: false }, dur - inn)
      .to(fill, { "--fill": `${72 * i}deg`, duration: dur, ease: STAGE.fillEase }, 0);
    return dur;
  };
  go(0, true);
  steps.forEach((b) => b.addEventListener("click", () => { if (!busy) { want = cur + +b.dataset.step; go(want); } }));

  const hero = $(".fhero__in");
  if (reduce) { gsap.set(hero, { autoAlpha: 1 }); return; }
  [$(".fpart")].forEach(hideLines);

  // ── Hero
  {
    const title = $(".fhero__title"), subs = $(".fhero__subs"), hint = $(".fhero__hint"), hintIn = $(".fhero__hint-in");
    gsap.set(hero, { autoAlpha: 1 });
    const tl = gsap.timeline({ delay: CONTENT_DELAY + HERO_WIPE.delay });
    const below = (el, at, dur) => tl.fromTo(el, { autoAlpha: 0, y: HERO_WIPE.belowRise }, { autoAlpha: 1, y: 0, duration: dur ?? HERO_WIPE.belowFade, ease: INTRO.ease }, at);
    if (small()) below([title, subs], 0); else sweepInto(tl, title, subs);
    below([hint, hintIn], small() ? 0.6 : 1.45, INTRO.contentFade);
    gsap.timeline({ scrollTrigger: { trigger: $(".fhero"), start: "top top", end: () => `+=${0.35 * innerHeight}`, scrub: true, invalidateOnRefresh: true } }).fromTo(hint, { opacity: 1 }, { opacity: 0, ease: "none" });
    const dot = $("[data-dot]", hint);
    gsap.timeline({ repeat: -1, repeatDelay: 0.5 }).to(dot, { y: 5, duration: 0.45, ease: "power2.in" }).to(dot, { y: 0, duration: 0.45, ease: "power2.out" });
  }

  // ── Fixed circle entrance and step advance
  mm.add("(min-width: 1025px)", () => {
    const words = $$("[data-word]", sec), ring = $(".fphil__ring"), tabsBox = $(".fphil__tabs"), first = copies[0], o = { duration: HERO_WIPE.belowFade, ease: INTRO.ease };
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 60%", end: "top top", scrub: true, invalidateOnRefresh: true } })
      .fromTo($(".fphil__shape"), { autoAlpha: 0 }, { autoAlpha: 0.5, duration: 0.8, ease: INTRO.ease }, 0)
      .fromTo(words, { autoAlpha: 0, y: px(16) }, { autoAlpha: 1, y: 0, ...o, stagger: 0.12 }, 0)
      .fromTo(first, { opacity: 0 }, { opacity: 1, ...o }, 0.2)
      .fromTo(tabsBox, { autoAlpha: 0 }, { autoAlpha: 1, ...o }, 0);
    gsap.fromTo(ring, { autoAlpha: 0 }, { autoAlpha: 1, duration: INTRO.contentFade, ease: INTRO.ease, delay: CONTENT_DELAY });
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } })
      .fromTo(ring, { scale: 1 / 0.6657, y: () => -0.3 * innerHeight }, { scale: 1, y: 0, ease: "power2.out", duration: 1 }, 0);
    const st = ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", invalidateOnRefresh: true,
      onUpdate: (s) => { want = Math.min(KINDS.length - 1, Math.floor(s.progress * KINDS.length)); if (!busy && want !== cur) go(Math.abs(want - cur) > 1 ? want : cur + Math.sign(want - cur)); } });
    return () => st.kill();
  });
  mm.add("(max-width: 1024px)", () => {
    gsap.timeline({ scrollTrigger: { trigger: $(".fphil__ring"), start: "top 85%", once: true } }).fromTo($(".fphil__ring"), { autoAlpha: 0, y: px(REVEAL.rise) }, { autoAlpha: 1, y: 0, duration: WIPE.step, ease: WIPE_EASE });
  });

  // ── Partnership
  {
    const part = $(".fpart"), arts = $$("[data-art]", part), lines = $$("[data-line]", part);
    const tl = gsap.timeline({ scrollTrigger: { trigger: part, start: "top 65%", once: true } }), rise = riseInto(tl);
    tl.fromTo($$("[data-art] > g", part), { autoAlpha: 0, y: px(REVEAL.rise) }, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" }, 0);
    lines.forEach((l, i) => (small() ? rise(l, barAt(i)) : wipeLine(tl, l, barAt(i))));
    rise($(".fpart__note"), ctaStartFor(lines.length)); rise($(".fpart__cta"), ctaStartFor(lines.length));
    mm.add("(min-width: 1025px) and (hover: hover)", () => {
      const q = { duration: 0.9, ease: "power2.out" }, [a, b] = arts, ax = gsap.quickTo(a, "x", q), ay = gsap.quickTo(a, "y", q), bx = gsap.quickTo(b, "x", q), by = gsap.quickTo(b, "y", q);
      const move = (e) => { const x = ((e.clientX / innerWidth) * 2 - 1) * 16, y = ((e.clientY / innerHeight) * 2 - 1) * 16; ax(-x); ay(-y); bx(x); by(y); };
      addEventListener("mousemove", move);
      return () => removeEventListener("mousemove", move);
    });
  }

  // ── Horizontal strategy
  {
    const strat = $(".fstrat"), sticky = $(".fstrat__sticky"), track = $(".fstrat__track"), prog = $(".fstrat__prog"), seg = $("i", prog), cols = $$(".fcol"), lead = $(".fstrat__lead");
    const tlIn = gsap.timeline({ scrollTrigger: { trigger: lead, start: "top 65%", once: true } }), rise = riseInto(tlIn);
    rise(lead.children[0], 0); rise(lead.children[1], REVEAL.stagger);
    mm.add("(min-width: 1025px)", () => {
      const extra = () => Math.max(0, track.offsetWidth - sticky.clientWidth), dpr = () => devicePixelRatio || 1, snapX = { x: (v) => `${Math.round(parseFloat(v) * dpr()) / dpr()}px` };
      const tl = gsap.timeline({ scrollTrigger: { trigger: strat, start: "top top", end: () => `+=${extra()}`, scrub: true, invalidateOnRefresh: true } });
      tl.fromTo(track, { x: 0 }, { x: () => -extra(), duration: 1, ease: "none", modifiers: snapX }, 0)
        .fromTo(prog, { x: 0 }, { x: () => extra(), duration: 1, ease: "none", modifiers: snapX }, 0)
        .fromTo(seg, { x: 0 }, { x: () => px(1220.9) - seg.offsetWidth, duration: 1, ease: "none" }, 0);
      const span = 1683 / cols.length / (2880 - 1440), at = (i) => Math.max(0, (1083 + (i * 1683) / cols.length - 1440) / (2880 - 1440));
      cols.forEach((c, i) => tl.fromTo(c, { x: () => 2 * i * px(32) }, { x: 0, duration: span, ease: "none" }, at(i)).fromTo(c.children, { x: () => px(32) }, { x: 0, duration: span, ease: "none" }, at(i)));
    });
    mm.add("(max-width: 1024px)", () => {
      const giant = $(".fstrat__giant h2"), band = $(".fstrat__band");
      gsap.fromTo(giant, { x: 0 }, { x: () => -Math.max(0, giant.offsetWidth - band.offsetWidth + px(40)), duration: 3 * WIPE.step, ease: "power2.inOut", scrollTrigger: { trigger: band, start: "top 67%", toggleActions: "play none none reverse", invalidateOnRefresh: true } });
      cols.forEach((c) => gsap.fromTo(c.children, { y: px(40) }, { y: 0, duration: WIPE.step, ease: INTRO.ease, scrollTrigger: { trigger: c, start: "top 85%", once: true } }));
    });
  }
})();
