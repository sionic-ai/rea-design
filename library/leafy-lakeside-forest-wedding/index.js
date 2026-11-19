// Home page — loading timeline on first open (original firstLoading), from the second time on just lifting the curtain (atstLoading), arch photo zoom and video strip zoom (scrub),
// Swap cards by hovering service rows, video window. In the original the GSAP default curve is none on this page (the parallax module changes the defaults).
(() => {
  const { reduced } = window.TW;
  gsap.defaults({ ease: "none" });
  const body = document.body;
  const header = document.querySelector(".tw-header");
  const loadingBg = document.querySelector(".tw-loading");
  const msg = document.querySelector(".tw-kv__msg");
  const msgText = document.querySelector(".tw-kv__text");
  const msgSub = document.querySelector(".tw-kv__sub");
  const treat1 = document.querySelector(".tw-kv__treat");
  const treat2 = document.querySelector(".tw-message__treat");
  const bgVideo = document.querySelector(".tw-movie__video");

  const unlock = () => body.classList.remove("scroll-locked");
  const firstLoading = () => {
    const startY = (msg.getBoundingClientRect().top + scrollY) * -1 + innerHeight / 2 - msg.clientHeight / 2;
    gsap.timeline()
      .add(() => body.classList.add("scroll-locked"))
      .set(loadingBg, { display: "block", y: 0 })
      .set(msg, { alpha: 0 })
      .set(msgText, { y: startY })
      .set(msgSub, { alpha: 0, clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" })
      .set(header, { alpha: 0, y: "-100%" })
      .set(treat1, { alpha: 0, rotate: 175 })
      .set(treat2, { alpha: 0, x: "-10%", rotate: -2 })
      .to(msg, { alpha: 1 }, "start")
      .to(msgText, { ease: "expo.out", duration: 1.6, y: "0%" }, "+=1.5")
      .to(loadingBg, { ease: "expo.out", duration: 1.4, y: "-100%" }, "<")
      .to(msgSub, { ease: "expo.out", alpha: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", duration: 5 }, "<")
      .to(treat1, { ease: "expo.out", alpha: 1, rotate: 180, delay: 1.4, duration: 2 }, "<")
      .to(treat2, { ease: "expo.out", alpha: 1, x: "0%", rotate: 0, duration: 2 }, "<")
      .to(header, { ease: "expo.out", alpha: 1, y: "0%", duration: 1 }, "<")
      .to(body, { onComplete: unlock }, "<");
  };
  const againLoading = () =>
    gsap.timeline()
      .to(loadingBg, { ease: "expo.out", duration: 1.4, delay: 0.3, y: "-100%" }, "start")
      .to(body, { onComplete: unlock }, "<");

  if (reduced) loadingBg.style.display = "none";
  else if (!sessionStorage.getItem("tw-loading-viewed")) {
    sessionStorage.setItem("tw-loading-viewed", "true");
    firstLoading();
  } else againLoading();

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // The arch photo scales to 1.15 with scroll (from when its top edge touches the top of the screen until its bottom edge does)
    const kvPhoto = document.querySelector(".tw-kv__photo");
    gsap.to(kvPhoto, { scale: 1.15, scrollTrigger: { trigger: kvPhoto, start: "top top", end: "bottom top", scrub: true } });
    // Video strip enters, scaling .95 → 1x
    gsap.fromTo(".tw-movie__bg", { scale: 0.95 }, { scale: 1, scrollTrigger: { trigger: ".tw-movie__bg", start: "top bottom", end: "top center", scrub: true } });
  });

  // Service row hover — the cards on both sides darken and tilt 2° more (.4s) then return (.4s), and the chosen row’s card comes forward
  const items = [...document.querySelectorAll(".tw-conductor__item")];
  const cards = [...document.querySelectorAll(".tw-service__card")];
  const flick = (card, base, tilt) =>
    gsap.timeline()
      .set(card, { rotate: base, autoAlpha: 1, filter: "brightness(0.6)" })
      .to(card, { rotate: tilt, autoAlpha: 0.6, filter: "brightness(0.6)", duration: 0.4 })
      .to(card, { rotate: base, autoAlpha: 1, filter: "brightness(1)", duration: 0.4 });
  const wide = matchMedia("(min-width: 1020px)");
  const pick = (i) =>
    [...items, ...cards].forEach((el) => {
      el.classList.remove("is-active", "is-hidden");
      el.classList.add(items.indexOf(el) === i || cards.indexOf(el) === i ? "is-active" : "is-hidden");
    });
  items.forEach((item, i) =>
    item.addEventListener("mouseenter", () => {
      if (!reduced && cards.length === 2) {
        flick(cards[0], wide.matches ? -4 : 4, wide.matches ? -6 : 6);
        flick(cards[1], wide.matches ? 4 : -4, wide.matches ? 6 : -6);
      }
      pick(i);
    }),
  );

  // ── Video window — on open, pauses the background video and hides the header row. Close and Esc restore them ──
  const modal = document.querySelector(".tw-movie-modal");
  const modalVideo = modal.querySelector("video");
  const openModal = () => {
    modalVideo.play().catch(() => {});
    modal.classList.add("active");
    body.classList.add("modal-opened");
    header.classList.add("is-hidden");
    bgVideo.pause();
  };
  const closeModal = () => {
    modalVideo.pause();
    modal.classList.remove("active");
    body.classList.remove("modal-opened");
    header.classList.remove("is-hidden");
    bgVideo.play().catch(() => {});
  };
  document.querySelector(".tw-movie__cursor-wrap").addEventListener("click", openModal);
  modal.querySelector(".tw-movie-modal__close").addEventListener("click", closeModal);
  addEventListener("keydown", (e) => e.key === "Escape" && modal.classList.contains("active") && closeModal());
  if (!reduced) bgVideo.play().catch(() => {});
})();
