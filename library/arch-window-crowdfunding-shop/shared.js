// Common to all pages: draws in the shop header (hides on scroll down, sticks on scroll up)·footer·campaign tag, and attaches mouse-drag to the product rows (rows with Swiper are driven by Swiper). The original has plain navigation with no page transition, so it is left as is.
(() => {
  const ds = document.body.dataset;
  const crumb = ds.crumb || "This page";
  const icons = {
    user: '<svg class="fm-ico" viewBox="0 0 20 20"><circle cx="8" cy="7" r="3.2"/><path d="M2.5 17c.6-3.4 2.8-5 5.5-5s4.9 1.6 5.5 5M14 6h4M14 9h4M15.5 12H18"/></svg>',
    search: '<svg class="fm-ico" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4.5 4.5"/></svg>',
    heart: '<svg class="fm-ico" viewBox="0 0 20 20"><path d="M10 16.5S3 12.4 3 7.6C3 5.3 4.7 4 6.5 4c1.5 0 2.7.9 3.5 2 .8-1.1 2-2 3.5-2C15.3 4 17 5.3 17 7.6c0 4.8-7 8.9-7 8.9z"/></svg>',
    bag: '<svg class="fm-ico" viewBox="0 0 20 20"><path d="M4 7h12l-1 10H5z"/><path d="M7.5 7V5.5a2.5 2.5 0 0 1 5 0V7"/></svg>',
    stamp: '<svg viewBox="0 0 46 34" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="16" cy="17" r="13"/><circle cx="16" cy="17" r="10" stroke-dasharray="2 2"/><path d="M11 20l9-8M13 13l2 3 4-1M30 11h14M30 15h14M30 19h14M30 23h14"/></svg>',
  };

  const head = document.querySelector('[data-slot="mall-header"]');
  if (head) {
    head.innerHTML = `
      ${"promo" in ds ? '<div class="fm-promo">Your one-line note about the current campaign here ›</div>' : ""}
      <div class="fm-wrap">
        <a class="fm-air" href="#"><span class="fm-air__stamp">${icons.stamp}</span>Your overseas customer notice here<span class="fm-air__chev">›</span></a>
      </div>
      <div class="fm-main-hold"><div class="fm-main"><div class="fm-wrap">
        <div class="fm-bar">
          <button class="fm-opener" type="button" data-panel="nav" aria-label="Menu">${icons.user}</button>
          <a class="fm-logo" href="index.html">WORDMARK</a>
          <nav class="fm-bar__icons" aria-label="My menu"><button type="button" data-panel="member" aria-label="My info">${icons.user}</button><button type="button" data-panel="search" aria-label="Find">${icons.search}</button><a href="#" aria-label="Steamed">${icons.heart}</a><a href="#" aria-label="Cart">${icons.bag}</a></nav>
        </div>
      </div></div></div>
      <div class="fm-panel" data-name="member" data-slot="member-panel">
        <button class="fm-panel__x" type="button" aria-label="Close">×</button>
        <p class="fm-panel__t">Log in · Sign up</p>
        <div class="fm-panel__btns"><a class="is-fill" href="#">Log in</a><a href="#">Sign up as a new member ›</a></div>
        <p class="fm-panel__note">Member benefits note, one line here</p>
        <ul class="fm-panel__list"><li><a href="#">Order History</a></li><li><a href="#">Saved items</a></li><li><a href="#">Recently viewed items</a></li><li><a href="#">Coupons · Points</a></li></ul>
      </div>
      <div class="fm-panel is-wide" data-name="search" data-slot="search-panel">
        <button class="fm-panel__x" type="button" aria-label="Close">×</button>
        <p class="fm-panel__t">Find items</p>
        <div class="fm-panel__search"><input type="text" placeholder="Your search word here"><button type="button">Find</button></div>
        <div class="fm-panel__chips"><a href="#">Popular word 1</a><a href="#">Popular word 2</a><a href="#">Popular word 3</a><a href="#">Popular word 4</a></div>
        <div class="fm-panel__cats">${["Dress", "Overcoat", "Bag", "Shoes", "Sundries", "Indoor"].map((c) => `<a href="lookbook.html"><span class="wf-img" data-label="${c} Main product cutout · square"></span>${c}</a>`).join("")}</div>
      </div>
      <div class="fm-panel is-drawer" data-name="nav" data-slot="mall-drawer">
        <button class="fm-panel__x fm-drawer__x" type="button" aria-label="Close">×</button>
        <p class="fm-drawer__h">Search in categories</p>
        <nav class="fm-drawer__list">${["Fashion", "Character shop", "Lifestyle Goods", "New item", "Sale", "Reads"].map((c, i) => `<a href="${i === 0 ? "news.html" : "lookbook.html"}">$ here{c}</a>`).join("")}</nav>
        <p class="fm-drawer__h">Help</p>
        <nav class="fm-drawer__list"><a href="#">Log in · Sign up</a><a href="#">Order History</a><a href="about.html">Company About</a></nav>
      </div>
      <button class="fm-veil" type="button" aria-label="Close"></button>`;
    const panels = [...head.querySelectorAll(".fm-panel")];
    const toggle = (name) => {
      panels.forEach((p) => p.classList.toggle("is-show", p.dataset.name === name && !p.classList.contains("is-show")));
      head.classList.toggle("has-panel", panels.some((p) => p.classList.contains("is-show")));
    };
    head.querySelectorAll("[data-panel]").forEach((b) => b.addEventListener("click", () => toggle(b.dataset.panel)));
    head.querySelectorAll(".fm-panel__x, .fm-veil").forEach((b) => b.addEventListener("click", () => toggle(null)));

    // Header pinning — same as the original shop header: once scrolled below the logo row it hides above the screen and pins (zero motion at that moment), then on reversing upward by 300px (200px on tablet and below)
    // Past the threshold it comes down with .35s cubic-bezier(.165,.84,.44,1). Scroll down again and it hides, and once back at the header position it resets to the start
    const hold = head.querySelector(".fm-main-hold");
    const upNeed = matchMedia("(max-width: 1023px)").matches ? 200 : 300;
    const shop = "shop" in ds;
    let past = scrollY, goingUp = false, turnY = 0;
    head.classList.add("is-init");
    addEventListener("scroll", () => {
      const y = scrollY, myTop = head.getBoundingClientRect().top + y, targetPos = hold.getBoundingClientRect().bottom + y;
      if (y > past) {
        goingUp = false;
        if (shop ? y > targetPos : y >= targetPos) head.classList.add("is-fixed-ready");
        else { head.classList.remove("is-fixed-ready"); head.classList.add("is-init"); }
        head.classList.remove("is-fixed");
      } else if (y < past) {
        if (!goingUp) { goingUp = true; turnY = y; }
        head.classList.remove("is-init");
        if (y < targetPos) { if (y <= myTop) { head.classList.remove("is-fixed", "is-fixed-ready"); head.classList.add("is-init"); } }
        else if (turnY - y > upNeed) head.classList.add("is-fixed");
      }
      past = y;
    }, { passive: true });
  }

  const foot = document.querySelector('[data-slot="mall-footer"]');
  if (foot) {
    foot.classList.add("fm-foot");
    foot.innerHTML = `
      <div class="fm-wrap">
        <div class="fm-foot__crumb"><a href="index.html">Shop name</a><span>${crumb}</span></div>
        <h3>Find items</h3>
        <div class="fm-foot__row"><a href="lookbook.html">Browse by category</a><a href="news.html">Find by brand</a></div>
        <h3>Help menu</h3>
        <div class="fm-foot__row" style="--n:4"><a href="#">New here</a><a href="#">Usage guide</a><a href="#">Frequently asked questions</a><a href="#">Contact Us</a></div>
        <a class="fm-foot__top" href="#">Back to top ▲</a>
      </div>
      <div class="fm-foot__legal">
        <nav><a href="#">Terms of service</a><a href="#">Privacy policy</a><a href="#">Security</a><a href="#">Sitemap</a><a href="index.html">SHOPPING</a><a href="about.html">COMPANY</a></nav>
        <span class="fm-logo">WORDMARK</span>
        <small>Copyright© WORDMARK All Rights Reserved.</small>
      </div>`;
    foot.querySelector(".fm-foot__top").addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); });
  }

  if ("tag" in ds) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="fm-tag" data-slot="campaign-tag">
        <svg viewBox="0 0 84 112" aria-hidden="true"><path style="fill:var(--site-tag-bg); stroke:var(--site-tag-line)" d="M42 2 80 30v78H4V30z"/><circle style="fill:var(--kf-surface); stroke:var(--site-tag-line)" cx="42" cy="26" r="5"/>
          <text style="fill:var(--site-tag-ink)" x="42" y="52" text-anchor="middle" font-size="10" font-weight="700">CAMPAIGN</text>
          <text style="fill:var(--site-tag-ink)" x="42" y="66" text-anchor="middle" font-size="8">MAX</text>
          <text style="fill:var(--site-tag-ink)" x="40" y="92" text-anchor="middle" font-size="26" font-weight="900">00<tspan font-size="12">%</tspan></text>
          <text style="fill:var(--site-tag-ink)" x="66" y="102" text-anchor="middle" font-size="8" font-weight="700">OFF</text></svg>
        <button class="fm-tag__x" type="button" aria-label="Close">×</button>
      </div>`);
    document.querySelector(".fm-tag__x").addEventListener("click", (e) => e.currentTarget.parentElement.classList.add("is-closed"));
  }

  // The product row scrolls natively on touch and is drag-to-pull with a mouse
  document.querySelectorAll(".fm-row").forEach((row) => {
    let x0 = null, s0 = 0;
    row.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse" || row.classList.contains("swiper")) return; x0 = e.clientX; s0 = row.scrollLeft; row.classList.add("is-drag"); });
    addEventListener("pointermove", (e) => { if (x0 !== null) row.scrollLeft = s0 - (e.clientX - x0); });
    addEventListener("pointerup", () => { x0 = null; row.classList.remove("is-drag"); });
  });
})();
