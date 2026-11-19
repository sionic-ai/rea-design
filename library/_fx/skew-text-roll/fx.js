(() => {
  // Rising text duplicates the text to be rolled — so the caller needn’t write the same text twice in data-text
  kfFx.register("skew-text-roll", (el) => {
    let label = el.querySelector('[data-fx-part="label"]'), made = false;
    if (!label) {
      if (!el.textContent.trim()) return;
      label = document.createElement("span");
      label.setAttribute("data-fx-part", "label");
      label.append(...el.childNodes);
      el.append(label);
      made = true;
    }
    const ghost = document.createElement("span");
    ghost.setAttribute("data-fx-part", "ghost");
    ghost.setAttribute("aria-hidden", "true");
    ghost.textContent = label.textContent;
    el.append(ghost);
    return () => {
      ghost.remove();
      if (made) { el.append(...label.childNodes); label.remove(); }
    };
  });
})();
