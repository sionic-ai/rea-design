// Draws into the placeholders (data-in) the header line · logo · menu button, full-screen menu · wave canvas · contact badge · footer shared by all pages,
// On desktop, like the original, smooth-scrollbar (damping .1, wheel delegated to the whole document) scrolls the #scroller panel and ScrollTrigger is linked to that panel
(() => {
  const SP = matchMedia("(max-width: 769px)");
  const ICON = {
    my: '<svg viewBox="0 0 22 28" aria-hidden="true"><circle class="in-ico" cx="11" cy="8" r="4.5"/><path class="in-ico" d="M3 22c0-5 3.6-8 8-8s8 3 8 8"/></svg>',
    cart: '<svg viewBox="0 0 22 28" aria-hidden="true"><path class="in-ico" d="M4 9h14l-1.5 14h-11z"/><path class="in-ico" d="M8 9V7a3 3 0 0 1 6 0v2"/></svg>',
    list: '<svg viewBox="0 0 22 28" aria-hidden="true"><rect class="in-ico" x="4" y="5" width="14" height="18" rx="1"/><path class="in-ico" d="M4 10h14"/></svg>',
    faq: '<svg viewBox="0 0 22 28" aria-hidden="true"><rect class="in-ico" x="3" y="5" width="16" height="16" rx="2"/><path class="in-ico" d="M8.5 10.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5M11 17.2v.1"/></svg>',
    mail: '<svg viewBox="0 0 24 19" aria-hidden="true"><rect class="in-ico" x="1" y="1" width="22" height="17" rx="1"/><path class="in-ico" d="M1 2l11 8 11-8"/></svg>',
    arrow: '<svg viewBox="0 0 8 12" aria-hidden="true"><path class="in-ico" d="M1.5 1l5 5-5 5"/></svg>',
  };
  // Brush-drawn circle + two-line name (the original logo is a drawing — orange dot at the end of the circle ring)
  const mark = '<svg class="in-mark" viewBox="0 0 100 100" role="img" aria-label="Shop logo — two-line name inside a brush circle"><path class="in-mark__ring" stroke-width="5" d="M70 14A40 40 0 1 0 86 44"/><path class="in-mark__ring" stroke-width="2.4" d="M66 12A42 42 0 0 1 88 36"/><circle class="in-mark__dot" cx="86" cy="49" r="3"/><text class="in-mark__text" x="50" y="45" text-anchor="middle">Shop</text><text class="in-mark__text" x="50" y="64" text-anchor="middle">Name</text></svg>';
  const fill = (key, html) => document.querySelectorAll(`[data-in="${key}"]`).forEach((el) => { el.outerHTML = html; });
  const MENU_LINKS = [["Product", "product.html", [["Product list", "product.html"], ["Insistence on domestic goods", "detail.html"], ["Our commitment to peace of mind and safety", "detail.html"], ["Obsession with materials", "detail.html"]]], ["House-call clinic", "#"], ["Toward zero culling", "#"]];
  const MENU_TEXT = [["About us", "#", [["Company overview", "#"], ["Hiring Info", "#"], ["IR info", "#"]]], ["News", "#"]];
  const tree = (rows, cls) => rows.map(([t, h, sub], i) => `<li><a class="in-wipe" href="${h}" data-img="${cls}${i}">${t}</a>${sub ? `<ul class="in-menu__sub">${sub.map(([s, sh], k) => `<li><a href="${sh}" data-img="${cls}${i}-${k}"><span class="in-wipe">${s}</span></a></li>`).join("")}</ul>` : ""}</li>`).join("");

  fill("chrome", `
<header class="in-head" data-slot="header">
  <ul class="in-head__icons">
    <li><a href="page.html">${ICON.my}<span class="in-wipe">My Page</span></a></li>
    <li><a href="#">${ICON.cart}<span class="in-wipe">Cart</span></a></li>
    <li><a href="product.html">${ICON.list}<span class="in-wipe">Product list</span></a></li>
    <li><a href="#">${ICON.faq}<span class="in-wipe">FAQ</span></a></li>
  </ul>
</header>
<a class="in-logo" href="index.html" aria-label="First Page">${mark}</a>
<button class="in-burger" aria-label="Menu" aria-expanded="false"></button>
<nav class="in-menu" aria-hidden="true" data-slot="global-menu">
  <ul class="in-menu__links">${tree(MENU_LINKS, "a")}</ul>
  <ul class="in-menu__text">${tree(MENU_TEXT, "b")}</ul>
  <ul class="in-menu__icons"><li><a href="page.html">${ICON.my}<span class="in-wipe">My Page</span></a></li><li><a href="#">${ICON.cart}<span class="in-wipe">Cart</span></a></li><li><a href="#">${ICON.mail}<span class="in-wipe">Inquiry</span></a></li></ul>
  <ul class="in-menu__sns"><li>OFFICIAL SNS</li><li><a href="#" class="in-wipe">LINE</a></li><li><a href="#" class="in-wipe">X</a></li><li><a href="#" class="in-wipe">note</a></li><li><a href="#" class="in-wipe">Instagram〈dog〉</a></li><li><a href="#" class="in-wipe">Instagram〈cat〉</a></li></ul>
  <div class="in-menu__img">
    <span class="wf-img is-active" data-key="a0" data-label="Puppy sitting in front of a bowl · indoor natural light · portrait 4:5"></span>
    <span class="wf-img" data-key="a0-1" data-label="Domestic-grown produce field · clear daytime · 4:5 portrait"></span>
    <span class="wf-img" data-key="a0-2" data-label="Hand examining material in inspection room · portrait 4:5"></span>
    <span class="wf-img" data-key="a0-3" data-label="Top-down shot of meat and vegetable ingredients laid out · portrait 4:5"></span>
    <span class="wf-img" data-key="b0" data-label="Company people with a dog · office · portrait 4:5"></span>
    <span class="wf-img" data-key="a2" data-label="Person from behind holding a shelter dog · vertical 4:5"></span>
    <span class="wf-img" data-key="b1" data-label="News image · newspaper and dog paw on a desk · portrait 4:5"></span>
  </div>
</nav>
<div class="in-wave" aria-hidden="true" data-slot="wave-line" data-fx="sine-gradient-lines" style="--fx-wave-b: var(--site-wave-b)"></div>
<a class="in-contact" href="#" aria-label="Inquiry" data-slot="contact-badge">
  <span class="in-contact__ring" data-fx="text-ring-spin" data-fx-text-ring-spin="text: CONTACT US · SAVE ALL CATS AND DOGS; size: 64; inset: 4; pause: hover" style="--fx-dur: 20s; --fx-dur-narrow: 20s"></span>
  <span class="in-contact__icon">${ICON.mail}</span>
</a>`);

  fill("foot", `
<footer class="in-foot" data-slot="footer">
  <a class="in-foot__top" href="#" data-in-top><span>⌃</span>PAGE TOP</a>
  <div class="in-foot__in">
    <div class="in-foot__map">
      <div class="in-foot__logo">${mark}<a class="in-foot__btn" href="product.html">Product list ${ICON.list}</a></div>
      <ol class="in-foot__main"><li><span>01</span><a class="in-wipe" href="detail.html">Insistence on domestic goods</a></li><li><span>02</span><a class="in-wipe" href="detail.html">Our commitment to peace of mind and safety</a></li><li><span>03</span><a class="in-wipe" href="detail.html">Obsession with materials</a></li></ol>
      <ul class="in-foot__sub"><li><a class="in-wipe" href="#">News</a></li><li><a class="in-wipe" href="#">About us</a><ul class="in-menu__sub"><li><a href="#"><span class="in-wipe">Company overview</span></a></li><li><a href="#"><span class="in-wipe">Hiring Info</span></a></li><li><a href="#"><span class="in-wipe">IR info</span></a></li></ul></li><li><a class="in-wipe" href="#">Toward zero culling</a></li><li><a class="in-wipe" href="#">House-call clinic</a></li></ul>
      <ul class="in-foot__small"><li><a href="#">Commercial transactions act notice</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Terms of service</a></li></ul>
      <div class="in-foot__other">
        <ul class="in-foot__ec"><li>${ICON.my}<a class="in-wipe" href="page.html">My Page</a></li><li>${ICON.cart}<a class="in-wipe" href="#">Cart</a></li><li>${ICON.mail}<a class="in-wipe" href="#">Inquiry</a></li></ul>
        <p class="in-foot__title">OFFICIAL SNS</p>
        <ul class="in-foot__sns"><li>- LINE</li><li>- X</li><li>- note</li><li>- Instagram〈dog〉</li><li>- Instagram〈cat〉</li></ul>
      </div>
    </div>
    <p class="in-foot__copy">All Rights Reserved © Shop Name</p>
  </div>
</footer>`);

  // Menu — a button opens and closes it, and hovering a link turns on that link’s photo (original js_numberListLink → js_numberListImage)
  const burger = document.querySelector(".in-burger"), menu = document.querySelector(".in-menu");
  if (burger && menu) {
    const set = (open) => {
      burger.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
    };
    burger.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    const imgs = [...menu.querySelectorAll(".in-menu__img .wf-img")];
    menu.querySelectorAll("a[data-img]").forEach((a) => a.addEventListener("mouseover", () => {
      const key = a.dataset.img, hit = imgs.find((i) => i.dataset.key === key) || imgs.find((i) => key.startsWith(i.dataset.key));
      if (hit) imgs.forEach((i) => i.classList.toggle("is-active", i === hit));
    }));
  }

  // smooth-scrollbar — desktop only (the original C() turns it off on touch). Connects ScrollTrigger to the scroller
  const scroller = document.getElementById("scroller");
  const SB = window.Scrollbar && (window.Scrollbar.default || window.Scrollbar);
  window.inScroll = null;
  if (scroller && SB && !SP.matches && !matchMedia("(pointer: coarse)").matches) {
    const bar = SB.init(scroller, { damping: 0.1, delegateTo: document, alwaysShowTracks: true });
    window.inScroll = bar;
    if (window.ScrollTrigger) {
      ScrollTrigger.scrollerProxy(scroller, { scrollTop(v) { if (arguments.length) bar.scrollTop = v; return bar.scrollTop; } });
      bar.addListener(ScrollTrigger.update);
      ScrollTrigger.defaults({ scroller });
    }
  }
  // PAGE TOP — 2.4s power4.inOut (in the original smooth-scrollbar it would be easeInOutQuart of the same length)
  document.querySelectorAll("[data-in-top]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    if (window.inScroll) window.inScroll.scrollTo(0, 0, 2400, { easing: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2) });
    else if (window.gsap && window.ScrollToPlugin) gsap.to(window, { duration: 2.4, ease: "power4.inOut", scrollTo: 0 });
    else scrollTo({ top: 0, behavior: "smooth" });
  }));
})();
