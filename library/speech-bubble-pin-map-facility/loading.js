// News list · detail: the original hides the body while the posts load — on the list a spinning circle appears at .73s and the body at 1.83s, on the detail the date · title stand at 1.05s and the body at 1.55s all at once.
(() => {
  const b = document.body;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || b.classList.contains("is-arrived")) { b.classList.add("is-loaded"); return; }
  const steps = b.dataset.page === "news" ? [["is-spin", 730], ["is-loaded", 1830]] : [["is-head", 1050], ["is-loaded", 1550]];
  steps.forEach(([c, t]) => setTimeout(() => b.classList.add(c), t));
})();
