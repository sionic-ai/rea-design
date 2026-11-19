// Device for a one-page site — on the first visit shows the entrance gate (drive-in-gate), and when the gate lifts (fx:gate-open) starts the Hero hand and glitch and the text line reveal.
// If they return within 3 days it starts immediately with no curtain (same as the original). Besides that, survey card black-bar text lines, result tags·exclamation marks, bar graphs, back-to-top button,
// Senior slider (slick 1.8.1) and interview modal (perfect-scrollbar 1.5.0).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEY = "ng_visited_time", KEEP = 3 * 24 * 60 * 60 * 1000;
  const gate = $(".sw-gate"), fv = $(".sw-fv");
  const mobile = () => innerWidth <= 666;
  let firstVisit = true;
  try { const t = parseInt(localStorage.getItem(KEY), 10); firstVisit = !t || Number.isNaN(t) || Date.now() - t >= KEEP; } catch (e) { firstVisit = true; }
  // For returning visitors, remove the curtain before parts attach
  if (gate && !firstVisit) gate.remove();

  const watch = (els, opts, on) => {
    if (!els.length) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { on(e.target); io.unobserve(e.target); } }), opts);
    els.forEach((el) => io.observe(el));
  };

  // Episode heading lines — on phones, immediately if already on screen, on wide screens, when 20% enters the screen minus its bottom 35%, 30px from the left over .65s
  const reveal = () => {
    const ps = $$("[data-sw-reveal] p");
    if (mobile()) {
      ps.forEach((p) => { const r = p.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) p.classList.add("is-inview"); });
      watch(ps.filter((p) => !p.classList.contains("is-inview")), { rootMargin: "0px", threshold: 0.05 }, (p) => p.classList.add("is-inview"));
    } else watch(ps, { rootMargin: "0px 0px -35% 0px", threshold: 0.2 }, (p) => p.classList.add("is-inview"));
  };
  const startFv = () => requestAnimationFrame(() => requestAnimationFrame(() => {
    fv?.classList.add("is-loaded");
    reveal();
  }));
  if (gate) {
    gate.addEventListener("fx:gate-open", startFv, { once: true });
    $("[data-fx-part='go']", gate)?.addEventListener("click", () => { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} });
  } else {
    const go = () => { startFv(); requestAnimationFrame(() => document.dispatchEvent(new CustomEvent("fx:gate-open"))); };
    if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
  }

  // Text lines of the black band on the survey card — when 20% enters the screen minus the bottom 5%, from the left .42s, each line .13s later
  watch($$("[data-sw-lead]"), { rootMargin: "0px 0px -5% 0px", threshold: 0.2 }, (el) => el.classList.add("is-inview"));
  // Result tag (30%, excluding bottom 25%) · result header · recruitment guide (5%, excluding bottom 10%) · exclamation mark (30%, excluding bottom 5%)
  watch($$(".sw-result__tags"), { rootMargin: "0px 0px -25% 0px", threshold: 0.3 }, (el) => el.classList.add("is-inview"));
  watch($$(".sw-result__head, .sw-req"), { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }, (el) => el.classList.add("is-inview"));
  watch($$("[data-sw-pop]"), { rootMargin: "0px 0px -5% 0px", threshold: 0.3 }, (el) => el.classList.add("is-inview"));
  // Bar chart — when half visible, fills to its full length in 1s after .3s
  watch($$(".sw-chart__bar[data-width]"), { rootMargin: "0px 0px -10% 0px", threshold: 0.5 }, (el) => { el.style.width = `${el.dataset.width}%`; });

  // Back to top — after passing the Hero
  const top = $(".sw-pagetop");
  const onScroll = () => top?.classList.toggle("is-show", scrollY > innerHeight * 0.8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  top?.querySelector("a")?.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); });

  // Senior slider — three at a time (two below 900, 1.2 slides centered below 667) · 400ms ease · stops at the end
  if (window.jQuery && jQuery.fn.slick) {
    jQuery("[data-sw-slider]").slick({
      slidesToShow: 3, slidesToScroll: 1, arrows: true, dots: false, speed: 400, cssEase: "ease", infinite: false,
      prevArrow: jQuery(".sw-seniors__prev"), nextArrow: jQuery(".sw-seniors__next"),
      responsive: [{ breakpoint: 900, settings: { slidesToShow: 2, slidesToScroll: 1 } }, { breakpoint: 667, settings: { slidesToShow: 1.2, slidesToScroll: 1, centerMode: true, centerPadding: "0" } }],
    });
  }

  // Interview modal — click a card to open that person, buttons below go prev·next (wraps at the ends), closes via backdrop·close button·Esc
  const overlay = $("#sw-modal");
  if (overlay) {
    const contents = $$(".sw-modal__content", overlay);
    let cur = 0, ps = null;
    if (window.PerfectScrollbar) ps = new PerfectScrollbar(overlay, { suppressScrollX: true, wheelSpeed: 1, swipeEasing: true });
    const show = (i) => {
      cur = (i + contents.length) % contents.length;
      contents.forEach((c, k) => c.classList.toggle("is-active", k === cur));
      overlay.scrollTop = 0;
      ps?.update();
    };
    const open = (i) => {
      show(i);
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
    };
    const close = () => {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
    };
    $$(".sw-senior").forEach((b) => b.addEventListener("click", () => open(+b.dataset.index || 0)));
    $(".sw-modal__close", overlay)?.addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    $$(".sw-modal__pg", overlay).forEach((b) => b.addEventListener("click", () => show(cur + (+b.dataset.dir || 1))));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay.classList.contains("is-open")) close(); });
  }
})();
