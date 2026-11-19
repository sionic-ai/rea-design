// Shared by several pages — bottom pill nav and Footer insertion, Lenis (original defaults), page transition (fade-out .5s → fade-in .5s, easeInOutQuart),
// Cover hero darkens, video autoplay, work card photo slider (overlap fade 400ms ease-out)
(() => {
  const page = document.body.dataset.page || "home";
  const NAV = [
    ["home", "index.html", "S.P."],
    ["works", "works.html", "Work"],
    ["about", "about.html", "About"],
    ["news", "index.html#news", "News"],
    ["feed", "index.html#work-feed", "Feed"],
    ["contact", "#contact", "Inquiry"],
  ];

  const nav = document.querySelector("[data-slot='nav']");
  if (nav) {
    nav.innerHTML = `<ul>${NAV.map(([key, href, label]) =>
      `<li><a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}</ul>`;
  }

  const foot = document.querySelector("[data-slot='footer']");
  if (foot) {
    foot.id = "contact";
    const sub = foot.dataset.foot === "sub";
    foot.classList.add("sp-foot");
    if (sub) foot.classList.add("sp-foot--sub");
    foot.innerHTML = `
      <div>
        <hr class="sp-hr">
        <div class="sp-grid sp-foot__top">
          <div class="sp-foot__call"><h2 class="t-large" data-label="One English line that invites inquiries">A short line inviting contact.</h2><p><a class="sp-btn" href="#contact">Get in touch</a></p></div>
          <div class="sp-foot__studio t-default"><p>Office</p><p>Your address first line here<br>Your address second line here<br>City postal code 0000</p></div>
          <div class="sp-foot__mail t-default"><p>Mail</p><p><a class="sp-ilink" href="#contact">hello@example.com</a></p></div>
        </div>
      </div>
      <div class="sp-grid sp-foot__bottom t-default">
        <p class="sp-foot__copy" data-label="Your studio English name here">© Studio Name ${sub ? "2026" : "2025"}</p>
        <p class="sp-foot__social"><a class="sp-ilink" href="#contact">Social Media</a> <a class="sp-ilink" href="#contact">X</a> <a class="sp-ilink" href="#contact">Professional network</a></p>
      </div>`;
  }

  const root = document.documentElement;
  const pageEl = document.querySelector(".sp-page");
  const reduceQ = matchMedia("(prefers-reduced-motion: reduce)");
  const EASE_QUART = "power3.inOut"; // easeInOutQuart
  const NAV_KEY = "sp-nav";

  // Video — as in the original muted, looping, autoplay, and it pauses when off screen
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && !reduceQ.matches) v.play().catch(() => {});
      else v.pause();
    });
  }, { rootMargin: "200px 0px" });
  document.querySelectorAll("video[data-auto]").forEach((v) => { v.muted = true; io.observe(v); });

  // Work card slider — original carousel (transition-fading): only the chosen slide is opacity 1, and when it changes they overlap and fade out over 400ms ease-out.
  // Click a dot for that section, click a photo for the next section (back to the first at the end), drag sideways to go toward the dragged side, and the last panel hovered can be moved with the ← and → keys
  let lastSlider = null;
  document.querySelectorAll("[data-sp-slider]").forEach((el) => {
    const slides = [...el.querySelectorAll(".sp-slide")], dots = [...el.querySelectorAll(".sp-dot")];
    if (slides.length < 2) return;
    let ix = 0, downX = null;
    const go = (n) => {
      ix = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("is-on", k === ix));
      dots.forEach((d, k) => d.classList.toggle("is-on", k === ix));
    };
    el.sp = { go: (d) => go(ix + d) };
    dots.forEach((d, k) => d.addEventListener("click", (e) => { e.stopPropagation(); go(k); }));
    const box = el.querySelector(".sp-slides");
    box.addEventListener("pointerdown", (e) => { downX = e.clientX; });
    box.addEventListener("pointerup", (e) => {
      if (downX == null) return;
      const dx = e.clientX - downX;
      downX = null;
      go(ix + (Math.abs(dx) > 30 && dx > 0 ? -1 : 1));
    });
    el.addEventListener("pointerenter", () => { lastSlider = el; });
  });
  addEventListener("keydown", (e) => {
    if (!lastSlider || e.target.closest("input, textarea")) return;
    if (e.key === "ArrowRight") lastSlider.sp.go(1);
    if (e.key === "ArrowLeft") lastSlider.sp.go(-1);
  });

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { motion } = ctx.conditions;
    let lenis = null;
    if (motion && window.Lenis) {
      // The original theme’s Lenis options as they are — duration 1.2, exponential ease-out
      lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2 });
      window.spLenis = lenis;
      const raf = (time) => { lenis.raf(time * 1000); };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      ctx.add(() => () => { gsap.ticker.remove(raf); lenis.destroy(); window.spLenis = null; });
    }

    // Cover hero: brightness 1 → 0.2 during the one screen while the body slides over
    const cover = document.querySelector("[data-sp-cover]");
    let onScroll = null;
    if (cover) {
      onScroll = () => {
        const y = window.scrollY, h = window.innerHeight;
        const b = motion ? Math.max(0.2, 1 - (Math.min(y, h) / h) * 0.8) : 1;
        cover.style.filter = `brightness(${b})`;
      };
      onScroll();
      addEventListener("scroll", onScroll, { passive: true });
    }

    // Page transition — on entering a new page the body floats up in .5s (a first visit shows right away)
    if (root.classList.contains("sp-enter")) {
      sessionStorage.removeItem(NAV_KEY);
      if (motion && pageEl) gsap.fromTo(pageEl, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: EASE_QUART, onComplete: () => root.classList.remove("sp-enter") });
      else root.classList.remove("sp-enter");
    }
    const onClick = (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
      const url = new URL(a.getAttribute("href"), location.href);
      if (url.origin !== location.origin) return;
      const samePage = url.pathname === location.pathname;
      if (samePage && url.hash) {
        const t = document.querySelector(url.hash);
        if (!t) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(t, { duration: 1.2 }); else t.scrollIntoView();
        return;
      }
      if (samePage && !url.hash) { e.preventDefault(); if (lenis) lenis.scrollTo(0); else scrollTo(0, 0); return; }
      e.preventDefault();
      sessionStorage.setItem(NAV_KEY, "1");
      if (!motion || !pageEl) { location.href = url.href; return; }
      gsap.to(pageEl, { opacity: 0, duration: 0.5, ease: EASE_QUART, onComplete: () => { location.href = url.href; } });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      if (onScroll) removeEventListener("scroll", onScroll);
    };
  });

  // So it doesn’t stay faded when coming back (bfcache)
  addEventListener("pageshow", (e) => { if (e.persisted && pageEl) gsap.set(pageEl, { opacity: 1 }); });
})();
