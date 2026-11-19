// Company challenge: Hero photo flow (Swiper 8s · seamless), side number circles follow the current section and jump to it on press, red panel expand
(() => {
  const site = window.unSite;
  if (window.Swiper) {
    new Swiper(".ab-hero__swiper", {
      speed: 8000,
      loop: true,
      slidesPerView: 1.183,
      allowTouchMove: false,
      breakpoints: { 769: { slidesPerView: 2.3 } },
      autoplay: site.reduce ? false : { delay: 0, pauseOnMouseEnter: false, disableOnInteraction: false },
    });
  }
  const btns = [...document.querySelectorAll(".ab-pager__btn")];
  const sections = [...document.querySelectorAll("section[data-section]")];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const b = btns.find((x) => x.dataset.section === en.target.dataset.section);
      if (en.isIntersecting) { btns.forEach((x) => x.classList.remove("is-active")); b?.classList.add("is-active"); }
      else b?.classList.remove("is-active");
    });
  }, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });
  sections.forEach((s) => io.observe(s));
  btns.forEach((b) => b.addEventListener("click", () => {
    const t = sections.find((s) => s.dataset.section === b.dataset.section);
    if (!t) return;
    const off = site.isSp() ? 62 + 70 : 100;
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - off, behavior: site.reduce ? "auto" : "smooth" });
  }));
  site.onReady(() => {
    const bg = document.querySelector(".ab-join__bg");
    if (!bg || site.reduce) return;
    gsap.timeline({ scrollTrigger: { trigger: ".ab-join__contents", start: "top bottom", end: () => `+=${innerHeight * 0.5}`, scrub: true, invalidateOnRefresh: true } })
      .to(bg, { width: "100%", ease: "none" });
  });
})();
