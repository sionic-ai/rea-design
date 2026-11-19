// Fill the two shells (bank plate, recruit plate) in the same shape on every page and attach the shared interaction.
// The bank panel original moves only with jQuery + CSS transition — keep its durations and delays in CSS as they are, and here only swap state names.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isRecruit = body.classList.contains("rc");

  const ICONS = {
    emblem: '<circle cx="12" cy="12" r="10.2"/><path d="M8 7.2v7.6M16 7.2v7.6M8 11h8M12 11v7.2M6.3 16.6h11.4"/>',
    pin: '<path d="M12 21s-6-5.6-6-10.2a6 6 0 1 1 12 0C18 15.4 12 21 12 21z"/><circle class="gold" cx="12" cy="10.6" r="2.2"/><path d="M3 21h18"/>',
    yen: '<circle class="gold" cx="12" cy="7" r="4"/><path class="gold" d="M10.4 5.4 12 7.3l1.6-1.9M12 7.3v2.2M10.6 8.2h2.8"/><path d="M4 20c2-3 4.5-4 8-4h3.5a1.5 1.5 0 0 1 0 3H12M4 15.5c1.4-.9 2.8-1.3 4.5-1.3"/>',
    card: '<rect x="3" y="6" width="15" height="11" rx="1.6"/><path d="M3 9.5h15M6 13.5h4"/><circle class="gold" cx="18" cy="16" r="3.4"/><path class="gold" d="M16.9 14.8 18 16.1l1.1-1.3M18 16.1v1.6"/>',
    bag: '<path d="M9 6.5 8 3.6h8l-1 2.9M8.6 6.5h6.8M8.6 6.5C5.4 9 4 12.2 4 15.2 4 19 7.4 21 12 21s8-2 8-5.8c0-3-1.4-6.2-4.6-8.7"/><path class="gold" d="M10.4 11.4 12 13.3l1.6-1.9M12 13.3v3.2M10.5 14.6h3"/>',
    laptop: '<rect x="4" y="5" width="16" height="10.5" rx="1"/><path d="M2 18.8h20l-1.4-3.3H3.4z"/><path class="gold" d="M10.2 8 12 10.2 13.8 8M12 10.2v3M10.4 11.3h3.2"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.4"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7M12 14.2v2.6"/>',
    note: '<rect x="4" y="4" width="13" height="16" rx="1.2"/><path d="M7 8.5h7M7 12h7M7 15.5h4"/><path class="gold" d="m15 16.2 5.4-7.6 1.6 1.2-5.4 7.6-2.1.9z"/>',
    chart: '<path d="M4 20h16M6 20v-5M10 20v-8M14 20v-6M18 20v-10"/><path class="gold" d="m5 11 4.5-4 3.5 2.5L19 4.5M15.6 4.5H19v3.2"/>',
    question: '<circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.4a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.2 1-1.2 1.9v.6"/><circle cx="12" cy="17.2" r=".6"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="1.8"/><path d="M10.5 5h3M12 18.6h.01"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.2 15.2 5 5"/>',
    shop: '<path d="M3.5 9.5 5 4.5h14l1.5 5M4 9.5h16v1a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0 2.7 2.7 0 0 1-5.3 0zM5 12.4V20h14v-7.6M10 20v-4.6h4V20"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="1.4"/><path d="m3.5 6.5 8.5 7 8.5-7"/>',
    tel: '<path d="M5.5 4h3.6l1.6 4.3-2.2 1.5a11.4 11.4 0 0 0 5.7 5.7l1.5-2.2L20 15v3.6a1.5 1.5 0 0 1-1.6 1.4C10.6 19.4 4.6 13.4 4 5.6A1.5 1.5 0 0 1 5.5 4z"/>',
    top: '<path d="m6 13 6-6 6 6M6 18l6-6 6 6"/>',
    check: '<path d="M12 3v2.2M4 12h2.2"/><circle class="gold" cx="15" cy="9" r="5"/>',
    seed: '<path d="M12 20v-8M12 12c0-3.5 2.5-6 6.5-6 0 3.8-2.5 6-6.5 6zM12 14c0-2.8-2-4.8-5.5-4.8 0 3 2 4.8 5.5 4.8z"/><path class="gold" d="M5 20h14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    hand: '<path d="M3 14.5h3.5l3.5 2h5a1.6 1.6 0 0 0 0-3.2h-3.6M6.5 14.5l2.6-2.4c1-.8 2-1 3.2-1H14"/><path class="gold" d="M14.5 8.4a2.6 2.6 0 1 0 0-.1zM17.5 5.2a2.6 2.6 0 1 0 0-.1z"/>',
  };
  const icon = (n, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  window.ibIcon = icon;

  const fill = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; return el; };

  // Leaves are redrawn at the same position and size as the 4 original SVGs (dark green, mid green, light green, yellow dotted berry)
  const DOTS = '<pattern id="ib-dots" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="2" cy="2" r="1.6" fill="var(--site-gold)" fill-opacity=".38"/></pattern>';
  const bgHTML = `
    <div class="ib-bg" aria-hidden="true" data-slot="backdrop">
      <div class="ib-bg__arch"><svg viewBox="0 0 1440 520" preserveAspectRatio="none"><path d="M0 0H1440V150C1100 138 770 168 560 228 330 296 150 392 0 512Z" fill="var(--kf-accent)"/></svg></div>
      <div class="ib-bg__leaves"><svg viewBox="0 0 528 452">
        <path d="M18 156C70 104 160 96 250 104 330 110 390 112 430 120L430 290C340 300 250 286 170 250 110 222 50 196 18 156Z" fill="var(--site-leaf-light)"/>
        <path d="M108 42C190 30 280 62 340 120 380 158 400 200 420 250L420 300C380 240 330 190 260 160 200 134 150 96 108 42Z" fill="var(--site-leaf-mid)"/>
        <path d="M318 0C300 70 304 170 340 250 360 296 392 340 430 380L528 380 528 0Z" fill="var(--site-leaf-dark)"/>
        <path d="M296 278C330 262 380 262 420 278L430 300 430 372C390 360 350 330 320 306 306 296 298 288 296 278Z" fill="var(--site-leaf-dark)"/>
      </svg></div>
    </div>
    <div class="ib-fruit" aria-hidden="true"><svg viewBox="0 0 377 356"><defs>${DOTS}</defs><path d="M39 169C90 92 150 22 262 22 340 24 377 100 372 182 366 270 300 330 230 320 160 310 118 222 39 169Z" fill="var(--site-yellow)"/><path d="M39 169C90 92 150 22 262 22 340 24 377 100 372 182 366 270 300 330 230 320 160 310 118 222 39 169Z" fill="url(#ib-dots)"/><path d="M296 38C330 18 372 22 400 42L400 150C366 128 326 92 296 38Z" fill="var(--site-leaf-dark)"/></svg></div>`;

  const SUBNAVS = {
    save: [["Deposit products", ["Combined Account", "Fixed Deposit", "Savings · recurring · installment savings", "Savings Deposit", ["Others", "save-etc"]]], ["Asset management", ["Brokerage account · bonds ·<br>Investment trusts, etc.<br>(Brokerage work)", "Foreign Currency Deposit", "Life event support"]]],
    borrow: [["Loan products", ["Home Loan", "Remodel loan", "Auto loan", "Education Loan", "Free loan", "Card Loan"]]],
    prepare: [["Coverage · Inheritance", ["Life insurance", "Personal pension", "Inheritance procedure guide", "Testamentary trust", "Family Trust"]]],
    useful: [["Convenient service", ["Bank app", "Internet banking", "Debit Card", "Credit Card", "Electronic payment", "Currency exchange·Transfer"]]],
    biz: [["Corporate clients", ["Fundraising", "Streamlining work", "Business support", "Overseas trade", "Corporate internet banking"]]],
    ir: [["Corporate · IR info", ["Company info", "Financial Info", "Stock-related info", "IR library", "Sustainable management"]]],
  };
  const SUB3 = { "save-etc": [["Other deposits", ["Regular deposit", "Savings deposit", "Fixed-term deposit with a set maturity date", "Variable-rate term deposit", "Rewards fixed deposit"]]] };

  const subnavHTML = (id, groups) => `<div class="ib-subnav" id="sub-${id}">${groups.map(([h, items]) => `<p class="ib-subnav__h">${h}</p><ul>${items.map((it) => Array.isArray(it)
    ? `<li><span>${it[0]}</span><a class="ib-burger" role="button" tabindex="0" data-sub3="${it[1]}" aria-label="${it[0]} Unfold"><span class="ib-burger__bg"></span><span class="ib-burger__body"><span></span><span></span><span></span></span></a></li>`
    : `<li><a href="product.html">${it}</a><span class="ib-arrow"></span></li>`).join("")}</ul>`).join("")}</div>`;

  const burger = (key, label) => `<a class="ib-burger" role="button" tabindex="0" data-sub="${key}" aria-label="${label} Unfold"><span class="ib-burger__bg"></span><span class="ib-burger__body"><span></span><span></span><span></span></span></a>`;

  const navHTML = `
    <nav class="ib-nav" aria-label="Main menu">
      <div class="ib-nav__card">
        <p class="ib-logo"><a href="index.html">${icon("emblem")}<span>Bank here</span></a></p>
        <div class="ib-gnav">
          <ul>
            <li class="is-link"><a href="index.html">Individual Customer</a><span class="ib-arrow"></span></li>
            <li><a href="product.html">Save · Grow</a>${burger("save", "Save · Grow")}</li>
            <li><a href="product.html">Borrowing</a>${burger("borrow", "Borrowing")}</li>
            <li><a href="product.html">Preparing · Passing down</a>${burger("prepare", "Preparing · Passing down")}</li>
            <li><a href="product.html">Easy to use</a>${burger("useful", "Easy to use")}</li>
          </ul>
          <div class="ib-gnav__sep"></div>
          <ul class="is-small">
            <li><a href="service.html">Corporate clients</a>${burger("biz", "Corporate clients")}</li>
            <li><a href="about.html">Corporate · IR info</a>${burger("ir", "Corporate · IR info")}</li>
            <li class="is-link"><a href="recruit.html">Hiring Info</a><span class="ib-arrow"></span></li>
          </ul>
        </div>
        <div class="ib-quick">
          <a class="ib-quick__atm" href="product.html">${icon("pin")}<span>Branches · ATM</span></a>
          <a class="ib-quick__rate" href="product.html">${icon("yen")}<span>Interest · Exchange rates</span></a>
          <a class="ib-quick__fee" href="product.html">${icon("card")}<span>Various fees</span></a>
          <a class="ib-quick__fund" role="button" tabindex="0" data-modal="fund">${icon("bag")}<span>Fund search</span></a>
        </div>
      </div>
      <div class="ib-sub ib-sub--2"><div class="ib-sub__inner">${Object.entries(SUBNAVS).map(([k, g]) => subnavHTML(k, g)).join("")}</div></div>
      <div class="ib-sub ib-sub--3"><div class="ib-sub__inner">${Object.entries(SUB3).map(([k, g]) => subnavHTML(k, g)).join("")}</div></div>
    </nav>
    <div class="ib-overlay"></div>`;

  const topHTML = `
    <div class="ib-open">${icon("seed")}<span style="color:var(--kf-ink-soft)">Open account</span><a href="index.html">Individual Customer</a><a href="service.html">Corporate clients</a></div>
    <div class="ib-tools">
      <a class="ib-pill ib-pill--en" href="about.html"><span>English</span></a>
      <a class="ib-pill ib-pill--faq" href="news.html"><span>Frequently asked questions</span></a>
      <div class="ib-size">Font size<div class="ib-size__sw"><a class="ib-size__btn ib-size__btn--normal is-on" role="button" tabindex="0" data-size="normal">Regular</a><a class="ib-size__btn ib-size__btn--large" role="button" tabindex="0" data-size="large">Large</a></div></div>
      <form class="ib-search" role="search" onsubmit="return false"><input type="search" placeholder="Site Search" aria-label="Site Search"><button class="ib-search__btn" type="submit" aria-label="Search">${icon("search")}</button></form>
      <div class="ib-members">
        <a class="ib-ibank" role="button" tabindex="0">${icon("laptop")}<span>Internet banking</span></a>
        <div class="ib-popmenu__veil"></div>
        <div class="ib-popmenu">
          <div class="ib-popmenu__blk"><h4>Individual Customer</h4><div class="ib-wordmark">${icon("laptop")}<span>Internet banking</span></div><a class="ib-btn" href="product.html">${icon("lock")}<span>Log in</span></a></div>
          <div class="ib-popmenu__blk is-biz"><h4>Corporate clients</h4><div class="ib-wordmark"><span>Business portal</span><i>/</i><span>Biz Web</span></div><a class="ib-btn ib-btn--aqua" href="product.html">${icon("lock")}<span>Log in</span></a></div>
        </div>
      </div>
    </div>`;

  const spheadHTML = `<header class="ib-sphead" data-slot="sp-header"><p class="ib-logo"><a href="index.html">${icon("emblem")}<span>Bank here</span></a></p><button class="ib-sphead__btn" type="button" aria-label="Menu"><span></span><span></span></button></header>
    <div class="ib-spnav" data-slot="sp-menu"><div class="ib-spnav__bg"></div><div class="ib-spnav__body">
      <div class="ib-sptabs"><button type="button" class="is-on">Menu</button><button type="button">Four<br>Banking</button><button type="button">Branches · ATM</button><button type="button">Open account</button></div>
      <div class="ib-spmenu">
        <div class="ib-spmenu__quick"><span>Interest · Exchange rates</span><span>Various fees</span><span>Fund search</span></div>
        <ul class="is-main">
          <li><a href="index.html">Individual Customer</a><span class="ib-arrow"></span></li>
          ${["Collect · Grow: save", "Borrow:borrow", "Prepare and pass on:prepare", "Handy to use: useful"].map((s) => { const [t, k] = s.split(":"); return `<li><span>${t}</span><button class="ib-lines" type="button" data-spsub="${k}" aria-label="${t} Unfold"><i></i><i></i><i></i></button></li>`; }).join("")}
          <li class="is-sm"><a href="service.html">Corporate clients</a><button class="ib-lines" type="button" data-spsub="biz" aria-label="Expand corporate clients"><i></i><i></i><i></i></button></li>
          <li class="is-sm"><a href="about.html">Corporate · IR info</a><button class="ib-lines" type="button" data-spsub="ir" aria-label="Expand Corporate · IR info"><i></i><i></i><i></i></button></li>
          <li><a href="recruit.html">Hiring Info</a><span class="ib-arrow"></span></li>
        </ul>
        ${Object.entries(SUBNAVS).map(([k, g]) => `<div class="ib-spsub" id="spsub-${k}"><div class="ib-spsub__head"><button class="ib-spsub__back" type="button" aria-label="Back"></button>${{ save: "Save · Grow", borrow: "Borrowing", prepare: "Preparing · Passing down", useful: "Easy to use", biz: "Corporate clients", ir: "Corporate · IR info" }[k]}</div>${g.map(([h, items]) => `<h5>${h}</h5><ul>${items.map((it) => `<li><span>${Array.isArray(it) ? it[0] : it}</span><span class="ib-arrow"></span></li>`).join("")}</ul>`).join("")}</div>`).join("")}
      </div>
      <form class="ib-spsearch" onsubmit="return false"><input type="search" placeholder="Site Search" aria-label="Site Search"><button type="submit" aria-label="Search">${icon("search")}</button></form>
      <a class="ib-spnav__btn" href="product.html">${icon("question")}Frequently asked questions</a>
      <a class="ib-spnav__btn" href="product.html">English</a>
    </div></div>`;

  const footHTML = `
    <div class="ib-pagetop" data-slot="page-top"><a href="#top">${icon("top")}TOP</a></div>
    <footer class="ib-footer" data-slot="footer"><div class="ib-footer__in">
      <ul class="ib-codes"><li>Financial institution code : 0000</li><li>SWIFT code : XXXXXXXX</li><li>Securities code: 0000</li></ul>
      <div class="ib-fnav"><a href="product.html"><span class="ib-arrow ib-arrow--lg"></span><span>Ad Gallery</span></a><a href="product.html"><span class="ib-arrow ib-arrow--lg"></span><span>Regulation list</span></a><a href="product.html"><span class="ib-arrow ib-arrow--lg"></span><span>Group company</span></a><a href="product.html"><span class="ib-arrow ib-arrow--lg"></span><span>Sitemap</span></a></div>
      <div class="ib-flinks">${["Site usage guide", "Customer-First Operations Policy", "Our solicitation policy", "Anti-money laundering policy", "Policy on responding to antisocial groups", "Best execution policy", "Regular deposit terms guide", "Privacy policy", "Policy on handling specific personal information", "Corporate information sharing notice", "Deposit insurance system guide", "Dormant deposit usage guide", "Member credit information agency notice", "Conflict of interest management policy", "Electronic payment provider integration", "Financial dispute resolution system", "Customer harassment response policy", "Basic cybersecurity policy", "Bank agency service guide", "AI policy"].map((t) => `<a href="product.html">${t}</a>`).join("")}</div>
    </div></footer>
    <div class="ib-copy">COPYRIGHT © THE BANK OF HERE. ALL RIGHTS RESERVED.</div>
    <a class="ib-bnr" href="product.html" data-slot="fixed-banner"><span class="ib-bnr__logo" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="ib-bnr__text">Instantly on the web or app!<br><mark>Brand Bank card loans</mark></span><span class="ib-bnr__btn"><span>Apply here</span><span class="ib-arrow"></span></span></a>
    <a class="ib-chat" href="product.html" aria-label="Ask via chat" data-slot="chat-button"><span class="ib-chat__pill">By chat<br>Question</span><svg viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="30" cy="34" rx="22" ry="20" fill="var(--site-yellow)"/><path d="M14 20 10 8l12 8M46 20l4-12-12 8" fill="var(--site-yellow)"/><circle cx="23" cy="32" r="2.4" fill="var(--kf-ink-soft)"/><circle cx="37" cy="32" r="2.4" fill="var(--kf-ink-soft)"/><path d="M26 40q4 3 8 0" stroke="var(--kf-ink-soft)" stroke-width="2" fill="none" stroke-linecap="round"/></svg></a>
    <div class="ib-modal" id="modal-fund" role="dialog" aria-modal="true" aria-label="Go to external site"><div class="ib-modal__veil" data-close></div><div class="ib-modal__box"><h3>Opens an external site</h3><p>Your two lines saying the user will be taken to an external site go here.<br>Please check the address that opens before moving on.</p><div class="ib-modal__url">https://example.com/fund/search</div><a class="ib-btn" href="product.html"><span>Go to</span><span class="ib-arrow ib-arrow--white"></span></a><button class="ib-modal__close" type="button" data-close>Close</button></div></div>`;

  const rcNav = [["MESSAGE", "A Message to Share", ["Recruiter message"]], ["STRATEGY", "Our Strategy", ["Value creation process", "STORY 01 : Sustainability", "STORY 02 : Local circulation", "STORY 03 : Business succession", "STORY 04 : Digital", "STORY 05 : Public-private partnership", "STORY 06 : Asset consulting"]], ["PEOPLE&WORKS", "Bank staff and work", ["Branch: loans desk", "Branch: loans desk", "Branch: deposits desk", "Division: System development", "HQ: Sales Strategy", "HQ: Securities", "HQ: New Business", "Group company : Consulting", "HQ: Investment Operations"]], ["CULTURE", "Corporate culture · ethos", ["New banker roundtable", "Parental Leave Roundtable"]], ["ABOUT", "About us", ["Company overview", "Sustainable management", "Talent Development", "Diversity"]], ["RECRUIT", "Hiring Info", ["Application guidelines", "Hiring Schedule", "Internship info", "FAQ"]]];
  const rcHeadHTML = `
    <header class="rc-head" data-slot="recruit-header">
      <a class="rc-head__logo" href="recruit.html"><b>${icon("emblem")}<span>Bank here</span></b><small>Recruiting Information</small></a>
      <div class="rc-head__band"><a class="rc-head__btn is-entry" href="product.html">ENTRY<br>2027</a><a class="rc-head__btn is-mypage" href="product.html">MYPAGE<br>2027</a><button class="rc-burger" type="button" aria-label="Menu"><span></span><span></span><span></span></button></div>
    </header>
    <nav class="rc-glnav" data-slot="recruit-menu"><ul class="rc-glnav__list">${rcNav.map(([en, ko, items]) => `<li><h4>${en}<small>${ko}</small></h4><ul>${items.map((t, i) => `<li><a href="${en === "MESSAGE" ? "recruit-message.html" : "recruit.html"}">${t}</a></li>`).join("")}</ul></li>`).join("")}</ul></nav>`;
  const rcFootHTML = `
    <a class="rc-pagetop" href="#top" data-slot="page-top"><i></i>TOP</a>
    <footer class="rc-foot" data-slot="recruit-footer">
      <div class="rc-foot__nav">${rcNav.map(([en, ko, items]) => `<div><h3>${en}<small>${ko}</small></h3><ul>${items.map((t) => `<li><a href="${en === "MESSAGE" ? "recruit-message.html" : "recruit.html"}">${t}</a></li>`).join("")}</ul></div>`).join("")}</div>
      <div class="rc-foot__bottom"><div class="rc-foot__logo">${icon("emblem")}<span>Bank here</span></div><p class="rc-foot__copy">COPYRIGHT © THE BANK OF HERE. ALL RIGHTS RESERVED.</p><a class="rc-intern" href="product.html"><span class="rc-intern__top">Internship</span><span class="rc-intern__bot">Expected graduates of 20XX</span></a></div>
    </footer>`;

  if (!body.id) body.id = "top";

  if (isRecruit) {
    body.insertAdjacentHTML("afterbegin", rcHeadHTML);
    body.insertAdjacentHTML("beforeend", rcFootHTML);
  } else {
    body.insertAdjacentHTML("afterbegin", bgHTML + spheadHTML);
    fill("[data-slot='side-nav']", navHTML);
    fill("[data-slot='top-tools']", topHTML);
    body.insertAdjacentHTML("beforeend", footHTML);
  }

  // ── Bank Panel ──
  if (!isRecruit) {
    document.addEventListener("keydown", (e) => { const a = e.target.closest?.('a[role="button"]'); if (a && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); a.click(); } });
    // After scrolling down more than 100px the arch, leaves and fruit fold upward (original scroll event >= 100)
    const tuck = () => root.classList.toggle("is-tucked", scrollY >= 100);
    addEventListener("scroll", tuck, { passive: true });
    tuck();

    // Side menu levels 2 and 3 — original order: cover + panel unfold (0.3s) → once the panel is fully open, lines up the list. When switching, old lines are withdrawn first (first line 0.175s), then new lines.
    const nav = document.querySelector(".ib-nav");
    if (nav) {
      const PANEL = reduce ? 0 : 300, SWAP = reduce ? 0 : 175, FADE = reduce ? 0 : 200;
      const overlay = document.querySelector(".ib-overlay");
      let cur = null, cur3 = null, timers = [];
      const later = (fn, ms) => timers.push(setTimeout(fn, ms));
      const clearT = () => { timers.forEach(clearTimeout); timers = []; };
      // Original jQuery show(10): expand the hidden list from width · height · opacity 0 over 10ms, then line the items up
      const show = (el) => {
        el.style.opacity = "";
        el.classList.add("is-on");
        if (window.gsap && !reduce) gsap.from(el, { width: 0, height: 0, opacity: 0, duration: 0.01, ease: "sine.inOut", clearProps: "width,height,opacity", onComplete: () => el.classList.add("is-lineup") });
        else requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-lineup")));
      };
      const hide = (el) => { el.classList.remove("is-lineup", "is-on"); el.style.opacity = ""; };
      const markBtn = (btn, on) => btn && btn.classList.toggle("is-arrow", on);
      const close3 = () => {
        if (!cur3) return;
        const el = document.getElementById("sub-" + cur3.dataset.sub3);
        el.classList.remove("is-lineup");
        markBtn(cur3, false);
        nav.classList.remove("is-sub3");
        later(() => hide(el), SWAP);
        cur3 = null;
      };
      const open = (btn) => {
        const key = btn.dataset.sub;
        if (cur === btn) return;
        clearT();
        const el = document.getElementById("sub-" + key);
        if (!nav.classList.contains("is-sub")) {
          nav.classList.add("is-sub");
          overlay?.classList.add("is-on");
          later(() => show(el), PANEL);
        } else {
          const old = document.getElementById("sub-" + cur.dataset.sub);
          old.classList.remove("is-lineup");
          close3();
          later(() => { hide(old); show(el); }, SWAP);
        }
        markBtn(cur, false);
        markBtn(btn, true);
        cur = btn;
      };
      const open3 = (btn) => {
        if (cur3 === btn) return;
        const el = document.getElementById("sub-" + btn.dataset.sub3);
        if (!nav.classList.contains("is-sub3")) {
          nav.classList.add("is-sub3");
          later(() => show(el), PANEL);
        }
        markBtn(cur3, false);
        markBtn(btn, true);
        cur3 = btn;
      };
      const closeAll = () => {
        if (!cur) return;
        clearT();
        const els = [...nav.querySelectorAll(".ib-subnav.is-on")];
        els.forEach((el) => window.gsap ? gsap.to(el, { opacity: 0, duration: FADE / 1000, ease: "sine.inOut" }) : (el.style.opacity = 0));
        later(() => {
          els.forEach(hide);
          nav.classList.remove("is-sub", "is-sub3");
          overlay?.classList.remove("is-on");
          markBtn(cur, false); markBtn(cur3, false);
          cur = cur3 = null;
        }, FADE);
      };
      nav.addEventListener("click", (e) => {
        const b2 = e.target.closest("[data-sub]");
        const b3 = e.target.closest("[data-sub3]");
        if (b2) open(b2);
        if (b3) open3(b3);
      });
      overlay?.addEventListener("click", closeAll);
      addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
    }

    // Internet banking expanding panel
    document.querySelectorAll(".ib-members").forEach((m) => {
      m.querySelector(".ib-ibank").addEventListener("click", () => m.classList.toggle("is-open"));
      m.querySelector(".ib-popmenu__veil").addEventListener("click", () => m.classList.remove("is-open"));
    });

    // Text size normal · large
    document.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll("[data-size]").forEach((x) => x.classList.toggle("is-on", x === b));
      root.classList.toggle("is-large", b.dataset.size === "large");
    }));

    // Confirm window
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-modal]");
      if (t) {
        e.preventDefault();
        const m = document.getElementById("modal-" + t.dataset.modal);
        if (m) { m.classList.add("is-shown"); requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add("is-open"))); }
        return;
      }
      if (e.target.closest("[data-close]")) {
        const m = e.target.closest(".ib-modal");
        m.classList.remove("is-open");
        setTimeout(() => m.classList.remove("is-shown"), reduce ? 0 : 600);
      }
    });

    // Phone menu — once the green curtain has fully covered in 0.3s, tabs and cards drop in over 0.5s. On close they vanish in 0.3s.
    const spBtn = document.querySelector(".ib-sphead__btn");
    const spnav = document.querySelector(".ib-spnav");
    if (spBtn && spnav) {
      let t;
      spBtn.addEventListener("click", () => {
        clearTimeout(t);
        if (!root.classList.contains("is-spnav")) {
          root.classList.add("is-spnav");
          t = setTimeout(() => root.classList.add("is-spnav-in"), reduce ? 0 : 300);
        } else if (window.gsap && !reduce) {
          gsap.to(spnav, { opacity: 0, duration: 0.3, ease: "sine.inOut", onComplete: () => { root.classList.remove("is-spnav", "is-spnav-in"); gsap.set(spnav, { clearProps: "opacity" }); spnav.querySelectorAll(".ib-spsub.is-on").forEach((s) => s.classList.remove("is-on")); } });
        } else {
          root.classList.remove("is-spnav", "is-spnav-in");
        }
      });
      spnav.querySelectorAll(".ib-sptabs button").forEach((b, i, all) => b.addEventListener("click", () => all.forEach((x) => x.classList.toggle("is-on", x === b))));
      spnav.addEventListener("click", (e) => {
        const s = e.target.closest("[data-spsub]");
        if (s) document.getElementById("spsub-" + s.dataset.spsub)?.classList.add("is-on");
        if (e.target.closest(".ib-spsub__back")) e.target.closest(".ib-spsub").classList.remove("is-on");
      });
    }

    // Swiper — original settings as-is (loop·1000ms·5s auto·desktop 3 slides 15px / phone 1 slide 15px)
    if (window.Swiper) {
      document.querySelectorAll("[data-swiper]").forEach((box) => {
        const el = box.querySelector(".swiper");
        if (!el || el.querySelectorAll(".swiper-slide").length < 2) return;
        const kind = box.dataset.swiper;
        const opts = {
          loop: true,
          speed: 1000,
          autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
          pagination: { el: box.querySelector(".ib-pager"), clickable: true },
        };
        if (kind === "kv") Object.assign(opts, { slidesPerView: 1, breakpoints: { 0: { spaceBetween: 0 }, 1025: { spaceBetween: 10 } } });
        else Object.assign(opts, {
          navigation: { nextEl: box.querySelector(".ib-navarrow--next"), prevEl: box.querySelector(".ib-navarrow--prev") },
          breakpoints: { 0: { slidesPerView: 1, spaceBetween: 15 }, 1025: { slidesPerView: 3, spaceBetween: 15 } },
        });
        new Swiper(el, opts);
      });
    }
  }

  // ── Careers plane ── original intl.js: menu fadeIn/Out 500ms, TOP fades in past 500px, anchor 800ms easeOutCubic, ScrollTrigger.batch reveal
  if (isRecruit) {
    const hb = document.querySelector(".rc-burger");
    const gl = document.querySelector(".rc-glnav");
    // swing easing of jQuery fadeIn/fadeOut = sine.inOut. Continues from the current opacity
    const fade = (el, show, ms) => {
      if (!el) return;
      if (!window.gsap || reduce) { el.style.display = show ? "block" : "none"; return; }
      gsap.killTweensOf(el);
      if (show) {
        if (getComputedStyle(el).display === "none") { el.style.display = "block"; gsap.set(el, { opacity: 0 }); }
        gsap.to(el, { opacity: 1, duration: ms / 1000, ease: "sine.inOut" });
      } else gsap.to(el, { opacity: 0, duration: ms / 1000, ease: "sine.inOut", onComplete: () => { el.style.display = "none"; } });
    };
    hb?.addEventListener("click", () => { const open = !hb.classList.contains("is-open"); hb.classList.toggle("is-open", open); fade(gl, open, 500); });
    gl?.querySelectorAll("h4").forEach((h) => h.addEventListener("click", () => {
      if (!matchMedia("(max-width: 1024px)").matches) return;
      const ul = h.nextElementSibling;
      const open = ul.style.display !== "block";
      if (window.gsap && !reduce) { if (open) { ul.style.display = "block"; gsap.from(ul, { height: 0, duration: 0.4, ease: "sine.inOut", clearProps: "height" }); } else gsap.to(ul, { height: 0, duration: 0.4, ease: "sine.inOut", onComplete: () => { ul.style.display = "none"; ul.style.height = ""; } }); }
      else ul.style.display = open ? "block" : "none";
    }));
    const pt = document.querySelector(".rc-pagetop");
    let ptOn = false;
    const onScroll = () => { const on = scrollY > 500; if (on !== ptOn) { ptOn = on; fade(pt, on, 400); } };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute("href");
      const target = id === "#" || id === "#top" ? 0 : document.querySelector(id);
      const y = target === 0 ? 0 : target ? target.getBoundingClientRect().top + scrollY : 0;
      if (hb?.classList.contains("is-open")) { hb.classList.remove("is-open"); fade(gl, false, 500); }
      if (window.gsap && !reduce) { const o = { y: scrollY }; gsap.to(o, { y, duration: 0.8, ease: "power2.out", onUpdate: () => scrollTo(0, o.y) }); } else scrollTo(0, y);
    });

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const batch = (sel, from, to, stagger) => {
          const els = gsap.utils.toArray(sel);
          if (!els.length) return;
          gsap.set(els, from);
          ScrollTrigger.batch(els, { start: "top 80%", once: true, onEnter: (b) => gsap.to(b, { ...to, duration: 1, ease: "power3.out", stagger }) });
        };
        batch(".fadeIn", { opacity: 0 }, { opacity: 1 });
        batch(".fadeInUp", { opacity: 0, y: 50 }, { opacity: 1, y: 0 });
        batch(".fadeInUpStg .fiStg", { opacity: 0, y: 50 }, { opacity: 1, y: 0 }, 0.1);
        batch(".fadeInUpStg_clt > *", { opacity: 0, y: 50 }, { opacity: 1, y: 0 }, 0.05);
        batch(".slideLeft", { opacity: 0, clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" }, { opacity: 1, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
        batch(".slideRight", { opacity: 0, clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }, { opacity: 1, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
      });
    }
  }
})();
