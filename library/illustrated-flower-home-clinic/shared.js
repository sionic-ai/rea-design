// Attaches the header, phone drawer, flower badge, footer contact and footer shared by every page, and runs the rise-in (.js-scroll), arm slide-in and inner shift with the original values.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page;

  // Flower and leaf art is filled with skin variables — class names (.f-*) in the inline SVG
  const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="g-logo" viewBox="0 0 60 60"><path d="M30 30C22 18 24 6 30 2c6 4 8 16 0 28z" class="f-a"/><path d="M30 30c12-8 24-6 28 0-4 6-16 8-28 0z" class="f-t"/><path d="M30 30c8 12 6 24 0 28-6-4-8-16 0-28z" class="f-y"/><path d="M30 30C18 38 6 36 2 30c4-6 16-8 28 0z" class="f-p"/><circle cx="30" cy="30" r="5" class="f-w"/></symbol>
    <symbol id="g-flower" viewBox="0 0 100 100"><g class="f-a"><circle cx="50" cy="22" r="20"/><circle cx="77" cy="42" r="20"/><circle cx="67" cy="74" r="20"/><circle cx="33" cy="74" r="20"/><circle cx="23" cy="42" r="20"/></g><circle cx="50" cy="52" r="12" class="f-y"/></symbol>
    <symbol id="g-flower2" viewBox="0 0 100 100"><g class="f-p"><ellipse cx="50" cy="24" rx="14" ry="22"/><ellipse cx="50" cy="76" rx="14" ry="22"/><ellipse cx="24" cy="50" rx="22" ry="14"/><ellipse cx="76" cy="50" rx="22" ry="14"/></g><circle cx="50" cy="50" r="10" class="f-a"/></symbol>
    <symbol id="g-leaf" viewBox="0 0 100 100"><path d="M10 90C10 40 40 10 90 10 90 60 60 90 10 90z" class="f-t"/><path d="M14 86 80 20" class="f-lw"/></symbol>
    <symbol id="g-bloom" viewBox="0 0 200 200"><path d="M100 8c18 0 26 22 40 26s34-8 44 8-6 32-4 48 20 30 12 46-30 12-42 22-12 34-30 34-22-24-36-30-36 6-46-10 8-32 6-48S10 72 22 58s32 0 44-14S82 8 100 8z"/></symbol>
    <symbol id="g-tel" viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);

  const menu = [
    ["about.html", "Menu 1", [["about.html#greeting", "Sub 1"], ["about.html#outline", "Sub 2"], ["about.html#access", "Sub 3"]]],
    ["index.html#medical", "Menu 2"],
    ["index.html#medical", "Menu 3"],
    ["index.html#staff", "Menu 4 · Slightly long name"],
    ["recruit.html", "Menu 5"],
    ["news.html", "Menu 6"],
  ];
  const cur = { about: "about.html", recruit: "recruit.html", news: "news.html" }[page];
  const logo = '<div class="g-logo"><a href="index.html"><svg aria-hidden="true"><use href="#g-logo"/></svg><span><b>Your name here</b><small>Your subtitle here</small></span></a></div>';
  const chrome = `
  <header class="g-header" data-slot="header">
    <div class="g-header__in">
      ${logo}
      <a class="g-telbtn" href="tel:0000000000" aria-label="Phone"><svg><use href="#g-tel"/></svg></a>
      <button type="button" class="g-burger" aria-label="Open Menu" aria-expanded="false"><i><b></b><b></b><b></b></i></button>
      <nav class="g-nav" data-slot="nav-drawer">
        <ul class="g-nav__menu">
          ${menu.map(([h, t, sub]) => `<li class="${sub ? "has-sub" : ""}${h === cur ? " is-current" : ""}"><a class="g-nav__link" href="${h}"><span>${t}</span></a>${sub ? `<button type="button" class="g-subtoggle" aria-label="Submenu"></button><div class="g-subnav">${sub.map(([sh, st]) => `<a href="${sh}">${st}</a>`).join("")}</div>` : ""}</li>`).join("")}
        </ul>
        <ul class="g-nav__cta">
          <li class="g-nav__tel"><a href="tel:0000000000"><span class="tel">TEL.<b>000-000-0000</b></span><span class="hours">Reception hours: weekdays 0:00~00:00</span></a></li>
          <li class="g-nav__contact btn"><a href="#">Inquiry</a></li>
        </ul>
      </nav>
    </div>
  </header>`;
  const badge = `
  <div class="g-badge" data-slot="sticky-badge">
    <svg viewBox="0 0 200 220" aria-hidden="true"><use href="#g-bloom" class="f-t" transform="translate(0 10)"/></svg>
    <a href="index.html#staff"><span class="g-badge__txt"><span class="en">FOR<br>MEDICAL STAFF</span>Your badge label here<br>Two lines</span></a>
  </div>`;
  const cta = `
  <div class="g-cta" data-slot="footer-cta">
    <svg class="g-cta__art" viewBox="0 0 1920 1160" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Illustration of a bouquet blooming from an open envelope">
      <path d="M520 1160V560l440-260 440 260v600z" class="f-env"/>
      <path d="M520 560l440 330 440-330" class="f-envline"/>
      <g transform="translate(560 160)">
        <use href="#g-leaf" width="260" height="260" x="-40" y="120"/><use href="#g-leaf" width="240" height="240" x="560" y="60" transform="scale(-1 1) translate(-1360 0)"/>
        <use href="#g-flower2" width="220" height="220" x="60" y="0"/><use href="#g-flower" width="200" height="200" x="520" y="-40"/>
        <use href="#g-flower2" width="180" height="180" x="640" y="140"/><use href="#g-leaf" width="200" height="200" x="300" y="-80"/>
        <use href="#g-flower" width="160" height="160" x="230" y="60"/>
      </g>
    </svg>
    <div class="g-cta__arm" aria-hidden="true"><svg viewBox="0 0 1280 520"><path d="M0 250c260-20 520-30 760-10 70 6 120 20 160 50l90 70c30 24 20 60-14 60H850c-40 0-70 10-110 30-60 30-150 40-230 40H0z" class="f-arm"/><path d="M800 360c40-20 90-30 140-24" class="f-armline"/></svg></div>
    <div class="g-cta__box is-tel">
      <svg viewBox="0 0 200 200" aria-hidden="true"><use href="#g-bloom" class="f-a"/></svg>
      <div class="g-cta__num">
        <span class="subtitle en">CONTACT</span>
        <p class="ttl-05">Your phone and fax here<br class="sp-only">Contact one-liner</p>
        <a href="tel:0000000000" class="g-cta__tel"><span class="en">TEL.</span>000-000-0000</a>
        <span class="g-cta__hours">(Reception hours: weekdays 0:00~00:00)</span>
        <span class="g-cta__tel"><span class="en">FAX.</span>000-000-0000</span>
        <span class="g-cta__hours">(Open 24 hours)</span>
      </div>
    </div>
    <div class="g-cta__box is-mail">
      <svg viewBox="0 0 200 200" aria-hidden="true"><use href="#g-bloom" class="f-a"/></svg>
      <div class="g-cta__num">
        <span class="subtitle en">MAIL</span>
        <p class="ttl-05">Your email inquiry line here</p>
        <div class="btn"><a class="g-cta__mail" href="#">Your contact button here</a></div>
      </div>
    </div>
  </div>
  <footer class="g-footer" data-slot="footer">
    <div class="inner g-footer__in">
      <div class="g-footer__logo">${logo}</div>
      <address>
        <p class="ttl-06">Corporation name · Your hospital name here</p>
        <p class="ttl-06">Postal code and address here, one line</p>
        <p class="ttl-05"><a href="tel:0000000000">Phone number <span class="fnav-cta">000-000-0000</span></a><span>Fax number <span class="fnav-cta">000-000-0000</span></span></p>
      </address>
      <nav class="g-fnav"><ul>${menu.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}<li><a href="news.html">News</a></li><li><a href="#">Inquiry</a></li><li><a href="#">Sitemap</a></li></ul></nav>
      <div class="g-copy"><small>&copy;0000 Your company name here</small><span>Your place of making here</span></div>
    </div>
  </footer>`;
  const related = page === "home" ? "" : `
  <nav class="g-related" data-slot="related-pages"><ul>${[["about.html", "Menu 1", "ABOUT"], ["index.html#medical", "Menu 2", "HOME CARE"], ["recruit.html", "Menu 5", "RECRUIT"]].map(([h, t, e]) => `<li><a href="${h}"><b>${t}</b><span class="en">${e}</span></a></li>`).join("")}</ul></nav>`;
  document.body.insertAdjacentHTML("afterbegin", chrome);
  document.querySelector("main").insertAdjacentHTML("afterend", related + badge + cta);

  // Phone drawer — original: pressing the button adds active to the drawer and button, and locks html scroll (the drawer uses a css transition .4s ease-out)
  const burger = document.querySelector(".g-burger");
  const setNav = (on) => {
    document.body.classList.toggle("is-nav", on);
    document.documentElement.style.overflowY = on ? "hidden" : "";
    burger.setAttribute("aria-expanded", String(on));
  };
  burger.addEventListener("click", () => setNav(!document.body.classList.contains("is-nav")));
  document.querySelectorAll(".g-nav a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  // Submenu expand — original jQuery slideToggle(400)
  document.querySelectorAll(".g-subtoggle").forEach((t) => {
    t.addEventListener("click", () => {
      const sub = t.nextElementSibling, open = !t.classList.contains("is-open");
      t.classList.toggle("is-open", open);
      gsap.killTweensOf(sub);
      if (open) { sub.style.display = "block"; gsap.fromTo(sub, { height: 0, overflow: "hidden" }, { height: "auto", duration: reduce ? 0 : 0.4, ease: "sine.inOut", clearProps: "height,overflow" }); }
      else gsap.to(sub, { height: 0, overflow: "hidden", duration: reduce ? 0 : 0.4, ease: "sine.inOut", onComplete: () => gsap.set(sub, { display: "none", clearProps: "height,overflow" }) });
    });
  });

  // Inner movement — original: 400ms swing
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      const t = href.length > 1 && document.querySelector(href);
      if (!t && href !== "#") return;
      e.preventDefault();
      const pad = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const from = scrollY, to = t ? t.getBoundingClientRect().top + scrollY - pad : 0, p = { v: 0 };
      gsap.to(p, { v: 1, duration: reduce ? 0 : 0.4, ease: "sine.inOut", onUpdate: () => scrollTo(0, from + (to - from) * p.v) });
    });
  });

  gsap.registerPlugin(ScrollTrigger);
  // Float-up — original: once the element’s top edge reaches 50px below the screen center (changed via data-start), is-active is applied once
  gsap.utils.toArray(".js-scroll").forEach((el) => {
    const start = el.getAttribute("data-start") || "-=50px";
    ScrollTrigger.create({ trigger: el, start: `top${start} center`, toggleClass: "is-active", once: true });
  });
  // Contact tail arm — when the arm’s top end touches the screen center it enters from the left (1s cubic-bezier(.25,.8,.25,1)), and exits again when scrolling back up
  ScrollTrigger.create({ trigger: ".g-cta__arm", start: "top center", toggleClass: "is-active" });

  // Sub page photo slider — original slick: slides over 1s every 5s, dots and arrows, doesn’t pause on hover
  if (window.jQuery && $.fn.slick) $(".g-slider").slick({ autoplay: !reduce, autoplaySpeed: 5000, speed: reduce ? 0 : 1000, prevArrow: '<a class="slick-prev" href="#" aria-label="Previous"></a>', nextArrow: '<a class="slick-next" href="#" aria-label="Next"></a>', dots: true, pauseOnFocus: false, pauseOnHover: false, customPaging: () => "", slidesToShow: 1 });
  // FAQ — original: pressing a question sets active (+ the button turns 180° and the vertical stroke vanishes), the answer is slideToggle(400)
  document.querySelectorAll(".g-faq__q").forEach((q) => {
    const a = q.nextElementSibling;
    a.style.display = "none";
    q.addEventListener("click", () => {
      const open = !q.classList.contains("active");
      q.classList.toggle("active", open);
      gsap.killTweensOf(a);
      if (open) { a.style.display = "block"; gsap.fromTo(a, { height: 0, overflow: "hidden" }, { height: "auto", duration: reduce ? 0 : 0.4, ease: "sine.inOut", clearProps: "height,overflow" }); }
      else gsap.to(a, { height: 0, overflow: "hidden", duration: reduce ? 0 : 0.4, ease: "sine.inOut", onComplete: () => gsap.set(a, { display: "none", clearProps: "height,overflow" }) });
    });
  });

  window.gSite = { reduce };
})();
