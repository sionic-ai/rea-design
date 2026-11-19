// Product: hide the ball when the ‹What we do› section reaches 50% of the screen (original Dy)
(() => {
  const S = window.anSpheres;
  if (!S) return;
  ScrollTrigger.create({ trigger: "#what-we-do", start: "top 50%", onEnter: () => S.hide(), onLeaveBack: () => S.show() });
})();
