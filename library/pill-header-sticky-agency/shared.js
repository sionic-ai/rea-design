// Interaction shared by all pages — phone menu (height 27.5rem .4s · opacity 1s, power4.out), night mode, rotating badge, Swiper slides (logo strip, text strip), video window.
// Header-line pill, sticky button, round cursor, ticker and floating photos are handled by the _fx part.
(() => {
  const root = document.documentElement;
  if (localStorage.getItem("ms-dark") === "true") root.classList.add("is-dark");

  addEventListener("DOMContentLoaded", () => {
    const head = document.querySelector(".ms-head"), mobile = document.querySelector(".ms-mobile"), burger = document.querySelector(".ms-head__burger");
    const ease = "power4.out";

    // ───── Phone menu — values exactly from the original header component ─────
    if (burger && mobile) {
      let open = false;
      burger.addEventListener("click", () => {
        open = !open;
        const scrolled = scrollY > 10;
        burger.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("ms-menu-open", open);
        document.body.style.overflow = open ? "hidden" : "";
        if (open) {
          gsap.to(head, { duration: 0.4, width: "94vw", ease, overwrite: "auto" });
          gsap.to(mobile, { duration: 0.4, delay: scrolled ? 0.2 : 0, height: "27.5rem", ease });
          gsap.to(mobile, { duration: 1, delay: scrolled ? 0.3 : 0.1, opacity: 1, ease });
          head.classList.add("is-pill");
        } else {
          gsap.to(mobile, { duration: 0.6, opacity: 0, ease });
          gsap.to(mobile, { duration: 0.4, height: "0rem", delay: 0.2, ease });
          gsap.to(head, { duration: 0.4, delay: 0.4, width: scrolled ? "16rem" : "99vw", ease });
          setTimeout(() => head.classList.toggle("is-pill", scrollY > 10), 400);
        }
      });
    }

    // ───── Night mode ─────
    document.querySelectorAll(".ms-hero__ctl").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); }));
    document.querySelectorAll(".ms-head__mode").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      const dark = root.classList.toggle("is-dark");
      localStorage.setItem("ms-dark", String(dark));
      b.setAttribute("aria-pressed", String(dark));
    }));

    // ───── Spinning badge — appears after scrolling a little ─────
    const badge = document.querySelector(".ms-badge"), ring = badge?.querySelector(".ms-badge__ring svg");
    const showBadge = () => {
      if (!badge) return;
      badge.classList.toggle("is-on", scrollY > innerHeight / 3 && innerHeight + scrollY < document.body.offsetHeight - 1000);
      if (ring) ring.style.transform = `rotate(${scrollY / 10}deg)`;
    };
    addEventListener("scroll", showBadge, { passive: true });
    showBadge();

    // ───── Logo strip — Swiper autoplay delay 0 · speed 8000, flowing without a break ─────
    document.querySelectorAll(".ms-logos .swiper").forEach((el) => {
      const sw = new Swiper(el, {
        slidesPerView: 2, loop: true, speed: 8000, autoplay: { delay: 0 }, allowTouchMove: false,
        breakpoints: { 640: { slidesPerView: 3 }, 768: { slidesPerView: 3.5 }, 1024: { slidesPerView: 3.5 }, 1280: { slidesPerView: 4 }, 1400: { slidesPerView: 4 }, 1600: { slidesPerView: 5 } },
      });
      let t;
      addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { sw.update(); sw.autoplay.start(); }, 50); });
    });

    // ───── Article·case slider strip — 1.2 · 1.7 · 2.2 · 2.5 slides ─────
    document.querySelectorAll(".ms-feed").forEach((box) => {
      const el = box.querySelector(".swiper");
      if (!el) return;
      new Swiper(el, {
        slidesPerView: 1.2, spaceBetween: 0,
        navigation: { nextEl: box.querySelector(".ms-feed__next"), prevEl: box.querySelector(".ms-feed__prev") },
        breakpoints: { 640: { slidesPerView: 1.7 }, 1024: { slidesPerView: +(box.dataset.per || 2.2) }, 1800: { slidesPerView: 2.5 } },
      });
    });

    // ───── Video window — on press the curtain lays in at .3s and the panel floats up ─────
    document.querySelectorAll("[data-modal-open]").forEach((b) => {
      const m = document.getElementById(b.dataset.modalOpen);
      if (!m) return;
      const close = () => { m.classList.remove("is-open"); document.body.style.overflow = ""; b.focus({ preventScroll: true }); };
      b.addEventListener("click", (e) => { e.preventDefault(); m.classList.add("is-open"); document.body.style.overflow = "hidden"; m.querySelector("[data-modal-close]")?.focus({ preventScroll: true }); });
      m.querySelectorAll("[data-modal-close]").forEach((c) => c.addEventListener("click", close));
      addEventListener("keydown", (e) => { if (e.key === "Escape" && m.classList.contains("is-open")) close(); });
    });
  });
})();
