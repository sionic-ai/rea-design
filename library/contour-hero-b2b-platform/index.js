// Home — loader (first open only), hero scrub, background mouse parallax, client logo crossfade, circle-mask copy, pinned steps, vertical number slider, video buttons.
// Values are taken exactly from the original bundle (runPageOnceAnimation · initHomeHeroScroll · initMouseMove · initTrustedLogos · initCircleMaskHero · initStatSwipers).
AB.page("home", (root, { k }) => {
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const hero = $("[data-home-hero]");
  const tablet = innerWidth <= 991;
  const heading = $("[data-hero-heading]"), revealP = $("[data-hero-reveal-p]"), dots = $("[data-hero-fade]");
  const svgs = $$("[data-hero-svg]");
  const pre = document.querySelector("[data-preloader]");
  const first = AB.firstLoad && pre && !AB.reduced;
  const markReveal = () => { heading.dataset.reveal = "heading"; revealP.dataset.reveal = "paragraph"; dots.dataset.reveal = "fade"; };

  // ── Hero scrub: over 300vh, background 1→1.125 (3), second contour line drawing (1), paragraph words lighting up (sequence total .5), orange dotted line opening left→right (1, after 1) — all linear
  const anchors = $$("[data-hero-anchor]");
  // In the original, dots light up with the scroll position via the site-builder anchor current state (w--current) — switching to the next dot at the .5 · 1.5 points of the hero scrub
  const once = !first && !AB.firstLoad;
  anchors[0]?.classList.add("is-current");
  const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "clamp(top top)", end: "bottom top", scrub: true }, defaults: { ease: "linear" } });
  tl.to($("[data-home-hero-bg]"), { scale: 1.125, duration: 3 });
  const splits = [];
  if (!tablet && !AB.reduced) {
    const swap = (a, b) => gsap.to({}, { duration: 0.01, onComplete: () => (anchors[a]?.classList.remove("is-current"), anchors[b]?.classList.add("is-current")), onReverseComplete: () => (anchors[b]?.classList.remove("is-current"), anchors[a]?.classList.add("is-current")) });
    tl.fromTo(svgs[1].querySelectorAll("path"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1 }, "<");
    tl.add(swap(0, 1), "<.5");
    const ps = $$("[data-hero-p]");
    const s1 = SplitText.create(ps[0], { type: "words" });
    splits.push(s1);
    tl.from(s1.words, { opacity: 0, stagger: { amount: 0.5 } }, once ? "<-.5" : "<");
    tl.fromTo(svgs[2], { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1 }, "<1");
    tl.add(swap(1, 2), "<.5");
    const s2 = SplitText.create(ps[1], { type: "words" });
    splits.push(s2);
    tl.from(s2.words, { opacity: 0, stagger: { amount: 0.5 } }, once ? "<-.5" : "<");
  }
  k.add(() => splits.forEach((s) => s.revert()));
  const STOPS = [0, 0.2, 0.55];
  // In the original, the dot lights first at the press moment (mouse down) (w--current), and the screen slides only after a measured 235ms
  anchors.forEach((a) => k.on(a, "pointerdown", () => anchors.forEach((x) => x.classList.toggle("is-current", x === a))));
  anchors.forEach((a, i) => k.on(a, "click", (e) => {
    e.preventDefault();
    anchors.forEach((x) => x.classList.toggle("is-current", x === a));
    const st = tl.scrollTrigger;
    const y = st ? st.start + (st.end - st.start) * STOPS[i] : 0;
    setTimeout(() => (AB.lenis ? AB.lenis.scrollTo(y) : scrollTo({ top: y, behavior: "smooth" })), 220);
  }));

  // ── Three background layers move opposite the mouse: ±1 from screen center × 10rem × intensity, following with 2s power3 (touch devices excluded)
  if (!("ontouchstart" in window) && !AB.reduced) {
    const max = 10 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const ts = $$("[data-mouse]").map((el) => ({ s: +el.dataset.mouse, x: gsap.quickTo(el, "x", { duration: 2, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 2, ease: "power3" }) }));
    k.on(window, "mousemove", (e) => {
      const nx = (e.clientX / innerWidth - 0.5) * 2, ny = (e.clientY / innerHeight - 0.5) * 2;
      ts.forEach((t) => { t.x(nx * -max * t.s); t.y(ny * -max * t.s); });
    });
  }

  // ── Client logos: when visible, after 1.5s, shuffled cells crossfade with stacked delays of 0.3~0.9s each in 0.5s power2.inOut → once all changed rest 2s and revert → rest 1s and repeat
  const items = $$(".hp-logos__item");
  if (items.length && !AB.reduced) {
    let timers = [], cycle = null, inView = false;
    const pair = (it) => ({ a: it.querySelector(".hp-logos__logo:not(.is-alt)"), b: it.querySelector(".hp-logos__logo.is-alt") });
    const fade = (f, t, done) => { gsap.to(f, { opacity: 0, duration: 0.5, ease: "power2.inOut" }); gsap.to(t, { opacity: 1, duration: 0.5, ease: "power2.inOut", onComplete: done }); };
    const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const clear = () => { timers.forEach(clearTimeout); timers = []; clearTimeout(cycle); };
    const run = (back) => {
      if (!inView) return;
      let done = 0, acc = 0;
      shuffle(items).forEach((it) => {
        const d = acc;
        acc += 0.3 + Math.random() * 0.6;
        timers.push(setTimeout(() => {
          if (!inView) return;
          const { a, b } = pair(it);
          (back ? fade(b, a, next) : fade(a, b, next));
        }, d * 1000));
      });
      function next() { if (++done === items.length) cycle = setTimeout(() => run(!back), back ? 1000 : 2000); }
    };
    const reset = () => { clear(); items.forEach((it) => { const { a, b } = pair(it); gsap.killTweensOf([a, b]); gsap.set(a, { opacity: 1 }); gsap.set(b, { opacity: 0 }); }); };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { inView = true; cycle = setTimeout(() => run(false), 1500); }
      else { inView = false; reset(); }
    }), { threshold: 0.2 });
    io.observe($("[data-trusted-grid]"));
    k.add(() => { io.disconnect(); clear(); });
  }

  // ── Masked sentence: circle radius = Progress × 150% (bottom-center 50% 120%), scrub 1
  const clipWrap = $("[data-clip-hero]"), clipEl = $("[data-clip-text]");
  if (!AB.reduced) {
    const mob = innerWidth < 768;
    clipEl.style.clipPath = "circle(0% at 50% 120%)";
    ScrollTrigger.create({ trigger: clipWrap, start: mob ? "top 95%" : "top 70%", end: mob ? "bottom 90%" : "center center", scrub: 1,
      onUpdate: (self) => (clipEl.style.clipPath = `circle(${self.progress * 150}% at 50% 120%)`) });
  }

  // ── Pinned steps: the text cell nearest the screen center is active, earlier ones are before, later ones are after (screen of later cells hidden)
  const steps = $$("[data-sticky-step]");
  const upd = () => {
    const mid = innerHeight / 2;
    let best = 0, dist = Infinity;
    steps.forEach((s, i) => { const r = s.querySelector("[data-step-anchor]").getBoundingClientRect(); const d = Math.abs(mid - (r.top + r.height / 2)); if (d < dist) { dist = d; best = i; } });
    steps.forEach((s, i) => (s.dataset.status = i < best ? "before" : i > best ? "after" : "active"));
  };
  k.on(window, "scroll", upd, { passive: true });
  k.on(window, "resize", upd);
  requestAnimationFrame(upd);

  // ── Number vertical slider (original initStatSwipers): infinite centered on 5 slots · 0.6s every 2.5s
  const statEl = $("[data-stat-slider]");
  if (statEl && window.Swiper) {
    const speed = 600;
    const paint = (sw) => sw.slides.forEach((sl, i) => {
      const d = Math.abs(i - sw.activeIndex);
      sl.style.opacity = d === 0 ? 1 : d === 1 ? 0.5 : 0.25;
      sl.style.transform = `translateX(${d === 0 ? 0 : d === 1 ? 32 : 64}px)`;
      sl.style.transition = `opacity ${speed}ms ease, transform ${speed}ms ease`;
    });
    const sw = new Swiper(statEl.querySelector(".swiper"), {
      direction: "vertical", loop: true, centeredSlides: true, slidesPerView: 5, speed, allowTouchMove: false,
      autoplay: AB.reduced ? false : { delay: 2500, disableOnInteraction: false },
      navigation: { nextEl: statEl.querySelector("[data-next]"), prevEl: statEl.querySelector("[data-prev]"), disabledClass: "is-disabled" },
      slideActiveClass: "is-active", slideDuplicateActiveClass: "is-active",
      on: {
        init(s) {
          paint(s);
          s.slides.forEach((sl) => sl.addEventListener("click", () => { s.slideToLoop(+sl.dataset.swiperSlideIndex); s.autoplay?.stop(); s.autoplay?.start(); }));
        },
        slideChange: paint,
      },
    });
    statEl.querySelectorAll("[role=button]").forEach((b) => k.on(b, "keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), b.click())));
    k.add(() => sw.destroy(true, true));
  }

  // ── Video panel (original video player states): click to load (the play button vanishes in .3s and a curtain appears) → plays, click again to pause (curtain .3). While playing, hovering brings the button back
  const player = $("[data-player]");
  if (player) {
    let t;
    const set = (s) => (player.dataset.playerStatus = s);
    const toggle = () => {
      clearTimeout(t);
      const s = player.dataset.playerStatus;
      if (s === "playing" || s === "loading") return set("paused");
      // The original moves to the loading state while waiting for the play promise after the press (measured ~.1s)
      t = setTimeout(() => { set("loading"); t = setTimeout(() => set("playing"), 600); }, 40);
    };
    k.on(player, "mouseenter", () => (player.dataset.playerHover = "active"));
    k.on(player, "mouseleave", () => (player.dataset.playerHover = "idle"));
    k.on(player.querySelector("[data-player-control]"), "click", toggle);
    k.on(player, "keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle()));
    k.add(() => clearTimeout(t));
  }

  // Loader (first open only): photo backdrop opens from the bottom (1.5) and the logo opens from the top (1.25 expo.out), closes downward (1.5), then the whole curtain lifts up (1.5) —
  //    contour lines drawn over 5s, head -125%→0 (1.5 expo.out), coordinate lines and crosses 1.75s, title box opens, letters 0.03s apart, top-right panel opens
  if (!first) {
    if (pre) pre.style.display = "none";
    markReveal();
    return {};
  }
  return {
    once: () => new Promise((resolve) => {
      AB.afterHold(run);
      function run() {
      const logo = pre.querySelector("[data-preloader-logo]"), bg = pre.querySelector("[data-preloader-bg]"), bgImg = pre.querySelector("[data-preloader-bg-image]");
      const navBar = document.querySelector("[data-nav-bar]");
      const bl = $("[data-hero-bottom-left]"), tr = $("[data-hero-top-right]");
      let chars = [];
      if (!tablet) {
        const sp = SplitText.create(heading, { type: "chars, words, lines", linesClass: "line-mask", wordsClass: "word-mask", charsClass: "char-mask" });
        k.add(() => sp.revert());
        chars = sp.chars;
      }
      AB.lenis?.stop();
      const ptl = gsap.timeline({
        onStart: () => { if (!tablet) AB.startReveal(); },
        onComplete: () => {
          pre.style.display = "none";
          if (tablet) AB.startReveal();
          gsap.delayedCall(1, markReveal);
          resolve();
        },
      });
      if (tablet) ptl.set(heading, { autoAlpha: 0 });
      ptl.set(logo, { autoAlpha: 1 }, 0).set(bg, { autoAlpha: 1 }, "<");
      if (chars.length) ptl.set(chars, { opacity: 0, overwrite: true }, "<");
      ptl.from(bgImg, { scale: 1.125, duration: 3, ease: "linear" })
        .fromTo(bg, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", scale: 1.1 }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.5, scale: 1 }, "<")
        .fromTo(logo, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", scale: 1.1 }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", scale: 1, duration: 1.25, ease: "expo.out" }, "<.5")
        .to(logo, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", scale: 1.1, duration: 1.5 }, ">")
        .fromTo(pre, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", duration: 1.5 }, "<")
        .from($("[data-home-hero-bg]"), { scale: 1.25, duration: 2.75, ease: "expo.out" }, "<")
        .fromTo(svgs[0].querySelectorAll("path"), { drawSVG: "0%" }, { drawSVG: "100%,", duration: 5, ease: "power3.out" }, "<.25");
      if (tablet) {
        ptl.fromTo(svgs[1].querySelectorAll("path"), { drawSVG: "0%" }, { drawSVG: "100%,", duration: 5, ease: "power3.out" }, "<")
          .fromTo(svgs[2], { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 5, ease: "power3.out" }, "<");
      }
      const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      if (!(tablet && touch)) ptl.from(navBar, { yPercent: -125, duration: 1.5, ease: "expo.out", onComplete: () => gsap.killTweensOf(navBar) }, "<1");
      ptl.from($("[data-hero-hline]"), { top: "100%", duration: 1.75 }, tablet ? "<-1" : "<")
        .from($("[data-hero-vline]"), { right: "-60%", duration: 1.75 }, "<");
      if (!tablet) ptl.from($("[data-hero-cross]"), { right: "-65%", duration: 1.75 }, "<");
      ptl.fromTo(bl, { clipPath: tablet ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" : "polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.5 }, "<.75");
      if (!tablet) {
        ptl.to(chars, { opacity: 1, duration: 0.5, stagger: { each: 0.03, from: "start" }, ease: "none" }, "<.5")
          .set(heading, { opacity: 1 }, "<").to(revealP, { opacity: 1 }, "<").to(dots, { opacity: 1 }, "<");
      } else {
        ptl.to(heading, { autoAlpha: 1, duration: 1, ease: "none" }, "<1")
          .from($("[data-hero-mobile-p]"), { autoAlpha: 0, scale: 0.9, duration: 1, ease: "power2.out" }, "<.125");
      }
      ptl.fromTo(tr, { clipPath: "polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.5 }, "<");
      ptl.call(() => { scrollTo(0, 0); AB.lenis?.resize(); AB.lenis?.start(); }, null, 0);
      }
    }),
  };
});
