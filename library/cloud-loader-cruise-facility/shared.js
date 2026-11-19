// Motion spanning several sections — original main.js values as is for Transition · Lenis · LinkHoverAnimation · Drawer · Header · ScrollTrigger (once when visible) · Footer · Tab
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.ontouchstart !== undefined && navigator.maxTouchPoints > 0;
  const page = document.getElementById("page");
  const headers = document.querySelectorAll("[data-header]");
  CustomEase.create("linkhover", ".115,.405,.24,1");
  CustomEase.create("LogoEase", ".73,.21,.25,1.02");

  // Smooth scroll — original lerp .2 (.8 on some browsers), wheel multiplier 1
  let lenis = null;
  if (!reduce) {
    const safari = /safari/i.test(navigator.userAgent) && !/chrome|chromium/i.test(navigator.userAgent);
    lenis = new Lenis({ lerp: safari ? 0.8 : 0.2, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.siteLenis = lenis;

  // In-section table of contents (#) — offset by header height, smooth scroll
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((a) => a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const off = -(headers[0]?.clientHeight || 0);
    lenis ? lenis.scrollTo(target, { offset: off }) : target.scrollIntoView();
  }));

  // Letter roll — first set −105% · blur .6s, second set 105% → 0 .4s linkhover. On leaving it does not reverse, it rolls again on the next hover.
  // The original writes the first curve as ”expo.inout” (lowercase), so GSAP cannot find the name and runs the default power1.out — the measured values use that curve too, so it stays as is
  if (!touch) {
    document.querySelectorAll("[data-hover-animation]").forEach((el) => {
      const first = el.querySelectorAll("[data-hover-animation-first-el]"), second = el.querySelectorAll("[data-hover-animation-second-el]");
      if (!first.length || !second.length) return;
      el.addEventListener("mouseenter", () => {
        gsap.fromTo(first, { y: "0%", opacity: 1 }, { y: "-105%", opacity: 0, duration: 0.6, ease: "power1.out" });
        gsap.fromTo(second, { y: "105%" }, { y: "0%", duration: 0.4, ease: "linkhover" });
      });
    });
  }

  // Language picker
  document.querySelectorAll("[data-language]").forEach((box) => {
    box.querySelector("[data-language-switch]")?.addEventListener("click", (e) => { e.stopPropagation(); box.classList.toggle("is-open"); });
  });
  document.addEventListener("click", () => document.querySelectorAll("[data-language].is-open").forEach((b) => b.classList.remove("is-open")));

  // Drawer menu — micromodal. .2s after opening the hamburger turns into an X, items rise 15px from below after .3s, staggered .04s, over .6s
  const drawer = document.getElementById("js-drawer");
  let opened = false;
  const expanded = (v) => document.querySelectorAll("[data-hamburger]").forEach((h) => h.setAttribute("aria-expanded", String(v)));
  const openDrawer = () => {
    if (opened) return;
    MicroModal.show("js-drawer", {
      disableScroll: true,
      awaitOpenAnimation: true,
      awaitCloseAnimation: true,
      onShow: () => {
        setTimeout(() => expanded(true), 200);
        opened = true;
        if (!reduce) gsap.fromTo("[data-drawer-items]", { opacity: 0, y: "15px" }, { opacity: 1, y: 0, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: { each: 0.04 } });
        drawer.querySelector(".modal__container").scrollTop = 0;
      },
      onClose: () => { expanded(false); opened = false; },
    });
  };
  const closeDrawer = () => opened && MicroModal.close("js-drawer");
  document.querySelectorAll("[data-hamburger]").forEach((h) => h.addEventListener("click", () => (opened ? closeDrawer() : openDrawer())));
  drawer?.querySelectorAll("[data-drawer-close]").forEach((a) => a.addEventListener("click", closeDrawer));

  // Once visible — when it touches the band excluding the bottom 20% of the screen, is-visible is added (css 1s)
  const io = new IntersectionObserver((list) => list.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target, d = +(el.dataset.delay || 0);
    setTimeout(() => el.classList.add("is-visible"), d * 1000);
    io.unobserve(el);
  }), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
  document.querySelectorAll("[data-scroll-trigger]").forEach((el) => (reduce ? el.classList.add("is-visible") : io.observe(el)));

  // Tab — the chosen panel rises from 3% below over 2s expo.out (css)
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    const items = tab.querySelectorAll("[data-tab-item]"), panes = tab.querySelectorAll("[data-tab-pane]");
    // Like the original, pressing an already selected tab again reopens the panel
    items.forEach((it, i) => it.addEventListener("click", () => {
      items.forEach((x, n) => { x.classList.toggle("is-active", n === i); x.setAttribute("aria-selected", String(n === i)); });
      panes.forEach((p) => p.classList.remove("is-active"));
      void panes[i]?.offsetWidth;
      panes[i]?.classList.add("is-active");
    }));
  });

  // Header: a white glass pill when the section after the hero ([data-not-top]) rises above by the header height
  addEventListener("load", () => setTimeout(() => {
    const notTop = document.querySelector("[data-not-top]");
    if (notTop && headers.length) {
      const on = () => headers.forEach((h) => h.classList.add("is-solid")), off = () => headers.forEach((h) => h.classList.remove("is-solid"));
      off();
      ScrollTrigger.create({ trigger: notTop, start: () => `-${headers[0].clientHeight}px top`, endTrigger: document.body, end: "bottom top", onEnter: on, onEnterBack: on, onLeave: off, onLeaveBack: off });
    }
    // Footer wordmark — rises from below 100% while the footer comes in (scrub 1.4)
    const foot = document.querySelector("[data-footer]"), logo = document.querySelector("[data-footer-logo]");
    if (foot && logo && !reduce) {
      gsap.fromTo(logo, { yPercent: 100 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: foot, start: () => `top bottom+=${logo.clientHeight}px`, end: "bottom bottom", scrub: 1.4, invalidateOnRefresh: true } });
    }
  }, 200));

  // Page transition — for same-site links the cover goes off with .6s expo.inOut (after .3s, or after 1s for drawer links) and then navigates
  const sameSite = (a) => {
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) return false;
    if (a.target === "_blank" || a.target === "_new") return false;
    const url = new URL(a.href, location.href);
    return url.origin === location.origin && !/\.(xlsx?|docx?|pptx?|pdf|jpe?g|png|gif|svg)$/i.test(url.pathname);
  };
  document.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => {
    if (!sameSite(a) || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (reduce) { location.href = a.href; return; }
    gsap.to(page, { opacity: 0, ease: "expo.inOut", duration: 0.6, delay: a.hasAttribute("data-drawer-close") ? 1 : 0.3, onComplete: () => { location.href = a.href; } });
  }));
  addEventListener("pageshow", (e) => { if (e.persisted) { gsap.set(page, { opacity: 1 }); gsap.set(headers, { opacity: 1 }); } });

  // On open — if coming from outside or refreshing, the first page gets the cloud loader, and if arriving from within, only the first page’s cover turns on in .6s (TransitionEnd at its end)
  const endTransition = () => dispatchEvent(new CustomEvent("TransitionEnd"));
  const start = () => {
    const ref = document.referrer;
    const fromInside = ref && new URL(ref).origin === location.origin && ref !== location.href;
    const intro = document.querySelector("[data-intro]");
    if (reduce) {
      gsap.set([page, ...headers], { opacity: 1 });
      if (intro) gsap.set(intro, { display: "none" });
      endTransition();
      return;
    }
    if (!fromInside) {
      gsap.set(page, { opacity: 1 });
      if (!intro) { gsap.set(headers, { opacity: 1 }); return; }
      gsap.set(intro, { opacity: 1 });
      gsap.timeline()
        .to("[data-intro-logo]", { opacity: 1, scale: 1, duration: 0.6, delay: 0.1, ease: "power4.out" })
        .to("[data-intro-logo]", { "--intro-tone": 1, duration: 1, delay: 0.3, ease: "linear" }, "-=.4")
        .to("[data-intro-logo]", { opacity: 0, scale: 0.96, duration: 0.6, delay: 0.8, ease: "power4.out" });
      gsap.timeline()
        .to("[data-intro-cloud01]", { scale: 1.5, opacity: 0, duration: 1.5, delay: 0.2, ease: "linear", onComplete: () => { endTransition(); gsap.to(headers, { opacity: 1 }); } })
        .to("[data-intro-cloud02]", { scale: 1.5, opacity: 0, duration: 1.5, ease: "linear" }, "-=.8")
        .to("[data-intro-cloud03]", { scale: 1.5, opacity: 0, duration: 1.5, ease: "linear", onComplete: () => gsap.set(intro, { display: "none" }) }, "-=1.2");
    } else if (intro) {
      gsap.set(intro, { display: "none" });
      gsap.set(headers, { opacity: 1 });
      gsap.to(page, { opacity: 1, duration: 0.6, delay: 0.1, ease: "power4.out", onComplete: endTransition });
    } else {
      gsap.set([page, ...headers], { opacity: 1 });
    }
  };
  if (document.readyState === "complete") start(); else addEventListener("load", start);
})();
