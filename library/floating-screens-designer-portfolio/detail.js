// Detail: the section being read darkens in the table of contents (the original only changes color) · sound button swap.
(() => {
  const links = [...document.querySelectorAll(".case__toc-list a")];
  const mark = (a) => links.forEach((l) => (l === a ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current")));
  links.forEach((a, i) => ScrollTrigger.create({
    trigger: a.getAttribute("href"),
    start: "top 40%",
    onEnter: () => mark(a),
    onLeaveBack: () => mark(links[Math.max(0, i - 1)]),
  }));
  mark(links[0]);

  // Arrival — original order: title 0 · tag .15 · logo .25 · contents .3 (.08 gap, .3s power2.out) · back .4 · facts .45 · overview .6 · first image .7.
  // Text uses the line entrance (shared.js), while tags, logo, buttons and the first image roll in from -90° (.3s power3.out)
  const MOTION = "(prefers-reduced-motion: no-preference)";
  window.IM.ready.then(() => document.fonts.ready).then(() => window.IM.mm.add(MOTION, () => {
    document.querySelectorAll(".case__tags .tag").forEach((el, i) => window.IM.rollIn(el, 0.15 + i * 0.12));
    [".case__logo", ".case__back", ".case__nav > .btn"].forEach((sel, i) => document.querySelectorAll(sel).forEach((el) => window.IM.rollIn(el, [0.25, 0.4, 0.4][i])));
    gsap.fromTo(".case__toc-list li", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out", stagger: 0.08, delay: 0.3 });
    // The first image keeps its grid cell and the plate itself rolls (box depth = Height/2, perspective 6×height)
    const lead = document.querySelector(".case__lead");
    if (lead) gsap.fromTo(lead, { rotationX: -90, transformPerspective: () => lead.offsetHeight * 6, transformOrigin: () => `50% 50% ${-lead.offsetHeight / 2}px`, autoAlpha: 0 },
      { rotationX: 0, autoAlpha: 1, duration: 0.3, ease: "power3.out", delay: 0.7, immediateRender: true, clearProps: "transform,transformOrigin" });
  }));

  // Video sound — as in the original, the on and off buttons swap places (placeholder video, so no sound)
  const sound = [...document.querySelectorAll("[data-sound]")];
  sound.forEach((b) => b.addEventListener("click", () => sound.forEach((x) => (x.hidden = x === b))));
})();
