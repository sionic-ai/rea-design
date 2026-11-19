(() => {
  const kw = window.kw;
  const pose = kw.pose;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const header = $(".kw-header");
  const picker = $(".kw-picker");
  const mm = gsap.matchMedia();

  // Values from the original MOTION_CONFIG. Scroll ranges are measured in one screen height at a time = Written in units of 1 (wheel distance per section captured in the original recording)
  const U = { hero: 4, wine0: 4.1, wineGap: 4.5, culture: 16.4, carousel: 22, map: 31, buy: 36.4, end: 39.4 };
  const WINE_AT = [U.wine0, U.wine0 + U.wineGap, U.wine0 + U.wineGap * 2];

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)", phone: "(max-width: 767px)" }, (ctx) => {
    const { reduce, phone } = ctx.conditions;
    if (reduce) {
      root.classList.add("kw-reduce");
      Object.assign(pose, { x: 0.5, y: phone ? 0.37 : 0.43, h: phone ? 0.6 : 0.69 });
      $$(".kw-wine").forEach((w) => gsap.set(w, { autoAlpha: 1 }));
      return () => root.classList.remove("kw-reduce");
    }

    const split = (el, o) => SplitText.create(el, o);
    const heroTitle = split("[data-hero-title]", { type: "words,chars", mask: "chars", charsClass: "char" });
    const heroCopy = split("[data-hero-copy]", { type: "lines", mask: "lines", linesClass: "line" });
    const heroScroll = split("[data-hero-scroll]", { type: "words", mask: "words" });
    const behind = split("[data-behind-text]", { type: "words,chars", charsClass: "char" });
    const wines = $$("[data-wine-panel]").map((p) => ({
      p,
      chars: split($("[data-wine-split]", p), { type: "words,chars", mask: "chars", charsClass: "char" }).chars,
      lines: $$("[data-wine-line]", p).flatMap((l) => split(l, { type: "lines", mask: "lines", linesClass: "line" }).lines),
      rule: $("[data-wine-rule]", p),
      dot: $("[data-wine-dot]", p),
    }));
    const introLines = $$("[data-intro-line]").flatMap((l) => split(l, { type: "words,chars", mask: "chars", charsClass: "char" }).chars);
    const mapTitle = split("[data-map-title]", { type: "words,chars", mask: "chars", charsClass: "char" }).chars;
    const mapSuffix = split("[data-map-suffix]", { type: "words,chars", mask: "chars", charsClass: "char" }).chars;
    const buyTitle = split("[data-buy-split]", { type: "words,chars", mask: "chars", charsClass: "char" }).chars;

    // Initial state
    gsap.set(heroTitle.chars, { autoAlpha: 0, yPercent: 128, rotationX: -18, transformOrigin: "50% 100%" });
    gsap.set([heroCopy.lines, heroScroll.words], { autoAlpha: 0, yPercent: 112 });
    gsap.set(".kw-behind", { yPercent: 100 });
    gsap.set("[data-behind-eyebrow]", { autoAlpha: 0, y: 18 });
    gsap.set(behind.chars, { opacity: 0.2 });
    wines.forEach((w) => { gsap.set(w.chars, { yPercent: 105 }); gsap.set(w.lines, { yPercent: 105 }); gsap.set(w.rule, { scaleX: 0 }); gsap.set(w.dot, { scale: 0 }); });
    gsap.set(introLines, { yPercent: 105 });
    gsap.set([mapTitle, mapSuffix], { yPercent: 105 });
    gsap.set("[data-map-meta]", { autoAlpha: 0, y: 14 });
    gsap.set(buyTitle, { yPercent: 105 });
    gsap.set("[data-buy-reveal]", { autoAlpha: 0, y: 24 });
    gsap.set(".kw-map__svg", { autoAlpha: 0 });
    gsap.set(".kw-buy", { yPercent: 100 });
    const borders = $$("[data-map-border]");
    borders.forEach((b) => { const L = b.getTotalLength(); gsap.set(b, { strokeDasharray: L, strokeDashoffset: L }); });
    Object.assign(pose, { x: 0.5, y: 1.4, h: phone ? 0.6 : 0.69, rot: 0, spin: -Math.PI * 2, op: 1, wine: 0, follow: 0, dropY: 0, pour: 0, glass: 0, level: 0, branch: 1, branchX: phone ? 0.5 : 0.56 });

    // Hero entrance (when the loader lifts): bottle 6.75s power1.inOut(.1) · title letters 2s stagger .18 power4.out(.72) · pill 2s(.94) · intro 1.8s stagger .08(1.02) · scroll hint 1.8s stagger .045(1.14)
    const heroY = phone ? 0.37 : 0.43;
    const intro = gsap.timeline({ paused: true })
      .to(pose, { y: heroY, spin: 0, duration: 6.75, ease: "power1.inOut" }, 0.1)
      .to(heroTitle.chars, { autoAlpha: 1, yPercent: 0, rotationX: 0, duration: 2, stagger: 0.18, ease: "power4.out" }, 0.72)
      .to(picker, { yPercent: 0, y: 0, duration: 2, ease: "power4.out" }, 0.94)
      .to(heroCopy.lines, { autoAlpha: 1, yPercent: 0, duration: 1.8, stagger: 0.08, ease: "power4.out" }, 1.02)
      .to(heroScroll.words, { autoAlpha: 1, yPercent: 0, duration: 1.8, stagger: 0.045, ease: "power4.out" }, 1.14);
    gsap.set(picker, { xPercent: -50, yPercent: 230 });
    const start = () => { intro.play(0); build(); };
    if (root.dataset.kwLoaded) start(); else addEventListener("kw:ready", start, { once: true });

    let master;
    function build() {
      const H = () => innerHeight;
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      const at = (t) => t;

      // A. Hero → Brand story (original hero.scroll 0~1 in units of 4)
      const behindPose = phone ? { x: 0.52, y: 0.58, h: 0.5, rot: -50 } : { x: 0.5, y: 0.52, h: 0.6, rot: -50 };
      tl.to(pose, { ...behindPose, duration: 2.48, ease: "power2.inOut" }, at(0.2))
        .to("[data-hero-blur]", { filter: "blur(14px)", duration: 1.12 }, at(0.32))
        .to([heroCopy.lines, heroScroll.words], { autoAlpha: 0, yPercent: -40, duration: 1.04 }, at(0.64))
        .to(heroTitle.chars, { autoAlpha: 0, duration: 1.04, stagger: 0.01 }, at(0.64))
        .to(".kw-hero", { autoAlpha: 0, duration: 2 }, at(0.96))
        .to(pose, { branch: 0, duration: 1.4 }, at(0.32))
        .to(".kw-behind", { yPercent: 0, duration: 1.68, ease: "power2.out" }, at(1.36))
        .to("[data-behind-eyebrow]", { autoAlpha: 1, y: 0, duration: 1.2, ease: "power3.out" }, at(2.32))
        .to(behind.chars, { opacity: 1, duration: 0.05, stagger: 1.5 / behind.chars.length }, at(2.6))
        .to(pose, { y: behindPose.y + 0.02, duration: 1.36, ease: "sine.inOut" }, at(2.88))
        .to(".kw-light", { opacity: 1, duration: 1 }, at(3));

      // B. Three wines: first panel color cover .5 (power1.inOut) · bottle .96 (sine.inOut) · text .68 stagger .026 (power4.out) · line .48 (power3.out) · dot .36 (back.out(1.7))
      const enterWine = (w, t) => {
        tl.set(w.p, { autoAlpha: 1 }, t)
          .to(w.chars, { yPercent: 0, duration: 0.68, stagger: 0.026, ease: "power4.out" }, t + 0.2)
          .to(w.lines, { yPercent: 0, duration: 0.58, stagger: 0.026, ease: "power4.out" }, t + 0.3)
          .to(w.rule, { scaleX: 1, duration: 0.48, ease: "power3.out" }, t + 0.25)
          .to(w.dot, { scale: 1, duration: 0.36, ease: "back.out(1.7)" }, t + 0.35);
      };
      const exitWine = (w, t) => {
        tl.to(w.chars, { yPercent: -105, duration: 0.42, stagger: 0.018, ease: "power3.in" }, t)
          .to(w.lines, { yPercent: -105, duration: 0.42, stagger: 0.018, ease: "power3.in" }, t)
          .to([w.rule], { scaleX: 0, transformOrigin: "100% 50%", duration: 0.28, ease: "power2.in" }, t)
          .to(w.dot, { scale: 0, duration: 0.28, ease: "power2.in" }, t)
          .set(w.p, { autoAlpha: 0 }, t + 0.9);
      };
      const wash = $("[data-wine-wash]");
      const washes = $$("[data-wash]");
      gsap.set(washes, { opacity: (i) => (i ? 0 : 1) });
      const winePose = phone ? { x: 0.5, y: 0.5, h: 0.5 } : { x: 0.5, y: 0.483, h: 0.77 };
      tl.to(wash, { opacity: 1, duration: 0.5, ease: "power1.inOut" }, U.wine0)
        .to(".kw-behind", { autoAlpha: 0, duration: 0.5 }, U.wine0)
        .to(pose, { ...winePose, rot: 0, duration: 0.96, ease: "sine.inOut" }, U.wine0);
      enterWine(wines[0], U.wine0);
      [1, 2].forEach((i) => {
        const t = WINE_AT[i] - 0.4;
        exitWine(wines[i - 1], t);
        // Board turn 1.28 (power2.inOut): the bottle spins once and swaps the label when its back shows · color follows after .35 for .85 (power2.out)
        tl.to(pose, { spin: `+=${Math.PI * 2}`, duration: 1.28, ease: "power2.inOut" }, t)
          .set(pose, { wine: i }, t + 0.64)
          .to(washes[i], { opacity: 1, duration: 0.85, ease: "power2.out" }, t + 0.35)
          .to(washes[i - 1], { opacity: 0, duration: 0.85, ease: "power2.out" }, t + 0.35);
        enterWine(wines[i], t + 0.18 + 0.42);
      });

      // C. Pour: the bottle grows, rises and tilts, the glass rises, and the stream fills the glass. Two texts swap at the .25 point (exit .35 · gap .05 · enter .4)
      const c0 = U.culture;
      exitWine(wines[2], c0);
      const pourAt = phone ? { x: 0.7, y: 0.12, h: 0.9 } : { x: 0.66, y: 0.1, h: 1.45 };
      tl.to(".kw-culture__bg", { opacity: 1, duration: 1 }, c0 + 0.2)
        .to(wash, { opacity: 0, duration: 1 }, c0 + 0.4)
        .to(pose, { x: 0.47, y: 0.22, h: phone ? 0.75 : 1.25, rot: 30, duration: 1.2, ease: "power2.inOut" }, c0)
        .to("[data-culture-title='0']", { opacity: 1, duration: 0.4 }, c0 + 1)
        .to(pose, { ...pourAt, rot: 118, duration: 1.2, ease: "power2.inOut" }, c0 + 1.2)
        .set(pose, { glassX: phone ? 0.42 : 0.44, glassY: phone ? 0.72 : 0.74, glassH: phone ? 0.34 : 0.5 }, c0 + 1.2)
        .to(pose, { glass: 1, duration: 1, ease: "power2.out" }, c0 + 1.8)
        .to(pose, { pour: 1, duration: 0.6 }, c0 + 2.4)
        .to(pose, { level: 1, duration: 2.6 }, c0 + 2.5)
        .to("[data-culture-title='0']", { opacity: 0, duration: 0.35 }, c0 + 3.1)
        .to("[data-culture-title='1']", { opacity: 1, duration: 0.4 }, c0 + 3.5)
        .to(pose, { pour: 0, rot: 100, duration: 0.6 }, c0 + 5.0)
        .to(pose, { op: 0, glass: 0, duration: 0.5 }, U.carousel + 0.4)
        .to("[data-culture-title='1']", { opacity: 0, duration: 0.4 }, U.carousel + 0.2);

      // D. Photo band: the next section covers from below (1) and the title letters rise, while the small photo in the title gap grows into the big center slot
      const car = $(".kw-carousel");
      const slides = $$("[data-slide]");
      const R = phone
        ? { enter: [1.02, 1.02, 0.4, 0.2], next: [0.6, 0.84, 0.4, 0.16], main: [0.06, 0.32, 0.88, 0.36], prev: [0, 0, 0.4, 0.16], exit: [-0.45, -0.2, 0.4, 0.16], full: [0, 0, 1, 1] }
        : { enter: [1.02, 1.02, 0.2, 0.2], next: [0.82, 0.82, 0.2, 0.2], main: [0.28, 0.27, 0.55, 0.45], prev: [0, 0, 0.28, 0.27], exit: [-0.3, -0.3, 0.28, 0.27], full: [0, 0, 1, 1] };
      const box = (k) => ({ left: `${R[k][0] * 100}%`, top: `${R[k][1] * 100}%`, width: `${R[k][2] * 100}%`, height: `${R[k][3] * 100}%` });
      const gap = $("[data-intro-gap]");
      const gapBox = () => {
        const g = gap.getBoundingClientRect(), c = car.getBoundingClientRect();
        return { left: `${((g.left - c.left) / c.width) * 100}%`, top: `${((g.top - c.top) / c.height) * 100}%`, width: `${(g.width / c.width) * 100}%`, height: `${(g.height / c.height) * 100}%` };
      };
      slides.forEach((s, i) => gsap.set(s, box("enter")));
      const k0 = U.carousel;
      tl.set(car, { autoAlpha: 1, yPercent: 100 }, k0)
        .set(slides[0], { ...gapBox() }, k0)
        .to(car, { yPercent: 0, duration: 1, ease: "power2.inOut" }, k0)
        .to(introLines, { yPercent: 0, duration: 0.8, stagger: 0.04, ease: "power4.out" }, k0 + 0.6)
        .from("[data-intro-desc]", { autoAlpha: 0, y: 20, duration: 0.6 }, k0 + 0.9)
        .to(slides[0], { ...box("main"), duration: 0.78, ease: "power2.inOut" }, k0 + 1.6)
        .to(slides[1], { ...box("next"), duration: 0.78, ease: "power2.inOut" }, k0 + 1.8)
        .to("[data-carousel-intro]", { autoAlpha: 0, yPercent: -12, duration: 0.65 }, k0 + 1.7);
      for (let k = 0; k < 4; k++) {
        const t = k0 + 2.8 + k * 1.5;
        if (slides[k - 1]) tl.to(slides[k - 1], { ...box("exit"), duration: 0.64, ease: "power2.inOut" }, t);
        tl.to(slides[k], { ...box("prev"), duration: 0.64, ease: "power2.inOut" }, t)
          .to(slides[k + 1], { ...box("main"), duration: 0.64, ease: "power2.inOut" }, t);
        if (slides[k + 2]) tl.to(slides[k + 2], { ...box("next"), duration: 0.64, ease: "power2.inOut" }, t);
      }
      const kEnd = k0 + 2.8 + 4 * 1.5;
      tl.to(slides[3], { ...box("exit"), duration: 0.9, ease: "power2.inOut" }, kEnd - 0.4)
        .to(slides[4], { ...box("full"), duration: 0.9, ease: "power2.inOut" }, kEnd - 0.4);

      // E. Map: title .8 gap .04 → hold → exit .65 power4.in → blur .55 → panel .45 → description .75 gap .09 → border 1.2 gap .12 → fill .5 → dots .44 gap .08 → pull up and lift 1.15 power2.inOut
      const m0 = U.map;
      const zoom = $("[data-map-zoom]");
      tl.set(".kw-map", { autoAlpha: 1 }, m0)
        .to(mapTitle, { yPercent: 0, duration: 0.8, stagger: 0.04, ease: "power4.out" }, m0 + 0.06)
        .to(mapSuffix, { yPercent: 0, duration: 0.9, stagger: 0.04, ease: "power4.out" }, m0 + 0.14)
        .to("[data-map-meta]", { autoAlpha: 1, y: 0, duration: 0.58, stagger: 0.035, ease: "power4.out" }, m0 + 0.2)
        .to(mapTitle, { yPercent: -105, duration: 0.65, stagger: 0.035, ease: "power4.in" }, m0 + 1.4)
        .to(mapSuffix, { yPercent: -105, duration: 0.65, stagger: 0.035, ease: "power4.in" }, m0 + 1.48)
        .to("[data-map-meta]", { autoAlpha: 0, duration: 0.52, stagger: 0.03, ease: "power4.in" }, m0 + 1.44)
        .to("[data-map-blur]", { opacity: 1, duration: 0.55 }, m0 + 1.56)
        .to(".kw-map__svg", { autoAlpha: 1, duration: 0.45 }, m0 + 1.66)
        .to("[data-map-desc]", { opacity: 1, y: 0, duration: 0.75, ease: "power4.out" }, m0 + 1.72)
        .to(borders, { strokeDashoffset: 0, duration: 1.2, stagger: 0.12 }, m0 + 1.88)
        .to("[data-map-shape]", { opacity: 1, duration: 0.5 }, m0 + 2.4)
        .to(["[data-map-dot]", "[data-map-label]"], { opacity: 1, duration: 0.44, stagger: 0.08, ease: "power4.out" }, m0 + 2.5)
        .to(zoom, { scale: 2.6, svgOrigin: "850 340", x: -500, y: -40, duration: 1.15, ease: "power2.inOut" }, m0 + 3.1)
        .to(["[data-map-dot]", "[data-map-label]"], { opacity: 0, duration: 0.48 }, m0 + 3.8)
        .to("[data-map-final]", { opacity: 1, duration: 0.42, ease: "power4.out" }, m0 + 3.95);

      // F. Purchase panel: rises from below over 1.65, the bottle falls from above and stands on the branch. Title .48 stagger .045 · side text .36 stagger .04
      const b0 = U.buy;
      tl.to(".kw-buy", { yPercent: 0, duration: 1.65, ease: "power2.inOut" }, b0)
        .set(pose, { follow: 1, wine: 0, rot: 0, spin: 0, h: phone ? 0.46 : 0.55, dropY: -1.2, op: 1, glass: 0, pour: 0 }, b0 + 0.7)
        .to(pose, { dropY: 0, duration: 1.1, ease: "power3.inOut" }, b0 + 0.75)
        .to(buyTitle, { yPercent: 0, duration: 0.48, stagger: 0.045, ease: "power4.out" }, b0 + 0.95)
        .to("[data-buy-reveal]", { autoAlpha: 1, y: 0, duration: 0.36, ease: "power4.out" }, b0 + 1.05)
        .to({}, { duration: 0.01 }, U.end);

      // Header text color and pill name are set by current position
      const toneAt = (t) => (t < 1.4 ? "light" : t < U.map + 0.1 ? "dark" : t < U.buy + 0.9 ? "light" : "dark");
      const wineAt = (t) => (t < U.wine0 + 0.2 ? -1 : t < WINE_AT[1] - 0.4 + 0.64 ? 0 : t < WINE_AT[2] - 0.4 + 0.64 ? 1 : t < U.culture + 0.3 ? 2 : -1);
      master = ScrollTrigger.create({
        animation: tl,
        trigger: ".kw-show",
        start: "top top",
        end: () => `+=${U.end * H()}`,
        pin: ".kw-show__pin",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (st) => {
          const t = st.progress * U.end;
          header.dataset.tone = toneAt(t);
          kw.setPickerWine?.(wineAt(t));
          gsap.to(picker, { yPercent: t > U.carousel ? 230 : 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
        },
      });
      const unit = () => (master.end - master.start) / U.end;
      const pinIds = { hero: 0, region: WINE_AT[0] + 1.1, map: U.map + 0.6, buy: U.buy + 2.2 };
      kw.anchorY = (id, el) => (id in pinIds ? master.start + pinIds[id] * unit() : kw.bar.scrollTop + el.getBoundingClientRect().top);
      kw.goWine = (i) => kw.scrollTo(master.start + (WINE_AT[i] + 1.1) * unit(), 1600);

      // Stockists: appear once when visible (top 80%) — title letters .72 stagger .055 · items .8 stagger .08 (power4.out)
      const contactChars = split("[data-contact-split]", { type: "words,chars", mask: "chars", charsClass: "char" }).chars;
      gsap.set(contactChars, { yPercent: 105 });
      gsap.set("[data-contact-reveal]", { autoAlpha: 0, y: 24 });
      ScrollTrigger.create({
        trigger: ".kw-contact", start: "top 80%", once: true,
        onEnter: () => {
          gsap.to(contactChars, { yPercent: 0, duration: 0.72, stagger: 0.055, ease: "power4.out", delay: 0.06 });
          gsap.to("[data-contact-reveal]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power4.out" });
        },
      });
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }

    return () => { master?.kill(); intro.kill(); };
  });

  // The fluid-light background follows the mouse over the purchase panel
  kw.fluid($("[data-fluid]"), $(".kw-buy"));
})();
