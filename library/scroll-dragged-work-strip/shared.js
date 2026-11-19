// Things spanning several pages (header bar, menu drawer, loader, transition curtain, cookie strip, contact button, footer) are inserted and driven from one place.
(() => {
  const page = document.body.dataset.page;
  const MARK = '<svg class="oc-mark" viewBox="0 0 300 70" aria-hidden="true"><path class="oc-mark__g" fill-rule="evenodd" d="M45 2a45 33 0 1 1 0 66a45 33 0 1 1 0-66zm0 21a22 12 0 1 0 0 24a22 12 0 1 0 0-24z"/><path class="oc-mark__g" d="M98 2h32a33 33 0 0 1 0 66h-32z"/><path class="oc-mark__g" d="M174 68V38a33 33 0 0 1 66 0v30h-22V40a11 11 0 0 0-22 0v28z"/><path class="oc-mark__g" d="M248 68L276 2h22v66h-20V52h-12l-6 16z"/></svg>';
  const ARROW = '<svg class="oc-btn__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h17M14 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const LINKS = [["01", "Work", "index.html#work"], ["02", "About", "index.html#intro"], ["03", "Journal", "article.html"], ["04", "Contact", "#footer"]];

  const header = document.querySelector('[data-slot="header"]');
  header.outerHTML = `
<header class="oc-nav" data-slot="header" data-fx="hide-on-scroll" data-fx-hide-on-scroll="look: slide; delay: 0; offset: 0">
  <a class="oc-nav__logo" href="index.html" aria-label="Back to start"${page === "home" ? "" : " data-cursor-grow"}>${MARK}</a>
  <button class="oc-nav__menu" type="button" data-cursor-grow aria-expanded="false" aria-controls="oc-menu">Menu</button>
</header>
<div class="oc-menu" id="oc-menu" data-slot="menu-drawer" hidden>
  <div class="oc-menu__bar"><a class="oc-nav__logo" href="index.html" aria-label="Back to start">${MARK}</a><button class="oc-menu__x" type="button" aria-label="Close Menu"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 6l28 28M34 6L6 34" fill="none" stroke="currentColor" stroke-width="3"/></svg></button></div>
  <nav class="oc-menu__list" data-label="Four English menu names here">${LINKS.map(([n, t, h]) => `<span class="oc-menu__no">${n}</span><a class="oc-menu__link" href="${h}">${t}</a>`).join("")}</nav>
</div>
${page === "home" ? `<div class="oc-loader" data-slot="loader" aria-hidden="true"><div class="oc-loader__mark">${MARK}</div></div>` : ""}
<div class="oc-wipe" aria-hidden="true"></div>
<div class="oc-cookie" data-slot="cookie-banner" role="dialog" aria-label="Cookie Notice"><p>Your cookie storage notice goes here in three lines. Cookies help with using the site and with understanding how it is used. For details, see <a href="#footer">Privacy policy</a>Seen at.</p><button class="oc-cookie__ok" type="button">Got it</button></div>
<a class="oc-contact" href="#footer" data-cursor-grow data-slot="contact-badge" aria-label="Get in touch" data-label="Your English contact phrase here to wrap around a circle">
  <span class="oc-contact__ring" data-fx="scroll-spin-ring" data-fx-scroll-spin-ring="text: Get in touch; sep:  ·  ; size: 92; inset: 40; trigger: body; start: top top; end: bottom bottom; lag: 0.8"></span>
  <svg class="oc-contact__plane" viewBox="0 0 48 48" aria-hidden="true"><path d="M5 23L43 7 34 41 22 30zM22 30l21-23M22 30v11l6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>
</a>`;

  const footer = document.querySelector('[data-slot="footer"]');
  footer.outerHTML = `
<footer class="oc-foot" id="footer" data-slot="footer">
  <div class="oc-band" data-slot="accreditation-loop">
    ${[0, 1].map((k) => `<div class="oc-band__row"${k ? ' aria-hidden="true"' : ""}>${Array.from({ length: 8 }, (_, i) => `<span class="wf-logo">Certification ${i + 1}</span>`).join("")}</div>`).join("")}
  </div>
  <div class="oc-foot__grid">
    <form class="oc-news" onsubmit="return false">
      <label class="oc-news__lead" for="oc-mail">Your newsletter intro here, in two lines. Sharp thinking and the occasional strong opinion, sent by email.</label>
      <div class="oc-news__row"><input class="oc-news__mail" id="oc-mail" type="email" placeholder="Please write your email address"><button class="oc-news__go" type="submit" aria-label="Subscription">${ARROW}</button></div>
      <label class="oc-news__ok"><input type="checkbox"> Confirm you want to receive the newsletter.</label>
    </form>
    <div class="oc-seal" aria-label="Certification mark slot" data-label="Two English letters for the certification mark here"><span>Certified</span><svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="none" stroke="currentColor" stroke-width="3"/><path d="M18 31l8 8 16-17" fill="none" stroke="currentColor" stroke-width="4"/></svg><span>Seal Name</span></div>
    <div class="oc-foot__logo" role="img" aria-label="Company logo">${MARK}</div>
    <nav class="oc-foot__links" data-label="Three English menu names here"><a href="index.html#work">Work</a><a href="index.html#intro">About</a><a href="article.html">Journal</a></nav>
    <div class="oc-foot__info"><p>+00 0000 0000<br>hello@example.com</p><a href="#footer">Privacy policy</a><p>Your one-line address here<br>ⓒ 0000 Company Name</p></div>
    <div class="oc-foot__social"><a class="oc-pill" href="#footer" data-cursor-grow><span class="oc-pill__fill"></span><span class="oc-pill__text">Professional network</span></a><a class="oc-pill" href="#footer" data-cursor-grow><span class="oc-pill__fill"></span><span class="oc-pill__text">Social Media</span></a></div>
  </div>
</footer>`;

  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = (c, f) => (window.CustomEase ? CustomEase.create(`oc-${c}`, c) : f);
  const loader = document.querySelector(".oc-loader");
  const wipe = document.querySelector(".oc-wipe");

  // Site-builder first screen: the logo turns on .3s late over 1s, and the panel stays for 2s then slides up over 1.5s with inOutQuart
  if (loader) {
    if (reduce) loader.remove();
    else {
      gsap.fromTo(".oc-loader__mark", { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.3 });
      gsap.to(loader, { yPercent: -100, duration: 1.5, delay: 2, ease: "power4.inOut", onComplete: () => loader.remove() });
    }
  } else if (!reduce) {
    // The site builder’s Load In Transition is lifted at PAGE_FINISH (after load) — until then the yellow curtain covers the page
    gsap.set(wipe, { display: "block", yPercent: 0 });
    const lift = () => gsap.to(wipe, { yPercent: -100, duration: 0.5, ease: "power4.inOut", onComplete: () => gsap.set(wipe, { display: "none" }) });
    if (document.readyState === "complete") lift(); else addEventListener("load", lift, { once: true });
  }

  // Same-site links: the yellow curtain covers from below over .5s, then navigates at .6s (original setTimeout 600)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (href.includes("#") || /^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    gsap.fromTo(wipe, { display: "block", yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "power4.inOut" });
    setTimeout(() => { location.href = href; }, 600);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  // Menu drawer: .7s opening, .5s closing, with different curves
  const menu = document.getElementById("oc-menu");
  const menuBtn = document.querySelector(".oc-nav__menu");
  const open = () => {
    menu.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    gsap.fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: reduce ? 0 : 0.7, ease: ease("0.409,0.001,0.205,0.995", "power3.inOut"), overwrite: true });
  };
  const close = () => {
    menuBtn.setAttribute("aria-expanded", "false");
    gsap.to(menu, { yPercent: -100, duration: reduce ? 0 : 0.5, ease: ease("0.503,0.007,0.497,1.007", "power2.inOut"), overwrite: true, onComplete: () => { menu.hidden = true; } });
  };
  menuBtn.addEventListener("click", open);
  menu.querySelector(".oc-menu__x").addEventListener("click", close);
  menu.querySelectorAll(".oc-menu__link").forEach((a) => a.addEventListener("click", () => { if (a.getAttribute("href").includes("#")) close(); }));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) close(); });

  // Cookie bar rises from below in .5s after 5s, and goes back down with inQuint when pressed
  const cookie = document.querySelector(".oc-cookie");
  if (sessionStorage.getItem("oc-cookie")) cookie.remove();
  else {
    gsap.fromTo(cookie, { yPercent: 200 }, { yPercent: 0, duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 5, ease: ease("0.215,0.61,0.355,1", "power3.out") });
    cookie.querySelector(".oc-cookie__ok").addEventListener("click", () => {
      sessionStorage.setItem("oc-cookie", "1");
      gsap.to(cookie, { yPercent: 200, duration: 0.5, ease: "power5.in", overwrite: true, onComplete: () => cookie.remove() });
    });
  }

  // Door button: when the hand enters and leaves it presses to .75 in .22s, bounces to 1.075 and settles in .73s (values measured from the original)
  const contact = document.querySelector(".oc-contact");
  const squish = () => (gsap.killTweensOf(contact), gsap.timeline())
    .to(contact, { scale: 0.75, duration: 0.22, ease: "power2.out" })
    .to(contact, { scale: 1.075, duration: 0.22, ease: "sine.inOut" })
    .to(contact, { scale: 0.975, duration: 0.15, ease: "sine.inOut" })
    .to(contact, { scale: 1, duration: 0.14, ease: "sine.out" });
  if (!reduce) { contact.addEventListener("mouseenter", squish); contact.addEventListener("mouseleave", squish); }

  // Outline pill: a circle hidden below rises in .5s to fill the cell, and on leave it exits fully upward and then returns to place
  mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
    const pills = [...document.querySelectorAll(".oc-pill")];
    const enter = (e) => {
      const fill = e.currentTarget.querySelector(".oc-pill__fill"), text = e.currentTarget.querySelector(".oc-pill__text");
      gsap.fromTo(fill, { yPercent: 0, display: "block" }, { yPercent: -50, duration: 0.5, ease: "power1.out", overwrite: true });
      gsap.to(text, { filter: "invert(100%)", duration: 0.3, overwrite: true });
    };
    const leave = (e) => {
      const fill = e.currentTarget.querySelector(".oc-pill__fill"), text = e.currentTarget.querySelector(".oc-pill__text");
      gsap.to(fill, { yPercent: -125, duration: 0.4, ease: "power1.out", overwrite: true, onComplete: () => gsap.set(fill, { yPercent: 0, display: "none" }) });
      gsap.to(text, { filter: "invert(0%)", duration: 0.3, delay: 0.1, overwrite: true });
    };
    pills.forEach((p) => { p.addEventListener("mouseenter", enter); p.addEventListener("mouseleave", leave); });
    return () => pills.forEach((p) => { p.removeEventListener("mouseenter", enter); p.removeEventListener("mouseleave", leave); });
  });
})();
