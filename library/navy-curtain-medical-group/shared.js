// Common to all pages: draws the header, menu drawer, footer and loader in one place, and hooks up Lenis, reveals and flowing bands.
// Original values: loader starts after 0.5s → hero +1.2s · sub-page header +1.1s / drawer open 0.5s · close 1s lock / band one screen width per 60 seconds / reveal rootMargin -40px.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const TF = (window.TF = { reduced, lenis: null });

  const logo = (tag = "a") => `
    <${tag} class="tf-logo" ${tag === "a" ? 'href="index.html"' : ""} aria-label="Home">
      <svg viewBox="0 0 46 46" aria-hidden="true">
        <g fill="var(--site-alert)"><circle cx="9" cy="16" r="1.6"/><circle cx="14" cy="9.5" r="1.6"/><circle cx="23" cy="6.5" r="1.6"/><circle cx="32" cy="9.5" r="1.6"/><circle cx="37" cy="16" r="1.6"/></g>
        <path d="M9 27 23 15l14 12v13H9z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M23 37c-5-3.4-7-6-7-8.4a3.6 3.6 0 0 1 7-1.2 3.6 3.6 0 0 1 7 1.2c0 2.4-2 5-7 8.4z" fill="var(--site-alert)"/>
      </svg>
      <span class="tf-logo__txt"><small>Medical corporation placeholder</small><b>Your company name here</b><i data-label="Your corporation English name here">Placeholder Family Medical Corp.</i></span>
    </${tag}>`;
  const tel = '<svg viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 1.5h2.5l1.2 3.6-1.8 1.2a9 9 0 0 0 4.8 4.8l1.2-1.8 3.6 1.2V13a2 2 0 0 1-2 2A12.5 12.5 0 0 1 2 3.5a2 2 0 0 1 2-2z"/><path d="M10.5 1.5a5 5 0 0 1 5 5M10.5 4.2a2.3 2.3 0 0 1 2.3 2.3"/></svg>';

  const cur = (p) => (p === page ? " is-current" : "");
  const facilities = ["Facility Guide", "Facility 1 Name", "Facility 2 Name", "Facility 3 name · two regions", "Facility 4 Name", "Facility 5 Name"];
  const services = ["Outpatient", "Various Checkups", "Home Healthcare", "Home nursing", "Medical-enhanced care home", "Small-scale multifunctional care"];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "tf-head";
    head.innerHTML = `
      <div class="tf-head__logo">${logo()}</div>
      <nav class="tf-gnav" aria-label="Main menu"><ul class="tf-gnav__list">
        <li><a class="tf-gnav__link${cur("about")}" href="about.html"><span lang="en">About</span><span class="jp">About us</span></a></li>
        <li><a class="tf-gnav__link" href="about.html#greeting"><span lang="en">Company</span><span class="jp">Corporate guide</span></a></li>
        <li><a class="tf-gnav__link${cur("service")}" href="service.html"><span lang="en">Services</span><span class="jp">Service</span></a></li>
        <li class="tf-drop"><span class="tf-gnav__link"><span lang="en">Facilities</span><span class="jp">Facility</span></span>
          <ul class="tf-drop__menu">${facilities.map((f) => `<li><a href="index.html#facilities">${f}</a></li>`).join("")}</ul></li>
        <li><a class="tf-gnav__link" href="index.html#members"><span lang="en">Members</span><span class="jp">Member</span></a></li>
        <li><a class="tf-gnav__link" href="index.html#cooperation"><span lang="en">Cooperation</span><span class="jp">Medical Referral</span></a></li>
      </ul></nav>
      <div class="tf-util">
        <a class="tf-contact" href="index.html#links">${tel}CONTACT</a>
        <button class="tf-menu-btn" aria-label="Menu" aria-expanded="false"><span class="tf-menu-btn__line"><span></span><span></span></span><span>MENU</span></button>
      </div>
      <nav class="tf-drawer" aria-hidden="true" data-slot="menu-drawer">
        <div class="tf-drawer__in">
          <div class="tf-drawer__top">
            <div class="col"><div class="tf-drawer__ttl"><p lang="en">About</p><p class="jp">About us</p></div>
              <ul class="tf-drawer__links is-col2">
                <li><a href="index.html"><span>Home</span></a></li><li><a href="about.html"><span>About us</span></a></li>
                <li><a href="about.html#greeting"><span>Corporate guide</span></a></li><li><a href="index.html#members"><span>Meet the Members</span></a></li>
                <li><a href="service.html"><span>Services offered</span></a></li><li><a href="index.html#facilities"><span>Facility Guide</span></a></li>
                <li><a href="index.html#cooperation"><span>Medical Referral</span></a></li><li><a href="index.html#links"><span>Inquiry</span></a></li>
                <li><a href="news.html"><span>Latest news</span></a></li><li><a href="index.html#blog"><span>Blog</span></a></li>
              </ul></div>
            <div class="col"><div class="tf-drawer__ttl"><p lang="en">Services</p><p class="jp">Service</p></div>
              <ul class="tf-drawer__links">${services.map((s, i) => `<li><a href="service.html#anc0${Math.min(i + 1, 4)}"><span>${s}</span></a></li>`).join("")}</ul></div>
            <div class="col"><div class="tf-drawer__ttl"><p lang="en">Facilities</p><p class="jp">Facility Guide</p></div>
              <ul class="tf-drawer__links">${facilities.slice(1).map((f) => `<li><a href="index.html#facilities"><span>${f}</span></a></li>`).join("")}</ul></div>
          </div>
          <div class="tf-drawer__bottom">
            <div class="wrap">${logo()}<a class="tf-drawer__tel" href="#"><span>Tel.</span>0000-00-0000</a><a class="tf-btn is-red" href="index.html#links">Facility tour · Request materials</a></div>
            <ul class="tf-drawer__sub"><li><a class="tf-ul" href="index.html#cooperation">Medical institution test requests</a></li><li><a class="tf-ul" href="#">Privacy policy</a></li></ul>
          </div>
        </div>
        <div class="tf-drawer__bg"></div>
      </nav>`;

    head.querySelectorAll(".tf-drop").forEach((d) => {
      const on = () => d.classList.add("is-open");
      const off = () => d.classList.remove("is-open");
      d.addEventListener("mouseenter", on); d.addEventListener("focusin", on);
      d.addEventListener("mouseleave", off); d.addEventListener("focusout", off);
    });

    const btn = head.querySelector(".tf-menu-btn");
    const drawer = head.querySelector(".tf-drawer");
    const html = document.documentElement;
    const close = (delay = 1000) => {
      btn.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
      setTimeout(() => { drawer.classList.remove("is-open"); html.classList.remove("is-open"); TF.lenis?.start(); btn.disabled = false; }, delay);
    };
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.disabled = true;
      if (!open) {
        btn.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        drawer.setAttribute("aria-hidden", "false");
        drawer.classList.add("is-open");
        html.classList.add("is-open");
        TF.lenis?.stop();
        setTimeout(() => (btn.disabled = false), 500);
      } else close();
    });
    drawer.querySelectorAll('a[href*="#"]').forEach((a) => a.addEventListener("click", () => {
      if (btn.getAttribute("aria-expanded") === "true") close();
    }));
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "tf-foot";
    foot.innerHTML = `
      <div class="tf-container">
        <div class="tf-foot__contents">
          <div class="tf-foot__util"><div class="tf-foot__logo">${logo()}</div><a class="tf-btn-out" href="#">View careers site</a></div>
          <div class="tf-sitemap">
            <div class="col"><p class="ttl">About us</p><ul class="tf-foot__links">
              ${[["About us", "about.html"], ["Corporate guide", "about.html#greeting"], ["Meet the Members", "index.html#members"], ["Services offered", "service.html"], ["Facility Guide", "index.html#facilities"], ["Medical Referral", "index.html#cooperation"], ["Inquiry", "index.html#links"], ["Latest news", "news.html"], ["Blog", "index.html#blog"], ["Medical institution test requests", "index.html#cooperation"]].map(([t, h]) => `<li><a class="tf-ul" href="${h}">${t}</a></li>`).join("")}
            </ul></div>
            <div class="col"><p class="ttl">Service</p><ul class="tf-foot__links">${services.map((s, i) => `<li><a class="tf-ul" href="service.html#anc0${Math.min(i + 1, 4)}">${s}</a></li>`).join("")}</ul></div>
            <div class="col"><p class="ttl">Facility Guide</p><ul class="tf-foot__links">${facilities.slice(1).map((f) => `<li><a class="tf-ul" href="index.html#facilities">${f}</a></li>`).join("")}</ul></div>
          </div>
        </div>
        <div class="tf-foot__bottom">
          <small class="tf-copy">© 0000 Your Company Name</small>
          <ul class="tf-foot__sub"><li><a class="tf-ul" href="index.html">HOME</a></li><li><a class="tf-ul" href="#">Privacy policy</a></li></ul>
        </div>
      </div>
      <a class="tf-pagetop" href="#top" aria-label="Back to top"><svg viewBox="0 0 9 40" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4.5 40V1M1 5l3.5-4L8 5"/></svg><span>Page top</span></a>`;
    foot.querySelector(".tf-pagetop").addEventListener("click", (e) => {
      e.preventDefault();
      TF.lenis ? TF.lenis.scrollTo(0) : scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  // Lenis: same 1.0.18 defaults as the original (lerp 0.1). The anchors the original passes in are not on this board, so anchors jump straight there via scroll-margin on :target
  if (!reduced && window.Lenis) {
    TF.lenis = new Lenis();
    TF.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => TF.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Reveal: once visible, add .is-show one time
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-show"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -40px", threshold: 0 });
  TF.observe = (root = document) => root.querySelectorAll(".js-fadein, .slide-up").forEach((el) => io.observe(el));
  TF.observe();

  // Flowing strip: clone until it is two screens wide, and set each piece’s length as width ÷ (screen width/60 seconds)
  const ticks = () => document.querySelectorAll(".tf-loop").forEach((t) => {
    const orig = [...t.querySelectorAll(".tf-loop__item:not([aria-hidden])")];
    const ws = orig.map((el) => el.clientWidth);
    if (!orig.length || Math.max(...ws) === 0) return;
    let total = [...t.children].reduce((a, el) => a + el.clientWidth, 0);
    let n = 0;
    while (total < innerWidth * 2 || n === 0) {
      for (let i = 0; i < orig.length && (total < innerWidth * 2 || n === 0); i++) {
        const c = orig[i].cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        t.appendChild(c); total += ws[i]; n++;
      }
    }
    const speed = innerWidth / 60;
    t.querySelectorAll(".tf-loop__item").forEach((el) => {
      const s = +(el.clientWidth / speed).toFixed(2);
      el.style.setProperty("--tick-duration", `${s}s`);
      el.style.setProperty("--tick-delay", `${(-s / 2).toFixed(2)}s`);
    });
    t.classList.add("is-on");
  });
  requestAnimationFrame(ticks);
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(ticks, 200); });

  // Slider is the same Splide 4.1.2 as the original — only the screen-reader labels of buttons · page dots are in Korean
  TF.i18n = {
    prev: "Previous", next: "Next", first: "Back to start", last: "Finally", slideX: "As number %s", pageX: "Toward %s",
    play: "Start Autoplay", pause: "Stop Autoplay", carousel: "Slide", select: "Choose the columns to show", slide: "Slot", slideLabel: "%s / %s",
  };

  // Loader: starts lifting at DOMContentLoaded + 0.5s, the first page Hero gets .is-show at +1.2s, and subpage headers get it at +1.1s
  // The curtain sits at the very front of the HTML like the original #loader so it covers from the first paint — if the page has none, it is created here
  let loader = document.querySelector(".tf-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.className = "tf-loader";
    loader.setAttribute("data-slot", "loader");
    loader.innerHTML = '<div class="tf-loader__bg"></div><div class="tf-loader__in"></div>';
    document.body.prepend(loader);
  }
  loader.querySelector(".tf-loader__in").innerHTML = `${logo("span")}<div class="tf-loader__bar"></div>`;
  const hero = document.querySelector(".tf-hero");
  const kv = document.querySelector(".tf-kv");
  if (reduced) {
    loader.classList.add("is-action");
    hero?.classList.add("is-show", "is-loaded");
    kv?.classList.add("is-show");
  } else {
    setTimeout(() => {
      loader.classList.add("is-action");
      if (hero) setTimeout(() => { hero.classList.add("is-show"); setTimeout(() => hero.classList.add("is-loaded"), 3000); }, 1200);
      if (kv) setTimeout(() => kv.classList.add("is-show"), 1100);
    }, 500);
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
