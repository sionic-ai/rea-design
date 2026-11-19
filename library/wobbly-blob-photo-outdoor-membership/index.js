// First page only: hero photo scroll flow and darkening, moss band flow, notice band, product row page count.
// The photo flow uses the original values — from a cell entering at the bottom of the screen to leaving at the top, −60% → −40% (photo scaled 1.2x), and in the hero opacity 2 → .2
addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // On open the first slide brightens from black in 3s (the original flickity adds is-selected with an opacity 3s transition)
    const first = document.querySelector(".hk-hero__slide");
    if (first) gsap.fromTo(first, { opacity: 0 }, { opacity: 1, duration: 3, ease: CustomEase.create("hkCssEase", "0.25,0.1,0.25,1") });

    document.querySelectorAll(".hk-hero__par").forEach((box) => {
      const ph = box.querySelector(".hk-ph");
      gsap.set(ph, { y: 0, yPercent: -50, scale: 1.2 });
      gsap.fromTo(ph, { yPercent: -60, opacity: 2 }, { yPercent: -40, opacity: 0.2, ease: "none", scrollTrigger: { trigger: box, scrub: true } });
    });
    document.querySelectorAll(".hk-bleed").forEach((box) => {
      const ph = box.querySelector(".hk-ph");
      gsap.set(ph, { y: 0, yPercent: -50, scale: 1.2 });
      gsap.fromTo(ph, { yPercent: -60 }, { yPercent: -40, ease: "none", scrollTrigger: { trigger: box, scrub: true } });
    });
  });

  // Notice bar: floats up from 16px below in .35s, and when closed it goes down the same path and disappears, then doesn’t show again for a day
  const notice = document.querySelector(".hk-notice");
  if (notice) {
    const until = localStorage.getItem("hk-notice-closed");
    if (!until || new Date() >= new Date(until)) {
      gsap.set(notice, { display: "block", autoAlpha: 0, y: 16 });
      gsap.to(notice, { duration: 0.35, autoAlpha: 1, y: 0, ease: "power2.out" });
      notice.querySelector(".hk-notice__close").addEventListener("click", () => {
        gsap.to(notice, { duration: 0.35, opacity: 0, y: 16, ease: "power2.out", onComplete: () => (notice.style.display = "none") });
        const t = new Date();
        t.setHours(t.getHours() + 24);
        localStorage.setItem("hk-notice-closed", t.toISOString());
      });
    }
  }

  // Product row page count: divide the distance the row has moved by one card width and take the nearest card
  const track = document.querySelector(".hk-strip__track"), now = document.querySelector("[data-strip-now]");
  if (track && now) {
    const cards = track.children;
    let last = -1;
    gsap.ticker.add(() => {
      const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
      const i = Math.min(cards.length - 1, Math.max(0, Math.round(-gsap.getProperty(track, "x") / step)));
      if (i !== last) { last = i; now.textContent = String(i + 1).padStart(2, "0"); }
    });
  }
});
