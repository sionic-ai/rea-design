(() => {
  kfFx.register("dots-cross-btn", (el, { options }) => {
    // State is a single aria-expanded — if the consumer opens and closes the drawer directly, set toggle: none and change only that value
    if (options.toggle === "none") return;
    if (!el.hasAttribute("aria-expanded")) el.setAttribute("aria-expanded", "false");
    const click = () => el.setAttribute("aria-expanded", String(el.getAttribute("aria-expanded") !== "true"));
    el.addEventListener("click", click);
    return () => el.removeEventListener("click", click);
  });
})();
