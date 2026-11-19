// Theater main site skeleton (pillar menu, phone header bar, drawer, top band, footer, back to top, cookie bar) rendered in one place, with the same jQuery behavior as the original.
// The drawer is the same jquery-drawer as the original (drawer--top), and expand and appear use the default durations of jQuery slideToggle · fadeIn as they are.
(() => {
  const page = document.body.dataset.page;
  const to = { service: "service.html", column: "news.html", recruit: "recruit.html", about: "about.html", news: "article.html", magazine: "news.html", home: "index.html" };
  const MENU = [
    { t: "Performances & Events", key: "service", top: 127, sub: [["Monthly schedule"], ["In-house business lineup", "service"], ["Year-round projects"], ["Repertoire works"], ["Past shows · events"], ["Column · Archive", "column"]] },
    { t: "Ticket", top: 159, sub: [["Ticket"], ["Club member (paid member)"]] },
    { t: "Floor Guide", top: 179, sub: [["Floor Guide"], ["Accessibility guide"]] },
    { t: "Directions" },
    { t: "Web Magazine", key: "magazine" },
    { t: "Facility Rental", top: 274, sub: [["Venue rental information"], ["Usage application"], ["Fee"], ["Equipment"], ["Download forms and drawings"], ["Facility booking status"]] },
    { t: "News", key: "news" },
    { t: "Call for participants · performers", key: "recruit" },
    { t: "Theater About", key: "about" },
    { t: "Sponsorship Info" },
  ];
  const href = (key) => to[key] || "#";
  const here = location.pathname.split("/").pop() || "index.html";
  const cur = (key) => (key && key === page ? ' aria-current="page"' : "");
  const logo = (cls = "") => `<a href="index.html" class="rt-logo ${cls}" data-label="Cinema logo — the original is bold katakana and kanji lettering with a small English line beneath, as an image"><b>Theater name logo</b><small>THEATRE NAME CITY</small></a>`;
  const ICON = {
    search: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.2 10.2 15 15" stroke="currentColor" stroke-width="2"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h5l11 18h-5Z M20 3 4 21" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 22v-8h3l.5-3.5H14V8.3c0-1 .3-1.8 1.8-1.8h1.9V3.3A25 25 0 0 0 15 3.2c-2.7 0-4.4 1.6-4.4 4.6v2.7H7.6V14h3v8Z" fill="currentColor"/></svg>',
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',
    yt: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor"/><path d="m10 9 5 3-5 3Z" fill="var(--sns)"/></svg>',
    alert: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 5v6.5M10 13.5v1.6" stroke="currentColor" stroke-width="2"/></svg>',
    close: '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M3 3l14 14M17 3 3 17" stroke="currentColor" stroke-width="2"/></svg>',
  };
  const sns = `<ul class="rt-sns"><li class="x"><a href="https://example.com/" target="_blank" rel="noopener" aria-label="SNS 1">${ICON.x}</a></li><li class="fb"><a href="https://example.com/" target="_blank" rel="noopener" aria-label="SNS 2">${ICON.fb}</a></li><li class="ig"><a href="https://example.com/" target="_blank" rel="noopener" aria-label="SNS 3">${ICON.ig}</a></li><li class="yt"><a href="https://example.com/" target="_blank" rel="noopener" aria-label="SNS 4">${ICON.yt}</a></li></ul>`;
  const ticket = '<a href="https://example.com/" target="_blank" rel="noopener" class="rt-ticket"><span class="wf-img" data-label="Online Ticket Logo"></span></a>';
  const notice = '<li><span class="date">0000.00.00</span><a href="article.html">Your one-line notice title here: Cast change announcement</a></li>';

  const shell = document.querySelector('[data-slot="side-nav"]');
  if (shell) {
    const navPc = MENU.map((m) => `<li><a href="${href(m.key)}"${cur(m.key)}>${m.t}</a>${m.sub ? `<div class="rt-nav__sub" data-fx-part="panel" data-top="${m.top}">${m.sub.map(([s, k]) => `<span><a href="${href(k)}">${s}</a></span>`).join("")}</div>` : ""}</li>`).join("");
    shell.className = "rt-head";
    shell.innerHTML = `<div class="rt-head__inner">
        <button type="button" class="rt-head__search-sp" aria-label="Search" data-search-sp>${ICON.search}</button>
        <h1 class="rt-head__logo">${logo()}</h1>
        <div class="rt-pc"><span class="rt-head__line"></span><nav class="rt-nav" aria-label="Main menu"><ul data-fx="side-flyout-nav" data-fx-side-flyout-nav="left: 230">${navPc}</ul></nav>${ticket}${sns}</div>
      </div>
      <div class="rt-search-sp" hidden><form role="search"><input type="text" placeholder="Enter a word" aria-label="Search term"><input type="submit" value="SEARCH"></form></div>
      ${document.body.classList.contains("is-home") ? `<div class="rt-important-sp"><div class="rt-important-sp__ttl" data-important-sp>Important Alert</div><div class="rt-important-sp__txt"><ul>${notice}</ul></div></div>` : ""}`;
    const navSp = MENU.map((m) => m.sub
      ? `<li class="drawer-dropdown"><a href="#" class="row" data-dropdown aria-expanded="false">${m.t}<span class="icn"><span></span></span></a><ul class="drawer-dropdown-menu">${m.sub.map(([s, k]) => `<li><a href="${href(k)}">${s}</a></li>`).join("")}</ul></li>`
      : `<li><a href="${href(m.key)}"${cur(m.key)}>${m.t}</a></li>`).join("");
    shell.insertAdjacentHTML("beforebegin", `<div class="rt-btn-sp"><button type="button" class="drawer-toggle drawer-hamburger" aria-label="Menu"><span class="drawer-hamburger-icon"></span></button></div>
      <div class="drawer-nav" role="navigation" data-slot="drawer"><div class="drawer-menu"><div class="rt-navi">
        <div class="rt-lang-sp"><a href="${here}" aria-current="true">JP</a> / <a href="#">EN</a></div>
        <ul class="rt-gnavi">${navSp}<li><a href="#">Press Release</a></li><li><a href="#">Careers · Bidding info</a></li><li><a href="#">Site Policy</a></li><li><a href="#">Privacy policy</a></li></ul>
        <div class="rt-navi__banners">${ticket}${sns}</div>
      </div></div></div>`);
  }

  const bar = document.querySelector('[data-slot="page-bar"]');
  if (bar) {
    bar.className = "rt-bar";
    bar.innerHTML = `<div class="rt-search" data-search-box><div class="rt-search__row"><form role="search"><input type="text" placeholder="Enter a word" aria-label="Search term"><input type="submit" value="SEARCH"></form><button type="button" class="rt-search__close" aria-label="Close" data-search-close>${ICON.close}</button></div></div>
      <div class="rt-bar__row"><button type="button" class="rt-bar__search" data-search-open>${ICON.search}<span>SEARCH</span></button><div class="rt-lang"><a href="${here}" aria-current="true">JP</a> / <a href="#">EN</a></div></div>
      ${document.body.classList.contains("is-home") ? `<div class="rt-important" data-slot="important-bar"><div class="rt-important__wrap"><div class="rt-important__ttl">${ICON.alert}Important Alert</div><ul class="rt-important__list">${notice}</ul></div></div>` : ""}`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const col = (rows) => `<li>${rows.map(([tag, t, k, cls, acls]) => `<${tag}${cls ? ` class="${cls}"` : ""}><a${acls ? ` class="${acls}"` : ""} href="${href(k)}">${t}</a></${tag}>`).join("")}</li>`;
    foot.className = "rt-foot";
    foot.id = "footer";
    foot.innerHTML = `<ul class="rt-fnavi">
        ${col([["h4", "HOME", "home"], ["h4", "News", "news"], ["h4", "Performances & Events", "service"], ["p", "Monthly schedule", "", "ffs"], ["p", "In-house business", "service"], ["p", "Year-round projects"], ["p", "Past shows · events"], ["p", "Column · Archive", "column"]])}
        ${col([["h4", "Ticket"], ["p", "How to buy", "", "ffs"], ["p", "Club member (paid member)", "", "ffl"], ["h4", "Floor Guide"], ["p", "Accessibility guide", "", "ffs ffl"], ["h4", "Directions"]])}
        ${col([["h4", "Facility Rental"], ["p", "Venue rental information", "", "ffs"], ["p", "Usage application"], ["p", "Fee"], ["p", "Equipment"], ["p", "Download forms and drawings"], ["p", "Facility booking status"]])}
        ${col([["h4", "Call for participants · performers", "recruit"], ["h4", "Theater About", "about"], ["p", "Theater Concept", "about", "ffs", "rt-fnavi__concept"], ["p", "History", "about", "", "rt-fnavi__history"], ["p", "Greeting", "about", "", "rt-fnavi__message"]])}
        ${col([["h4", "Press Release"], ["h4", "Membership system"], ["h4", "Sponsorship Info"], ["h4", "Careers · Bidding info"]])}
      </ul>
      <ul class="rt-foot__links"><li class="rt-pc"><a href="#">Site Policy</a></li><li class="rt-pc"><a href="#">Privacy policy</a></li></ul>
      <span class="rt-foot__line"></span>
      <p class="rt-foot__logo">${logo()}</p>
      <p class="rt-foot__address">〒000-0000<br>Your one-line address here<br>TEL : <a href="#">000-000-0000</a><br>FAX : 000-000-0000<br><br>Ticket Inquiries <a href="#">Here</a></p>
      <p class="rt-foot__txt">Your one line naming the operator — a theater built by the city is run by a designated management foundation.</p>
      <p class="rt-foot__copy">© THEATRE NAME. All rights reserved.</p>
      <p class="rt-foot__credit">First page large photo credit: Name</p>
      <button type="button" class="rt-pagetop js-pagetop" aria-label="Back to top"></button>`;
  }

  if (!document.querySelector(".rt-consent")) {
    // The original tool stamps buttons as a — use the same tag so the measuring tool pairs with the original button.
    // Copy length matches the original guide’s line count (two lines on wide screens, five in the phone box, six on the column site) — band and box heights must match so the closed end values line up
    const more = document.querySelector('[data-slot="column-header"]') ? " Even if you do not agree, you can still view the site as is, and settings can be changed at any time." : " You can still browse the site as usual even if you do not agree.";
    document.body.insertAdjacentHTML("beforeend", `<div class="rt-consent" data-slot="cookie-consent" role="dialog" aria-label="Cookie consent"><p>Your cookie notice goes here in 2–3 lines. This site uses cookies for a better service and usage statistics. For more about cookies, see ‹<a href="#" class="rt-consent__link">Site Policy</a>›, and personal data is handled under ‹<a href="#" class="rt-consent__link">Privacy policy</a>See ›.${more}</p><div class="rt-consent__btns"><a role="button" tabindex="0" class="rt-consent__deny" data-consent>Do not agree</a><a role="button" tabindex="0" class="rt-consent__allow" data-consent>Agreed</a></div></div>`);
  }

  const $ = window.jQuery;
  if (!$) return;
  $(".drawer").drawer?.();
  // Submenu inside the drawer — the original attaches open to li via a bootstrap dropdown
  $(document).on("click", "[data-dropdown]", function (e) {
    e.preventDefault();
    const li = $(this).parent().toggleClass("open");
    $(this).attr("aria-expanded", String(li.hasClass("open")));
  });
  $(document).on("click", ".drawer-toggle", () => $("html, body").toggleClass("fixed"));
  $("[data-search-open]").on("click", () => $("[data-search-box]").slideToggle());
  $("[data-search-close]").on("click", () => $("[data-search-box]").slideToggle());
  $("[data-search-sp]").on("click", () => { const box = $(".rt-search-sp").removeAttr("hidden"); box.slideToggle("fast"); });
  $(".rt-search-sp").hide();
  $(".rt-important-sp__txt").hide();
  $("[data-important-sp]").on("click", () => $(".rt-important-sp__txt").slideToggle("fast"));
  const top = $(".js-pagetop").hide();
  $(window).on("scroll", function () { $(this).scrollTop() > 200 ? top.fadeIn() : top.fadeOut(); });
  top.on("click", () => { $("html,body").animate({ scrollTop: 0 }, "slow"); return false; });
  // Like the original widget (cookieconsent), hide it on the bar’s transitionend — even when the hover transition (.3s) of an inner button ends it bubbles up,
  // Pressing with a finger cuts the 1s fade off at about .3s (column sites with no button hover fill the full 1s). For environments with transitions off, it also closes by time
  $(document).on("click", "[data-consent]", () => {
    const box = $(".rt-consent").addClass("is-out");
    const hide = () => box.attr("hidden", "");
    box.one("transitionend", hide);
    setTimeout(hide, 1100);
  });
  if (window.gsap && window.ScrollTrigger && document.getElementById("footer")) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({ trigger: "#footer", start: "top bottom", end: "+=1000", toggleClass: { targets: ".js-pagetop", className: "change_color" } });
  }
})();

// Column site skeleton — prints the top row·footer, and shows the frame when pace (original loader) finishes or 4s pass. Back to top uses jQuery animate like the original 'slow'
(() => {
  const head = document.querySelector('[data-slot="column-header"]');
  if (!head) return;
  head.innerHTML = `<div class="cl-head__inner"><nav class="cl-gnav" aria-label="Column menu"><ul><li><a href="news.html">HOME</a></li><li><a href="#">SPIN OFF</a></li></ul></nav>
    <a href="index.html" class="cl-logo"><span class="rt-logo" data-label="Theater logo (small)"><b>Theater name logo</b><small>THEATRE NAME CITY</small></span></a></div>`;
  const foot = document.querySelector('[data-slot="column-footer"]');
  if (foot) foot.innerHTML = '<div class="cl-foot__inner"><p class="cl-foot__copy">© THEATRE NAME. All rights reserved.</p><button type="button" class="cl-pagetop" aria-label="Back to top"></button></div>';
  const done = () => document.body.classList.add("pace-done");
  document.body.classList.add("is-DOM-loaded");
  setTimeout(done, 4000);
  if (window.Pace) window.Pace.on("done", done);
  const $ = window.jQuery;
  if ($) {
    const top = $(".cl-pagetop");
    $(".cl-pagetop").on("click", () => { $("html,body").animate({ scrollTop: 0 }, "slow"); return false; });
    if (innerWidth <= 767) { top.hide(); $(window).on("scroll", function () { $(this).scrollTop() > 200 ? top.fadeIn() : top.fadeOut(); }); }
  }
})();
