(() => {
  const { reduce, fine, isMobile, px, pxm, loopTrack, loopNames, playInView, headerMotion } = CK;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const mobile = isMobile();
  const dl = (v) => (mobile ? pxm(v * 0.64) : px(v));
  const page = $(".ck-page");

  // Phone values are passed as motion part options — so fx-core reads them before the first scan (after DOMContentLoaded)
  const opening = $(".ck-opening");
  if (mobile) {
    opening.setAttribute("data-fx-tile-count-loader", "target: .ck-hero__top; delay: .7; base: 0; tile: " + pxm(83.2) + "; tile-h: " + pxm(38.4) + "; col: " + pxm(144 * 0.64) + "; row: " + pxm(72 * 0.64));
    $$(".ck-track__sessions").forEach((s) => s.setAttribute("data-fx-sticky-stack-recede", "base: 0; top: " + pxm(50) + "; from: " + pxm(419) + "; lift: " + pxm(50) + "; blur: 0"));
  }

  // ───── 3D Objects
  const hero = $(".ck-hero");
  const stage = $(".ck-hero__stage");
  const obj = CKObject.init($(".ck-hero__object"));

  // ───── Hero opening — the title floats up in the center of the screen at 6px blur and .97x (.7s), tiles count 3·2·1, gather into a blue band, and the rest lift in on that same 0 second
  const skipOpening = reduce.matches || scrollY > 2 || (location.hash.length > 1 && location.hash !== "#top");
  let heroLoopsOn = skipOpening;
  const heroListeners = [];
  const onHeroLoops = (fn) => heroListeners.push(fn);
  const startHeroLoops = () => { heroLoopsOn = true; heroListeners.forEach((f) => f()); };

  if (skipOpening) {
    root.dataset.opening = "skipped";
    opening.removeAttribute("data-fx");
    obj?.setEnabled(!reduce.matches);
  } else {
    root.dataset.opening = "intro";
    const top = $(".ck-hero__top");
    const headline = $(".ck-hero__headline");
    const inkColor = getComputedStyle(document.body).color;
    const onAccent = getComputedStyle(top).color;
    const he = mobile ? $$(".ck-hero__title, .ck-hero__subtitle, .ck-hero__date") : [headline];
    const fe = mobile ? [$(".ck-hero__avatars")] : [];
    const pe = mobile ? [$(".ck-hero__org")] : [$(".ck-hero__identity")];
    const me = mobile ? [$(".ck-hero__format")] : [$(".ck-hero__menu")];
    const ellipseDraw = $(".ck-opening__ellipse");
    const ellipseLine = ellipseDraw.querySelector("ellipse");
    const art = $(".ck-hero__art"), heroEllipse = $(".ck-hero__ellipse");
    const mqTop = $(".ck-hero__mq--top"), mqBottom = $(".ck-hero__mq--bottom");
    const bars = $$(".ck-hero__railbar"), corners = $$(".ck-hero__rail--right .ck-hero__corner");
    const frame = $(".ck-hero__frame"), objEl = $(".ck-hero__object");
    const toCenter = () => { const r = headline.getBoundingClientRect(); return innerHeight / 2 - (r.top + r.height / 2) + (Number(gsap.getProperty(headline, "y")) || 0); };
    const prog = { v: 0 };

    gsap.set(headline, { autoAlpha: 0, filter: "blur(6px)", scale: 0.97, y: toCenter });
    gsap.set(he, { color: inkColor });
    gsap.set(fe, { autoAlpha: 0 });
    gsap.set(pe, { autoAlpha: 0, x: () => dl(-90) });
    gsap.set(me, { autoAlpha: 0, x: () => dl(90) });
    gsap.set(ellipseDraw, { autoAlpha: 0 });
    gsap.set(ellipseLine, { strokeDashoffset: 1 });
    gsap.set(art, { autoAlpha: 0, scale: 0.94 });
    gsap.set(heroEllipse, { autoAlpha: 0 });
    gsap.set(mqTop, { autoAlpha: 0, xPercent: -110 });
    gsap.set(mqBottom, { autoAlpha: 0, xPercent: 110 });
    gsap.set(bars, { scaleY: 0, transformOrigin: "top center" });
    gsap.set(corners, mobile ? { autoAlpha: 0 } : { autoAlpha: 0, scale: 0.55, transformOrigin: "top center" });
    gsap.set(frame, { autoAlpha: 0, y: () => dl(28) });
    gsap.set(objEl, { autoAlpha: 0, scale: 0.239, transformOrigin: "50% 100%" });
    requestAnimationFrame(() => gsap.to(headline, { autoAlpha: 1, filter: "blur(0px)", scale: 1, duration: 0.7, ease: "power2.out", onComplete: () => { root.dataset.opening = "loading"; } }));

    const finish = () => {
      root.dataset.opening = "complete";
      obj?.setOpening({ active: false, progress: 1 });
      gsap.set([headline, ...he, ...fe, ...pe, ...me, art, heroEllipse, mqTop, mqBottom, ...bars, ...corners, frame, objEl, ellipseDraw], { clearProps: "opacity,visibility,transform,filter,color,translate,scale" });
      gsap.set(top, { clearProps: "backgroundColor" });
      dispatchEvent(new CustomEvent("ck:opening-complete"));
    };
    opening.addEventListener("fx:assemble", () => {
      root.dataset.opening = "assembling";
      const accent = getComputedStyle(root).getPropertyValue("--kf-accent").trim();
      gsap.timeline({ onComplete: finish })
        .set(top, { backgroundColor: accent }, 2.42)
        .to(headline, { y: 0, duration: 0.9, ease: "power4.inOut" }, 1.55)
        .to(he, { color: onAccent, duration: 0.9, ease: "power4.inOut" }, 1.55)
        .to(pe, { autoAlpha: 1, x: 0, duration: 0.86, ease: "power3.out" }, 1.76)
        .to(fe, { autoAlpha: 1, duration: 0.86, ease: "power3.out" }, 1.76)
        .to(me, { autoAlpha: 1, x: 0, duration: 0.86, ease: "power3.out" }, 1.76)
        .to(art, { autoAlpha: 1, scale: 1, duration: 0.95, ease: "power2.out" }, 1.54)
        .call(startHeroLoops, [], 1.62)
        .to(mqTop, { autoAlpha: 1, xPercent: 0, duration: 1.18, ease: "power4.out" }, 1.62)
        .to(mqBottom, { autoAlpha: 1, xPercent: 0, duration: 1.18, ease: "power4.out" }, 1.62)
        .to(ellipseDraw, { autoAlpha: 1, duration: 0.12, ease: "none" }, 1.62)
        .to(ellipseLine, { strokeDashoffset: 0, duration: 1.56, ease: "power2.inOut" }, 1.62)
        .to(bars, { scaleY: 1, duration: 1.26, ease: "power3.inOut" }, 1.72)
        .to(corners, mobile ? { autoAlpha: 1, duration: 0.76, stagger: 0.08, ease: "power2.out" } : { autoAlpha: 1, scale: 1, duration: 0.76, stagger: 0.08, ease: "back.out(1.35)" }, 2.26)
        .to(frame, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 1.78)
        .to(heroEllipse, { autoAlpha: 1, duration: 0.12, ease: "none" }, 3.08)
        .to(ellipseDraw, { autoAlpha: 0, duration: 0.12, ease: "none" }, 3.08)
        .call(() => { prog.v = 0; obj?.setOpening({ active: true, progress: 0 }); }, [], 2.72)
        .to(objEl, { autoAlpha: 1, scale: 1, duration: 2.24, ease: "power3.out" }, 2.72)
        .to(prog, { v: 1, duration: 2.24, ease: "power3.out", onUpdate: () => obj?.setOpening({ active: true, progress: prog.v }) }, 2.72)
        .to({}, { duration: 0.04 }, 5 - 0.04);
    });
    addEventListener("ck:opening-complete", () => obj?.setEnabled(true), { once: true });
  }

  const mm = gsap.matchMedia();

  // ───── Hero flowing band · cursor · scroll tilt
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const loops = [
      loopTrack($(".ck-hero__mq--top .ck-mq__track"), $(".ck-hero__mq--top .ck-mq__copy"), "left", 36),
      loopTrack($(".ck-hero__mq--bottom .ck-mq__track"), $(".ck-hero__mq--bottom .ck-mq__copy"), "right", 36),
    ];
    const logos = loopTrack($(".ck-sponsors .ck-logos__track"), $(".ck-sponsors .ck-logos__set"), "left", 40);
    loops.forEach((t) => t.pause());
    const run = () => loops.forEach((t) => (heroLoopsOn ? t.play() : t.pause()));
    onHeroLoops(run);
    run();
    playInView(logos, $(".ck-sponsors"));
    let sp = 0, ppx = 0, ppy = 0;
    const push = () => obj?.setHero({ px: ppx, py: ppy, scroll: sp });
    gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: () => `+=${hero.offsetHeight}`, scrub: mobile ? 0.55 : 0.75, invalidateOnRefresh: true, onUpdate: (st) => { sp = st.progress; push(); } } })
      .to(".ck-hero__bandcopy--left", { x: () => (mobile ? -pxm(52) : px(-180)) }, 0)
      .to(".ck-hero__bandcopy--right", { x: () => (mobile ? pxm(52) : px(180)) }, 0);
    if (!mobile) {
      const move = (e) => { const r = stage.getBoundingClientRect(); if (!r.width) return; ppx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)); ppy = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)); push(); };
      const out = () => { ppx = ppy = 0; push(); };
      stage.addEventListener("pointermove", move, { passive: true });
      stage.addEventListener("pointerleave", out);
    }
  });

  // ───── Name band (44s) · footer logo band (40s) · closing band (36s)
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    $$(".ck-name-mq").forEach((m) => playInView(loopNames(m.querySelector(".ck-name-mq__track"), m.querySelector(".ck-name-mq__set"), 44), m));
    playInView(loopTrack($(".ck-fsponsors__track"), $(".ck-fsponsors .ck-logos__set"), "left", 40), $(".ck-fsponsors"));
    const closingMq = loopTrack($(".ck-closing__mq .ck-mq__track"), $(".ck-closing__mq .ck-mq__copy"), "left", 36);
    closingMq.pause();
    ScrollTrigger.create({ trigger: ".ck-reveal-spacer", start: "top bottom", end: "bottom top", onEnter: () => closingMq.play(), onEnterBack: () => closingMq.play(), onLeaveBack: () => closingMq.pause() });
  });

  // ───── Five bands (from the bottom row at .107 intervals, each row spreads from the center at .43)
  const stripes = (host, sky) => {
    const o = document.createElement("div");
    o.className = "ck-stripes" + (sky ? " ck-stripes--sky" : "");
    o.setAttribute("aria-hidden", "true");
    const bands = Array.from({ length: 5 }, (_, i) => { const b = document.createElement("div"); b.className = "ck-stripes__band"; b.style.setProperty("--i", String(i)); o.append(b); return b; });
    host.append(o);
    return { o, bands };
  };
  const wipe = (tl, bands, at = 0) => [4, 3, 2, 1, 0].forEach((idx, i) => tl.fromTo(bands[idx], { scaleY: 0 }, { scaleY: 1, duration: 0.43, immediateRender: false }, at + i * 0.107));

  const concept = $(".ck-concept"), speakers = $(".ck-speakers");
  const content = $(".ck-speakers__content"), shade = $(".ck-speakers__shade");
  const intro = $(".ck-tt-intro"), body = $(".ck-tt-body");
  const cta = $(".ck-cta"), oval = $(".ck-cta__oval"), surface = $(".ck-cta__surface"), ovalCopy = $(".ck-cta__content");
  const app = $(".ck-application"), form = $(".ck-application__form");

  // Burst → timetable: the dome floats up at 1.73x then settles to 1.59 · 1.45 · 1.31 · 1 per stage, and burst frames descend at half speed while darkening (.2 · .4 · .7 · 1)
  const STEPS = [[1 - 663 / 783, 2538.308 / 1600, 0.8], [1 - 583 / 783, 2323.143 / 1600, 0.6], [1 - 343 / 783, 2101.425 / 1600, 0.3], [1, 1, 0]];
  const BIG = 2764.422 / 1600;
  const ctaShow = (state) => {
    if (cta.dataset.motionState === state) return;
    cta.dataset.motionState = state;
    if (state === "visible") $("#application-title").dispatchEvent(new Event("fx:play"));
  };

  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    // Concept pinned (2× screen) + five strip rows → the blue burst-shot section rises from below and connects
    page.classList.add("has-concept-transition");
    const cs = stripes(concept, false);
    const lift = () => { speakers.style.marginTop = `${-concept.getBoundingClientRect().height}px`; };
    lift();
    const t1 = gsap.timeline({ defaults: { ease: "none" }, onUpdate: () => cs.o.classList.toggle("is-visible", t1.progress() > 0.001 && t1.progress() < 0.999), scrollTrigger: { trigger: concept, start: "top top", end: () => `+=${innerHeight * 2}`, pin: true, pinSpacing: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: lift } });
    gsap.set(cs.bands, { scaleY: 0, transformOrigin: "50% 50%" });
    wipe(t1, cs.bands);

    // Speakers → schedule DOM
    page.classList.add("has-tt-transition");
    const proxy = body.cloneNode(true);
    proxy.className = "ck-tt-proxy";
    proxy.setAttribute("aria-hidden", "true");
    proxy.setAttribute("inert", "");
    for (const n of [proxy, ...proxy.querySelectorAll("*")]) { n.removeAttribute("id"); [...n.attributes].forEach((a) => a.name.startsWith("data-") && n.removeAttribute(a.name)); }
    page.append(proxy);
    const vh = () => innerHeight, f = () => px(155), cH = () => content.offsetHeight, iH = () => intro.offsetHeight;
    const h0 = () => Math.max(0, vh() - cH() - f());
    const g1 = () => h0() + (vh() + f()) * 0.5;
    const py = (p, s) => -f() * (1 - p) + iH() * (s - 1);
    const place = () => { proxy.style.top = `${body.offsetTop}px`; };
    let state;
    const mark = (p) => {
      const s = p <= 0.001 ? "pending" : p >= 0.999 ? "complete" : "transitioning";
      if (s === state) return;
      state = s;
      body.style.opacity = s === "complete" ? "" : "0";
      proxy.style.visibility = s === "complete" ? "hidden" : "visible";
    };
    gsap.set(content, { y: h0 });
    gsap.set(shade, { opacity: 0 });
    gsap.set(intro, { y: () => -f(), scale: BIG, transformOrigin: "50% 0" });
    gsap.set(proxy, { y: () => py(0, BIG), scale: BIG, transformOrigin: "50% 0" });
    place();
    mark(0);
    const t2 = gsap.timeline({ defaults: { ease: "none" }, onUpdate: () => mark(t2.progress()), scrollTrigger: { trigger: speakers, start: "top top", end: () => `+=${vh()}`, scrub: true, invalidateOnRefresh: true, onRefresh: place, onRefreshInit: () => t2?.invalidate() } });
    t2.fromTo(intro, { y: () => -f() }, { y: 0, duration: 1, immediateRender: false }, 0)
      .fromTo(content, { y: h0 }, { y: g1, duration: 1, immediateRender: false }, 0);
    let p0 = 0, s0 = BIG, o0 = 1;
    for (const [p, s, o] of STEPS) {
      const a = p0, b = s0, c = o0, d = p - a;
      t2.fromTo(intro, { scale: b }, { scale: s, duration: d, immediateRender: false }, a)
        .fromTo(proxy, { y: () => py(a, b), scale: b }, { y: () => py(p, s), scale: s, duration: d, immediateRender: false }, a)
        .fromTo(shade, { opacity: 1 - c }, { opacity: 1 - o, duration: d, immediateRender: false }, a);
      p0 = p; s0 = s; o0 = o;
    }

    // Application ellipse — section pinned at 1.6× the screen: band (0~.86) → black dot becomes a circle (.82, .36 power2.out) → ellipse (1.18, .52 power3.inOut) → text (1.5, .3) → form (1.92, .42)
    page.classList.add("has-cta-motion");
    const ss = stripes(cta, true);
    const ratio = () => { const r = oval.getBoundingClientRect(); return r.width > 0 ? r.height / r.width : 1; };
    const pull = () => {
      const r = oval.getBoundingClientRect().height, i = app.getBoundingClientRect(), s = form.getBoundingClientRect();
      const field = form.firstElementChild?.getBoundingClientRect();
      const l = parseFloat(getComputedStyle(form).marginTop) || 0, u = Number(gsap.getProperty(form, "y")) || 0;
      const d = Math.max(0, s.top - u - i.top - l), fld = field ? Math.max(0, field.top - s.top) : px(126);
      const p = Math.max(0, vh() / 2 - r / 2), m = p + d;
      const y = Math.min(m * (2 / 3), Math.max(0, p - px(12))), b = Math.max(0, (m + fld) * (2 / 3) - y);
      cta.style.setProperty("--cta-overlap", `${-vh() * 0.35}px`);
      app.style.setProperty("--form-pull", `${-y}px`);
      app.style.setProperty("--form-overlap", `${y}px`);
      form.style.setProperty("--form-content-pull", `${-b}px`);
    };
    pull();
    const look = (p) => {
      ss.o.classList.toggle("is-visible", p > 0.001);
      ctaShow(p <= 0.001 ? "pending" : p >= 0.999 ? "visible" : "revealing");
      app.dataset.formState = p < 1.92 / 2.34 ? "pending" : p >= 0.999 ? "visible" : "revealing";
    };
    gsap.set(ss.bands, { scaleY: 0, transformOrigin: "50% 50%" });
    gsap.set(surface, { autoAlpha: 0, scaleX: () => ratio() * 0.035, scaleY: 0.035, transformOrigin: "50% 50%" });
    gsap.set(ovalCopy, { autoAlpha: 0, y: 12 });
    gsap.set(form, { autoAlpha: 0, y: () => px(56) });
    const t3 = gsap.timeline({ defaults: { ease: "none" }, onUpdate: () => look(t3.progress()), scrollTrigger: { trigger: cta, start: "top top", end: () => `+=${vh() * 1.6}`, pin: true, pinSpacing: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true, onRefreshInit: () => { pull(); t3?.invalidate(); } } });
    wipe(t3, ss.bands);
    t3.fromTo(surface, { autoAlpha: 0, scaleX: () => ratio() * 0.035, scaleY: 0.035 }, { autoAlpha: 1, scaleX: ratio, scaleY: 1, duration: 0.36, ease: "power2.out", immediateRender: false }, 0.82)
      .fromTo(surface, { scaleX: ratio }, { scaleX: 1, duration: 0.52, ease: "power3.inOut", immediateRender: false }, 1.18)
      .fromTo(ovalCopy, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", immediateRender: false }, 1.5)
      .fromTo(form, { autoAlpha: 0, y: () => px(56) }, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out", immediateRender: false }, 1.92);
    requestAnimationFrame(() => look(t3.progress()));

    return () => {
      [cs.o, ss.o, proxy].forEach((n) => n.remove());
      page.classList.remove("has-concept-transition", "has-tt-transition", "has-cta-motion");
      speakers.style.marginTop = "";
      body.style.opacity = "";
      gsap.set([content, shade, intro, surface, ovalCopy, form], { clearProps: "all" });
    };
  });

  // Phone: vertical text is pushed left then returns into place while the concept is pinned at .55 screen heights, and the apply oval is pinned at .82
  mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".ck-concept__vertical", { x: () => -pxm(208) }, { x: 0, ease: "none", immediateRender: true, scrollTrigger: { trigger: concept, start: "top top", end: () => `+=${innerHeight * 0.55}`, pin: true, pinSpacing: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 3 } });
    gsap.set(intro, { scale: BIG, transformOrigin: "50% 0" });
    const t2 = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: speakers, start: "top top", endTrigger: intro, end: "top top", scrub: true, invalidateOnRefresh: true } });
    t2.fromTo(content, { y: 0 }, { y: () => innerHeight * 0.5, duration: 1, immediateRender: false }, 0);
    let p0 = 0, s0 = BIG;
    for (const [p, s] of STEPS) { t2.fromTo(intro, { scale: s0 }, { scale: s, duration: p - p0, immediateRender: false }, p0); p0 = p; s0 = s; }

    page.classList.add("has-cta-motion");
    const ratio = () => { const r = oval.getBoundingClientRect(); return r.width > 0 ? r.height / r.width : 1; };
    gsap.set(surface, { autoAlpha: 0, scaleX: () => ratio() * 0.035, scaleY: 0.035, transformOrigin: "50% 50%" });
    gsap.set(ovalCopy, { autoAlpha: 0, y: pxm(12) });
    const t3 = gsap.timeline({ defaults: { ease: "none" }, onUpdate: () => ctaShow(t3.progress() <= 0.001 ? "pending" : t3.progress() >= 0.999 ? "visible" : "revealing"), scrollTrigger: { trigger: cta, start: "top top", end: () => `+=${innerHeight * 0.82}`, pin: true, pinSpacing: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true } });
    t3.fromTo(surface, { autoAlpha: 0, scaleX: () => ratio() * 0.035, scaleY: 0.035 }, { autoAlpha: 1, scaleX: ratio, scaleY: 1, duration: 0.24, ease: "power2.out", immediateRender: false }, 0.68)
      .fromTo(surface, { scaleX: ratio }, { scaleX: 1, duration: 0.3, ease: "power3.inOut", immediateRender: false }, 0.92)
      .fromTo(ovalCopy, { autoAlpha: 0, y: () => pxm(12) }, { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out", immediateRender: false }, 1.08)
      .to({}, { duration: 0.35 }, 1.26);
    return () => {
      page.classList.remove("has-cta-motion");
      gsap.set([content, intro, surface, ovalCopy, ".ck-concept__vertical"], { clearProps: "all" });
    };
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { ctaShow("visible"); });

  // Speaker cards — open from the center card outward at .12 intervals, top to bottom (.78 power3.out), once when the slide reaches 40% width
  const slidesBox = $(".ck-speakers__slides"), track = $("[data-speaker-track]");
  const real = $$("[data-speaker-slide]", track);
  const N = real.length;
  if (!mobile) {
    // Duplicate one set on each side to loop endlessly
    const clone = (s) => { const c = s.cloneNode(true); c.dataset.speakerClone = "true"; c.setAttribute("aria-hidden", "true"); c.removeAttribute("aria-label"); return c; };
    real.forEach((s) => track.append(clone(s)));
    [...real].reverse().forEach((s) => track.prepend(clone(s)));
  }
  const slides = () => $$("[data-speaker-slide]", track);
  const pills = $$("[data-speaker-select]"), dots = $$("[data-speaker-dot]"), status = $("[data-speaker-status]");
  let cur = 0;
  const mark = (i) => {
    cur = i;
    slides().forEach((s) => { const on = s.dataset.speakerClone === "false" && +s.dataset.speakerIndex === i; s.classList.toggle("is-active", on); });
    pills.forEach((p) => { const on = +p.dataset.speakerSelect === i; p.classList.toggle("is-active", on); p.setAttribute("aria-pressed", String(on)); });
    dots.forEach((d, k) => d.classList.toggle("is-current", k === i));
    status.textContent = `Speaker ${i + 1} / ${N}`;
  };

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const all = slides();
    const order = () => {
      const r = slidesBox.getBoundingClientRect();
      const centre = all.findIndex((s) => s.classList.contains("is-active"));
      const c = centre < 0 ? Math.floor(all.length / 2) : centre;
      const vis = all.filter((s) => { const b = s.getBoundingClientRect(); return b.right > r.left && b.left < r.right; });
      return (vis.length ? vis : all).map((s) => { const i = all.indexOf(s); return { s, d: Math.abs(i - c), side: i < c ? 0 : 1 }; }).sort((a, b) => a.d - b.d || a.side - b.side).map((x) => x.s);
    };
    gsap.set(all, { clipPath: "inset(0% 0% 100% 0%)" });
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      const tl = gsap.timeline({ onComplete: () => gsap.set(all, { clipPath: "inset(0% 0% 0% 0%)" }) });
      order().forEach((s, i) => tl.to(s, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.78, ease: "power3.out" }, i * 0.12));
    };
    const st = ScrollTrigger.create({ trigger: slidesBox, start: "top 40%", end: "bottom top", once: true, onEnter: reveal });
    return () => { st.kill(); gsap.set(all, { clearProps: "clipPath" }); };
  });

  if (!mobile) {
    // Wide screen: pushes the strip with transform — .58s per cell, .1s more for each farther cell (max 1.05s) power3.inOut, next cell every 4 seconds
    const stageEl = $(".ck-speakers__stage"), cursor = $(".ck-cursor"), pill = $(".ck-cursor__pill"), label = $("[data-speaker-cursor-label]");
    const step = () => { const a = slides()[0], b = slides()[1]; return a ? Math.max(b ? b.offsetLeft - a.offsetLeft : a.getBoundingClientRect().width, 1) : 1; };
    const xAt = (pos) => -(pos + 0.5) * step();
    let pos = N, tw, timer, seen = false, dir = 0, showing = false, ct, last;
    const settle = () => { const want = N + cur; if (pos !== want) { pos = want; gsap.set(track, { x: xAt(pos) }); } tw = null; reaim(); };
    const go = (target, delta) => {
      tw?.progress(1);
      const n = ((target % N) + N) % N;
      if (n === cur) return mark(cur);
      let d = delta ?? n - cur;
      if (delta === undefined && Math.abs(d) > N / 2) d += d > 0 ? -N : N;
      pos += d;
      mark(n);
      hide();
      if (reduce.matches) return settle();
      tw = gsap.to(track, { x: xAt(pos), duration: Math.min(1.05, Math.max(0.58, 0.58 + Math.max(Math.abs(d) - 1, 0) * 0.1)), ease: "power3.inOut", overwrite: true, onComplete: settle });
    };
    const stop = () => { clearTimeout(timer); timer = undefined; };
    const auto = () => { stop(); if (reduce.matches || !seen || document.hidden) return; timer = setTimeout(() => { go(cur + 1, 1); auto(); }, 4000); };
    const qx = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3" }), qy = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3" });
    gsap.set(cursor, { autoAlpha: 0, x: -200, y: -200 });
    gsap.set(pill, { scale: 0, transformOrigin: "50% 50%" });
    const show = (x, y) => {
      if (showing) { qx(x); qy(y); return; }
      showing = true; ct?.kill();
      gsap.set(cursor, { x, y, visibility: "visible" });
      stageEl.classList.add("is-cursor-active");
      ct = gsap.timeline().to(cursor, { opacity: 1, duration: 0.46 * 0.56, ease: "power2.out" }, 0).to(pill, { scale: 1, duration: 0.46, ease: "expo.out" }, 0);
    };
    function hide() {
      dir = 0;
      if (!showing) return;
      showing = false; ct?.kill();
      ct = gsap.timeline({ onComplete: () => { if (!showing) { stageEl.classList.remove("is-cursor-active"); gsap.set(cursor, { visibility: "hidden" }); } } })
        .to(pill, { scale: 0, duration: 0.28, ease: "power3.in" }, 0)
        .to(cursor, { opacity: 0, duration: 0.28 * 0.72, ease: "power2.in" }, 0.28 * 0.28);
    }
    const aim = (x, y, target) => {
      if (!fine.matches) return hide();
      const card = target?.closest("[data-speaker-slide]");
      const active = slides().find((s) => s.dataset.speakerClone === "false" && +s.dataset.speakerIndex === cur);
      if (!card || !active || !stageEl.contains(card)) return hide();
      const a = card.getBoundingClientRect(), b = active.getBoundingClientRect();
      const ca = a.left + a.width / 2, cb = b.left + b.width / 2;
      const d = Math.abs(ca - cb) < 1 ? 0 : ca < cb ? -1 : 1;
      if (!d) return hide();
      dir = d;
      label.textContent = d > 0 ? "Next" : "back";
      show(x, y);
    };
    function reaim() { if (!last) return hide(); aim(last.x, last.y, document.elementFromPoint(last.x, last.y)); }
    stageEl.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return hide(); last = { x: e.clientX, y: e.clientY }; aim(e.clientX, e.clientY, e.target); });
    stageEl.addEventListener("pointerleave", () => { last = null; hide(); });
    stageEl.addEventListener("click", (e) => { if (!dir) return; e.preventDefault(); go(cur + dir, dir); auto(); });
    slidesBox.addEventListener("keydown", (e) => { if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return; e.preventDefault(); const d = e.key === "ArrowLeft" ? -1 : 1; go(cur + d, d); auto(); });
    pills.forEach((p) => p.addEventListener("click", () => { go(+p.dataset.speakerSelect); auto(); }));
    new IntersectionObserver(([e]) => { seen = !!e?.isIntersecting; auto(); }, { threshold: 0.15 }).observe(speakers);
    document.addEventListener("visibilitychange", auto);
    mark(0);
    gsap.set(track, { x: xAt(pos) });
    addEventListener("resize", () => { tw?.progress(1); gsap.set(track, { x: xAt(pos) }); });
  } else {
    // Phone: a horizontally swiped panel (scroll-snap). Moves to the next cell every 4s, and on touch the count restarts from that cell
    const stepM = () => { const a = real[0], b = real[1]; return a ? Math.max(b ? b.offsetLeft - a.offsetLeft : a.offsetWidth, 1) : 1; };
    let timer, seen = false, raf = 0;
    const to = (i, smooth) => { slidesBox.scrollTo({ left: i * stepM(), behavior: smooth && !reduce.matches ? "smooth" : "auto" }); mark(i); };
    const auto = () => { clearTimeout(timer); if (reduce.matches || !seen || document.hidden) return; timer = setTimeout(() => { to((cur + 1) % N, true); auto(); }, 4000); };
    slidesBox.addEventListener("scroll", () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; const i = Math.min(N - 1, Math.max(0, Math.round(slidesBox.scrollLeft / stepM()))); if (i !== cur) mark(i); }); }, { passive: true });
    slidesBox.addEventListener("pointerdown", auto, { passive: true });
    pills.forEach((p) => p.addEventListener("click", () => { to(+p.dataset.speakerSelect, true); auto(); }));
    new IntersectionObserver(([e]) => { seen = !!e?.isIntersecting; auto(); }, { threshold: 0.2 }).observe(speakers);
    to(0, false);
  }

  // ───── Timetable branch marker (when the current branch crosses 50px above the screen top)
  const navItems = $$("[data-timetable-nav-item]");
  const markTrack = (id) => navItems.forEach((li) => { const on = li.dataset.timetableNavItem === id; li.classList.toggle("is-current", on); li.setAttribute("aria-current", on ? "true" : "false"); });
  $$("[data-timetable-track]").forEach((t) => ScrollTrigger.create({ trigger: t, start: () => `top top+=${dl(50)}`, end: () => `bottom top+=${dl(50)}`, invalidateOnRefresh: true, onEnter: () => markTrack(t.dataset.timetableTrack), onEnterBack: () => markTrack(t.dataset.timetableTrack) }));
  markTrack("cvr");

  // Phone: session body expand (.68s power3.inOut, button text .16s later)
  $$("[data-session-toggle]").forEach((btn) => btn.addEventListener("click", () => {
    const card = btn.closest(".ck-session"), desc = card.querySelector(".ck-session__desc");
    const open = btn.getAttribute("aria-expanded") !== "true";
    const from = desc.offsetHeight;
    card.classList.toggle("is-open", open);
    const to = desc.offsetHeight;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Close" : "Read body";
    if (reduce.matches) return ScrollTrigger.refresh();
    gsap.fromTo(desc, { height: from }, { height: to, duration: 0.68, ease: "power3.inOut", onComplete: () => { gsap.set(desc, { clearProps: "height" }); ScrollTrigger.refresh(); } });
    gsap.fromTo(btn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16, ease: "power2.out", delay: 0.68 - 0.16 });
  }));

  // ───── FAQ — list height·answer height·opacity together .68s power3.inOut
  const faq = $(".ck-faq");
  const items = $$("[data-faq-item]").map((item) => ({ item, btn: item.querySelector("[data-faq-toggle]"), ans: item.querySelector("[data-faq-answer]") }));
  let busy = null;
  const finishFaq = (it, open) => {
    it.item.classList.toggle("is-open", open);
    gsap.set(it.ans, { clearProps: "height,marginTop,opacity,visibility,overflow" });
    gsap.set(faq, { clearProps: "height,overflow" });
  };
  items.forEach((it) => it.btn.addEventListener("click", () => {
    if (busy) return;
    const open = it.btn.getAttribute("aria-expanded") !== "true";
    it.btn.setAttribute("aria-expanded", String(open));
    it.ans.setAttribute("aria-hidden", String(!open));
    if (reduce.matches) { finishFaq(it, open); ScrollTrigger.refresh(); return; }
    const fh = faq.getBoundingClientRect().height, ah = it.ans.getBoundingClientRect().height, am = parseFloat(getComputedStyle(it.ans).marginTop);
    it.item.classList.toggle("is-open", open);
    const th = faq.getBoundingClientRect().height, tah = open ? it.ans.scrollHeight : 0, tam = parseFloat(getComputedStyle(it.ans).marginTop);
    gsap.set(faq, { height: fh, overflow: "hidden" });
    gsap.set(it.ans, { height: ah, marginTop: am, autoAlpha: open ? 0 : 1, overflow: "hidden" });
    items.forEach((x) => (x.btn.disabled = true));
    busy = gsap.timeline({ defaults: { duration: 0.68, ease: "power3.inOut" }, onComplete: () => { finishFaq(it, open); items.forEach((x) => (x.btn.disabled = false)); busy = null; ScrollTrigger.refresh(); } })
      .to(faq, { height: th }, 0)
      .to(it.ans, { height: tah, marginTop: tam, autoAlpha: open ? 1 : 0 }, 0);
  }));

  // ───── Closing footer — while the panel above passes fully, the curtain lifts (scrub), and text comes into focus from blur 10px · 22px below at .08 intervals (scrub .7)
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const dim = $(".ck-closing__dim"), fades = $$("[data-footer-fade]");
    if (!mobile) {
      gsap.fromTo(dim, { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: ".ck-reveal-spacer", start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo(fades, { autoAlpha: 0, y: () => px(22), filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: ".ck-reveal-spacer", start: "top 68%", end: "top 10%", scrub: 0.7, invalidateOnRefresh: true } });
    } else {
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".ck-reveal-spacer", start: "top bottom", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true } })
        .fromTo(fades, { autoAlpha: 0, y: () => pxm(18) }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.55, ease: "power2.out" }, 0.25)
        .to({}, { duration: 0.2 }, 1);
    }
  });

  headerMotion();
  // If the font loads late, the height changes — measure again
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener("load", () => ScrollTrigger.refresh());
})();
