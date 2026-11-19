// List VIEW MORE — the original loads and appends the next page (after button text LOADING...). As a placeholder it duplicates and appends the first six cells
(() => {
  document.querySelectorAll("[data-more]").forEach((b) => b.addEventListener("click", () => {
    const list = b.closest("section").querySelector("ul");
    if (!list) return;
    if (b.classList.contains("is-loading")) return;
    b.classList.add("is-loading");
    b.textContent = "LOADING...";
    setTimeout(() => {
      [...list.children].slice(0, 6).forEach((li) => list.append(li.cloneNode(true)));
      b.classList.remove("is-loading");
      b.textContent = "VIEW MORE";
    }, 1200);
  }));
})();
