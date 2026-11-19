// Loader·smooth scroll·phone menu — same order and values as the original Loading.astro·Layout.astro.
(() => {
  const html = document.documentElement, body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loading = document.getElementById("gg-loading");
  const logo = document.getElementById("gg-loading-logo");
  const count = document.getElementById("gg-loading-count");
  const ink = getComputedStyle(html).getPropertyValue("--kf-contrast-ink").trim();
  const done = () => { body.classList.add("is-loaded"); loading && loading.classList.add("is-loaded"); };
  const unlock = () => { html.classList.remove("is-lock"); body.classList.remove("is-lock"); window.SG && SG.lenis && SG.lenis.start(); };

  // Loader: locks the document, and once everything is loaded the number counts 1→100 (2s power3.inOut) → the panel goes transparent (css) 1.5s later over 2.5s → the logo turns white 1.5s after that over 2.5s →
  // Rests 2s, fades out over 1s while rising 100px → releases the lock
  if (loading) {
    html.classList.add("is-lock");
    body.classList.add("is-lock");
    scrollTo(0, 0);
    const start = () => {
      if (reduce || !window.gsap) { count.textContent = 100; done(); if (window.gsap) gsap.set(logo, { opacity: 0 }); else logo.style.opacity = 0; unlock(); return; }
      const t = { value: 1 };
      gsap.timeline()
        .to(t, { value: 100, duration: 2, ease: "power3.inOut", onUpdate: () => { count.textContent = Math.round(t.value); }, onComplete: done })
        .to(logo, { duration: 2.5, color: ink, ease: "power4.out" }, "+=1.5")
        .to(logo, { duration: 1, opacity: 0, ease: "power2.out" }, "+=2")
        .to(logo, { duration: 1, y: -100, ease: "power2.out", onComplete: unlock }, "<");
    };
    if (document.readyState === "complete") start(); else addEventListener("load", start);
  }

  // Smooth scroll — runs lenis 1.0.42 defaults on the GSAP ticker and syncs ScrollTrigger
  const SG = (window.SG = { lenis: null });
  if (!reduce && window.Lenis && window.gsap) {
    SG.lenis = new Lenis();
    if (window.ScrollTrigger) SG.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => SG.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (body.classList.contains("is-lock")) SG.lenis.stop();
  }

  // Phone menu: the two lines bend ±15° and the panel turns on in .3s. The document is pinned in place
  const toggle = document.getElementById("gg-menu-toggle"), menu = document.getElementById("gg-menu");
  let pos = 0;
  const openMenu = () => { pos = scrollY; body.classList.add("is-menu"); toggle.classList.add("is-active"); menu.classList.add("is-active"); toggle.setAttribute("aria-expanded", "true"); };
  const closeMenu = () => { body.classList.remove("is-menu"); toggle.classList.remove("is-active"); menu.classList.remove("is-active"); toggle.setAttribute("aria-expanded", "false"); scrollTo(0, pos); };
  if (toggle && menu) toggle.addEventListener("click", () => (toggle.classList.contains("is-active") ? closeMenu() : openMenu()));

  // Inner # links scroll smoothly to that spot (original window.scrollTo smooth). Inside a menu, close it first and then go
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const t = id === "#top" ? html : id.length > 1 && document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    if (menu && menu.contains(a) && toggle.classList.contains("is-active")) closeMenu();
    const top = id === "#top" ? 0 : t.getBoundingClientRect().top + scrollY;
    // Like the original, browser default smooth scroll — lenis follows the changed position to stay in sync
    scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }));
})();
