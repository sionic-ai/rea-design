// One full set of site motion — rebuilt from the order and values of the original brand.js.
// Header · menu · logo run once when the document opens (once), while body motion is re-applied each time barba changes sections after the veil clears (page).
// Big band (scroll-dir-marquee) · process list preview (cursor-preview-slide) · header row collapse (pill-shrink-nav) · button (arrow-swap-pill) · link dot (dot-push-hover) are handled by the _fx motion parts.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("navEase", "0.65, 0.05, 0, 1");

  const $ = (s, root = document) => root?.querySelector(s);
  const $$ = (s, root = document) => [...(root?.querySelectorAll(s) || [])];
  const rm = matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = rm.matches;
  rm.addEventListener?.("change", (e) => { reduce = e.matches; });
  const kf = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  let cleanups = [];
  let pageCtx = null;
  const addCleanup = (fn) => { if (typeof fn === "function") cleanups.push(fn); };
  function destroyPage() {
    cleanups.splice(0).reverse().forEach((fn) => { try { fn(); } catch (_) { /* Already Removed Elements */ } });
    pageCtx?.revert();
    pageCtx = null;
  }

  // ── Hero loader: while the half-width wordmark frame widens to 100% over 1.2s after 1.5s, the dark curtain folds upward ──
  function prepareLoader(root) {
    const veil = $(".mj-loader__veil", root), wrap = $(".mj-loader__wrap", root), nav = $(".mj-nav");
    if (!veil || !wrap) {
      if (nav) gsap.set(nav, { opacity: 1, visibility: "visible" });
      return false;
    }
    gsap.set(wrap, { width: "50%" });
    gsap.set(veil, { height: "100%" });
    if (nav) gsap.set(nav, { opacity: 0, visibility: "visible" });
    return true;
  }
  function runLoader(root) {
    const veil = $(".mj-loader__veil", root), wrap = $(".mj-loader__wrap", root), nav = $(".mj-nav");
    if (!veil || !wrap) return null;
    const tl = gsap.timeline({
      delay: 1.5,
      onComplete() {
        if (nav) gsap.set(nav, { opacity: 1, visibility: "visible" });
        dispatchEvent(new Event("resize"));
        window.locomotiveScroll?.resize?.();
        ScrollTrigger.refresh();
      },
    });
    tl.to(wrap, { width: "100%", duration: 1.2, ease: "navEase" }, 0).to(veil, { height: "0%", duration: 1.2, ease: "navEase" }, 0);
    if (nav) tl.to(nav, { opacity: 1, duration: 0.8, ease: "power2.out", overwrite: "auto" }, 0.45);
    addCleanup(() => tl.kill());
    return tl;
  }

  // ── Letter rise: inside the line mask (.12em margin top and bottom) from 120% below → in place, 1s · .05s stagger · navEase ──
  function initStaggerText(root) {
    $$("[data-stagger-text]", root).forEach((el) => {
      const lines = el.dataset.staggerText === "lines";
      const split = new SplitText(el, { type: lines ? "lines" : "lines,chars", linesClass: "mj-line-inner" });
      const masks = split.lines.map((line) => {
        const mask = document.createElement("div");
        mask.className = "mj-line-mask";
        line.parentNode.insertBefore(mask, line);
        mask.appendChild(line);
        return mask;
      });
      const targets = lines ? split.lines : split.chars;
      gsap.set(targets, { yPercent: 120 });
      gsap.set(el, { visibility: "visible" });
      const tween = gsap.to(targets, {
        yPercent: 0, duration: 1, stagger: 0.05, ease: "navEase",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
      addCleanup(() => {
        tween.scrollTrigger?.kill();
        tween.kill();
        split.revert();
        masks.forEach((m) => m.parentNode && m.replaceWith(...m.childNodes));
      });
    });
  }

  // ── Chunk float: each child starts 2em below · transparent → .8s power4.inOut, .1s stagger, once at top 80% ──
  function initReveal(root) {
    $$("[data-reveal-group]", root).forEach((group) => {
      if (reduce) { gsap.set(group, { y: 0, autoAlpha: 1 }); return; }
      const items = [...group.children].filter((el) => el.nodeType === 1 && el.dataset.ignore !== "true");
      if (!items.length) return;
      gsap.set(items, { y: "2em", autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: group, start: "top 80%", once: true,
        onEnter() {
          gsap.to(items, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power4.inOut", stagger: 0.1, onComplete() { gsap.set(items, { clearProps: "transform,opacity,visibility" }); } });
        },
      });
    });
  }

  // ── Thin line: when it enters top 90%, the width is drawn (css .8s) ──
  function initLines(root) {
    $$(".mj-line", root).forEach((line) => {
      ScrollTrigger.create({ trigger: line, start: "top 90%", once: true, onEnter: () => line.classList.add("is-in") });
    });
  }

  // ── Fit the text to 95% of the cell width (hero wordmark, big About title). Redo when the cell changes ──
  function initFit(root) {
    const els = $$("[data-fit-width]", root);
    if (!els.length) return null;
    let gone = false, raf = 0;
    const fit = (el) => {
      const parent = el.parentElement, st = getComputedStyle(parent);
      const room = (parent.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight)) * 0.95;
      if (room <= 0) return;
      let size = parseFloat(getComputedStyle(el).fontSize) || 16;
      for (let i = 0; i < 5; i++) {
        const w = el.getBoundingClientRect().width;
        if (!w) break;
        const r = room / w;
        if (Math.abs(r - 1) < 0.002) break;
        size *= r;
        el.style.fontSize = `${size}px`;
      }
    };
    const refit = () => { if (!gone) els.forEach(fit); };
    const soon = () => { if (!gone && !raf) raf = requestAnimationFrame(() => { raf = 0; refit(); }); };
    els.forEach((el) => { el.style.whiteSpace = "nowrap"; });
    const ro = new ResizeObserver(soon);
    els.forEach((el) => ro.observe(el.parentElement));
    addEventListener("resize", soon);
    refit();
    document.fonts?.ready?.then(refit);
    return () => { gone = true; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener("resize", soon); els.forEach((el) => { el.style.whiteSpace = el.style.fontSize = ""; }); };
  }

  // Background video: plays when 10% is on screen and pauses when out, and the poster image drops away once playing (original bunny background player)
  function initVideos(root) {
    const offs = $$(".mj-video", root).map((box) => {
      const video = $("video", box);
      if (!video) return null;
      const ac = new AbortController(), on = { signal: ac.signal };
      let pending = false, pausedBy = "";
      const status = (v) => { box.dataset.status = v; };
      const activated = (v) => { box.dataset.activated = v ? "true" : "false"; };
      video.muted = true; video.loop = true; video.playsInline = true;
      activated(false); status("idle");
      const ready = () => { if (!pending && box.dataset.activated !== "true") status("ready"); };
      const play = () => { pending = true; pausedBy = ""; status("loading"); video.play()?.catch?.(() => {}); };
      video.addEventListener("loadedmetadata", ready, on);
      video.addEventListener("canplay", ready, on);
      video.addEventListener("play", () => { activated(true); status("playing"); }, on);
      video.addEventListener("playing", () => { pending = false; status("playing"); }, on);
      video.addEventListener("pause", () => { pending = false; status("paused"); }, on);
      video.addEventListener("waiting", () => status("loading"), on);
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0) { if (pausedBy === "io" || video.paused) play(); }
        else if (!video.paused && !video.ended) { pausedBy = "io"; video.pause(); }
      }), { threshold: 0.1 });
      io.observe(box);
      return () => { ac.abort(); io.disconnect(); try { video.pause(); } catch (_) { /* Already removed */ } };
    }).filter(Boolean);
    return () => offs.forEach((off) => off());
  }

  // ── Photo slider (About section): swiper 4 slides · 800ms · 1.5s autoplay · drag, with the photo inside shifting 5% sideways by progress ──
  function initSlider(root) {
    const list = $$(".mj-slider", root).map((el) => new Swiper(el, {
      slidesPerView: 4, slidesPerGroup: 1, spaceBetween: 24, grabCursor: true, allowTouchMove: true, loop: true, speed: 800,
      watchSlidesProgress: true,
      autoplay: { delay: 1500, disableOnInteraction: false, pauseOnMouseEnter: true },
      breakpoints: { 0: { slidesPerView: 1.2, spaceBetween: 24 }, 480: { slidesPerView: 1.5, spaceBetween: 24 }, 767: { slidesPerView: 3.2, spaceBetween: 24 }, 992: { slidesPerView: 4, spaceBetween: 24 } },
      on: {
        progress(s) { s.slides.forEach((slide) => { const img = $(".mj-slide__img", slide); if (img) img.style.transform = `translateX(${slide.progress * 5}%)`; }); },
        setTransition(s, d) { s.slides.forEach((slide) => { const img = $(".mj-slide__img", slide); if (img) img.style.transitionDuration = `${d}ms`; }); },
      },
    }));
    return () => list.forEach((s) => { if (!s.destroyed) s.destroy(true, true); });
  }

  // ── Smooth scroll: Locomotive v5 (Lenis inside) — on phone lerp .12 · follows the finger ──
  function initSmoothScroll() {
    if (typeof LocomotiveScroll === "undefined") return;
    const mobile = matchMedia("(max-width: 767px)").matches;
    window.locomotiveScroll = new LocomotiveScroll({
      lenisOptions: {
        lerp: mobile ? 0.12 : 0.1, syncTouch: mobile, syncTouchLerp: 0.075, touchInertiaMultiplier: 30, touchMultiplier: 1,
        smoothWheel: true, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      },
    });
  }

  // ── Header row color: the top Hero (data-nav-light) uses the light logo · light buttons, while elsewhere · when scrolled down · with the menu open uses the dark side (1s navEase) ──
  const nav = $(".mj-nav");
  const navLogo = $(".mj-logo");
  const navBtns = $$(".mj-btn.is-nav");
  let isLight = !!$("[data-nav-light]"), forceDark = false, docked = false;
  function paintNav(now) {
    const light = isLight && !forceDark && !docked;
    const sand = kf("--kf-bg"), ink = kf("--kf-ink");
    const logo = { color: light ? sand : ink };
    const btn = { "--fx-bg": light ? sand : ink, "--fx-ink": light ? ink : sand, "--fx-arrow-bg": light ? sand : ink, "--fx-arrow-ink": light ? ink : sand };
    if (now) { gsap.set(navLogo, logo); gsap.set(navBtns, btn); return; }
    gsap.to(navLogo, { ...logo, duration: 1, ease: "navEase", overwrite: "auto" });
    gsap.to(navBtns, { ...btn, duration: 1, ease: "navEase", overwrite: "auto" });
  }

  // ── Logo: the original Lottie (30 frames · curve .5,.35 → .15,1) that GSAP ran from 0 → 28 frames with a 1s navEase —
  //    the text settles 6px down, the subtitle drops 6.2px, and the cover folds upward and disappears ──
  const lottieEase = CustomEase.create("mjLottie", "0.5, 0.35, 0.15, 1");
  const logoWord = $(".mj-logo__word"), logoSub = $(".mj-logo__subg"), logoClip = $(".mj-logo__cliprect");
  const logoState = { frame: 0 };
  let logoTween = null;
  function drawLogo() {
    const p = lottieEase(Math.round(logoState.frame) / 30);
    logoWord?.setAttribute("transform", `translate(0 ${6 * p})`);
    logoSub?.setAttribute("transform", `translate(${255.67 + 0.33 * p} ${90.78 + 6.22 * p})`);
    logoClip?.setAttribute("height", String(23.4 * (1 - p)));
  }
  function animateLogo(on, now) {
    logoTween?.kill();
    if (now || reduce) { logoState.frame = on ? 28 : 0; drawLogo(); return; }
    logoTween = gsap.to(logoState, { frame: on ? 28 : 0, duration: 1, ease: "navEase", onUpdate: drawLogo });
  }

  // ── Three dots on the menu button: our Lottie (lottie-web) — the end dots gather to the center and become one (30 frames at 60fps) ──
  function dotsData() {
    const ease = { o: { x: [0.5], y: [0.35] }, i: { x: [0.15], y: [1] } };
    const dot = (ind, x0, x1) => ({
      ddd: 0, ind, ty: 4, nm: `dot${ind}`, sr: 1, ao: 0, ip: 0, op: 29, st: 0, bm: 0,
      ks: {
        o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] },
        p: { s: true, x: x0 === x1 ? { a: 0, k: x0 } : { a: 1, k: [{ t: 0, s: [x0], ...ease }, { t: 30, s: [x1] }] }, y: { a: 0, k: 2 } },
      },
      shapes: [{ ty: "gr", nm: "g", it: [
        { ty: "el", nm: "e", d: 1, s: { a: 0, k: [4, 4] }, p: { a: 0, k: [0, 0] } },
        { ty: "fl", nm: "f", c: { a: 0, k: [0, 0, 0, 1] }, o: { a: 0, k: 100 }, r: 1 },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
      ] }],
    });
    return { v: "5.12.2", fr: 60, ip: 0, op: 29, w: 20, h: 4, nm: "menu-dots", ddd: 0, assets: [], layers: [dot(1, 2, 10), dot(2, 10, 10), dot(3, 18, 10)] };
  }
  const dots = typeof lottie === "undefined" ? [] : $$(".mj-dots").map((el) => {
    const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: dotsData() });
    anim.goToAndStop(0, true);
    return anim;
  });
  let dotsOpen = false;
  function setDots(open) {
    if (open === dotsOpen) return;
    dotsOpen = open;
    dots.forEach((a) => { a.setDirection(open ? 1 : -1); a.play(); });
  }

  // ── Menu panel: the panel scaleY 0 → 1 (1s) from its top edge, links from .3s · contacts from .5s rise from 20px below in .8s · .08s apart ──
  function initMenu() {
    const toggle = $(".mj-btn.is-nav"), menu = $(".mj-menu"), bg = $(".mj-menu__bg");
    if (!toggle || !menu || !bg) return;
    // As in the original, Links includes menu links and the phone·mail links in contact (all dot links) — the .08s stagger spans 8 items
    const links = $$(".mj-link", menu), contacts = $$(".mj-menu__block", menu);
    let open = false;
    gsap.set(menu, { autoAlpha: 0, pointerEvents: "none" });
    gsap.set(bg, { scaleY: 0, transformOrigin: "top center" });
    gsap.set([...links, ...contacts], { autoAlpha: 0, y: 20 });
    const tl = gsap.timeline({ paused: true, onReverseComplete() { gsap.set(menu, { autoAlpha: 0, pointerEvents: "none" }); } });
    tl.set(menu, { autoAlpha: 1, pointerEvents: "auto" })
      .to(bg, { scaleY: 1, duration: 1, ease: "navEase" }, 0)
      .to(links, { autoAlpha: 1, y: 0, duration: 0.8, ease: "navEase", stagger: 0.08 }, 0.3);
    if (contacts.length) tl.to(contacts, { autoAlpha: 1, y: 0, duration: 0.8, ease: "navEase", stagger: 0.08 }, 0.5);
    const set = (v) => {
      open = v;
      toggle.setAttribute("aria-expanded", String(v));
      forceDark = v;
      if (!docked) paintNav(false);
      setDots(v);
      if (v) { window.locomotiveScroll?.stop?.(); tl.play(); } else { window.locomotiveScroll?.start?.(); tl.reverse(); }
    };
    toggle.addEventListener("click", (e) => { e.preventDefault(); set(!open); });
    [...links, ...$$(".mj-menu__locale a", menu)].forEach((a) => a.addEventListener("click", () => { if (open) set(false); }));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); });
  }

  // ── Current section indicator: like the original (w--current) only the marker is attached and the dot is not lit — with aria-current, dot-push-hover would keep the dot always on ──
  function markCurrent() {
    const here = location.pathname.split("/").pop() || "index.html";
    $$(".mj-navgroup a[href], [data-barba='container'] .mj-foot a[href]").forEach((a) => {
      a.classList.toggle("is-current", a.getAttribute("href") === here);
    });
  }

  function initOnce() {
    initSmoothScroll();
    paintNav(true);
    animateLogo(false, true);
    nav?.addEventListener("fx:dock", (e) => {
      docked = e.detail.docked;
      animateLogo(docked, e.detail.now);
      paintNav(e.detail.now);
    });
    initMenu();
  }

  function initPage(container) {
    pageCtx = gsap.context(() => {
      addCleanup(initFit(container));
      initStaggerText(container);
      initReveal(container);
      initLines(container);
      addCleanup(initSlider(container));
      addCleanup(initVideos(container));
    }, container);
    const loco = window.locomotiveScroll;
    let gone = false, r1 = 0, r2 = 0;
    const refresh = () => { if (gone || !container.isConnected) return; loco?.resize?.(); dispatchEvent(new Event("resize")); ScrollTrigger.refresh(); };
    r1 = requestAnimationFrame(() => { if (!gone) r2 = requestAnimationFrame(refresh); });
    document.fonts?.ready?.then(refresh);
    const timers = [100, 300, 700].map((d) => setTimeout(refresh, d));
    addCleanup(() => { gone = true; cancelAnimationFrame(r1); cancelAnimationFrame(r2); timers.forEach(clearTimeout); });
  }

  function finalize(container) {
    gsap.set(container, { clearProps: "all" });
    scrollTo(0, 0);
    window.locomotiveScroll?.resize?.();
    window.locomotiveScroll?.start?.();
  }

  // ── Transition veil: a dark veil covers over .6s power2.inOut, and after the new section is in it lifts over .6s ──
  function leaveVeil(current) {
    const wrap = $(".mj-transition"), dark = $(".mj-transition__dark");
    const tl = gsap.timeline();
    if (reduce) return tl.to(current, { autoAlpha: 0, duration: 0.3 });
    if (wrap) tl.set(wrap, { zIndex: 100 });
    if (dark) tl.fromTo(dark, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.inOut" });
    return tl;
  }
  function enterVeil(next) {
    const wrap = $(".mj-transition"), dark = $(".mj-transition__dark");
    const tl = gsap.timeline({ onComplete() { if (wrap) gsap.set(wrap, { zIndex: -1 }); } });
    if (reduce) { if (dark) tl.set(dark, { autoAlpha: 0 }); return tl.from(next, { autoAlpha: 0, duration: 0.3 }); }
    if (dark) tl.to(dark, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" });
    return tl;
  }

  // Each section has its own css — attaches css found in the new section’s head that isn’t present now, and waits until all are loaded
  function syncStyles(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const have = new Set($$("link[rel=stylesheet]").map((l) => l.getAttribute("href")));
    const waits = $$("link[rel=stylesheet]", doc).filter((l) => !have.has(l.getAttribute("href"))).map((l) => new Promise((done) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = l.getAttribute("href");
      link.onload = link.onerror = done;
      document.head.append(link);
      setTimeout(done, 3000);
    }));
    return Promise.all(waits);
  }

  history.scrollRestoration = "manual";
  function start() {
    if (typeof barba === "undefined") {
      const c = $("[data-barba='container']");
      initOnce(); finalize(c); prepareLoader(c); initPage(c); runLoader(c); markCurrent();
      return;
    }
    barba.init({
      debug: false, timeout: 7000, preventRunning: true,
      prevent({ el }) {
        if (!el) return true;
        const href = el.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || el.hasAttribute("target") || el.hasAttribute("download") || el.hasAttribute("data-barba-prevent")) return true;
        try { return new URL(el.href, location.href).origin !== location.origin; } catch { return true; }
      },
      transitions: [{
        name: "default",
        once(data) {
          const c = data.next.container;
          initOnce(); finalize(c); prepareLoader(c); initPage(c); runLoader(c); markCurrent();
        },
        async leave(data) {
          const loco = window.locomotiveScroll;
          loco?.stop?.();
          await leaveVeil(data.current.container);
          loco?.removeScrollElements?.(data.current.container);
          destroyPage();
          data.current.container.remove();
        },
        async enter(data) {
          const loco = window.locomotiveScroll, c = data.next.container;
          await syncStyles(data.next.html || "");
          finalize(c);
          const hasLoader = prepareLoader(c);
          isLight = !!$("[data-nav-light]", c);
          markCurrent();
          paintNav(false);
          await enterVeil(c);
          loco?.addScrollElements?.(c);
          initPage(c);
          if (hasLoader) runLoader(c);
          requestAnimationFrame(() => requestAnimationFrame(() => { loco?.resize?.(); loco?.start?.(); dispatchEvent(new Event("resize")); ScrollTrigger.refresh(); }));
        },
      }],
    });
  }
  if (document.readyState === "complete") start(); else addEventListener("load", start, { once: true });
})();
