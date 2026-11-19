// Inner text shows only inside the round glow around the cursor — the mask position is moved with element coordinates --fx-mx·--fx-my. Touch devices show everything without the mask, as in the original
(() => {
  kfFx.register("torch-reveal", (el, { options, hover }) => {
    if (!hover) { el.classList.add("is-bare"); return () => el.classList.remove("is-bare"); }
    if (options.r != null) el.style.setProperty("--fx-r", `${+options.r}px`);
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--fx-mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--fx-my", `${e.clientY - r.top}px`);
    };
    addEventListener("pointermove", move, { passive: true });
    // With fade, the cursor turns on for that duration only while inside the wrapper (parent) — Brand footer grid
    const fade = options.fade != null ? +options.fade : null, host = fade != null ? el.parentElement : null;
    const show = () => { el.style.opacity = "1"; }, hide = () => { el.style.opacity = "0"; };
    if (host) {
      el.style.opacity = "0";
      el.style.transition = `opacity ${fade}s ease`;
      host.addEventListener("pointerenter", show);
      host.addEventListener("pointerleave", hide);
    }
    return () => {
      removeEventListener("pointermove", move);
      if (host) { host.removeEventListener("pointerenter", show); host.removeEventListener("pointerleave", hide); el.style.removeProperty("opacity"); el.style.removeProperty("transition"); }
      ["--fx-mx", "--fx-my", "--fx-r"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
