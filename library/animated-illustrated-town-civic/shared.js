// Plugs in the header band, dropdown, hamburger drawer and footer shared by all pages, with original interaction values (power1.out .2/.25/.3/.4/.45s) and
// Hooks up illustration playback (lottie-web — loops start immediately, data-scroll-lottieillust plays once when it enters 90% of the screen).
(() => {
  const page = document.body.dataset.page || "home";
  const ico = {
    pin: '<svg viewBox="0 0 24 24"><path class="ic-coral" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z"/><circle class="ic-white" cx="12" cy="9" r="2.6"/></svg>',
    plane: '<svg viewBox="0 0 24 24"><path class="ic-tree" d="M3 20 12 3l9 17-9-4Z"/><path class="ic-navy" d="M12 3v13l-9 4Z"/></svg>',
    smile: '<svg viewBox="0 0 24 24"><circle class="ic-yellow" cx="12" cy="12" r="10"/><circle class="ic-ink" cx="8.5" cy="10" r="1.3"/><circle class="ic-ink" cx="15.5" cy="10" r="1.3"/><path class="ic-coral" d="M8 14h8a4 4 0 0 1-8 0Z"/></svg>',
    light: '<svg viewBox="0 0 24 24"><path class="ic-tree" d="m4 6 16 3-3 9L4 12Z"/><path class="ic-navy" d="M4 12 17 18l-2 2L3 14Z"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path class="ic-coral" d="M5 9a7 7 0 0 1 14 0v5H5Z"/><path class="ic-gray" d="M3 14h18v5H3Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7M3 19l7-6m11 6-7-6"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
  };
  const tri = '<svg class="bh-tri" viewBox="0 0 10 10"><path d="M0 1h10L5 9Z"/></svg>';
  const arrow = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5"/></svg>';
  const ca = (size, color = "") => `<span class="bh-ca bh-ca--${size} ${color}">${arrow}</span>`;
  window.bhCa = ca;
  const logo = (tag = "a") => `<${tag} class="bh-logo" href="index.html" aria-label="Back to start"><svg viewBox="0 0 56 56" aria-hidden="true"><path class="lg-leaf" d="M28 6C14 6 4 16 4 28h48C52 16 42 6 28 6Z"/><path class="lg-leaf" d="M24 26h8l-1 26h-6Z"/><path class="lg-stem" d="M27 12h2v16h-2Z"/></svg><span class="bh-logo__text"><span>Organization name</span><span>Logo <i>Ruler</i><i>Ri</i><i>Mark</i>Poem</span></span></${tag}>`;
  const drops = [
    { key: "map", icon: "pin", text: "Map", items: ["Map guide", "View map", "Upload Activity", "Making a Safety Map"] },
    { key: "volunteer", icon: "plane", text: "Volunteer activities", items: ["Activity About", "Find a group", "Group registration", "Partner companies"] },
    { key: "child", icon: "smile", text: "Child safety", items: ["Child safety intro", ["Child guardian ring project", "service.html"], "Safety class", "Download materials"] },
  ];
  const dropHtml = (d) => `<li><details class="bh-drop${page === d.key ? " is-current" : ""}"><summary><span class="bh-drop__icon">${ico[d.icon]}</span><span class="bh-drop__text">${d.text}</span>${tri}</summary>
    <div class="bh-drop__body"><div class="bh-drop__inner"><ul>${d.items.map((it) => { const [t, h] = [].concat(it); return `<li><a href="${h || "#"}">${t}${ca("xs", "c-green")}</a></li>`; }).join("")}</ul></div></div></details></li>`;
  const mainMenu = `${drops.map(dropHtml).join("")}
    <li><div class="bh-drop${page === "info" ? " is-current" : ""}"><a href="#"><span class="bh-drop__icon">${ico.light}</span><span class="bh-drop__text">Notice</span></a></div></li>
    <li><div class="bh-drop${page === "news" ? " is-current" : ""}"><a href="news.html"><span class="bh-drop__icon">${ico.flag}</span><span class="bh-drop__text">Topic</span></a></div></li>`;
  const subLinks = ["Learn through video", "Frequently asked questions", "Public Materials", "Link collection", "Past records"];
  const subMenu = `<a href="index.html" class="${page === "home" ? "is-current" : ""}"><span class="t">Home</span></a>${subLinks.map((t) => `<a href="#"><span class="t">${t}</span></a>`).join("")}<span class="sep"></span><a href="#">${ico.mail}<span class="t">Inquiry</span></a><span class="sep"></span><details class="bh-drop bh-lang"><summary>${ico.globe}<span class="t">Language ▾</span></summary><div class="bh-drop__body"><div class="bh-drop__inner"><ul>${["Korean", "English", "简体中文", "繁體中文", "日本語"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></div></div></details>`;

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.outerHTML = `<header class="bh-header" data-slot="header">
  <div class="bh-header__wrap bh-in bh-in--l">
    ${logo()}
    <nav class="bh-header__menu pc" aria-label="Main menu"><ul class="bh-menu-main">${mainMenu}</ul><div class="bh-menu-sub">${subMenu}</div></nav>
  <div class="bh-ham" aria-hidden="true" data-slot="menu-drawer"><div class="bh-ham__inner">
      ${logo()}
      <div class="bh-ham__main">
        <div class="bh-ham__cols">${drops.map((d) => `<div class="bh-ham__col"><h3 class="bh-deco bh-deco--s c-green">${d.text}</h3><ul>${d.items.map((it) => { const [t, h] = [].concat(it); return `<li><a href="${h || "#"}">${t}${ca("xs", "c-green")}</a></li>`; }).join("")}</ul></div>`).join("")}
          <div class="bh-ham__col"><h3 class="bh-deco bh-deco--s c-blue">Notice</h3><ul><li><a href="#">Notice list${ca("xs", "c-blue")}</a></li></ul></div>
          <div class="bh-ham__col"><h3 class="bh-deco bh-deco--s c-coral">Topic</h3><ul><li><a href="news.html">Topic List${ca("xs", "c-coral")}</a></li></ul></div>
        </div>
        <div class="bh-fbig">${bigLinks()}</div>
      </div>
      <div class="bh-ham__sub"><div class="bh-fline">${subMenu}</div></div>
    </div></div>
    <button class="bh-burger" type="button" aria-expanded="false" aria-label="Menu"><span class="bh-burger__icon"><i></i><i></i><i></i></span><span class="bh-burger__text"><span class="is-open">Menu</span><span class="is-close">Close</span></span></button>
  </div>
</header>`;
  }
  function bigLinks() {
    return `<a href="#" style="--btn: var(--site-coral)"><span class="bh-art" data-illust="icon_run"></span><span class="t">Protect while running</span>${ca("xs", "is-white c-coral")}</a>
      <a href="#" style="--btn: var(--site-blue)"><span class="bh-art" data-illust="icon_wan"></span><span class="t">Woof Patrol</span>${ca("xs", "is-white c-blue")}</a>`;
  }
  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    const fm = [["Map", "Map", "c-green"], ["Volunteer", "Volunteer activities", "c-blue"], ["Child's Safety", "Child safety", "c-coral"], ["Information", "Notice", "c-blue"], ["Topics", "Topic", "c-coral", "news.html"]];
    footer.outerHTML = `<footer class="bh-footer" data-slot="footer">
  <div class="bh-in bh-in--m">
    <div class="bh-footer__main">
      ${logo()}
      <ul class="bh-fmenu">${fm.map(([en, ko, c, h]) => `<li><a href="${h || "#"}"><span class="bh-deco bh-deco--s ${c}">${en}</span><div>${ko}${ca("s", c)}</div></a></li>`).join("")}</ul>
      <div class="bh-fbig">${bigLinks()}</div>
    </div>
    <div class="bh-footer__sub">
      <div class="bh-fline"><a href="index.html">Home</a>${subLinks.map((t) => `<a href="#">${t}</a>`).join("")}<span class="sep"></span><a href="#">${ico.mail} Inquiry</a><a href="#">Survey ${ico.ext}</a><a class="lang" href="#">${ico.globe} Language ▾</a></div>
      <ul class="bh-fsmall"><li><a href="#">Site Policy</a></li><li><a href="#">Accessibility policy</a></li><li><a href="#">Privacy policy</a></li><li><a href="page.html">Copyright and link policy</a></li><li><a href="#">Parent organization ${ico.ext}</a></li><li><a href="#">Related Department ${ico.ext}</a></li><li><a href="#">Partner organization ${ico.ext}</a></li><li><a href="#">Official video channel ${ico.ext}</a></li></ul>
    </div>
  </div>
  <div class="bh-footer__illusts" data-slot="footer-town">
    <span class="bh-art is-base" data-illust="footer_base" data-fit="slice"></span>
    <span class="bh-art is-kids" data-lottieillust="footer_child_stand"></span>
    <span class="bh-art is-bench" data-lottieillust="home_cupple_bench"></span>
  </div>
  <div class="bh-footer__bottom">
    <div class="bh-in bh-in--m">
      <address>Put the first line of the organization address here<br>Postal code 000-0000 Address second line here<br>TEL. 00-0000-0000</address>
      <small>Copyright © 0000 Your organization’s English name here. All Rights Reserved.</small>
    </div>
    <a class="bh-totop" href="#top" data-slot="page-top"><span class="bh-totop__text">Back to top</span><span class="bh-art" data-illust="banner_inu"></span></a>
  </div>
</footer>`;
  }

  // Artwork — plays the animationData built by art.js with the same settings as the original (svg · slice)
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const play = (el, name, loop = true, fit = "xMidYMid slice") => {
    const make = window.bhArt && window.bhArt[name];
    if (!make || !window.lottie) return null;
    const a = lottie.loadAnimation({ container: el, renderer: "svg", loop, autoplay: false, animationData: make(), rendererSettings: { preserveAspectRatio: fit } });
    if (reduce) a.addEventListener("DOMLoaded", () => a.goToAndStop(a.totalFrames - 1, true));
    else a.play();
    return a;
  };
  window.bhPlay = play;
  document.querySelectorAll("[data-illust]").forEach((el) => {
    const make = window.bhArt && window.bhArt[el.dataset.illust];
    if (make && window.lottie) lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: make(), rendererSettings: { preserveAspectRatio: el.dataset.fit === "slice" ? "xMidYMid slice" : "xMidYMid meet" } });
  });
  document.querySelectorAll("[data-lottieillust]").forEach((el) => { if (!el.hasAttribute("data-late")) play(el, el.dataset.lottieillust); });

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-scroll-lottieillust]").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => play(el, el.dataset.scrollLottieillust, false) });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll("[data-scroll-lottieillust]").forEach((el) => play(el, el.dataset.scrollLottieillust, false));
  });

  // Header band: hides when the body leaves the screen (only the bottom footer visible)
  const hd = document.querySelector(".bh-header"), main = document.querySelector("main");
  if (hd && main) new IntersectionObserver((es) => es.forEach((e) => hd.classList.toggle("is-hidden", !e.isIntersecting))).observe(main);

  // Same-page links are offset by the header band height and rolled with 1s power2.out
  const offset = () => (hd ? hd.getBoundingClientRect().height : 0);
  const scrollTo = (y) => gsap.to(window, { scrollTo: { y, offsetY: typeof y === "number" ? 0 : offset() }, ease: "power2.out", duration: reduce ? 0 : 1 });
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const h = a.getAttribute("href");
    if (h === "#") return;
    e.preventDefault();
    scrollTo(h === "#top" ? 0 : h);
  }));

  // Dropdown: hand over sets autoAlpha 1 / off sets 0 (.4s power1.out). Touch opens on press and closes the others
  const hoverable = matchMedia("(hover: hover) and (pointer: fine)");
  const drops$ = [...document.querySelectorAll(".bh-header__menu details.bh-drop")];
  drops$.forEach((d) => {
    const body = d.querySelector(".bh-drop__body"), sum = d.querySelector("summary");
    let closing = false;
    const open = () => { closing = false; d.setAttribute("open", ""); gsap.to(body, { autoAlpha: 1, duration: 0.4, ease: "power1.out" }); };
    const close = () => { closing = true; gsap.to(body, { autoAlpha: 0, duration: 0.4, ease: "power1.out", onComplete() { if (closing) { d.removeAttribute("open"); closing = false; } } }); };
    d.addEventListener("mouseenter", () => hoverable.matches && open());
    d.addEventListener("mouseleave", () => hoverable.matches && close());
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (hoverable.matches) return;
      if (d.open) close();
      else { open(); drops$.forEach((o) => o !== d && o.open && gsap.to(o.querySelector(".bh-drop__body"), { autoAlpha: 0, duration: 0.4, ease: "power1.out", onComplete: () => o.removeAttribute("open") })); }
    });
  });

  // Hamburger — original timeline as is: every line starts at 0 and order comes from delays (.2·.3)
  const btn = document.querySelector(".bh-burger"), ham = document.querySelector(".bh-ham");
  if (btn && ham) {
    const inner = ham.querySelector(".bh-ham__inner"), [b1, b2, b3] = btn.querySelectorAll(".bh-burger__icon i");
    const tOpen = btn.querySelector(".is-open"), tClose = btn.querySelector(".is-close");
    const E = "power1.out";
    let isOpen = false;
    const openIt = () => {
      gsap.timeline()
        .to(b1, { y: "0.5rem", duration: 0.2, ease: E }, 0).to(b2, { opacity: 0, duration: 0.2, ease: E }, 0).to(b3, { y: "-0.5rem", duration: 0.2, ease: E }, 0)
        .to(tOpen, { autoAlpha: 0, duration: 0.2, ease: E }, 0).to(ham, { autoAlpha: 1, duration: 0.4, ease: E }, 0)
        .to(inner, { x: 0, xPercent: 0, duration: 0.45, delay: 0.2, ease: E }, 0)
        .to(b1, { rotate: 45, duration: 0.25, delay: 0.2, ease: E }, 0).to(b3, { rotate: -45, duration: 0.25, delay: 0.2, ease: E }, 0)
        .to(tClose, { autoAlpha: 1, duration: 0.25, delay: 0.2, ease: E }, 0);
      ham.setAttribute("aria-hidden", "false"); btn.setAttribute("aria-expanded", "true"); isOpen = true;
    };
    const closeIt = () => {
      gsap.timeline()
        .to(b1, { rotate: 0, duration: 0.2, ease: E }, 0).to(b3, { rotate: 0, duration: 0.2, ease: E }, 0)
        .to(tClose, { autoAlpha: 0, duration: 0.2, ease: E }, 0).to(ham, { autoAlpha: 0, duration: 0.3, ease: E }, 0)
        .set(inner, { x: 0, xPercent: 100, delay: 0.3 }, 0)
        .to(b1, { y: 0, duration: 0.25, delay: 0.2, ease: E }, 0).to(b2, { opacity: 1, duration: 0.25, delay: 0.2, ease: E }, 0).to(b3, { y: 0, duration: 0.25, delay: 0.2, ease: E }, 0)
        .to(tOpen, { autoAlpha: 1, duration: 0.25, delay: 0.2, ease: E }, 0);
      ham.setAttribute("aria-hidden", "true"); btn.setAttribute("aria-expanded", "false"); isOpen = false;
    };
    btn.addEventListener("click", () => { gsap.killTweensOf([b1, b2, b3, ham, inner, tOpen, tClose]); isOpen ? closeIt() : openIt(); });
    ham.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => isOpen && closeIt()));
  }
})();
