// Common: draws in the fixed header (global menu drop panel · phone menu), the brand video window, and the bottom links · footer.
// Original values: drop panel opacity .3s ease · video window transform .8s cubic-bezier(.2,.8,.2,1) · pill hover background .3s.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const J = (window.JAL = { reduce });
  const arrow = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h11M11 5.5 15.5 10 11 14.5"/></svg>';
  // Original crane sentence slot — white wing curve inside a red circle (newly drawn)
  const mark = '<svg class="j-logo__mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="currentColor"/><path d="M9 25c5-2 9-7 11-13 1 5 5 9 11 10-6 2-12 1-16-2-2 2-4 4-6 5z" fill="var(--kf-on-accent)"/></svg>';
  const word = '<span class="j-logo__word" data-label="Airline English wordmark">AIRLINE BRAND</span>';
  const ic = {
    globe: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="8"/><path d="M2 10h16M10 2c2.4 2.4 3.4 5 3.4 8s-1 5.6-3.4 8c-2.4-2.4-3.4-5-3.4-8S7.6 4.4 10 2z"/></svg>',
    ticket: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 5h16v3a2 2 0 0 0 0 4v3H2v-3a2 2 0 0 0 0-4z"/><path d="M7 5v10" stroke-dasharray="1.6 1.6"/></svg>',
    tel: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M5.6 2.2 8 4.8c.4.4.4 1 .1 1.4L6.8 8c1.2 2.4 3 4.2 5.2 5.4l1.8-1.4c.4-.3 1-.3 1.4.1l2.6 2.4c.4.4.4 1.1 0 1.5l-1.4 1.4c-.8.8-2 1.1-3 .6C8.6 16.2 4 11.6 2.2 6.8c-.4-1 0-2.2.7-3z"/></svg>',
    map: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="6" height="6" rx="1"/><rect x="11.5" y="2.5" width="6" height="6" rx="3"/><rect x="2.5" y="11.5" width="6" height="6" rx="1"/><rect x="11.5" y="11.5" width="6" height="6" rx="1"/></svg>',
    search: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg>',
    close: '<svg class="j-search__x" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m1 1 10 10M11 1 1 11"/></svg>',
  };
  J.icons = { arrow, mark };

  const menu = [
    ["Home"], ["Company About", 8], ["Safety·Peace of mind", 6], ["Sustainability", 8], ["IR info", 6], ["Connect together", 4], ["Solutions · Services", 8], ["Press release", 4], ["Hiring Info"],
  ];
  const drop = (name, n) => `
    <div class="j-drop" role="region" aria-label="${name}">
      <div class="j-drop__inner">
        <a class="j-drop__title" href="#"><span>${name}</span>${arrow}</a>
        <div class="j-drop__cols">${Array.from({ length: n }, (_, i) => `<a href="#">${arrow}<span>Your submenu $ here{String(i + 1).padStart(2, "0")}</span></a>`).join("")}</div>
        <button class="j-drop__close" type="button">Close ×</button>
      </div>
    </div>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("j-head");
    head.innerHTML = `
      <div class="j-head__top">
        <div class="j-head__inner">
          <div class="j-head__block">
            <a class="j-logo" href="index.html" aria-label="Home">${mark}${word}</a>
            <span class="j-badge" aria-hidden="true"></span>
          </div>
          <div class="j-head__btns">
            <a class="j-en" href="#">${ic.globe}<span data-label="English Language Name">English</span></a>
            <a class="j-pill j-pill--ticket" href="#">${ic.ticket}<span>Book flights here</span></a>
            <a class="j-pill j-pill--s" href="#">${ic.tel}<span>Inquiry</span></a>
            <a class="j-pill j-pill--s" href="#">${ic.map}<span>Sitemap</span></a>
            <div class="j-search">
              <a class="j-pill j-pill--s j-search__toggle js-search-toggle" href="#" role="button" aria-expanded="false">${ic.search}${ic.close}<span>Site Search</span></a>
              <form class="j-search__box js-search-box" role="search"><input class="j-search__field" type="search" placeholder="Enter a keyword" aria-label="Site Search"><button class="j-search__btn" type="submit" aria-label="Search">${ic.search}</button></form>
            </div>
            <button class="j-burger js-burger" type="button" aria-label="Open Menu"><span></span><span></span><span></span></button>
          </div>
        </div>
      </div>
      <nav class="j-gnav js-gnav" aria-label="Global menu">
        <ul class="j-gnav__list">${menu.map(([name, n]) => `<li class="j-gnav__item${n ? " js-drop" : ""}"><a href="#">${name}</a>${n ? drop(name, n) : ""}</li>`).join("")}</ul>
      </nav>`;
  }

  // Drop panel: opens on hover (others close), and closes on leaving the header, the close button, or Esc
  const items = [...document.querySelectorAll(".js-drop")];
  const closeAll = () => items.forEach((it) => it.classList.remove("is-open"));
  items.forEach((it) => {
    it.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; closeAll(); it.classList.add("is-open"); });
    it.querySelector(":scope > a").addEventListener("click", (e) => {
      if (matchMedia("(hover: hover)").matches) return;
      e.preventDefault();
      const was = it.classList.contains("is-open");
      closeAll();
      it.classList.toggle("is-open", !was);
    });
    it.querySelector(".j-drop__close").addEventListener("click", closeAll);
  });
  document.querySelector(".js-gnav")?.addEventListener("pointerleave", closeAll);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  // Site search: as in the original, the box appears immediately (no transition) and only the button icon changes to ×
  const searchToggle = document.querySelector(".js-search-toggle");
  const searchBox = document.querySelector(".js-search-box");
  searchToggle?.addEventListener("click", (e) => {
    e.preventDefault();
    const open = searchBox.classList.toggle("is-active");
    searchToggle.classList.toggle("is-close", open);
    searchToggle.setAttribute("aria-expanded", String(open));
    if (open) searchBox.querySelector("input").focus();
  });
  searchBox?.addEventListener("submit", (e) => e.preventDefault());
  const burger = document.querySelector(".js-burger");
  burger?.addEventListener("click", () => {
    const open = burger.classList.toggle("is-open");
    document.querySelector(".js-gnav").classList.toggle("is-open", open);
  });

  // ── Bottom links · footer ──
  const bottom = document.querySelector('[data-slot="bottom"]');
  if (bottom) {
    bottom.classList.add("j-bottom");
    bottom.innerHTML = `
      <ul class="j-bottom__links">
        <li><a href="#"><span>Your next page to explore 1</span>${arrow}</a></li>
        <li><a href="#"><span>Your next page to explore 2</span>${arrow}</a></li>
        <li><a href="#"><span>Your next page to explore 3</span>${arrow}</a></li>
      </ul>
      <div class="j-bottom__logo">${mark}${word}</div>
      <footer class="j-foot" data-slot="footer">
        <div class="j-foot__inner">
          <nav class="j-foot__nav" aria-label="Footer Menu">${Array.from({ length: 15 }, (_, i) => `<a href="#">Your footer menu $ here{String(i + 1).padStart(2, "0")}</a>`).join("")}</nav>
          <div class="j-foot__sub"><span>Privacy Policy · Terms of Use · Accessibility</span><span data-label="English Copyright Line">© Airline Brand Co., Ltd.</span></div>
        </div>
      </footer>`;
  }

  // ── Brand video window ──
  const modal = document.querySelector(".js-modal");
  if (modal) {
    let timer = 0;
    J.openMovie = () => {
      clearTimeout(timer);
      modal.classList.add("is-active");
      requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("is-open")));
      document.dispatchEvent(new CustomEvent("jal:modal", { detail: true }));
    };
    J.closeMovie = () => {
      modal.classList.remove("is-open");
      document.dispatchEvent(new CustomEvent("jal:modal", { detail: false }));
      timer = setTimeout(() => modal.classList.remove("is-active"), reduce ? 0 : 800);
    };
    document.addEventListener("click", (e) => { if (e.target.closest("[data-movie-open]")) J.openMovie(); });
    modal.querySelector(".js-modal-close").addEventListener("click", J.closeMovie);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) J.closeMovie(); });
  }
})();
