// Shared by all pages: Lenis, loader, page transition, menu drawer, letter-roll hover, scroll reveal, photo parallax.
// Values are copied as-is from the original bundle (loader timeline, drawer items at .04 stagger, .6s transition, etc.)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("linkhover", ".115,.405,.24,1");

  // Same Lenis 1.0.10 as the original (loaded as window.lenis) — only one browser uses lerp .8 and wheel 1 so it follows almost instantly, running on its own rAF
  let lenis = null;
  const LenisCtor = window.Lenis || window.lenis;
  if (!reduce && LenisCtor) {
    const ua = navigator.userAgent.toLowerCase();
    const brands = navigator.userAgentData?.brands;
    const safari = brands?.length ? brands.some((b) => b.brand === "Safari") : ua.includes("safari") && !ua.includes("chrome");
    lenis = new LenisCtor({ lerp: safari ? 0.8 : 0.1, wheelMultiplier: safari ? 1 : 1.2 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  window.anLenis = lenis;

  const catchIn = () => {
    const c = document.querySelector("[data-hero-catch]");
    if (c) gsap.to(c, { opacity: 1, duration: 0.6, delay: 0.1, ease: "power1.out" });
  };

  // Loader only on first entry from outside — when moving between our own pages, only the body floats up
  const fromInside = sessionStorage.getItem("an-inside") === "1";
  sessionStorage.removeItem("an-inside");
  const intro = document.querySelector("[data-intro]");
  if (reduce) {
    root.classList.add("an-ready", "an-no-intro");
    gsap.set("[data-hero-catch]", { opacity: 1 });
  } else if (intro && !fromInside) {
    root.classList.add("an-ready");
    gsap.to("[data-intro-circle]", { rotation: 360, duration: 10, repeat: -1, ease: "none" });
    const tl = gsap.timeline();
    tl.to("[data-intro-circle]", { opacity: 1, duration: 1, ease: "power4.out" })
      .to("[data-intro-logo]", { opacity: 1, duration: 1, ease: "power4.out" })
      .to("[data-intro-logo]", { yPercent: -10, opacity: 0, duration: 1.2, ease: "expo.out" }, "-=.2")
      .to("[data-intro-circle]", { opacity: 0, duration: 1.2, ease: "power4.out" }, "-=1.2")
      .to("[data-intro-first]", { yPercent: -100, duration: 1, delay: 0.5, ease: "power4.out" }, "-=1")
      .to("[data-intro-second]", {
        yPercent: -100, duration: 0.8, delay: 0.3, ease: "expo.inOut",
        // The original doesn’t clear the mandala rotation (repeat -1) even after hiding, so the GSAP clock is always awake — that’s why hover tweens move on the very next frame. Kept for the same tempo
        onComplete: () => { intro.style.display = "none"; catchIn(); },
      }, "-=1.3");
  } else {
    root.classList.add("an-no-intro");
    gsap.fromTo("#page", { opacity: 0 }, {
      opacity: 1, duration: 0.6, delay: 0.1, ease: "power4.out",
      onComplete: () => { root.classList.add("an-ready"); gsap.set("#page", { clearProps: "opacity" }); catchIn(); },
    });
  }
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set("#page", { opacity: 1 }); });

  // Page transition: the whole body blurs in .6 seconds, then navigates (links inside the drawer wait 1 second for the drawer to close)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href) || a.target === "_blank") return;
    e.preventDefault();
    sessionStorage.setItem("an-inside", "1");
    if (reduce) { location.href = href; return; }
    const delay = a.hasAttribute("data-drawer-close") ? 1 : 0.3;
    if (a.hasAttribute("data-drawer-close")) closeDrawer();
    gsap.to("#page", { opacity: 0, ease: "expo.inOut", duration: 0.6, delay, onComplete: () => { location.href = href; } });
  });

  // Menu drawer — opened with micromodal like the original (body scroll locks while open, and it is hidden only after the close animation ends). Items float up after .3s at .04s intervals
  const drawer = document.querySelector("[data-drawer]");
  const burgers = document.querySelectorAll("[data-burger]");
  let opened = false;
  let itemsTween = null;
  const expanded = (v) => burgers.forEach((b) => b.setAttribute("aria-expanded", String(v)));
  const items = () => drawer.querySelectorAll("[data-drawer-item]");
  function openDrawer() {
    if (!drawer || opened || !window.MicroModal) return;
    MicroModal.show(drawer.id, {
      disableScroll: true, disableFocus: true, awaitOpenAnimation: true, awaitCloseAnimation: true,
      onShow: () => {
        setTimeout(() => expanded(true), 200);
        opened = true;
        lenis?.stop();
        itemsTween = gsap.fromTo(items(), { opacity: 0, y: 20 }, { opacity: 1, y: 0, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: { each: 0.04 } });
      },
      onClose: () => { opened = false; expanded(false); lenis?.start(); },
    });
  }
  function closeDrawer() {
    if (!drawer || !opened) return;
    itemsTween?.pause();
    gsap.fromTo(items(), { opacity: 1, y: 0 }, { opacity: 0, y: -20, duration: 0.3, ease: "power1.out", stagger: { each: 0.002 }, onComplete: () => MicroModal.close(drawer.id) });
  }
  burgers.forEach((b) => b.addEventListener("click", () => (opened ? closeDrawer() : openDrawer())));
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  // Link whose letters roll up and turn into the same letters
  if (!touch && !reduce) {
    document.querySelectorAll("[data-roll]").forEach((el) => {
      const t = el.querySelector("[data-roll-target]") || el;
      const html = t.innerHTML;
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", t.textContent.trim());
      t.classList.add("an-roll__t");
      t.innerHTML = `<span class="an-roll__a" aria-hidden="true">${html}</span><span class="an-roll__b" aria-hidden="true">${html}</span>`;
      const a = t.querySelector(".an-roll__a"), b = t.querySelector(".an-roll__b");
      gsap.set(b, { yPercent: 150 });
      el.addEventListener("mouseenter", () => {
        // Original uses a curve "expo.inout"(lowercase) written that way so GSAP can’t find it and it runs on the default curve power1.out — measured, that is the shape, so it stays
        gsap.fromTo(a, { yPercent: 0, opacity: 1 }, { yPercent: -105, opacity: 0, duration: 0.6, ease: "power1.out" });
        gsap.fromTo(b, { yPercent: 105 }, { yPercent: 0, duration: 0.4, ease: "linkhover" });
      });
    });
  }

  // Scroll reveal: once, 20% before the bottom of the screen
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const d = parseFloat(en.target.dataset.delay || 0) * 1000;
      setTimeout(() => en.target.classList.add("is-visible"), d);
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -20% 0px", threshold: 0 });
  document.querySelectorAll("[data-reveal]").forEach((el) => (reduce ? el.classList.add("is-visible") : io.observe(el)));

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((box) => {
      const img = box.querySelector("[data-parallax-img]");
      if (!img) return;
      gsap.set(img, { scale: 1.18 });
      gsap.fromTo(img, { yPercent: 0 }, {
        yPercent: -9, ease: "none",
        scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: 1 },
      });
    });
  });

  // In-page navigation (#) scrolls with Lenis, stopping short by the header band height
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const off = document.querySelector(".an-header__wrap")?.offsetHeight || 0;
    lenis ? lenis.scrollTo(t, { offset: -off }) : scrollTo({ top: t.getBoundingClientRect().top + scrollY - off });
  }));

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = "0000"));
})();
