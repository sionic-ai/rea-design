(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Photo row: drag to flip (inertia on release)
  const track = document.querySelector(".sd-slides__track");
  if (track) {
    let x0 = null, s0 = 0, v = 0, lastX = 0;
    track.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; x0 = e.clientX; s0 = track.scrollLeft; lastX = e.clientX; track.setPointerCapture(e.pointerId); gsap.killTweensOf(track); });
    track.addEventListener("pointermove", (e) => { if (x0 == null) return; track.scrollLeft = s0 - (e.clientX - x0); v = e.clientX - lastX; lastX = e.clientX; });
    track.addEventListener("pointerup", () => { if (x0 == null) return; x0 = null; gsap.to(track, { scrollLeft: track.scrollLeft - v * 14, duration: 0.85, ease: "power3.out" }); });
  }

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // A big roll turns and goes down to the next section
    gsap.to(".sd-hero__roll", { rotation: 300, yPercent: 60, ease: "none", scrollTrigger: { trigger: ".sd-hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.from(".sd-intro__card", { yPercent: 40, rotation: (i) => (i ? 18 : -18), ease: "none", scrollTrigger: { trigger: ".sd-intro", start: "top bottom", end: "center center", scrub: true } });
    // SUPER POWERS: screen pinned, cards rise from below, pass through the center and exit upward
    const cards = $$(".sd-power");
    gsap.set(cards, { yPercent: (i) => (i ? 260 : 0) });
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".sd-powers__pin", start: "top top", end: "+=200%", pin: true, scrub: true } });
    cards.forEach((c, i) => {
      if (i === 0) return;
      tl.to(cards[i - 1], { yPercent: -260, rotation: -6, ease: "power2.inOut", duration: 1 }, (i - 1) * 1.1)
        .to(c, { yPercent: 0, rotation: 0, ease: "power2.inOut", duration: 1 }, (i - 1) * 1.1);
    });
  });
})();
