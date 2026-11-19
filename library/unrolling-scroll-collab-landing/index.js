/* Hero intro — original main-min.js window.load: two title halves ∓200px .8s (after .2s) · tagline −100px .6s (after 1s) · body strips −100px .6s (after 1.2s, .2s apart) · diamond images .4s linear (after 2s, .1s apart) · arrow right 60px .6s (after 3.4s), curve is velocity ease-in-out */
(() => {
  const q = (s) => [...document.querySelectorAll(s)];
  const io = "fx-ng-io";
  const ease = window.CustomEase ? (CustomEase.get(io) || CustomEase.create(io, "0.42,0,0.58,1")) : "power1.inOut";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const l = q(".ng-intro__l"), r = q(".ng-intro__r"), catchEl = q(".ng-intro__catch"), items = q(".ng-intro__item"), arrow = q(".ng-intro__arrow"), dias = q(".ng-dia");
  gsap.set(dias, { opacity: 0 });
  gsap.set(catchEl, { y: -100, opacity: 0 });
  gsap.set(items, { y: -100, opacity: 0 });
  gsap.set(r, { y: -200, opacity: 0 });
  gsap.set(l, { y: 200, opacity: 0 });
  gsap.set(arrow, { x: 60, opacity: 0 });
  document.addEventListener("ng:ready", () => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline();
      tl.to([...r, ...l], { y: 0, opacity: 1, duration: 0.8, ease }, 0.2);
      tl.to(catchEl, { y: 0, opacity: 1, duration: 0.6, ease }, 1);
      items.forEach((el, i) => tl.to(el, { y: 0, opacity: 1, duration: 0.6, ease }, 1.2 + 0.2 * i));
      dias.forEach((el, i) => tl.to(el, { opacity: 1, duration: 0.4, ease: "none" }, 2 + 0.1 * i));
      tl.to(arrow, { x: 0, opacity: 1, duration: 0.6, ease }, 3.4);
      return () => tl.kill();
    });
  }, { once: true });
})();
