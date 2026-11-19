// First page: article slider (every 7.5s, first one after 6s · pauses when off-screen) · clicking a spine goes to that article · What’s Today · magazine swiper (speed 350, loop, auto width) · See more.
(() => {
  const { reduced } = window.TR;
  document.body.classList.add("is-ready");

  // ── Hero article flip ──
  const mv = document.querySelector(".mv");
  const items = [...mv.querySelectorAll("[data-mv-item]")];
  const navs = [...mv.querySelectorAll("[data-mv-nav]")];
  const pg = mv.querySelector("[data-mv-pg]");
  const bottom = mv.querySelector(".mv__bottom");
  let now = 0, prev = null, busy = false, timer = 0;
  const INTERVAL = 7500, FIRST = 6000;
  const settle = () => { if (prev) prev.classList.remove("is-current", "is-current--back", "is-hidden", "is-init"); busy = false; schedule(); };
  const schedule = (ms = INTERVAL) => { clearTimeout(timer); if (!reduced) timer = setTimeout(next, ms); };
  const paint = () => {
    navs.forEach((n, i) => n.classList.toggle("is-current", i === now));
    pg.textContent = String(now + 1).padStart(2, "0");
    bottom.style.color = getComputedStyle(items[now].querySelector(".mv__info")).color;
  };
  const go = (to, back = false) => {
    if (busy || to === now) return;
    busy = true;
    prev = items[now];
    now = (to + items.length) % items.length;
    prev.classList.add("is-hidden");
    items[now].classList.add("is-current");
    if (back) items[now].classList.add("is-current--back");
    paint();
    if (reduced) settle();
  };
  const next = () => go(now + 1);
  items.forEach((el) => {
    const done = (e) => { if (e.target === el && !el.classList.contains("is-hidden")) settle(); };
    el.addEventListener("transitionend", (e) => { if (e.propertyName === "transform") done(e); });
    el.addEventListener("animationend", done);
  });
  navs.forEach((n, i) => n.addEventListener("click", () => go(i, i < now)));
  mv.querySelector("[data-mv-next]").addEventListener("click", next);
  mv.querySelector("[data-mv-prev]").addEventListener("click", () => go(now - 1, true));
  paint();
  new IntersectionObserver(([e]) => { if (e.isIntersecting) schedule(FIRST); else { clearTimeout(timer); } }, { threshold: 0.1 }).observe(mv);

  // ── swiper: both originals use speed 350 · loop · slidesPerView auto · page number in 01 form (dynamic dots) ──
  const pad = (i) => String(i + 1).padStart(2, "0");
  [["thisday", ".thisday__list"], ["mags", ".mags__list"]].forEach(([key, sel]) => {
    const ctrl = document.querySelector(`[data-ctrl="${key}"]`);
    new Swiper(sel, {
      speed: reduced ? 0 : 350, loop: true, slidesPerView: "auto", centeredSlides: key === "mags",
      navigation: { prevEl: ctrl.querySelector(".ctrl__prev"), nextEl: ctrl.querySelector(".ctrl__next") },
      pagination: { el: ctrl.querySelector(".ctrl__pg"), clickable: true, dynamicBullets: true, renderBullet: (i, cls) => `<span class="${cls}">${pad(i)}</span>` }
    });
  });

})();
