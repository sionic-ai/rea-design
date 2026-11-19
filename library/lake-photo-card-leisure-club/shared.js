// Shared by the whole site — floating header row (pill button group) · menu panel, contact card, footer, phone bottom band, pill arrow
(() => {
  const arrow = `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h9M7.5 3.2 11.2 7 7.5 10.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  // Two arrows inside the yellow pill — the current one leaves and the next one comes in (arrow-pass-hover)
  const pill = (cls = "") => `<span class="rv-pill ${cls}" aria-hidden="true"><span data-fx="arrow-pass-hover" data-fx-arrow-pass-hover="look: slide">${arrow}${arrow}</span></span>`;
  window.RVPill = pill;
  const icon = {
    leaf: `<svg viewBox="0 0 24 24" aria-hidden="true"><path class="rv-ic-a" d="M12 21V5c-3 1-6 3-6 8 0 4 3 7 6 8Z"/><path class="rv-ic-b" d="M12 21V5c3 1 6 3 6 8 0 4-3 7-6 8Z"/></svg>`,
    cal: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="rv-ic-line" x="3" y="5" width="18" height="16" rx="3"/><path class="rv-ic-line" d="M3 10h18M8 3v4M16 3v4"/><path class="rv-ic-dot" d="M7 13h2v2H7zM11 13h2v2h-2zM15 13h2v2h-2zM7 17h2v2H7zM11 17h2v2h-2z"/></svg>`,
    globe: `<svg viewBox="0 0 16 16" aria-hidden="true"><circle class="rv-ic-line" cx="8" cy="8" r="6.5"/><path class="rv-ic-line" d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13"/></svg>`,
    pin: `<svg viewBox="0 0 16 16" aria-hidden="true"><path class="rv-ic-pin" d="M8 15s5-4.6 5-8.5a5 5 0 1 0-10 0C3 10.4 8 15 8 15Z"/><circle class="rv-ic-hole" cx="8" cy="6.5" r="1.8"/></svg>`,
  };
  const logo = `<a class="rv-logo" href="index.html" aria-label="First Page" data-label="Brand logo · slanted bold English + small company note"><span class="rv-logo__main" lang="en">MARINA</span><span class="rv-logo__sub" lang="en">CORPORATION</span></a>`;
  window.RVLogo = logo;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "rv-header";
    head.innerHTML = `
      ${logo}
      <nav class="rv-hnav" aria-label="Quick menu" data-fx="fade-slide-drawer" data-fx-fade-slide-drawer="side: right; shift: 100; wait: 0; delay: 0; dur: .4; fade: .4">
        <div class="rv-hnav__pills">
          <a class="rv-hpill is-beige" href="guide.html">${icon.leaf}<span>First-time visitors</span></a>
          <a class="rv-hpill is-yellow" href="#">${icon.cal}<span>Book now</span></a>
        </div>
        <div class="rv-hnav__small">
          <a href="#">${icon.globe}<span lang="en">ENGLISH</span></a>
          <a href="about.html#access">${icon.pin}<span>Directions</span></a>
        </div>
        <button type="button" class="rv-burger" data-fx-part="toggle" aria-label="Open Menu"><span></span><span></span><span></span></button>
        <div class="rv-menu" data-fx-part="layer">
          <button type="button" class="rv-menu__lay" data-fx-part="lay" aria-label="Close Menu"></button>
          <div class="rv-menu__panel" data-fx-part="panel" role="dialog" aria-label="Site Menu">
            <button type="button" class="rv-menu__close" data-fx-part="close" aria-label="Close"></button>
            <div class="rv-menu__pills"><a class="rv-hpill is-white" href="guide.html">${icon.leaf}<span>First-time visitors</span></a><a class="rv-hpill is-white" href="#">${icon.cal}<span>Book now</span></a></div>
            <ul class="rv-menu__list">
              ${[["Back to start", "index.html"], ["News", "news.html"], ["Sailing a Yacht", "guide.html"], ["Bass fishing", "guide.html"], ["Buying a Yacht", "about.html"], ["Borrowing", "guide.html"], ["Company About", "about.html"], ["Marina Club Member", "about.html"], ["Frequently asked questions", "#"], ["For travelers visiting", "#"]].map(([t, h]) => `<li><a href="${h}" data-rv-pill>${t}</a></li>`).join("")}
            </ul>
            <a class="rv-menu__form" href="#contact">Contact form<span class="rv-cbtn__ic" aria-hidden="true"></span></a>
            <a class="rv-menu__tel" href="#" lang="en">TEL 000-000-0000</a>
          </div>
        </div>
      </nav>`;
  }

  const dock = document.querySelector('[data-slot="dock"]');
  if (dock) {
    dock.className = "rv-dock";
    dock.innerHTML = `<a class="rv-hpill is-beige" href="guide.html">${icon.leaf}<span>First-time visitors</span></a><a class="rv-hpill is-yellow" href="#">${icon.cal}<span>Book now</span></a><a class="rv-dock__ic" href="about.html#access" aria-label="Directions">${icon.pin}</a><a class="rv-dock__ic" href="#" aria-label="English page">${icon.globe}</a>`;
  }

  // Contact card — wave line pattern at the top right of the white plate, yellow call and blue inquiry buttons
  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.classList.add("rv-contact");
    contact.id = "contact";
    contact.innerHTML = `
      <div class="rv-contact__waves" aria-hidden="true"></div>
      <div class="rv-contact__text" data-fx="studio-appear" data-fx-studio-appear="look: up">
        <h2 class="rv-contact__title" lang="en">CONTACT</h2>
        <p>Via phone or contact form<br>We’re accepting inquiries.</p>
      </div>
      <div class="rv-contact__btns">
        <a class="rv-cbtn is-yellow" href="#" lang="en">TEL 000-000-0000</a>
        <a class="rv-cbtn is-blue" href="#">Contact form<span class="rv-cbtn__ic" aria-hidden="true"></span></a>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "rv-footer";
    foot.innerHTML = `
      <div class="rv-footer__panel">
        <div class="rv-footer__left">
          ${logo}
          <address>Postal code 000-0000 Your address here 00-00-00<br><a href="#" lang="en">Google Map ↗</a><br>TEL : 000-000-0000</address>
          <p class="rv-footer__sns"><a href="#" aria-label="Group SNS" class="rv-sns is-round"></a><a href="#" aria-label="Photo SNS" class="rv-sns is-square"></a></p>
        </div>
        <div class="rv-footer__right">
          <ul class="rv-footer__nav">
            <li><a href="guide.html"><span lang="en">SAILING</span><small>Sailing a Yacht</small></a></li>
            <li><a href="guide.html"><span lang="en">BASS FISHING</span><small>Bass fishing</small></a></li>
            <li><a href="#contact"><span lang="en">CONTACT</span><small>Inquiry</small></a></li>
          </ul>
          <div class="rv-footer__blogs"><a class="rv-blog is-cyan" href="#"><span lang="en">MARINA CLUB BLOG</span><small>Marina Club Journal</small><i aria-hidden="true"></i></a><a class="rv-blog is-orange" href="#"><span lang="en">BASS CLUB BLOG</span><small>Bass Club Journal</small><i aria-hidden="true"></i></a></div>
        </div>
        <div class="rv-footer__bottom">
          <ul><li><a href="about.html">Company overview</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Cookie Policy</a></li><li><a href="#">Deal tag ↗</a></li></ul>
          <p lang="en">©COMPANY co.,ltd</p>
        </div>
      </div>`;
  }

  // Pill slot filling — adds a yellow pill arrow at the end of links with data-rv-pill
  document.querySelectorAll("[data-rv-pill]").forEach((a) => a.insertAdjacentHTML("beforeend", pill(a.dataset.rvPill || "")));
  document.querySelectorAll("[data-rv-pill-slot]").forEach((n) => n.outerHTML = pill());
  document.querySelectorAll("[data-rv-pill-host]").forEach((n) => { n.setAttribute("aria-hidden", "true"); n.innerHTML = '<span data-fx="arrow-pass-hover" data-fx-arrow-pass-hover="look: slide">' + arrow + arrow + "</span>"; });
})();
