// Header, footer and pinned buttons shared by all pages. The markup lives here in one copy and pages only leave empty slots.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Webflow outCirc is the standard easing curve as is, so it matches GSAP circ.out
  const OUT_CIRC = "circ.out";

  const NAV = [
    ["Deposits · Withdrawals", [["Balance Top-up", "service.html"], ["Pay later ‹Deposit now›"], ["For urgent expenses, Quick Cash"], ["Balance Withdrawal"]]],
    ["Payments · Transfers", [["Prepaid card issuance"], ["Send money to a friend"], ["Quick pay 1 setup"], ["Quick pay 2 setup"], ["Quick pay 3 setup"]]],
    ["Reward", [["Point rewards"], ["Point Park"]]],
    ["Money management", [["Real-time budget book"], ["Shared Account"], ["Safety feature"]]],
    ["Corporate clients", [["Corporate remittance service"], ["Inquiry"]]],
    ["Operating company", [["Company About", "about.html"], ["Hiring", "recruit.html"], ["Press release", "news.html"]]],
  ];
  const OTHER = [["Help"], ["Notice"], ["Maintenance · Outages"], ["Campaign", "article.html"]];
  const link = ([t, href = "https://example.com/"]) => `<a class="ky-nav__link" href="${href}"><span>${t}</span></a>`;
  const section = (label, items, other) => `
    <div class="ky-nav__sec${other ? " is-other" : ""}"${other ? "" : ' data-fx="sweep-through-hover" data-fx-sweep-through-hover="look: line; grow: width"'}>
      <div class="ky-nav__label">${label}</div>
      ${other ? '<button class="ky-toggle is-pc" type="button" aria-label="Service guide"><span class="ky-toggle__bars"><i class="ky-toggle__bar is-top"></i><i class="ky-toggle__bar is-mid"></i><i class="ky-toggle__bar is-bottom"></i></span></button>' : ""}
      <div class="ky-nav__links">${items.map(link).join("")}</div>
    </div>`;

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.className = "ky-header";
    header.innerHTML = `
      <div class="ky-header__in">
        <a class="ky-logo" href="index.html" data-label="Brand logo (circle symbol + English wordmark)"><span class="ky-logo__mark">B</span>Brand</a>
        <nav class="ky-nav" aria-label="Menu" data-slot="mobile-menu">
          ${NAV.map(([l, items]) => section(l, items)).join("")}
          ${section("Service guide", OTHER, true)}
        </nav>
        <button class="ky-toggle is-sp" type="button" aria-label="Open Menu" aria-expanded="false"><span class="ky-toggle__bars"><i class="ky-toggle__bar is-top"></i><i class="ky-toggle__bar is-mid"></i><i class="ky-toggle__bar is-bottom"></i></span></button>
      </div>`;
  }

  const BADGES = `
    <a class="ky-badge" href="https://example.com/app-store/" data-label="App store badge"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="13" r="7"/></svg><span>Download on the<b>App Store</b></span></a>
    <a class="ky-badge" href="https://example.com/google-play/" data-label="App store badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l12 9-12 9z"/></svg><span>GET IT ON<b>Google Play</b></span></a>`;
  document.querySelectorAll("[data-badges]").forEach((b) => { b.innerHTML = BADGES; });

  // The finishing strip (three start steps) has the same form on every page, so it is filled in here
  document.querySelectorAll("[data-cta]").forEach((c) => { c.innerHTML = `
      <div class="ky-wrap">
        <div class="ky-cta__top">
          <h2 class="ky-cta__index">Get started with Brand in three steps</h2>
          <p class="ky-cta__desc"><strong>Add one line here: the card is applied for and issued in the app. Download the app first.</strong></p>
          <div class="ky-badges">${BADGES}</div>
        </div>
        <div class="ky-cta__flow">
          <div class="ky-cta__pattern">
            <div class="ky-cta__what"><span class="ky-cta__label">Sign up in 1 minute and start using it today!</span><h3>Online payment, for when you want to pay in store by tapping your phone</h3></div>
            <ol class="ky-steps">
              <li><span class="ky-steps__num">1</span><div class="ky-steps__row"><i class="ky-steps__icon">B</i><span class="ky-steps__desc">Download the app and<br>Member registration</span></div></li>
              <li><span class="ky-steps__num">2</span><div class="ky-steps__row"><i class="ky-steps__icon is-card"></i><span class="ky-steps__desc">Online in the app<br>Card Issuance</span></div></li>
              <li><span class="ky-steps__num">3</span><div class="ky-steps__row"><i class="ky-steps__icon">¥</i><span class="ky-steps__desc">Deposit via app</span></div></li>
            </ol>
          </div>
          <div class="ky-cta__pattern">
            <div class="ky-cta__what"><span class="ky-cta__label">For when you want to use it anywhere with a physical card</span><h3>When you want to use plenty, anywhere</h3></div>
            <ol class="ky-steps">
              <li><span class="ky-steps__num">1</span><div class="ky-steps__row"><i class="ky-steps__icon">B</i><span class="ky-steps__desc">Download the app and<br>Member registration</span></div></li>
              <li><span class="ky-steps__num">2</span><div class="ky-steps__row"><i class="ky-steps__icon is-card"></i><span class="ky-steps__desc">Physical Card<br>Application</span></div></li>
              <li><span class="ky-steps__num">3</span><div class="ky-steps__row"><i class="ky-steps__icon">¥</i><span class="ky-steps__desc">Deposit via app</span></div></li>
            </ol>
          </div>
        </div>
      </div>
    `; });

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.className = "ky-footer";
    const col = (h, list) => `<div><h4>${h}</h4><ul>${list.map(([t, href = "https://example.com/"]) => `<li><a href="${href}">${t}</a></li>`).join("")}</ul></div>`;
    footer.innerHTML = `
      <div class="ky-wrap">
        <div class="ky-footer__top"><div class="ky-badges">${BADGES}</div></div>
        <div class="ky-footer__sec">
          <div class="ky-footer__row">
            <div class="ky-footer__col">
              <h3 class="ky-footer__h">App ‹Brand›</h3>
              <div class="ky-footer__links">
                ${col("Function", [["Payments · Transfers"], ["Charging", "service.html"], ["Reward"], ["Household ledger"], ["Shared Account"], ["Safety feature"]])}
                ${col("Help", [["Help"], ["Inquiry"]])}
                ${col("Notice", [["Notice"], ["Maintenance · Outages"], ["Campaign", "article.html"]])}
              </div>
            </div>
            <div class="ky-footer__col">
              <h3 class="ky-footer__h">Operating company</h3>
              <div class="ky-footer__links">
                ${col("Company", [["Company About", "about.html"], ["Hiring", "recruit.html"], ["Press release", "news.html"], ["Blog"]])}
                ${col("Terms", [["Privacy policy"], ["Terms of service"], ["Security Rules"], ["Customer-First Pledge"]])}
              </div>
            </div>
          </div>
        </div>
        <div class="ky-footer__sec">
          <h3 class="ky-footer__h">Register</h3>
          <ul class="ky-member"><li>Your registration number here, one line 00000</li><li>Your certification name here</li><li>Your certification name here</li><li>Your registration number here, one line 00000</li></ul>
          <div class="ky-auth"><span class="wf-logo">Certification logo 1</span><span class="wf-logo">Certification logo 2</span></div>
          <h3 class="ky-footer__h" style="margin-top: 35px">Member Organizations</h3>
          <ul class="ky-member"><li>Your association name 1 here</li><li>Your association name 2 here</li></ul>
        </div>
      </div>
      <div class="ky-footer__copy">
        <div class="ky-wrap">
          <p>© 2015 Company Inc</p>
          <div class="ky-sns"><span>Your official accounts info here</span>
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/></svg></a>
            <a href="#" aria-label="X"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5l14 14M19 5L5 19"/></svg></a>
          </div>
        </div>
      </div>`;
    // The right-side question tab is a slot for an external help widget, so it appears on every page, while the coral start button only appears on pages with the three-step closing strip (the original hides the button behind that strip too)
    footer.insertAdjacentHTML("afterend", `
      <a class="ky-faqtab" href="https://example.com/help/" data-slot="faq-tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17v.5" stroke-linecap="round"/></svg>Frequently asked questions</a>
      ${document.querySelector("[data-float-zone]") ? '<div class="ky-float" data-slot="float-start" data-fx="float-away-section" data-fx-float-away-section="while: [data-float-zone]; look: pop; first: hidden"><a class="ky-btn is-coral" href="#howto-start">Get started with Brand</a></div>' : ""}`);
  }

  // ── Header menu: hovering the group drops the list in from 5px above over .3s while turning it on, and on leave it rises over the same length and turns off (992px and up) ──
  const wide = matchMedia("(min-width: 992px)");
  document.querySelectorAll(".ky-nav__sec").forEach((sec) => {
    const list = sec.querySelector(".ky-nav__links");
    if (!list) return;
    sec.addEventListener("mouseenter", () => {
      if (!wide.matches) return;
      gsap.killTweensOf(list);
      gsap.set(list, { display: "block", xPercent: -50, x: 0 });
      gsap.fromTo(list, { y: -5, opacity: 0 }, { y: 0, opacity: 1, duration: reduce ? 0 : 0.3, ease: OUT_CIRC });
    });
    sec.addEventListener("mouseleave", () => {
      if (!wide.matches) return;
      gsap.to(list, { y: -5, opacity: 0, duration: reduce ? 0 : 0.3, ease: OUT_CIRC, onComplete: () => gsap.set(list, { display: "none" }) });
    });
  });
  wide.addEventListener("change", () => document.querySelectorAll(".ky-nav__links").forEach((l) => gsap.set(l, { clearProps: "all" })));

  // ── Phone drawer: the button opens and closes it. Pressing a link inside closes it
  const hd = document.querySelector(".ky-header");
  const tg = hd?.querySelector(".ky-toggle.is-sp");
  tg?.addEventListener("click", () => {
    const open = hd.classList.toggle("is-open");
    tg.setAttribute("aria-expanded", String(open));
  });
  hd?.querySelectorAll(".ky-nav__link").forEach((a) => a.addEventListener("click", () => hd.classList.remove("is-open")));

  // ── Sliders (use cases · transfer screens · photo collection): take the original Webflow slider values via data-delay · data-duration · data-ease — for endless looping a clone of the first cell sits at the end and silently jumps back in place when reached
  document.querySelectorAll("[data-slider]").forEach((sl) => {
    const track = sl.querySelector(".episodes__track");
    const items = [...track.children];
    if (items.length < 2) return;
    track.append(items[0].cloneNode(true));
    const nav = sl.querySelector(".episodes__nav");
    if (nav) nav.innerHTML = items.map((_, i) => `<button type="button" aria-label="${i + 1}Nth"></button>`).join("");
    const wait = +(sl.dataset.delay || 2000), dur = +(sl.dataset.duration || 600), ease = sl.dataset.ease || "cubic-bezier(0.165, 0.84, 0.44, 1)";
    let i = 0, timer = 0;
    const step = () => items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(items[0]).marginLeft) + parseFloat(getComputedStyle(items[0]).marginRight);
    const paint = (animate) => {
      track.style.transition = animate && !reduce ? `transform ${dur}ms ${ease}` : "none";
      track.style.transform = `translateX(${-i * step()}px)`;
      nav?.querySelectorAll("button").forEach((b, k) => b.classList.toggle("is-active", k === i % items.length));
    };
    const go = (n) => {
      i = n;
      paint(true);
      if (i === items.length) setTimeout(() => { i = 0; paint(false); }, dur + 20);
      if (i < 0) { i = items.length - 1; paint(false); }
    };
    const loop = () => { clearTimeout(timer); if (!reduce) timer = setTimeout(() => { go(i + 1); loop(); }, wait + dur); };
    sl.querySelector(".is-next")?.addEventListener("click", () => { go(i + 1); loop(); });
    sl.querySelector(".is-prev")?.addEventListener("click", () => { go(i - 1); loop(); });
    nav?.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; go([...nav.children].indexOf(b)); loop(); });
    paint(false);
    loop();
    addEventListener("resize", () => paint(false));
  });

  // ── Same-page anchors (in three starting steps)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href") === "#") return;
    const to = document.querySelector(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    to.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });
})();
