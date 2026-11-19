// Card that flips front/back with ”+” — state is a single class is-flip, motion is css (.3s .44,0,.56,1)
(() => {
  kfFx.register("plus-face-card", (el, { options }) => {
    const btn = el.querySelector('[data-fx-part="toggle"]');
    if (!btn) return;
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.shift != null) el.style.setProperty("--fx-shift", `${+options.shift}px`);
    const flip = () => {
      const on = el.classList.toggle("is-flip");
      btn.setAttribute("aria-expanded", String(on));
      el.dispatchEvent(new CustomEvent("fx:flip", { bubbles: true, detail: { on } }));
    };
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", flip);
    return () => { btn.removeEventListener("click", flip); el.classList.remove("is-flip"); el.style.removeProperty("--fx-dur"); el.style.removeProperty("--fx-shift"); };
  });
})();
