// Home page — logo loader → name banner, scroll-tied 3D stages (workshop → lab scan → contact section), floating box entrance, center menu bar
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const S = window.dvScene?.state || {};
  const loader = document.querySelector(".dv-loader"), rect = document.querySelector(".dv-loader__rect");
  const heroBanner = document.querySelector(".dv-hero__banner");
  if (heroBanner && !reduce) { heroBanner.setAttribute("data-banner-manual", ""); gsap.set(heroBanner.querySelector(".dv-banner__bg"), { scaleX: 0 }); }

  // Loader: progress = .25 + loaded share × .75 (half fonts, half document), clears .2s after it fills up
  let loaded = 0;
  const show = () => { const p = 0.25 + loaded * 0.75; if (rect) rect.style.transform = `scaleY(${p})`; if (p >= 1) gsap.delayedCall(0.2, open); };
  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    document.body.classList.remove("is-loading");
    loader?.classList.add("is-hidden");
    if (heroBanner && !reduce) dvSite.banner(heroBanner).play();
    ScrollTrigger.refresh();
  };
  show();
  (document.fonts?.ready || Promise.resolve()).then(() => { loaded += 0.5; show(); });
  (document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }))).then(() => { loaded += 0.5; show(); });
  setTimeout(() => { loaded = 1; show(); }, 6000);

  const spacer = document.querySelector(".dv-about-spacer"), hero = document.querySelector(".dv-hero__in");
  const wraps = { details: ".dv-box-wrap--details", desc: ".dv-box-wrap--desc", skills: ".dv-box-wrap--skills" };
  const played = new Set();
  const playBox = (k) => {
    if (played.has(k)) return;
    played.add(k);
    const box = document.querySelector(wraps[k] + " .dv-box");
    if (box) dvSite.scrambleAll(box, +box.dataset.steps, +box.dataset.dur).play();
  };
  const mm = gsap.matchMedia();
  mm.add({ wide: "(orientation: landscape)", tall: "(orientation: portrait)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { wide, reduce: rd } = ctx.conditions;
    // Work → Lab: from when the Lab section top is 200px above the screen bottom until it reaches the screen top
    const t1 = gsap.timeline({ scrollTrigger: { trigger: spacer, start: "top-=200 bottom", end: "top top", scrub: rd ? false : true } });
    t1.fromTo(S, { intro: 0 }, { intro: 1, ease: "none", duration: 1 }, 0);
    t1.fromTo(hero, { autoAlpha: 1, yPercent: 0 }, { autoAlpha: 0, yPercent: -40, ease: "none", duration: 0.5 }, 0);
    // Scan: the section head goes from 35% of the screen (25% on portrait) to the section end — three boxes light up for .15 at 0 · .4 · .8
    const t2 = gsap.timeline({ scrollTrigger: { trigger: spacer, start: wide ? "top 35%" : "top 25%", end: "bottom bottom", scrub: rd ? false : true } });
    t2.fromTo(S, { scan: 0 }, { scan: 1, duration: 0.95, ease: "none" }, 0);
    t2.to({}, { duration: 0.05 }, 0.95);
    if (wide) {
      [["details", 0], ["desc", 0.4], ["skills", 0.8]].forEach(([k, at]) => {
        t2.fromTo(wraps[k], { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "power1.out" }, at);
        t2.add(() => playBox(k), at);
      });
    } else {
      t2.fromTo(wraps.desc, { opacity: 0, y: "10vh" }, { opacity: 1, y: "0vh", duration: 0.15, ease: "power1.out" }, 0);
      t2.to(wraps.desc, { opacity: 0, y: "-10vh", duration: 0.15, ease: "power1.out" }, 0.525);
      t2.add(() => playBox("desc"), 0);
      t2.fromTo(".dv-count", { opacity: 0, y: "10vh" }, { opacity: 1, y: "0vh", duration: 0.15, ease: "power1.out" }, 0);
    }
    // Past the lab, the boxes drop together
    gsap.timeline({ scrollTrigger: { trigger: ".dv-projects", start: "top bottom", end: "top 60%", scrub: true } }).to(".dv-about", { autoAlpha: 0, ease: "none" });
  });
  // Contact section: while entering (section top below screen → section end below screen) the camera sinks by 4, and when the section top reaches 15% of the screen the character wakes up
  const contact = document.querySelector(".dv-contact"), zzz = document.querySelector(".dv-zzz");
  gsap.timeline({ scrollTrigger: { trigger: contact, start: "top bottom", end: "bottom bottom", scrub: true } }).fromTo(S, { contactIn: 0 }, { contactIn: 1, ease: "none", duration: 1 });
  gsap.timeline({ scrollTrigger: { trigger: contact, start: "bottom bottom", end: "bottom top", scrub: true } }).fromTo(S, { contactOut: 0 }, { contactOut: 1, ease: "none", duration: 1 });
  ScrollTrigger.create({
    trigger: contact, start: "top 15%",
    onEnter: () => { gsap.to(S, { wake: 1, duration: reduce ? 0 : 1.2, delay: 0.25, ease: "power2.inOut" }); zzz?.classList.remove("is-on"); },
    onLeaveBack: () => { gsap.to(S, { wake: 0, duration: reduce ? 0 : 0.8, ease: "power2.inOut" }); zzz?.classList.add("is-on"); },
  });
  ScrollTrigger.create({ trigger: contact, start: "top bottom", end: "bottom top", onToggle: (st) => zzz?.classList.toggle("is-on", st.isActive && S.wake < 0.5) });

  // Stats bar (phone)
  const fill = document.querySelector(".dv-count__fill"), pct = document.querySelector(".dv-count__pct");
  gsap.ticker.add(() => { const v = Math.floor((S.scan || 0) * 100); if (fill) fill.style.width = `${v}%`; if (pct) pct.textContent = `${v}%`; });

  // Center menu: a bar slides under the current section, and a dark panel appears over the lab
  const nav = document.querySelector(".dv-nav"), bar = nav?.querySelector(".dv-nav__bar"), links = [...(nav?.querySelectorAll(".dv-nav__link") || [])];
  const sections = [spacer, document.querySelector(".dv-projects"), contact];
  const setActive = (i) => {
    links.forEach((l, j) => l.classList.toggle("is-on", j === i));
    if (!bar) return;
    bar.classList.toggle("is-on", i >= 0);
    if (i >= 0) bar.style.transform = `translateX(${links[i].offsetLeft - 3}px)`;
  };
  const navTick = () => {
    const mid = innerHeight * 0.5;
    let i = -1;
    sections.forEach((s, j) => { if (s && s.getBoundingClientRect().top <= mid) i = j; });
    if (scrollY < innerHeight * 0.5) i = -1;
    setActive(i);
    const dark = S.intro > 0.5 && sections[1].getBoundingClientRect().top > innerHeight * 0.1;
    nav?.classList.toggle("is-dark", dark);
    document.body.classList.toggle("is-dark-head", dark);
  };
  addEventListener("scroll", navTick, { passive: true });
  addEventListener("resize", navTick);
  navTick();
  links.forEach((l) => l.addEventListener("click", () => {
    const t = document.querySelector(l.dataset.go);
    if (!t) return;
    const y = l.dataset.go === "#about" ? t.getBoundingClientRect().top + scrollY + innerHeight * 0.35 : t.getBoundingClientRect().top + scrollY;
    dvSite.scrollTo(y);
  }));
})();
