(() => {
  // Original bounce curve (linear() samples) — overshoots to 1.0315, wobbles once more to .999 and settles
  const BOUNCE = [0, .0083, .0311, .0653, .1085, .1582, .2126, .2699, .3287, .3878, .4461, .5029, .5576, .6095, .6585, .7042, .7464, .7852, .8205, .8524, .8809, .9063, .9286, .9481, .9649, .9793, .9914, 1.0015, 1.0098, 1.0164, 1.0216, 1.0255, 1.0283, 1.0302, 1.0312, 1.0315, 1.0313, 1.0306, 1.0296, 1.0282, 1.0267, 1.025, 1.0232, 1.0213, 1.0195, 1.0176, 1.0158, 1.0141, 1.0124, 1.0109, 1.0094, 1.0081, 1.0069, 1.0057, 1.0047, 1.0038, 1.003, 1.0023, 1.0017, 1.0011, 1.0007, 1.0003, 1, .9997, .9995, .9993, .9992, .9991, .9991, .999, .999, .999, .999, .9991, .9991, .9992, .9992, .9993, .9993, .9994, .9994, .9995, .9996, .9996, .9997, .9997, .9997, .9998, .9998, .9998, .9999, .9999, .9999, .9999, 1];
  const bounce = () => {
    if (!window.CustomEase) return "back.out(1.4)";
    return CustomEase.get("fx-counter-bounce") || CustomEase.create("fx-counter-bounce", BOUNCE.map((v, i) => `${i ? "L" : "M"}${(i / (BOUNCE.length - 1)).toFixed(4)},${v}`).join(" "));
  };

  kfFx.register("counter-wheel", (el, { options, reduce }) => {
    const value = String(options.value ?? el.textContent).replace(/\D/g, "");
    if (!value) return;
    const dur = +(options.dur ?? 1.2), stagger = +(options.stagger ?? 0.05), delay = +(options.delay ?? 0), on = options.on || "load";
    const keep = el.innerHTML;
    el.innerHTML = `<span data-fx-part="wheels" aria-hidden="true">${[...value].map(() => `<span data-fx-part="wheel"><span data-fx-part="strip">${[..."0123456789"].map((d) => `<span>${d}</span>`).join("")}</span></span>`).join("")}</span><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">${value}</span>`;
    const strips = [...el.querySelectorAll('[data-fx-part="strip"]')];
    // If a curve is given, use it (sdb is 0.16,1,0.3,1 · .8s · delay .1s), otherwise use the original bounce
    const ease = options.ease ? kfFx.ease(options.ease, "expo.out") : bounce();
    const roll = (hide = false, wait = delay) => {
      strips.forEach((s, i) => gsap.to(s, { y: hide ? 0 : -Number(value[i]) * s.parentElement.offsetHeight, duration: reduce ? 0 : dur, ease, delay: reduce ? 0 : wait + i * stagger, overwrite: true }));
      gsap.to(el, { opacity: hide ? 0 : 1, duration: reduce ? 0 : hide ? 0.3 : 0.4, ease: "power2.out", delay: reduce ? 0 : wait, overwrite: true });
    };
    // With ”view”, it rolls out when it rises 100px above the screen bottom, and when scrolled back below that it winds back to 0 and hides
    let io = null;
    if (on === "view" && !reduce) {
      gsap.set(el, { opacity: 0 });
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) roll(); else if (e.boundingClientRect.top > 0) roll(true, 0); }, { rootMargin: "0px 0px -100px 0px" });
      io.observe(el);
    } else roll();
    const again = () => { roll(true, 0); roll(false, 0.3); };
    el.addEventListener("fx:roll", again);
    return () => { io && io.disconnect(); el.removeEventListener("fx:roll", again); gsap.killTweensOf([el, ...strips]); gsap.set(el, { clearProps: "opacity" }); el.innerHTML = keep; };
  });
})();
