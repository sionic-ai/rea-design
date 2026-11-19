// Careers: after the HR policy section hide the ball (original Oy), and the two photo rows flow endlessly sideways like the STUDIO flow
(() => {
  const S = window.anSpheres;
  if (S) ScrollTrigger.create({ trigger: "#policy", start: "bottom top", onEnter: () => S.hide(), onLeaveBack: () => S.show() });
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const loops = [...document.querySelectorAll(".an-slider__track")].map((track) => {
      track.append(...[...track.children].map((n) => n.cloneNode(true)));
      return gsap.to(track, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    });
    return () => loops.forEach((l) => l.kill());
  });
})();
// FAQ: height 0 ↔ content height in .3s (original STUDIO accordion)
(() => {
  document.querySelectorAll(".an-faq__item").forEach((item) => {
    const box = item.querySelector(".an-faq__a");
    const inner = item.querySelector(".an-faq__in");
    item.querySelector(".an-faq__q").addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      box.style.height = open ? inner.offsetHeight + "px" : "0px";
      setTimeout(() => ScrollTrigger.refresh(), 320);
    });
  });
})();
