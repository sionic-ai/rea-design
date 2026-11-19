// Shared by all pages: Lenis (original version 1.0.42 · lerp .2), first-visit logo curtain, and page transition where the page blurs out when a link is clicked,
// Drawer menu, scroll reveal (top·blur·text — once past the bottom 20% of the screen), sub-header title rise, photos that follow upward late (scrub 3).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.querySelector("#page");
  const head = document.querySelector(".ab-head");

  if (!reduce && window.Lenis) {
    // Original: only one browser uses lerp .8, all others use lerp .2 · wheelMultiplier 1
    const lenis = (window.lenis = new Lenis({ lerp: 0.2, wheelMultiplier: 1 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Sub head: .3s after entering, the English title rises from 105% below in 1.5s power2.out, and the head photo is revealed with an ink-bleed mask
  const lowerIn = () => setTimeout(() => {
    document.querySelector("[data-lower-figure]")?.dispatchEvent(new Event("fx:play"));
    const t = document.querySelector("[data-lower-title]");
    if (t) gsap.fromTo(t, { y: 0, yPercent: 105 }, { y: 0, yPercent: 0, duration: reduce ? 0 : 1.5, ease: "power2.out" });
  }, 300);

  // Arriving from the same site, only the panel fades in over .6s, on a first visit, show the logo curtain (logo on at 1s, off at 3s after .8s) — the original has a logo curtain on every page
  const intro = document.querySelector(".ab-intro");
  const fromSite = document.referrer && new URL(document.referrer).origin === location.origin && document.referrer !== location.href;
  if (reduce) {
    gsap.set([page, head], { opacity: 1 });
    intro?.remove();
    lowerIn();
  } else if (!fromSite && intro) {
    gsap.set([page, head], { opacity: 1 });
    const logo = intro.querySelector(".ab-intro__logo");
    gsap.timeline()
      .to(logo, { opacity: 1, duration: 1, delay: 0.3, ease: "power4.out" })
      .to(logo, { opacity: 0, duration: 3, delay: 0.8, ease: "power4.out", onComplete: () => intro.remove() })
      .to(intro, { opacity: 0, duration: 3, ease: "power4.out", onStart: lowerIn }, "<");
  } else {
    intro?.remove();
    gsap.set(head, { opacity: 1 });
    gsap.to(page, { opacity: 1, duration: 0.6, delay: 0.1, ease: "power4.out", onStart: lowerIn });
  }

  // Page transition: clicking a same-site link fades the plate out over .6s expo.inOut after .3s (1s for links inside the drawer), then navigates
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    if (a.getAttribute("href").startsWith("#")) return;
    e.preventDefault();
    gsap.to(page, { opacity: 0, ease: "expo.inOut", duration: reduce ? 0 : 0.6, delay: reduce ? 0 : a.closest(".ab-drawer") ? 1 : 0.3, onComplete: () => { location.href = a.href; } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(page, { opacity: 1 }); });

  // Drawer: on open, menu cells turn on in sequence (.04s) over .6s after a .3s delay, and on close they turn off over .3s and then the panel goes down
  const drawer = document.querySelector(".ab-drawer");
  const burgers = [...document.querySelectorAll(".ab-burger")];
  const items = drawer ? [...drawer.querySelectorAll("[data-drawer-item]")] : [];
  let open = false, tween;
  const setOpen = (on) => {
    if (on === open) return;
    open = on;
    // In the original only the button inside the drawer turns into an X, and the header button stays as is, covered by the drawer
    drawer.querySelector(".ab-burger")?.setAttribute("aria-expanded", String(on));
    burgers[0]?.setAttribute("aria-expanded", String(on));
    if (on) {
      drawer.classList.add("is-open");
      drawer.scrollTop = 0;
      window.lenis?.stop();
      tween = gsap.fromTo(items, { opacity: 0 }, { opacity: 1, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: { each: 0.04 } });
    } else {
      tween?.pause();
      gsap.fromTo(items, { opacity: 1 }, { opacity: 0, ease: "power1.out", duration: 0.3, stagger: { each: 0.002 }, onComplete: () => { drawer.classList.remove("is-open"); window.lenis?.start(); } });
    }
  };
  burgers.forEach((b) => b.addEventListener("click", () => setOpen(!open)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  // Scroll reveal — plays once when passing the lower 20% of the screen. Text rises from 100% below per character over .5s (.03s between characters)
  const show = (el) => {
    if (el.dataset.reveal === "text") {
      const chars = el.querySelectorAll(".ch");
      gsap.fromTo(chars, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power1.inOut", duration: +(el.dataset.duration || 0.5), delay: +(el.dataset.delay || 0), stagger: { each: +(el.dataset.each || 0.03) }, onComplete: () => el.classList.add("is-visible") });
      return;
    }
    setTimeout(() => el.classList.add("is-visible"), +(el.dataset.delay || 0) * 1000);
  };
  document.querySelectorAll('[data-reveal="text"]').forEach((el) => {
    el.innerHTML = [...el.textContent].map((c) => `<span class="ch">${c}</span>`).join("");
  });
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } }), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
  document.querySelectorAll("[data-reveal]").forEach((el) => (reduce ? el.classList.add("is-visible") : io.observe(el)));

  // The image inside the photo panel follows upward late by the panel height (scrub 3)
  if (!reduce) {
    document.querySelectorAll("[data-parallax]").forEach((box) => {
      const t = box.querySelector("[data-parallax-target]");
      if (t) gsap.fromTo(t, { y: 0 }, { y: () => -box.offsetHeight, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: 3, invalidateOnRefresh: true } });
    });
  }
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
