(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const page = body.dataset.page || "";

  const arrow = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 8h13M9 3l5 5-5 5" fill="none" stroke="currentColor"/></svg>';
  const ext = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2H2v12h12v-4M9 2h5v5M14 2 7 9" fill="none" stroke="currentColor"/></svg>';
  const mark = '<svg class="ar-mark" viewBox="0 0 26 26" aria-hidden="true"><rect x="1" y="1" width="24" height="24" fill="none" stroke="currentColor"/><path d="M6 19 13 6l7 13M9 14h8" fill="none" stroke="currentColor"/></svg>';
  const logo = `${mark}<span class="ar-word" data-label="Brand English logo + small English tagline">Brand Name<small>Pro</small></span>`;
  const bottomLinks = [
    ["Contact", "Request a consultation", "index.html#contact", arrow],
    ["Store List", "Installer List", "list.html", ext],
    ["Online Shop", "Overseas car wash supplies select shop", "#", ext],
    ["Our Channel", "Official channel that sends coupons regularly", "#", ext],
  ];
  const lineLinks = (cls) => bottomLinks.map(([en, sub, href, icon]) => `
    <div class="${cls}"><a class="ar-line-link" href="${href}"><div class="ar-line-link__ttl"><span class="ar-line-link__en" data-label="English section name">${en}</span><span class="ar-line-link__sub c-txt_medium">${sub}</span></div><span class="ar-line-link__icon">${icon}</span></a></div>`).join("");

  // Two headers — logo and table of contents (white text) / blend-mode button and hamburger. The drawer sits inside the first header (original structure)
  const headSlot = document.querySelector("[data-site-header]");
  if (headSlot) {
    const leftNav = [["Concept", "index.html#concept"], ["Column", "news.html"], ["Brand", "index.html#brand"], ["Interview", "index.html#interview"], ["Frequently asked questions", "index.html#faq"], ["News", "index.html#news"]];
    const drawer = [["Home", "index.html", "is-home", "Home"], ["Concept", "index.html#concept", "is-c2", "Concept"], ["Column", "news.html", "is-c3", "Column"], ["News", "index.html#news", "is-c4", "News"], ["Brand", "about.html", "is-c2", "Brand"], ["Interview", "index.html#interview", "is-c3", "Interview"], ["FAQ", "index.html#faq", "is-c2", "Frequently asked questions"], ["About", "index.html#about", "is-c3", "About us"]];
    headSlot.outerHTML = `
<header id="header" class="p-header" data-slot="header">
  <div class="p-header_inner">
    <div class="p-header_left">
      <h1 class="p-header_logo"><a href="index.html">${logo}</a></h1>
      <ul class="p-header_left_list_wrapper">${leftNav.map(([t, h]) => `<li><a href="${h}" class="p-header_left_list_link">${t}</a></li>`).join("")}</ul>
    </div>
    <div class="p-header_content_wrapper" data-lenis-prevent data-slot="drawer">
      <div class="p-header_right"><button class="p-header_btn_burger" type="button" aria-label="Close Menu"><span></span><span></span></button></div>
      <div class="p-header_content">
        <div class="p-header_content_top"><ul class="p-header_content_top_list_wrapper" data-label="Eight English section names">${drawer.map(([t, h, c, s]) => `<li class="p-header_content_top_list ${c}"><a class="p-header_content_top_list_link" href="${h}" data-sub="${s}">${t}</a></li>`).join("")}</ul></div>
        <div class="p-header_content_sns"><ul class="p-header_content_sns_lists"><li><a href="#" class="ar-sns" aria-label="Photo SNS"></a></li><li><a href="#" class="ar-sns is-round" aria-label="Short-text SNS"></a></li></ul></div>
        <div class="p-header_content_bottom">${lineLinks("p-header_content_bottom_section")}</div>
      </div>
      <div class="p-header_content_bg"></div>
    </div>
  </div>
</header>
<header class="p-header is-blend" data-slot="header-buttons">
  <div class="p-header_inner">
    <div class="p-header_right">
      <div class="p-header_btn"><a class="p-header_btn_link" href="list.html"><svg viewBox="0 0 22 15" aria-hidden="true"><path d="M1 14V5l10-4 10 4v9M5 14V8h12v6" fill="none" stroke="currentColor"/></svg>Installer List</a></div>
      <div class="p-header_btn"><a class="p-header_btn_link" href="#contact"><svg viewBox="0 0 22 15" aria-hidden="true"><rect x="1" y="1" width="20" height="13" fill="none" stroke="currentColor"/><path d="m1 1 10 7 10-7" fill="none" stroke="currentColor"/></svg>Consult via form</a></div>
      <button class="p-header_btn_burger" type="button" aria-label="Open Menu"><span></span><span></span></button>
    </div>
  </div>
</header>`;
  }

  const footSlot = document.querySelector("[data-site-footer]");
  if (footSlot) {
    footSlot.outerHTML = `
<div class="p-product_contact" data-slot="contact-float">
  <p class="p-product_contact_txt">Product inquiries here</p>
  <div class="p-product_contact_btns"><a href="list.html" class="p-product_contact_btn">Installer List</a><a href="#contact" class="p-product_contact_btn">Consult via form</a></div>
</div>
<div class="p-fix_cv" data-slot="fix-bar"><a href="list.html" class="p-fix_cv_link"><span class="p-fix_cv_link_txt">Installer List</span></a><a href="#contact" class="p-fix_cv_link"><span class="p-fix_cv_link_txt">Consult via form</span></a></div>
<footer class="p-footer" data-slot="footer">
  <div class="p-footer_container p-container">
    <div class="p-footer_left">
      <a href="index.html" class="p-footer_logo">${logo}</a>
      <ul class="p-footer_nav_lists">${[["Concept", "index.html#concept"], ["Interview", "index.html#interview"], ["Brand", "about.html"], ["About us", "index.html#about"], ["Frequently asked questions", "index.html#faq"], ["News", "index.html#news"], ["Column", "news.html"]].map(([t, h]) => `<li class="p-footer_nav_list"><a href="${h}">${t}</a></li>`).join("")}</ul>
      <div class="p-footer_sns"><ul class="p-footer_sns_lists"><li><a href="#" class="ar-sns" aria-label="Photo SNS"></a></li><li><a href="#" class="ar-sns is-round" aria-label="Short-text SNS"></a></li></ul></div>
    </div>
    <div class="p-footer_right">${lineLinks("p-footer_section")}</div>
  </div>
  <p class="p-footer_copy" data-label="Copyright line · company name in English">©0000 Company Name</p>
  <a class="p-footer_top" href="#top" data-top><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 12l6-6 6 6" fill="none" stroke="currentColor"/></svg><span class="p-footer_top_text">Back to top</span></a>
</footer>`;
  }

  // Smooth scroll — original lenis_init: duration .9 · 1.001 − 2^(−10t)
  const lenis = new Lenis({ duration: 0.9, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), autoRaf: true, allowNestedScroll: true });
  window.arLenis = lenis;
  if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);

  // The header has a delay per page and turns on at .9s (on the Hero, after loading ends)
  window.arHeader = (ms = 350) => document.querySelectorAll(".p-header").forEach((h) => setTimeout(() => h.classList.add("is-active"), reduce ? 0 : ms));
  if (body.dataset.header !== "manual") window.arHeader(+(body.dataset.header || 350));

  // Hamburger — drawer .35s, content .7s after a .2s delay
  const burgers = document.querySelectorAll(".p-header_btn_burger");
  const drawerEl = document.querySelector(".p-header_content_wrapper");
  burgers.forEach((b) => b.addEventListener("click", () => {
    const open = !drawerEl.classList.contains("is-open");
    body.classList.toggle("is-scroll", open);
    burgers.forEach((x) => x.classList.toggle("is-open", open));
    drawerEl.classList.toggle("is-open", open);
  }));
  document.querySelectorAll(".p-header_content_top_list_link, .p-header_content_bg").forEach((el) => el.addEventListener("click", () => {
    burgers.forEach((x) => x.classList.remove("is-open"));
    drawerEl.classList.remove("is-open");
    body.classList.remove("is-scroll");
  }));

  // On entry: is-active once when it passes 85% of the screen
  window.arInview = (cls = "js-inview") => {
    const els = [...document.querySelectorAll(`.${cls}`)];
    const check = () => {
      const line = scrollY + innerHeight * 0.85;
      els.forEach((el) => { if (!el.classList.contains("is-active") && line > el.getBoundingClientRect().top + scrollY) el.classList.add("is-active"); });
    };
    if (reduce) { els.forEach((el) => el.classList.add("is-active")); return; }
    check();
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
  };
  window.arInview();

  // Accordion — next sibling’s height used as the inner height
  document.querySelectorAll(".js-accordion").forEach((acc) => {
    const wrap = acc.nextElementSibling;
    const content = wrap?.querySelector(".js-accordion_content");
    if (!content) return;
    wrap.style.height = acc.classList.contains("is-active") ? `${content.offsetHeight}px` : "0";
    acc.addEventListener("click", () => {
      const on = acc.classList.toggle("is-active");
      wrap.style.height = on ? `${content.offsetHeight}px` : "0";
    });
  });
  addEventListener("resize", () => document.querySelectorAll(".js-accordion.is-active").forEach((acc) => {
    const c = acc.nextElementSibling?.querySelector(".js-accordion_content");
    if (c) acc.nextElementSibling.style.height = `${c.offsetHeight}px`;
  }));

  // In-page links — smooth scroll after .3s
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href) return;
    e.preventDefault();
    // Placeholder links (#) go to outside sites·PDFs in the original, so they stay in place instead of jumping to the top
    if (href === "#") return;
    const target = href === "#top" ? document.body : document.querySelector(href);
    if (!target) return;
    setTimeout(() => lenis.scrollTo(target, { duration: reduce ? 0 : 0.9 }), reduce ? 0 : 300);
  }));

  // Contact box — turns on when the bottom edge of the intro text (.js-contact_end) passes below the screen bottom, turns off when the footer enters. The phone bottom bar is hidden at the footer
  const bnr = document.querySelector(".p-product_contact");
  const end = document.querySelector(".js-contact_end");
  const cv = document.querySelector(".p-fix_cv");
  const footer = document.querySelector(".p-footer");
  const fix = () => {
    const bottom = scrollY + innerHeight;
    const footTop = footer ? footer.getBoundingClientRect().top + scrollY : Infinity;
    if (bnr && end) bnr.classList.toggle("is-active", bottom > end.getBoundingClientRect().bottom + scrollY && bottom <= footTop);
    if (cv) cv.classList.toggle("is-hidden", bottom > footTop);
  };
  addEventListener("scroll", fix, { passive: true });
  addEventListener("resize", fix);
  fix();

  // The first opened panel (Brand) keeps its background hidden and turns it on later — on the first page, index.js turns it on after the loading panel is up (so the first screen never shows before the loading panel)
  if (page !== "top") body.classList.add("is-active");
  window.arSite = { reduce, lenis };
  if (page) body.classList.add(`is-${page}`);
})();
