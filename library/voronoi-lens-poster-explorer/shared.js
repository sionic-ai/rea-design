// Entry door in two steps → loading notice → board intro, lens nameplate, chosen film board, About dialog. The board’s motion (Voronoi cells, lens) is handled by the voro-tile-field part.
(() => {
  const gate = document.querySelector(".nt-gate");
  const field = document.querySelector(".nt-field");
  const film = document.querySelector(".nt-film");
  const about = document.getElementById("about");
  const step1 = gate?.querySelector(".nt-step1");
  const step2 = gate?.querySelector(".nt-step2");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => matchMedia("(min-width: 768px)").matches;

  // Original: the first Continue moves on to device tier → view mode · cell count, and on the second Continue the picker panel clears in 1s and a keyboard hint appears at the bottom right.
  // After loading for about 2.6s the door clears in .7s and the panel runs the intro. The guide clears around when the panel settles
  const enter = () => {
    gate.classList.add("is-loading");
    document.body.classList.add("is-hint");
    const wait = reduce ? 0 : 2600;
    setTimeout(() => {
      gate.classList.add("is-out");
      field?.dispatchEvent(new CustomEvent("fx:voro-intro"));
    }, wait);
    setTimeout(() => document.body.classList.remove("is-hint"), wait + 6000);
  };
  // Original ?disableUI — no entrance gate or buttons, show the stage straight away (for measuring and exhibition screens)
  if (new URLSearchParams(location.search).has("disableUI")) {
    document.body.classList.add("is-noui");
    gate?.remove();
    // Parts attach after DOMContentLoaded — send the intro after that
    const go = () => setTimeout(() => field?.dispatchEvent(new CustomEvent("fx:voro-intro")), 0);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go, { once: true }); else go();
  }
  gate?.querySelector(".nt-continue")?.addEventListener("click", () => {
    if (wide() && step1 && !step1.hidden) { step1.hidden = true; step2.hidden = false; return; }
    enter();
  });

  // Lens nameplate — each time the focus cell changes, pick a placeholder name, year and score from that cell’s seed
  const fill = (root, idx, seed) => {
    root.querySelectorAll('[data-film="title"]').forEach((n) => (n.textContent = `Film Title ${String(idx % 10000).padStart(4, "0")}`));
    root.querySelectorAll('[data-film="year"]').forEach((n) => (n.textContent = String(1950 + Math.floor(seed * 75))));
    const score = 40 + Math.round(seed * 55);
    root.querySelectorAll('[data-film="score"]').forEach((n) => (n.textContent = String(score)));
    root.querySelectorAll(".nt-ring").forEach((n) => n.style.setProperty("--v", score));
  };
  field?.addEventListener("fx:voro-focus", (e) => {
    document.body.classList.add("is-live");
    fill(document, e.detail.index, e.detail.seed);
  });

  // Press · over the wheel = Pick view: the name tags clear and a film panel appears at the top left. Closes with a second press, wheel down, Esc, or Close
  field?.addEventListener("fx:voro-select", (e) => {
    const on = !!e.detail?.selected;
    document.body.classList.toggle("is-select", on);
    film?.setAttribute("aria-hidden", String(!on));
  });
  film?.querySelector("[data-close-film]")?.addEventListener("click", () => dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));

  document.querySelector('[data-open="about"]')?.addEventListener("click", () => about?.showModal());
  about?.querySelector("[data-close]")?.addEventListener("click", () => about.close());
  about?.querySelector("[data-replay]")?.addEventListener("click", () => {
    about.close();
    document.body.classList.remove("is-live", "is-select");
    field?.dispatchEvent(new CustomEvent("fx:voro-intro"));
  });
})();
