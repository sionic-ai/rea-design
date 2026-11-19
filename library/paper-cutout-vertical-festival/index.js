// First page: splash schedule → big ink text and logo appear, hero fades, program pinned scene, image after learning the region, video loop slider.
// Original values: splash waits 4s → leaves 6s steps(10) · box scales up 7s → after 2.5s a 1s fade → rest 1s, then big text 1s → over 5s to 1x (-=2) → Logo 1.5s(-=2)
// Program pinned +=200% · big text 1 at y-80 · head sentence 2 at y20→0 · slider size 1-|distance|×0.2×count.
(() => {
  const { reduced } = SD;
  const $ = (s) => document.querySelector(s);
  const mm = gsap.matchMedia();
  const splash = $(".sd-splash");
  const box = $(".sd-splash__box");
  const burger = $(".sd-burger");

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lock = (v) => (document.documentElement.style.overflow = v ? "hidden" : "");
    addEventListener("load", () => requestAnimationFrame(() => scrollTo(0, 0)));
    lock(true);
    splash.querySelectorAll("[data-direction]").forEach((el) => el.classList.add("is-run"));
    gsap.timeline()
      .to({}, { duration: 4 })
      .call(() => [box, $(".sd-splash__left"), $(".sd-splash__right")].forEach((el) => el.classList.add("is-active")))
      .to({}, { duration: 2.5 })
      .call(() => box.classList.add("is-none"))
      .to({}, { duration: 1 })
      .to(".sd-mv__image", { opacity: 1, duration: 1, transformOrigin: "top" })
      .to(".sd-mv__image", { scale: 1, opacity: 1, duration: 5, transformOrigin: "top" }, "-=2")
      .to(".sd-mv__logo", { filter: "blur(0px)", opacity: 1, duration: 1.5 }, "-=2")
      .call(() => { lock(false); splash.classList.add("is-none"); });

    gsap.to(".sd-mv__visual", { opacity: 0, filter: "blur(10px)", ease: "none", scrollTrigger: { trigger: ".sd-mv", start: "top top", end: "bottom center", scrub: true } });

    // The big-letter header hangs at the section’s top edge, and while the section moves from screen center to the top it descends 50% of its own height and stands at the center (original header y 50%)
    gsap.to(".sd-program__header", { y: "50%", ease: "none", scrollTrigger: { trigger: ".sd-program__header", start: "center center", end: "bottom center", scrub: true } });
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".sd-program", start: "top top", end: "+=200%", pin: true, scrub: true } });
    tl.to({}, { duration: 1 })
      .to(".sd-program__heading", { opacity: 0, y: -80, duration: 1 }, 1)
      .fromTo(".sd-program__lead", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 2);

    gsap.fromTo(".sd-know__bg", { opacity: 0, y: 50, filter: "blur(10px)" }, { opacity: 1, y: -50, filter: "blur(0px)", ease: "none", scrollTrigger: { trigger: ".sd-know", start: "top center", end: "bottom top", scrub: true } });
  });

  // The menu button appears only after scrolling at least a step down from the hero, and hides when back at the top
  ScrollTrigger.create({
    start: 1,
    end: "max",
    onEnter: () => gsap.to(burger, { opacity: 1 }),
    onLeaveBack: () => gsap.to(burger, { opacity: 0 }),
  });
  if (reduced) gsap.set(burger, { opacity: 1 });

  // Video loop slider (original Embla 8 · loop · classNames plugin is-snapped): the settled slide has top margin 0 (.4s), and each slide shrinks by how far it is from the selection (0.2 × slide count, Embla tween-scale)
  const root = $(".sd-carousel");
  const embla = EmblaCarousel(root.querySelector(".sd-carousel__viewport"), { loop: true }, [EmblaCarouselClassNames()]);
  let cards = [], factor = 0;
  const setCards = () => { cards = embla.slideNodes().map((s) => s.querySelector(".sd-video")); };
  const setFactor = () => { factor = 0.2 * embla.scrollSnapList().length; };
  const tween = (api, ev) => {
    const engine = embla.internalEngine(), progress = embla.scrollProgress(), inView = embla.slidesInView();
    embla.scrollSnapList().forEach((snap, i) => {
      let diff = snap - progress;
      engine.slideRegistry[i].forEach((si) => {
        if (ev === "scroll" && !inView.includes(si)) return;
        if (engine.options.loop) engine.slideLooper.loopPoints.forEach((lp) => {
          const tg = lp.target();
          if (si !== lp.index || tg === 0) return;
          if (Math.sign(tg) === -1) diff = snap - (1 + progress);
          if (Math.sign(tg) === 1) diff = snap + (1 - progress);
        });
        cards[si].style.transform = `scale(${Math.min(Math.max(1 - Math.abs(diff * factor), 0), 1)})`;
      });
    });
  };
  setCards(); setFactor(); tween(embla);
  embla.on("reInit", setCards).on("reInit", setFactor).on("reInit", tween).on("scroll", tween).on("slideFocus", tween);
  root.querySelector(".sd-carousel__prev").addEventListener("click", () => embla.scrollPrev());
  root.querySelector(".sd-carousel__next").addEventListener("click", () => embla.scrollNext());
  const dots = root.querySelector(".sd-carousel__dots");
  const drawDots = () => {
    dots.innerHTML = embla.scrollSnapList().map((_, i) => `<button type="button" aria-label="${i + 1}Video No."></button>`).join("");
    [...dots.children].forEach((b, i) => b.addEventListener("click", () => embla.scrollTo(i)));
  };
  const markDots = () => [...dots.children].forEach((b, i) => b.classList.toggle("is-selected", i === embla.selectedScrollSnap()));
  drawDots(); markDots();
  embla.on("reInit", drawDots).on("reInit", markDots).on("select", markDots);

  // Video slot: the original is a YouTube embed so clicking plays it in place — swap in a placeholder video of the same ratio and play it (a click after a drag is blocked by Embla)
  root.querySelectorAll(".sd-video__player").forEach((b) => b.addEventListener("click", () => {
    const v = document.createElement("video");
    Object.assign(v, { src: b.dataset.src, controls: true, autoplay: true, playsInline: true, className: "sd-video__media" });
    b.replaceWith(v);
  }));

  // Route map for the way there: on phones, the horizontally scrolling cell shows a ScrollHint finger prompt like the original (1.2s, twice)
  new ScrollHint(".js-scrollable", { applyToParents: true, i18n: { scrollable: "You can swipe sideways" } });
})();
