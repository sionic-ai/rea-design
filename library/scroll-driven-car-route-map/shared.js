// Shared by all pages: header (logo tab, notice bar, language, menu) · full-screen drawer (Slideout) · back to top · footer · English marquee (Splide AutoScroll) · reveal markers
(() => {
  const ICON = {
    x: '<svg viewBox="0 0 24 24"><path d="M3 3h5l13 18h-5zM20 3h-2l-6 7 1 1.6zM4 21h2l6.3-7.3-1-1.5z"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.3 5.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    list: '<svg viewBox="0 0 17 9"><path d="M0 0h2v2H0zm4 0h13v2H4zM0 3.5h2v2H0zm4 0h13v2H4zM0 7h2v2H0zm4 0h13v2H4z"/></svg>',
  };
  // A small car seen from the side — not copying the original drawing but redrawn for the same purpose (car icon)
  const car = () => '<svg viewBox="0 0 70 40" aria-hidden="true"><path fill="var(--site-yellow)" stroke="var(--kf-ink)" stroke-width="2" d="M6 28v-8c0-3 2-5 5-5h8l8-8h18c3 0 5 1 7 4l5 9h3c3 0 5 2 5 5v3z"/><path fill="var(--site-sky)" stroke="var(--kf-ink)" stroke-width="1.5" d="M29 9h14l6 8H22z"/><circle cx="18" cy="30" r="6" fill="var(--kf-ink)"/><circle cx="52" cy="30" r="6" fill="var(--kf-ink)"/></svg>';
  const bus = '<svg viewBox="0 0 98 60" aria-hidden="true"><rect x="3" y="6" width="92" height="42" rx="10" fill="var(--site-blue)" stroke="var(--kf-ink)" stroke-width="2"/><path fill="var(--kf-bg)" d="M12 14h16v14H12zm22 0h16v14H34zm22 0h16v14H56zm22 0h10v14H78z"/><circle cx="24" cy="50" r="7" fill="var(--kf-ink)"/><circle cx="74" cy="50" r="7" fill="var(--kf-ink)"/></svg>';
  const tree = '<svg viewBox="0 0 40 60" aria-hidden="true"><path fill="var(--site-grass-deep)" d="M20 2 36 42H4z"/><path fill="var(--kf-ink-soft)" d="M18 42h4v14h-4z"/></svg>';
  const arrow2 = `<i class="sk-arrow">${ICON.arrow}${ICON.arrow}</i>`;
  const sns = `<div class="sk-sns"><a href="#" aria-label="X">${ICON.x}</a><a href="#" aria-label="Social Media">${ICON.ig}</a></div>`;
  // Original c-logoMarquee: text + two semicircles (the back semicircle is a separately painted color)
  const marquee = (cls = "") => `<div class="sk-marquee splide ${cls}" aria-hidden="true"><div class="splide__track"><div class="splide__list">${
    Array.from({ length: 5 }, () => '<div class="splide__slide"><div class="sk-marquee__item"><p>Placeholder brand</p><div class="sk-marquee__icon"><i></i><i></i></div></div></div>').join("")
  }</div></div></div>`;
  const ticker = document.body.dataset.ticker === "1";

  const header = document.querySelector('[data-slot="header"]');
  header.classList.add("sk-header");
  header.innerHTML = `
    <a class="sk-logo" href="index.html"><b>Your path name here</b><small class="sk-en">PLACEHOLDER BRAND</small></a>
    ${ticker ? `<div class="sk-ticker"><a class="sk-ticker__ttl" href="news.html"><p>One important notice line scrolls here. Add one more notice line here with a date.</p></a><a class="sk-ticker__btn" href="news.html">${ICON.list}<span>List</span></a></div>` : ""}
    <div class="sk-tools">
      <div class="sk-lang"><button class="sk-lang__btn sk-en" type="button" aria-expanded="false">Language</button><ul class="sk-lang__list"><li><a class="is-current" href="index.html">Korean</a></li><li><a href="index.html">English</a></li></ul></div>
      ${ticker ? "" : sns}
      <button class="sk-menubtn" type="button" aria-label="Open Menu"><span></span></button>
    </div>`;

  const CARDS = [["Night view", "City night view from a mountain · night · landscape 16:9"], ["Flowers of the season", "Cherry blossom branch in full bloom · spring daytime · landscape 16:9"], ["Nearby Attractions", "White steel-frame observatory building · clear day · landscape 16:9"], ["Drive picks<br>Landmark", "Car running on a curved forest road · green shade · landscape 16:9"]];
  const SUB = [["news.html", "Important Alert"], ["news.html", "Notice"], ["#", "Frequently asked questions"], ["index.html#fare", "Search Pricing"]];
  document.body.insertAdjacentHTML("beforeend", `
    <nav class="sk-gnav" id="sk-gnav" data-slot="drawer" aria-label="Full menu">
      <div class="sk-gnav__container">
        <div class="sk-gnav__logoframe"><a class="sk-gnav__logo" href="index.html"><b>Your path name here</b><small class="sk-en">PLACEHOLDER BRAND</small></a></div>
        <div class="sk-gnav__inner">
          <div class="sk-gnav__main">${CARDS.map(([t, l]) => `<a class="sk-gnav__card" href="#"><div class="sk-gnav__img"><div class="wf-img" data-label="${l}"></div></div><span class="sk-gnav__cap">${t}</span>${arrow2}</a>`).join("")}</div>
          <div class="sk-gnav__sub">
            <div class="sk-gnav__menu">${SUB.map(([h, t]) => `<a href="${h}" class="sk-gnav__link${h.includes("#") ? " js-scroll" : ""}">${arrow2}<p>${t}</p></a>`).join("")}</div>
            <div class="sk-gnav__deco"><i class="is-car">${car()}</i><i class="is-bus">${bus}</i><i class="is-tree">${tree}</i></div>
            <div class="sk-gnav__foot"><div class="sk-gnav__sublink"><a href="about.html">History</a><a href="page.html">Terms</a></div>${sns}</div>
          </div>
        </div>
      </div>
      <div class="sk-gnav__marquee">${marquee()}</div>
    </nav>
    <div class="sk-gnav-panel" id="sk-gnav-panel"></div>
    <button class="sk-totop" type="button" data-slot="to-top" aria-label="Back to top">${ICON.up}TOP</button>`);

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.classList.add("sk-footer");
    footer.innerHTML = `
      <div class="sk-footer__panel">
        <div>
          <p class="sk-footer__logo"><b>Your path name here</b><small>PLACEHOLDER BRAND</small></p>
          <p class="sk-footer__tel">Tel.<a href="#">0000-00-0000</a><br>(Contact hours 00:00~00:00)</p>
        </div>
        <div class="sk-footer__side">${sns}<div class="sk-footer__links"><a href="about.html">History</a><a href="page.html">Terms</a></div></div>
        <p class="sk-footer__copy">COPYRIGHT © PLACEHOLDER BRAND ALL RIGHTS RESERVED.</p>
      </div>
      ${marquee("is-footer")}`;
  }

  // Arrow cell — on hover the two arrows slide one cell to the right and a new arrow comes in (original ::before·::after translate 100%)
  document.querySelectorAll(".sk-arrow").forEach((a) => { if (a.children.length === 1) a.insertAdjacentHTML("beforeend", ICON.arrow); });

  // Drawer — same Slideout as the original (1.0.1, duration 10): the panel shifts 256px and a full-screen panel appears on html.slideout-open in .4s.
  const root = document.documentElement;
  const btn = header.querySelector(".sk-menubtn");
  const gnav = document.getElementById("sk-gnav"), panel = document.getElementById("sk-gnav-panel");
  if (window.Slideout) {
    const slide = new Slideout({ panel, menu: gnav, duration: 10 });
    const label = () => btn.setAttribute("aria-label", slide.isOpen() ? "Close Menu" : "Open Menu");
    slide.on("open", label); slide.on("close", label);
    btn.addEventListener("click", () => slide.toggle());
    [panel, ...gnav.querySelectorAll(".js-scroll")].forEach((el) => el.addEventListener("click", () => slide.close()));
    addEventListener("keydown", (e) => e.key === "Escape" && slide.isOpen() && slide.close());
  }

  // Language picker: on press the list rises from 2rem below in .4s
  const lang = header.querySelector(".sk-lang__btn");
  lang.addEventListener("click", () => lang.setAttribute("aria-expanded", lang.classList.toggle("is-view")));

  document.querySelector(".sk-totop").addEventListener("click", () => scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  // Original Pu(): must scroll down more than 100px to rise from below
  const totop = () => document.querySelector(".sk-totop").classList.toggle("is-inact", scrollY <= 100);

  document.querySelectorAll("[data-marquee]").forEach((el) => (el.innerHTML = marquee(el.dataset.marquee)));

  // English marquee — original js-sliderLoop options as is (Splide slide type + AutoScroll .5px per frame, doesn’t stop on hover)
  const AutoScroll = window.splide?.Extensions?.AutoScroll;
  if (window.Splide) document.querySelectorAll(".sk-marquee.splide").forEach((el) => {
    new Splide(el, {
      speed: 400, interval: 3000, autoWidth: true, arrows: false, pagination: false, drag: false,
      autoScroll: { speed: 0.5, pauseOnHover: false, pauseOnFocus: false },
      reduceMotion: { speed: 400, interval: 3000, autoScroll: 0.5, pauseOnFocus: false, pauseOnHover: false },
    }).mount(AutoScroll ? { AutoScroll } : {});
  });

  // Reveal — original js-anime: when the top edge crosses the line at 1/5 of screen height from the bottom (1/10 below 992px), it adds is-anime and the CSS transition runs. Once added it stays.
  const anime = [...document.querySelectorAll("[data-anime]")];
  const check = () => {
    const vh = innerHeight, line = vh - vh / (innerWidth < 992 ? 10 : 5);
    anime.forEach((el) => el.getBoundingClientRect().top < line && el.classList.add("is-anime"));
    totop();
  };
  addEventListener("scroll", check, { passive: true });
  addEventListener("resize", check);
  addEventListener("load", check);
  check();

  window.sk = { car, ICON, tree };
})();
