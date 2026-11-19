// Home page only: city illustration floating, news card dismiss, logo row flow (Embla). The hero is an autoplay looping video slot like the original.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelector(".hm-hero__close")?.addEventListener("click", (e) => e.currentTarget.parentElement.classList.add("is-closed"));

  // ---------- Flows with the same Embla Carousel + AutoScroll as the original — loop, speed .6, starts immediately, doesn’t stop on touch, runs only while 10% is on screen ----------
  // Two rows of adopting-company logos (the second reversed), and a service logo row on phones only
  const flow = (viewport, opts = {}) => {
    if (!window.EmblaCarousel || !window.EmblaCarouselAutoScroll || reduce) return;
    const embla = EmblaCarousel(viewport, { loop: true }, [EmblaCarouselAutoScroll({ playOnInit: false, speed: 0.6, startDelay: 0, stopOnInteraction: false, ...opts })]);
    new IntersectionObserver(([e]) => { const a = embla.plugins().autoScroll; e.isIntersecting ? a.play() : a.stop(); }, { threshold: 0.1 }).observe(embla.rootNode());
  };
  document.querySelectorAll(".hm-marquee__track").forEach((track, row) => {
    const items = Array.from({ length: 13 }, (_, i) => `<li><span class="wf-logo">Company Logo ${row * 13 + i + 1}</span></li>`).join("");
    track.innerHTML = items + items;
    flow(track.parentElement, { stopOnFocusIn: false, direction: row ? "backward" : "forward" });
  });
  const svc = document.querySelector(".hm-svc__list");
  if (svc) {
    const sp = document.createElement("div");
    sp.className = "hm-svc__sp";
    sp.innerHTML = `<ul>${svc.innerHTML.repeat(2)}</ul>`;
    sp.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
    svc.after(sp);
    if (matchMedia("(max-width: 767px)").matches) flow(sp);
  }

  if (!window.gsap || reduce) return;

  // Original About art values: two pieces bob in sine at y -6 (2.2s) and -10 (1.8s), and the cloud runs x 8 → 14 → 10 → 16 → 0
  gsap.to(".hm-city__car", { y: -6, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".hm-city__bird", { y: -10, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.timeline({ repeat: -1 })
    .to(".hm-city__cloud", { x: 8, duration: 2.4, ease: "sine.inOut" })
    .to(".hm-city__cloud", { x: 14, duration: 2, ease: "sine.inOut" })
    .to(".hm-city__cloud", { x: 10, duration: 1.8, ease: "sine.inOut" })
    .to(".hm-city__cloud", { x: 16, duration: 2.2, ease: "sine.inOut" })
    .to(".hm-city__cloud", { x: 0, y: 0, duration: 3, ease: "sine.inOut" });
})();
