// Feature bundle intro — on phone·tablet (1024 and below), after scrolling 300px the purchase strip below rises (y 100%→0 .4s power3.out), and drops back when the footer’s top edge touches the bottom of the screen (.4s power3.in). Original numbers as they are.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const bar = document.querySelector(".dd-float-act");
  if (!bar) return;
  const { reduced } = window.DD;
  gsap.set(bar, { y: "100%", autoAlpha: 0, force3D: true });
  const show = () => { bar.setAttribute("aria-hidden", "false"); gsap.to(bar, { y: 0, autoAlpha: 1, duration: reduced ? 0 : 0.4, ease: "power3.out", force3D: true }); };
  const hide = () => { bar.setAttribute("aria-hidden", "true"); gsap.to(bar, { y: "100%", autoAlpha: 0, duration: reduced ? 0 : 0.4, ease: "power3.in", force3D: true }); };
  gsap.matchMedia().add("(max-width: 1024px)", () => {
    ScrollTrigger.create({ trigger: "body", start: "top -300px", endTrigger: document.querySelector(".dd-footer") || "body", end: "top bottom", onEnter: show, onLeave: hide, onEnterBack: show, onLeaveBack: hide });
    return hide;
  });
})();
