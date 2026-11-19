// Motion for the whole site — the scripts embedded in each original Webflow page (loader · first entrance · transition · scroll reveal · hover roll · cursor · phone menu · video · Contact window · 3D) rewritten with the same values.
// The section progress line (section-progress-nav) · top menu fill (rise-fill-hover) · bottom footer logo (wheel-pull-footer) are handled by _fx motion parts.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, ScrollToPlugin);
  const blog = document.body.dataset.motion === "blog";
  const EASE_MENU = CustomEase.create("menuEase", "M0,0 C0.82,0 0.18,1 1,1");
  // In the original the loader makes lineEase .85,0,.15,1 and then the scroll-reveal script remakes the same name — on the first page the later one (.9,.01,.19,1) remains
  CustomEase.create("lineEase", blog ? "0.85, 0, 0.15, 1" : "0.9, 0.01, 0.19, 1");
  // The original’s mainEase is never created anywhere, so it runs on the GSAP default curve (power1.out) — rechecked on the same gsap build: progress .25 → .438 · .5 → .75
  const MAIN_EASE = "power1.out";
  const PUSH = 200;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const kf = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onLoad = (fn) => (document.readyState === "complete" ? fn() : addEventListener("load", fn, { once: true }));

  if (history.scrollRestoration) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  // ── Lenis: duration 1.8 · lerp .05, tied to the GSAP tempo with lagSmoothing off ──
  if (typeof Lenis !== "undefined" && !reduce) {
    const lenis = new Lenis({ duration: 1.8, lerp: 0.05, wheelMultiplier: 1, autoRaf: false, autoToggle: false, anchors: true, allowNestedScroll: true, naiveDimensions: true, stopInertiaOnNavigate: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  const overlay = $(".mc-loader__veil");
  const pageWrapper = $("[data-scroll-container]") || $("main") || document.body;
  const stickyEls = [$(".mc-topnav"), $(".mc-logo")].filter(Boolean);

  // Line split + mask — puts the original SplitText lines into a clip-path inset(0 0 −.3em 0) box
  function splitLines(el) {
    const split = new SplitText(el, { type: "lines" });
    return split.lines.map((line) => {
      const mask = document.createElement("span");
      mask.className = "mc-split-mask";
      const inner = document.createElement("span");
      inner.className = "mc-split-in";
      inner.innerHTML = line.innerHTML;
      mask.appendChild(inner);
      line.innerHTML = "";
      line.appendChild(mask);
      return inner;
    });
  }
  const clipKids = (el) => [...el.children].filter((c) => c.offsetHeight && getComputedStyle(c).visibility !== "hidden");

  // ── Logo: our own Lottie (lottie-web) — four letters fully upright at frame 0 collapse in turn around their bottom edge and stand back up over 31 frames (60fps). The loader plays this forward·in reverse ──
  function logoData() {
    const E = { o: { x: [0.33], y: [0] }, i: { x: [0.15], y: [1] } };
    const rect = (x, y, w, h) => ({ ty: "rc", d: 1, s: { a: 0, k: [w, h] }, p: { a: 0, k: [x + w / 2, y + h / 2] }, r: { a: 0, k: 0 } });
    const ring = (x) => [rect(x, 0, 290, 290), rect(x + 56, 56, 178, 178)];
    const glyphs = [[rect(0, 0, 56, 290), rect(0, 234, 290, 56)], ring(348), [...ring(696), rect(841, 145, 89, 50)], ring(1044)];
    const layers = glyphs.map((shapes, i) => {
      const cx = [145, 493, 841, 1189][i];
      const t0 = i * 4;
      return {
        ddd: 0, ind: i + 1, ty: 4, nm: `g${i}`, sr: 1, ao: 0, ip: 0, op: 31, st: 0, bm: 0,
        ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [cx, 290, 0] }, a: { a: 0, k: [cx, 290, 0] },
          s: { a: 1, k: [{ t: t0, s: [100, 100, 100], ...E }, { t: t0 + 9, s: [100, 0, 100], ...E }, { t: t0 + 18, s: [100, 100, 100] }] } },
        shapes: [{ ty: "gr", nm: "g", it: [...shapes, { ty: "fl", c: { a: 0, k: [0, 0, 0, 1] }, o: { a: 0, k: 100 }, r: 2 },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }] }],
      };
    });
    return { v: "5.12.2", fr: 60, ip: 0, op: 31, w: 1336, h: 290, nm: "logo", ddd: 0, assets: [], layers };
  }
  const logoBox = $(".mc-logo");
  const lottieEl = $(".mc-logo__lottie");
  const logoAnim = lottieEl && typeof lottie !== "undefined"
    ? lottie.loadAnimation({ container: lottieEl, renderer: "svg", loop: false, autoplay: false, animationData: logoData(), rendererSettings: { preserveAspectRatio: "xMinYMid meet" } })
    : null;
  logoAnim?.goToAndStop(0, true);

  // ── First entrance (original runInAnimations — once on load): headline 120% below · icon · mask lift · text list · horizontal line ──
  function runInAnimations() {
    const nameB = $$("[data-in-name]");
    if (nameB.length) { gsap.set(nameB, { yPercent: 120 }); gsap.to(nameB, { yPercent: 0, duration: 1, ease: "expo.out", stagger: { each: 0.08 } }); }
    const icons = $$("[data-in-icon]");
    if (icons.length) { gsap.set(icons, { yPercent: 120 }); gsap.to(icons, { yPercent: 0, duration: 1, ease: "expo.out", stagger: { each: 0.05 } }); }
    const masks = $$("[data-in-mask]");
    if (masks.length) { gsap.set(masks, { height: "100%" }); gsap.to(masks, { height: "0%", duration: 1.2, ease: "power2.inOut", stagger: { each: 0.1 }, delay: 0.1 }); }
    const lists = $$("[data-in-list]");
    if (lists.length) { gsap.set(lists, { yPercent: 120 }); gsap.to(lists, { yPercent: 0, duration: 1.2, ease: "expo.out", delay: 0.2 }); }
    const lines = $$("[data-pre-line-h]");
    if (lines.length) { gsap.set(lines, { scaleX: 0 }); gsap.to(lines, { scaleX: 1, duration: 1, ease: "expo.out", delay: 0.3, onComplete: () => gsap.set(lines, { clearProps: "transform" }) }); }
  }
  if (reduce) { if (overlay) overlay.style.display = "none"; } else onLoad(runInAnimations);

  // ── Loader (original preloader): on first open of the first page, a bar runs 3.8s · number 00→100 · the logo rises from below and spins front to back, then the logo cell folds away and the curtain fades.
  //    For sub-sections or when returning from them, the covering curtain exits upward and the section settles down from −200px ──
  function preloader() {
    const home = document.body.dataset.page === "home";
    const last = sessionStorage.getItem("mcLastPage");
    const full = home && !(last && last !== "home");
    sessionStorage.setItem("mcLastPage", document.body.dataset.page || "");
    const fill = $(".mc-loader__fill"), counter = $(".mc-loader__num");
    const countItems = $$(".mc-loader__count > *");
    const nameEl = $("[data-pre-name]");
    if (!overlay || reduce) return;
    window.lenis?.stop();
    gsap.set(overlay, { opacity: 1, display: "block", zIndex: 100 });
    if (lottieEl) gsap.set(lottieEl, { yPercent: 100 });
    gsap.set(".mc-cta", { height: 0, overflow: "hidden" });
    gsap.set(".mc-cta .mc-cta__label", { y: "3rem" });
    gsap.set(".mc-cta .is-h", { scaleX: 0 });
    gsap.set(".mc-cta .is-v", { scaleY: 0 });
    if (full) {
      gsap.set(fill, { width: "0%" });
      if (logoBox) gsap.set(logoBox, { width: "26.875rem", height: "5.75rem" });
    } else {
      gsap.set(".mc-loader__count, .mc-loader__track", { display: "none" });
      gsap.set(overlay, { y: 0 });
      gsap.set(pageWrapper, { y: -PUSH });
      gsap.set(stickyEls, { y: -PUSH });
    }
    const nameLines = nameEl ? splitLines(nameEl) : [];
    if (nameLines.length) gsap.set(nameLines, { yPercent: 150 });

    let pageLoaded = false, seqDone = false, barDone = false;
    let clipItems = [], heightItems = [], lineV = [], lineH = [];
    // In the original, on wide screens this script runs before the Webflow Lottie registration and can’t find the logo Lottie (only at phone width does it keep looking until it’s found) —
    // So on desktop the logo doesn’t spin and closes with no wait. The copy follows that actual behavior too
    const lottieLive = innerWidth <= 991;
    const play = (dir, done) => {
      if (!logoAnim || !lottieLive) return done();
      logoAnim.setDirection(dir);
      logoAnim.setSpeed(1);
      logoAnim.goToAndPlay(dir > 0 ? 0 : logoAnim.totalFrames - 1, true);
      const h = () => { logoAnim.removeEventListener("complete", h); done(); };
      logoAnim.addEventListener("complete", h);
    };
    onLoad(() => {
      $$("[data-pre-clip]").forEach((el) => {
        if (!full && el.hasAttribute("data-pre-nav")) return;
        clipKids(el).forEach((c) => { el.style.overflow = "hidden"; clipItems.push(c); });
      });
      if (clipItems.length) gsap.set(clipItems, { yPercent: 150 });
      heightItems = $$("[data-pre-height]");
      if (heightItems.length) { gsap.killTweensOf(heightItems); gsap.set(heightItems, { height: 0, overflow: "hidden" }); }
      lineV = $$("[data-pre-line-v]");
      if (lineV.length) gsap.set(lineV, { scaleY: 0 });
      lineH = $$("[data-pre-line-h]");
      if (lineH.length) gsap.set(lineH, { scaleX: 0 });
      pageLoaded = true;
      close();
    });
    if (full) {
      gsap.to(fill, { width: "100%", duration: 3.8, ease: "power2.inOut",
        onUpdate() { const p = Math.round(this.progress() * 100); counter.textContent = (p < 10 ? "0" : "") + p; },
        onComplete() { counter.textContent = "100"; barDone = true; close(); } });
      const loop = () => play(1, () => play(-1, () => (pageLoaded ? gsap.delayedCall(0.55, () => { seqDone = true; close(); }) : lottieLive ? loop() : onLoad(() => gsap.delayedCall(0.55, () => { seqDone = true; close(); })))));
      gsap.delayedCall(0.5, () => gsap.to(lottieEl, { yPercent: 0, duration: 1, ease: "power2.inOut", onComplete: () => gsap.delayedCall(0.25, loop) }));
    } else {
      barDone = true;
      gsap.delayedCall(0.3, () => { gsap.set(lottieEl, { yPercent: 0 }); play(1, () => play(-1, () => { seqDone = true; close(); })); });
    }

    function close() {
      if (!pageLoaded || !seqDone || !barDone) return;
      const tl = gsap.timeline();
      if (full) {
        tl.to(countItems, { y: "2rem", opacity: 0, duration: 0.3, ease: "power2.inOut" }, 0);
        if (logoBox) tl.to(logoBox, { width: "7.375rem", height: "1.625rem", duration: 1, ease: "power2.inOut" }, 0);
        tl.to(overlay, { opacity: 0, duration: 0.3, ease: "power2.inOut", onComplete: () => gsap.set(overlay, { display: "none" }) }, 0.15);
      } else {
        tl.to(overlay, { y: "-100%", duration: 0.9, ease: EASE_MENU, onComplete: () => gsap.set(overlay, { display: "none", y: "100%" }) }, 0.15);
        tl.to(pageWrapper, { y: 0, duration: 1.2, ease: EASE_MENU, overwrite: true, onComplete: () => { gsap.set(pageWrapper, { clearProps: "transform" }); ScrollTrigger.refresh(); } }, 0.15);
        tl.to(stickyEls, { y: 0, duration: 1.2, ease: EASE_MENU, overwrite: true }, 0.15);
      }
      tl.call(() => {
        window.lenis?.start();
        const top = nameEl ? nameEl.getBoundingClientRect().top : innerHeight;
        const base = nameEl && top < innerHeight ? (scrollY / innerHeight) * 0.4 : 0;
        if (nameLines.length) gsap.to(nameLines, { yPercent: 0, duration: 1.6, ease: "expo.out", stagger: { each: 0.1 }, delay: base });
        let next = base + nameLines.length * 0.1;
        if (clipItems.length) {
          gsap.to(clipItems, { yPercent: 0, duration: 1.6, ease: "expo.out", stagger: { each: 0.1 }, delay: next, onComplete: () => $$("[data-pre-clip]").forEach((el) => (el.style.overflow = "")) });
          next += clipItems.length * 0.1;
        }
        if (heightItems.length) {
          gsap.killTweensOf(heightItems);
          gsap.to(heightItems, { height: "auto", duration: 1.6, ease: "expo.out", stagger: { each: 0.1 }, delay: next, onComplete: () => gsap.set(heightItems, { clearProps: "height,overflow" }) });
          next += heightItems.length * 0.1;
        }
        const lineDelay = next + 0.05 + (heightItems.length > 1 ? (heightItems.length - 1) * 0.1 : 0);
        if (lineV.length) gsap.to(lineV, { scaleY: 1, duration: 1.6, ease: "lineEase", delay: lineDelay, onComplete: () => gsap.set(lineV, { clearProps: "transform" }) });
        if (lineH.length) gsap.to(lineH, { scaleX: 1, duration: 1.2, ease: "lineEase", delay: lineDelay, onComplete: () => gsap.set(lineH, { clearProps: "transform" }) });
        const r = gsap.timeline();
        r.to(".mc-cta", { height: "auto", duration: 1.2, ease: "power2.inOut", stagger: { each: 0.06 }, onComplete: () => gsap.set(".mc-cta", { clearProps: "height,overflow" }) }, 0);
        r.to(".mc-cta .mc-cta__label", { y: 0, duration: 1.2, ease: "power2.inOut", stagger: { each: 0.06 } }, "<");
        r.to(".mc-cta .is-h", { scaleX: 1, duration: 1.2, ease: "power2.inOut", stagger: { each: 0.06 } }, "<");
        r.to(".mc-cta .is-v", { scaleY: 1, duration: 1.2, ease: "power2.inOut", stagger: { each: 0.06 } }, "<");
      }, null, 0.5);
    }
  }
  preloader();

  // ── Transition: clicking a same-site link raises the next section’s background-color curtain from below in .9s menuEase (after .15s) and
  //    The current section and fixed elements are pushed up 200px over 1.2s. The next page loads .3s after the curtain fully covers — the original script’s blur curtain (.4s) does not run because that element is not on the page ──
  // Curtain in the same color as the next page’s background — first page is fog, post list is sand, others use the base color (color values in css data-tone)
  const toneFor = (path) => (/index\.html$|\/$/.test(path) ? "surface" : /news\.html$/.test(path) ? "sand" : "bg");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || reduce) return;
    const href = a.getAttribute("href");
    if (!href || a.hostname !== location.hostname || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || a.target === "_blank" || a.hasAttribute("data-no-veil")) return;
    e.preventDefault();
    window._isPageTransitioning = true;
    window.lenis?.stop();
    window.lenis?.scrollTo(0, { immediate: true });
    const path = new URL(href, location.href).pathname;
    overlay.dataset.tone = toneFor(path);
    gsap.set(overlay, { display: "block", opacity: 1, y: "100%" });
    gsap.to(overlay, { y: 0, duration: 0.9, ease: EASE_MENU, delay: 0.15, onComplete: () => gsap.delayedCall(0.3, () => { location.href = href; }) });
    gsap.to(pageWrapper, { y: -PUSH, duration: 1.2, ease: EASE_MENU, overwrite: true });
    gsap.fromTo(stickyEls, { y: 0 }, { y: -PUSH, duration: 1.2, ease: EASE_MENU, overwrite: true });
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    gsap.set(overlay, { display: "none", opacity: 0, y: "100%" });
    gsap.set(pageWrapper, { y: 0 });
    gsap.set(stickyEls, { y: 0 });
    window._isPageTransitioning = false;
    window.lenis?.start();
    runInAnimations();
  });

  // ── Scroll entrance: big title · small title · block · metric table lines · thin lines. They rise when on screen and hide again when scrolled back up ──
  const DUR_TEXT = 2, DUR_SMALL = blog ? 3.5 : 0.8, DUR_LINE = blog ? 1.6 : 1.2, STAG = 0.1, WAVE = 0.06;
  function initScroll() {
    const both = (trigger, play, back, start = "top bottom") => ScrollTrigger.create({ trigger, start, end: "bottom top", onEnter: play, onLeaveBack: back });
    $$("[data-scroll-name]").forEach((el) => {
      const lines = splitLines(el);
      gsap.set(lines, { yPercent: 150 });
      both(el, () => { gsap.killTweensOf(lines); gsap.to(lines, { yPercent: 0, duration: DUR_TEXT, ease: "expo.out", stagger: { each: STAG } }); },
        () => { gsap.killTweensOf(lines); gsap.to(lines, { yPercent: 150, duration: DUR_TEXT * 0.6, ease: "power2.inOut", stagger: { each: STAG, from: "end" } }); });
    });
    $$("[data-scroll-small]").forEach((el) => {
      const lines = splitLines(el);
      gsap.set(lines, { yPercent: 150 });
      both(el, () => { gsap.killTweensOf(lines); gsap.to(lines, { yPercent: 0, duration: DUR_SMALL, ease: "expo.out", stagger: { each: STAG } }); },
        () => { gsap.killTweensOf(lines); gsap.to(lines, { yPercent: 150, duration: DUR_SMALL * 0.6, ease: "power2.inOut", stagger: { each: STAG, from: "end" } }); },
        blog ? "top 90%" : "top 95%");
    });
    $$("[data-scroll-clip]").forEach((el) => {
      const items = clipKids(el);
      if (!items.length) return;
      el.style.overflow = "hidden";
      gsap.set(items, { yPercent: 150 });
      both(el, () => { gsap.killTweensOf(items); gsap.to(items, { yPercent: 0, duration: DUR_TEXT, ease: "expo.out", stagger: { each: STAG }, onComplete: () => (el.style.overflow = "") }); },
        () => { gsap.killTweensOf(items); el.style.overflow = "hidden"; gsap.to(items, { yPercent: 150, duration: DUR_TEXT * 0.6, ease: "power2.inOut", stagger: { each: STAG, from: "end" } }); });
    });
    $$("[data-line-box]").forEach((box) => {
      const lines = $$("[data-line]", box);
      if (!lines.length) return;
      const names = blog ? [] : $$("[data-line-name]", box).flatMap(splitLines);
      gsap.set(lines, { scaleX: 0 });
      if (names.length) gsap.set(names, { yPercent: 150 });
      ScrollTrigger.create({
        trigger: box, start: blog ? "top bottom" : "top 90%", end: "bottom top",
        onEnter() {
          gsap.killTweensOf(lines);
          gsap.to(lines, { scaleX: 1, duration: DUR_LINE, ease: "lineEase" });
          if (names.length) { gsap.killTweensOf(names); gsap.to(names, { yPercent: 0, duration: DUR_SMALL, ease: "expo.out", stagger: { each: WAVE } }); }
        },
        onLeaveBack() {
          gsap.killTweensOf(lines);
          gsap.to(lines, { scaleX: 0, duration: DUR_LINE * 0.5, ease: "lineEase" });
          if (names.length) { gsap.killTweensOf(names); gsap.to(names, { yPercent: 150, duration: DUR_SMALL * 0.6, ease: "power2.inOut", stagger: { each: WAVE, from: "end" } }); }
        },
      });
    });
    $$("[data-scroll-line]").forEach((el) => {
      gsap.set(el, { scaleX: 0 });
      both(el, () => { gsap.killTweensOf(el); gsap.to(el, { scaleX: 1, duration: DUR_LINE, ease: "lineEase" }); },
        () => { gsap.killTweensOf(el); gsap.to(el, { scaleX: 0, duration: DUR_LINE * 0.5, ease: "lineEase" }); }, "top 95%");
    });
    // Top row menu: fills the current section cell (the original site builder’s section anchor w--current)
    $$(".mc-toplink[data-section]").forEach((a) => {
      const sec = $(a.dataset.section);
      if (sec) ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center", onToggle: (s) => (s.isActive ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")) });
    });
    // In the Team section the background turns one step deeper, like fog
    $$("[data-tone='raised']").forEach((sec) => ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center", onToggle: (s) => document.body.classList.toggle("is-tone-raised", s.isActive) }));
  }
  if (!reduce) onLoad(initScroll);

  // ── Row text roll: hovering a row rolls the text inside (data-roll) up one line (−100%) over .45s at .1s intervals until the clone settles in place. On release it rolls back from the end ──
  function initRoll(el, ease) {
    $$("[data-roll]", el).forEach((it) => { const c = it.cloneNode(true); c.setAttribute("aria-hidden", "true"); it.parentNode.appendChild(c); });
    const groups = [...new Set($$("[data-roll]", el).map((it) => it.parentNode))].map((p) => $$(":scope > [data-roll]", p));
    if (!groups.length) return;
    el.addEventListener("mouseenter", () => groups.forEach((g) => { gsap.killTweensOf(g); gsap.to(g, { yPercent: -100, duration: 0.45, ease, stagger: { each: 0.1 } }); }));
    el.addEventListener("mouseleave", () => groups.forEach((g) => { gsap.killTweensOf(g); gsap.to(g, { yPercent: 0, duration: 0.45, ease, stagger: { each: 0.1, from: "end" } }); }));
  }
  onLoad(() => {
    $$(".mc-navi [data-fx-part='row'], .mc-navi .is-main").forEach((el) => initRoll(el, "power2.inOut"));
    $$("[data-roll-host]").forEach((el) => initRoll(el, MAIN_EASE));
  });

  // ── Cursor: an 8px square follows by 14% of the remaining distance each frame, and switches in .2s to a hand over links and an arrow over [data-hover-arrow] ──
  const cursors = $$(".mc-cursor__dot, .mc-cursor__hand, .mc-cursor__arrow");
  if (cursors.length && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const hand = $(".mc-cursor__hand"), arrow = $(".mc-cursor__arrow"), dot = $(".mc-cursor__dot");
    const SEL = "a, button, [href], .hoverable, input, textarea";
    gsap.set([hand, arrow], { opacity: 0 });
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("[data-hover-arrow]")) { gsap.to(arrow, { opacity: 1, duration: 0.2, ease: MAIN_EASE }); gsap.to([hand, dot], { opacity: 0, duration: 0.2, ease: MAIN_EASE }); }
      else if (e.target.closest(SEL)) { gsap.to(hand, { opacity: 1, duration: 0.2, ease: MAIN_EASE }); gsap.to([arrow, dot], { opacity: 0, duration: 0.2, ease: MAIN_EASE }); }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("[data-hover-arrow]") || e.target.closest(SEL)) { gsap.to([hand, arrow], { opacity: 0, duration: 0.2, ease: MAIN_EASE }); gsap.to(dot, { opacity: 1, duration: 0.2, ease: MAIN_EASE }); }
    });
    const mouse = { x: -200, y: -200 }, spring = { x: -200, y: -200 };
    let entered = false;
    document.addEventListener("mousemove", (e) => {
      if (!entered) { entered = true; mouse.x = spring.x = e.clientX; mouse.y = spring.y = e.clientY; return; }
      mouse.x = e.clientX; mouse.y = e.clientY;
    });
    document.addEventListener("mouseleave", () => { entered = false; });
    const tick = () => {
      spring.x += (mouse.x - spring.x) * 0.14;
      spring.y += (mouse.y - spring.y) * 0.14;
      const t = `translate3d(${spring.x - innerWidth / 2}px, ${spring.y - innerHeight / 2}px, 0px)`;
      cursors.forEach((c) => (c.style.transform = t));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Phone menu: only change data-status, the motion is css ──
  const mnav = $(".mc-mnav");
  if (mnav) {
    const setNav = (on) => mnav.setAttribute("data-status", on ? "active" : "not-active");
    $$("[data-mnav-toggle]").forEach((b) => b.addEventListener("click", () => setNav(mnav.getAttribute("data-status") !== "active")));
    addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });
    mnav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  }

  // ── Video: plays when 5% is on screen, pauses when it leaves ──
  $$(".mc-viewport-video").forEach((w) => {
    const v = $("video", w);
    if (!v) return;
    new IntersectionObserver((es) => es.forEach((x) => (x.isIntersecting ? v.play().catch(() => {}) : v.pause())), { threshold: 0.05 }).observe(w);
  });

  // ── 3D logo: our shape (a square frame hollow in the middle + an inner block) viewed from an orthographic camera at (5,5,5). Faces are translucent, edges are lines ──
  function makeMark(THREE, faceColor, faceOpacity, edgeColor) {
    const group = new THREE.Group();
    const s = new THREE.Shape();
    s.moveTo(-0.5, -0.5); s.lineTo(0.5, -0.5); s.lineTo(0.5, 0.5); s.lineTo(-0.5, 0.5); s.lineTo(-0.5, -0.5);
    const hole = new THREE.Path();
    hole.moveTo(-0.28, -0.28); hole.lineTo(-0.28, 0.28); hole.lineTo(0.28, 0.28); hole.lineTo(0.28, -0.28); hole.lineTo(-0.28, -0.28);
    s.holes.push(hole);
    const parts = [
      [new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: false }), [0, 0, -0.11]],
      [new THREE.BoxGeometry(0.34, 0.12, 0.34), [0, 0.06, 0]],
      [new THREE.BoxGeometry(0.12, 0.42, 0.12), [0.32, 0.21, 0.32]],
    ];
    const face = new THREE.MeshBasicMaterial({ color: new THREE.Color(faceColor), transparent: true, opacity: faceOpacity, side: THREE.DoubleSide, depthWrite: false });
    const edge = new THREE.LineBasicMaterial({ color: new THREE.Color(edgeColor) });
    parts.forEach(([g, p], i) => {
      if (i === 0) g.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(g, face);
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(g, 20), edge);
      m.position.set(...p); l.position.set(...p);
      group.add(m, l);
    });
    return group;
  }
  function frameOf(THREE, model) {
    const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    const norm = 1 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(norm * 1.8);
    model.position.sub(center.multiplyScalar(norm * 1.8));
    const s2 = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    return Math.max(Math.sqrt(s2.x * s2.x + s2.z * s2.z), s2.y) * 1.35;
  }

  // Sidebar logo: a half turn while passing the hero (scrub 2), and dragging tilts it up to 25° with a spring (stiffness 80 · damping 14) and it returns when released
  function initSideModel() {
    // Like the original, wide screens mount the same canvas in the sidebar slot, and below 991 it moves to the slot under the hero
    const side = $("[data-three-side]"), phone = $("[data-three-mobile]");
    if (!side || typeof THREE === "undefined") return;
    const hostFor = () => (innerWidth <= 991 && phone ? phone : side);
    let host = hostFor();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    const model = makeMark(THREE, kf("--kf-bg"), 0.7, kf("--kf-ink"));
    const pivot = new THREE.Group();
    pivot.add(model);
    const frustum = frameOf(THREE, model);
    scene.add(pivot);
    const fit = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      const a = w / h;
      if (a < 1) { camera.left = -frustum / 2; camera.right = frustum / 2; camera.top = frustum / (2 * a); camera.bottom = -frustum / (2 * a); }
      else { camera.left = -frustum * a / 2; camera.right = frustum * a / 2; camera.top = frustum / 2; camera.bottom = -frustum / 2; }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    fit();
    const ro = new ResizeObserver(fit);
    [side, phone].filter(Boolean).forEach((h) => ro.observe(h));
    addEventListener("resize", () => { const next = hostFor(); if (next !== host) { host = next; host.appendChild(renderer.domElement); fit(); } });
    const rot = { y: 0 };
    const hero = $("[data-three-spin]");
    if (hero && !reduce) gsap.to(rot, { y: Math.PI, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom 10%", scrub: 2 } });
    const MAX = THREE.MathUtils.degToRad(25), K = 80, D = 14, SENS = 0.006;
    let drag = false;
    const start = { x: 0, y: 0 }, base = { x: 0, y: 0 }, goal = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
    const clampT = (v) => THREE.MathUtils.clamp(v, -MAX, MAX);
    const down = (x, y, t) => { if (!host.contains(t)) return; drag = true; start.x = x; start.y = y; base.x = cur.x; base.y = cur.y; vel.x = vel.y = 0; };
    const move = (x, y) => { if (!drag) return; goal.x = clampT(base.x + (y - start.y) * SENS); goal.y = clampT(base.y + (x - start.x) * SENS); };
    const up = () => { drag = false; goal.x = goal.y = 0; };
    addEventListener("mousedown", (e) => down(e.clientX, e.clientY, e.target));
    addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
    addEventListener("mouseup", up);
    addEventListener("touchstart", (e) => down(e.touches[0].clientX, e.touches[0].clientY, e.target), { passive: true });
    addEventListener("touchmove", (e) => move(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    addEventListener("touchend", up);
    let last = 0;
    const frame = (now = 0) => {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      for (const k of ["x", "y"]) { vel[k] += ((goal[k] - cur[k]) * K - vel[k] * D) * dt; cur[k] += vel[k] * dt; }
      pivot.rotation.order = "YXZ";
      pivot.rotation.y = rot.y + cur.y;
      pivot.rotation.x = cur.x;
      renderer.render(scene, camera);
    };
    frame();
  }
  initSideModel();

  // ── Sidebar collapse (original Webflow interaction — values measured on screen): on the hero, the 3D cell pushes the list below the screen, then
  //    Over the first two screens it collapses to height 0 so the list rises under the logo, and in the Contact area the isometric illustration below is revealed ──
  function initSidebar() {
    const model = $("[data-three-side]"), foot = $(".mc-side__foot");
    if (!model || reduce) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      const room = () => { const inner = model.parentElement, nav = $(".mc-navi", inner); return Math.max(0, innerHeight - 56 - 26 - 60 - (nav?.offsetHeight || 0)); };
      gsap.fromTo(model, { height: room }, { height: 0, ease: "power2.out", immediateRender: true, scrollTrigger: { trigger: document.body, start: "top top", end: () => "+=" + innerHeight * 2.4, scrub: true, invalidateOnRefresh: true } });
      if (foot) {
        gsap.set(foot, { clipPath: "inset(100% 0% 0% 0%)" });
        ScrollTrigger.create({ trigger: "#contact", start: "top center", onEnter: () => gsap.to(foot, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "lineEase" }), onLeaveBack: () => gsap.to(foot, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.6, ease: "lineEase" }) });
      }
    });
  }
  onLoad(initSidebar);

  // ── Contact window: blur backdrop .4s, purple panel .9s (after .15s), 3D logo panel .9s (after .25s), body −200px 1.2s, then title line · fields · vertical line · close in order ──
  function initModal() {
    const modal = $(".mc-modal");
    if (!modal) return;
    const bg = $(".mc-modal__bg", modal), mFader = $(".mc-modal__fader", modal), pop = $(".mc-modal__model", modal), wrap = $(".mc-modal__wrap", modal);
    const closeBtn = $(".mc-modal__close", modal), host = $(".mc-modal__three", modal);
    gsap.set(modal, { display: "none", opacity: 0, pointerEvents: "none" });
    gsap.set(mFader, { opacity: 0 });
    gsap.set(bg, { y: "100%" });
    gsap.set(pop, { y: "100%", opacity: 0 });
    let open = false, ready = false, names = [], clips = [], lines = [];
    let renderer = null, scene, camera, model, spin = 0;
    const setup = () => {
      if (ready) return;
      ready = true;
      $$("[data-contact-name]", modal).forEach((el) => names.push(...splitLines(el)));
      gsap.set(names, { yPercent: 150 });
      $$("[data-contact-clip]", modal).forEach((el) => clipKids(el).forEach((c) => { el.style.overflow = "hidden"; clips.push(c); }));
      if (clips.length) gsap.set(clips, { yPercent: 150 });
      lines = $$("[data-contact-line]", modal);
      if (lines.length) gsap.set(lines, { scaleY: 0 });
      gsap.set(closeBtn, { opacity: 0, x: "3rem" });
    };
    const three = () => {
      if (renderer || typeof THREE === "undefined" || !host) return;
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return requestAnimationFrame(three);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(w, h, false);
      host.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      const a = w / h;
      camera = new THREE.OrthographicCamera(-2 * a, 2 * a, 2, -2, -100, 100);
      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);
      model = new THREE.Group();
      const mark = makeMark(THREE, kf("--kf-accent"), 0.75, kf("--kf-accent-soft"));
      frameOf(THREE, mark);
      model.add(mark);
      scene.add(model);
      spin = -Math.PI / 3;
      gsap.to({ y: spin }, { y: 0, duration: 2.4, ease: "power3.out", onUpdate() { spin = this.targets()[0].y; } });
      const loop = () => { requestAnimationFrame(loop); spin += 0.0045; model.rotation.y = spin; renderer.render(scene, camera); };
      loop();
    };
    const show = () => {
      if (open) return;
      open = true;
      window.lenis?.stop();
      gsap.set(modal, { display: "block", opacity: 1, pointerEvents: "auto" });
      setup();
      requestAnimationFrame(three);
      gsap.to(mFader, { opacity: 1, duration: 0.4, ease: "power2.inOut" });
      gsap.to(bg, { y: 0, duration: 0.9, ease: EASE_MENU, delay: 0.15 });
      gsap.to(pop, { y: 0, opacity: 1, duration: 0.9, ease: EASE_MENU, delay: 0.25 });
      gsap.to(pageWrapper, { y: -PUSH, duration: 1.2, ease: EASE_MENU, overwrite: true, onStart: () => window.lenis?.scrollTo(0, { immediate: true }) });
      gsap.fromTo(stickyEls, { y: 0 }, { y: -PUSH, duration: 1.2, ease: EASE_MENU, overwrite: true });
      const nameDelay = 0.25 + 0.9 * 0.4;
      if (names.length) gsap.to(names, { yPercent: 0, duration: 1, ease: EASE_MENU, stagger: { each: 0.08 }, delay: nameDelay });
      const rest = { duration: 1, ease: EASE_MENU, delay: nameDelay + names.length * 0.08 + 0.1 };
      if (clips.length) gsap.to(clips, { yPercent: 0, ...rest, onComplete: () => $$("[data-contact-clip]", modal).forEach((el) => (el.style.overflow = "")) });
      if (lines.length) gsap.to(lines, { scaleY: 1, ...rest });
      gsap.to(closeBtn, { x: 0, opacity: 1, ...rest });
    };
    const hide = () => {
      if (!open) return;
      open = false;
      gsap.to([wrap, bg], { y: "100%", duration: 0.9, ease: EASE_MENU });
      gsap.to(pageWrapper, { y: 0, duration: 1.2, ease: EASE_MENU, overwrite: true });
      gsap.fromTo(stickyEls, { y: -PUSH }, { y: 0, duration: 1.2, ease: EASE_MENU, overwrite: true });
      gsap.to(mFader, { opacity: 0, duration: 0.4, ease: "power2.inOut", delay: 0.9 * 0.8, onComplete() {
        gsap.set(modal, { display: "none", opacity: 0, pointerEvents: "none" });
        gsap.set(bg, { y: "100%" });
        gsap.set(wrap, { y: "0%" });
        gsap.set(pop, { y: "100%", opacity: 0 });
        if (names.length) gsap.set(names, { yPercent: 150 });
        if (clips.length) gsap.set(clips, { yPercent: 150 });
        if (lines.length) gsap.set(lines, { scaleY: 0 });
        gsap.set(closeBtn, { opacity: 0, x: "3rem" });
        gsap.set(pageWrapper, { clearProps: "transform" });
        gsap.set(stickyEls, { y: 0 });
        $$("[data-contact-clip]", modal).forEach((el) => (el.style.overflow = "hidden"));
        window.lenis?.start();
      } });
    };
    $$("[data-open-modal]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); show(); }));
    closeBtn?.addEventListener("click", hide);
    addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
    $(".mc-modal form")?.addEventListener("submit", (e) => e.preventDefault());
  }
  initModal();
})();
