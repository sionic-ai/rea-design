(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => innerWidth > 767;
  const sheet = $(".r-sheet");
  let scroller = null, page = null, swipers = [], io = null;

  // ---------- Loader — original page.loaded: when loading finishes (min .6s) is-loaded, drawing after .4s, loading cleared after .8s, drawing cleared after 2.4s ----------
  body.classList.add("is-loadstart");
  const t0 = performance.now();
  let loaded = false;
  const finishLoad = () => {
    if (loaded) return;
    loaded = true;
    if (reduce) { body.classList.remove("is-loading", "is-loadstart"); return; }
    body.classList.remove("is-loadstart");
    body.classList.add("is-loaded");
    setTimeout(() => body.classList.add("is-drawing"), 400);
    setTimeout(() => { measure(); body.classList.remove("is-loading", "is-loaded"); }, 800);
    setTimeout(() => body.classList.remove("is-drawing"), 2400);
  };
  const onLoad = () => setTimeout(finishLoad, Math.max(0, 600 - (performance.now() - t0)));
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad, { once: true });
  setTimeout(finishLoad, 4000);

  // ---------- Smooth scroll — on wide screens the body is fixed and follows window scroll with .4s circ.out ----------
  const spacer = $(".r-scrollheight");
  const measure = () => {
    scroller = $(".r-container:last-of-type .r-scroll") || $(".r-scroll");
    if (wide() && !reduce) {
      spacer.style.height = `${scroller.offsetHeight}px`;
      gsap.set(scroller, { y: -scrollY });
    } else { spacer.style.height = "0px"; gsap.set(scroller, { clearProps: "transform" }); }
    if (page) page.measure();
    onScroll();
  };
  new ResizeObserver(() => measure()).observe(document.querySelector("#r-wrapper"));
  addEventListener("resize", () => setTimeout(measure, 400));

  const onScroll = () => {
    const top = scrollY, H = innerHeight, bottom = top + H;
    if (scroller && wide() && !reduce) gsap.to(scroller, { y: -top, duration: 0.4, ease: "circ.out", overwrite: true });
    if (page?.scroll) page.scroll(top, bottom, H);
    body.classList.toggle("reach-bottom", document.documentElement.scrollHeight <= bottom + 2);
  };
  addEventListener("scroll", onScroll, { passive: true });

  // ---------- Set up per page (first load + after each barba transition) ----------
  const splitText = (root) => $$(".r-split-fade, .r-split", root).forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    el.setAttribute("aria-label", el.textContent);
    el.innerHTML = el.textContent.split(" ").map((w) => `<span class="r-word" aria-hidden="true" style="display:inline-block;white-space:nowrap">${[...w].map((c) => `<span class="r-ch">${c}</span>`).join("")}</span>`).join(" ");
    $$(".r-ch", el).forEach((c, i) => (c.style.transitionDelay = `${0.03 * i}s`));
  });

  const setup = (root) => {
    swipers.forEach((s) => s.destroy(true, true));
    swipers = [];
    io?.disconnect();
    splitText(root);
    $$(".r-stagger", root).forEach((w) => [...w.children].forEach((c, i) => (c.style.transitionDelay = `${0.1 * i}s`)));
    io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-on")), { threshold: [0, 0.5, 1] });
    $$(".r-view, .r-split-fade, .r-split, .r-clip, .r-rise, .r-rise-each, .r-post, .r-dl, .r-bnr, .r-foot", root).forEach((el) => (reduce ? el.classList.add("is-on") : io.observe(el)));

    // First page News row — exactly the original swiper 4 settings (wide side 3.3 slides, gap 80, 680 and below 2 slides, 40, 767 and below 2.3 slides, 60)
    const js = $(".r-jswiper", root);
    if (js) swipers.push(new Swiper(js, { slidesPerView: 3.3, grabCursor: true, spaceBetween: 80, slidesOffsetAfter: 80, preventClicksPropagation: true,
      navigation: { nextEl: $(".r-arc--next", root), prevEl: $(".r-arc--prev", root) }, breakpoints: { 680: { slidesPerView: 2, spaceBetween: 40 }, 767: { slidesPerView: 2.3, spaceBetween: 60 } } }));
    // Subpage name row — center aligned·.5s, navigates to the dropped name’s page .5s later
    const pt = $(".r-pagettl", root);
    if (pt) {
      const names = $$(".swiper-slide", pt).map((s) => s.textContent.trim());
      const start = Math.max(0, names.indexOf(pt.dataset.active));
      const s = new Swiper(pt, { speed: 500, slidesPerView: "auto", slideToClickedSlide: true, centeredSlides: true, initialSlide: start, spaceBetween: 30, loop: true, grabCursor: true, loopFillGroupWithBlank: true });
      $$("a", pt).forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
      s.on("slideChangeTransitionStart", () => {
        const link = s.slides[s.activeIndex]?.dataset.link;
        if (!link || link.split("#")[0] === location.pathname.split("/").pop()) return;
        setTimeout(() => { direction = "swipe"; go(link); }, 500);
      });
      swipers.push(s);
    }

    // Journal category panel
    const cat = $(".r-catsel__btn", root);
    if (cat) {
      cat.addEventListener("click", () => setTimeout(() => { body.classList.add("is-open-cat"); cat.setAttribute("aria-expanded", "true"); }, 200));
      const close = () => { body.classList.remove("is-open-cat"); cat.setAttribute("aria-expanded", "false"); };
      $(".r-catmenu__close", root)?.addEventListener("click", close);
      $$(".r-catmenu a", root).forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); $(".r-catsel__now", root).textContent = a.dataset.cat; $$(".r-catmenu a", root).forEach((o) => o.classList.toggle("is-now", o === a)); close(); }));
    }

    page = makePage(root);
    measure();
    const ns = root.dataset.namespace;
    $$(".r-nav a[data-now]").forEach((a) => a.classList.toggle("is-now", a.dataset.now === ns));
  };

  // First page scroll choreography — photos descend at .8x of scroll, and section titles stick to the section then follow late at .4x
  function makePage(root) {
    const heroImg = $(".r-hero__img", root);
    if (!heroImg) return { measure() {}, scroll: (top) => darkNav(root, top) };
    const meow = $(".r-meow", root), meowHead = $(".r-meow__head", root);
    const prod = $(".r-prod", root), prodHead = $(".r-prod__head", root), jour = $(".r-journal", root);
    const img = $(".r-latest__thumb .wf-img", root), ring = $(".r-latest__ring", root);
    let mt = 0, pt = 0, jt = 0;
    return {
      measure() {
        mt = meow.offsetTop; pt = prod.offsetTop; jt = jour.offsetTop;
        if (img && ring && wide()) { ring.style.left = `${img.offsetWidth}px`; ring.style.top = `${img.offsetTop}px`; }
      },
      scroll(top, bottom, H) {
        darkNav(root, top);
        if (!wide() || reduce) return;
        const tw = (el, v) => gsap.to(el, { ...v, duration: 0.4, ease: "circ.out", overwrite: "auto" });
        if (top <= 1.5 * H) tw(heroImg, { y: 0.8 * top });
        if (bottom >= mt && top <= mt) tw(meowHead, { top: 0, y: top - mt });
        else if (top > mt && bottom <= pt) tw(meowHead, { top: 0.4 * (top - mt) });
        if (bottom >= pt && bottom <= jt) tw(prodHead, { top: 0, y: top - pt });
        else if (bottom > jt && top <= jt) tw(prodHead, { top: 0.4 * (bottom - jt) });
      },
    };
  }
  // Over dark sections, the header text turns white
  function darkNav(root, top) {
    const d = $(".r-dark", root);
    const on = d && top >= d.offsetTop && top < d.offsetTop + d.offsetHeight;
    $(".r-nav").classList.toggle("is-light", !!on);
  }

  // ---------- Phone menu ----------
  const toggle = $(".r-toggle");
  const menu = { open() { body.classList.add("is-open-menu"); toggle.setAttribute("aria-expanded", "true"); }, close() { body.classList.remove("is-open-menu"); toggle.setAttribute("aria-expanded", "false"); } };
  toggle.addEventListener("click", () => (body.classList.contains("is-open-menu") ? menu.close() : menu.open()));
  $(".r-overlay").addEventListener("click", () => { menu.close(); body.classList.remove("is-open-cat"); });

  // ---------- Page transition — barba v1 + diagonal gray sheet (skew-sheet-page part) ----------
  let direction = "next";
  const go = (url) => (window.Barba && location.protocol !== "file:" ? Barba.Pjax.goTo(url) : (location.href = url));
  const cover = () => new Promise((done) => {
    if (direction === "swipe") { gsap.to($(".r-container .r-sub") || {}, { x: -20, autoAlpha: 0, duration: 0.4, ease: "circ.inOut", onComplete: done }); return; }
    sheet.dispatchEvent(new CustomEvent("fx:cover", { detail: { back: direction === "back", done } }));
  });
  const reveal = (newC) => {
    if (direction === "swipe") {
      const sub = $(".r-sub", newC);
      if (sub) gsap.fromTo(sub, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: "circ.inOut", onComplete: () => body.classList.remove("is-transition", "is-ajaxloaded") });
      else body.classList.remove("is-transition", "is-ajaxloaded");
    } else {
      sheet.dispatchEvent(new CustomEvent("fx:reveal", { detail: { back: direction === "back", done: () => body.classList.remove("is-transition", "is-ajaxloaded") } }));
    }
    direction = "next";
  };
  if (window.Barba) {
    Barba.Pjax.Dom.wrapperId = "r-wrapper";
    Barba.Pjax.Dom.containerClass = "r-container";
    Barba.Pjax.originalPreventCheck = Barba.Pjax.preventCheck;
    Barba.Pjax.preventCheck = (evt, el) => {
      if (!el || !el.getAttribute("href") || location.protocol === "file:") return false;
      const url = new URL(el.href, location.href);
      if (url.hash && url.pathname === location.pathname) return false;
      return Barba.Pjax.originalPreventCheck(evt, el);
    };
    const Expand = Barba.BaseTransition.extend({
      start() { Promise.all([this.newContainerLoading, this.out()]).then(this.in.bind(this)); },
      out() {
        body.classList.add("is-transition", "is-ajaxload");
        menu.close(); body.classList.remove("is-open-cat");
        return cover();
      },
      in() {
        const oldC = this.oldContainer, newC = this.newContainer;
        body.classList.remove("is-ajaxload"); body.classList.add("is-ajaxloaded");
        oldC.style.display = "none";
        scrollTo(0, 0);
        newC.style.visibility = "visible";
        gsap.set(newC, { opacity: 0 });
        gsap.to(newC, { opacity: 1, duration: 0.1, ease: "circ.out", onComplete: () => { this.done(); setup(newC); reveal(newC); } });
      },
    });
    Barba.Pjax.getTransition = () => Expand;
    addEventListener("popstate", () => (direction = "back"));
    Barba.Prefetch.init();
    Barba.Pjax.start();
  }

  setup($(".r-container"));
})();
