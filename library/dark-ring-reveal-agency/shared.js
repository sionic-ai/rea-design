// Motion shared by all pages — header (hides on scroll down, returns as a dark plate on scroll up), cursor (36px ring + 6px dot .07 lerp), cookie strip,
// Narrow-screen menu, data-speed parallax (same formula as ScrollSmoother effects, window scroll), a footer that floats up over 1.5s when visible, award text with a 3s stagger.
// Hero video slider and work slider (swiper) plus the More label above the work row live here too — the home page and the regional detail page share it.
// Big wordmark drop-in · ring mask · vertical service panel · word lighting · horizontal push · attached photo retreat come with _fx motion parts.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Header: dark plate (scrolled) after scrolling even slightly, hides 110% upward while scrolling down and returns on scroll up (.5s) ----------
  const head = document.getElementById("nvHead");
  if (head) {
    let lastY = scrollY, busy = false;
    const upd = () => {
      const y = scrollY, d = y - lastY;
      head.classList.toggle("is-filled", y > 10);
      if (y < 100) head.classList.remove("is-up");
      else if (d > 4) head.classList.add("is-up");
      else if (d < -4) head.classList.remove("is-up");
      lastY = y; busy = false;
    };
    addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
    const burger = head.querySelector(".nv-burger"), menu = document.getElementById("nvMobile");
    burger?.addEventListener("click", () => { const open = burger.getAttribute("aria-expanded") !== "true"; burger.setAttribute("aria-expanded", String(open)); menu.hidden = !open; document.documentElement.style.overflow = open ? "hidden" : ""; });
  }

  // ---------- Cursor: turns on when the mouse enters, ring and dot follow the cursor (measured in the original: just over 100ms to settle, effectively instant). .7x over links, hidden over the More box, + over + boxes ----------
  const cur = document.querySelector(".nv-cursor");
  if (cur && fine && !reduce) {
    const parts = [cur.querySelector(".nv-cursor__outer"), cur.querySelector(".nv-cursor__inner")];
    let mx = innerWidth / 2, my = innerHeight / 2, x = mx, y = my, inside = false, raf = 0;
    // The original cursor group runs every frame while on — it closes .8 of the remaining distance each time so it attaches within about one frame
    const loop = () => { x += (mx - x) * 0.8; y += (my - y) * 0.8; parts.forEach((p) => (p.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`)); raf = inside ? requestAnimationFrame(loop) : 0; };
    document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; if (!inside) { inside = true; cur.classList.add("is-in"); x = mx; y = my; } if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { inside = false; cur.classList.remove("is-in"); });
    document.addEventListener("mouseover", (e) => { const t = e.target instanceof Element ? e.target : null; cur.classList.toggle("is-link", !!t?.closest("a[href], button")); cur.classList.toggle("is-plus", !!t?.closest("[data-cursor-plus]")); cur.classList.toggle("is-off", !!t?.closest("[data-follow]")); });
  }

  // ---------- Search panel: pressing the search icon opens the panel in .5s, the body recedes to .15, and the input pill rises from 15px below. Esc or clicking the backdrop closes it ----------
  const search = document.querySelector(".nv-search");
  if (search) {
    const setS = (on) => { document.body.classList.toggle("is-search", on); if (on) setTimeout(() => search.querySelector("input")?.focus({ preventScroll: true }), 60); };
    $$("[data-search]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); setS(true); }));
    search.addEventListener("click", (e) => { if (e.target === search) setS(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setS(false); });
  }

  // ---------- Submenu panel ----------
  const sub = document.getElementById("nvSub");
  if (sub) {
    const setSub = (on) => { document.body.classList.toggle("is-sub-open", on); sub.setAttribute("aria-hidden", String(!on)); $$("[data-sub]").forEach((b) => b.setAttribute("aria-expanded", String(on))); };
    $$("[data-sub]").forEach((b) => b.addEventListener("click", () => setSub(!document.body.classList.contains("is-sub-open"))));
    sub.querySelector("[data-sub-close]")?.addEventListener("click", () => setSub(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setSub(false); });
  }

  // ---------- Cookie bar ----------
  $$(".nv-cookie [data-close]").forEach((b) => b.addEventListener("click", () => b.closest(".nv-cookie").classList.add("is-gone")));

  // data-speed parallax: same formula as ScrollSmoother effects — while the element passes from the bottom of the screen to the top it moves (1 − speed) × travel distance less or more, and sits in place at the center
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const tws = $$("[data-speed]").map((el) => {
      const speed = parseFloat(el.dataset.speed) || 1;
      if (speed === 1) return null;
      return gsap.fromTo(el, { y: () => -(1 - speed) * (innerHeight + el.offsetHeight) / 2 }, { y: () => (1 - speed) * (innerHeight + el.offsetHeight) / 2, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    }).filter(Boolean);
    return () => tws.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  });

  // ---------- Floats up in 1.5s when visible (fadeIn: expo.out), hides again when scrolled back up ----------
  if (reduce) $$("[data-fade]").forEach((el) => el.classList.add("is-in"));
  else $$("[data-fade]").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top bottom", onEnter: () => el.classList.add("is-in"), onLeaveBack: () => el.classList.remove("is-in") }));

  // ---------- Award text: switches to the next line every 3s in a staggered way (original swiper fade · no crossFade · 3000ms) ----------
  $$(".nv-foot__awards").forEach((box) => {
    const items = [...box.children];
    if (items.length < 2 || reduce) return;
    let i = 0;
    setInterval(() => { items[i].classList.remove("is-on"); i = (i + 1) % items.length; items[i].classList.add("is-on"); }, 3000);
  });

  // ---------- Video slot: shows a playing state when visible (original videoAutoplay — play on enter, pause on leave) ----------
  const vio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-playing", e.isIntersecting)), { rootMargin: "100px 0px" });
  $$("[data-autoplay]").forEach((v) => vio.observe(v));

  // ---------- Hero and work slide transitions and labels ----------
  const links = [...document.querySelectorAll(".nv-hero__links li")];
  const hero = document.querySelector(".nv-hero__slider");
  if (hero && window.Swiper) {
    const mark = (i) => links.forEach((l, k) => l.classList.toggle("is-on", k === i));
    new Swiper(hero, { loop: true, effect: "slide", speed: 1000, autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false }, watchSlidesProgress: true, allowTouchMove: true, on: { init: (s) => mark(s.realIndex), slideChange: (s) => mark(s.realIndex) } });
  }
  const projs = document.querySelector(".nv-projs__slider");
  if (projs && window.Swiper) {
    new Swiper(projs, { slidesPerView: "auto", spaceBetween: 0, loop: false, centeredSlides: false, autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false }, speed: 1000, navigation: { prevEl: ".nv-projs__prev", nextEl: ".nv-projs__next" } });
  }
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) document.querySelectorAll("[data-follow]").forEach((box) => {
    const f = document.createElement("div");
    f.className = "nv-follow";
    f.innerHTML = '<div class="nv-follow__in"><span>View more</span><svg aria-hidden="true"><use href="#nv-arrow"/></svg></div>';
    box.prepend(f);
    let mx = box.clientWidth / 2, my = box.clientHeight / 2, x = mx, y = my, inside = false;
    const put = () => { f.style.transform = `translate3d(${x - f.offsetWidth / 2}px, ${y - f.offsetHeight / 2}px, 0)`; };
    const loop = () => { x += (mx - x) * 0.07; y += (my - y) * 0.07; put(); if (inside) requestAnimationFrame(loop); };
    const move = (e) => { const r = box.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    box.addEventListener("mouseover", (e) => { if (inside) return; box.addEventListener("mousemove", move, { passive: true }); inside = true; f.classList.add("is-in"); move(e); requestAnimationFrame(loop); });
    box.addEventListener("mouseleave", () => { box.removeEventListener("mousemove", move); mx = box.clientWidth / 2; my = box.clientHeight / 2; inside = false; f.classList.remove("is-in"); });
    put();
  });
})();
