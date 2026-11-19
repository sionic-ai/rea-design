// Shared by all pages — Lenis smooth scroll, loading and transition curtain, menu drawer, underline and wave-rise hover, reveals, header bar color inversion, footer video
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  const isSp = () => matchMedia("(max-width: 768px)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Original Lenis 1.3.15 — lerp .1, smooth only on mouse devices
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: canHover, syncTouch: false, prevent: (el) => el.closest("[data-lenis-prevent]") });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollToEl = (el, offset = 0) => {
    if (lenis) lenis.scrollTo(el, { offset: -offset, duration: 1 });
    else scrollTo({ top: el.getBoundingClientRect().top + scrollY - offset, behavior: reduce ? "auto" : "smooth" });
  };

  const readyCbs = [];
  window.sfSite = { lenis, isSp, reduce, canHover, onReady: (cb) => readyCbs.push(cb), scrollToEl };

  // Menu — can’t be pressed again for 600ms between opening and closing
  const menu = { open: false, lock: false };
  const setMenu = (open) => {
    if (menu.lock || menu.open === open) return;
    menu.lock = true;
    setTimeout(() => (menu.lock = false), 600);
    menu.open = open;
    body.dataset.menu = open ? "1" : "0";
    root.style.overflow = open ? "hidden" : "";
    if (lenis) open ? lenis.stop() : lenis.start();
    const box = document.querySelector(".sf-menu__container");
    if (open && box) box.scrollTo(0, 0);
    document.querySelector(".sf-menubtn")?.setAttribute("aria-expanded", String(open));
    if (!open) ScrollTrigger.refresh();
  };
  body.dataset.menu = "0";
  document.querySelector(".sf-menubtn")?.addEventListener("click", () => setMenu(!menu.open));
  document.querySelectorAll(".js-menu-close").forEach((el) => el.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  // Hover state — the exit starts only after the entering motion (default 1000ms) ends, so the underline doesn’t turn back while half drawn
  if (canHover) {
    document.querySelectorAll("[data-hover]").forEach((el) => {
      const enterMs = +(el.dataset.enter ?? 1000);
      const leaveMs = +(el.dataset.leave ?? 1000);
      let state = "idle", queued = false, timer = null;
      const done = () => {
        clearTimeout(timer);
        if (state === "entering") {
          state = "entered";
          if (queued) leave();
        } else if (state === "leaving") state = "idle";
      };
      const leave = () => {
        state = "leaving";
        queued = false;
        el.dataset.hover = "0";
        clearTimeout(timer);
        timer = setTimeout(done, leaveMs + 100);
      };
      el.dataset.hover = "0";
      el.addEventListener("mouseenter", () => {
        if (state === "entering" || state === "entered") return;
        state = "entering";
        queued = false;
        el.dataset.hover = "1";
        clearTimeout(timer);
        timer = setTimeout(done, enterMs + 50);
      });
      el.addEventListener("mouseleave", () => {
        if (state === "entering") queued = true;
        else if (state === "entered") leave();
      });
    });
  }

  // Appearance — as soon as even one pixel enters the screen, is-cue is added after data-delay (ms)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const d = +((isSp() ? el.dataset.delaySp : el.dataset.delayPc) ?? el.dataset.delay ?? 0);
      setTimeout(() => el.classList.add("is-cue"), d);
      io.unobserve(el);
    });
  }, { threshold: 0 });
  document.querySelectorAll(".sf-obs").forEach((el) => (reduce ? el.classList.add("is-cue") : io.observe(el)));

  // Header row color invert — when a section’s top passes the header row (40px, phone 25px), it switches to that section’s data-invert, and reverses on the way back
  const invertTriggers = () => {
    document.querySelectorAll("[data-invert]").forEach((el) => {
      const v = el.dataset.invert === "0" ? "0" : "1";
      const o = v === "1" ? "0" : "1";
      const line = isSp() ? "25px" : "40px";
      ScrollTrigger.create({ trigger: el, start: `top ${line}`, end: `bottom ${line}`, onEnter: () => (body.dataset.invert = v), onLeaveBack: () => (body.dataset.invert = o) });
      ScrollTrigger.create({ trigger: el, start: "top 94%", end: "bottom 94%", onEnter: () => (body.dataset.invert2 = v), onLeaveBack: () => (body.dataset.invert2 = o) });
    });
  };

  // Footer — when reached, hides the fixed button and plays the footer video
  const footerTrigger = () => {
    const f = document.querySelector(".sf-footer");
    if (!f) return;
    const v = f.querySelector("video");
    ScrollTrigger.create({
      trigger: f,
      start: "top bottom",
      end: "bottom bottom",
      onEnter: () => { body.dataset.footer = "1"; v?.play().catch(() => {}); },
      onLeaveBack: () => { body.dataset.footer = "0"; v?.pause(); },
    });
  };

  // Same-page anchor — stops at header row height plus 104px (phone 74px) above
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    a.addEventListener("click", (e) => {
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const closing = a.classList.contains("js-menu-close");
      setTimeout(() => scrollToEl(t, 80 + (isSp() ? 74 : 104)), closing ? 100 : 0);
    });
  });

  // Page transition — a white curtain covers in 0.2s and lifts in 0.2s on the next page
  const tr = document.querySelector(".sf-transition");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || !/\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    if (reduce || !tr) return void (location.href = href);
    try { sessionStorage.setItem("sf-pte", "1"); } catch (_) {}
    if (menu.open) setMenu(false);
    gsap.set(tr, { opacity: 0 });
    root.dataset.transition = "out";
    gsap.to(tr, { opacity: 1, duration: 0.2, onComplete: () => (location.href = href) });
  }, true);
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    root.dataset.transition = "";
    root.dataset.loading = "0";
    if (tr) tr.style.opacity = "";
  });

  // Haze slide — only while data-fade-group overlaps the screen, advances to the next slide every data-interval (default 5000ms), and on return advances after half a beat
  const fadeGroups = () => {
    document.querySelectorAll("[data-fade-group]").forEach((group) => {
      const slides = [...group.querySelectorAll("[data-fade-slide]")].map((box) => {
        const items = [...box.children];
        const ms = +(group.dataset.interval || 5000);
        const s = { i: 0, timer: null, able: true };
        const show = () => items.forEach((it, k) => it.classList.toggle("is-active", k === s.i));
        const play = (mul = 1) => {
          clearTimeout(s.timer);
          s.timer = setTimeout(() => { s.i = (s.i + 1) % items.length; show(); if (s.able) play(); }, ms * mul);
        };
        show();
        if (!reduce) play();
        return { pause: () => { s.able = false; clearTimeout(s.timer); }, resume: () => { s.able = true; play(0.5); } };
      });
      if (reduce) return;
      const all = (k) => () => slides.forEach((sl) => sl[k]());
      ScrollTrigger.create({ trigger: group, start: "top bottom", end: "bottom top", onEnter: all("resume"), onEnterBack: all("resume"), onLeave: all("pause"), onLeaveBack: all("pause") });
    });
  };

  // Subpage hero photo — pushed 30% down while the plate passes
  const pageFv = () => {
    const fv = document.querySelector(".sf-pfv");
    const img = fv?.querySelector(".sf-pfv__img");
    if (!img || reduce) return;
    ScrollTrigger.create({ trigger: fv, start: "top top", end: "bottom top", onUpdate: (st) => gsap.set(img, { yPercent: gsap.utils.interpolate(0, 30, st.progress) }) });
  };

  // Animated icon — 72 frames at 24fps, played once from the start each time it enters the screen, stops when it leaves
  const lotties = () => {
    const data = window.sfLottieData;
    if (!window.lottie || !data) return;
    const list = [];
    const lio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const it = list[+en.target.dataset.lottieIndex];
        if (!it) return;
        if (en.isIntersecting) {
          const d = +((isSp() ? en.target.dataset.delaySp : en.target.dataset.delayPc) ?? en.target.dataset.delay ?? 0);
          setTimeout(() => { it.goToAndPlay(0, true); en.target.classList.add("is-lottie-cue"); }, d);
        } else if (en.target.classList.contains("is-lottie-cue")) {
          it.pause();
          en.target.classList.remove("is-lottie-cue");
        }
      });
    }, { threshold: 0 });
    document.querySelectorAll("[data-lottie]").forEach((el) => {
      const name = (isSp() && el.dataset.lottieSp) || el.dataset.lottie;
      if (!data[name]) return;
      el.dataset.lottieIndex = list.length;
      const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: el.dataset.loop === "1", autoplay: false, animationData: data[name] });
      list.push(anim);
      if (reduce) anim.goToAndStop(anim.totalFrames - 1, true);
      else lio.observe(el);
    });
  };

  const enter = async () => {
    if (root.dataset.loading === "") {
      root.dataset.loading = "1";
      await wait(1000);
      root.dataset.loading = "0";
      try { sessionStorage.setItem("sf-loaded", "1"); } catch (_) {}
    }
    if (root.dataset.transition === "out" && tr) {
      gsap.set(tr, { opacity: 1 });
      root.dataset.transition = "";
      await new Promise((r) => gsap.to(tr, { opacity: 0, duration: 0.2, onComplete: r }));
      tr.style.opacity = "";
    }
    try { sessionStorage.removeItem("sf-pte"); } catch (_) {}
    root.dataset.loading = "0";
    root.dataset.transition = "";
  };

  const start = async () => {
    invertTriggers();
    footerTrigger();
    fadeGroups();
    pageFv();
    lotties();
    // The original doesn’t lift the loading curtain until all page videos are ready to play (then 50ms) — cut off at 3s at most
    const vids = [...document.querySelectorAll("video")];
    await Promise.all(vids.map((v) => (v.readyState >= 3 ? null : new Promise((r) => { v.addEventListener("canplay", r, { once: true }); setTimeout(r, 3000); }))));
    // The original Brightcove has a gap setting up the player even after playback is ready — that share is set to 250ms
    await wait(50 + 250);
    await wait(300);
    await enter();
    body.dataset.loaded = "1";
    lenis?.start();
    readyCbs.forEach((cb) => cb());
    ScrollTrigger.refresh();
    const hash = location.hash && document.querySelector(location.hash);
    if (hash) scrollToEl(hash, 80 + (isSp() ? 74 : 104));
  };
  if (document.readyState === "complete") start();
  else addEventListener("load", start);
})();
