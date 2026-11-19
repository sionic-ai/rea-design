// Service: unfold the two-layer header title · open vertical photo columns · stack steps (turn dark when covered) · move between steps with number buttons.
// Original values: bottom title y→0 1s expo.inOut · photo inset(100%)→0 1.4s expo.inOut · left and right xPercent ∓30 (width<1024 ∓15) after .4s for 1s · photo parallax yPercent -10
//           list .4s (.1 gap) · travel scroll length = Distance×.5 clamped to .3~1.2s, easeInOutCirc
(() => {
  const { rem, isXL, reduced } = SD;
  const top = document.querySelector(".sv-cover__top");
  const bottom = document.querySelector(".sv-cover__bottom");
  const bl = document.querySelector(".sv-cover__bl"), br = document.querySelector(".sv-cover__br");
  const media = document.querySelector(".sv-cover__media");
  const mbox = document.querySelector(".sv-cover__mbox");
  const anchorsHead = [document.querySelector(".sv-cover__anchors h1"), ...document.querySelectorAll(".sv-cover__alist a")];
  const items = [...document.querySelectorAll("[data-svc-item]")];

  const circ = (h) => (h < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * h, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * h + 2, 2)) + 1) / 2);
  const sticky = () => matchMedia("(min-width: 1200px) and (min-height: 860px)").matches;
  const startOf = (k) => {
    const stack = document.querySelector(".svc-stack");
    const base = stack.getBoundingClientRect().top + scrollY;
    return base + items.slice(0, k).reduce((s, it) => s + it.offsetHeight + (sticky() ? innerHeight * 0.5 : 0), 0);
  };
  const goTo = (k) => {
    const y = startOf(k) + 2;
    const dur = Math.min(Math.max(Math.abs(scrollY - y) * 0.5, 300), 1200) / 1000;
    if (SD.lenis) SD.lenis.scrollTo(y, { duration: dur, easing: circ, force: true });
    else scrollTo(0, y);
  };
  document.querySelectorAll("[data-anc]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); goTo(+a.dataset.anc); }));

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", xl: "(min-width: 1200px)" }, (ctx) => {
    if (!ctx.conditions.motion) return;
    const xl = ctx.conditions.xl;
    document.fonts.ready.then(() => {
      [bl, br].forEach(SD.splitChars);
      SD.riseSet([...bl._chars, ...br._chars]);
      gsap.set(anchorsHead, { autoAlpha: 0 });
      gsap.set(mbox, { clipPath: "inset(100% round 1rem)" });
      const tb = top.getBoundingClientRect(), bb = bottom.getBoundingClientRect();
      gsap.set(bottom, { y: -(bb.bottom - tb.bottom) + bb.height });
      const k = innerWidth < 1024 ? 15 : 30;
      const tl = gsap.timeline({ paused: true })
        .to(bottom, { y: 0, duration: 1, ease: "expo.inOut" }, 0)
        .to(mbox, { clipPath: "inset(0% round 1rem)", duration: 1.4, ease: "expo.inOut" }, 0)
        .to(bl, { xPercent: -k, duration: 1, ease: "expo.inOut" }, 0.4)
        .to(br, { xPercent: k, duration: 1, ease: "expo.inOut" }, 0.4);
      ScrollTrigger.create({ trigger: ".sv-cover", start: xl ? "20% 30%" : "10% 5%", onEnter: () => tl.play() });
      if (xl) gsap.to(media, { yPercent: -10, ease: "none", scrollTrigger: { trigger: media, start: "top 50%", scrub: true } });
      SD.ready(() => {
        gsap.to(anchorsHead, { autoAlpha: 1, duration: 0.4, ease: "alpha", stagger: 0.1 });
        SD.riseIn(bl._chars, 0.2);
        SD.riseIn(br._chars, 0.4);
      });

      // The covering stage is ink-black — while the next stage travels from the bottom to the top of the screen
      if (sticky()) {
        const stack = document.querySelector(".svc-stack");
        const off = (k2) => items.slice(0, k2).reduce((s, it) => s + it.offsetHeight + innerHeight * 0.5, 0);
        items.slice(0, -1).forEach((it, i) => {
          gsap.fromTo(it.querySelector(".svc-item__ov"), { opacity: 0 }, {
            opacity: 1, ease: "alpha",
            scrollTrigger: { trigger: stack, start: () => `${off(i) + innerHeight * 0.6}px top`, end: () => `${off(i + 1) + innerHeight * 0.6}px top`, scrub: true, invalidateOnRefresh: true },
          });
        });
      }
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
  });
})();
