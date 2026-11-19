// Logo-open loader: while the logo at the center of the curtain (dark shape over a faint backdrop shape) opens with a clip and the progress line below fills in the same 3s,
// Two words rise from 125% below per letter with .02 stagger, then drop out. After that the content fades out in .5s and the curtain lifts up 101% in 1s — a Brand loader
(() => {
  kfFx.register("logo-clip-loader", (root, { options, reduce }) => {
    const q = (p) => root.querySelector(`[data-fx-part="${p}"]`);
    const box = q("box"), bg = q("bg") || root, bar = q("bar"), logo = q("logo");
    const words = [...root.querySelectorAll('[data-fx-part="word"]')];
    const done = () => { root.hidden = true; root.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce) { const t = setTimeout(done, 0); return () => clearTimeout(t); }
    gsap.registerPlugin(...[window.SplitText, window.CustomEase].filter(Boolean));
    const ease = kfFx.ease(options.ease || "0.65,0.01,0.05,0.99", "power4.inOut"), dur = +(options.dur ?? 3);
    const splits = window.SplitText ? words.map((w) => new SplitText(w, { type: "lines,chars", mask: "lines" })) : [];
    const tl = gsap.timeline({ defaults: { ease, duration: dur }, onComplete: done, delay: +(options.delay ?? 0) });
    if (bar) tl.fromTo(bar, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1 }, 0);
    if (logo) tl.fromTo(logo, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" }, 0);
    // gap — rest from when opening ends until clearing starts. The last word always drops out .5s before clearing (Brand .5)
    tl.add("hide", dur + +(options.gap ?? 0));
    if (box) tl.to(box, { autoAlpha: 0, duration: 0.5 }, "hide");
    if (bar) tl.to(bar, { scaleX: 0, transformOrigin: "right center", duration: 0.5 }, "hide");
    tl.to(bg, { yPercent: -101, duration: 1 }, "hide");
    if (splits.length >= 2) {
      const [a, b] = splits;
      gsap.set([...a.chars, ...b.chars], { autoAlpha: 0, yPercent: 125 });
      tl.to(a.chars, { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 } }, 0)
        .to(a.chars, { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } }, ">+=0.4")
        .to(b.chars, { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 } }, "<")
        .to(b.chars, { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } }, "hide-=0.5");
    }
    return () => { tl.kill(); splits.forEach((s) => s.revert()); root.hidden = false; gsap.set([bg, box, bar, logo].filter(Boolean), { clearProps: "all" }); };
  });
})();
