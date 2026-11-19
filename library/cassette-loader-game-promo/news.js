// News list — tag buttons (?cat=…) becomes a category list of the same shape (like the original /news/info category page)
(() => {
  const cat = new URLSearchParams(location.search).get("cat");
  if (cat) {
    document.querySelectorAll(".nl__content li").forEach((li) => { li.hidden = li.dataset.cat !== cat; });
    document.querySelectorAll(".nc__list li").forEach((li) => li.classList.toggle("is-current", li.querySelector("a").dataset.cat === cat));
  }
  window.ET.startSub();
})();
