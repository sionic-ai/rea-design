// Shared by several pages — smooth scroll, swup transitions, loader, menu, booking pill, video window, and the devices attached and detached per page (KC.page).
// Values were read from the original bundle (hoisted.*.js). Like the original, swup swaps only main, so all page scripts are loaded up front and picked by main[data-page].
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const circle = "cubic-bezier(0.442,0.05,0.125,1)";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const d = (s) => (still ? 0 : s);

  // The original clears the loader and news-window flags on every fresh open — even in the same session, a fresh open shows the news window again after 3s
  sessionStorage.removeItem("kc-loaded");
  sessionStorage.removeItem("kc-news");

  // ---------- Smooth scroll — original Lenis 1.0.42 as is (phone has touchMultiplier 0, so fingers fall through to default scroll) ----------
  let lenis = null;
  if (!still && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, duration: 1, wheelMultiplier: 0.7, touchMultiplier: 0, syncTouch: true });
    if (lenis.scroll > 0) lenis.scrollTo(0, { immediate: true });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);
  }
  const scrollTo = (target) => (lenis ? lenis.scrollTo(target) : $(target)?.scrollIntoView());
  const stop = () => lenis?.stop();
  const start = () => lenis?.start();

  // ---------- Video — the original loads m3u8 via hls.js (maxMaxBufferLength 1) ----------
  const hlsLoad = (video, src) => {
    // Opened via file://, the XHR of hls.js is blocked by CORS and a console error appears — in that case it isn’t loaded and a placeholder box stays
    if (!video || location.protocol === "file:") return null;
    if (window.Hls?.isSupported()) {
      const hls = new Hls({ maxMaxBufferLength: 1 });
      hls.loadSource(src);
      hls.attachMedia(video);
      return hls;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) video.src = src;
    return null;
  };
  const play = (v) => v?.play()?.catch(() => {});

  // ---------- Text splitting — the mask shifts 25ms later per character ----------
  const split = (el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text.trim());
    el.innerHTML = [...text].map((c) => (c === " " ? " " : `<span aria-hidden="true">${c}</span>`)).join("");
    return $$("span", el);
  };

  // ---------- Booking pill — fills when scrolling down and empties at the very top ----------
  $$(".kc-resv .wrap").forEach((w) => {
    const t = w.textContent.trim();
    w.innerHTML = [...t].map((c) => `<span data-text="${c}">${c}</span>`).join("");
    $$("span", w).forEach((s, i) => (s.style.transitionDelay = `${(i + 1) * 0.02}s`));
  });
  const resv = $(".kc-header .kc-resv");
  let last = 0;
  let filled = false;
  const onScroll = (y) => {
    if (y > last) {
      if (!filled) resv.classList.add("is-active");
      filled = true;
    } else if (y <= 0) {
      resv.classList.remove("is-active");
      filled = false;
    }
    last = y;
  };
  if (lenis) lenis.on("scroll", (l) => onScroll(l.scroll));
  else addEventListener("scroll", () => onScroll(scrollY), { passive: true });

  // ---------- Phone menu — tapping a link in the menu closes it and navigates ----------
  const menu = $(".kc-menu");
  const lines = $$(".kc-menu__close span");
  const openMenu = () => {
    gsap.set(menu, { display: "block" });
    stop();
    gsap.to(menu, { opacity: 1, duration: 0.6, ease: "power2.out" });
    gsap.to(lines[0], { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: circle });
    gsap.to(lines[1], { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: circle, delay: 0.2 });
  };
  const closeMenu = () => {
    if (getComputedStyle(menu).display === "none") return;
    start();
    gsap.to(menu, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(menu, { display: "none" });
        gsap.set(lines, { clipPath: "inset(0 100% 0 0)" });
      },
    });
  };
  $(".kc-burger")?.addEventListener("click", openMenu);
  $(".kc-menu__close")?.addEventListener("click", closeMenu);
  $$(".kc-menu a").forEach((a) => a.addEventListener("click", closeMenu));

  // Highlights the menu text for the current page — the original matches data-link to the address on each navigation
  const markNav = () => {
    const page = $("main")?.dataset.link;
    $$(".kc-nav a").forEach((a) => a.classList.toggle("is-active", !!page && a.dataset.link === page));
  };

  // ---------- Video window — background fills up from below, video · close button .65s later. Loads the video on first open like the original ----------
  const modal = $(".kc-modal");
  const modalBg = $(".kc-modal__bg");
  const modalVideo = $(".kc-modal__video video");
  const modalClose = $(".kc-modal__close");
  let modalOpen = false;
  let modalLoaded = false;
  const openMovie = () => {
    if (modalOpen) return;
    modalOpen = true;
    if (!modalLoaded) {
      modalLoaded = true;
      hlsLoad(modalVideo, "media/kv.m3u8");
    }
    gsap.set(modal, { display: "block", opacity: 1 });
    gsap.to(modalBg, { y: 0, duration: d(0.6), ease: circle, onComplete: stop });
    gsap.to([modalClose, modalVideo.parentNode], { opacity: 1, duration: d(0.8), ease: "power3.out", delay: d(0.65), onStart: () => play(modalVideo) });
  };
  const closeMovie = () => {
    gsap.to(modalClose, { opacity: 0, duration: d(0.3), ease: "power3.out" });
    gsap.to(modalVideo.parentNode, {
      opacity: 0,
      duration: d(0.3),
      ease: "power3.out",
      onStart: () => modalVideo.pause(),
      onComplete: () =>
        gsap.to(modalBg, {
          y: "100%",
          duration: d(0.8),
          ease: circle,
          delay: d(0.1),
          onStart: start,
          onComplete: () =>
            gsap.to(modal, {
              opacity: 0,
              duration: d(0.3),
              ease: "power3.out",
              onComplete: () => {
                gsap.set(modal, { display: "none" });
                modalOpen = false;
              },
            }),
        }),
    });
  };
  modalClose?.addEventListener("click", closeMovie);
  modalBg?.addEventListener("click", closeMovie);

  // ---------- Page transition curtain — on leaving it covers black in .3s and goes to the top, and when everything is swapped it lifts in .3s ----------
  const trans = $(".kc-transition");
  const footer = $(".kc-footer");
  const pageEnter = () => gsap.to(trans, { opacity: 0, duration: d(0.3), ease: "power2.out", onComplete: () => gsap.set(trans, { display: "none" }) });
  const pageLeave = () => {
    gsap.set(trans, { display: "block" });
    gsap.to(trans, { opacity: 1, duration: d(0.3), ease: "power2.out", onComplete: () => (lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0)) });
  };
  const showFooter = () => gsap.to(footer, { autoAlpha: 1, duration: d(1), ease: "power2.out" });

  // ---------- Attach and detach page devices ----------
  // The original runs init(…, right away on a page opened fresh, and when main is swapped on a page arrived at via swup "second") does
  const pages = {};
  let mounted = null;
  const mount = (second) => {
    const main = $("main");
    const init = pages[main?.dataset.page];
    if (!init) return;
    const timers = [];
    // Original intersectionObserver — rootMargin -30% 0px, fires once when it enters the band that excludes the top and bottom 30% of the screen
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-view");
          io.unobserve(e.target);
        }),
      { rootMargin: "-30% 0px" }
    );
    const m = { timers, io, cleanup: null, ctx: null };
    m.ctx = gsap.context(() => {
      $$("[data-split]", main).forEach((el) => {
        el.classList.add("kc-split");
        split(el).forEach((s, i) => (s.style.transitionDelay = `${(i + 1) * 0.025}s`));
      });
      $$("[data-observe]", main).forEach((el) => (still ? el.classList.add("is-view") : io.observe(el)));
      $$("[data-anchor]", main).forEach((el) => el.addEventListener("click", () => scrollTo("#" + el.dataset.anchor)));
      // Late-attached things (like the original setTimeout 500) go in the same batch so they clear together on page turn
      const later = (fn, ms) => timers.push(setTimeout(() => m.ctx.add(fn), still ? 0 : ms));
      m.cleanup = init({ main, second, later });
    }, main);
    mounted = m;
  };
  const unmount = (m) => {
    if (!m) return;
    m.timers.forEach(clearTimeout);
    m.io.disconnect();
    m.cleanup?.();
    m.ctx.revert();
  };

  // ---------- Photo sections that cover and rise — in the style of original setRestaurantTrigger and setBarTrigger: one pinned title section, two pins that catch the photo sections in turn ----------
  // opts.pin: title cell to pin together · opts.enter: while entering, turn the first photo on 0→1 and push it -10% ("section" Toggles on a per-section basis — restaurant, "pin" is based on the title cell — bar)
  // opts.dur: length of the value move while pinned (restaurant 0, bar .1) · opts.onPass·onPin: what to call on [enter, return]
  const stack = (root, opts = {}) => {
    const items = $$(".kc-stack__item", root);
    const imgs = $$(".wf-img", items[0]);
    const dur = opts.dur ?? 0;
    const to = (el, v, t) => gsap.to(el, { ...v, duration: t, ease: "none" });
    if (opts.enter === "section")
      ScrollTrigger.create({ trigger: root, start: "top bottom", end: "top top", onUpdate: (s) => gsap.set(imgs[0], { opacity: s.progress }) });
    if (opts.enter)
      ScrollTrigger.create({
        trigger: opts.pin,
        start: "top bottom",
        end: "top top",
        onUpdate: (s) => to(imgs[0], opts.enter === "pin" ? { y: -10 * s.progress + "%", opacity: s.progress } : { y: -10 * s.progress + "%" }, 0.1),
        onLeave: opts.onPass?.[0],
        onEnterBack: opts.onPass?.[1],
      });
    if (opts.pin)
      ScrollTrigger.create({
        trigger: opts.pin,
        start: "top top",
        endTrigger: items[2],
        end: "top top",
        pin: opts.pin,
        pinSpacing: false,
        onEnter: opts.onPin?.[0],
        onLeaveBack: opts.onPin?.[1],
      });
    const base = opts.enter ? -10 : 0;
    [1, 2].forEach((k) =>
      ScrollTrigger.create({
        trigger: items[k - 1],
        start: "top top",
        endTrigger: items[k],
        end: "top top",
        pin: items[0],
        pinSpacing: false,
        onUpdate: (s) => {
          const p = s.progress;
          to(imgs[k], { clipPath: `inset(${(1 - p) * 100}% 0 0 0)` }, dur);
          to(imgs[k - 1], { y: (k === 1 ? base : -10) - 10 * p + "%" }, dur);
          to(imgs[k], { y: -10 * p + "%" }, dur);
        },
      })
    );
  };

  // ---------- Photo parallax — yPercent -10→10, brightness 0.3→1 from 70% to 30% of the screen ----------
  const parallax = (root) => {
    $$(".kc-par", root).forEach((box) => {
      const img = $(".wf-img", box);
      gsap.set(img, { y: 0 });
      gsap.timeline({ scrollTrigger: { trigger: box, scrub: true, pin: false } }).fromTo(img, { yPercent: -10, ease: "none" }, { yPercent: 10, ease: "none" });
      ScrollTrigger.create({
        trigger: box,
        start: "top 70%",
        end: "top 30%",
        onUpdate: (s) => gsap.set(img, { filter: `brightness(${0.3 + 0.7 * s.progress})` }),
      });
    });
  };

  // ---------- On first open — the first page shows the loader, the rest just lift the curtain ----------
  const loading = $(".kc-loading");
  const loadingVideo = $(".kc-loading__video video");
  const first = () => {
    const home = $("main")?.dataset.page === "home";
    if (!home || still) {
      gsap.set(loading, { display: "none" });
      if (still) gsap.set(trans, { opacity: 0, display: "none" });
      setTimeout(() => {
        pageEnter();
        showFooter();
      }, d(250));
      return;
    }
    const lv = $(".kc-loading__video");
    const logo = $(".kc-loading__logo");
    setTimeout(() => {
      gsap.set(trans, { opacity: 0, display: "none" });
      gsap.to(lv, {
        opacity: 1,
        duration: 1,
        ease: "none",
        onStart: () => play(loadingVideo),
      });
      gsap.to(logo, {
        opacity: 1,
        duration: 1,
        ease: "none",
        delay: 0.2,
        onComplete: () =>
          setTimeout(() => {
            gsap.to(lv, { y: "-40vh", opacity: 0, duration: 1.2, ease: "none" });
            gsap.to(logo, { y: "-40vh", duration: 1.2, ease: "none" });
            gsap.to(loading, {
              clipPath: "inset(0 0 100% 0)",
              duration: 1,
              ease: circle,
              onStart: () => play($(".kc-kv video")),
              onComplete: () => {
                loadingVideo?.pause();
                gsap.set(loading, { display: "none" });
                showFooter();
                sessionStorage.setItem("kc-loaded", "true");
              },
            });
          }, 200),
      });
    }, 500);
  };

  // ---------- swup — original settings as is. Script plugins would duplicate gsap if a plain script ran again, so only the marked ones (optin) ----------
  const swupOn = window.Swup && location.protocol.startsWith("http");
  if (swupOn) {
    const swup = new Swup({
      ignoreVisit: (url, { el } = {}) => el?.closest("[data-no-swup]"),
      animationSelector: '[class*="transition-"]',
      containers: ["main"],
      cache: true,
      native: false,
      plugins: [
        new SwupA11yPlugin(),
        new SwupPreloadPlugin({ preloadHoveredLinks: true, preloadVisibleLinks: false }),
        new SwupScrollPlugin(),
        new SwupBodyClassPlugin(),
        new SwupHeadPlugin({ awaitAssets: true, persistAssets: false, persistTags: false }),
        new SwupScriptsPlugin({ optin: true }),
      ],
    });
    swup.hooks.on("visit:start", () => {
      pageLeave();
      const m = mounted;
      mounted = null;
      setTimeout(() => unmount(m), d(300));
    });
    swup.hooks.on("content:replace", () => mount(true));
    swup.hooks.on("visit:end", () => {
      pageEnter();
      markNav();
    });
    window.swup = swup;
  } else {
    // Opened via file://, swup can’t load the page — it covers with the same veil for .3s, then moves on as a normal navigation
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || !/^[\w-]+\.html$/.test(a.getAttribute("href"))) return;
      e.preventDefault();
      gsap.set(trans, { display: "block" });
      gsap.to(trans, { opacity: 1, duration: d(0.3), ease: "power2.out", onComplete: () => (location.href = a.getAttribute("href")) });
    });
    addEventListener("pageshow", (e) => e.persisted && gsap.set(trans, { opacity: 0, display: "none" }));
  }

  addEventListener("DOMContentLoaded", () => {
    markNav();
    mount(false);
    first();
  });

  window.KC = {
    still,
    circle,
    d,
    lenis,
    stop,
    start,
    page: (name, init) => (pages[name] = init),
    stack,
    parallax,
    split,
    scrollTo,
    hlsLoad,
    play,
    openMovie,
    loaded: () => sessionStorage.getItem("kc-loaded") === "true",
    $,
    $$,
  };
})();
