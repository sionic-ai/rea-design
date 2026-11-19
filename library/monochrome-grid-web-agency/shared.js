// Inserted here so every page uses the same header row, phone menu, bottom DOWNLOAD/CONTACT panel and footer, and Lenis (original 1.3.27 · lerp .1) is hooked up
(() => {
  const ARROW = '<svg viewBox="0 0 9 8"><path d="M5.1 0 9 4 5.1 8l-.7-.7 2.8-2.8H0v-1h7.2L4.4.7Z"/></svg>';
  const RING = '<svg class="cn-arrow__ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="17.32"/></svg>';
  const arrow = (text, href) => `<a class="cn-arrow" href="${href}"><span class="cn-arrow__text">${text}</span><span class="cn-arrow__icon">${RING}<span class="cn-arrow__go">${ARROW}</span><span class="cn-arrow__next">${ARROW}</span></span></a>`;
  window.cnArrow = arrow;
  const page = document.body.dataset.page;
  const NAV = [["About", "about.html", "about"], ["Service", "service.html", "service"], ["Track record", "works.html", "works"], ["Column", "#", ""]];
  const cur = (k) => (k && (page === k || (k === "works" && page === "detail")) ? ' aria-current="page"' : "");
  const header = `
<div class="cn-header__in">
  <a class="cn-logo" href="index.html" data-label="English wordmark">studioNa</a>
  <nav class="cn-nav" aria-label="Menu"><ul class="cn-nav__list">${NAV.map(([t, h, k]) => `<li><a class="cn-nav__link" href="${h}"${cur(k)}>${t}</a></li>`).join("")}</ul></nav>
  <div class="cn-actions"><a class="cn-hbtn is-dl" href="#">Download materials</a><a class="cn-hbtn is-ct" href="#">Contact Us</a></div>
  <button class="cn-toggle" type="button" aria-label="Open Menu" data-menu-open><span class="cn-toggle__icon"><span></span><span></span></span></button>
  <dialog class="cn-menu" id="cn-menu">
    <div class="cn-menu__panel">
      <div class="cn-menu__head"><a class="cn-logo" href="index.html">studioNa</a><button class="cn-toggle is-close" type="button" aria-label="Close Menu" data-menu-close><span class="cn-toggle__icon"><span></span><span></span></span></button></div>
      <nav><ul class="cn-menu__nav">${[["First Page", "index.html"], ...NAV].map(([t, h]) => `<li data-menu-item><a href="${h}"><span>${t}</span><i></i></a></li>`).join("")}</ul></nav>
      <div class="cn-menu__cta"><a class="is-dl" href="#" data-menu-item>Download materials</a><a class="is-ct" href="#" data-menu-item>Contact Us</a></div>
      <ul class="cn-menu__util"><li data-menu-item><a href="#">Privacy policy</a></li><li data-menu-item><a href="#">Personal data handling notice</a></li><li data-menu-item><a href="#">Event consent notice</a></li></ul>
    </div>
  </dialog>
</div>`;

  const lines3 = '<i class="cn-vl" data-pos="center" data-show="pc" data-fx-part="vline"></i><i class="cn-vl" data-pos="right" data-show="both" data-fx-part="vline"></i><i class="cn-vl" data-pos="left" data-show="both" data-fx-part="vline"></i>';
  const hl = (show = "both") => `<i class="cn-hl" data-show="${show}" data-fx-part="hline"></i>`;
  const ctaItem = (en, ja, text, label) => `
<div class="cn-cta__item" data-cta-item>
  <div class="cn-cta__bg" data-cta-bg></div>${hl()}
  <a class="cn-cta__card" href="#" data-cta-card data-fx="blur-label-cursor" data-fx-blur-label-cursor="text: GET IN TOUCH; lerp: 1; size: 11.5rem; look: pop">
    <div class="cn-cta__body">
      <div class="cn-cta__left"><span class="cn-cta__en">${hl()}${en}${hl()}</span><span class="cn-cta__ja">${ja}</span></div>
      <div class="cn-cta__desc">${hl()}<p>${text}</p>${hl()}</div>
    </div>
  </a>${hl()}
</div>
<div class="cn-cta__photo" aria-hidden="true"><span class="wf-img" data-label="${label}"></span></div>`;
  const cta = `
<div class="cn-frame" data-bg="light" data-fx="frame-grid-lines"><div class="cn-wrap"><div class="cn-cta__in">
  <div class="cn-cta__list" data-cta-list>
    ${ctaItem("DOWNLOAD", "Get company profile and track record materials", "Your two-line note on what you can see after receiving the material goes here. It is a document gathering all results to date.", "Black-and-white photo of several work screens laid out at an angle · full width")}
    ${ctaItem("CONTACT", "Contact · Consultation", "Your one line here inviting people to ask freely about requests, quotes and consultations.", "Hands and screen of a person working · Dark black and white · Full-width landscape")}
  </div>
</div></div></div>`;

  const office = (name, zip, addr, tel) => `<section class="cn-footer__office">${hl()}<h2>${name}</h2><div>${zip}</div><div>${addr}</div>${tel ? `<p>tel. 00-0000-0000 · fax. 00-0000-0000</p>` : ""}${hl()}</section>`;
  const footer = `
<div class="cn-frame" data-bg="dark" data-fx="frame-grid-lines"><div class="cn-wrap">${lines3}<div class="cn-footer__in">
  <div>${hl()}<a class="cn-footer__logo" href="index.html" data-label="English wordmark">studioNa</a>${hl()}</div>
  <div class="cn-footer__navwrap">${hl()}<nav><ul class="cn-footer__nav">${NAV.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></nav>${hl()}</div>
  <div>${hl()}<div class="cn-footer__offices">${office("HEAD office", "000-0000", "Your headquarters address in one line here", true)}${office("CITY office", "000-0000", "Your second office address in two lines<br>Building Name Floor 5")}${office("CITY office", "000-0000", "Your third office address here<br>Building Name Floor 4")}</div>${hl()}</div>
  <div>${hl()}<p class="cn-footer__mark">Certification no. | 00000000(00)</p>${hl()}</div>
  <div>${hl()}<div class="cn-footer__bottom"><nav><ul class="cn-footer__util"><li><a href="#">Privacy policy</a></li><li><a href="#">Personal data handling notice</a></li><li><a href="#">Event consent notice</a></li></ul></nav><p class="cn-footer__copy"><small>© studioNa All Rights Reserved.</small></p></div>${hl()}</div>
</div></div></div>`;

  // Sub pages don’t place the lines by hand, they just add a marker — data-lines="3"(Center · both ends) · "2"(Both ends) · data-hl (horizontal lines above and below the block)
  document.querySelectorAll(".cn-wrap[data-lines]").forEach((w) => w.insertAdjacentHTML("afterbegin", w.dataset.lines === "2" ? lines3.replace(/<i[^>]*data-pos="center"[^>]*><\/i>/, "") : lines3));
  document.querySelectorAll("[data-hl]").forEach((el) => { el.insertAdjacentHTML("afterbegin", hl(el.dataset.hl || "both")); el.insertAdjacentHTML("beforeend", hl(el.dataset.hl || "both")); });
  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => { if (!el.children.length) el.innerHTML = html; });
  fill("header[data-slot=header]", header);
  fill("[data-slot=bottom-cta]", cta);
  fill("footer[data-slot=footer]", footer);
  document.querySelectorAll("[data-arrow]").forEach((el) => { el.outerHTML = arrow(el.dataset.arrow, el.getAttribute("href") || "#"); });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll — the original new Lenis({ lerp: .1, smoothWheel: true }), the frame is driven by GSAP
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.cnLenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Header bar — after scrolling past 20px a translucent white bar appears and the vertical padding shrinks (.3s)
  const head = document.querySelector(".cn-header");
  const follow = () => { if (scrollY > 20) head.dataset.follow = "true"; else delete head.dataset.follow; };
  follow();
  addEventListener("scroll", follow, { passive: true });

  // Phone menu — on open, items come in from 18px to the right over .42s power3.out (.055s stagger · after .08s), on close they move 14px up over .24s power2.in and the menu closes after 260ms
  const dlg = document.getElementById("cn-menu");
  const items = () => [...dlg.querySelectorAll("[data-menu-item]")];
  let closing = null;
  document.querySelector("[data-menu-open]")?.addEventListener("click", () => {
    if (dlg.open) return;
    clearTimeout(closing); dlg.classList.remove("is-closing");
    dlg.showModal(); window.cnLenis && window.cnLenis.stop();
    if (!reduce) gsap.fromTo(items(), { autoAlpha: 0, x: 18, y: 0 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.42, ease: "power3.out", stagger: 0.055, delay: 0.08, overwrite: true, clearProps: "opacity,visibility,transform" });
  });
  const close = () => {
    if (!dlg.open || dlg.classList.contains("is-closing")) return;
    dlg.classList.add("is-closing");
    if (!reduce) gsap.to(items(), { autoAlpha: 0, y: -14, duration: 0.24, ease: "power2.in", overwrite: true });
    closing = setTimeout(() => { gsap.set(items(), { clearProps: "all" }); dlg.close(); dlg.classList.remove("is-closing"); window.cnLenis && window.cnLenis.start(); }, 260);
  };
  dlg.querySelector("[data-menu-close]").addEventListener("click", close);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });

  // Bottom panel — when the panel center touches the bottom of the screen, the dark ink background spreads beyond the panel in .7s (fixed after 800ms), only the hovered card stays and photos spread out behind.
  document.querySelectorAll("[data-slot=bottom-cta]").forEach((root) => {
    const list = root.querySelector("[data-cta-list]");
    if (!list) return;
    const cards = [...list.querySelectorAll("[data-cta-card]")], rows = [...list.querySelectorAll("[data-cta-item]")];
    const mark = (card) => {
      list.dataset.hover = card ? "true" : "false";
      cards.forEach((c) => { c.dataset.hovered = c === card ? "true" : "false"; });
      rows.forEach((r) => { r.dataset.hovered = card && r.contains(card) ? "true" : "false"; });
    };
    cards.forEach((c) => { c.addEventListener("pointerenter", () => mark(c)); c.addEventListener("pointerleave", () => mark(null)); });
    root.dataset.open = "false";
    ScrollTrigger.create({ trigger: list, start: "center bottom", once: true, onEnter: () => {
      root.dataset.open = "true";
      setTimeout(() => root.querySelectorAll("[data-cta-bg]").forEach((b) => { b.dataset.done = "true"; }), 800);
    } });
  });
})();
