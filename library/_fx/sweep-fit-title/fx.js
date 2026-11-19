(() => {
  kfFx.register("sweep-fit-title", (el, { options, reduce, hover }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    // Even without text, it pushes if there are children like photo cells (photo row round trip)
    if (!text || (!text.textContent.trim() && !text.children.length)) return;
    const per = +(options.speed ?? 4);
    // With dur, the one-way length (seconds) is fixed regardless of text width — so that, like photo rows, it goes back and forth at the same tempo even if the width differs per screen
    const dur = options.dur != null ? +options.dur : null;
    if (options.ease) text.style.setProperty("--fx-ease", options.ease);
    const size = () => {
      const over = text.scrollWidth - el.clientWidth;
      text.style.setProperty("--fx-shift", `${Math.min(0, -over)}px`);
      text.style.setProperty("--fx-dur", `${Math.max(1, Math.round(dur != null ? dur * 1000 : text.scrollWidth * per))}ms`);
      text.toggleAttribute("data-over", over > 1 && !reduce);
    };
    // pause: hover — stops in place when hovered or when focus goes to an inner link, and resumes on release
    const hovered = () => hover && el.matches(":hover");
    const stop = () => text.toggleAttribute("data-paused", true);
    const go = () => text.toggleAttribute("data-paused", el.contains(document.activeElement));
    const blur = () => text.toggleAttribute("data-paused", hovered());
    if (options.pause === "hover") {
      if (hover) { el.addEventListener("pointerenter", stop); el.addEventListener("pointerleave", go); }
      el.addEventListener("focusin", stop);
      el.addEventListener("focusout", blur);
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    ro.observe(text);
    document.fonts?.ready.then(size);
    return () => {
      ro.disconnect();
      el.removeEventListener("pointerenter", stop);
      el.removeEventListener("pointerleave", go);
      el.removeEventListener("focusin", stop);
      el.removeEventListener("focusout", blur);
      text.removeAttribute("data-paused");
      text.style.removeProperty("--fx-ease");
      text.removeAttribute("data-over");
      text.style.removeProperty("--fx-shift");
      text.style.removeProperty("--fx-dur");
    };
  });
})();
