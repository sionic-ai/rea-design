// First page: loads once at first (3.4s — photos start rotating at 2s), and is skipped when the same window returns (.05s, so the head and text delays get set later),
// Hero Splide fade slider (3.5s every 5.5s), three-feature fixed photo (veil · blur scrub 1) and text cards appearing
(() => {
  const root = document.documentElement;
  const KEY = "ku-opening";
  const opening = document.querySelector(".ku-opening");
  const hero = document.querySelector(".ku-hero");

  const slider = () => {
    const el = document.querySelector(".ku-hero .splide");
    if (!el || !window.Splide) return;
    new Splide(el, { type: "fade", autoplay: !ku.reduce, pauseOnFocus: false, rewind: true, interval: 5500, speed: 3500, pauseOnHover: false, pagination: false, arrows: false }).mount();
  };

  const start = () => {
    let first = null;
    try { first = sessionStorage.getItem(KEY); } catch {}
    if (first == null && !ku.reduce) {
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      ku.lenis?.stop();
      root.setAttribute("data-load", "1");
      opening.classList.add("inview");
      setTimeout(slider, 2000);
      setTimeout(() => {
        opening.remove();
        ku.lenis?.start();
        hero.classList.add("inview");
      }, 3400);
    } else {
      setTimeout(() => {
        root.setAttribute("data-load", "1");
        opening?.remove();
        root.classList.add("is-skip");
        ku.flipDelays();
        hero.classList.add("inview");
        slider();
      }, 50);
    }
  };
  ku.afterPaint(start);

  // Three features — pin the photo when the section’s top edge reaches the top of the screen, and hold it until the section’s bottom edge is one more screen above the screen top. Meanwhile the veil (phone only visible) and the blur deepen.
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".ku-feature__section").forEach((sec) => {
      const image = sec.querySelector(".ku-feature__image"), card = sec.querySelector(".ku-featureCard");
      const blur = sec.querySelector(".ku-feature__blur"), overlay = sec.querySelector(".ku-feature__overlay");
      gsap.timeline({ scrollTrigger: { trigger: sec, scrub: 1, pin: image, start: "top 0%", end: "bottom -100%" } })
        .fromTo(overlay, { opacity: 0 }, { opacity: 1 }, "<")
        .to(blur, { opacity: 1, delay: 0.2 });
      gsap.timeline({ scrollTrigger: { trigger: sec, scrub: 1, start: "top top", end: ku.isMobile() ? "bottom 10%" : "bottom 30%" } })
        .fromTo(card, { opacity: 0 }, { opacity: 1 });
    });
  });
})();
