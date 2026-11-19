// Shared by all pages — draws the MENU button, yellow menu board, booking pill and footer, and hooks up menu open/close, rise-in (js-inView), question fold and # jumps.
// The original has no smooth-scroll library and only pushes # links with 1000ms easeInOutQuart.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BRANDS = [["HAIR", "service.html", "Head"], ["WOMB", "article.html", "Women"], ["LOVE", "news.html", "A Dilemma for Two"], ["HEART", "#", "Heart"]];
  const ALL = ["Male Hair Loss", "Contraceptive pill", "ED care", "Mental counseling", "Female hair loss", "Diet", "Sleep", "Allergy", "Acne", "Pain", "Sweat", "Eyelashes"];
  const ph = (label, cls = "") => `<span class="op-ph ${cls}" data-label="${label}"></span>`;

  const menuSlot = document.querySelector('[data-slot="menu"]');
  const brandMenu = /\bis-(love|hair)\b/.test(document.body.className);
  // Sub pages use a brand-colored menu like the original (a color panel filling up from below), while the first page uses a yellow panel
  if (menuSlot && brandMenu) menuSlot.outerHTML = `
    <button class="op-bmenu" type="button" aria-expanded="false" aria-controls="op-menu" data-menu-btn>
      <span class="op-bmenu__icon"><span></span></span>
      <span class="op-bmenu__txt"><span class="is-menu"><svg viewBox="0 0 38 9" aria-label="MENU"><text x="0" y="9" textLength="38" lengthAdjust="spacingAndGlyphs">MENU</text></svg></span><span class="is-close"><svg viewBox="0 0 42.5 9" aria-label="CLOSE"><text x="0" y="9" textLength="42.5" lengthAdjust="spacingAndGlyphs">CLOSE</text></svg></span></span>
    </button>
    <nav class="op-gnavi is-hide" id="op-menu" data-slot="menu" aria-hidden="true"><div class="op-gnavi__inner">
      <div class="op-gnavi__navi">
        <ul class="op-gnavi__main"><li><a href="index.html">HOME</a></li><li><a href="service.html">PRODUCTS</a></li><li><a href="index.html#faq">FAQ</a></li><li><a href="#">CONTACT</a></li></ul>
        <div class="op-gnavi__sub"><a href="#">Operating company</a><a href="#">Terms of service</a><a href="#">Privacy policy</a><a href="news.html">Notice</a></div>
      </div>
      <div class="op-gnavi__conv"><span class="op-ph op-gnavi__bg" data-label="Consultation background photo · two smiling people, upper body · soft indoor light · portrait 4:5"></span><span class="op-logo" data-label="Brand logo (white)">Brand<small>${(document.body.className.match(/is-(\w+)/) || [, ""])[1].toUpperCase()}</small></span><a href="#">Consult or visit via messenger</a><a href="#">First visit appointment</a></div>
    </div></nav>
    <div class="op-reserve${document.body.dataset.reserve ? ` is-${document.body.dataset.reserve}` : ""}" data-slot="reserve"><a class="op-reserve__btn" href="https://example.com/" target="_blank" rel="noopener"><span class="op-reserve__icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 13c-7.7 0-14 5-14 11.2 0 3.6 2.1 6.8 5.4 8.8L14 38l6-3.3c1.3.3 2.6.4 4 .4 7.7 0 14-5 14-11.2S31.7 13 24 13Z"/></svg></span><span class="op-reserve__t1">Straight to messenger</span><span class="op-reserve__t2">Consultation / appointment booking</span></a></div>`;
  else if (menuSlot) menuSlot.outerHTML = `
    <button class="op-menu-btn" type="button" aria-expanded="false" aria-controls="op-menu" data-menu-btn>
      <span class="op-menu-btn__icon"><span class="op-menu-btn__line"></span></span>
      <span class="op-menu-btn__text"><span class="op-menu-btn__menu">Menu</span><span class="op-menu-btn__close">Close</span></span>
    </button>
    <nav class="op-menu" id="op-menu" data-slot="menu" aria-hidden="true"><div class="op-menu__inner">
      <a class="op-menu__logo op-logo" href="index.html" data-label="Brand logo (white)">Brand<small>Brand</small></a>
      <div class="op-menu__brands">
        <p class="op-menu__head">Brand</p>
        <ul class="op-menu__brand">${BRANDS.map(([n, h, k]) => `<li><a href="${h}">${ph(`${k} Brand card · portrait photo + logo · landscape 3.4:1`)}</a></li>`).join("")}</ul>
        <p class="op-menu__head op-menu__all-head">All</p>
        <ul class="op-menu__all">${ALL.map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul>
      </div>
      <div class="op-menu__sns"><span aria-label="SNS 1"></span><span aria-label="SNS 2"></span></div>
      <ul class="op-menu__corp"><li><a href="#">Company About</a></li><li><a href="#">Terms of service</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Inquiry</a></li></ul>
    </div></nav>
    <div class="op-reserve${document.body.dataset.reserve ? ` is-${document.body.dataset.reserve}` : ""}" data-slot="reserve"><a class="op-reserve__btn" href="https://example.com/" target="_blank" rel="noopener"><span class="op-reserve__icon"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 13c-7.7 0-14 5-14 11.2 0 3.6 2.1 6.8 5.4 8.8L14 38l6-3.3c1.3.3 2.6.4 4 .4 7.7 0 14-5 14-11.2S31.7 13 24 13Z"/></svg></span><span class="op-reserve__t1">Straight to messenger</span><span class="op-reserve__t2">Consultation / appointment booking</span></a></div>`;

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) { foot.classList.add("op-footer"); foot.innerHTML = `
    <div class="op-footer__inner">
      <a class="op-footer__logo op-logo" href="index.html" data-label="Brand Logo">Brand<small>Brand</small></a>
      <div class="op-footer__brands">${BRANDS.map(([n, h, k]) => `<a href="${h}">${ph(`${k} Brand card · portrait photo + logo · landscape 3.4:1`)}</a>`).join("")}</div>
      <div class="op-footer__sns"><span></span><span></span></div>
      <ul class="op-footer__list">${ALL.map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul>
      <div class="op-footer__corp"><a href="#">Company About</a><a href="#">Terms of service</a><a href="#">Privacy policy</a><a href="news.html">Notice</a><span class="op-footer__copy">© brand Inc.</span></div>
    </div>`; }

  // Menu — when open, body scroll is locked, and it can’t be pressed again until the panel transition ends (original isLock)
  const btn = document.querySelector("[data-menu-btn]"), menu = document.getElementById("op-menu");
  let open = false, lock = false, kbOff, kb;
  const kbBg = menu?.querySelector(".op-gnavi__bg");
  const setMenu = (v) => {
    open = v;
    btn.classList.toggle(brandMenu ? "is-close" : "is-open", v);
    if (brandMenu) {
      menu.classList.toggle("is-hide", !v);
      // Right photo — as in the original, set to 1.2x on the new timeline’s first tick and straightened to 1x over 10s, removed 1s after closing
      clearTimeout(kbOff);
      if (v && window.gsap && !reduce) {
        kb?.kill();
        kbBg.classList.add("is-active");
        kb = gsap.timeline().set(kbBg, { scale: 1.2 }).to(kbBg, { scale: 1, duration: 10, ease: "none" });
      } else if (!v) kbOff = setTimeout(() => { kb?.kill(); kbBg.classList.remove("is-active"); window.gsap?.set(kbBg, { clearProps: "all" }); }, 1000);
    }
    btn.setAttribute("aria-expanded", String(v));
    if (!brandMenu) menu.classList.toggle("is-open", v);
    menu.setAttribute("aria-hidden", String(!v));
    document.body.style.overflow = v ? "hidden" : "";
  };
  btn?.addEventListener("click", () => {
    if (lock) return;
    lock = !reduce;
    setMenu(!open);
    if (reduce) lock = false;
  });
  menu?.addEventListener("transitionend", (e) => { if (e.target === menu) lock = false; });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setMenu(false); });

  // Booking pill — turns on after scrolling down more than 150px on phone
  const reserve = document.querySelector('[data-slot="reserve"]');
  // Header landing: when the button’s bottom edge passes the hero’s bottom edge, is-fixed (sand → black)
  const hkv = brandMenu && document.querySelector(".op-hkv");
  const onScroll = () => {
    reserve?.classList.toggle("is-show", (scrollY || 0) > 150);
    if (hkv) btn.classList.toggle("is-fixed", hkv.offsetTop + hkv.offsetHeight - (btn.offsetTop + btn.offsetHeight) < scrollY);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Rising — things already above half the screen on first open go immediately, the rest when more than 15% inside the screen
  const ins = document.querySelectorAll(".op-in");
  if (reduce) ins.forEach((el) => el.classList.add("is-inView"));
  else {
    const line = innerHeight * 0.5;
    ins.forEach((el) => {
      if (Math.ceil(el.getBoundingClientRect().top + scrollY - line) <= scrollY) { el.classList.add("is-inView"); return; }
      const io = new IntersectionObserver((list) => { if (list[0].isIntersecting) { io.disconnect(); el.classList.add("is-inView"); } }, { rootMargin: "-15% 0px" });
      io.observe(el);
    });
  }

  // Question accordion — open the height with scrollHeight (1s expo), set it to auto once fully open, and when closing go to 0 after 20ms from the current height
  document.querySelectorAll(".op-faq__item").forEach((item) => {
    const q = item.querySelector(".op-faq__q"), a = item.querySelector(".op-faq__a");
    if (!q || !a) return;
    a.addEventListener("transitionend", () => { a.style.height = q.classList.contains("is-show") ? "auto" : ""; });
    q.addEventListener("click", () => {
      if (q.classList.contains("is-show")) {
        a.style.height = a.scrollHeight + "px";
        setTimeout(() => { a.style.height = "0"; q.classList.remove("is-show"); }, 20);
      } else {
        q.classList.add("is-show");
        a.style.height = a.scrollHeight + "px";
      }
    });
  });

  // # Movement — 1000ms easeInOutQuart
  const quart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.getAttribute("href") === "#") { e.preventDefault(); return; }
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const from = scrollY, to = t.getBoundingClientRect().top + scrollY, t0 = performance.now();
    if (reduce) return scrollTo(0, to);
    const step = (now) => { const p = Math.min(1, (now - t0) / 1000); scrollTo(0, from + (to - from) * quart(p)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
})();
