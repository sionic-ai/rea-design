// Common to all pages: header (monogram, pill menu), cart drawer, wet-glass footer, smooth scroll.
// Original values: Lenis duration .7 · easing min(1, 1.001 − 2^(−10t)) · touchMultiplier 1.5 · drawer .45s
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const FL = (window.FL = { reduced, page });
  const ico = {
    user: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="5.5" r="2.8"/><path d="M2.5 14c.8-3 3-4.4 5.5-4.4s4.7 1.4 5.5 4.4"/></svg>',
    bag: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 5h10l-.8 9H3.8z"/><path d="M5.5 5V4a2.5 2.5 0 0 1 5 0v1"/></svg>',
  };
  // Original monogram slot — two letters in our type inside a square frame
  const mono = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><path d="M10 10h12v4h-8v4h7v4h-7v8h-4zM24 10h8v4h-2v16h-4V14h-2z" fill="currentColor"/></svg>';
  FL.mono = mono;
  const cur = (p) => (p === page ? " is-current" : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "fl-head";
    head.innerHTML = `
      <a class="fl-mono" href="index.html" aria-label="Home">${mono}</a>
      <nav class="fl-nav" aria-label="Main menu" data-label="Your menu English name here">
        <a class="${cur("detail")}" href="detail.html">Shop all</a>
        <a class="fl-hide-s${cur("about")}" href="about.html">About us</a>
        <a class="fl-hide-s is-icon" href="#" aria-label="Account">${ico.user}</a>
        <button class="is-icon" type="button" data-cart-open aria-label="Cart">${ico.bag}<span class="fl-count" data-cart-count>0</span></button>
      </nav>`;
  }
  document.body.insertAdjacentHTML("beforeend", `
    <div class="fl-cart" data-slot="cart-drawer" aria-hidden="true"><div class="fl-cart__dim" data-cart-close></div>
      <aside class="fl-cart__panel" aria-label="Cart">
        <div class="fl-cart__top"><b class="fl-label">Your ”Cart” here</b><button type="button" data-cart-close aria-label="Close">×</button></div>
        <div class="fl-cart__item"><div class="wf-img" data-label="Bottle cutout · White background"></div><div><b>Your product name here</b><br><small>250 ml</small></div><b>₹000</b></div>
        <div class="fl-cart__sum"><div style="display:flex;justify-content:space-between"><span>Total</span><b>₹000</b></div><a class="fl-btn" href="#">Your ”Checkout” here</a></div>
      </aside></div>`);
  const cart = document.querySelector(".fl-cart"), count = document.querySelector("[data-cart-count]");
  const openCart = (on) => { cart.classList.toggle("is-open", on); cart.setAttribute("aria-hidden", on ? "false" : "true"); FL.lenis?.[on ? "stop" : "start"](); };
  FL.addToCart = () => { if (count) count.textContent = String(+count.textContent + 1); openCart(true); };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-cart-open]")) openCart(true);
    else if (e.target.closest("[data-cart-close]")) openCart(false);
    else if (e.target.closest("[data-add]")) { e.preventDefault(); FL.addToCart(); }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") openCart(false); });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "fl-foot";
    foot.setAttribute("data-fx", "bead-glass-gl");
    foot.innerHTML = `
      <div class="fl-foot__grid">
        <div class="fl-foot__col"><p class="fl-label">Your ‹All Products› here</p><a href="detail.html">Product one</a><a href="detail.html">Product two</a><a href="detail.html">Product three</a><a href="detail.html">Product four</a><a href="detail.html">Product five</a></div>
        <div class="fl-foot__col"><p class="fl-label">Your Help here</p><a href="#">Your terms here</a><a href="#">Your personal info here</a><a href="#">Your shipping info here</a><a href="#">Your refund here</a></div>
        <div class="fl-foot__mark" data-label="Your brand English wordmark, two lines here">Brand<br>Name</div>
        <div class="fl-foot__col"><p class="fl-label">Your ”Learn more” here</p><a href="about.html">About us</a></div>
        <div class="fl-foot__col"><p class="fl-label">Your Contact here</p><a href="#">Instagram</a><a href="#">Facebook</a><a href="#">LinkedIn</a></div>
      </div>
      <div class="fl-foot__legal"><span>© 2026 Brand Name. Your copyright line here</span><span class="fl-foot__pay"><i></i><i></i><i></i><i></i><i></i></span></div>`;
  }

  // Links within the same site move after .25s and the new page rises in
  if (!reduced) {
    // Rises only when arriving via a link — a freshly opened page stays as is
    if (sessionStorage.getItem("fl-nav") === "1") { sessionStorage.removeItem("fl-nav"); document.documentElement.classList.add("fl-enter"); }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html/.test(href)) return;
      e.preventDefault();
      sessionStorage.setItem("fl-nav", "1");
      setTimeout(() => { location.href = href; }, 250);
    });
  }

  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ autoRaf: false, anchors: true, smoothWheel: true, duration: 0.7, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), touchMultiplier: 1.5 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    FL.lenis = lenis;
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
