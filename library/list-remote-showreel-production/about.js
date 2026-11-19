// About: pin a single stage (desktop +29600px, scrub .45) and pass in order through hero → white half-and-half cells horizontal flow → gray panel → team panel → footer
(() => {
  const { reduced } = PP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $("[data-about-stage]");
  const hero = $(".about-hero"), heroText = $(".about-hero__text"), heroBottom = $(".about-hero__bottom");
  const heroLines = $$(".about-hero__line"), backdrop = $(".about-hero__backdrop");
  const info = $(".about-info"), track = $("[data-info-track]");
  const blocks = $$("[data-block]");
  const grey = $(".about-grey"), greyTop = $(".about-grey__top"), greyNote = $(".about-grey__note"), greyList = $$(".about-grey__list li");
  const proof = $(".about-grey__proof"), greyBottom = $$(".about-grey__bottom .pp-wipe-line");
  const team = $(".about-team"), teamLines = $$(".about-team__heading .pp-wipe-line"), cards = $$(".about-team__card");
  const footer = $(".about-stage > .footer"), logo = $(".pp-logo");
  const smoothOut = CustomEase.create("abSmoothOut", "0.22, 1, 0.36, 1");
  const smoothInOut = CustomEase.create("abSmoothInOut", "0.76, 0, 0.24, 1");
  const fill = CustomEase.create("abFill", "0.85, 0, 0.15, 1");
  const reveal = CustomEase.create("abReveal", "0.19, 1, 0.22, 1");
  const H = () => innerHeight, W = () => innerWidth;
  const mobile = matchMedia("(max-width: 991px)").matches;
  const half = mobile ? 1 : 0.5;

  const wipe = (tl, lines, at, dFill = .5, dReveal = .5, stagger = .12) => {
    const ms = lines.map((l) => $(".pp-wipe-mask", l)), cs = lines.map((l) => $(".c", l));
    tl.to(ms, { scaleX: 1, transformOrigin: "right center", duration: dFill, stagger, ease: fill }, at)
      .set(cs, { visibility: "visible" }, at + dFill)
      .to(ms, { scaleX: 0, transformOrigin: "left center", duration: dReveal, stagger, ease: reveal }, at + dFill);
  };
  // Cell text lines: a small black square is drawn first, then the line is clipped in from the right (x 28, y 16 → 0)
  const blockIn = (tl, block, at) => {
    const sq = $$(".sq", block), lines = $$("p, h2, .about-info__group, .about-info__logo", block);
    tl.to(sq, { scaleX: 1, duration: .5, ease: "power1.out" }, at)
      .to(lines, { x: 0, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: .8, stagger: .04, ease: "power3.out" }, at);
  };

  const build = () => {
    gsap.set(heroText, { xPercent: -50, yPercent: -50 });
    gsap.set(heroLines, { yPercent: 120 });
    gsap.set($$(".sq"), { scaleX: 0 });
    gsap.set($$(".about-info p, .about-info h2, .about-info__group, .about-info__logo"), { x: 28, y: 16, clipPath: "inset(0% 0% 0% 100%)" });
    gsap.set([$(".about-info__block.is-media .about-info__media"), $(".about-info__media.is-surf")], { clipPath: "inset(0% 0% 0% 100%)" });
    gsap.set($$(".about-info__logo"), { rotation: -8 });
    gsap.set(grey, { autoAlpha: 0 });
    gsap.set([greyTop, greyNote], { y: () => H() });
    gsap.set(greyList, { y: () => H() * .5, autoAlpha: 0 });
    gsap.set(proof, { y: () => H() });
    gsap.set(team, { autoAlpha: 0, clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set($(".about-team__label"), { y: 40, autoAlpha: 0 });
    gsap.set(cards, { yPercent: 0, top: "100%" });
    gsap.set(footer, { yPercent: 100, autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: stage, start: "top top", end: () => `+=${mobile ? Math.round(H() * 22) : 29600}`, scrub: mobile ? .5 : .45, pin: true, invalidateOnRefresh: true },
    });
    // Hero: the summary slides up and out (.82 screen), and the title line and white backdrop rise over 1.1s → the title is pushed up and eaten from the bottom
    tl.to(heroText, { y: () => -H() * .82, duration: .8, ease: "none" }, .04)
      .to(heroLines, { yPercent: 0, duration: 1.1, stagger: .08, ease: "power3.out" }, .12)
      .to(backdrop, { scaleY: 1, duration: 1.1, ease: "power3.out" }, .12)
      .to(heroBottom, { y: () => -H() * .6, duration: 1.4, ease: "power2.inOut" }, 1.6)
      .to(hero, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.4, ease: "power2.inOut" }, 1.8);
    // White split panel: a portrait video opens on the right, then founding statement → half-panel move (1.6) → belief and logo → one-and-a-half-panel move → value list and surfing video
    tl.to(blocks[0].firstElementChild, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power1.inOut" }, 2.2);
    blockIn(tl, blocks[1], 2.6);
    tl.to(track, { x: () => -W() * half, duration: 1.6, ease: "power1.inOut" }, 4);
    blockIn(tl, blocks[2], 4.8);
    tl.to($$(".about-info__logo"), { rotation: 0, duration: .72, stagger: { each: .06, from: "center" }, ease: smoothOut }, 5.2)
      .to(track, { x: () => -W() * half * (mobile ? 3 : 3), duration: 2, ease: "power1.inOut" }, 6.6);
    blockIn(tl, blocks[3], 7.4);
    tl.to($(".about-info__media.is-surf"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power1.inOut" }, 7.8);
    blockIn(tl, blocks[4], 8.4);
    // The surfing cell widens to full screen and exits upward, laying down a gray panel
    tl.to(blocks[4], { flexBasis: "100vw", width: "100vw", duration: 1.1, ease: smoothInOut }, 9.8)
      .to(track, { x: () => -(blocks[4].offsetLeft), duration: 1.1, ease: smoothInOut }, 9.8)
      .to($(".about-info__b5"), { y: () => -H() * 1.2, duration: 1.1, ease: smoothInOut }, 10)
      .to(grey, { autoAlpha: 1, duration: .55, ease: "none" }, 10.35)
      .to(greyTop, { y: 0, duration: 1, ease: smoothOut }, 10.6)
      .to(greyNote, { y: 0, duration: 1, ease: smoothOut }, 10.75)
      .to(greyList, { y: 0, autoAlpha: 1, duration: 1, stagger: .08, ease: smoothOut }, 10.9)
      .to([greyTop, greyNote, ...greyList], { y: () => -H(), duration: 1.2, stagger: .04, ease: "power2.in" }, 13)
      .to(proof, { y: 0, duration: 1.3, ease: smoothOut }, 13.6);
    wipe(tl, greyBottom, 15, .55, .45, .1);
    // Team panel: opens bottom to top (1.2) with a mint stair wipe, vertical cards rise one by one from below to the center, stack up, then leave together
    tl.set(team, { autoAlpha: 1 }, 17)
      .to(team, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "none" }, 17)
      .to($(".about-team__label"), { y: 0, autoAlpha: 1, duration: .7, ease: "power3.out" }, 17.8);
    wipe(tl, teamLines, 18, .55, .45, .1);
    cards.forEach((c, i) => tl.to(c, { top: "50%", yPercent: -50 + i * 6, rotation: (i % 2 ? 2 : -2), duration: 1.1, ease: "power3.out" }, 18.8 + i * 1.1));
    tl.to(cards, { top: "0%", yPercent: -110, duration: 1.1, stagger: .08, ease: "power3.in" }, 23.6);
    // Footer
    tl.set(footer, { autoAlpha: 1 }, 25)
      .to(footer, { yPercent: 0, duration: 1.4, ease: "power2.out" }, 25)
      .from($$(".footer__heading .pp-line > span", footer), { yPercent: 110, duration: .68, stagger: .055, ease: "power2.out" }, 25.6)
      .from($(".footer__hi", footer), { clipPath: "inset(0 100% 0 0)", duration: .68, ease: "power2.out" }, 25.6)
      .from($(".footer__video", footer), { scale: 1.6, yPercent: -40, duration: 1.4, ease: "none" }, 25)
      .to(logo, { autoAlpha: 0, duration: .15, ease: "power2.out" }, 25.9)
      .to({}, { duration: .85 }, 26.4);
    return tl;
  };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
    if (conditions.still) {
      // When shrunk, the panels are stacked vertically
      stage.style.display = "block"; stage.style.height = "auto";
      $$(".about-stage > section, .about-stage > .footer").forEach((s) => (s.style.height = "auto"));
      $$(".pp-wipe-line .c").forEach((c) => (c.style.visibility = "visible"));
      return;
    }
    build();
  });

  // Testimonial cards: Prev·Next slide one card (width+10px) at a time over .65s
  const cardsTrack = $("[data-cards]"), proofCards = $$(".about-grey__card");
  let ci = 0;
  const moveCards = (d) => {
    ci = Math.max(0, Math.min(proofCards.length - 1, ci + d));
    gsap.to(cardsTrack, { x: -(proofCards[0].offsetWidth + 10) * ci, duration: reduced ? 0 : .65, ease: "power3.out" });
    $$("[data-card]").forEach((b) => (b.disabled = (b.dataset.card === "-1" && ci === 0) || (b.dataset.card === "1" && ci === proofCards.length - 1)));
  };
  $$("[data-card]").forEach((b) => b.addEventListener("click", () => moveCards(Number(b.dataset.card))));
  moveCards(0);

  // Team enlarge: the box grows from the pressed card’s spot to screen center in .86s, then the square, close button and text rise in order
  const vb = $(".about-viewbox"), dock = $(".about-viewbox__dock"), vbBack = $(".about-viewbox__backdrop");
  const details = $$(".about-viewbox__details > *"), close = $(".about-viewbox__close");
  let source = null;
  const bounds = (r) => ({ left: r.left, top: r.top, width: r.width, height: r.height });
  const target = () => { const h = H() * .78, w = h / 1.7; return { left: W() * .5 - w * .5 - (mobile ? 0 : W() * .1), top: (H() - h) / 2, width: w, height: h }; };
  cards.forEach((c) => c.addEventListener("click", () => {
    source = c;
    dock.style.setProperty("--h", getComputedStyle(c).getPropertyValue("--h"));
    dock.dataset.label = c.dataset.label;
    vb.classList.add("is-open");
    vb.setAttribute("aria-hidden", "false");
    PP.lenis?.stop();
    gsap.set(dock, bounds(c.getBoundingClientRect()));
    gsap.set(details, { autoAlpha: 0, y: 12 });
    gsap.set(close, { autoAlpha: 0, y: 12 });
    gsap.timeline()
      .to(vbBack, { autoAlpha: 1, duration: .42, ease: "power2.out" }, 0)
      .to(dock, { ...target(), duration: .86, ease: "power3.inOut" }, 0)
      .to(close, { autoAlpha: 1, y: 0, duration: .38, ease: "power2.out" }, .52)
      .to(details, { autoAlpha: 1, y: 0, duration: .38, stagger: .06, ease: "power2.out" }, .62);
  }));
  const shut = () => {
    if (!source) return;
    gsap.timeline({ onComplete: () => { vb.classList.remove("is-open"); vb.setAttribute("aria-hidden", "true"); PP.lenis?.start(); source = null; } })
      .to([...details, close], { autoAlpha: 0, y: 12, duration: .2, ease: "power2.in" }, 0)
      .to(dock, { ...bounds(source.getBoundingClientRect()), duration: .68, ease: "power3.inOut" }, 0)
      .to(vbBack, { autoAlpha: 0, duration: .38, ease: "power2.inOut" }, .3);
  };
  close.addEventListener("click", shut);
  vbBack.addEventListener("click", shut);
  addEventListener("keydown", (e) => e.key === "Escape" && shut());

  // Hero grab magnifier (original values): pressing opens the cursor frame (28px) over .4s power2.out to a 280×180 window (press 1.08x bounce) and passes to a white frame,
  // The window follows the cursor with x .46s·y .56s power3.out and stays confined inside the panel. Inside is a black-and-white panel of the video redrawn coarsely in 4px cells + pink halftone dots,
  // The group of squares at the center sways -22°→8°→0° and settles. On release it folds in .4s power3.inOut and returns to the cursor
  const initHoldLens = () => {
    const cursor = PP.cursor;
    if (!PP.fine || reduced || !cursor || matchMedia("(max-width: 767px)").matches) return;
    const lens = $(".about-lens"), video = $(".about-hero__video .pp-video");
    const layer = $(".about-lens__filter"), inner = $(".about-lens__cursor"), canvas = $(".about-lens__canvas");
    if (!lens || !video) return;
    hero.classList.add("has-lens");
    hero.dataset.cursorText = "Click & Hold";
    const LW = 280, LH = 180, CELL = 4, REST = 28;
    const ctx = canvas.getContext("2d");
    const tiny = Object.assign(document.createElement("canvas"), { width: LW / CELL | 0, height: LH / CELL | 0 });
    const tinyCtx = tiny.getContext("2d");
    const dpr = Math.min(2, Math.max(1, devicePixelRatio || 1));
    canvas.width = LW * dpr; canvas.height = LH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const frame = document.createElement("div");
    frame.className = "about-lens-frame";
    frame.setAttribute("aria-hidden", "true");
    frame.innerHTML = '<i class="k"></i><i class="k"></i><i class="k"></i><i class="k"></i><i class="e"></i><i class="e"></i><i class="e"></i><i class="e"></i>';
    document.body.append(frame);
    const fk = $$(".k", frame), fe = $$(".e", frame);
    const ck = $$(".pp-cursor__corner", cursor.el), cl = $$(".pp-cursor__line", cursor.el);

    const st = { id: null, morph: 0, press: 1, px: 0, py: 0, tx: 0, ty: 0, morphing: false, raf: 0, tl: null };
    gsap.set(lens, { xPercent: -50, yPercent: -50, x: hero.offsetWidth / 2, y: hero.offsetHeight / 2, scale: 0 });
    gsap.set(inner, { opacity: 0, scale: .65, rotation: -22 });
    const xTo = gsap.quickTo(lens, "x", { duration: .46, ease: "power3.out" });
    const yTo = gsap.quickTo(lens, "y", { duration: .56, ease: "power3.out" });
    const aimAt = (cx, cy) => {
      const b = hero.getBoundingClientRect();
      st.tx = b.width <= LW ? b.width / 2 : gsap.utils.clamp(LW / 2, b.width - LW / 2, cx - b.left);
      st.ty = b.height <= LH ? b.height / 2 : gsap.utils.clamp(LH / 2, b.height - LH / 2, cy - b.top);
    };

    // Move the window’s center spot on the video box to the video’s original pixels, take a window-sized area, shrink it to a 70×45 grid, then enlarge it grid-for-grid
    const paint = () => {
      if (video.readyState < 2 || !video.videoWidth) return;
      const hb = hero.getBoundingClientRect(), vb = video.getBoundingClientRect();
      const nx = gsap.utils.clamp(0, 1, (hb.left + +gsap.getProperty(lens, "x") - vb.left) / Math.max(1, vb.width));
      const ny = gsap.utils.clamp(0, 1, (hb.top + +gsap.getProperty(lens, "y") - vb.top) / Math.max(1, vb.height));
      const sw = Math.max(1, LW / Math.max(1, vb.width) * video.videoWidth), sh = Math.max(1, LH / Math.max(1, vb.height) * video.videoHeight);
      const sx = gsap.utils.clamp(0, video.videoWidth - sw, nx * video.videoWidth - sw / 2);
      const sy = gsap.utils.clamp(0, video.videoHeight - sh, ny * video.videoHeight - sh / 2);
      tinyCtx.drawImage(video, sx, sy, sw, sh, 0, 0, tiny.width, tiny.height);
      ctx.clearRect(0, 0, LW, LH);
      ctx.filter = "grayscale(1) contrast(1.65)";
      ctx.drawImage(tiny, 0, 0, tiny.width, tiny.height, 0, 0, LW, LH);
      ctx.filter = "none";
    };

    // Cursor frame expands to window size while blurring (pink border corners 6→3px), and the white frame in the same place deepens — edges grow from the center starting at morph .15
    const morph = () => {
      const w = (REST + (LW - REST) * st.morph) * st.press, h = (REST + (LH - REST) * st.morph) * st.press;
      gsap.set(lens, { scaleX: w / LW, scaleY: h / LH });
      const r = lens.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      cursor.place(cx, cy);
      Object.assign(cursor.el.style, { width: `${w}px`, height: `${h}px`, opacity: 1 - st.morph });
      Object.assign(frame.style, { left: `${cx}px`, top: `${cy}px`, width: `${w}px`, height: `${h}px`, opacity: st.morph });
      const size = 6 - 3 * st.morph, off = `${-3 * st.morph}px`;
      [ck, fk].forEach((set) => set.forEach((k, i) => {
        Object.assign(k.style, { width: `${size}px`, height: `${size}px`, top: i < 2 ? off : "auto", bottom: i < 2 ? "auto" : off, left: i % 2 ? "auto" : off, right: i % 2 ? off : "auto" });
      }));
      const p = gsap.utils.clamp(0, 1, (st.morph - .15) / .85), edge = p * p * (3 - 2 * p);
      cl.forEach((l, i) => {
        const v = i < 2, first = i % 2 === 0;
        Object.assign(l.style, { left: `${w / 2 + (v ? 0 : first ? -6 : 6)}px`, top: `${h / 2 + (v ? (first ? -6 : 6) : 0)}px`, right: "auto", bottom: "auto", translate: "-50% -50%", opacity: 1 - Math.min(1, st.morph / .35) });
      });
      fe.forEach((e, i) => {
        const v = i < 2, first = i % 2 === 0;
        Object.assign(e.style, { width: `${v ? w * edge : 1}px`, height: `${v ? 1 : h * edge}px`, left: `${v ? w / 2 : first ? .5 : w - .5}px`, top: `${v ? (first ? .5 : h - .5) : h / 2}px`, opacity: edge });
      });
    };
    const loop = () => {
      st.raf = requestAnimationFrame(loop);
      if (st.morphing) morph();
      if (st.id !== null) paint();
    };

    const start = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || st.id !== null || e.target.closest("a, button, [role='button']")) return;
      st.tl?.kill();
      const b = hero.getBoundingClientRect();
      st.px = e.clientX; st.py = e.clientY;
      st.morph = 0; st.press = 1;
      xTo.tween.pause(); yTo.tween.pause();
      gsap.set(lens, { x: e.clientX - b.left, y: e.clientY - b.top });
      gsap.set(layer, { opacity: 0 });
      gsap.set(inner, { opacity: 0, scale: .65, rotation: -22 });
      aimAt(e.clientX, e.clientY);
      st.id = e.pointerId;
      st.morphing = true;
      cursor.hold(true);
      morph();
      if (!st.raf) loop();
      xTo(st.tx, e.clientX - b.left);
      yTo(st.ty, e.clientY - b.top);
      paint();
      lens.classList.add("is-active");
      st.tl = gsap.timeline({ defaults: { overwrite: "auto" } })
        .to(st, { morph: 1, duration: .4, ease: "power2.out" }, 0)
        .to(st, { press: 1.08, duration: .18, ease: "power2.out" }, .12)
        .to(st, { press: 1, duration: .36, ease: "back.out(1.4)" }, .3)
        .to(layer, { opacity: 1, duration: .18, ease: "power2.out" }, .06)
        .to(inner, { opacity: 1, scale: 1.22, rotation: 8, duration: .24, ease: "power2.out" }, .08)
        .to(inner, { scale: .98, rotation: -2, duration: .16, ease: "power2.inOut" }, .32)
        .to(inner, { scale: 1, rotation: 0, duration: .16, ease: "power2.out" }, .48);
    };
    const move = (e) => {
      st.px = e.clientX; st.py = e.clientY;
      if (st.id === null && st.morphing) {
        const b = hero.getBoundingClientRect();
        xTo(e.clientX - b.left); yTo(e.clientY - b.top);
      }
      if (e.pointerId !== st.id) return;
      aimAt(e.clientX, e.clientY);
      xTo(st.tx); yTo(st.ty);
    };
    const stop = (e) => {
      if (st.id === null || (e && e.pointerId !== st.id)) return;
      st.id = null;
      lens.classList.remove("is-active");
      const b = hero.getBoundingClientRect();
      xTo(st.px - b.left); yTo(st.py - b.top);
      st.tl?.kill();
      st.tl = gsap.timeline({
        defaults: { overwrite: "auto" },
        onComplete: () => {
          cancelAnimationFrame(st.raf); st.raf = 0;
          st.morphing = false;
          frame.style.opacity = "0";
          ["width", "height", "opacity"].forEach((p) => cursor.el.style.removeProperty(p));
          [...ck, ...cl].forEach((el) => el.removeAttribute("style"));
          gsap.set(lens, { scale: 0 });
          cursor.hold(false);
        },
      })
        .to(inner, { opacity: 0, scale: .72, rotation: -14, duration: .2, ease: "power2.in" }, 0)
        .to(layer, { opacity: 0, duration: .18 }, 0)
        .to(st, { morph: 0, press: 1, duration: .4, ease: "power3.inOut" }, 0);
    };
    hero.addEventListener("pointerdown", start);
    addEventListener("pointermove", move);
    addEventListener("pointerup", stop);
    addEventListener("pointercancel", stop);
    addEventListener("blur", () => stop());
  };
  initHoldLens();
})();
