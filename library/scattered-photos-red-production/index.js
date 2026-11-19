// Hero loader: the logo on a white curtain stays .3s, closes in .5s and reopens in .5s → .2s later the curtain lifts and the menu row descends from −21vh in .8s.
// The photo scatter is run by the scatter-drift-field part, counting 1.4s from the same signal (sn:loaded). Pressing sends the menu row out to −30vh after 1s
(() => {
  const { seek, logos, ce } = window.snSite;
  const loader = document.querySelector(".sn-loader");
  const nav = document.querySelector(".sn-stage .sn-nav");
  const stage = document.querySelector(".sn-stage");
  const logo = logos.get(document.querySelector(".sn-loader [data-sn-logo]"));
  const wide = matchMedia("(min-width: 768px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!wide || reduce) gsap.set(loader, { display: "none" });
  else gsap.set(nav, { y: () => -0.21 * innerHeight });

  const start = () => {
    document.dispatchEvent(new Event("sn:loaded"));
    if (!wide || reduce) return;
    gsap.timeline()
      .call(() => seek(logo, 1, 0.5), null, 0.3)
      .call(() => seek(logo, 0, 0.5), null, 0.8)
      .set(loader, { display: "none" }, 1.5)
      .to(nav, { y: 0, duration: 0.8, ease: ce("0.215,0.61,0.355,1", "power3.out") }, 1.5);
  };
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });

  stage.addEventListener("fx:gather", () => {
    if (reduce) return;
    gsap.to(nav, { y: () => -0.3 * innerHeight, duration: 0.5, delay: 1, ease: ce("0.55,0.055,0.675,0.19", "power2.in") });
  });
})();
