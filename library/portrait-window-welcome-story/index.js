// First page scenes. Values exactly from the original bundle (expo.inOut = 「Rs」, expo.out = 「Cc」, sine.out = 「wi」).
(() => {
  gsap.registerPlugin(ScrollTrigger, Flip);
  const { lenis, reduce } = window.npSite;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const desk = () => matchMedia("(min-width: 78.375em)").matches;

  // Fit text: fills the cell width fully but does not exceed 125% of the cell height (original FitText 125cqh)
  const fit = () => {
    $$(".g-fit").forEach((el) => {
      const box = el.closest(".g-split__part, .g-hero__welcome") || el.parentElement;
      el.style.fontSize = "100px";
      const w = el.scrollWidth || 1;
      const room = box.clientWidth;
      const capH = box.classList.contains("g-split__part") ? box.clientHeight * 1.25 : Infinity;
      el.style.fontSize = `${Math.min((room / w) * 100, capH)}px`;
    });
  };

  const hero = $(".g-hero");
  const inner = $(".g-hero__inner");
  const portal = $(".g-hero__portal");
  const rect = $(".g-hero__rect");
  const portrait = $(".g-hero__portrait");
  const welcome = $(".g-hero__welcome");
  const welcomeText = $(".g-hero__welcome .g-fit");
  const tiles = $(".g-tiles");
  const clip = $(".g-clip");
  const clipWrap = $(".g-clip__wrap");
  const superSec = $(".g-super");
  const marker = $(".g-marker");

  let state = "intro";
  let introDone = false;
  let wanted = false;
  let cover;
  let clipShown = false;
  let clipTrigger, stageScrub;
  const introText = $(".g-hero__intro");

  const lock = (on) => { if (on) lenis?.stop(); else lenis?.start(); document.documentElement.classList.toggle("g-locked", on); };

  // On entry: at .63s intervals, upper title → lower title → a black window opens horizontally (1.76s expo.out) while the portrait rises from beneath the window (1.76s quint.out)
  const intro = () => gsap.timeline()
    .set($(".g-hero__top"), { autoAlpha: 1 }, "+=0.63")
    .set($(".g-hero__bottom"), { autoAlpha: 1 }, "+=0.63")
    .to(rect, { scaleX: 1, duration: 1.76, ease: "expo.out" }, "+=0.63")
    .set(portrait, { autoAlpha: 1, xPercent: -50 }, "<")
    .fromTo(portrait, { yPercent: 55, xPercent: -50 }, { yPercent: 0, xPercent: -50, duration: 1.76, ease: "quint.out", immediateRender: false }, "<");

  // On the first wheel: the window covers the screen (1.2s quint.inOut) and the portrait rotates 20° while growing to the right (1.4s), then after .77s the welcome letters rise from y180·.8x (1s expo.out)
  const build = () => {
    const ir = inner.getBoundingClientRect();
    const hr = hero.getBoundingClientRect();
    const pr = portal.getBoundingClientRect();
    const rr = rect.getBoundingClientRect();
    const sr = portrait.getBoundingClientRect();
    const cx = rr.left + rr.width / 2, cy = rr.top + rr.height / 2;
    const sx = (2 * (Math.max(cx - ir.left, ir.right - cx) + 8)) / rect.offsetWidth;
    const sy = (2 * (Math.max(cy - ir.top, ir.bottom - cy) + 8)) / rect.offsetHeight;
    const cs = getComputedStyle(hero);
    const pad = parseFloat(cs.getPropertyValue("--hero-pad")) || 70;
    const scale = parseFloat(cs.getPropertyValue("--portrait-scale")) || 0.74;
    const wide = desk();
    // Original: full-grown portrait width = (panel width − margin×2) × .74 — on wide screens it sticks to the right margin, on narrow screens it is centered
    const w = (hero.clientWidth - pad * 2) * scale;
    const dx = wide ? hr.left + hero.clientWidth - pad - w * 0.5 - (pr.left + pr.width * 0.5) : ir.left + ir.width * 0.5 - (pr.left + pr.width * 0.5);
    const big = Math.max(ir.width, ir.height) * 2;
    gsap.set(portal, { zIndex: 10, clipPath: `inset(-${big}px -${big}px 0px -${big}px)` });
    gsap.set(portrait, { top: sr.top - pr.top, bottom: "auto", xPercent: -50, yPercent: 0, y: 0 });
    return gsap.timeline({ paused: true })
      .to(rect, { scaleX: sx, scaleY: sy, duration: 1.2, ease: "quint.inOut" })
      .to(portal, { clipPath: `inset(-${big}px -${big}px -${rect.offsetHeight * (sy - 1) * 0.5}px -${big}px)`, duration: 1.2, ease: "quint.inOut" }, "<")
      .fromTo(portrait, { width: sr.width, x: 0 }, { width: w, x: dx, top: ir.top - pr.top, rotation: 20, duration: 1.4, ease: "quint.inOut" }, "<")
      .set(welcome, { autoAlpha: 1 }, "<+=0.77")
      .fromTo(welcomeText, { y: 180, scale: 0.8 }, { y: 0, scale: 1, transformOrigin: "50% 100%", duration: 1, ease: "expo.out", immediateRender: false }, "<");
  };

  const toFull = () => {
    if (state !== "intro" || !introDone) { wanted = true; return; }
    state = "transition";
    cover = build();
    cover.play().then(() => {
      if (state !== "transition") return;
      state = "full";
      hero.setAttribute("data-stage", "full");
      // The original stage height: fully grown portrait height + 18% of width (the next section overlaps upward by 40% of width)
      const W = hero.clientWidth;
      hero.style.minHeight = `${portrait.offsetWidth * (2560 / 1340) + W * 0.18}px`;
      lock(false);
      clipTrigger = ScrollTrigger.create({ trigger: clip, start: "top 30%", once: true, onEnter: showClip });
      gsap.to(tiles, { autoAlpha: 1, duration: 0.4, ease: "quart.out" });
      gsap.to(marker, { autoAlpha: 1, duration: 0.4, ease: "quart.out" });
      // About paragraphs go y100 → 0 (cubic.inOut) while passing the panel, the portrait 20° → 30° (sine.out) — tied to scroll
      gsap.set(introText, { autoAlpha: 1, y: 100 });
      stageScrub = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } })
        .fromTo(introText, { y: 100 }, { y: 0, duration: 1, immediateRender: false, ease: "cubic.inOut" }, 0)
        .fromTo(portrait, { rotation: 20 }, { rotation: 30, duration: 1, immediateRender: false, ease: "sine.out" }, 0);
      ScrollTrigger.refresh();
    });
  };

  // Scrolling up at the very top rewinds in reverse back to the Hero
  const toIntro = () => {
    if (state !== "full" || !cover) return;
    state = "reversing";
    lock(true);
    hero.removeAttribute("data-stage");
    hero.style.minHeight = "";
    clipTrigger?.kill();
    stageScrub?.scrollTrigger?.kill(); stageScrub?.kill(); stageScrub = null;
    gsap.set(introText, { autoAlpha: 0, clearProps: "y" });
    gsap.to([tiles, marker], { autoAlpha: 0, duration: 0.4, ease: "quart.out" });
    if (clipShown) { gsap.set(clipWrap, { autoAlpha: 0 }); gsap.set(superSec, { opacity: 0 }); clipShown = false; }
    cover.eventCallback("onReverseComplete", () => { state = "intro"; cover = null; gsap.set(portal, { clearProps: "zIndex,clipPath" }); });
    cover.reverse();
  };

  const showClip = () => {
    if (clipShown) return;
    clipShown = true;
    const done = () => gsap.set(superSec, { opacity: 1 });
    if (reduce) { gsap.fromTo(clipWrap, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "sine.out", onComplete: done }); return; }
    gsap.set(clipWrap, { autoAlpha: 1 });
    gsap.fromTo(clipWrap, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "expo.inOut", duration: 1.4, onComplete: done });
  };

  const onWheel = (e) => {
    if (state === "intro" && e.deltaY > 0) { e.preventDefault(); toFull(); }
    else if (state === "transition" || state === "reversing") e.preventDefault();
    else if (state === "full") {
      if (e.deltaY < 0 && scrollY <= 1) { e.preventDefault(); toIntro(); }
    }
  };
  const onKey = (e) => {
    if (!["ArrowDown", "PageDown", " ", "End"].includes(e.key)) return;
    if (state === "intro") { e.preventDefault(); toFull(); }
  };
  let touchY = 0;
  const onTouchStart = (e) => { touchY = e.touches[0].clientY; };
  const onTouchMove = (e) => {
    const dy = touchY - e.touches[0].clientY;
    if (state === "intro" && dy > 12) toFull();
  };

  const startHero = () => {
    if (reduce) {
      state = "full";
      introDone = true;
      hero.setAttribute("data-stage", "full");
      gsap.set([rect], { scaleX: 1 });
      gsap.set([tiles, marker, clipWrap, introText, welcome], { autoAlpha: 1 });
      gsap.set(superSec, { opacity: 1 });
      clipShown = true;
      return;
    }
    history.scrollRestoration = "manual";
    scrollTo(0, 0);
    lenis?.scrollTo(0, { immediate: true, force: true });
    lock(true);
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("keydown", onKey);
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: true });
    $(".g-hero__lock").addEventListener("click", toFull);
    intro().then(() => { introDone = true; if (wanted) { wanted = false; toFull(); } });
  };

  // Sky-blue panel: video width = min(panel width, 750, (screen height − top and bottom captions) × 16/9). On scroll the video shrinks to the center (2/3) and the panel closes upward (1/3)
  const clipScene = () => {
    const box = $(".g-clip__box");
    const size = () => {
      const t = $$(".g-clip__title", box).reduce((a, n) => a + n.offsetHeight, 0);
      clip.style.setProperty("--video-w", `${Math.min(box.offsetWidth, 750, (innerHeight - t) * (16 / 9))}px`);
    };
    size();
    addEventListener("resize", size);
    if (reduce) return;
    const P = 1 / 3;
    gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: clip, start: "top top", end: "bottom bottom", scrub: true } })
      .fromTo($(".g-clip__content"), { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(50% 50% 50% 50%)", duration: P * 2 }, 0)
      .fromTo(clipWrap, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: P, immediateRender: false });
    const video = $(".g-clip__video");
    video.addEventListener("click", () => video.classList.toggle("is-full"));
  };

  // Timeline: embla (dragFree · start · trimSnaps) + range bar, first four come in from x80 at 1.2s expo.out .1 stagger
  const timeline = () => {
    const root = $(".g-tl");
    const embla = EmblaCarousel($(".g-tl__viewport", root), { dragFree: true, align: "start", containScroll: "trimSnaps" });
    const range = $(".g-tl__range", root);
    const [prev, next] = $$(".g-tl__btn", root);
    const sync = () => {
      range.value = String(Math.round(Math.max(0, Math.min(1, embla.scrollProgress())) * 100));
      prev.disabled = !embla.canScrollPrev();
      next.disabled = !embla.canScrollNext();
    };
    embla.on("scroll", sync).on("reInit", sync).on("select", sync);
    sync();
    prev.addEventListener("click", () => embla.scrollPrev());
    next.addEventListener("click", () => embla.scrollNext());
    range.addEventListener("input", () => {
      const snaps = embla.scrollSnapList();
      const want = +range.value / 100;
      let best = 0;
      snaps.forEach((s, i) => { if (Math.abs(s - want) < Math.abs(snaps[best] - want)) best = i; });
      embla.scrollTo(best);
    });
    if (reduce) return;
    const first = $$(".g-tl__year", root).slice(0, 4);
    gsap.timeline({ scrollTrigger: { trigger: root, start: "top 50%" } })
      .fromTo(first, { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 1.2, stagger: 0.1, delay: 0.15, ease: "expo.out" })
      .fromTo($(".g-tl__controls", root), { opacity: 0 }, { opacity: 1, ease: "expo.out", duration: 1.2 }, "<");
  };

  // Philosophy: the first word slides in from the right (by the video width) and its video opens wiped from the right edge. The second line is mirrored
  const philosophy = () => {
    if (reduce) return;
    const sec = $(".g-phil");
    const [t1, m1, t2, m2] = ["t1", "m1", "t2", "m2"].map((k) => $(`[data-part="${k}"]`, sec));
    const mm = gsap.matchMedia();
    mm.add("(min-width: 62em)", () => {
      const De = m1.offsetWidth, be = m2.offsetWidth;
      gsap.set(t1, { x: De }); gsap.set(t2, { x: -be });
      gsap.set(m1, { clipPath: "inset(0% 0% 0% 100%)", x: -De * 0.19 });
      gsap.set(m2, { clipPath: "inset(0% 100% 0% 0%)", x: be * 0.19 });
      gsap.timeline({ defaults: { duration: 1, ease: "none" }, scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } })
        .to(t1, { x: 0 }, 0).to(m1, { clipPath: "inset(0% 0% 0% 0%)", x: 0 }, 0)
        .to(t2, { x: 0 }, 0).to(m2, { clipPath: "inset(0% 0% 0% 0%)", x: 0 }, 0);
    });
    mm.add("(max-width: 61.99em)", () => {
      gsap.set(t1, { x: m1.offsetWidth }); gsap.set(t2, { x: -m2.offsetWidth });
      gsap.set(m1, { yPercent: 12 }); gsap.set(m2, { yPercent: 55 });
      gsap.timeline({ defaults: { duration: 1, ease: "none" }, scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: true } })
        .to(t1, { x: 0 }, 0).to(t2, { x: 0 }, 0).to(m1, { yPercent: 0 }, 0).to(m2, { yPercent: 0 }, 0);
    });
  };

  // Quote: a yellow mask fills in (0→1), from .5 for .7 the frame expands .1→1x while the quote marks stick to both sides of the frame and spread with it, and the cutout pops up at .82
  const quote = () => {
    const sec = $(".g-quote");
    const wipe = $(".g-quote__wipe", sec);
    const frame = $(".g-quote__frame", sec);
    const open = $(".g-quote__marks--open", sec);
    const close = $(".g-quote__marks--close", sec);
    const photo = $(".g-quote__photo", sec);
    const copy = $(".g-quote__copy", sec);
    if (reduce) { gsap.set(wipe, { clipPath: "none" }); return; }
    const mm = gsap.matchMedia();
    const F = 0.7, at = 0.5, O = at + 0.32, H = at + F * 0.9;
    mm.add("(min-width: 48em)", () => {
      const w = gsap.timeline({ defaults: { duration: 1, ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "85% bottom", scrub: true, invalidateOnRefresh: true } });
      w.fromTo(wipe, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" });
      const S = parseFloat(getComputedStyle($(".g-quote__row", sec)).gap) || 0;
      const P = close.getBoundingClientRect();
      const q = open.lastElementChild.getBoundingClientRect().right;
      const J = frame.getBoundingClientRect().right + S - P.left;
      gsap.set(frame, { transformOrigin: "50% 50%", scaleX: 0.1 });
      const B = frame.getBoundingClientRect();
      gsap.set(open, { x: B.left - S - q });
      gsap.set(close, { x: B.right + S - P.left });
      gsap.set(photo, { yPercent: 100 });
      w.to(frame, { scaleX: 1, duration: F }, at)
        .to(open, { x: 0, duration: F }, at)
        .to(close, { x: J, duration: H - at }, at)
        .to(photo, { yPercent: 0, duration: F }, O)
        .to(close, { x: 0, duration: F * 0.5 }, H);
    });
    mm.add("(max-width: 47.99em)", () => {
      const w = gsap.timeline({ defaults: { duration: 1, ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "85% bottom", scrub: true } });
      w.fromTo(wipe, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" });
      const S = at + F, P = F * 0.4, q = F * 0.5;
      gsap.set(frame, { transformOrigin: "50% 50%", scaleX: 0 });
      gsap.set(photo, { yPercent: 100 });
      gsap.set([open, copy, close], { autoAlpha: 0 });
      w.to(frame, { scaleX: 1, duration: F }, at).to(photo, { yPercent: 0, duration: F }, O)
        .to(open, { autoAlpha: 1, duration: P }, S - P).to(copy, { autoAlpha: 1, duration: q }, S - q).to(close, { autoAlpha: 1, duration: P }, S - P);
    });
  };

  // Expanding list: clicking expands only that row and the rest collapse — Flip 1.2s expo.inOut, text vanishes at .2s and turns back on
  const milestones = () => {
    const items = $$(".g-ms__item");
    const open = async (item) => {
      const fades = $$(".g-ms__item[aria-expanded='true'] .g-ms__meta", document);
      if (fades.length) await gsap.to(fades, { opacity: 0, duration: reduce ? 0 : 0.2, ease: "power2.in" });
      const state = Flip.getState(items.map((i) => $(".g-ms__inner", i)).concat(items.flatMap((i) => [$(".g-ms__title", i), $(".g-ms__media", i)])));
      items.forEach((i) => i.setAttribute("aria-expanded", String(i === item)));
      gsap.set(fades, { opacity: 1 });
      const meta = $$(".g-ms__desc, .g-ms__tickets", item);
      gsap.set(meta, { opacity: 0 });
      await Flip.from(state, { duration: reduce ? 0 : 1.2, ease: "expo.inOut", nested: true, absolute: false });
      gsap.to(meta, { opacity: 1, duration: reduce ? 0 : 0.2 });
      ScrollTrigger.refresh();
    };
    items.forEach((item) => $(".g-ms__trigger", item).addEventListener("click", () => open(item)));
  };

  // A pink sheet covers up from below (inset 105vh → 0, 1.4s expo.inOut) and the pink title panel stands up from y200 .6s later (1s expo.out)
  const vision = () => {
    const sec = $(".g-vision");
    if (reduce) { gsap.fromTo(sec, { opacity: 0 }, { opacity: 1, duration: 1, ease: "sine.out", scrollTrigger: { trigger: sec, start: "top 40%", once: true } }); return; }
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 40%", once: true } })
      .fromTo(sec, { clipPath: "inset(105vh 0% 0% 0%)" }, { clipPath: "inset(0vh 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" })
      .fromTo($(".g-split--pink .g-split__wrap", sec), { y: 200 }, { y: 0, duration: 1, ease: "expo.out" }, "-=0.8");
  };

  // Teal section: the pink veil covering it lifts upward (1.4s expo.inOut), then the divider, table head, and rows light up in turn (rows .08 apart sine.out)
  const events = () => {
    const sec = $(".g-event");
    const pink = $(".g-event__pink", sec);
    const tl = gsap.timeline({ paused: true })
      .fromTo($(".g-event__divider", sec), { opacity: 0 }, { opacity: 1, delay: 0.2, duration: 0.6, ease: "sine.out" })
      .fromTo($(".g-event__head", sec), { opacity: 0 }, { opacity: 1, ease: "sine.out" })
      .fromTo($$(".g-event__row", sec), { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.08, ease: "sine.out" });
    if (reduce) { gsap.fromTo(pink, { opacity: 1 }, { opacity: 0, duration: 1, ease: "sine.out", scrollTrigger: { trigger: sec, start: "top 40%", once: true }, onComplete: () => tl.play() }); return; }
    gsap.fromTo(pink, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", ease: "expo.inOut", duration: 1.4, scrollTrigger: { trigger: sec, start: "top 40%", once: true } });
    ScrollTrigger.create({ trigger: sec, start: "top 24px", once: true, onEnter: () => tl.play() });
    // The last word of the title rolls up one slot every 1.7s to swap
    const words = $$(".g-event__roll span", sec);
    gsap.set(words, { yPercent: (i) => (i ? 100 : 0) });
    let k = 0;
    gsap.delayedCall(1.7, function roll() {
      const a = words[k], b = words[(k + 1) % words.length];
      gsap.fromTo(a, { yPercent: 0 }, { yPercent: -100, duration: 1, ease: "expo.inOut" });
      gsap.fromTo(b, { yPercent: 100 }, { yPercent: 0, duration: 1, ease: "expo.inOut" });
      k = (k + 1) % words.length;
      gsap.delayedCall(1.7, roll);
    });
  };

  // Closing: words rise from below with .6s expo.out at .2 intervals (SplitText stagger style)
  const prefooter = () => {
    if (reduce) return;
    const words = $$(".g-pre__title span");
    gsap.fromTo(words, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.2, delay: 0.2, scrollTrigger: { trigger: ".g-pre", start: "top 65%", once: true } });
  };

  // Section menu: the top-right + button takes the current section’s color, and on press a 550px plate enters from the right at .8s expo.out and
  // Section cell text rises in from y25 after .3s, staggered by .03 (.4s)
  const chapterMenu = () => {
    const menu = $(".g-menu");
    const set = (open) => {
      marker.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      menu.classList.toggle("is-open", open);
      if (open) {
        lenis?.stop();
        gsap.fromTo($$(".g-menu__item > span", menu), { opacity: 0, y: 25 }, { opacity: 1, y: 0, delay: 0.3, stagger: 0.03, duration: reduce ? 0 : 0.4 });
        $(".g-menu__close", menu).focus({ preventScroll: true });
      } else {
        lenis?.start();
      }
    };
    marker.addEventListener("click", () => set(true));
    $(".g-menu__close", menu).addEventListener("click", () => { set(false); marker.focus(); });
    $(".g-menu__shade", menu).addEventListener("click", () => set(false));
    $$("a", menu).forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      set(false);
      const id = a.getAttribute("href");
      if (id === "#top") { lenis ? lenis.scrollTo(0) : scrollTo(0, 0); return; }
      if (state === "intro") toFull();
      const t = $(id);
      if (t) lenis ? lenis.scrollTo(t, { offset: 1 }) : t.scrollIntoView();
    }));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && marker.getAttribute("aria-expanded") === "true") set(false); });
    const zones = $$("[data-thumb]");
    const paint = () => {
      const hit = zones.find((z) => { const r = z.getBoundingClientRect(); return r.top <= 60 && r.bottom >= 60; });
      marker.style.setProperty("--marker", hit ? `var(--site-${hit.dataset.thumb})` : "var(--kf-accent)");
    };
    addEventListener("scroll", paint, { passive: true });
    paint();
  };

  // Section tile links scroll to the section
  $$(".g-tiles__link").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const t = $(a.getAttribute("href"));
    if (t) lenis ? lenis.scrollTo(t, { offset: 1 }) : t.scrollIntoView();
  }));

  window.npSite.scene(() => {
    fit();
    addEventListener("resize", () => { fit(); });
    // Korean fonts load late in pieces by character range — re-fit every time a piece arrives
    document.fonts.addEventListener("loadingdone", () => { fit(); ScrollTrigger.refresh(); });
    startHero();
    clipScene();
    timeline();
    philosophy();
    quote();
    milestones();
    vision();
    events();
    prefooter();
    chapterMenu();
  });
})();
