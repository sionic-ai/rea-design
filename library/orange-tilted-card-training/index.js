// Seven News cards — the original sd-carousel has max-length 7. Mix one-line and two-line titles so card heights stagger like the original
(() => {
  const tpl = document.getElementById("kd-news-slide");
  const track = document.querySelector(".kd-news__track");
  if (!tpl || !track) return;
  const items = [
    ["2026.07.30 Thu", "Notice", "Your news title here, about two lines — Anniversary event notice"],
    ["2026.06.29 Mon", "Notice", "Your one-line news title here"],
    ["2026.06.08 Mon", "Event", "Your headline announcing an event opening here"],
    ["2026.05.21 Thu", "Notice", "Your news title goes here, about two lines — new edition notice"],
    ["2026.04.15 Wed", "Notice", "Your one-line news title here"],
    ["2026.03.02 Mon", "Event", "Your headline announcing an event opening here"],
    ["2026.01.20 Tue", "Notice", "Your news title goes here, about two lines — character introduction"],
  ];
  for (const [date, tag, title] of items) {
    const n = tpl.content.firstElementChild.cloneNode(true);
    n.querySelector("time").textContent = date;
    n.querySelector(".kd-tag").textContent = tag;
    n.querySelector(".kd-slide__title").textContent = title;
    track.append(n);
  }
})();
