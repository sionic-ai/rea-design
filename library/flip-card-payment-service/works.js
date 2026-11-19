// Work list — original IC module: filter cards with industry buttons (list rolls up .3s, then the remaining cards rise again in 1s power3.out), on PC the left filter stays pinned until the end of the list
NP.pages.case = (root) => {
  const body = root.querySelector(".wk-sum__body");
  if (!body) return;
  const btns = [...body.querySelectorAll(".sort-nav__btn")];
  const cards = [...body.querySelectorAll(".article")];
  const pick = (e) => {
    gsap.to(window, { scrollTo: body, duration: 0.3, ease: "power2.out" });
    const b = e.currentTarget;
    btns.forEach((x) => x.classList.toggle("is-active", x === b));
    const k = b.dataset.sort;
    gsap.to(cards, { opacity: 0, duration: 1, ease: "power3.out" });
    cards.forEach((c) => gsap.set(c, { display: k === "all" || c.dataset.cat === k ? "" : "none", opacity: 0 }));
    gsap.to(cards, { opacity: 1, duration: NP.reduce ? 0 : 1, ease: "power3.out" });
    ScrollTrigger.refresh();
  };
  btns.forEach((b) => b.addEventListener("click", pick));
  const mm = gsap.matchMedia();
  mm.add("(min-width: 769px)", () => {
    ScrollTrigger.create({ trigger: body, pin: body.querySelector(".wk-sum__inner"), pinSpacing: false, start: "top top", end: "bottom bottom" });
  });
  return () => { btns.forEach((b) => b.removeEventListener("click", pick)); mm.revert(); };
};
