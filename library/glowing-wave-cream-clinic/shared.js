// Shared by all pages: attaches the header line (dropdown menu), phone drawer, tab beside opening hours, booking band and footer in one place, and
// As in the original, a block rises .5s from 20px below when it enters 90% of the screen, and the wave image gets a parallax effect via paroller.
(() => {
  const page = document.body.dataset.page;
  const home = page === "home";

  const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <linearGradient id="aa-g-wave" x1="0" x2="1" y1="0" y2="0"><stop offset="0" class="s-a"/><stop offset=".45" class="s-c"/><stop offset="1" class="s-c0"/></linearGradient>
      <linearGradient id="aa-g-glow" x1="0" x2="1" y1="0" y2="1"><stop offset="0" class="s-c"/><stop offset=".3" class="s-w"/><stop offset=".6" class="s-c"/><stop offset="1" class="s-w"/></linearGradient>
    </defs>
    <symbol id="aa-i-mark" viewBox="0 0 40 40"><path d="M6 34 20 6l14 28" class="i-ln"/><path d="M12 24h16" class="i-ln"/><circle cx="20" cy="6" r="3" class="i-y"/></symbol>
    <symbol id="aa-i-arr" viewBox="0 0 14 14"><path d="M7 0 5.75 1.23l4.9 4.9H0v1.75h10.65l-4.9 4.9L7 14l7-7z" class="i-c"/></symbol>
    <symbol id="aa-i-down" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" class="i-y"/><path d="m8 10.5 4 4 4-4" class="i-lw"/></symbol>
    <symbol id="aa-i-carr" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" class="i-cw"/><path d="M6 10h8M10.5 6.5 14 10l-3.5 3.5" class="i-la"/></symbol>
    <symbol id="aa-i-tel" viewBox="0 0 18 18"><path d="M4 1.5 6.5 5 5 7c.8 2.2 3.8 5.2 6 6l2-1.5 3.5 2.5-1.5 3C8 17 1 10 1 3z" class="i-cw"/></symbol>
    <symbol id="aa-i-ext" viewBox="0 0 18 18"><path d="M7 3H3v12h12v-4M10 2h6v6M16 2 8 10" class="i-ln"/></symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);

  const days = ["Month", "Fire", "Number", "Neck", "Gold", "Earth", "Day", "Ball"];
  const rows = [["00:00-00:00", "●●●●●●●▲"], ["00:00-00:00", "●●●●●▲--"]];
  const table = (cls = "") => `<div class="aa-tbl ${cls}"><table>
    <thead><tr><th><span class="aa-tbl__h">Consultation Hours</span></th>${days.map((d, i) => `<th class="${i === 5 ? "is-sat" : i > 5 ? "is-sun" : ""}">${d}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(([t, m]) => `<tr><th class="aa-tbl__t">${t}</th>${[...m].map((c) => `<td>${c === "●" ? '<span class="aa-tbl__ok" aria-label="Treatment"></span>' : c === "▲" ? '<span class="aa-tbl__half" aria-label="Mornings only"></span>' : '<span class="aa-tbl__no">-</span>'}</td>`).join("")}</tr>`).join("")}</tbody>
  </table><div class="aa-tbl__info"><p>● Your one-line closed-day notice here</p><p>● Your last reservation time note here, one line</p></div></div>`;
  window.aaTable = table;
  window.aaArr = '<svg class="aa-arr" aria-hidden="true"><use href="#aa-i-arr"/></svg>';
  window.aaCarr = '<svg class="aa-carr" aria-hidden="true"><use href="#aa-i-carr"/></svg>';

  const mega1 = ["Menu 1-1", "Menu 1-2", "Menu 1-3", "Menu 1-4", "Menu 1-5", "Menu 1-6"];
  const mega2 = ["Menu 2-1", "Menu 2-2", "Menu 2-3", "Menu 2-4", "Menu 2-5", "Menu 2-6", "Menu 2-7", "Menu 2-8", "Menu 2-9", "Menu 2-10"];
  const links = { "Menu 1-1": "index.html", "Menu 2-9": "news.html", "Menu 2-10": "news.html" };
  const mega = (ttl, list, cls) => `<div class="aa-mega"><div class="aa-mega__in"><p class="aa-mega__ttl">${ttl}</p><ul class="aa-mega__list ${cls}">${list.map((t) => `<li><a href="${links[t] || "#"}">${t}</a></li>`).join("")}</ul></div></div>`;
  const head = `
  <header class="aa-head${home ? " is-home" : ""}" data-slot="header">
    <div class="aa-head__in">
      <div class="aa-head__l">
        <p class="aa-head__h1">Your one line with the region name and type of council goes here</p>
        <a class="aa-logo" href="index.html" aria-label="Your clinic name here — first page"><svg class="aa-logo__mark"><use href="#aa-i-mark"/></svg><span class="aa-logo__t"><small>Your company name here</small><b class="aa-logo__w">Clinic Name</b></span></a>
        <button type="button" class="aa-hm" aria-label="Open Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
      <div class="aa-head__r">
        <ul class="aa-head__btns is-pc">
          <li><a class="aa-btn is-invert is-s" href="#">First appointment booking button</a></li>
          <li><a class="aa-btn is-s" href="#">Booking button</a></li>
        </ul>
        <nav class="aa-nav" aria-label="Main menu">
          <ul class="aa-nav__menu">
            <li class="has-sub"><div class="aa-nav__dd"><span class="aa-nav__txt" tabindex="0">Menu 1</span>${mega("About Clinic", mega1, "is-1")}</div></li>
            <li class="has-sub"><div class="aa-nav__dd"><span class="aa-nav__txt" tabindex="0">Menu 2</span>${mega("Treatment / Test", mega2, "is-2")}</div></li>
            <li class="is-rec is-pc"><a class="aa-nav__link" href="recruit.html">Hiring Info</a></li>
            <li class="is-sp aa-nav__sp"><a class="aa-btn is-invert" href="#">First appointment booking button</a></li>
            <li class="is-sp aa-nav__sp"><a class="aa-btn" href="#">Booking button</a></li>
          </ul>
          <div class="is-sp">${table("is-nav")}</div>
        </nav>
      </div>
    </div>
  </header>
  <aside class="aa-sch" data-slot="schedule-tab" data-fx="peek-tab" data-fx-peek-tab="show: ${home ? 9999 : 140}">
    <button type="button" class="aa-sch__tab" data-fx-part="tab"><svg><use href="#aa-i-down"/></svg><span>Consultation Hours</span></button>
    ${table("is-sch")}
  </aside>
  <nav class="aa-spbar is-sp" data-slot="sp-cta" aria-label="Reservation"><a class="aa-btn is-invert" href="#">First visit booking button ${window.aaCarr}</a><a class="aa-btn" href="#">Other Booking Button${window.aaCarr}</a></nav>`;
  document.body.insertAdjacentHTML("afterbegin", head);

  // The map is a road drawing of the same spot and size instead of an embed — main street in front of the station, railway, pin
  const map = `<svg class="aa-map__svg" viewBox="0 0 520 380" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Map of streets around the station · main roads and rail lines · clinic pin">
    <rect width="520" height="380" class="i-map"/>
    <g class="i-street">${Array.from({ length: 8 }, (_, i) => `<path d="M${-30 + i * 75} 0l90 380"/>`).join("")}${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${20 + i * 70}l520 -40"/>`).join("")}</g>
    <path d="M-10 250 530 205" class="i-road"/><path d="M190-10 290 390" class="i-rail"/>
    <g class="i-block">${Array.from({ length: 10 }, (_, i) => `<rect x="${30 + (i % 4) * 125}" y="${40 + Math.floor(i / 4) * 130}" width="${44 + (i % 3) * 16}" height="${30 + (i % 2) * 14}" rx="3"/>`).join("")}</g>
    <path d="M300 150c-12 0-21 9-21 21 0 16 21 37 21 37s21-21 21-37c0-12-9-21-21-21z" class="i-pin"/><circle cx="300" cy="171" r="7" class="i-w"/>
  </svg>`;
  const exit = `<div class="aa-exit"><p>Your station name here<br>At the exit</p><p class="aa-exit__n">On foot<span class="aa-exit__d">0</span>Minute</p></div>`;
  const fcol = (ttl, list, cls = "") => `<div class="aa-fcol"><p class="aa-fcol__ttl">${ttl}</p><ul class="aa-fcol__menu ${cls}">${list.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>`;
  const foot = `
  <footer class="aa-foot" data-slot="footer">
    <div class="aa-foot__res" data-slot="reserve-band">
      <a class="aa-res" href="#"><div class="aa-res__b"><div class="aa-res__in">
        <h2 class="aa-res__ttl"><span class="en">Reserve</span><span class="jp">Your booking info here</span></h2>
        <p class="aa-res__txt">Your two-line booking instructions here.<br>Add your second line here.</p>
      </div><span class="aa-res__go" aria-hidden="true"><svg><use href="#aa-i-arr"/></svg></span></div></a>
    </div>
    <div class="aa-foot__c">
      <div class="aa-foot__row">
        <div class="aa-foot__info">
          <a class="aa-logo is-foot" href="index.html"><svg class="aa-logo__mark"><use href="#aa-i-mark"/></svg><span class="aa-logo__t"><small>Your company name here</small><b class="aa-logo__w">Clinic Name</b></span></a>
          <p class="aa-foot__name">Clinic Name</p>
          <address class="aa-foot__addr">〒000-0000 One line of your address here</address>
          <p class="aa-foot__tel"><a class="aa-btn is-tel" href="#"><span class="aa-foot__tel-n"><svg><use href="#aa-i-tel"/></svg>0000-00-0000</span>${window.aaCarr}</a></p>
          ${table("is-foot")}
        </div>
        <div class="aa-foot__map"><div class="aa-map">${map}</div>${exit}</div>
      </div>
      <div class="aa-foot__nav">
        ${fcol("Menu 1", [["index.html", "Menu 1-1"], ["#", "Menu 1-2"], ["#", "Menu 1-3"], ["#", "Menu 1-4"], ["#", "Menu 1-5"], ["#", "Menu 1-6"], ["#", "Menu 1-7"]], "is-2col")}
        ${fcol("Menu 2", [["#", "Menu 2-1"], ["#", "Menu 2-2"], ["#", "Menu 2-3"], ["news.html", "Menu 2-4"], ["#", "Menu 2-5"], ["#", "Menu 2-6"], ["#", "Menu 2-7"], ["#", "Menu 2-8"]], "is-2col")}
        ${fcol("Information", [["news.html", "News"], ["recruit.html", "Hiring Info"], ["#", "Your long guide link in one line here"], ["article.html", "Column"]])}
      </div>
      <ul class="aa-foot__bn">
        <li><a class="aa-fbn is-rec" href="recruit.html"><span class="aa-fbn__ph wf-img" data-label="Smiling nurse · white coat · square"></span><span class="aa-fbn__t"><b class="aa-fbn__en">Recruit</b>Hiring Info</span>${window.aaCarr}</a></li>
        ${[1, 2, 3].map((n) => `<li><a class="aa-fbn" href="#"><span class="aa-fbn__logo"><svg><use href="#aa-i-mark"/></svg></span><span class="aa-fbn__t2">Your clinic under the same corporation ${n}<small class="aa-fbn__sub">CLINIC NAME ${n}</small></span><svg class="aa-fbn__ext"><use href="#aa-i-ext"/></svg></a></li>`).join("")}
      </ul>
      <div class="aa-foot__u"><ul><li><a href="#">Privacy policy</a></li><li><a href="#">Sitemap</a></li></ul><p>© CLINIC NAME. All Rights Reserved.</p></div>
    </div>
  </footer>`;
  document.querySelector("main").insertAdjacentHTML("afterend", foot);

  // Header bar — once past the Hero (or header height+20) it attaches as a white plate and appears in .5s
  const headEl = document.querySelector(".aa-head");
  const fv = document.querySelector(".js-firstview");
  const fixAt = () => (fv ? fv.offsetHeight + headEl.offsetHeight : headEl.offsetHeight + 20);
  const onScroll = () => { if (!document.body.classList.contains("is-menu")) headEl.classList.toggle("is-fixed", scrollY > fixAt()); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
  // The side tab on the first page appears only after the hero — measure the hero height and feed it into peek-tab’s show
  if (home && fv) document.querySelector(".aa-sch").setAttribute("data-fx-peek-tab", `show: ${fixAt()}`);

  // Phone drawer — the original is jQuery fadeIn/fadeOut (.4s)
  const hm = document.querySelector(".aa-hm"), nav = document.querySelector(".aa-nav");
  let y = 0;
  hm.addEventListener("click", () => {
    const open = !hm.classList.contains("is-active");
    hm.classList.toggle("is-active", open);
    hm.setAttribute("aria-expanded", String(open));
    hm.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (open) { y = scrollY; document.body.classList.add("is-menu"); headEl.classList.add("is-fixed"); }
    else { document.body.classList.remove("is-menu"); scrollTo(0, y); onScroll(); }
    nav.classList.toggle("is-open", open);
  });

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.dataset.fx = `${el.dataset.fx ? el.dataset.fx + " " : ""}fade-up`;
    el.setAttribute("data-fx-fade-up", `y: 20; duration: ${el.dataset.reveal || ".5"}; start: top 90%; ease: 0.25,0.1,0.25,1`);
  });

  // Original: $(".js-parallax").paroller({ type: "foreground", transition: "transform 0.2s ease-out" })
  if (window.jQuery && jQuery.fn.paroller && !matchMedia("(prefers-reduced-motion: reduce)").matches) jQuery(".js-parallax").paroller({ type: "foreground", transition: "transform 0.2s ease-out" });
})();
