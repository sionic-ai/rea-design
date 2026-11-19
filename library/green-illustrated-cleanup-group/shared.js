/* Common to all pages: draws the header row · menu panel · footer · FAQ speech bubbles, and the original’s header hide (400px) · menu panel open/close ·
   Hooks up submenu expand (jQuery slideToggle 400ms swing), smooth anchor scrolling (smooth-scroll 700ms easeInOutQuint, 90px above) and AOS. */
(() => {
  const page = document.body.dataset.page || "home";

  const ICON = {
    logo: '<svg viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="26" cy="26" r="24.5"/><path d="M27 10c-3 0-5 2-5 5 0 2 1 3 1 5-3 3-7 8-7 14 0 5 4 8 9 8"/><path d="M27 10c2 0 4 1 4 3l4 1-4 2c0 3 2 6 3 9 2 5 0 10-5 12"/><circle cx="28.5" cy="13" r=".6" fill="currentColor"/><path d="M24 30c3-1 5 1 5 3s-2 3-4 2m4-2c0 4-2 6-5 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 8V7a4 4 0 0 1 8 0v1h2.2a1 1 0 0 1 1 .9l.9 11a2 2 0 0 1-2 2.1H5.9a2 2 0 0 1-2-2.1l.9-11a1 1 0 0 1 1-.9Zm2 0h4V7a2 2 0 0 0-4 0Zm-1 3.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.2-8.3L1.9 3h6.4l4.4 5.8Zm-1.1 16.2h1.7L7.4 4.7H5.6Z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.6 22v-8.4h2.8l.5-3.3h-3.3V8.2c0-.9.3-1.6 1.7-1.6H17V3.7a23 23 0 0 0-2.6-.1c-2.6 0-4.3 1.6-4.3 4.4v2.4H7.3v3.3h2.8V22Z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".8" fill="currentColor" stroke="none"/></svg>',
  };
  const social = `<ul class="gb-social">
      <li><a href="#" aria-label="Shop">${ICON.bag}</a></li>
      <li><a href="#" aria-label="SNS 1">${ICON.x}</a></li>
      <li><a href="#" aria-label="SNS 2">${ICON.fb}</a></li>
      <li><a href="#" aria-label="SNS 3">${ICON.ig}</a></li>
    </ul>`;

  const header = document.querySelector("[data-slot='header']");
  if (header) {
    header.classList.add("gb-header");
    header.innerHTML = `<nav class="gb-nav">
      <button type="button" class="gb-toggle" aria-label="Open Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      <h1 class="gb-brand"><a href="index.html" aria-label="Brand Name home page" data-label="Brand logo — line drawing of a single bird in a circle">${ICON.logo}</a></h1>
      <div class="gb-header-right">
        <a class="gb-btn" href="contact.html">Contact Us</a>
        ${social}
      </div>
    </nav>`;
    // Original app.js: past 400px it sticks to the top of the screen and slides down from -100px at .3s ease-in-out, and on return goes straight back to its in-flow position — part dock-down-header
    header.setAttribute("data-fx", "dock-down-header");
    header.setAttribute("data-fx-dock-down-header", "after: 400; dur: .3; out: 0; wide: 0");
    header.style.setProperty("--fx-ease", "ease-in-out");
    header.style.setProperty("--fx-shift", "-100px");
    header.style.setProperty("--fx-bg", "transparent");
  }

  const menu = document.createElement("div");
  menu.className = "gb-menu";
  menu.setAttribute("data-slot", "menu-drawer");
  menu.innerHTML = `<div class="gb-menu__dialog"><div class="gb-menu__content"><div class="gb-menu__body">
    <ul class="gb-menu__list">
      <li class="has-child"><a href="#">About</a><ul class="gb-menu__sub"><li><a href="about.html">About first page</a></li><li><a href="about.html#report">Activity Report</a></li></ul></li>
      <li class="has-child"><a href="#">Team</a><ul class="gb-menu__sub"><li><a href="index.html#team">Team home page</a></li><li><a href="index.html#team">Region 1</a></li><li><a href="index.html#team">Region 2</a></li><li><a href="index.html#team">Region 3</a></li><li><a href="index.html#team">Region 4</a></li><li><a href="index.html#team">Region 5</a></li><li><a href="index.html#team">Region 6</a></li><li><a href="index.html#team">Region 7</a></li><li><a href="index.html#team">Region 8</a></li><li><a href="index.html#team">Region 9</a></li><li><a href="index.html#team">Overseas</a></li></ul></li>
      <li><a href="index.html#schedule" class="gb-link">Schedule</a></li>
      <li class="has-child"><a href="#">Project</a><ul class="gb-menu__sub"><li><a href="index.html#project">Project Name 1</a></li><li><a href="index.html#project">Project Name 2</a></li><li><a href="index.html#project">Your event name here</a></li></ul></li>
      <li><a href="index.html#donation" class="gb-link">Donation</a></li>
      <li><a href="index.html#supporters" class="gb-link">Supporters</a></li>
      <li><a href="news.html" class="gb-link">News</a></li>
      <li><a href="contact.html#faq" class="gb-link">FAQ</a></li>
    </ul>
    <div class="gb-menu__contact"><a class="gb-btn" href="contact.html">Contact Us</a></div>
    <div class="gb-menu__sns">${social}</div>
  </div></div></div>`;
  document.body.appendChild(menu);

  const footer = document.querySelector("[data-slot='footer']");
  if (footer) {
    footer.classList.add("gb-footer");
    footer.innerHTML = `<div class="gb-wrap">
      <a class="gb-footer__mark" href="index.html" data-label="Brand English name — two-line handwritten wordmark"><span class="gb-wordmark" lang="en"><span>brand</span><span>name</span></span></a>
      <p class="gb-footer__copy">© brand name all rights reserved.</p>
    </div>`;
  }

  if (page === "home") {
    const faq = document.createElement("a");
    faq.className = "gb-faq";
    faq.href = "contact.html#faq";
    faq.setAttribute("data-slot", "faq-bubble");
    faq.setAttribute("aria-label", "Frequently asked questions");
    faq.innerHTML = `<svg viewBox="0 0 168 158" aria-hidden="true">
      <path class="gb-faq__fill" d="M77 4c22-2 44 6 59 22 13 14 19 33 16 52-2 14-7 26-15 37-4 6-6 11-9 15-12 8-30 8-45 7-17-1-35-5-48-16C20 110 10 94 7 77 4 58 9 38 22 24 36 11 56 5 77 4Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="137" cy="138" r="7" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="157" cy="148" r="5" fill="none" stroke="currentColor" stroke-width="4"/>
      <text class="gb-faq__text" x="78" y="68" text-anchor="middle">Frequently asked</text><text class="gb-faq__text" x="78" y="96" text-anchor="middle">Question</text>
    </svg>`;
    document.body.appendChild(faq);
  }

  // Menu board — same order as a bootstrap modal. The button shape changes the instant it is pressed, and the board waits for the (invisible) backdrop .15s before appearing.
  // When closing, the panel leaves in .3s, and only after waiting another .15s of backdrop does the button return to a hamburger (hidden.bs.modal)
  const toggle = document.querySelector(".gb-toggle");
  let open = false, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const show = () => {
    clear();
    open = true;
    document.body.classList.add("is-menu-open");
    toggle && toggle.setAttribute("aria-expanded", "true");
    later(() => {
      menu.classList.add("is-shown");
      void menu.offsetWidth;
      menu.classList.add("is-in");
    }, 150);
  };
  const hide = () => {
    clear();
    open = false;
    menu.classList.remove("is-in");
    toggle && toggle.setAttribute("aria-expanded", "false");
    later(() => menu.classList.remove("is-shown"), 300);
    later(() => document.body.classList.remove("is-menu-open"), 450);
  };
  toggle && toggle.addEventListener("click", () => (open ? hide() : show()));
  menu.addEventListener("click", (e) => { if (e.target === menu || e.target.classList.contains("gb-menu__dialog")) hide(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) hide(); });
  menu.querySelectorAll(".gb-link, .gb-menu__sub a").forEach((a) => a.addEventListener("click", hide));

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  menu.querySelectorAll(".has-child > a").forEach((a) => {
    const sub = a.nextElementSibling;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      a.classList.toggle("is-on");
      const opening = a.classList.contains("is-on");
      if (reduce || !window.gsap) { sub.style.display = opening ? "block" : "none"; return; }
      gsap.killTweensOf(sub);
      if (opening) {
        sub.style.display = "block";
        gsap.fromTo(sub, { height: 0 }, { height: sub.scrollHeight, duration: 0.4, ease: "sine.inOut", clearProps: "height" });
      } else {
        gsap.to(sub, { height: 0, duration: 0.4, ease: "sine.inOut", onComplete: () => { sub.style.display = "none"; gsap.set(sub, { clearProps: "height" }); } });
      }
    });
  });

  if (window.SmoothScroll) {
    new SmoothScroll('a[href*="#"]:not([href="#"])', { speedAsDuration: true, speed: reduce ? 0 : 700, offset: 90, easing: "easeInOutQuint", updateURL: true, popstate: true });
  }
  // Measure positions after the page script has drawn all content like schedule cells, so late-attached sections rise on time
  const startAos = () => window.AOS && AOS.init({ disable: reduce });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startAos);
  else setTimeout(startAos);
  window.addEventListener("load", () => window.AOS && AOS.refresh());
})();
