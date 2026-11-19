(() => {
  // Cube button — a side face with the same text is attached above and below the front face. When the pointer enters the upper half it rolls −90° (top face comes down), and in the lower half 90° (bottom face comes up).
  // On leaving, keeps the face on the entry side and rolls back to 0°. Depth is half the button height (re-measured with ResizeObserver)
  kfFx.register("cube-roll-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !el.textContent.trim()) return;
    const keep = el.innerHTML;
    const face = (part) => `<span data-fx-part="${part}"${part === "front" ? "" : ' aria-hidden="true"'}>${keep}</span>`;
    el.innerHTML = face("top") + face("front") + face("bottom");
    const top = el.querySelector('[data-fx-part="top"]'), bot = el.querySelector('[data-fx-part="bottom"]');
    const inDur = +(options.in ?? 0.6), outDur = +(options.out ?? 0.8);
    const inEase = kfFx.ease(options["in-ease"] || "expo.out", "expo.out"), outEase = kfFx.ease(options["out-ease"] || "expo.inOut", "expo.inOut");
    const setH = () => el.style.setProperty("--fx-h", `${el.offsetHeight}px`);
    setH();
    const ro = new ResizeObserver(setH);
    ro.observe(el);
    let dir = 0;
    const faces = () => { gsap.set(bot, { autoAlpha: dir < 0 ? 0 : 1 }); gsap.set(top, { autoAlpha: dir < 0 ? 1 : 0 }); };
    const roll = (to, duration, ease) => { gsap.killTweensOf(el, "rotateX"); gsap.to(el, { rotateX: to, duration, ease }); };
    const enter = (e) => {
      const r = el.getBoundingClientRect();
      dir = e.clientY < r.top + r.height / 2 ? -90 : 90;
      faces();
      roll(dir, inDur, inEase);
    };
    const leave = () => { faces(); roll(0, outDur, outEase); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      ro.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
      el.style.removeProperty("--fx-h");
      el.innerHTML = keep;
    };
  });
})();
