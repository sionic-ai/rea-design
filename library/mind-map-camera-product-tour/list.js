// Post list search: keep only lines containing every word, and when a topic is picked only that group. As in the original, the search field opens only when the script runs.
(() => {
  const controls = document.querySelector(".filters");
  const search = document.querySelector("#guide-search");
  const topic = document.querySelector("#guide-topic");
  const groups = [...document.querySelectorAll(".topic-group")];
  if (!controls || !search || !topic) return;
  const norm = (v) => v.toLowerCase().normalize("NFKC").replace(/[’']/g, "");
  const update = () => {
    const words = norm(search.value).trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const g of groups) {
      let shown = 0;
      for (const row of g.querySelectorAll(".guide-row")) {
        const ok = (topic.value === "all" || g.dataset.category === topic.value) && words.every((w) => norm(row.dataset.search).includes(w));
        row.hidden = !ok;
        if (ok) shown++;
      }
      g.hidden = shown === 0;
      count += shown;
    }
    document.querySelector("#result-count").textContent = `Text ${count}Dog`;
    document.querySelector("#empty-results").hidden = count !== 0;
  };
  const reset = () => { search.value = ""; topic.value = "all"; update(); };
  search.addEventListener("input", update);
  topic.addEventListener("change", update);
  document.querySelector("#clear-search").addEventListener("click", () => { search.value = ""; update(); search.focus(); });
  document.querySelector("#reset-search").addEventListener("click", reset);
  controls.hidden = false;
})();
