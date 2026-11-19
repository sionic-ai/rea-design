/* Spans many pages — header (top info row, menu panel, shrinks into a rounded white panel on scroll) · drawer · floating staff button · footer · footer-end art, 
   On load is-loaded (after .5s), at 2/3 scroll is-start, accordion, left table of contents */
(() => {
  const body = document.body;
  const arrow = '<span class="c-icon"><svg viewBox="0 0 20 16" aria-hidden="true"><path d="M12 1.5 18.5 8 12 14.5l-1.4-1.4 4.1-4.1H1.5V7h13.2l-4.1-4.1Z"/></svg></span>';
  const blank = '<span class="c-icon is-plain"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 3H3v14h14v-5h-2v3H5V5h3Zm3-2v2h4.6L8.3 10.3l1.4 1.4L17 4.4V9h2V1Z"/></svg></span>';
  const logo = '<span class="sg-logo" data-label="Organization logo — round swirl mark + two-line corporation name + English name"><svg class="sg-logo__mark" viewBox="0 0 54 54" aria-hidden="true"><circle cx="24" cy="30" r="18"/><path class="sw" d="M24 30c0-8 6-14 14-14"/><circle class="dot" cx="42" cy="10" r="6"/></svg><span class="sg-logo__txt"><small>Your company type here</small><b>Your foundation name here</b><i>FOUNDATION NAME FOR SCHOOLS</i></span></span>';
  const NAV = [
    { key: "reduce", label: "Menu 1 Your program here", head: "Your menu title here", text: "Your two lines describing this menu set here.", items: ["Your submenu 1 here", "Your submenu 2 here", "Your submenu 3 here", "Your submenu 4 here"], href: "service.html" },
    { key: "loan", label: "Menu 2 Rentals", head: "Your menu title here", text: "Your description, one line.", items: ["Your submenu 1 here", "Your submenu 2 here"], href: "service.html" },
    { key: "info", label: "Menu 3 Guardian info", head: "Your menu title here", text: "Your description, one line.", items: ["Your submenu 1 here", "Your submenu 2 here"], href: "news.html" },
    { key: "about", label: "Menu 4 Foundation About", head: "Your menu title here", text: "Your description, two lines.", items: ["Your submenu 1 here", "Your submenu 2 here", "Your submenu 3 here", "Your submenu 4 here"], href: "about.html" },
    { key: "school", label: "Menu 5 School info", head: "Your menu title here", text: "Your description, one line.", items: ["Your submenu 1 here", "Your submenu 2 here"], href: "news.html" },
  ];

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.classList.add("l-header");
    header.innerHTML = `<div class="l-header__inner">
      <a class="l-header__logo" href="index.html">${logo}</a>
      <div class="l-header__container">
        <div class="l-header__info">
          <ul class="l-header__tab"><li class="l-header__tab-item is-active"><a class="l-header__tab-link" href="index.html">Citizens and Guardians</a></li><li class="l-header__tab-item"><a class="l-header__tab-link" href="about.html">School Staff</a></li></ul>
          <ul class="l-header__menu"><li class="l-header__menu-item"><a href="mailto:contact@example.com">Inquiry</a></li><li class="l-header__menu-item"><select class="gt_selector" aria-label="Select language"><option>(Machine translation) Select language</option><option>English</option><option>中文</option><option>Korean</option></select><button class="l-header__furigana" type="button" aria-pressed="false">Reading aid ON</button></li><li class="l-header__menu-item"><button class="l-header__search js-nav" type="button" data-nav="search" aria-expanded="false" aria-label="Open search"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M7.5 1a6.5 6.5 0 0 1 5.2 10.4l4.3 4.3-1.3 1.3-4.3-4.3A6.5 6.5 0 1 1 7.5 1Zm0 1.8a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Z"/></svg></button></li></ul>
        </div>
        <ul class="l-header__nav">${NAV.map((n) => `<li><button class="l-header__nav-item js-nav" type="button" data-nav="${n.key}" aria-expanded="false">${n.label}</button>
          <nav class="l-header__nav-contents" data-content="${n.key}" aria-hidden="true" inert><div class="l-header__nav-inner"><button class="l-header__nav-close js-nav-close" type="button" aria-label="Close"></button>
            <div class="l-header__nav-desc"><h3 class="l-header__nav-head">${n.head}</h3><p class="l-header__nav-text">${n.text}</p></div>
            <ul class="l-header__nav-menu">${n.items.map((t) => `<li><a class="l-header__nav-link hover-wrapper" href="${n.href}">${t}${arrow}</a></li>`).join("")}</ul>
          </div></nav></li>`).join("")}</ul>
        <nav class="l-header__nav-contents" data-content="search" aria-hidden="true" inert><div class="l-header__nav-inner"><button class="l-header__nav-close js-nav-close" type="button" aria-label="Close search"></button><form class="p-search__form" role="search" onsubmit="return false"><input class="p-search__input" type="search" placeholder="Your search term here." aria-label="Search term"><button class="p-search__submit" type="submit" aria-label="Search">Search</button></form></div></nav>
        <div class="l-header__nav-bg"></div>
      </div>
      <button class="l-header__btn" type="button" aria-label="Open Menu"><span class="l-header__btn-bar"></span><span class="l-header__btn-bar"></span><span class="l-header__btn-bar"></span></button>
    </div>
    <nav class="l-header__drawer" aria-hidden="true" data-slot="drawer">
      <button class="l-header__drawer-close js-drawer-close" type="button" aria-label="Close"></button>
      <div class="l-header__drawer-info"><div class="l-header__drawer-img iso" data-iso="island" data-label="Isometric illustration, left of drawer"></div><a class="l-header__drawer-logo" href="index.html">${logo}</a><p class="l-header__drawer-text">Introduce the organization in one line here.</p></div>
      <div class="l-header__drawer-inner">${NAV.map((n) => `<details class="c-accordion__details js-accordion-details sp" open><summary class="c-accordion__summary js-accordion-summary"><h3 class="l-header__drawer-title">${n.label}</h3></summary><ul class="c-accordion__contents js-accordion-contents">${n.items.map((t) => `<li class="l-header__drawer-link"><a class="hover-wrapper" href="${n.href}">${t}${arrow}</a></li>`).join("")}</ul></details>`).join("")}</div>
    </nav>`;
    // Menu panel — pressing opens only that panel, pressing again or close or Esc closes it (original header-nav.js)
    const closeAll = () => {
      header.querySelectorAll(".js-nav").forEach((b) => b.setAttribute("aria-expanded", "false"));
      header.querySelectorAll(".l-header__nav-contents").forEach((c) => { c.setAttribute("aria-hidden", "true"); c.inert = true; });
      body.classList.remove("is-nav-open");
    };
    header.addEventListener("click", (e) => {
      const nav = e.target.closest(".js-nav");
      if (nav) {
        const on = nav.getAttribute("aria-expanded") === "true";
        closeAll();
        if (!on) {
          nav.setAttribute("aria-expanded", "true");
          const box = header.querySelector(`.l-header__nav-contents[data-content="${nav.dataset.nav}"]`);
          box.setAttribute("aria-hidden", "false");
          box.inert = false;
          body.classList.add("is-nav-open");
        }
        return;
      }
      if (e.target.closest(".js-nav-close") || e.target.closest(".l-header__nav-bg")) closeAll();
    });
    addEventListener("keydown", (e) => e.key === "Escape" && (closeAll(), body.classList.remove("is-drawer-open")));
    const furi = header.querySelector(".l-header__furigana");
    furi.addEventListener("click", () => { const on = furi.getAttribute("aria-pressed") !== "true"; furi.setAttribute("aria-pressed", String(on)); furi.textContent = on ? "Reading aid OFF" : "Reading aid ON"; });
    const drawer = header.querySelector(".l-header__drawer");
    header.querySelector(".l-header__btn").addEventListener("click", () => { body.classList.add("is-drawer-open"); drawer.setAttribute("aria-hidden", "false"); });
    header.querySelector(".js-drawer-close").addEventListener("click", () => { body.classList.remove("is-drawer-open"); drawer.setAttribute("aria-hidden", "true"); });
  }

  const flow = document.createElement("a");
  flow.className = "p-home-flowbtn";
  flow.href = "about.html";
  flow.dataset.slot = "flow-button";
  flow.innerHTML = '<span class="iso" data-iso="flow" data-label="Illustration of a person raising a hand on a pink disc"></span><span class="p-home-flowbtn__txt">Your team members here<br>Guide button</span>';
  document.querySelector("main")?.before(flow);

  const footer = document.querySelector("[data-slot=footer]");
  if (footer) {
    footer.innerHTML = `<div class="l-footer">
      <div class="l-footer__inner">
        <div class="l-footer__body">
          <p class="l-footer__catch">Your institution’s one-line pledge here<br>Place it in two lines</p>
          <div class="l-footer__info"><p class="l-footer__address">Your postal code, one-line address, building name and 0F here.</p><a class="l-footer__map hover-wrapper" href="https://example.com/">View Map${blank}</a></div>
          <button class="l-footer__pagetop js-pagetop" type="button"><svg class="l-footer__pagetop-icon" viewBox="0 0 40 40" aria-hidden="true"><path d="m20 14 7 8h-14z"/></svg>Page Top</button>
        </div>
        <div class="l-footer__container">
          <div class="l-footer__menu">
            <ul class="l-footer__main"><li><a href="news.html">Your menu 1 here</a></li><li><a href="index.html">Your menu 2 for guardians here</a></li><li><a href="about.html">Your menu 3 for staff here</a></li><li><a href="about.html">Your menu 4 intro here</a></li></ul>
            <ul class="l-footer__sub"><li><a href="https://example.com/">Your personal info here</a></li><li><a href="https://example.com/">Your usage guide here</a></li><li><a href="https://example.com/">Your sitemap here</a></li></ul>
          </div>
          <div class="l-footer__btn-container">
            <a class="l-footer__btn hover-wrapper" href="https://example.com/"><span class="l-footer__btn-en">Contact</span><span class="l-footer__btn-ja">Inquiry</span><span class="l-footer__btn-text">Your one line inviting inquiries goes here.${arrow}</span></a>
            <a class="l-footer__btn hover-wrapper" href="https://example.com/"><span class="l-footer__btn-en">Official Messenger</span><span class="l-footer__btn-ja">Your official messenger account here</span><span class="l-footer__btn-text">Your line saying alerts arrive by messenger.${arrow}</span></a>
            <button class="l-footer__line c-modal__btn js-modal-btn" type="button" aria-expanded="false">Your view-notice info here</button>
            <div class="c-modal" role="dialog" aria-modal="true" aria-label="Notice guide"><div class="c-modal__wrap"><button class="c-modal__close js-modal-close" type="button">Close</button><div class="c-modal__content"><h3 class="c-title-h3"><span class="c-title-h3__text">Your notification info title here</span></h3><p>Your three or four lines here explaining what messenger notifications are. Say how to receive them and how to stop.</p><h4 class="c-title-h4">Your section title here</h4><p>Your terms · notes in two lines here.</p></div></div></div>
            <div class="c-modal__overlay js-modal-overlay"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="l-footer-end js-scroll" data-slot="footer-scene">
      <div class="l-footer-end__bg"></div>
      <div class="l-footer-end__img iso" data-iso="town" data-label="Cherry trees, school, school gate, walking students — village illustration at the end of the Footer"></div>
      <div class="l-footer-end__container"><div class="l-footer-end__info">${logo}<p class="l-footer-end__copyright">© 2025 Your institution name here</p></div></div>
    </div>`;
  }
  if (window.SG_ISO) SG_ISO.paint();

  // Notification guide modal — the curtain and panel turn on in .5s via the button’s aria-expanded (original c-modal)
  document.querySelectorAll(".js-modal-btn").forEach((btn) => {
    const set = (on) => { btn.setAttribute("aria-expanded", String(on)); body.classList.toggle("is-modal-open", on); };
    btn.addEventListener("click", () => set(true));
    btn.parentElement.querySelectorAll(".js-modal-close, .js-modal-overlay").forEach((x) => x.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Loading — original $("#loading").delay(500) then is-loaded, the hero sets up in sequence
  setTimeout(() => body.classList.add("is-loaded"), reduce ? 0 : 500);
  // Scroll detection — past 64px is-scroll (header shrinks), .js-scroll gets is-start past the 2/3 screen line · removed when scrolling back up
  const onScroll = () => {
    body.classList.toggle("is-scroll", scrollY >= 64);
    const line = scrollY + innerHeight / 1.5;
    document.querySelectorAll(".js-scroll").forEach((el) => el.classList.toggle("is-start", reduce || line > el.getBoundingClientRect().top + scrollY));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Accordion — height · opacity 300ms ease-out (Web Animations). .sp is always open above 1279px
  const timing = { duration: reduce ? 0 : 300, easing: "ease-out" };
  const fit = () => document.querySelectorAll(".js-accordion-details.sp").forEach((d) => { if (innerWidth >= 1279) { d.open = true; d.classList.add("is-open"); } });
  document.querySelectorAll(".js-accordion-details").forEach((d) => {
    const sum = d.querySelector(".js-accordion-summary"), box = d.querySelector(".js-accordion-contents");
    if (d.open) d.classList.add("is-open");
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if ((d.classList.contains("sp") && innerWidth >= 1279) || d.dataset.anim === "running") return;
      d.dataset.anim = "running";
      if (d.open) {
        d.classList.remove("is-open");
        box.animate([{ height: `${box.offsetHeight}px`, opacity: 1 }, { height: 0, opacity: 0 }], timing).onfinish = () => { d.removeAttribute("open"); d.dataset.anim = ""; };
      } else {
        d.setAttribute("open", "");
        d.classList.add("is-open");
        box.animate([{ height: 0, opacity: 0 }, { height: `${box.offsetHeight}px`, opacity: 1 }], timing).onfinish = () => { d.dataset.anim = ""; };
      }
    });
  });
  fit();
  addEventListener("resize", fit);

  // Back to top — original scrolls smoothly
  document.querySelectorAll(".js-pagetop").forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })));

  // Left table of contents — builds the list from body h2 and h3, lights the heading closest to the line 10% from the screen top
  const content = document.querySelector(".c-page__body"), toc = document.querySelector(".js-sidebar-toc");
  if (content && toc) {
    const heads = [...content.querySelectorAll("h2, h3")];
    const ul = document.createElement("ul");
    ul.className = "l-sidebar-toc__list";
    let sub = null, last = null;
    heads.forEach((h, i) => {
      if (!h.id) h.id = `heading-${i}`;
      const li = document.createElement("li"), a = document.createElement("a");
      li.className = `l-sidebar-toc__item ${h.tagName.toLowerCase()}`;
      a.href = `#${h.id}`;
      a.textContent = h.textContent.trim();
      li.append(a);
      if (h.tagName === "H2" || !last) { ul.append(li); last = li; sub = null; }
      else { if (!sub) { sub = document.createElement("ul"); sub.className = "l-sidebar-toc__sublist"; last.append(sub); } sub.append(li); }
    });
    toc.append(ul);
    const links = toc.querySelectorAll("a");
    const spy = () => {
      const y = innerHeight * 0.1;
      let best = null, d = Infinity;
      heads.forEach((h) => { const t = Math.abs(h.getBoundingClientRect().top - y); if (t < d) { d = t; best = h; } });
      links.forEach((l) => l.classList.toggle("is-active", best && l.getAttribute("href") === `#${best.id}`));
    };
    addEventListener("scroll", spy, { passive: true });
    spy();
  }
})();
