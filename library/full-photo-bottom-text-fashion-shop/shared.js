// Shared by the whole site — Lenis (original smoothWheel on, default lerp .1), header dropdown · SHOP mega menu photo swap, phone menu, product carousel (Swiper), video that plays only when visible
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ smoothWheel: true, autoRaf: true });
    window.lenis = lenis;
  }

  // Dropdown — original c-header: opens on press (others close), closes on outside click·Esc
  const header = document.querySelector(".en-header");
  const dds = [...document.querySelectorAll("[data-en-dd]")];
  const bg = header?.querySelector(".en-header__bg");
  const sync = () => {
    const open = dds.find((d) => d.classList.contains("is-open"));
    // Original --dropdown-min-height: spreads the background to the height of the opened panel
    if (open && bg) bg.style.setProperty("--dd-h", `${open.querySelector(".en-dd__panel")?.offsetHeight || 0}px`);
    header?.classList.toggle("has-open", !!open);
  };
  const close = () => { dds.forEach((d) => { d.classList.remove("is-open"); d.querySelector("button")?.setAttribute("aria-expanded", "false"); }); sync(); };
  dds.forEach((d) => {
    const b = d.querySelector("button");
    b?.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !d.classList.contains("is-open");
      close();
      d.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", String(open));
      sync();
    });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest("[data-en-dd]")) close(); });
  document.querySelector(".en-header__veil")?.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape") { close(); setMenu(false); } });

  // SHOP mega menu — hovering a category opens it and the photo on the right changes
  const cats = [...document.querySelectorAll("[data-en-cat]")];
  const imgs = [...document.querySelectorAll(".en-mega__img .ph")];
  cats.forEach((c) => c.addEventListener("mouseenter", () => {
    cats.forEach((x) => x.classList.toggle("is-active", x === c));
    imgs.forEach((p, i) => p.classList.toggle("is-on", i === +c.dataset.img));
  }));

  // Phone menu — original c-menu-overlay (scroll stops when opened)
  const panel = document.querySelector("[data-en-panel]");
  const opener = document.querySelector("[data-en-menu]");
  function setMenu(open) {
    if (!panel) return;
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    opener?.setAttribute("aria-expanded", String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  opener?.addEventListener("click", () => setMenu(true));
  panel?.querySelectorAll("[data-en-close]").forEach((b) => b.addEventListener("click", () => setMenu(false)));

  // Product carousel — original c-product-list (Swiper): 2 slots · 3 slots from 700px · specified count from 1000px, 2px gap between slots, horizontal wheel (.4·30·axis lock·released at the ends)
  // Rows with the desktop carousel turned off (data-desktop-grid) drop Swiper above 1000px and fall back to a grid (original onResize)
  document.querySelectorAll("[data-en-carousel]").forEach((el) => {
    if (!window.Swiper) return;
    const box = el.closest(".en-plist");
    let sw = null;
    const make = () => new Swiper(el, {
      loop: false, slidesPerView: 2, spaceBetween: 2, speed: reduce ? 0 : 300,
      mousewheel: { enabled: true, sensitivity: 0.4, thresholdDelta: 30, forceToAxis: true, releaseOnEdges: true },
      navigation: { nextEl: box?.querySelector("[data-next]"), prevEl: box?.querySelector("[data-prev]") },
      breakpoints: { 700: { slidesPerView: 3 }, 1000: { slidesPerView: +el.dataset.perView || 4 } },
    });
    const fit = () => {
      const want = !el.hasAttribute("data-desktop-grid") || innerWidth <= 1000;
      if (want && !sw) sw = make();
      else if (!want && sw) { sw.destroy(true, true); sw = null; }
    };
    fit();
    addEventListener("resize", fit);
  });

  // Photo slot — mimics the original turning on .3s after the image loads by turning it on in the next frame
  requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll(".en-fade").forEach((p) => p.classList.add("is-in"))));

  // Video — original c-inline-video: plays when in view, pauses when out
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause();
  }));
  document.querySelectorAll("[data-en-video] video").forEach((v) => io.observe(v));
})();
