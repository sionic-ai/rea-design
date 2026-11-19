// First page motion. Values read from the original bundle as is (curve power4 is the gsap Power4 the original uses).
(() => {
  const { flock, flaps, playCols } = WB;
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  flock();
  flaps();

  // The original, for each bird, starts 80% before the previous one ends (-=Applied at 80%) — the first bird has a 1s delay, so it shows up at .4s.
  // Times at which the overlap is released: .4 · .55 · .7 · .85 · 1.0 · 1.15 (six creatures on desktop), the button 50% before the end, vertical text after the button has fully settled.
  const rise = (tl, els, first) => {
    let end = 0;
    els.forEach((el, i) => {
      const at = i === 0 ? first : end - 0.75 * 0.8;
      tl.fromTo(el, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.75, ease: "power4.inOut" }, at);
      end = at + 0.75;
    });
    return end;
  };

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { pc, reduce: rm } = ctx.conditions;
    const coverBirds = [1, 2, 3, 6, 4, 5].map((n) => $(`.wb-cover__b${n}`)).filter((el) => el && (pc || !el.classList.contains("wb-pc")));
    const btn = $(".wb-cover__btn");
    const verse = $(".wb-cover__verse");

    if (rm) {
      gsap.set([...coverBirds, btn, ...$$(".wb-verse__stage .wb-bird")], { opacity: 1, y: 0 });
      playCols(verse); playCols($(".wb-verse__all"));
      return;
    }

    // Hero — runs once on load (the original starts after Next attaches the page, so it is that much later — meta gaps)
    const cover = gsap.timeline();
    const end = rise(cover, coverBirds, 0.4);
    cover.fromTo(btn, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.5, ease: "power1.out", onComplete: () => playCols(verse) }, end - 0.25);

    // White section — when the section head touches 25% of the screen, a flock of birds appears (.75s default curve, each starting at the 20% point of the previous one), and with the last bird the vertical text opens
    const aboutBirds = [0, 1, 2, 5, 3, 4].map((n) => $(`.wb-about__b${n}`));
    const about = gsap.timeline({ scrollTrigger: { trigger: "#about", start: "top 25%", end: "bottom bottom", toggleActions: "play none none none" } });
    aboutBirds.forEach((el, i) => {
      const last = i === aboutBirds.length - 1;
      about.fromTo(el, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.75, onStart: last && pc ? () => playCols($(".wb-verse__all")) : undefined }, i * 0.15);
    });

    if (pc) {
      // Three circle-pinned scenes — original timeline as is (the length and curve written in the first slot of fromTo aren’t read by GSAP, so it becomes .5s power1.out)
      const steps = $(".wb-steps"), disc = $(".wb-disc--pin"), v = $$("video", disc);
      const [surface, accent, bg, deep] = ["--kf-surface", "--kf-accent", "--kf-bg", "--site-accent-deep"].map(WB.css);
      const d = { duration: 0.5, ease: "power1.out" };
      gsap.timeline({ scrollTrigger: { trigger: steps, start: "top top", end: "bottom bottom", scrub: true, pin: disc, pinSpacing: false } })
        .fromTo(steps, { backgroundColor: surface }, { backgroundColor: accent, ...d }, 3)
        .fromTo(disc, { backgroundColor: bg }, { backgroundColor: deep, ...d }, 3)
        .fromTo(v[0], { opacity: 1 }, { opacity: 0, ...d }, 0.5)
        .fromTo(v[1], { opacity: 0 }, { opacity: 1, ...d }, "<")
        .fromTo(v[2], { opacity: 0 }, { opacity: 1, ...d }, 1.5)
        .fromTo(v[1], { opacity: 1 }, { opacity: 0, ...d }, "<")
        .fromTo($(".wb-disc__guide", disc), { opacity: 0 }, { opacity: 1, ...d }, 3)
        .fromTo(v[2], { opacity: 1 }, { opacity: 0, ...d }, "<");
    } else {
      // Phone — attach a new stage and three chunks of text pass through. The first disappears at progress .2→.4, the second at .65→.85.
      const parts = $$(".wb-verse__part p");
      ScrollTrigger.create({
        trigger: ".wb-verse__words", start: "top top", end: "bottom bottom", pin: ".wb-verse__stage", pinSpacing: false,
        onUpdate: (st) => {
          const p = st.progress;
          gsap.set(parts[0], { opacity: 1 - (Math.max(p, 0.2) - 0.2) * 5 });
          gsap.set(parts[1], { opacity: 1 - (Math.max(p, 0.65) - 0.65) * 5 });
        },
      });
    }
  });

  // Book-band slider — original Swiper settings, unchanged
  const now = $(".wb-pager__now");
  const swiper = new Swiper(".wb-banners__swiper", {
    slidesPerView: "auto",
    spaceBetween: 0,
    freeMode: { momentumRatio: 0.3, sticky: false },
    breakpoints: { 768: { spaceBetween: 90, freeMode: false, centeredSlides: true } },
    on: { slideChange: (s) => { now.textContent = s.activeIndex + 1; } },
  });
  $(".wb-arrow--left").addEventListener("click", () => swiper.slidePrev());
  $(".wb-arrow--right").addEventListener("click", () => swiper.slideNext());

  // Phone question — tapping + opens the answer immediately and the + disappears
  $$(".wb-plus").forEach((b) => b.addEventListener("click", () => {
    b.closest("tr").lastElementChild.classList.add("is-open");
    b.remove();
  }));
})();
