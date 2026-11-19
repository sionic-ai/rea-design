// The header line·oval menu·footer are rendered in one place so every page uses the same ones, and menu open/close and category selection are wired up.
// Motion (noise background · cursor · text hover · section title · body gradient) is handled by data-fx parts — fx-core scans after this file inserts them.
(() => {
  const page = document.body.dataset.page;
  const href = { statement: "about.html", news: "news.html", works: "works.html", discography: "works.html" };
  const MENU = [
    ["STATEMENT", "statement"], ["NEWS", "news"], ["ARTIST", ""], ["DISCOGRAPHY", "discography"],
    ["WORKS", "works"], ["LIVE", ""], ["MEDIA", ""], ["GOODS", ""], ["CONTACT", ""],
  ];
  const link = ([label, key], fx = true) => {
    const to = href[key] || "#";
    const cur = (key === "statement" && page === "about") || key === page ? ' aria-current="page"' : "";
    return `<a href="${to}"${cur}${fx ? ' data-fx="char-cycle-up-hover"' : ""}>${label}</a>`;
  };
  const labels = '<span class="al-label t1" data-label="Sister brand English name 1 — source is a thin serif lettering image 94×10px">STUDIO NAME</span><span class="al-label t2" data-label="Sister brand English name 2 — source is a thin serif lettering image 99×10px">RECORD NAME</span>';
  const bigMark = (cls) => `<svg viewBox="0 0 1950 495" aria-hidden="true"><text class="${cls}" x="10" y="440" textLength="1930" lengthAdjust="spacingAndGlyphs">NAME</text></svg>`;
  const ellipse = '<svg class="al-gnav__line al-ellipse-svg" viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="22" rx="49.95" ry="21.95" vector-effect="non-scaling-stroke"/></svg>';
  const item = (m) => `<div class="al-gnav__item al-serif">${link(m)}</div>`;
  const nav = (list) => `<nav class="al-gnav__nav al-serif">${list.map((k) => item(MENU[k])).join("")}</nav>`;

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.classList.add("al-header");
    header.innerHTML = `<div class="al-header__head"><a href="index.html" class="al-hover-op" aria-label="First Page">${labels}</a></div>
      <button class="al-gnav__trigger" type="button" aria-label="Open Menu" aria-expanded="false" data-gnav-open></button>`;
  }
  const gnav = document.querySelector('[data-slot="menu-ellipse"]');
  if (gnav) {
    gnav.classList.add("al-gnav");
    gnav.innerHTML = `
      <div class="al-gnav__inner al-wide">${ellipse}
        <div class="al-gnav__head" data-pos="1"><span class="al-label">STUDIO NAME</span></div>
        <div class="al-gnav__head" data-pos="2"><span class="al-label">RECORD NAME</span></div>
        ${nav([0, 1, 2, 3, 4, 5, 6, 7, 8])}
        <div class="al-gnav__allt" data-label="Large brand logo panel — the original is a logo cut off below the menu panel, hovering the panel shows only the outline">${bigMark("")}</div>
      </div>
      <div class="al-gnav__inner al-narrow" data-pos="1">${ellipse}<div class="al-gnav__allt"><div class="al-gnav__mark">${bigMark("")}</div></div>${nav([0, 1])}${nav([2, 5])}</div>
      <div class="al-gnav__inner al-narrow" data-pos="2">${ellipse}<div class="al-gnav__allt"><div class="al-gnav__mark">${bigMark("")}</div></div>${nav([4, 3])}${nav([7, 6])}${nav([8])}</div>`;
  }
  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.classList.add("al-footer");
    const items = MENU.slice(0, 4).map((m) => `<div class="al-footer__item">${link(m)}</div>`).join("") + '<div class="al-footer__item" data-spacer></div>' + MENU.slice(4).map((m) => `<div class="al-footer__item">${link(m)}</div>`).join("");
    footer.innerHTML = `
      <div class="al-footer__row">
        <div class="al-footer__logo">
          <a href="index.html" class="al-logo al-hover-op" data-label="Brand logo — four sharply split brush-stroke characters + small STUDIO below" aria-label="First Page"><svg viewBox="0 0 800 255" aria-hidden="true"><text class="w" x="400" y="170" text-anchor="middle" textLength="760" lengthAdjust="spacingAndGlyphs">NAME</text><text class="s" x="400" y="245" text-anchor="middle">STUDIO</text></svg></a>
          <a href="#" class="al-footer__x al-hover-op" aria-label="SNS 1"><svg viewBox="0 0 100 102" aria-hidden="true"><path d="M8 4h26l58 94H66Z M86 4 14 98" fill="none" stroke="currentColor" stroke-width="6"/></svg></a>
        </div>
        <nav class="al-footer__nav" aria-label="Footer Menu">${items}</nav>
      </div>
      <div class="al-typo al-footer__typo" data-slot="footer-wordmark-loop" data-label="Giant English word strip — the original is a teal high-contrast serif Studio graphic flowing at 100s">
        <div class="al-typo__loop"><div class="al-typo__obj">Studio</div><div class="al-typo__obj" aria-hidden="true">Studio</div></div>
        <div class="al-typo__allt" aria-hidden="true"><svg viewBox="0 0 2952 749"><text x="0" y="690" textLength="2952" lengthAdjust="spacingAndGlyphs">NAME</text></svg></div>
        <p class="al-footer__copy" data-label="Copyright line — original is a thin serif lettering image">© STUDIO NAME / COMPANY</p>
      </div>`;
  }

  // Menu — opens and closes with a single body[data-gnav], closes when pressing outside the panel
  const setGnav = (open) => {
    document.body.dataset.gnav = open ? "1" : "0";
    document.querySelectorAll("[data-gnav-open]").forEach((b) => { b.setAttribute("aria-expanded", String(open)); b.setAttribute("aria-label", open ? "Close Menu" : "Open Menu"); });
  };
  setGnav(false);
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-gnav-open]")) { setGnav(document.body.dataset.gnav !== "1"); return; }
    if (!e.target.closest('[data-slot="menu-ellipse"]') && document.body.dataset.gnav === "1") setGnav(false);
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setGnav(false); });

  // Category picker — the button opens a window, and tapping the triangle inside or anywhere outside closes it
  document.querySelectorAll("[data-select]").forEach((wrap) => {
    const btn = wrap.querySelector(".al-select__btn"), close = wrap.querySelector(".al-select__close");
    const set = (open) => { wrap.dataset.open = open ? "1" : "0"; btn.setAttribute("aria-expanded", String(open)); };
    set(false);
    btn.addEventListener("click", () => set(true));
    close.addEventListener("click", () => set(false));
    document.addEventListener("click", (e) => { if (!e.target.closest("[data-select]") && wrap.dataset.open === "1") set(false); });
  });
})();
