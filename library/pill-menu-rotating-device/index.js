// Home page scenes — exactly the timetable of the original HomeHero · HomeIntro · HomeCompanyDetails · HomeProducts · HomeAbout · HomeMasterPlan
A.scene(({ reduce, observe, progress, fx, show }) => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Hero: the photo sharpens from blur 10px·1.1x in 2s, logo .1s · title .4s · picker 1.2s · news line and scroll-down 1.3s
  const hero = $(".h-hero");
  if (hero && !reduce) {
    gsap.timeline()
      .fromTo($(".h-hero__img"), { autoAlpha: 0, filter: "blur(10px)", scale: 1.1 }, { autoAlpha: 1, duration: 2, ease: "power3.out", filter: "blur(0px)", scale: 1 }, 0)
      .fromTo($(".h-hero__logo"), { autoAlpha: 0, filter: "blur(10px)" }, { autoAlpha: 1, duration: 1.5, filter: "blur(0px)" }, 0.1)
      .call(() => fx.title($(".h-hero__title")), [], 0.4)
      .fromTo($(".h-hero__cats"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1 }, 1.2)
      .fromTo($(".h-hero__head"), { autoAlpha: 0, y: -50 }, { autoAlpha: 1, duration: 1.2, ease: "power3.out", y: 0 }, 1.3)
      .call(() => fx.scroll($(".h-hero__scroll")), [], 1.3);
  }

  // About: once on first appearance — labels are faded words, body lines rise 50px over .8s, links .45s.
  // The closing phrase changes every 3.5s while the section is visible (the old one fades out in .5s, the new one blurs in word by word over 1.3s)
  const intro = $(".h-intro");
  if (intro) {
    const lines = $$(".h-intro__line", intro);
    let idx = 0, seen = false, played = false;
    const enter = (el) => {
      const s = new SplitText(el, { type: "words" });
      gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(s.words, { autoAlpha: 0, filter: "blur(10px)" }, { autoAlpha: 1, duration: 1.3, filter: "blur(0px)", stagger: 0.1, onComplete: () => s.revert() });
    };
    const leave = (el) => gsap.to(el, { autoAlpha: 0, duration: 0.5, onComplete: () => gsap.set(el, { clearProps: "all" }) });
    observe(intro, (on) => {
      seen = on;
      if (!on || played) return;
      played = true;
      show($(".h-intro__grid"));
      if (reduce) { gsap.set(lines[0], { autoAlpha: 1 }); return; }
      const tl = gsap.timeline();
      tl.call(() => fx.title($(".h-intro__title")), [], 0);
      const main = new SplitText($(".h-intro__main"), { type: "lines" });
      gsap.set(lines[0], { autoAlpha: 1 });
      tl.fromTo([...main.lines, lines[0]], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, duration: 0.8, ease: "power3.out", y: 0, stagger: 0.05 }, 0.2);
      tl.call(() => fx.arrow($(".h-intro__link")), [], 0.45);
    }, false);
    if (!reduce && lines.length > 1) {
      setInterval(() => {
        if (!seen || !played) return;
        leave(lines[idx]);
        idx = (idx + 1) % lines.length;
        enter(lines[idx]);
      }, 3500);
    }
  }

  // Pledge line: faded title words, from .5s the heading 2s · big text rising 40px for 1s (opacity shrinking 1 · .8 · .6) · line 1.5s, each in .15s order
  const top = $(".h-company__top");
  observe(top, (on) => {
    if (!on) return;
    show(top);
    if (reduce) return;
    fx.title($(".h-company__title"));
    const tl = gsap.timeline();
    let o = 1;
    tl.fromTo($$(".h-company__head"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2, stagger: 0.15 }, 0.5)
      .fromTo($$(".h-company__text"), { autoAlpha: 0, y: 40 }, { autoAlpha: (i) => (o = i > 0 ? o - 0.2 : o, o), duration: 1, ease: "power3.out", stagger: 0.15, y: 0 }, 0.5)
      .fromTo($$(".h-company__line"), { scaleX: 0 }, { duration: 1.5, ease: "power3.out", scaleX: 1, stagger: 0.15 }, 0.5);
  });
  const bottom = $(".h-company__bottom");
  observe(bottom, (on) => {
    if (!on) return;
    show(bottom);
    if (reduce) return;
    gsap.timeline()
      .fromTo($(".h-company__facts").children, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, duration: 1, ease: "power3.out", stagger: 0.1, y: 0 }, 0)
      .fromTo($(".h-company__rule"), { scaleX: 0 }, { duration: 1.2, ease: "power3.out", scaleX: 1, stagger: 0.05 }, 0.15)
      .fromTo([$(".h-company__talk-head"), $(".h-company__talk")], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, duration: 1, ease: "power3.out", y: 0 }, 0.3);
  });
  if (reduce) $$(".h-company__text").forEach((el, i) => gsap.set(el, { opacity: 1 - i * 0.2 }));

  // Product: title is blurred words when visible, photo group moves -50 → 50px (power1.out) while passing the section, hovering the pill swaps the photo
  const prod = $(".h-products");
  if (prod) {
    observe($(".h-products__title"), (on) => on && (reduce ? show($(".h-products__title")) : fx.title($(".h-products__title"))));
    const inner = $(".h-products__inner");
    if (!reduce) {
      const drift = gsap.timeline({ paused: true }).fromTo(inner, { y: -50 }, { y: 50 });
      progress(prod, (p) => drift.progress(p));
    }
    const imgs = $$(".h-products__img", prod);
    const chips = $$("[data-swap]", prod);
    let cur = 0, busy = false;
    chips.forEach((chip) => chip.addEventListener("mouseenter", () => {
      const n = +chip.dataset.swap;
      if (busy || n === cur) return;
      chips.forEach((c) => c.classList.toggle("is-fill", c === chip));
      const was = imgs[cur], next = imgs[n];
      cur = n;
      if (reduce) { was.classList.remove("is-on"); next.classList.add("is-on"); return; }
      busy = true;
      gsap.fromTo(was, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, duration: 0.4, ease: "power3.in", scale: 0.85, onComplete: () => was.classList.remove("is-on") });
      next.classList.add("is-on");
      gsap.fromTo(next, { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, duration: 0.4, delay: 0.3, ease: "power2.out", scale: 1, onComplete: () => { busy = false; } });
    }));
  }

  // Method cell: label 1.2s, title blurred words, body lines .1s, link .15s, memo .3s up to .4, line .7s over 2s
  $$(".h-about__item").forEach((item) => observe(item, (on) => {
    if (!on) return;
    show(item);
    if (reduce) return;
    const tl = gsap.timeline();
    tl.fromTo($(".h-about__title", item), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power3.out" }, 0)
      .call(() => fx.title($(".h-about__sub", item)), [], 0);
    fx.lines(tl, $(".h-about__copy", item), 0.1);
    tl.call(() => fx.arrow($(".a-arrow", item)), [], 0.15)
      .fromTo($(".h-about__note", item), { autoAlpha: 0 }, { autoAlpha: 0.4, duration: 1.2 }, 0.3);
    const line = $(".h-about__line", item);
    if (line) tl.fromTo(line, { scaleX: 0 }, { duration: 2, ease: "power3.out", scaleX: 1 }, 0.7);
  }));

  // Blue numbers section
  const plan = $(".h-plan__grid");
  observe(plan, (on) => {
    if (!on) return;
    show(plan);
    if (reduce) return;
    gsap.timeline()
      .call(() => fx.title($(".h-plan__num")), [], 0)
      .call(() => fx.title($(".h-plan__title")), [], 0)
      .call(() => fx.copy($(".h-plan__copy"), 0.7), [], 0.2)
      .call(() => fx.arrow($(".h-plan__link")), [], 0.55);
  });
});
