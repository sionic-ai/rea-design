// Shared by all pages: draws the header, menu panel and footing in one place, Lenis (lerp 0.08), menu open and close,
// Sets up header color change and hide, diagonal mask reveal, and foot parallax. First-page scenes are set up by index.js after ab.ready.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  // Six pinwheel petals — a newly drawn symbol in place of the original logo (a flower with spinning cookie pieces)
  const petal = "M0 -5C11 -14 21 -33 7 -46C-7 -41 -10 -19 0 -5Z";
  const pinwheel = (cls = "") => `<svg class="${cls}" viewBox="-50 -50 100 100" aria-hidden="true"><g fill="currentColor">${
    [0, 1, 2, 3, 4, 5].map((i) => `<path d="${petal}" transform="rotate(${i * 60})" opacity="${[1, 0.62, 0.85, 0.55, 0.92, 0.7][i]}"/>`).join("")
  }</g><circle r="4" fill="currentColor" opacity=".5"/></svg>`;

  // Wordmark spot: each letter is a tspan, so on the hero they can light up one by one from the left
  // Original wordmark piece count (11 letters + 2 bars = Same as 13) — the length of the sequence lighting up .07s at a time on the hero becomes equal
  const WORD = "Brand Name Co";
  const wordmark = (cls = "") => `<svg class="${cls}" viewBox="0 0 1300 196" aria-label="Your wordmark here"><text x="0" y="188" style="font-family: var(--kf-font-display)" font-weight="500" font-size="262" letter-spacing="-6" textLength="1300" lengthAdjust="spacingAndGlyphs" fill="currentColor">${
    [...WORD].map((c) => `<tspan>${c === " " ? "\u00a0" : c}</tspan>`).join("")
  }</text></svg>`;

  const insta = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/></svg>`;
  const threads = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M16.5 8.5C15.6 6.4 13.9 5.3 11.8 5.3 8.4 5.3 6.2 8 6.2 12s2.2 6.7 5.7 6.7c3 0 5.4-1.8 5.4-4.6 0-2.4-2-3.7-4.8-3.7-2 0-3.3 1-3.3 2.4 0 1.3 1.1 2.1 2.6 2.1 2.2 0 3.2-1.7 3.2-4.6"/></svg>`;

  const links = (btns = true) => `
    <div class="ab-links">
      <ul class="ab-links__col en">
        <li><a href="index.html" data-close>Menu 1</a></li>
        <li><a href="index.html#products" data-close>Menu 2</a></li>
        <li><a href="index.html#brand" data-close>Menu 3</a></li>
      </ul>
      <ul class="ab-links__col en">
        <li><a href="product.html" data-close>Store</a></li>
        <li><a href="index.html#news" data-close>News</a></li>
        <li><a href="faq.html" data-close>FAQ</a></li>
      </ul>
      ${btns ? `<div class="ab-links__btns">
        <a class="ab-btn" href="#">Online shop</a>
        <a class="ab-btn" href="#">Operator</a>
        <a class="ab-sns en-l" href="#">${insta}Social Media</a>
        <a class="ab-sns en-l" href="#">${threads}Thread</a>
      </div>` : ""}
    </div>`;

  const isHome = document.body.dataset.page === "home";
  const head = document.querySelector('[data-slot="header"]');
  head.classList.add("ab-head");
  head.innerHTML = `<div class="ab-head__in"><a class="ab-logo" href="index.html" aria-label="Back to start">${pinwheel()}</a></div>`;
  head.insertAdjacentHTML("afterend", `
    <button class="ab-toggle${isHome ? " is-white" : ""}" type="button" aria-label="Menu"><span></span><span></span></button>
    <div class="ab-mask" data-close></div>
    <nav class="ab-menu ab-grain" data-slot="menu-drawer" aria-label="Menu">
      <div class="ab-menu__cont">
        <div class="ab-menu__logo">${wordmark()}</div>
        ${links()}
      </div>
    </nav>`);

  const foot = document.querySelector('[data-slot="footer"]');
  foot.classList.add("ab-foot");
  foot.innerHTML = `
    <span class="wf-note">Footing · cloudy milk-wave edge · inner yPercent -15→0 scrub 1 (phone -10)</span>
    <div class="ab-foot__bg ab-grain">
      <div class="ab-foot__in">
        <div class="ab-foot__head">
          <div class="ab-foot__icon">${pinwheel()}</div>
          ${links()}
        </div>
        <div class="ab-foot__mark">${wordmark()}</div>
        <p class="ab-foot__copy">©Your company name here All Rights Reserved.</p>
      </div>
    </div>`;
  document.querySelectorAll("[data-pin-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", pinwheel()));

  window.ab = { pinwheel, wordmark, lenis: null };

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = (window.ab.lenis = new Lenis({ lerp: 0.08, smoothWheel: true, syncTouch: true }));
    const tick = (time) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0, 0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      window.ab.lenis = null;
    };
  });

  // Menu: the two-line button rotates ±210° into an X, the panel drops from the top in 0.5s. Clicking outside or a link closes it
  const root = document.documentElement;
  const menuEl = document.querySelector(".ab-menu");
  const syncMenu = () => menuEl && (menuEl.inert = !root.classList.contains("is-menu"));
  syncMenu();
  document.querySelector(".ab-toggle").addEventListener("click", () => { root.classList.toggle("is-menu"); syncMenu(); });
  document.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", () => { root.classList.remove("is-menu"); syncMenu(); }));

  // In-page # links scroll via Lenis in 0.4s (original jQuery animate 400ms)
  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      window.ab.isAnchorScrolling = true;
      const done = () => setTimeout(() => (window.ab.isAnchorScrolling = false), 100);
      if (window.ab.lenis) window.ab.lenis.scrollTo(target, { duration: 0.4, onComplete: done });
      else { target.scrollIntoView(); done(); }
    });
  });

  // Header: past 50px of scrolling down only the logo slides up out of view, on light sections the logo and button turn coffee color, and inside marked sections the header hides when scrolling down
  const lights = document.querySelectorAll("[data-light]");
  const hiders = document.querySelectorAll("[data-hide-head]");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    head.classList.toggle("is-logo-off", y > 50);
    if (isHome) {
      const inRange = (list, at) => [...list].some((s) => { const r = s.getBoundingClientRect(); return r.top <= at && r.bottom >= at; });
      head.classList.toggle("is-colored", inRange(lights, 40));
      if (root.classList.contains("is-menu")) head.style.transform = "translateY(0)";
      else if (inRange(hiders, 10)) {
        if (y <= 0 || y < lastY) head.style.transform = "translateY(0)";
        else if (y > lastY && y > 50) head.style.transform = "translateY(-100%)";
      } else head.style.transform = "translateY(0)";
    }
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Diagonal mask reveal · photo sweep reveal: once visible, done (original rootMargin 1px below)
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("is-in");
    io.unobserve(en.target);
  }), { rootMargin: "0px 0px 1px 0px", threshold: 0 });
  document.querySelectorAll(".ab-reveal, .ab-sweep").forEach((el) => io.observe(el));

  // The footer inner drops into place from -15% (phone -10%) above — it ends at the page bottom
  const footIn = foot.querySelector(".ab-foot__in");
  mm.add({ pc: "(min-width: 769px)", sp: "(max-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (!ctx.conditions.motion) return;
    gsap.fromTo(footIn, { yPercent: ctx.conditions.pc ? -15 : -10 }, {
      yPercent: 0, ease: "none",
      scrollTrigger: { trigger: foot, start: "top bottom", end: "max", scrub: 1, invalidateOnRefresh: true, refreshPriority: -1 },
    });
  });
})();
