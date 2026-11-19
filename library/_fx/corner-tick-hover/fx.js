(() => {
  // Adds four ticks if they are missing, and on detach removes only the ones it added. The growing reaction is handled by :hover in fx.css (on no-hover devices they are just decorative ticks).
  const KEYS = ["tl", "tr", "br", "bl"];
  kfFx.register("corner-tick-hover", (el) => {
    const have = new Set([...el.children].filter((c) => c.dataset.fxPart === "tick").map((c) => c.dataset.key));
    const added = KEYS.filter((k) => !have.has(k)).map((k) => {
      const t = document.createElement("span");
      t.dataset.fxPart = "tick";
      t.dataset.key = k;
      t.setAttribute("aria-hidden", "true");
      el.append(t);
      return t;
    });
    return () => added.forEach((t) => t.remove());
  });
})();
