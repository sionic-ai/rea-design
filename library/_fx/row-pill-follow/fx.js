(() => {
  // Pill position is row order / row count — as in the original, rows are assumed equal height and set in % (no remeasure needed when the plate grows)
  kfFx.register("row-pill-follow", (el, { hover }) => {
    if (!hover) return;
    let items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) items = [...el.querySelectorAll(":scope > a")];
    if (!items.length) return;
    let pill = el.querySelector(':scope > [data-fx-part="pill"]');
    const made = !pill;
    if (made) { pill = document.createElement("span"); pill.setAttribute("data-fx-part", "pill"); pill.setAttribute("aria-hidden", "true"); el.prepend(pill); }
    const n = items.length;
    pill.style.height = `${100 / n}%`;
    const on = (e) => { pill.classList.add("is-fx-on"); pill.style.top = `${(items.indexOf(e.currentTarget) / n) * 100}%`; };
    const off = () => pill.classList.remove("is-fx-on");
    items.forEach((a) => { a.addEventListener("mouseenter", on); a.addEventListener("mouseleave", off); });
    return () => {
      items.forEach((a) => { a.removeEventListener("mouseenter", on); a.removeEventListener("mouseleave", off); });
      if (made) pill.remove(); else { pill.classList.remove("is-fx-on"); pill.style.top = ""; pill.style.height = ""; }
    };
  });
})();
