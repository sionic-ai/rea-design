// Shared by all pages — loader (lifts in 2s on arrival)·menu curtain·search curtain·serial photo sync swap (Swiper 10.3.1 fade)·water-drop photo drawing.
(() => {
  const root = document.documentElement;
  const mm = gsap.matchMedia();
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Droplet photo: question, English and episode text wrap in a curve around the cut-out photo area ──
  const BLOBS = [
    "M200,250 C190,170 300,120 400,128 C520,138 585,190 570,262 C555,340 470,380 360,372 C250,364 210,320 200,250 Z",
    "M230,190 C260,130 380,118 470,140 C560,162 590,240 560,310 C530,380 420,392 330,375 C240,358 200,280 230,190 Z",
    "M190,280 C170,200 240,140 330,150 C390,156 420,120 490,135 C570,152 590,230 560,300 C530,370 440,370 380,360 C300,388 210,350 190,280 Z",
    "M170,240 C200,170 330,150 430,160 C540,170 600,210 590,260 C580,320 480,345 380,345 C260,345 150,300 170,240 Z",
  ];
  const PATHS = {
    q: "M100,160 C190,30 490,8 670,92",
    no: "M62,175 C62,350 200,468 380,470",
    en: "M440,470 C560,458 655,400 700,300",
  };
  let uid = 0;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  document.querySelectorAll(".ik-blob[data-label]").forEach((el) => {
    const id = `ikb${++uid}`;
    const shape = BLOBS[(Number(el.dataset.shape) || 0) % BLOBS.length];
    const t = (key, cls, text) =>
      text ? `<path id="${id}${key}" d="${PATHS[key]}" fill="none"/><text class="${cls}"><textPath href="#${id}${key}">${esc(text)}</textPath></text>` : "";
    el.innerHTML = `<svg viewBox="0 0 720 480" role="img" aria-label="${esc(el.dataset.label)}">
      <clipPath id="${id}c"><path d="${shape}" transform="translate(380 250) scale(1.32 1.3) translate(-380 -250)"/></clipPath>
      <g clip-path="url(#${id}c)">
        <rect class="ph" width="720" height="480"/>
        <path class="ph-x" d="M120,70 L650,430 M120,430 L650,70"/>
        <text class="ph-label" x="380" y="258" text-anchor="middle">${esc(el.dataset.label)}</text>
      </g>
      ${t("q", "q", el.dataset.q)}${t("no", "no", el.dataset.no)}${t("en", "en", el.dataset.en)}
    </svg>`;
  });

  // ── Series photos: like the original, Swiper fade (crossFade · speed 1000) is applied to each episode, and instead of autoplay a 4s setInterval advances all episodes together ──
  const startSeries = () => {
    const all = [];
    document.querySelectorAll(".ik-series__swiper").forEach((el) => {
      if (el.swiper || !window.Swiper) return;
      const n = el.querySelectorAll(".swiper-slide").length;
      if (!n) return;
      const sw = new Swiper(el, {
        slidesPerView: 1, spaceBetween: 0, loop: n > 1, effect: "fade", fadeEffect: { crossFade: true },
        autoplay: false, speed: 1000, observer: true, observeParents: true, watchOverflow: true,
        on: { init() { this.update(); } },
      });
      if (n > 1) all.push(sw);
    });
    if (all.length && !reduce()) setInterval(() => all.forEach((sw) => sw.slideNext()), 4000);
  };
  if (document.readyState === "complete") startSeries();
  else addEventListener("load", startSeries);

  // ── Scroll lock: while the overlay is up, leave the scrollbar width empty on the right so the screen doesn’t shake ──
  const lock = () => {
    const bar = innerWidth - root.clientWidth;
    root.style.paddingRight = bar ? `${bar}px` : "";
    root.classList.add("is-locked");
  };
  const unlock = () => {
    root.classList.remove("is-locked");
    root.style.paddingRight = "";
  };

  // ── Loader ──
  const loader = document.querySelector(".ik-loading");
  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    document.dispatchEvent(new CustomEvent("ik:reveal"));
    if (!loader) return;
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        if (ctx.conditions.still) return gsap.set(loader, { autoAlpha: 0 });
        gsap.to(loader, { opacity: 0, duration: 2, ease: "power4.out", onComplete: () => gsap.set(loader, { visibility: "hidden" }) });
      },
    );
  };
  const fallback = setTimeout(reveal, 5000);
  const ready = () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    clearTimeout(fallback);
    reveal();
  });
  if (document.readyState === "complete") ready();
  else addEventListener("load", ready);

  // ── Menu Overlay ──
  const toggle = document.querySelector(".ik-toggle");
  const menu = document.querySelector(".ik-menu");
  const words = menu ? menu.querySelectorAll(".ik-menu__item a > span") : [];
  let wordsTween = null;
  const openMenu = () => {
    lock();
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.remove("in-top-first-view");
    menu.style.display = "block";
    if (wordsTween) wordsTween.kill();
    if (reduce()) return gsap.set([menu, words], { opacity: 1, yPercent: 0 });
    gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power4.out", overwrite: true });
    gsap.set(words, { yPercent: 100 });
    wordsTween = gsap.to(words, { yPercent: 0, duration: 1.6, delay: 0.25, ease: "power4.out", stagger: 0.08 });
  };
  const closeMenu = () => {
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    gsap.to(menu, {
      opacity: 0,
      duration: reduce() ? 0 : 1.2,
      delay: reduce() ? 0 : 0.1,
      ease: "power4.out",
      overwrite: true,
      onComplete: () => {
        menu.style.display = "none";
        if (wordsTween) wordsTween.kill();
        gsap.set(words, { clearProps: "all" });
        unlock();
        document.dispatchEvent(new CustomEvent("ik:scroll"));
      },
    });
  };
  if (toggle && menu) {
    toggle.addEventListener("click", () => (toggle.classList.contains("is-open") ? closeMenu() : openMenu()));
    menu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      if (a.hash && a.pathname === location.pathname) {
        e.preventDefault();
        closeMenu();
        const target = document.querySelector(a.hash);
        if (target) setTimeout(() => target.scrollIntoView({ behavior: reduce() ? "auto" : "smooth" }), 50);
        return;
      }
      closeMenu();
    });
  }

  // ── Search Overlay ──
  const sbtn = document.querySelector(".ik-search-btn");
  const search = document.querySelector(".ik-search");
  const closeSearch = () => {
    gsap.to(search, {
      opacity: 0,
      duration: reduce() ? 0 : 1.2,
      ease: "power4.out",
      overwrite: true,
      onComplete: () => {
        search.style.display = "none";
        unlock();
      },
    });
  };
  if (sbtn && search) {
    sbtn.addEventListener("click", () => {
      lock();
      search.style.display = "block";
      gsap.to(search, { opacity: 1, duration: reduce() ? 0 : 1.2, ease: "power4.out", overwrite: true });
      setTimeout(() => search.querySelector("input")?.focus(), 200);
    });
    search.querySelector(".ik-search__cover").addEventListener("click", (e) => {
      if (!e.target.closest(".ik-search__form")) closeSearch();
    });
    search.querySelector("form").addEventListener("submit", (e) => e.preventDefault());
  }
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (search && search.style.display === "block") closeSearch();
    else if (toggle?.classList.contains("is-open")) closeMenu();
  });

  // When returning via back (bfcache), the curtain is fully peeled
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    if (menu) menu.style.display = "none";
    toggle?.classList.remove("is-open");
    unlock();
  });
})();
