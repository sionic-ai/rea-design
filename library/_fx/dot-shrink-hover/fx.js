// Only builds the text cover that shrinks along with the fill — the shrinking circle·arrow is handled by fx.css. The cover is a copy of the text’s children, so font and size match.
(() => {
  kfFx.register("dot-shrink-hover", (el) => {
    const text = el.querySelector('[data-fx-part="text"]');
    if (!text) return;
    const cover = document.createElement("span");
    cover.className = "fx-dot-cover";
    cover.setAttribute("aria-hidden", "true");
    const copy = text.cloneNode(true);
    copy.removeAttribute("data-fx-part");
    cover.append(copy);
    el.append(cover);
    return () => cover.remove();
  });
})();
