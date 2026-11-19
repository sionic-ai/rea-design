// Home page only: photo collection pin (center 36% → 100%, at center center +=2000, scrub true) and
// Four tilted photo rows flow in opposite directions in proportion to scroll amount (speed .025, phone .015, second row starts at -50%).
(() => {
  const mm = gsap.matchMedia();
  mm.add("(min-width: 835px) and (prefers-reduced-motion: no-preference)", () => {
    const wide = matchMedia("(max-width: 1024px)").matches;
    gsap.timeline({ scrollTrigger: { trigger: ".field", start: wide ? "top 35%" : "center center", end: wide ? "+=1000" : "+=2000", scrub: true, pin: true, invalidateOnRefresh: true } })
      .to(".field__wrap", { width: "100%", duration: 0.4, ease: "none" }, 0);
  });

  const area = document.querySelector(".biz__loop");
  const rows = [...document.querySelectorAll(".biz__row")].map((el) => ({ el, dir: el.classList.contains("biz__row--1") ? -1 : 1, offset: el.classList.contains("biz__row--1") ? 0 : -50 }));
  if (!area || KZ.reduced) return;
  let on = false;
  const tick = () => {
    if (!on) return;
    const progress = innerHeight - area.getBoundingClientRect().top;
    const speed = matchMedia("(max-width: 834px)").matches ? 0.015 : 0.025;
    rows.forEach(({ el, dir, offset }) => (el.style.transform = `translate(${progress * speed * dir + offset}%,0)`));
    requestAnimationFrame(tick);
  };
  new IntersectionObserver((es) => { on = es[0].isIntersecting; if (on) requestAnimationFrame(tick); }).observe(area);

  document.querySelectorAll(".ci__list > li").forEach((li) => {
    const sec = li.closest(".ci");
    li.addEventListener("mouseenter", () => innerWidth > 834 && sec.classList.add("is-hovered"));
    li.addEventListener("mouseleave", () => sec.classList.remove("is-hovered"));
  });
})();
