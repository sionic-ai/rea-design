// Menu page: pin the circle window and grow the circle while unfolding the clip-path circle — original values as is (phone 66vw→140vw · 50%→120%, wide screen 46.2vh→130vh · 50%→100%, scrub .5).
(() => {
  const wrap = document.querySelector(".z-hero__wrap");
  const pic = document.querySelector(".z-hero__pic");
  if (!wrap || !pic) return;
  const grow = (from, to) => () => {
    gsap.fromTo(pic, { width: from[0], height: from[0], "--circle": from[1] }, {
      width: to[0],
      height: to[0],
      "--circle": to[1],
      scrollTrigger: { trigger: wrap, start: "top top", end: "bottom center", scrub: 0.5, pin: wrap },
    });
  };
  const mm = gsap.matchMedia();
  mm.add("(max-width: 751px) and (prefers-reduced-motion: no-preference)", grow(["66vw", "50%"], ["140vw", "120%"]));
  mm.add("(min-width: 752px) and (prefers-reduced-motion: no-preference)", grow(["46.2vh", "50%"], ["130vh", "100%"]));
})();
