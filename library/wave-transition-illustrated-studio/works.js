(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const buttons = [...document.querySelectorAll("[data-filter]")], items = [...document.querySelectorAll(".um-wk")];
  /* Filter: keep only the chosen one, and re-float the remaining cases 20px below in .55s at .05s intervals */
  const apply = (cat) => {
    buttons.forEach((b) => { const on = b.dataset.filter === cat; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
    const shown = items.filter((it) => { const ok = cat === "all" || it.dataset.category === cat; it.hidden = !ok; return ok; });
    if (!reduce) { gsap.killTweensOf(shown); gsap.fromTo(shown, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out", stagger: 0.05, overwrite: "auto" }); }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.filter)));
  /* Only the hovered case turns its video (placeholder) on — moving to another case stops the previous one */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) items.forEach((it) => {
    it.addEventListener("mouseenter", () => { items.forEach((o) => o.classList.remove("is-playing")); it.classList.add("is-playing"); });
    it.addEventListener("mouseleave", () => it.classList.remove("is-playing"));
  });
})();
