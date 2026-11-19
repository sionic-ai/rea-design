(() => {
  kfFx.register("shuffle-blink", (el, { options, reduce, hover }) => {
    const text = el.querySelector('[data-fx-part="text"]') || el;
    if (reduce || !text.textContent.trim()) return;
    const was = text.innerHTML;
    text.setAttribute("aria-label", text.textContent.trim());
    text.innerHTML = [...text.textContent].map((c) => `<span class="fx-sb-ch" aria-hidden="true">${c.replace(/[<&]/g, (m) => (m === "<" ? "&lt;" : "&amp;"))}</span>`).join("");
    const chars = [...text.querySelectorAll(".fx-sb-ch")];
    const each = +(options.each ?? 0.05), dur = +(options.dur ?? 0.15);
    const blink = () => {
      gsap.set(chars, { opacity: 0.5, filter: "brightness(0%)" });
      gsap.utils.shuffle(chars.slice()).forEach((c, i) => gsap.to(c, {
        opacity: 1, filter: "brightness(200%)", repeat: 1, yoyo: true, duration: dur, delay: i * each, overwrite: true,
        onComplete: () => gsap.set(c, { opacity: 1, filter: "brightness(100%)" }),
      }));
    };
    const on = hover ? "pointerenter" : "pointerdown";
    el.addEventListener(on, blink);
    el.addEventListener("focus", blink);
    return () => { el.removeEventListener(on, blink); el.removeEventListener("focus", blink); gsap.killTweensOf(chars); text.innerHTML = was; text.removeAttribute("aria-label"); };
  });
})();
