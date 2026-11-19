// The table of contents bolds the subheading being read — when a subheading passes the top third of the screen, it moves to that cell
(() => {
  const items = [...document.querySelectorAll(".dd-toc li")];
  const heads = items.map((li) => document.querySelector(li.querySelector("a").getAttribute("href")));
  if (!items.length || heads.some((h) => !h)) return;
  const set = (i) => items.forEach((li, k) => li.classList.toggle("is-active", k === i));
  set(0);
  heads.forEach((h, i) => ScrollTrigger.create({ trigger: h, start: "top 35%", onEnter: () => set(i), onLeaveBack: () => set(Math.max(0, i - 1)) }));
})();
