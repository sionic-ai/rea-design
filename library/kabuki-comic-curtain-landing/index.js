// Home motion — original values as they are: handkerchief→brand cycle, About paper panel pinned (4 screens, scrub .3), video card, comic panel sequence,
// Pin where the last cut grows into a stage (3.75 screens), and reaching the page end returns to the top (connects to the pinned first screen behind the curtain).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => innerWidth > 768;
  const vh = () => innerHeight;
  const vw = () => document.documentElement.clientWidth;
  const header = document.querySelector(".sm-header");
  const headH = () => header.offsetHeight;
  const docTop = (el) => el.getBoundingClientRect().top + scrollY;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── Hero ──
  const hero = $("#hero");
  const adjustHero = () => {
    if (!isPc()) return;
    const minus = innerHeight <= 800 ? (800 - innerHeight) * 0.8 : 0;
    $$(".sm-hero__sushiwrap, .sm-hero__sushibg", hero).forEach((el) => (el.style.bottom = minus ? 60 - minus + "px" : ""));
    $(".sm-hero__handwrap--left", hero).style.bottom = minus ? 427 - minus + "px" : "";
    $(".sm-hero__handwrap--right", hero).style.bottom = minus ? 213 - minus + "px" : "";
  };
  adjustHero();

  // Short motion of a handkerchief rolling into brand (the original is a transparent animated PNG) — when done, both hands hold for 2s then withdraw
  const items = $$(".sm-hero__item", hero);
  const hands = $$(".sm-hero__hand", hero);
  const kuru = $$(".sm-hero__kuru", hero);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rollTl = (item, dur) => {
    const towel = $(".sm-hero__towel", item), roll = $(".sm-hero__roll", item);
    return gsap.timeline()
      .set(towel, { opacity: 1, scaleX: 1, scaleY: 1, rotation: 0 })
      .set(roll, { opacity: 0, scale: 0.3, rotation: -90 })
      .to(towel, { scaleX: 0.45, scaleY: 0.7, rotation: 160, duration: dur * 0.45, ease: "power1.inOut" }, dur * 0.12)
      .to(towel, { opacity: 0, duration: dur * 0.1 }, dur * 0.55)
      .to(roll, { opacity: 1, scale: 1, rotation: 0, duration: dur * 0.3, ease: "back.out(1.6)" }, dur * 0.52);
  };
  const playSushi = async (item) => {
    const play = $(".sm-hero__play", item), stop = $(".sm-hero__stop", item);
    const dur = +item.dataset.dur, kuruDelay = +item.dataset.kuru;
    play.style.transition = stop.style.transition = "none";
    play.style.opacity = stop.style.opacity = 0;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    play.style.transition = "opacity 600ms";
    play.style.opacity = 1;
    const tl = rollTl(item, dur / 1000);
    setTimeout(() => {
      kuru[0].classList.add("is-show");
      setTimeout(() => { kuru[1].classList.add("is-show"); setTimeout(() => kuru.forEach((k) => k.classList.remove("is-show")), 1000); }, 400);
    }, kuruDelay);
    await wait(dur - 16);
    play.style.transition = "opacity 400ms";
    play.style.opacity = 0;
    stop.style.opacity = 1;
    hands.forEach((h) => { h.classList.add("is-move"); setTimeout(() => h.classList.remove("is-move"), 2000); });
    await wait(2000);
    stop.style.transition = "opacity 400ms";
    stop.style.opacity = 0;
    tl.kill();
    await wait(400);
  };
  document.addEventListener("sm:opened", () => {
    hero.classList.add("is-loaded");
    setTimeout(async () => {
      $$(".sm-hero__handwrap", hero).forEach((w) => w.classList.add("is-show"));
      if (reduce) { $(".sm-hero__stop", items[0]).style.opacity = 1; return; }
      for (;;) for (const item of items) await playSushi(item);
    }, reduce ? 0 : 1000);
  });

  // ── About paper panel ──
  const about = $("#about");
  const stage = $(".sm-paper__stage", about);
  const progress = $(".sm-about__progress", about);
  const walker = $(".sm-about__walker", about);
  const mainDiff = () => docTop(stage) + stage.offsetHeight / 2 - docTop(about);
  const placeProgress = () => { progress.style.top = mainDiff() + "px"; };
  const aboutStart = () => "top+=" + (mainDiff() - headH() / 2) + " center";
  const geo = () => {
    const pc = isPc();
    const h0 = pc ? vw() * (400 / 1280) : vw() * (326 / 375);
    const h1 = pc ? vh() * (612 / 800) : vw() * (425 / 375);
    return { h0, h1, top: -(h1 - h0) / 2, bottom: (h1 - h0) / 2, bottomH: (h1 - h0) / 2 - (pc ? (20 / 1280) * vw() : (13 / 375) * vw()) };
  };

  // Only while pinned, the finger-drawing cursor follows the mouse by .2 per frame (hidden over the header row)
  const cursor = $("#smCursor");
  const cursorState = { x: 0, y: 0, cx: 0, cy: 0, init: false, fixed: false, active: false, overHeader: false };
  const showCursor = () => {
    if (!cursorState.init || cursorState.overHeader) return;
    cursorState.active = true;
    document.documentElement.classList.add("sm-hide-cursor");
    cursor.style.visibility = "visible";
    cursor.style.opacity = "0";
    requestAnimationFrame(() => (cursor.style.opacity = "1"));
  };
  const hideCursor = () => {
    cursorState.fixed = cursorState.active = false;
    document.documentElement.classList.remove("sm-hide-cursor");
    cursor.style.opacity = "0";
    cursor.addEventListener("transitionend", () => { if (!cursorState.fixed) cursor.style.visibility = "hidden"; }, { once: true });
  };

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 769px)", sp: "(max-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { pc, reduce: rm } = ctx.conditions;
    placeProgress();
    if (rm) {
      gsap.set(".sm-fade-01", { opacity: 1 });
      $$("._Anime, ._Anime_middle, ._Anime_top, .sm-panel").forEach((el) => el.classList.add("is-run"));
      return;
    }
    const units = 4;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "aboutPin", trigger: about, start: aboutStart, end: () => "+=" + vh() * units,
        pin: about, anticipatePin: 0.3, scrub: 0.3, invalidateOnRefresh: true, refreshPriority: 1001,
        onRefresh: placeProgress,
        onUpdate: (self) => walker.dispatchEvent(new CustomEvent("fx:progress", { detail: { progress: self.progress } })),
        onEnter: () => { cursorState.fixed = true; if (pc) showCursor(); },
        onEnterBack: () => { cursorState.fixed = true; if (pc) showCursor(); },
        onLeave: hideCursor,
        onLeaveBack: hideCursor,
      },
    });
    const x = (sel) => about.querySelector(sel);
    // Spread [.25, 1.25]
    tl.fromTo(x(".sm-paper__contents"), { height: () => geo().h0 }, { height: () => geo().h1, duration: 1 }, 0.25);
    tl.to(x(".sm-paper__frame"), { width: "100%", duration: 1 }, 0.25);
    if (pc) {
      tl.to(".sm-item", { width: "calc(100% - 20px)", duration: 1 }, 0.25);
      tl.to(x(".sm-paper__top"), { y: () => geo().top, opacity: 0, duration: 1 }, 0.25);
      tl.to(x(".sm-paper__fish"), { x: () => -x(".sm-paper__fish").offsetWidth * (1 + 44 / 238), opacity: 0, duration: 1 }, 0.25);
      tl.to(x(".sm-paper__brand"), { x: () => x(".sm-paper__brand").offsetWidth * (1 + 44 / 240), opacity: 0, duration: 1 }, 0.25);
      tl.to(x(".sm-paper__bottom"), { y: () => geo().bottom, opacity: 0, duration: 1 }, 0.25);
      tl.fromTo(x(".sm-paper__fv-heading"),
        { width: "calc((156 / 1280) * 100vw)", height: "calc((354 / 1280) * 100vw)", top: "calc((23 / 1280) * 100vw)", right: "calc((276 / 1082) * 100%)" },
        { width: "calc((187 / 1280) * 100vw)", height: "calc((472 / 1280) * 100vw)", top: "calc((26 / 1280) * -100vw)", right: "calc((61 / 1082) * 100%)", duration: 1 }, 0.25);
      tl.fromTo(x(".sm-paper__fv-copy"),
        { top: "calc((159 / 1280) * 100vw)", left: "calc((294 / 1082) * 100%)", width: "calc((82.88 / 1280) * 100vw)", fontSize: "calc((36 / 1280) * 100vw)" },
        { top: "calc((160 / 1280) * 100vw)", left: "calc((97 / 1082) * 100%)", width: "calc((120.94 / 1280) * 100vw)", fontSize: "calc((52.5 / 1280) * 100vw)", duration: 1 }, 0.25);
      tl.to(x(".sm-paper__fv-text"), { y: () => geo().top, opacity: 0, duration: 1 }, 0.25);
      tl.fromTo(x(".sm-item--01 .sm-item__img"), { height: "150%", top: "2%", left: "50%" },
        { height: "calc((511 / 577) * 100%)", top: "calc((45 / 577) * 100%)", left: "calc((242 / 483) * 100%)", duration: 1 }, 0.25);
      tl.fromTo(".sm-paper__frame-dash", { yPercent: -100 }, { yPercent: 0, duration: 0.5 }, 1.25);
    } else {
      tl.to(".sm-item", { height: "100%", duration: 1 }, 0.25);
      tl.to(x(".sm-paper__top"), { y: () => geo().top, duration: 1 }, 0.25);
      tl.to([x(".sm-paper__fish"), x(".sm-paper__fv-copy")], { y: () => geo().top, duration: 1 }, 0.25);
      tl.to([x(".sm-paper__brand"), x(".sm-paper__bottom")], { y: () => geo().bottom, duration: 1 }, 0.25);
      tl.fromTo(x(".sm-item--01 .sm-item__img"), { height: "266%", top: "52%", left: "47%" },
        { height: "calc((216 / 244) * 100%)", top: "calc((16 / 244) * 100%)", left: "48%", duration: 1 }, 0.25);
      tl.fromTo(".sm-paper__frame-dash", { xPercent: -100 }, { xPercent: 0, duration: 0.5 }, 1.25);
    }
    tl.fromTo([x(".sm-paper__fv-heading"), x(".sm-paper__fv-copy")], { opacity: 1 }, { opacity: 0, duration: 0.5 }, 0.75);
    tl.fromTo(x(".sm-item--01 .sm-item__img"), { filter: "grayscale(100%)" }, { filter: "grayscale(0%)", duration: 0.5 }, 1.25);
    tl.fromTo(".sm-paper__frame-bg", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.25);
    // Three sheets change one screen at a time
    tl.fromTo(".sm-fade-01", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 1.25);
    tl.fromTo([".sm-fade-01", x(".sm-item--01 .sm-item__img")], { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, 2.0);
    tl.fromTo(".sm-fade-02", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 2.25);
    tl.fromTo(x(".sm-item--02 .sm-item__img"), { xPercent: -45, yPercent: -5 }, { xPercent: -50, yPercent: 0, duration: 0.25 }, 2.25);
    tl.fromTo(".sm-fade-02", { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, 3.0);
    tl.fromTo(".sm-fade-03", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 3.25);
    tl.fromTo(x(".sm-item--03 .sm-item__img"), { xPercent: -60 }, { xPercent: -50, duration: 0.25 }, 3.25);
    tl.fromTo(x(".sm-paper__bottom"), { height: () => vh() }, { height: () => geo().bottomH, duration: 0.5 }, 3.5);
    return () => hideCursor();
  });
  gsap.set(".sm-item__img", { x: 0, xPercent: -50 });

  if (!reduce) {
    (function loop() {
      if (cursorState.init) {
        cursorState.cx += (cursorState.x - cursorState.cx) * 0.2;
        cursorState.cy += (cursorState.y - cursorState.cy) * 0.2;
        cursor.style.transform = `translate(${cursorState.cx}px, ${cursorState.cy}px)`;
      }
      requestAnimationFrame(loop);
    })();
    addEventListener("mousemove", (e) => {
      cursorState.x = e.clientX; cursorState.y = e.clientY;
      if (!cursorState.init) { cursorState.init = true; cursorState.cx = e.clientX; cursorState.cy = e.clientY; }
      if (cursorState.fixed && !cursorState.active && !cursorState.overHeader && isPc()) showCursor();
    }, { passive: true });
    header.addEventListener("mouseenter", () => { cursorState.overHeader = true; if (cursorState.active) cursor.style.opacity = "0"; });
    header.addEventListener("mouseleave", () => { cursorState.overHeader = false; if (cursorState.active && cursorState.fixed) cursor.style.opacity = "1"; });
  }

  // ── How it’s made: hover plays after 100ms, leaving resets to the start. Pressing opens a vertical video window (.4s fade) ──
  const modal = $(".sm-modal");
  const modalVideo = $("video", modal);
  if (matchMedia("(hover: hover)").matches) {
    $$(".sm-vcard__video").forEach((btn) => {
      const v = $("video", btn);
      let t = 0;
      btn.addEventListener("mouseenter", () => { clearTimeout(t); t = setTimeout(() => { if (v.paused) v.play().catch(() => {}); }, 100); });
      btn.addEventListener("mouseleave", () => { clearTimeout(t); v.pause(); v.currentTime = 0; });
    });
  }
  $$(".sm-vcard__video").forEach((btn) => btn.addEventListener("click", () => {
    modal.hidden = false;
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.4, ease: "sine.inOut" });
    modalVideo.currentTime = 0;
    modalVideo.play().catch(() => {});
  }));
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", () => {
    gsap.to(modal, { opacity: 0, duration: reduce ? 0 : 0.4, ease: "sine.inOut", onComplete: () => { modal.hidden = true; modalVideo.pause(); } });
  }));

  // ── Products: once videos are fully loaded, all repeat at the same tempo ──
  const pvideos = $$(".sm-product video");
  let ready = 0, allReady = false;
  const playAll = () => {
    pvideos.forEach((v) => { v.pause(); v.currentTime = 0; });
    requestAnimationFrame(() => requestAnimationFrame(() => pvideos.forEach((v) => v.paused && v.play().catch(() => {}))));
  };
  pvideos.forEach((v) => {
    v.loop = true; v.muted = true;
    const mark = () => { if (++ready === pvideos.length && !allReady) { allReady = true; if (!reduce) playAll(); } };
    if (v.readyState === 4) mark(); else { v.addEventListener("canplaythrough", mark, { once: true }); v.load(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && allReady && !reduce) playAll(); });

  // ── Comic cuts: when a cut crosses the line (phone .65 / desktop top .4 · middle .6 · default .75) it gets is-run, then the elements inside the cut run at set intervals ──
  const panels = $$(".sm-panel");
  const ratioOf = (p) => !isPc() ? 0.65
    : p.matches(".sm-panel--03") ? 0.4
    : p.matches(".sm-panel--01, .sm-panel--02, .sm-panel--04, .sm-panel--05, .sm-panel--06") ? 0.6 : 0.75;
  const show = (...sels) => sels.forEach((s) => $$(s).forEach((el) => el.classList.add("is-show")));
  const chain = (steps) => {
    let t = isPc() ? 800 : 600;
    steps.forEach(([gap, fn]) => { t += gap; setTimeout(fn, t); });
  };
  const sequences = {
    "01": () => chain([[0, () => show(".sm-p1__banner", ".sm-p1__logo")], [800, () => show(".sm-p1__maki")], [500, () => show(".sm-p1__name--r", ".sm-p1__profile--r")],
      [800, () => show(".sm-p1__tata")], [500, () => show(".sm-p1__name--l", ".sm-p1__profile--l")], [1000, () => show(".sm-p1__tata-bubble")]]),
    "02": () => chain([[0, () => show(".sm-p2__maki")], [1000, () => show(".sm-p2__bubble", ".sm-p2__en")], [800, () => show(".sm-p2__mumu")]]),
    "03": () => chain([[0, () => show(".sm-p3__item")], [800, () => show(".sm-p3__hirari")], [1200, () => show(".sm-p3__tata")], [800, () => show(".sm-p3__en")]]),
    "04": () => chain([[0, () => show(".sm-p4__cloud")], [800, () => show(".sm-p4__maki")], [600, () => show(".sm-p4__en")]]),
    "05": () => chain([[0, () => show(".sm-p5__table")], [1200, () => show(".sm-p5__duo")], [800, () => show(".sm-p5__bubble", ".sm-p5__en")], [600, () => show(".sm-p5__note")]]),
    "06": () => chain([[0, () => show(".sm-p6__hand--l")], [800, () => show(".sm-p6__item")], [800, () => show(".sm-p6__hand--r")],
      [1000, () => { show(".sm-p6__ono", ".sm-p6__en"); $$(".sm-p6__hand, .sm-p6__ono").forEach((el) => el.classList.add("is-niginigi")); }]]),
    "07": () => chain([[0, () => show(".sm-p7__hand")], [600, () => show(".sm-p7__brand", ".sm-p7__rays")], [600, () => show(".sm-p7__logo", ".sm-p7__tata")], [600, () => show(".sm-p7__bubble", ".sm-p7__en")]]),
    "08": () => chain([[0, () => show(".sm-p8__maki", ".sm-p8__bubble--1")], [1200, () => show(".sm-p8__tata", ".sm-p8__bubble--2")], [600, () => show(".sm-p8__ono--2")], [400, () => show(".sm-p8__ono--1")]]),
  };
  const done = new Set();
  const comicCheck = () => {
    panels.forEach((p) => {
      if (scrollY + innerHeight * ratioOf(p) < docTop(p)) return;
      p.classList.add("is-run");
      const key = p.className.match(/sm-panel--(\d\d)/)[1];
      if (!done.has(key)) { done.add(key); if (reduce) $$("[data-step]", p).forEach((el) => el.classList.add("is-show")); else sequences[key](); }
    });
  };
  addEventListener("scroll", comicCheck, { passive: true });

  // ── Last cut becomes the stage: the cut group is pinned for 3.75 screens, and during the first 1 screen panel 8 grows to fill the screen ──
  const comic = $(".sm-comic");
  const p8 = $(".sm-panel--08");
  const p7 = $(".sm-panel--07");
  const spacer = $(".sm-comic__spacer");
  const bgs = $$(".sm-p8__bg", p8);
  const stages = $$(".sm-stage", p8);
  const panelH = () => p8.offsetWidth * (isPc() ? 423 / 1000 : 250 / 340);
  const layoutP8 = () => {
    spacer.style.paddingBottom = Math.max(0, (vh() - headH() - p8.offsetHeight) / 2) + "px";
    stages.forEach((s) => { s.style.width = (isPc() ? vw() : vw() + 2) + "px"; });
  };
  const stageX = () => (bgs[0].offsetWidth - stages[0].offsetWidth) / 2 - 4;
  const stageY = () => (bgs[0].offsetHeight - stages[0].offsetHeight) / 2 - 4;
  layoutP8();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const pin = ScrollTrigger.create({
      id: "comicPin", trigger: comic, start: "bottom bottom", end: () => "+=" + vh() * 3.75,
      pin: comic, anticipatePin: 0.3, invalidateOnRefresh: true, refreshPriority: 1000, onRefreshInit: layoutP8,
    });
    const at = (s) => () => pin.start + vh() * s;
    const st = (s, e) => ({ trigger: comic, start: at(s), end: () => "+=" + vh() * e, scrub: 0.3, invalidateOnRefresh: true });
    gsap.fromTo(stages, { x: stageX, y: stageY }, { x: -2, y: -2, ease: "none", scrollTrigger: st(0, 1) });
    gsap.fromTo(stages, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: st(0.5, 0.5) });
    gsap.fromTo(bgs, { width: "100%", height: () => panelH() + 8, borderRadius: "10px" },
      { width: () => vw() + 2, height: () => vh() + 2 - headH(), borderRadius: "0px", ease: "none", scrollTrigger: st(0, 1) });
    gsap.fromTo($$(".sm-p8__bubble, .sm-p8__ono", p8), { opacity: 1 }, { opacity: 0, pointerEvents: "none", ease: "none", immediateRender: false, scrollTrigger: st(0, 0.5) });
    gsap.fromTo($$(".sm-p8__shadow", p8), { opacity: 1 }, { opacity: 0, ease: "none", immediateRender: false, scrollTrigger: st(0, 0.5) });
    gsap.fromTo($(".sm-p8__texture", p8), { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: st(0.5, 75) });
    gsap.fromTo($(".sm-p8__maki-wrap", p8), { width: "100%" }, { width: () => (isPc() ? (405 / 1280) : (216 / 375)) * vw(), xPercent: 37 / 405 * 100, yPercent: 92 / 403 * 100, ease: "none", scrollTrigger: st(0.5, 0.75) });
    gsap.fromTo($(".sm-p8__tata-wrap", p8), { width: "100%" }, { width: () => (isPc() ? (138.38 / 1280) : (81 / 375)) * vw(), xPercent: 26 / 138 * 100, yPercent: 115 / 249 * 100, ease: "none", scrollTrigger: st(0.5, 0.75) });
    gsap.fromTo(p7, { y: 0 }, { y: () => -(vh() - headH() - p8.offsetHeight) / 2, ease: "none", scrollTrigger: st(0, 1) });
    gsap.fromTo(p7, { opacity: 1 }, { opacity: 0, ease: "none", immediateRender: false, scrollTrigger: st(0, 1) });
    const applause = $(".sm-stage__applause", p8);
    const narr = $$(".sm-stage__narr", p8);
    let narrCall;
    ScrollTrigger.create({
      trigger: comic, start: at(1.25),
      onEnter: () => { applause.classList.add("is-show"); narrCall = gsap.delayedCall(0.6, () => narr.forEach((n) => n.classList.add("is-show"))); },
      onLeaveBack: () => { narrCall?.kill(); applause.classList.remove("is-show"); narr.forEach((n) => n.classList.remove("is-show")); },
    });
  });

  // ── On reaching the page end, clear every is-run and jump to the top — it connects seamlessly with the fixed hero behind the curtain ──
  const epilogue = $("#epilogue");
  addEventListener("scroll", () => {
    if (reduce) return;
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 10) {
      $$(".is-run").forEach((el) => el.classList.remove("is-run"));
      scrollTo(0, 0);
    }
    if (scrollY <= 10) epilogue.style.opacity = "1";
  }, { passive: true });

  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { adjustHero(); layoutP8(); ScrollTrigger.refresh(); }, 150); });
  addEventListener("load", () => setTimeout(() => ScrollTrigger.refresh(), 100));
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  comicCheck();
})();
