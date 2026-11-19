// Traffic tabs: the pressed button fills black and the guide below swaps with a 1s fade.
(() => {
  const btns = [...document.querySelectorAll(".ac-tabs__btn")];
  const panels = [...document.querySelectorAll(".ac-tabs__panel")];
  btns.forEach((btn, i) =>
    btn.addEventListener("click", () => {
      btns.forEach((b, j) => {
        b.classList.toggle("is-selected", i === j);
        b.setAttribute("aria-selected", String(i === j));
      });
      panels.forEach((p, j) => p.classList.toggle("is-show", i === j));
      ScrollTrigger.refresh();
    })
  );
})();
