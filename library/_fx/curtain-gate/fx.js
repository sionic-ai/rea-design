// Pressing the button in front of the left and right curtains opens the curtains to both sides while the group disappears, and once they are open the group exits upward (original IX2 values)
(() => {
  kfFx.register("curtain-gate", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const left = part("left"), right = part("right"), gate = part("gate"), enter = part("enter");
    if (!enter) return;
    const dur = +(options.dur ?? 1.5), fade = +(options.fade ?? 0.5), lift = +(options.lift ?? 0.5);
    const ease = kfFx.ease(options.ease || "power2.in", "power2.in");
    let tl;
    const open = () => {
      if (tl) return;
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
      const k = reduce ? 0 : 1;
      tl = gsap.timeline({ onComplete: () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })) });
      if (gate) tl.to(gate, { opacity: 0, duration: fade * k, ease: kfFx.ease("0.25,0.1,0.25,1", "power1.inOut") }, 0);
      if (left) tl.to(left, { xPercent: -105, duration: dur * k, ease }, 0);
      if (right) tl.to(right, { xPercent: 105, duration: dur * k, ease }, 0);
      if (gate) tl.to(gate, { yPercent: -100, duration: lift * k, ease: "none" }, Math.max(dur, fade) * k).set(gate, { visibility: "hidden" });
    };
    enter.addEventListener("click", open);
    return () => {
      enter.removeEventListener("click", open);
      tl && tl.revert();
    };
  });
})();
