(() => {
  gsap.registerPlugin(ScrollTrigger);
  const { split, reduce } = window.ctSite;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  buildMayu();
  buildGallery();

  const wrapper = $("#wrapper");
  const menu = $("#menu");
  const lang = $("#lang_btn_list");
  const opVideo = $("#opening_video");
  const opening = $("#opening");
  const loading = $("#loading");
  const kvVideoWrap = $("#kv_video_wrap");
  const kvVideo = $("#kv_video");
  const kvBg = $(".ct-kv__bg");
  const kvMayu = $(".ct-kv__mayu");
  const kv = $("#kv");
  const kvScale = $(".ct-kv__scale");
  const stImgWrap = $("#statement_kv_img_wrap");
  const stImg = $("#statement_kv_img");

  const lenis = new Lenis({ anchors: true });
  const title = lottie.loadAnimation({ container: $("#lottie"), renderer: "svg", animationData: window.ctTitleLottie, autoplay: false, loop: false });

  // top → key video → statement → scroll release
  let state = "top";
  let kvVideoTriggered = false;
  let opVideoTriggered = false;
  let isOpVideoEnded = true;
  let titleFinished = false;
  let kvStarted = false;
  let windowCanScroll = false;
  let canScrollUp = true;
  let startY = 0;

  gsap.set(kvVideoWrap, { autoAlpha: 0 });
  kvVideo.currentTime = 0;
  kvVideo.pause();

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.clearScrollMemory("manual");
  wrapper.classList.add("is-loaded");
  lenis.stop();

  if (reduce) {
    finalState();
  } else {
    setTimeout(fadeoutLoading, 6000);
  }

  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (href === "#" || !href) return;
    e.preventDefault();
    if (state === "top") {
      if (href !== "#top") {
        hideTopKv();
        startStatementKV();
        onKvVideoEnded(href);
        lenis.scrollTo(href, { force: true });
      }
    } else if (href === "#top") {
      resetToInitial();
    } else {
      lenis.scrollTo(href, { force: true });
    }
  }));

  window.addEventListener("load", () => {
    if (!reduce) fadeoutLoading();
    initScrollTriggers();
    initMenuCurrent();
    initReveals();
    initGallery();
    initCmButton();
    const hash = location.hash;
    if (!reduce && hash && hash !== "#top") {
      onOpVideoEnded();
      hideTopKv();
      startStatementKV();
      onKvVideoEnded(hash);
    }
  });

  // Scrolling up at the very top returns to the Hero
  window.addEventListener("touchstart", (e) => { if (windowCanScroll) startY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (!windowCanScroll) return;
    const deltaY = startY - e.touches[0].clientY;
    if (scrollY === 0 && deltaY < 10 && canScrollUp) { canScrollUp = false; resetToInitial(); }
  }, { passive: true });
  window.addEventListener("wheel", (e) => {
    if (!windowCanScroll) return;
    if (scrollY === 0 && e.deltaY < 10 && canScrollUp) { canScrollUp = false; resetToInitial(); }
  }, { passive: true });

  function fadeoutLoading() {
    gsap.to(loading, {
      opacity: 0,
      onComplete: () => {
        const p = opVideo.play();
        if (p !== undefined) p.catch(() => onOpVideoEnded());
      },
    });
  }

  opVideo.addEventListener("timeupdate", () => {
    if (!opVideo.duration || opVideoTriggered) return;
    if (opVideo.duration - opVideo.currentTime <= 3) {
      opVideoTriggered = true;
      onOpVideoEnded();
    }
  });
  $("#opening_skip").addEventListener("click", () => onOpVideoEnded());

  function onOpVideoEnded() {
    if (!isOpVideoEnded) return;
    gsap.to(opening, { autoAlpha: 0, duration: 2, ease: "expo.out" });
    showTopKv();
    gsap.fromTo(kvBg, { scale: 1 }, { scale: 1.1, duration: 30 });
    const tl = gsap.timeline();
    tl.fromTo(kvMayu, { scale: 1.4 }, { scale: 1.1, duration: 8, ease: "expo.out" });
    tl.fromTo(kvMayu, { scale: 1.1 }, { scale: 1, duration: 30 });
    isOpVideoEnded = false;
  }

  function showTopKv() {
    gsap.fromTo(menu, { y: 20, opacity: 0 }, { y: 0, opacity: 1, delay: 1, duration: 3.4, ease: "expo.out" });
    menu.style.pointerEvents = "auto";
    gsap.fromTo(lang, { y: 20, opacity: 0 }, { y: 0, opacity: 1, delay: 1, duration: 3.4, ease: "expo.out" });
    gsap.fromTo("#kv_logo", { y: 20, opacity: 0 }, { y: 0, opacity: 1, delay: 1, duration: 4, ease: "power2.out", onComplete: () => addListenerForState(playKvVideo, "top") });
  }

  function addListenerForState(callback, target) {
    ["touchstart", "touchmove", "wheel"].forEach((type) => {
      document.addEventListener(type, (e) => { if (state === target) callback(e); }, { once: true, passive: true });
    });
  }

  function hideTopKv() {
    kvVideoTriggered = false;
    gsap.to(kv, { duration: 1, autoAlpha: 0, ease: "power1.in" });
    gsap.to(kvScale, { duration: 1, scale: 1.2, ease: "power1.in" });
  }

  function playKvVideo() {
    if (kvStarted) return;
    kvStarted = true;
    hideTopKv();
    gsap.to(kvVideoWrap, { autoAlpha: 1, duration: 1 });
    kvVideo.currentTime = 0;
    kvVideo.play().catch(() => {});
    kvVideo.ontimeupdate = () => {
      if (!kvVideo.duration || kvVideoTriggered) return;
      if (kvVideo.duration - kvVideo.currentTime <= 3) {
        startStatementKV();
        onKvVideoEnded();
      }
    };
  }

  function startStatementKV() {
    kvVideoTriggered = true;
    const tl = gsap.timeline();
    tl.to("#statement_kv", { opacity: 1, duration: 1 });
    tl.to(stImgWrap, { autoAlpha: 1, duration: 3, ease: "power1.out" }, "<");
    tl.to(stImg, { scale: 1, duration: 3, ease: "power1.out" }, "<");
    tl.to(stImg, { scale: 1.1, duration: 5, ease: "power1.out" }, "<");
    tl.call(() => {
      title.play();
      state = "statement";
      $(".js-menu-top").classList.remove("is-active");
      $(".js-menu-statement").classList.add("is-active");
    }, null, "<+=1");
    return tl;
  }

  function onKvVideoEnded(href) {
    const tl = gsap.timeline();
    tl.call(() => {
      lenis.scrollTo("#statement_kv", { lock: true, immediate: true, force: true, onComplete: () => { windowCanScroll = true; } });
    }, null);
    tl.to(kvVideoWrap, { autoAlpha: 0, duration: href ? 1 : 3 });
    tl.call(() => {
      const done = () => {
        if (titleFinished) return;
        titleFinished = true;
        if (!href) lenis.start();
        wrapper.classList.add("has-scrolled");
        $("#kv_scroll").classList.add("is-active");
        title.removeEventListener("complete", done);
      };
      if (href) {
        lenis.start();
        lenis.scrollTo(href, { force: true });
        ScrollTrigger.refresh();
      }
      title.addEventListener("complete", done);
    }, null, "<+=1");
  }

  function resetToInitial() {
    gsap.globalTimeline.clear();
    state = "top";
    kvStarted = false;
    lenis.scrollTo(0, {
      lock: true, force: true, immediate: true,
      onComplete: () => {
        lenis.stop();
        $(".js-menu-top").classList.add("is-active");
        $$(".js-menu-statement, .js-menu-link").forEach((li) => li.classList.remove("is-active"));
      },
    });
    gsap.set(kvVideoWrap, { autoAlpha: 0 });
    kvVideo.currentTime = 0;
    kvVideo.pause();
    wrapper.classList.remove("has-scrolled");
    $("#kv_scroll").classList.remove("is-active");
    menu.style.pointerEvents = "none";
    windowCanScroll = false;
    startY = 0;
    canScrollUp = true;
    // Restore hero
    gsap.set(kvBg, { scale: 1 });
    gsap.set(kvMayu, { scale: 1.4 });
    gsap.set(kvScale, { scale: 1 });
    gsap.fromTo(kv, { autoAlpha: 0 }, {
      autoAlpha: 1, duration: 2,
      onComplete: () => {
        menu.style.pointerEvents = "auto";
        gsap.to(lang, { y: 0, opacity: 1 });
        setTimeout(() => addListenerForState(playKvVideo, "top"), 1000);
      },
    });
    gsap.set(stImgWrap, { autoAlpha: 0 });
    gsap.set(stImg, { scale: 1 });
    gsap.set("#statement_kv", { opacity: 0 });
    titleFinished = false;
    title.stop();
    title.goToAndStop(0, true);
  }

  // Reduced motion — skip the prologue and start with the declaration fully written out
  function finalState() {
    gsap.set([loading, opening, kv], { autoAlpha: 0 });
    gsap.set([menu, lang, "#kv_logo"], { opacity: 1, y: 0 });
    menu.style.pointerEvents = "auto";
    gsap.set("#statement_kv", { opacity: 1 });
    title.goToAndStop(title.totalFrames - 1, true);
    state = "normal";
    windowCanScroll = false;
    wrapper.classList.add("has-scrolled");
    $("#kv_scroll").classList.add("is-active");
    lenis.start();
  }

  function initMenuCurrent() {
    const items = $$(".js-menu-link");
    $$(".js-section").forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => setCurrent(items[i]),
        onEnterBack: () => setCurrent(items[i]),
        onLeaveBack: () => {
          items.forEach((li) => li.classList.remove("is-active"));
          if (section.id === "cm_wrap") $(".js-menu-statement").classList.add("is-active");
        },
      });
    });
    function setCurrent(li) {
      $$(".js-menu-link, .js-menu-statement, .js-menu-top").forEach((x) => x.classList.remove("is-active"));
      li?.classList.add("is-active");
    }
  }

  function initReveals() {
    ScrollTrigger.batch(".js-reveal", {
      start: "top 80%",
      onEnter: (b) => b.forEach((el) => el.classList.add("is-visible")),
      onLeaveBack: (b) => b.forEach((el) => el.classList.remove("is-visible")),
    });
    ScrollTrigger.batch(".js-reveal-gallery", {
      start: "top 80%",
      onEnter: (b) => b.forEach((el) => el.classList.add("is-visible")),
    });
  }

  function initScrollTriggers() {
    const mm = gsap.matchMedia();

    // Blur veil over the manifesto, manifesto fades out
    gsap.set("#statement_kv_blur", { opacity: 0, backdropFilter: "blur(0px)" });
    gsap.fromTo("#statement_kv_blur", { opacity: 0, backdropFilter: "blur(0px)" }, {
      opacity: 1, backdropFilter: "blur(10px)",
      scrollTrigger: {
        trigger: "#kv_space1", start: "top 80%", end: "top 50%", scrub: true,
        onEnter: () => $("#kv_ttl").classList.add("is-hidden"),
        onLeaveBack: () => $("#kv_ttl").classList.remove("is-hidden"),
      },
    });
    gsap.fromTo("#statement_kv", { opacity: 1 }, {
      opacity: 0, immediateRender: false,
      scrollTrigger: { trigger: "#kv_space2", start: "0% 40%", end: "top 0%", scrub: true },
    });

    // Lead paragraph — from blur 5px over 6s power4.out
    $$(".js-lead").forEach((line) => {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(line, { opacity: 0, filter: "blur(5px)" }, { opacity: 1, filter: "blur(0px)", duration: reduce ? 0 : 6, ease: "power4.out" });
      ScrollTrigger.create({ trigger: line, start: "0% 65%", onEnter: () => tl.play() });
    });

    // History
    gsap.to(".ct-history__kv-img", { scale: 1.06, immediateRender: false, scrollTrigger: { trigger: "#history_inner", start: "top top", end: "12% 50%", scrub: true } });
    const historyItems = $$(".js-history-item");
    const historyTween = gsap.fromTo("#history_list", { x: 0 }, {
      x: () => innerWidth - historyItems.reduce((w, el) => w + el.getBoundingClientRect().width, 0),
      ease: "none",
      scrollTrigger: {
        trigger: "#history_sticky", start: "100% 50%", end: "bottom bottom", endTrigger: "#history_inner",
        scrub: 0.1, anticipatePin: 1, invalidateOnRefresh: true,
        onEnter: () => menu.classList.add("is-hidden"),
        onEnterBack: () => menu.classList.add("is-hidden"),
        onLeave: () => menu.classList.remove("is-hidden"),
        onLeaveBack: () => menu.classList.remove("is-hidden"),
      },
    });
    gsap.set(".js-history-divider-mask", { scaleX: 1 });
    gsap.set(".js-history-divider-img", { scale: 1.2 });
    gsap.set(".ct-history__last-mask", { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" });
    mm.add({ isDesktop: "(min-width: 769px)", isMobile: "(max-width: 768px)" }, (ctx) => {
      const { isDesktop } = ctx.conditions;
      const start = isDesktop ? "top 70%" : "top 100%";
      const end = isDesktop ? "top 20%" : "top 0%";
      $$(".js-history-divider-mask").forEach((t) => gsap.to(t, { scaleX: 0, ease: "none", scrollTrigger: { trigger: t, containerAnimation: historyTween, start, end, scrub: true } }));
      gsap.to(".ct-history__last-mask", { clipPath: "polygon(0 0, 0% 0, 0% 100%, 0% 100%)", ease: "none", scrollTrigger: { trigger: ".js-history-item-5", containerAnimation: historyTween, start, end, scrub: true } });
      $$(".js-history-divider-img").forEach((t) => gsap.to(t, { scale: 1, ease: "none", scrollTrigger: { trigger: t, containerAnimation: historyTween, start, end, scrub: true } }));
    });
    $$(".js-history-img").forEach((t) => ScrollTrigger.create({ trigger: t, containerAnimation: historyTween, start: "top 70%", toggleClass: "is-active" }));
    gsap.set(".js-history-txt", { scale: 0.9, opacity: 0 });
    $$(".js-history-txt").forEach((t) => gsap.to(t, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: t, containerAnimation: historyTween, start: "top 100%", end: "top 60%", scrub: true } }));

    // Character entrance — lifts at 80% of the screen, folds back when scrolled below the screen
    $$(".js-text-wrap").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 80%", invalidateOnRefresh: true, onEnter: () => el.classList.add("is-animated") });
      ScrollTrigger.create({ trigger: el, start: "top bottom", invalidateOnRefresh: true, onLeaveBack: () => el.classList.remove("is-animated") });
    });

    // Artisan story
    gsap.to("#pride_kv_img", { scale: 1.06, immediateRender: false, scrollTrigger: { trigger: "#pride_inner", start: "top top", end: "20% 25%", scrub: true } });
    const prideItems = $$(".js-pride-item");
    const prideTween = gsap.fromTo("#pride_list", { x: 0 }, {
      x: () => innerWidth - prideItems.reduce((w, el) => w + el.getBoundingClientRect().width, 0),
      ease: "none",
      scrollTrigger: {
        trigger: "#pride_sticky", start: "100% 50%", end: "bottom bottom", endTrigger: "#pride_inner",
        scrub: 0.1, anticipatePin: 1, invalidateOnRefresh: true,
        onEnter: () => menu.classList.add("is-hidden"),
        onEnterBack: () => menu.classList.add("is-hidden"),
        onLeave: () => menu.classList.remove("is-hidden"),
        onLeaveBack: () => menu.classList.remove("is-hidden"),
      },
    });
    $$(".js-pride-link").forEach((t) => ScrollTrigger.create({ trigger: t, containerAnimation: prideTween, start: "top 70%", toggleClass: "is-active" }));

    // Exhibition hall
    $$(".js-studio-item").forEach((t) => gsap.fromTo(t, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: t, start: "top 100%", end: "top 60%", scrub: true } }));
    ScrollTrigger.create({
      trigger: "#studio_sticky", start: "0% 100%", endTrigger: "#studio_inner", end: "100% 75%",
      onEnter: () => menu.classList.add("is-hidden"),
      onEnterBack: () => menu.classList.add("is-hidden"),
      onLeave: () => menu.classList.remove("is-hidden"),
      onLeaveBack: () => menu.classList.remove("is-hidden"),
    });
    // After the event cards are fully visible, pauses one beat for .6 of a screen
    ScrollTrigger.create({
      trigger: "#studio_event_wrap",
      start: () => ($("#studio_event_wrap").offsetHeight < innerHeight ? "center center" : "bottom bottom"),
      end: () => "+=" + innerHeight * 0.6,
      pin: true, anticipatePin: 1, refreshPriority: 1, invalidateOnRefresh: true,
    });
    ScrollTrigger.create({
      trigger: "#studio_info", start: "0% 80%", end: "100% 0%",
      onEnter: () => $$("#studio_sticky, #studio_ttl").forEach((el) => el.classList.add("is-active")),
      onLeaveBack: () => $$("#studio_sticky, #studio_ttl").forEach((el) => el.classList.remove("is-active")),
    });
    mm.add("(min-width: 769px)", () => {
      gsap.to("#studio_kv", { scale: 1.06, immediateRender: false, scrollTrigger: { trigger: "#studio_inner", start: "top top", end: "20% 25%", scrub: true } });
      gsap.set("#studio_bg", { opacity: 0 });
      gsap.fromTo("#studio_bg", { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: "#studio_lead", start: "top 80%", end: "top 50%", scrub: true } });
    });
    mm.add("(max-width: 768px)", () => {
      gsap.set("#studio_bg", { opacity: 0 });
      gsap.fromTo("#studio_bg", { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: "#studio_lead", start: "top 50%", end: "0% 0%", scrub: true } });
      const centerOf = (el) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; };
      gsap.fromTo("#studio_kv", {
        x: () => innerWidth / 2 - centerOf($("#studio_kv_start")),
      }, {
        x: () => {
          const s = centerOf($("#studio_kv_start")), e = centerOf($("#studio_kv_end"));
          return innerWidth / 2 - s - (e - s);
        },
        ease: "none",
        scrollTrigger: { trigger: "#studio_sticky", endTrigger: "#studio_inner", start: "50% 50%", end: "100% 100%", scrub: 0.1, anticipatePin: 1, invalidateOnRefresh: true },
      });
    });

    // Video slot grows
    const cmVideo = $("#cm_video");
    gsap.fromTo("#cm_thumb", { opacity: 0, scale: 0.4 }, {
      opacity: 1, scale: 1, ease: "expo.out", immediateRender: false,
      scrollTrigger: { trigger: "#cm_sticky", endTrigger: "#cm_wrap", start: "50% 50%", end: "50% 50%", scrub: 1.2, onEnter: () => cmVideo.play().catch(() => {}) },
    });
    mm.add("(min-width: 769px)", () => {
      gsap.fromTo(cmVideo, { scale: 1 }, { scale: 1.08, ease: "expo.out", immediateRender: false, scrollTrigger: { trigger: "#cm_space2", start: "0% 50%", end: "75% 50%", scrub: 1.2 } });
    });
    mm.add("(max-width: 768px)", () => {
      gsap.fromTo(cmVideo, { scale: 1 }, { scale: 1.2, ease: "expo.out", immediateRender: false, scrollTrigger: { trigger: "#cm_space2", start: "0% 50%", end: "75% 50%", scrub: 1.2 } });
    });
    gsap.fromTo("#cm_thumb_inner", { scale: 1 }, { scale: 0.87, ease: "expo.out", immediateRender: false, scrollTrigger: { trigger: "#cm_space2", start: "50% 50%", end: "75% 50%", scrub: 1.2 } });
    ScrollTrigger.create({
      trigger: "#cm_btn_wrap", start: "49% 50%", end: "100% 0%",
      onEnter: () => $("#movie").classList.add("is-active"),
      onLeaveBack: () => $("#movie").classList.remove("is-active"),
    });
  }

  function initCmButton() {
    const mq = matchMedia("(hover: hover)");
    const wrap = $("#cm_btn_wrap");
    const btn = $("#cm_btn");
    const enter = () => btn.classList.add("is-hover");
    const leave = () => btn.classList.remove("is-hover");
    const toggle = () => btn.classList.toggle("is-click");
    const bind = (m) => {
      wrap.removeEventListener("mouseenter", enter);
      wrap.removeEventListener("mouseleave", leave);
      btn.removeEventListener("click", toggle);
      if (m.matches) {
        btn.classList.remove("is-click");
        wrap.addEventListener("mouseenter", enter);
        wrap.addEventListener("mouseleave", leave);
      } else {
        btn.addEventListener("click", toggle);
      }
    };
    bind(mq);
    mq.addEventListener("change", bind);
  }

  // Gallery — expand (jQuery slideToggle 400 = swing = sine.inOut), modal Swiper (fade 600)
  function initGallery() {
    const slide = (panel, open) => {
      gsap.killTweensOf(panel);
      if (open) {
        panel.style.display = "block";
        const h = panel.scrollHeight;
        gsap.fromTo(panel, { height: 0 }, { height: h, duration: reduce ? 0 : 0.4, ease: "sine.inOut", onComplete: () => { panel.style.height = ""; ScrollTrigger.refresh(); } });
      } else {
        gsap.to(panel, { height: 0, duration: reduce ? 0 : 0.4, ease: "sine.inOut", onComplete: () => { panel.style.display = "none"; panel.style.height = ""; ScrollTrigger.refresh(); } });
      }
    };
    $$(".js-acc-trigger").forEach((t) => t.addEventListener("click", () => {
      const panel = $("#" + t.getAttribute("aria-controls"));
      const open = getComputedStyle(panel).display === "none";
      t.setAttribute("aria-expanded", String(open));
      slide(panel, open);
    }));
    $$(".js-acc-close").forEach((b) => b.addEventListener("click", () => slide(b.closest(".js-acc-panel"), false)));

    const swipers = {};
    $$(".js-gm-wrap").forEach((wrap) => {
      const modal = wrap.closest(".ct-modal");
      const thumbs = $$(".js-gm-thumb", modal);
      swipers[modal.id] = new Swiper($(".js-gm-slider", modal), {
        effect: "fade",
        speed: 600,
        observer: true,
        slidesPerView: "auto",
        navigation: { nextEl: $(".js-gm-next", wrap), prevEl: $(".js-gm-prev", wrap) },
        on: {
          afterInit: (s) => { thumbs.forEach((x) => x.classList.remove("is-current")); thumbs[s.realIndex]?.classList.add("is-current"); },
          slideChange: (s) => { thumbs.forEach((x) => x.classList.remove("is-current")); thumbs[s.realIndex]?.classList.add("is-current"); },
        },
      });
      thumbs.forEach((th, i) => th.addEventListener("click", () => swipers[modal.id]?.slideTo(i, 300)));
    });

    MicroModal.init({
      disableScroll: true,
      awaitOpenAnimation: true,
      awaitCloseAnimation: true,
      onShow: () => lenis.stop(),
      onClose: (modal) => {
        lenis.start();
        const v = modal.querySelector("video");
        if (v) { v.pause(); v.currentTime = 0; }
      },
    });
    $$(".js-gallery-thumb").forEach((th) => th.addEventListener("click", () => {
      const id = th.dataset.modal;
      const index = $$(`.js-gallery-thumb[data-modal="${id}"]`).indexOf(th);
      MicroModal.show(id, { disableScroll: true, awaitOpenAnimation: true, awaitCloseAnimation: true, onShow: () => lenis.stop(), onClose: () => lenis.start() });
      swipers[id]?.slideTo(index, 0);
    }));
  }

  // Cocoon drawing — a bundle of threads flowing from top to bottom
  function buildMayu() {
    const g = $(".ct-mayu__strands");
    if (!g) return;
    const NS = "http://www.w3.org/2000/svg";
    const n = 54;
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * 2 - 1;
      const wob = Math.sin(i * 1.7) * 14;
      const d = `M${352 + t * 60} 10 C${352 + t * 330 + wob} 240 ${352 + t * 320 - wob} 600 ${352 + t * 210} 812`;
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("class", i % 3 === 0 ? "is-lo" : "is-hi");
      p.setAttribute("stroke-width", (2 + Math.abs(Math.sin(i * 2.3)) * 7).toFixed(1));
      p.setAttribute("opacity", (0.18 + Math.abs(Math.cos(i * 1.3)) * 0.45).toFixed(2));
      g.appendChild(p);
    }
  }

  function buildGallery() {
    const list = $("#gallery_list");
    const modals = $("#modals");
    const rows = [
      { label: "Side view of a new car in front of vermilion fabric · sunset glow · landscape strip 5:1", bg: "Row 1 background photo · vermilion cloth · full screen", n: 12 },
      { label: "Rear view of a car draped in vermilion cloth · red lighting · horizontal strip", bg: "Row 2 background photo · red cloth · full screen", n: 8 },
      { label: "White cloth and black vintage sedan · black and white · wide strip", bg: "Row 3 background photo · black-and-white cloth · full screen", n: 8 },
      { label: "Chrome trim macro · vermilion reflection · landscape strip", bg: "Row 4 background photo · chrome close-up · full screen", n: 6 },
    ];
    rows.forEach((row, r) => {
      const num = String(r + 1).padStart(2, "0");
      const id = `modal_gallery_${r + 1}`;
      const thumbs = Array.from({ length: row.n }, (_, i) =>
        `<button class="ct-thumb js-gallery-thumb" type="button" data-modal="${id}" data-bg-label="Photo ${num}-${String(i + 1).padStart(2, "0")} Background" aria-label="Photo ${i + 1} View Large"><span class="wf-img" data-label="Photo ${i + 1}"></span></button>`).join("");
      list.insertAdjacentHTML("beforeend", `
        <section class="ct-acc" aria-labelledby="gallery${num}">
          <h3 id="gallery${num}">
            <button class="ct-acc__trigger ct-en js-acc-trigger" type="button" aria-controls="panel${num}" aria-expanded="false" data-bg-label="${row.bg}">
              <span class="ct-acc__trigger-img">
                <span class="ct-acc__info js-reveal-gallery">
                  <span class="ct-acc__photo wf-img" data-label="${row.label}"></span>
                  <span class="ct-acc__num">${num}</span>
                  <span class="ct-acc__more"><span class="ct-acc__more-icon">+</span><span class="ct-acc__more-txt">View</span><span class="ct-acc__more-line"></span></span>
                </span>
              </span>
            </button>
          </h3>
          <div id="panel${num}" class="ct-acc__panel js-acc-panel">
            <div class="ct-acc__panel-inner">
              <button type="button" class="ct-acc__close js-acc-close" aria-label="Fold"><span class="ct-acc__close-icon"></span></button>
              <div class="ct-thumbs-wrap"><div class="ct-thumbs">${thumbs}<p class="ct-gallery__copy ct-en" data-label="Your one-line English photo caption here">＊Caption for this photo</p></div></div>
            </div>
          </div>
        </section>`);
      const slides = Array.from({ length: row.n }, (_, i) =>
        `<div class="swiper-slide"><div class="wf-img" data-label="Gallery ${num} · Photo ${i + 1} · Tea and Cloth · Landscape 16:9"></div><p class="ct-gm__caption">${i % 3 === 2 ? '<span class="is-accent">Model name · Edition name</span>' : ""}<span class="is-dim">* One-line photo caption</span></p></div>`).join("");
      const mthumbs = Array.from({ length: row.n }, (_, i) =>
        `<button class="ct-gm__thumb js-gm-thumb" type="button" aria-label="Photo ${i + 1}"><span class="wf-img" data-label="${i + 1}"></span></button>`).join("");
      modals.insertAdjacentHTML("beforeend", `
        <div class="modal micromodal-slide ct-modal" id="${id}" aria-hidden="true">
          <div class="ct-modal__overlay" tabindex="-1" data-micromodal-close data-lenis-prevent>
            <div class="ct-modal__container" role="dialog" aria-modal="true" aria-label="Gallery ${num}">
              <div class="ct-modal__inner">
                <div class="ct-gm__wrap">
                  <div class="ct-gm__slider-wrap js-gm-wrap">
                    <div class="swiper ct-gm__slider js-gm-slider"><div class="swiper-wrapper">${slides}</div></div>
                    <div class="ct-gm__controls ct-en">
                      <button class="ct-gm__prev ct-roll js-gm-prev" type="button"><span class="ct-roll__wrap" aria-hidden="true"><span class="ct-roll__before" data-letters>Back</span><span class="ct-roll__after">Back</span></span><span class="sr-only">Back</span><span class="ct-gm__arrow"></span></button>
                      <button class="ct-gm__next ct-roll js-gm-next" type="button"><span class="ct-gm__arrow"></span><span class="ct-roll__wrap" aria-hidden="true"><span class="ct-roll__before" data-letters>Next</span><span class="ct-roll__after">Next</span></span><span class="sr-only">Next</span></button>
                    </div>
                  </div>
                  <div class="ct-gm__thumbs">${mthumbs}</div>
                </div>
                <button class="ct-modal__close" type="button" aria-label="Close" data-micromodal-close><span class="ct-modal__close-icon"></span></button>
              </div>
            </div>
          </div>
        </div>`);
    });
    split(list);
    split(modals);
  }
})();
