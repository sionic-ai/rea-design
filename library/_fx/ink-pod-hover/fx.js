(() => {
  // Before the first touch, no shrinking animation is applied — if applied, a blob visibly shrinks once right on open (the original js-hover -animate)
  kfFx.register("ink-pod-hover", (el, { hover }) => {
    if (!hover) return;
    const arm = () => el.classList.add("is-pod-armed");
    el.addEventListener("pointerenter", arm);
    el.addEventListener("focusin", arm);
    return () => {
      el.removeEventListener("pointerenter", arm);
      el.removeEventListener("focusin", arm);
      el.classList.remove("is-pod-armed");
    };
  });
})();
