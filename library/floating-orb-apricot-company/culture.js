// About us: the ball reappears in the reason-for-existence section and floats until just before the strengths section (original Iy)
(() => {
  const S = window.anSpheres;
  if (!S) return;
  ScrollTrigger.create({ trigger: "#purpose", start: "top 50%", endTrigger: "#strength", end: "top 50%", onEnter: () => S.show(), onLeaveBack: () => S.hide(), onLeave: () => S.hide(), onEnterBack: () => S.show() });
})();
