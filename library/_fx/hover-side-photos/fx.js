// Hovering a list row randomly tilts (−10~10°) two photos hidden on both sides of the row and brings them up from 10~20% below to −20~10%, appearing in .5s power2.out —
// Left is .1s late, right comes .2s after that. On release it rewinds the same path at double speed. On devices without hover, the photo is kept hidden.
(() => {
  const rnd = (a, b) => a + Math.random() * (b - a);
  kfFx.register("hover-side-photos", (el, { options, reduce, hover }) => {
    const left = el.querySelector('[data-fx-part="left"]'), right = el.querySelector('[data-fx-part="right"]');
    const pics = [left, right].filter(Boolean);
    if (!pics.length || !hover) return;
    const dur = +(options.dur ?? 0.5), back = +(options.back ?? 2);
    const tilt = +(options.tilt ?? 10), from = [10, 20], to = [-20, 10];
    gsap.set(pics, { autoAlpha: 0, rotate: 0, yPercent: () => rnd(...from) });
    const tl = gsap.timeline({ paused: true });
    pics.forEach((p, i) => tl.to(p, { autoAlpha: 1, rotate: () => rnd(-tilt, tilt), yPercent: () => rnd(...to), duration: reduce ? 0 : dur, ease: "power2.out", delay: i ? 0 : 0.1 }, i ? "<+0.2" : 0));
    const on = () => tl.timeScale(1).play();
    const off = () => tl.timeScale(back).reverse();
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    return () => { el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off); tl.kill(); gsap.set(pics, { clearProps: "opacity,visibility,transform" }); };
  });
})();
