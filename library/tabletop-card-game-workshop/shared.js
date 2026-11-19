// Shared by all pages: the header row, vertical side labels on both sides, SNS, menu drawer, contact panel and footer are drawn into the placeholders (data-kk).
// The part (fx-core) scans [data-fx] after DOMContentLoaded, so drawing here first in the plain script at the end of the body hooks up menu drawer · entrance · transition together
(() => {
  const page = document.body.dataset.page || "home";
  const NAV = [
    ["about.html", "ABOUT", "Our Story", "about"],
    ["news.html", "NEWS", "News", "news"],
    ["product.html", "GAME", "Game list", "product"],
    ["product.html#paper", "FREE PAPER", "Free newsletter", ""],
    ["about.html#contact", "CONTACT", "Inquiry", ""],
  ];
  const ICON = {
    cart: '<svg viewBox="0 0 34 37" aria-hidden="true"><path class="kk-ico" d="M2 4h4.5l4 20h17l3.5-14H8.2"/><circle class="kk-ico" cx="13" cy="31" r="2.4"/><circle class="kk-ico" cx="25" cy="31" r="2.4"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="kk-ico" d="M3 3l18 18M21 3L3 21"/></svg>',
    insta: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="kk-ico" x="3" y="3" width="18" height="18" rx="5"/><circle class="kk-ico" cx="12" cy="12" r="4.2"/><circle class="kk-ico--fill" cx="17.4" cy="6.6" r="1.1"/></svg>',
    tube: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="kk-ico--fill" x="1.5" y="4.5" width="21" height="15" rx="4"/><path d="M10 9v6l5-3z" fill="var(--kf-bg)"/></svg>',
    mail: '<svg viewBox="0 0 40 32" aria-hidden="true"><rect class="kk-ico" x="2" y="3" width="36" height="26" rx="2"/><path class="kk-ico" d="M2 5l18 14L38 5M2 28l13-12M38 28L25 16"/></svg>',
    tel: '<svg viewBox="0 0 34 38" aria-hidden="true"><path class="kk-ico" d="M9 3l5 9-4 3c2 5 5 9 10 12l3-4 9 5-3 7C17 34 5 20 3 7z"/></svg>',
  };
  const heart = (cls = "kk-heart") => `<g class="${cls}"><path d="M3 9.5C3 5 6.4 2 10.5 2c2.6 0 4.6 1.2 6 3 1.4-1.8 3.4-3 6-3C26.6 2 30 5 30 9.5 30 16 22 19 16.5 19 11 19 3 16 3 9.5Z"/><path class="kk-heart__grid" d="M3.5 8.5h26M4.5 13h24M10.5 2.5v16M16.5 4.5v14.5M22.5 2.5v16"/></g>`;
  const mark = (label = "Logo — vertical band label + two-line wordmark + grid heart") =>
    `<svg class="kk-mark" viewBox="0 0 131 78" role="img" aria-label="${label}"><rect class="kk-mark__tag" x="0" y="0" width="16" height="78" rx="1"/><text class="kk-mark__tag-text" transform="translate(11 6) rotate(90)">GAME LAB</text><text class="kk-mark__word" x="23" y="29">STUDIO</text><text class="kk-mark__word" x="23" y="60">NAME</text><g transform="translate(96 37) scale(1.1)">${heart()}</g><text class="kk-mark__sub" x="25" y="76">WORDMARK</text></svg>`;
  const snsLinks = `<a href="#" aria-label="X">${ICON.x}</a><a href="#" aria-label="Instagram">${ICON.insta}</a><a href="#" aria-label="YouTube">${ICON.tube}</a>`;
  const sns = (cls) => `<div class="${cls}">${snsLinks}</div>`;
  const shop = '<a class="kk-shop" href="product.html" data-label="Shopping Link">' + ICON.cart + "<span>SHOP</span></a>";
  const fill = (key, html) => document.querySelectorAll(`[data-kk="${key}"]`).forEach((el) => { el.outerHTML = html; });

  fill("chrome", `
<header class="kk-head fx-studio-appear-wait" data-fx="studio-appear" data-fx-studio-appear="look: up; at: 100" data-kk-appear style="--fx-delay: .6s" data-slot="header">
  <a class="kk-logo" href="index.html" aria-label="First Page">${mark()}</a>
  <div class="kk-head__right">${shop}<i class="kk-head__gap"></i></div>
</header>
<div class="kk-menu" data-fx="fade-slide-drawer" data-fx-fade-slide-drawer="side: right; shift: 440; narrow-side: top; narrow-shift: 480; narrow-at: 540; wait: 0; fade: 0; delay: 0.02; dur: 1.2; look: slide" data-slot="menu-drawer">
      <button class="kk-burger fx-studio-appear-wait" data-fx-part="toggle" data-fx="studio-appear" data-fx-studio-appear="look: up; at: 100" data-kk-appear style="--fx-delay: .6s" aria-label="Open Menu" aria-expanded="false"><i></i><i></i><i></i></button>
      <div data-fx-part="layer">
        <button data-fx-part="lay" aria-label="Close Menu" tabindex="-1"></button>
        <nav class="kk-menu__panel" data-fx-part="panel" aria-label="Menu">
          <div class="kk-menu__inner">
            <p class="kk-menu__pill">Your short notice line here</p>
            <div class="kk-menu__list">${NAV.map(([h, en, ko]) => `<a href="${h}"><b>${en}</b><small>${ko}</small></a>`).join("")}</div>
          </div>
        </nav>
        <div class="kk-menu__top">${shop}<button class="kk-menu__close" data-fx-part="close" aria-label="Close Menu"><i></i><i></i></button></div>
        <div class="kk-menu__sns">${snsLinks}</div>
      </div>
</div>
<div class="kk-side kk-side--l fx-studio-appear-wait" data-fx="studio-appear" data-fx-studio-appear="at: 100" style="--fx-dur: .3s; --fx-ease: cubic-bezier(.4,.4,0,1)"><span>STUDIO NAME</span></div>
<div class="kk-side kk-side--r fx-studio-appear-wait" data-fx="studio-appear" data-fx-studio-appear="at: 100" style="--fx-dur: .3s; --fx-ease: cubic-bezier(.4,.4,0,1)"><span>STUDIO NAME</span></div>
<div class="kk-sns fx-studio-appear-wait" data-fx="studio-appear" data-fx-studio-appear="look: up; at: 100" data-kk-appear style="--fx-delay: .8s">${snsLinks}</div>`);

  fill("contact", `
<div class="kk-contact fx-studio-appear-wait" id="contact" data-fx="studio-appear" data-fx-studio-appear="look: up; at: 100" data-kk-appear data-slot="contact">
  <div class="kk-contact__title"><b>CONTACT US</b><small>Contact us here</small></div>
  <p>Inquiries about products or collaboration, product and game production consultations, etc.<br>Feel free to reach out.</p>
  <div class="kk-contact__ways">
    <a href="#"><i>${ICON.mail}</i><span>mail＊example.com</span></a>
    <a href="#"><i>${ICON.tel}</i><span>000-0000-0000</span></a>
  </div>
</div>`);

  fill("foot", `
<footer class="kk-foot fx-studio-appear-wait" data-fx="studio-appear" data-fx-studio-appear="look: up; at: 100" style="--fx-y: 30px; --fx-dur: 1.2s; --fx-ease: cubic-bezier(.4,.4,0,1); opacity: 1" data-slot="footer">
  <div class="kk-foot__in">
    <a class="kk-logo" href="index.html" aria-label="First Page">${mark()}</a>
    <div class="kk-foot__low">
      <nav class="kk-foot__nav" aria-label="Footer Menu">${NAV.map(([h, en, ko]) => `<a href="${h}"><b>${en}</b><small>${ko}</small></a>`).join("")}</nav>
      <p class="kk-foot__copy">© studio name All rights reserved.</p>
    </div>
  </div>
  ${sns("kk-sns")}
</footer>`);

  NAV.forEach(([h, , , key]) => {
    if (key && key === page) document.querySelectorAll(`.kk-menu__list a[href="${h}"], .kk-foot__nav a[href="${h}"]`).forEach((a) => a.setAttribute("aria-current", "page"));
  });
  // Small art slots — grid heart, NEW star, crown, cart, arrow (the original uses image files)
  const star = Array.from({ length: 24 }, (_, k) => {
    const a = (k / 24) * Math.PI * 2, r = k % 2 ? 29 : 35;
    return `${(36 + Math.cos(a) * r).toFixed(1)},${(32.5 + Math.sin(a) * r * 0.9).toFixed(1)}`;
  }).join(" ");
  const KIT = {
    heart: heart(),
    star: `<polygon points="${star}"/>`,
    crown: '<path d="M2 13 L1 3 L6.5 7.5 L11 1 L15.5 7.5 L21 3 L20 13 Z"/>',
    cart: ICON.cart,
    biglogo: mark(),
    go: '<svg viewBox="0 0 16 14" aria-hidden="true"><path class="kk-ico" d="M1 7h13M8 1l6 6-6 6"/></svg>',
  };
  for (const k in KIT) document.querySelectorAll(`[data-kk-${k}]`).forEach((el) => { el.insertAdjacentHTML("beforeend", KIT[k]); });

  // Page transition — original Studio (Nuxt) page change: on leaving, the body fades out in .3s (header line stays) and the new page turns on in .6s, curve .4,.4,0,1
  const root = document.documentElement;
  if (sessionStorage.getItem("kk-nav")) { sessionStorage.removeItem("kk-nav"); root.classList.add("kk-enter"); }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.origin !== location.origin || a.href === location.href) return;
    e.preventDefault();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { location.href = a.href; return; }
    // In the original, it starts to drain about 100ms after the press, when the router picks the next section (motion-probe 109ms)
    sessionStorage.setItem("kk-nav", "1");
    setTimeout(() => root.classList.add("kk-leave"), 95);
    setTimeout(() => { location.href = a.href; }, 395);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("kk-leave"); });

  // data-kk-up — attaches the STUDIO default entrance (from 30px below · transparent over 1.2s, .2s delay) as a studio-appear part. If the delay differs, use data-kk-up=".6"
  document.querySelectorAll("[data-kk-up]").forEach((el) => {
    el.classList.add("fx-studio-appear-wait");
    el.dataset.fx = ((el.dataset.fx || "") + " studio-appear").trim();
    el.setAttribute("data-fx-studio-appear", "look: up; at: 100");
    el.setAttribute("data-kk-appear", "");
    if (el.dataset.kkUp) el.style.setProperty("--fx-delay", `${el.dataset.kkUp}s`);
  });
})();
