// About — scrolling past the first screen, the yellow “In” grows and vanishes and the studio name floats up in its place (scrub). The awards table has 13 rows, and on hover a black band unfolds from the left (.5s expo.out)
(() => {
  const AWARDS = [["2026", "Nova Studio", "Award One", "SOTD"], ["2026", "Nova Studio", "Award One", "DEV"], ["2026", "Nova Studio", "Award Two", "FOTD"], ["2026", "Nova Studio", "Award Three", "WOTD"], ["2026", "Nova Studio", "Award Four", "HONOR"], ["2026", "Client Name", "Award Three", "WOTD"], ["2026", "Client Studio", "Award Three", "WOTD"], ["2026", "Client Studio", "Award Five", "FEATURED"], ["2026", "Client Production", "Award One", "SOTD"], ["2026", "Client Production", "Award One", "DEV"], ["2026", "Client Production", "Award Three", "WOTD"], ["2026", "Client Foods", "Award Two", "FOTD"], ["2026", "Mr. Client", "Award Three", "WOTD"]];
  const list = document.querySelector(".ax-awards__rows");
  AWARDS.forEach((r) => list.insertAdjacentHTML("beforeend", `<li class="ax-award">${r.map((c) => `<span>${c}</span>`).join("")}</li>`));
  document.querySelector(".ax-awards__title .ax-ital").textContent = String(AWARDS.length).padStart(2, "0");
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  // Inside the smooth scroll page, so the first section is pinned with ScrollTrigger instead of sticky
  ScrollTrigger.create({ trigger: ".ax-in", start: "top top", end: "bottom bottom", pin: ".ax-in__pin", pinSpacing: false });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".ax-in", start: "top top", end: "bottom bottom", scrub: true } });
    tl.to(".ax-in__a", { scale: 2.4, opacity: 0, ease: "none", duration: 0.5 })
      .to(".ax-in__b", { opacity: 1, ease: "none", duration: 0.15 }, 0.42)
      .fromTo(".ax-in__b", { scale: 0.6 }, { scale: 1, ease: "none", duration: 0.5 }, 0.42);
    gsap.to(".ax-poem__lines", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".ax-poem", start: "top bottom", end: "bottom top", scrub: true } });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(".ax-in__a", { opacity: 0 }); gsap.set(".ax-in__b", { opacity: 1 }); });
})();
