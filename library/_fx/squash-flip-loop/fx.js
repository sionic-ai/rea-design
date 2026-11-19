(() => {
  // The image flattens horizontally to .02 (.3s power2.in) then unfolds into another image (the back — if none, the same image flipped left to right) (.3s power2.out), and after resting .5s
  // Returns along the same path. Runs once, rests for rest seconds, then repeats — starts on entering the screen and stops on leaving
  kfFx.register("squash-flip-loop", (el, { options, reduce }) => {
    const front = el.querySelector('[data-fx-part="front"]') || el.firstElementChild;
    if (!front || reduce) return;
    // If there’s no back face, clone the front image and stack a horizontally flipped copy — swap the two with transparency like the original, so the scale stays positive during the turn
    let back = el.querySelector('[data-fx-part="back"]'), made = null;
    if (!back) {
      made = document.createElement("div");
      made.setAttribute("data-fx-part", "back");
      made.setAttribute("aria-hidden", "true");
      const copy = front.cloneNode(true);
      copy.removeAttribute("data-fx-part");
      copy.style.transform = "scaleX(-1)";
      made.append(copy);
      el.append(made);
      back = made;
    }
    const squash = +(options.squash ?? 0.02), dur = +(options.dur ?? 0.3), hold = +(options.hold ?? 0.5), rest = +(options.rest ?? 3);
    const origin = { transformOrigin: options.origin || "50% 50%" };
    const a = front, b = back;
    gsap.set(b, { autoAlpha: 0 });
    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: rest });
    tl.to(a, { scaleX: squash, duration: dur, ease: "power2.in", ...origin })
      .set(a, { autoAlpha: 0 }).set(b, { autoAlpha: 1, scaleX: squash, ...origin })
      .to(b, { scaleX: 1, duration: dur, ease: "power2.out", ...origin })
      .to({}, { duration: hold })
      .to(b, { scaleX: squash, duration: dur, ease: "power2.in", ...origin })
      .set(b, { autoAlpha: 0 }).set(a, { autoAlpha: 1, scaleX: squash, ...origin })
      .to(a, { scaleX: 1, duration: dur, ease: "power2.out", ...origin });
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()));
    io.observe(el);
    return () => { io.disconnect(); tl.kill(); gsap.set([a, b], { clearProps: "transform,opacity,visibility" }); made?.remove(); };
  });
})();
