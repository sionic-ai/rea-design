/* Home: three photos clear up in 2.5s from 1.03x scale and 1.2 brightness, and the vertical copy letters stand up from skewX −10° and 5px blur, then clear.
   About section vertical title: the line below is tied to scroll while passing through the section and fills from the top (scrub 1). On phones, a slanted line + text shifts blue-gray → ink. */
(() => {
  window.NM.pages.home = (container, { mm }) => {
    const NM = window.NM;
    const title = [...container.querySelectorAll(".p-home__mvLine .nm-c")];
    const imgs = [...container.querySelectorAll(".js-mvimg")];
    mm.add({ any: "all", big: "(min-width: 769px)", rm: "(prefers-reduced-motion: reduce)" }, (c) => {
      if (c.conditions.rm) { gsap.set(title, { autoAlpha: 1, y: 0, skewX: 0, filter: "none" }); gsap.set(imgs, { autoAlpha: 1, scale: 1, filter: "brightness(1)" }); return; }
      gsap.set(title, { y: -10, skewX: "-10deg", autoAlpha: 0 });
      gsap.set(imgs, { scale: 1.03 });
      const tl = gsap.timeline();
      tl.to(imgs, { scale: 1, autoAlpha: 1, duration: 2.5, ease: "circ.out" })
        .to(imgs, c.conditions.big ? { filter: "brightness(1)", duration: 0.3 } : { duration: 0.3 }, "<+.2")
        .to(title, { ease: "power3.out", autoAlpha: 1, y: 0, filter: "blur(5px)", skewX: "0deg", duration: 2.4, stagger: { from: "start", amount: 0.6 } }, "<+.3")
        .to(title, { ease: "power3.out", filter: "blur(0px)", duration: 2.4, stagger: { from: "start", amount: 0.6 } }, "<+.3");
    });

    const line = container.querySelector("#nm-aboutline"), about = container.querySelector("#about");
    const head = container.querySelector(".p-home__aboutTitleTxt"), chars = NM.chars(head);
    const tint = NM.cssv("--site-title-tint");
    const ink = NM.cssv("--kf-ink");
    mm.add({ any: "all", pc: "(min-width: 1025px)", rm: "(prefers-reduced-motion: reduce)" }, (c) => {
      if (c.conditions.rm) { gsap.set(line, { scaleY: 1 }); head.classList.add("is-load"); return; }
      if (c.conditions.pc) {
        gsap.set(line, { scaleY: 0 });
        gsap.to(line, { scaleY: 1, ease: "none", scrollTrigger: { trigger: about, start: "top top", end: "bottom bottom", scrub: 1, scroller: NM.scroller(), invalidateOnRefresh: true } });
        return;
      }
      gsap.set(chars, { autoAlpha: 0 });
      ScrollTrigger.create({ trigger: head, start: "15% 100%", once: true, onEnter: () => head.classList.add("is-load") });
      gsap.timeline({ delay: 0.6, scrollTrigger: { trigger: head, start: "15% 100%", once: true } })
        .to(chars, { ease: "power3.out", color: tint, autoAlpha: 1, duration: 0.8, stagger: { from: "start", amount: 0.6 } })
        .to(chars, { ease: "power3.out", color: ink, duration: 0.8, stagger: { from: "start", amount: 0.5 } }, "<.5");
    });
  };
})();
