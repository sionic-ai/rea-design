// Venue and time info — when the first scene ends, the text shaped masks grow in .8s elastic.out(1, .6) with a .12s stagger, opening the photo strip as a letter silhouette.
// The ”Next Event” title drops from above, gets squashed and stands, the round-line letters bounce up from below at .02s stagger, and the venue grows from 0 with elastic.out(1, .3)
(() => {
  const { reduce, subReady } = window.dSite;
  const masks = document.querySelectorAll(".a-fv__mask");
  if (!reduce) {
    gsap.set(masks, { webkitMaskSize: "0% auto", maskSize: "0% auto" });
    subReady.then(() => gsap.to(masks, { webkitMaskSize: "100% auto", maskSize: "100% auto", duration: 0.8, ease: "elastic.out(1, 0.6)", stagger: 0.12 }));
  }
  const next = document.querySelector(".a-next");
  if (!next || reduce) return;
  const head = next.querySelector(".a-next__headline"), place = next.querySelector(".a-next__place"), chars = next.querySelectorAll(".a-next__char-inner");
  gsap.set([head, place], { opacity: 0 });
  gsap.set(chars, { opacity: 0 });
  const tl = gsap.timeline({ scrollTrigger: { trigger: next, start: "top 80%" } });
  tl.to(head, { keyframes: { 0: { opacity: 0, yPercent: -100, scaleX: 1, scaleY: 1 }, 20: { opacity: 1 }, 80: { yPercent: 20, scaleX: 1.2, scaleY: 0.6, transformOrigin: "bottom center" }, 100: { opacity: 1, yPercent: 0, scaleX: 1, scaleY: 1 } }, duration: 0.6, ease: "doubleSineOut" });
  tl.to(chars, { keyframes: { 0: { opacity: 0, yPercent: 60, scaleX: 1, scaleY: 1 }, 40: { opacity: 1 }, 80: { yPercent: -10, scaleX: 1.3, scaleY: 0.7, transformOrigin: "top center" }, 100: { opacity: 1, yPercent: 0, scaleX: 1, scaleY: 1 } }, stagger: 0.02, duration: 0.6, ease: "doubleSineOut" }, "-=0.3");
  tl.fromTo(place, { opacity: 1, scale: 0 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.3)" }, "-=0.2");
})();
