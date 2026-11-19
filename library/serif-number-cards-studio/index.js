// First page: (number card flip is plus-face-card, logo strip is the marquee part) service swap panel (.3s tween .44,0,.56,1), testimonial accordion (only one open)
(() => {

  const btns = [...document.querySelectorAll(".services__list button")];
  const arts = [...document.querySelectorAll(".services__art .art")];
  const descs = [...document.querySelectorAll(".services__desc p")];
  // Automatically advances to the next service (in the original measurement it changes with no input — the period couldn’t be measured, so 4s was judged), and pressing restarts the count from there
  let cur = 0, timer = 0;
  const show = (i) => { cur = i; [btns, arts, descs].forEach((set) => set.forEach((el, j) => el.classList.toggle("is-on", j === i))); };
  const play = () => { clearInterval(timer); if (!window.DS.reduced) timer = setInterval(() => show((cur + 1) % btns.length), 4000); };
  btns.forEach((b, i) => b.addEventListener("click", () => { show(i); play(); }));
  play();

  const rows = [...document.querySelectorAll(".trow")];
  rows.forEach((r) => r.querySelector(".trow__head").addEventListener("click", () => {
    const open = !r.classList.contains("is-open");
    rows.forEach((x) => x.classList.toggle("is-open", x === r && open));
  }));
})();
