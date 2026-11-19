// Common to all pages: fills in the header, phone fixed header (hamburger) and footer, and attaches smooth scrolling plus reveal and parallax.
// Original values (global.js): blur entrance x · y −16px · blur 10px → 0 (top 90% → center 75%, scrub 2) · Hero blur entrance 1s, delay 1 + i×.2 ·
// Enter from below or above y ±32 power2.out 1s (top 70%) · photo enter y 32 (top 85%) · photo slot parallax 30 → -30 scrub 1 ·
// Window photo y 0 → -80 scrub .5 · phone head .4s · hamburger menu items x -24 → 0, delay .2 + i×.1.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const KN = (window.KN = { reduced, page });

  const ic = {
    rice: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 15C6 11 8 7 9 1" fill="none" stroke="currentColor" stroke-width="1"/><g fill="currentColor"><ellipse cx="9.6" cy="3" rx="1.3" ry="2.2" transform="rotate(25 9.6 3)"/><ellipse cx="7.2" cy="5.4" rx="1.2" ry="2" transform="rotate(-35 7.2 5.4)"/><ellipse cx="10" cy="6.6" rx="1.2" ry="2" transform="rotate(40 10 6.6)"/><ellipse cx="6.2" cy="9" rx="1.1" ry="1.9" transform="rotate(-40 6.2 9)"/><ellipse cx="8.6" cy="10" rx="1.1" ry="1.8" transform="rotate(45 8.6 10)"/></g></svg>',
    arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M1 8h13M10 4l4 4-4 4"/></svg>',
    out: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 10 10 2M4 2h6v6"/></svg>',
    cart: '<svg viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1 1h3l2 10h10l2-7H5"/><circle cx="7.5" cy="14" r="1.2"/><circle cx="14.5" cy="14" r="1.2"/></svg>',
    insta: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" aria-hidden="true"><rect x="1" y="1" width="12" height="12" rx="3.5"/><circle cx="7" cy="7" r="2.8"/><circle cx="10.4" cy="3.6" r=".5" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M8 14V8h2l.4-2.4H8V4.2c0-.7.3-1.2 1.3-1.2h1.2V.9C10 .8 9.4.7 8.8.7 7 .7 5.7 1.8 5.7 3.8v1.8H3.8V8h1.9v6z"/></svg>',
  };
  KN.ic = ic;
  document.querySelectorAll("[data-ic]").forEach((el) => el.insertAdjacentHTML("afterbegin", ic[el.dataset.ic] || ""));

  const NAV = [["index.html", "Top", "Home", "home"], ["about.html", "About Us", "About the Farm", "about"], ["product.html", "Products", "Product", "product"], ["news.html", "Blog", "News", "news"]];
  const navList = () => NAV.map(([h, en, ja, p]) => `<li><a class="hover-roll" href="${h}"${p === page ? ' aria-current="page"' : ""}><span class="en">${en}</span><span class="ja">${ja}</span></a></li>`).join("");
  const logo = '<a class="kn-logo" href="index.html" aria-label="Home — logo slot"><b>Your orchard name here</b><small class="en">Farm Name</small></a>';
  const shops = `<a class="btn-ec" href="#">${ic.cart}<span>Online Shop</span></a>
    <div class="kn-shops"><a class="btn-external" href="#">External shop 1${ic.out}</a><a class="btn-external" href="#">External shop 2${ic.out}</a></div>
    <div class="kn-socials"><a class="btn-social" href="#" aria-label="Social Media">${ic.insta}</a><a class="btn-social" href="#" aria-label="Brand">${ic.fb}</a></div>
    <address class="kn-foot__address">〒000-0000 One line of your address here<br>TEL. 000-000-0000</address>
    <a class="btn-external en" href="#">Google Map${ic.out}</a>`;

  const head = document.querySelector('[data-slot="header"]');
  let fixedHead = null;
  if (head) {
    head.classList.add("kn-head");
    head.innerHTML = `<nav class="kn-menu" aria-label="Main menu"><ul class="kn-menu__list">${navList()}</ul></nav>${logo}`;
    // Like the original, clones one header into a fixed header used only on phones
    fixedHead = head.cloneNode(true);
    fixedHead.classList.add("kn-head--fixed");
    fixedHead.removeAttribute("data-slot");
    fixedHead.insertAdjacentHTML("afterbegin", '<button class="kn-hbg" type="button" aria-label="Open Menu" aria-expanded="false"></button>');
    fixedHead.querySelector(".kn-menu").insertAdjacentHTML("beforeend", `<div class="kn-menu__sp">${shops}</div>`);
    head.after(fixedHead);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("kn-foot");
    foot.innerHTML = `
      <div class="kn-foot__inner fade-bottom">
        <div class="kn-foot__menu">
          <a class="kn-foot__logo" href="index.html" aria-label="Home — logo slot"><span><b>Your orchard name here</b><small class="en">Farm Name</small></span></a>
          <div class="kn-foot__nav">
            <ul class="kn-foot__list">${NAV.map(([h, en]) => `<li><a class="hover-roll" href="${h}">${en}</a></li>`).join("")}<li><a class="btn-ec" href="#">${ic.cart}<span>Online Shop</span></a></li></ul>
            <div class="kn-foot__social"><a class="btn-social" href="#" aria-label="Social Media">${ic.insta}</a><a class="btn-social" href="#" aria-label="Brand">${ic.fb}</a></div>
          </div>
        </div>
        <div class="kn-foot__bottom">
          <div><address class="kn-foot__address">〒000-0000 One line of your address here<br>TEL. 000-000-0000</address><a class="btn-external hover-roll" href="#">Google Map${ic.out}</a></div>
          <small class="kn-foot__copy">©0000 Farm Name.</small>
        </div>
      </div>`;
  }

  // Smooth scroll — same defaults as the original Lenis 1.0.19 (this build’s umd has a lowercase global name lenis)
  const LenisC = window.Lenis || window.lenis;
  if (!reduced && LenisC) {
    const lenis = new LenisC();
    KN.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const $$ = (s) => [...document.querySelectorAll(s)];
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    $$(".fade-first-blur").forEach((el, i) => gsap.fromTo(el, { x: -16, y: -16, opacity: 0, filter: "blur(10px)" }, { x: 0, y: 0, opacity: 1, filter: "blur(0px)", duration: 1, delay: 1 + i * 0.2 }));
    KN.fadeBlur = (els) => els.forEach((el) => gsap.fromTo(el, { x: -16, y: -16, opacity: 0, filter: "blur(10px)" }, { x: 0, y: 0, opacity: 1, filter: "blur(0px)", scrollTrigger: { trigger: el, start: "top 90%", end: "center 75%", scrub: 2 } }));
    KN.fadeBlur($$(".fade-blur"));
    $$(".fade-opacity").forEach((el) => gsap.from(el, { opacity: 0, scrollTrigger: { trigger: el, start: "top 70%", end: "center center", scrub: 1, invalidateOnRefresh: true } }));
    KN.fadeMove = (els, start, y) => els.forEach((el) => gsap.fromTo(el, { y, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: "power2.out", duration: 1, scrollTrigger: { trigger: el, start } }));
    KN.fadeMove($$(".fade-bottom"), "top 70%", 32);
    KN.fadeMove($$(".fade-top"), "top 70%", -32);
    KN.fadeMove($$(".fade-image"), "top 85%", 32);
    $$(".parallax-image").forEach((box) => gsap.fromTo(box.firstElementChild, { y: 30 }, { y: -30, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: 1 } }));
    $$(".js-wide-parallax").forEach((box) => gsap.fromTo(box.querySelector(".kn-window__img"), { y: 0 }, { y: -80, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: 0.5 } }));
  });

  // Phone: once the bottom edge of the first header (menu list) passes above the screen, the fixed header appears, and the hamburger opens the full menu
  if (fixedHead) {
    const btn = fixedHead.querySelector(".kn-hbg");
    const menu = fixedHead.querySelector(".kn-menu");
    let open = false;
    mm.add("(max-width: 480px)", () => {
      gsap.set(menu, { autoAlpha: 0 });
      gsap.fromTo(fixedHead, { display: "none", autoAlpha: 0 }, { display: "block", autoAlpha: 1, duration: 0.4, scrollTrigger: { start: () => head.querySelector(".kn-menu").getBoundingClientRect().bottom + scrollY, end: "max", toggleActions: "play none none reverse" } });
      return () => { gsap.set([fixedHead, menu], { clearProps: "all" }); };
    });
    btn.addEventListener("click", () => {
      open = !open;
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      document.body.style.overflow = open ? "hidden" : "";
      if (KN.lenis) open ? KN.lenis.stop() : KN.lenis.start();
      if (open) {
        menu.style.display = "block";
        gsap.to(menu, { autoAlpha: 1, duration: 0.4 });
        [...menu.querySelectorAll(".kn-menu__list > *, .kn-menu__sp > *")].forEach((el, i) => gsap.fromTo(el, { x: -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, delay: 0.2 + i * 0.1, duration: 0.4 }));
      } else {
        gsap.to(menu, { autoAlpha: 0, duration: 0.4, onComplete: () => (menu.style.display = "") });
      }
    });
  }

  addEventListener("load", () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
