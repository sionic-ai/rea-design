// One set of text inside the pill button ([data-fx-part=row]) is joined end to end in repeat sets, and CSS flows that line endlessly by one button width.
// So the same text isn’t read several times, button names go in aria-label and the lines are hidden from screen readers
(() => {
  kfFx.register("pill-text-flow", (el, { options }) => {
    const row = el.querySelector('[data-fx-part="row"]');
    if (!row || !row.innerHTML.trim()) return;
    const unit = row.innerHTML;
    const addedLabel = !el.hasAttribute("aria-label");
    if (addedLabel) el.setAttribute("aria-label", row.textContent.trim());
    row.innerHTML = unit.repeat(Math.max(1, Math.round(+(options.repeat || 8))));
    row.setAttribute("aria-hidden", "true");
    const box = document.createElement("span");
    box.className = "fx-pill-in";
    row.before(box);
    box.append(row);
    if (options.dur != null) el.style.setProperty("--fx-dur", +options.dur + "s");
    return () => {
      box.before(row);
      box.remove();
      row.innerHTML = unit;
      row.removeAttribute("aria-hidden");
      if (addedLabel) el.removeAttribute("aria-label");
      el.style.removeProperty("--fx-dur");
    };
  });
})();
