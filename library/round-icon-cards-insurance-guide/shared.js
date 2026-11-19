// Plug in once here so all four pages share the same header · drawer · closing band · footer · icons.
// Interaction uses the same jQuery as the original — drawer backdrop fadeIn/fadeOut (300, swing), accordion slideToggle(300), anchor scroll animate(300, swing).
(() => {
  const page = document.body.dataset.page || "home";
  const SPEED = 300, EASING = "swing";

  // Icons — the original uses PNG·SVG art. Redrawn at the same position, size and texture (navy lines · yellow fills · sky fills)
  const sprite = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
  <symbol id="jh-calc" viewBox="0 0 17 23"><rect x="1" y="1" width="15" height="21" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="4" y="4" width="9" height="4" rx="1" fill="currentColor"/><g fill="currentColor"><circle cx="5" cy="12" r="1.3"/><circle cx="8.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="5" cy="15.5" r="1.3"/><circle cx="8.5" cy="15.5" r="1.3"/><circle cx="12" cy="15.5" r="1.3"/><circle cx="5" cy="19" r="1.3"/><circle cx="8.5" cy="19" r="1.3"/><circle cx="12" cy="19" r="1.3"/></g></symbol>
  <symbol id="jh-shield" viewBox="0 0 100 100"><path d="M50 8 84 20v28c0 22-15 36-34 44C31 84 16 70 16 48V20z" fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linejoin="round"/><path d="M33 56 50 41l17 15v16H33z" fill="var(--kf-bg)" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linejoin="round"/><path d="M44 72V61h12v11" fill="none" stroke="var(--kf-accent-text)" stroke-width="3"/><path d="M34 30q4-4 0-8M42 30q4-4 0-8M50 30q4-4 0-8" fill="none" stroke="var(--kf-accent)" stroke-width="2.4" stroke-linecap="round"/></symbol>
  <symbol id="jh-coins" viewBox="0 0 100 100"><g fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="3"><ellipse cx="44" cy="70" rx="26" ry="9"/><path d="M18 70v-10c0 5 12 9 26 9s26-4 26-9v10"/><path d="M18 60V50c0 5 12 9 26 9s26-4 26-9v10"/><path d="M18 50V40c0 5 12 9 26 9s26-4 26-9v10"/><ellipse cx="44" cy="30" rx="26" ry="9"/></g><path d="M36 26l8 8 8-8M44 34v8" fill="none" stroke="var(--kf-accent)" stroke-width="2.4" stroke-linecap="round"/><path d="M64 78 78 64l14 14v14H64z" fill="var(--kf-bg)" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linejoin="round"/></symbol>
  <symbol id="jh-clip" viewBox="0 0 100 100"><rect x="22" y="14" width="56" height="76" rx="4" fill="var(--kf-bg)" stroke="var(--kf-accent-text)" stroke-width="3"/><rect x="38" y="8" width="24" height="12" rx="3" fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="3"/><g stroke="var(--kf-accent-text)" stroke-width="3" fill="none" stroke-linecap="round"><path d="M32 36l4 4 7-7M32 54l4 4 7-7M32 72l4 4 7-7"/><path d="M50 38h18M50 56h18M50 74h12"/></g><path d="M86 46 64 84l-6 4 1-7 22-38z" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="2.6" stroke-linejoin="round"/></symbol>
  <symbol id="jh-house" viewBox="0 0 100 100"><path d="M12 50 50 18l38 32" fill="none" stroke="var(--kf-accent-text)" stroke-width="3.4" stroke-linejoin="round"/><path d="M22 44v42h56V44L50 22z" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linejoin="round"/><rect x="42" y="62" width="16" height="24" fill="var(--kf-bg)" stroke="var(--kf-accent-text)" stroke-width="3"/><path d="M80 14v10M75 19h10M88 30v6M85 33h6" stroke="var(--kf-accent)" stroke-width="2.4" stroke-linecap="round"/></symbol>
  <symbol id="jh-sofa" viewBox="0 0 100 100"><rect x="14" y="44" width="54" height="22" rx="4" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="3"/><rect x="10" y="54" width="62" height="18" rx="4" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="3"/><path d="M16 72v8M66 72v8" stroke="var(--kf-accent-text)" stroke-width="3"/><rect x="76" y="46" width="16" height="34" rx="2" fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="3"/><path d="M76 58h16M76 69h16" stroke="var(--kf-accent-text)" stroke-width="2.4"/><path d="M84 24v18M78 24h12l-3-8h-6z" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="2.6" stroke-linejoin="round"/><circle cx="26" cy="22" r="8" fill="var(--kf-bg)" stroke="var(--kf-accent-text)" stroke-width="2.6"/><path d="M26 18v4l3 2" stroke="var(--kf-accent-text)" stroke-width="2" fill="none"/></symbol>
  <symbol id="jh-rent" viewBox="0 0 100 100"><path d="M18 46h64v40H18z" fill="var(--kf-bg)" stroke="var(--kf-accent-text)" stroke-width="3"/><path d="M14 48 50 22l36 26" fill="none" stroke="var(--kf-accent-text)" stroke-width="3.4" stroke-linejoin="round"/><rect x="58" y="8" width="30" height="13" rx="2" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="2.4"/><path d="M73 21v10" stroke="var(--kf-accent-text)" stroke-width="2.4"/><circle cx="34" cy="70" r="14" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="3"/><path d="M28 62l6 8 6-8M34 70v10M29 72h10M29 76h10" stroke="var(--kf-accent-text)" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="58" y="56" width="16" height="30" fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="3"/></symbol>
  <symbol id="jh-target" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="currentColor"/></symbol>
  <symbol id="jh-check" viewBox="0 0 40 40"><path d="M10 21l7 7 14-15" fill="none" stroke="currentColor" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="jh-alert" viewBox="0 0 26 23"><path d="M13 1.5 25 21.5H1z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13 8v6.5" stroke="var(--kf-bg)" stroke-width="2.4" stroke-linecap="round"/><circle cx="13" cy="18" r="1.4" fill="var(--kf-bg)"/></symbol>
  <symbol id="jh-play" viewBox="0 0 60 60"><circle cx="30" cy="30" r="29" fill="var(--kf-bg)" opacity=".92"/><path d="M25 19v22l17-11z" fill="var(--kf-ink)"/></symbol>
  <symbol id="jh-pdf" viewBox="0 0 18 18"><path d="M3 1h8l4 4v12H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M11 1v4h4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M6 10h6M6 13h6" stroke="currentColor" stroke-width="1.4"/></symbol>
  <symbol id="jh-movie" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 6.5v7l5.5-3.5z" fill="currentColor"/></symbol>
  <symbol id="jh-quake" viewBox="0 0 100 100"><path d="M28 54 56 30l28 24v34H28z" fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linejoin="round" transform="rotate(-8 56 60)"/><path d="M50 88V70h12v18" fill="none" stroke="var(--kf-accent-text)" stroke-width="3" transform="rotate(-8 56 60)"/><path d="M10 30q5-5 0-10M18 34q5-5 0-10M14 48q5-5 0-10" fill="none" stroke="var(--kf-accent)" stroke-width="3" stroke-linecap="round"/><path d="M8 92h84" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linecap="round"/><path d="M40 92l6-8 6 8 6-8" fill="none" stroke="var(--kf-accent-text)" stroke-width="2.4"/></symbol>
  <symbol id="jh-volcano" viewBox="0 0 100 100"><path d="M10 90 38 44h24l28 46z" fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linejoin="round"/><path d="M38 44l6 10 6-6 6 6 6-10" fill="none" stroke="var(--kf-accent-text)" stroke-width="2.6" stroke-linejoin="round"/><path d="M50 36c-10 0-16-6-12-12-6-8 6-16 12-10 6-8 20-2 16 8 6 6-2 14-16 14z" fill="var(--kf-bg)" stroke="var(--kf-accent-text)" stroke-width="2.6" stroke-linejoin="round"/><g fill="var(--kf-accent)"><circle cx="26" cy="22" r="3"/><circle cx="76" cy="16" r="3"/><circle cx="82" cy="32" r="2.4"/><circle cx="20" cy="38" r="2.4"/></g></symbol>
  <symbol id="jh-wave" viewBox="0 0 100 100"><path d="M8 90c4-30 20-56 50-58 18-1 30 10 30 22-10-8-24-4-24 8 0 8 8 12 16 10-4 10-14 18-28 18H8z" fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linejoin="round"/><path d="M24 74q10-14 24-16M30 86q12-12 30-12" fill="none" stroke="var(--kf-accent)" stroke-width="2.6" stroke-linecap="round"/><g fill="var(--kf-accent)"><circle cx="70" cy="18" r="3"/><circle cx="82" cy="24" r="2.4"/><circle cx="88" cy="40" r="2.4"/></g></symbol>
  <symbol id="jh-piggy" viewBox="0 0 100 100"><ellipse cx="50" cy="58" rx="32" ry="24" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="3"/><path d="M28 42l-4-12 12 6M38 80v8M62 80v8" fill="none" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linejoin="round"/><circle cx="62" cy="52" r="2.6" fill="var(--kf-accent-text)"/><rect x="44" y="30" width="14" height="4" rx="2" fill="var(--kf-accent-text)"/><circle cx="51" cy="18" r="8" fill="var(--kf-bg)" stroke="var(--kf-accent-text)" stroke-width="2.6"/></symbol>
  <symbol id="jh-loan" viewBox="0 0 100 100"><path d="M18 46 46 22l28 24v40H18z" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="3" stroke-linejoin="round"/><rect x="38" y="62" width="16" height="24" fill="var(--kf-bg)" stroke="var(--kf-accent-text)" stroke-width="3"/><circle cx="76" cy="70" r="16" fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="3"/><path d="M70 62l6 8 6-8M76 70v10M71 72h10M71 76h10" fill="none" stroke="var(--kf-accent-text)" stroke-width="2.2" stroke-linecap="round"/></symbol>
  <symbol id="jh-mascot" viewBox="0 0 120 130">
    <path d="M86 6l4 14M96 10l-6 10M100 18l-10 4" stroke="var(--kf-warning)" stroke-width="3" stroke-linecap="round"/>
    <rect x="80" y="18" width="12" height="12" rx="3" fill="var(--site-pale)" stroke="var(--kf-accent-text)" stroke-width="2"/>
    <path d="M26 58c0-20 16-34 36-34s36 14 36 34c0 26-14 46-36 46-10 0-18-4-24-10l-10 18c-4 6-12 4-10-4l8-22c-2-8 0-18 0-28z" fill="var(--site-cyan)" stroke="var(--kf-accent-text)" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M42 72c8 6 34 6 42 0-2 10-10 16-21 16S44 82 42 72z" fill="var(--kf-warning)" stroke="var(--kf-accent-text)" stroke-width="2.2" stroke-linejoin="round"/>
    <ellipse cx="52" cy="54" rx="5" ry="7" fill="var(--kf-bg)"/><ellipse cx="74" cy="54" rx="5" ry="7" fill="var(--kf-bg)"/>
    <circle cx="53" cy="56" r="3" fill="var(--kf-accent-text)"/><circle cx="73" cy="56" r="3" fill="var(--kf-accent-text)"/>
    <path d="M44 66C30 64 14 70 8 82M82 66c14-2 28 4 32 16" fill="none" stroke="var(--kf-accent-text)" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M76 104c10 6 22 4 26-4 4 8 14 10 16 2" fill="var(--kf-line)" stroke="var(--kf-accent-text)" stroke-width="2" stroke-linejoin="round"/>
  </symbol>
</svg>`;

  const NAV = [
    { href: "about.html", key: "about", label: "What Is Insurance?", sp: ["Start of insurance intro", "Building & Furnishings", "Coverage Details", "Difference from other insurance", "Damage types and insurance payout", "For Apartment Complexes"] },
    { href: "page.html", key: "page", label: "Money for Emergencies", sp: ["The money you need first", "Funds needed", "Damage records", "Double loan risk"] },
    { href: "#", key: "join", label: "How to Join", sp: ["Getting started: how to join", "Membership Requirements", "Insurance company", "Dealer role"] },
    { href: "#", key: "history", label: "Steps of the system", sp: ["The system’s first steps", "How the system came about", "Evolution of the system", "History of Major Earthquakes", "Distribution Status"] },
    { href: "#", key: "faq", label: "Frequently asked questions" },
    { href: "works.html", key: "works", label: "Disaster Prevention Case Collection" },
    { href: "#", key: "ad", label: "Ad Collection" },
  ];

  const logo = (cls) => `
<svg class="${cls}" viewBox="0 0 220 76" role="img" aria-label="Service logo slot">
  <text x="0" y="40" class="jh-logo__main">Your slogan here<tspan class="jh-logo__bang">!</tspan></text>
  <text x="74" y="68" class="jh-logo__sub">Insurance<tspan dx="20">Name</tspan></text>
  <circle cx="114" cy="61" r="8" class="jh-logo__dot"/><path d="M109 61q5 5 10 0" class="jh-logo__smile"/>
</svg>`;

  const header = `
<header class="jh-header" data-slot="header">
  <div class="jh-header__inner">
    <a class="jh-logo jh-alpha" href="index.html" data-label="Logo · two-line rounded gothic slogan (blue gradient on top, yellow exclamation mark) + small service name below">${logo("")}</a>
    <button class="jh-burger js-nav-btn" type="button" aria-label="Open Menu"><span></span><span></span><span></span></button>
    <div class="jh-header__nav">
      <nav class="jh-nav" aria-label="Main menu">${NAV.map((n) => `<a href="${n.href}"${n.key === page ? ' class="is-active"' : ""}><span class="line">${n.label}</span></a>`).join("")}</nav>
      <p class="jh-sim"><a class="jh-alpha" href="#">Insurance premium simulator<svg aria-hidden="true"><use href="#jh-calc"/></svg></a></p>
    </div>
    <nav class="jh-drawer js-nav-content" aria-label="Phone menu">
      <ul>
        <li><a href="index.html">First Page</a></li>
        ${NAV.map((n) => n.sp
          ? `<li><p class="jh-acc js-toggle-trigger">${n.label}</p><ul>${n.sp.map((s, i) => `<li><a href="${i ? "#" : n.href}">${s}</a></li>`).join("")}</ul></li>`
          : `<li><a href="${n.href}">${n.label}</a></li>`).join("")}
        <li><a href="#">Insurance premium simulator</a></li>
      </ul>
      <div class="jh-drawer__aside"><a href="#">Personal data handling notice</a><a href="#">Official social account policy</a></div>
    </nav>
  </div>
</header>
<div class="jh-overlay js-nav-overlay"></div>`;

  const cta = `
<div class="jh-cta" data-slot="cta-band">
  <div class="jh-cta__inner">
    <p class="jh-cta__lead">To protect daily life after an earthquake here,<br><em>Check your premium first</em>Give it a try</p>
    <p class="jh-cta__text">Your one-line call to action here.</p>
    <p class="jh-cta__sim"><a class="jh-alpha" href="#">Calculate with the simulator<svg aria-hidden="true"><use href="#jh-calc"/></svg></a></p>
    <p class="jh-cta__btn"><a class="jh-alpha jh-arw" href="#">View how to join</a></p>
    <div class="jh-cta__img wf-img jh-cutout" data-label="Cut-out photo of a model · apron · smiling while holding up a phone screen · waist up · head pokes out above the band"></div>
  </div>
</div>`;

  const FOOT = [["index.html", "First Page"], ["about.html", "What Is Insurance?"], ["page.html", "Money for Emergencies"], ["#", "How to Join"], ["#", "Ad Collection", "is-last-sp"], ["#", "Steps of the system"], ["#", "Frequently asked questions"], ["works.html", "Disaster Prevention Case Collection"], ["#", "Insurance premium simulator"]];
  const footer = `
<p class="jh-pagetop" data-slot="pagetop"><a class="jh-alpha" href="#top">PAGE TOP<i></i></a></p>
<footer class="jh-footer" data-slot="footer">
  <div class="jh-footer__inner">
    <a class="jh-footer__logo jh-alpha" href="index.html">${logo("")}</a>
    <ul class="jh-footer__nav">${FOOT.map(([h, t, c]) => `<li${c ? ` class="${c}"` : ""}><a class="jh-alpha" href="${h}">${t}<i></i></a></li>`).join("")}</ul>
    <div class="jh-footer__right">
      <div class="jh-footer__boxs">
        <div class="jh-footer__box"><b>Your operating organization name 1 here</b><p>〒000-0000 One line of your address here<br>TEL.00-0000-0000 (Main)</p></div>
        <div class="jh-footer__box"><b>Your operating organization name 2 here</b><p>〒000-0000 One line of your address here<br>Your building name 7F here<br>TEL.00-0000-0000</p></div>
      </div>
      <p class="jh-footer__lead">Add about four lines here noting that the sign-up process may take time. Close by encouraging people to prepare ahead in everyday life.<br><br>Your one line here naming who co-runs the system.</p>
    </div>
    <ul class="jh-footer__sub"><li><a class="jh-alpha" href="#">Personal data handling notice</a></li><li><a class="jh-alpha" href="#">Official social account policy</a></li></ul>
    <p class="jh-footer__copy">Copyright&copy; Association Name of Region. All rights reserved.</p>
  </div>
</footer>`;

  document.body.insertAdjacentHTML("afterbegin", sprite + header);
  document.querySelector("[data-jh-cta]")?.insertAdjacentHTML("beforebegin", cta);
  document.querySelector("[data-jh-cta]")?.remove();
  document.body.querySelector(".jh-wrap")?.insertAdjacentHTML("beforeend", footer);

  const $ = window.jQuery;
  const $win = $(window);
  const headH = () => $(".jh-header").innerHeight();

  // Anchor move — scrolls less by the header height (original funcHashScroll)
  $('a[href="#top"]').on("click", () => { $("body,html").animate({ scrollTop: 0 }, SPEED, EASING); return false; });
  $('a[href^="#"]:not([href="#top"]):not([href="#"])').on("click", function () {
    const $t = $($(this).attr("href"));
    if (!$t.length) return;
    $("body,html").animate({ scrollTop: $t.offset().top - headH() }, SPEED, EASING);
    return false;
  });
  $('a[href="#"]').on("click", (e) => e.preventDefault());

  // Phone drawer
  const $btn = $(".js-nav-btn"), $con = $(".js-nav-content"), $ov = $(".js-nav-overlay");
  const open = () => { $ov.fadeIn(SPEED); $con.addClass("is-open"); $btn.addClass("is-open"); };
  const reset = () => { $ov.fadeOut(SPEED); $con.removeClass("is-open"); $btn.removeClass("is-open"); };
  $btn.on("click", () => { ($con.hasClass("is-open") ? reset : open)(); return false; });
  $ov.on("click", reset);
  $con.find("a").on("click", reset);
  $con.on("click", (e) => e.stopPropagation());

  // Collapsible cell — submenu inside the drawer (slideToggle 300)
  $(".js-toggle-trigger").on("click", function () { $(this).toggleClass("is-active").next().slideToggle(SPEED); });

  // Tabs — only the content at the same index as the clicked cell is shown (switches instantly)
  $(".js-switch-tab").on("click", function () {
    const $list = $(this).closest(".js-switch-tab-list"), i = $list.find(".js-switch-tab").index(this);
    $list.find(".js-switch-tab").removeClass("is-active").eq(i).addClass("is-active");
    $list.next(".js-switch-content-list").find(".js-switch-content").removeClass("is-active").eq(i).addClass("is-active");
  });

  // Table overflowing horizontally — same ScrollHint as the original (a finger icon slides left and right for 1.2s, then disappears)
  if (window.ScrollHint && document.querySelector(".js-scrollable")) new window.ScrollHint(".js-scrollable", { applyToParents: true, i18n: { scrollable: "Slide sideways<br>Take a look" } });

  $win.on("resize", () => { if (innerWidth > 768 && $con.hasClass("is-open")) reset(); });
})();
