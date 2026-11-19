// Header, drawer, contact, Instagram band, footer, loading and interaction response shared by all pages. Values are the original library.js as is
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swing = "sine.inOut"; // jQuery swing = 0.5 - cos(pπ)/2
  const NAV = [["about.html", "About"], ["#", "Dress"], ["#", "Kimono"], ["#", "Groom"], ["service.html", "Service"], ["#", "Price"], ["#", "Salon"], ["news.html", "News"], ["#", "FAQ"], ["contact.html", "Contact"]];
  const ARROW = '<svg class="icon" viewBox="0 0 10 8" aria-hidden="true"><path d="M0 4h9M6 1l3 3-3 3"/></svg>';
  const LOGO = '<span class="lv-logo"><i>L</i><span><span>WEDDING DRESS</span><b>Brand</b></span></span>';
  const list = (cls) => NAV.map(([h, t]) => `<li class="${cls}"><a href="${h}">${t}</a></li>`).join("");
  const cta = (cls) => `<li class="${cls}"><a href="contact.html">Online consultation</a></li><li class="${cls}"><a href="contact.html">Book an in-store fitting</a></li>`;

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.classList.add("l-header");
    if (header.dataset.white !== undefined) header.classList.add("initial-white");
    if (header.dataset.fixed !== undefined) header.classList.add("initial-fixed");
    header.innerHTML = `<div class="l-header__wrap">
      <div class="l-header__logo"><a href="index.html" aria-label="Logo">${LOGO}</a></div>
      <div class="l-header__menu">
        <nav class="l-header__nav"><ul class="l-header__nav__list">${list("")}</ul></nav>
        <ul class="l-header__cta">${cta("")}</ul>
        <button type="button" class="l-header__btn js-openDrawer" data-target="drawer-menu" aria-label="Menu"><span class="l-header__btn__border"></span></button>
        <div id="drawer-menu" class="drawer js-drawer"><div class="drawer-backdrop js-backdrop"></div>
          <div class="drawer-contents"><div class="drawer-contents-body">
            <ul class="drawer-nav">${list("")}</ul>
            <ul class="drawer-cta">${cta("")}</ul>
            <ul class="drawer-sub"><li><a href="#">Company overview</a></li><li><a href="#">Privacy policy</a></li></ul>
            <p class="drawer-copyright">©Brand All Rights Reserved.</p>
          </div></div>
          <button type="button" class="l-header__btn js-closeDrawer" aria-label="Close"><span class="l-header__btn__border"></span></button>
        </div>
      </div>
    </div>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.outerHTML = `<section class="l-footer-cta" data-slot="footer-cta"><div class="inner-m">
        <div class="c-sec-heading"><h2 class="en-tit anim fade-up">Contact</h2><p class="lead anim fade-up">Your line here saying you can try it on at 00 stores nationwide.<br>A line inviting easy inquiries and consultations.</p></div>
        <ul class="l-footer-cta__list">
          <li class="anim fade-up"><a href="contact.html"><h3 class="ja-tit">Online consultation</h3><p class="en-tit">Online Consultation</p><p class="summary">Your text here, about three lines, suggesting choosing outfits while listening to the wind, and saying rental flow and fees can be discussed freely.</p><div class="btn"><span class="txt">To booking screen</span>${ARROW}</div></a></li>
          <li class="anim fade-up"><a href="contact.html"><h3 class="ja-tit">Book an in-store fitting</h3><p class="en-tit">Book a Dress Fitting</p><p class="summary">Your line here saying try-ons are by advance reservation, plus about three lines saying you can pick a nearby store and try things on at leisure.</p><div class="btn"><span class="txt">To booking screen</span>${ARROW}</div></a></li>
        </ul>
        <div class="c-simple-btn u-mt70 anim fade-up"><a href="contact.html"><span class="txt">Contact via Form</span>${ARROW}</a></div>
      </div></section>
      <aside class="l-footer-insta" data-slot="insta-strip"><a href="#" data-header-theme="white"><span class="strip" aria-hidden="true">${["Profile of a bride in a dress · backlit by a window", "Hand holding a bouquet · Close-up", "Dress back view · natural light", "Groom in tuxedo, upper body · Indoors", "Dress hem · wooden floor", "Smiling bride · soft light"].map((l) => `<span class="wf-img" data-label="${l} · Vertical"></span>`).join("")}</span><span class="txt">Instagram</span></a></aside>
      <footer class="l-footer" data-slot="footer"><div class="l-footer__wrap inner-xl">
        <div class="logo_area">${LOGO}<p class="sub">Your one-line brand slogan here.</p></div>
        <nav class="l-footer__nav"><ul>${list("").split("</li>").slice(0, 6).join("</li>")}</li></ul><ul>${list("").split("</li>").slice(6, 10).join("</li>")}</li></ul><ul>${cta("")}</ul></nav>
      </div>
      <div class="l-footer__lower inner-xl"><ul><li><a href="#">Company overview</a></li><li><a href="#">Privacy policy</a></li></ul><div class="copyright">©Brand All Rights Reserved.</div></div></footer>`;
  }

  // Loading curtain — once everything has loaded (or after 10 seconds) it clears in .8s after .3s (jQuery fadeOut)
  // The curtain sits at the very front of the html to cover from the first paint — the original is also static markup
  const loader = document.querySelector("[data-loader]");
  let done = false;
  const hide = () => {
    if (done || !loader) return;
    done = true;
    gsap.to(loader, { opacity: 0, duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.3, ease: swing, onComplete: () => { loader.style.display = "none"; } });
  };
  addEventListener("load", hide);
  setTimeout(hide, 10000);

  // When on screen, data-anim-status=true
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.setAttribute("data-anim-status", "true"); }), { threshold: 0 });
  document.querySelectorAll(".anim").forEach((el) => { el.setAttribute("data-anim-status", "false"); io.observe(el); });

  // Wide screen: past 1000px of scrolling the header sticks and comes down in .35s, and goes back up in .35s on return
  const head = document.querySelector(".l-header");
  const fixedFirst = head?.classList.contains("initial-fixed");
  const drawerOpen = () => !!document.querySelector('.js-openDrawer[aria-expanded="true"]');
  const fixHeader = () => {
    if (!head) return;
    if (innerWidth < 961) { head.classList.remove("is-fixed", "is-animate-in", "is-animate-out"); head.style.zIndex = ""; return; }
    if (fixedFirst) { head.classList.add("is-fixed"); head.style.zIndex = drawerOpen() ? 1 : ""; return; }
    if (scrollY > 1000) {
      if (!head.classList.contains("is-fixed")) {
        head.classList.remove("is-animate-out");
        head.classList.add("is-fixed");
        requestAnimationFrame(() => head.classList.add("is-animate-in"));
        setTimeout(() => head.classList.remove("is-animate-in"), 350);
      }
    } else if (head.classList.contains("is-fixed") && !head.classList.contains("is-animate-out")) {
      head.classList.remove("is-animate-in");
      head.classList.add("is-animate-out");
      setTimeout(() => head.classList.remove("is-fixed", "is-animate-out"), 350);
    }
    head.style.zIndex = "";
  };
  addEventListener("scroll", fixHeader, { passive: true });
  addEventListener("resize", fixHeader);
  fixHeader();

  // Narrow screen: white section (data-header-theme=white) the hamburger turns white when passing over it
  const whites = [...document.querySelectorAll('[data-header-theme="white"]')];
  let tick = false;
  const tone = () => {
    tick = false;
    if (!head) return;
    if (innerWidth > 960) { head.classList.remove("is-white"); return; }
    const line = head.offsetHeight;
    head.classList.toggle("is-white", whites.some((s) => { const r = s.getBoundingClientRect(); return r.top <= line && r.bottom > 0; }));
  };
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(tone); } }, { passive: true });
  addEventListener("resize", tone);
  addEventListener("load", tone);
  tone();

  // Drawer
  let y = 0, opened = null;
  const fix = (on) => {
    if (on) { y = scrollY; Object.assign(document.body.style, { position: "fixed", top: `-${y}px`, left: "0", right: "0", width: "100%" }); }
    else { Object.assign(document.body.style, { position: "", top: "", left: "", right: "", width: "" }); scrollTo(0, y); }
  };
  const btn = document.querySelector(".l-header__btn.js-openDrawer");
  const closeAll = () => {
    document.querySelectorAll(".js-drawer, .js-openDrawer, .js-closeDrawer").forEach((d) => d.setAttribute("aria-expanded", "false"));
    if (opened) fix(false);
    opened = null;
    btn?.classList.remove("is-hidden");
    fixHeader();
  };
  document.querySelectorAll(".js-openDrawer").forEach((b) => {
    const d = document.getElementById(b.dataset.target);
    if (!d) return;
    b.setAttribute("aria-expanded", "false");
    d.setAttribute("aria-expanded", "false");
    b.addEventListener("click", () => {
      if (opened && opened !== d) closeAll();
      d.setAttribute("aria-expanded", "true");
      b.setAttribute("aria-expanded", "true");
      d.querySelector(".js-closeDrawer")?.setAttribute("aria-expanded", "true");
      fix(true);
      opened = d;
      if (d.id !== "drawer-menu") btn?.classList.add("is-hidden");
      setTimeout(fixHeader, 0);
    });
    d.querySelector(".js-closeDrawer")?.addEventListener("click", closeAll);
    d.querySelector(".js-backdrop")?.addEventListener("click", closeAll);
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && opened) closeAll(); });

  // In-page link — subtract the pinned header height, 400ms swing
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    const t = href === "#" ? document.documentElement : document.querySelector(href);
    if (!t) return;
    e.preventDefault();
    const h = document.querySelector(".l-header.is-fixed")?.offsetHeight || 0;
    const to = t.getBoundingClientRect().top + scrollY - h;
    const s = { y: scrollY };
    gsap.to(s, { y: to, duration: reduce ? 0 : 0.4, ease: swing, onUpdate: () => scrollTo(0, s.y) });
  });

  // Question expand, slideToggle(400ms swing)
  document.querySelectorAll(".p-faq__list__tit").forEach((q) => {
    const a = q.nextElementSibling;
    q.addEventListener("click", () => {
      const open = !q.classList.contains("active");
      q.classList.toggle("active", open);
      gsap.killTweensOf(a);
      if (open) { a.style.display = "block"; gsap.fromTo(a, { height: 0 }, { height: "auto", duration: reduce ? 0 : 0.4, ease: swing, clearProps: "height" }); }
      else gsap.to(a, { height: 0, duration: reduce ? 0 : 0.4, ease: swing, onComplete: () => { a.style.display = "none"; gsap.set(a, { clearProps: "height" }); } });
    });
  });
})();
