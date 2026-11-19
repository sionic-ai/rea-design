// Store map — the original is an external store widget (map service) — only drag-to-pan, +/- zoom and category picking are rebuilt as our own SVG map
(() => {
  const map = document.querySelector("[data-map]");
  const pan = map?.querySelector("[data-map-pan]");
  if (!map || !pan) return;
  let x = 0, y = 0, k = 1, start = null;
  const draw = () => pan.setAttribute("transform", `translate(${x} ${y}) scale(${k})`);
  const svg = map.querySelector("svg");
  const unit = () => 240 / svg.getBoundingClientRect().width;
  map.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "touch" || e.target.closest("button")) return;
    start = { px: e.clientX, py: e.clientY, x, y };
    map.classList.add("is-drag");
    map.setPointerCapture(e.pointerId);
  });
  map.addEventListener("pointermove", (e) => {
    if (!start) return;
    const u = unit();
    x = start.x + (e.clientX - start.px) * u;
    y = start.y + (e.clientY - start.py) * u;
    draw();
  });
  const end = () => { start = null; map.classList.remove("is-drag"); };
  map.addEventListener("pointerup", end);
  map.addEventListener("pointercancel", end);
  map.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => {
    const nk = Math.min(3, Math.max(0.6, k * (+b.dataset.zoom > 0 ? 1.4 : 1 / 1.4)));
    x = 120 - (120 - x) * (nk / k); y = 260 - (260 - y) * (nk / k); k = nk;
    draw();
  }));

  const list = document.querySelectorAll(".ib-store");
  const boxes = [...document.querySelectorAll("[data-filter]")];
  const clusters = map.querySelector(".ib-map__clusters");
  const filter = () => {
    const on = boxes.filter((b) => b.checked).map((b) => b.dataset.filter);
    list.forEach((li) => { li.hidden = on.length > 0 && !on.every((f) => li.dataset.kind.split(" ").includes(f)); });
    clusters?.classList.toggle("is-dim", on.includes("store"));
  };
  boxes.forEach((b) => b.addEventListener("change", filter));
  document.querySelector("[data-reset]")?.addEventListener("click", () => { boxes.forEach((b) => (b.checked = false)); x = 0; y = 0; k = 1; draw(); filter(); });
  document.querySelector("[data-locate]")?.addEventListener("click", () => { x = 0; y = -60; k = 1.4; draw(); });
})();
