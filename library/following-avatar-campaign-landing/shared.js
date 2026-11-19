// Behaviour shared across pages — smooth scroll (lenis 1.1.20 defaults), loader, drawer, back-to-top heart, window, once-when-visible, keen-slider progress bar · auto flow, ticker text.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const site = (window.tsmSite = { reduce, lenis: null, paused: false });
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.CustomEase) gsap.registerPlugin(CustomEase);

  // The original sets up Lenis with no options (lerp .1 · wheel 1x) — canvases attached to the screen pick their drawing by scrollY, so they run at the same tempo
  if (!reduce && window.Lenis) {
    const lenis = (site.lenis = new Lenis());
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.hasAttribute("data-modal")) return;
      const id = a.getAttribute("href");
      const el = id === "#top" ? 0 : document.querySelector(id);
      if (el === null) return;
      e.preventDefault();
      // Original: 1s per 10k px of distance + .5s, curve slow in the middle
      const far = el === 0 ? scrollY : Math.abs(el.getBoundingClientRect().top);
      lenis.scrollTo(el, { duration: a.dataset.duration !== undefined ? 0.01 : far / 1e4 + 0.5, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
    });
  }

  // Loader: hearts pop out one by one as much as has loaded, and when done it rests 1 second then fades out over 1 second
  const loader = document.getElementById("t-loader");
  const hearts = loader ? [...loader.querySelectorAll(".t-loader__hearts > li")] : [];
  site.loadProgress = (p) => hearts.forEach((h, i) => h.classList.toggle("is-on", hearts.length * p >= i + 1));
  site.loaded = () =>
    new Promise((resolve) => {
      site.loadProgress(1);
      if (!loader) return resolve();
      if (reduce) { loader.remove(); return resolve(); }
      gsap.to(loader, {
        autoAlpha: 0, delay: 1, duration: 1,
        onComplete: () => { loader.remove(); resolve(); },
      });
    });
  if (reduce) site.loadProgress(1);

  // ── Drawer: two circles swell to the screen diagonal size and cover. Scroll is halted while open ──
  const drawer = document.getElementById("t-drawer");
  const drawerBtns = [...document.querySelectorAll(".t-drawer-btn")];
  const setDrawer = (open) => {
    if (!drawer) return;
    site.paused = open;
    drawer.style.setProperty("--diagonal", `${Math.hypot(innerWidth, innerHeight)}px`);
    drawer.classList.toggle("is-open", open);
    drawerBtns.forEach((b) => { b.classList.toggle("is-open", open); b.setAttribute("aria-expanded", String(open)); b.setAttribute("aria-label", open ? "Close Menu" : "Open Menu"); });
    if (site.lenis) open ? site.lenis.stop() : site.lenis.start();
  };
  drawerBtns.forEach((b) => b.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open"))));
  drawer?.querySelectorAll("[data-close]").forEach((a) => a.addEventListener("click", () => setDrawer(false)));

  // ── Modal: request materials and video ──
  const modal = document.getElementById("t-modal");
  const openModal = (name) => {
    if (!modal) return;
    modal.querySelectorAll("[data-modal-body]").forEach((b) => (b.hidden = b.dataset.modalBody !== name));
    modal.hidden = false;
    modal.classList.add("is-open");
    site.paused = true;
    site.lenis?.stop();
    modal.querySelector(".t-modal__close")?.focus({ preventScroll: true });
  };
  const closeModal = () => {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.classList.remove("is-open");
    site.paused = drawer?.classList.contains("is-open") ?? false;
    if (!site.paused) site.lenis?.start();
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-modal]");
    if (t) { e.preventDefault(); if (drawer?.classList.contains("is-open")) setDrawer(false); openModal(t.dataset.modal); return; }
    if (e.target.closest("[data-close-modal]")) closeModal();
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeModal();
    if (drawer?.classList.contains("is-open")) setDrawer(false);
  });

  // ── Back-to-top heart: pops out after passing the Hero, and when pressed bounces upward and vanishes ──
  const pagetop = document.querySelector(".t-pagetop");
  if (pagetop) {
    let shown = false;
    const check = () => {
      const on = scrollY > innerHeight * 0.8;
      if (on === shown) return;
      shown = on;
      pagetop.classList.remove("is-leave");
      pagetop.classList.toggle("is-show", on);
    };
    addEventListener("scroll", check, { passive: true });
    check();
    pagetop.addEventListener("click", () => {
      if (reduce) return;
      pagetop.classList.add("is-leave");
    });
  }

  // ── Once when visible (original js-inview — is-inview when it enters 0~10% from the bottom of the screen) ──
  const inview = new IntersectionObserver(
    (list) => list.forEach(({ target, isIntersecting }) => { if (isIntersecting) { target.classList.add("is-inview"); inview.unobserve(target); } }),
    { rootMargin: "0px 0px -10% 0px" },
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => (reduce ? el.classList.add("is-inview") : inview.observe(el)));

  // ── Band text: repeat the word to twice the screen width and flow half a turn every 10s ──
  document.querySelectorAll("[data-band]").forEach((span) => {
    const word = span.dataset.band;
    const run = () => {
      const r = document.createElement("span");
      r.className = "t-band__run";
      for (let i = 0; i < 14; i++) {
        const w = document.createElement("span");
        w.className = "t-band__word";
        w.textContent = `${word} ·`;
        r.append(w);
      }
      return r;
    };
    span.append(run(), run());
  });

  // ── keen-slider: original js-slider (free-snap · one-card width auto) + progress bar (dragging moves by the bar width) ──
  site.sliders = [];
  if (window.KeenSlider) {
    document.querySelectorAll(".js-slider").forEach((ul) => {
      ul.classList.add("keen-slider");
      [...ul.children].forEach((li) => li.classList.add("keen-slider__slide"));
      const slider = new KeenSlider(ul, { mode: "free-snap", slides: { perView: "auto" } });
      site.sliders.push(slider);
      if (!ul.hasAttribute("data-progress-bar")) return;
      const bar = document.createElement("div");
      bar.className = "t-progress";
      const knob = document.createElement("span");
      bar.append(knob);
      ul.parentElement.append(bar);
      const part = 1 / slider.slides.length;
      const paint = () => {
        const p = Math.max(0, Math.min(1, slider.track.details.progress));
        knob.style.width = `${(part + p * (1 - part)) * 100}%`;
        knob.style.left = `${p * 100}%`;
        knob.style.transform = `translate(-${p * 100}%,0)`;
      };
      slider.on("detailsChanged", paint);
      paint();
      if (!matchMedia("(any-hover: hover)").matches) return;
      let drag = false, last = 0;
      bar.addEventListener("pointerdown", (e) => { drag = true; last = e.clientX; slider.animator.active = false; });
      addEventListener("pointerup", () => { if (!drag) return; drag = false; slider.animator.active = true; slider.moveToIdx(slider.track.details.rel); });
      addEventListener("pointermove", (e) => {
        if (!drag) return;
        const r = bar.getBoundingClientRect(), d = e.clientX - last;
        last = e.clientX;
        slider.track.add((d / r.width) * (slider.track.details.slidesLength - 0.5) * 1);
      });
    });

    // Photo strip: duplicate one set to run endlessly — 7.5s per photo, no curve. Stops when off-screen
    document.querySelectorAll(".js-automove").forEach((el) => {
      if (reduce) return;
      el.innerHTML += el.innerHTML;
      el.classList.add("keen-slider");
      [...el.children].forEach((c) => c.classList.add("keen-slider__slide"));
      const n = el.children.length / 2;
      let on = false;
      const go = (s) => s.moveToIdx(s.track.details.abs + n, true, { duration: n * 7500, easing: (t) => t });
      const s = new KeenSlider(el, {
        loop: true, mode: "free", renderMode: "performance", slides: { perView: "auto" },
        updated: (sl) => on && go(sl),
        animationEnded: (sl) => on && go(sl),
      });
      new IntersectionObserver(([en]) => {
        on = en.isIntersecting;
        if (on) go(s); else s.animator.stop();
      }).observe(el);
    });
  }
})();
