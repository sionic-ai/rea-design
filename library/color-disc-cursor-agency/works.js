// Work list — picking a category fades the list out in .4s (is-filtering), filters it, then fades it back in. On phones a header button lowers the category sheet in .4s.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const main = document.querySelector(".wk__main");
  const cards = [...document.querySelectorAll(".wk__list .mk-work")];
  const empty = document.querySelector(".wk__empty");
  const boxes = [...document.querySelectorAll(".wk__check input")];
  let t = 0;
  const apply = () => {
    const on = boxes.filter((b) => b.checked).map((b) => b.value);
    let shown = 0;
    cards.forEach((c) => {
      const cats = (c.dataset.cat || "").split(/\s+/);
      const ok = !on.length || on.some((v) => cats.includes(v));
      c.hidden = !ok;
      shown += ok;
    });
    if (empty) empty.hidden = shown > 0;
  };
  boxes.forEach((b) => b.addEventListener("change", () => {
    clearTimeout(t);
    if (reduce) { apply(); return; }
    main.classList.add("is-filtering");
    t = setTimeout(() => { apply(); main.classList.remove("is-filtering"); }, 400);
  }));

  const toggle = document.querySelector(".wk__toggle");
  const cats = document.querySelector(".wk__cats");
  toggle?.addEventListener("click", () => {
    const open = !toggle.classList.contains("is-active");
    toggle.classList.toggle("is-active", open);
    cats.classList.toggle("is-active", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
})();
