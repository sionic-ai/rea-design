// Category buttons: keep only the pressed category, and VIEW MORE reveals the hidden cards (the original loads the next batch)
(() => {
  const tabs = document.querySelectorAll(".wk-tab");
  const cards = document.querySelectorAll(".nsl-work");
  const more = document.querySelector(".wk-more");
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.toggle("is-on", b === t));
    const cat = t.dataset.cat;
    cards.forEach((c) => {
      c.classList.toggle("is-out", cat !== "0" && c.dataset.cat !== cat);
      c.classList.add("is-in");
    });
  }));
  more.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nsl-work.is-more").forEach((c) => c.classList.add("is-shown", "is-in"));
    more.classList.add("is-done");
  });
})();
