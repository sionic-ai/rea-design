// First page: hero letters rising · photo ring scrub rotation · thin scrollbar on the category box.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero — per line (data-ln-wrap), characters rise from 101% below, tilted 10°, over 1 second power4.out. Line i starts 1.5 + .2i seconds later, .03 seconds between characters
  const hero = document.querySelector("[data-top-hero]");
  if (hero) {
    hero.querySelectorAll("[data-hero-str]").forEach((s) => {
      s.setAttribute("aria-label", s.textContent);
      s.innerHTML = [...s.textContent].map((c) => `<span class="rp-hc" aria-hidden="true">${c === " " ? "" : c}</span>`).join("");
    });
    const lines = hero.querySelectorAll("[data-ln-wrap]");
    if (reduce) gsap.set(hero.querySelectorAll(".rp-hc"), { opacity: 1 });
    else lines.forEach((line, i) => {
      gsap.fromTo(line.querySelectorAll(".rp-hc"), { y: "101%", rotate: "10deg", opacity: 0 }, {
        y: 0, rotate: "0deg", opacity: 1, ease: "power4.out", duration: 1, delay: i * 0.2 + 1.5, stagger: { each: 0.03 },
      });
    });
  }

  // Photo ring — starts when the About panel’s head reaches the screen center and turns 45° until the panel has fully passed above the screen (scrub 1.2)
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const about = document.querySelector("[data-top-about]"), ring = document.querySelector("[data-top-about-image]");
    if (about && ring) gsap.to(ring, { rotation: 45, scrollTrigger: { trigger: about, start: "top center", scrub: 1.2 } });
  });

  // Category box — like the original, OverlayScrollbars (1px handle, click jumps to that spot)
  const OS = window.OverlayScrollbarsGlobal;
  const box = document.querySelector("[data-scrollbar]");
  if (OS && box) {
    try {
      OS.OverlayScrollbars.plugin([OS.ClickScrollPlugin, OS.ScrollbarsHidingPlugin, OS.SizeObserverPlugin].filter(Boolean));
      OS.OverlayScrollbars(box, { scrollbars: { clickScroll: true }, cancel: { nativeScrollbarsOverlaid: true, body: null } });
    } catch (e) { /* If the original fails too, fall back to default scroll */ }
  }
})();
