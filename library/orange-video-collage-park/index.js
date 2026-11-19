// First page: loading veil, chaining three hero videos with footer parallax, event cards (collapse, phone slider), logo reveal, mountain drawing eye roll
(() => {
  const { reduce } = window.nk;
  const opening = document.querySelector(".nk-opening");
  const kvParts = ".nk-kv__head, .nk-kv__foot";
  const uiParts = ".nk-header__menu, .nk-header__sound, .nk-kv__event";

  // Loading — logo 1.03→1 · 0→1 after .4s over .8s, stagger applied when done. .6s rest then curtain .5s, head·weather after .5s for .4s, buttons·cards after .3s for .4s
  if (opening && !reduce) {
    gsap.set(".nk-opening__logo", { scale: 1.03 });
    gsap.set(`${kvParts}, ${uiParts}`, { opacity: 0 });
    gsap.timeline()
      .to(".nk-opening__logo", { opacity: 1, scale: 1, duration: 0.8, ease: "power2.inOut", onComplete: () => nk.startParallax() }, 0.4)
      .to(opening, { opacity: 0, duration: 0.5, ease: "power2.out" }, ">0.6")
      .to(kvParts, { opacity: 1, duration: 0.4, ease: "power2.out" }, ">0.5")
      .to(uiParts, { opacity: 1, duration: 0.4, ease: "power2.out", onComplete: () => opening.remove() }, ">0.3");
  } else {
    opening?.remove();
    nk.startParallax();
  }

  // Header logo — appears once the hero has scrolled fully out of view at the top
  const logo = document.querySelector(".nk-header__logo"), kv = document.querySelector(".nk-kv");
  new IntersectionObserver(([e]) => {
    logo.classList.toggle("show", !e.isIntersecting && e.boundingClientRect.bottom <= 0);
  }, { threshold: 0 }).observe(kv);

  // Hero video — when one ends, the next starts from the beginning and swaps in (cycles through three)
  const videos = [...document.querySelectorAll(".kv-video")];
  videos.forEach((v) => {
    const on = v.classList.contains("active");
    v.style.opacity = on ? "1" : "0";
    v.style.zIndex = on ? "1" : "0";
  });
  let cur = 0;
  videos.forEach((v) => v.addEventListener("ended", () => {
    v.style.opacity = "0"; v.style.zIndex = "0";
    v.classList.replace("active", "inactive");
    cur = (cur + 1) % videos.length;
    const n = videos[cur];
    n.style.opacity = "1"; n.style.zIndex = "1";
    n.classList.replace("inactive", "active");
    n.currentTime = 0;
    n.play().catch(() => {});
  }));
  setTimeout(() => videos[0]?.play().catch(() => {}), 100);

  // While the hero’s bottom edge passes from the screen bottom upward, the video follows down by 1/4 of the screen height with sine.in
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".nk-kv__bg video", { y: 0 }, {
      y: () => innerHeight / 4,
      ease: "sine.in",
      scrollTrigger: { trigger: ".nk-kv", start: "bottom bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });

    // Mountain illustration pupils — every second they hop to left · right · upper left · lower right · center
    gsap.timeline({ repeat: -1 })
      .set(".nk-intro__block--3 .pupil", { xPercent: -40, yPercent: 0 }, "<1")
      .set(".nk-intro__block--3 .pupil", { xPercent: 40, yPercent: 0 }, "<1")
      .set(".nk-intro__block--3 .pupil", { xPercent: -40, yPercent: -40 }, "<1")
      .set(".nk-intro__block--3 .pupil", { xPercent: 40, yPercent: 40 }, "<1")
      .set(".nk-intro__block--3 .pupil", { xPercent: 0, yPercent: 0 }, "<1");
  });

  // Event card — pressing × folds it into an 80px square (× rotates 45° into a +) and pressing again unfolds it. On phone it’s a slider that moves one card at a time
  const event = document.querySelector(".nk-kv__event");
  event.querySelector(".toggle").addEventListener("click", () => {
    const closed = !event.classList.contains("is-closed");
    document.documentElement.dataset.kvEventClosed = String(closed);
    event.classList.toggle("is-closed", closed);
  });
  const viewport = event.querySelector(".embla__viewport");
  if (viewport && !reduce && window.EmblaCarousel) {
    const embla = EmblaCarousel(viewport);
    const prev = event.querySelector(".embla__button--prev"), next = event.querySelector(".embla__button--next");
    const dotsBox = event.querySelector(".embla__dots");
    prev.addEventListener("click", () => embla.scrollPrev());
    next.addEventListener("click", () => embla.scrollNext());
    const btns = () => {
      embla.canScrollPrev() ? prev.removeAttribute("disabled") : prev.setAttribute("disabled", "disabled");
      embla.canScrollNext() ? next.removeAttribute("disabled") : next.setAttribute("disabled", "disabled");
    };
    let dots = [];
    const makeDots = () => {
      dotsBox.innerHTML = embla.scrollSnapList().map(() => '<button class="embla__dot" type="button" aria-label="Pick Section"></button>').join("");
      dots = [...dotsBox.querySelectorAll(".embla__dot")];
      dots.forEach((d, i) => d.addEventListener("click", () => embla.scrollTo(i)));
    };
    const pick = () => {
      dots[embla.previousScrollSnap()]?.classList.remove("embla__dot--selected");
      dots[embla.selectedScrollSnap()]?.classList.add("embla__dot--selected");
    };
    makeDots(); pick(); btns();
    embla.on("reInit", makeDots).on("reInit", pick).on("select", pick).on("select", btns).on("reInit", btns);
  }
})();
