// Work list — pressing a category chip filters in place without reopening the page (with view transitions the cards slide into place).
// Fills a three-column row, a wide card takes two columns only when two remain, starts with just the first six, and adds six more whenever the end of the list comes within 500px below the screen (original WorkPage)
(() => {
  const page = document.querySelector("[data-work]");
  if (!page) return;
  const chips = [...page.querySelectorAll(".wp-chip")], cards = [...page.querySelectorAll(".wp-card")];
  const grid = page.querySelector("[data-work-grid]"), empty = page.querySelector("[data-work-empty]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STEP = 6, AHEAD = 500, COLS = 3;
  let tag = "", shown = STEP, total = cards.length;
  const pack = (wides) => { let col = 0; return wides.map((w) => { const two = w && col <= COLS - 2; col = (col + (two ? 2 : 1)) % COLS; return two; }); };
  const render = (t) => {
    let n = 0;
    for (const c of cards) {
      const hit = !t || (c.dataset.tags || "").split(" ").includes(t), on = hit && n < shown;
      if (hit) n++;
      c.classList.toggle("is-entering", on && c.hidden && c.dataset.pending === "");
      c.toggleAttribute("data-pending", hit && !on);
      c.hidden = !on;
    }
    const vis = cards.filter((c) => !c.hidden);
    pack(vis.map((c) => c.hasAttribute("data-wide"))).forEach((two, i) => vis[i].toggleAttribute("data-two", two));
    total = n;
    if (empty) empty.hidden = n > 0;
    ScrollTrigger.refresh();
    chips.forEach((c) => (c.dataset.tag || "") === t ? c.setAttribute("aria-current", "page") : c.removeAttribute("aria-current"));
  };
  const more = () => { while (shown < total && grid.getBoundingClientRect().bottom - innerHeight < AHEAD) { shown += STEP; render(tag); } };
  const go = (t, animate, how) => {
    tag = t; shown = STEP;
    const run = () => { cards.forEach((c) => c.removeAttribute("data-pending")); render(t); };
    if (animate && !reduce && document.startViewTransition) document.startViewTransition(run); else run();
    const chip = chips.find((c) => (c.dataset.tag || "") === t);
    if (chip && how === "push") history.pushState({ tag: t }, "", chip.href);
    if (chip && how === "replace") history.replaceState({ tag: t }, "", chip.href);
    chip?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: animate && !reduce ? "smooth" : "auto" });
    more();
  };
  cards.forEach((c, i) => { c.style.viewTransitionName = `wp-card-${i}`; });
  chips.forEach((c) => c.addEventListener("click", (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const t = c.dataset.tag || "";
    if (t !== tag) go(t, true, "push");
  }));
  addEventListener("popstate", () => { const t = new URLSearchParams(location.search).get("tag") || ""; if (t !== tag) go(t, true, "none"); });
  const first = new URLSearchParams(location.search).get("tag") || "";
  go(chips.some((c) => c.dataset.tag === first) ? first : "", false, "none");
  addEventListener("scroll", more, { passive: true });
  addEventListener("resize", more);
})();
