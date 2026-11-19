(() => {
  // Filter: keep only the cards of the chosen type, and the remaining cards pop up and settle again
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const btns = [...document.querySelectorAll(".sn-filter button")];
  const cards = [...document.querySelectorAll(".sn-card")];
  btns.forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("is-on")) return;
    btns.forEach((o) => o.classList.toggle("is-on", o === b));
    const f = b.dataset.f;
    cards.forEach((c) => c.classList.toggle("is-out", f !== "all" && c.dataset.k !== f));
    const shown = cards.filter((c) => !c.classList.contains("is-out"));
    if (!reduce) gsap.fromTo(shown, { y: 30, rotation: -4, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.45, ease: "back.out(1.9)", stagger: 0.04 });
    window.ScrollTrigger && ScrollTrigger.refresh();
  }));
})();
