// News item — over the prev/next news arrow area a circle cursor follows the mouse .5s late, turning on and off in .5s on enter and leave
(() => {
  document.querySelectorAll(".cm-postnav__arrow").forEach((a) => {
    const c = a.querySelector(".cm-postnav__cursor");
    if (!c) return;
    a.addEventListener("mousemove", (e) => gsap.to(c, { x: e.offsetX, y: e.offsetY, duration: 0.5 }));
    a.addEventListener("mouseenter", () => gsap.to(c, { opacity: 1, duration: 0.5 }));
    a.addEventListener("mouseleave", () => gsap.to(c, { opacity: 0, duration: 0.5 }));
  });
})();
