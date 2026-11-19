// One post — the table of contents bolds the section being read (a section counts once its heading passes the top 40% of the screen)
(() => {
  const links = [...document.querySelectorAll(".av-toc a")];
  const heads = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (!heads.length) return;
  const mark = (i) => links.forEach((a, k) => a.setAttribute("data-active", k === i ? "true" : "false"));
  heads.forEach((h, i) => ScrollTrigger.create({ trigger: h, start: "top 40%", end: "max", onToggle: (st) => st.isActive ? mark(i) : i > 0 && st.direction < 0 && mark(i - 1) }));
})();
