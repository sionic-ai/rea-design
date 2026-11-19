// On each hover one of the fill candidates is picked at random and set on --fx-tint — the same button fills with a different color every time it enters (sou-group .hover-button)
(() => {
  kfFx.register("tint-pick-hover", (el, { options, hover }) => {
    const names = String(options.pick || "--kf-accent, --kf-ink").split(",").map((s) => s.trim()).filter((s) => s.startsWith("--"));
    if (!names.length) return;
    const pick = () => el.style.setProperty("--fx-tint", `var(${names[Math.floor(Math.random() * names.length)]})`);
    pick();
    const type = hover ? "pointerenter" : "pointerdown";
    el.addEventListener(type, pick);
    el.addEventListener("focusin", pick);
    return () => {
      el.removeEventListener(type, pick);
      el.removeEventListener("focusin", pick);
      el.style.removeProperty("--fx-tint");
    };
  });
})();
