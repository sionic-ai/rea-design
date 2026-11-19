// Attaches the shared header · menu drawer · bottom button row · frame · footer in one place, and runs the loading curtain, drawer, accordion and review slider with the original values.
(() => {
  const page = document.body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPC = () => matchMedia("(min-width: 960px)").matches;

  // The drawing is painted with the inline SVG’s slot names (.i-a etc.) — the halftone pattern is also kept in the document so it follows the skin variables
  const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <pattern id="ad-dots" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" class="i-a"/><circle cx="2.2" cy="2.2" r="1.3" class="i-w"/><circle cx="6.7" cy="6.7" r="1.3" class="i-w"/></pattern>
      <pattern id="ad-dots-soft" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" class="i-w"/><circle cx="2.2" cy="2.2" r="1.3" class="i-a"/><circle cx="6.7" cy="6.7" r="1.3" class="i-a"/></pattern>
    </defs>
    <symbol id="ad-i-arr" viewBox="0 0 24 24"><path d="M6.5 11h8.6l-3.3-3.3 1.4-1.4 5.7 5.7-5.7 5.7-1.4-1.4 3.3-3.3H6.5z"/></symbol>
    <symbol id="ad-i-pin" viewBox="0 0 24 24"><path d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.3 6.6 11.8 6.9 12.1l.6.6.6-.6c.3-.3 6.9-6.8 6.9-12.1A7.5 7.5 0 0 0 12 2zm0 18c-1.9-2-5.8-6.7-5.8-10.5a5.8 5.8 0 1 1 11.6 0c0 3.8-3.9 8.5-5.8 10.5zm0-13.6a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm0 4.5a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z"/></symbol>
    <symbol id="ad-i-chat" viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8-6c1.4-1.6 2-3.2 2-4.8C22 6.6 17.5 3 12 3zM7.6 13.3H5.7a.5.5 0 0 1-.5-.5V9a.5.5 0 0 1 1 0v3.3h1.4a.5.5 0 0 1 0 1zm2 -.5a.5.5 0 0 1-1 0V9a.5.5 0 0 1 1 0zm4.6 0a.5.5 0 0 1-.9.3l-1.9-2.6v2.3a.5.5 0 0 1-1 0V9a.5.5 0 0 1 .9-.3l1.9 2.6V9a.5.5 0 0 1 1 0zm3.1-2.4a.5.5 0 0 1 0 1h-1.4v.9h1.4a.5.5 0 0 1 0 1h-1.9a.5.5 0 0 1-.5-.5V9a.5.5 0 0 1 .5-.5h1.9a.5.5 0 0 1 0 1h-1.4v.9z"/></symbol>
    <symbol id="ad-i-q" viewBox="0 0 24 24"><path d="M12 2.5a9.5 9.5 0 1 0 5.6 17.2l2.3 2.3 1.8-1.8-2.2-2.2A9.5 9.5 0 0 0 12 2.5zm0 16.4a6.9 6.9 0 1 1 3.9-1.2l-2.2-2.2-1.8 1.8 1.9 1.9c-.6.2-1.2.3-1.8.3z"/></symbol>
    <symbol id="ad-i-a" viewBox="0 0 24 24"><path d="M10.2 3h3.6l6.7 18h-3l-1.7-4.6H8.2L6.5 21h-3zm-1 10.8h5.6L12 6.3z"/></symbol>
    <symbol id="ad-i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" class="i-g"/><path d="M6.5 12.2l3.6 3.6 7.4-7.4" fill="none" stroke-width="2.6" class="i-lw" style="stroke-width:2.6"/></symbol>
    <symbol id="ad-i-logo" viewBox="0 0 100 100"><path d="M50 6 88 26v44H12V26z" class="i-w"/><path d="M50 6 88 26v44H12V26z" fill="none" class="i-ln" style="stroke-width:6"/><rect x="26" y="34" width="48" height="22" rx="11" class="i-w"/><path d="M50 34h13a11 11 0 0 1 0 22H50z" class="i-a"/><rect x="26" y="34" width="48" height="22" rx="11" fill="none" class="i-ln" style="stroke-width:5"/><path d="M50 34v22" class="i-ln" style="stroke-width:5"/><path d="M24 80l10-4 6 9-12 7z" class="i-a"/><path d="M62 77h11l2 12H62z" class="i-a"/></symbol>
    <symbol id="ad-ill-ride" viewBox="0 0 1000 924"><path d="M70 914V430C70 200 260 26 500 26s430 174 430 404v484z" class="i-d"/><path d="M70 914V430C70 200 260 26 500 26s430 174 430 404v484z" class="i-ls" style="stroke-width:20"/><path d="M640 150c30-26 80-20 100 6 30-8 70 10 70 40H600c0-24 18-42 40-46zM190 300c20-20 60-18 74 4 24-4 52 8 52 30H160c0-18 14-32 30-34z" class="i-w"/><path d="M300 200c18-14 40-12 50 4M330 170c12-8 28-6 34 4" class="i-lw" style="stroke-width:8"/><circle cx="250" cy="770" r="132" class="i-ln" style="stroke-width:24"/><circle cx="760" cy="770" r="132" class="i-ln" style="stroke-width:24"/><path d="M250 770 420 560h230M420 560l90 210h250M650 560l110 210M600 470l50 90" class="i-ls" style="stroke-width:22"/><path d="M560 440h120l14 60" class="i-ln" style="stroke-width:20"/><path d="M680 520h170v140H690z" class="i-w"/><path d="M700 520c0-80 40-120 70-120s70 40 70 120z" class="i-k"/><path d="M170 380h130v150H170z" class="i-w"/><circle cx="235" cy="350" r="56" class="i-w"/><path d="M180 345c0-40 26-60 55-60s56 20 56 60z" class="i-s"/><path d="M220 460h60v120l-30 20-30-20z" class="i-a"/><path d="M430 260c40-10 90 0 120 40l70 180-40 20-50-80-20 200H400l-10-210c0-80 10-130 40-150z" class="i-s"/><path d="M400 620c60-20 120-10 160 20l-30 150h-40l-10-90c-30 0-60-10-90-20z" class="i-w"/><circle cx="470" cy="200" r="66" class="i-w"/><path d="M410 200c-10-70 30-110 80-110 46 0 80 40 66 90-30-20-70-30-110-20-10 20-20 30-36 40z" class="i-k"/><circle cx="500" cy="210" r="7" class="i-k"/><circle cx="530" cy="210" r="7" class="i-k"/><ellipse cx="515" cy="240" rx="10" ry="12" class="i-k"/><g class="ad-ill__worry"><path d="M590 120c10-24 28-34 40-30-6 14-20 28-40 30zM610 160c18-12 36-12 44-4-12 8-28 10-44 4z" class="i-w"/></g></symbol>
    <symbol id="ad-ill-desk" viewBox="0 0 1000 924"><path d="M70 914V330L500 80l430 250v584z" class="i-d"/><path d="M70 914V330L500 80l430 250v584z" class="i-ls" style="stroke-width:20"/><circle cx="300" cy="400" r="112" class="i-w"/><circle cx="300" cy="400" r="112" class="i-ls" style="stroke-width:18"/><path d="M300 340v60h50" class="i-ln" style="stroke-width:14"/><path d="M560 560c40-40 120-60 200-40 90 20 140 80 150 160l20 234H520z" class="i-s"/><path d="M690 540h60l-10 80 20 170-40 50-40-50 20-170z" class="i-a"/><path d="M690 540l30 40 30-40" class="i-w"/><circle cx="700" cy="380" r="120" class="i-w"/><path d="M590 380c-20-120 50-190 140-180 80 10 120 80 100 160-30-50-90-70-160-50-20 30-50 50-80 70z" class="i-k"/><circle cx="660" cy="400" r="10" class="i-k"/><circle cx="720" cy="390" r="10" class="i-k"/><ellipse cx="690" cy="450" rx="18" ry="14" class="i-k"/><path d="M110 640h320l90 274H200z" class="i-w"/><path d="M200 914h420v-30H200z" class="i-a"/><rect x="250" y="740" width="44" height="18" rx="9" class="i-s"/><g class="ad-ill__worry"><path d="M820 70c14-30 40-40 60-34-10 20-34 34-60 34zM860 110c24-16 50-16 62-6-16 12-40 14-62 6z" class="i-a"/></g></symbol>
    <symbol id="ad-i-face1" viewBox="0 0 60 60"><circle cx="30" cy="26" r="11" class="i-w"/><path d="M14 60c0-12 7-18 16-18s16 6 16 18z" class="i-s"/><path d="M19 26c0-10 5-15 11-15s11 5 11 15c-3-5-9-7-15-6-2 3-4 5-7 6z" class="i-k"/></symbol>
    <symbol id="ad-i-face2" viewBox="0 0 60 60"><circle cx="30" cy="26" r="11" class="i-s"/><path d="M14 60c0-12 7-18 16-18s16 6 16 18z" class="i-s"/></symbol>
    <symbol id="ad-i-face3" viewBox="0 0 60 60"><circle cx="30" cy="26" r="11" class="i-w"/><path d="M14 60c0-12 7-18 16-18s16 6 16 18z" class="i-s"/><path d="M20 22c2-7 6-10 10-10s8 3 10 10c-6-2-14-2-20 0z" class="i-k"/></symbol>
    <symbol id="ad-i-hand" viewBox="0 0 40 48"><path d="M10 46V20c0-3 2-5 4-5s4 2 4 5v-8c0-3 2-5 4-5s4 2 4 5v8l2-2c2-2 5-1 6 1s0 4-1 6l-4 6c4 2 6 6 4 10l-2 6z" class="i-w"/><path d="M10 46V20c0-3 2-5 4-5s4 2 4 5v-8c0-3 2-5 4-5s4 2 4 5v8l2-2c2-2 5-1 6 1s0 4-1 6l-4 6c4 2 6 6 4 10l-2 6M18 20v6M26 18v6" class="i-ln" style="stroke-width:2.4"/></symbol>
    <symbol id="ad-i-qr" viewBox="0 0 29 29"><g class="i-k"><path d="M0 0h7v7H0zM1 1v5h5V1zM2 2h3v3H2zM22 0h7v7h-7zm1 1v5h5V1zm1 1h3v3h-3zM0 22h7v7H0zm1 1v5h5v-5zm1 1h3v3H2z"/><path d="M9 0h2v2H9zm3 1h2v3h-2zm3-1h3v2h-3zm4 2h2v3h-2zM9 4h2v2H9zm4 2h3v2h-3zm4 0h2v4h-2zM8 9h3v2H8zm5-1h2v3h-2zm7 1h3v2h-3zm5 0h4v2h-4zM0 9h2v3H0zm3 1h3v2H3zm7 3h3v2h-3zm5 0h4v3h-4zm6 1h2v2h-2zm3-1h2v4h-2zM1 14h4v2H1zm7 3h2v3H8zm4 1h3v2h-3zm5 1h2v2h-2zm4-1h4v2h-4zm6 2h2v3h-2zM9 22h3v2H9zm5-1h2v4h-2zm4 2h4v2h-4zm6 2h2v4h-2zM9 26h4v3H9zm8 1h3v2h-3z"/></g></symbol>
  </svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);

  const arr = (cls = "") => `<span class="ad-arr ${cls}"><svg><use href="#ad-i-arr"/></svg></span>`;
  const menuLinks = [
    ["index.html", "Home"],
    ["page.html", "Menu 1 · Usage guide"],
    ["page.html?m=2", "Menu 2 · Usage guide"],
    ["news.html", "News"],
  ];
  const subLinks = [["contact.html", "Inquiry"], ["#", "Terms of service"], ["#", "Transaction Display"], ["#", "Privacy policy"]];
  const access = `<a href="index.html#access" class="ad-cnv__btn is-access"><svg><use href="#ad-i-pin"/></svg><span>Directions<span class="u-pc">·</span><br class="u-sp">Business hours</span></a>`;

  const chrome = `
  <header class="ad-header" data-slot="header">
    <div class="ad-header__in">
      <a href="index.html" class="ad-logo" aria-label="Your pharmacy name here"><svg><use href="#ad-i-logo"/></svg><span class="ad-logo__type">Your pharmacy name here</span></a>
      <nav class="ad-nav"><a href="page.html">${arr()}<span>Menu 1</span></a><a href="page.html?m=2">${arr()}<span>Menu 2</span></a></nav>
    </div>
  </header>
  <div class="ad-scrollpoint"></div>
  <button type="button" class="ad-burger" aria-label="Open Menu" aria-expanded="false"><i><b></b><b></b></i></button>
  <div class="ad-cnv" data-slot="cta-bar">
    <a href="#" class="ad-cnv__btn is-go"><svg><use href="#ad-i-chat"/></svg><span>Consultations<br class="u-sp">From here</span></a>
    ${access}
  </div>
  <div class="ad-menu" data-slot="menu-drawer">
    <div class="ad-menu__panel">
      <div class="ad-menu__in">
        <nav class="ad-menu__main">${menuLinks.map(([h, t]) => `<a href="${h}" class="t-l">${arr()}${t}</a>`).join("")}</nav>
        <nav class="ad-menu__sub">${subLinks.map(([h, t]) => `<a href="${h}" class="t-s">${arr()}${t}</a>`).join("")}</nav>
        ${access}
      </div>
    </div>
    <div class="ad-menu__lay">
      <div class="ad-menu__qr">
        <h2 class="t-m">Your guide line here</h2>
        <svg role="img" aria-label="QR code slot"><use href="#ad-i-qr"/></svg>
        <a href="#" class="ad-btn is-go">To the official account</a>
      </div>
    </div>
  </div>`;
  const footer = `
  <footer class="ad-footer" data-slot="footer">
    <div class="ad-screen">
      <nav>${subLinks.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
      <p class="t-small">&copy; Your company name here</p>
    </div>
  </footer>
  <div class="ad-frame" aria-hidden="true"></div>`;
  const loader = document.querySelector(".ad-loader");
  (loader || document.body.firstElementChild).insertAdjacentHTML("afterend", chrome);
  document.querySelector("main").insertAdjacentHTML("afterend", footer);

  // Header — transparent when the top 2rem strip is fully visible (first page), white background once past it
  new IntersectionObserver(([e]) => document.body.classList.toggle("is-scrolled", !e.isIntersecting), { threshold: [1] })
    .observe(document.querySelector(".ad-scrollpoint"));

  // Menu drawer — original TweenMax values: panel x 0 .75s power3.out / veil .3s, view on the veil .1s later (QR card pops up larger). Closing the panel takes .3s.
  const menu = document.querySelector(".ad-menu");
  const panel = menu.querySelector(".ad-menu__panel");
  const lay = menu.querySelector(".ad-menu__lay");
  const burger = document.querySelector(".ad-burger");
  let open = false;
  const openMenu = () => {
    open = true;
    menu.style.display = "block";
    document.body.classList.add("is-menu");
    burger.setAttribute("aria-expanded", "true");
    gsap.delayedCall(reduce ? 0 : 0.1, () => lay.classList.add("is-view"));
    gsap.to(panel, { x: 0, duration: reduce ? 0 : 0.75, ease: "power3.out", overwrite: true });
    gsap.to(lay, { opacity: 1, duration: reduce ? 0 : 0.3, overwrite: true });
  };
  const closeMenu = () => {
    open = false;
    lay.classList.remove("is-view");
    document.body.classList.remove("is-menu");
    burger.setAttribute("aria-expanded", "false");
    gsap.to(lay, { opacity: 0, duration: reduce ? 0 : 0.3, overwrite: true });
    gsap.to(panel, { x: "100%", duration: reduce ? 0 : 0.3, ease: "power3.out", overwrite: true, onComplete: () => { if (!open) menu.style.display = "none"; } });
  };
  burger.addEventListener("click", () => (open ? closeMenu() : openMenu()));
  lay.addEventListener("click", (e) => { if (e.target === lay) closeMenu(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) closeMenu(); });

  // FAQ — original jQuery slideToggle(400ms). The original ships jquery.easing 1.3, so swing is replaced by easeOutQuad (power1.out).
  // Like jQuery, expands height and vertical padding together from 0 — height is border-box so use the full expanded height including padding
  const slide = (a, open) => {
    const clear = "height,paddingTop,paddingBottom,overflow", dur = reduce ? 0 : 0.4;
    gsap.killTweensOf(a);
    if (open) {
      gsap.set(a, { display: "block", clearProps: clear });
      const cs = getComputedStyle(a), h = a.offsetHeight;
      gsap.fromTo(a, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }, { height: h, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom, duration: dur, ease: "power1.out", clearProps: clear });
    } else {
      gsap.fromTo(a, { height: a.offsetHeight, overflow: "hidden" }, { height: 0, paddingTop: 0, paddingBottom: 0, duration: dur, ease: "power1.out", onComplete: () => gsap.set(a, { display: "none", clearProps: clear }) });
    }
  };
  document.querySelectorAll(".ad-qa__q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".ad-qa__item");
      const opening = !item.classList.contains("is-open");
      item.classList.toggle("is-open", opening);
      slide(item.querySelector(".ad-qa__a"), opening);
    });
  });

  // Inner jump button — original: 150px above the target, 400ms easeInCubic
  document.querySelectorAll("a[data-jump]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      const from = scrollY, to = t.getBoundingClientRect().top + scrollY - 150, p = { v: 0 };
      gsap.to(p, { v: 1, duration: reduce ? 0 : 0.4, ease: "power2.in", onUpdate: () => scrollTo(0, from + (to - from) * p.v) });
    });
  });

  // Review slider — original Swiper settings as they are (the gap is vw of the screen width at open)
  const vw = (n) => (innerWidth * n) / 100;
  document.querySelectorAll(".ad-voice").forEach((el) => {
    new Swiper(el, {
      loop: true,
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: vw(3),
      initialSlide: 1,
      breakpoints: {
        768: { slidesPerView: 1, spaceBetween: vw(2) },
        980: { slidesPerView: 2, spaceBetween: vw(2) },
        1200: { centeredSlides: false, spaceBetween: vw(2), slidesPerView: 2.5, initialSlide: 0 },
        1500: { centeredSlides: false, spaceBetween: vw(2), slidesPerView: 3.5, initialSlide: 0 },
      },
      navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") },
    });
  });

  // Loading — the original raises the progress target by however many body images (imagesLoaded) have arrived, fills 10% of the remaining distance every 1/60 second, and lifts the curtain at 100.
  // The original images are lazy-load placeholders and count as loaded right away — the copy without images starts at target 100 (about 1.1s)
  const progress = (done) => {
    let current = 0;
    const target = 100;
    const tick = setInterval(() => {
      current += (target - current) * 0.1;
      if (current >= 100) { clearInterval(tick); done(); }
      if (current > 99.9) current = 100;
    }, 1000 / 60);
  };
  window.adSite = { progress, reduce, isPC };

  if (page !== "home") {
    progress(() => {
      gsap.to(loader, {
        opacity: 0,
        duration: reduce ? 0 : 0.2,
        ease: "power1.in",
        onComplete: () => { document.body.classList.remove("is-loading"); document.body.classList.add("is-ready"); },
      });
    });
  }
})();
