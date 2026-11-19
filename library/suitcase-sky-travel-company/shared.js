// Builds what spans several pages (loader · header · card spread panel · contact panel · footer) in one place, and when the loader ends turns on the header and Hero.
// The original runs the loader only at the start of a session, shows the header right away on later pages, and turns on the hero after 1 second. Page changes are normal navigation in the original too (barba is only loaded)
(() => {
  const ARROW = '<svg viewBox="0 0 16 16"><path d="M9.3 2.6a1 1 0 0 1 1.4 0l4.7 4.7a1 1 0 0 1 0 1.4l-4.7 4.7a1 1 0 1 1-1.4-1.4L12.3 9H1.5a1 1 0 1 1 0-2h10.8L9.3 4a1 1 0 0 1 0-1.4z"/></svg>';
  const MAIL = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="4"/><path d="m7 10 5 3.5 5-3.5"/></svg>';
  const ICONS = {
    about: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>',
    service: '<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3.5"/><circle cx="16" cy="8" r="3.5"/><circle cx="8" cy="16" r="3.5"/><circle cx="16" cy="16" r="3.5"/></svg>',
    news: '<svg viewBox="0 0 24 24"><path d="M5 5h11a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3z"/><path d="M9 10h6M9 14h4"/></svg>',
    recruit: '<svg viewBox="0 0 24 24"><circle cx="11" cy="8" r="4"/><path d="M4 20c0-4 3-6 7-6M15.5 17.5l2 2 3.5-4"/></svg>',
  };
  const btn = (text, href, light) =>
    `<a class="kk-btn${light ? " is-light" : ""}" href="${href}"><span class="kk-btn__text" data-fx="wipe-through-hover" data-fx-wipe-through-hover="look: line">${text}</span><span class="kk-btn__icon"><span data-fx="arrow-cycle-hover">${ARROW}</span></span></a>`;
  const card = (href, label, en, ja, bite = true) =>
    `<div class="kk-card"><a class="kk-card__in" href="${href}"><div class="kk-card__img${bite ? " is-bite" : ""}"><div class="kk-card__ph"><div class="wf-img" data-label="${label}"></div></div></div>` +
    `<div class="kk-card__text layer"><div class="kk-card__en" data-label="Your card English name here"><span data-fx="wipe-through-hover" data-fx-wipe-through-hover="look: line">${en}</span></div>` +
    `<p class="kk-card__ja"><span data-fx="wipe-through-hover" data-fx-wipe-through-hover="look: line">${ja}</span></p></div><div class="kk-card__icon">${ARROW}</div></a></div>`;
  const serviceCards = (list) => {
    const svc = [
      ["Seaside island scenery · clear day · landscape · 8px blur", "Your service intro here<br>Second-line text / App", "Category", ["Target 1", "Target 2", "Target 3"]],
      ["Person skiing · snowy scene · landscape · 8px blur", "Your service intro here<br>Second line, slightly longer text", "Category", ["Target 2", "Target 3"]],
      ["Two people in suits shaking hands · indoors · landscape · 8px blur", "Your service intro here<br>Second-line text", "Category / Category two", []],
      ["Woman on the phone · overcast office · landscape · 8px blur", "Your service intro here<br>Second-line text", "Category", ["Target 2", "Target 3"]],
    ];
    list.innerHTML = svc
      .map(([photo, copy, cat, tags], i) => `
<li class="kk-card kk-svc__card"><a class="kk-card__in" href="service.html">
  <div class="kk-card__img is-bite"><div class="kk-card__ph is-svc"><div class="wf-img" data-label="${photo}"></div></div></div>
  <div class="kk-svc__mock layer"><div class="wf-img" data-label="App screen phone mockup · transparent background"></div></div>
  <div class="kk-svc__text layer">
    <h3 class="kk-svc__name" data-label="Your service English logo text here">Service Logo ${i + 1}</h3>
    <div><p class="kk-svc__copy">${copy}</p><div class="kk-svc__cat"><div class="kk-svc__catname">${cat.split(" / ").map((c) => `<span>${c}</span>`).join("")}</div>${tags.length ? `<ul>${tags.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}</div></div>
  </div>
  <div class="kk-card__icon">${ARROW}</div>
</a></li>`)
      .join("");
  };
  window.kkParts = { ARROW, MAIL, btn, card };

  const sub = (cards) => `<div class="kk-sub" data-fx-part="panel"><div class="kk-sub__in" data-fx-part="inner">${cards.join("")}</div><div class="kk-sub__veil" data-fx-part="veil"></div></div>`;
  const aboutCards = [
    card("about.html", "Office entrance logo wall · bright daylight · landscape", "ABOUT US", "One-line Company About", false),
    card("about.html", "Two staff in a meeting · natural light · landscape", "MISSION", "What we do", false),
    card("about.html", "Staff group photo · office · landscape", "COMPANY", "Address · Founded", false),
    card("about.html", "CEO half-body · outdoor greenery · landscape", "MESSAGE", "Message from the CEO", false),
    card("about.html", "Phone with app screen · logo panel · landscape", "LOCAL BRANCH", "About branch", false),
  ];
  const svcMenuCards = [
    card("service.html", "Gray empty panel (list entrance) · Landscape", "INDEX", "Services at a glance", false),
    card("service.html", "Seaside island scenery · clear day · landscape", "Service Logo 1", "Service logo slot", false),
    card("service.html", "Person skiing · snowy scenery · landscape", "Service Logo 2", "Service logo slot", false),
    card("service.html", "Two people in suits shaking hands · indoors · landscape", "Service Logo 3", "Service logo slot", false),
    card("service.html", "Woman on the phone · Overcast office · Landscape", "Service Logo 4", "Service logo slot", false),
  ];
  const head = `
<header class="kk-head" data-slot="header">
  <svg class="kk-head__wave" viewBox="0 0 756 152" preserveAspectRatio="none" aria-hidden="true">
    <path class="kk-head__shade" d="M0 0h756c-26 10-58 34-104 66-58 40-112 72-196 80-86 8-146-26-232-30C140 112 60 126 0 146z" transform="translate(0 7)"/>
    <path d="M0 0h756c-26 10-58 34-104 66-58 40-112 72-196 80-86 8-146-26-232-30C140 112 60 126 0 146z"/>
  </svg>
  <div class="kk-head__in">
    <a class="kk-head__logo" href="index.html" aria-label="First Page"><span class="kk-logo">logo<small>Logo subtitle</small></span></a>
    <nav class="kk-nav" aria-label="Main menu" data-label="Four English menu names here">
      <ul class="kk-nav__list">
        <li class="kk-nav__item" data-fx="panel-drop-menu"><button class="kk-nav__btn" data-fx-part="trigger" type="button">${ICONS.about}<span>ABOUT US</span></button>${sub(aboutCards)}</li>
        <li class="kk-nav__item" data-fx="panel-drop-menu"><button class="kk-nav__btn" data-fx-part="trigger" type="button">${ICONS.service}<span>SERVICES</span></button>${sub(svcMenuCards)}</li>
        <li class="kk-nav__item"><a class="kk-nav__btn" href="news.html">${ICONS.news}<span>NEWS</span></a></li>
        <li class="kk-nav__item"><a class="kk-nav__btn" href="recruit.html">${ICONS.recruit}<span>RECRUIT</span></a></li>
      </ul>
      <a class="kk-contact" href="#contact" aria-label="Inquiry"><span class="kk-contact__main">${MAIL}</span></a>
    </nav>
  </div>
</header>`;

  const loader = `
<div class="kk-loader" data-fx="stroke-bar-loader" data-fx-stroke-bar-loader="once: session" data-slot="loader">
  <div data-fx-part="mark">
    <svg data-fx-part="logo" viewBox="0 0 820 327" aria-hidden="true">
      <path d="M66 24v196"/><path d="M66 170 152 78"/><path d="M100 136c8 44 30 70 72 68"/>
      <path d="M210 24v196"/><path d="M210 170 296 78"/><path d="M244 136c8 44 30 70 72 68"/>
      <circle cx="398" cy="150" r="54"/><path d="M452 40v170"/>
      <circle cx="548" cy="150" r="54"/><path d="M602 98v112"/>
      <path d="M646 84v74c0 30 22 48 54 48s56-18 56-48V84"/><path d="M756 158v60c0 40-24 74-56 74-24 0-40-10-50-26"/>
    </svg>
    <p data-fx-part="copy">Excitement for your trip</p>
  </div>
  <span data-fx-part="bar"></span>
</div>`;

  const foot = `
<footer data-slot="footer">
  <section class="kk-fcontact" id="contact" data-slot="footer-contact">
    <div class="kk-fcontact__copy">
      <div class="kk-fcontact__en" data-label="Large text here inviting contact, two lines">Big Closing Line<br>goes here!</div>
      <h2 class="kk-fcontact__ja">Your one line inviting inquiries here</h2>
      <p class="kk-fcontact__desc">Your body text explaining how to get in touch goes here.<br>Your second line goes here.</p>
      <div class="kk-fcontact__list">
        ${card("#contact", "Two people consulting at a laptop · bright office · landscape", "CONTACT US", "Contact form", true).replace('<div class="kk-card__icon">' + ARROW, '<div class="kk-card__icon">' + MAIL.replace("<svg", '<svg class="is-line"'))}
        ${card("#contact", "Parasols and sunbeds by the sea · Clear sky · Landscape", "VISIT OUR SITE", "To external booking site", true)}
      </div>
    </div>
  </section>
  <section class="kk-fend" data-slot="footer-end">
    <div class="kk-fend__in">
      <h2 class="kk-fend__copy">Your company pledge, one line</h2>
      <div class="kk-fend__info">
        <div class="kk-fend__company"><h3>Company name slot</h3><p>Registration number slot<br>Your address line goes here<br>Tel 00-0000-0000 (weekdays 00:00~00:00)<br>Email mail@example.com</p></div>
        <div class="kk-fend__map" data-label="Column header is the menu’s English name, service column is the service’s English name">
          <ul><li class="title">ABOUT US</li><li><a href="about.html">Menu 1</a></li><li><a href="about.html">Menu 2</a></li><li><a href="about.html">Menu 3</a></li><li><a href="about.html">Menu 4</a></li><li><a href="about.html">Menu 5</a></li><li><a href="#contact">Inquiry</a></li></ul>
          <ul><li class="title">SERVICES</li><li><a href="service.html">Service 1</a></li><li><a href="service.html">Service 2</a></li><li><a href="service.html">Service 3</a></li><li><a href="service.html">Service 4</a></li><li><a href="news.html">Case intro</a></li><li><a href="news.html">Seminar</a></li></ul>
          <ul><li class="title">NEWS</li><li><a href="news.html">All News</a></li><li><a href="news.html">Notice</a></li><li><a href="news.html">Press Release</a></li><li><a href="news.html">Press coverage</a></li></ul>
          <ul><li class="title">RECRUIT</li><li><a href="recruit.html">Hiring Info</a></li><li><a href="recruit.html">Staff Interview</a></li><li><a href="recruit.html">Job role</a></li></ul>
        </div>
      </div>
      <div class="kk-fend__end">
        <div class="kk-fend__logo"><span class="kk-logo">logo<small>Logo subtitle</small></span></div>
        <div class="kk-fend__content">
          <div class="kk-fend__sns">
            <a href="#" aria-label="SNS 1"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></a>
            <a href="#" aria-label="SNS 2"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4"/></svg></a>
            <a href="#" aria-label="SNS 3"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="6"/></svg></a>
            <a href="#" aria-label="SNS 4"><svg viewBox="0 0 24 24"><path d="M4 3h4l12 18h-4z"/></svg></a>
            <a href="#" aria-label="SNS 5"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></a>
          </div>
          <ul class="kk-fend__legal"><li><a href="#">Terms of service</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Travel terms</a></li><li><a href="#">Display Details</a></li></ul>
          <div class="kk-fend__privacy"><div class="wf-img" data-label="Certification Mark"></div><p>Your privacy verification notice goes here in about three lines. Your second line goes here. Your third line goes here.</p></div>
          <p class="kk-fend__copyright">© 0000 Company Name All rights reserved.</p>
        </div>
      </div>
    </div>
  </section>
</footer>`;

  const body = document.body;
  // Same session key as the loader part — for an already seen tab, put the header in already on from the start so it shows immediately without a transition (the original sets isActive before the first paint)
  const seen = sessionStorage.getItem(`fx-loader:${location.pathname.split("/").slice(0, -1).join("/")}`);
  body.insertAdjacentHTML("afterbegin", seen ? loader.replace('class="kk-loader"', 'class="kk-loader" hidden') + head.replace('class="kk-head"', 'class="kk-head is-active"') : loader + head);
  document.querySelector("[data-foot]")?.insertAdjacentHTML("afterend", foot);
  document.querySelector("[data-foot]")?.remove();

  document.querySelectorAll("[data-svc-list]").forEach(serviceCards);
  document.querySelectorAll("[data-btn]").forEach((el) => {
    const [text, href] = el.dataset.btn.split("|");
    el.outerHTML = btn(text, href);
  });

  const header = document.querySelector(".kk-head");
  const fv = document.querySelector("main");
  const page = body.dataset.page;
  document.querySelectorAll(".kk-nav__item").forEach((li, i) => {
    if (["about", "service", "news", "recruit"][i] === page) li.classList.add("is-current");
  });
  // The original goes to the top every time it opens — because the hero entrance only runs at the top
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  addEventListener("DOMContentLoaded", () => window.scrollTo({ top: 0, behavior: "instant" }));
  document.addEventListener("fx:loaded", (e) => {
    header.classList.add("is-active");
    if (e.detail?.instant) setTimeout(() => fv.classList.add("is-active"), 1000);
    else fv.classList.add("is-active");
  });
})();
