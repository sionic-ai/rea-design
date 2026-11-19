// First page — hooked after window load in the same order as the original: opening → tabs → scroll devices (frame fold · menu · reveal · Lottie · horizontal flow table) → .1s later cards · FAQ reveal · section numbers.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));
  const narrow = () => innerWidth <= 768;

  // The car grows from .5x over 1.2s (the door opens 1s later over .5s), then after 1.2s seller → .12s buyer → .18s title
  const opening = async () => {
    const sub = $("[data-mv-sub]"), main = $("[data-mv-main]"), car = $("[data-mv-car]"), buyer = $("[data-mv-purchaser]"), seller = $("[data-mv-seller]");
    if (!sub || !main || !car || !buyer || !seller) return;
    car.classList.remove("is-ready");
    await sleep(1.2);
    seller.classList.add("is-show");
    await sleep(0.12);
    buyer.classList.add("is-show");
    await sleep(0.18);
    sub.classList.remove("is-ready");
    main.classList.remove("is-ready");
  };

  // Seller · buyer tabs — if the address is #buyer, buyer first
  const tab = () => {
    const sec = $("[data-tab-section]");
    if (!sec) return;
    const items = $$("[data-tab-item]", sec), panes = $$("[data-tab-content]", sec);
    const open = (n) => {
      items.forEach((b, i) => { b.classList.toggle("is-active", i === n); b.tabIndex = i === n ? 0 : -1; b.setAttribute("aria-selected", String(i === n)); });
      panes.forEach((p, i) => p.classList.toggle("is-show", i === n));
    };
    items.forEach((b, i) => b.addEventListener("click", () => { open(i); history.replaceState(null, "", i === 1 ? "#buyer" : location.pathname); }));
    open(location.hash === "#buyer" ? 1 : 0);
  };

  const showOnScroll = (el) => ScrollTrigger.create({ trigger: el, start: "top 80%", end: "bottom top", onEnter: () => el.classList.add("is-show") });

  // Past 80% down the hero, the frame’s logo slot and GO NEXT collapse
  const checkTop = () => {
    const c = $("[data-contents]"), mv = $(".mc-mv");
    if (c && mv) ScrollTrigger.create({ trigger: mv, start: "bottom 80%", onEnter: () => c.classList.add("is-scrolled"), onLeaveBack: () => c.classList.remove("is-scrolled") });
  };

  // Phone — the menu button opens the frame, and pressing outside, a link, the logo or GO NEXT closes it
  const toggleNav = () => {
    const frame = $(".mc-frame"), btn = $("[data-navi-btn]");
    if (!frame || !btn) return;
    let on = false;
    const close = () => { on = false; frame.classList.remove("is-open"); };
    btn.addEventListener("click", () => { on = !on; frame.classList.toggle("is-open", on); });
    [$("[data-navi-overlay]"), $(".mc-next"), $(".mc-logo"), ...$$(".mc-navi__link")].forEach((el) => el?.addEventListener("click", close));
  };

  // The band and car run only while the section is on screen
  const activeOnScroll = () => $$("[data-scroll-active]").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", toggleClass: { targets: el, className: "is-active" } }));

  // Handwriting Lottie — plays once at 1.2x speed when it enters 80% of the screen. On phones it stays on the final frame
  const lottie = () => {
    const L = window.lottie || window.bodymovin;
    if (!L || !window.__LOTTIE_DATA__) return;
    $$("[data-lottie]").forEach((el) => {
      const a = L.loadAnimation({ container: el, renderer: "svg", animationData: window.__LOTTIE_DATA__[el.dataset.lottie], loop: false, autoplay: false });
      a.addEventListener("DOMLoaded", () => {
        if (narrow() || reduce) { a.goToAndStop(a.totalFrames - 1, true); return; }
        a.goToAndStop(0, true);
        a.setSpeed(1.2);
        ScrollTrigger.create({ trigger: el, start: "top 80%", onEnter: () => a.play() });
      });
    });
  };

  // Usage flow — on wide screens, plates are joined and pushed sideways by vertical scroll. On phones, horizontal scroll and a handle (range)
  const scrollHorizontal = () => {
    const wrap = $("[data-horizontal-wrapper]"), wheel = $("[data-scroll-progress]"), icon = $("[data-scroll-progress-icon]");
    if (!wrap || !wheel || !icon) return;
    const progress = (p) => { wheel.style.transform = `translateX(calc(100% * ${p}))`; icon.style.transform = `rotate(calc(2520deg * ${p}))`; };
    if (narrow()) {
      const range = $("[data-horizontal-range]");
      const ratio = () => wrap.scrollLeft / (wrap.scrollWidth - wrap.clientWidth || 1);
      wrap.addEventListener("scroll", () => { const p = ratio(); progress(p); if (range) range.value = (p * 100).toFixed(0); });
      range?.addEventListener("input", (e) => { wrap.scrollLeft = (Number(e.target.value) / 100) * (wrap.scrollWidth - wrap.clientWidth); });
      ScrollTrigger.create({ trigger: wrap, start: "top 80%", end: "bottom bottom", toggleClass: { targets: "[data-flow-progress]", className: "is-active" } });
      return;
    }
    const pin = $("[data-flow-pinwrap]"), body = $("[data-horizontal-content]");
    if (!pin || !body) return;
    const over = () => body.clientWidth - wrap.clientWidth;
    const fit = () => { pin.style.height = `calc(${over()}px)`; };
    fit();
    ScrollTrigger.create({ trigger: pin, start: "0% 100%", end: "100% 0%", onUpdate: (s) => gsap.set(body, { x: -over() * s.progress }) });
    setTimeout(() => {
      ScrollTrigger.create({ trigger: pin, start: "0% 0%", end: "100% 105%", toggleClass: { targets: "[data-flow-progress]", className: "is-active" }, onUpdate: (s) => progress(s.progress) });
    }, 100);
    addEventListener("resize", () => { fit(); ScrollTrigger.refresh(); });
  };

  // Top-right menu wheel — the section number whose head reaches 80% of the screen
  const syncNav = () => {
    const loc = $("[data-nav-locator]");
    if (!loc) return;
    const set = (n) => loc.setAttribute("data-current", String(n));
    $$("[data-nav-link]").map((a) => $(a.getAttribute("href"))).filter(Boolean).forEach((sec, n) => {
      ScrollTrigger.create({ trigger: sec, start: "top 80%", onEnter: () => set(n), onLeaveBack: () => set(Math.max(0, n - 1)) });
    });
    set(0);
  };

  const scroll = async () => {
    checkTop();
    toggleNav();
    activeOnScroll();
    const desc = $(".mc-about__desc");
    if (desc) showOnScroll(desc);
    lottie();
    scrollHorizontal();
    await sleep(0.1);
    $$(".mc-sitem__arch, .mc-fitem").forEach(showOnScroll);
    syncNav();
  };

  const created = () => {
    if (reduce) {
      $$(".is-ready").forEach((el) => el.classList.remove("is-ready"));
      $$(".mc-person, .mc-sitem__arch, .mc-fitem, .mc-about__desc").forEach((el) => el.classList.add("is-show"));
    } else opening();
    tab();
    scroll();
  };
  if (document.readyState === "complete") created(); else addEventListener("load", created);
})();
