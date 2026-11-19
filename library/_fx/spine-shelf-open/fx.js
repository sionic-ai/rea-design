(() => {
  // Spine shelf — pressing a vertical-title spine unfolds only that book sideways (width 0 → 75vh), and pressing again folds it.
  // Width changes via CSS transition, so fire fx:resize once fully unfolded so horizontal-scroll panels (locomotive etc.) re-measure their length.
  kfFx.register("spine-shelf-open", (el, { options }) => {
    const spine = el.querySelector('[data-fx-part="spine"]');
    const book = el.querySelector('[data-fx-part="book"]');
    if (!spine || !book) return;
    const single = options.single === "1";
    if (!spine.hasAttribute("tabindex") && spine.tagName !== "BUTTON") spine.setAttribute("tabindex", "0");
    spine.setAttribute("role", spine.getAttribute("role") || "button");
    spine.setAttribute("aria-expanded", el.classList.contains("is-open") ? "true" : "false");
    const toggle = () => {
      const open = !el.classList.contains("is-open");
      if (open && single) {
        el.parentElement?.querySelectorAll(':scope > [data-fx~="spine-shelf-open"].is-open').forEach((n) => {
          if (n === el) return;
          n.classList.remove("is-open");
          n.querySelector('[data-fx-part="spine"]')?.setAttribute("aria-expanded", "false");
        });
      }
      el.classList.toggle("is-open", open);
      spine.setAttribute("aria-expanded", String(open));
      el.dispatchEvent(new CustomEvent(open ? "fx:open" : "fx:close", { bubbles: true }));
    };
    const onKey = (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      toggle();
    };
    const onEnd = (e) => {
      if (e.target === book && e.propertyName === "width") el.dispatchEvent(new CustomEvent("fx:resize", { bubbles: true }));
    };
    spine.addEventListener("click", toggle);
    spine.addEventListener("keydown", onKey);
    book.addEventListener("transitionend", onEnd);
    return () => {
      spine.removeEventListener("click", toggle);
      spine.removeEventListener("keydown", onKey);
      book.removeEventListener("transitionend", onEnd);
      el.classList.remove("is-open");
    };
  });
})();
