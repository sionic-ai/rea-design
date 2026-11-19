// Home page motion: hero entrance and cursor parallax, intro sentence wipe, principle cards stepping back, partner table, mission tick circle, leadership portrait pin
(() => {
  const { inView, reduce, small, px, WIPE_EASE, FADE_EASE, INTRO, WIPE, REVEAL, HERO_WIPE, CONTENT_DELAY, barAt, ctaStartFor, wipeLine, riseInto, sweepInto, hideLines, shape } = window.RP;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hover = matchMedia("(hover: hover)").matches;

  $$("canvas[data-shape]").forEach((c) => shape(c, c.dataset.shape, c.dataset.shape === "tripod" ? { spin: 0.2, tilt: -0.12, scale: 0.34, dark: "--kf-dim", light: "--kf-contrast-bg" } : { spin: 0.22, scale: 0.34 }));

  const hero = $(".hero__in");
  if (reduce) { gsap.set(hero, { autoAlpha: 1 }); return; }
  gsap.registerPlugin(DrawSVGPlugin);
  $$(".rp-root > section").forEach((s) => { if (!s.classList.contains("hero") && !s.matches('[data-slot="end-cta"]')) hideLines(s); });

  // ── Hero
  gsap.timeline({ delay: CONTENT_DELAY }).fromTo(hero, { autoAlpha: 0, y: INTRO.contentRise }, { autoAlpha: 1, y: 0, duration: INTRO.contentFade, ease: INTRO.ease });
  if (!small()) sweepInto(gsap.timeline({ delay: CONTENT_DELAY + INTRO.contentFade + HERO_WIPE.delay }), $(".hero__title"), $(".hero__subs"));

  const mm = gsap.matchMedia();
  mm.add("(min-width: 1025px) and (hover: hover)", () => {
    // Only the light (mask) follows the cursor, so the outside gets +40 and the inner tiles are pulled back by -40. The stone is the opposite, 24
    const glow = $(".hero__glow"), grid = $(".hero__grid"), media = $(".hero__media-in"), o = { duration: 0.9, ease: "power2.out" }, r = { ...o, roundProps: "x,y" };
    const gx = gsap.quickTo(glow, "x", r), gy = gsap.quickTo(glow, "y", r), ix = gsap.quickTo(grid, "x", r), iy = gsap.quickTo(grid, "y", r), mx = gsap.quickTo(media, "x", o), my = gsap.quickTo(media, "y", o);
    const seen = inView($(".hero"), hero);
    const move = (e) => { if (!seen()) return; const nx = (e.clientX / innerWidth) * 2 - 1, ny = (e.clientY / innerHeight) * 2 - 1; gx(40 * nx); gy(40 * ny); ix(-40 * nx); iy(-40 * ny); mx(-24 * nx); my(-24 * ny); };
    addEventListener("mousemove", move);
    return () => removeEventListener("mousemove", move);
  });

  // ── Principle card
  {
    const sec = $(".phil"), inner = $(".phil__in"), title = $("h2", sec), cards = $$("[data-card]", sec);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 65%", once: true } });
    if (small()) {
      tl.fromTo(title, { autoAlpha: 0 }, { autoAlpha: 1, duration: WIPE.step, ease: WIPE_EASE }, 0);
      cards.forEach((c) => gsap.timeline({ scrollTrigger: { trigger: c, start: "top 85%", once: true } }).fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: WIPE_EASE }));
    } else {
      wipeLine(tl, $("[data-line]", title), 0);
      tl.fromTo(cards, { autoAlpha: 0, x: -px(24) }, { autoAlpha: 1, x: 0, duration: 0.4, ease: WIPE_EASE, stagger: 0.28 }, WIPE.reveal + WIPE.step - 0.15);
    }
    mm.add("(min-width: 1025px)", () => {
      const pin = gsap.timeline({ scrollTrigger: { trigger: sec, start: "bottom bottom", end: "bottom top", scrub: true, pin: sec, pinSpacing: false, pinType: "fixed", invalidateOnRefresh: true,
        onLeave: () => gsap.set(inner, { visibility: "hidden" }), onEnterBack: () => gsap.set(inner, { visibility: "inherit" }), onRefresh: (s) => gsap.set(inner, { visibility: s.progress < 1 ? "inherit" : "hidden" }) } });
      pin.fromTo(inner, { scale: 1, opacity: 1 }, { scale: 0.92, opacity: 0.85, ease: "none", duration: 0.5 }, 0).fromTo(inner, { y: 0 }, { y: () => -px(48), ease: "none", duration: 1 }, 0);
    });
  }

  // ── Partner table
  {
    const sec = $(".partners__in"), title = $("h2", sec);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 85%", once: true } });
    if (small()) {
      tl.fromTo(sec, { autoAlpha: 0 }, { autoAlpha: 1, duration: WIPE.step, ease: WIPE_EASE }, 0);
      $$(".pcard").forEach((c) => gsap.timeline({ scrollTrigger: { trigger: c, start: "top 85%", once: true } }).fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: WIPE_EASE }));
    } else {
      wipeLine(tl, $("[data-line]", title), 0);
      tl.fromTo($$("[data-row]", sec), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: WIPE_EASE, stagger: 0.08 }, WIPE.reveal + WIPE.step - 0.15);
    }
  }

  // ── Mission
  {
    const title = $(".mission__title"), media = $(".mission__media"), text = $(".mission__text");
    const spin = (el, dir) => gsap.to(el, { rotation: 360 * dir, duration: 90, ease: "none", repeat: -1 });
    const speeds = [spin(".mission__dial.is-large", -1), spin(".mission__dial.is-small", 1)].map((t) => gsap.quickTo(t, "timeScale", { duration: 1, ease: "power2.out" }));
    const probe = ScrollTrigger.create({});
    gsap.ticker.add(() => { const v = Math.min(Math.abs(probe.getVelocity()) / 3000, 1); speeds.forEach((s) => s(1 + 24 * v)); });
    const tl = gsap.timeline({ scrollTrigger: { trigger: title, start: "top 85%", once: true } });
    const rise = (el, at) => tl.fromTo(el, { autoAlpha: 0, y: px(16) }, { autoAlpha: 1, y: 0, duration: 0.65, ease: FADE_EASE }, at);
    if (small()) rise(title, 0); else wipeLine(tl, $("[data-line]", title), 0);
    rise([media, text], 0.82);
    mm.add("(min-width: 1025px) and (hover: hover)", () => {
      const box = $(".mission__media-in"), o = { duration: 0.9, ease: "power2.out" }, qx = gsap.quickTo(box, "x", o), qy = gsap.quickTo(box, "y", o);
      const seen = inView($(".mission"), media);
      const move = (e) => { if (!seen()) return; qx(-(((e.clientX / innerWidth) * 2 - 1) * 16)); qy(-(((e.clientY / innerHeight) * 2 - 1) * 16)); };
      addEventListener("mousemove", move);
      return () => removeEventListener("mousemove", move);
    });
  }

  // ── Leadership
  {
    const sec = $(".lead__in"), box = $(".lead__pin-box"), mover = $(".lead__pin-move"), wipe = $(".lead__wipe");
    const layers = $$("[data-layer]", sec), people = $$("[data-person]", sec), cta = $(".lead__cta"), o = { duration: 0.65, ease: FADE_EASE };
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 85%", once: true } })
      .fromTo([...layers, ...people, cta], { autoAlpha: 0 }, { autoAlpha: 1, ...o }, 0)
      .fromTo([...layers, ...people.flatMap((p) => [...p.children]), cta], { y: px(16) }, { y: 0, ...o }, 0);
    $$("[data-signature]", sec).forEach((s) => gsap.timeline({ scrollTrigger: { trigger: s, start: "top 85%", once: true } }).fromTo(s.querySelector("path"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.25, ease: FADE_EASE }));
    mm.add("(min-width: 1025px)", () => {
      const [a, b] = people;
      const gapY = () => b.getBoundingClientRect().top - a.getBoundingClientRect().top, hold = () => Math.round(gapY() - px(100));
      const sync = () => wipe.style.setProperty("--wipe-inset", `${Math.max(0, b.getBoundingClientRect().top - wipe.getBoundingClientRect().top)}px`);
      const tl = gsap.timeline({ scrollTrigger: { trigger: box, start: () => `top ${(innerHeight - px(505)) / 2}px`, end: () => `+=${hold()}`, scrub: true, pin: box, pinSpacing: false, pinType: "fixed", invalidateOnRefresh: true, onRefresh: sync } });
      tl.fromTo(mover, { y: 0 }, { y: () => gapY() - hold(), ease: "none", duration: 1 }, 0);
      gsap.ticker.add(sync); sync();
      return () => { gsap.ticker.remove(sync); wipe.style.removeProperty("--wipe-inset"); };
    });
  }
  void hover;
})();
