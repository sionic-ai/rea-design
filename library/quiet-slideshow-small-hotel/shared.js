// Shared across pages — builds the fixed header · drawer · footer, and hooks up luxy smooth scroll (large screens, follows 10% per frame) · reveal · drawer open/close.
// The original opens the document fresh with no page transition, and subpage body content is revealed at 1.88s.
(() => {
  const page = document.body.dataset.page || "home";
  const isHome = page === "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ARW = '<svg viewBox="0 0 8 13" aria-hidden="true"><path d="M1.1 0 8 6.5 1.1 13 0 11.9l5.8-5.4L0 1.1Z"/></svg>';
  const NAV = [["About", "about.html", "about"], ["Room", "#", ""], ["Facility", "#", ""], ["Wedding", "#", ""], ["Journal", "news.html", "news"], ["News", "#", ""], ["Access", "#", ""]];
  const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content; };
  const nav = () => `<nav class="kk-nav" aria-label="Main menu"><ul>${NAV.map(([t, h, k]) => `<li><a href="${h}"${k && k === page ? ' class="is-current"' : ""}>${t}</a></li>`).join("")}</ul></nav>`;
  const reserve = '<a class="kk-reserve" href="#"><span class="en">Reserve</span><span class="jp">Reservation</span></a>';
  const burger = (cls) => `<button class="kk-burger ${cls}" type="button" aria-expanded="false" aria-label="Menu"><span></span><span></span></button>`;
  const logo = '<a class="kk-logo" href="index.html" data-label="English wordmark logo — with a small place name"><b>Hotel</b><small>Name</small></a>';
  const SNS = '<svg viewBox="0 0 22 22"><rect x="2" y="2" width="18" height="18" rx="5"/><circle cx="11" cy="11" r="4.2"/></svg>';

  const fixed = `<div class="kk-fixed kk-paper${isHome ? " is-home" : ""}" data-slot="header">${nav()}<div class="kk-logo-wrap">${logo}</div><div class="kk-right">${reserve}${burger("is-open")}</div></div>`;
  const drawer = `
<div class="kk-drawer" aria-hidden="true" data-slot="drawer">
  <div class="bg"></div>
  <div class="panel">
    <div class="scroll">
      <ul class="list">${[["About", "About the Hotel", "about.html"], ["Room", "Guest room", "#"], ["Facility", "Facility", "#"], ["Wedding", "Wedding", "#"], ["Journal", "Area Guide", "news.html"], ["News", "News", "#"], ["Access", "Directions", "#"]].map(([e, j, h]) => `<li><a href="${h}"><span class="en">${e}</span><span class="jp">${j}</span></a></li>`).join("")}</ul>
      <div class="icons"><a href="#" aria-label="SNS 1">${SNS}</a><a href="#" aria-label="SNS 2">${SNS}</a></div>
      <ul class="sub">${[["Company", "Operating company"], ["Recruit", "Hiring"], ["FAQ", "Frequently asked questions"], ["Policy", "Policy"]].map(([e, j]) => `<li><a href="#"><span class="en">${e}</span><span class="jp">${j}</span></a></li>`).join("")}</ul>
    </div>
    <div class="head">${reserve}${burger("is-close")}</div>
  </div>
</div>`;
  const footer = `
<footer class="kk-footer" data-slot="footer"><div class="in"><div class="grid">
  <a class="emblem" href="index.html" data-label="Tall vertical frame sentence + wordmark"><svg viewBox="0 0 60 90"><rect x="2" y="2" width="56" height="86" rx="2"/><rect x="9" y="9" width="42" height="72" rx="21"/><path d="M30 18v54M18 45h24"/></svg><b>Hotel</b><small>Name</small></a>
  <div class="info">
    <p>Postal code 000-0000<br>Your hotel address goes here in one line</p>
    <p class="tel"><span>Tel</span>0000-00-0000</p>
    <p class="mail"><span>Mail</span>info@example.com</p>
    <a class="map" href="#"><svg viewBox="0 0 18 24"><path d="M9 23S2 14 2 9a7 7 0 0 1 14 0c0 5-7 14-7 14Z"/><circle cx="9" cy="9" r="2.6"/></svg><span>Google Map</span></a>
  </div>
  <div class="nav">
    <div class="top"><a class="icon" href="#" aria-label="SNS 1">${SNS}</a><a class="icon" href="#" aria-label="SNS 2">${SNS}</a>${reserve}</div>
    <div class="menu">${NAV.filter(([t]) => t !== "Wedding").map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</div>
    <div class="submenu"><a href="#">Company</a><a href="#">FAQ</a><a href="#">Recruit</a><a href="#">Policy</a></div>
    <small class="copy">© 2024 Hotel Name</small>
  </div>
</div></div></footer>`;

  document.querySelector("[data-slot=header]")?.replaceWith(html(fixed));
  document.body.prepend(html(drawer));
  document.querySelector("[data-slot=footer]")?.replaceWith(html(footer));
  document.querySelectorAll("[data-more]").forEach((n) => { n.insertAdjacentHTML("beforeend", ARW); });
  const homeHead = document.querySelector("[data-slot=header-home]");
  if (homeHead) homeHead.replaceWith(html(`<header class="kk-normal" data-slot="header-home">${nav()}<a class="kk-notice" href="#"><span class="box"><span class="txt"><span class="ln">[Important] Your notice line goes here</span></span></span></a>${reserve}${burger("is-open")}</header>`));

  // ── Drawer: per open button, closes via close button, curtain, or a press outside the panel ──
  const dr = document.querySelector(".kk-drawer");
  const setOpen = (on) => {
    dr.setAttribute("aria-hidden", on ? "false" : "true");
    document.documentElement.classList.toggle("menu-is-open", on);
    document.querySelectorAll(".kk-burger").forEach((b) => b.setAttribute("aria-expanded", on ? "true" : "false"));
  };
  document.querySelectorAll(".kk-burger.is-open").forEach((b) => b.addEventListener("click", () => setOpen(true)));
  dr.querySelector(".kk-burger.is-close").addEventListener("click", () => setOpen(false));
  dr.querySelector(".bg").addEventListener("click", () => setOpen(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  // ── Rise-in: when in the band excluding top and bottom 15% of the screen, .88s ──
  const io = new IntersectionObserver((ens) => ens.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "-15% 0px -15% 0px" });
  document.querySelectorAll(".kk-fade").forEach((n) => (reduce ? n.classList.add("is-in") : io.observe(n)));

  // ── First page: once scrolled by the hero height (transparent header area), the fixed header appears ──
  const fx = document.querySelector(".kk-fixed.is-home"), clear = document.querySelector("[data-header-clear]");
  if (fx && clear) {
    const check = () => fx.classList.toggle("is-on", scrollY >= clear.offsetHeight);
    addEventListener("scroll", check, { passive: true });
    check();
  }

  // ── luxy smooth scroll: at 768px and up, #luxy follows by 10% per frame, and parallax cells (.luxy-el) move data-speed-y × 2% of scroll ──
  const startLuxy = () => {
    if (reduce || innerWidth < 768 || !window.luxy || !document.querySelector("#luxy") || window.kkLuxy) return;
    window.kkLuxy = true;
    luxy.init({ wrapper: "#luxy", targets: ".luxy-el", wrapperSpeed: 0.1 });
    // If the font arrives late the document height changes — resync the body height
    const fit = () => { document.body.style.height = `${document.querySelector("#luxy").clientHeight}px`; };
    document.fonts?.ready.then(fit);
    new ResizeObserver(fit).observe(document.querySelector("#luxy"));
  };
  startLuxy();

  // Subpage — the body is revealed in 1.88s
  requestAnimationFrame(() => document.body.classList.add("is-ready"));
})();
