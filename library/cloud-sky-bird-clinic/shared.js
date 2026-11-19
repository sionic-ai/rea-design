// Header row, drawer, fixed nav, English notice window, footer and artwork (tree, kingfisher, leaf branch, line icons) are identical across the five pages, so they’re drawn once here.
(() => {
  const page = document.body.dataset.page || "index";
  const isHome = page === "index";
  const S = (id, vb, body) => `<symbol id="cm-${id}" viewBox="${vb}">${body}</symbol>`;
  const line = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    ${S("tree", "0 0 120 100", `
      <path style="fill:var(--site-trunk)" d="M57 98c2-14 2-26-1-38-6 2-14 1-21-4 8 1 15 0 20-4-3-6-9-10-16-12 8-1 15 2 19 7 1-7-1-14-5-20 6 4 9 11 9 19 4-6 10-10 17-11-6 4-10 10-11 16 6-2 13-1 18 3-7 0-13 2-17 6 1 12 1 25-1 38z"/>
      <g style="fill:var(--site-leaf)"><ellipse cx="22" cy="40" rx="5" ry="10" transform="rotate(-40 22 40)"/><ellipse cx="34" cy="22" rx="5" ry="10" transform="rotate(-20 34 22)"/><ellipse cx="52" cy="10" rx="5" ry="10" transform="rotate(5 52 10)"/><ellipse cx="72" cy="12" rx="5" ry="10" transform="rotate(25 72 12)"/><ellipse cx="90" cy="26" rx="5" ry="10" transform="rotate(45 90 26)"/><ellipse cx="98" cy="46" rx="5" ry="10" transform="rotate(70 98 46)"/></g>
      <g style="fill:var(--site-leaf-soft)"><ellipse cx="42" cy="36" rx="4" ry="8" transform="rotate(-30 42 36)"/><ellipse cx="62" cy="28" rx="4" ry="8"/><ellipse cx="80" cy="38" rx="4" ry="8" transform="rotate(35 80 38)"/><ellipse cx="14" cy="58" rx="4" ry="8" transform="rotate(-70 14 58)"/></g>`)}
    ${S("bird", "0 0 138 125", `
      <path style="fill:var(--site-bird-back)" d="M30 70c8-22 28-36 52-38 14-1 24 6 28 16-10 4-18 12-24 22-12 18-34 28-56 24 2-8 0-16 0-24z"/>
      <path style="fill:var(--site-bird-wing)" d="M40 66c14-14 32-20 50-18-8 10-22 22-40 28-6 2-12 0-10-10z"/>
      <path style="fill:var(--site-orange)" d="M62 88c14-2 26-10 32-22 4 10 2 22-8 30-10 8-22 8-34 4 4-4 7-8 10-12z"/>
      <circle cx="96" cy="44" r="12" style="fill:var(--site-bird-back)"/>
      <path style="fill:var(--kf-ink)" d="M106 42l30-6-28 12z"/>
      <circle cx="99" cy="41" r="2.2" style="fill:var(--kf-ink)"/>
      <path style="fill:var(--site-bird-wing)" d="M30 72L6 100l10 2 20-20z"/>
      <path style="fill:var(--site-orange)" d="M70 98l-2 10m8-11l2 10" stroke="currentColor" stroke-width="2"/>`)}
    ${S("leaves", "0 0 337 385", `
      <path d="M300 10C250 90 220 170 200 260 190 310 170 350 140 380" fill="none" style="stroke:var(--site-trunk)" stroke-width="3"/>
      <g style="fill:var(--site-leaf)">${[[290, 30, 30], [262, 70, -40], [280, 110, 50], [236, 130, -35], [258, 170, 40], [214, 190, -30], [232, 232, 45], [196, 250, -25], [210, 292, 40], [176, 312, -30], [184, 350, 35]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="24" transform="rotate(${r} ${x} ${y})"/>`).join("")}</g>
      <g style="fill:var(--site-leaf-soft)">${[[306, 64, 60], [240, 98, -60], [276, 146, 70], [226, 208, -60], [250, 270, 65], [190, 290, -60], [166, 360, -50]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="19" transform="rotate(${r} ${x} ${y})"/>`).join("")}</g>`)}
    ${S("sprout", "0 0 26 19", `<g style="fill:var(--site-orange)"><ellipse cx="13" cy="6" rx="2.6" ry="5.5"/><ellipse cx="6" cy="12" rx="2.4" ry="5" transform="rotate(-55 6 12)"/><ellipse cx="20" cy="12" rx="2.4" ry="5" transform="rotate(55 20 12)"/></g>`)}
    ${S("i-about", "0 0 26 26", `<path ${line} d="M3 12 13 4l10 8M6 10v12h14V10M11 22v-6h4v6M13 9v4m-2-2h4"/>`)}
    ${S("i-medical", "0 0 26 26", `<path ${line} d="M6 3v7a5 5 0 0 0 10 0V3M11 15v3a5 5 0 0 0 10 0v-3"/><circle ${line} cx="21" cy="12" r="3"/>`)}
    ${S("i-endo", "0 0 26 26", `<path ${line} d="M4 6h14a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h12a3 3 0 0 1 0 6"/>`)}
    ${S("i-fever", "0 0 26 26", `<circle ${line} cx="11" cy="7" r="4"/><path ${line} d="M3 23c0-5 4-8 8-8s8 3 8 8M21 6v9m0 0a2 2 0 1 0 .1 0"/>`)}
    ${S("i-access", "0 0 26 26", `<path ${line} d="M13 24s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Z"/><circle ${line} cx="13" cy="11" r="2.5"/><path ${line} d="M4 24h18"/>`)}
    ${S("i-global", "0 0 26 26", `<circle ${line} cx="13" cy="13" r="10"/><path ${line} d="M3 13h20M13 3c-4 4-4 16 0 20m0-20c4 4 4 16 0 20"/>`)}
    ${S("i-tel", "0 0 16 16", `<path fill="currentColor" d="M14.6 11.2 11.4 9.8a.9.9 0 0 0-1 .3l-1.4 1.7A10.5 10.5 0 0 1 4.1 6.9l1.7-1.4a.9.9 0 0 0 .3-1L4.7 1.3a.9.9 0 0 0-1-.5l-3 .7A.9.9 0 0 0 0 2.3 13.7 13.7 0 0 0 13.7 16a.9.9 0 0 0 .9-.7l.7-3a.9.9 0 0 0-.7-1.1Z"/>`)}
    ${S("i-arrow", "0 0 16 16", `<path ${line} d="M3 8h10M9 4l4 4-4 4"/>`)}
    ${S("i-blank", "0 0 16 16", `<path ${line} d="M9 2h5v5M14 2 7 9M12 10v4H2V4h4"/>`)}
    ${S("i-stomach", "0 0 74 74", `<path ${line} d="M30 10v12c0 6-12 8-12 22 0 12 10 20 22 20 14 0 22-10 22-22 0-10-6-14-12-14-8 0-8 8-14 8"/><path ${line} d="M24 64c-4 0-6 3-6 6"/>`)}
    ${S("i-coil", "0 0 74 74", `<path ${line} d="M14 16h40a8 8 0 0 1 0 16H22a8 8 0 0 0 0 16h32a8 8 0 0 1 0 16H18"/>`)}
    ${S("i-clip", "0 0 74 74", `<rect ${line} x="16" y="12" width="36" height="50" rx="4"/><path ${line} d="M26 12v-4h16v4M24 30h20M24 40h12M48 48l12-12 4 4-12 12-6 2z"/>`)}
    ${S("i-steth", "0 0 74 74", `<path ${line} d="M18 10v18a12 12 0 0 0 24 0V10M30 40v6a14 14 0 0 0 28 0v-8"/><circle ${line} cx="58" cy="32" r="6"/>`)}
    ${S("i-procto", "0 0 74 74", `<ellipse ${line} cx="37" cy="37" rx="26" ry="22"/><path ${line} d="M37 22v18"/><circle cx="37" cy="46" r="2" fill="currentColor"/>`)}
    ${S("i-syringe", "0 0 74 74", `<path ${line} d="M46 12l16 16M54 20 26 48l-8 0 0-8 28-28M30 36l8 8M22 52l-8 8M58 40l-10 10 6 6"/>`)}
    ${S("i-car", "0 0 105 86", `<path ${line} d="M16 54v14h10v-6h52v6h10V54l-8-20c-2-4-5-6-9-6H34c-4 0-7 2-9 6zM22 46h60M30 56h8m28 0h8"/>`)}
    ${S("i-bus", "0 0 105 86", `<rect ${line} x="40" y="20" width="52" height="46" rx="6"/><path ${line} d="M40 44h52M50 66v8m32-8v8M50 56h4m24 0h4M14 12v62M8 12h12v14H8z"/>`)}
  </svg>`;
  const tree = (cls) => `<svg class="${cls}" viewBox="0 0 120 100" aria-hidden="true"><use href="#cm-tree"/></svg>`;
  const icon = (id, cls = "cm-icon") => `<svg class="${cls}" viewBox="0 0 26 26" aria-hidden="true"><use href="#cm-${id}"/></svg>`;
  const small = (id, cls = "cm-si") => `<svg class="${cls}" viewBox="0 0 16 16" aria-hidden="true"><use href="#cm-${id}"/></svg>`;

  const NAV = [
    ["about.html", "About the Clinic", "i-about", "about"],
    ["service.html", "Treatment Guide", "i-medical", "service"],
    ["service.html#endo", "Endoscopy exam", "i-endo", "endo"],
    ["service.html#fever", "Fever outpatient clinic", "i-fever", "fever"],
    ["index.html#access", "Directions", "i-access", "access"],
  ];
  const hoursRows = [["0:00 - 00:00", "oooooo-"], ["00:00 - 00:00", "oo-oo--"]];
  const hours = (cls) => `<table class="${cls}"><thead><tr><th>Consultation Hours</th><th>Month</th><th>Fire</th><th>Number</th><th>Neck</th><th>Gold</th><th>Earth</th><th>Sun·Public holiday</th></tr></thead><tbody>${hoursRows.map(([t, m]) => `<tr><th>${t}</th>${[...m.padEnd(7, "-").slice(0, 7)].map((c) => `<td>${c === "o" ? '<span class="cm-ok" aria-label="Treatment"></span>' : '<span class="cm-ng" aria-label="Clinic closed"></span>'}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  const header = `
    <div class="cm-header__in">
      <h1 class="cm-header__logo"><a href="index.html" class="cm-logo" data-label="Clinic logo — tree illustration + name + small English text">${tree("cm-logo__mark")}<span class="cm-logo__txt"><span class="cm-logo__ko">Your clinic name here</span><span class="cm-logo__en">CLINIC NAME</span></span></a></h1>
      <button type="button" class="cm-burger" aria-label="Open Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="cm-gnav" aria-label="Main menu">
        <ul class="cm-gnav__list">${NAV.map(([href, label, ic, key]) => `<li${key === page ? ' class="is-current"' : ""}><a href="${href}">${icon(ic, "cm-gnav__icon")}<span class="cm-gnav__text">${label}</span></a></li>`).join("")}
          <li class="cm-gnav__global"><a href="#english" class="js-global">${icon("i-global", "cm-gnav__icon")}<span class="cm-gnav__text">English guide / English</span></a></li>
        </ul>
        <ul class="cm-gnav__btns"><li><a class="cm-btn cm-btn--sm" href="#reserve">WEB booking</a></li><li><a class="cm-btn cm-btn--sm cm-btn--tel" href="#tel">${small("i-tel")}000-000-0000</a></li></ul>
      </nav>
    </div>`;

  const fixnav = `<div class="cm-fixnav__box"><ul><li><a href="service.html#endo">Endoscopy exam${small("i-arrow", "cm-si cm-fixnav__arrow")}</a></li><li><a href="#line">Messenger booking${small("i-blank", "cm-si cm-fixnav__blank")}</a></li></ul></div>`;

  const popup = `<div class="cm-popup__in"><div class="cm-popup__box"><button type="button" class="cm-popup__close" aria-label="Close"></button>${icon("i-global", "cm-popup__icon")}<h2 class="cm-popup__h">English-language care available</h2><p class="cm-popup__p">Add about three lines here noting which days care is available in English and that a translation app is used on other days.</p><h2 class="cm-popup__h">English is available.</h2><p class="cm-popup__p">Place an English note here of about three lines — which day a doctor speaks English and how other days work.</p></div></div>`;

  const footer = `
    <div class="cm-inner cm-footer__cols">
      <div class="cm-footer__info">
        <p class="cm-footer__logo"><a href="index.html" class="cm-logo cm-logo--lg">${tree("cm-logo__mark")}<span class="cm-logo__txt"><span class="cm-logo__ko">Your clinic name here</span><span class="cm-logo__en">CLINIC NAME</span></span></a></p>
        <ul class="cm-footer__tags"><li>Treatment subject 1</li><li>Treatment subject 2</li><li>Subject 3</li><li>Subject 4</li><li>Subject 5</li></ul>
        <p class="cm-footer__add">〒000-0000 One line of your address here</p>
        <p class="cm-footer__tel"><a href="#tel">TEL.000-000-0000</a></p>
        <div class="cm-footer__hours">${hours("cm-ftable")}<p>※ Wednesdays and Saturdays until 00:00　※ Temporary closures possible</p></div>
        <ul class="cm-footer__btns"><li><a class="cm-btn" href="#reserve">WEB Booking${small("i-blank")}</a></li><li><a class="cm-btn" href="#line">Messenger booking${small("i-blank")}</a></li></ul>
      </div>
      <div class="cm-footer__nav">
        <div class="cm-fnav">
          <ul class="cm-fnav__main"><li><a href="index.html">Home</a></li><li><a href="service.html#endo">Endoscopy exam</a></li><li><a href="service.html#fever">Fever outpatient clinic</a></li><li><a href="index.html#access">Directions</a></li><li><a href="#standard">Facility Standards, etc.</a></li></ul>
          <div class="cm-fnav__col"><a class="cm-fnav__h" href="about.html">About the Clinic</a><ul><li><a href="about.html#philosophy">Care Philosophy</a></li><li><a href="about.html#feature">Clinic features</a></li><li><a href="about.html#doctor">Doctor Profile</a></li><li><a href="about.html#history">Clinic history</a></li></ul></div>
          <div class="cm-fnav__col"><a class="cm-fnav__h" href="service.html">Treatment Guide</a><ul><li><a href="service.html#dept1">Treatment subject 1</a></li><li><a href="service.html#dept2">Subject 3</a></li><li><a href="service.html#dept3">Subject 4</a></li><li><a href="service.html#dept4">Subject 5</a></li><li><a href="service.html#vaccine">Vaccination</a></li></ul></div>
        </div>
        <p class="cm-footer__pdf"><a href="#pdf">Your public document name here, one line.pdf</a></p>
        <div class="cm-footer__map"><div class="wf-img" data-label="Map embed · neighborhood street map · red pin on the clinic spot · 2:1 landscape"></div></div>
      </div>
    </div>
    <p class="cm-footer__copy"><small>© 0000 Clinic Name</small></p>`;

  document.body.insertAdjacentHTML("afterbegin", sprite);
  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => { el.innerHTML = html; });
  fill("[data-cm-chrome=header]", header);
  fill("[data-cm-chrome=fixnav]", fixnav);
  fill("[data-cm-chrome=popup]", popup);
  fill("[data-cm-chrome=footer]", footer);
  fill("[data-cm-hours]", hours("cm-mtable"));
  document.querySelectorAll("[data-cm-tree]").forEach((el) => { el.innerHTML = tree("cm-tree-svg"); });
  document.querySelectorAll("[data-cm-bird]").forEach((el) => { el.innerHTML = '<svg viewBox="0 0 138 125" aria-hidden="true"><use href="#cm-bird"/></svg>'; });
  document.querySelectorAll("[data-cm-leaves]").forEach((el) => { el.innerHTML = '<svg viewBox="0 0 337 385" aria-hidden="true"><use href="#cm-leaves"/></svg>'; });
  document.querySelectorAll("[data-cm-icon]").forEach((el) => {
    const id = el.dataset.cmIcon, vb = id.startsWith("i-car") || id.startsWith("i-bus") ? "0 0 105 86" : /stomach|coil|clip|steth|procto|syringe/.test(id) ? "0 0 74 74" : id === "i-tel" || id === "i-arrow" || id === "i-blank" ? "0 0 16 16" : "0 0 26 26";
    el.innerHTML = `<svg viewBox="${vb}" aria-hidden="true"><use href="#cm-${id}"/></svg>`;
  });

  // Original: on the home page the header line and fixed nav appear at .4s, only after scrolling past the hero (topMain) height — on subpages they are there from the start
  const head = document.querySelector(".cm-header"), fix = document.querySelector(".cm-fixnav"), top = document.querySelector(".cm-top-main");
  const onScroll = () => {
    const past = !isHome || !top || scrollY > top.offsetHeight;
    head?.classList.toggle("is-scrolled", past);
    fix?.classList.toggle("is-show", past);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Below the original 999px: the burger opens the drawer (aria-expanded · isShow)
  const burger = document.querySelector(".cm-burger"), nav = document.querySelector(".cm-gnav");
  burger?.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-show", open);
    document.body.classList.toggle("is-nav-open", open);
  });

  // English guide window — original .js-global → #js-gPopup.isShow, closes on the close button or an outside press
  const pop = document.querySelector(".cm-popup");
  document.addEventListener("click", (e) => {
    if (e.target.closest(".js-global")) { e.preventDefault(); pop?.classList.add("is-show"); return; }
    if (pop?.classList.contains("is-show") && (e.target.closest(".cm-popup__close") || e.target === pop || e.target.classList.contains("cm-popup__in"))) pop.classList.remove("is-show");
  });

  // Original: same-page anchor links use jQuery animate 700ms (default swing)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.classList.contains("js-global")) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const t = document.getElementById(url.hash.slice(1));
    if (!t) return;
    e.preventDefault();
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = Math.min(t.getBoundingClientRect().top + scrollY, max);
    if (window.jQuery && !matchMedia("(prefers-reduced-motion: reduce)").matches) jQuery("html, body").animate({ scrollTop: y }, 700);
    else scrollTo(0, y);
    burger?.getAttribute("aria-expanded") === "true" && burger.click();
  });
})();
