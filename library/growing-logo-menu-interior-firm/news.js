/* Journal: twelve rows of cards — a big card on the left of the first row, on the right in the second group, then four-column rows */
(() => {
  const box = document.querySelector("[data-news-grid]");
  const order = [];
  let i = 0;
  for (let block = 0; block < 3; block++) {
    const bigLeft = block % 2 === 0;
    const cells = bigLeft ? ["big", "s", "s", "s", "s"] : ["s", "s", "big", "s", "s"];
    cells.forEach((c) => order.push(window.twPost(i++, c === "big")));
    for (let k = 0; k < 4; k++) order.push(window.twPost(i++, false));
  }
  box.innerHTML = order.join("");
  box.querySelectorAll(".tw-post").forEach((p) => p.classList.add("tw-fade"));
})();
