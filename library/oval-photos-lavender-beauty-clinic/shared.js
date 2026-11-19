// Common to all pages: draws the header, right booking strip, phone bottom nav, menu cover, three columns above the footer, booking strip, clinic calendar, footer and map in one place,
// Blur entrance (once at top 65%) · pill header (scroll > Header height, 1081px and up) · applies the phone booking bar collapse.
// The original is a normal CMS page navigation so there’s no transition effect, and only the blur entrance (2s) replays on the new page.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const PC = (window.PC = { reduced });
  const cur = (p) => (p === page ? " is-current" : "");

  const I = {
    star: '<svg class="pc-star" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 0c.9 8.6 6.9 14.6 16 16-9.1 1.4-15.1 7.4-16 16-.9-8.6-6.9-14.6-16-16C9.1 14.6 15.1 8.6 16 0z"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>',
    tel: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/></svg>',
    line: '<svg class="pc-ic-line" viewBox="0 0 40 40"><circle cx="20" cy="18" r="17"/><path class="b" d="M14 33l3-5h-3z"/><text x="20" y="21.5" text-anchor="middle" font-size="9" font-weight="700">LINE</text></svg>',
    web: '<svg class="pc-ic-stroke" viewBox="0 0 40 40" fill="none" stroke-width="1.2"><path d="M8 17l5-6h14l5 6-12 14z"/><path d="M8 17h24M15 11l5 20 5-20M13 11l2 6 5-6 5 6 2-6"/><path d="M20 2v4M12 4l2 3M28 4l-2 3M5 8l3 2M35 8l-3 2" stroke-dasharray="1 2"/></svg>',
    cal: '<svg class="pc-ic-stroke" viewBox="0 0 40 40" fill="none" stroke-width="1.2"><rect x="4" y="8" width="32" height="27" rx="1"/><path d="M4 15h32M12 5v6M28 5v6"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17 5.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM21.9 7.8c-.1-1.6-.4-3-1.6-4.1S17.8 2.2 16.2 2.1C14.6 2 9.4 2 7.8 2.1 6.2 2.2 4.8 2.5 3.7 3.7S2.2 6.2 2.1 7.8C2 9.4 2 14.6 2.1 16.2c.1 1.6.4 3 1.6 4.1s2.5 1.5 4.1 1.6c1.6.1 6.8.1 8.4 0 1.6-.1 3-.4 4.1-1.6s1.5-2.5 1.6-4.1c.1-1.6.1-6.8 0-8.4zm-2.1 10.2a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.4.4-5.9.4s-4.6.1-5.9-.4A3.3 3.3 0 0 1 4.2 18c-.5-1.3-.4-4.4-.4-5.9s-.1-4.6.4-5.9A3.3 3.3 0 0 1 6.1 4.2C7.4 3.7 10.5 3.8 12 3.8s4.6-.1 5.9.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.4.4 5.9s.1 4.6-.4 5.9z"/></svg>',
    yt: '<svg viewBox="0 0 24 24"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15V9l5.8 3z"/></svg>',
    tt: '<svg viewBox="0 0 24 24"><path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.7a2.9 2.9 0 1 1-2-2.7V9.5a6.3 6.3 0 1 0 5.4 6.2V8.8a8.2 8.2 0 0 0 4.8 1.5V6.9z"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24"><path d="M3 12h16M14 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  };
  PC.icons = I;

  const logo = (cls = "") => `<a class="pc-logo ${cls}" href="index.html" aria-label="Home">CLINIC LOGO</a>`;
  const navItems = `
    <li class="pc-nav__item"><a class="pc-nav__link has-sub" href="#" tabindex="0">For first-time visitors</a>
      <div class="pc-sub"><a href="index.html#message">Clinic About</a><a href="index.html#reason">About the clinic</a><a href="index.html#reason">For first-time visitors</a><a href="detail.html#faq">Frequently asked questions</a><a href="#access">Directions</a></div></li>
    <li class="pc-nav__item"><a class="pc-nav__link" href="index.html#doctor">Doctor Profile</a></li>
    <li class="pc-nav__item"><a class="pc-nav__link${cur("service")}${cur("detail")}" href="service.html">Treatment Menu</a></li>
    <li class="pc-nav__item"><a class="pc-nav__link" href="detail.html#price">Pricing Info</a></li>
    <li class="pc-nav__item"><a class="pc-nav__link${cur("news")}" href="news.html">Beauty Column</a></li>
    <li class="pc-nav__item"><a class="pc-nav__link${cur("works")}" href="works.html">Treatment Photo</a></li>`;
  const search = `<form class="pc-search" role="search" onsubmit="return false"><input type="search" placeholder="search..." aria-label="Search">${I.search}</form>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("pc-head");
    head.innerHTML = `
      <div class="pc-head__in">
        ${logo()}
        <nav class="pc-nav" aria-label="Main menu">
          <ul class="pc-nav__list">${navItems}</ul>
          ${search}
          <a class="pc-tel font-en" href="#contact"><span class="tel">tel.<span class="num">000-000-0000</span></span><span class="hours" style="font-family:var(--kf-font-sans)">Reception hours 9:00~18:00</span></a>
        </nav>
        <div class="pc-head__sp">${search}<a class="pc-head__tel" href="#contact" aria-label="Phone">${I.tel}</a></div>
      </div>`;
    head.insertAdjacentHTML("afterend", `
      <aside class="pc-side" data-slot="side-reserve" aria-label="Reservation">
        <ul>
          <li><a class="is-line" href="#contact"><span class="icon">${I.line}</span><span>LINE<br>Reservation</span></a></li>
          <li><a href="#contact"><span class="icon">${I.web}</span><span>WEB<br>Reservation</span></a></li>
          <li><a href="#calendar"><span class="icon">${I.cal}</span><span>Appointment day</span></a></li>
          <li><a class="sns is-ig" href="#" aria-label="Social Media">${I.ig}</a></li>
          <li><a class="sns is-yt" href="#" aria-label="Video">${I.yt}</a></li>
          <li><a class="sns is-tt" href="#" aria-label="Tick-tock">${I.tt}</a></li>
        </ul>
      </aside>
      <div class="pc-menu" data-slot="mobile-menu" aria-hidden="true">
        <span class="pc-menu__bglabel">Background photo · purple-tone blurred photo slot inside circle</span>
        <ul class="pc-menu__list">
          <li><a href="index.html">Home</a></li><li><a href="index.html#message">For first-time visitors</a></li>
          <li><a href="index.html#doctor">Doctor Profile</a></li><li><a href="service.html">Treatment Menu</a></li>
          <li><a href="detail.html#price">Pricing Info</a></li><li><a href="news.html">Beauty Column</a></li>
          <li><a href="works.html">Treatment Photo</a></li><li><a href="campaign.html">Pickup</a></li>
          <li><a href="recruit.html">Hiring Info</a></li><li><a href="#access">Directions</a></li>
        </ul>
        <a class="pc-menu__tel font-en" href="#contact">tel.<span class="num">000-000-0000</span><br><small style="font-family:var(--kf-font-sans)">Reception hours 9:00~18:00</small></a>
        <a class="pc-btn is-wh" href="#contact">WEB booking</a>
      </div>
      <div class="pc-spbar" data-slot="sp-bottom">
        <div class="pc-cta is-open">
          <button class="pc-cta__toggle" type="button" aria-label="Collapse booking bar"></button>
          <div class="pc-cta__wrap">
            <p class="pc-cta__note">Your one-line promo copy goes here.</p>
            <div class="pc-cta__btns"><a class="is-line" href="#contact">LINE Booking</a><a class="is-web" href="#contact">WEB booking</a></div>
          </div>
        </div>
        <nav class="pc-bnav" aria-label="Phone bottom menu">
          <a class="${cur("home")}" href="index.html"><svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/></svg>Home</a>
          <a class="${cur("service")}" href="service.html"><svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>Procedure<br>Menu</a>
          <a class="${cur("works")}" href="works.html"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="9" cy="11" r="2"/><path d="m3 17 5-4 4 3 3-2 6 4"/></svg>Treatment Photo</a>
          <a href="index.html#doctor"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-6.5 8-6.5s7 2 8 6.5"/></svg>Doctor<br>About</a>
          <button type="button" class="pc-bnav__menu" aria-label="Open Menu"><svg class="pc-burger-ic" viewBox="0 0 32 32" style="fill:var(--kf-ink);stroke:none"><path d="M16 4c.6 5.4 4.3 9.1 10 10-5.7.9-9.4 4.6-10 10-.6-5.4-4.3-9.1-10-10 5.7-.9 9.4-4.6 10-10z"/></svg><svg class="pc-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg><span>MENU</span></button>
        </nav>
      </div>`);
  }

  // Subpage head: title between two stars + breadcrumb (data-title · data-parent="Name|Address")
  document.querySelectorAll('[data-slot="page-head"][data-title]').forEach((h) => {
    const st = I.star.replace('class="pc-star"', 'class="pc-star" aria-hidden="true"');
    const par = h.dataset.parent ? h.dataset.parent.split("|") : null;
    h.classList.add("pc-pagettl");
    h.innerHTML = `<h1>${st}${h.dataset.title}${st}</h1>
      <p class="pc-crumbs"><span><a href="index.html">Home</a></span>${par ? `<span><a href="${par[1]}">${par[0]}</a></span>` : ""}<span>${h.dataset.crumb || h.dataset.title}</span></p>`;
  });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const days = ["Second line, three", "Third line, fourth"];
    foot.insertAdjacentHTML("beforebegin", `
      <div data-slot="foot-related"><ul class="pc-related">
        <li><a href="service.html"><span class="wf-img" data-label="Treatment room · white bed and lighting · soft backlight · vertical"></span><p class="font-en">Menu</p><p class="ttl">Treatment Menu</p></a></li>
        <li><a href="detail.html#price"><span class="wf-img" data-label="Waiting room sofa · light purple wall · daytime natural light"></span><p class="font-en">Price</p><p class="ttl">Pricing Info</p></a></li>
        <li><a href="campaign.html"><span class="wf-img" data-label="Signboard glass · engraved logo · dim indoor light"></span><p class="font-en">Pickup</p><p class="ttl">Pickup info</p></a></li>
      </ul></div>
      <section class="pc-fcta pc-pdg" id="contact" data-slot="foot-cta">
        <span class="wf-note">Reservation band · fixed background photo (background-attachment fixed) · link hover: white 20% fill + icon .4s + underline 0→100%</span>
        <div class="pc-fcta__bg"><div class="wf-img" data-label="Clinic entrance · logo on a glass sign · cool blue-gray interior · wide landscape · fixed background"></div></div>
        <div class="pc-inner pc-fcta__head">
          <h2 class="pc-ttl is-ctr"><span class="font-en">Contact</span>Booking · Contact</h2>
          <p>Your two-line reservation notice here.<br>Your extra line here on same-day booking availability.</p>
          <a class="tel font-en" href="#">tel.<span class="num">000-000-0000</span></a>
        </div>
        <ul class="pc-fcta__links">
          <li><a href="#"><svg class="icon" viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3 0 .7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.4 5.8-3.4 7.9-5.9C21.3 14.4 22 12.8 22 11c0-4.4-4.5-8-10-8z"/></svg><p class="font-en">LINE Contact</p><p class="ttl"><span>Book via LINE here</span></p></a></li>
          <li><a href="#"><svg class="icon" viewBox="0 0 24 24"><path d="M3 8l4-5h10l4 5-9 13z"/></svg><p class="font-en">WEB Contact</p><p class="ttl"><span>Book online here</span></p></a></li>
        </ul>
      </section>
      <section class="pc-cal pc-pdg" id="calendar" data-slot="calendar">
        <div class="pc-inner">
          <div class="pc-cal__top">
            <div>
              <h2 class="pc-ttl pc-cal__ttl"><span class="font-en">Information</span>Appointment Calendar</h2>
              <a class="pc-cal__tel font-en" href="#">${I.tel.replace("<svg", '<svg aria-hidden="true"')}000-000-0000</a>
            </div>
            <div class="pc-cal__info" id="access">
              <p class="addr">〒000-0000 <i>Map</i><br>Your address goes here in one line · Building name, floor 0</p>
              <table>
                <tr><th><span>Consultation Hours</span></th><td class="font-en" style="font-size:1.5rem">9:00~18:00</td></tr>
                <tr><th><span>Medical Departments</span></th><td>Your subject two here</td></tr>
                <tr><th><span>Clinic closed day</span></th><td>Irregular · check the calendar</td></tr>
              </table>
            </div>
          </div>
          <div class="pc-cal__box">
            <div class="pc-cal__nav"><button type="button" data-cal="-1" aria-label="Previous month">‹</button><span class="font-en" data-cal-label></span><button type="button" data-cal="1" aria-label="Next month">›</button></div>
            <div class="pc-cal__grid" data-cal-grid></div>
          </div>
        </div>
      </section>`);
    foot.classList.add("pc-foot");
    const surg = [["Eye", "Menu 1 · Menu 2 · Menu 3 · Menu 4"], ["Dark circles", "Menu 1 · Menu 2 · Menu 3"], ["Lift", "Menu 1 · Menu 2"], ["Nose", "Menu 1 · Menu 2 · Menu 3"], ["Body type", "Menu 1 · Menu 2 · Menu 3 · Menu 4"], ["Chest", "Menu 1"]];
    const derm = [["Injection", "Menu 1 · Menu 2 · Menu 3 · Menu 4 · Menu 5 · Menu 6 · Menu 7 · Menu 8"], ["Melasma·blemishes", "Menu 1 · Menu 2 · Menu 3 · Menu 4 · Menu 5 · Menu 6"], ["Pores and acne", "Menu 1 · Menu 2 · Menu 3 · Menu 4"], ["Sagging · Wrinkles", "Menu 1 · Menu 2 · Menu 3 · Menu 4 · Menu 5 · Menu 6 · Menu 7"], ["Hair removal", "Menu 1"], ["Tattoo · Makeup", "Menu 1 · Menu 2"], ["Underwear · skincare", "Menu 1 · Menu 2"], ["Others", "Menu 1 · Menu 2 · Menu 3"]];
    const rows = (a) => a.map(([k, v]) => `<tr><th>${k}</th><td>${v.split(" · ").map((x) => `<span><a href="detail.html">${x}</a></span>`).join("")}</td></tr>`).join("");
    foot.innerHTML = `
      <div class="pc-inner">
        <div class="pc-foot__top">${logo()}<div class="pc-foot__sns"><a href="#" aria-label="Social Media">${I.ig}</a><a href="#" aria-label="Video">${I.yt}</a><a href="#" aria-label="Tick-tock">${I.tt}</a></div></div>
        <div class="pc-foot__menu">
          <div><h3 class="pc-foot__mttl">Plastic Surgery</h3><table class="pc-foot__table">${rows(surg)}</table></div>
          <div><h3 class="pc-foot__mttl">Dermatology</h3><table class="pc-foot__table">${rows(derm)}</table></div>
          <div><h3 class="pc-foot__mttl font-en">Pickup</h3><div class="pc-foot__pick">
            <a href="campaign.html"><b>Your one-line event title here</b>Your event period and audience in one line<br><small>Learn more ›</small></a>
            <a href="campaign.html#pickup-02"><b>Your second event title here</b>Your one-line description here<br><small>Learn more ›</small></a>
          </div></div>
        </div>
        <div class="pc-foot__bottom">
          <div>〒000-0000 Your address on one line here<br>Hours 9:00~18:00 · Closed irregularly<br>Departments: Plastic Surgery · Dermatology</div>
          <nav class="pc-foot__nav" aria-label="Footer Menu">
            <a href="index.html#doctor">Doctor Profile</a><a href="service.html">Treatment Menu</a><a href="detail.html#price">Pricing Info</a><a href="news.html">Beauty Column</a>
            <a href="works.html">Treatment Photo</a><a href="campaign.html">Pickup</a><a href="recruit.html">Hiring Info</a><a href="#access">Directions</a><a href="#">Privacy policy</a>
          </nav>
        </div>
        <p class="pc-foot__copy font-en">© CLINIC LOGO</p>
      </div>`;
    foot.insertAdjacentHTML("afterend", `<div class="pc-map" data-slot="map"><div class="wf-img" data-label="Map embed · black-and-white street map · clinic pin in the center · full width"></div></div>`);
  }

  // Clinic calendar — closed Thu and Sun, today’s cell highlighted (looks like the original calendar widget)
  const grid = document.querySelector("[data-cal-grid]");
  if (grid) {
    const now = new Date();
    let y = now.getFullYear(), m = now.getMonth();
    const draw = () => {
      document.querySelector("[data-cal-label]").textContent = `${y} / ${m + 1}Month`;
      const first = new Date(y, m, 1).getDay(), last = new Date(y, m + 1, 0).getDate();
      let h = ["Day", "Month", "Fire", "Number", "Neck", "Gold", "Earth"].map((d) => `<div class="dow">${d}</div>`).join("");
      for (let i = 0; i < first; i++) h += '<div class="is-blank"></div>';
      for (let d = 1; d <= last; d++) {
        const w = (first + d - 1) % 7;
        const off = w === 4 || (w === 0 && d % 2);
        const today = y === now.getFullYear() && m === now.getMonth() && d === now.getDate();
        h += `<div class="d${off ? " is-off" : ""}${today ? " is-today" : ""}">${d}${off ? "<em>Clinic closed</em>" : d % 9 === 3 ? "<em>Your one-line note here</em>" : ""}</div>`;
      }
      const rest = (7 - ((first + last) % 7)) % 7;
      for (let i = 0; i < rest; i++) h += '<div class="is-blank"></div>';
      grid.innerHTML = h;
      // Like the original Simple Calendar, hovering an event shows a qTip bubble centered below the cell, and releasing closes it after .1s
      const $ = window.jQuery;
      if ($ && $.fn.qtip) $(grid).find(".d em").each(function () {
        const day = this.parentElement.firstChild.textContent;
        $(this).qtip({
          content: `<div class="pc-cal__tip"><b>${this.textContent}</b><span class="font-en">${y}.${m + 1}.${day}</span><span>Your one-line schedule description here</span></div>`,
          position: { my: "top center", at: "bottom center", target: $(this), viewport: true, adjust: { method: "shift", scroll: false } },
          style: { def: false, classes: "pc-cal-bubble" },
          show: { solo: true, effect: false, event: "mouseenter" },
          hide: { fixed: true, effect: false, event: "mouseleave", delay: 100 },
          overwrite: false,
        });
      });
    };
    draw();
    document.querySelectorAll("[data-cal]").forEach((b) => b.addEventListener("click", () => {
      m += +b.dataset.cal;
      if (m < 0) { m = 11; y--; } else if (m > 11) { m = 0; y++; }
      draw();
    }));
  }

  // Phone menu overlay · collapse booking bar
  const menu = document.querySelector(".pc-menu");
  const mbtn = document.querySelector(".pc-bnav__menu");
  mbtn?.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    mbtn.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
  });
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { menu.classList.remove("is-open"); mbtn.classList.remove("is-open"); }));
  document.querySelector(".pc-cta__toggle")?.addEventListener("click", (e) => e.currentTarget.parentElement.classList.toggle("is-open"));

  // Worry icons — original is face/body-part line drawings. Redrawn anew with same-weight lines
  const face = '<path d="M20 12c0-6 5-10 12-10s12 4 12 10v10c0 10-6 18-12 18s-12-8-12-18z"/>';
  const ic = {
    lift: face + '<path d="M16 30l-4-6M48 30l4-6M14 22l-2-2M50 22l2-2"/>',
    eye: '<path d="M6 32c8-10 18-14 26-14s18 4 26 14c-8 10-18 14-26 14S14 42 6 32z"/><circle cx="32" cy="32" r="7"/><path d="M14 20l-2-4M24 16l-1-4M40 16l1-4M50 20l2-4"/>',
    body: '<path d="M22 4c-2 10 4 18 2 28s-6 16-2 28M42 4c2 10-4 18-2 28s6 16 2 28"/>',
    nose: '<path d="M30 6c2 14 8 26 10 34 1 5-3 8-8 8-3 0-5-2-8-2"/><path d="M26 46c-2 0-4-2-3-4"/>',
    syringe: '<path d="M44 6l14 14M48 10l-30 30-6 2 2-6 30-30M40 18l6 6M34 24l6 6M28 30l6 6M12 52l6-6"/>',
    chest: '<path d="M8 22c0 12 8 20 16 20 6 0 8-4 8-8 0 4 2 8 8 8 8 0 16-8 16-20"/><path d="M16 12c2 4 2 8 0 10M48 12c-2 4-2 8 0 10"/>',
    spot: face + '<circle cx="26" cy="24" r="1.2"/><circle cx="38" cy="26" r="1.6"/><circle cx="29" cy="30" r="1"/>',
    glow: face + '<path d="M24 26c2 2 4 2 6 0M34 26c2 2 4 2 6 0M54 8l2-4M58 14l4-1M56 20l3 2"/>',
    pore: '<path d="M20 10c4 10 6 20 6 30M44 10c-4 10-6 20-6 30"/><path d="M26 40c2 6 10 6 12 0"/><circle cx="32" cy="22" r="2"/>',
    acne: '<path d="M32 6v10M22 12l4 6M42 12l-4 6"/><path d="M14 42c6-10 12-14 18-14s12 4 18 14"/><circle cx="32" cy="38" r="5"/>',
    wrinkle: face + '<path d="M24 14h16M25 18h14M27 34c3 2 7 2 10 0"/>',
    sag: face + '<path d="M22 32c2 6 4 8 6 9M42 32c-2 6-4 8-6 9"/>',
    hair: '<path d="M32 8c-8 0-14 6-14 16 0 8 4 14 4 22h20c0-8 4-14 4-22 0-10-6-16-14-16z"/><path d="M26 18l-2-4M32 16v-4M38 18l2-4"/>',
    make: face + '<path d="M23 21c3-2 6-2 8 0M33 21c2-2 5-2 8 0M28 34h8"/>',
    bottle: '<rect x="20" y="18" width="24" height="38" rx="3"/><path d="M26 18v-6h12v6M24 30h16M24 36h10"/>',
    other: face + '<circle cx="27" cy="22" r="1"/><circle cx="37" cy="22" r="1"/><path d="M28 30c2 2 6 2 8 0"/>',
  };
  const parts = [["Face lift", "lift"], ["Eye area", "eye"], ["Body line", "body"], ["Nose", "nose"], ["Fat injection", "syringe"], ["Chest", "chest"], ["Melasma·blemishes", "spot"], ["Elasticity·Glow", "glow"], ["Pores and acne", "pore"], ["Acne scars", "acne"], ["Wrinkle", "wrinkle"], ["Sagging · Sinking", "sag"], ["Hair removal", "hair"], ["Semi-permanent & tattoo", "make"], ["Underwear · skincare", "bottle"], ["Others", "other"]];
  const list = document.querySelector("[data-parts]");
  if (list) {
    list.innerHTML = parts.map(([name, k], i) => `
      <li style="--c:${i % 5};--cs:${i % 4}">
        <button class="hm-parts__info" type="button" aria-expanded="false"><i class="hm-parts__icon"><svg viewBox="0 0 64 64" aria-hidden="true">${ic[k]}</svg></i><span class="hm-parts__name">${name}</span></button>
        <div class="hm-parts__menu"><ul>${Array.from({ length: 4 + (i % 4) }, (_, j) => `<li><a href="detail.html">Your treatment name $ here{j + 1}</a></li>`).join("")}</ul></div>
      </li>`).join("");
    // Original: opens only the pressed cell and closes its siblings, pressing the same cell again closes it
    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".hm-parts__info");
      if (!btn) return;
      const li = btn.parentElement;
      const open = !li.classList.contains("is-active");
      list.querySelectorAll(":scope > li").forEach((x) => { x.classList.remove("is-active"); x.firstElementChild.setAttribute("aria-expanded", "false"); });
      if (open) { li.classList.add("is-active"); btn.setAttribute("aria-expanded", "true"); }
      ScrollTrigger.refresh();
    });
  }

  // Common to subpages: FAQ accordion · tabs
  document.querySelectorAll(".pc-faq__q").forEach((q) => q.addEventListener("click", () => {
    const open = q.parentElement.classList.toggle("is-open");
    q.setAttribute("aria-expanded", String(open));
  }));
  document.querySelectorAll("[data-tabs]").forEach((box) => {
    const tabs = box.querySelectorAll("[data-tab]"), panes = box.querySelectorAll("[data-pane]");
    tabs.forEach((t, i) => t.addEventListener("click", () => {
      tabs.forEach((x, j) => x.classList.toggle("is-active", i === j));
      panes.forEach((x, j) => x.classList.toggle("is-active", i === j));
    }));
  });

  // Pill header — original only at 1081px and up, once scrolling passes the header height (100px)
  const hd = document.querySelector(".pc-head");
  const onScroll = () => hd && hd.classList.toggle("is-sm", innerWidth > 1080 && scrollY > 100);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Same-page links (#…) go via jQuery animate 400ms swing as in the original — scrolling that much less by scroll-padding-top · scroll-margin-top.
  // A bare ”#” alone is a placeholder link to another page in the copy, so leave it untouched
  const jq = window.jQuery;
  if (jq) jq(document).on("click", 'a[href^="#"]:not([href="#"])', function () {
    const target = jq(jq(this).attr("href"));
    if (!target.length) return;
    const spt = parseInt(jq("html").css("scrollPaddingTop")) || 0, smt = parseInt(target.css("scrollMarginTop")) || 0;
    jq("html, body").animate({ scrollTop: target.offset().top - (spt + smt) }, reduced ? 0 : 400, "swing");
    return false;
  });

  // Blur entrance: on-screen ones at load, the rest once at top 65%
  const show = (el) => el.classList.add("active");
  if (reduced) {
    document.querySelectorAll(".pc-in").forEach(show);
  } else {
    addEventListener("load", () => document.querySelectorAll(".pc-in[data-load]").forEach(show));
    gsap.utils.toArray(".pc-in:not([data-load])").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 65%", once: true, onEnter: () => show(el) });
    });
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
