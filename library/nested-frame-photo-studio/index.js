// Home: loader (small window grows to fill) → 3.65s slideshow, then per-section line lift · open · parallax with the original values.
// When arriving from another page (internal), like the original internal-entry, no loader: the photo stays full and its zoom relaxes, and at start the text below and the small window come in.
FW.page("home", (box, { k, internal }) => {
  const { reduced } = FW;
  const $ = (s, r = box) => r.querySelector(s);
  const $$ = (s, r = box) => [...r.querySelectorAll(s)];

  // ── Hero
  const T = { grow: 0.8, hold: 1.8, fade: 0.4, expand: 1.4, interval: 3.65, reveal: 1.35 };
  const media = $(".hero__media"), seq = $(".hero__seq"), preBox = $(".hero__pre");
  const slides = $$(".hero__slide"), pres = $$(".hero__pre .wf-img"), inset = $(".hero__inset");
  const heroLines = $$(".hero__text .fw-line");
  const clip = { t: 100, r: 50, b: 0, l: 50 };
  const paintClip = () => {
    media.style.clipPath = `inset(${clip.t}% ${clip.r}% ${clip.b}% ${clip.l}%)`;
    const w = media.offsetWidth, h = media.offsetHeight;
    FW.surface((clip.t / 100) * h, w * (1 - clip.r / 100), h * (1 - clip.b / 100), (w * clip.l) / 100);
  };
  let active = 0, visible = true, timer = null, started = false;
  k.add(() => clearTimeout(timer));

  const insetShow = (i, animate) => {
    const wrap = document.createElement("div");
    const img = slides[i].querySelector(".wf-img").cloneNode(true);
    wrap.append(img);
    inset.append(wrap);
    inset.dataset.label = img.dataset.label;
    if (!animate) return [...inset.children].slice(0, -1).forEach((n) => n.remove());
    gsap.timeline({ onComplete: () => [...inset.children].slice(0, -1).forEach((n) => n.remove()) })
      .fromTo(wrap, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: T.reveal, ease: "power2.inOut" }, 0)
      .fromTo(img, { scale: 1.12 }, { scale: 1, duration: T.reveal + T.interval, ease: "power1.out" }, 0);
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!visible) return;
    timer = setTimeout(nextSlide, T.interval * 1000);
  };
  const nextSlide = () => {
    if (!visible) return;
    const t = (active + 1) % slides.length, el = slides[t], mob = innerWidth <= 768;
    seq.append(el);
    insetShow((t + 1) % slides.length, true);
    gsap.fromTo(el.firstElementChild, { scale: mob ? 1.1 : 1.14, yPercent: mob ? 1 : 1.8 }, { scale: 1, yPercent: 0, duration: T.reveal + T.interval, ease: "power1.out" });
    gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", duration: T.reveal, ease: "power2.inOut",
      onComplete: () => { slides.forEach((s) => s !== el && gsap.set(s, { clipPath: "inset(100% 0% 0% 0%)" })); active = t; schedule(); },
    });
  };
  const revealBottom = () => {
    if (reduced) return gsap.set(heroLines, { opacity: 1, y: "0%", rotate: 0 }), gsap.set(inset, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" });
    gsap.fromTo(heroLines, { opacity: 0, y: "115%", rotate: 3 }, { opacity: 1, y: "0%", rotate: 0, duration: 1.05, stagger: 0.08, ease: "power3.out" });
    gsap.fromTo(inset, { opacity: 0, clipPath: "inset(100% 0 0 0)" }, { opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "power4.inOut" });
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && started && !timer) schedule();
    if (!visible) { clearTimeout(timer); timer = null; }
  }, { threshold: 0.05 });
  io.observe(media);
  k.add(() => io.disconnect());

  gsap.set(slides[0], { clipPath: "inset(0% 0% 0% 0%)" });
  insetShow(1, false);

  let api = {};
  if (reduced) {
    media.style.visibility = "visible";
    Object.assign(clip, { t: 0, r: 0, b: 0, l: 0 });
    paintClip();
    preBox.remove();
    gsap.set(inset, { opacity: 1, clipPath: "none" });
    if (internal) api = { start: () => {} };
    else { FW.phase2(); FW.phase3(); revealBottom(); FW.ready(); }
  } else if (internal) {
    media.style.visibility = "visible";
    Object.assign(clip, { t: 0, r: 0, b: 0, l: 0 });
    paintClip();
    preBox.remove();
    gsap.set(heroLines, { opacity: 0, y: "115%", rotate: 3 });
    gsap.set(inset, { opacity: 0, clipPath: "inset(100% 0 0 0)" });
    const mob = innerWidth <= 768, d = T.reveal + T.interval;
    gsap.fromTo(slides[0].firstElementChild, { scale: mob ? 1.1 : 1.14, yPercent: mob ? 1 : 1.8 }, { scale: 1, yPercent: 0, duration: d, ease: "power1.out" });
    gsap.fromTo(inset.querySelector(".wf-img"), { scale: 1.12 }, { scale: 1, duration: d, ease: "power1.out" });
    started = true;
    schedule();
    api = { start: revealBottom };
  } else {
    const a = Math.min(Math.max((innerWidth - 320) / 1120, 0), 1), o = 60 - 15 * a, s = 15 + 20 * a;
    const c = T.grow + T.hold, step = c / (pres.length + 1);
    const go = setTimeout(() => {
      media.style.visibility = "visible";
      const tl = gsap.timeline({ onUpdate: paintClip });
      tl.fromTo(clip, { t: 100, r: 50, b: 0, l: 50 }, { t: o, r: s, b: 0, l: s, duration: T.grow, ease: "power2.out" }, 0);
      pres.slice(1).forEach((p, i) => tl.to(p, { opacity: 1, duration: T.fade, ease: "power2.inOut" }, (i + 1) * step));
      tl.to(preBox, { opacity: 0, duration: T.fade, ease: "power2.inOut" }, pres.length * step);
      tl.add(FW.phase2, 0);
      tl.to(clip, { t: 0, r: 0, b: 0, l: 0, duration: T.expand, ease: "power2.inOut" }, c);
      tl.add(FW.phase3, c + 0.3);
      gsap.fromTo(slides[0].firstElementChild, { scale: 1.08, yPercent: 1 }, { scale: 1, yPercent: 0, duration: T.expand + T.interval, ease: "power1.out", delay: c });
      tl.add(() => { preBox.remove(); revealBottom(); FW.ready(); started = true; schedule(); }, c + T.expand);
    }, 1000);
    k.add(() => clearTimeout(go));
  }
  k.on(window, "resize", paintClip);

  if (reduced) {
    $$(".fw-line, .cat__title, .proj__title-in, .partners__title-in").forEach((el) => el.closest(".hero") || gsap.set(el, { opacity: 1, y: 0, rotate: 0 }));
    return api;
  }

  // ── About
  {
    const sec = $(".studio"), lines = $$(".studio__text .fw-line"), wrap = $(".studio__media"), frame = $(".studio__frame"), img = $(".studio__img");
    gsap.fromTo(".studio__circle svg", { y: -45, x: 25, rotation: -8, scale: 0.96 }, { y: 110, x: -25, rotation: 20, scale: 1.03, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 } });
    gsap.timeline({ scrollTrigger: { trigger: ".studio__head", start: "top 82%", toggleActions: "play none none reverse" } })
      .fromTo(".studio__title .fw-line", { y: "115%", rotate: 3, opacity: 0 }, { y: "0%", rotate: 0, opacity: 1, duration: 1.05, ease: "power3.out" }, 0)
      .to(lines, { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0.25);
    gsap.to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.35, ease: "power3.inOut", scrollTrigger: { trigger: wrap, start: "top 84%", toggleActions: "play none none reverse" } });
    gsap.fromTo(wrap, { y: 35 }, { y: -35, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 1.4 } });
    gsap.fromTo(img, { yPercent: -9, scale: 1.18 }, { yPercent: 9, scale: 1.08, ease: "none", scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    const aside = $(".studio__aside"), chars = FW.type($(".studio__aside .fw-aside__text"));
    const tl = gsap.timeline({ scrollTrigger: { trigger: aside, start: "top 88%", toggleActions: "play none none reverse" } });
    FW.plus($(".studio__aside .fw-plus"), tl);
    tl.to(chars, { opacity: 1, duration: 0.01, stagger: 0.02, ease: "none" }, 0.18);
    k.mm.add("(min-width: 1025px)", () => {
      gsap.fromTo(aside, { y: 90 }, { y: -70, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    });
  }

  // ── Rows by field
  {
    FW.line($$(".rows__lead .fw-line"), { duration: 1.1, scrollTrigger: { trigger: ".rows__intro", start: "top 80%", once: true } });
    $$(".cat").forEach((cat) => {
      const imgs = $$(".cat__img", cat), shown = imgs.filter((el) => getComputedStyle(el).display !== "none");
      const chars = FW.type($(".cat__desc", cat));
      gsap.timeline({ scrollTrigger: { trigger: cat, start: "top 80%", once: true } })
        .to($(".cat__rule", cat), { scaleX: 1, duration: 0.85, ease: "power3.inOut" }, 0)
        .to($(".cat__title", cat), { y: "0%", opacity: 1, duration: 0.95, ease: "power3.out" }, 0.08)
        .to(shown, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, stagger: 0.08, ease: "power3.inOut" }, 0.15)
        .to(chars, { opacity: 1, duration: 0.01, stagger: 0.015, ease: "none" }, 0.2);

      const gallery = $(".cat__gallery", cat), toggle = $(".cat__toggle", cat);
      let open = false, busy = false;
      const set = (on) => {
        if (busy || on === open) return;
        busy = true;
        open = on;
        toggle.setAttribute("aria-expanded", String(on));
        const extra = imgs.slice(innerWidth <= 1024 ? 2 : 5);
        const h0 = gallery.offsetHeight;
        if (on) {
          cat.dataset.expanded = "true";
          const h1 = gallery.offsetHeight;
          gsap.fromTo(gallery, { height: h0 }, { height: h1, duration: 0.85, ease: "power3.inOut", onComplete: () => { gsap.set(gallery, { clearProps: "height" }); busy = false; ScrollTrigger.refresh(); } });
          gsap.fromTo(extra, { clipPath: "inset(0% 100% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, stagger: 0.05, ease: "power3.inOut", delay: 0.08 });
        } else {
          cat.dataset.expanded = "false";
          const h1 = gallery.offsetHeight;
          cat.dataset.expanded = "true";
          gsap.fromTo(extra, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.45, stagger: { each: 0.03, from: "end" }, ease: "power2.inOut" });
          gsap.fromTo(gallery, { height: h0 }, { height: h1, duration: 0.65, ease: "power3.inOut", onComplete: () => {
            cat.dataset.expanded = "false"; gsap.set(gallery, { clearProps: "height" }); gsap.set(extra, { clipPath: "inset(0% 100% 100% 0%)" }); busy = false; ScrollTrigger.refresh();
          } });
        }
      };
      toggle.addEventListener("click", (e) => { e.stopPropagation(); set(!open); });
      imgs.forEach((im) => im.addEventListener("click", (e) => { if (!open) { e.preventDefault(); e.stopPropagation(); set(true); } }));
      cat.addEventListener("click", (e) => { if (!e.target.closest(".cat__toggle, .cat__img")) set(!open); });
    });
  }

  // ── Project panel
  {
    $$(".proj__sq-frame").forEach((f) => gsap.to(f, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.45, ease: "power3.inOut", scrollTrigger: { trigger: f.closest(".proj__item") || f, start: "top 74%", toggleActions: "play none none reverse" } }));
    k.mm.add("(min-width: 1025px)", () => {
      $$(".proj__square").forEach((sq) => gsap.fromTo(sq, { y: -45 }, { y: 55, ease: "none", scrollTrigger: { trigger: sq.closest(".proj__item") || ".proj__panel", start: "top bottom", end: "bottom top", scrub: 1.3 } }));
    });
    $$(".proj__item").forEach((it) => {
      gsap.fromTo($(".proj__media", it), { y: 34 }, { y: -34, ease: "none", scrollTrigger: { trigger: it, start: "top bottom", end: "bottom top", scrub: 1.35 } });
      gsap.timeline({ scrollTrigger: { trigger: it, start: "top 78%", toggleActions: "play none none reverse" } })
        .to($(".proj__title-in", it), { opacity: 1, y: "0%", duration: 1.2, ease: "power4.out" }, 0.06)
        .to($(".proj__meta", it), { opacity: 1, y: 0, duration: 0.95, ease: "power3.out" }, 0.18)
        .to($(".proj__body", it), { opacity: 1, y: 0, duration: 1.05, ease: "power3.out" }, 0.28);
    });
  }

  // ── Places we’ve worked: stair lines are drawn one by one and logos sharpen from blur
  {
    const sec = $(".partners"), items = [".is-a", ".is-b", ".is-c", ".is-d", ".is-e"].map((c) => $(".partners__item" + c, sec));
    const logos = items.map((i) => $(".partners__logo", i));
    gsap.set(items, { opacity: 0, y: 42, clipPath: "inset(0% 100% 100% 0%)" });
    gsap.set(logos, { scale: 1.12, rotate: 1.2, filter: "blur(7px)", transformOrigin: "center center" });
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 78%", toggleActions: "play none none reverse" } })
      .to(".partners__title-in", { y: "0%", opacity: 1, duration: 1.1, ease: "power3.out" }, 0)
      .to(".partners__l-low", { scaleX: 1, duration: 0.75, ease: "power3.inOut" }, 0.1)
      .to(".partners__l-rise", { scaleY: 1, duration: 0.35, ease: "power2.out" }, 0.65)
      .to(".partners__l-up", { scaleX: 1, duration: 0.75, ease: "power3.inOut" }, 0.82)
      .to(".partners__l-ret", { scaleY: 1, duration: 0.35, ease: "power2.out" }, 1.35)
      .to(".partners__frag-v", { scaleY: 1, duration: 0.3, ease: "power2.out" }, 0.9)
      .to(".partners__frag-h", { scaleX: 1, duration: 0.4, ease: "power3.inOut" }, 1.05)
      .to(items, { opacity: 1, y: 0, clipPath: "inset(-100% -10% -100% -10%)", duration: 1.25, stagger: 0.11, ease: "power4.inOut" }, 0.24)
      .to(logos, { scale: 1, rotate: 0, filter: "blur(0px)", duration: 1.35, stagger: 0.11, ease: "power3.out" }, 0.28);
    const drift = (sel, from, to, scrub) => gsap.fromTo(`.partners__item${sel} .partners__mark`, from, { ...to, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub } });
    const mm = k.mm;
    mm.add("(min-width: 1025px)", () => {
      drift(".is-b", { y: 20, x: -4 }, { y: -20, x: 4 }, 1.4);
      drift(".is-a", { y: -16, x: 4 }, { y: 16, x: -4 }, 1.3);
      drift(".is-d", { y: -16 }, { y: 16 }, 1.45);
      drift(".is-c", { y: 15, x: -3 }, { y: -15, x: 3 }, 1.5);
      drift(".is-e", { y: 16, x: 4 }, { y: -16, x: -4 }, 1.35);
      gsap.fromTo(".partners__notch", { y: -5 }, { y: 5, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    });
    mm.add("(max-width: 1024px)", () => {
      drift(".is-b", { y: 10 }, { y: -10 }, 1.2);
      drift(".is-a", { y: -8 }, { y: 8 }, 1.2);
      drift(".is-d", { y: -8 }, { y: 8 }, 1.2);
      drift(".is-c", { y: 8 }, { y: -8 }, 1.2);
      drift(".is-e", { y: 8 }, { y: -8 }, 1.2);
    });
  }

  // ── Full-bleed edge photo
  gsap.fromTo(".bleed__img", { yPercent: -8, scale: 1.14 }, { yPercent: 8, scale: 1.14, ease: "none", scrollTrigger: { trigger: ".bleed", start: "top bottom", end: "bottom top", scrub: 1.2 } });

  // ── Charcoal section
  {
    const sec = $(".vision");
    gsap.fromTo(".vision__arc svg", { y: -45, x: -25, rotation: -8, scale: 0.96 }, { y: 120, x: 30, rotation: 22, scale: 1.04, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 2 } });
    gsap.timeline({ scrollTrigger: { trigger: ".vision__head", start: "top 82%", toggleActions: "play none none reverse" } })
      .fromTo(".vision__title .fw-line", { y: "115%", rotate: 3, opacity: 0 }, { y: "0%", rotate: 0, opacity: 1, duration: 1.05, ease: "power3.out" }, 0)
      .to($$(".vision__text .fw-line"), { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0.25);
    const aside = $(".vision__aside"), chars = FW.type($(".vision__aside-text"));
    const tl = gsap.timeline({ scrollTrigger: { trigger: aside, start: "top 88%", toggleActions: "play none none reverse" } });
    FW.plus($(".vision__aside .fw-plus"), tl);
    tl.to(chars, { opacity: 1, duration: 0.01, stagger: 0.02, ease: "none" }, 0.18);
    const comp = $(".vision__comp"), L = $(".vision__wrap.is-left"), R = $(".vision__wrap.is-right");
    const mm = k.mm;
    mm.add("(min-width: 1025px)", () => {
      gsap.fromTo(aside, { y: 60 }, { y: -60, ease: "none", scrollTrigger: { trigger: comp, start: "top bottom", end: "bottom top", scrub: 1.3 } });
      gsap.fromTo(L, { y: -40 }, { y: 50, ease: "none", scrollTrigger: { trigger: comp, start: "top bottom", end: "bottom top", scrub: 1.4 } });
      gsap.fromTo(R, { y: 50 }, { y: -40, ease: "none", scrollTrigger: { trigger: comp, start: "top bottom", end: "bottom top", scrub: 1.5 } });
    });
    mm.add("(max-width: 1024px)", () => {
      gsap.fromTo(L, { y: -20 }, { y: 20, ease: "none", scrollTrigger: { trigger: L, start: "top bottom", end: "bottom top", scrub: 1.2 } });
      gsap.fromTo(R, { y: 20 }, { y: -20, ease: "none", scrollTrigger: { trigger: R, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    });
  }

  // ── Closing line
  FW.line($$(".statement__text .fw-line"), { scrollTrigger: { trigger: ".statement", start: "top 75%", toggleActions: "play none none reverse" } });
  return api;
});
