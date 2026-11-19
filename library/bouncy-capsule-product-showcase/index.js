// Home page cover — exactly the original timeline: after holding .5s (.5 delay) the dot ring and text vanish in .5s, the cover lifts in .5s, then 1s later the ring stops and 1s after that it is sent to the back
(() => {
  const load = document.querySelector(".g-load");
  if (!load) return;
  const bits = load.querySelectorAll(".g-load__wrap > *");
  const run = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.set(load, { opacity: 0, zIndex: -10 }); return; }
    gsap.timeline()
      .to(load, { opacity: 1 })
      .to(bits, { delay: 0.5, duration: 0.5, opacity: 0 })
      .to(load.querySelector(".g-load__wrap"), { duration: 0, opacity: 0 })
      .to(load, { duration: 0.5, opacity: 0 })
      .to(bits, { delay: 1, animationPlayState: "paused" })
      .to(load, { delay: 1, zIndex: -10 });
  };
  if (document.readyState === "complete") run();
  else addEventListener("load", run, { once: true });
})();
