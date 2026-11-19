// First page: Hero entrance (original site-builder IX3 load timeline) and question collapse. Pinning and scroll motion are handled by the parts (slot-fill-pin·pin-dial-list·sticky-grow-stack·pin-horizontal·pin-swing-pass).
(() => {
  const { reduce } = window.RV;
  const hero = document.querySelector(".rv-hero");
  const nav = document.querySelector(".rv-nav");

  // Hero — plate .25s (.2) → title words rise from 50% below 1s power4.out .07 apart (.44) → video scales 0→1 1s power1.out (1.45)·header line −50px (1.46) → sides·partners (2.45)
  if (hero && !reduce) {
    const box = hero.querySelector(".rv-hero__box"), title = hero.querySelector(".rv-hero__title");
    const media = hero.querySelector(".rv-hero__media"), left = hero.querySelector(".rv-hero__left");
    const right = hero.querySelector(".rv-hero__right"), partners = hero.querySelector(".rv-partners");
    const split = window.SplitText ? new SplitText(title, { type: "words" }) : null;
    const words = split ? split.words : [title];
    const mm = gsap.matchMedia();
    mm.add({ desk: "(min-width: 992px)", phone: "(max-width: 991px)" }, ({ conditions: { desk } }) => {
      const tl = gsap.timeline();
      gsap.set(title, { opacity: 1 });
      tl.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.2)
        .from(words, { opacity: 0, yPercent: 50, duration: 1, stagger: 0.07, ease: "power4.out", immediateRender: true }, desk ? 0.44 : 0.45)
        .fromTo(media, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "power1.out" }, desk ? 1.45 : 1.78);
      if (nav) tl.fromTo(nav, desk ? { opacity: 0, y: -50 } : { opacity: 0, yPercent: -30 }, { opacity: 1, y: 0, yPercent: 0, duration: 1, ease: "power1.out", clearProps: "transform" }, desk ? 1.46 : 1.45);
      if (desk) {
        tl.fromTo(left, { opacity: 0, xPercent: -50 }, { opacity: 1, xPercent: 0, duration: 0.5, ease: "power1.out" }, 2.45)
          .fromTo(right, { opacity: 0, xPercent: 50 }, { opacity: 1, xPercent: 0, duration: 0.5, ease: "power1.out" }, 2.45);
      } else {
        tl.fromTo(right, { opacity: 0, y: "50%" }, { opacity: 1, y: 0, duration: 0.5, ease: "power1.out" }, 1.44);
        gsap.set(left, { opacity: 1 });
      }
      tl.fromTo(partners, { opacity: 0, yPercent: 50 }, { opacity: 1, yPercent: 0, duration: 0.5, ease: "power1.out" }, desk ? 2.45 : 2.49);
      return () => tl.progress(1).kill();
    });
  }

  // Question collapse — site-builder dropdown: height 0 ↔ auto .4s ease, circle −45°
  document.querySelectorAll(".rv-faq__item").forEach((item) => {
    const q = item.querySelector(".rv-faq__q"), a = item.querySelector(".rv-faq__a");
    q.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      q.setAttribute("aria-expanded", open);
      gsap.to(a, { height: open ? "auto" : 0, duration: reduce ? 0 : 0.4, ease: "power1.inOut", overwrite: true, onComplete: () => ScrollTrigger.refresh() });
    });
  });

  window.RV.ready();
})();
