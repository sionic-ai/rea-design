// Draws the header row, drawer, footer and phone tabs of all pages in one place — fix a menu item once and all four pages change together.
(() => {
  const ICON = {
    menu: '<svg viewBox="0 0 43 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 .5h43M0 9.5h43"/></svg>',
    close: '<svg viewBox="0 0 25 25" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 1l23 23M24 1 1 24"/></svg>',
    cart: '<svg viewBox="0 0 21 19" fill="none" stroke="currentColor" stroke-width="1"><path d="M2.5 6.5h16l-1.3 11.5H3.8z"/><path d="M7 6.5V5a3.5 3.5 0 0 1 7 0v1.5"/></svg>',
    sns: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2"><rect x=".6" y=".6" width="16.8" height="16.8" rx="4.5"/><circle cx="9" cy="9" r="3.9"/><circle cx="13.6" cy="4.4" r=".7" fill="currentColor" stroke="none"/></svg>',
    grid: '<svg viewBox="0 0 19 19" fill="none" stroke="currentColor" stroke-width="1.1"><rect x="1" y="1" width="7" height="7"/><rect x="11" y="1" width="7" height="7"/><rect x="1" y="11" width="7" height="7"/><rect x="11" y="11" width="7" height="7"/></svg>',
  };
  const NAV = [
    ["Top", "index.html"], ["About", "index.html#about"], ["Recycle", "index.html#recycle"], ["Products", "product.html"],
    ["Stockist", "#"], ["News", "news.html"], ["Contact", "#"], ["Log in", "#"], ["Privacy Policy", "#", "is-wide"], ["Terms of use label", "#", "is-wide"],
  ];
  const TAGS = '<p data-label="Brand one-liner (English, two lines)">Brand line one<br>A short tagline in two lines</p><p data-label="Material number tag">00 %<br>Material Note</p><p data-label="Made-at tag">Made in City, Country</p>';
  const fill = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; return el; };

  fill('[data-slot="header"]', `
    <div class="mw-head">
      <button class="mw-head__menu" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="mw-drawer" data-drawer-open>${ICON.menu}</button>
      <ul class="mw-head__right">
        <li><a class="mw-head__cart" href="product.html" aria-label="Cart" data-label="Cart page link">${ICON.cart}<span>( 0 )</span></a></li>
        <li><a href="#">Log in</a></li>
        <li><a href="product.html">Online Shop</a></li>
      </ul>
    </div>`);

  fill('[data-slot="menu-drawer"]', `
    <aside class="mw-drawer" id="mw-drawer" aria-hidden="true" aria-label="Menu">
      <button class="mw-drawer__close" type="button" aria-label="Close Menu" data-drawer-close>${ICON.close}</button>
      <div class="mw-drawer__in">
        <p class="mw-logo mw-drawer__logo" data-label="Brand wordmark">Brand</p>
        <div class="mw-drawer__tags">${TAGS}</div>
        <nav class="mw-drawer__nav">${NAV.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</nav>
        <a class="mw-drawer__sns" href="#">${ICON.sns}Instagram</a>
      </div>
    </aside>`);

  fill('[data-slot="footer"]', `
    <footer class="mw-foot">
      <div class="mw-foot__row">
        <div>
          <p class="mw-logo mw-foot__logo" data-label="Brand wordmark">Brand</p>
          <div class="mw-foot__tags">${TAGS}</div>
          <a class="mw-foot__ig" href="#">${ICON.sns}Instagram</a>
        </div>
        <ul class="mw-foot__links">${NAV.map(([t, h, c]) => `<li${c ? ` class="${c}"` : ""}><a href="${h}">${t}</a></li>`).join("")}</ul>
      </div>
      <div class="mw-foot__row">
        <p class="mw-foot__copy">© All Rights Reserved</p>
        <a class="mw-foot__sns" href="#" aria-label="Social Media">${ICON.sns}</a>
      </div>
      <div class="mw-foot__under">
        <ul><li><a href="#">Privacy Policy</a></li><li>|</li><li><a href="#">Terms of use label</a></li></ul>
        <p>© All Rights Reserved</p>
      </div>
    </footer>`);

  fill('[data-slot="tab-bar"]', `
    <nav class="mw-tabbar" aria-label="Phone shortcut">
      <a href="index.html"><span class="is-mark"></span>Home</a>
      <a href="product.html">${ICON.grid}Product list</a>
      <a href="#">${ICON.sns}Instagram</a>
      <a href="#">${ICON.cart}Cart</a>
    </nav>`);

  // Drawer — the original only changes the aria value of the toggle button and a CSS transition (.5s) pushes the panel
  const drawer = document.getElementById("mw-drawer");
  const openBtn = document.querySelector("[data-drawer-open]");
  const setOpen = (open) => {
    if (!drawer) return;
    drawer.setAttribute("aria-hidden", String(!open));
    openBtn?.setAttribute("aria-expanded", String(open));
    if (open) drawer.querySelector("[data-drawer-close]")?.focus({ preventScroll: true });
    else if (drawer.contains(document.activeElement)) openBtn?.focus({ preventScroll: true });
  };
  openBtn?.addEventListener("click", () => setOpen(true));
  drawer?.querySelector("[data-drawer-close]")?.addEventListener("click", () => setOpen(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer?.getAttribute("aria-hidden") === "false") setOpen(false); });
  drawer?.querySelectorAll(".mw-drawer__nav a").forEach((a) => a.addEventListener("click", () => setOpen(false)));

  // Float-up — items already on screen at first draw run the CSS animation right away, off-screen ones are paused with is-off and released when they cross the line 50px below the screen (original theme animations.js)
  const rise = document.querySelectorAll("[data-slide-in], [data-fade-in]");
  if (rise.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.remove("is-off"); io.unobserve(e.target); }
      else e.target.classList.add("is-off");
    }), { rootMargin: "0px 0px -50px 0px" });
    rise.forEach((el) => io.observe(el));
  }

  // Home header bar — the original adds header-color once scroll exceeds screen.height
  if (document.body.dataset.page === "home") {
    const past = () => document.body.classList.toggle("is-past-hero", scrollY >= screen.height);
    addEventListener("scroll", past, { passive: true });
    past();
  }
})();
