// Hovering a cell swaps the fixed name slot to that cell’s data-title, and on leave it reverts after .1s — moving straight to the next cell does not flicker (unknown-untitled).
(() => {
  kfFx.register("title-swap-hover", (el, { options, hover }) => {
    const title = el.querySelector('[data-fx-part="title"]');
    if (!title || !hover) return;
    let swap = title.querySelector('[data-fx-part="swap"]');
    const made = !swap;
    if (made) {
      swap = document.createElement("span");
      swap.setAttribute("data-fx-part", "swap");
      title.append(swap);
    }
    const back = +(options.back ?? 0.1) * 1000;
    let timer = 0;
    const enter = (e) => {
      const item = e.target.closest?.('[data-fx-part="item"]');
      if (!item || !el.contains(item) || item.contains(e.relatedTarget)) return;
      clearTimeout(timer);
      swap.textContent = item.dataset.title || "";
      title.classList.add("is-swapped");
    };
    const leave = (e) => {
      const item = e.target.closest?.('[data-fx-part="item"]');
      if (!item || item.contains(e.relatedTarget)) return;
      clearTimeout(timer);
      timer = setTimeout(() => title.classList.remove("is-swapped"), back);
    };
    el.addEventListener("pointerover", enter);
    el.addEventListener("pointerout", leave);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("pointerover", enter);
      el.removeEventListener("pointerout", leave);
      title.classList.remove("is-swapped");
      made ? swap.remove() : (swap.textContent = "");
    };
  });
})();
