// News list: once the curtain has fully lifted the first batch turns on, and MORE rolls the underline during “Loading...” then appends and turns on the next batch (the original fetches and appends the next page)
(() => {
  const index = document.querySelector(".nw-index");
  const show = (list) => requestAnimationFrame(() => requestAnimationFrame(() => list.classList.add("active")));
  addEventListener("mg:ready", () => show(index.querySelector(".nw-index__list:not(.active)")), { once: true });
  const more = document.querySelector("[data-more]");
  if (!more) return;
  const label = more.querySelector(".mg-link__text");
  let left = 1;
  more.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    more.classList.add("is-loading");
    label.textContent = "Loading...";
    setTimeout(() => {
      const next = index.querySelector(".nw-index__list").cloneNode(true);
      next.classList.remove("active");
      next.querySelectorAll(".nw-block__new").forEach((n) => n.remove());
      index.append(next);
      show(next);
      left -= 1;
      if (left > 0) { more.classList.remove("is-loading"); label.textContent = "MORE"; } else more.parentElement.remove();
      ScrollTrigger.refresh();
    }, MG.reduce ? 0 : 600);
  });
})();
