// Column width follows the original formula: 300px rounded down to a multiple of the 10px monospace character width (floor(300 / char width) × char width) — so grid cells and column ends line up.
// Type buttons ([All]·Texts·Audio·Other) keep only that type’s columns and rewind the panel to the start. Grid drawing, dragging and the raised column’s red are handled by the glyph-melt-canvas part
(() => {
  const root = document.documentElement;
  const cols = [...document.querySelectorAll(".su-col")];
  const end = document.querySelector(".su-end");
  const spacer = document.querySelector(".su-spacer");
  const scroller = document.querySelector(".su-scroller");
  let colW = 294;

  const measure = () => {
    const probe = document.createElement("span");
    probe.textContent = "X";
    Object.assign(probe.style, { position: "fixed", left: "-1000px", fontFamily: getComputedStyle(root).getPropertyValue("--kf-font-mono"), fontSize: "10px" });
    document.body.appendChild(probe);
    const cw = probe.getBoundingClientRect().width || 6;
    probe.remove();
    colW = Math.floor(300 / cw) * cw;
    root.style.setProperty("--su-col", `${colW}px`);
  };
  const layout = () => {
    const shown = cols.filter((c) => !c.hidden);
    shown.forEach((c, i) => { c.style.left = `${i * colW}px`; });
    end.style.left = `${shown.length * colW}px`;
    spacer.style.width = `${(shown.length + 1) * colW}px`;
  };

  measure();
  layout();
  document.fonts?.ready.then(() => { measure(); layout(); });

  document.querySelectorAll("[data-su-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-su-filter");
      document.querySelectorAll("[data-su-filter]").forEach((b) => b.classList.toggle("is-on", b.getAttribute("data-su-filter") === type));
      cols.forEach((c) => { c.hidden = type !== "all" && c.getAttribute("data-type") !== type; });
      layout();
      scroller.scrollTo(0, 0);
    });
  });
})();
