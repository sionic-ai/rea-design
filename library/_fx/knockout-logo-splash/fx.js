// Hero splash — over the white curtain (mix-blend lighten) only the black logo area shows the photo below. The photo shrinks from 5× to 2.8× (4s linear)
// Logo letters rise from 10px below in turn at .5s (3.6s back(2)) while the ridgeline is drawn from the left (2s). At 5s the curtain lifts in 1s and the photo goes from 1.3x to 1x (6s power4.out),
// The white logo lights up at 5.3s over 2s. The whole is fit to total seconds (default 9 — the original 11s made 1.22x faster). fx:done fires when the curtain starts lifting
(() => {
  kfFx.register("knockout-logo-splash", (el, { options, reduce }) => {
    const q = (p) => el.querySelector(`[data-fx-part="${p}"]`);
    const photo = q("photo"), veil = q("veil");
    if (!photo || !veil) return;
    const mark = q("mark");
    const letters = [...veil.querySelectorAll('[data-fx-part="letter"]')];
    const stroke = veil.querySelector('[data-fx-part="stroke"]'), sub = veil.querySelector('[data-fx-part="sub"]');
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    if (reduce) {
      gsap.set(veil, { autoAlpha: 0 });
      if (mark) gsap.set(mark, { autoAlpha: 1 });
      done();
      return () => gsap.set([veil, mark].filter(Boolean), { clearProps: "all" });
    }
    const total = +(options.total ?? 9), from = +(options.from ?? 5), mid = +(options.mid ?? 2.8), settle = +(options.settle ?? 1.3);
    if (letters.length) gsap.set(letters, { opacity: 0, y: 10 });
    if (stroke) gsap.set(stroke, { clipPath: "inset(0 100% 0 0)" });
    if (sub) gsap.set(sub, { opacity: 0 });
    if (mark) gsap.set(mark, { autoAlpha: 0 });
    const tl = gsap.timeline({ paused: true });
    if (letters.length) tl.to(letters, { duration: 3.6, opacity: 1, y: 0, ease: "back(2)", stagger: 0.5 }, "m");
    tl.fromTo(photo, { scale: from }, { duration: 4, scale: mid, ease: "none" }, "m");
    if (stroke) tl.to(stroke, { duration: 2, clipPath: "inset(0 0% 0 0)", ease: "power1.out" }, "m+=.5");
    if (sub) tl.to(sub, { duration: 1, opacity: 1 }, "m+=1.5");
    tl.fromTo(photo, { scale: settle }, { duration: 6, scale: 1, ease: "power4.out", immediateRender: false, onStart: done }, "m+=5")
      .to(veil, { duration: 1, autoAlpha: 0, ease: "power1.out" }, "m+=5");
    if (mark) tl.to(mark, { duration: 2, autoAlpha: 1, ease: "power1.out" }, "m+=5.3");
    if (total > 0) tl.totalDuration(total);
    const ready = document.fonts ? document.fonts.ready : Promise.resolve();
    let alive = true;
    ready.then(() => alive && tl.play());
    return () => {
      alive = false;
      tl.kill();
      gsap.set([photo, veil, mark, stroke, sub, ...letters].filter(Boolean), { clearProps: "all" });
    };
  });
})();
