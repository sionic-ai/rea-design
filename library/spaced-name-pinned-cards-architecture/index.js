// Home motion: hero photo rotator (10s bar), work cards (the frame is cropped into the first card, cards pass and the center row changes, 1280px and up),
// Open the field list, flip through testimonials.
(() => {
  const { gsap, ScrollTrigger, reduce, EASE } = window.P;
  const mm = gsap.matchMedia();

  // News row: only below 768px, drag sideways to swipe with Embla
  const newsViewport = document.querySelector("[data-hnews-viewport]");
  const md = matchMedia("(min-width: 48rem)");
  let newsEmbla = null;
  const newsSetup = () => {
    newsEmbla?.destroy();
    newsEmbla = !md.matches && window.EmblaCarousel ? window.EmblaCarousel(newsViewport, { align: "start" }) : null;
  };
  newsSetup();
  md.addEventListener("change", newsSetup);

  // ---- Hero photo rotation ----
  // The white bar below fills in 10s, then the next section follows. The new section slides up from below (from above when going back) in 1.7s and the photo inside follows from -60%,
  // The outgoing section’s photo is pushed -20% · 1.035x and darkens by 80%. Copy lines exit at -110% (1.05s) and new lines rise from 110% (1.2s, lines .07s).
  const slides = [...document.querySelectorAll(".hero__slide")];
  const inners = slides.map((s) => s.firstElementChild);
  const shades = slides.map((s) => s.querySelector(".hero__slide-shade"));
  const texts = [...document.querySelectorAll("[data-hero-texts] p")];
  const thumbs = [...document.querySelectorAll("[data-hero-thumbs] button")];
  const timerBar = document.querySelector("[data-hero-timer]");
  const titles = texts.map((p) => window.SplitText.create(p, { type: "lines", mask: "lines", linesClass: "line" }).lines);
  const desk = matchMedia("(min-width: 1025px)");
  let index = 0, busy = false, run = null;
  titles.forEach((t, i) => i && gsap.set(t, { yPercent: 110 }));
  slides.forEach((s, i) => i && gsap.set(s, { yPercent: 100 }));
  gsap.set(timerBar, { xPercent: -100 });
  const dir = (a, b, n) => (b === (a + 1) % n ? 1 : b === (a - 1 + n) % n ? -1 : 1);
  const next = () => { const a = index; index = (a + 1) % slides.length; go(a, index); };
  const tick = () => {
    if (busy || reduce) return;
    run?.kill();
    run = gsap.timeline({ onComplete: next }).set(timerBar, { xPercent: -100 }).to(timerBar, { xPercent: 0, duration: 10, ease: "none" });
  };
  function go(from, to) {
    if (busy) return;
    run?.kill();
    gsap.killTweensOf(timerBar);
    busy = true;
    thumbs.forEach((b, i) => b.classList.toggle("is-on", i === to));
    const v = dir(from, to, slides.length);
    gsap.set(slides, { zIndex: 0 });
    gsap.set(slides[from], { zIndex: 1 });
    gsap.set(slides[to], { zIndex: 2 });
    gsap.set(shades[to], { opacity: 0 });
    run = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 }, onComplete: next, onInterrupt: () => (busy = false) })
      .fromTo(slides[to], { yPercent: 100 * v }, { yPercent: 0, ease: "gl.fastInOut", duration: 1.7 }, 0)
      .fromTo(inners[to], { yPercent: -60 * v, scale: 1 }, { yPercent: 0, ease: "gl.fastInOut", duration: 1.7 }, 0)
      .to(inners[from], { yPercent: -20 * v, scale: 1.035, ease: "gl.fastInOut", duration: 1.7 }, 0)
      .to(shades[from], { opacity: 0.8, duration: 0.45, ease: "power2.out" }, "<20%")
      .to(timerBar, { xPercent: 100, duration: 0.8, ease: "gl.fastInOut" }, 0)
      .to(titles[from], { yPercent: -110, stagger: 0.02, duration: 1.05, ease: "gl.quicky" }, 0.1)
      .fromTo(titles[to], { yPercent: 110 }, { yPercent: 0, stagger: desk.matches ? 0.07 : 0.04 }, "<45%")
      .set(timerBar, { xPercent: -100 }, "<+=0.5")
      .to(timerBar, { xPercent: 0, duration: 10, ease: "none" }, "<")
      .call(() => (busy = false), [], 0.85);
  }
  const pick = (i) => { if (busy || i === index) return; const a = index; index = i; go(a, i); };
  thumbs.forEach((b, i) => b.addEventListener("click", () => pick(i)));
  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") pick((index + 1) % slides.length);
    else if (e.key === "ArrowLeft") pick((index - 1 + slides.length) % slides.length);
  });
  // On first open: thumbnails rise from 200% below (2s gl.fastInOut, .02s apart), name words drop from above (.05s apart), the first copy line comes up from below, and the button appears
  const cta = document.querySelector(".hero__cta");
  if (!reduce) {
    gsap.set(".title-el", { yPercent: -100 });
    gsap.set(thumbs, { yPercent: 200 });
    gsap.set(titles[0], { yPercent: 110 });
    gsap.set(cta, { autoAlpha: 0 });
  }
  const appear = () => {
    if (reduce) return;
    gsap.timeline({ defaults: { duration: 1, ease: "expo.out" } })
      .to(thumbs, { yPercent: 0, stagger: matchMedia("(min-width: 768px)").matches ? 0.03 : 0.02, ease: "gl.fastInOut", duration: 2 }, 0.3)
      .to(".title-el", { yPercent: 0, stagger: 0.05 }, 0.5)
      .to(titles[0], { yPercent: 0, stagger: desk.matches ? 0.07 : 0.04 }, 0.7)
      .to(cta, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, "<");
  };
  // After fully descending, raise the bar, and pause when off-screen
  window.P.entered(() => new IntersectionObserver(([e]) => (e.isIntersecting ? (run ? run.resume() : tick()) : run?.pause())).observe(document.querySelector("[data-hero]")));

  // Video view (original VideoModal): from the thumbnail spot the video panel grows into a centered box in 1s gl.fastInOut and a dark ink scrim covers in .12s.
  // On close it returns to the thumbnail spot in .8s gl.fastInOut while the curtain lifts in .4s. The button row turns on after the growth, in .6s expo.out
  const modal = document.querySelector("[data-video-modal]");
  const thumb = document.querySelector("[data-video-open]");
  const vShade = modal.querySelector("[data-vshade]"), vBox = modal.querySelector("[data-vtarget]");
  const vVideo = modal.querySelector("[data-vvideo]"), vPlayer = modal.querySelector("[data-vplayer]");
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; };
  let vOpen = false;
  // Placeholder video: 60-second clock. The progress bar follows with .5s expo.out (original quickTo), and pressing the bar jumps to that spot
  const DURATION = 60, vTime = modal.querySelector("[data-vtime]"), vLine = modal.querySelector("[data-vline]");
  const toBar = gsap.quickTo(modal.querySelector("[data-vprogress]"), "scaleX", { duration: 0.5, ease: "expo.out" });
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  let vAt = 0, vPlaying = false, vMuted = false;
  const flip = (btn, on) => { btn.querySelector("[data-on]").hidden = !on; btn.querySelector("[data-off]").hidden = on; };
  const vPlayBtn = modal.querySelector("[data-vplay]"), vSoundBtn = modal.querySelector("[data-vsound]");
  const setPlay = (on) => { vPlaying = on; flip(vPlayBtn, !on); };
  gsap.ticker.add((t, dt) => {
    if (!vPlaying) return;
    vAt += dt / 1000;
    if (vAt >= DURATION) { vAt = DURATION; setPlay(false); }
    toBar(vAt / DURATION);
    vTime.textContent = fmt(vAt);
  });
  vPlayBtn.addEventListener("click", () => setPlay(!vPlaying));
  vSoundBtn.addEventListener("click", () => { vMuted = !vMuted; flip(vSoundBtn, !vMuted); });
  modal.querySelector("[data-vfull]").addEventListener("click", () => (document.fullscreenElement ? document.exitFullscreen() : vVideo.requestFullscreen?.()));
  vLine.addEventListener("click", (e) => { const r = vLine.getBoundingClientRect(); vAt = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * DURATION; toBar(vAt / DURATION); vTime.textContent = fmt(vAt); });
  const setVideo = (v) => {
    if (v === vOpen) return;
    vOpen = v;
    const d = reduce ? 0 : 1;
    modal.setAttribute("aria-hidden", String(!v));
    if (window.P.lenis) v ? window.P.lenis.stop() : window.P.lenis.start();
    gsap.killTweensOf([vVideo, vShade, vPlayer]);
    if (v) {
      gsap.set(modal, { visibility: "visible" });
      gsap.set(vVideo, rectOf(thumb));
      gsap.set(thumb, { opacity: 0 });
      gsap.to(vShade, { opacity: 1, duration: 0.12 * d, ease: "none" });
      gsap.to(vVideo, { ...rectOf(vBox), duration: 1 * d, ease: "gl.fastInOut" });
      gsap.to(vPlayer, { opacity: 1, duration: 0.6 * d, ease: "expo.out", delay: 0.8 * d });
      vAt = 0;
      setPlay(true);
    } else {
      setPlay(false);
      gsap.to(vPlayer, { opacity: 0, duration: 0.2 * d });
      gsap.to(vShade, { opacity: 0, duration: 0.4 * d, ease: "power2.out" });
      gsap.to(vVideo, { ...rectOf(thumb), duration: 0.8 * d, ease: "gl.fastInOut", onComplete: () => { gsap.set(modal, { visibility: "hidden" }); gsap.set(thumb, { clearProps: "opacity" }); } });
    }
  };
  addEventListener("resize", () => vOpen && gsap.set(vVideo, rectOf(vBox)));
  thumb.addEventListener("click", () => setVideo(true));
  modal.querySelector("[data-video-close]").addEventListener("click", () => setVideo(false));
  addEventListener("keydown", (e) => e.key === "Escape" && setVideo(false));

  window.P.appear(appear);
  window.P.ready(() => {
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 48rem)", xl: "(min-width: 80rem)" }, (ctx) => {
      if (!ctx.conditions.motion) return;
      // While the hero slides up, the text panel moves down 25% and darkens 30% (not on touch devices)
      if (matchMedia("(hover: hover)").matches) gsap.timeline({ scrollTrigger: { trigger: "[data-hero]", start: "bottom bottom", end: "bottom top", scrub: true } })
        .to("[data-hero-content]", { yPercent: 25, duration: 1, ease: "none" })
        .to(".hero__content-shade", { opacity: 0.3, duration: 1, ease: "none" }, 0);

      // Work cards (original FeaturedProjects, 1280px and up) — measured in screen height vh units
      if (ctx.conditions.xl) {
        const fp = document.querySelector("[data-fp]");
        const frame = fp.querySelector("[data-frame]");
        const fMedia = frame.querySelector("[data-frame-media]"), fInner = fMedia.firstElementChild, fPar = fp.querySelector("[data-frame-par]");
        const fShade = frame.querySelector(".frame__shade"), fLine = fp.querySelector("[data-fp-line]");
        const fWords = window.SplitText.create(frame.querySelector("[data-frame-words]"), { type: "lines,words", mask: "lines", linesClass: "line" });
        const cards = gsap.utils.toArray("[data-fp-card]", fp);
        const firstImg = cards[0].querySelector(".fp__img");
        const infos = gsap.utils.toArray("[data-fp-info]", fp).map((el) => ({ el, title: el.querySelector("[data-fp-title]"), tag: el.querySelector("[data-fp-tag]"), city: el.querySelector("[data-fp-city]") }));
        const vh = () => innerHeight;
        // Measure the crop margin and inner scale from the frame plate and first card photo sizes (sizes only, so the result is the same at any scroll position)
        const fit = () => {
          const f = fMedia.getBoundingClientRect(), v = firstImg.getBoundingClientRect();
          const b = Math.max(0, (f.width - v.width) / 2), l = Math.max(0, (f.height - v.height) / 2);
          return { clip: `inset(${Math.round(l)}px ${Math.round(b)}px)`, scale: Math.max(v.width / f.width, v.height / f.height) };
        };
        gsap.set(fWords.lines, { yPercent: 110 });
        infos.forEach(({ el, title, tag, city }) => { gsap.set([title, city], { autoAlpha: 0, yPercent: 0 }); window.P.tagPrep(tag); gsap.set(el, { visibility: "visible" }); });

        // From when the panel top touches the screen top for one screen (scrub .3): the edge is clipped to the first card size and the photo inside shrinks to fit the card,
        // Words fade out in shuffled order within .2s, the shade lifts, and the center line stretches out
        gsap.timeline({ defaults: { ease: "power1.out" }, scrollTrigger: { trigger: fp, start: "top top", end: () => `top+=${vh()}px top`, scrub: 0.3, invalidateOnRefresh: true,
          onLeave: () => gsap.set(cards[0].querySelector(".fp__link"), { pointerEvents: "auto" }),
          onEnterBack: () => gsap.set(cards[0].querySelector(".fp__link"), { pointerEvents: "none" }) } })
          .fromTo(fMedia, { clipPath: "inset(0px 0px)" }, { clipPath: () => fit().clip, duration: 1 })
          .fromTo(fInner, { scale: 1 }, { scale: () => fit().scale, duration: 1 }, "<")
          .fromTo(fShade, { opacity: 1 }, { opacity: 0, duration: 0.7 }, 0.3)
          .to(fWords.words, { autoAlpha: 0, ease: "power1.out", duration: 0.02, stagger: { amount: 0.2, from: "random" } }, 0.1)
          .fromTo(fLine, { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 0.15);
        // The intro panel fades out while sliding down 80% as the work panel rises and covers it (from .3 to .6), and shrinks to .98x
        const about = document.querySelector("[data-about]");
        gsap.timeline({ scrollTrigger: { trigger: about, endTrigger: fp, start: "top top", end: "top top", scrub: true,
          onEnter: () => gsap.set(about, { pointerEvents: "none" }), onLeaveBack: () => gsap.set(about, { clearProps: "pointerEvents" }) } })
          .to(about, { yPercent: 80, duration: 1 })
          .to(about, { autoAlpha: 0, duration: 0.6 }, 0.3)
          .to(about, { scale: 0.98, duration: 0.35 }, "<");
        // The center line fills black from one screen after the panel starts to the panel end
        gsap.fromTo(fp.querySelector("[data-fp-progress]"), { scaleX: 0 }, { scaleX: 1, scrollTrigger: { trigger: fp, start: () => `top+=${vh()}px top`, end: "bottom bottom", scrub: 0.3, invalidateOnRefresh: true } });
        // On entry: while the panel passes from 90% → 10% of the screen, the photo relaxes from 1.1x and the 2rem margin opens, shade lays down and the word lines rise
        const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
        gsap.timeline({ scrollTrigger: { trigger: fp, start: "top 90%", end: "top 10%", scrub: 0.3, invalidateOnRefresh: true } })
          .fromTo(fInner, { scale: 1.1 }, { scale: 1, duration: 1 })
          .fromTo(fMedia, { clipPath: () => `inset(${rem() * 2}px)` }, { clipPath: "inset(0px)", duration: 1 }, 0)
          .fromTo(fShade, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
          .to(fWords.lines, { yPercent: 0, stagger: { amount: 0.2 }, duration: 0.5, ease: "power2.out" }, 0.5);
        // While the plate rises from below, the photo goes from -10% and the word from -200% into place
        gsap.timeline({ scrollTrigger: { trigger: fp, start: "top bottom", end: "top top", scrub: true } })
          .fromTo(fInner, { yPercent: -10 }, { yPercent: 0 })
          .fromTo("[data-frame-words]", { yPercent: -200 }, { yPercent: 0 }, 0);
        // Frame photo parallax: enlarge the inner image by (vh/4 × min(width,1440)/1440), and while the fixed panel’s end travels from screen bottom → top it moves down half of that
        const pv = () => (vh() / 4) * (Math.min(innerWidth, 1440) / 1440);
        const sizePar = () => gsap.set(fPar, { height: `calc(100% + ${pv()}px)`, marginTop: -pv() / 2 });
        sizePar();
        ScrollTrigger.create({ trigger: frame, start: "bottom bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true, onRefresh: sizePar, animation: gsap.to(fPar, { y: () => pv() / 2, ease: "none", paused: true }) });

        // Swapping the center line: the outgoing name · city fades out over .15s after .1s while moving to −30% (.6s gl.quicky), the category chips switch off,
        // Incoming ones rise from 110% below after .1s with 1s expo.out and the category chips expand again
        let on = -1;
        const swap = (from, to) => {
          on = to;
          infos.forEach((x, k) => x.el.classList.toggle("is-on", k === to));
          const tl = gsap.timeline();
          if (from >= 0) {
            const o = infos[from];
            gsap.killTweensOf([o.title, o.city], "autoAlpha");
            tl.to([o.title, o.city], { autoAlpha: 0, duration: 0.15, ease: "power2.out" }, 0.1)
              .to([o.title, o.city], { yPercent: -30, duration: 0.6, ease: "gl.quicky" }, 0)
              .add(() => window.P.tagHide(o.tag), 0);
          }
          if (to >= 0) {
            const n = infos[to];
            gsap.killTweensOf([n.title, n.city], "autoAlpha");
            tl.fromTo([n.title, n.city], { yPercent: 110 }, { yPercent: 0, ease: "expo.out", duration: 1 }, 0.1)
              .set([n.title, n.city], { autoAlpha: 1 }, 0.1)
              .add(() => window.P.tagShow(n.tag), 0.1);
          }
          return tl;
        };
        ScrollTrigger.create({ trigger: fp, start: () => `top+=${vh() * 0.6}px top`, onEnter: () => swap(-1, 0), onLeaveBack: () => swap(0, -1) });
        cards.forEach((card, k) => k && ScrollTrigger.create({ trigger: card, start: "top center", onEnter: () => swap(k - 1, k), onLeaveBack: () => swap(k, k - 1) }));
        // Plate end: when the bottom is at 85% of the screen → while going up, the card plate and center line follow half a screen late, a background-color curtain covers, and the ”All Work” button slides down and away
        gsap.timeline({ scrollTrigger: { trigger: fp, start: "bottom 85%", end: "bottom top", scrub: true, invalidateOnRefresh: true } })
          .to([fp.querySelector("[data-fp-inner]"), fp.querySelector("[data-fp-sticky]")], { y: () => vh() * 0.5, duration: 1 })
          .to("[data-fp-overlay]", { autoAlpha: 1, duration: 0.45 }, 0.15)
          .to("[data-fp-more]", { yPercent: 300, duration: 0.4 }, 0.3);
      }
    });

    // Field list: when a row’s top edge passes the screen center (90% on phone), that row lights up, and going back returns to the previous row. A hovered row takes priority
    const items = [...document.querySelectorAll("[data-expertise-list] li")];
    const media = [...document.querySelectorAll(".expertise__media .wf-img")];
    let scrolled = 0, hovered = null;
    const paint = () => {
      const i = hovered ?? scrolled;
      items.forEach((li, k) => li.classList.toggle("is-on", k === i));
      media.forEach((m, k) => m.classList.toggle("is-on", k === i));
    };
    paint();
    const tablet = matchMedia("(min-width: 768px)").matches;
    items.forEach((li, i) => {
      ScrollTrigger.create({ trigger: li, start: tablet ? "top center" : "top 90%", onEnter: () => { scrolled = i; paint(); }, onLeaveBack: () => { scrolled = Math.max(0, i - 1); paint(); } });
      li.addEventListener("mouseenter", () => { hovered = i; paint(); });
      li.addEventListener("mouseleave", () => { hovered = null; paint(); });
    });

    // Testimonials: when the black bar fills in 10s it moves to the next section (after the last, back to the first). The number text leaves at −50% · .5× (.8s gl.quicky) and the new number rises in at 70%,
    // Text lines · name · company exit at -110% (1.05s gl.quicky) and the new ones rise from 110% (1.2s expo.out, lines .07s). The bar stops when off screen
    const qSection = document.querySelector("[data-quotes]");
    const qTimer = qSection.querySelector("[data-quote-timer]");
    const prevBtn = qSection.querySelector("[data-quote-prev]"), nextBtn = qSection.querySelector("[data-quote-next]");
    const authors = [...qSection.querySelectorAll("[data-quote-author]")], companies = [...qSection.querySelectorAll("[data-quote-company]")];
    const Q = [...qSection.querySelectorAll("[data-quote-text]")].map((el, k) => ({
      lines: window.SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" }).lines,
      author: authors[k], company: companies[k],
      chars: window.SplitText.create(qSection.querySelectorAll("[data-quote-no]")[k], { type: "chars", mask: "chars" }).chars,
    }));
    const qDesk = matchMedia("(min-width: 1025px)");
    let qi = 0, qBusy = false, qRun = null;
    Q.forEach((it, k) => { if (k) { gsap.set([...it.lines, it.author, it.company], { yPercent: 110 }); gsap.set(it.chars, { yPercent: 100, autoAlpha: 0 }); } });
    gsap.set(qTimer, { xPercent: -100 });
    const qButtons = () => { prevBtn.disabled = qi === 0; nextBtn.disabled = qi === Q.length - 1; };
    const qAuto = () => { if (qi < Q.length - 1) qNext(); else { const a = qi; qi = 0; qGo(a, 0); } };
    const qStart = () => {
      if (reduce) return;
      qRun?.kill();
      qRun = gsap.timeline({ onComplete: qAuto }).set(qTimer, { xPercent: -100 }).to(qTimer, { xPercent: 0, duration: 10, ease: "none" });
    };
    function qGo(from, to) {
      qBusy = true;
      qButtons();
      const a = Q[from], b = Q[to];
      qRun?.kill();
      gsap.killTweensOf(qTimer);
      qRun = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 }, onComplete: qAuto })
        .to(qTimer, { xPercent: 100, duration: 0.8, ease: "gl.fastInOut" }, 0)
        .to(a.chars, { yPercent: -50, scale: 0.5, duration: 0.8, ease: "gl.quicky" }, 0.2)
        .addLabel("index", "<")
        .to(a.chars, { autoAlpha: 0, ease: "power2.out", duration: 0.35 }, "<")
        .fromTo(b.chars, { yPercent: 70, scale: 1 }, { yPercent: 0, stagger: 0.04 }, "index+=0.2")
        .fromTo(b.chars, { autoAlpha: 0 }, { autoAlpha: 1, ease: "power2.out", duration: 0.15 }, "<")
        .to(a.lines, { yPercent: -110, stagger: 0.02, duration: 1.05, ease: "gl.quicky" }, 0)
        .fromTo(b.lines, { yPercent: 110 }, { yPercent: 0, stagger: qDesk.matches ? 0.07 : 0.04 }, "<40%")
        .to(a.author, { yPercent: -110, duration: 1.05, ease: "gl.quicky" }, 0.1)
        .fromTo(b.author, { yPercent: 110 }, { yPercent: 0 }, "<40%")
        .to(a.company, { yPercent: -110, duration: 1.05, ease: "gl.quicky" }, 0.2)
        .fromTo(b.company, { yPercent: 110 }, { yPercent: 0 }, "<40%")
        .set(qTimer, { xPercent: -100 }, "<+=0.5")
        .to(qTimer, { xPercent: 0, duration: 10, ease: "none" }, "<")
        .call(() => (qBusy = false), [], "<");
      // Reduced motion: jump straight to the end state — remove the end notification and skip so the next section doesn’t carry on from a full bar
      if (reduce) { qRun.eventCallback("onComplete", null).progress(1).kill(); qRun = null; }
    }
    function qNext() { if (qBusy) return; const a = qi; qi = (a + 1) % Q.length; qGo(a, qi); }
    prevBtn.addEventListener("click", () => { if (qBusy) return; const a = qi; qi = (a - 1 + Q.length) % Q.length; qGo(a, qi); });
    nextBtn.addEventListener("click", qNext);
    new IntersectionObserver(([e]) => (e.isIntersecting ? (qRun ? qRun.resume() : qStart()) : qRun?.pause())).observe(qSection);
  });
})();
