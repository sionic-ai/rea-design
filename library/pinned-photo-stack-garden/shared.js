// Common to all pages: draws in the header · language button · footer, and hooks up the menu pill drawer (.3s) · language panel (.3s) · logo hiding past the hero (.5s) · page transition white curtain (.45s · waits 450ms).
(() => {
  const page = document.body.dataset.page || "home";
  const KT = (window.KT = { reduced: matchMedia("(prefers-reduced-motion: reduce)").matches });

  // Instead of the original vertical logo (three Chinese characters + small Latin text), a newly drawn placeholder — one roof shape and three squares, two thin lines below
  const mark = `<svg class="kt-mark" viewBox="0 0 64 129" aria-hidden="true">
    <path class="kt-mark__ink" d="M8 20 L32 6 L56 20 L52 24 L32 13 L12 24 Z"/>
    <rect class="kt-mark__ink" x="16" y="30" width="32" height="22"/>
    <rect class="kt-mark__ink" x="16" y="56" width="32" height="22"/>
    <rect class="kt-mark__ink" x="16" y="82" width="32" height="22"/>
    <rect class="kt-mark__paper" x="22" y="36" width="20" height="2"/><rect class="kt-mark__paper" x="22" y="62" width="20" height="2"/><rect class="kt-mark__paper" x="22" y="88" width="20" height="2"/>
    <rect class="kt-mark__ink" x="10" y="112" width="44" height="2"/><rect class="kt-mark__ink" x="16" y="119" width="32" height="2"/>
  </svg>`;
  KT.mark = mark;
  const sns = `<li><a href="#" aria-label="Photo account"><svg viewBox="0 0 15 15"><rect x="1" y="1" width="13" height="13" rx="3.5"/><circle cx="7.5" cy="7.5" r="3"/><circle class="is-dot" cx="11.2" cy="3.8" r=".8"/></svg></a></li>
    <li><a href="#" aria-label="Short-post account"><svg viewBox="0 0 15 15"><path d="M2 2h3l8 11h-3zM12.6 2 2.6 13"/></svg></a></li>`;
  const menu = [
    ["index.html", "First Page"],
    ["about.html", "About the garden"],
    ["#", "Facility Guide"],
    ["#", "Garden design · highlights"],
    ["#", "Directions · Nearby"],
    ["news.html", "News"],
    ["#", "Event"],
    ["#", "Frequently asked questions"],
    ["#", "Inquiry"],
  ];
  const links = (extra = "") => menu.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("") + extra;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.outerHTML = `
      <header class="kt-head" data-slot="header">
        <div class="kt-head__logo">
          <h1 class="kt-head__mark"><a href="index.html" aria-label="First Page" data-label="Organization vertical logo · Three Chinese characters + small English">${mark}</a></h1>
          <div class="kt-head__menu">
            <button class="kt-burger" type="button" aria-expanded="false" aria-controls="kt-drawer" aria-label="Menu"><svg viewBox="0 0 20 4" aria-hidden="true"><circle cx="2" cy="2" r="2"/><circle cx="10" cy="2" r="2"/><circle cx="18" cy="2" r="2"/></svg></button>
            <div class="kt-drawer" id="kt-drawer" data-slot="menu-drawer"><div class="kt-drawer__in"><ul>${links()}</ul></div></div>
          </div>
        </div>
        <div class="kt-head__right"><ul class="kt-sns">${sns}</ul><p class="kt-head__address" data-label="English one-line address">Inside Placeholder Park, 1-1 Street Name, Ward Name, City, 000-0000</p></div>
        <div class="kt-cover" aria-hidden="true"></div>
        <p class="kt-head__copy" data-label="English copyright, one line">Copyright © 2026 Studio Name All rights reserved.</p>
      </header>
      <div class="kt-lang" data-slot="language">
        <button class="kt-lang__btn" type="button" aria-expanded="false"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c-2.5 3-2.5 10 0 13M8 1.5c2.5 3 2.5 10 0 13"/></svg>Language</button>
        <div class="kt-lang__menu"><ul>
          <li><button type="button">日本語</button></li><li><button type="button">English</button></li><li><button type="button" class="is-current">Korean</button></li><li><button type="button">简体中文</button></li><li><button type="button">Français</button></li>
        </ul></div>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.outerHTML = `
      <footer class="kt-foot" data-slot="footer">
        <div class="kt-foot__upper kt-sand">
          <div class="wf-img kt-pc" data-label="Forest beyond a garden pond · clear daytime · landscape 23:10"></div>
          <div class="wf-img kt-sp" data-label="Forest beyond the garden pond · Vertical crop"></div>
          <div class="kt-foot__word" data-label="English organization name · large Cinzel">Placename <br class="kt-tab">Garden</div>
        </div>
        <div class="kt-foot__lower kt-sand">
          <div class="kt-foot__main">
            ${mark}
            <ul class="kt-foot__menu">${links('<li class="is-privacy"><a href="#">Privacy policy</a></li>')}</ul>
          </div>
          <div class="kt-foot__detail">
            <p class="kt-foot__text"><strong>Your institution name here</strong><br><span>Your one-line address goes here · Postal code 000-0000</span></p>
            <div class="kt-foot__flex"><a href="#" class="kt-foot__map">View map</a><ul class="kt-sns">${sns}</ul></div>
            <dl class="kt-foot__list">
              <dt>Inquiry</dt>
              <dd><p><strong>Tel: 00-0000-0000</strong> (Your management office here)</p><p>* Closed: every Monday (next weekday if a public holiday), year-end and New Year (Dec 29 – Jan 1)</p></dd>
              <dt>Your facility rental and filming inquiries here</dt>
              <dd><p><strong>Tel: 00-0000-0000</strong> (Your park office here)</p><p>Fax: 00-0000-0000</p><p>* Closed: Sat, Sun, public holidays, year-end holidays (Dec 29 ~ Jan 3)</p></dd>
            </dl>
            <p class="kt-foot__text" style="margin-top: 50px"><span>Managed by:</span><br><span>Your three management company names here on one line</span></p>
            <p class="kt-foot__text" style="margin-top: 10px"><a href="#">Your related organization site here</a></p>
            <ul class="kt-sns">${sns}</ul>
          </div>
        </div>
      </footer>`;
  }

  // menu pill — the same button opens and closes. The drawer turns on in .3s behind the pill (z -1)
  const burger = document.querySelector(".kt-burger");
  const drawer = document.getElementById("kt-drawer");
  if (burger && drawer) {
    const set = (on) => {
      burger.classList.toggle("is-active", on);
      drawer.classList.toggle("is-active", on);
      burger.setAttribute("aria-expanded", String(on));
    };
    burger.addEventListener("click", () => set(!burger.classList.contains("is-active")));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }
  const lang = document.querySelector(".kt-lang__btn");
  if (lang) {
    const box = lang.nextElementSibling;
    lang.addEventListener("click", () => {
      const on = !lang.classList.contains("is-active");
      lang.classList.toggle("is-active", on);
      box.classList.toggle("is-active", on);
      lang.setAttribute("aria-expanded", String(on));
    });
  }

  // When the bottom edge of the big hero panel passes above the screen, the header logo hides in .5s (on phones, address and copyright turn on instead)
  const kv = document.querySelector("[data-kv]");
  const headEl = document.querySelector(".kt-head");
  if (kv && headEl && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: kv,
      start: "bottom top",
      end: "bottom bottom",
      onEnter: () => headEl.classList.add("is-hide"),
      onEnterBack: () => headEl.classList.remove("is-hide"),
    });
  }

  // Page transition: a white curtain covers in .45s and navigates 450ms later. The arriving page opens with the curtain still on and lifts it 900ms after the press
  const cover = document.querySelector(".kt-cover");
  const KEY = "kt-cover";
  const wait = KT.reduced ? 0 : 450;
  if (cover && sessionStorage.getItem(KEY)) {
    sessionStorage.removeItem(KEY);
    cover.style.transition = "none";
    cover.classList.add("is-on");
    document.documentElement.classList.remove("kt-covered");
    void cover.offsetWidth;
    cover.style.transition = "";
    // Original (single-page app) uncovers after 450 cover + 450 hold from the press — we shorten the hold by the time it takes to open a new document so it lifts at the same moment, and if fonts are late, wait for fonts too
    const at = +sessionStorage.getItem(KEY + "-at") || Date.now() - wait;
    sessionStorage.removeItem(KEY + "-at");
    const hold = new Promise((r) => setTimeout(r, Math.max(0, at + wait * 2 - Date.now())));
    Promise.all([hold, document.fonts ? document.fonts.ready : null]).then(() => cover.classList.remove("is-on"));
  }
  document.documentElement.classList.remove("kt-covered");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !cover || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.href === location.href || a.getAttribute("href").startsWith("#")) return;
    e.preventDefault();
    cover.classList.add("is-on");
    sessionStorage.setItem(KEY, "1");
    sessionStorage.setItem(KEY + "-at", String(Date.now()));
    setTimeout(() => { location.href = url.href; }, wait);
  });
  addEventListener("pageshow", (e) => { if (e.persisted && cover) cover.classList.remove("is-on"); });
  KT.page = page;
})();
