// Draws the loading veil shared by all pages, the header bar (mega menu · search · sitemap · phone drawer) and footer in one place — because copying the same markup into each page would mean fixing six pages whenever the menu changes.
(() => {
  const PC = matchMedia("(min-width: 768px)");
  const arr = '<span class="dw-arr"><i class="dw-i dw-i--arrow"></i></span>';
  const list = (items) => `<ul>${items.map(([t, h]) => `<li><a href="${h || "#"}">${t}</a></li>`).join("")}</ul>`;
  const group = (groups) => `<dl>${groups.map(([dt, items]) => `${dt ? `<dt><span>${dt}</span></dt>` : ""}<dd>${list(items)}</dd>`).join("")}</dl>`;

  // 6 menu items: the first two are large two-column panels, the rest one column
  const MENU = [
    { en: "Products", top: ["Product Info Start", "product.html"], cols: [
      [["", [["New product list", "list.html"]]], ["Reel / Rod", [["Menu item 1", "product.html"], ["Menu item 2", "product.html"], ["Three menu items with slightly long names", "product.html"]]], ["Apparel", [["Menu item 1"], ["Menu item 2"], ["Menu item 3"], ["Menu item 4"]]], ["Cooler Box", [["Menu item 1"]]]],
      [["Bag / Case", [["Menu item 1"], ["Menu item 2"], ["Menu item 3"]]], ["Lure", [["Menu item 1"]]], ["Others", [["Menu item 1"], ["Menu item 2"], ["Menu item 3"]]]],
    ] },
    { en: "Fishing Info", top: ["Fishing info, first", "index.html#fishing"], cols: [
      [["Type List", [["Menu item 1"], ["Menu item 2"], ["Menu item 3"], ["Menu item 4"], ["Menu item 5"], ["Menu item 6"]]]],
      [["Shop · fishing spot", [["Menu item 1"], ["Menu item 2"]]], ["How To", [["Menu item 1"], ["Menu item 2"]]], ["App", [["Menu item 1"]]]],
    ] },
    { en: "About", top: ["Company About", "about.html"], cols: [[["", [["Menu item 1", "about.html"], ["Menu item 2", "about.html"], ["Menu item 3", "about.html"]]]], [["", [["Menu item 4"], ["Menu item 5"]]]]] },
    { en: "News", top: ["News", "news.html"], cols: [[["", [["Latest News", "news.html"], ["Important Alert", "news.html"]]]], [["", [["Events · Campaigns", "event.html"]]]]] },
    { en: "After Service", top: ["Aftercare", ""], cols: [[["", [["Menu item 1"], ["Menu item 2"]]]], [["", [["Menu item 3"]]]]] },
    { en: "Contact", top: ["Inquiry", ""], cols: [[["", [["Menu item 1"], ["Menu item 2"]]]], [["", [["Menu item 3"]]]]] },
  ];
  const SNS = [["a", "SNS 1"], ["b", "SNS 2"], ["c", "SNS 3"], ["d", "SNS 4"]];
  const top = (m) => `<a class="dw-mega__top" href="${m.top[1] || "#"}"><span>${m.top[0]}</span>${arr}</a>`;
  const cols = (m) => `<div class="dw-mega__cols">${m.cols.map((c) => `<div>${group(c)}</div>`).join("")}</div>`;

  // In the original the loading screen runs only on the first page — #loading on subpages is off out (logo only) from the start
  const HOME = document.body.dataset.page === "home";
  const head = `
    ${HOME ? '<div class="dw-loader" data-slot="loader" aria-hidden="true"><span class="dw-mark"></span><span class="dw-loader__spin"></span></div>' : ""}
    <a class="dw-sitelogo" href="index.html" aria-label="Back to start" data-slot="site-logo"><span class="dw-mark"></span></a>
    <header class="dw-head" data-slot="header">
      <div class="dw-head__bar">
        <a class="dw-head__logo" href="index.html" aria-label="Back to start"><span class="dw-mark"></span></a>
        <button class="dw-glass" type="button" aria-label="Search the site"><i class="dw-i dw-i--search"></i></button>
        <nav class="dw-nav" aria-label="Main menu">${MENU.map((m, i) => `<div class="dw-nav__item" data-i="${i}"><span class="dw-nav__dt">${m.en}</span></div>`).join("")}</nav>
        <button class="dw-burger" type="button" aria-label="Open and close menu"><i></i></button>
      </div>
      ${MENU.map((m, i) => `<div class="dw-mega" data-i="${i}">${top(m)}${cols(m)}</div>`).join("")}
      <div class="dw-search"><div class="dw-search__box"><span>What are you looking for?</span><i class="dw-i dw-i--search"></i></div></div>
      <div class="dw-map" data-slot="sitemap">
        <div class="dw-map__main">${MENU.slice(0, 2).map((m) => `<div>${top(m)}${cols(m)}</div>`).join("")}</div>
        <div class="dw-map__sub">${MENU.slice(2).map((m) => `<div>${top(m)}<div class="dw-mega__cols" style="grid-template-columns:1fr">${m.cols.map((c) => `<div>${group(c)}</div>`).join("")}</div></div>`).join("")}</div>
      </div>
      <div class="dw-drawer" data-slot="mobile-menu">
        ${MENU.map((m) => `<div class="dw-drawer__item"><button class="dw-drawer__dt" type="button">${m.en}<i class="dw-i dw-i--plus"></i></button><div class="dw-drawer__dd">${list([m.top, ...m.cols.flat().flatMap((g) => g[1])].slice(0, 7))}</div></div>`).join("")}
        <div class="dw-drawer__sns"><p>SNS</p><ul>${SNS.map(([k, t]) => `<li><a href="#"><span><i class="dw-i dw-i--sns-${k}"></i></span><span>${t}</span></a></li>`).join("")}</ul></div>
      </div>
    </header>`;

  const foot = `
    <footer class="dw-foot" data-slot="footer">
      <div class="dw-foot__grid">
        <a class="dw-foot__logo" href="index.html" aria-label="Back to start"><span class="dw-mark"></span></a>
        <ul class="dw-foot__nav">${[["Product Info", "product.html"], ["Fishing Info", "index.html#fishing"], ["Company About", "about.html"], ["News", "news.html"], ["Important Alert", "news.html"], ["Aftercare"], ["Inquiry"]].map(([t, h]) => `<li><a href="${h || "#"}">${t}</a></li>`).join("")}</ul>
        <div class="dw-foot__sns"><p>SNS</p><ul>${SNS.map(([k, t]) => `<li><a href="#"><i class="dw-i dw-i--sns-${k}"></i>${t}</a></li>`).join("")}</ul></div>
        <div class="dw-foot__ext">
          <ul class="dw-foot__links">${["External site 1", "External site 2", "External site 3"].map((t) => `<li><a class="dw-foot__box" href="#"><span>${t}</span><span class="dw-arr"><i class="dw-i dw-i--blank"></i></span></a></li>`).join("")}</ul>
          <ul class="dw-foot__policy"><li><a href="#">Privacy policy</a></li><li><a href="#">Social media policy</a></li><li><a href="#">Intellectual property policy</a></li></ul>
        </div>
      </div>
      <small class="dw-foot__copy" data-label="Your company English name here">© Company Name. All Rights Reserved.</small>
      <button class="dw-foot__top" type="button" aria-label="Back to top"><i class="dw-i dw-i--head2"></i></button>
    </footer>`;

  document.body.insertAdjacentHTML("afterbegin", head);
  document.body.insertAdjacentHTML("beforeend", foot);
  const hd = document.querySelector(".dw-head");
  const BAR = () => hd.querySelector(".dw-head__bar").offsetHeight;

  // Original: when the scroll value is not 0, the marker unfolds into the bar
  const onScroll = () => hd.classList.toggle("is-logo", scrollY !== 0);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Original: jQuery animate({ height }, 50)(swing) changes the target every frame on top of CSS height .3s — the same overlap done with GSAP 50ms sine.inOut
  const toHeight = (h, done) => (window.gsap ? gsap.to(hd, { height: h, duration: 0.05, ease: "sine.inOut", overwrite: true, onComplete: done }) : ((hd.style.height = h + "px"), done?.()));
  const closeMega = () => {
    hd.querySelectorAll(".is-open").forEach((el) => el.classList.remove("is-open"));
    if (!hd.classList.contains("is-search") && !hd.classList.contains("is-menu") && hd.style.height) toHeight(BAR(), () => (hd.style.height = ""));
  };
  hd.querySelectorAll(".dw-nav__item").forEach((item) => {
    const panel = hd.querySelector(`.dw-mega[data-i="${item.dataset.i}"]`);
    item.addEventListener("mouseenter", () => {
      if (!PC.matches || hd.classList.contains("is-menu")) return;
      hd.classList.remove("is-search");
      closeMega();
      item.classList.add("is-open");
      panel.classList.add("is-open");
      toHeight(BAR() + panel.offsetHeight);
    });
  });
  hd.addEventListener("mouseleave", closeMega);
  hd.querySelector(".dw-head__bar").addEventListener("mouseenter", (e) => { if (!e.target.closest?.(".dw-nav")) closeMega(); });
  hd.querySelector(".dw-glass").addEventListener("mouseenter", closeMega);

  hd.querySelector(".dw-glass").addEventListener("click", () => {
    closeMega();
    hd.classList.remove("is-menu");
    hd.classList.toggle("is-search");
  });
  hd.querySelector(".dw-burger").addEventListener("click", () => {
    closeMega();
    hd.classList.remove("is-search");
    const open = hd.classList.toggle("is-menu");
    document.documentElement.style.overflow = open && !PC.matches ? "hidden" : "";
  });
  hd.querySelectorAll(".dw-drawer__dt").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("is-open")));

  document.querySelector(".dw-foot__top").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // Subpage title: a black curtain covers from the left (power3.in), turns the text on, then exits to the right (power1.out). Over 10 characters, .4s
  const title = document.querySelector(".dw-title");
  const titleIn = () => {
    if (!title || !window.gsap) return;
    const text = title.querySelector(".dw-title__text");
    const cover = title.querySelector(".dw-title__cover");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const d = text.textContent.length > 10 ? 0.4 : 0.3;
    gsap.set(text, { opacity: 0 });
    gsap.timeline()
      .to(cover, { clipPath: "inset(0% 0% 0% 0%)", duration: d, ease: "power3.in" })
      .set(text, { opacity: 1 })
      .to(cover, { clipPath: "inset(0% 0% 0% 100%)", duration: d, ease: "power1.out" });
  };

  // Loading curtain: once load finishes it fades out over 1s (original loading_off)
  const loader = document.querySelector(".dw-loader");
  const off = () => {
    if (loader) {
      loader.classList.add("is-off");
      setTimeout(() => loader.classList.add("is-out"), 1000);
    }
    titleIn();
    document.dispatchEvent(new CustomEvent("dw:ready"));
  };
  if (document.readyState === "complete") off();
  else addEventListener("load", off);
})();
