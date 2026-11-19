// Home page — the card cover sticks to the cursor spot with no lag (rAF), and pressing a card opens its work window (brings it to the front if already open).
// View buttons (grid · list), and in-view on paragraphs and cards on screen (wide screens minus the top 5% · phone minus the top 15% and bottom 35%).
(() => {
  const coarse = matchMedia("(pointer: coarse)").matches;
  const covers = [...document.querySelectorAll(".ag-card__cover")];
  let cx = 0, cy = 0, pending = false;
  const apply = () => { covers.forEach((c) => { c.style.left = `${cx}px`; c.style.top = `${cy}px`; }); pending = false; };
  addEventListener("pointermove", (e) => {
    cx = e.clientX; cy = e.clientY;
    if (!pending) { pending = true; requestAnimationFrame(apply); }
  }, { passive: true });

  document.querySelectorAll(".ag-card").forEach((card) => {
    const open = () => document.getElementById(`win-${card.dataset.win}`)?.dispatchEvent(new Event("fx:open"));
    card.addEventListener("click", (e) => { e.stopPropagation(); open(); });
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });

  const list = document.querySelector(".ag-list");
  const btns = [...document.querySelectorAll(".ag-view__btn")];
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((o) => { o.classList.toggle("is-on", o === b); o.setAttribute("aria-pressed", String(o === b)); });
    list.dataset.view = b.dataset.view;
  }));

  const io = new IntersectionObserver((es) => es.forEach((en) => en.target.classList.toggle("in-view", en.isIntersecting)),
    coarse ? { rootMargin: "-15% 0px -35% 0px", threshold: 0 } : { rootMargin: "-5% 0px 0% 0px", threshold: 0 });
  // The original starts observing in a defer script, so the first image is drawn blurry and then sharpens — attach two frames later
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll(coarse ? ".ag-card, .ag-intro p, .ag-intro .ag-link" : ".ag-intro p, .ag-card").forEach((n) => io.observe(n));
  }));
})();
