// The line spreads outward as two halves from the center (origin toward the center), and on retract the origin switches to the outer end and the same scaleX goes to 0 — so it is sucked out toward both ends
(() => {
  kfFx.register("split-line-loader", (el, { options, reduce }) => {
    const line = document.createElement("div");
    line.className = "fx-split-line";
    el.append(line);
    const veil = options.veil !== "off";
    const delay = +(options.delay ?? 0.3), grow = +(options.grow ?? 0.3), shrink = +(options.shrink ?? 0.6), open = +(options.open ?? 0.5);
    const say = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    const draw = (tl, wait) => tl
      .set(el, { "--fx-sx": 0, "--fx-lo": "top right", "--fx-ro": "top left" })
      .to(el, { "--fx-sx": 1, duration: grow, ease: "power4.in" }, `+=${wait}`)
      .set(el, { "--fx-lo": "top left", "--fx-ro": "top right" })
      .to(el, { "--fx-sx": 0, duration: shrink, ease: "power4.in" });
    let tl;
    const finish = () => { el.classList.add("is-done"); say("fx:done"); };
    if (reduce || !veil) {
      gsap.set(el, { "--fx-back": 0 });
      finish();
    } else {
      tl = draw(gsap.timeline({ onComplete: finish }).set(el, { "--fx-back": 1 }), delay)
        .to(el, { "--fx-back": 0, duration: open, ease: "power2.out" });
    }
    const cover = () => {
      tl?.kill();
      el.classList.add("is-done", "is-covering");
      gsap.set(el, { "--fx-back": 0 });
      if (reduce) { el.classList.remove("is-covering"); say("fx:covered"); return; }
      tl = draw(gsap.timeline({ onComplete: () => { el.classList.remove("is-covering"); say("fx:covered"); } }), 0);
    };
    el.addEventListener("fx:cover", cover);
    return () => {
      tl?.kill();
      el.removeEventListener("fx:cover", cover);
      line.remove();
      el.classList.remove("is-done", "is-covering");
      gsap.set(el, { clearProps: "--fx-sx,--fx-back,--fx-lo,--fx-ro" });
    };
  });
})();
