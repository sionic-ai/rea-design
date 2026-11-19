// News: on desktop, hovering a row, on phones, once the row passes 75% of the screen, swaps to that row’s photo and dot (original data-position)
(() => {
  const box = document.querySelector(".mg-topics");
  if (!box) return;
  const set = (n) => box.setAttribute("data-position", n);
  set("0");
  document.querySelectorAll(".mg-topics__article").forEach((a) => {
    if (MG.PC) a.addEventListener("mouseenter", () => set(a.dataset.num));
    else ScrollTrigger.create({ trigger: a, start: "top 75%", end: "bottom 75%", onEnter: () => set(a.dataset.num), onEnterBack: () => set(a.dataset.num) });
  });
})();
