// For each section, when the screen-height marker line is more than half visible (IntersectionObserver .5) the step changes, and text lines rise from 100% below the mask.
// Step transitions are time-driven, not tied to scroll — the original runs a CSS transition or GSAP tween once per step
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const split = (el, type = "lines") => (el ? SplitText.create(el, { type, mask: type, linesClass: "ln", wordsClass: "wd" })[type] : []);
  const hide = (t) => t.length && gsap.set(t, { yPercent: 100 });
  const watch = (markers, fn) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && fn(markers.indexOf(e.target))), { threshold: 0.5 });
    markers.forEach((m) => io.observe(m));
  };
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const mm = gsap.matchMedia();

  // Hero — when the loader stops and the wordmark starts settling, photo 1.2→1 (1.5s), then logo and button, then title and subtitle lines
  const hero = $(".sn-hero"), heroBg = $(".sn-hero__bg"), loader = $(".sn-loader");
  const heroNav = $$(".sn-hero__nav > *");
  if (!reduce) {
    gsap.set(heroBg, { scale: 1.2 });
    gsap.set(heroNav, { opacity: 0, yPercent: 50 });
  }
  const heroReady = fonts.then(() => {
    if (reduce) return {};
    const title = split($(".sn-hero__title"));
    const subs = $$(".sn-hero__sub").flatMap((p) => split(p));
    hide(title); hide(subs);
    return { title, subs };
  });
  const heroGo = () => heroReady.then(({ title, subs }) => {
    if (reduce) return;
    const tl = gsap.timeline();
    tl.to(heroBg, { scale: 1, duration: 1.5, ease: "power2.out" });
    tl.to(heroNav, { opacity: 1, yPercent: 0, duration: 0.5, ease: "power2.out", stagger: 0.1 });
    tl.addLabel("text");
    tl.to(title, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, "text");
    tl.to(subs, { yPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 }, "text");
  });
  if (!loader || loader.classList.contains("is-done")) heroGo();
  else loader.addEventListener("fx:done", heroGo, { once: true });

  // About — when a section’s top edge reaches the top of the screen, the big sentence lines animate in .8s and the subtitle in .6s (.5s overlap). It fades while the next section covers it.
  const about = $(".sn-about");
  fonts.then(() => mm.add("(prefers-reduced-motion: no-preference)", () => {
    const t = split($(".sn-about__title")), s = split($(".sn-about__sub"));
    hide(t); hide(s);
    const tl = gsap.timeline({ scrollTrigger: { trigger: about, start: "top top", toggleActions: "play none none reverse" } });
    tl.to(t, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 });
    tl.to(s, { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 }, "-=0.5");
  }));

  // Feature list
  const feat = $(".sn-feat");
  const fItems = $$(".sn-feat__item"), fSlides = $$(".sn-feat__slide"), fMarks = $$(".sn-feat__markers > div");
  const setFeat = (k) => {
    fItems.forEach((el, i) => el.classList.toggle("is-active", i === k));
    fSlides.forEach((el, i) => {
      el.classList.remove("is-active", "is-prev", "is-next");
      el.classList.add(i === k ? "is-active" : i < k ? "is-prev" : "is-next");
    });
  };
  setFeat(0);
  // Hold the first section until its top edge touches the screen top and goes 25vh further — steps that change in between are collected and applied all at once when the door opens
  let gate = false, pending = 0, holdUntil = 0;
  const gateY = () => feat.getBoundingClientRect().top + scrollY + 0.25 * innerHeight;
  const tryGate = () => {
    if (gate || scrollY < gateY()) return;
    gate = true;
    setFeat(pending);
    removeEventListener("scroll", tryGate);
  };
  addEventListener("scroll", tryGate, { passive: true });
  watch(fMarks, (k) => {
    if (performance.now() < holdUntil) return;
    if (!gate) { pending = k; tryGate(); return; }
    setFeat(k);
  });
  fItems.forEach((item, k) => item.addEventListener("click", () => {
    gate = true;
    setFeat(k);
    holdUntil = performance.now() + 1400;
    window.snScrollTo(fMarks[k].getBoundingClientRect().top + scrollY + 20);
  }));
  ScrollTrigger.create({ trigger: feat, start: "top top", toggleClass: { targets: feat, className: "is-active" } });
  fonts.then(() => mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".sn-about__content", { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: feat, start: "top bottom", end: "top top", scrub: true } });
    const title = split($(".sn-feat__title"));
    hide(title);
    const rows = fItems.map((it) => {
      const r = { num: split($(".sn-feat__num", it)), name: split($(".sn-feat__name", it)), line: $(".sn-feat__line", it) };
      hide(r.num); hide(r.name); gsap.set(r.line, { width: "0%" });
      return r;
    });
    const tl = gsap.timeline({ scrollTrigger: { trigger: feat, start: "top top", toggleActions: "play none none reverse" } });
    tl.to(title, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }, 0);
    rows.forEach((r, i) => {
      const at = 0.7 * 0.5 + i * 0.15;
      tl.to(r.num, { yPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.04 }, at);
      tl.to(r.name, { yPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.04 }, at);
      tl.to(r.line, { width: "100%", duration: 0.6, ease: "power2.out" }, at);
    });
  }));

  // Three feature sections — the panel unfolds with step-clip-stack(corner). Title line 1.05s and subtitle .75s (.45s overlap) play only when a step first turns on
  const mask = $(".sn-mask");
  fonts.then(() => mm.add("(prefers-reduced-motion: no-preference)", () => {
    const shown = [];
    const parts = $$(".sn-mask__screen").map((s) => {
      const p = { t: split($("[data-mask-title]", s)), s: split($("[data-mask-sub]", s)) };
      hide(p.t); hide(p.s);
      return p;
    });
    const reveal = (k) => {
      if (k < 0 || shown[k] || !parts[k]) return;
      shown[k] = true;
      const tl = gsap.timeline();
      tl.to(parts[k].t, { yPercent: 0, duration: 1.05, ease: "power3.out", stagger: 0.12 }, 0);
      tl.to(parts[k].s, { yPercent: 0, duration: 0.75, ease: "power3.out", stagger: 0.09 }, "-=0.45");
    };
    const on = (e) => reveal(e.detail.index);
    mask.addEventListener("fx:step", on);
    return () => mask.removeEventListener("fx:step", on);
  }));

  // Big print — 1.2→1 while the photo covers in, and after the section sticks, text lines are bound to scroll for two screen heights and rise one by one
  const print = $(".sn-print");
  fonts.then(() => mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".sn-print__img", { scale: 1.2 }, { scale: 1, ease: "none", scrollTrigger: { trigger: print, start: "top bottom", end: "top top", scrub: true } });
    const ent = $$("[data-print]", print).map((el) => { const l = split(el); hide(l); return l; });
    const tl = gsap.timeline({ scrollTrigger: { trigger: print, start: "top top", end: "+=200%", scrub: true } });
    tl.to(ent[0], { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.1 });
    ent.slice(1, 4).forEach((l, i) => tl.to(l, { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.1 }, i === 0 ? "+=0.05" : "<0.3"));
    if (ent[4]) tl.to(ent[4], { yPercent: 0, duration: 1, ease: "power3.out", stagger: 0.1 });
    // On narrow screens the photo sits on the line below the text, so after the text has fully risen it follows, rising from 30% below
    if (matchMedia("(max-width: 991px)").matches) {
      gsap.set(".sn-print__imgwrap", { opacity: 0, yPercent: 30 });
      tl.to(".sn-print__imgwrap", { opacity: 1, yPercent: 0, duration: 1.6, ease: "power3.out" });
    }
  }));

  // Preset picking — the circular transition uses step-clip-stack, and the name line·dial·number use CSS transition .8s at the same step
  const choose = $(".sn-choose");
  const names = $$(".sn-choose__name"), circle = $(".sn-choose__circle"), num = $(".sn-choose__num");
  const setChoose = (k) => {
    names.forEach((el, i) => { el.classList.toggle("is-prev", i < k); el.classList.toggle("is-next", i > k); });
    circle.style.transform = `rotate(${k * -90}deg)`;
    num.textContent = String(k + 1).padStart(2, "0");
  };
  setChoose(0);
  choose.addEventListener("fx:step", (e) => setChoose(e.detail.index));
  fonts.then(() => mm.add("(prefers-reduced-motion: no-preference)", () => {
    const t = split($(".sn-choose__title"));
    hide(t);
    gsap.timeline({ scrollTrigger: { trigger: choose, start: "top top", toggleActions: "play none none reverse" } })
      .to(t, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0);
  }));

  // App controls — five display rows (title + four steps). When the step changes the old one exits upward in .4s power2.in and the new one rises in .5s power2.out.
  const control = $(".sn-control");
  ScrollTrigger.create({ trigger: control, start: "top top", toggleClass: { targets: control, className: "is-active" } });
  const intro = $(".sn-control__intro");
  const cMarks = $$(".sn-control__markers > div");
  const steps = [1, 2, 3, 4].map((n) => ({
    item: $(`.sn-control__item[data-step="${n}"]`),
    line: $(`.sn-control__item[data-step="${n}"] .sn-control__line`),
    phone: n === 1 ? null : $(`[data-screen="${n}"]`),
    badge: $(`[data-badge="${n}"]`),
    label: $(`[data-badge="${n}"] .sn-control__steptitle`),
  }));
  const isSm = matchMedia("(max-width: 767px)").matches;
  const isMd = !isSm && matchMedia("(max-width: 991px)").matches;
  // The word mask stays at 118% line height, so each line is pulled up by the same amount to restore the original line spacing (original compressWrappedRows)
  const pull = (el, words, lg, md, sm) => {
    const em = isSm ? sm : isMd ? md : lg;
    let top = null, row = -1;
    words.forEach((w) => {
      const m = w.parentNode, y = Math.round(m.getBoundingClientRect().top);
      if (top === null || y > top + 2) { top = y; row++; }
      if (row > 0) m.style.transform = `translateY(${em * row}em)`;
    });
    if (row > 0) el.style.marginBottom = `${em * row}em`;
  };
  fonts.then(() => {
    let words = [];
    if (!reduce) {
      const tEl = $(".sn-control__title"), sEl = $(".sn-control__sub");
      const tw = split(tEl, "words"), sw = split(sEl, "words");
      pull(tEl, tw, -0.18, -0.18, -0.28);
      pull(sEl, sw, 0.12, -0.08, -0.08);
      words = tw.concat(sw);
    }
    const d = (s) => (reduce ? 0 : s);
    let cur = -1, chain = false;
    const enterTitle = () => {
      gsap.killTweensOf(intro); gsap.killTweensOf(words);
      const tl = gsap.timeline();
      tl.fromTo(intro, { opacity: 0, yPercent: 20 }, { opacity: 1, yPercent: 0, duration: d(0.6), ease: "power2.out" }, 0);
      if (words.length) tl.fromTo(words, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "power2.out", stagger: 0.03 }, "-=0.2");
      return tl;
    };
    const exitTitle = () => { gsap.killTweensOf(intro); return gsap.to(intro, { opacity: 0, yPercent: -20, duration: d(0.4), ease: "power2.in" }); };
    const enterStep = (s) => {
      gsap.killTweensOf([s.item, s.line, s.phone, s.badge].filter(Boolean));
      const tl = gsap.timeline();
      tl.fromTo(s.item, { opacity: 0, yPercent: 20 }, { opacity: 1, yPercent: 0, duration: d(0.5), ease: "power2.out" }, 0);
      tl.fromTo(s.line, { width: "0%" }, { width: "100%", duration: d(0.5), ease: "power2.out" }, 0);
      if (s.phone) tl.fromTo(s.phone, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: d(0.5), ease: "power2.out" }, 0);
      tl.fromTo(s.badge, { opacity: 0.2 }, { opacity: 1, duration: d(0.5), ease: "power2.out" }, 0);
      s.label.classList.add("is-active");
      return tl;
    };
    const exitStep = (s) => {
      gsap.killTweensOf([s.item, s.line, s.phone, s.badge].filter(Boolean));
      const tl = gsap.timeline();
      if (isMd) tl.to(s.item, { opacity: 0, duration: d(0.1) }, 0);
      else tl.to(s.item, { opacity: 0, yPercent: -20, duration: d(0.4), ease: "power2.in" }, 0);
      if (s.phone) tl.to(s.phone, { opacity: 0, duration: d(0.4), ease: "power2.in" }, 0);
      tl.to(s.badge, { opacity: 0.2, duration: d(0.4), ease: "power2.in" }, 0);
      s.label.classList.remove("is-active");
      tl.set(s.line, { width: "0%" });
      return tl;
    };
    // Tablet: next step only after the previous steps have all cleared — if it changes again meanwhile, jump straight to the last step
    const runChain = (from) => {
      chain = true;
      exitStep(steps[from - 1]).eventCallback("onComplete", () => {
        const target = cur;
        if (target === 0) enterTitle(); else enterStep(steps[target - 1]);
        chain = false;
        if (cur !== target) runChain(target);
      });
    };
    const go = (k) => {
      if (k === cur) return;
      if (isMd && cur > 0) { const from = cur; cur = k; if (!chain) runChain(from); return; }
      if (cur === 0) { if (!isMd && !isSm) exitTitle(); } else if (cur > 0) exitStep(steps[cur - 1]);
      if (k === 0) enterTitle(); else enterStep(steps[k - 1]);
      cur = k;
    };
    watch(cMarks, go);
    steps.forEach((s, i) => s.badge.addEventListener("click", () => {
      go(i + 1);
      window.snScrollTo(cMarks[i + 1].getBoundingClientRect().top + scrollY + 20);
    }));
  });

  // When the next section sliding over passes 70% of the screen, the previous section’s plate starts to blur, reaching 0 when fully covered
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    [[".sn-control__pin", ".sn-footer"], [".sn-print__pin", ".sn-choose"], [".sn-feat__pin", ".sn-mask"], [".sn-mask__pin", ".sn-print"], [".sn-presets__pin", ".sn-control"]]
      .forEach(([a, b]) => gsap.fromTo(a, { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: b, start: "top 70%", end: "top top", scrub: true } }));
  });
})();
