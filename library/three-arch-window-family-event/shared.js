// Shared by all pages — fills the header logo, menu circle, menu panel, fixed arch, black arch footer and floating search pill, carrying over the original Header · Lenis · Splide values.
// The original scrolls an inner panel in #app with Lenis, but the copy scrolls the window with the same Lenis 1.0.42 (lerp .1 · duration .6 · wheelMultiplier 1.2 · expo curve).
(() => {
  const body = document.body, home = body.classList.contains("is-home");
  const wide = () => innerWidth > 1024;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lenis = !reduce && window.Lenis ? new Lenis({ lerp: 0.1, duration: 0.6, smoothWheel: true, wheelMultiplier: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -12 * t)) }) : null;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.FF = { lenis };

  const words = ["Brand", "Name", "Here"];
  const hd = document.querySelector('[data-slot="header"]');
  if (hd) {
    hd.classList.add("ff-hd");
    hd.innerHTML = `<h1 class="ff-logo"><a href="index.html" aria-label="Brand English Wordmark" data-label="Brand English wordmark — three words in high-contrast serif">${words.map((w) => `<span class="ff-logo__w"><span>${w}</span></span>`).join("")}</a></h1>`;
    hd.insertAdjacentHTML("afterend", `<div class="ff-menu" data-slot="menu-button"><button class="ff-menu__open" type="button" aria-label="Open Menu"><span class="ff-menu__t"><span data-text="Menu">Menu</span></span></button><button class="ff-menu__close" type="button" aria-label="Close Menu"><span class="ff-menu__t"><span data-text="Close">Close</span></span></button></div>
    <nav class="ff-nav" data-slot="menu-panel" aria-label="Menu"><div class="ff-nav__in"><ul>${[
      ["Top", "First Page", "index.html"], ["Event Schedule", "Event schedule", "index.html#event"], ["Report", "Experience Reviews", "news.html"], ["News", "Notice", "news.html"],
      ["About us", "About the Brand", "about.html"], ["To Exhibitors", "For those who want to compete", "page.html"], ["FAQ", "Frequently asked questions", "about.html#faq"], ["Column", "Columns for moms", "news.html"], ["Contact", "Inquiry", "#contact"],
    ].map(([en, ja, href]) => `<li><a href="${href}"><span class="ff-nav__icon" aria-hidden="true"></span><span class="ff-nav__txt"><span class="ff-nav__en"><span data-text="${en}">${en}</span></span><span class="ff-nav__ja"><span data-text="${ja}">${ja}</span></span></span></a></li>`).join("")}</ul></div></nav>`);
  }

  // Section title — the original is slightly curved serif glyph art plus a line icon. Draws the data-en text along an arc (data-curve, 0 means straight)
  const ICON = {
    cal: '<rect x="6" y="9" width="22" height="19" rx="2"/><path d="M6 15h22M12 5v6M22 5v6"/><text x="17" y="26" text-anchor="middle" style="font:700 9px var(--kf-font-sans);fill:var(--kf-surface);stroke:none">31</text>',
    pen: '<path d="M8 27 25 10l3 3-17 17-5 1z"/>', home: '<path d="M8 30V16l9-9 9 9v14z"/><path d="M14 30v-7h6v7"/>',
    book: '<path d="M5 9h11v19H5zM18 9h11v19H18z"/>', ask: '<path d="M12 12a5 5 0 1 1 7 4c-2 1-2 2-2 5"/><circle cx="17" cy="27" r="1.5"/>',
  };
  document.querySelectorAll(".ff-title[data-en]").forEach((t, i) => {
    const en = t.dataset.en, c = +(t.dataset.curve ?? 16), id = `ff-arc-${i}`, w = parseFloat(t.style.getPropertyValue("--ff-tw")) || 214;
    t.setAttribute("aria-label", en);
    t.insertAdjacentHTML("afterbegin", `<span class="ff-title__en" aria-hidden="true"><svg viewBox="0 0 ${w} ${64 + c}"><path id="${id}" d="M0 ${54 + c} Q${w / 2} ${54 - c} ${w} ${54 + c}" fill="none"/><text text-anchor="middle"><textPath href="#${id}" startOffset="50%">${en}</textPath></text></svg></span>${t.dataset.icon ? `<span class="ff-title__icon" aria-hidden="true"><svg viewBox="0 0 34 34" style="fill:var(--kf-ink);stroke:var(--kf-ink);stroke-width:1.5">${ICON[t.dataset.icon] || ""}</svg></span>` : ""}`);
  });

  // Fixed arch — original StickySlide (one arch slot, five photos swap every 6s)
  const st = document.querySelector('[data-slot="sticky-arch"]');
  if (st) {
    const labels = home
      ? ["Mother and baby · smiling mother beside a stroller in a green garden · natural light · portrait 460:800", "Mother and two children · family walking hand in hand along a white-columned corridor · bright daytime · portrait", "Baby · baby sitting in a basket · soft indoor light · portrait"]
      : ["Mother and baby · facing each other on the floor in front of a dresser · warm interior · portrait 460:800", "Two kids · brothers playing on the cactus garden lawn · clear daytime · portrait", "Family · mother and child standing in front of a glass door · calm light · portrait", "Baby · baby asleep on a sofa · soft light · portrait", "Child · child lying in bed with legs raised · yellow clothes · portrait"];
    st.classList.add("ff-sticky");
    st.innerHTML = `<div class="ff-sticky__slide" data-fx="arch-cycle-slides"><div data-fx-part="frame"><div data-fx-part="list">${labels.map((l) => `<div data-fx-part="item"><div class="wf-img" data-label="${l}"></div></div>`).join("")}</div></div></div>`;
  }

  // Black arch footer
  const ft = document.querySelector('[data-slot="footer"]');
  if (ft) {
    ft.classList.add("ff-foot");
    ft.id = "contact";
    ft.innerHTML = `<div class="ff-foot__left"><div class="ff-foot__photo"><div class="wf-img" data-label="Mother and baby · mother in pink lifting the baby · bright interior · portrait arch"></div></div><p class="ff-foot__copy">©2026 COMPANY NAME</p></div>
    <div class="ff-foot__main"><div class="ff-foot__in">
      <p class="ff-foot__logo" data-label="Brand English Wordmark">${words.join(" ")}</p>
      <p class="ff-foot__sns"><a href="#" aria-label="Social 1"></a></p>
      <a class="ff-foot__line" href="#">Add us as a messenger friend for perks</a>
      <dl class="ff-foot__box"><dt>Operating company</dt><dd>Your company name here<br>Your event secretariat name here</dd></dl>
      <dl class="ff-foot__box"><dt>Contact point</dt><dd><a class="ff-btn is-small is-diag" href="#"><span class="ff-btn__t">Contact us this way</span><span class="ff-btn__a"><i></i><i></i></span></a>Reception hours: 00:00-00:00 Closed on weekends and holidays<small>There is no phone line. Inquiries are accepted through the form above.</small></dd></dl>
      <ul class="ff-foot__links"><li><a href="index.html">To the first page</a></li><li><a href="about.html">About the Brand</a></li><li><a href="index.html#event">Event schedule</a></li><li><a href="page.html">For those who want to compete</a></li><li><a href="news.html">Experience Reviews</a></li><li><a href="about.html#faq">Frequently asked questions</a></li><li><a href="news.html">Notice</a></li></ul>
      <p class="ff-foot__sub"><a href="#">Operating company</a><a href="#">Privacy policy</a></p>
    </div></div>`;
    ft.insertAdjacentHTML("afterend", `<a class="ff-float" href="index.html#event" data-slot="float-search"><span>Search for Events</span><span class="ff-btn__a"><i></i><i></i></span></a><a class="ff-chat" href="#contact" aria-label="Consultation"></a>`);
  }

  if (reduce) {
    gsap.set(".ff-menu, .ff-logo__w > span", { opacity: 1, scale: 1, transform: "none" });
    gsap.set(".ff-float", { opacity: 1, pointerEvents: "auto" });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Logo letters — from 100% below and skewY 15° over 1.6s expo.inOut, standing in sequence at .25s intervals (original Header logoPath)
  // When arriving from within the site (ff-in), the header bar stays in its already-standing state like the original
  const inner = document.documentElement.classList.contains("ff-in");
  const ws = gsap.utils.toArray(".ff-logo__w > span");
  if (inner) gsap.set(ws, { transform: "none", opacity: 1 });
  else {
    gsap.set(ws, { transform: "translate3d(0, 100%, 0) skewY(15deg)" });
    gsap.to(ws, { transform: "translate3d(0, 0%, 0) skewY(0deg)", opacity: 1, duration: 1.6, stagger: 0.25, ease: "expo.inOut" });
  }
  // Home big wordmark — over the first screen of scroll it shrinks from 50vw → 214px (150px at 1024px or less) to become the header logo (scrub)
  if (home) gsap.to(".ff-logo", { width: () => (innerWidth <= 1024 ? "150px" : "214px"), ease: "none", scrollTrigger: { trigger: body, start: "top top", end: () => `top+=${innerHeight} top`, scrub: true, invalidateOnRefresh: true } });
  // Menu circle — 1.2s expo.inOut after 2.4s on the first page, .5s on other pages. On the first page the phone scrubs over scroll 200→300px
  const menu = document.querySelector(".ff-menu");
  if (menu) {
    if (!wide() && home) gsap.fromTo(menu, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, ease: "none", scrollTrigger: { trigger: body, start: "top+=200 top", end: "top+=300 top", scrub: true } });
    else if (inner) gsap.set(menu, { opacity: 1, scale: 1 });
    else gsap.to(menu, { opacity: 1, scale: 1, ease: "expo.inOut", delay: home ? 2.4 : 0, duration: home ? 1.2 : 0.5 });
    // Menu panel — unfolds from a circle in .4s expo.out, and icons shake 20° → −15·15·−15·0 (.15s each) delayed by .05+.03n
    const nav = document.querySelector(".ff-nav");
    const closer = menu.querySelector(".ff-menu__close");
    let open = false;
    menu.addEventListener("click", () => {
      open = !open;
      body.classList.toggle("is-nav", open);
      gsap.killTweensOf([nav, closer]);
      gsap.to([nav, closer], { scale: open ? 1 : 0, duration: 0.4, ease: "expo.out" });
      document.querySelectorAll(".ff-nav__icon").forEach((ic, n) => {
        gsap.killTweensOf(ic);
        if (!open) return gsap.to(ic, { rotation: 0, duration: 0.2 });
        gsap.fromTo(ic, { rotation: 0 }, { rotation: 20, duration: 0.2, delay: 0.05 + 0.03 * n, ease: "power1.inOut", onComplete: () => {
          gsap.timeline().to(ic, { rotation: -15, duration: 0.15, ease: "power1.inOut" }).to(ic, { rotation: 15, duration: 0.15, ease: "power1.inOut" }).to(ic, { rotation: -15, duration: 0.15, ease: "power1.inOut" }).to(ic, { rotation: 0, duration: 0.15, ease: "power1.inOut" });
        } });
      });
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => open && menu.click()));
  }

  // Floating search pill — event list ([data-float="show"When ]) reaches the bottom of the screen, it turns on in .3s, and turns off when scrolled back up. Pages with no marker are always on
  const fl = document.querySelector(".ff-float"), shows = document.querySelectorAll('[data-float="show"]');
  if (fl) {
    const on = (v) => { fl.classList.toggle("is-on", v); gsap.to(fl, { opacity: +v, duration: 0.3 }); };
    if (!shows.length) gsap.set(fl, { opacity: 1 }), fl.classList.add("is-on");
    shows.forEach((s) => ScrollTrigger.create({ trigger: s, start: "top bottom", end: "bottom top", onEnter: () => on(true), onLeaveBack: () => on(false) }));
  }

  // Splide slider — original loop · perPage 1 · speed 800 (default curve cubic-bezier(.25,1,.5,1))
  if (window.Splide) document.querySelectorAll(".ff-splide").forEach((el) => new Splide(el, { type: "loop", perPage: 1, perMove: 1, arrows: true, pagination: el.dataset.pagination === "on", autoplay: false, speed: 800 }).mount());

  // Same-page anchor — original lenis.scrollTo(el, { duration: 1.2, lock: true })
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const [path, id] = a.getAttribute("href").split("#");
    if (!id || (path && !location.pathname.endsWith(path))) return;
    const to = document.getElementById(id);
    if (!to) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(to, { offset: 0, lock: true, duration: 1.2 }) : to.scrollIntoView();
  });
})();
