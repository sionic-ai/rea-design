// Team page — original figures: scroll is locked for the 17.3s intro video (520 frames), and four tags change in place at each video point .06 + n × .125,
// When done, after .55s it unfolds into one row in .75s power3.inOut (.05 stagger) (SKIP, 20s failsafe). Header pinned at .9 of the screen (scrub .5),
// Statement pinned for 3.2 screens (scrub 1.1), card tilt ±6° and 1.03x (.4s power2.out, .5s on leave)
(() => {
  const { reduce } = A;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  const hero = $(".t-hero"), pills = $$(".t-pills .a-pill"), solos = $$(".t-solo small"), solo = $(".t-solo"), close = $(".t-close"), hint = $(".a-scroll-hint", hero);
  const pre = $$(".t-pre", hero), pct = $(".a-pre-percent", hero), bar = $(".a-pre-bar i", hero), skip = $(".a-pre-skip", hero), dock = $(".a-dock");
  const neon = $(".t-neon path"), len = neon.getTotalLength();
  neon.style.strokeDasharray = len;
  neon.style.strokeDashoffset = len;
  const h1 = A.split($("h1", hero), "chars");
  const FILM = 17.3;
  let offsets = [];
  const place = () => {
    const r = hero.getBoundingClientRect(), ph = pills[0].getBoundingClientRect().height, sh = solos.reduce((m, s) => Math.max(m, s.getBoundingClientRect().height), 0);
    const gap = innerWidth < 700 ? 18 : 26, y = Math.min(r.height * 0.76, r.height - 40 - sh - gap - ph / 2), x = r.width / 2;
    solo.style.top = y + ph / 2 + gap + "px";
    offsets = pills.map((p) => { const b = p.getBoundingClientRect(); return { dx: x - (b.left - r.left + b.width / 2), dy: y - (b.top - r.top + b.height / 2) }; });
  };
  place();
  gsap.set(pills, { opacity: 0, scale: 0.92, x: (i) => offsets[i].dx, y: (i) => offsets[i].dy });
  gsap.set([hint, close], { opacity: 0 });
  let calm = false, pinTl = null;
  const settle = () => { if (calm) return; calm = true; gsap.to([hint, close], { opacity: 1, duration: 0.5, delay: 0.3, onComplete: () => pinTl?.invalidate() }); };
  const shown = pills.map(() => false);
  let done = false;
  const show = (v) => { pct.textContent = Math.round(v) + "%"; bar.style.width = v + "%"; };
  const finish = (skipped) => {
    if (done) return;
    done = true;
    shown.fill(true);
    if (skipped) neon.style.strokeDashoffset = 0;
    show(100);
    root.classList.remove("is-preloading");
    A.lenis?.start();
    A.lenis?.scrollTo(0, { immediate: true });
    gsap.to(pills, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.75, ease: "power3.inOut", stagger: 0.05, overwrite: true });
    gsap.to(solos, { opacity: 0, duration: 0.3, ease: "power2.in", overwrite: true });
    if (h1) gsap.to(h1.parts, A.rise({ stagger: 0.012, duration: 0.5, overwrite: true }));
    gsap.to(pre, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut", onComplete: () => pre.forEach((n) => n.remove()) });
    gsap.to(dock, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
    settle();
    ScrollTrigger.refresh();
  };
  if (reduce) {
    root.classList.remove("is-preloading");
    pre.forEach((n) => (n.style.display = "none"));
    neon.style.strokeDashoffset = 0;
    gsap.set(pills, { opacity: 1, x: 0, y: 0, scale: 1 });
    settle();
  } else {
    A.lenis?.stop();
    gsap.set(dock, { autoAlpha: 0 });
    if (h1) gsap.to(h1.parts, A.rise({ stagger: 0.03, duration: 1.1, delay: 0.2 }));
    const t0 = performance.now();
    // The original video keeps running to the end even after the tags are fully unfolded — line drawing goes to the end regardless of done
    let skipped = false;
    const film = () => {
      const p = Math.min(1, (performance.now() - t0) / 1000 / FILM);
      if (!skipped) neon.style.strokeDashoffset = len * (1 - p);
      if (p < 1 && !skipped) requestAnimationFrame(film);
    };
    requestAnimationFrame(film);
    skip.addEventListener("click", () => (skipped = true));
    const tick = () => {
      if (done) return;
      const p = Math.min(1, (performance.now() - t0) / 1000 / FILM);
      show(p * 100);
      pills.forEach((pill, n) => {
        if (p < 0.06 + n * (0.5 / pills.length) || shown[n]) return;
        shown[n] = true;
        gsap.to(pill, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
        if (solos[n]) gsap.to(solos[n], { opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.1 });
        if (n > 0) { gsap.to(pills[n - 1], { opacity: 0, duration: 0.35, ease: "power2.in" }); if (solos[n - 1]) gsap.to(solos[n - 1], { opacity: 0, duration: 0.35, ease: "power2.in" }); }
        if (n === pills.length - 1) setTimeout(finish, 550);
      });
      if (p >= 1) finish(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    skip.addEventListener("click", () => finish(true));
    setTimeout(() => finish(), 20000);
    pinTl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: () => "+=" + innerHeight * 0.9, pin: true, pinSpacing: false, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 3 } })
      .to(".t-hero-copy", { y: -60, opacity: 0, duration: 1, ease: "none" }, 0)
      .to(hint, { opacity: 0, duration: 0.3, ease: "none" }, 0)
      .to(close, { y: -60, opacity: 0, duration: 1, ease: "none" }, 0)
      .to([".t-film", ".t-scrim"], { opacity: 0, duration: 1, ease: "none" }, 0);
  }

  // Manifesto — the text flows up, then the reference section settles and the core and two branches light up
  const cine = $(".t-cine"), stage = $(".t-cine-stage"), man = $(".t-copy.is-manifesto"), std = $(".t-copy.is-standard");
  const manT = A.split($("h2", man), "words"), stdT = A.split($("h2", std), "words");
  if (!reduce) {
    gsap.from(".t-cine-pills .a-pill", { opacity: 0, y: 16, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: cine, start: "top 88%", end: "top 55%", scrub: 0.4, invalidateOnRefresh: true } });
    if (manT) gsap.to(manT.parts, A.rise({ stagger: 0.03, duration: 0.5, scrollTrigger: { trigger: cine, start: "top 90%", end: "top 60%", scrub: 0.4, invalidateOnRefresh: true } }));
    gsap.from($$("p", man), { opacity: 0, y: 24, stagger: 0.07, ease: "power2.out", scrollTrigger: { trigger: cine, start: "top 95%", end: "top 58%", scrub: 0.3, invalidateOnRefresh: true } });
  }
  const ct = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: cine, start: "top top", end: () => "+=" + innerHeight * 3.2, pin: stage, scrub: 1.1, invalidateOnRefresh: true, refreshPriority: 2 } });
  ct.to(man, { y: () => -Math.max(0, man.offsetHeight - innerHeight * 0.6), duration: 0.5, ease: "none" }, 0)
    .to(man, { opacity: 0, filter: "blur(12px)", duration: 0.12 }, 0.5)
    .to(std, { opacity: 1, duration: 0.1 }, 0.6)
    .to(stdT ? stdT.parts : [], A.rise({ stagger: 0.01, duration: 0.1 }), 0.6)
    .to(".t-core", { opacity: 1, duration: 0.12 }, 0.7)
    .to(".t-node", { opacity: 1, duration: 0.1, stagger: 0.06 }, 0.82)
    .to({}, { duration: 0.08 }, 0.92);

  // CEO and team — title letters resolve, photos and text rise from below
  $$(".t-founder h2, .t-grid-head h2").forEach((h) => {
    const s = A.split(h, "chars");
    if (s && !reduce) gsap.to(s.parts, A.rise({ stagger: 0.02, duration: 0.5, scrollTrigger: { trigger: h, start: "top 85%", end: "top 35%", scrub: 0.35, invalidateOnRefresh: true } }));
  });
  const photo = $(".t-founder-photo"), lines = [$(".t-founder-name"), $(".t-founder-role"), ...$$(".t-founder-copy p")].filter(Boolean);
  const cards = $$(".t-card"), headP = $(".t-grid-head p");
  if (!reduce) {
    gsap.set(photo, { opacity: 0, y: 34 });
    gsap.set(lines, { opacity: 0, y: 24 });
    gsap.to(photo, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: photo, start: "top 90%", end: "top 60%", scrub: 0.4, invalidateOnRefresh: true } });
    gsap.to(lines, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out", scrollTrigger: { trigger: lines[0], start: "top 90%", end: "top 55%", scrub: 0.4, invalidateOnRefresh: true } });
    gsap.set(headP, { opacity: 0, y: 20 });
    gsap.set(cards, { opacity: 0, y: 30 });
    gsap.to(headP, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", scrollTrigger: { trigger: headP, start: "top 95%", end: "top 60%", scrub: 0.3, invalidateOnRefresh: true } });
    gsap.to(cards, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: cards[0], start: "top 95%", end: "top 58%", scrub: 0.3, invalidateOnRefresh: true } });
  }
  if (matchMedia("(hover: hover)").matches && !reduce) {
    $$("[data-tilt]").forEach((el) => {
      const ph = $(".t-ph", el) || el, k = 6;
      el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; gsap.to(ph, { rotateX: y * -k, rotateY: x * k, scale: 1.03, duration: 0.4, ease: "power2.out", transformPerspective: 700 }); });
      el.addEventListener("mouseleave", () => gsap.to(ph, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.5, ease: "power2.out" }));
    });
  }
  A.footer();
  ScrollTrigger.refresh();
})();
