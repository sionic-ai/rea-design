// Home — hero and vertical text section wipe photos, hero text attach (pc), stay mode (clouds · back photo scroll, self-flowing bands, blurred circle cursor)
(() => {
  const { reduce, wipe } = window.snSite;
  wipe(document.querySelector(".sn-fv__splide"));
  wipe(document.querySelector(".sn-slidetext__splide"));

  // Hero news text: sticks from when the board’s bottom edge touches the screen bottom until the hero ends
  gsap.matchMedia().add("(min-width: 769px)", () => {
    ScrollTrigger.create({ trigger: ".sn-fv__item", start: "bottom bottom", endTrigger: ".sn-fv", end: "bottom bottom", pin: true, pinSpacing: false });
  });

  // How it lingers
  const box = document.querySelector(".sn-howto");
  if (box) {
    const strip = box.querySelector(".sn-howto__splide");
    if (strip && window.Splide) new Splide(strip, { type: "loop", arrows: false, pagination: false, autoWidth: true, drag: "free", focus: "center", autoScroll: { speed: 1, autoStart: !reduce, pauseOnHover: false }, breakpoints: { 768: { autoScroll: { speed: 0.5, autoStart: !reduce } } } }).mount(window.splide?.Extensions || {});
    // Blur circle: follows the cursor over the strip at .3s power2.out, switches on at .5→1 scale when entering and shrinks and switches off when leaving
    const slides = box.querySelector(".sn-howto__slides"), stalker = box.querySelector(".sn-stalker");
    if (slides && stalker && matchMedia("(hover: hover)").matches) {
      gsap.set(stalker, { opacity: 0, scale: 0.5, x: -50, y: -50 });
      slides.addEventListener("mousemove", (e) => { const r = slides.getBoundingClientRect(); gsap.to(stalker, { x: e.clientX - r.left, y: e.clientY - r.top, duration: 0.3, ease: "power2.out" }); });
      slides.addEventListener("mouseenter", () => gsap.to(stalker, { opacity: 1, scale: 1, duration: 0.3, ease: "power1.out" }));
      slides.addEventListener("mouseleave", () => gsap.to(stalker, { opacity: 0, scale: 0.5, duration: 0.3, ease: "power1.in" }));
    }
    // Clouds: darken only while scrolling (1s), and .3s after stopping they fade in 3s. Back photo −20% · clouds −30% are tied to progress and a css transition of 6s trails behind.
    const cloud = box.querySelector(".sn-howto__cloud");
    gsap.matchMedia().add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
      let on = false, t = 0;
      const wake = () => { if (!on) { on = true; cloud.classList.add("is-visible"); } clearTimeout(t); t = setTimeout(() => { on = false; cloud.classList.remove("is-visible"); }, 300); };
      addEventListener("scroll", wake, { passive: true });
      const st = ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", scrub: true, onUpdate: (s) => { box.style.setProperty("--scroll-x-image", `${s.progress * -20}%`); box.style.setProperty("--scroll-x-cloud", `${s.progress * -30}%`); } });
      return () => { removeEventListener("scroll", wake); clearTimeout(t); st.kill(); };
    });
  }
})();
