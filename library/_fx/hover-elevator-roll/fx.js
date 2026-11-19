(() => {
  // Original Hover.elevator: the moment a hand hovers, is-hover is added and removed .8s later — re-hovering in the meantime doesn’t restart it from the beginning.
  // Letters slide out upward and come up from below, the arrow exits to the right and enters from the left, and the underline shrinks to the right and is redrawn from the left (css keyframes).
  kfFx.register("hover-elevator-roll", (el, { options, reduce, hover }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    if (!text || reduce || !hover) return;
    let inner = text.querySelector(".fx-her-roll");
    const made = !inner;
    if (made) {
      inner = document.createElement("span");
      inner.className = "fx-her-roll";
      while (text.firstChild) inner.append(text.firstChild);
      text.append(inner);
    }
    const hold = +(options.dur ?? 0.8) * 1000;
    el.style.setProperty("--fx-her-dur", `${hold / 1000}s`);
    let timer = 0;
    const enter = () => {
      if (el.classList.contains("is-hover")) return;
      el.classList.add("is-hover");
      timer = setTimeout(() => el.classList.remove("is-hover"), hold);
    };
    el.addEventListener("pointerenter", enter);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("pointerenter", enter);
      el.classList.remove("is-hover");
      el.style.removeProperty("--fx-her-dur");
      if (made) {
        while (inner.firstChild) text.append(inner.firstChild);
        inner.remove();
      }
    };
  });
})();
