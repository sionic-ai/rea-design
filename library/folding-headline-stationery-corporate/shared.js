// All pages use the same header row, mega menu, search, hamburger drawer, footer and “back to top” — inserted into the slots (#tb-header · #tb-footer) and animated with the original values.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Dragonfly symbol (in place of the original logo graphic) — four wings and a body
  const fly = `<svg class="tb-fly" viewBox="0 0 64 40" aria-hidden="true"><path d="M30 6h4v30h-4z"/><circle cx="32" cy="5" r="4"/><path d="M34 10c8-6 22-8 28-4-4 6-18 8-28 6zM30 10C22 4 8 2 2 6c4 6 18 8 28 6zM34 16c7-1 18 2 21 7-6 3-16 0-21-4zM30 16c-7-1-18 2-21 7 6 3 16 0 21-4z"/></svg>`;
  const nav = [["product.html", "Product info", "product", true], ["about.html", "Brand", "about"], ["#", "Special"], ["#", "Brand"], ["news.html", "Press Release", "news"], ["#", "Company info"]];
  const tabs = ["Browse by category", "Find by brand", "Find by use"];
  const col = (head, n) => `<div class="col"><p class="lg"><a href="product.html">${head}</a></p>${Array.from({ length: n }, (_, i) => `<p class="sm"><a href="product.html">Sub Item ${String(i + 1).padStart(2, "0")}</a></p>`).join("")}</div>`;
  const groups = [
    `${col("Writing tools", 8)}${col("Eraser", 3)}${col("Grass", 3)}${col("Tape", 3)}`,
    Array.from({ length: 16 }, (_, i) => `<div class="col"><p class="lg"><a href="product.html">Brand ${String(i + 1).padStart(2, "0")}</a></p></div>`).join(""),
    ["School", "Office work", "Hobby", "Gift"].map((t) => `<div class="col"><p class="lg"><a href="product.html">${t}</a></p></div>`).join(""),
  ];

  const header = `
  <header class="tb-header" data-slot="header">
    <div class="in">
      <div class="brand" data-label="Two logos of the company’s flagship product brands"><a href="#" class="bmark">▬ Brand A</a><a href="#" class="bmark sq">■ Brand B</a></div>
      <h1 class="logo"><a href="index.html" aria-label="First Page">${fly}<span class="word">Brandname</span></a></h1>
      <button class="burger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      <div class="menu">
        <ul class="gnav">
          ${nav.map(([h, t, key, child]) => `<li class="item${key === page ? " is-active" : ""}${child ? " has-child" : ""}"><a href="${h}"${child ? ' class="child-btn"' : ""}>${t}</a>${child ? `
            <div class="childmenu"><div class="childmenu-in"><div class="childmenu-body">
              <ul class="tabs">${tabs.map((t, i) => `<li class="tab${i ? "" : " is-active"}">${t}</li>`).join("")}</ul>
              ${groups.map((g, i) => `<div class="group${i ? "" : " is-active"}">${g}</div>`).join("")}
            </div></div></div>` : ""}</li>`).join("")}
          <li class="item small"><a href="#">Inquiry</a></li>
          <li class="item small"><a href="#">Complete catalog</a></li>
        </ul>
        <div class="submenu">
          <div class="subnav"><a href="#">Inquiry</a><a href="#">Catalog</a></div>
          <div class="lang"><button class="lang-btn" type="button"><span>LANGUAGE</span></button><ul class="lang-sel"><li><a href="#">English</a></li><li><a href="#">中文</a></li></ul></div>
          <ul class="sns">${["X", "F", "I", "Y"].map((t) => `<li><a href="#" aria-label="SNS ${t}">${t}</a></li>`).join("")}</ul>
        </div>
      </div>
      <button class="search-btn" type="button" aria-label="Search the site"><svg class="open" viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="5"/><path d="m10.3 10.3 4.5 4.5"/></svg><span class="close"><i></i><i></i></span></button>
      <div class="overlay"></div>
      <div class="search-menu"><div class="search-in"><svg viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="5"/><path d="m10.3 10.3 4.5 4.5"/></svg><input type="search" placeholder="Free word search" aria-label="Search term"></div></div>
    </div>
  </header>`;

  const footer = `
  <section class="tb-follow" data-slot="follow">
    <p class="head">FOLLOW US</p>
    <ul class="list">${["X", "F", "I", "Y"].map((t) => `<li><a href="#" aria-label="SNS ${t}">${t}</a></li>`).join("")}</ul>
    <a class="tb-btn-round small" href="#">See all official accounts</a>
  </section>
  <footer class="tb-footer" data-slot="footer">
    <div class="pagetop-btn"><button class="pagetop-cont" type="button"><span class="t">TO TOP</span></button></div>
    <div class="main"><div class="tb-inner">
      <p class="flogo"><a href="index.html">${fly}<span class="word">Brandname</span></a></p>
      <nav class="fnav">
        <div class="fcol"><div class="grp"><p class="ml"><a href="product.html">Product info</a></p><p><a href="#">Writing tools</a></p><p><a href="#">Eraser</a></p><p><a href="#">Grass</a></p><p><a href="#">Tape</a></p></div><div class="grp"><p class="ml"><a href="about.html">Brand</a></p><p><a href="#">Brand story</a></p></div></div>
        <div class="fcol"><div class="grp"><p class="ml"><a href="news.html">Press Release</a></p><p><a href="#">News</a></p></div><div class="grp"><p class="ml"><a href="#">Company info</a></p><p><a href="#">Company About</a></p><p><a href="#">Hiring</a></p><p><a href="#">Sustainability</a></p><p><a href="#">Investment Info</a></p></div></div>
        <div class="fcol pc"><div class="grp"><p class="ml s"><a href="#">Special</a></p><p class="ml s"><a href="#">Brand</a></p><p class="ml s"><a href="#">Design award</a></p><p class="ml s"><a href="#">Official social links</a></p><p class="ml s"><a href="#">Catalog</a></p></div></div>
        <div class="fcol tools"><ul class="fsns"><li class="ttl">FOLLOW US</li>${["X", "F", "I", "Y"].map((t) => `<li><a href="#" aria-label="SNS ${t}">${t}</a></li>`).join("")}</ul>
          <div class="fsearch"><p class="ttl">SEARCH</p><label><svg viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="5"/><path d="m10.3 10.3 4.5 4.5"/></svg><input type="search" placeholder="Search the site" aria-label="Search the site"></label></div></div>
      </nav>
      <ul class="sub pc">${["Inquiry", "Site usage guide", "Privacy policy", "Sitemap", "Social media approach", "Announcement"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul>
      <div class="bottom"><ul class="official"><li><a href="#">Brandname USA</a></li><li><a href="#">Brandname EUROPE</a></li></ul><p class="copy">© 0000 BRANDNAME PENCIL CO., LTD.</p></div>
    </div></div>
  </footer>`;

  $("#tb-header")?.insertAdjacentHTML("afterbegin", header);
  $("#tb-footer")?.insertAdjacentHTML("afterbegin", footer);

  const body = document.body;
  const pc = matchMedia("(min-width: 1001px)");
  const hamburger = matchMedia("(max-width: 1000px)");
  const SMALL_AT = 500;

  // The header bar floats up .2s after opening, over .8s
  setTimeout(() => body.classList.add("is-header-in"), reduce ? 0 : 200);

  // On wide screens, scrolling past 500px turns it into a one-line header going 160 → 60px
  let menuOpen = false;
  const onScroll = () => {
    body.classList.toggle("is-header-small", pc.matches && scrollY > SMALL_AT);
    body.classList.toggle("is-header-hamburger", hamburger.matches);
    if (!hamburger.matches && menuOpen) closeMenu();
    const pt = $(".tb-footer .pagetop-btn");
    if (pt) {
      pt.classList.toggle("is-active", scrollY > 300);
      const ft = $(".tb-footer").getBoundingClientRect().top + scrollY;
      pt.classList.toggle("is-fix", matchMedia("(min-width: 768px)").matches && scrollY + innerHeight > ft + 50);
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  const lock = (on) => document.documentElement.classList.toggle("tb-lock", on);
  const openMenu = () => { body.classList.add("is-header-menu-active"); $(".tb-header .burger").setAttribute("aria-expanded", "true"); lock(true); menuOpen = true; };
  const closeMenu = () => { body.classList.remove("is-header-menu-active"); $(".tb-header .burger").setAttribute("aria-expanded", "false"); lock(false); menuOpen = false; };
  $(".tb-header .burger").addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));

  // Mega menu: hover on ”Product info” and after .2 seconds it opens below the header line (.2s fade), closing right away on leave
  const childItem = $(".tb-header .has-child");
  let hoverT;
  const openChild = () => { if (hamburger.matches) return; $(".tb-header .childmenu").style.top = `${$(".tb-header > .in").offsetHeight}px`; body.classList.add("is-childmenu"); $(".tb-header .child-btn").classList.add("is-on"); };
  const closeChild = () => { clearTimeout(hoverT); body.classList.remove("is-childmenu"); $(".tb-header .child-btn").classList.remove("is-on"); };
  childItem.addEventListener("mouseenter", () => { hoverT = setTimeout(openChild, 200); });
  childItem.addEventListener("mouseleave", closeChild);
  $(".tb-header .childmenu-in").addEventListener("mouseleave", closeChild);
  $$(".tb-header .tab").forEach((t, i) => t.addEventListener("click", () => {
    $$(".tb-header .tab").forEach((x, j) => x.classList.toggle("is-active", i === j));
    $$(".tb-header .group").forEach((g, j) => g.classList.toggle("is-active", i === j));
  }));

  // Search: tapping the magnifier drops an input row above the header row in .3s
  const search = (on) => { body.classList.toggle("is-header-search", on); $(".tb-header .search-btn").classList.toggle("is-close", on); if (on) setTimeout(() => $(".tb-header .search-menu input").focus(), 300); };
  $(".tb-header .search-btn").addEventListener("click", () => search(!body.classList.contains("is-header-search")));
  $(".tb-header .overlay").addEventListener("click", () => { search(false); closeMenu(); });

  const lang = $(".tb-header .lang");
  $(".tb-header .lang-btn").addEventListener("click", (e) => { e.stopPropagation(); lang.classList.toggle("is-active"); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".tb-header .lang")) lang.classList.remove("is-active"); });

  // Back to top: 1 second easeOutExpo
  $(".tb-footer .pagetop-cont")?.addEventListener("click", () => {
    if (reduce || !window.ScrollToPlugin) return scrollTo(0, 0);
    gsap.registerPlugin(ScrollToPlugin);
    gsap.to(window, { duration: 1, ease: "expo.out", scrollTo: 0 });
  });
})();
