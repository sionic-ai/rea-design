// About: on PC the petal portrait cell is pinned on the screen and sent up together when that section’s text ends (original about__profile__portrait pin)
(() => {
  if (!MG.PC || MG.reduce) return;
  document.querySelectorAll(".ab-profile").forEach((sec) => {
    const p = sec.querySelector(".ab-profile__portrait");
    ScrollTrigger.create({ trigger: p, start: "top top", endTrigger: sec, end: () => `bottom bottom-=${innerHeight - p.offsetHeight}`, pin: true, pinSpacing: false, invalidateOnRefresh: true });
  });
})();
