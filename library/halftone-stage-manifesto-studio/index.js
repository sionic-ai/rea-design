// First page: one fixed stage 25 screens long (scrub 1.5) with the scenes chained on a timetable. Values are in the original timetable units.
// Among the original position strings "< - 10"·"< + 20" A space after a symbol like this makes GSAP drop the number and "<" is read as this, so here too "<" Set to.
// First sentence → sentence with a rotating photo → golden curtain pushes in from the right into a halftone silhouette → silhouette shrinks to a 216px square and becomes the center cell of the skills row
// → tech row flows sideways with only the center word in gold → small top-right photo fills the screen → two sets of text → curtain slides out left revealing the final contact panel.
(() => {
  const SH = window.SH;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mobile = SH.isMobile();
  const reduced = SH.reduced;

  const hero = $(".sh-hero");
  const pin = $(".sh-pin");
  const track = $(".sh-track");
  const first = $(".sh-first");
  const second = $(".sh-second");
  const full = $(".sh-full");
  const inner = $(".sh-full__inner");
  const ft1 = $(".sh-fulltext--1");
  const ft2 = $(".sh-fulltext--2");
  const bgimg = $(".sh-bgimg");
  const bgEnd = $(".sh-bgimg__end");
  const techno = $(".sh-techno");
  const lists = $$(".sh-techno__list");
  const items = $$(".sh-techno__list.is-main .sh-techno__item");
  const fake = $(".sh-ti--fake .sh-ti__layer");
  const tTitle = $(".sh-techno__list.is-main .sh-techno__title");
  const tTitleM = $(".sh-techno__mtitle");
  const lastImg = $(".sh-ti--1");
  const lastText = $(".sh-last");
  const lastFirst = $(".sh-last__first");
  const lastMobile = $(".sh-last__mobile");
  const lastSecond = $(".sh-last__second");
  const endText = $(".sh-end__text");
  const endBtn = $(".sh-end__btn");
  const privacy = $(".sh-end__privacy a");
  const card = $(".sh-card");
  const cardWrap = $(".sh-card-wrap");
  const logoSpan = $(".sh-inline-logo");
  const corners = $$(".sh-menu-btn, .sh-logo, .sh-contact");
  const lw = $(".sh-lw");

  /* ---------- Three background layers: site background (color changes per scene) · golden stage · silhouette ---------- */
  const ph = SH.phases;
  SH.dotField($(".sh-site-bg"), {
    grid: 65,
    colors: {
      bg: ["--site-salmon", "--site-dot-1", "--site-dot-2", "--site-dot-3"],
      fg: ["--site-dot-4", "--kf-raised", "--site-dot-5", "--site-dot-6"],
    },
    phases: () => [ph.p1, ph.p2, ph.p3],
    shouldRender: () => SH.fullX !== 0,
  });
  // The silhouette scene flips gold background ↔ cream background by the opacity of the end curtain (.sh-bgimg__end)
  const endPhase = () => [0, 0, parseFloat(bgEnd.style.opacity) || 0];
  const fullOn = () => Math.abs(SH.fullX) < 100;
  SH.dotField($(".sh-bgimg__dots"), {
    grid: 50,
    colors: {
      bg: ["--kf-accent-soft", "--site-dot-7", "--site-dot-8", "--site-dot-9"],
      fg: ["--site-dot-10", "--kf-raised", "--site-dot-11", "--kf-accent"],
    },
    phases: endPhase,
    shouldRender: fullOn,
  });
  SH.dotField($(".sh-bgimg__fig"), {
    grid: 50,
    colors: {
      bg: ["--site-fig", "--site-fig", "--site-fig", "--site-dot-12"],
      fg: ["--site-dot-13", "--site-dot-13", "--site-dot-13", "--site-dot-14"],
    },
    phases: endPhase,
    shouldRender: fullOn,
  });

  /* ---------- Rectangle that the corner gauge’s gold and white layers follow ---------- */
  SH.revealRects.gold = bgimg;
  SH.revealRects.white = lastImg;

  /* ---------- Recent work cards: bounce around inside the screen (1.1, .8 px/frame), and slow to .05 on mouse hover ---------- */
  if (!mobile && !reduced) {
    const pos = { x: 120, y: 80 }, v = { x: 1.1, y: 0.8 };
    let speed = 1, hover = false;
    cardWrap.addEventListener("mouseenter", () => (hover = true));
    cardWrap.addEventListener("mouseleave", () => (hover = false));
    const origin = first.getBoundingClientRect();
    gsap.ticker.add(() => {
      if (first.style.visibility === "hidden") return;
      const w = cardWrap.offsetWidth, h = cardWrap.offsetHeight;
      const minX = -origin.left, minY = -origin.top, maxX = innerWidth - w - origin.left, maxY = innerHeight - h - origin.top;
      speed += ((hover ? 0 : 1) - speed) * 0.05;
      if (maxX <= minX || maxY <= minY) return;
      pos.x += v.x * speed;
      pos.y += v.y * speed;
      if (pos.x <= minX) { pos.x = minX; v.x = Math.abs(v.x); }
      if (pos.x >= maxX) { pos.x = maxX; v.x = -Math.abs(v.x); }
      if (pos.y <= minY) { pos.y = minY; v.y = Math.abs(v.y); }
      if (pos.y >= maxY) { pos.y = maxY; v.y = -Math.abs(v.y); }
      cardWrap.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    });
  }

  /* ---------- Tech line: only words overlapping the center square turn gold, and the photo stack is covered up to that index ---------- */
  const stacks = $$(".sh-ti:not(.sh-ti--fake)");
  stacks.forEach((s) => $$(".sh-ti__layer", s).forEach((l) => (l.style.transitionDelay = s.dataset.delay + "s")));
  let active = -1;
  const setActive = (i) => {
    if (i === active) return;
    active = i;
    stacks.forEach((s) => {
      const ahead = Number(s.dataset.ahead);
      $$(".sh-ti__layer", s).forEach((l) => l.classList.toggle("is-in", Number(l.dataset.n) <= i + ahead));
    });
  };
  setActive(0);
  const whiteList = $(".sh-techno__list.is-white");
  const lit = new Set();
  gsap.ticker.add(() => {
    if (!fullOn()) return;
    const r = bgimg.getBoundingClientRect(), o = whiteList.getBoundingClientRect();
    const l = r.left - o.left, t = r.top - o.top;
    whiteList.style.clipPath = `polygon(${l}px ${t}px, ${l + r.width}px ${t}px, ${l + r.width}px ${t + r.height}px, ${l}px ${t + r.height}px)`;
    const mainTitle = $(".sh-techno__title", lists[0]), whiteTitle = $(".sh-techno__title", whiteList);
    const tw = mainTitle.getBoundingClientRect().width + "px";
    if (whiteTitle.style.width !== tw) { whiteTitle.style.width = tw; whiteTitle.style.flexShrink = "0"; }
    items.forEach((it, i) => {
      const b = it.getBoundingClientRect();
      const hit = b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom;
      if (hit && !lit.has(i)) { lit.add(i); it.style.color = "var(--kf-accent)"; }
      else if (!hit && lit.has(i)) { lit.delete(i); it.style.color = ""; }
    });
  });

  /* ---------- Text splitting: each character starts at blur 8 ---------- */
  const chars = (el) => SH.split(el).chars;
  const fChars = $$(".sh-first .sh-line").map(chars);
  const sChars = chars($(".sh-second__text"));
  const ft1Chars = chars($("p", ft1));
  const ft2Chars = chars($("p", ft2));
  const ttChars = chars($("p", tTitle));
  const ttmChars = chars($("p", tTitleM));
  const [l1a, l1b] = $$(".sh-line", lastFirst).map(chars);
  const lmChars = chars($("p", lastMobile));
  const [l2a, l2b] = $$(".sh-line", lastSecond).map(chars);
  const endChars = chars($("p", endText));
  // Letter spacing is given as the total of the original sentence length (letters × spacing) — so the timing matches the original even if placeholder text length differs
  const span = (amount) => ({ amount });
  const hidden = { autoAlpha: 0, filter: "blur(8px)" };
  const shown = { autoAlpha: 1, filter: "blur(0px)" };
  gsap.set([...fChars.flat(), logoSpan, sChars, ft1Chars, ft2Chars, l1a, l1b, l2a, l2b, endChars].flat(), hidden);
  gsap.set([ttChars, ttmChars].flat(), { opacity: 0, filter: "blur(8px)" });
  if (mobile) { gsap.set(lastMobile, { autoAlpha: 1 }); gsap.set(lmChars, hidden); }

  /* ---------- Circle of 8 rotating photos ---------- */
  const orbits = $$(".sh-orbit");
  const R = mobile ? 170 : 250, half = mobile ? 32 : 44.3;
  const base = orbits.map((_, i) => (i / orbits.length) * Math.PI * 2 - Math.PI / 2);
  orbits.forEach((el, i) => {
    el.style.marginLeft = `${Math.cos(base[i]) * R - half - (mobile ? 3 : 10.7)}px`;
    el.style.marginTop = `${Math.sin(base[i]) * R - half - (mobile ? 3 : 10.7)}px`;
  });
  const orbit = { angle: 0 };
  const spin = () => orbits.forEach((el, i) => {
    const a = base[i] + (orbit.angle * Math.PI) / 180;
    gsap.set(el, { x: Math.cos(a) * R - Math.cos(base[i]) * R, y: Math.sin(a) * R - Math.sin(base[i]) * R, force3D: true });
  });

  /* ---------- Scene color (--ui-color) ---------- */
  const ui = { value: SH.rgbOf("--site-phase-0") };
  const paintUI = () => document.documentElement.style.setProperty("--ui-color", ui.value);
  const syncX = () => (SH.fullX = gsap.getProperty(full, "xPercent"));

  gsap.set(lastImg, {
    position: "absolute", top: mobile ? "13%" : "12%", right: mobile ? "-11%" : "5%", left: "auto",
    width: mobile ? 118 : 201, height: mobile ? 118 : 201, transformOrigin: "top right",
  });
  gsap.set(lastText, { x: () => innerWidth });
  gsap.set(first, { autoAlpha: 0 });
  gsap.set(second, { autoAlpha: 1 });
  gsap.set([ft2, endBtn, privacy], { opacity: 0 });
  gsap.set(full, { x: 0, xPercent: 100 });
  gsap.set(inner, { x: 0, xPercent: -100 });
  gsap.set(card, { autoAlpha: 0 });
  gsap.set(orbits, { opacity: 0 });
  SH.fullX = 100;

  const build = () => {
    const io = "power1.inOut";
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pin, start: "top top", end: () => `+=${25 * innerWidth}`,
        scrub: reduced ? true : 1.5, pin: pin, pinSpacing: true, invalidateOnRefresh: true,
      },
    });
    tl.to(hero, { autoAlpha: 0, duration: 3, ease: io }, 0)
      .to(corners, { autoAlpha: 1, duration: 3, ease: "power2.inOut", stagger: 0.1 }, 0)
      .to(ph, { p1: 1, duration: 3, ease: io }, 0)
      .to(ui, { value: SH.rgbOf("--site-phase-1"), duration: 3, ease: io, onUpdate: paintUI }, 0)
      .set(first, { autoAlpha: 1 });

    // First sentence + card
    tl.to(fChars[0], { ...shown, duration: 2, ease: io, stagger: span(0.6) })
      .to(card, { autoAlpha: 1, duration: 8, ease: io }, "-=2.5")
      .to(logoSpan, { ...shown, duration: 2.5, ease: io }, "-=8")
      .to(fChars[1], { ...shown, duration: 5, ease: io, stagger: span(3.6) }, "-=8")
      .to(fChars[2], { ...shown, duration: 8, ease: io, stagger: span(10.8) }, "-=8")
      .to({}, { duration: 6 })
      .to(first, { autoAlpha: 0, filter: "blur(10px)", duration: 3, ease: io })
      .to(lw, { opacity: 1, duration: 2.5, ease: io });

    // Sentence with rotating photos
    tl.addLabel("orbitReveal", ">")
      .to(sChars, { ...shown, duration: 5, ease: io, stagger: span(4.8), delay: 1 }, "orbitReveal")
      .to(orbits, { opacity: 1, stagger: { each: 2, from: "end" }, ease: "power2.inOut", duration: 15.5 }, "orbitReveal")
      .to(ph, { p2: 1, duration: 20, ease: io }, "<-8")
      .to(ui, { value: SH.rgbOf("--site-phase-2"), duration: 20, ease: io, onUpdate: paintUI }, "<");

    // The gold curtain enters (curtain 100→0, inside -100→0, so the inner picture stays in place while only the window opens)
    tl.to([full, inner], { xPercent: 0, duration: 20, ease: io, delay: 1, onUpdate: syncX, onComplete: () => gsap.set(ft1, { opacity: 1 }) })
      .to(orbit, { angle: 2500, duration: 46, ease: "power2.inOut", onUpdate: spin }, "orbitReveal")
      .to(ft1Chars, { ...shown, duration: 6, ease: io, stagger: span(7.2) })
      .to({}, { duration: 1 })
      .to({}, { duration: 8 }, "-=1")
      .to(bgEnd, { duration: 20, opacity: 1, ease: io }, "-=1")
      .to(ft1Chars, { autoAlpha: 0, filter: "blur(10px)", duration: 8, ease: io }, "<")
      .to(ft2, { opacity: 1, filter: "blur(0px)", duration: 5, ease: io }, "<")
      .to(ft2Chars, { ...shown, duration: 3, delay: 5, ease: io, stagger: span(7.25) }, "<")
      .to(ui, { value: SH.rgbOf("--site-phase-3"), duration: 3, ease: io, onUpdate: paintUI }, "<")
      .to({}, { duration: 5 })
      .to(ft2Chars, { autoAlpha: 0, filter: "blur(10px)", duration: 8, ease: io }, "<");

    // The silhouette shrinks to a 216 square and becomes the center cell of the skills row
    const sq = mobile ? 0 : 216;
    tl.set(items, { color: SH.rgbOf("--kf-dim"), opacity: mobile ? 0 : 1 })
      .set(bgimg, { inset: 0, width: "100%", height: "100%", x: 0, y: 0, margin: "auto" })
      .to(bgimg, {
        width: sq, height: sq, duration: 15, ease: io,
        onUpdate() { const done = this.progress() > 0.99; bgimg.style.zIndex = done ? "0" : "3"; techno.style.zIndex = done ? "3" : "0"; },
        onComplete: () => gsap.set(tTitle, { opacity: 1 }),
      })
      .to(ttChars, { opacity: 1, filter: "blur(0px)", duration: 6, ease: io, stagger: span(8.1) })
      .to(ttmChars, { opacity: 1, filter: "blur(0px)", duration: 6, ease: io, stagger: span(8.1) }, "<")
      .to({}, { duration: 2 })
      .to(ttmChars, { opacity: 0, filter: "blur(8px)", duration: 6, ease: io }, "<+5");

    // The tech row flows and the last word stops at center
    tl.to(lists, {
      x: () => {
        const l = lists[0], its = $$("[data-i]", l), lastHalf = its[its.length - 1].offsetWidth / 2;
        const ml = mobile ? innerWidth * 0.85 : 48;
        return innerWidth / 2 - (ml + l.offsetWidth - lastHalf);
      },
      duration: 70, delay: mobile ? 10 : 0, ease: io,
      onUpdate() {
        const cx = innerWidth / 2;
        let best = 0, dist = Infinity;
        items.forEach((it) => { const b = it.getBoundingClientRect(), d = Math.abs(b.left + b.width / 2 - cx); if (d < dist) { dist = d; best = Number(it.dataset.i); } });
        setActive(best);
      },
      onComplete: () => gsap.set([lastFirst, lastSecond], { opacity: 1, visibility: "visible" }),
    })
      .to(fake, { x: 0, duration: 10, ease: io, delay: mobile ? -10 : 0 }, "<")
      .to(items, { opacity: 1, duration: 5, ease: io }, "<")
      .to(bgimg, { opacity: 1, width: mobile ? 170 : 216, height: mobile ? 170 : 216, duration: 0, delay: 10, ease: "none" }, "<")
      .to(ttChars, { opacity: 0, filter: "blur(10px)", duration: 10, ease: io }, "<");

    // A small photo at the top right fills the screen, and the text flows in from the right to 100px from the left
    tl.to(lastImg, { top: 0, right: 0, left: 0, width: "100vw", height: "100%", duration: 20, ease: io })
      .to(lastText, {
        left: () => (mobile ? "50%" : "auto"),
        x: () => (mobile ? 0 : 100 - lastText.getBoundingClientRect().left + gsap.getProperty(lastText, "x")),
        duration: 60, ease: io,
      }, "<")
      .to(lmChars, { ...shown, duration: 8, stagger: span(5.8), delay: mobile ? 20 : 0, ease: io }, "<")
      .to(l1a, { ...shown, duration: 10, ease: io, stagger: span(4.5), delay: 25 }, "<")
      .to(l1b, { ...shown, duration: 4, ease: io, stagger: span(3.9), delay: 10 }, "<")
      .to(ph, { p3: 1, duration: mobile ? 0 : 5, ease: mobile ? "none" : io }, "<")
      .to(ui, { value: SH.rgbOf("--site-phase-4"), duration: mobile ? 0 : 5, ease: mobile ? "none" : io, onUpdate: paintUI }, "<");
    if (!mobile) tl.to({}, { duration: 0.03 });
    tl.to(lmChars, { autoAlpha: 0, filter: "blur(10px)", duration: 8, ease: io, ...(mobile ? { delay: -5 } : {}) }, mobile ? "<-10" : "<")
      .to(l1a, { autoAlpha: 0, filter: "blur(10px)", duration: 6, ease: io, delay: -15 }, "<")
      .to(l1b, { autoAlpha: 0, filter: "blur(10px)", duration: 6, ease: io }, "<")
      .to(lastSecond, { opacity: 1, filter: "blur(0px)", duration: 7, ease: io, delay: mobile ? 0 : -15 }, "<")
      .to(l2a, { ...shown, duration: 20, ease: io, stagger: span(4.5), delay: 10, onComplete: () => gsap.set(endText, { opacity: 1, visibility: "visible" }) }, "<")
      .to(l2b, { ...shown, duration: 8, ease: io, stagger: span(2.7), delay: 14 }, "<")
      .to({}, { duration: 5 })
      .to(lastSecond, { opacity: 0, filter: "blur(10px)", duration: 6, ease: io })
      .set(second, { autoAlpha: 0 })
      .to({}, { duration: 2 });

    // The curtain slides out to the left as the track moves to the last door’s panel
    tl.to([full, inner], { xPercent: (i) => (i === 0 ? -100 : 100), duration: mobile ? 30 : 45, ease: io, onUpdate: syncX })
      .to(lastImg, { x: () => track.scrollWidth - innerWidth, duration: mobile ? 30 : 50, ease: "power4.inOut" }, "<")
      .to(track, { x: () => -(track.scrollWidth - innerWidth), duration: mobile ? 30 : 50, ease: "power4.inOut" }, "<")
      .to(lw, { opacity: 0, delay: 3, duration: 5, ease: io }, "<")
      .to(lw, { pointerEvents: "none", zIndex: -1, delay: 5, duration: 0 }, "<")
      .to(endChars, { ...shown, duration: 6, ease: io, stagger: span(14.7), delay: mobile ? 15 : 20 }, "<")
      .to(endBtn, { opacity: 1, filter: "blur(0px)", duration: 0.7, ease: io, delay: mobile ? 12 : 15 }, "<")
      .to(privacy, { opacity: 1, filter: "blur(0px)", duration: 0.3, ease: io });
    return tl;
  };

  // As in the original, the stage is set up right away regardless of the loader (only scrolling is locked during the loader)
  build();
  SH.ready.then(() => ScrollTrigger.refresh());
})();
