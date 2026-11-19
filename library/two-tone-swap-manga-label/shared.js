// Device used by all pages — touch response indicator (.hover), menu·search panels, first-page header pinning, news marquee, work drawer, news slider, photo zoom
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The original adds .hover when a pointer enters a·button·.js-hov, and .hover-parent to the .js-hover-parent above it (touch: while pressed).
  // Don’t sort devices up front — sort by the pointer type that arrives, so neither mouse nor touch is dropped on devices that support both
  const hoverOn = (el) => {
    const on = () => { el.classList.add("hover"); el.closest(".js-hover-parent")?.classList.add("hover-parent"); };
    const off = () => { el.classList.remove("hover"); el.closest(".js-hover-parent")?.classList.remove("hover-parent"); };
    el.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") on(); });
    el.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") off(); });
    el.addEventListener("touchstart", on, { passive: true });
    el.addEventListener("touchend", off);
  };
  document.querySelectorAll("a, button, .js-hov").forEach(hoverOn);

  // ── Menu · search panel ──
  const searchInput = document.querySelector(".sw-search input[type=search]");
  const closeAll = () => { body.classList.remove("is-nav-active", "is-search-active"); searchInput?.blur(); };
  document.querySelector(".sw-burger")?.addEventListener("click", (e) => {
    e.preventDefault();
    body.classList.remove("is-drawer-active", "is-search-active");
    body.classList.toggle("is-nav-active");
  });
  document.querySelector(".sw-find")?.addEventListener("click", (e) => {
    e.preventDefault();
    body.classList.remove("is-drawer-active", "is-nav-active");
    if (body.classList.toggle("is-search-active")) searchInput?.focus(); else searchInput?.blur();
  });
  document.querySelectorAll(".sw-veil").forEach((v) => v.addEventListener("click", closeAll));
  const all = document.querySelector("#sw-kind-all");
  const kinds = [...document.querySelectorAll(".sw-kind")];
  all?.addEventListener("change", () => { if (all.checked) kinds.forEach((k) => (k.checked = false)); });
  kinds.forEach((k) => k.addEventListener("change", () => { if (all) all.checked = !kinds.some((x) => x.checked); }));
  document.querySelector(".sw-search form")?.addEventListener("submit", (e) => e.preventDefault());
  let lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; closeAll(); } });

  // ── First page: after passing the hero, the big logo group at the bottom left becomes the header row (at once, no transition) ──
  const hero = document.querySelector(".sw-hero");
  if (body.dataset.page === "home" && hero) {
    const headH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sw-head")) * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    const check = () => body.classList.toggle("header-fixed", scrollY >= hero.offsetHeight - headH());
    check();
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    // On the hero, clicking the logo or image doesn’t change pages but scrolls smoothly down to where the header line attaches
    document.querySelectorAll(".sw-home-id a.sw-home-id__logo, .sw-hero__img").forEach((a) => a.addEventListener("click", (e) => {
      if (body.classList.contains("header-fixed")) return;
      e.preventDefault();
      scrollTo({ top: hero.offsetHeight - headH(), behavior: reduce ? "auto" : "smooth" });
    }));
  }

  // ── News marquee: 1px left per frame, pauses on hover. Filled after fonts finish loading and turned on at 1s over .6s ──
  document.querySelectorAll(".sw-marquee").forEach((m) => {
    const track = m.querySelector(".sw-marquee__track"), first = m.querySelector(".sw-marquee__set");
    if (!track || !first) return;
    const speed = +m.dataset.speed || 1;
    let x = 0, span = 0, paused = false, on = false;
    m.addEventListener("mouseover", () => (paused = true));
    m.addEventListener("mouseout", () => (paused = false));
    const fill = () => {
      const items = [...first.children];
      while (first.offsetWidth < m.offsetWidth) items.forEach((n) => first.append(n.cloneNode(true)));
      span = first.offsetWidth;
      while (track.scrollWidth < m.offsetWidth * 2) track.append(first.cloneNode(true));
      m.classList.add("is-active");
      on = true;
    };
    const step = () => {
      if (on && !paused && !reduce) { x -= speed; if (Math.abs(x) >= span) x = 0; track.style.transform = `translate3d(${x}px,0,0)`; }
      requestAnimationFrame(step);
    };
    step();
    (document.fonts?.ready || Promise.resolve()).then(fill);
  });

  // ── Work drawer: tapping a card doesn’t change pages. It raises a panel painted in that card’s two colors and only swaps the URL ──
  const drawer = document.querySelector(".sw-drawer");
  if (drawer) {
    const panel = drawer.querySelector(".sw-drawer__panel");
    let back = null;
    const close = () => {
      if (!body.classList.contains("is-drawer-active")) return;
      body.classList.remove("is-drawer-active");
      if (back) { history.replaceState(null, "", back); back = null; }
    };
    const open = (card) => {
      const cs = getComputedStyle(card);
      const root = document.documentElement.style;
      root.setProperty("--card-bg", cs.getPropertyValue("--card-bg"));
      root.setProperty("--card-ink", cs.getPropertyValue("--card-ink"));
      const tags = [...card.querySelectorAll('[data-fx-part="tag"]')].map((t) => `<span>${t.textContent}</span>`).join("");
      panel.innerHTML = `
        <div class="sw-drawer__kind sw-thin sw-ls05">${card.querySelector(".sw-card__kind")?.textContent || ""}</div>
        <h4 class="sw-drawer__title">${card.querySelector("h2")?.textContent || ""}</h4>
        <div class="sw-drawer__by">${card.querySelector(".sw-card__by")?.textContent || ""}</div>
        <div class="sw-drawer__row">
          <div><div class="wf-img sw-ph" data-label="${card.querySelector(".wf-img")?.dataset.label || "Cover"}"></div></div>
          <div>
            <div class="sw-drawer__text">Add four or five lines here introducing the work. Briefly say what the story is about, who appears in it, and where it is serialized. The original places the plot and serialization info here.</div>
            ${tags ? `<div class="sw-drawer__tags">${tags}</div>` : ""}
          </div>
          <p class="sw-drawer__more"><a class="sw-btn sw-btn--neg" href="${card.getAttribute("href")}">View this work in more detail</a></p>
        </div>`;
      panel.querySelectorAll("a, button").forEach(hoverOn);
      panel.scrollTop = 0;
      back = location.href;
      history.pushState({ drawer: true }, "", card.getAttribute("href"));
      body.classList.remove("is-nav-active", "is-search-active");
      body.classList.add("is-drawer-active");
    };
    document.querySelectorAll(".sw-card[data-drawer]").forEach((card) => card.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      open(card);
    }));
    document.querySelectorAll(".sw-drawer__veil, .sw-drawer__close").forEach((n) => n.addEventListener("click", (e) => { e.preventDefault(); close(); }));
    addEventListener("popstate", () => { back = null; body.classList.remove("is-drawer-active"); });
  }
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeAll();
    if (body.classList.contains("is-drawer-active")) document.querySelector(".sw-drawer__close")?.click();
  });

  // ── News row slider — original Swiper (slidesPerView auto · grab hand · 100px push at the end) ──
  if (window.Swiper) {
    document.querySelectorAll(".sw-carousel").forEach((el) => new Swiper(el, {
      slidesPerView: "auto",
      spaceBetween: 0,
      grabCursor: true,
      edgeSwipeThreshold: 100,
      navigation: { nextEl: el.querySelector(".swiper-button-next"), prevEl: el.querySelector(".swiper-button-prev") },
    }));
  }

  // ── Photo zoom — original PhotoSwipe 4 (backdrop is the page background color) ──
  const pswp = document.querySelector(".pswp");
  if (pswp && window.PhotoSwipe) {
    document.querySelectorAll(".sw-zoom-group").forEach((group) => {
      const links = [...group.querySelectorAll(".sw-zoom")];
      links.forEach((a, i) => a.addEventListener("click", (e) => {
        e.preventDefault();
        const items = links.map((l) => {
          const [w, h] = (l.dataset.size || "1600x1200").split("x").map(Number);
          return { html: `<div class="sw-pswp-ph" style="aspect-ratio:${w}/${h}"><div class="wf-img sw-ph" data-label="${l.querySelector(".wf-img")?.dataset.label || ""}"></div></div>`, w, h };
        });
        new PhotoSwipe(pswp, window.PhotoSwipeUI_Default, items, { index: i, history: false, shareEl: false, fullscreenEl: false, zoomEl: false, bgOpacity: 1, showHideOpacity: true }).init();
      }));
    });
  }
})();
