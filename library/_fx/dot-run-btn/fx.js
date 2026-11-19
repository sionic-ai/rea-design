// Lay three dots and a backdrop layer in front of the label — each dot gets a delay order (--fx-i · --fx-p) so the tail trails when moving
(() => {
  kfFx.register("dot-run-btn", (el) => {
    const label = el.querySelector(':scope > [data-fx-part="label"]');
    if (!label) return;
    const made = [];
    const bg = document.createElement("span");
    bg.className = "fx-drb__bg";
    made.push(bg);
    for (let k = 2; k >= 0; k--) {
      const wrap = document.createElement("span"), dot = document.createElement("span");
      wrap.className = "fx-drb__wrap";
      wrap.style.setProperty("--fx-p", k);
      dot.className = "fx-drb__dot" + (k ? " is-tail" : "");
      dot.style.setProperty("--fx-i", k);
      wrap.append(dot);
      made.push(wrap);
    }
    el.prepend(...made);
    return () => made.forEach((n) => n.remove());
  });
})();
