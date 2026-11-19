// Recruiting site panel — motion from the original script.js: after the first screen, a blue header bar (.on), phone menu, news slider (swiper 11 · 1.5s · 3s auto · loop progress),
// On load the title line floats up (.is-start), and floats up when 20% visible (c-anime-up). Band titles and photos use bar-wipe-reveal, ring pairs are the scroll-turn part.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector(".rc-header");
  const mv = document.querySelector("[data-rc-mv]");
  if (header) {
    let bottom = 0;
    const apply = () => header.classList.toggle("is-on", (scrollY || 0) >= bottom);
    const recalc = () => { bottom = mv ? mv.getBoundingClientRect().top + scrollY + mv.offsetHeight : 0; apply(); };
    addEventListener("scroll", apply, { passive: true });
    addEventListener("resize", recalc, { passive: true });
    recalc();
  }

  // Phone menu — as in the original, the body is fixed while open so the background doesn’t shift
  const burger = document.querySelector("[data-rc-burger]");
  const spnav = document.querySelector("[data-rc-spnav]");
  let lockY = 0;
  const setOpen = (open) => {
    burger?.setAttribute("aria-expanded", String(open));
    spnav?.classList.toggle("is-active", open);
    spnav?.setAttribute("aria-hidden", String(!open));
    if (open) { lockY = scrollY; Object.assign(document.body.style, { position: "fixed", top: `${-lockY}px`, width: "100%" }); }
    else { Object.assign(document.body.style, { position: "", top: "", width: "" }); scrollTo(0, lockY); }
  };
  burger?.addEventListener("click", () => setOpen(burger.getAttribute("aria-expanded") !== "true"));
  spnav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));

  // News carousel — the ring draws one lap in 3s (auto-advance interval) and the number changes at the last 8%
  const box = document.querySelector(".rc-fv-slide");
  const pagi = document.querySelector("[data-rc-pagi]");
  if (box && window.Swiper) {
    const DELAY = 3000;
    if (pagi) {
      pagi.innerHTML = '<span class="rc-pagi__ring"><svg viewBox="0 0 28 28" aria-hidden="true"><circle class="ring-bg" cx="14" cy="14" r="12"/><circle class="ring-fg" cx="14" cy="14" r="12"/></svg></span><span class="rc-pagi__num"><span class="rc-pagi__cur">01</span><span class="rc-pagi__next">02</span></span>';
      pagi.style.setProperty("--pagi-duration", `${DELAY}ms`);
    }
    const total = box.querySelectorAll(".swiper-slide").length;
    const nums = (sw) => {
      if (!pagi) return;
      const cur = sw.realIndex, nxt = (cur + 1) % total;
      pagi.querySelector(".rc-pagi__cur").textContent = String(cur + 1).padStart(2, "0");
      pagi.querySelector(".rc-pagi__next").textContent = String(nxt + 1).padStart(2, "0");
      pagi.classList.remove("is-animating");
      void pagi.offsetWidth;
      if (!reduce) pagi.classList.add("is-animating");
    };
    new Swiper(box, {
      loop: true, loopAdditionalSlides: 2, speed: reduce ? 0 : 1500, slidesPerView: 1.5, spaceBetween: 40, roundLengths: true,
      autoplay: reduce ? false : { delay: DELAY, disableOnInteraction: false, pauseOnMouseEnter: false },
      breakpoints: { 0: { slidesPerView: 1, spaceBetween: 40 }, 768: { slidesPerView: 1.5, spaceBetween: 40 } },
      on: { init() { nums(this); }, slideChangeTransitionEnd() { nums(this); } },
    });
  }

  const start = () => document.querySelector("[data-rc-start]")?.classList.add("is-start");
  document.readyState === "complete" ? start() : addEventListener("load", start);

  const ups = document.querySelectorAll(".rc-up");
  if (reduce) ups.forEach((el) => el.classList.add("is-inview"));
  else {
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-inview");
      io.unobserve(en.target);
    }), { threshold: 0.2 });
    ups.forEach((el) => io.observe(el));
  }
})();
