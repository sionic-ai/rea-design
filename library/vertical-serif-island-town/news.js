// News list: pressing a category leaves only that category’s rows (the photo cell always stays) and the list floats back up in .4s
(() => {
  const btns = [...document.querySelectorAll(".nw__cats button")];
  const items = [...document.querySelectorAll(".nw__list > li")];
  const list = document.querySelector(".nw__list");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.classList.toggle("is-active", x === b));
    const cat = b.dataset.cat;
    items.forEach((li) => li.classList.toggle("is-off", cat !== "all" && !li.dataset.cat.split(" ").includes(cat) && li.dataset.cat !== "all"));
    if (!reduce) gsap.fromTo(list, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" });
  }));
})();
