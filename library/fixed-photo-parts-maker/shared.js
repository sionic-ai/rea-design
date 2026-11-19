/* Shared by several pages — draws the header row, menu panel, mm number strip and footer, plus Lenis on wide screens, reveal on view, menu open/close, anchor sliding */
(() => {
  const page = document.body.dataset.page || "home";
  const EXT = '<svg class="kk-ext" viewBox="0 0 11 11" fill="none" stroke="currentColor"><path d="M4.5 1.5h-3v8h8v-3M6 1.5h3.5V5M9.5 1.5 5 6"/></svg>';
  const STAR = '<svg viewBox="0 0 24 24" aria-label="Logo slot"><g stroke="currentColor" stroke-width="2.6" stroke-linecap="square"><path d="M12 1.5v21M2.9 6.75l18.2 10.5M2.9 17.25l18.2-10.5"/></g></svg>';
  const WORD = '<svg viewBox="0 0 490 56" aria-label="Company name wordmark spot"><text x="4" y="44" font-size="44" font-weight="500" textLength="482" lengthAdjust="spacingAndGlyphs" fill="currentColor">LOGO Company Name</text></svg>';
  const MENU = [
    ["01", "First Page", "TOP PAGE", "index.html"],
    ["02", "Company About", "ABOUT US", "about.html"],
    ["03", "Product list", "PRODUCTS", "product.html"],
    ["04", "Product Strengths", "FEATURES", "index.html#features"],
    ["05", "Idea storehouse", "USE CASES", "works.html"],
    ["06", "Product knowledge", "KNOWLEDGE", "#"],
    ["07", "News", "NEWS", "news.html"],
  ];
  const SNS = ["Menu 1", "Menu 2", "Menu 3"];

  const hd = document.querySelector('[data-slot="header"]');
  if (hd) {
    hd.className = "kk-hd";
    hd.innerHTML =
      '<button class="kk-menu" type="button" aria-label="Open Menu" aria-expanded="false"><span class="kk-menu__line kk-menu__line--top"></span><span class="kk-menu__line kk-menu__line--bottom"></span></button>' +
      '<a class="kk-hd__logo" href="index.html">' + STAR + "</a>" +
      '<ul class="kk-hd__right"><li><a href="#" class="kk-hd__cart">Cart ( 0 )</a></li><li><a href="#">Log in</a></li></ul>';
    // Cart drawer (original store cart-drawer): the overlay darkens in .75s and a 50vw panel on the right slides in at .2s ease. Empty cart state.
    const cart = document.createElement("div");
    cart.className = "kk-cart";
    cart.dataset.slot = "cart-drawer";
    cart.innerHTML = '<div class="kk-cart__overlay"></div><div class="kk-cart__inner" role="dialog" aria-label="Cart"><div class="kk-cart__empty"><h2>Your cart is empty</h2>' +
      '<button class="kk-cart__close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4l16 16M20 4 4 20"/></svg></button>' +
      '<a href="product.html" class="kk-cart__btn">Continue shopping</a><p class="kk-cart__login-t">Already have an account?</p><p class="kk-cart__login"><a href="#">Log in</a>Doing so speeds up checkout.</p></div></div>';
    document.body.append(cart);
    const setCart = (v) => cart.classList.toggle("is-active", v);
    hd.querySelector(".kk-hd__cart").addEventListener("click", (e) => { e.preventDefault(); setCart(true); });
    cart.addEventListener("click", (e) => { if (e.target.closest(".kk-cart__overlay, .kk-cart__close")) setCart(false); });
    addEventListener("keydown", (e) => e.key === "Escape" && setCart(false));
    const nav = document.createElement("nav");
    nav.className = "kk-gnav";
    nav.dataset.slot = "menu-drawer";
    nav.setAttribute("aria-label", "Main menu");
    nav.innerHTML =
      '<div class="kk-gnav__inner"><div class="kk-gnav__wrap"><ul class="kk-gnav__menu">' +
      [...MENU, ["08", "Inquiry", "CONTACT", "#"]].map(([n, l, en, h]) => '<li class="kk-gnav__item"><span>' + n + '</span><a href="' + h + '">' + l + "</a><p>" + en + "</p></li>").join("") +
      '</ul><div class="kk-gnav__side"><ul class="kk-gnav__links">' + SNS.map((s) => '<li><a href="#">' + s + EXT + "</a></li>").join("") +
      '</ul><div class="kk-gnav__lang"><a href="#">KO</a><i></i><a href="#">EN</a></div></div></div></div>';
    hd.after(nav);
  }

  const mm = document.querySelector('[data-slot="size-band"]');
  if (mm) {
    const sizes = ["16", "18", "19", "20", "22", "22.2", "23", "25.4", "26", "27.2", "28.6", "31", "32", "34", "34.9", "37.6", "38", "41.3", "42.7", "48", "48.6", "54", "60", "60.5", "66.7", "76", "79.4", "89", "114"];
    mm.className = "kk-mm";
    mm.innerHTML = '<h2 class="kk-mm__title">mm</h2><div class="kk-mm__band" data-fx="marquee" data-fx-marquee="speed: 80; pause: none">' + sizes.map((s) => "<p>" + s + "</p>").join("") + "</div>";
  }

  const ft = document.querySelector('[data-slot="footer"]');
  if (ft) {
    ft.className = "kk-ft";
    ft.innerHTML =
      '<div class="kk-ft__wrap"><div class="kk-ft__cta"><p>Your bulk purchase notice here, in one line.</p>' +
      '<a href="#" class="kk-btn">Inquiry<span class="kk-arrow"><span class="kk-arrow__line"></span><span class="kk-arrow__head"></span></span></a></div>' +
      '<div class="kk-ft__box"><ul class="kk-ft__links">' + ["Policy 1", "Policy 2", "Policy 3", "Guide"].map((s) => '<li><a href="#">' + s + "</a></li>").join("") +
      SNS.map((s) => '<li><a href="#">' + s + EXT + "</a></li>").join("") + "</ul>" +
      '<ul class="kk-ft__menu">' + MENU.map(([n, l, en, h]) => '<li class="kk-ft__item"><span>' + n + '</span><a href="' + h + '">' + l + "<span>" + en + "</span></a></li>").join("") + "</ul></div>" +
      '<div class="kk-ft__logo">' + WORD + "</div></div>";
  }

  // The original runs Lenis (1.1.18 default lerp .1) on the GSAP ticker only above 767 width, and removes it when narrower
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lenis = null;
  const tick = (t) => lenis && lenis.raf(t * 1000);
  const syncLenis = () => {
    const want = !reduce && window.Lenis && innerWidth > 767;
    if (want && !lenis) {
      lenis = new Lenis({ autoRaf: false });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    } else if (!want && lenis) {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenis = null;
    }
    window.kkLenis = lenis;
  };
  if (window.gsap && window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); syncLenis(); addEventListener("resize", syncLenis); }

  // Once data-scroll enters the bottom 5% of the screen it gets is-inview — never removed once added
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-inview")), { rootMargin: "0px 0px -5% 0px" });
  document.querySelectorAll("[data-scroll]").forEach((el) => io.observe(el));

  // List cells (.kk-in) follow the stock theme’s slide-in as is — only cells that started off-screen are hidden, then float up over .6s once within 50px of the screen bottom
  const dawn = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) e.target.classList.add("is-off");
    else if (e.target.classList.contains("is-off")) { e.target.classList.remove("is-off"); dawn.unobserve(e.target); }
  }), { rootMargin: "0px 0px -50px 0px" });
  document.querySelectorAll(".kk-in").forEach((el) => dawn.observe(el));

  // Category buttons use ?cat= Navigates to the address (the original went to a same-type page at the category address), and the arriving page keeps only that category
  const cat = new URLSearchParams(location.search).get("cat");
  if (cat) {
    document.querySelectorAll(".kk-pill").forEach((p) => p.classList.toggle("is-active", p.dataset.cat === cat));
    document.querySelectorAll("[data-filter] > [data-cat]").forEach((li) => { li.hidden = li.dataset.cat !== cat; });
  }

  // Menu: two lines bend into an X in .3s, and the panel fades in and out like jQuery fadeToggle (.4s swing)
  const btn = document.querySelector(".kk-menu"), gnav = document.querySelector(".kk-gnav");
  if (btn && gnav) {
    let open = false;
    const set = (v) => {
      open = v;
      btn.classList.toggle("is-open", v);
      btn.setAttribute("aria-expanded", String(v));
      btn.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
      if (!window.gsap || reduce) { gnav.style.display = v ? "block" : "none"; return; }
      gsap.killTweensOf(gnav);
      if (v) gsap.fromTo(gnav, { display: "block", opacity: 0 }, { opacity: 1, duration: 0.4, ease: "sine.inOut" });
      else gsap.to(gnav, { opacity: 0, duration: 0.4, ease: "sine.inOut", onComplete: () => gsap.set(gnav, { display: "none" }) });
    };
    btn.addEventListener("click", () => set(!open));
    gnav.addEventListener("click", (e) => { if (e.target.closest('a[href*="#features"]') && page === "home") set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); });
  }

  // Same-page anchors glide with Lenis in .9s (original locoScroll.scrollTo duration 900, header bar height 0)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || !lenis) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || url.hash.length < 2) return;
    const t = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t, { duration: 0.9, offset: 0 });
  });
})();
