// Column header — original layerkvAnim: Korean title blur 30px→0 1s (starts together with the English), after .5s the right leaf bundle rotates 175→180° over 1s, the left bundle goes from left 10% −2°→0 over 1s (both expo.out)
(() => {
  if (window.TW.reduced) return;
  const ja = document.querySelector(".tw-lkv__ja");
  const t1 = document.querySelector(".tw-lkv__treat--1");
  const t2 = document.querySelector(".tw-lkv__treat--2");
  gsap.timeline()
    .set(ja, { filter: "blur(30px)" })
    .set(t2, { alpha: 0, rotate: 175 })
    .set(t1, { alpha: 0, x: "-10%", rotate: -2 })
    .to(ja, { duration: 1, filter: "blur(0px)" }, 0)
    .to(t2, { ease: "expo.out", alpha: 1, rotate: 180, duration: 1, delay: 0.5 }, "<")
    .to(t1, { ease: "expo.out", alpha: 1, x: "0%", rotate: 0, duration: 1 }, "<");
})();
