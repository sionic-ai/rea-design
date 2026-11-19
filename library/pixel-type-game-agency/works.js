// Work detail motion: two-line header entrance and lime stair-step drawing, key-point paging, photo unfolding, character panel tilt.
(() => {
  const { reduce, isDesk, onReady, stairs } = window.M1;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const draw = () => {
    stairs($(".ch-trail"), { cell: 44, thick: 5, slope: 0.5, start: 0.95, seed: 11 });
    stairs($(".st-stairs"), { cell: isDesk() ? 80 : 40, thick: 3, slope: 0.4, start: 1.05, seed: 5 });
  };
  draw();

  // ── Key point switch: outgoing line goes up −100%, incoming line comes from 70% below at .1 intervals ──
  const slides = $$(".st-slide"), dots = $$(".st-dots i"), num = $(".st-num");
  let cur = 0;
  const go = (n) => {
    n = (n + slides.length) % slides.length;
    if (n === cur) return;
    const out = slides[cur], inn = slides[n];
    cur = n;
    dots.forEach((d, i) => d.classList.toggle("is-on", i === n));
    num.firstChild.textContent = String(n + 1).padStart(2, "0") + " ";
    // In the original the plate color changes at each key point (deep purple → lime → purple)
    $(".st-card").dataset.tone = inn.dataset.tone;
    if (reduce) { out.classList.remove("is-on"); inn.classList.add("is-on"); return; }
    gsap.timeline()
      .to(out.children, { yPercent: -100, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: "power2.inOut" })
      .add(() => { out.classList.remove("is-on"); gsap.set(out.children, { clearProps: "all" }); inn.classList.add("is-on"); })
      .from(inn.children, { yPercent: 70, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: "power2.inOut" }, "-=0.15");
  };
  $(".st-next").addEventListener("click", () => go(cur + 1));
  $(".st-prev").addEventListener("click", () => go(cur - 1));
  dots.forEach((d, i) => d.addEventListener("click", () => go(i)));

  if (reduce) return;

  // ── Header entrance: two lines grow from 0.1x and letters enter alternating up and down. The lime steps light up cell by cell from the left ──
  const s1 = SplitText.create(".ch-l1", { type: "chars" }), s2 = SplitText.create(".ch-l2", { type: "chars" });
  const enter = gsap.timeline({ paused: true })
    .from(".ch-l1", { scale: 0.1, duration: 1, ease: "smooth" })
    .from(s1.chars, { y: (i) => (i % 2 ? "100%" : "-100%"), duration: 0.7, ease: "slowDown", stagger: { each: 0.03, from: "random" } }, "<")
    .from(".ch-l2", { scale: 0.1, duration: 1, ease: "smooth" }, "<")
    .from(s2.chars, { y: (i) => (i % 2 ? "100%" : "-100%"), duration: 0.7, ease: "slowDown", stagger: { each: 0.03, from: "random" } }, "<")
    .from($$(".ch-trail rect"), { autoAlpha: 0, duration: 0.01, stagger: { amount: 1, ease: "power1.out" } }, "<")
    .from(".ch-body", { yPercent: 30, autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, "<0.4")
    .from(".ch-arrow", { autoAlpha: 0, stagger: 0.1, duration: 0.3 }, "<");
  onReady(() => enter.play());

  const mm = gsap.matchMedia();
  mm.add({ desk: "(min-width: 1024px)", mob: "(max-width: 1023px)" }, (ctx) => {
    const { desk } = ctx.conditions;

    // Wide photos open a cut face from left to right (original clipPath inset 1s)
    gsap.utils.toArray(".ch-media, .g-wide").forEach((el) => gsap.fromTo(el, { clipPath: "inset(0 100% 0 0 round 16px)" }, { clipPath: "inset(0 0% 0 0 round 16px)", duration: 1, ease: "power2.inOut", scrollTrigger: { trigger: el, start: "top bottom-=100px" } }));

    // Expansion: the tilted photo grows to screen width, and the two words move outward (scrub .5)
    const xp = $(".xp");
    gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: xp, start: "top bottom", end: "center center", scrub: 0.5 } })
      .fromTo(".xp-media", { width: desk ? "34vw" : "70vw", rotate: -8, borderRadius: 24 }, { width: () => innerWidth - 32 + "px", rotate: 0, borderRadius: 16 })
      .to(".xp-l", { x: () => -innerWidth * 0.12 }, 0)
      .to(".xp-r", { x: () => innerWidth * 0.12 }, 0);
    gsap.from(".xp-deco i", { opacity: 0, stagger: { each: 0.05, from: "random" }, duration: 0.3, scrollTrigger: { trigger: xp, start: "center center", toggleActions: "none play reverse none" } });

    // Behind the character slab, a lime plane tilts 4° and rises 10px
    gsap.to(".chr-bg", { rotate: 4, y: -10, ease: "none", scrollTrigger: { trigger: ".chr", start: "top bottom-=100px", end: "center center", scrub: 0.5 } });

    // The next case card rises more tilted and settles at −10°
    gsap.from(".next-card", { rotate: -12, yPercent: 30, ease: "power2.out", scrollTrigger: { trigger: ".next", start: "top bottom", end: "center center", scrub: 0.5 } });
    gsap.from(".next-tab", { yPercent: 60, ease: "power2.out", scrollTrigger: { trigger: ".next", start: "top bottom", end: "bottom bottom", scrub: 0.5 } });
  });
})();
