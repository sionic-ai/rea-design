// Shop page: draws the floor map and lights up the shop cell and number tag passing through the screen center
(() => {
  const floor = NW.floorMap(document.querySelector("[data-floor]"));
  const light = (id, v) => document.querySelectorAll(`.floor [data-blk="${id}"]`).forEach((b) => b.classList.toggle("is-on", v));
  document.querySelectorAll(".prow").forEach((row) => {
    const id = row.dataset.shop;
    ScrollTrigger.create({ trigger: row, start: "top 55%", end: "bottom 55%", onToggle: (st) => { row.classList.toggle("is-on", st.isActive); light(id, st.isActive); } });
    row.addEventListener("mouseenter", () => { light(id, true); NW.floorPerson(floor, id, true); });
    row.addEventListener("mouseleave", () => { light(id, row.classList.contains("is-on")); NW.floorPerson(floor, id, false); });
  });
})();
