// Subpages — LP hero photo slider (same Swiper 12.2.0 as the original: fade · 1.5s · 4s interval · no manual swiping), LP background in two stages,
// Recruit job tabs (panel fades in slowly) and opening a job row (.4s, on close it takes that row to screen center on a 1s cubic curve then folds in .2s).
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const kv = document.querySelector(".js-lpKV");
  if (kv && window.Swiper) new Swiper(kv, {
    loop: true, allowTouchMove: false, effect: "fade", speed: still ? 0 : 1500,
    autoplay: still ? false : { delay: 4000, disableOnInteraction: false },
  });

  // LP background: before the top of the Benefits section reaches 70% of the screen, navy 90%, after that 10%
  const bg = document.querySelector(".mb-bg.is-lp"), merit = document.querySelector("#merit");
  if (bg && merit) {
    const set = () => {
      const past = scrollY >= merit.getBoundingClientRect().top + scrollY - 0.7 * innerHeight;
      bg.classList.toggle("is-lp1", !past);
      bg.classList.toggle("is-lp2", past);
    };
    addEventListener("scroll", set, { passive: true });
    addEventListener("load", set);
    set();
  }

  // LP contact button: hide it when the top edge of the contact section reaches the bottom of the screen
  const banner = document.querySelector(".js-banner"), contact = document.querySelector("#contact");
  if (banner && contact) {
    const hide = () => banner.classList.toggle("is-hide", scrollY >= contact.getBoundingClientRect().top + scrollY - innerHeight);
    addEventListener("scroll", hide, { passive: true });
    hide();
  }

  const slide = (el, open, ms, done) => {
    el.style.display = "block";
    const h = el.scrollHeight;
    const a = el.animate([{ height: (open ? 0 : h) + "px" }, { height: (open ? h : 0) + "px" }], { duration: still ? 0 : ms, easing: "ease" });
    a.onfinish = () => { el.style.display = open ? "block" : "none"; window.mbLenis?.resize(); done?.(); };
  };

  document.querySelectorAll(".js-tab").forEach((btn) => btn.addEventListener("click", () => {
    document.querySelectorAll(".js-tab").forEach((b) => b.classList.toggle("is-active", b === btn));
    document.querySelectorAll(".mb-recruit__inner").forEach((c) => {
      const on = c.id === btn.dataset.tab;
      c.classList.toggle("is-active", on);
      if (on && !still) c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: "ease" });
    });
  }));

  document.querySelectorAll(".mb-job__name").forEach((name) => {
    const detail = name.nextElementSibling;
    const toggle = () => {
      const open = !name.classList.contains("is-active");
      name.classList.toggle("is-active", open);
      name.setAttribute("aria-expanded", String(open));
      slide(detail, open, 400);
    };
    name.addEventListener("click", toggle);
    name.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle()));
    detail.querySelector(".js-job-close")?.addEventListener("click", () => {
      const fold = () => { name.classList.remove("is-active"); name.setAttribute("aria-expanded", "false"); slide(detail, false, 200); };
      const lenis = window.mbLenis;
      if (lenis) lenis.scrollTo(name, { offset: -innerHeight / 2 + name.offsetHeight / 2, duration: 1, easing: (t) => 1 - Math.pow(1 - t, 3), onComplete: fold });
      else { name.scrollIntoView({ block: "center" }); fold(); }
    });
  });
})();
