// Services — hover response for what’s included (only that turns red, line on the lower cell), open and close for questions
(() => {
  const items = document.querySelectorAll(".slash__item"), cols = document.querySelectorAll(".slash__col");
  const on = (i) => { items.forEach((x) => x.classList.toggle("is-on", x.dataset.i === i)); cols.forEach((x) => x.classList.toggle("is-on", x.dataset.i === i)); };
  [...items, ...cols].forEach((x) => x.addEventListener("pointerenter", () => on(x.dataset.i)));
  document.querySelectorAll(".faq__row").forEach((row, i) => {
    if (i === 0) row.classList.add("is-open");
    row.querySelector(".faq__q").addEventListener("click", (e) => {
      const open = !row.classList.contains("is-open");
      row.classList.toggle("is-open", open);
      e.currentTarget.setAttribute("aria-expanded", open);
      setTimeout(() => window.ScrollTrigger?.refresh(), 600);
    });
  });
})();
