// First page: the hero photo window opens to all four sides over 400lvh (inner 1.2→1), the wordmark fades out and a one-line pledge comes down to the window center.
// The sky photo window opens the same way, and the dark panel and footer head slide down from -25lvh while overlapping.
(() => {
  const { isSP, reduced } = window.SL;
  const sp = isSP();
  const rpx = (t) => (t * window.innerWidth) / (sp ? 375 : 1440);
  const lvh = () => window.innerHeight;
  const fv = document.querySelector(".sl-fv");
  const viewport = fv.querySelector(".sl-fv__viewport");
  const frame = fv.querySelector(".sl-fv__frame");
  const inner = fv.querySelector(".sl-fv__inner");
  const logo = fv.querySelector(".sl-fv__logo");
  const logo1 = fv.querySelector(".sl-fv__logo1");
  const logo2 = fv.querySelector(".sl-fv__logo2");
  const visual = fv.querySelector(".sl-fv__visual");
  const eye = document.querySelector(".sl-eyecatch");
  const eyeView = eye.querySelector(".sl-eyecatch__viewport");
  const eyeImg = eye.querySelector(".sl-eyecatch__img");

  /* Window four sides: large screen inset(10lvh, 50%-30lvh) → 0, phone inset(50%-17rem, 50%-12.8rem) → 0 */
  const clip = (p) => {
    const q = 1 - p;
    const v = sp ? `calc(${50 * q}% - ${rpx(170 * q)}px)` : `${10 * q}lvh`;
    const h = sp ? `calc(${50 * q}% - ${rpx(128 * q)}px)` : `calc(${50 * q}% - ${30 * q}lvh)`;
    return `inset(${v} ${h} ${v} ${h})`;
  };
  const setFv = (p) => {
    viewport.style.clipPath = clip(p);
    frame.style.transform = `translate(-50%, -50%) scale(${1.2 - 0.2 * p})`;
  };
  const setLogo = (p) => {
    logo1.style.opacity = 1 - p;
    const r = visual.offsetHeight / 2 - logo2.offsetHeight / 2 - rpx(sp ? 290 : 530);
    logo1.style.transform = logo2.style.transform = `translate(0%, ${r * p}px)`;
  };
  const setEye = (p) => {
    eyeView.style.clipPath = clip(p);
    eyeImg.style.transform = `scale(${1.2 - 0.2 * p})`;
  };

  if (reduced) {
    setFv(1);
    setLogo(1);
    setEye(1);
    return;
  }

  ScrollTrigger.create({ trigger: fv, start: "top top", end: "bottom bottom", onUpdate: (s) => setFv(s.progress) });
  ScrollTrigger.create({
    trigger: logo, start: "top top",
    end: () => (sp ? `top+=${rpx(138)} top` : `top+=${rpx(480) - 0.1 * visual.offsetHeight} top`),
    onUpdate: (s) => setLogo(s.progress),
  });
  /* When the hero ends, while the next plate covers it the hero follows down late by 1/4 of the window height */
  ScrollTrigger.create({
    trigger: fv, start: "bottom bottom", end: () => `bottom+=${visual.offsetHeight} bottom`,
    onUpdate: (s) => (fv.style.transform = `translate(0%, ${0.25 * visual.offsetHeight * s.progress}px)`),
    onLeave: () => (fv.style.transform = ""), onLeaveBack: () => (fv.style.transform = ""),
  });
  ScrollTrigger.create({
    trigger: eye, start: () => (sp ? `top+=${0.5 * lvh() - rpx(170)} bottom` : `top+=${0.1 * lvh()} bottom`), end: "bottom bottom",
    onUpdate: (s) => setEye(s.progress),
  });
  gsap.fromTo(".sl-misc__axs", { y: () => -0.25 * lvh() }, { y: 0, ease: "none", scrollTrigger: { trigger: ".sl-misc", start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
  gsap.fromTo(".sl-footer__head", { y: () => -0.25 * lvh() }, { y: 0, ease: "none", scrollTrigger: { trigger: ".sl-footer", start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });

  /* When the veil lifts, the sky video beyond the window starts playing and the photo inside the window relaxes from 1.1 in 4.5s expo.out */
  const sky = fv.querySelector(".sl-fv__sky video");
  const wake = () => {
    sky?.play().catch(() => {});
    gsap.fromTo(inner, { scale: 1.1 }, { scale: 1, ease: "expo.out", duration: 4.5 });
  };
  if (document.body.classList.contains("is-active")) wake();
  else window.addEventListener("sl:activate", wake, { once: true });
})();
