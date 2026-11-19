// Shared by the whole site — smooth scroll (lenis), loading curtain, page transition curtain, parallax, vertical sentence blur, header bar logo, drawer menu, color swatch slider
(() => {
  const root = document.documentElement, body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEY = "brandPageTransition";
  // The original walks briefly without the logo when arriving by a page transition, but toggles that flag differently per link — the copy always uses the full loader (same length as the original first visit)
  sessionStorage.removeItem(KEY);

  // Original lenis settings as is — 2^(-10t) curve over 1.5s, wheel .8x
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true, wheelMultiplier: 0.8, infinite: false });
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    window.brandLenis = lenis;
  }

  // Loading veil — once images are all loaded the logo brightens in .7s, and the veil lifts 1.2s later over 1.2s and is removed after 3s (if arrived via transition, no logo, .5s)
  const loading = document.querySelector(".j-loading");
  if (loading) {
    if (reduce) loading.remove();
    else {
      lenis && lenis.stop();
      const imgs = [...document.querySelectorAll("img[data-promise]")].map((im) => new Promise((r) => (im.complete ? r() : (im.onload = im.onerror = r))));
      const ready = Promise.race([Promise.all(imgs), new Promise((r) => setTimeout(r, 10000))]);
      const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
      Promise.all([ready, loaded]).then(() => {
        loading.classList.add("is-action");
        body.classList.add("loaded");
        setTimeout(() => { loading.remove(); lenis && lenis.start(); window.dispatchEvent(new CustomEvent("loading:ended")); }, 3000);
      });
    }
  }

  // Page transition — black curtain covers in .7s, navigate after .8s
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    sessionStorage.setItem(KEY, "1");
    body.classList.add("page-transition");
    setTimeout(() => { location.href = href; }, reduce ? 0 : 800);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) body.classList.remove("page-transition"); });

  // Parallax — the original parallax component as is: runs only while the panel (root) is within ±20% of the screen (IntersectionObserver) and while lenis is scrolling
  // Shifts by the plate’s passed share (−top/height, max 1.2) × 100 × coefficient %. Portrait screens use half
  const coef = innerHeight > innerWidth ? 0.5 : 1;
  const roots = [...document.querySelectorAll("[data-parallax-root]")].map((root) => ({ root, items: [...root.querySelectorAll("[data-parallax]")], scales: [...root.querySelectorAll("[data-parallax-scale]")], inView: false }));
  const updateY = (g) => {
    if (!g.inView) return;
    const r = g.root.getBoundingClientRect();
    let t = Math.min((r.top / r.height) * -1, 1.2);
    for (const n of g.items) {
      if (n.hasAttribute("data-parallax-fit")) t = Math.min(t, 0);
      n.style.setProperty("--parallax-y", t * 100 * Number(n.dataset.parallax) * coef + "%");
    }
    for (const n of g.scales) n.style.setProperty("--parallax-scale", String(1 + Math.max(0, ((r.top - innerHeight) / r.height) * -1) * Number(n.dataset.parallaxScale)));
  };
  if (roots.length && !reduce && "IntersectionObserver" in window) {
    roots.forEach((g) => {
      new IntersectionObserver((es) => { for (const e of es) { g.inView = e.isIntersecting; if (g.inView) updateY(g); } }, { rootMargin: "20%" }).observe(g.root);
    });
    if (lenis) lenis.on("scroll", () => roots.forEach(updateY));
  }

  // Vertical sentence — while the text plate passes through the screen (top bottom → bottom top), it comes into focus only in the 10–70% range, from 24px blur and transparent
  if (window.gsap && window.ScrollTrigger && !reduce) {
    document.querySelectorAll("[data-blur-window]").forEach((box) => {
      ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true,
        onUpdate: (st) => { const on = st.progress > 0.1 && st.progress <= 0.7; box.querySelectorAll(".j-msg").forEach((m) => m.classList.toggle("is-show", on)); } });
    });
  } else document.querySelectorAll("[data-blur-window] .j-msg").forEach((m) => m.classList.add("is-show"));

  // Purchase band — at 15% visible the photo goes from 1.25x to its size over 3s and the blur veil lifts
  const cta = document.querySelector(".j-cta");
  if (cta && "IntersectionObserver" in window) {
    const show = () => cta.querySelectorAll(".j-cta__bg, .j-cta__img, .j-cta__veil").forEach((n) => n.classList.add("is-show"));
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { cta.classList.add("is-show"); show(); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(cta);
  } else if (cta) { cta.classList.add("is-show"); cta.querySelectorAll(".j-cta__bg, .j-cta__img, .j-cta__veil").forEach((n) => n.classList.add("is-show")); }

  // Center logo in the header row — on the first page it is hidden until the hero melts away, then appears (opacity .5s · from 20px above over 1.8s)
  const head = document.querySelector(".j-head");
  if (head && head.hasAttribute("data-hide-logo")) {
    const logo = head.querySelector(".j-head__logo");
    const set = () => { const on = scrollY > innerHeight * 0.9; head.classList.toggle("is-logo", on); if (logo) logo.classList.toggle("is-shown", on); };
    if (lenis) lenis.on("scroll", set); else addEventListener("scroll", set, { passive: true });
    set();
  }

  // Drawer menu
  const toggle = document.querySelector(".j-menu-btn"), drawer = document.querySelector(".j-drawer");
  if (toggle && drawer) {
    const label = toggle.querySelector(".j-menu-btn__label");
    const set = (on) => {
      body.classList.toggle("is-menu", on);
      if (label) label.textContent = on ? "Close" : "Menu";
      toggle.setAttribute("aria-expanded", String(on));
      drawer.setAttribute("aria-hidden", String(!on));
      if (lenis) on ? lenis.stop() : lenis.start();
    };
    toggle.addEventListener("click", () => set(!body.classList.contains("is-menu")));
    drawer.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  // Color swatch slider — syncs the original two layered Splide sliders (large photo · name), one slide per 2.2s every 5 seconds, with a progress circle filling at each dot.
  if (window.Splide) {
    document.querySelectorAll("[data-leather-slider]").forEach((box) => {
      const mainEl = box.querySelector(".j-splide-main"), subEl = box.querySelector(".j-splide-sub");
      if (!mainEl || !subEl) return;
      const main = new Splide(mainEl, { type: "loop", mediaQuery: "min", autoplay: !reduce, interval: 5000, easing: "cubic-bezier(0.25, 1, 0.5, 1)", speed: 2200, arrows: false, drag: false, updateOnMove: true, perPage: 1, perMove: 1, pagination: false, resetProgress: true, pauseOnHover: false, pauseOnTouch: false, breakpoints: { 960: { pagination: true } } });
      const sub = new Splide(subEl, { type: "loop", mediaQuery: "min", speed: 2200, easing: "cubic-bezier(0.33, 1, 0.68, 1)", arrows: false, drag: false, updateOnMove: true, perPage: 1, perMove: 1, pagination: true, resetProgress: true, pauseOnHover: false, pauseOnTouch: false, breakpoints: { 960: { pagination: false } } });
      const ring = (s) => s.on("pagination:mounted", (data) => {
        data.items.forEach((it) => { it.li.insertAdjacentHTML("beforeend", '<svg class="j-dot-ring" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8"/></svg>'); });
      });
      ring(main); ring(sub);
      main.on("autoplay:playing", (rate) => box.style.setProperty("--j-rate", rate));
      main.sync(sub);
      main.mount(window.splide ? window.splide.Extensions : undefined);
      sub.mount();
    });
  }
})();
