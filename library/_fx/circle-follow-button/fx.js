(() => {
  // At the spot where the pointer entered (% within the button), a circle of 2× diameter is placed and grown to fill in 1.25s. When moving inside, the circle center follows in .5s,
  // On exit, the circle is pushed out past the exit edge (±25%) and shrinks in .45s. The background swells to 1.065×1.095 on a spring curve (CSS)
  kfFx.register("circle-follow-button", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    let clip = el.querySelector('[data-fx-part="circle"]');
    const made = !clip;
    if (made) {
      clip = document.createElement("span");
      clip.setAttribute("data-fx-part", "circle");
      el.prepend(clip);
    }
    if (!clip.firstElementChild) clip.innerHTML = "<i><b></b></i>";
    const wrap = clip.firstElementChild;
    const ease = kfFx.ease(options.ease || "0.32,0.72,0,1", "expo.out");
    const grow = +(options.grow ?? 1.25), shrink = +(options.shrink ?? 0.45), follow = +(options.follow ?? 0.5);
    const setX = gsap.quickSetter(wrap, "xPercent"), setY = gsap.quickSetter(wrap, "yPercent");
    gsap.set(wrap, { scale: 0 });
    const at = (e) => {
      const r = el.getBoundingClientRect();
      return { x: gsap.utils.clamp(0, 100, ((e.clientX - r.left) / r.width) * 100), y: gsap.utils.clamp(0, 100, ((e.clientY - r.top) / r.height) * 100) };
    };
    const enter = (e) => { const p = at(e); setX(p.x); setY(p.y); gsap.to(wrap, { scale: 1, duration: grow, ease, overwrite: "auto" }); };
    const leave = (e) => {
      const p = at(e);
      gsap.killTweensOf(wrap);
      const out = (v) => (v > 90 ? v + 25 : v < 12.5 ? v - 25 : v);
      gsap.to(wrap, { xPercent: out(p.x), yPercent: out(p.y), scale: 0, duration: shrink, ease, overwrite: "auto" });
    };
    const move = (e) => { const p = at(e); gsap.to(wrap, { xPercent: p.x, yPercent: p.y, duration: follow, ease: "power1", overwrite: "auto" }); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointermove", move);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointermove", move);
      gsap.killTweensOf(wrap);
      if (made) wrap.remove(); else gsap.set(wrap, { clearProps: "all" });
    };
  });
})();
