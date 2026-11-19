// Shared site-wide — loader (once per 30 minutes at first), header (hides after scrolling past 300px, returns on scroll up), menu overlay, hiring badge, section reveal (is-animated when entering the band excluding the bottom 100px)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  // Header · menu · footer across pages — put a slot (data-slot) and the same Frame is inserted
  const LOGO = '<span class="ss-logo"><svg class="ss-logo__mark" viewBox="0 0 52 52" aria-hidden="true"><path class="m1" d="M14 46c-6-6-8-16-3-25S27 6 36 8c-7 4-10 10-8 16 6-2 13 1 15 7 2 7-3 14-11 16-7 2-13 1-18-1z"/><circle class="m2" cx="35" cy="17" r="2.6"/></svg><span class="ss-logo__word"><b>brandname</b><small>preschool</small></span></span>';
  const slot = (name, html) => document.querySelectorAll(`[data-slot="${name}"][data-fill]`).forEach((el) => { el.innerHTML = html; });
  slot("header", `
    <div class="ss-header__logo"><a class="u-alpha" href="index.html" data-label="School logo · red kangaroo mark + brand name in two lines">${LOGO}<span class="ss-header__logo-txt">Your institute name here</span></a></div>
    <nav class="ss-hmenu ss-pc"><ul>
      <li><a href="about.html">Learn About the Nursery</a><ul class="ss-hmenu__child"><li><a href="about.html">Sub Menu 1</a></li><li><a href="about.html#policy">Sub Menu 2</a></li><li><a href="about.html#view">Sub Menu 3</a></li><li><a href="index.html#bistro">Sub Menu 4</a></li></ul></li>
      <li><a href="index.html#information">View all kindergartens</a><ul class="ss-hmenu__child"><li><a href="index.html#information">Facility Name 1</a></li><li><a href="index.html#information">Facility Name 2</a></li><li><a href="index.html#information">Facility Name 3</a></li></ul></li>
      <li><a href="index.html#contact">Hospitalization Guide</a></li>
      <li><a href="news.html" class="ss-en">News</a></li>
    </ul></nav>
    <button class="ss-navbtn" type="button" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>`);
  slot("menu-overlay", `
    <div class="ss-nav__wrap"><div class="ss-nav__inner ss-inner">
      <ul class="ss-nav__list"><li><a class="ss-nav__link ss-serif" href="index.html">TOP</a></li><li><span class="ss-nav__link ss-serif">Menu one intro</span><ul class="ss-nav__child"><li><a href="about.html">Sub Menu 1</a></li><li><a href="about.html#policy">Sub Menu 2</a></li><li><a href="about.html#view">Sub Menu 3</a></li><li><a href="index.html#bistro">Sub Menu 4</a></li></ul></li></ul>
      <ul class="ss-nav__list"><li><a class="ss-nav__link ss-serif" href="index.html#information">Circle list</a><ul class="ss-nav__child"><li><a href="index.html#information">Facility Name 1</a></li><li><a href="index.html#information">Facility Name 2</a></li><li><a href="index.html#information">Facility Name 3</a></li></ul></li></ul>
      <ul class="ss-nav__list"><li><a class="ss-nav__link ss-serif" href="index.html#contact">Admission & Tour Application</a></li><li><a class="ss-nav__link ss-serif" href="news.html">News</a></li></ul>
      <div class="ss-nav__links"><dl class="ss-nav__sns"><dt class="ss-en">Follow me</dt><dd><a href="#">Social Name</a></dd></dl><a class="ss-nav__bnr u-alpha" href="recruit.html"><span class="wf-img" data-label="Recruiting site banner art · teacher and children · landscape 3:1"></span></a></div>
    </div></div>`);
  slot("footer", `
    <div class="ss-footer__inner ss-inner-large">
      <div class="ss-footer__content">
        <a class="u-alpha" href="index.html">${LOGO}</a>
        <div class="ss-fmap ss-pc">
          <ul><li><a class="ss-fmap__link" href="index.html">TOP</a></li><li><span class="ss-fmap__link">Menu one intro</span><ul><li><a href="about.html">Sub Menu 1</a></li><li><a href="about.html#policy">Sub Menu 2</a></li><li><a href="about.html#view">Sub Menu 3</a></li><li><a href="index.html#bistro">Sub Menu 4</a></li></ul></li></ul>
          <ul><li><a class="ss-fmap__link" href="index.html#information">Circle list</a><ul><li><a href="index.html#information">Facility Name 1</a></li><li><a href="index.html#information">Facility Name 2</a></li><li><a href="index.html#information">Facility Name 3</a></li></ul></li></ul>
          <ul><li><a class="ss-fmap__link" href="index.html#contact">Admission & Tour Application</a></li><li><a class="ss-fmap__link" href="news.html">News</a></li><li><a class="ss-fmap__link" href="recruit.html">Recruiting site</a></li></ul>
        </div>
      </div>
      <dl class="ss-fschool"><dt>Facility Name 1</dt><dd>Your address first line here<br>Your building name here</dd><dt>Facility Name 2</dt><dd>Your address first line here<br>Your building name here</dd><dt>Facility Name 3</dt><dd>Your address first line here<br>Your building name here</dd></dl>
    </div>
    <div class="ss-footer__inner02 ss-inner-large"><ul class="ss-fsns"><li><a class="u-alpha" href="#" aria-label="Social"></a></li></ul><p class="ss-fcr"><small>© Your original name here</small></p></div>
    <p class="ss-pagetop"><a class="u-alpha ss-en" href="#top">Page top</a></p>`);
  document.querySelectorAll(".ss-loading__logo[data-fill]").forEach((el) => { el.innerHTML = LOGO; });

  // Loader — original order: .5s logo shown → 2s mark grows → 4s curtain lifts (the wavy bottom edge flattens over 1s) → ends 2s later. If back within 30 minutes, it skips the curtain and goes straight to the end stage
  const loading = document.querySelector(".ss-loading");
  const done = () => {
    loading?.classList.add("is-complete");
    body.classList.remove("is-loading");
    body.classList.add("is-loaded");
    document.dispatchEvent(new CustomEvent("ss:loaded"));
  };
  const wave = loading?.querySelector("path");
  const flatten = () => {
    if (!wave) return;
    const shapes = ["M960,180c0,0-279.3-90-480-90S0,180,0,180V0h960V180z", "M960,120c0,0-188.7-30-480-30S0,120,0,120V0h960V120z", "M960,90c0,0-178,0-480,0S0,90,0,90V0h960V90z"];
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 1000);
      wave.setAttribute("d", p < 0.2 ? shapes[0] : p < 0.5 ? shapes[1] : shapes[2]);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!loading || reduce || document.cookie.includes("ss-load=loaded")) done();
  else {
    setTimeout(() => loading.classList.add("is-shown"), 500);
    setTimeout(() => loading.classList.add("is-moved"), 2000);
    setTimeout(() => {
      loading.classList.add("is-loaded");
      setTimeout(flatten, 1000);
      setTimeout(done, 2000);
      document.cookie = "ss-load=loaded; max-age=1800; path=/";
    }, 4000);
  }

  // Header — wide screens only. Always visible within 300px, below that it hides on scroll down and shows on scroll up
  const header = document.querySelector(".ss-header");
  let last = 0;
  addEventListener("scroll", () => {
    if (!header || matchMedia("(max-width: 767px)").matches) return;
    const y = scrollY;
    const show = y < 300 || y < last;
    header.classList.toggle("is-hide", !show);
    last = y;
  }, { passive: true });

  // Menu overlay — opening pins the body in place, closing returns to the same spot
  const navBtn = document.querySelector(".ss-navbtn");
  const nav = document.querySelector(".ss-nav");
  let keep = 0;
  navBtn?.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    navBtn.classList.toggle("is-open", open);
    navBtn.setAttribute("aria-expanded", String(open));
    if (open) { keep = scrollY; body.style.top = `-${keep}px`; body.classList.add("is-open"); }
    else { body.classList.remove("is-open"); body.style.top = ""; scrollTo(0, keep); }
  });

  // Recruit badge — disappears when the top edge of the recruit band touches the bottom of the screen
  const rbtn = document.querySelector(".ss-recruit-btn");
  const rtarget = document.querySelector(".ss-rbnr");
  if (rbtn && rtarget) addEventListener("scroll", () => rbtn.classList.toggle("is-hide", rtarget.getBoundingClientRect().top <= innerHeight), { passive: true });

  // Section entrance — once on, it never hides again. data-anime-delay is the delay (seconds)
  document.querySelectorAll("[data-anime-delay]").forEach((el) => { el.style.transitionDelay = `${el.dataset.animeDelay}s`; });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-animated");
    io.unobserve(e.target);
  }), { rootMargin: "0% 0% -100px 0%", threshold: 0 });
  const watch = () => document.querySelectorAll(".js-anime").forEach((el) => io.observe(el));
  if (body.classList.contains("is-loading")) document.addEventListener("ss:loaded", watch, { once: true });
  else watch();

  // Tab, news categories (grouped by the same data-tab-name)
  document.querySelectorAll("[data-tab-list]").forEach((list) => {
    const name = list.dataset.tabList;
    const tabs = [...list.querySelectorAll("[data-tab]")];
    const panels = [...document.querySelectorAll(`[data-tab-panels="${name}"] [data-panel]`)];
    tabs.forEach((t, k) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.toggle("is-active", x === t));
      panels.forEach((p, j) => p.classList.toggle("is-active", j === k));
    }));
  });

  // Back to top
  document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }));
})();
