// News list — hovering a row slides the end arrow in from the left and floats it up (1s power3.out), fading on release.
// Pressing ”Show more” floats up the remaining lines, and since everything is visible, the button fades out over .6 seconds and goes away (original readmore)
(() => {
  const { fade, reduce } = window.ns;
  if (!reduce && matchMedia("(hover: hover)").matches) document.querySelectorAll(".ns-row__link").forEach((a) => {
    const arrow = a.querySelector(".ns-row__arrow");
    if (!arrow) return;
    gsap.set(arrow, { x: 0, xPercent: -100 });
    a.addEventListener("mouseenter", () => {
      gsap.fromTo(arrow, { xPercent: -100 }, { xPercent: 0, duration: 1, ease: "power3.out", overwrite: true });
      gsap.to(arrow, { opacity: 1, duration: 0.6, ease: "power3.out" });
    });
    a.addEventListener("mouseleave", () => gsap.to(arrow, { opacity: 0, duration: 0.6, ease: "sine.out" }));
  });
  const more = document.querySelector(".ns-more__btn");
  if (!more) return;
  fade(more, 1, { delay: reduce ? 0 : 0.6 });
  more.addEventListener("click", () => {
    const rest = [...document.querySelectorAll(".ns-row.is-more[hidden]")];
    rest.forEach((r) => { r.hidden = false; gsap.fromTo(r, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.6, ease: "sine.out" }); });
    fade(more, 0, { onComplete: () => gsap.set(more, { display: "none" }) });
    ScrollTrigger.refresh();
  });
})();
