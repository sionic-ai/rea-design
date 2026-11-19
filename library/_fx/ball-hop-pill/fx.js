// The dot of the pill button bounces twice over the letters to the end, the letter where the dot lands flattens then springs back, and a small graphic stands on top of it
(() => {
  const mk = (cls, text) => Object.assign(document.createElement("span"), { className: cls, textContent: text || "" });
  kfFx.register("ball-hop-pill", (el, { options, reduce, hover }) => {
    const label = el.querySelector('[data-fx-part="label"]') || el;
    const word = (label.textContent || "").trim();
    if (!word) return;
    const keep = label.innerHTML;
    const k = Math.max(0, Math.min(+(options.char ?? 2), word.length - 1));
    const ball = mk("fx-bhp-ball"), text = mk("fx-bhp-text"), ch = mk("fx-bhp-char", word[k]);
    label.textContent = "";
    label.classList.add("fx-bhp-label");
    text.append(word.slice(0, k), ch, word.slice(k + 1));
    label.append(ball, text);
    const rider = el.querySelector('[data-fx-part="rider"]');
    let mask = null;
    if (rider) {
      mask = mk("fx-bhp-mask");
      rider.replaceWith(mask);
      mask.append(rider);
    }
    const drop = +(options.drop ?? 45), shift = +(options.shift ?? 10), m = +(options.dur ?? 0.55), f = m / 4;
    let tl = null, at = 0;
    const tidy = () => {
      if (tl) tl.kill();
      if (rider) { gsap.set(rider, { clearProps: "transform" }); mask.replaceWith(rider); }
      label.innerHTML = keep;
      label.classList.remove("fx-bhp-label");
    };
    if (reduce || !hover) return tidy;
    if (rider) gsap.set(rider, { y: drop, rotation: 40 * Math.random() - 20 });
    // Original (Brand hA): the dot bounces twice at half the remaining distance (.1375s cubic.out/in), sides move straight .275s each, and the letter squashes flat for .11s after .22s, then restores
    const enter = () => {
      if (tl) tl.kill();
      const n = el.getBoundingClientRect(), i = label.getBoundingClientRect(), a = ch.getBoundingClientRect();
      const s = a.x - i.x + 0.5 * a.width - 5, o = i.width - 1;
      at = a.x - n.x - 2;
      tl = gsap.timeline()
        .to(text, { x: -shift, duration: m, ease: "expo.out" }, 0)
        .to(ball, { y: -s / 2, duration: f, ease: "cubic.out" }, 0)
        .to(ball, { y: 0, duration: f, ease: "cubic.in" }, f)
        .to(ball, { y: -(o - s) / 2, duration: f, ease: "cubic.out" }, 2 * f)
        .to(ball, { y: 0, duration: f, ease: "cubic.in" }, 3 * f)
        .to(ball, { x: s, duration: 2 * f, ease: "none" }, 0)
        .to(ball, { x: o, duration: 2 * f, ease: "none" }, 2 * f)
        .to(ch, { scaleY: 0, duration: 0.2 * m, ease: "cubic.out" }, 0.4 * m)
        .to(ch, { scaleY: 1, duration: 0.2 * m, ease: "cubic.out" }, 0.6 * m);
      if (rider) {
        gsap.set(mask, { x: at });
        tl.to(mask, { x: at - shift, duration: m, ease: "expo.out" }, 0).fromTo(rider, { y: drop }, { y: 0, rotation: 0, duration: 0.4 * m, ease: "back.out(2)" }, 2 * f);
      }
    };
    // On release the dot bends down by half its width and returns in .35s, the image drops in .175s sine.in and next time rises at a different tilt
    const leave = () => {
      if (tl) tl.kill();
      const s = 0.5 * (label.getBoundingClientRect().width - 1);
      tl = gsap.timeline()
        .to(ball, { y: s, duration: 0.175, ease: "sine.out" }, 0)
        .to(ball, { y: 0, duration: 0.175, ease: "sine.in" }, 0.175)
        .to(ball, { x: 0, duration: 0.35, ease: "sine.inOut" }, 0)
        .to(text, { x: 0, duration: 0.35, ease: "expo.out" }, 0)
        .to(ch, { scaleY: 1, duration: 0.175, ease: "cubic.out" }, 0);
      if (rider) tl.to(mask, { x: at, duration: 0.35, ease: "expo.out" }, 0).to(rider, { y: drop, rotation: 0, duration: 0.175, ease: "sine.in", onComplete: () => gsap.set(rider, { rotation: 40 * Math.random() - 20 }) }, 0);
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); tidy(); };
  });
})();
