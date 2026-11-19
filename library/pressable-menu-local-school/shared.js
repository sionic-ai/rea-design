// Common to all pages: draws in the base path, header, menu board, contact and village footer, then hooks up the loading curtain, phone menu, bottom-right MENU tab, reveal on view and photo parallax.
// Original values: fadeOut 500ms after 800ms loading (jQuery swing = sine.inOut) · phone menu slideToggle 400ms swing · MENU tab transform .3s ·
// Entrance IntersectionObserver 5% → opacity · translateY(3rem) 1s (groups .8s, 0.2s apart) · photo parallax ±20px scrub 3 · car 15s linear + 0.3s jitter.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("js");
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const A = (window.ARC = { reduce, page });

  // ── Artwork: original icons·mascot·village redrawn in the same place·size·feel ──
  const I = {
    mail: '<svg viewBox="0 0 26 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="1" y="1" width="24" height="16" rx="1.5"/><path d="m1.5 1.8 11.5 9 11.5-9"/></svg>',
    cal: '<svg viewBox="0 0 26 24"><rect class="a-f-surface a-s-ink" x="1" y="3" width="24" height="20" rx="2" stroke-width="1.8"/><path class="a-f-red" d="M2 4h22v5H2z"/><path class="a-s-ink" d="M7 1v5M19 1v5" stroke-width="1.8" stroke-linecap="round"/><g class="a-f-ink"><rect x="5" y="12" width="3" height="2.4"/><rect x="11.5" y="12" width="3" height="2.4"/><rect x="18" y="12" width="3" height="2.4"/><rect x="5" y="17" width="3" height="2.4"/><rect x="11.5" y="17" width="3" height="2.4"/><rect x="18" y="17" width="3" height="2.4"/></g></svg>',
    tel: '<svg viewBox="0 0 28 32" fill="currentColor"><path d="M8.3 1.2c1-.6 2.2-.3 2.8.7l3 5.2c.6 1 .3 2.2-.6 2.8l-2.3 1.5c-.5.3-.7 1-.4 1.5 1.5 3.4 3.4 6.6 5.6 9.6.4.5 1 .6 1.6.4l2.5-1.2c1-.5 2.2-.1 2.7.9l2.8 5.4c.5 1 .1 2.2-.8 2.7l-2.6 1.4c-2.1 1.1-4.7.8-6.4-.9C9.9 24.8 5.6 17.2 3.4 9.2 2.8 7 3.6 4.5 5.6 3.2z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="6"/><circle cx="12" cy="12" r="4.6"/><circle cx="17.7" cy="6.3" r="1" fill="currentColor" stroke="none"/></svg>',
    car: '<svg viewBox="0 0 44 32"><path class="a-f-accent a-s-ink" stroke-width="2" d="M7 13 10.5 4.5C11.2 2.9 12.6 2 14.3 2h15.4c1.7 0 3.1.9 3.8 2.5L37 13c2.8.6 5 3 5 6v6H2v-6c0-3 2.2-5.4 5-6z"/><path class="a-f-surface" d="M11 13 13.4 6.4c.3-.8 1-1.4 1.9-1.4h13.4c.9 0 1.6.6 1.9 1.4L33 13z"/><rect class="a-f-ink" x="4" y="25" width="8" height="6" rx="2"/><rect class="a-f-ink" x="32" y="25" width="8" height="6" rx="2"/><circle class="a-f-surface" cx="9" cy="19" r="2.5"/><circle class="a-f-surface" cx="35" cy="19" r="2.5"/></svg>',
    staff: '<svg viewBox="0 0 32 40" fill="none" stroke-width="2"><circle class="a-s-ink a-f-skin" cx="16" cy="11" r="7.5"/><path class="a-f-orange" d="M8.5 10c0-5 3.5-8 7.5-8s7.5 3 7.5 8c-2-2.6-5-3.6-7.5-3.6S10.5 7.4 8.5 10z"/><path class="a-s-ink" d="M2 39c0-8 6-13 14-13s14 5 14 13"/><path class="a-f-red" d="m16 27-2 3 2 7 2-7z"/></svg>',
    yen: '<svg viewBox="0 0 36 36"><circle class="a-f-green a-s-ink" cx="18" cy="18" r="16" stroke-width="2"/><path class="a-s-surface" d="m11 9 7 9 7-9M18 18v10M12 19h12M12 23.5h12" fill="none" stroke-width="2.4" stroke-linecap="round"/></svg>',
    leaf: '<svg viewBox="0 0 28 36"><path class="a-f-yellow a-s-ink" stroke-width="2" stroke-linejoin="round" d="M14 6 2 1v26l12 8z"/><path class="a-f-green a-s-ink" stroke-width="2" stroke-linejoin="round" d="m14 6 12-5v26l-12 8z"/></svg>',
    wheel: '<svg viewBox="0 0 40 40"><circle class="a-f-red a-s-ink" cx="20" cy="20" r="18" stroke-width="2"/><circle class="a-f-surface" cx="20" cy="20" r="12.5"/><path class="a-f-red" d="M7.6 17.5c4-1.8 8-2.6 12.4-2.6s8.4.8 12.4 2.6l.1 3.6c-3.6.4-6.4 2.6-7.6 6l-1.2 5.3h-7.4l-1.2-5.3c-1.2-3.4-4-5.6-7.6-6z"/><circle class="a-f-surface" cx="20" cy="22" r="3"/></svg>',
    chat: '<svg viewBox="0 0 48 40"><path class="a-f-surface a-s-ink" stroke-width="2" d="M19 2C9 2 2 8 2 15.5c0 4 2 7.4 5.4 9.8L6 32l7.4-3.8c1.8.5 3.7.8 5.6.8 10 0 17-6 17-13.5S29 2 19 2z"/><path class="a-f-yellow a-s-ink" stroke-width="2" d="M33 14c7.5 0 13 4.6 13 10.4 0 3-1.5 5.6-4 7.4l1 5.2-5.6-2.8c-1.4.4-2.9.6-4.4.6-7.5 0-13-4.6-13-10.4S25.5 14 33 14z"/><g class="a-f-ink"><circle cx="27.5" cy="24.5" r="1.4"/><circle cx="33" cy="24.5" r="1.4"/><circle cx="38.5" cy="24.5" r="1.4"/></g></svg>',
    check: '<svg viewBox="0 0 82 80"><rect class="a-f-surface a-s-ink" x="2" y="6" width="56" height="72" rx="6" stroke-width="2.4"/><rect class="a-f-surface a-s-ink" x="18" y="1.5" width="24" height="9" rx="3" stroke-width="2.4"/><g class="a-s-ink" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M28 27h20M28 46h20M28 65h20"/></g><g class="a-f-sky a-s-ink" stroke-width="2.2"><circle cx="15" cy="27" r="6"/><circle cx="15" cy="46" r="6"/><circle cx="15" cy="65" r="6"/></g><g class="a-s-surface" stroke-width="2" fill="none" stroke-linecap="round"><path d="m12 27 2.2 2.2 3.8-4M12 46l2.2 2.2 3.8-4M12 65l2.2 2.2 3.8-4"/></g><path class="a-f-accent a-s-ink" stroke-width="2.2" stroke-linejoin="round" d="m70 14 9 6-25 37-11 6 2-12z"/></svg>',
    faq: '<svg viewBox="0 0 62 54"><path class="a-f-surface a-s-ink" stroke-width="2.2" d="M24 3C12.4 3 4 10 4 19c0 4.6 2.2 8.8 6 11.6L8.6 39l8.6-4.4c2.1.6 4.4.9 6.8.9 11.6 0 20-7 20-16.3S35.6 3 24 3z"/><text class="a-f-accent" x="24" y="27" text-anchor="middle" font-size="18" font-weight="700" font-family="var(--kf-font-display)">Q</text><path class="a-f-yellow a-s-ink" stroke-width="2.2" d="M42 22c8.8 0 15 5.2 15 11.8 0 3.4-1.7 6.4-4.6 8.4l1 6-6.4-3.2c-1.6.5-3.3.7-5 .7-8.8 0-15-5.2-15-11.8S33.2 22 42 22z"/><g class="a-f-ink"><circle cx="35.5" cy="34" r="1.5"/><circle cx="42" cy="34" r="1.5"/><circle cx="48.5" cy="34" r="1.5"/></g></svg>',
    arrow: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 6h9M7 2.5 10.5 6 7 9.5"/></svg>',
  };
  // Mascots — in place of the original’s ”blue friend in a hat (unicycle)” and ”rabbit in yellow clothes”. Redrawn with the same size and silhouette proportions
  const buddy = '<svg viewBox="0 0 46 70" aria-hidden="true"><ellipse class="a-f-ink" cx="23" cy="64" rx="6.5" ry="5.5"/><circle class="a-f-surface" cx="23" cy="64" r="2"/><path class="a-s-ink" stroke-width="2" d="M23 52v8"/><path class="a-f-accent a-s-ink" stroke-width="2" d="M8 30c0-9 6.7-15 15-15s15 6 15 15v10c0 7-6.7 12-15 12S8 47 8 40z"/><path class="a-f-sky" d="M15 38c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5-3.6 7-8 7-8-3-8-7z"/><circle class="a-f-surface a-s-ink" cx="17.5" cy="26" r="3.6" stroke-width="1.6"/><circle class="a-f-surface a-s-ink" cx="28.5" cy="26" r="3.6" stroke-width="1.6"/><circle class="a-f-ink" cx="18.2" cy="26.4" r="1.5"/><circle class="a-f-ink" cx="27.8" cy="26.4" r="1.5"/><path class="a-f-green a-s-ink" stroke-width="2" d="M9 17c1.8-7 7.4-11 14-11s12.2 4 14 11z"/><path class="a-f-yellow a-s-ink" stroke-width="1.6" d="m20 6 3-4 3 4z"/><path class="a-f-green a-s-ink" stroke-width="2" d="M7 17h32"/><path class="a-s-ink" stroke-width="2" fill="none" stroke-linecap="round" d="M8 34 3 30M38 34l5-4"/></svg>';
  const rabbit = '<svg viewBox="0 0 56 80" aria-hidden="true"><path class="a-f-surface a-s-ink" stroke-width="2" d="M17 30c-4-10-5-26 0-27s8 14 8 25M37 28c1-11 5-25 9-23s0 18-5 27"/><path class="a-f-pink" d="M18 26c-2-7-2-17 0-18s4 9 4 17M39 25c1-7 3-15 5-14s-1 11-3 16"/><ellipse class="a-f-surface a-s-ink" cx="29" cy="40" rx="15" ry="13" stroke-width="2"/><circle class="a-f-ink" cx="23" cy="39" r="1.8"/><circle class="a-f-ink" cx="35" cy="39" r="1.8"/><path class="a-s-ink" fill="none" stroke-width="1.6" stroke-linecap="round" d="M27 44q2 2 4 0"/><path class="a-f-yellow a-s-ink" stroke-width="2" d="M17 52c2-2 6-3 12-3s10 1 12 3l3 18H14z"/><path class="a-s-ink" stroke-width="2" stroke-linecap="round" d="M15 58 8 52M43 58l7-6M22 70v8M36 70v8"/></svg>';
  A.icons = I;
  A.buddy = buddy;
  A.rabbit = rabbit;

  // Town: a row of houses·buildings·trees·clouds — the spot for the original illustration. Colors come from the five card colors and the paper color
  const town = (() => {
    const fills = ["a-f-orange", "a-f-sky", "a-f-red", "a-f-yellow", "a-f-green", "a-f-lime", "a-f-accent"];
    let x = 0, s = "", n = 0;
    while (x < 1440) {
      const k = n % 6, f = fills[(n * 3) % fills.length], g = fills[(n * 5 + 2) % fills.length];
      if (k === 0) { s += `<g transform="translate(${x} 0)"><rect class="a-f-surface a-s-ink" x="2" y="150" width="56" height="62" stroke-width="2"/><path class="${f} a-s-ink" stroke-width="2" d="M-2 152 30 120l32 32z"/><rect class="${g} a-s-ink" x="22" y="184" width="14" height="28" stroke-width="2"/><rect class="a-f-sky a-s-ink" x="9" y="162" width="11" height="11" stroke-width="1.6"/><rect class="a-f-sky a-s-ink" x="40" y="162" width="11" height="11" stroke-width="1.6"/></g>`; x += 64; }
      else if (k === 1) { s += `<g transform="translate(${x} 0)"><rect class="${f} a-s-ink" x="2" y="96" width="70" height="116" stroke-width="2"/>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect class="a-f-surface a-s-ink" x="${10 + c * 20}" y="${106 + r * 24}" width="13" height="14" stroke-width="1.4"/>`).join("")).join("")}</g>`; x += 78; }
      else if (k === 2) { s += `<g transform="translate(${x} 0)"><path class="a-s-ink" stroke-width="2" d="M14 212v-22"/><circle class="a-f-green a-s-ink" cx="14" cy="180" r="13" stroke-width="2"/></g>`; x += 30; }
      else if (k === 3) { s += `<g transform="translate(${x} 0)"><rect class="a-f-surface a-s-ink" x="2" y="132" width="88" height="80" stroke-width="2"/><rect class="${g} a-s-ink" x="2" y="122" width="88" height="12" stroke-width="2"/>${[0, 1, 2, 3].map((c) => `<rect class="a-f-sky a-s-ink" x="${10 + c * 20}" y="146" width="12" height="16" stroke-width="1.4"/><rect class="a-f-sky a-s-ink" x="${10 + c * 20}" y="174" width="12" height="16" stroke-width="1.4"/>`).join("")}</g>`; x += 96; }
      else if (k === 4) { s += `<g transform="translate(${x} 0)"><rect class="a-f-surface a-s-ink" x="2" y="160" width="48" height="52" stroke-width="2"/><path class="${f} a-s-ink" stroke-width="2" d="M-1 162 26 138l27 24z"/><rect class="a-f-sky a-s-ink" x="10" y="172" width="12" height="12" stroke-width="1.6"/><rect class="${g} a-s-ink" x="30" y="184" width="12" height="28" stroke-width="2"/></g>`; x += 56; }
      else { s += `<g transform="translate(${x} 0)"><path class="a-s-ink" stroke-width="2" d="M12 212v-16"/><path class="a-f-lime a-s-ink" stroke-width="2" d="M12 166 24 196H0z"/></g>`; x += 28; }
      n++;
    }
    const clouds = [[120, 40], [420, 70], [760, 30], [1060, 64], [1330, 36]].map(([cx, cy]) => `<path class="a-f-surface a-s-sky" stroke-width="2" d="M${cx - 34} ${cy + 12}a12 12 0 0 1 8-20 16 16 0 0 1 28-6 13 13 0 0 1 24 8 10 10 0 0 1 8 18z"/>`).join("");
    return `<svg class="a-town" viewBox="0 0 1440 214" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${clouds}${s}<path class="a-s-ink" stroke-width="2" d="M0 213h1440"/></svg>`;
  })();
  // Passing car — side view. Only the body color varies
  const sideCar = (fill) => `<svg viewBox="0 0 124 56" aria-hidden="true"><path class="${fill} a-s-ink" stroke-width="2.4" stroke-linejoin="round" d="M6 40V30c0-4 3-6 7-7l14-3 12-12c2-2 5-3 8-3h30c3 0 6 1 8 3l14 13 12 2c4 1 7 4 7 8v9z"/><path class="a-f-sky a-s-ink" stroke-width="2" d="M36 21 46 11c1-1 3-2 5-2h12v12zM68 9h13c2 0 4 1 5 2l10 10H68z"/><g class="a-f-ink"><circle cx="30" cy="42" r="10"/><circle cx="96" cy="42" r="10"/></g><g class="a-f-surface"><circle cx="30" cy="42" r="4"/><circle cx="96" cy="42" r="4"/></g></svg>`;
  const cars = (delays) => `
    <div class="a-cars js-cars" aria-hidden="true">
      <figure><div class="a-car a-car--reverse a-car--1">${sideCar("a-f-red")}</div></figure>
      <figure><div class="a-car a-car--reverse a-car--2" style="--car-delay:${delays[0]}">${sideCar("a-f-yellow")}</div></figure>
      <figure><div class="a-car a-car--reverse a-car--3" style="--car-delay:${delays[1]}">${sideCar("a-f-green")}</div></figure>
      <figure class="a-cars__low"><div class="a-car a-car--normal a-car--4">${sideCar("a-f-accent")}</div></figure>
    </div>`;
  // Front-facing red car rattling in the middle of the photo strip
  I.funcar = '<svg viewBox="0 0 130 104" aria-hidden="true"><path class="a-f-red a-s-ink" stroke-width="3" stroke-linejoin="round" d="M14 58 26 22c2-7 8-12 16-12h46c8 0 14 5 16 12l12 36c6 3 10 9 10 16v14H4V74c0-7 4-13 10-16z"/><path class="a-f-sky a-s-ink" stroke-width="2.6" stroke-linejoin="round" d="M30 52 38 26c1-4 4-6 8-6h38c4 0 7 2 8 6l8 26z"/><g class="a-f-yellow a-s-ink" stroke-width="2.4"><circle cx="24" cy="72" r="8"/><circle cx="106" cy="72" r="8"/></g><rect class="a-f-surface a-s-ink" x="46" y="74" width="38" height="10" rx="3" stroke-width="2.4"/><g class="a-f-ink"><rect x="10" y="86" width="22" height="16" rx="5"/><rect x="98" y="86" width="22" height="16" rx="5"/></g></svg>';
  A.town = town;
  A.cars = cars;
  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = I[el.dataset.icon] || ""; });
  document.querySelectorAll("[data-town]").forEach((el) => { el.innerHTML = town; });
  document.querySelectorAll("[data-cars]").forEach((el) => { el.innerHTML = cars(el.dataset.cars.split(",")); });

  const logo = (cls = "") => `<a class="a-logo ${cls}" href="index.html" aria-label="Home" data-label="School English wordmark + one-line name"><span class="a-logo__mark">logo</span><span class="a-logo__sub">Your school here<br>Name, two lines</span></a>`;

  // ── Menu panel (hero right side, phone menu, MENU tab share the same markup) ──
  const menuItems = `
    <ul>
      <li class="is-s"><a class="a-push" href="index.html" data-label="English Short Menu">TOP</a></li>
      <li class="is-s"><a class="a-push" href="#contact" aria-label="Application">${I.mail}</a></li>
      <li class="is-s"><a class="a-push" href="#contact" aria-label="Booking calendar">${I.cal}</a></li>
      <li><a class="a-push" href="service.html"><span>Feature Overview</span>${I.car}</a></li>
      <li><a class="a-push" href="about.html#staff"><span>Instructor Intro</span>${I.staff}</a></li>
      <li><a class="a-push" href="service.html#price"><span>Pricing and areas</span>${I.yen}</a></li>
      <li><a class="a-push" href="service.html"><span>New here</span>${I.leaf}</a></li>
      <li><a class="a-push" href="about.html"><span>About us</span>${I.wheel}</a></li>
      <li><a class="a-push" href="news.html"><span>Student reviews</span>${I.chat}</a></li>
      <li class="is-l"><a class="a-push" href="#contact"><div><span>Learn about training hours</span><p>Answer a few simple questions and<br>Check the estimated time!</p></div>${I.check}</a></li>
    </ul>`;
  const menu = (extra = "") => `<nav class="a-menu js-menu ${extra}" aria-label="Menu">
      <div class="a-menu__toggle js-menu-toggle"><span data-label="English Menu Label">MENU</span><figure class="a-menu__mascot">${buddy}</figure></div>
      ${menuItems}
    </nav>`;

  // ── Background Path ──
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="a-road" aria-hidden="true"><svg viewBox="0 0 1547 1540">
      <path class="a-road__band" d="M0 1540C250 1470 640 1330 860 1270c210-58 300-150 260-290-40-140-260-190-480-250-200-55-280-160-160-270C640 340 940 330 1130 260c170-62 200-150 100-260h120c140 130 120 260-40 340-200 100-470 100-600 190-90 62-30 130 120 170 230 62 470 120 560 300 100 200-40 380-320 470C750 1360 420 1470 230 1540z"/>
      <path class="a-road__dash" stroke-width="7" stroke-dasharray="44 52" d="M110 1540C370 1460 700 1350 900 1300c240-62 360-170 310-330-50-160-300-220-520-280-170-46-230-130-120-210 140-100 420-100 610-170 150-56 160-140 80-240"/>
    </svg></div>`
  );

  // ── Header ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("a-header");
    head.innerHTML = `
      <div class="a-header__inner">
        ${logo()}
        <nav class="a-hnav" aria-label="Quick menu">
          <a class="a-push a-hnav__pill a-hnav__pill--apply pc" href="#contact">${I.mail}<span>Apply</span></a>
          <a class="a-push a-hnav__pill a-hnav__pill--cal pc" href="#contact">${I.cal}<span>Booking Availability Calendar</span></a>
          <a class="a-tel" href="#contact"><span class="a-tel__num">${I.tel}<span>000-000-0000</span></span><span class="a-tel__hours"><span>Reception Hours</span><span>9:00~18:00</span></span></a>
          <a class="a-ig pc" href="#" aria-label="Social Media">${I.ig}</a>
          <button class="a-burger sp js-burger" type="button" aria-label="Open Menu"><span></span><span></span><span></span></button>
        </nav>
      </div>
      <div class="a-spnav js-spnav"><div class="a-spnav__box"><span class="a-spnav__ttl" data-label="English Menu Label">MENU</span>${menu().replace('class="a-menu__toggle js-menu-toggle"', 'class="a-menu__toggle" hidden')}</div></div>`;
  }

  // Hero menu board spot (first page only)
  const panel = document.querySelector("[data-menu-panel]");
  if (panel) panel.outerHTML = menu("pc");

  // ── Contact + footer ──
  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.id = "contact";
    contact.classList.add("a-contact");
    contact.innerHTML = `
      <div class="a-contact__head js-contact-head pc">
        <figure class="a-contact__rabbit">${rabbit}</figure>
        <h2 class="a-ttl"><span class="a-ttl__en" data-label="English section name">CONTACT US</span><span class="a-ttl__jp">Application and <br class="sp">Inquiry</span></h2>
        <figure class="a-contact__buddy">${buddy}</figure>
      </div>
      <div class="a-contact__btns pc">
        <div class="a-push a-contact__btn a-contact__btn--tel">${I.tel}<span class="a-contact__tel">000-000-0000</span><small>Reception Hours <b>9:00~18:00</b></small></div>
        <div class="a-push a-contact__btn">${I.mail}<span>As a form</span><span>Apply · Contact Us</span><a class="a-over" href="#" aria-label="Apply via form"></a></div>
        <div class="a-push a-contact__btn a-contact__btn--faq">${I.faq}<span>Frequently asked questions</span><a class="a-over" href="#" aria-label="Frequently asked questions"></a></div>
      </div>`;
  }
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("a-footer");
    foot.innerHTML = `
      ${town}
      <div class="a-footer__body">
        ${cars(["0.8s", "5s"])}
        <div class="a-footer__main">
          <div>
            <div class="a-footer__logo">${logo()}</div>
            <address>(Postal) 00000<br class="sp"> Your street address 00, Building Name, 0F<br><span class="pc">TEL 000-000-0000 (Open 9:00~20:00 / Phone orders 9:00~18:00)</span></address>
          </div>
          <div class="a-footer__spbtns sp">
            <div class="a-push">${I.tel}<span class="a-en">000-000-0000</span><a class="a-over" href="#" aria-label="Phone"></a></div>
            <div class="a-push">${I.mail}<span>Apply</span><a class="a-over" href="#contact" aria-label="Application"></a></div>
            <div class="a-push">${I.cal}<span>Booking status</span><a class="a-over" href="#contact" aria-label="Booking status"></a></div>
          </div>
          <nav class="a-footer__nav" aria-label="Sitemap">
            <ul>
              <li><a class="a-hover-text" href="service.html">Feature Overview</a></li>
              <li><a class="a-hover-text" href="about.html#staff">Instructor Intro</a></li>
              <li><a class="a-hover-text" href="service.html#price">Pricing and areas</a></li>
              <li><a class="a-hover-text" href="about.html">About us</a></li>
              <li><a class="a-hover-text" href="service.html">New here</a></li>
              <li><a class="a-hover-text" href="#contact">Learn about training hours</a></li>
              <li><a class="a-hover-text" href="news.html">Student reviews</a></li>
              <li><a class="a-hover-text" href="news.html">News</a></li>
              <li><a class="a-hover-text" href="news.html">Instructor blog</a></li>
              <li><a class="a-hover-text" href="#contact">Frequently asked questions</a></li>
              <li class="pc"><a class="a-hover-text" href="#contact">Apply</a></li>
            </ul>
            <ul class="a-footer__sub pc"><li><a class="a-hover-text" href="#">Sitemap</a></li><li><a class="a-hover-text" href="#">Privacy policy</a></li><li><a class="a-hover-text" href="#">Terms of service</a></li></ul>
          </nav>
        </div>
        <a class="a-ig a-footer__ig sp" href="#" aria-label="Social Media">${I.ig}</a>
        <ul class="a-footer__sub sp"><li><a href="#">Sitemap</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Terms of service</a></li></ul>
        <p class="a-footer__copy">©Your school name here</p>
      </div>`;
  }
  // Phone: back-to-top button at bottom right (the original is a mascot image)
  document.body.insertAdjacentHTML("beforeend", `<button class="a-topback sp js-topback" type="button" aria-label="Back to top">${buddy}</button>`);

  // ── Loading cover (first page only): fadeOut for 500ms after 800ms ──
  const loading = document.querySelector(".a-loading");
  const swing = "sine.inOut"; // Same curve as jQuery swing 0.5 − cos(πp)/2
  A.ready = new Promise((done) => {
    if (!loading) return done();
    document.body.classList.add("is-locked");
    const go = () => setTimeout(() => {
      document.body.classList.remove("is-locked");
      if (reduce) { loading.style.display = "none"; return done(); }
      gsap.to(loading, { opacity: 0, duration: 0.5, ease: swing, onComplete: () => { loading.style.display = "none"; } });
      done();
    }, 800);
    if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
  });

  // ── Phone menu: double-line button with slideToggle (400ms swing) ──
  const burger = document.querySelector(".js-burger");
  const spnav = document.querySelector(".js-spnav");
  if (burger && spnav) {
    burger.addEventListener("click", () => {
      const open = !burger.classList.contains("is-active");
      burger.classList.toggle("is-active", open);
      document.body.classList.toggle("is-locked", open);
      gsap.killTweensOf(spnav);
      if (open) {
        spnav.style.display = "block";
        if (reduce) return;
        gsap.fromTo(spnav, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }, { height: spnav.scrollHeight, paddingTop: "", paddingBottom: "", duration: 0.4, ease: swing, clearProps: "height,overflow,paddingTop,paddingBottom" });
      } else {
        if (reduce) { spnav.style.display = "none"; return; }
        gsap.to(spnav, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden", duration: 0.4, ease: swing, onComplete: () => { spnav.style.display = "none"; gsap.set(spnav, { clearProps: "height,overflow,paddingTop,paddingBottom" }); } });
      }
    });
    spnav.addEventListener("click", (e) => { if (e.target.closest("a")) burger.click(); });
  }
  const topback = document.querySelector(".js-topback");
  topback?.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  // ── Bottom-right MENU tab: clones the menu board in front of Contact, and after passing the Hero it only peeks its head out ──
  // On the first page the tab drops at the head of Contact, on subpages when it touches the footer’s white panel
  const contactHead = page === "home" ? document.querySelector(".js-contact-head") : document.querySelector(".a-footer__body");
  const tab = document.createElement("div");
  tab.innerHTML = menu("pc is-clone");
  const clone = tab.firstElementChild;
  (contact || foot)?.before(clone);
  clone.querySelector(".js-menu-toggle").addEventListener("click", () => clone.classList.toggle("is-active"));
  addEventListener("scroll", () => clone.classList.remove("is-active"), { passive: true });
  const hero = document.querySelector('[data-slot="hero"]');
  if (hero) {
    ScrollTrigger.create({ trigger: hero, start: "bottom top", onEnter: () => clone.classList.add("is-show"), onLeaveBack: () => clone.classList.remove("is-show", "is-active") });
  } else {
    clone.classList.add("is-show");
  }
  if (contactHead) {
    ScrollTrigger.create({ trigger: contactHead, start: page === "home" ? "top" : "top bottom", onEnter: () => clone.classList.remove("is-show", "is-active"), onLeaveBack: () => clone.classList.add("is-show") });
  }

  // When the web font arrives late, line heights change and the spot where tabs hide drifts — re-measure once all fonts are loaded
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener("load", () => setTimeout(() => ScrollTrigger.refresh(), 100), { once: true });

  // ── Once when visible: is-inview at 5% visible, group children at 0.2s intervals ──
  const each = (box) => {
    box.querySelectorAll("[data-inview-each]").forEach((el, i) => {
      if (reduce) return el.classList.add("is-inview");
      gsap.delayedCall(0.2 * i, () => el.classList.add("is-inview"));
    });
  };
  A.ready.then(() => {
    if (document.body.hasAttribute("data-inview-each-root")) each(document.body);
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (en.intersectionRatio < 0.05) return;
      en.target.classList.add("is-inview");
      if (en.target.hasAttribute("data-inview-group")) each(en.target);
      io.unobserve(en.target);
    }), { threshold: [0, 0.05, 0.1, 1] });
    document.querySelectorAll("[data-inview], [data-inview-group]").forEach((el) => io.observe(el));
  });

  // ── Photo parallax: inner image ±20px, scrub 3 ──
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((box) => {
      const img = box.querySelector("[data-parallax-img]") || box.firstElementChild;
      if (!img) return;
      gsap.to(img, { y: box.dataset.parallax === "reverse" ? 20 : -20, scrollTrigger: { trigger: box, start: "top bottom", scrub: 3 } });
    });
  });

  // # links within the same page scroll in 500ms to 30px above the target (original jQuery animate)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const to = document.querySelector(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    const y = to.getBoundingClientRect().top + scrollY - 30;
    if (reduce) return scrollTo(0, y);
    const o = { y: scrollY };
    gsap.to(o, { y, duration: 0.5, ease: swing, onUpdate: () => scrollTo(0, o.y) });
  });
})();
