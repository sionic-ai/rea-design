// Common to all pages — draws the header, showroom expand, hamburger drawer, photo-strip contact and footer once, and attaches the page fade transition, first-visit intro cover and scroll reveal.
// Original libraries as is: smooth scroll Lenis 1.0.42 (lerp .2 · ScrollTrigger.update) · photo strip Splide 4.1.4 + AutoScroll(.8, .7 at 1280 and below).
// Original values: open — body turns on with .6s Power4.easeOut after .1s · link — fades out with .6s Expo.easeInOut after .3s (drawer link 1s), then navigates.
//            About curtain (when arriving from elsewhere) — catch text rises from 10px above at .4s power2.out (first line .04 · second line .045 stagger, .2s overlap) → after .5s (phone .3) fades out over .4s → curtain .3s.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TH = (window.TH = { lenis: null });
  const page = document.querySelector(".th-page");
  const here = (location.pathname.split("/").pop() || "index.html").replace(/\?.*/, "");

  // Instead of the original logo: gable-roof house outline + two lines of English
  const logo = `<svg viewBox="0 0 95 50" role="img" aria-label="Logo slot — house outline and two-line English name"><path d="M1 49V13L17 1l16 12v2H31v-1L17 3.4 3 14v33h42v2Z"/><rect x="25" y="3" width="2" height="9"/><text style="font-family: var(--kf-font-display)"><tspan x="36" y="32" font-size="8.5" letter-spacing="1.6">STUDIO</tspan><tspan x="36" y="47" font-size="13" letter-spacing="2.4">HOME</tspan></text></svg>`;
  TH.logo = logo;
  const menu = [
    ["Menu First", "index.html#study"],
    ["Menu Two", "index.html#service"],
    ["Built house", "works.html"],
    ["Reads", "news.html"],
    ["Menu Fifth", "index.html#event"],
    ["Model home", "#", "drop"],
    ["Visit booking", "recruit.html"],
  ];
  // Menu text roll (original LinkHoverAnimation) — the text slides out upward and the same text rises in from below
  const roll = "data-roll";
  const gnav = menu
    .map(([t, h, d]) => `<li><a href="${h}" ${d ? 'class="is-drop" data-drop' : ""} ${roll}><span class="th-roll"><span class="th-roll__a">${t}</span><span class="th-roll__b" aria-hidden="true">${t}</span></span></a></li>`)
    .join("");

  page.insertAdjacentHTML(
    "beforebegin",
    `<div class="th-intro" aria-hidden="true"><p class="th-intro__catch"><span class="inner">Your first visit here</span><span class="inner">Add a two-line catchphrase.</span></p></div>
    <header class="th-head" data-slot="header">
      <div class="th-head__in">
        <a class="th-logo" href="index.html" aria-label="Home">${logo}</a>
        <nav class="th-gnav" aria-label="Main menu"><ul>${gnav}</ul></nav>
        <button class="th-burger" type="button" aria-expanded="false" aria-label="Open Menu"><span><i></i><i></i><i></i></span></button>
      </div>
    </header>
    <div class="th-drop" data-slot="dropdown"><div class="th-drop__box"><ul>
      <li><a href="index.html#mh">Your model house one here</a></li><li><a href="index.html#mh">Your model home two here</a></li>
      <li><a href="index.html#mh">Your model home three here</a></li><li><a href="index.html#mh">Your model home four here</a></li>
    </ul></div></div>
    <div class="th-drawer" data-slot="drawer" data-lenis-prevent><div class="th-drawer__bg"></div><button class="th-burger th-drawer__close" type="button" aria-expanded="true" aria-label="Close Menu"><span><i></i><i></i><i></i></span></button><nav class="th-drawer__panel" aria-label="Expand Menu">
      <ul class="th-drawer__nav">${menu.map(([t, h]) => `<li><a href="${h === "#" ? "index.html#mh" : h}" data-drawer-close><small>Menu</small>${t}</a></li>`).join("")}</ul>
      <ul class="th-drawer__sub"><li><a href="about.html" data-drawer-close>Company About</a></li><li><a href="recruit.html" data-drawer-close>Hiring Info</a></li><li><a href="#" data-drawer-close>Contact Us</a></li></ul>
    </nav></div>`
  );

  const photos = [
    "Sky and trees beyond a wooden louver fence · bright daytime · tall full-bleed vertical slot",
    "New ornament on a window shelf, white wall, soft indoor light, vertical frame",
    "Garden trees and plank fence · green leaves · looking up from below · portrait column",
    "Terrace under timber eaves · afternoon sunlight · portrait cell",
  ];
  page.insertAdjacentHTML(
    "beforeend",
    `<aside class="th-contact" data-slot="contact-strip">
      <div class="th-contact__strip"><div class="splide" aria-label="Contact band photo"><div class="splide__track"><ul class="splide__list">
        ${photos.map((p) => `<li class="splide__slide"><div class="wf-img th-ph" data-label="${p}"></div></li>`).join("")}
      </ul></div></div></div>
      <div class="th-container"><div class="th-contact__in">
        <h3 class="th-title" data-fx="ink-bleed-chars" data-fx-ink-bleed-chars="on: view; start: top 80%; delay: 0; each: .04; dur: .7; blur: 6; rise: 0; size: fixed; ease: power1.out">Contact Us</h3>
        <p data-reveal="top">Your copy here: for open house and model home visit reservations,<br>Add two lines saying inquiries are received through the contact form.</p>
        <a class="th-btn --white" href="#" data-reveal="top">Contact Form<i></i></a>
      </div></div>
    </aside>
    <footer class="th-foot" data-slot="footer"><div class="th-container" style="width:100%"><div class="th-foot__content">
      <div class="th-foot__heading">
        <a class="th-foot__logo" href="index.html" aria-label="Home">${logo}</a>
        <p class="th-foot__tag">Company one-line intro No.1</p>
        <div class="th-foot__addr"><p>Your headquarters here<br>〒000-0000<br>Your one-line address here<br>0000-00-0000</p><p>Your branch here<br>〒000-0000<br>Your one-line address here<br>0000-00-0000</p></div>
      </div>
      <div class="th-foot__nav">
        <ul><li><a href="index.html#mh">Model home</a><ul><li><a href="index.html#mh">Your model house one here</a></li><li><a href="index.html#mh">Your model home two here</a></li><li><a href="index.html#mh">Your model home three here</a></li></ul></li>
          <li><a href="index.html#event">Menu Fifth</a></li><li><a href="index.html#study">Menu First</a></li><li><a href="index.html#service">Menu Two</a></li><li><a href="works.html">Built house</a></li></ul>
        <ul><li><a href="news.html">Reads</a></li><li><a href="about.html">Company About</a></li><li><a href="recruit.html">Hiring Info</a></li></ul>
        <ul class="--keep"><li><a href="#">News</a></li><li><a href="recruit.html">Visit booking</a></li><li><a href="#">Contact Us</a></li><li class="--sm"><a href="#">Privacy policy</a></li></ul>
      </div>
    </div><p class="th-foot__policy">© Studio Home All Rights Reserved.</p></div></footer>`
  );

  const head = document.querySelector(".th-head");
  const burger = head.querySelector(".th-burger");
  const drawer = document.querySelector(".th-drawer");
  const drop = document.querySelector(".th-drop");
  const dropTrigger = head.querySelector("[data-drop]");
  head.querySelectorAll(".th-gnav a").forEach((a) => {
    const h = a.getAttribute("href");
    if (h && h.split("#")[0] === here) a.setAttribute("aria-current", "page");
  });

  // Menu text roll — original LinkHoverAnimation: the second copy sits 150% below, and on every mouseenter the first copy goes 0 → −105% and fades over .6s ("expo.inout" — Same text as the original,
  // exactly as GSAP 3.15 reads this lowercase name), the second set goes 105% → 0 in .4s with CustomEase linkhover(.115,.405,.24,1). Being fromTo it doesn’t reverse, the next hover starts from the beginning
  gsap.registerPlugin(CustomEase);
  const linkhover = CustomEase.create("th-linkhover", ".115,.405,.24,1");
  if (!reduced && matchMedia("(hover: hover)").matches) head.querySelectorAll("[data-roll]").forEach((a) => {
    const one = a.querySelector(".th-roll__a"), two = a.querySelector(".th-roll__b");
    if (!one || !two) return;
    gsap.set(two, { position: "absolute", top: 0, left: 0, transform: "translateY(150%)" });
    a.addEventListener("mouseenter", () => {
      gsap.fromTo(one, { y: "0%", opacity: 1 }, { y: "-105%", opacity: 0, duration: 0.6, ease: "expo.inout" });
      gsap.fromTo(two, { y: "105%" }, { y: "0%", duration: 0.4, ease: linkhover });
    });
  });

  // Smooth scroll — original rS: new Lenis({ lerp: .2, wheelMultiplier: 1 }) · ScrollTrigger.update on every scroll · own rAF loop
  gsap.registerPlugin(ScrollTrigger);
  if (!reduced && window.Lenis) {
    TH.lenis = new Lenis({ lerp: 0.2, wheelMultiplier: 1 });
    TH.lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { TH.lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // Header bar — while the hero (.th-hero) is more than 15% visible, it stays transparent with light text (original Hero IntersectionObserver threshold .15)
  const hero = document.querySelector("[data-hero]");
  if (hero) {
    head.classList.add("is-hero");
    new IntersectionObserver((es) => es.forEach((e) => head.classList.toggle("is-hero", e.isIntersecting)), { threshold: 0.15 }).observe(hero);
  }

  // Model house dropdown — on hover it opens at 275 width below the menu center, and closes when hovering another menu or scrolling
  const closeDrop = () => { drop.classList.remove("is-open"); dropTrigger?.classList.remove("is-open"); };
  if (dropTrigger) {
    dropTrigger.addEventListener("click", (e) => e.preventDefault());
    dropTrigger.addEventListener("mouseenter", () => {
      const r = dropTrigger.getBoundingClientRect();
      drop.style.left = `${r.left + r.width / 2 - 137.5 + scrollX}px`;
      drop.classList.add("is-open");
      dropTrigger.classList.add("is-open");
    });
    drop.addEventListener("mouseleave", closeDrop);
    head.querySelectorAll(".th-gnav a:not([data-drop])").forEach((a) => a.addEventListener("mouseenter", closeDrop));
    addEventListener("scroll", closeDrop, { passive: true });
  }

  // Hamburger drawer
  const setDrawer = (open) => {
    drawer.classList.toggle("is-open", open);
    clearTimeout(TH.burgerTimer);
    TH.burgerTimer = setTimeout(() => burger.setAttribute("aria-expanded", String(open)), reduced ? 0 : 190);
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (TH.lenis) open ? TH.lenis.stop() : TH.lenis.start();
  };
  burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open")));
  drawer.querySelector(".th-drawer__bg").addEventListener("click", () => setDrawer(false));
  drawer.querySelector(".th-drawer__close").addEventListener("click", () => setDrawer(false));

  // Scroll reveal — original ScrollTrigger module: becomes :visible when it enters IntersectionObserver rootMargin 0 0 -20% 0
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const d = +(e.target.dataset.delay || 0);
    setTimeout(() => e.target.classList.add("is-visible"), d * 1000);
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -20% 0px" });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  // Photo strip Contact — original { type: loop, arrows: false, pagination: false, drag: false, autoWidth: true, autoScroll: { speed: .8 }, breakpoints: { 1280: { autoScroll: { speed: .7 } } } }
  const strip = document.querySelector(".th-contact .splide");
  if (strip && window.Splide && !reduced) {
    new Splide(strip, { type: "loop", arrows: false, pagination: false, drag: false, autoWidth: true, autoScroll: { speed: 0.8, pauseOnHover: false }, breakpoints: { 1280: { autoScroll: { speed: 0.7 } } } })
      .mount(window.splide?.Extensions || {});
  }

  // First-visit intro overlay — original Transition: if the visitor came from elsewhere (or refreshed) and a catch exists, raise the overlay. Otherwise the body turns on .1s later over .6s.
  const intro = document.querySelector(".th-intro");
  const external = (() => {
    try { return !document.referrer || new URL(document.referrer).origin !== location.origin || document.referrer === location.href; } catch { return true; }
  })();
  const showPage = () => gsap.to(page, { opacity: 1, duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.1, ease: "power4.out" });
  // Like the original, start at window load (after photos are fully downloaded) — until then a curtain (or an empty body) stands
  const useIntro = document.body.dataset.intro !== undefined && external && !reduced;
  let playIntro = showPage;
  if (useIntro) {
    intro.classList.add("is-on");
    gsap.set(page, { opacity: 1 });
    const catchEl = intro.querySelector(".th-intro__catch");
    catchEl.querySelectorAll(".inner").forEach((n) => (n.innerHTML = [...n.textContent].map((c) => `<span class="char">${c === " " ? "&nbsp;" : c}</span>`).join("")));
    const l1 = catchEl.querySelectorAll(".inner:nth-child(1) .char"), l2 = catchEl.querySelectorAll(".inner:nth-child(2) .char");
    const wide = matchMedia("(min-width: 576px)").matches;
    gsap.set([...l1, ...l2], { opacity: 0, y: -10 });
    playIntro = () => gsap.timeline()
      .set(catchEl, { opacity: 1 })
      .to(l1, { opacity: 1, y: 0, stagger: 0.04, duration: 0.4, ease: "power2.out" })
      .to(l2, { opacity: 1, y: 0, stagger: 0.045, duration: 0.4, ease: "power2.out" }, "-=0.2")
      .to(catchEl, { opacity: 0, duration: 0.4, ease: "power2.out" }, `+=${wide ? 0.5 : 0.3}`)
      .to(intro, { opacity: 0, duration: 0.3, ease: "power4.inOut" }, "+=0.2")
      .set(intro, { display: "none" }, "+=0.1");
  }
  document.readyState === "complete" ? playIntro() : addEventListener("load", playIntro, { once: true });

  // Link — after .3s (drawer link 1s) the body fades out over .6s Expo.easeInOut and navigates. In-page (#) moves use smooth scroll
  const own = (href) => /^[\w-]+\.html([?#].*)?$/.test(href || "");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    const [file, hash] = href.split("#");
    if (href === "#" || (hash !== undefined && (file === "" || file === here))) {
      e.preventDefault();
      if (drawer.classList.contains("is-open")) setDrawer(false);
      const t = hash ? document.getElementById(hash) : null;
      if (t) TH.lenis ? TH.lenis.scrollTo(t, { offset: 0 }) : t.scrollIntoView();
      return;
    }
    if (!own(href)) return;
    e.preventDefault();
    if (reduced) return void (location.href = href);
    gsap.to(page, { opacity: 0, ease: "expo.inOut", duration: 0.6, delay: a.hasAttribute("data-drawer-close") ? 1 : 0.3, onComplete: () => (location.href = href) });
    if (a.hasAttribute("data-drawer-close")) setDrawer(false);
  });
  addEventListener("pageshow", (e) => e.persisted && gsap.set(page, { opacity: 1 }));
})();
