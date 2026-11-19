// The section title stays pinned at screen center, and when it leaves the bottom edge of the wide photo it turns from white to ink (.3s).
(() => {
  document.querySelectorAll(".ab-article").forEach((art) => {
    const title = art.querySelector(".ab-title");
    const visual = art.querySelector(".tw-visual");
    ScrollTrigger.create({
      trigger: visual,
      start: "bottom 50%",
      onEnter: () => title.classList.add("is-dark"),
      onLeaveBack: () => title.classList.remove("is-dark"),
    });
  });
})();
