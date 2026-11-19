// Shared by all pages: draws the header, drawer menu and footer in one place, and hooks up Lenis, loader, FAQ and footer light tube.
// Original values: Lenis 1.0.42 duration 1.2 · easing min(1, 1.001 − 2^(−10t)) · off below 768px · loader strokes .3/.3/.2/.2/.3/1s (from .3s), then it lifts away at 2.5s over .5s expo.inOut
// · light tube: 3 tube colors · 4 light colors (intensity 200), tapping the footer randomizes colors · FAQ height expands .4s ease.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const T7 = (window.T7 = { reduced, lenis: null, page });

  const arrow = '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  // A newly drawn signature placeholder instead of the original handwritten logo — six strokes (the first-page loader keeps the same strokes in index.html and draws them with CSS).
  const sig = `<svg class="t7-sig" viewBox="0 0 250 66" aria-hidden="true">
    <path d="M60 15 C68 14 76 13 82 12 L68 50"/>
    <path d="M63 31 L79 30"/>
    <path d="M90 13 L86 52"/>
    <path d="M106 6 C103 22 102 38 104 52"/>
    <path d="M95 22 L116 20"/>
    <path d="M2 44 C34 43 72 42 112 42 C121 31 131 28 129 43 C128 52 136 41 142 36 C148 31 153 45 160 44 C168 43 171 30 179 36 C185 41 175 48 185 45 C204 41 230 40 248 39"/>
  </svg>`;
  T7.icons = { arrow, sig };
  const cur = (p) => (p === page ? ' aria-current="page"' : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("t7-head");
    head.innerHTML = `<div class="t7-head__in">
        <a class="t7-logo" href="index.html" aria-label="Home" data-label="Handwritten signature logo · horizontal tail line · 247×73">${sig}</a>
        <nav class="t7-nav" aria-label="Main menu"><ul>
          <li><a href="service.html"${cur("service")}>Services</a>
            <div class="t7-sub"><a href="service.html">Design &amp; Build</a><a href="service.html">Growth Marketing</a></div></li>
          <li><a href="works.html"${cur("works")}>Work</a></li>
          <li><a href="about.html"${cur("about")}>About</a></li>
          <li><a href="#contact">Contact <span class="t7-nav__dot">${arrow}</span></a></li>
        </ul></nav>
        <button class="t7-burger" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="t7-menu"><i></i><i></i><i></i></button>
      </div>`;
    head.insertAdjacentHTML("afterend", `<nav class="t7-menu" id="t7-menu" aria-label="Main menu" aria-hidden="true" data-slot="mobile-menu">
        <div class="t7-menu__bg"></div>
        <div class="t7-menu__in">
          <ul class="t7-menu__list">
            <li><a style="--i:0" href="service.html">Design &amp; Build</a></li>
            <li><a style="--i:1" href="service.html">Growth Marketing</a></li>
            <li><a style="--i:2" href="works.html">Work</a></li>
            <li><a style="--i:3" href="about.html">About</a></li>
            <li><a style="--i:4" href="#contact">Contact</a></li>
          </ul>
          <div class="t7-menu__foot"><span>hello@studio.name</span><a href="#" aria-label="Social Account"><i></i></a></div>
        </div>
      </nav>`);
    const burger = head.querySelector(".t7-burger");
    const menu = document.getElementById("t7-menu");
    const setMenu = (open) => {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      menu.setAttribute("aria-hidden", String(!open));
      if (T7.lenis) open ? T7.lenis.stop() : T7.lenis.start();
    };
    burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); burger.focus(); } });
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("t7-foot");
    foot.id = "contact";
    foot.setAttribute("data-fx", "tubes-cursor");
    foot.innerHTML = `<div class="t7-foot__wait" data-fx-part="wait"></div>
      <div class="t7-foot__in">
        <div class="t7-foot__top">
          <ul data-label="Footer menu English name">
            <li><a href="service.html">Design &amp; Build</a></li>
            <li><a href="service.html">Growth Marketing</a></li>
            <li><a href="works.html">Work</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="news.html">Insights</a></li>
          </ul>
          <div class="t7-foot__contact"><a href="#">(000) 000-0000</a><a href="#">hello@studio.name</a></div>
        </div>
        <div class="t7-foot__mid">
          <h2 data-label="Closing English line">A closing line for the call.</h2>
          <p class="t7-lead">Your closing line here.</p>
          <a class="t7-pill t7-pill--line" href="#contact"><span class="t7-pill__t">Book an Intro Call</span><span class="t7-pill__o">${arrow}</span></a>
        </div>
        <div class="t7-foot__bot">
          <div><p class="t7-small">© 0000 Studio Name. All Rights Reserved.</p></div>
          <div class="t7-foot__brand"><a class="t7-logo" href="index.html" aria-label="Home">${sig}</a><p class="t7-foot__tag t7-it" data-label="One-line English footer note">A one-line studio tagline</p></div>
          <div class="t7-foot__social"><a href="#" aria-label="Social Account"></a></div>
        </div>
      </div>`;
  }

  // Lenis — as in the original, off below 768px and on no-lenis pages (Work 3D)
  if (window.Lenis && !reduced && innerWidth >= 768 && document.body.dataset.lenis !== "off") {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    T7.lenis = lenis;
  }
  T7.lock = () => { document.body.classList.add("is-locked"); T7.lenis?.stop(); };
  T7.unlock = () => { document.body.classList.remove("is-locked"); if (!document.body.classList.contains("menu-open")) T7.lenis?.start(); ScrollTrigger.refresh(); };

  // Loader: first page only. When it ends, T7.ready is released
  T7.ready = new Promise((resolve) => {
    const loader = document.querySelector(".t7-loader");
    if (!loader) return document.fonts.ready.then(() => resolve());
    if (reduced) { loader.remove(); return resolve(); }
    // Strokes are drawn by CSS keyframes — the script waits 2.5s after .1s as in the original, then lifts the curtain
    gsap.delayedCall(2.6, () => {
      gsap.to(loader, { duration: 0.5, autoAlpha: 0, ease: "expo.inOut", onComplete: () => loader.remove() });
      document.documentElement.classList.add("is-loaded");
      resolve();
    });
  });

  // Convert Skin variables (oklch relative colour) into rgb(a) that GSAP can blend — paint one dot and read it
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  T7.rgb = (name, alpha = 1) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "transparent";
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // FAQ accordion — only one open
  document.querySelectorAll(".t7-faq__item").forEach((item) => {
    const a = item.querySelector(".t7-faq__a");
    item.querySelector(".t7-faq__q").addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      document.querySelectorAll(".t7-faq__item.is-open").forEach((o) => { o.classList.remove("is-open"); o.querySelector(".t7-faq__a").style.maxHeight = "0px"; o.querySelector(".t7-faq__q").setAttribute("aria-expanded", "false"); });
      if (!open) { item.classList.add("is-open"); a.style.maxHeight = a.scrollHeight + 20 + "px"; item.querySelector(".t7-faq__q").setAttribute("aria-expanded", "true"); }
    });
  });

})();
