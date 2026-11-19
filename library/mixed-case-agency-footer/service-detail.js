// Service detail — the step line is drawn (DrawSVG, scrub) while passing the process section, and when a step card passes the screen center that row of the TOC lights up
(() => {
  gsap.registerPlugin(ScrollTrigger);
  if (window.DrawSVGPlugin) {
    gsap.registerPlugin(DrawSVGPlugin);
    gsap.fromTo("#pd-line", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", ease: "none", scrollTrigger: { trigger: "#process", start: "top 70%", end: "bottom 60%", scrub: true } });
  }
  const marks = [...document.querySelectorAll(".pd-index li")];
  document.querySelectorAll(".pd-phase").forEach((ph, i) => ScrollTrigger.create({
    trigger: ph, start: "top center", end: "bottom center",
    onToggle: (s) => s.isActive && marks.forEach((m, k) => m.classList.toggle("is-on", k === i)),
  }));
})();
