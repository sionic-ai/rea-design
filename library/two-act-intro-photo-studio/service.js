// Service: in the left sequence only the third line (Flow) is bold, the photo slider is Splide (85% width, gap 10, 1s, autoplay),
// The FAQ uses height auto with .3s expo.out (re-measure ScrollTrigger after closing).
(() => {
  // The original index ScrollTrigger grabs #sec01~03, which are not on the page, so all three light up on load and only the last (third line) remains — scrolling doesn’t change it
  document.querySelectorAll(".ws-svc-nav__link")[2]?.classList.add("is-active");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Splide) {
    document.querySelectorAll(".ws-svc-slider").forEach((s) => new Splide(s, { type: "slide", speed: reduce ? 0 : 1000, fixedWidth: "85%", gap: 10, autoplay: !reduce, pagination: false }).mount());
  }

  document.querySelectorAll("[data-accordion-details]").forEach((d) => {
    const q = d.querySelector("[data-accordion-summary]");
    const a = d.querySelector("[data-accordion-content]");
    if (!q || !a) return;
    q.addEventListener("click", (e) => {
      e.preventDefault();
      const dur = reduce ? 0 : 0.3;
      if (d.hasAttribute("open")) {
        q.classList.remove("is-active");
        gsap.to(a, { height: 0, duration: dur, ease: "expo.out", onComplete: () => { d.removeAttribute("open"); ScrollTrigger.refresh(); } });
      } else {
        q.classList.add("is-active");
        d.setAttribute("open", "");
        gsap.fromTo(a, { height: 0 }, { height: "auto", duration: dur, ease: "expo.out" });
      }
    });
  });
})();
