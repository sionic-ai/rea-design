// Five news cards — like the original list, the third row is empty so the last row has two cells
(() => {
  const tpl = document.getElementById("kd-news-card");
  const list = document.querySelector(".kd-news-grid");
  if (!tpl || !list) return;
  const items = [
    ["2026.07.30 Thu", "Notice", "Your news title here, about two lines — Anniversary event notice"],
    ["2026.06.29 Mon", "Notice", "Your one-line news title here"],
    ["2026.06.08 Mon", "Event", "Your event opening news title here"],
    ["2026.01.20 Tue", "Notice", "Your news title goes here, about two lines — character introduction"],
    ["2025.12.01 Mon", "Notice", "Your one-line news title here"],
  ];
  for (const [date, tag, title] of items) {
    const n = tpl.content.firstElementChild.cloneNode(true);
    n.querySelector("time").textContent = date;
    n.querySelector(".kd-tag").textContent = tag;
    n.querySelector(".kd-ncard__title").textContent = title;
    list.append(n);
  }
})();
