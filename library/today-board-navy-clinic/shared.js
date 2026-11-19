// Shared by all pages: the header row, menu drawer, side booking tab, building photo strip, clinic info, bottom link strip and footer are attached in one place, and
// Like the original, when a chunk comes within -25% of the screen it floats up 20px over .6s.
(() => {
  const page = document.body.dataset.page;
  const home = page === "home";

  const arrow = '<svg viewBox="0 0 12 9" aria-hidden="true"><path d="M0 4.5h11M7.5 1l3.5 3.5L7.5 8"/></svg>';
  const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="sh-i-mark" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" class="i-soft"/><path d="M63 27c-9-7-27-5-27 8 0 14 28 10 28 25 0 13-18 16-29 8" class="i-lw" style="stroke-width:7"/><circle cx="66" cy="70" r="6" class="i-w"/><circle cx="33" cy="30" r="4.5" class="i-w"/></symbol>
    <symbol id="sh-i-cal" viewBox="0 0 18 19"><rect x="1" y="3" width="16" height="15" rx="2" class="i-lc"/><path d="M1 8h16M5 1v4M13 1v4" class="i-lc"/><path d="M5 12h2M9 12h2M13 12h1M5 15h2M9 15h2" class="i-lc"/></symbol>
    <symbol id="sh-i-temp" viewBox="0 0 13 22"><path d="M4 13V4a2.5 2.5 0 0 1 5 0v9a4.5 4.5 0 1 1-5 0z" class="i-lc"/><circle cx="6.5" cy="16.8" r="2" class="i-c"/><path d="M6.5 8v8" class="i-lc"/></symbol>
    <symbol id="sh-i-pin" viewBox="0 0 12 16"><path d="M6 15.5S1 9.6 1 6a5 5 0 0 1 10 0c0 3.6-5 9.5-5 9.5z" class="i-lc"/><circle cx="6" cy="6" r="1.8" class="i-lc"/></symbol>
    <symbol id="sh-i-person" viewBox="0 0 15 20"><circle cx="7.5" cy="5" r="3.6" class="i-lc"/><path d="M1 19c0-5 2.8-7.6 6.5-7.6S14 14 14 19" class="i-lc"/><path d="M7.5 11.6v3" class="i-lc"/></symbol>
    <symbol id="sh-i-gm" viewBox="0 0 13 18"><path d="M6.5 17.5S.5 10.5.5 6.3a6 6 0 0 1 12 0c0 4.2-6 11.2-6 11.2z" class="i-dg"/><circle cx="6.5" cy="6.3" r="2.3" class="i-w"/></symbol>
    <symbol id="sh-i-m1" viewBox="0 0 50 50"><rect x="9" y="12" width="32" height="30" rx="3" class="i-la"/><path d="M19 12V8h12v4M25 20v14M18 27h14" class="i-la"/></symbol>
    <symbol id="sh-i-m2" viewBox="0 0 50 50"><path d="M20 6v8c0 6-9 7-9 18 0 7 6 12 13 12 9 0 15-6 15-14 0-6-4-9-8-9-5 0-6 4-11 4" class="i-la"/></symbol>
    <symbol id="sh-i-m3" viewBox="0 0 50 50"><path d="M6 40c4-9 10-9 14-4s9 5 12-2 4-16 12-18" class="i-la"/><circle cx="44" cy="16" r="3" class="i-la"/><path d="M6 40h6" class="i-la"/></symbol>
    <symbol id="sh-i-m4" viewBox="0 0 50 50"><path d="M10 14h18l6 8v14H10z" class="i-la"/><path d="M34 22h8M38 18v8M16 26c3-4 7-4 10 0" class="i-la"/></symbol>
    <symbol id="sh-i-m5" viewBox="0 0 50 50"><path d="M21 31V10a4 4 0 0 1 8 0v21a8 8 0 1 1-8 0z" class="i-la"/><path d="M25 17v19M31 14h5M31 20h5" class="i-la"/></symbol>
    <symbol id="sh-i-m6" viewBox="0 0 50 50"><path d="M12 12h26v8H18v8h20v10H12" class="i-la"/><path d="M12 12v8M38 20v8" class="i-la"/></symbol>
    <symbol id="sh-i-m7" viewBox="0 0 50 50"><ellipse cx="25" cy="25" rx="14" ry="9" class="i-la"/><path d="M11 25H5M39 25h6M20 16l-3-6M30 34l3 6M30 16l3-6M20 34l-3 6" class="i-la"/></symbol>
    <symbol id="sh-i-m8" viewBox="0 0 50 50"><path d="M33 7l10 10M38 12L18 32l-6-6L32 6M15 29l-8 8M24 18l5 5M20 22l5 5" class="i-la"/></symbol>
    <symbol id="sh-i-m9" viewBox="0 0 50 50"><path d="M25 7l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" class="i-la"/></symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);

  const nav = [
    ["about.html", "Menu 1"], ["service.html", "Menu 2"], ["#", "Menu 3"], ["#", "Menu 4", true],
    ["#", "Menu 5"], ["#", "Menu 6"], ["news.html", "Menu 7"],
  ];
  const sub = ["Sub Menu 1", "Sub Menu 2", "Sub Menu 3", "Sub Menu 4", "Sub Menu 5", "Sub Menu 6", "Sub Menu 7", "Sub Menu 8", "Sub Menu 9"];
  const head = `
  <header class="sh-head" data-slot="header" data-fx="head-solid-scroll" data-fx-head-solid-scroll="at: 50${home ? "" : "; look: solid"}">
    <a class="sh-logo" href="index.html" aria-label="Your clinic name here — first page">
      <svg class="sh-logo__mark"><use href="#sh-i-mark"/></svg>
      <span class="sh-logo__txt"><b>Your clinic name here</b><small>INTERNAL MEDICINE &amp; CLINIC NAME</small></span>
    </a>
    <nav class="sh-gn" aria-label="Main menu"><ul>
      ${nav.map(([h, t, more]) => more
        ? `<li class="is-more"><a href="${h}"><span class="sh-line">${t}</span></a><div class="sh-gn__drop"><ul>${sub.map((s) => `<li><a href="#">${s}</a></li>`).join("")}</ul></div></li>`
        : `<li class="is-nm"><a href="${h}"><span class="sh-line">${t}</span></a></li>`).join("")}
      <li class="is-rec"><a href="recruit.html"><svg><use href="#sh-i-person"/></svg>Hiring button</a></li>
    </ul></nav>
  </header>
  <button type="button" class="sh-hm" aria-expanded="false" aria-controls="sh-drawer" aria-label="Open Menu"><span class="sh-hm__line"></span><span class="sh-hm__txt" data-open="MENU" data-close="CLOSE"></span></button>
  <div class="sh-drawer" id="sh-drawer" data-slot="menu-drawer" aria-hidden="true">
    <div class="sh-drawer__in">
      <svg class="sh-drawer__mark"><use href="#sh-i-mark"/></svg>
      <p class="sh-drawer__name">Your clinic name here</p>
      <p class="sh-drawer__en">INTERNAL MEDICINE &amp; CLINIC NAME</p>
      <nav class="sh-drawer__list"><ul>
        <li><a href="about.html">Menu 1</a></li><li><a href="service.html">Menu 2</a></li>
        <li><a href="#">Menu 3</a></li><li><a href="news.html">Menu 7</a></li>
        <li class="is-ct"><a href="#">Menu 4</a></li>
        <li class="is-child"><ul>${sub.slice(0, 8).map((s) => `<li><a href="#">${s}</a></li>`).join("")}</ul></li>
        <li><a href="#">Menu 5</a></li><li><a href="#">Menu 6</a></li>
        <li><a href="#">Menu 8</a></li><li><a href="#">Menu 9</a></li>
        <li><a href="recruit.html">Hiring Info</a></li><li><a href="online.html">Online medical visit</a></li>
      </ul></nav>
      <ul class="sh-drawer__cv">
        <li><a href="#"><svg><use href="#sh-i-cal"/></svg>Booking button</a></li>
        <li><a href="article.html"><svg><use href="#sh-i-temp"/></svg>Guide button</a></li>
      </ul>
      <p class="sh-drawer__copy">Your tagline here ‹<span>Emphasis</span>」 text</p>
      <p class="sh-drawer__copy-en">Here is a short english line.</p>
      <p class="sh-drawer__cr">© CLINIC NAME.</p>
    </div>
  </div>
  <nav class="sh-cv" data-slot="side-cta" aria-label="Reservation"><ul>
    <li class="is-res"><a href="#"><span class="sh-cv__ic"><svg><use href="#sh-i-cal"/></svg><span class="sh-cv__t">Booking button</span></span></a></li>
    <li class="is-foc"><a href="article.html"><span class="sh-cv__ic"><svg><use href="#sh-i-temp"/></svg><span class="sh-cv__t">Guide button</span></span></a></li>
    <li class="is-acc"><a href="about.html#access"><span class="sh-cv__ic"><svg><use href="#sh-i-pin"/></svg><span class="sh-cv__t">Directions</span></span></a></li>
  </ul></nav>`;
  document.body.insertAdjacentHTML("afterbegin", head);

  const dot = (look = "") => `<span class="sh-dot" data-fx="dot-ring-hover"${look ? ` data-fx-dot-ring-hover="look: ${look}"` : ""}></span>`;
  const days = ["Month", "Fire", "Number", "Neck", "Gold", "Earth", "Sundays · Holidays"];
  const rows = [["00:00-00:00", "Consultation 1", "※Your short note here", "●●-●●●-"], ["00:00-00:00", "Consultation 2", "", "●●-●●●-"], ["00:00-00:00", "Consultation 3", "", "●●-●●●-"], ["00:00-00:00", "Consultation 2", "", "●●-●●-"]];
  const table = (cls) => `<table class="sh-hours ${cls}">
    <tr><th><p>Consultation Hours</p></th><td></td>${days.map((d, i) => `<td><p class="sh-hours__wk${i === 5 ? " is-sat" : i === 6 ? " is-sun" : ""}">${d}</p></td>`).join("")}</tr>
    ${rows.map(([t, n, d, m]) => `<tr><th><p>${t}</p></th><td><p class="sh-hours__n">${n}</p>${d ? `<p class="sh-hours__d">${d}</p>` : ""}</td>${[...m.padEnd(7, "-")].map((c) => `<td>${c === "●" ? '<span class="sh-hours__ok" aria-label="Treatment"></span>' : '<span class="sh-hours__no">-</span>'}</td>`).join("")}</tr>`).join("")}
  </table>`;
  window.shHours = table;
  window.shDot = dot;
  window.shArrow = (look = "") => `<span class="sh-arrow" data-fx="arrow-pass-hover"${look ? ` data-fx-arrow-pass-hover="look: ${look}"` : ""}>${arrow}${arrow}</span>`;

  // Map is a road drawing of the same position and size instead of an embed: two main roads, an alley grid, one pin
  const map = `<svg class="sh-map__svg" viewBox="0 0 700 750" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of the roads around the clinic · main road intersection · pin in the center">
    <rect width="700" height="750" class="i-map"/>
    <g class="i-street">${Array.from({ length: 9 }, (_, i) => `<path d="M${-40 + i * 95} 0l120 750"/>`).join("")}${Array.from({ length: 10 }, (_, i) => `<path d="M0 ${30 + i * 82}l700 -60"/>`).join("")}</g>
    <path d="M-20 520L720 430" class="i-road"/><path d="M300 -20l140 790" class="i-road"/>
    <g class="i-block">${Array.from({ length: 14 }, (_, i) => `<rect x="${40 + (i % 5) * 130}" y="${70 + Math.floor(i / 5) * 210}" width="${50 + (i % 3) * 18}" height="${36 + (i % 4) * 9}" rx="3"/>`).join("")}</g>
    <path d="M372 338c-16 0-28 12-28 28 0 21 28 50 28 50s28-29 28-50c0-16-12-28-28-28z" class="i-pin"/><circle cx="372" cy="366" r="10" class="i-w"/>
  </svg>`;

  const foot = `
  <section class="sh-band" data-slot="boundary-photo-marquee">
    <div class="sh-band__copy" aria-hidden="true"><p><span>Your Specialty</span></p><p><span>Second Field</span></p><p><span>Clinic Name</span></p></div>
    <div class="sh-band__mq" data-fx="marquee" data-fx-marquee="speed: 160; dir: right; pause: none">
      <div class="sh-band__ph wf-img" data-label="Clinic building exterior panorama · signboard on white wall · clear sky · ultra-wide landscape 7.8:1"></div>
    </div>
  </section>
  <section class="sh-info" data-slot="info-hours-map">
    <div class="sh-info__b">
      <div class="sh-info__c" data-reveal>
        <p class="sh-info__ttl">Information</p>
        ${table("")}
        <p class="sh-info__desc">【Reception hours】Morning 00:00~00:00／Afternoon 00:00~00:00<br>【Closed】Your weekdays/holidays here</p>
        <div class="sh-info__tel"><p>tel.<a href="#">000-000-0000</a></p></div>
        <p class="sh-info__tel-d">※ Add one line with phone hours here.</p>
        <p class="sh-info__age"><span>Eligible age</span>Your target here</p>
      </div>
      <div class="sh-info__m">
        <div class="sh-map">${map}
          <div class="sh-map__link"><p>Your one-line address goes here<a href="#"><svg><use href="#sh-i-gm"/></svg><span>Map app</span></a></p></div>
        </div>
      </div>
    </div>
    <div class="sh-info__u">
      <div class="sh-bn-box" data-reveal>
        <a class="sh-bn is-rec" href="recruit.html">
          <span class="sh-bn__tn wf-img" data-label="Staff photo · bright exam room · landscape"></span>
          <span class="sh-bn__c"><span class="sh-bn__copy"><span>Your short invitation line here!</span></span><span class="sh-bn__jp">Banner Title 1</span><span class="sh-bn__en">BANNER ENGLISH ONE</span></span>
          ${dot("bn")}
        </a>
        <p class="sh-bn__desc">Your two-line banner description here.<br>Add your second line here.</p>
      </div>
      <div class="sh-bn-box" data-reveal>
        <a class="sh-bn is-oc" href="online.html">
          <span class="sh-bn__tn wf-img" data-label="Phone video consultation screen in hand · Landscape"></span>
          <span class="sh-bn__c"><span class="sh-bn__copy"><span>Your short invitation line here!</span></span><span class="sh-bn__jp">Banner Title 2</span><span class="sh-bn__en">BANNER ENGLISH TWO</span></span>
          ${dot("bn")}
        </a>
        <p class="sh-bn__desc">Your two-line banner description here.<br>Add your second line here.</p>
      </div>
    </div>
  </section>
  <nav class="sh-pn" data-slot="link-strip" aria-label="Guide link"><ul>
    ${["Guide 1", "Guide 2", "Guide 3"].map((t) => `<li><a href="article.html"><p class="sh-pn__copy">Your small one-line heading here</p><p class="sh-pn__ttl">$ here{t} Title</p>${dot()}</a></li>`).join("")}
  </ul></nav>
  <footer class="sh-foot" data-slot="footer">
    <div class="sh-foot__b">
      <div class="sh-foot__info">
        <svg class="sh-foot__mark"><use href="#sh-i-mark"/></svg>
        <p class="sh-foot__name">Your clinic name here</p>
        <p class="sh-foot__en">INTERNAL MEDICINE &amp; CLINIC NAME</p>
        <p class="sh-foot__ttl">Clinic Information</p>
        <p class="sh-foot__add">Your one-line address goes here<br>TEL.000-000-0000<br class="is-pc"><span class="is-sp">／</span>FAX.000-000-0000</p>
        <p class="sh-foot__desc">Care 1 / Care 2 / Care 3 / Care 4<br>Treatment 5／Treatment 6／Treatment 7<br>Care 8 · Care 9</p>
      </div>
      <div class="sh-foot__site">
        <p class="sh-foot__copy">Your tagline here ‹<span>Emphasis</span>” phrase.</p>
        <p class="sh-foot__copy-en">Here is a short english line.</p>
        <div class="sh-foot__sm">
          <p class="sh-foot__sm-ttl">SiteMap</p>
          <div class="sh-foot__sm-c">
            <ul>${[["about.html", "Menu 1"], ["service.html", "Menu 2"], ["#", "Menu 3"], ["#", "Menu 4"], ["#", "Menu 5"], ["#", "Menu 6"], ["#", "Menu 8"], ["recruit.html", "Hiring Info"], ["news.html", "Menu 7"], ["online.html", "Online medical visit"]].map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
            <p class="sh-foot__bn wf-img" data-label="External intro banner · horizontal strip"></p>
          </div>
        </div>
      </div>
    </div>
    <div class="sh-foot__u">
      <p class="sh-foot__cr">© CLINIC NAME.</p>
      <p class="sh-foot__pt"><a href="#top" class="js-pt">PageTop<span class="sh-dot is-pt" data-fx="dot-ring-hover"></span></a></p>
    </div>
  </footer>`;
  document.querySelector("main").insertAdjacentHTML("afterend", foot);

  // Menu drawer: in the original the whole drawer panel blurs and sharpens in .2s
  const hm = document.querySelector(".sh-hm"), drawer = document.querySelector(".sh-drawer");
  const setOpen = (open) => {
    hm.classList.toggle("is-open", open);
    drawer.classList.toggle("is-open", open);
    hm.setAttribute("aria-expanded", String(open));
    hm.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    drawer.setAttribute("aria-hidden", String(!open));
  };
  hm.addEventListener("click", () => setOpen(!hm.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  // Copy the header row’s data-solid to the hamburger so the header panel·hamburger text color change together
  const headEl = document.querySelector(".sh-head");
  new MutationObserver(() => hm.classList.toggle("is-solid", headEl.hasAttribute("data-solid") || !home)).observe(headEl, { attributes: true, attributeFilter: ["data-solid"] });
  hm.classList.toggle("is-solid", !home);

  document.querySelectorAll(".js-pt").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); }));

  // Original reveal: once an element enters the band that excludes 25% at the top and bottom of the screen, it rises 20px after .2s over .6s (CSS ease) — attach the fade-up part with the same values
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.dataset.fx = `${el.dataset.fx ? el.dataset.fx + " " : ""}fade-up`;
    el.setAttribute("data-fx-fade-up", "y: 20; duration: .6; delay: .2; start: top 75%; ease: 0.25,0.1,0.25,1");
  });
})();
