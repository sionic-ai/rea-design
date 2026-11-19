// First page: wordmark rises from 140% and skewY 8 after 1.6s over 2s expo.out, and the photo goes 1.2 → 1 after .8s (2.8s),
// On scroll the wordmark moves up (scrub 0) and the photo moves down 80px (scrub 1), the MEMORIES heading is pushed up 120px then fades to .2 when the cards touch,
// The More band flows one set per 40s, and News is a Splide of three slides (two at 767 and below, one at 80% width at 575 and below)
(() => {
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const hero = document.querySelector(".ws-hero");
    const mark = hero?.querySelector(".ws-hero__mark");
    const image = hero?.querySelector(".ws-hero__image");
    const title = hero?.querySelector(".ws-hero__title");
    if (mark) gsap.fromTo(mark, { yPercent: 140, skewY: 8 }, { yPercent: 0, skewY: 0, duration: 2, delay: 1.6, ease: "expo.out" });
    if (image) gsap.fromTo(image, { scale: 1.2 }, { scale: 1, duration: 2.8, delay: 0.8, ease: "expo.out" });
    if (title) gsap.to(title, { yPercent: -100, autoAlpha: 0, ease: "expo.out", scrollTrigger: { trigger: hero, start: "top top", scrub: 0 } });
    if (image) gsap.to(image, { y: 80, scrollTrigger: { trigger: hero, start: "top top", scrub: 1 } });

    const mem = document.querySelector(".ws-memories");
    const head = mem?.querySelector(".ws-memories__head");
    const content = mem?.querySelector(".ws-memories__content");
    // Measure the length stretched by the video window pin above (which the part builds later) first so positions line up — otherwise −120 applies before reaching the section and the header covered the top button
    if (head && content) {
      gsap.to(head, { y: -120, scrollTrigger: { trigger: mem, start: "top top", end: "bottom bottom", scrub: 0, refreshPriority: -1 } });
      gsap.to(head, { opacity: 0.2, duration: 0.8, scrollTrigger: { trigger: content, start: "top top", toggleActions: "play none none reverse", refreshPriority: -1 } });
    }

    // The More strip text rotation is the original hover_animation done as-is in GSAP — the text is split into two copies with the next one placed 300% below, and on hover (on touch for fingers)
    // Current text goes to −105% and transparent over .6s (original ease name "expo.inout" is not in GSAP so the default power1.out is used), the next text enters at 105% in .4s.
    // If built as a text-spin part (CSS animation), it settles later than the underline transition, so a motion different from the original gets measured as the representative one
    const linkhover = CustomEase.create("ws-linkhover", ".115,.405,.24,1");
    document.querySelectorAll(".ws-roll-link").forEach((a) => {
      a.querySelectorAll(".ws-roll-link__str").forEach((s) => {
        const text = s.textContent;
        s.replaceChildren(...["cur", "next"].map((k) => { const e = document.createElement("span"); e.className = `ws-roll-link__${k}`; e.setAttribute("aria-hidden", "true"); e.textContent = text; return e; }));
      });
      gsap.set(a.querySelectorAll(".ws-roll-link__next"), { position: "absolute", top: 0, left: 0, transform: "translateY(300%)" });
      const roll = () => {
        gsap.fromTo(a.querySelectorAll(".ws-roll-link__cur"), { y: "0%", opacity: 1 }, { y: "-105%", opacity: 0, duration: 0.6, ease: "power1.out" });
        gsap.fromTo(a.querySelectorAll(".ws-roll-link__next"), { y: "105%" }, { y: "0%", duration: 0.4, ease: linkhover });
      };
      a.addEventListener("mouseenter", roll);
      a.addEventListener("touchstart", roll, { passive: true });
    });

    // Original roll() — clone one set and place it beside, moving both at xPercent −100 endlessly (linear) over duration. Text in the cloned set moves too
    document.querySelectorAll("[data-roll]").forEach((set) => {
      const copy = set.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.removeAttribute("data-roll");
      set.after(copy);
      gsap.to([set, copy], { xPercent: -100, duration: +set.dataset.roll || 40, ease: "none", repeat: -1 });
    });
  });

  const slider = document.querySelector(".ws-news__slider");
  if (slider && window.Splide) {
    new Splide(slider, { type: "slide", perPage: 3, arrows: false, pagination: false, gap: 20, breakpoints: { 767: { perPage: 2 }, 575: { perPage: 1, fixedWidth: "80%" } } }).mount();
  }
})();
