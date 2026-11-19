// Subpage — case picker panel. Pressing a button above opens only that cell (.3s) and closes the others (jQuery show/hide 300ms), on phones each cell opens and closes with its own button (.4s).
// works.html?tag=<Slot>-<Pill> Arriving at it, the page stands with that cell open and that pill selected — the original’s per-task case list (case_tag) page
(() => {
  const cat = document.querySelector(".np-cat");
  if (!cat) return;
  const opens = [...cat.querySelectorAll(".np-cat__open")];
  const boxes = [...cat.querySelectorAll(".np-cat__box")];
  const wrapOf = (i) => boxes[i]?.querySelector(".np-cat__wrap");
  const pick = (i) => {
    opens.forEach((b, j) => b.classList.toggle("is-current", j === i));
    boxes.forEach((_, j) => { if (j !== i && !wrapOf(j).hidden) window.npToggle(wrapOf(j), false, 0.3); });
    if (i >= 0 && wrapOf(i).hidden) window.npToggle(wrapOf(i), true, 0.3);
  };
  opens.forEach((b, i) => b.addEventListener("click", () => pick(b.classList.contains("is-current") ? -1 : i)));
  boxes.forEach((box, i) => {
    const btn = box.querySelector(".np-cat__btn");
    btn.addEventListener("click", () => {
      const open = !btn.classList.contains("is-current");
      btn.classList.toggle("is-current", open);
      window.npToggle(wrapOf(i), open, 0.4);
    });
  });
  const tag = new URLSearchParams(location.search).get("tag");
  if (tag) {
    const [b, c] = tag.split("-").map(Number);
    const wrap = wrapOf(b);
    if (wrap) {
      wrap.hidden = false;
      opens[b]?.classList.add("is-current");
      boxes[b].querySelector(".np-cat__btn").classList.add("is-current");
      wrap.querySelectorAll("li")[c]?.classList.add("is-current");
      cat.classList.add("is-tag");
    }
  }
})();
