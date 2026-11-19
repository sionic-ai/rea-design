// Inserted here so every page uses the same header, wide menu, search overlay and footer.
// The first page (body[data-home]) has a horizontal menu bar, subpages have left/right vertical rails + an in-flow vertical-writing menu.
(() => {
  const body = document.body;
  const isHome = body.hasAttribute("data-home");

  const FAN = `<svg class="o-fan" viewBox="0 0 48 26" aria-hidden="true"><path d="M24 25L1.5 11.5C7 4.5 15 1 24 1s17 3.5 22.5 10.5z"/><path class="o-fan__rib" d="M24 25V3M24 25L9 6.5M24 25L39 6.5M24 25L3.5 10M24 25L44.5 10"/></svg>`;
  const LOGO = `${FAN}<span class="o-logo__words"><small>Area</small><span>Shop</span></span>`;
  const ICON = {
    cart: '<svg viewBox="0 0 24 24"><path d="M2.5 4h3l2.4 10.5h10.2L20.5 7H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.4-7 8-7s7 2.5 8 7"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>',
    down: '<svg viewBox="0 0 10 10"><path d="M1.5 3.5L5 7l3.5-3.5"/></svg>',
  };
  const SNS = [
    '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm5.5-3.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" fill-rule="evenodd"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9l-.4 2.6 3.4-2.5C18.4 18.6 22 15.2 22 11c0-4.4-4.5-8-10-8z"/></svg>',
  ];
  const GENRE = [
    ["index.html#items", "Fork 1"],
    ["index.html#items", "Fork 2", ["Small branch 1", "Small branch 2", "Small branch 3"]],
    ["index.html#items", "Fork 3"],
    ["index.html#items", "Fork 4"],
    ["index.html#items", "Fork 5"],
  ];
  const ABOUT = [["about.html", "Shop About"], ["store.html", "Store guide"], ["news.html", "News"]];
  const GUIDE = ["Shopping Guide", "Packaging & Delivery", "Payment method", "Exchanges / Returns", "Member guide"];
  const li = ([h, t]) => `<li><a href="${h}">${t}</a></li>`;

  // ── Head
  const head = document.querySelector("header[data-slot='header']");
  head.className = `o-header ${isHome ? "is-bar" : "is-rail"}`;
  head.innerHTML = `
    <a class="o-header__logo o-logo" href="index.html" aria-label="First Page">${LOGO}</a>
    <ul class="o-header__nav">
      <li><a href="index.html#recommend">Recommended</a></li>
      <li><a href="index.html#items">Fork 1</a></li>
      <li><a href="index.html#items">Branch 2${ICON.down}</a><ul class="o-header__sub"><li><a href="#">Small branch 1</a></li><li><a href="#">Small branch 2</a></li><li><a href="#">Small branch 3</a></li></ul></li>
      <li><a href="index.html#items">Fork 3</a></li>
      <li><a href="index.html#items">Search by price${ICON.down}</a><ul class="o-header__sub"><li><a href="#">Up to 0,000 won</a></li><li><a href="#">From 0,000 won</a></li><li><a href="#">From 00,000 won</a></li></ul></li>
      <li><a href="about.html">Shop About</a></li>
      <li><a href="news.html">News</a></li>
    </ul>
    <div class="o-header__tools">
      <a class="o-icon" href="#" aria-label="Cart">${ICON.cart}</a>
      <a class="o-icon" href="#" aria-label="My info">${ICON.user}</a>
      <a class="o-icon o-search" href="#" role="button" aria-label="Search">${ICON.search}</a>
      <div class="o-icon o-burger" role="button" tabindex="0" aria-label="Open Menu" aria-expanded="false"><span></span><span></span><span></span></div>
    </div>
    <div class="o-header__sns">${SNS.map((s) => `<a href="#" aria-label="SNS">${s}</a>`).join("")}</div>
    <p class="o-header__copy">© 0000 NAME.</p>`;

  const menus = (cls) => `
    <ul class="is-genre">${GENRE.map(([h, t, sub]) => `<li><a href="${h}">${t}</a>${sub && cls === "wide" ? `<ul>${sub.map((s) => `<li><a href="#">${s}</a></li>`).join("")}</ul>` : ""}</li>`).join("")}</ul>
    <ul class="is-about">${ABOUT.map(li).join("")}</ul>`;
  const contact = `
    <div class="o-contact" data-slot="contact-card">
      <p class="o-contact__tl">Orders · Contact</p>
      <div class="o-contact__card">
        <div class="o-contact__item"><small>Phone Order</small><b class="o-num">0000-00-0000</b><span>Delivery time 00:00~00:00<br>Days off (weekday · excluding weekday)</span></div>
        <div class="o-contact__item"><small>Fax order</small><b class="o-num">0000-00-0000</b><span>24-hour intake</span></div>
        <a class="o-contact__btn" href="#">Contact form</a>
        <p class="o-contact__under">Add two lines saying replies may be slow when no one is on duty, since a small team runs this.</p>
      </div>
    </div>`;

  head.insertAdjacentHTML("afterend", `
    <div class="o-wide" data-slot="menu-overlay" aria-hidden="true"><div class="o-wide__in">
      <nav class="o-wide__menus">${menus("wide")}</nav>
      ${contact}
    </div></div>
    <div class="o-searchpanel" data-slot="search-overlay" aria-hidden="true">${findForm()}</div>
    ${isHome ? "" : `<nav class="o-pagemenu" data-slot="page-menu">${menus("page")}</nav>`}`);

  function findForm() {
    return `<div class="o-find">
      <div><div class="o-find__kw">Enter a search term${ICON.search}</div><div class="o-find__tags"><span>#Tag</span><span>#Tag</span><span>#Tag</span></div></div>
      <div><div class="o-find__row"><label>Pick by category</label><div class="o-find__box">All branches</div></div><div class="o-find__row"><label>Pick by price</label><div class="o-find__box">0,000</div>~<div class="o-find__box">0,000</div></div></div>
      <div class="o-find__btns"><button class="is-fill" type="button">Narrow by this condition</button><button class="is-clear" type="button">Clear Conditions</button></div>
    </div>`;
  }
  window.oFindForm = findForm;

  // ── Footer
  const foot = document.querySelector("footer[data-slot='footer']");
  foot.className = "o-footer";
  foot.innerHTML = `
    <nav class="o-footer__links"><ul><li><a href="#">Shopping Guide</a></li><li><a href="about.html">Shop About</a></li><li><a href="#">Get the newsletter</a></li><li><a href="#">My info / Log in</a></li><li><a href="#">Member sign-up</a></li></ul></nav>
    <div class="o-footer__main">
      <a class="o-footer__logo o-logo" href="index.html">${LOGO}</a>
      <nav class="o-footer__menus">${menus("foot")}
        <ul class="is-guide"><li><b>Shopping Guide</b></li>${GUIDE.map((g) => `<li><a href="#">${g}</a></li>`).join("")}</ul>
        <ul class="is-guide"><li><b>Member guide</b></li><li><a href="#">My info</a></li><li><a href="#">Member sign-up</a></li><li><a href="#">Cart</a></li><li><a href="#">Wishlist</a></li></ul>
      </nav>
    </div>
    ${contact}`;

  // ── Wide menu · search: each closes the other as it opens. The original first page grabs earlier in the document-grab stage, blocks the jQuery side, and uses opacity .2s on the CSS default curve (ease),
  // Subpages use the jQuery fadeToggle defaults (.4s swing = is changed to sine.inOut)
  const wide = document.querySelector(".o-wide");
  const panel = document.querySelector(".o-searchpanel");
  const burger = document.querySelector(".o-burger");
  const search = document.querySelector(".o-search");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = new WeakMap();
  const fade = isHome ? (el, show) => {
    const ms = reduce ? 0 : 200;
    clearTimeout(timers.get(el));
    el.style.transition = `opacity ${ms}ms`;
    if (show) {
      el.style.display = "block";
      el.style.opacity = "0";
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = "1"; }));
    } else {
      el.style.opacity = "0";
      timers.set(el, setTimeout(() => { el.style.display = "none"; el.style.opacity = ""; el.style.transition = ""; }, ms));
    }
  } : (el, show) => {
    gsap.killTweensOf(el);
    const dur = reduce ? 0 : 0.4;
    if (show) gsap.fromTo(el, { display: "block", opacity: 0 }, { opacity: 1, duration: dur, ease: "sine.inOut" });
    else gsap.to(el, { opacity: 0, duration: dur, ease: "sine.inOut", onComplete: () => gsap.set(el, { display: "none", clearProps: "opacity" }) });
  };
  const hide = (el) => { clearTimeout(timers.get(el)); if (window.gsap) gsap.killTweensOf(el); el.style.display = "none"; el.style.opacity = ""; el.style.transition = ""; };
  burger.addEventListener("click", () => {
    const open = !burger.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    search.classList.remove("is-open");
    hide(panel);
    fade(wide, open);
    body.classList.toggle("is-locked", open);
  });
  burger.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); burger.click(); } });
  search.addEventListener("click", (e) => {
    e.preventDefault();
    const open = !search.classList.contains("is-open");
    search.classList.toggle("is-open", open);
    burger.classList.remove("is-open");
    hide(wide);
    body.classList.remove("is-locked");
    fade(panel, open);
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (burger.classList.contains("is-open")) burger.click();
    if (search.classList.contains("is-open")) search.click();
  });
})();
