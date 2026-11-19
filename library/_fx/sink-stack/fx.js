// While the next panel’s (immediate sibling) top edge travels from the bottom of the screen to the top, this panel’s contents are pulled down by screen height × rate — the next panel covers the previous one sinking at half speed.
// If progress is 0, remove the transform (the original places it directly in onUpdate to avoid a leftover translate3d(0,0,0) outside the range that breaks fixed children)
(() => {
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  kfFx.register("sink-stack", (el, { options, reduce, scroller }) => {
    if (reduce || !window.ScrollTrigger) return;
    if (options.touch !== "true" && mobileUA.test(navigator.userAgent)) return;
    const next = (options.next && document.querySelector(options.next)) || el.nextElementSibling;
    const item = el.querySelector(':scope > [data-fx-part="item"]') || el.firstElementChild;
    if (!next || !item) return;
    const rate = +(options.rate ?? 0.5);
    el.classList.add("fx-sink-on");
    const st = ScrollTrigger.create({
      trigger: next,
      scroller,
      start: "top bottom",
      end: "top top",
      onUpdate(self) {
        if (self.progress === 0) gsap.set(item, { clearProps: "transform" });
        else gsap.set(item, { y: self.progress * innerHeight * rate, z: 0 });
      },
      onLeaveBack: () => gsap.set(item, { clearProps: "transform" }),
    });
    return () => { st.kill(); gsap.set(item, { clearProps: "transform" }); el.classList.remove("fx-sink-on"); };
  });
})();
