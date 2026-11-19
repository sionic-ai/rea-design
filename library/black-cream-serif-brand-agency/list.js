// Post list — bars · cards stand up (CSS), category chips keep only posts of that category (the rest drop out of the list), the order button flips the arrow and reverses the card order after the first post, the view button toggles grid ↔ rows
(() => {
  const arts = document.querySelector(".ow-arts"), bar = document.querySelector(".ow-bar"), hero = document.querySelector(".ow-bhero");
  if (!arts) return;
  requestAnimationFrame(() => requestAnimationFrame(() => { arts.classList.add("is-in"); bar?.classList.add("is-in"); hero?.classList.add("is-in"); }));
  // Placeholders have no category — one card in every three is assigned that category, in chip order
  let all = [...arts.querySelectorAll(".ow-art")], cat = 0, flip = false;
  const draw = () => {
    const [first, ...rest] = all, list = [first, ...(flip ? [...rest].reverse() : rest)].filter((c, i) => cat === 0 || i === 0 || (i + cat) % 3 === 0);
    all.forEach((c) => !list.includes(c) && c.remove());
    list.forEach((c) => arts.appendChild(c));
    ScrollTrigger.refresh();
  };
  const chips = [...document.querySelectorAll(".ow-chips button")];
  chips.forEach((b, k) => b.addEventListener("click", () => {
    chips.forEach((o) => { o.classList.toggle("is-on", o === b); o.setAttribute("aria-selected", String(o === b)); });
    cat = k; draw();
  }));
  const sort = document.querySelector(".ow-sort");
  sort?.addEventListener("click", () => { sort.classList.toggle("is-flip"); flip = !flip; draw(); });
  const views = [...document.querySelectorAll(".ow-view button")];
  views.forEach((b, k) => b.addEventListener("click", () => {
    views.forEach((o) => { o.classList.toggle("is-on", o === b); o.setAttribute("aria-pressed", String(o === b)); });
    arts.classList.toggle("is-list", k === 1);
    ScrollTrigger.refresh();
  }));
})();
