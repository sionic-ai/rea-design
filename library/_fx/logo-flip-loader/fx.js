// Logo flip loader — while the logo at the cover’s center stands once on the X axis and flips over (from the .5s point), the cover lifts from bottom to top
(() => {
  kfFx.register("logo-flip-loader", (root, { options, reduce }) => {
    const mark = root.querySelector('[data-fx-part="mark"]');
    const emit = (n) => root.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const done = () => { root.hidden = true; emit("fx:done"); };
    if (reduce) { const t = setTimeout(() => { emit("fx:lift"); done(); }, 0); return () => clearTimeout(t); }
    const flip = +(options.flip ?? 1), lift = +(options.lift ?? 2), at = +(options.at ?? 0.5);
    const ease = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    const tl = gsap.timeline({ delay: +(options.delay ?? 0) });
    if (mark) {
      tl.set(mark, { opacity: 1 })
        .fromTo(mark, { rotationX: -90, yPercent: 100 }, { rotationX: 0, yPercent: 0, duration: flip, ease: "power3", transformPerspective: 800 })
        .to(mark, { rotationX: 90, yPercent: -80, duration: flip, ease: "power3", transformPerspective: 800 });
    }
    tl.add(() => emit("fx:lift"), at)
      .to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: lift, ease, onComplete: done }, at);
    return () => { tl.kill(); root.hidden = false; gsap.set([root, mark].filter(Boolean), { clearProps: "all" }); };
  });
})();
