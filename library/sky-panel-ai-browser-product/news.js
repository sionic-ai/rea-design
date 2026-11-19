// Blog list — clicking a category pill keeps only that category’s posts (the original changes the URL)
(() => {
  const chips = [...document.querySelectorAll(".as-chip")];
  const posts = [...document.querySelectorAll(".as-post")];
  chips.forEach((c) => c.addEventListener("click", () => {
    chips.forEach((o) => o.classList.toggle("is-on", o === c));
    const want = c.textContent.trim();
    posts.forEach((p) => (p.hidden = want !== "All" && p.dataset.cat !== want));
    ScrollTrigger.refresh();
  }));
})();
