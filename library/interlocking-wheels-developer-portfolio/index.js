(() => {
  // When the previous cell changes, the four center lines roll like a reel to switch to that work (each line .08s later)
  const stage = document.querySelector(".co-stage");
  const lines = {
    eyebrow: document.querySelector(".co-now__eyebrow"),
    title: document.querySelector(".co-now__title"),
    with: document.querySelector('[data-role="with"]'),
    year: document.querySelector('[data-role="year"]'),
  };
  const total = stage.querySelectorAll('[data-fx-part="item"]').length;
  const send = (el, t) => el && el.dispatchEvent(new CustomEvent("fx:text", { detail: t }));
  let first = true;
  stage.addEventListener("fx:select", (e) => {
    if (first) { first = false; return; }
    const it = e.detail.item;
    send(lines.eyebrow, `N°${String(e.detail.index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
    send(lines.title, it.dataset.name);
    send(lines.with, it.dataset.with);
    send(lines.year, it.dataset.year);
  });
  // Changing the skin repaints the card and panel art in the new skin colors
  addEventListener("co:theme", () => setTimeout(() => stage.dispatchEvent(new Event("fx:repaint")), 450));
})();
