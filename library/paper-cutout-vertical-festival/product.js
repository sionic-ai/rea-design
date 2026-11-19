// Program list: the original filters are links to another address — here only the chosen cell within the same row turns to white paper
document.querySelectorAll(".sd-tabs").forEach((row) => {
  row.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    row.querySelectorAll("button").forEach((x) => {
      x.classList.toggle("is-active", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
  });
});
