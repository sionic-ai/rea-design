// Frame and motion shared by all pages — fills the header, menu, contact bar and footer into [data-mk] slots, and scrolls smoothly with Lenis (original 1.3.11 defaults)
// Handles header state (at top, white band when scrolling up), menu open/close, and .mk-rise entering the viewport. Call it before fx-core.js, which sweeps the parts.
(() => {
  const ARROW = '<svg class="mk-arrow" viewBox="0 0 20 13" aria-hidden="true"><path d="M1 1l18 5.5L1 12"/></svg>';
  // Our geometric M — instead of the original logo artwork, four colored bars (left pillar · descending diagonal · ascending diagonal · right pillar)
  const M = (mono) => `<svg class="mk-m${mono ? " is-mono" : ""}" viewBox="0 0 120 100" aria-hidden="true"><path class="m1" d="M0 0h22v100H0z"/><path class="m2" d="M0 0h24l38 46-12 14z"/><path class="m4" d="M98 0h22v100H98z"/><path class="m3" d="M120 0H96L58 46l12 14z"/></svg>`;
  const logo = (word = true) => `<span class="mk-logo" data-label="Company logo — Symbol + English name">${M()}${word ? "<b>BRAND</b>" : ""}</span>`;
  const page = document.body.dataset.page;
  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  const roll = (t) => `<span class="mk-roll">${t}</span>`;
  const pill = (t, cls = "", href = "#contact") => `<a class="mk-pill ${cls}" href="${href}"><i></i>${roll(t)}</a>`;
  const navL = `<ul class="mk-hdr__nav"><li><a href="service.html"${cur("service")}>${roll("Business introduction")}</a></li><li><a href="about.html"${cur("about")}>${roll("History")}</a></li><li><a href="about.html#company">${roll("Company overview")}</a></li><li><a href="works.html"${cur("works")}>${roll("Installation Record")}</a></li></ul>`;
  const navR = `<div class="mk-hdr__right"><ul><li><a href="news.html"${cur("news")}>${roll("News")}</a></li><li><a href="recruit.html"${cur("recruit")}>${roll("Hiring")}</a></li></ul><div class="mk-hdr__btns">${pill("Invoice template")}${pill("Contact Us", "is-fill")}</div></div>`;
  const group = ["Affiliated condo sales", "Architecture design office", "Restaurant name 1", "Restaurant name 2", "Hotel Name", "Village name", "Resort name"]
    .map((g) => `<li><a class="mk-ext" href="#"><em>[<i>↓</i><i>↓</i>]</em>${g}</a></li>`).join("");
  const T = {
    header: () => `
<header class="mk-hdr" data-slot="header">${navL}<a class="mk-hdr__logo" href="index.html" aria-label="Back to start">${logo()}</a>${navR}</header>
<div class="mk-dyn" aria-hidden="true">${navL}<a class="mk-hdr__logo" href="index.html" tabindex="-1">${logo(false)}</a>${navR}</div>
<button class="mk-burger" type="button" aria-label="Menu" aria-expanded="false" data-slot="menu-button"><span class="mk-burger__bg"></span><span class="mk-burger__bars"><i></i><i></i><i></i></span></button>
<div class="mk-menu" role="dialog" aria-label="Full menu" data-slot="menu">
  <div class="mk-menu__side">
    <a class="mk-menu__logo" href="index.html">${logo()}</a>
    <div><h2>Site map</h2><ul class="mk-menu__map">
      <li><a href="index.html"${cur("home")}>First</a></li><li><a href="works.html"${cur("works")}>Installation Record</a></li>
      <li><a href="service.html"${cur("service")}>Business introduction</a></li><li><a href="news.html"${cur("news")}>News</a></li>
      <li><a href="about.html"${cur("about")}>History</a></li><li><a href="recruit.html"${cur("recruit")}>Hiring</a></li>
      <li><a href="about.html#company">Company overview</a></li></ul></div>
    <div><h2>Group</h2><ul class="mk-menu__group">${group}</ul></div>
  </div>
  <div class="mk-menu__visual" data-label="Four-color gradient video (same as the Hero)">
    <div class="mk-menu__info"><small>Main Phone</small><b>000-000-0000</b><small>Hours: Weekdays 0:00 ~ 00:00</small>
      <a class="mk-menu__link" href="#contact"><small>For customer</small>Contact form ${ARROW}</a>
      <a class="mk-menu__link" href="#contact"><small>For partner</small>Partner company recruitment ${ARROW}</a></div>
  </div>
</div>`,
    contact: () => `
<section class="mk-contact" id="contact" data-slot="contact-band">
  <div class="mk-contact__body"><h2 class="mk-en">Contact</h2><p>Your contact guidance here, about three lines. One paragraph saying that whatever the matter, we listen first and find a way together.</p>
    <a class="mk-contact__link" href="#">Contact form ${ARROW}</a><a class="mk-contact__link" href="#">Partner company recruitment ${ARROW}</a></div>
  <div class="mk-contact__grad" aria-hidden="true"></div>
</section>`,
    footer: () => `
<footer class="mk-foot" data-slot="footer">
  <div class="mk-foot__mark"><span class="mk-foot__m">${M()}</span>
    <svg class="mk-foot__lines" viewBox="0 0 1380 334" preserveAspectRatio="none" aria-hidden="true"><path d="M0 333L690 1v332L1380 1v332"/></svg>
    <p class="mk-foot__word" data-label="Company English wordmark">BRAND</p></div>
  <div class="mk-foot__cols">
    <div><h2 class="mk-en">Site map</h2><ul class="mk-foot__map"><li><a href="index.html">First</a></li><li><a href="service.html">Business introduction</a></li><li><a href="about.html">History</a></li><li><a href="about.html#company">Company overview</a></li><li><a href="works.html">Installation Record</a></li><li><a href="news.html">News</a></li><li><a href="recruit.html">Hiring</a></li></ul>
      <div class="mk-foot__tel"><h2 class="mk-en">Tel</h2><b>000-000-0000</b><small>Hours: Weekdays 0:00 ~ 00:00</small></div></div>
    <div><h2 class="mk-en">Group</h2><ul class="mk-foot__group">${group}</ul>
      <h2 class="mk-en" style="margin-top:40px">Contact</h2><ul class="mk-foot__group"><li><a href="#contact">Contact form</a></li><li><a href="#contact">Partner Recruitment</a></li></ul></div>
    <div class="mk-foot__side"><a class="mk-pill is-dark is-big" href="#"><i></i>${roll("Download invoice form")}<span class="mk-slide">${ARROW}${ARROW}</span></a>
      <p class="mk-foot__copy">Privacy policy<span>© Company Name Co.,Ltd.</span></p></div>
  </div>
</footer>`,
  };
  document.querySelectorAll("[data-mk]").forEach((slot) => { const make = T[slot.dataset.mk]; if (make) slot.outerHTML = make(); });
  document.querySelectorAll("[data-mk-arrow]").forEach((s) => (s.outerHTML = s.dataset.mkArrow === "slide" ? `<span class="mk-slide">${ARROW}${ARROW}</span>` : ARROW));
  document.querySelectorAll("[data-mk-m]").forEach((s) => (s.outerHTML = M(s.dataset.mkM === "mono")));
  window.mkLogo = logo;

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  // Original Lenis 1.3.11 — no options given so defaults apply (lerp .1 · smooth only for the wheel).
  // lenis.min.js and splide.min.js list helper functions (e, t…) bare at the top so names collide — call Splide first, Lenis after (the other way round breaks new Lenis)
  window.lenis = null;
  addEventListener("DOMContentLoaded", () => {
    if (reduce || !window.Lenis) return;
    const lenis = (window.lenis = new Lenis({ autoRaf: false }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  });

  // Header state — at the top (is-top) a panel header and transparent menu button, scrolling down hides the white strip and scrolling up brings it back down
  let last = scrollY;
  const state = () => {
    const y = scrollY;
    root.classList.toggle("is-top", y < 80);
    if (Math.abs(y - last) > 2) root.classList.toggle("is-dyn-show", y > 80 && y < last);
    last = y;
  };
  addEventListener("scroll", state, { passive: true });
  state();

  const burger = document.querySelector(".mk-burger");
  const setMenu = (on) => {
    root.classList.toggle("is-menu", on);
    burger?.setAttribute("aria-expanded", String(on));
    if (window.lenis) on ? window.lenis.stop() : window.lenis.start();
  };
  burger?.addEventListener("click", () => setMenu(!root.classList.contains("is-menu")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Attach an underlay text to the card title (turns on in .2s on hover)
  document.querySelectorAll(".mk-card .hp-card__t, .mk-card .sp-card__t").forEach((t) => {
    t.classList.add("mk-card__t");
    t.insertAdjacentHTML("beforeend", `<span class="mk-card__u" aria-hidden="true">${t.textContent}</span>`);
  });

  // Sub-page title is split into letters inside word chunks and raised one after another on open (.06s between letters)
  document.querySelectorAll(".mk-head h1").forEach((h) => {
    let i = 0;
    h.setAttribute("aria-label", h.textContent.trim());
    h.innerHTML = h.textContent.trim().split(/(\s+)/).map((w) => (/^\s+$/.test(w) ? w : `<span class="w" aria-hidden="true">${[...w].map((ch) => `<span class="c" style="--d:${(i++ * 0.06).toFixed(2)}s"><span>${ch}</span></span>`).join("")}</span>`)).join("");
    h.classList.add("mk-split");
    requestAnimationFrame(() => requestAnimationFrame(() => h.classList.add("is-view")));
  });

  // Rises once when crossing the line 10% from the bottom of the screen (original addClass is-show)
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-show"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".mk-rise").forEach((el) => io.observe(el));

  // People slider — the same Splide as the original (overlapping switch · rewind, speed 560 matched to the measured 350ms cell opacity). Wires up the prev/next buttons and page count inside a [data-mk-slider] section (Home · Careers)
  document.querySelectorAll("[data-mk-slider]").forEach((sec) => {
    const el = sec.querySelector(".splide");
    if (!el || !window.Splide) return;
    const s = new Splide(el, { type: "fade", rewind: true, speed: reduce ? 0 : 560, arrows: false, pagination: false });
    const page = sec.querySelector("[data-mk-page]");
    s.on("move", (i) => { if (page) page.textContent = String(i + 1); });
    s.mount();
    sec.querySelector("[data-mk-prev]")?.addEventListener("click", () => s.go("<"));
    sec.querySelector("[data-mk-next]")?.addEventListener("click", () => s.go(">"));
  });
})();
