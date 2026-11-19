/* Shared across several pages — glass header (five nav items · news strip · official accounts), fixed header, phone menu, closing section (CONCEPT · CONTACT · bottom line) */
(() => {
  const SD = (window.SD = {});
  const page = document.body.dataset.page || "home";
  const I = {
    home: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3.5 9 10 3.5 16.5 9v7.5h-13Z"/><path d="M8 16.5v-4h4v4"/></svg>',
    note: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="15" r="2.5"/><path d="M9.5 15V3.5h4"/></svg>',
    mic: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7.5" y="2.5" width="5" height="9" rx="2.5"/><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v3"/></svg>',
    horn: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8v4h3l7 4V4L6 8Z"/><path d="M6 12l1 4"/></svg>',
    mail: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="4.5" width="15" height="11" rx="1.5"/><path d="m3 5.5 7 5.5 7-5.5"/></svg>',
    arrow: '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 1 5.5 4l-3 3"/></svg>',
    x: '<svg class="sd-x" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 2l10 10M12 2 2 12"/></svg>',
  };
  // Smiley-face logo of two interlocked rings — stands in for the original logo art (redrawn at the same size and feel)
  const RING = '<svg class="sd-ring" viewBox="0 0 46 30" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" data-label="Company mark of two interlocking rings"><path d="M21 8.5A10.5 10.5 0 1 0 21 21.5"/><path d="M25 8.5A10.5 10.5 0 1 1 25 21.5"/></svg>';
  const LOGO = `<svg viewBox="0 0 80 64" data-label="Company logo · ring mark + English name"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M38 12A12 12 0 1 0 38 34"/><path d="M42 12A12 12 0 1 1 42 34"/></g><text x="40" y="58" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" style="font-family: var(--kf-font-display)">Smile Name</text></svg>`;
  SD.I = I;
  SD.RING = RING;
  const NAV = [["Company Name", "Home", "index.html", I.home, "home"], ["Works", "Our Work", "list.html", I.note, "works"], ["Creator & Artist", "Creators & Artists", "#", I.mic, "creator"], ["News", "Latest News", "news.html", I.horn, "news"], ["Contact", "Contact Us", "#", I.mail, "contact"]];
  const cur = { home: "home", list: "works", detail: "works", news: "news" }[page];
  const nav = () => `<nav class="sd-nav" data-slot="nav">${NAV.map(([en, ja, h, ic, k]) => `<a href="${h}"${k === cur ? ' class="is-current"' : ""}><span class="sd-ico">${ic}</span><span class="sd-nav__txt"><span class="sd-nav__roll"><b>${en}</b><small>${ja}</small><b>${en}</b></span></span></a>`).join("")}</nav>`;
  const NEWS = "0000.00.00 Release!! Your artist name here 00th album ‹Album Title›";
  const news = () => `<div class="sd-news" data-slot="news-ticker"><span class="sd-news__label">News</span><div class="sd-news__track" data-fx="overflow-marquee-line" data-fx-overflow-marquee-line="gap: 100; rate: 50"><span data-fx-part="text"><a class="sd-news__link" href="news.html">${NEWS}</a></span></div></div>`;

  const head = document.querySelector('[data-slot="header"]');
  head.className = "sd-head";
  head.innerHTML = `<a class="sd-logo" href="index.html" aria-label="Home">${LOGO}</a><div class="sd-head__col">${nav()}<div class="sd-head__sub">${news()}<a class="sd-official" href="#" target="_blank" rel="noopener">${I.x}<span class="sd-official__roll"><span>Official Account<br>Official Account</span></span><span class="sd-arrow">${I.arrow}</span></a></div></div>`;
  const fix = document.createElement("div");
  fix.className = "sd-fix";
  fix.dataset.slot = "fixed-header";
  fix.innerHTML = `<a class="sd-logo" href="index.html" aria-label="Home">${LOGO}</a>${nav()}`;
  head.after(fix);
  const sp = document.createElement("div");
  sp.className = "sd-sp-head";
  sp.dataset.slot = "sp-header";
  sp.innerHTML = `<a class="sd-logo" href="index.html" aria-label="Home">${LOGO}</a>${news()}`;
  fix.after(sp);
  const burger = document.createElement("button");
  burger.className = "sd-burger";
  burger.type = "button";
  burger.setAttribute("aria-label", "Menu");
  burger.innerHTML = "<span></span>";
  const menu = document.createElement("div");
  menu.className = "sd-menu";
  menu.dataset.slot = "sp-menu";
  menu.innerHTML = nav() + `<div class="sd-head__sub" style="margin-top:10px">${news()}</div>`;
  sp.after(burger, menu);
  burger.addEventListener("click", () => { const on = !menu.classList.contains("is-open"); menu.classList.toggle("is-open", on); burger.classList.toggle("is-on", on); });

  // Fill the image slots in the page html — ring marker, icons, arrows
  SD.fill = (root = document) => {
    root.querySelectorAll(".sd-ring-slot").forEach((n) => n.outerHTML = RING);
    root.querySelectorAll(".sd-mic-slot").forEach((n) => n.outerHTML = I.mic);
    root.querySelectorAll(".sd-arrow").forEach((n) => { if (!n.querySelector("svg")) n.innerHTML = I.arrow; });
  };
  SD.fill();

  // The hero header appears after 2s over .8s (original appear) — subpages have only the fixed header
  requestAnimationFrame(() => requestAnimationFrame(() => head.classList.add("is-in")));
  if (page !== "home") document.body.classList.add("sd-sub-page");

  // When the section’s top edge touches the top of the screen, attach the fixed header, and detach it when scrolling back above (PC only)
  const service = document.querySelector("#service");
  const check = () => {
    if (!service || innerWidth <= 840) { fix.classList.remove("is-visible"); return; }
    const r = service.getBoundingClientRect();
    if (r.top <= 0 && r.bottom >= 0) fix.classList.add("is-visible");
    else if (r.top > 0) fix.classList.remove("is-visible");
  };
  if (page === "home") { addEventListener("scroll", check, { passive: true }); addEventListener("resize", check); check(); }

  // Closing section
  const CARDS = [["0th mini album ”Title”", "Artist name", "Jumping person · Bright outdoors · Square"], ["Album No. 0 「AMENITY」", "Group name", "Jacket with red window painting · square"], ["Digital single 「Trajectory to Tomorrow」", "Artist name", "Blue sky flower print jacket · square"], ["Digital single ”Script”", "Artist name", "Yarn doll photo jacket · square"], ["Digital single ‹Live The Live›", "Artist name", "Hands and sheet music line-art jacket · square"], ["Digital single ‹ICE›", "Artist name", "Ice cream illustrated jacket · mint · square"]];
  SD.CARDS = CARDS;
  const foot = document.querySelector('[data-slot="footer"]');
  foot.className = "sd-concept";
  foot.innerHTML = `<p class="sd-concept__big" aria-hidden="true">Smile Name</p>
    <div class="sd-concept__top"><div><p class="sd-label">${RING}<span>CONCEPT</span></p><h2>Made with music<br><span>Smile Name</span></h2></div>
      <div class="sd-concept__row" data-fx="rock-shift-row" data-fx-rock-shift-row="look: peel" data-slot="concept-cards"><div data-fx-part="track">${CARDS.map(([t, a, l]) => `<a class="sd-card" href="detail.html"><span class="sd-ph" data-label="${l}"></span><p>${t}</p><small>${a}</small></a>`).join("")}</div></div></div>
    <div class="sd-contact" data-slot="contact"><span class="sd-contact__ico">${I.mail}</span><div><h3>CONTACT</h3><p>For work requests and inquiries<br>Feel free to contact us.</p></div>
      <a class="sd-cta" href="#">Contact here for commissions and creator support<span class="sd-arrow">${I.arrow}</span></a></div>
    <div class="sd-foot"><nav><a href="index.html">Home</a><a href="list.html">Works</a><a href="#">Creator</a><a href="news.html">News</a><a href="#">Company</a><a href="#">Contact</a></nav><div class="sd-foot__r"><a href="#">Privacy Policy</a><span>© Company Name</span></div></div>`;
})();
