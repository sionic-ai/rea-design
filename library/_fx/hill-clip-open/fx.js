// The board’s bottom edge is folded up, then opens by lowering in a hill-curve (polygon) shape — in the same place as the Hero photo curtain.
(() => {
  // Original Hero curve at 1366 and up — an asymmetric hill that descends from bottom right to left and rises again (x,y %)
  const HILL_TO = "100,100 96.151,96.507 92.04,92.831 87.683,89.051 83.094,85.242 78.289,81.481 73.283,77.847 68.091,74.414 62.729,71.262 57.212,68.466 51.554,66.103 51.554,66.103 48.01,64.951 44.638,64.149 41.461,63.65 38.502,63.405 35.786,63.365 33.334,63.485 31.169,63.715 29.316,64.007 27.796,64.314 26.633,64.589 26.633,64.589 21.452,66.198 16.854,68.222 12.831,70.523 9.373,72.964 6.472,75.407 4.118,77.714 2.303,79.748 1.018,81.371 .253,82.446 0,82.835";
  const HILL_FROM = "100,0 96.151,0 92.04,0 87.683,0 83.094,0 78.289,0 73.283,0 68.091,0 62.729,0 57.212,0 51.554,0 51.554,0 48.01,0 44.638,0 41.461,0 38.502,0 35.786,0 33.334,0 31.169,0 29.316,0 27.796,0 26.633,0 26.633,0 21.452,0 16.854,0 12.831,0 9.373,0 6.472,0 4.118,0 2.303,0 0,0 0,0 0,100";
  const poly = (s) => "polygon(0 0, 100% 0, 100% 100%, " + s.trim().split(/\s+/).map((p) => p.split(",").map((v) => (+v === 0 ? "0" : v + "%")).join(" ")).join(", ") + ")";
  kfFx.register("hill-clip-open", (el, { options, reduce }) => {
    const to = poly(options.to || HILL_TO);
    // Without a start type, y is folded to 0 at the same x
    const from = poly(options.from || (options.to ? options.to.trim().split(/\s+/).map((p) => p.split(",")[0] + ",0").join(" ") : HILL_FROM));
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    const key = options.session;
    if (reduce || (key && sessionStorage.getItem(key))) { gsap.set(el, { clipPath: to }); done(); return () => gsap.set(el, { clearProps: "clipPath" }); }
    if (key) sessionStorage.setItem(key, "1");
    const tw = gsap.fromTo(el, { clipPath: from }, {
      clipPath: to, duration: +(options.dur ?? 1.2), delay: +(options.delay ?? 2),
      ease: kfFx.ease(options.ease || "0.67,0.27,0.39,0.99", "power2.inOut"), onComplete: done,
    });
    return () => { tw.kill(); gsap.set(el, { clearProps: "clipPath" }); };
  });
})();
