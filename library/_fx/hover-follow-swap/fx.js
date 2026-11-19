// Hovering a card makes a second photo box (220px) appear inside it at the cursor spot with .7s power4.out, then trail the cursor with a lag,
// Background photo scales up 1.2x over 1s power4.out. On release the square vanishes in 1s and the photo returns to its size. On devices without a pointer nothing is attached.
(() => {
  kfFx.register("hover-follow-swap", (el, { options, reduce, hover }) => {
    const chip = el.querySelector('[data-fx-part="chip"]');
    const img = el.querySelector('[data-fx-part="image"]');
    if (!chip || reduce || !hover || !window.gsap) return;
    const size = +(options.size ?? 220), zoom = +(options.zoom ?? 1.2);
    const fin = +(options.in ?? 0.7), fout = +(options.out ?? 1), zdur = +(options["zoom-dur"] ?? 1);
    const ease = kfFx.ease(options.ease || "power4.out", "power4.out");
    gsap.set(chip, { width: size, height: size, position: "absolute", top: 0, left: 0, marginLeft: -size / 2, marginTop: -size / 2, opacity: 0, pointerEvents: "none" });
    const at = (e) => { const r = el.getBoundingClientRect(); return { left: e.clientX - r.left, top: e.clientY - r.top }; };
    const enter = (e) => {
      gsap.set(chip, at(e));
      gsap.to(chip, { opacity: 1, duration: fin, ease });
      if (img) gsap.to(img, { scale: zoom, duration: zdur, ease });
    };
    const leave = () => {
      gsap.to(chip, { opacity: 0, duration: fout, ease });
      if (img) gsap.to(img, { scale: 1, duration: zdur, ease });
    };
    const move = (e) => gsap.to(chip, { ...at(e), duration: fin, ease });
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("mousemove", move);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("mousemove", move);
      gsap.killTweensOf([chip, img].filter(Boolean));
      gsap.set([chip, img].filter(Boolean), { clearProps: "all" });
    };
  });
})();
