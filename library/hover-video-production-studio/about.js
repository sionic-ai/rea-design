// About: parallax inside the photo, three words pin in turn at the same spot (earlier words stay and form a sentence), the info panel rises from half a screen below and pins, the main intro collapses.
// Original values: photo y -50%→50% scrub (top bottom → bottom top) · word pin top top → end of the photo group (no pinSpacing) ·
// Info panel y screen/2→0, start top-=Screen/2, length +=100%, pin · on touch devices only the word stays fixed at 50% 50%.
MR.page("about", (box) => {
  const { touch } = window.MR;
  const imgs = box.querySelector(".mr-aimgs");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    if (touch) {
      box.querySelectorAll(".mr-alead").forEach((l) => ScrollTrigger.create({ trigger: l, start: "50% 50%", endTrigger: imgs, end: () => `bottom 50%+=${innerWidth / 2}`, pin: true, pinSpacing: false }));
      return;
    }
    box.querySelectorAll(".mr-aphoto").forEach((ph) => {
      gsap.fromTo(ph.querySelector(".wf-img"), { y: "-50%" }, { y: "50%", ease: "none", scrollTrigger: { trigger: ph, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    const info = box.querySelector(".mr-ainfo");
    gsap.fromTo(info, { y: () => `${innerHeight / 2}px` }, { y: "0px", ease: "none", scrollTrigger: { trigger: info, start: () => `top-=${innerHeight / 2}px top`, end: () => "+=100%", pin: true, pinSpacing: true, scrub: true, invalidateOnRefresh: true } });
    box.querySelectorAll(".mr-alead").forEach((l) => ScrollTrigger.create({ trigger: l, start: "top top", endTrigger: imgs, end: "bottom bottom", pin: true, pinSpacing: false }));
  });

  // Pressing the representative’s name unfolds the intro text with height .5s, then sets it to auto once fully open
  const fold = box.querySelector(".mr-fold");
  const label = fold.querySelector(".mr-fold__label");
  const body = fold.querySelector(".mr-fold__body");
  label.addEventListener("click", () => {
    const open = !fold.classList.contains("is-open");
    fold.classList.toggle("is-open", open);
    label.setAttribute("aria-expanded", open);
    body.style.height = `${open ? 0 : body.scrollHeight}px`;
    requestAnimationFrame(() => requestAnimationFrame(() => (body.style.height = `${open ? body.scrollHeight : 0}px`)));
    body.addEventListener("transitionend", () => { if (open) body.style.height = "auto"; ScrollTrigger.refresh(); }, { once: true });
  });

  return () => mm.revert();
});
