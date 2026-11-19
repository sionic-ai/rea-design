// Two sets of letters stacked vertically, rolling up one step on hover — long on entering (.5s), short on leaving (.3s). The next set can be painted in the accent color.
// The underline is two layers of two half strokes each: on hover the front layer retracts to both ends, splitting from the center, and the back layer vanishes immediately.
// On release the back layer fills from center outward and the front layers from both ends inward together, joining quickly.
(() => {
  kfFx.register("roll-split-link", (el, { options, reduce }) => {
    const label = el.querySelector(':scope [data-fx-part="label"]');
    if (!label) return;
    const made = [];
    const box = document.createElement("span");
    box.className = "fx-rsl-box";
    label.replaceWith(box);
    box.append(label);
    const next = label.cloneNode(true);
    next.removeAttribute("data-fx-part");
    next.className = "fx-rsl-next";
    next.setAttribute("aria-hidden", "true");
    box.append(next);
    made.push(box);
    if (options.in != null) el.style.setProperty("--fx-in", `${+options.in}s`);
    if (options.out != null) el.style.setProperty("--fx-out", `${+options.out}s`);
    if (options.line === "1" || options.line === "true") {
      const line = document.createElement("span");
      line.className = "fx-rsl-line";
      line.setAttribute("aria-hidden", "true");
      line.innerHTML = '<span class="fx-rsl-b"><i></i><i></i></span><span class="fx-rsl-a"><i></i><i></i></span>';
      el.append(line);
      made.push(line);
    }
    if (reduce) el.classList.add("fx-rsl-still");
    return () => {
      box.replaceWith(label);
      made.slice(1).forEach((n) => n.remove());
      el.classList.remove("fx-rsl-still");
      el.style.removeProperty("--fx-in");
      el.style.removeProperty("--fx-out");
    };
  });
})();
