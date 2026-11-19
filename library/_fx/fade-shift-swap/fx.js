(() => {
  // Text in two layers — the upper layer fades half a line upward and leaves, the lower layer rises in from half a line below. If it returns within .4s after leaving, it waits out the remainder (original e·o classes).
  kfFx.register("fade-shift-swap", (el, { options, reduce, hover }) => {
    const label = el.querySelector('[data-fx-part="label"]');
    if (!label || reduce) return;
    let twin = el.querySelector('[data-fx-part="twin"]');
    const made = !twin;
    if (made) {
      twin = label.cloneNode(true);
      twin.setAttribute("data-fx-part", "twin");
      twin.setAttribute("aria-hidden", "true");
      label.after(twin);
    }
    const hold = +(options.hold ?? 0.4) * 1000;
    let tOut = 0, tIn = 0;
    const enter = () => {
      clearTimeout(tIn);
      if (el.classList.contains("fx-fade-shift-swap-o")) tIn = setTimeout(() => el.classList.add("fx-fade-shift-swap-e"), hold);
      else el.classList.add("fx-fade-shift-swap-e");
    };
    const leave = () => {
      clearTimeout(tIn); clearTimeout(tOut);
      if (!el.classList.contains("fx-fade-shift-swap-e")) return;
      el.classList.add("fx-fade-shift-swap-o");
      el.classList.remove("fx-fade-shift-swap-e");
      tOut = setTimeout(() => el.classList.remove("fx-fade-shift-swap-o"), hold);
    };
    if (hover) { el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); }
    el.addEventListener("focusin", enter);
    el.addEventListener("focusout", leave);
    return () => {
      clearTimeout(tIn); clearTimeout(tOut);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", enter);
      el.removeEventListener("focusout", leave);
      el.classList.remove("fx-fade-shift-swap-e", "fx-fade-shift-swap-o");
      if (made) twin.remove();
    };
  });
})();
