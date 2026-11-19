// About — award accordion list (IX2 About – Awards IN·OUT) and article number bracket swap (IX2 Publications – Hover)
(() => {
  // The site builder’s IX2 inOutCubic is a true cubic curve (power2.inOut) — a cubic-bezier approximation differs at both ends, so the length looks stretched
  const cubic = "power2.inOut";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // On press the height opens in .5s and the inner list drops from −100% above in .6s, while the circle chevron turns half a turn with 1.3s expo.out
  document.querySelectorAll(".aw1-item").forEach((item) => {
    const btn = item.querySelector(".aw1-title");
    const outer = item.querySelector(".aw1-outer");
    const way = item.querySelector(".aw1-waypoint");
    const icon = item.querySelector(".aw-explore");
    let open = false;
    gsap.set(way, { yPercent: -100 });
    const refresh = () => site.loco?.update();
    item.addEventListener("click", (e) => {
      if (e.target.closest(".aw1-link")) return;
      open = !open;
      btn.setAttribute("aria-expanded", String(open));
      const d = reduce ? 0 : 1;
      if (open) {
        gsap.to(outer, { height: "auto", duration: 0.5 * d, ease: cubic, onComplete: refresh });
        gsap.to(icon, { rotation: 180, duration: 1.3 * d, ease: "expo.out" });
        gsap.to(way, { yPercent: 0, duration: 0.6 * d, ease: cubic });
      } else {
        gsap.to(outer, { height: 0, duration: 0.6 * d, ease: cubic, onComplete: refresh });
        gsap.to(icon, { rotation: 0, duration: 1.3 * d, ease: "expo.out" });
        gsap.to(way, { yPercent: -100, duration: 0.5 * d, ease: cubic });
      }
    });
  });

  // On hover the number brackets slide up in .3s and the circle arrow rises in .4s
  document.querySelectorAll(".pub-link").forEach((a) => {
    const numb = a.querySelector(".pub-numb__wrap");
    const trig = a.querySelector(".pub-trigger");
    gsap.set(trig, { yPercent: 100 });
    // On leaving, the original resets the circle to 0% rather than the initial position (100%). 0% is also under the cell, so it stays invisible.
    site.hover(a, () => {
      gsap.to(numb, { yPercent: -150, duration: 0.3, ease: cubic, overwrite: true });
      gsap.to(trig, { yPercent: -150, duration: 0.4, ease: cubic, overwrite: true });
    }, () => {
      gsap.to(numb, { yPercent: 0, duration: 0.4, ease: cubic, overwrite: true });
      gsap.to(trig, { yPercent: 0, duration: 0.3, ease: cubic, overwrite: true });
    });
  });
})();
