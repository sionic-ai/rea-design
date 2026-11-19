(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = body.dataset.page;

  // Logo spot — instead of the original leaf logo, our own symbol of the same size (a circle with one corner cut)
  const MARK = '<svg viewBox="0 0 54 54" aria-hidden="true"><path d="M27 2a25 25 0 1 1-25 25V2Z"/></svg>';
  const ICONS = {
    insta: '<svg viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" rx="4"/><circle cx="10" cy="10" r="3.2"/></svg>',
    x: '<svg viewBox="0 0 20 20"><path d="M4 4l12 12M16 4 4 16"/></svg>',
    fb: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5"/><path d="M10.8 17.5v-6.3h2.1M10.8 17.5V8.6c0-1 .6-1.6 1.6-1.6h1"/></svg>',
  };
  const NAV = [
    ["about.html", "About the association"], ["members.html", "Member"], ["news.html", "Notice"], ["index.html#member-news", "Member News"],
    ["index.html", "Yearbook"], ["index.html", "Publications"], ["index.html", "Inquiry"],
    ["index.html", "Online store"], ["index.html", "About the JTA"], ["index.html", "中文资讯"],
  ];
  const NEXT = { home: ["about.html", "About"], about: ["members.html", "Members"], members: ["news.html", "News"], news: ["index.html", "Home"] }[page] || ["index.html", "Home"];
  // Only the header name opens and folds with clip — the footer name is always visible (the original has no g-clip-reveal on the footer either)
  const title = (clip) => `<span class="t-title"><span class="t-title__legal${clip ? " t-clip" : ""}" data-label="Company type, one line">Specified nonprofit organization (NPO)</span><span class="t-title__name${clip ? " t-clip" : ""}" data-label="Association Name">Typography Association</span></span>`;

  const head = document.querySelector(".t-head");
  if (head) {
    head.innerHTML =
      '<div class="t-head__inner"><div class="t-head__fixed">' +
      `<div class="t-head__id">${page === "home" ? `<h1>${title(true)}</h1>` : `<a class="t-head__home" href="index.html">${title(true)}</a>`}<p class="t-head__en t-clip" data-label="Association name in English, three lines"><span>Typography</span><span>Society</span><span>Association</span></p></div>` +
      '<nav class="t-nav u-pc"><ul class="t-nav__list">' +
      NAV.map(([href, name]) => `<li><a class="t-nav__link t-clip" href="${href}">${name}</a></li>`).join("") +
      `</ul></nav></div><div class="t-head__logo t-mask"><a href="index.html" aria-label="First Page">${MARK}</a></div></div>`;
  }

  const side = document.createElement("div");
  side.className = "t-side";
  side.innerHTML = `<div class="t-side__inner"><small class="t-side__copy">© Typography Society Association</small><ul class="t-side__sns">${["insta", "x", "fb"].map((k) => `<li><a class="t-icon" href="#" aria-label="${k}">${ICONS[k]}</a></li>`).join("")}</ul></div>`;
  body.append(side);

  const foot = document.querySelector(".t-foot");
  if (foot) {
    foot.classList.add("t-grid");
    const links = (rows) => `<ul class="t-foot__links">${rows.map(([n, subs]) => `<li><a href="${n[0]}">${n[1]}</a>${subs ? `<ul>${subs.map((s) => `<li><a href="${n[0]}">${s}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}</ul>`;
    foot.innerHTML =
      `<div class="t-foot__o1">${title(false)}<ul class="t-foot__trans"><li><a href="index.html">About the JTA</a></li><li><a href="index.html">中文资讯</a></li></ul></div>` +
      `<div class="t-foot__o2">${links([[["about.html", "About the Association"], ["As an Organization", "An active association", "Membership Guide"]]])}</div>` +
      `<div class="t-foot__o3">${links([[["members.html", "Member"], ["Individual Member", "Overseas members", "Corporate members", "Honorary member"]]])}</div>` +
      `<div class="t-foot__o4">${links([[["index.html", "Yearbook"]], [["index.html", "Publications"], ["Typography annual", "Typographics", "Others"]]])}</div>` +
      '<div class="t-foot__o5"><ul class="t-foot__info"><li><a class="t-pill" href="index.html" data-fx="direction-tile-hover" data-fx-direction-tile-hover="axis: y; push: 0; dur: .22; ease: ease; out: .22; outEase: ease; gap: 0"><span data-fx-part="tile"></span>Online store</a></li><li><a class="t-pill" href="index.html" data-fx="direction-tile-hover" data-fx-direction-tile-hover="axis: y; push: 0; dur: .22; ease: ease; out: .22; outEase: ease; gap: 0"><span data-fx-part="tile"></span>Inquiry</a></li></ul></div>' +
      '<div class="t-foot__o6"><address class="t-foot__addr"><p>Secretariat</p><p>Postal code 000-0000</p><p>Your first address line goes here</p><p>Your building name 0F here</p><p>Phone 00-0000-0000</p><p>E-mail info@example.com</p></address></div>' +
      `<div class="t-foot__o7">${links([[["news.html", "Notice"]]])}</div>` +
      `<div class="t-foot__o8">${links([[["index.html#member-news", "Member News"]]])}</div>` +
      `<div class="t-foot__o9">${links([[["index.html", "Yearbook call-for-entries site"]], [["index.html", "Reading site"]]])}</div>` +
      `<div class="t-foot__o10"><div class="t-foot__util"><ul class="t-foot__policy"><li><a href="index.html">Privacy policy</a></li><li><a href="index.html">Site Policy</a></li></ul><ul class="t-foot__sns">${["insta", "x", "fb"].map((k) => `<li><a class="t-icon" href="#" aria-label="${k}">${ICONS[k]}</a></li>`).join("")}</ul></div></div>` +
      '<div class="t-foot__o11"><small class="t-foot__small">© Typography Society Association</small></div>' +
      '<div class="t-foot__o12"><p class="t-foot__small">Fonts provided by Type Foundry</p></div>';
  }

  // News row — shared by the first page and the notice page. Tags mix English categories (outlined) and committees (gray background)
  const NEWS = [
    ["Your news headline goes here in one line — the annual review session is complete", ["Annual", "Information"], ["Publishing Committee", "Association Notice"], "2026.11.02", "Yearbook cover photo · open book on gray paper · square"],
    ["News headline in one line — submissions open for the yearbook student category", ["Annual", "Information"], ["Publishing Committee", "Member Committee"], "2026.10.28", "Phone screen with contest notice · newspaper collage background · square"],
    ["Your one-line news title here — Special lecture registration open!", ["Event", "Information"], ["Publishing Committee", "Exhibition committee"], "2026.10.27", "Event poster · black vertical band · vertical writing · square"],
    ["Your news headline goes here in one line — announces touring exhibition and lecture sessions", ["Annual", "Event", "Information"], ["Exhibition committee"], "2026.10.05", "Gallery wall · light from above · square"],
    ["Your news title goes here, close to two lines — Gallery talk on the Annual Award Winners now open for sign-ups (Month 0, Day 0)", ["Event"], ["Exhibition committee", "Board of Education"], "2026.09.15", "Yearbook cover · two green semicircles · white background · square"],
  ];
  window.tNewsRows = (list, count) => {
    const tile = 'data-fx="direction-tile-hover" data-fx-direction-tile-hover="axis: y; push: 0; dur: .22; ease: ease; out: .22; outEase: ease; gap: 0"';
    list.innerHTML = Array.from({ length: count }, (_, i) => {
      const [t, en, ko, d, pic] = NEWS[i % NEWS.length];
      return `<li class="t-news__row" data-fx-part="row"><a class="t-news__link" href="news.html" ${tile}><span data-fx-part="tile"></span><div class="t-news__inner"><h3 class="t-news__title">${t}</h3><div class="t-news__meta"><ul class="t-tags">${en.map((x) => `<li><span class="t-tag">${x}</span></li>`).join("")}${ko.map((x) => `<li><span class="t-tag is-fill">${x}</span></li>`).join("")}</ul><time class="t-date">${d}</time></div></div></a><div data-fx-part="thumb"><div data-fx-part="clip"><div data-fx-part="media" class="wf-img" data-label="${pic}"></div></div></div></li>`;
    }).join("");
  };

  // Next guide section — one screen below the tail
  const next = document.createElement("aside");
  next.className = "t-next";
  next.dataset.slot = "next-page";
  next.dataset.scrollView = "is-view-next";
  next.innerHTML = `<div class="t-next__wrap" data-fx="type-next-link"><div class="t-next__text-wrap" data-fx-part="label"><span class="t-next__text" data-fx-part="text">Next</span><span class="t-next__name" data-fx-part="name" data-label="Next page English name">${NEXT[1]}</span></div><div class="t-next__mark t-mask"><a class="t-next__link" data-fx-part="link" href="${NEXT[0]}" aria-label="Next page">${MARK}</a></div></div>`;
  (document.querySelector(".t-foot") || document.querySelector("main")).after(next);

  // Phone menu
  const btn = document.createElement("div");
  btn.className = "t-menu-btn";
  btn.innerHTML = '<button type="button" aria-controls="t-menu" aria-expanded="false">Menu</button>';
  const menu = document.createElement("div");
  menu.className = "t-menu";
  menu.id = "t-menu";
  menu.dataset.slot = "sp-menu";
  menu.innerHTML =
    '<div class="t-menu__inner"><button class="t-menu__close" type="button" aria-label="Close Menu"></button><nav><ul class="t-menu__list">' +
    '<li><a href="index.html">First Page</a></li><li><a href="about.html">About the Association</a><ul><li><a href="about.html">As an Organization</a></li><li><a href="about.html">An active association</a></li><li><a href="about.html">Membership Guide</a></li></ul></li>' +
    '<li><a href="members.html">Member</a><ul><li><a href="members.html">Individual Member</a></li><li><a href="members.html">Overseas members</a></li><li><a href="members.html">Corporate members</a></li><li><a href="members.html">Honorary member</a></li></ul></li>' +
    '<li><a href="news.html">Notice</a></li></ul></nav>' +
    '<ul class="t-menu__info"><li><a class="t-pill" href="index.html">Online store</a></li><li><a class="t-pill" href="index.html">Inquiry</a></li></ul>' +
    '<address class="t-menu__addr"><p>Secretariat · Your address on one line here</p><p>Phone 00-0000-0000</p></address></div>';
  body.append(btn, menu);
  let closing = 0;
  const setMenu = (open) => {
    if (!open && !menu.classList.contains("is-open")) return;
    clearTimeout(closing);
    menu.classList.remove("is-closing");
    menu.classList.toggle("is-open", open);
    if (!open && !reduce) {
      menu.classList.add("is-closing");
      closing = setTimeout(() => {
        menu.style.transition = "none";
        menu.classList.remove("is-closing");
        void menu.offsetHeight;
        menu.style.transition = "";
      }, 300);
    }
    btn.querySelector("button").setAttribute("aria-expanded", String(open));
    body.style.overflow = open ? "hidden" : "";
  };
  btn.addEventListener("click", () => setMenu(true));
  menu.querySelector(".t-menu__close").addEventListener("click", () => setMenu(false));

  // Scroll state — is-scroll with any scroll down, is-scroll-flag and direction past 300px, is-scroll-middle when the screen center passes half the document
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    body.classList.toggle("is-scroll", y > 0);
    if (y < 300) {
      body.classList.remove("is-scroll-flag", "is-scroll-down", "is-scroll-up", "is-scroll-middle");
      lastY = y;
      return;
    }
    body.classList.add("is-scroll-flag");
    if (y > lastY) { body.classList.add("is-scroll-down"); body.classList.remove("is-scroll-up"); }
    else if (y < lastY) { body.classList.add("is-scroll-up"); body.classList.remove("is-scroll-down"); }
    const docH = Math.max(root.scrollHeight, body.scrollHeight);
    body.classList.toggle("is-scroll-middle", y + innerHeight / 2 >= docH / 2);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  onScroll();
  const views = new IntersectionObserver((entries) => entries.forEach((en) => body.classList.toggle(en.target.dataset.scrollView, en.isIntersecting)));
  document.querySelectorAll("[data-scroll-view]").forEach((el) => views.observe(el));

  // Page transition — on entering, html.is-in is set after two frames, on leaving, is-in is removed and navigation happens after 500ms (original PageTransition defaults)
  const go = (href) => {
    if (reduce) { location.href = href; return; }
    root.classList.remove("is-in");
    setTimeout(() => { location.href = href; }, 500);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.closest('[data-fx-part="link"]')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.href.split("#")[0] === location.href.split("#")[0]) return;
    e.preventDefault();
    setMenu(false);
    go(url.href);
  });
  // The next-guide logo is the original delayed type — on press, separately from the typing (type-next-link part), it closes the panel after 550ms and moves on after another 550ms
  document.addEventListener("click", (e) => {
    const a = e.target.closest('[data-fx-part="link"]');
    if (!a || e.button !== 0) return;
    if (reduce) return;
    setTimeout(() => root.classList.remove("is-in"), 550);
    setTimeout(() => { location.href = a.href; }, 1100);
  });
  root.classList.add("is-loaded");
  // As in the original, entry starts two frames after window load (once photos and fonts are all fetched)
  const enter = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-in")));
  if (document.readyState === "complete") enter();
  else addEventListener("load", enter, { once: true });
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.add("is-in"); });
})();
