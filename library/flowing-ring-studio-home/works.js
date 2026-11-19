// Category filtering — the original fetches the category URL and swaps only the card board, transitioning with document.startViewTransition.
// Being a static page, it hides and shows cards of the same board and applies the same transition. The address (?service=) too, so it follows the back navigation
(() => {
  const nav = document.querySelector("[data-filter]");
  const cards = [...document.querySelectorAll("[data-cards] > .md-card")];
  if (!nav || !cards.length) return;
  cards.forEach((c, i) => { c.style.viewTransitionName = `md-card-${i}`; });
  const apply = (cat) => {
    nav.querySelectorAll("a").forEach((a) => a.classList.toggle("is-active", a.dataset.cat === cat));
    cards.forEach((c) => { c.hidden = cat !== "all" && !c.dataset.cat.split(",").includes(cat); });
  };
  const go = (cat, push) => {
    const run = () => apply(cat);
    document.startViewTransition ? document.startViewTransition(run) : run();
    if (push) history.pushState({ cat }, "", cat === "all" ? "works.html" : `works.html?service=${cat}`);
  };
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-cat]");
    if (!a) return;
    e.preventDefault();
    if (a.classList.contains("is-active")) return;
    go(a.dataset.cat, true);
  });
  addEventListener("popstate", () => go(new URLSearchParams(location.search).get("service") || "all", false));
  apply(new URLSearchParams(location.search).get("service") || "all");
})();
