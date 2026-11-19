// FAQ — measuring the original Closed → Open change, the answer takes its space on the next frame (108ms) when React redraws after the press,
// In the same frame the answer text is shifted down by its own height and rises as it appears (curve · length in service.css). Opening one closes the others
(() => {
  const items = [...document.querySelectorAll(".h-faq__it")];
  items.forEach((d) => {
    const q = d.querySelector(".h-faq__q");
    q.addEventListener("click", () => {
      const open = !d.classList.contains("is-open");
      // If opened on the pressed frame, the answer is first drawn at the shifted position, so the order differs from the original (closed position 0 → opens downward → 0)
      requestAnimationFrame(() => items.forEach((o) => { const on = o === d ? open : false; o.classList.toggle("is-open", on); o.querySelector(".h-faq__q").setAttribute("aria-expanded", on); }));
    });
  });
})();
