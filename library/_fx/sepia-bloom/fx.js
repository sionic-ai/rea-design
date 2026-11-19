(() => {
  // A panel held in faded sepia/gray is released to its own color over dur after a delay — the start of an old photo coming alive.
  // on: event means it starts when a fx:bloom event arrives on the document (such as the moment the first popup closes).
  kfFx.register("sepia-bloom", (el, { options, reduce }) => {
    const sepia = +(options.sepia ?? .5), gray = +(options.gray ?? 70);
    const dur = +(options.dur ?? 2), delay = +(options.delay ?? 4);
    const ease = kfFx.ease(options.ease || "0.215,0.61,0.355,1", "cubic.out");
    const to = "sepia(0) grayscale(0%)";
    if (reduce) { gsap.set(el, { filter: to }); return () => gsap.set(el, { clearProps: "filter" }); }
    gsap.set(el, { filter: `sepia(${sepia}) grayscale(${gray}%)` });
    let tw;
    const start = () => { tw = gsap.to(el, { duration: dur, delay, filter: to, ease }); };
    if (options.on === "event") document.addEventListener("fx:bloom", start, { once: true });
    else start();
    return () => { document.removeEventListener("fx:bloom", start); tw?.kill(); gsap.set(el, { clearProps: "filter" }); };
  });
})();
