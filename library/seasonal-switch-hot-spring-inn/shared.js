/* Shared by every page — sets up the header row·season button·booking button and window (micromodal)·booking strip·footer, and 
   Lenis 1.0.19 (wide screens only) · Ukiyo 4.1.2 (parallax inside photos) · splide 4.1.2 are applied with the original options as they are. Season change, curtain and widening are motion parts (_fx) */
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => innerWidth >= 768;
  gsap.registerPlugin(ScrollTrigger);

  const SEASONS = [["spring", "Spring"], ["summer", "Summer"], ["autumn", "Autumn"], ["winter", "Winter"]];
  // Photo slot with four seasons stacked in one cell
  const season = (label, cls = "") => `<div class="ic-season ${cls}">${SEASONS.map(([k, t]) => `<div class="ic-ph" data-fx-part="item" data-key="${k}" data-label="${t} · ${label}"><div class="ic-ph__img ukiyo"></div></div>`).join("")}</div>`;
  const LOGO = '<svg viewBox="0 0 160 70" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><text x="56" y="10" font-size="8" fill="currentColor" stroke="none" letter-spacing="1" style="font-family:var(--kf-font-display)">Your area · hot spring here</text><path d="M8 34c10-14 22-14 30 0s20 14 30 0 22-14 32 0"/><text x="10" y="62" font-size="22" fill="currentColor" stroke="none" letter-spacing="2" style="font-family:var(--kf-font-display)">Your name here</text><circle cx="140" cy="38" r="5"/></svg>';
  const CAL = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor"><rect x="1.5" y="3" width="15" height="13" rx="1.5"/><path d="M1.5 7h15M5.5 1v4M12.5 1v4"/><circle cx="13" cy="13" r="2.4"/></svg>';
  const NAV = [[["Menu 1", "service.html", "service"], ["Menu 2", "#"], ["Menu 3", "#"], ["Menu 4", "#"]], [["Menu 5", "#"], ["Menu 6", "#", "", true], ["News", "news.html", "news"], ["Menu 8", "#"]]];
  const roll = (t) => `<span><span>${t}</span><span aria-hidden="true">${t}</span></span>`;
  // A cell with a submenu (original: ‘Ways to Spend Time’ +) gets a marker next to the rolling text
  const navCols = () => NAV.map((c) => `<ul>${c.map(([t, h, ns, sub]) => `<li><a href="${h}"${ns ? ` data-ns="${ns}"` : ""}${sub ? ' class="has-sub"><span class="ic-nav__roll">' + roll(t) + '</span><span class="ic-nav__plus"><i></i></span>' : ">" + roll(t)}</a></li>`).join("")}</ul>`).join("");
  const SEARCH = `<div class="ic-search">
      <h2 class="ic-search__title"><small>( Reserve )</small>Booking · Find vacancies</h2>
      <label>Check-in · Check-out<span class="ic-search__field"><span>2026/00/00 – 2026/00/00</span>${CAL.replace("<svg", '<svg width="16" height="16"')}</span></label>
      <div class="ic-search__row"><label>Adult<span class="ic-search__field"><span>0 people</span><span>∨</span></span></label><label>Kids<span class="ic-search__field"><span>0 people</span><span>∨</span></span></label></div>
      <button class="ic-search__go" type="button">Find</button>
      <ul class="ic-search__links"><li><a href="#">Your guide link line here</a></li><li><a href="#">Your guide link line here</a></li></ul>
    </div>`;

  const buildChrome = () => {
    const ns = document.body.dataset.page;
    document.body.insertAdjacentHTML("afterbegin", `
<header class="ic-header is-top" data-slot="header" id="ic-header">
  <div class="ic-header__in">
    <a class="ic-logo" href="index.html" aria-label="Back to start">${LOGO}</a>
    <nav class="ic-nav" aria-label="Main menu"><div class="ic-nav__cols">${navCols()}</div></nav>
  </div>
</header>
<a class="ic-reserve" href="#" data-slot="reserve-button" data-modal-open><span>${CAL}</span><span class="ic-reserve__jp">Reservation</span><span class="ic-reserve__en">Reserve</span></a>
<a class="ic-chat" href="#" aria-label="Consultation" data-slot="chat-button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/></svg></a>
<nav class="ic-season-nav" data-slot="season-switch" aria-label="Change season"><ul>${SEASONS.map(([k, t]) => `<li><button type="button" data-fx-part="trigger" data-key="${k}">${t.slice(0, 1)}</button></li>`).join("")}</ul></nav>
<div class="ic-modal" id="ic-reserve-modal" aria-hidden="true" data-slot="reserve-modal">
  <div class="ic-modal__overlay" tabindex="-1" data-micromodal-close></div>
  <div class="ic-modal__box" role="dialog" aria-modal="true" aria-label="Reservation"><button class="ic-modal__close" type="button" aria-label="Close" data-micromodal-close></button>${SEARCH}</div>
</div>`);
    document.body.insertAdjacentHTML("beforeend", `
<section class="ic-pre" data-slot="reserve-band">
  <div class="ic-pre__photo">${season("Autumn mountains through the window and a person seated by it seen from behind · dim interior · full-width landscape")}<p class="ic-pre__catch">Your vertical copy line here —</p></div>
  <div class="ic-pre__panel">${season("Valley forest beyond an open-air bath · daytime · landscape 46:21")}<p class="ic-pre__badge">Your one-line official booking guarantee here</p>${SEARCH}</div>
</section>
<footer class="ic-footer" data-slot="footer">
  <div class="ic-footer__main">
    <div><nav class="ic-footer__nav" aria-label="Footer Menu">${navCols()}</nav><ul class="ic-footer__sub"><li><a href="#">Your policy link here</a></li><li><a href="#">Your privacy link here</a></li><li><a href="service.html">Your member service here</a></li></ul></div>
    <div class="ic-footer__info"><p style="margin:0 0 10px">Your name here</p><address>Postal code 000-0000<br>Your one-line address here<br><a href="#">[View Map]</a><br>Phone 0000-00-0000</address><p style="margin:10px 0 0"><a href="#">Social Account</a></p></div>
    <div class="ic-footer__catch"><small data-label="Your three-line English tagline for the lodging here — same as the hero text">A short<br>English tagline,<br>set in three lines.</small><span>Here</span><span>A one-line copy</span><span>Adding it</span></div>
  </div>
  <div class="ic-footer__line"></div>
  <p class="ic-footer__note">Add a small one-line trademark or notice.</p>
  <div class="ic-group" data-slot="group-links"><p class="ic-group__title">GROUP NAME</p><ul class="ic-group__list">${[1, 2, 3, 4, 5].map((n) => `<li><a href="#">Series ${n}</a></li>`).join("")}</ul></div>
  <p class="ic-footer__copy">© 2026 BRAND NAME</p>
</footer>`);
    document.querySelectorAll(".ic-nav a, .ic-footer__nav a").forEach((a) => a.classList.toggle("is-page", a.dataset.ns === ns));
    document.body.dataset.fx = `${document.body.dataset.fx || ""} season-wipe-swap`.trim();
  };

  // Header line — is-top at the very top, hides when scrolling down (is-hidden) and returns when scrolling up (is-view). Past the hero, is-exceed applies (as in the original)
  const headerScroll = () => {
    const header = document.getElementById("ic-header"), seasonNav = document.querySelector(".ic-season-nav");
    let last = scrollY;
    const on = () => {
      const y = scrollY, top = y < (wide() ? 1 : 20);
      header.classList.toggle("is-top", top);
      if (top) header.classList.remove("is-hidden", "is-view");
      else if (y > last) { header.classList.add("is-hidden"); header.classList.remove("is-view"); seasonNav.classList.add("is-hidden"); }
      else { header.classList.add("is-view"); seasonNav.classList.remove("is-hidden"); }
      if (top) seasonNav.classList.remove("is-hidden");
      last = y;
    };
    addEventListener("scroll", on, { passive: true });
    on();
  };

  const libs = () => {
    // Original: Lenis on wide screens only({ smoothTouch: true }) runs on its own rAF
    if (wide() && !reduced && window.Lenis) {
      const lenis = new Lenis({ smoothTouch: true });
      window.__lenis = lenis;
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      lenis.on("scroll", ScrollTrigger.update);
    }
    if (window.Ukiyo && !reduced) new Ukiyo(document.querySelectorAll(".ukiyo"), { scale: 1.1, speed: 1.8, willChange: true, externalRAF: false });
    if (window.Rellax && !reduced && innerWidth >= 1280 && document.querySelector(".ic-rellax")) new Rellax(".ic-rellax", { speed: 0.15, center: false, wrapper: null, round: true, vertical: true, horizontal: false });
    if (window.MicroModal) {
      const html = document.documentElement;
      MicroModal.init({ openClass: "is-open", disableScroll: true, awaitCloseAnimation: false, onShow: () => html.classList.add("is-modalOpen"), onClose: () => html.classList.remove("is-modalOpen") });
      document.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); MicroModal.show("ic-reserve-modal", { openClass: "is-open", disableScroll: true, onClose: () => html.classList.remove("is-modalOpen") }); html.classList.add("is-modalOpen"); }));
    }
  };

  // Photo in the booking band — scales 1.2 → 1 while the band enters (original footer figure scrub)
  const preBand = () => {
    const band = document.querySelector(".ic-pre"), photo = band.querySelector(".ic-pre__photo .ic-season");
    if (reduced) return gsap.set(photo, { "--sc": 1 });
    gsap.fromTo(photo, { "--sc": 1.2 }, { "--sc": 1, ease: "none", scrollTrigger: { trigger: band, start: "top-=30% top", end: "center center", scrub: true } });
  };

  // News tag — press to show only that category’s posts (original p-home-news__nav-tab)
  const tabs = () => document.querySelectorAll("[data-tabs]").forEach((box) => {
    box.querySelectorAll("[data-tab]").forEach((t) => t.addEventListener("click", (e) => {
      e.preventDefault();
      box.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("is-current", x === t));
      box.querySelectorAll("[data-tab-panel]").forEach((p) => p.classList.toggle("is-current", p.dataset.tabPanel === t.dataset.tab));
      // The News list filters a single list by category (the original has a different URL per category)
      box.querySelectorAll("[data-cat]").forEach((li) => (li.hidden = t.dataset.tab !== "all" && li.dataset.cat !== t.dataset.tab));
    }));
  });

  // Question collapse (ICHI-PASS)
  const faq = () => document.querySelectorAll("[data-faq]").forEach((q) => q.addEventListener("click", () => {
    const a = q.nextElementSibling, open = q.getAttribute("aria-expanded") !== "true";
    q.setAttribute("aria-expanded", open);
    gsap.to(a, { height: open ? "auto" : 0, duration: reduced ? 0 : 0.5, ease: "power2.out" });
  }));

  // In-page navigation — original jQuery animate 600ms swing
  const anchors = () => document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((a) => a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const y = t.getBoundingClientRect().top + scrollY;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: reduced ? 0 : 0.6 });
    else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  }));

  const sliders = () => {
    if (!window.Splide) return;
    document.querySelectorAll("[data-slider-fade]").forEach((el) => {
      const s = new Splide(el, { type: "fade", autoplay: !reduced, interval: 5000, pauseOnHover: false, rewind: true, speed: 1000, perPage: 1, perMove: 1, arrows: false, pagination: false });
      const nums = el.closest("[data-slider-wrap]")?.querySelectorAll("[data-slider-num]") || [];
      s.on("move", (i) => nums.forEach((n, k) => n.classList.toggle("is-active", k === i)));
      s.mount();
    });
  };

  const start = () => {
    buildChrome();
    headerScroll();
    libs();
    preBand();
    tabs();
    faq();
    anchors();
    sliders();
    window.dispatchEvent(new Event("ic:ready"));
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
