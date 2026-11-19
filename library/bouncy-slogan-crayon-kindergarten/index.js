// First page: first entrance (photo zoom release · header · info panel · tagline letter bounce · doodle), two Swiper photo crossfades · three draggable card rows, info panel fold, Heart of the Circle paragraph · dotted line reveal.
// Original values: the first entrance all starts together at 0s (delay .2) — photo opacity·scale 2s power4.out · header y·autoAlpha .5s power1.out ·
// Slogan letters opacity .5s + y 1.8s elastic.out(1, 0.3) stagger .06 · doodle .7s. Phone uses delays of 1.8s/.4s/.15.
// Info panel fold x 340px .3s / unfold .4s power1.out.
(() => {
  const { mm, isPC, split, logo } = window.MK;
  const book = document.querySelector(".guide__top");
  if (book) book.innerHTML = logo();

  const hero = document.querySelector(".mv-home");
  const image = hero.querySelector(".mv-home__image");
  const tane = hero.querySelectorAll(".mv-home__tane .crayon");
  const heading = hero.querySelector(".mv-home__heading");
  const chars = split(heading.querySelector("h1"));
  const info = hero.querySelector(".mv-home__info");
  const infoCard = hero.querySelector(".mv-home__card");
  const headEls = document.querySelectorAll(".hd__main, .hd__burger");

  mm.add({ pc: "(min-width: 769px)", sp: "(max-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { pc, reduce } = ctx.conditions;
    if (reduce) {
      gsap.set([image, heading, chars, tane, headEls], { opacity: 1, scale: 1, y: 0 });
      gsap.set(pc ? info : infoCard, { autoAlpha: 1, right: 0, y: 0 });
      return;
    }
    gsap.set(headEls, { y: "-2rem", autoAlpha: 0 });
    const d = pc ? 0.2 : 0.15;
    const short = pc ? 0.5 : 0.4;
    const tl = gsap.timeline();
    tl.to(image, { opacity: 1, scale: 1, duration: pc ? 2 : 1.8, ease: "power4.out" }, 0)
      .to(headEls, { y: "0rem", autoAlpha: 1, duration: short, delay: d, ease: "power1.out" }, 0)
      .to(pc ? info : infoCard, pc ? { right: "0rem", autoAlpha: 1, duration: short, delay: d, ease: "power1.out" } : { y: "0rem", autoAlpha: 1, duration: short, delay: d, ease: "power1.out" }, 0)
      .to(heading, { opacity: 1, y: "0rem", duration: short, delay: d, ease: "power1.out" }, 0)
      .to(chars, { opacity: 1, duration: short, stagger: 0.06, delay: d, ease: "power1.out" }, 0)
      .to(chars, { y: "0rem", duration: 1.8, stagger: 0.06, delay: d, ease: "elastic.out(1, 0.3)" }, 0)
      .to(tane, { opacity: 1, duration: pc ? 0.7 : 0.6, delay: d, ease: "power1.out" }, 0);
    return () => gsap.set([image, heading, chars, tane, headEls, info, infoCard], { clearProps: "all" });
  });

  // Photo slider and card rows use Swiper 11.2 like the original — crossfade · autoplay · drag inertia keep the original feel.
  // Speed is set once by the width at creation, as in the original (hero 2s/phone 1s, about 1.8s/.9s · interval 5s).
  const pc = isPC();
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fade = { effect: "fade", fadeEffect: { crossFade: true }, loop: true, slidesPerView: 1, grabCursor: true, autoplay: still ? false : { delay: 5000 } };
  new Swiper(".mv-home__slides", { ...fade, speed: pc ? 2000 : 1000 });
  new Swiper(".intro__oval", { ...fade, pagination: { el: ".intro__dots", clickable: true }, speed: pc ? 1800 : 900 });

  // Only on phone (info cards, news cards) and below 1200px (newsletter) it becomes a drag-swipe row, released when wider
  const row = (sel, query) => {
    const mq = matchMedia(query);
    let sw = null;
    const sync = () => {
      if (mq.matches && !sw) sw = new Swiper(sel, { loop: false, slidesPerView: "auto", initialSlide: 0, touchRatio: 1, grabCursor: true });
      else if (!mq.matches && sw) { sw.destroy(); sw = null; }
    };
    sync();
    mq.addEventListener("change", sync);
  };
  row(".mv-home__infobody .swiper", "(max-width: 768px)");
  row(".news__swiper", "(max-width: 768px)");
  row(".letter__swiper", "(max-width: 1200px)");

  // Collapse the info panel (PC) — leaves only the tab and pushes 340px to the right
  const fold = hero.querySelector(".mv-home__fold");
  let shown = true;
  fold.addEventListener("click", () => {
    shown = !shown;
    gsap.to(info, { x: shown ? "0px" : "340px", duration: shown ? 0.4 : 0.3, ease: "power1.out" });
    fold.setAttribute("aria-expanded", String(shown));
  });

  // Heart of the circle: paragraphs and dotted lines appear in turn at the 80% screen point
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".message__body > p.t-med").forEach((p) =>
      ScrollTrigger.create({ trigger: p, start: "top 80%", once: true, onEnter: () => gsap.to(p, { opacity: 1, duration: 1, ease: "power1.out" }) })
    );
    document.querySelectorAll(".message__body .hr").forEach((hr) =>
      ScrollTrigger.create({ trigger: hr, start: "top 80%", once: true, onEnter: () => gsap.to(hr, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power1.out" }) })
    );
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".message__body > p.t-med", { opacity: 1 });
    gsap.set(".message__body .hr", { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" });
  });
})();
