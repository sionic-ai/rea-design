// Inserts the header · menu · footer shared by all pages, and like the original Lenis (1.0.18) smooth scroll · is-loaded after the splash ·
// Header that shows the dropdown again on scroll up · Menu/language hover (closes after .1s) · narrow-screen Slideout drawer · reveal (rootMargin −15%) ·
// Attaches decoration parallax (×.08), decoration grow/bounce/spin (scrub 2) and the Splide fade slide (switches instantly every 2 seconds).
(() => {
  const root = document.documentElement, body = document.body;
  const page = body.dataset.page || "home";
  const isHome = page === "home";
  const wave = (cls = "") => `<span class="ck-wave ${cls}" data-fx="wave-drift"></span>`;
  const arrow = '<svg class="ck-btn__icon" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M0 7h16M10 1l6 6-6 6"/></svg>';
  const menuIcon = '<svg viewBox="0 0 50 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M0 2.5c4 0 4-2 8.3-2s4.2 2 8.4 2 4.2-2 8.3-2 4.2 2 8.3 2 4.2-2 8.4-2S46 2.5 50 2.5M0 11.5c4 0 4-2 8.3-2s4.2 2 8.4 2 4.2-2 8.3-2 4.2 2 8.3 2 4.2-2 8.4-2 4.3 2 8.3 2"/></svg>';
  const globe = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20"/></svg>';
  const links = [["index.html", "First Page"], ["#", "Flight information"], ["#", "About the ship"], ["price.html", "Pricing · Booking"], ["lookbook.html", "Cruising gallery"], ["#", "Directions to the Boat"], ["news.html", "Latest news · Alerts"]];
  const ships = [["SHIP 01", 14.5], ["SHIP NAME 02", 22.5], ["SHIP 03", 12], ["SHIP NAME 04", 21.5], ["SHIP NAME 05", 24.5]];

  const head = document.querySelector("[data-site-head]");
  if (head) head.outerHTML = `
    <div class="ck-headwrap${isHome ? "" : " is-sub"}" data-slot="header">
      <header class="ck-head is-view" id="ck-head">
        <h1 class="ck-logo-frame"><a class="ck-logo" href="index.html" aria-label="First Page"><span class="ck-logo__mark">LOGO</span><span class="ck-logo__sup">Your port name here<br>Cruise Guide Site</span></a></h1>
        <div class="ck-rsv"><a href="price.html"><span>Book here</span></a></div>
        <div class="ck-langbtn"><button type="button" class="js-lang-hover" id="ck-langbtn" aria-label="Language">${globe}</button></div>
        <div class="ck-lang-frame"><div class="ck-lang js-lang-hover"><ul>
          <li><button type="button" class="is-current">Japanese</button></li><li><button type="button">English</button></li><li><button type="button">Korean</button></li><li><button type="button">Chinese</button></li>
        </ul></div></div>
        <div class="ck-menubtn"><button type="button" class="js-menu-hover" id="ck-menubtn" aria-controls="ck-gnav"><span class="ck-menubtn__text">Menu</span>${menuIcon}</button></div>
        <div class="ck-gnav-frame" data-slot="menu-drawer">
          <nav class="ck-gnav" id="ck-gnav" aria-label="Site Menu"><div class="ck-gnav__scroll js-menu-hover"><ul class="ck-gnav__list">
            ${links.map(([h, t]) => `<li><a class="ck-gnav__link js-close" href="${h}">${t}</a>${wave("")}</li>`).join("")}
          </ul></div></nav>
        </div>
        <div class="ck-overlay" id="ck-overlay"></div>
      </header>
    </div>`;

  const foot = document.querySelector("[data-site-foot]");
  if (foot) foot.outerHTML = `
    <footer class="ck-foot" data-slot="footer">
      <div class="ck-foot__inner ck-inner">
        <div class="ck-foot__ships">${ships.map(([t, w], i) => `<a class="ck-foot__ship" href="#ship-${i + 1}" style="width: ${w}rem">${t}</a>`).join("")}</div>
        <a class="ck-foot__logo" href="index.html" aria-label="First Page">LOGO</a>
        <nav class="ck-foot__nav" aria-label="Footer Menu"><ul>
          ${links.slice(1).concat([["#", "Inquiry"]]).map(([h, t], i) => `<li><a class="ck-foot__link" href="${h === "#" ? `#foot-${i}` : h}">${t}</a></li>`).join("")}
        </ul></nav>
        <p class="ck-foot__copy" data-label="Your operating organization’s English name here">Copyright © City Name. All rights reserved.</p>
        <span class="ck-foot__sub">CITY</span>
      </div>
      <div class="ck-foot__top"><a href="#top"><span>Page Top</span><svg viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M0 7h16M10 1l6 6-6 6"/></svg></a></div>
    </footer>`;

  document.querySelectorAll("[data-btn]").forEach((b) => b.insertAdjacentHTML("beforeend", arrow + wave(b.dataset.btn)));

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => innerWidth >= 992;
  const header = document.getElementById("ck-head");

  // Smooth scroll — original options as is. Paused during the splash
  let lenisInst = null;
  if (!reduce && window.lenis) {
    lenisInst = new window.lenis({ duration: 1.2, smoothWheel: true, smoothTouch: false, touchMultiplier: 3, infinite: false });
    lenisInst.stop();
    const raf = (t) => { lenisInst.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenisInst.on("scroll", () => ScrollTrigger.update());
  }

  // Splash: 3.6s only when the first page is opened directly, not via a subpage. Opening a subpage leaves a ‹subpage› flag for 7 days
  const cookie = (k) => document.cookie.split("; ").find((c) => c.startsWith(k + "="));
  const splash = isHome && !cookie("ck-subpage");
  const t0 = performance.now();
  let wait = splash ? 3600 : 10;
  if (splash) {
    body.classList.add("is-splash");
    document.scrollingElement.scrollTop = 0;
    wait = Math.max(10, Math.ceil(3600 - (performance.now() - t0)));
  }
  const loaded = () => {
    lenisInst?.start();
    if (isHome) document.cookie = "ck-subpage=; max-age=0; path=/";
    else document.cookie = `ck-subpage=1; max-age=${7 * 86400}; path=/`;
    body.classList.add("is-loaded");
    observeAnime();
    document.querySelectorAll("video").forEach((v) => v.play?.().catch(() => {}));
  };
  addEventListener("load", () => setTimeout(loaded, wait));

  // Header: on wide screens, scrolling down retracts the dropdown, and scrolling up or being at the very top (within 10px) shows it again
  let lastY = scrollY;
  addEventListener("scroll", () => {
    if (!wide() || scrollY === lastY) return;
    header.classList.toggle("is-view", scrollY <= 10 || scrollY < lastY);
    lastY = scrollY;
  }, { passive: true });

  // Menu·language hover — closes .1s after leaving (wide screens)
  let menuTimer;
  document.querySelectorAll(".js-menu-hover").forEach((el) => {
    el.addEventListener("mouseenter", () => { if (!wide()) return; clearTimeout(menuTimer); header.classList.remove("is-view-lang"); header.classList.add("is-view"); });
    el.addEventListener("mouseleave", () => { if (!wide()) return; menuTimer = setTimeout(() => header.classList.remove("is-view"), 100); });
  });
  document.querySelectorAll(".js-lang-hover").forEach((el) => {
    el.addEventListener("mouseenter", () => { clearTimeout(menuTimer); header.classList.remove("is-view"); header.classList.add("is-view-lang"); });
    el.addEventListener("mouseleave", () => { menuTimer = setTimeout(() => header.classList.remove("is-view-lang"), 100); });
  });

  // Narrow-screen drawer — same Slideout (1.0.1, duration 10) as the original. The panel (curtain) is pinned in place by CSS and only the open flag is used
  const gnav = document.getElementById("ck-gnav"), overlay = document.getElementById("ck-overlay");
  let slide = null;
  if (window.Slideout && gnav && overlay) {
    slide = new Slideout({ panel: overlay, menu: gnav, duration: 10, side: "right" });
    document.getElementById("ck-menubtn").addEventListener("click", () => { if (!wide()) slide.toggle(); });
    [overlay, ...gnav.querySelectorAll(".js-close")].forEach((el) => el.addEventListener("click", () => { if (!wide()) slide.close(); }));
    document.getElementById("ck-langbtn").addEventListener("click", () => {
      if (wide()) return;
      slide.close();
      const on = header.classList.contains("is-view-lang");
      header.classList.remove("is-view");
      header.classList.toggle("is-view-lang", !on);
    });
  }

  // Appear: once when it enters within 15% of the top and bottom of the screen. data-delay(ms) becomes the transition delay
  function observeAnime() {
    const els = document.querySelectorAll(".ck-anime:not(.is-anime)");
    if (reduce) { els.forEach((e) => e.classList.add("is-anime")); return; }
    const io = new IntersectionObserver((es, obs) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-anime"); obs.unobserve(e.target); } }), { rootMargin: "-15% 0px", threshold: 0 });
    els.forEach((e) => { if (e.dataset.delay) e.style.transitionDelay = `${e.dataset.delay}ms`; io.observe(e); });
  }

  // Decorative parallax — how far the element center is from screen center × .08 (data-para="Y|X,reverse,intensity")
  const paras = [...document.querySelectorAll("[data-para]")].map((el) => [el, el.dataset.para.split(",")]);
  if (paras.length && !reduce) {
    const tick = () => paras.forEach(([el, [axis, dir, gap]]) => {
      const r = el.getBoundingClientRect();
      if (r.top - innerHeight > 0) return;
      const d = (r.top - (innerHeight / 2 - el.offsetHeight / 2)) * (gap ? +gap : 0.08) * (dir === "reverse" ? -1 : 1);
      el.style.transform = axis === "X" ? `translate3d(${d}px, 0, 0)` : `translate3d(0, ${d}px, 0)`;
    });
    addEventListener("scroll", () => requestAnimationFrame(tick), { passive: true });
    tick();
  }

  // Decoration grow, bounce, spin — scrub 2 from when its top edge reaches screen center until its bottom edge touches the screen bottom
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    const st = (el) => ({ trigger: el, start: "top center", end: "bottom bottom", scrub: 2, invalidateOnRefresh: true });
    document.querySelectorAll(".js-gsap-bounce").forEach((el) => gsap.to(el, { ease: "back.out(1.7)", scale: 1, opacity: 1, scrollTrigger: st(el) }));
    document.querySelectorAll(".js-gsap-scale").forEach((el) => gsap.to(el, { ease: "none", scale: 1, scrollTrigger: st(el) }));
    document.querySelectorAll(".js-gsap-rotate").forEach((el) => gsap.to(el, { ease: "none", rotation: 0, scrollTrigger: st(el) }));
  }

  // Fade slide — original Splide options (type fade · rewind · autoplay 2000 · speed 0 · no pause). Change with data-interval · data-speed.
  if (window.Splide) document.querySelectorAll(".js-splide-fade").forEach((el) => {
    new Splide(el, { type: "fade", rewind: true, autoplay: !reduce, interval: +(el.dataset.interval || 2000), speed: +(el.dataset.speed || 0), arrows: false, pagination: false, pauseOnHover: false, pauseOnFocus: false }).mount();
  });
})();
