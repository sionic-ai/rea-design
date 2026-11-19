// Magazine article: phone menu (neon plate unfolds from the top), INDEX cover, recruit carousel (Swiper 8.1), table-of-contents link slide, Barba transitions between articles.
// The original magazine uses default scroll without Lenis (html data-scroll="native").
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  const menu = $("[data-js=mg-menu]");
  const drawer = $("[data-js=mg-drawer]");
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    drawer.classList.toggle("is-open", open);
  });

  const indexBtn = $("[data-js=mg-index-btn]");
  const indexInner = $(".mg-index-panel__inner");
  // Original #global_nav: the panel stands up immediately, and the inner part (._in) fades in from 34px above and transparent, settling with a .65s spring. On close it disappears immediately
  const toggleIndex = (open = !root.classList.contains("is-indexopen")) => {
    root.classList.toggle("is-indexopen", open);
    indexBtn.setAttribute("aria-expanded", String(open));
    if (open && indexInner && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Opacity is a spring faster than position (original log: .52 at 50ms, .95 at 250ms). Like the original, it waits one or two frames after the panel is up before moving
      const spring = getComputedStyle(root).getPropertyValue("--site-spring-nav").trim() || "ease-out";
      const fade = getComputedStyle(root).getPropertyValue("--site-spring-fade").trim() || "ease-out";
      indexInner.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 650, easing: fade, delay: 30, fill: "both" });
      indexInner.animate([{ transform: "translateY(-34px)" }, { transform: "translateY(0)" }], { duration: 650, easing: spring, delay: 30 });
    }
  };
  indexBtn.addEventListener("click", () => toggleIndex());
  $("[data-js=mg-index-close]")?.addEventListener("click", () => toggleIndex(false));
  $("[data-js=mg-index]").addEventListener("click", (e) => { if (e.target === e.currentTarget) toggleIndex(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("is-indexopen")) toggleIndex(false); });

  // Photo slot — original LazyLoader: fetched once within 150% below the screen and appears in 1s (a placeholder, so effectively loaded immediately)
  const lazyIo = "IntersectionObserver" in window ? new IntersectionObserver((list) => list.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-on");
    lazyIo.unobserve(e.target);
  }), { rootMargin: "0px 0px 150% 0px" }) : null;
  const lazy = (scope) => $$("[data-lazy]", scope).forEach((el) => (lazyIo ? lazyIo.observe(el) : el.classList.add("is-on")));
  lazy(document);

  // Recruit pill text roll — original data-hover-v-rotate: on hover, two text lines rise by their own height with an .85s spring (the front line disappears),
  // When it ends it returns to place without any marker (the copy has the same text so it looks seamless). Releasing doesn’t reverse it
  const reduceMq = matchMedia("(prefers-reduced-motion: reduce)");
  $$(".mg-roll").forEach((roll) => {
    const [front, back] = roll.children;
    let busy = false;
    roll.closest("a")?.addEventListener("pointerenter", () => {
      if (busy || reduceMq.matches || !front || !back) return;
      busy = true;
      const easing = getComputedStyle(root).getPropertyValue("--site-spring-roll").trim() || "ease-out";
      front.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-100%)", opacity: 0 }], { duration: 850, easing });
      back.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: 850, easing }).finished.then(() => (busy = false));
    });
  });

  // Contents link — original [data-anc]: .65s power4.inOut to header height (PC 80, phone 56) ×2.5 above the target position
  $$(".mg-index a").forEach((a) => a.addEventListener("click", (e) => {
    const to = $(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    const y = to.getBoundingClientRect().top + scrollY - (innerWidth <= 840 ? 56 : 80) * 2.5;
    if (window.ScrollToPlugin) gsap.to(window, { scrollTo: { y: Math.max(0, y) }, duration: 0.65, ease: "power4.inOut" });
    else scrollTo(0, y);
  }));

  // Recruit carousel — same Swiper 8.1 loop as the original RecruitSliderSettings (.45s · centered · drag · no autoplay). If there are fewer than six cells, clone to fill,
  // Dots are placed for the real number of cells and lit by realIndex. When the article changes via Barba, reattach them to the new article’s cells
  let swiper = null;
  const carousel = (scope) => {
    const sw = $("[data-js=carousel-swiper]", scope);
    if (!sw || !window.Swiper) return;
    const wrapper = $(".swiper-wrapper", sw);
    const real = $$(".mg-job", wrapper);
    if (!real.length) return;
    for (let i = 0; i < 6 - real.length; i++) wrapper.append(real[i % real.length].cloneNode(true));
    const dotsEl = $("[data-js=carousel-dots]", scope);
    dotsEl.innerHTML = real.map((_, i) => `<span role="button" tabindex="0" aria-label="${i + 1}th Cell" data-dot="${i}"></span>`).join("");
    const mark = (n) => $$("[data-dot]", dotsEl).forEach((d, i) => d.classList.toggle("is-active", i === n % real.length));
    const evenHeight = () => {
      const slides = $$(".swiper-slide", sw);
      slides.forEach((s) => (s.style.height = "auto"));
      const h = Math.max(...slides.map((s) => s.offsetHeight));
      slides.forEach((s) => (s.style.height = `${h}px`));
    };
    swiper = new Swiper(sw, {
      speed: 450, loop: true, slidesPerView: "auto", centeredSlides: true, grabCursor: true, watchSlidesProgress: true,
      loopedSlides: 10, loopAdditionalSlides: 10, autoplay: false,
      on: { init: (h) => { mark(h.realIndex); evenHeight(); }, slideChange: (h) => mark(h.realIndex), resize: evenHeight },
    });
    $("[data-js=carousel-prev]", scope).addEventListener("click", () => swiper.slidePrev());
    $("[data-js=carousel-next]", scope).addEventListener("click", () => swiper.slideNext());
    $$("[data-dot]", dotsEl).forEach((d) => d.addEventListener("click", () => swiper.slideToLoop(+d.dataset.dot)));
  };
  carousel(document);

  // Article-to-article transition — original BarbaSettings: sync transition, a move flag on body (body and footer vanish at .1s) → swap after 100ms (0 on back navigation) →
  // After 100ms scroll to the top, remove the marker and fade in over .25s. Prefetch is done together
  // Opening via file:// blocks fetch, so only attach it when served over http
  if (window.barba && /^https?:$/.test(location.protocol)) {
    const body = document.body;
    let wait = 100;
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.init({
      timeout: 6000,
      transitions: [{
        sync: true, timeout: 6000,
        before: (d) => { wait = /^(back|forward|popstate)$/.test(d.trigger) ? 0 : 100; body.classList.add("is-move"); },
        leave() { const done = this.async(); swiper?.destroy(true, true); swiper = null; setTimeout(done, wait); },
        enter() {},
        afterEnter: (d) => {
          setTimeout(() => scrollTo({ top: 0 }), 100);
          setTimeout(() => {
            body.classList.remove("is-move");
            carousel(d.next.container);
            lazy(d.next.container);
            ScrollTrigger.refresh();
          }, 100);
        },
      }],
    });
  }
})();
