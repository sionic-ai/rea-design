// A white circle at the center of the accent-color curtain bursts to twice the screen height, the logo vanishes, and the curtain lifts — only on first open in a tab (Brand .js-loading)
(() => {
  kfFx.register("circle-burst-loader", (el, { options, reduce }) => {
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const start = +(options.start ?? 1), hold = +(options.hold ?? 2), grow = +(options.grow ?? 0.6);
    const fadeAt = +(options["fade-at"] ?? 3), fade = +(options.fade ?? 0.4);
    const key = options.key || "fx-circle-burst";
    let seen = false;
    if (options.once !== "none") {
      try { seen = !!sessionStorage.getItem(key); sessionStorage.setItem(key, "1"); } catch (e) { seen = false; }
    }
    if (reduce || seen) {
      const t = gsap.delayedCall(reduce ? 0 : start, () => { fire("fx:open"); fire("fx:done"); });
      return () => t.kill();
    }
    const logo = el.querySelector('[data-fx-part="logo"]'), circle = el.querySelector('[data-fx-part="circle"]');
    const ease = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    el.classList.add("is-fx-on");
    const tl = gsap.timeline({ delay: start, onComplete: () => { el.classList.remove("is-fx-on"); fire("fx:done"); } });
    tl.call(() => fire("fx:open"), null, 0);
    if (circle) tl.to(circle, { width: "200vh", height: "200vh", duration: grow, ease }, hold);
    if (logo) tl.to(logo, { opacity: 0, duration: grow, ease }, hold);
    tl.to(el, { opacity: 0, duration: fade, ease }, fadeAt);
    tl.set(el, { pointerEvents: "none" }, fadeAt);
    return () => {
      tl.kill();
      el.classList.remove("is-fx-on");
      gsap.set([el, logo, circle].filter(Boolean), { clearProps: "opacity,width,height,pointerEvents" });
    };
  });
})();
