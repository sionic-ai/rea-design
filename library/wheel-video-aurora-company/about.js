// Clicking an executive card slides in a teal curtain (.4s power1.out) and the side panel pushed 4rem, and that person’s slot settles in .4s. Previous and next swap in .1s each (original values).
(() => {
  const bg = document.querySelector(".cm-bg"), modal = document.querySelector(".cm-modal");
  const sets = { member: modal.querySelector(".cm-modal__set.is-member"), advisor: modal.querySelector(".cm-modal__set.is-advisor") };
  const prev = modal.querySelector(".is-prev"), next = modal.querySelector(".is-next");
  const html = document.documentElement;
  const dur = ZB.reduce ? 0 : 0.4;
  const show = (kind, i) => {
    const set = sets[kind], items = set.querySelectorAll("li");
    Object.values(sets).forEach((s) => s.querySelectorAll("li").forEach((li) => li.classList.remove("is-current")));
    items[i].classList.add("is-current");
    prev.disabled = i === 0;
    next.disabled = i === items.length - 1;
    gsap.timeline()
      .set([modal, set], { display: "block" })
      .to(bg, { autoAlpha: 1, duration: dur, ease: "power1.out" })
      .to(modal, { opacity: 1, x: "0rem", duration: dur, ease: "power1.out" }, "<")
      .to(items[i], { opacity: 1, duration: dur, ease: "power1.out" });
    html.style.overflow = "hidden";
  };
  const hide = () => {
    html.style.overflow = "";
    gsap.timeline()
      .to(bg, { autoAlpha: 0, duration: dur, ease: "power1.out" })
      .to(modal, { opacity: 0, duration: dur, ease: "power1.out" }, "<")
      .set([modal, ...Object.values(sets)], { display: "none" })
      .set(modal.querySelectorAll("li"), { opacity: 0, display: "" })
      .set(modal, { x: "4rem" });
  };
  const go = (dir) => {
    const cur = modal.querySelector("li.is-current");
    const to = dir === "prev" ? cur.previousElementSibling : cur.nextElementSibling;
    if (!to) return;
    const tl = gsap.timeline();
    tl.to(cur, { opacity: 0, duration: ZB.reduce ? 0 : 0.1, ease: "power1.out", onComplete: () => cur.classList.remove("is-current") });
    tl.to(to, { opacity: 1, duration: ZB.reduce ? 0 : 0.1, ease: "power1.out", onStart: () => { to.classList.add("is-current"); to.style.opacity = "0"; } });
    prev.disabled = to === to.parentElement.firstElementChild;
    next.disabled = to === to.parentElement.lastElementChild;
  };
  document.querySelectorAll(".cm-card").forEach((c) => c.addEventListener("click", () => show(c.classList.contains("is-advisor") ? "advisor" : "member", +c.dataset.i)));
  prev.addEventListener("click", () => go("prev"));
  next.addEventListener("click", () => go("next"));
  bg.addEventListener("click", hide);
  modal.querySelector(".cm-modal__close").addEventListener("click", hide);
  addEventListener("keydown", (e) => e.key === "Escape" && getComputedStyle(modal).display !== "none" && hide());
})();

// Partner organizations: same Swiper 5.4.5 as the original (.5s, width auto, grab hand, horizontal wheel only)
(() => {
  const box = document.querySelector(".co__slider");
  if (!box || !window.Swiper) return;
  new Swiper(box.querySelector(".swiper-container"), {
    speed: 500, grabCursor: true, initialSlide: 0, slidesPerView: "auto", touchRatio: 1,
    mousewheel: { forceToAxis: true },
    navigation: { nextEl: box.querySelector(".is-next"), prevEl: box.querySelector(".is-prev") },
  });
})();
