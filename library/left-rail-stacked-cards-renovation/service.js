// Service — the background photo row slides endlessly at 35s linear, the outgoing photo shifts 5% and the incoming one settles from -10% into place (35s),
// Overview circles and text rise −5vh on scroll, and at each step the arch panel photo shrinks 1.1 → 1 while the next photo turns on and the dot guide paints the current step
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) new Swiper(".rl-service .bg", {
    slidesPerView: 1, speed: 35000, autoplay: { delay: 0 }, loop: true, allowTouchMove: false,
    on: {
      slideNextTransitionStart(s) {
        const prev = s.el.querySelector(".swiper-slide-prev .wf-img"), act = s.el.querySelector(".swiper-slide-active .wf-img");
        if (prev && act) { gsap.fromTo(prev, { x: "0%" }, { x: "5%", duration: 35 }); gsap.fromTo(act, { x: "-10%" }, { x: "0%", duration: 35 }); }
      },
    },
  });
  gsap.matchMedia().add("(min-width: 860px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: ".rl-service .overview", start: "top top", end: "bottom top", scrub: true } })
      .to(".rl-service .overview .circles", { y: "-5vh" })
      .to(".rl-service .overview .text", { y: "-5vh" }, "<=");
  });
  const wide = () => innerWidth >= 860;
  const big = document.querySelectorAll(".rl-service .list > .visual .wf-img");
  const small = document.querySelectorAll(".rl-service .list .text li .visual .wf-img");
  const items = document.querySelectorAll(".rl-service .list .text li");
  const dots = document.querySelectorAll(".rl-service .list .dot");
  items.forEach((li, i) => {
    const vis = () => (wide() ? big : small)[i];
    gsap.to(vis(), {
      scale: 1, ease: "none",
      scrollTrigger: {
        trigger: li, start: () => "top " + (wide() ? 240 : 160), end: () => "bottom " + (wide() ? 240 : 160), scrub: true,
        onEnter: () => dots[i]?.classList.add("now"),
        onEnterBack: () => { if (big[i + 1]) gsap.to(big[i + 1], { opacity: 0 }); dots[i]?.classList.add("now"); },
        onLeave: () => { if (i !== items.length - 1) { if (big[i + 1]) gsap.to(big[i + 1], { opacity: 1 }); dots[i]?.classList.remove("now"); } },
        onLeaveBack: () => { if (i !== 0) dots[i]?.classList.remove("now"); },
      },
    });
  });
})();
