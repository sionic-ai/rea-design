// Two layers of frame — the first page (open-campus special) and sub pages (the university main site) each use a different header and footer.
// The header and footer of the sub pages are identical across all four, so they’re built once here and put into the [data-u-header]·[data-u-footer] slots.
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Original subpages unfold panels with jQuery (slideToggle default 400ms swing) — load the same jQuery and call it as is */
  const $ = window.jQuery;
  const slide = (el, open) => {
    if (!$ || reduce) { el.style.display = open ? "block" : "none"; return; }
    $(el).slideToggle();
  };

  /* Original first page: section links use scrollIntoView smooth (browser default curve) */
  if (body.classList.contains("p-oc")) {
    const btn = document.querySelector(".oc-hamburger");
    const drawer = document.querySelector(".oc-drawer");
    const close = () => { btn?.classList.remove("active"); drawer?.classList.remove("active"); body.classList.remove("menu-open"); };
    btn?.addEventListener("click", () => {
      btn.classList.toggle("active");
      drawer.classList.toggle("active");
      body.classList.toggle("menu-open");
    });
    drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    });
    return;
  }

  if (!body.classList.contains("p-uni")) return;

  const gnav = ["School Overview", "Undergraduate · Graduate", "Student Life", "Career & guidance support", "Research · Regional collaboration", "Admissions Info"];
  const ic = {
    user: '<svg viewBox="0 0 18 22" aria-hidden="true"><circle cx="9" cy="7" r="4.5"/><path d="M1.5 21c0-5 3.4-8 7.5-8s7.5 3 7.5 8"/></svg>',
    pin: '<svg viewBox="0 0 18 22" aria-hidden="true"><path d="M9 21s7-7 7-12.5a7 7 0 10-14 0C2 14 9 21 9 21z"/><circle cx="9" cy="8.5" r="2.5"/></svg>',
    search: '<svg viewBox="0 0 18 22" aria-hidden="true"><circle cx="8" cy="9" r="6"/><path d="M12.5 13.5 17 18"/></svg>',
    doc: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5h7l3 3v10H3zM6 7h5M6 10h5"/></svg>',
    pen: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 14l1-4 8-8 3 3-8 8zM9.5 3.5l3 3"/></svg>',
    book: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3c2-1 4.5-1 6.5.5 2-1.5 4.5-1.5 6.5-.5v10c-2-1-4.5-1-6.5.5-2-1.5-4.5-1.5-6.5-.5zM8 3.5v10"/></svg>',
    home: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M2 9 9 2.5 16 9M4 7.5V16h10V7.5"/></svg>',
    up: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M9 16V3M4 8l5-5 5 5"/></svg>',
    back: '<svg viewBox="0 0 18 18" aria-hidden="true"><path d="M16 9H3M8 4 3 9l5 5"/></svg>',
  };
  const mark = '<svg viewBox="0 0 40 40" aria-hidden="true"><path class="s-mark" d="M3 4h34v18c0 9-8 14-17 16C11 36 3 31 3 22z"/><path class="s-mark-in" d="M9 10h8v3h-5v3h5v9H9v-3h5v-3H9zm10 0h3v15h-3zm5 0h8v3h-2.5v12h-3V13H24z"/></svg>';
  const logo = `<a href="index.html" class="site-logo" data-label="School logo (emblem + name + English name)">${mark}<span class="site-logo__txt"><span class="site-logo__tag">Your school motto in one line here</span><span class="site-logo__name">Your school name here</span><span class="site-logo__en">SCHOOL NAME OF TECHNOLOGY</span></span></a>`;
  const sns = '<li><a href="#" aria-label="Video channel"><svg viewBox="0 0 32 24"><path d="M31 5.5c-.4-1.4-1.4-2.5-2.8-2.9C25.7 2 16 2 16 2s-9.7 0-12.2.6C2.4 3 1.4 4.1 1 5.5.4 8 .4 12 .4 12s0 4 .6 6.5c.4 1.4 1.4 2.5 2.8 2.9C6.3 22 16 22 16 22s9.7 0 12.2-.6c1.4-.4 2.4-1.5 2.8-2.9.6-2.5.6-6.5.6-6.5s0-4-.6-6.5zM12.8 16.8V7.2l8.2 4.8z"/></svg></a></li>'
    + '<li><a href="#" aria-label="Photo channel"><svg viewBox="0 0 30 30"><path d="M15 2.7c4 0 4.5 0 6.1.1 4 .2 5.9 2.1 6.1 6.1.1 1.6.1 2.1.1 6.1s0 4.5-.1 6.1c-.2 4-2.1 5.9-6.1 6.1-1.6.1-2.1.1-6.1.1s-4.5 0-6.1-.1c-4-.2-5.9-2.1-6.1-6.1-.1-1.6-.1-2.1-.1-6.1s0-4.5.1-6.1c.2-4 2.1-5.9 6.1-6.1 1.6-.1 2.1-.1 6.1-.1zM15 0c-4.1 0-4.6 0-6.2.1C3.4.3.3 3.3.1 8.8 0 10.4 0 10.9 0 15s0 4.6.1 6.2c.2 5.4 3.3 8.5 8.7 8.7 1.6.1 2.1.1 6.2.1s4.6 0 6.2-.1c5.4-.2 8.5-3.3 8.7-8.7.1-1.6.1-2.1.1-6.2s0-4.6-.1-6.2C29.7 3.4 26.7.3 21.2.1 19.6 0 19.1 0 15 0zm0 7.3a7.7 7.7 0 100 15.4 7.7 7.7 0 000-15.4zM15 20a5 5 0 110-10 5 5 0 010 10zm8-14.8a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6z"/></svg></a></li>'
    + '<li><a href="#" aria-label="Short-post channel"><svg viewBox="0 0 29 28"><path d="M17.3 11.8 28 0h-2.6l-9.3 10.3L8.7 0H0l11.3 15.4L0 28h2.6l9.9-10.9L20.3 28H29zm-3.5 3.8-1.1-1.6L3.5 1.9h3.9l7.3 10.1 1.2 1.6 9.5 13.1h-3.9z"/></svg></a></li>'
    + '<li class="is-line"><a href="#" aria-label="Messenger channel"><svg viewBox="0 0 36 12"><path d="M0 0h2v10h5v2H0zm9 0h2v12H9zm5 0h2l5 8V0h2v12h-2l-5-8v8h-2zm12 0h7v2h-5v3h5v2h-5v3h5v2h-7z"/></svg></a></li>'
    + '<li><a href="guide.html" aria-label="Mail news"><svg viewBox="0 0 30 26"><path d="M3 3h24v16H3zm1.5 1.5L15 12l10.5-7.5V17.5h-21z"/></svg></a></li>';

  const head = document.querySelector("[data-u-header]");
  if (head) {
    head.innerHTML = `
<div class="u-header__bar">
  <div class="u-header__main"><p class="logo">${logo}</p></div>
  <div class="u-header__sub">
    <div class="u-header__sub-inner">
      <div class="u-btns">
        <a href="#" class="u-btn u-btn--1">${ic.book}<span>Current student</span></a>
        <a href="index.html" class="u-btn u-btn--2">${ic.pen}<span>Exam candidate</span></a>
        <a href="form.html" class="u-btn u-btn--3">${ic.doc}<span>Request Materials</span></a>
        <a href="form.html" class="u-btn u-btn--4"><span>Contact Us</span></a>
      </div>
      <nav class="u-gnav" aria-label="Main menu"><ul>${gnav.map((t, i) => `<li><a href="${i === 5 ? "workshop.html" : "#"}" class="u-gnav__link${i === 5 ? " is-current" : ""}">${t}</a></li>`).join("")}</ul></nav>
    </div>
    <div class="u-subnav">
      <a href="#" role="button" class="u-icon-link" data-u-toggle="target">${ic.user}By Visitor</a>
      <a href="index.html#access" class="u-icon-link">${ic.pin}Directions</a>
    </div>
    <ul class="u-pop u-pop--target" data-u-pop="target">
      <li><a href="index.html">Exam candidate</a></li><li><a href="#">Current student</a></li><li><a href="#">Guardian</a></li>
      <li><a href="#">Graduate</a></li><li><a href="#">Regional · General</a></li><li><a href="#">Company</a></li>
    </ul>
    <div class="u-search">
      <div class="u-search__btn" role="button" tabindex="0" data-u-toggle="search">${ic.search}Search</div>
      <div class="u-pop u-pop--search" data-u-pop="search"><form role="search" onsubmit="return false"><input type="text" aria-label="Site Search"><button type="submit" aria-label="Search">${ic.search}</button></form></div>
    </div>
  </div>
  <button type="button" class="u-menu-btn" aria-label="Menu"><i></i><i></i><i></i><em>Menu</em></button>
</div>
<nav class="u-drawer" aria-label="Phone menu" data-slot="mobile-menu">
  <ul>${gnav.map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul>
  <ul class="is-split"><li><a href="index.html">Exam candidate</a></li><li><a href="#">Current student</a></li></ul>
  <ul><li><a href="#">Guardian</a></li><li><a href="#">Graduate</a></li><li><a href="#">Regional · General</a></li><li><a href="#">Company</a></li></ul>
  <div class="u-drawer__btns"><a href="form.html">Request Materials</a><a href="form.html">Contact Us</a><a href="index.html#access">Directions</a></div>
</nav>`;
  }

  const foot = document.querySelector("[data-u-footer]");
  if (foot) {
    foot.innerHTML = `
<div class="u-footer__top">
  <div class="wf-img ph" data-label="Campus building exterior · dusk · dark-tinted landscape strip"></div>
  <div class="u-footer__title-wrap"><h2 class="u-footer__title">Related Sites</h2></div>
  <div class="u-footer__links-wrap"><ul class="u-footer__links">
    <li><a href="#">Your affiliated institution name here</a></li><li><a href="#">Your information center name here</a></li>
    <li><a href="#">Your support group name here</a></li><li><a href="#">Your alumni association name here</a></li>
    <li><a href="#">Your affiliated high school name here</a></li>
  </ul></div>
</div>
<div class="u-footer__body">
  <div class="u-footer__sns"><ul>${sns}</ul></div>
  <div class="u-footer__contents">
    <div class="u-footer__sig">
      <p>Your school name here</p>
      <address>Postal code 000-0000 Your school address here in one line</address>
      <a href="form.html" class="u-footer__contact"><span>Questions? Contact us here</span></a>
    </div>
    <nav class="u-footer__nav"><ul>
      <li><a href="#">Sitemap</a></li><li><a href="#">Site Policy</a></li><li><a href="#">Privacy policy</a></li>
      <li><a href="#">Voice browser guide</a></li><li><a href="#">Staff Hiring</a></li>
    </ul></nav>
  </div>
  <p class="u-footer__copy">Copyright© School Name of Technology,<br class="sp-only"> All Rights Reserved.</p>
</div>
<div class="u-fixed u-fixed--docreq"><a href="form.html">${ic.doc}Materials<br>Application</a></div>
<div class="u-fixed u-fixed--gotop"><a href="#top">${ic.up}PAGE<br>TOP</a></div>`;
  }

  /* Main menu: on hover that cell gets active (underline + down triangle marker). The original applies it only at 989px and up */
  const wide = matchMedia("(min-width: 989px)");
  document.querySelectorAll(".u-gnav__link").forEach((a) => {
    a.addEventListener("mouseenter", () => { if (wide.matches) a.parentElement.classList.add("active"); });
    a.addEventListener("mouseleave", () => a.parentElement.classList.remove("active"));
  });

  document.querySelectorAll("[data-u-toggle]").forEach((b) => {
    const pop = document.querySelector(`[data-u-pop="${b.dataset.uToggle}"]`);
    if (!pop) return;
    b.addEventListener("click", (e) => { e.preventDefault(); slide(pop, getComputedStyle(pop).display === "none"); });
    b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); b.click(); } });
  });

  const menu = document.querySelector(".u-menu-btn");
  const drawer = document.querySelector(".u-drawer");
  menu?.addEventListener("click", () => { menu.classList.toggle("active"); drawer?.classList.toggle("active"); });

  /* Original: section links use jQuery animate 550ms swing, and scroll less by the fixed header height (120 · 98 · 84) */
  const offset = () => (innerWidth >= 769 ? 120 : 84);
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const t = id === "#top" ? document.body : id.length > 1 && document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const y = id === "#top" ? 0 : t.getBoundingClientRect().top + scrollY - offset();
      if (reduce || !$) { scrollTo(0, y); return; }
      $("html, body").animate({ scrollTop: y }, 550, "swing");
    });
  });
})();
