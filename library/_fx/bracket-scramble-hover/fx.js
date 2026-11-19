// When the pointer enters, the text empties and is rewritten with shuffled letters — the width is fixed first so neighboring letters don’t shift.
// If there are bracket children, keep it on while shuffling (even if the hand leaves first)
(() => {
  kfFx.register("bracket-scramble-hover", (el, { options, reduce, hover }) => {
    const label = el.querySelector("[data-fx-part=label]") || (el.children.length ? null : el);
    if (!label || reduce || !hover) return;
    const text = label.textContent;
    if (!text.trim()) return;
    const trigger = (options.group && el.closest(options.group)) || el;
    const dur = +(options.dur ?? 0.8);
    const delay = +(options.delay ?? 0.1);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const chars = options.chars || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const enter = () => {
      if (typeof ScrambleTextPlugin === "undefined") return;
      gsap.registerPlugin(ScrambleTextPlugin);
      gsap.set(label, { display: "inline-block", width: label.getBoundingClientRect().width, whiteSpace: "nowrap" });
      label.textContent = "";
      el.classList.add("is-scrambling");
      gsap.to(label, {
        duration: dur, delay, ease, overwrite: true,
        scrambleText: { text, chars, speed: 1 },
        onComplete: () => { gsap.set(label, { clearProps: "display,width,whiteSpace" }); el.classList.remove("is-scrambling"); },
      });
    };
    trigger.addEventListener("pointerenter", enter);
    return () => {
      trigger.removeEventListener("pointerenter", enter);
      gsap.killTweensOf(label);
      label.textContent = text;
      gsap.set(label, { clearProps: "display,width,whiteSpace" });
      el.classList.remove("is-scrambling");
    };
  });
})();
