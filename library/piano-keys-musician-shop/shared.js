// Draws the header, phone menu and footer of every section in one place (so the same lines aren’t repeated per section), and attaches nav seating, float-up and cart.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const here = location.pathname.split("/").pop() || "index.html";

  const LINKS = [["works.html", "Works"], ["index.html", "Music"], ["#", "Murals"], ["#", "Shows"], ["#", "Commissions"], ["#", "Workshops"], ["product.html", "Shop"], ["#", "Press"]];
  const LOGO = '<svg viewBox="0 0 70 40" aria-hidden="true"><text x="2" y="17" font-size="17" fill="currentColor" style="font-family:var(--kf-font-display);font-style:italic">Artist</text><text x="10" y="35" font-size="17" fill="currentColor" style="font-family:var(--kf-font-display);font-style:italic">Name</text></svg>';
  const CART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  const cur = (href) => (href === here ? ' aria-current="page"' : "");

  const nav = $("[data-shared=nav]");
  if (nav) {
    nav.outerHTML = `
<div class="d-bar" data-slot="top-bar"><span><b>New album</b> · <em>“Album Title:”</em> · Signed edition pre-order · 00.00 release</span><span class="d-bar__right">Now Showing · <em>“Film Title”</em> →</span><button class="d-bar__close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>
<header class="d-nav" data-slot="header">
  <div class="d-nav__veil" aria-hidden="true"></div>
  <nav class="d-nav__in" aria-label="Main menu">
    <a class="d-logo" href="index.html" aria-label="Back to start">${LOGO}</a>
    <ul class="d-nav__links">${LINKS.map(([h, t]) => `<li><a class="d-navlink" href="${h}"${cur(h)}>${t}</a></li>`).join("")}</ul>
    <div class="d-nav__right">
      <a class="d-navlink d-navlink--wide" href="about.html"${cur("about.html")}>About</a>
      <a class="d-navlink d-navlink--wide" href="#">Notes</a>
      <a class="d-navlink d-navlink--wide" href="#">Contact</a>
      <span class="d-lang"><a href="#" hreflang="es">ES</a><span>/</span><b aria-current="true">KO</b></span>
      <a class="d-cart" href="#" aria-label="Cart">${CART}<span class="d-cart__n" data-cart-n>0</span></a>
      <button class="d-burger" type="button" aria-expanded="false" aria-label="Open Menu"><span><i></i><i></i><i></i></span></button>
    </div>
  </nav>
</header>
<div class="d-menu" data-slot="mobile-menu" data-label="Your menu English name here"><ul>${[...LINKS, ["about.html", "About"]].map(([h, t], i) => `<li><a href="${h}" style="--i:${i}"><span>${String(i + 1).padStart(2, "0")}</span><span>${t}</span></a></li>`).join("")}</ul></div>`;
  }

  const foot = $("[data-shared=footer]");
  if (foot) {
    foot.outerHTML = `
<footer class="d-foot" data-slot="footer">
  <div class="d-foot__grid">
    <div>
      <span class="d-logo">${LOGO}</span>
      <h2 class="d-title d-foot__ask" data-label="Your English title inviting contact here">Got a project in mind?</h2>
      <p>Your two lines go here on inquiries for work, commissions, exhibitions and workshops. We reply personally.</p>
      <a class="d-foot__write" href="#">Write a Letter</a>
      <span class="d-foot__mail">Or email · name@example.com</span>
    </div>
    <div><h3>Browse</h3><ul>${[...LINKS, ["#", "Notes"], ["about.html", "About"], ["#", "Contact"]].map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>
    <div class="d-foot__cols">
      <div><h3>Follow along</h3><ul>${["Link 1", "Link 2", "Link 3", "Link 4", "Link 5"].map((t) => `<li><a href="#"><span class="d-foot__ico" aria-hidden="true"></span>${t}</a></li>`).join("")}</ul></div>
      <div><h3>Notice</h3><ul>${["Legal notice", "Terms of service", "Personal information", "Cookie"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></div>
    </div>
  </div>
  <div class="d-foot__base"><span>© 0000 Your name here. All rights reserved.</span><span>Your region · 0000 here</span></div>
  <span class="d-foot__credit">Where it’s made<b>Your studio here ↗</b></span>
</footer>`;
  }

  // Close top band — the band folds and the nav sticks to the very top
  $(".d-bar__close")?.addEventListener("click", (e) => { document.documentElement.classList.add("bar-closed"); e.currentTarget.closest(".d-bar").remove(); });
  // Nav — sits down onto the panel after scrolling past 80px
  const head = $(".d-nav");
  if (head) {
    const sync = () => head.classList.toggle("is-posed", scrollY > 80);
    sync();
    addEventListener("scroll", sync, { passive: true });
  }
  // Phone menu — opening it locks the body scroll
  $$(".d-burger, [data-menu-toggle]").forEach((b) => b.addEventListener("click", () => {
    const open = document.documentElement.classList.toggle("menu-open");
    document.body.style.overflow = open ? "hidden" : "";
    $$(".d-burger, [data-menu-toggle]").forEach((x) => { x.setAttribute("aria-expanded", open); x.setAttribute("aria-label", open ? "Close Menu" : "Open Menu"); });
  }));

  // Cart — like the original, adding opens the right drawer (.5s) and the header count goes up. Adding the same item again only raises the quantity
  const drawer = document.createElement("div");
  drawer.className = "d-cart-drawer";
  drawer.setAttribute("data-slot", "cart-drawer");
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = `<div class="d-cart-drawer__veil"></div><aside class="d-cart-drawer__panel" role="dialog" aria-modal="true" aria-label="Cart"><div class="d-cart-drawer__head"><h2>Your Cart</h2><button class="d-cart-drawer__close" type="button" aria-label="Close">×</button></div><ul class="d-cart-drawer__list"></ul><textarea class="d-cart-drawer__note" rows="2" placeholder="Name for the dedication (optional)"></textarea><div class="d-cart-drawer__foot"><p class="d-cart-drawer__total"><span>Total</span><b data-cart-total>€00</b></p><button class="d-btn" type="button">To payment</button></div></aside>`;
  document.body.append(drawer);
  const lines = new Map();
  const openCart = (on) => {
    drawer.classList.toggle("is-open", on);
    drawer.setAttribute("aria-hidden", String(!on));
    document.body.style.overflow = on ? "hidden" : "";
  };
  $(".d-cart-drawer__veil", drawer).addEventListener("click", () => openCart(false));
  $(".d-cart-drawer__close", drawer).addEventListener("click", () => openCart(false));
  addEventListener("keydown", (e) => e.key === "Escape" && drawer.classList.contains("is-open") && openCart(false));
  $$("[data-add]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    if (b.classList.contains("is-in")) { openCart(true); return; }
    const name = b.closest("article")?.querySelector("h3")?.textContent || b.closest("section")?.querySelector("h1, h2, h3")?.textContent || "Your product here";
    lines.set(name, (lines.get(name) || 0) + 1);
    $(".d-cart-drawer__list", drawer).innerHTML = [...lines].map(([k, q]) => `<li><span class="wf-img" data-label="Product"></span><span>${k}</span><span>× ${q}</span></li>`).join("");
    const n = [...lines.values()].reduce((x, y) => x + y, 0);
    $$("[data-cart-n]").forEach((el) => { el.textContent = n; el.closest(".d-cart")?.classList.add("has-items"); });
    // Original: the added button changes to ‹✓ In cart · Checkout →› (bone-colored plate), and from then on it only opens the drawer
    if (b.classList.contains("d-btn") && !b.classList.contains("is-in")) { b.classList.add("is-in"); b.textContent = "✓ In cart · Checkout →"; }
    openCart(true);
  }));
  $$(".d-cart").forEach((c) => c.addEventListener("click", (e) => { if (lines.size) { e.preventDefault(); openCart(true); } }));

  // Rise — original Revelar: gsap.to(opacity 1, y 0, blur 0, 1.1s power3.out, top 88%, once)
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
      $$(".d-reveal").forEach((el) => {
        if (conditions.reduce) return gsap.set(el, { opacity: 1, y: 0, filter: "none" });
        gsap.to(el, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, delay: +(el.dataset.delay || 0), ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });
    });
  } else $$(".d-reveal").forEach((el) => (el.style.cssText += ";opacity:1;transform:none;filter:none"));
  if (reduce) document.documentElement.classList.add("is-reduced");
})();
