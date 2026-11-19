// Wrap the text in the cell as one block on top of the band and add five band lines — on release, restore it to the original child
(() => {
  kfFx.register("slant-stripe-fill", (el) => {
    if (el.querySelector(":scope > .fx-ssf")) return;
    const label = document.createElement("span");
    label.className = "fx-ssf__label";
    label.append(...el.childNodes);
    const box = document.createElement("span");
    box.className = "fx-ssf";
    box.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 5; i++) box.append(document.createElement("i"));
    el.append(label, box);
    return () => {
      box.remove();
      label.replaceWith(...label.childNodes);
    };
  });
})();
