// Draws the header, business panel, phone menu, curtain and footer shared by all pages, and hooks up Lenis smooth scroll and sticky INDEX on subpages.
// Original values: Lenis duration 1.2 · exponential curve · header appears after 800ms over .5s ease-out · on phone the header hides on scroll down and returns on scroll up · panel/bar .3s · phone menu .3s fade · expand .3s
(() => {
  const page = document.body.dataset.page || "";
  document.documentElement.classList.toggle("is-home", page === "home");

  const logo = (cls = "") => `<a class="tk-logo ${cls}" href="index.html" data-label="Company logo · Round emblem + English wordmark + one-line English slogan">
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="4" aria-hidden="true"><circle cx="20" cy="20" r="16"/><path d="M5 23c9-6 21-8 31-5" stroke-linecap="round"/></svg>
    <span class="tk-logo__words"><span class="tk-logo__name">COMPANY</span><span class="tk-logo__tag">Short Tagline. Here.</span></span></a>`;
  const nav = [
    ["TOP", "index.html", "home"],
    ["Company info", "about.html", "about"],
    ["Business introduction", "#", "service", true],
    ["Company Story", "about.html#mission", ""],
    ["Products Carried", "product.html", "product"],
    ["Training Room", "index.html#training", ""],
    ["News", "news.html", "news"],
  ];
  const biz = ["Business one name", "Business Two Name", "Business Three Name", "Business Four Name"];
  const bizPhoto = ["Trailer engine bay parts · bright workshop · landscape 3:2", "Mechanic’s hand holding a large part · dark warehouse · landscape 3:2", "Car battery surround · top view · landscape 3:2", "Pile of metal parts on a workbench · Blue lighting · Landscape 3:2"];
  const offices = [
    ["Headquarters", "Branch office building front · clear daytime · landscape 5:4"],
    ["One Branch Name", "Branch warehouse entrance · daytime · landscape 5:4"],
    ["Branch name two", "White office building and parking lot · overcast daytime · landscape 5:4"],
    ["Branch name three", "Side of headquarters building and shutter · daytime · landscape 5:4"],
    ["Branch name four", "Low warehouse building · clear daytime · landscape 5:4"],
    ["Overseas outpost", "European residential street buildings · tree shade · landscape 5:4"],
  ];
  const map = `<a class="tk-map" href="#"><span data-fx="line-redraw-hover" data-fx-line-redraw-hover="look: always-half">Google map</span></a>`;

  const header = document.querySelector('header[data-slot="header"]');
  if (header) {
    header.className = "tk-header";
    header.innerHTML = `<div class="tk-header__inner">${logo()}
      <nav class="tk-header__pc">
        <ul class="tk-menu">${nav.map(([t, h, p, ex]) => `<li><a href="${h}" data-fx="line-redraw-hover"${ex ? ' class="is-ex" data-ex' : ""}${p && p === page ? ' aria-current="page"' : ""}>${t}</a></li>`).join("")}</ul>
        <a class="tk-contact" href="about.html#office" data-contact><span>Contact Us</span></a>
        <div class="tk-ex" data-ex-panel data-slot="business-panel">
          <div class="tk-ex__block">
            <div class="tk-ex__head">
              <p class="tk-hl"><span class="tk-hl__jp">Business introduction</span><span class="tk-hl__en" data-fx="band-paint-text" data-fx-band-paint-text="look: sheen; dur: 2; start: 80" data-label="Section English name">BUSINESS</span></p>
              <a class="tk-btn tk-hover" href="service.html"><span class="tk-btn__t">View business introduction</span><span class="tk-chip"></span></a>
            </div>
            <div class="tk-ex__content" data-fx="hover-photo-swap" data-fx-hover-photo-swap="offset: 0; stay: on">
              <ul class="tk-ex__list">${biz.map((b) => `<li data-fx-part="item"><a class="tk-hover" href="service.html#our">${b}</a></li>`).join("")}</ul>
              <figure class="tk-ex__image">${bizPhoto.map((l) => `<div class="wf-img" data-fx-part="photo" data-label="${l}"></div>`).join("")}</figure>
            </div>
          </div>
        </div>
      </nav>
      <button class="tk-burger" type="button" aria-label="Menu" aria-expanded="false" data-burger><span class="tk-burger__t">MENU</span><span class="tk-burger__box"><i></i><i></i><i></i></span></button>
    </div>`;
    header.insertAdjacentHTML("afterend", `<div class="tk-sp" data-sp data-slot="mobile-menu"><div class="tk-sp__inner">
      <a class="tk-contact" href="about.html#office">Contact us this way</a>
      <div class="tk-sp__head"><button class="tk-sp__tab is-active" type="button" data-tab="contents">CONTENTS</button><button class="tk-sp__tab" type="button" data-tab="office">OFFICE</button></div>
      <div class="tk-sp__pane is-active" data-pane="contents">
        <ul class="tk-sp__nav">
          <li><a href="index.html">TOP</a></li><li><a href="about.html">Company info</a></li>
          <li><span class="tk-sp__exp" data-exp>Business introduction</span><div class="tk-sp__sub" data-exp-body><a href="service.html">Business About Hero</a>${biz.map((b) => `<a href="service.html#our">${b}</a>`).join("")}</div></li>
          <li><a href="about.html#mission">Company Story</a></li><li><a href="product.html">Products Carried</a></li><li><a href="index.html#training">Training Room</a></li><li><a href="news.html">News</a></li>
        </ul>
        <a class="tk-banner" href="#"><span class="wf-img" data-label="Staff member in work clothes, upper body · Clear sky background · Landscape 16:9"></span><span class="tk-banner__c"><span class="tk-banner__sub">Recruiting site</span><span class="tk-banner__ttl">View job info</span></span><span class="tk-chip is-white"></span></a>
      </div>
      <div class="tk-sp__pane" data-pane="office"><div class="tk-office-sp">${offices.map(([n]) => `<div><p class="tk-office-sp__name">${n}</p><p class="tk-txt">Postal code 000-0000 · Your address on one line</p><p class="tk-txt">TEL 000-00-0000 · FAX 000-00-0000</p>${map}</div>`).join("")}</div></div>
    </div></div>
    <div class="tk-overlay" data-overlay></div>`);
  }

  const footer = document.querySelector('footer[data-slot="footer"]');
  if (footer) {
    footer.className = "tk-foot";
    footer.innerHTML = `<div class="tk-foot__inner"><div class="tk-foot__wrap">
      <div class="tk-foot__c1">
        <div class="tk-foot__head"><p class="tk-foot__ttl" data-label="English section name">OFFICE</p><p>Business hours 0:00~00:00</p></div>
        ${offices.map(([n, l]) => `<div class="tk-foot__office"><div class="tk-foot__omedia wf-img" data-label="${l}"></div><div class="tk-foot__ocont">
          <p class="tk-foot__oname">${n}</p><ul class="tk-foot__olist"><li>TEL :<strong>000-00-0000</strong></li><li>FAX :<strong>000-00-0000</strong></li></ul>
          <div class="tk-foot__obot"><p class="tk-foot__odesc">〒000-0000 Your branch address in one line</p>${map}</div></div></div>`).join("")}
      </div>
      <div class="tk-foot__c2">
        <div class="tk-foot__item">
          <div class="tk-foot__head is-nav"><p class="tk-foot__ttl" data-label="English section name">CONTENTS</p></div>
          <div class="tk-foot__navwrap">
            <ul class="tk-foot__nav">
              <li><a href="index.html">TOP</a></li><li><a href="about.html">Company info</a></li>
              <li class="tk-foot__has sp"><span class="tk-foot__exp" data-fexp>Business introduction<i class="tk-foot__arw"></i></span><div class="tk-foot__child"><ul>${biz.map((b) => `<li><a href="service.html#our">${b}</a></li>`).join("")}</ul></div></li>
              <li><a href="about.html#mission">Company Story</a></li><li><a href="product.html">Products Carried</a></li><li><a href="index.html#training">Training Room</a></li><li><a href="news.html">News</a></li>
            </ul>
            <ul class="tk-foot__nav pc"><li class="tk-foot__has"><span class="tk-foot__exp">Business introduction</span><div class="tk-foot__child"><ul>${biz.map((b) => `<li><a href="service.html#our">${b}</a></li>`).join("")}</ul></div></li></ul>
          </div>
        </div>
        <div class="tk-foot__item">
          <div class="tk-foot__head is-s"><p class="tk-foot__ttl" data-label="English section name">RECRUIT</p></div>
          <a class="tk-foot__recruit tk-hover" href="#"><span class="wf-img" data-label="Employee in work clothes, upper body · clear sky background · landscape 5:2"></span><span class="tk-foot__rc"><span>Recruiting site</span><span>View job info</span></span><span class="tk-chip is-white"></span></a>
        </div>
        <div class="tk-foot__item tk-foot__partner">
          <ul><li><span class="wf-logo">PARTNER</span></li><li><span class="wf-logo">PARTNER</span></li></ul>
          <p>Your two or so lines here announcing that we are an authorized dealer of two partner companies.</p>
        </div>
        <div class="tk-foot__copy"><span>© 2026 COMPANY</span>${logo()}</div>
      </div>
    </div></div>`;
  }

  // ── Smooth scroll — original Lenis settings as is, turned off with reduced motion ──
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.tkLenis = lenis;
  const scrollToEl = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1 });
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]:not([href="#"]), a[data-anchor]');
    if (!a) return;
    const id = a.getAttribute("href").split("#")[1];
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    closeAll();
    scrollToEl(target);
  });

  // ── Header — drops in after 800ms, and on phone hides after scrolling down past 80px and returns when scrolling up ──
  const head = document.querySelector(".tk-header");
  setTimeout(() => head?.classList.add("is-in"), reduce ? 0 : 800);
  if (head && innerWidth <= 767) {
    let last = 0, hidden = false;
    head.style.setProperty("--tk-hide", `-${head.offsetHeight + 20}px`);
    addEventListener("scroll", () => {
      const y = scrollY;
      if (y > last && y > 80) { if (!hidden) { head.classList.add("is-hidden"); hidden = true; } }
      else if (hidden) { head.classList.remove("is-hidden"); hidden = false; }
      last = y;
    }, { passive: true });
  }

  // ── Open/close — one curtain closes the business panel · phone menu · left drawer (the first page adds to closers) together ──
  const overlay = document.querySelector("[data-overlay]");
  const closers = [];
  window.tkClosers = closers;
  const ex = document.querySelector("[data-ex]"), exPanel = document.querySelector("[data-ex-panel]");
  const menu = document.querySelector(".tk-menu"), contact = document.querySelector("[data-contact]");
  const setEx = (on) => {
    [ex, exPanel, menu, contact, head].forEach((n) => n?.classList.toggle("is-active", on));
    overlay?.classList.toggle("is-active", on);
  };
  ex?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); setEx(!ex.classList.contains("is-active")); });
  closers.push(() => setEx(false));

  const sp = document.querySelector("[data-sp]"), burger = document.querySelector("[data-burger]");
  const spFade = (on) => {
    if (!sp) return;
    gsap.killTweensOf(sp);
    if (on) gsap.fromTo(sp, { display: "block", autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.3, ease: "sine.inOut" });
    else gsap.to(sp, { autoAlpha: 0, duration: reduce ? 0 : 0.3, ease: "sine.inOut", onComplete: () => gsap.set(sp, { display: "none" }) });
  };
  const setSp = (on) => {
    burger?.classList.toggle("is-active", on);
    burger?.setAttribute("aria-expanded", on);
    sp?.classList.toggle("is-active", on);
    document.documentElement.classList.toggle("is-locked", on);
    overlay?.classList.toggle("is-active", on);
    head?.classList.toggle("is-active", on);
    if (on) lenis?.stop(); else lenis?.start();
    spFade(on);
    if (!on) document.querySelectorAll("[data-exp].is-active").forEach((t) => slide(t, false, 0.1));
  };
  burger?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); setSp(!burger.classList.contains("is-active")); });
  closers.push(() => { if (burger?.classList.contains("is-active")) setSp(false); });

  function closeAll() {
    overlay?.classList.remove("is-active");
    closers.forEach((fn) => fn());
  }
  window.tkCloseAll = closeAll;
  if (matchMedia("(hover: hover)").matches) overlay?.addEventListener("mouseenter", (e) => { if (e.target === e.currentTarget) closeAll(); });
  else overlay?.addEventListener("click", closeAll);

  // Expand: original jQuery slideToggle (swing ≈ sine.inOut)
  function slide(title, open, dur) {
    const body = title.nextElementSibling;
    title.classList.toggle("is-active", open);
    title.parentElement.classList.toggle("is-open", open);
    gsap.killTweensOf(body);
    if (open) gsap.fromTo(body, { display: "block", height: 0, overflow: "hidden" }, { height: "auto", duration: reduce ? 0 : dur, ease: "sine.inOut", clearProps: "height,overflow" });
    else gsap.to(body, { height: 0, overflow: "hidden", duration: reduce ? 0 : dur, ease: "sine.inOut", onComplete: () => gsap.set(body, { display: "none", clearProps: "height,overflow" }) });
  }
  document.querySelectorAll("[data-exp]").forEach((t) => t.addEventListener("click", () => slide(t, !t.classList.contains("is-active"), 0.3)));
  document.querySelectorAll("[data-fexp]").forEach((t) => t.addEventListener("click", () => { if (innerWidth <= 767) slide(t.closest(".tk-foot__has").querySelector(".tk-foot__exp"), !t.classList.contains("is-active"), 0.4); }));
  document.querySelectorAll("[data-tab]").forEach((tab) => tab.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((t) => t.classList.toggle("is-active", t === tab));
    document.querySelectorAll("[data-pane]").forEach((p) => p.classList.toggle("is-active", p.dataset.pane === tab.dataset.tab));
    document.querySelectorAll("[data-exp].is-active").forEach((t) => slide(t, false, 0.1));
  }));

  // ── Subpage INDEX panel — pinned until the end of the body on wide screens (original pin, no spacer) ──
  const side = document.querySelector(".tk-side__fixed"), main = document.querySelector(".tk-main");
  if (side && main) {
    gsap.matchMedia().add("(min-width: 768px)", () => {
      ScrollTrigger.create({ trigger: side, start: "top top", endTrigger: main, end: () => `bottom top+=${side.offsetHeight}px`, pin: side, pinSpacing: false, invalidateOnRefresh: true });
    });
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
