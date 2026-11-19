// Shared by all pages: header bar, PRODUCT mega menu, phone drawer, FEATURED strip, web shop panel and footer are drawn in one place, with header wrapping, photo reveal and back to top attached.
// Original values (common.js): #header.fixed once scroll passes 50px · photo reveal is started when the top edge crosses the 75% line of the screen (once attached it never detaches — the site’s fixed Delighters)
// · Back to top in 1000ms easeInCubic · phone drawer closes sub-levels and cleans up after 450ms.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cur = (k) => (k === page || (page === "article" && k === "journal") ? ' aria-current="page"' : "");

  // Replace the original logo (bold geometric letters) with our shape of the same width and height
  const logo = (cls) => `<svg class="${cls}" viewBox="0 0 120 30" aria-hidden="true">
    <path d="M0 30V8a8 8 0 0 1 16 0v22h-6V9a2 2 0 0 0-4 0v21zm16 0V8a8 8 0 0 1 16 0v22h-6V9a2 2 0 0 0-4 0v21z"/>
    <path d="M49 0a15 15 0 1 1 0 30 15 15 0 0 1 0-30zm0 8a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" fill-rule="evenodd"/>
    <path d="M80 0a15 15 0 0 1 13 7.5l-7 4a7 7 0 1 0 0 7l7 4A15 15 0 1 1 80 0z"/>
    <path d="M96 0h8v11l8-11h8l-9.5 14L120 30h-8.5l-7.5-12v12h-8z"/>
    <circle cx="117" cy="3" r="2.6" fill="none" stroke="currentColor" stroke-width=".8"/>
  </svg>`;
  const cats = [["SERIES ONE", "First series"], ["SERIES TWO", "Second series name"], ["BOWLS", "Third series"], ["CAT STOOL", "Fourth series name"], ["CAT SCRATCH", "Fifth series"], ["OTHERS", "Other products"]];
  const items = ["Item Name One", "Item Name Two", "Item Three", "Item Name Four", "Item Name Five Long", "Item Six", "Item Seven", "Item Name Eight"];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("mk-head");
    head.innerHTML = `
      <a class="mk-logo" href="index.html" aria-label="Home" data-label="Brand logo (bold geometric English letters)">${logo("")}</a>
      <nav class="mk-nav" aria-label="Main menu"><ul class="mk-nav__list">
        <li><a href="journal.html"${cur("journal")}>JOURNAL</a></li>
        <li class="mk-has-mega"><a class="mk-nav__more" href="product.html"${cur("product")}>PRODUCT</a>
          <div class="mk-mega">
            <div class="mk-mega__cats"><p class="mk-mega__ttl">SERIES</p>
              ${cats.map(([en, ko]) => `<a href="product.html"><span class="en">${en}</span><span class="ko">${ko}</span></a>`).join("")}
            </div>
            <div class="mk-mega__items"><p class="mk-mega__ttl">ARCHIVE <a class="mk-mega__all" href="product.html">View All</a></p>
              <div class="mk-mega__grid">${items.map((n, i) => `<a href="product.html"><span class="wf-img" data-label="Product cutout · white background · square"></span><span><span class="sub">SERIES ${i < 4 ? "ONE" : "TWO"}</span><span class="main">${n}</span></span></a>`).join("")}</div>
            </div>
          </div>
        </li>
        <li><a href="about.html"${cur("about")}>ABOUT</a></li>
        <li><a href="#">CONTACT</a></li>
      </ul></nav>
      <div class="mk-shop"><a href="#">WEB SHOP<span class="mk-out" aria-hidden="true"></span></a></div>`;
    head.insertAdjacentHTML("afterend", `
      <button class="mk-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i></button>
      <div class="mk-drawer-bg"></div>
      <nav class="mk-drawer" aria-label="Phone menu"><div class="mk-drawer__track">
        <div class="mk-drawer__pane">
          <a href="index.html">HOME</a><a href="journal.html">JOURNAL</a>
          <button type="button" class="mk-drawer__more">PRODUCT ›</button>
          <a href="about.html">ABOUT</a><a href="#">CONTACT</a><a href="#">PRIVACY POLICY</a>
          <p class="mk-drawer__ttl">WEB SHOP</p><a class="mk-drawer__shop" href="#">SHOP NAME</a>
        </div>
        <div class="mk-drawer__pane">
          <button type="button" class="mk-drawer__back">‹ BACK</button>
          <p class="mk-drawer__ttl">SERIES</p>
          ${cats.map(([en, ko]) => `<a href="product.html">${en}<span class="ko">${ko}</span></a>`).join("")}
          <a href="product.html">VIEW ALL</a>
        </div>
      </div></nav>`);
  }

  document.querySelectorAll('[data-slot="feature"]').forEach((sec) => {
    sec.classList.add("mk-feature");
    sec.innerHTML = `<span class="wf-img" data-label="Cats with bow ties in various patterns on a wooden table · blurred boxes behind · window natural light · landscape wide"></span>
      <div class="mk-feature__txt"><span class="mk-feature__tag">FEATURED</span><span class="mk-feature__en" data-label="Series English Name">SERIES ONE</span><span class="mk-feature__ko">First series</span><a href="product.html" class="btn-xs">View Details</a></div>`;
  });
  document.querySelectorAll('[data-slot="webshop"]').forEach((sec) => {
    sec.classList.add("mk-shopbox", "fade-in");
    sec.innerHTML = `<span class="wf-img" data-label="White cat lying in front of a cardboard box · indoor natural light · landscape 3:2"></span>
      <div class="mk-shopbox__txt">${logo("mk-shopbox__logo")}<span class="mk-shopbox__en">OFFICIAL WEB SHOP</span><p>Your web shop note in one line here.<br>Keep the second line a similar length.</p><a href="#" class="mk-shopbox__btn"><svg viewBox="0 0 21 18" aria-hidden="true"><path d="M0 1h3.5l3 11h11l3-8H6V2.5h14.6l-3.7 10.5H5.4L2.4 3H0z"/><circle cx="8" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/></svg>SHOP NAME</a></div>`;
  });

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("mk-foot");
    foot.innerHTML = `<div class="mk-foot__grid">
        <div>${logo("mk-foot__logo")}</div>
        <div><p class="mk-foot__ttl">SITE MENU</p><ul class="mk-foot__nav">
          <li><a href="index.html">HOME</a></li><li><a href="journal.html">JOURNAL</a></li><li><a href="product.html">PRODUCT</a></li>
          <li><a href="about.html">ABOUT</a></li><li><a href="#">CONTACT</a></li><li><a href="#">PRIVACY POLICY</a></li></ul></div>
        <div><p class="mk-foot__ttl">FOLLOW US</p><div class="mk-foot__sns"><a href="#" aria-label="SNS 1"></a><a href="#" aria-label="SNS 2"></a></div></div>
        <div><p class="mk-foot__ttl">WEB SHOP</p><a href="#" class="mk-foot__shop">▣ SHOP NAME</a></div>
        <p class="mk-foot__note">Your note here on where the brand spends part of its sales. The original has about five lines in this spot. Write in order which organization it supports, why it does that work, and what it hopes for ahead. Keep the character count close to the original.</p>
      </div>
      <div class="mk-foot__bottom"><p class="mk-foot__copy">© BRAND | Made Of Brand Name</p><a href="#" class="mk-top" aria-label="Back to top"></a></div>`;
  }

  // Header line — the original checks on each scroll whether 50px was passed
  const header = document.querySelector(".mk-head");
  const onScroll = () => header?.classList.toggle("is-fixed", scrollY > 50);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Photo reveal — top edge / screen height < At .75 add is-started and never remove it again
  const reveal = [...document.querySelectorAll(".fade-in")];
  const check = () => {
    for (const el of reveal) if (!el.classList.contains("is-started") && el.getBoundingClientRect().top / innerHeight < 0.75) el.classList.add("is-started");
  };
  if (reduce) reveal.forEach((el) => el.classList.add("is-started"));
  else { document.addEventListener("scroll", check, { passive: true }); check(); }

  // Back to top — 1000ms easeInCubic
  document.addEventListener("click", (e) => {
    const top = e.target.closest(".mk-top");
    if (!top) return;
    e.preventDefault();
    if (reduce) return scrollTo(0, 0);
    const from = scrollY, t0 = performance.now();
    const step = (now) => { const p = Math.min(1, (now - t0) / 1000); scrollTo(0, from * (1 - p * p * p)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  // Copy address — original: on copy, swaps the text to COPIED! and adds is_copied for 2s then removes it
  document.querySelectorAll(".mk-copy").forEach((btn) => {
    const label = btn.querySelector("span") || btn;
    const text = label.textContent;
    btn.addEventListener("click", () => {
      const done = () => {
        label.textContent = "COPIED!";
        btn.classList.add("is-copied");
        setTimeout(() => { label.textContent = text; btn.classList.remove("is-copied"); }, 2000);
      };
      (navigator.clipboard?.writeText(location.href) || Promise.resolve()).then(done, done);
    });
  });

  // Phone drawer
  const burger = document.querySelector(".mk-burger"), drawer = document.querySelector(".mk-drawer"), bg = document.querySelector(".mk-drawer-bg");
  let open = false, timer = 0;
  const setOpen = (v) => {
    open = v;
    [drawer, bg, burger].forEach((el) => el?.classList.toggle("is-open", v));
    burger?.setAttribute("aria-expanded", String(v));
    document.documentElement.style.overflow = v ? "hidden" : "";
    clearTimeout(timer);
    if (!v) timer = setTimeout(() => { drawer?.classList.remove("is-sub"); if (drawer) drawer.scrollTop = 0; }, 450);
  };
  burger?.addEventListener("click", (e) => { e.preventDefault(); setOpen(!open); });
  bg?.addEventListener("click", () => setOpen(false));
  drawer?.querySelector(".mk-drawer__more")?.addEventListener("click", () => { drawer.classList.add("is-sub"); drawer.scrollTop = 0; });
  drawer?.querySelector(".mk-drawer__back")?.addEventListener("click", () => drawer.classList.remove("is-sub"));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setOpen(false); });
  addEventListener("resize", () => { if (innerWidth >= 961 && open) setOpen(false); });
})();
