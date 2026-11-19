// Hero: line drawing → text·buttons appear → covers rush in (openingAnimation), drag the cover row to flip through (swiper freeMode),
// Cover hover wobble, cover click enlarges → that year’s color board covers the screen and navigates (mouseTriggerAnimation).
(() => {
  const { isSp } = window.ppShared;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".pp-cover").forEach((a) => a.insertAdjacentHTML("afterbegin", window.ppCoverSvg(Number(a.dataset.year))));
  document.querySelectorAll(".pp-overlap__item").forEach((el) => {
    el.style.background = `var(--site-year-${el.dataset.year})`;
    el.innerHTML = `<div class="pp-overlap__art">${window.ppCoverSvg(Number(el.dataset.year), { mast: false })}</div>`;
  });

  const opening = () => new Promise((resolve) => {
    if (reduce) {
      gsap.set(".pp-line", { scale: 1 });
      gsap.set("[data-pp-fadein]", { opacity: 1 });
      gsap.set(".pp-cover", { x: 0 });
      return resolve();
    }
    const d = .5;
    gsap.timeline({ onComplete: resolve })
      .addLabel("anim1")
      .to(".pp-line--top", { scaleX: 1, duration: d }, "anim1")
      .addLabel("anim2")
      .to(".pp-line--lead", { scaleY: 1, duration: d }, "anim2")
      .to(".pp-line--bottom", { scaleX: 1, duration: d }, "anim2")
      .addLabel("anim3")
      .to(".pp-line--left", { scaleY: 1, duration: d }, "anim3")
      .to(".pp-line--links", { scaleY: 1, duration: d }, "anim3")
      .to("[data-pp-fadein]", { opacity: 1, duration: 2 })
      .to(".pp-cover", { x: 0, duration: 1, ease: "power4.inOut", stagger: .25 }, "-=1");
  });

  // Original carousel.ts: after the opening sequence ends it applies swiper freeMode, and measures the gap between covers at that moment and passes it as spaceBetween
  let swiper;
  const carousel = () => {
    swiper?.destroy();
    const items = document.querySelectorAll(".pp-shelf .swiper-slide");
    const spaceBetween = items.length < 2 ? 60 : items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().right;
    swiper = new Swiper(".pp-shelf", {
      slidesPerView: "auto",
      spaceBetween,
      freeMode: true,
      navigation: { nextEl: ".pp-nav__next", prevEl: ".pp-nav__prev" },
    });
  };
  matchMedia("(max-width: 600px)").addEventListener("change", () => {
    swiper?.destroy();
    swiper = undefined;
    setTimeout(carousel, 10);
  });

  // Cover flip — original values as is
  const clone = document.querySelector(".pp-zoom-clone");
  const onClick = async (e, slide) => {
    if (reduce) return;
    e.preventDefault();
    const n = slide.dataset.year;
    const href = slide.getAttribute("href");
    const overlap = document.querySelector(`.pp-overlap__item[data-year="${n}"]`);
    const art = overlap.querySelector(".pp-overlap__art");
    document.querySelector(".pp-root").classList.add("pp-frozen");
    gsap.set(slide, { rotate: 0, scale: 1 });
    const r = slide.getBoundingClientRect();
    clone.innerHTML = slide.querySelector("svg").outerHTML;
    await gsap.timeline()
      .fromTo(clone, { left: r.left, top: r.top, width: r.width, height: r.height, scale: 1, opacity: 0 }, { opacity: 1, duration: .25 })
      .set(slide, { opacity: 0 })
      .to(clone, { scale: 1.5, duration: .3, ease: "power3.in" });
    const z = clone.getBoundingClientRect();
    await gsap.timeline()
      .set(overlap, { left: z.left, top: z.top, width: z.width, height: z.height })
      .to(overlap, { duration: .2, opacity: 1 })
      .set(clone, { opacity: 0 })
      .to(overlap, { duration: .5, left: 0, top: 0, width: "100%", height: "100%" });
    gsap.fromTo(art, { xPercent: 0 }, { xPercent: 12, duration: 3, ease: "none", repeat: -1, yoyo: true });
    sessionStorage.setItem("pp-cover", n);
    setTimeout(() => { location.href = href; }, 1000);
  };
  document.querySelectorAll(".pp-cover").forEach((slide) => {
    slide.addEventListener("mouseenter", () => {
      if (reduce) return;
      slide.style.transformOrigin = "right bottom";
      const tl = gsap.timeline();
      if (!isSp()) tl.to(slide, { rotate: 3, duration: .2, ease: "power3.out" });
      tl.to(slide, { rotate: 0, duration: .2, ease: "power3.in" });
    });
    slide.addEventListener("click", (e) => onClick(e, slide));
  });

  // The original opens after window load, but in the copy load is delayed by over 3 seconds because of Korean web fonts, drifting from the original tempo (line drawing starts at 1.9s) — so it opens immediately
  opening().then(carousel);
})();
