// First page only: hero photo fade and word opening, border band stagger, people slider, video window. shared.js calls it when the body enters, and the returned function detaches it.
// Original values: hero Splide fade (speed 2s · interval 6s · rewind) · words 1.5s power4.out stagger .1 ·
// Marquee rows 1 and 3 x 5%→-5%, row 2 10%→20% (phone 2.5→-2.5 / 5→10) · people Splide loop (speed 1s · two visible, advancing one at a time, one below 767 · gap 20 · no arrows) ·
// Video window MicroModal — backdrop .5s sine.inOut, video frame grows from a center dot into a rectangle over .9s sine.inOut (.4s overlap), closing hides it immediately and stops the video
(window.SBP ||= {}).home = (root, SB) => {
  const { reduced } = SB;
  const offs = [];

  const fv = root.querySelector("[data-fv-slides]");
  if (fv && window.Splide) {
    const s = new Splide(fv, {
      type: "fade", speed: 2000, interval: 6000, autoWidth: true, autoHeight: true, rewind: true, autoplay: true,
      arrows: false, pagination: false, pauseOnFocus: false, pauseOnHover: false, drag: false,
    }).mount();
    offs.push(() => s.destroy());
  }

  const people = root.querySelector("[data-slider]");
  if (people && window.Splide) {
    const s = new Splide(people, {
      type: "loop", rewind: true, speed: 1000, gap: 0, perPage: 2, perMove: 1, arrows: true, pagination: false,
      pauseOnFocus: false, pauseOnHover: false, breakpoints: { 767: { perPage: 1, gap: 20, arrows: false } },
    }).mount();
    offs.push(() => s.destroy());
  }

  const modal = root.querySelector(".hm-modal");
  if (modal && window.MicroModal) {
    MicroModal.init({
      openTrigger: "data-modal-open", closeTrigger: "data-modal-close", openClass: "is-open",
      disableScroll: true, disableFocus: false, awaitOpenAnimation: false, awaitCloseAnimation: false,
      onShow: (m) => {
        SB.lenis?.stop();
        const movie = m.querySelectorAll(".hm-modal__movie");
        const d = reduced ? 0 : 1;
        gsap.timeline()
          .set(movie, { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)", opacity: 0 })
          .fromTo(m, { opacity: 0 }, { opacity: 1, duration: 0.5 * d, ease: "sine.inOut" })
          .to(movie, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", opacity: 1, duration: 0.9 * d, ease: "sine.inOut", delay: -0.4 * d });
      },
      onClose: (m) => {
        SB.lenis?.start();
        m.querySelectorAll("video").forEach((v) => v.pause());
      },
    });
    offs.push(() => modal.classList.contains("is-open") && MicroModal.close(modal.id));
  }

  if (!reduced) {
    const words = gsap.utils.toArray(root.querySelectorAll("[data-fv-word]"));
    gsap.set(words, { yPercent: 100, opacity: 0 });
    gsap.to(words, { yPercent: 0, opacity: 1, duration: 1.5, stagger: 0.1, ease: "power4.out" });

    const deco = root.querySelector(".hm-deco");
    if (deco) {
      const narrow = innerWidth < 560;
      const st = { trigger: deco, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo(deco.querySelectorAll('[data-direction="0"]'), { xPercent: narrow ? 5 : 10 }, { xPercent: narrow ? 10 : 20, ease: "none", scrollTrigger: st });
      gsap.fromTo(deco.querySelectorAll('[data-direction="1"]'), { xPercent: narrow ? 2.5 : 5 }, { xPercent: narrow ? -2.5 : -5, ease: "none", scrollTrigger: { ...st } });
    }
  }

  return () => offs.forEach((f) => f());
};
