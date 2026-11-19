// Shared across Brand pages — smooth scroll (original Lenis 0.2.28 · duration 1.2 · exponential curve), language switch strip, cookie box
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), direction: "vertical", gestureDirection: "vertical", smooth: true, mouseMultiplier: 1, smoothTouch: false, touchMultiplier: 2, infinite: false });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); window.lenis = null; };
  });

  // Language switch — original IX3 t-7e75c525: thin strip .49s, twelve strip cells 0→100vh (.64s, total stagger .5), right thin strip from .6s for .4s · power4.out · switches after 1 second
  const leave = document.querySelector(".cw-leave");
  document.querySelectorAll("[data-leave]").forEach((a) => a.addEventListener("click", (e) => {
    if (!leave) return;
    e.preventDefault();
    const href = a.getAttribute("href");
    const stripes = [...leave.children];
    const first = stripes[0], last = stripes[stripes.length - 1], mid = stripes.slice(1, -1);
    if (reduce) { location.href = href; return; }
    gsap.timeline()
      .to(first, { height: "100vh", duration: .49, ease: "power4.out" }, .01)
      .to(mid, { height: "100vh", duration: .64, ease: "power4.out", stagger: { amount: .5 } }, .01)
      .to(last, { height: "100vh", duration: .4, ease: "power4.out" }, .6);
    setTimeout(() => { location.href = href; }, 1000);
  }));

  // Header text color — bright if the section below the header is a green or ink surface, green if it is light paper (the original changes header color per section)
  const nav = document.querySelector(".cw-nav");
  if (nav) {
    let raf = 0;
    const tone = () => {
      raf = 0;
      const y = nav.getBoundingClientRect().bottom * .6;
      const under = document.elementsFromPoint(innerWidth * .5, y).find((n) => !nav.contains(n));
      nav.classList.toggle("is-on-dark", !!under?.closest(".cw-green, .cw-dark"));
    };
    addEventListener("scroll", () => { raf ||= requestAnimationFrame(tone); }, { passive: true });
    addEventListener("resize", tone);
    tone();
  }

  // Cookie box — choosing closes it, ”Choose” opens the item rows
  const cookie = document.querySelector("[data-cookie]");
  if (cookie) {
    cookie.addEventListener("click", (e) => {
      if (e.target.closest("[data-cookie-close]")) cookie.classList.add("is-gone");
      else if (e.target.closest("[data-cookie-more]")) cookie.querySelector("[data-cookie-opts]").classList.toggle("is-open");
    });
  }
})();
