// Service scene: for each layer, when it hits 90% from the bottom the name rises, the description fades in and the line is drawn / the orange thread is drawn with scroll and the step beads bounce.
(() => {
  RK.scene(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".rk-storey").forEach((el) => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: "bottom 90%", once: true } })
          .fromTo(el.querySelector(".rk-storey__reveal"), { yPercent: 130 }, { yPercent: 0, duration: 0.8, ease: "power3.out" }, 0)
          .fromTo(el.querySelector(".rk-storey__note"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.1)
          .fromTo(el.querySelector(".rk-storey__rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.out" }, 0.1);
      });
    });
  });

  RK.scene(() => {
    const track = document.querySelector(".rk-process__track");
    const thread = track.querySelector(".rk-process__thread");
    const steps = [...track.querySelectorAll(".rk-process__step")];
    const pop = (tl, step, at) => tl
      .fromTo(step.querySelector(".rk-process__orb"), { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" }, at)
      .fromTo(step.querySelectorAll(".rk-process__num, .rk-process__name, .rk-process__text"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }, at + 0.1);
    gsap.matchMedia().add({
      desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      mobile: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
    }, ({ conditions: c }) => {
      const [from, to] = c.desktop ? [{ scaleX: 0 }, { scaleX: 1 }] : [{ scaleY: 0 }, { scaleY: 1 }];
      gsap.fromTo(thread, from, { ...to, ease: "none", scrollTrigger: { trigger: track, start: "top 85%", end: c.desktop ? "top 35%" : "bottom 60%", scrub: true } });
      if (c.desktop) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: track, start: "top 85%", once: true } });
        steps.forEach((s, i) => pop(tl, s, i * 0.15));
      } else {
        steps.forEach((s) => pop(gsap.timeline({ scrollTrigger: { trigger: s, start: "top 85%", once: true } }), s, 0));
      }
    });
  });
})();
