(() => {
  // Original dither intro: a ”[:: CLICK TO ENTER + ENABLE AUDIO ::]” tag waits in the center of the screen, and from the first mouse move
  // Follows the cursor position with a .66s lag (gsap default power1.out). Clicking anywhere sends the tag down 40px with .66s back.in(2) as it vanishes, and fires fx:enter
  kfFx.register("enter-tag-follow", (el, { options, reduce }) => {
    const tag = el.querySelector('[data-fx-part="tag"]');
    if (!tag || !window.gsap) return;
    const lag = +(options.lag ?? 0.66), out = +(options.out ?? 0.66), drop = +(options.drop ?? 40);
    const ease = kfFx.ease(options.ease || "back.in(2)", "back.in(2)");
    const waitReady = options.wait === "ready";
    let ready = !waitReady, moved = false, done = false;
    const place = (x, y, d) => gsap.to(el, { x, y, duration: reduce ? 0 : d, overwrite: "auto" });
    place(window.innerWidth * 0.5, window.innerHeight * 0.5, 0);
    const onMove = (e) => {
      if (done || e.pointerType === "touch") return;
      moved = true;
      place(e.clientX, e.clientY, lag);
    };
    const onResize = () => { if (!moved && !done) place(window.innerWidth * 0.5, window.innerHeight * 0.5, 0); };
    const onReady = () => { ready = true; };
    const onClick = () => {
      if (!ready || done) return;
      done = true;
      el.classList.add("fx-entered");
      gsap.to(tag, { autoAlpha: 0, y: drop, duration: reduce ? 0 : out, ease });
      el.dispatchEvent(new CustomEvent("fx:enter", { bubbles: true }));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("click", onClick);
    if (waitReady) document.addEventListener("fx:ready", onReady);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);
      document.removeEventListener("fx:ready", onReady);
      gsap.killTweensOf([el, tag]);
      gsap.set([el, tag], { clearProps: "transform,opacity,visibility" });
      el.classList.remove("fx-entered");
    };
  });
})();
