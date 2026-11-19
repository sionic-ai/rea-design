// Shared by every page — header (center wordmark, MENU) and menu drawer (part bounce-in-drawer), bottom-right character badge (part quip-bubble-badge),
// Category panel, footer, back to top (turns on in .6s once past 1500px and stops when it touches the footer), reveal on view (1/6 line from the screen bottom, .5s ease)
const GH = (() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICO = {
    arrow: '<svg viewBox="0 0 13 13" aria-hidden="true"><path d="M2 11 11 2M4 2h7v7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    out: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M7 1h4v4M11 1 5.5 6.5M9 7.5V11H1V3h3.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    search: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.6" cy="6.6" r="5.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="m10.8 10.8 4.4 4.4" stroke="currentColor" stroke-width="1.2"/></svg>',
    insta: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="1.5" y="1.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="15" cy="5" r="1.1" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 2h4.6l11.4 16h-4.6zM17.4 2 11.2 9M8.8 11 2.6 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    fb: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M11 18v-6.5h2.2l.4-2.5H11V7.6c0-.8.3-1.3 1.4-1.3h1.3V4.1c-.3 0-1-.1-1.9-.1-2 0-3.3 1.2-3.3 3.4V9H6.4v2.5h2.1V18" class="gh-ico-cut"/></svg>',
    spot: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M5.5 7.4c3-1 6.6-.8 9.2.7M6 10.2c2.6-.8 5.4-.5 7.6.8M6.5 12.8c2-.6 4-.4 5.8.6" fill="none" class="gh-ico-cut-line" stroke-width="1.4" stroke-linecap="round"/></svg>',
    pin: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="currentColor"/><path d="M9.2 13.4 8 18.6M10.4 5.2c-2.6 0-4 1.8-4 3.4 0 1 .4 1.8 1.2 2.1.2-.6.2-.9.1-1.2-.2-.4-.3-.8-.3-1.2 0-1.5 1.1-2.6 2.8-2.6 1.5 0 2.4.9 2.4 2.2 0 1.7-.8 3-1.8 3-.6 0-1-.5-.9-1.1.2-.7.5-1.5.5-2" fill="none" class="gh-ico-cut-line" stroke-width="1.2" stroke-linecap="round"/></svg>',
    tri: '<svg viewBox="0 0 12 18" aria-hidden="true"><path d="M1 1.5 10.5 9 1 16.5"/></svg>',
  };
  const sns = () => `<div class="gh-sns">${["insta", "x", "fb", "spot", "pin"].map((k) => `<a href="#" aria-label="SNS ${k}">${ICO[k]}</a>`).join("")}</div>`;
  const mark = (cls, label = "Media English wordmark") =>
    `<span class="gh-mark ${cls}" data-label="${label}"><span class="gh-mark__main">BRAND MAGAZINE</span><span class="gh-mark__catch">Your Brand Slogan Goes Here!</span></span>`;

  // Character badge slot from the original — a face in a red circle with white hair curves swirling around it (redrawn at the same size and feel)
  const badgeArt = `<svg viewBox="0 0 76 76" aria-hidden="true">
    <circle cx="38" cy="38" r="36.5" class="gh-badge__ring"/>
    <circle cx="38" cy="38" r="31" class="gh-badge__face"/>
    <path class="gh-badge__hair" d="M17 41c-1-12 7-23 20-24 9-1 17 4 20 11-6-4-13-5-19-2-7 3-10 9-9 16 1 6 6 10 12 10 5 0 9-3 10-8-4 3-9 3-12 0-3-2-3-7 0-9 4-3 11-1 14 4 3 7-1 16-9 19-11 4-25-3-27-17z"/>
    <path class="gh-badge__hair" d="M49 15c5 1 10 5 12 10l-6 2c-1-4-4-8-8-9z"/>
  </svg>`;

  const CATS = [["ALL", "1410"], ["FASHION", "708"], ["BEAUTY", "89"], ["CULTURE", "560"], ["PLAY", "53"]];
  const TAGS = ["SNAP", "VINTAGE", "SHOES", "TRAVEL", "FOOD", "LIFE STYLE", "HOROSCOPE", "PRE-FALL", "MOVIE", "TOGA", "Denim", "BRAND", "NAIL", "HAIR ACCESSORIES", "KNIT", "SWIMWEAR", "BAG", "EYEWEAR", "RUNNING", "FISHING"];
  const REGULAR = ["Series name one", "Localist Series Name", "GIRLS' ASIA JOURNEY", "Make-up is FASHION!", "Series name, line four!", "GIRLS' CINEMA CLUB", "girl magazine sports club", "NAME by editors"];

  // ---------- Header·drawer ----------
  const header = document.createElement("header");
  header.className = "gh-header";
  header.setAttribute("data-slot", "header");
  header.setAttribute("data-fx", "bounce-in-drawer");
  header.innerHTML = `
    <a class="gh-header__logo" href="index.html" aria-label="First Page">${mark("")}</a>
    <button class="gh-menu-btn" type="button" data-fx-part="toggle" aria-label="Menu"><span class="gh-menu-btn__text">MENU</span><span class="gh-menu-btn__plus"></span></button>
    <nav class="gh-drawer" data-fx-part="panel" data-slot="menu-drawer" aria-label="Menu">
      <div class="gh-drawer__panel">
        <a class="gh-drawer__logo" href="index.html" data-fx-part="close">${mark("")}</a>
        <div class="gh-drawer__inner">
          <form class="gh-search" role="search" onsubmit="return false"><input type="search" placeholder="search" aria-label="Search"><button type="submit" aria-label="Search">${ICO.search}</button></form>
          <p class="gh-drawer__title"><a href="list.html" data-fx-part="close">Articles</a></p>
          <ul class="gh-drawer__cats">${CATS.map(([n, c]) => `<li><a href="list.html" data-fx-part="close">${n}<sup>${c}</sup></a></li>`).join("")}</ul>
          <div class="gh-drawer__regular"><h2>Regular:</h2><ul>${REGULAR.map((r) => `<li><a href="list.html" data-fx-part="close">${r}</a></li>`).join("")}</ul></div>
          <div class="gh-drawer__sections">
            <a class="gh-drawer__sec" href="index.html#buy" data-fx-part="close"><b>CORNER NAME NON STOP</b><span>[ One item chosen each day ]</span></a>
            <a class="gh-drawer__sec" href="news.html" data-fx-part="close"><b>NEWS</b><span>[ Culture, Fashion and Beauty News ]</span></a>
          </div>
          <div class="gh-drawer__foot">${sns()}<a class="gh-latin" href="#" data-label="Parent company media logo">PARENT MEDIA ${ICO.out}</a></div>
          <ul class="gh-drawer__company"><li><a href="about.html" data-fx-part="close">About</a></li><li><a href="#">Contact</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Recruit</a></li><li><a href="#">Company</a></li></ul>
        </div>
      </div>
    </nav>`;
  document.body.prepend(header);
  header.addEventListener("fx:open", () => document.body.classList.add("is-locked"));
  header.addEventListener("fx:close", () => document.body.classList.remove("is-locked"));

  // ---------- Character badge at the bottom right ----------
  const QUIPS = ["Enjoy Rainy Days Too<br>Styling", "For an exciting summer!", "First-time visit<br>Fishing trip!", "Early summer in City,<br>The best route"];
  const badge = document.createElement("div");
  badge.className = "gh-badge";
  badge.setAttribute("data-slot", "badge-bubble");
  badge.setAttribute("data-fx", "quip-bubble-badge");
  badge.innerHTML = `<div class="gh-badge__bubbles">${QUIPS.map((q) => `<div class="gh-bubble" data-fx-part="item"><a href="article.html"><p>${q}</p></a><svg viewBox="0 0 12 18" aria-hidden="true"><path d="M1 1.5 10.5 9 1 16.5"/></svg></div>`).join("")}</div>
    <button class="gh-badge__icon" type="button" data-fx-part="trigger" aria-label="Character Badge" data-label="Media character badge · Circle">${badgeArt}</button>`;
  document.body.append(badge);

  // ---------- Category panel (first page · end of article) ----------
  document.querySelectorAll("[data-gh-tags]").forEach((sec) => {
    sec.innerHTML = `<div class="gh-tags__box">
      <ul class="gh-tags__cats">${CATS.map(([n, c], i) => `<li class="gh-tags__cat${i ? "" : " gh-tags__cat--all"}"><a href="list.html">${n}<sup>${c}</sup></a></li>`).join("")}</ul>
      <div class="gh-tags__list">${TAGS.map((t) => `<a href="list.html">${t}</a>`).join("")}</div>
      <form class="gh-search" role="search" onsubmit="return false"><input type="search" placeholder="search" aria-label="Search"><button type="submit" aria-label="Search">${ICO.search}</button></form>
    </div>`;
  });

  // ---------- Footer ----------
  const footer = document.createElement("footer");
  footer.className = "gh-footer";
  footer.setAttribute("data-slot", "footer");
  footer.innerHTML = `<a class="gh-footer__logo" href="index.html">${mark("")}</a>
    ${sns()}
    <ul class="gh-footer__links"><li><a href="about.html">About</a></li><li><a href="#">Contact</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Recruit</a></li><li><a href="#">Company</a></li><li><a href="#">parent.media${ICO.out}</a></li></ul>
    <p class="gh-footer__copy">© 2025 Company Name Inc.</p>
    <p class="gh-r2t"><a href="#top">BACK TO TOP</a></p>`;
  document.body.append(footer);

  // ---------- Fade up when visible · back to top · first page header logo ----------
  const ins = [...document.querySelectorAll(".gh-in")];
  const r2t = footer.querySelector(".gh-r2t");
  const logo = header.querySelector(".gh-header__logo");
  const hero = document.querySelector("[data-gh-hero]");
  const onScroll = () => {
    const y = scrollY, h = innerHeight, btm = y + h;
    for (const el of ins) if (!el.classList.contains("is-show") && el.getBoundingClientRect().top + y < btm - h / 6) el.classList.add("is-show");
    r2t.classList.toggle("is-show", y >= 1500);
    r2t.classList.toggle("is-stop", btm >= footer.getBoundingClientRect().top + y);
    if (hero && innerWidth <= 1020) logo.classList.toggle("is-on", y >= hero.offsetTop + hero.offsetHeight);
  };
  if (reduce) ins.forEach((el) => el.classList.add("is-show"));
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  addEventListener("load", onScroll);
  onScroll();
  r2t.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    if (reduce || !window.gsap) return scrollTo(0, 0);
    // Original jQuery animate(scrollTop 0, 800) — default easing swing
    const o = { y: scrollY };
    gsap.to(o, { y: 0, duration: 0.8, ease: "sine.inOut", onUpdate: () => scrollTo(0, o.y) });
  });

  return { page, reduce, ICO };
})();
