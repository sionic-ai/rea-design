(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const all = window.cgSeries;
  const at = Math.max(0, all.findIndex((x) => x.key === document.body.dataset.series));
  const s = all[at];
  const n = all[(at + 1) % all.length];
  document.querySelector(".sl-head__icon").innerHTML = window.cgIcons[s.key];
  document.querySelector(".sl-head__en").textContent = s.en;
  document.querySelector(".sl-head__ja").textContent = s.ja;
  window.cgReady = Promise.resolve();

  // What each cell is a photo of — the originals are shots of one piece set on a staged scene like a rock, a forest or a glass box
  const SHOTS = [
    ["Work Name", "Title of work", "Blue-glazed mask piece front view · silver pleated backdrop · 16:9"],
    ["Stone Pair", "Pair of stones", "Two pieces on a rock · low side light · 16:9"],
    ["Moss Glow", "Moss green", "Work one · forest floor · firefly bokeh · 16:9"],
    ["Coral Cup", "Coral cup", "Coral on a white artwork · wet stones · dark forest · 16:9"],
    ["Blue Guard", "Name", "Inside a blue display glass case · floral cloth · 16:9"],
  ];
  const grid = document.querySelector(".sl-cards");
  const tail = document.querySelector(".sl-next");
  const tpl = document.querySelector("template[data-card]");
  SHOTS.forEach(([en, ja, label]) => {
    const card = tpl.content.firstElementChild.cloneNode(true);
    card.querySelector(".sl-card__media").dataset.label = label;
    card.querySelector(".sl-card__en").textContent = en;
    card.querySelector(".sl-card__ja").textContent = ja;
    grid.append(card);
  });

  // Next series — while hovering, the line fills over 3s (when released, it empties at once). Even when full the original doesn’t advance, it only advances on press
  tail.href = `list.html?series=${n.key}`;
  tail.querySelector(".sl-next__en").textContent = n.en;
  tail.querySelector(".sl-next__ja").textContent = n.ja;
  if (!reduce) {
    tail.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") tail.classList.add("is-active"); });
    tail.addEventListener("pointerleave", () => tail.classList.remove("is-active"));
  }
})();
