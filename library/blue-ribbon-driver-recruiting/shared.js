// The header, drawer, support box and footer are the same across four pages, so they’re drawn once here. Loaded before the page script.
(() => {
  const ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 10h11M11 5.5 15.5 10 11 14.5"/></svg>';
  const MARK = '<svg viewBox="0 0 84 78" fill="none" aria-hidden="true"><path d="M14 10h56L30 52h40l-6 10H8l40-42H8z" fill="currentColor" opacity=".85"/><text x="42" y="76" text-anchor="middle" font-size="9" letter-spacing="1" fill="currentColor" style="font-family: var(--kf-font-display)">BRAND</text></svg>';
  const RIBBON = (id) => `<svg viewBox="0 0 1440 443" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="rb-b"/><stop offset=".45" class="rb-a"/><stop offset="1" class="rb-b"/></linearGradient></defs><path d="M-20 420C260 420 330 120 560 90S860 260 1040 250 1300 40 1460 10V120C1320 140 1180 330 1010 350S700 200 560 210 330 440 -20 443Z" fill="url(#${id})"/><path class="rb-blue" d="M560 443C700 300 800 120 1000 70S1340 30 1460 0V60C1340 90 1160 120 1060 190S760 380 690 443Z"/></svg>`;
  window.zmRibbon = RIBBON;

  const NAV = [
    { href: "index.html", en: "Top", ja: "First Page" },
    { href: "news.html", en: "News", ja: "Notice" },
    { href: "about.html", en: "Work", ja: "About work", sub: [["about.html", "About the work"], ["service.html", "What this job is"], ["about.html#education", "Qualification Support & Training"], ["about.html#numbers", "View in numbers"], ["about.html#faq", "Frequently asked questions"]] },
    { href: "index.html#column", en: "Column", ja: "Column" },
    { href: "index.html#interview", en: "Interview", ja: "Interview video" },
    { href: "index.html#company", en: "Company", ja: "Company info", sub: [["index.html#company", "Message from the CEO"], ["index.html#company", "Company overview"]] },
  ];

  const header = document.querySelector("[data-slot='header']");
  if (header) {
    const cols = [[NAV[0], NAV[1]], [NAV[2]], [NAV[3], NAV[4], NAV[5]]];
    header.innerHTML = `
      <div class="zm-header__inner">
        <div class="zm-header__logo"><a class="zm-header__home" href="index.html" aria-label="First Page" data-label="Company logo — silver diagonal monogram + English name">${MARK}</a></div>
        <nav class="zm-header__nav" aria-label="Header Menu">
          <ul class="zm-header__lists">
            <li><a class="zm-header__link" href="#entry" data-label="Apply button (English)">Entry</a></li>
            <li><button class="zm-header__drawer" type="button" aria-label="Open Menu" aria-expanded="false"><span class="zm-burger__bars"><span class="zm-burger__bar"></span><span class="zm-burger__bar"></span></span></button></li>
          </ul>
          <div class="zm-header__recruit"><a class="zm-header__recruit-link" href="#guidelines">Application guidelines</a></div>
        </nav>
      </div>
      <div class="zm-drawer" id="drawer">
        <div class="zm-drawer__items">
          <div class="zm-drawer__layout">
            <div class="zm-drawer__lists">${cols.map((col) => `<div class="zm-drawer__column">${col.map((n) => `
              <div class="zm-drawer__item"><a class="zm-drawer__link" href="${n.href}"><span class="zm-drawer__link-en">${n.en}</span><span class="zm-drawer__link-ja">${n.ja}</span></a>${n.sub ? `<div class="zm-drawer__sub">${n.sub.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div>` : ""}</div>`).join("")}</div>`).join("")}</div>
            <div class="zm-drawer__actions">
              <a class="zm-drawer__action" href="#guidelines"><span class="en">Guidelines</span><span class="ja">Application guidelines</span></a>
              <a class="zm-drawer__action" href="#entry"><span class="en">Entry</span><span class="ja">Apply</span></a>
              <a class="zm-drawer__action" href="#reservation"><span class="en">Reservation</span><span class="ja">Car reservation</span></a>
            </div>
          </div>
        </div>
      </div>`;
  }

  const submit = document.querySelector("[data-slot='submit']");
  if (submit) {
    submit.innerHTML = `
      <div class="zm-submit__bg zm-ribbon js-ribbon">${RIBBON("zm-rb-submit")}</div>
      <div class="zm-inner zm-submit__cta">
        <div class="zm-submit__row">
          <a class="zm-submit__card" href="#guidelines" id="guidelines"><span class="zm-submit__inner"><span class="zm-submit__ja"><i class="zm-submit__dot"></i>Application guidelines<i class="zm-submit__dot"></i></span><span class="zm-submit__en">Guidelines</span></span></a>
          <a class="zm-submit__card is-entry" href="#entry" id="entry"><span class="zm-submit__inner"><span class="zm-submit__ja"><i class="zm-submit__dot"></i>Apply<i class="zm-submit__dot"></i></span><span class="zm-submit__en">Entry</span></span></a>
        </div>
        <a class="zm-submit__card is-reserve" href="#reservation" id="reservation"><span class="zm-submit__inner"><span class="zm-submit__ja"><i class="zm-submit__dot"></i>Car reservation<i class="zm-submit__dot"></i></span><span class="zm-submit__en">Reservation</span></span></a>
      </div>`;
  }

  const footer = document.querySelector("[data-slot='footer']");
  if (footer) {
    footer.innerHTML = `
      <div class="zm-inner">
        <div class="zm-footer__top">
          <div class="zm-footer__info">
            <div><p class="zm-footer__name">Your company name here</p><p class="zm-footer__text">Headquarters<br>Postal code 000-0000 Your address line here<br>TEL : 000-0000-0000<br>FAX : 000-0000-0000</p></div>
            <div class="zm-footer__logo" data-label="Company logo white">${MARK}</div>
          </div>
          <nav class="zm-footer__nav" aria-label="Footer Menu">
            <div class="zm-footer__col"><a class="zm-footer__link" href="index.html">First Page</a><a class="zm-footer__link" href="news.html">Notice</a></div>
            <div class="zm-footer__col"><a class="zm-footer__link" href="about.html">About work</a><div class="zm-footer__sub">${NAV[2].sub.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div><a class="zm-footer__link" href="index.html#interview">Interview video</a></div>
            <div class="zm-footer__col"><a class="zm-footer__link" href="index.html#column">Column</a><a class="zm-footer__link" href="index.html#company">Company info</a><div class="zm-footer__sub">${NAV[5].sub.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div><a class="zm-footer__link" href="#guidelines">Application guidelines</a><a class="zm-footer__link" href="#entry">Apply</a></div>
          </nav>
        </div>
        <div class="zm-footer__bottom"><div class="zm-footer__legal"><a href="#">Privacy policy</a><a href="#">Shipping terms</a></div></div>
        <p class="zm-footer__copy">Copyright © BRAND official site. All rights reserved.</p>
      </div>`;
  }

  // Header bar: shrinks after scrolling past 300px
  const head = document.querySelector(".zm-header");
  if (head) {
    const update = () => head.classList.toggle("js-scroll-header", scrollY > 300);
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  // Drawer: pressing the button turns on the blue panel in .3s and the button becomes a blue X on white
  const btn = document.querySelector(".zm-header__drawer");
  const drawer = document.getElementById("drawer");
  if (btn && drawer) {
    const set = (open) => {
      btn.classList.toggle("is-active", open);
      drawer.classList.toggle("is-active", open);
      document.body.classList.toggle("drawer-open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => set(!btn.classList.contains("is-active")));
    drawer.addEventListener("click", (e) => { if (e.target.closest("a[href]")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  addEventListener("load", () => document.body.classList.add("fade-in"));
  if (document.readyState === "complete") document.body.classList.add("fade-in");
})();

// Shared reveal motion — values straight from the original gsap.js (plays once when it reaches 90% of the screen)
window.zmMotion = () => {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const enter = (sel, from, to) => document.querySelectorAll(sel).forEach((el) => {
      gsap.fromTo(el, from, { ...to, scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    enter(".js-ribbon", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 3, ease: "power3.out", delay: 0.5 });
    enter(".js-news-ribbon", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 1.5, ease: "power3.out" });
    enter(".js-clip-path-from-bottom", { opacity: 0, clipPath: "inset(100% 0 0 0)" }, { opacity: 1, clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "power2.inOut" });
    enter(".js-opacity-word", { opacity: 0 }, { opacity: 1, duration: 1, ease: "power2.inOut" });
    enter(".js-pro-word", { "--width": "0%", opacity: 0 }, { "--width": "101%", opacity: 1, duration: 1.5, ease: "power3.out" });
    document.querySelectorAll(".js-parallax").forEach((box) => {
      const img = box.querySelector(".wf-img");
      if (img) gsap.fromTo(img, { y: -60 }, { y: 0, ease: "power2.inOut", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
  addEventListener("load", () => ScrollTrigger.refresh());
};
