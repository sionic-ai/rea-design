// Shared by all pages: mount the logo, header row, full-screen menu, booking search strip and footer card as one set, and hook up the menu, SNS expand and video modal (modal-video).
// Must finish before fx-core scans at DOMContentLoaded so the data-fx of the inserted element is picked up — so it runs right at the end of body
(() => {
  // Bamboo-node chart in a circle — our drawing of the same spot and size instead of the original logo
  const MARK = '<svg viewBox="0 0 36 36" aria-hidden="true"><circle class="is-mark" cx="18" cy="18" r="17"/><path d="M15 7v22M21 9v18M15 13h6M15 21h6M21 14c4-3 6-3 8-2M15 17c-4-2-6-1-8 1" class="is-cut"/></svg>';
  const logo = (tag = "a") => `<${tag} class="kg-logo"${tag === "a" ? ' href="index.html"' : ""} aria-label="Your lodging name here">${MARK}<span><b>Your Lodging Here</b><small>BRAND NAME</small></span></${tag}>`;
  const ARR = '<svg viewBox="0 0 10 10"><path d="M3 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';
  const CAL = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor"><rect x="2" y="3.5" width="14" height="12.5" rx="1"/><path d="M2 7h14M6 1.5v4M12 1.5v4"/></svg>';

  document.querySelectorAll("[data-logo]").forEach((el) => (el.outerHTML = logo()));

  const head = document.querySelector("[data-head]");
  if (head) head.innerHTML = `
    <button class="kg-menu-btn" type="button" data-menu-toggle aria-label="Menu"><svg class="is-bars" viewBox="0 0 18 18"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" stroke-width="1.4"/></svg><svg class="is-x" viewBox="0 0 18 18"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="1.4"/></svg></button>
    <nav class="kg-head__nav">
      <a href="#"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor"><circle cx="7" cy="7" r="6"/><path d="M1 7h12M7 1c2 2 2 10 0 12M7 1c-2 2-2 10 0 12"/></svg>EN</a>
      <button type="button" data-movie><svg viewBox="0 0 14 14" fill="none" stroke="currentColor"><circle cx="7" cy="7" r="6"/><path d="M5.5 4.5l4 2.5-4 2.5z" fill="currentColor"/></svg>Play Movie</button>
      <div><button type="button" data-sns><svg viewBox="0 0 14 14" fill="none" stroke="currentColor"><path d="M2 11l1-3a5 5 0 1 1 2 2z"/></svg>SNS ›</button>
        <div class="kg-head__sns"><a href="#">Instagram</a><a href="#">Facebook</a><a href="#">LINE</a><a href="#">YouTube</a></div></div>
    </nav>
    ${logo()}`;

  const rsv = document.querySelector("[data-rsv]");
  if (rsv) rsv.innerHTML = `${CAL}<span>Book this way</span>`;

  const NAV = [
    ["About", [["index.html", "Saw"], ["index.html#omotenashi", "Hospitality"], ["index.html#spa", "Hot spring"], ["index.html#room", "Guest room"], ["index.html#cuisine", "Cooking"]]],
    ["Guide", [["lookbook.html", "Photo Gallery"], ["news.html", "News"], ["#", "Directions"], ["#", "Frequently asked questions"]]],
    ["Links", [["#", "Stay Plans"], ["#", "Flight bundle plan"], ["#", "Privacy policy"]]],
  ];
  const menu = document.querySelector("[data-menu]");
  if (menu) {
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-label", "Menu");
    menu.innerHTML = logo() + `<div class="kg-menu__in">${NAV.map(([h, list]) => `<div><h4>${h}</h4><ul>${list.map(([u, t]) => `<li><a href="${u}">${t}<i>${ARR}</i></a></li>`).join("")}</ul></div>`).join("")}</div>`;
    const toggle = (on) => {
      menu.classList.toggle("is-open", on);
      document.body.classList.toggle("is-menu", on);
      document.body.classList.toggle("is-locked", on);
    };
    document.querySelectorAll("[data-menu-toggle]").forEach((b) => b.addEventListener("click", () => toggle(!menu.classList.contains("is-open"))));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) toggle(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });
  }
  document.querySelectorAll("[data-sns]").forEach((b) => b.addEventListener("click", () => b.nextElementSibling.classList.toggle("is-open")));

  const foot = document.querySelector("[data-foot]");
  if (foot) foot.innerHTML = `
    <section class="kg-frsv" data-slot="reserve-search">
      <div class="kg-ph is-wood" data-label="Teapot and teacup · warm light beyond a wooden lattice · full-width landscape"></div>
      <div class="kg-frsv__in">
        <h3><b>Stay Booking</b><small>Reservation</small></h3>
        <div class="kg-search">
          <div class="kg-search__tabs"><button type="button" class="is-on">Lodging</button><button type="button">Flight + Hotel</button></div>
          <div class="kg-search__row">
            <label class="kg-search__f is-date">Check-in<span>${CAL}2026/00/00</span></label>
            <label class="kg-search__f">Beat count<span>1 ▾</span></label>
            <label class="kg-search__f">Guests / 1 room<span>2 ▾</span></label>
            <label class="kg-search__f">Number of rooms<span>1 ▾</span></label>
            <a class="kg-search__go" href="#">Vacancy search <i>${ARR}</i></a>
          </div>
          <div class="kg-search__links"><a href="#">Stay plan list</a><a href="#">Sign up · Log in</a><a href="#">Sister venue booking</a><a href="#">Booking check · Cancel</a></div>
        </div>
      </div>
    </section>
    <div class="kg-foot" data-slot="footer">
      <div class="kg-foot__card">
        ${logo()}
        <div class="kg-foot__cols">
          <div><h4>Info</h4><p>Zip 000-0000 Spa Town 0-0<br><a href="#">[Google Maps]</a></p><p class="kg-foot__tel"><small>TEL.</small> 00-0000-0000 <small>(Representative)</small><br><small>TEL.</small> 00-0000-0000 <small>(Booking 9:00~18:00)</small></p><div class="kg-foot__sns"><a href="#" aria-label="Instagram"></a><a href="#" aria-label="Facebook"></a><a href="#" aria-label="LINE"></a><a href="#" aria-label="Brand"></a><a href="#" aria-label="YouTube"></a></div></div>
          <div><h4>Contents</h4><div class="kg-foot__links">${NAV[0][1].concat(NAV[1][1]).map(([u, t]) => `<a href="${u}">${t}</a>`).join("")}</div></div>
          <div><h4>Links</h4><div>${NAV[2][1].map(([u, t]) => `<a href="${u}">${t}</a>`).join("<br>")}</div></div>
        </div>
      </div>
      <p class="kg-foot__copy">© BRAND All Rights Reserved.</p>
    </div>`;

  // Opens with modal-video like the original — an empty placeholder address instead of the original video
  document.querySelectorAll("[data-movie]").forEach((b) => { b.setAttribute("data-channel", "custom"); b.setAttribute("data-video-url", "about:blank"); });
  if (window.ModalVideo) new ModalVideo("[data-movie]", { channel: "custom", animationSpeed: 300 });
})();
