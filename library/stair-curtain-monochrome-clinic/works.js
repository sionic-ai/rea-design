// Academic record — picking a year in the select box keeps only that year (All shows everything) and closes the box. Opening and closing itself is handled by the fold in shared.js
(() => {
  MK.page("works", (box) => {
    const sel = box.querySelector(".wk-select");
    if (!sel) return;
    const cnt = sel.querySelector(".acc__cnt");
    const label = sel.querySelector(".acc__txt p");
    const years = box.querySelectorAll(".wk-year");
    const opts = sel.querySelectorAll(".wk-select__opt");
    const pick = (e) => {
      const id = e.currentTarget.dataset.id;
      label.innerHTML = e.currentTarget.querySelector("p").innerHTML;
      years.forEach((y) => y.classList.toggle("is-disabled", !!id && id !== y.dataset.id));
      sel.classList.remove("is-on");
      cnt.style.height = "0";
    };
    opts.forEach((o) => o.addEventListener("click", pick));
    return () => opts.forEach((o) => o.removeEventListener("click", pick));
  });
})();
